import { createSeedDatabase } from './seed'
import type {
  AppDatabase,
  CompetencyStatus,
  LanguageLayer,
  Pathway,
  RegistrationStatus,
  RubricRating,
  SafetyGateStatus,
  User,
} from './types'

const STORAGE_KEY = 'purpose-academy-local-db-v1'
const TOKEN_PREFIX = 'local.'

function now() {
  return new Date().toISOString()
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function publicUser(user: User): User {
  const { password: _p, password_hash: _h, ...rest } = user
  return rest
}

function looksLikePromptInjection(text: string) {
  return /ignore (all|previous|prior) instructions|reveal (the )?(system|hidden) prompt|jailbreak/i.test(
    text,
  )
}

function foundationProgress(db: AppDatabase, studentId: string) {
  const modules = db.modules.filter((m) => m.course_id === 'course-foundation')
  const lessons = db.lessons.filter((l) => modules.some((m) => m.id === l.module_id))
  if (!lessons.length) return 0
  const done = lessons.filter((l) =>
    db.lesson_progress.some((p) => p.student_id === studentId && p.lesson_id === l.id && p.completed),
  ).length
  return Math.round((done / lessons.length) * 100)
}

function constructionProgress(db: AppDatabase, studentId: string) {
  const modules = db.modules.filter((m) => m.course_id === 'course-construction')
  const lessons = db.lessons.filter((l) => modules.some((m) => m.id === l.module_id))
  if (!lessons.length) return 0
  const done = lessons.filter((l) =>
    db.lesson_progress.some((p) => p.student_id === studentId && p.lesson_id === l.id && p.completed),
  ).length
  return Math.round((done / lessons.length) * 100)
}

function computeMeta(db: AppDatabase) {
  return {
    foundationProgress: Object.fromEntries(db.students.map((s) => [s.id, foundationProgress(db, s.id)])),
    constructionProgress: Object.fromEntries(
      db.students.map((s) => [s.id, constructionProgress(db, s.id)]),
    ),
  }
}

function setSafetyGateLocal(
  db: AppDatabase,
  studentId: string,
  gateKey: string,
  status: SafetyGateStatus,
  reason: string,
  overrideBy: string | null,
) {
  const existing = db.safety_gate_states.find((g) => g.student_id === studentId && g.gate_key === gateKey)
  if (existing) {
    existing.status = status
    existing.reason = reason
    existing.updated_at = now()
    existing.override_by = overrideBy
  } else {
    db.safety_gate_states.push({
      id: id('sg'),
      student_id: studentId,
      gate_key: gateKey,
      status,
      reason,
      updated_at: now(),
      override_by: overrideBy,
    })
  }
}

function upsertLearnerCompetency(
  db: AppDatabase,
  studentId: string,
  competencyId: string,
  status: CompetencyStatus,
  assessorUid: string | null,
  notes: string,
) {
  const existing = db.learner_competencies.find(
    (c) => c.student_id === studentId && c.competency_id === competencyId,
  )
  if (existing) {
    existing.status = status
    existing.assessor_uid = assessorUid
    existing.notes = notes
    existing.assessed_at = now()
  } else {
    db.learner_competencies.push({
      id: id('lc'),
      student_id: studentId,
      competency_id: competencyId,
      status,
      assessor_uid: assessorUid,
      notes,
      assessed_at: now(),
    })
  }
}

function loadPersisted(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppDatabase
      return repairLocalDb(parsed)
    }
  } catch {
    /* ignore */
  }
  return createSeedDatabase()
}

/** Restore demo passwords / missing seed accounts if localStorage got corrupted. */
function repairLocalDb(db: AppDatabase): AppDatabase {
  const seed = createSeedDatabase()
  if (!Array.isArray(db.users) || db.users.length === 0) return seed

  const byEmail = new Map(seed.users.map((u) => [u.email.toLowerCase(), u]))
  let changed = false

  for (const user of db.users) {
    const seeded = byEmail.get(user.email.toLowerCase())
    if (seeded?.password && !user.password) {
      user.password = seeded.password
      changed = true
    }
  }

  for (const seeded of seed.users) {
    if (!db.users.some((u) => u.email.toLowerCase() === seeded.email.toLowerCase())) {
      db.users.push({ ...seeded })
      changed = true
      const student = seed.students.find((s) => s.uid === seeded.uid)
      if (student && !db.students.some((s) => s.uid === seeded.uid)) {
        db.students.push({ ...student })
      }
      const instructor = seed.instructors.find((i) => i.uid === seeded.uid)
      if (instructor && !db.instructors.some((i) => i.uid === seeded.uid)) {
        db.instructors.push({ ...instructor })
      }
    }
  }

  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
    } catch {
      /* ignore */
    }
  }
  return db
}

function persist(db: AppDatabase) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

let localDb: AppDatabase = typeof localStorage !== 'undefined' ? loadPersisted() : createSeedDatabase()

function mutate<T>(fn: (db: AppDatabase) => T): T {
  const result = fn(localDb)
  persist(localDb)
  return result
}

export function localStripDb(): AppDatabase {
  return {
    ...localDb,
    users: localDb.users.map((u) => publicUser(u)),
  }
}

export function localMeta() {
  return computeMeta(localDb)
}

export function localReset() {
  localDb = createSeedDatabase()
  persist(localDb)
}

export function parseLocalToken(token: string | null): string | null {
  if (!token?.startsWith(TOKEN_PREFIX)) return null
  return token.slice(TOKEN_PREFIX.length)
}

export function localLogin(email: string, password: string) {
  // Always attempt repair before auth — fixes wiped demo passwords in localStorage.
  localDb = repairLocalDb(localDb)
  const normalized = email.trim().toLowerCase()
  const user = localDb.users.find((u) => u.email.toLowerCase() === normalized)
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.')
  }
  const student = localDb.students.find((s) => s.uid === user.uid) ?? null
  return {
    token: `${TOKEN_PREFIX}${user.uid}`,
    user: publicUser(user),
    student,
  }
}

export function localRegister(input: {
  full_name: string
  email: string
  password: string
  phone: string
  address: string
  emergency_contact: string
  preferred_language: string
}) {
  const email = input.email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')
  if (input.password.length < 8) throw new Error('Password must be at least 8 characters.')
  if (!input.full_name.trim()) throw new Error('Full name is required.')
  if (looksLikePromptInjection(input.full_name) || looksLikePromptInjection(input.address)) {
    throw new Error('That text looks unsafe. Please rephrase.')
  }

  return mutate((db) => {
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error('An account with this email already exists.')
    }
    const uid = id('u')
    const studentId = id('st')
    db.users.push({
      uid,
      email,
      password: input.password,
      full_name: input.full_name.trim(),
      role: 'student',
      status: 'active',
      created_at: now(),
    })
    db.students.push({
      id: studentId,
      uid,
      phone: input.phone,
      address: input.address || 'Calgary, AB',
      emergency_contact: input.emergency_contact,
      preferred_language: input.preferred_language || 'English',
      registration_status: 'pending',
      pathway: null,
      foundation_complete: false,
      program_id: null,
      notes: '',
    })
    db.enrollments.push({
      id: id('en'),
      student_id: studentId,
      course_id: 'course-foundation',
      status: 'active',
      enrolled_at: now(),
    })
    db.safety_gate_states.push({
      id: id('sg'),
      student_id: studentId,
      gate_key: 'workshop_practical',
      status: 'BLOCKED',
      reason: 'Safety Basics lesson not yet completed',
      updated_at: now(),
      override_by: null,
    })
    db.notifications.push({
      id: id('n'),
      user_uid: 'u-admin',
      title: 'New registration',
      body: `${input.full_name.trim()} submitted registration and needs approval.`,
      read: false,
      created_at: now(),
    })
    const user = publicUser(db.users.find((u) => u.uid === uid)!)
    const student = db.students.find((s) => s.id === studentId)!
    return { token: `${TOKEN_PREFIX}${uid}`, user, student }
  })
}

export function localMe(uid: string) {
  const userRecord = localDb.users.find((u) => u.uid === uid)
  if (!userRecord) return null
  return {
    user: publicUser(userRecord),
    student: localDb.students.find((s) => s.uid === uid) ?? null,
  }
}

export function localSetRegistrationStatus(studentId: string, status: RegistrationStatus, reason: string) {
  mutate((db) => {
    const student = db.students.find((s) => s.id === studentId)
    if (!student) throw new Error('Student not found')
    student.registration_status = status
    student.notes = reason
    db.notifications.push({
      id: id('n'),
      user_uid: student.uid,
      title: 'Registration update',
      body:
        status === 'approved'
          ? 'You can now access foundation learning.'
          : `Status: ${status}. ${reason}`,
      read: false,
      created_at: now(),
    })
  })
}

export function localCompleteLesson(uid: string, lessonId: string, quizScore: number | null) {
  mutate((db) => {
    const student = db.students.find((s) => s.uid === uid)
    if (!student) throw new Error('Student not found')
    if (student.registration_status !== 'approved') throw new Error('Registration not approved')
    const existing = db.lesson_progress.find((p) => p.student_id === student.id && p.lesson_id === lessonId)
    if (existing) {
      existing.completed = true
      existing.quiz_score = quizScore
      existing.completed_at = now()
    } else {
      db.lesson_progress.push({
        id: id('lp'),
        student_id: student.id,
        lesson_id: lessonId,
        completed: true,
        quiz_score: quizScore,
        completed_at: now(),
      })
    }
    const lesson = db.lessons.find((l) => l.id === lessonId)
    db.evidence_records.push({
      id: id('ev'),
      student_id: student.id,
      competency_id: lesson?.competency_id ?? null,
      type: 'lesson',
      source_id: lessonId,
      result: quizScore == null ? 'completed' : `quiz:${quizScore}%`,
      created_at: now(),
      reviewer_uid: null,
    })
    if (lesson?.competency_id && quizScore != null && quizScore >= 80) {
      upsertLearnerCompetency(db, student.id, lesson.competency_id, 'learned', null, 'Lesson quiz ≥80%')
    }
    if (lesson?.lesson_type === 'safety' && quizScore != null && quizScore >= 80) {
      setSafetyGateLocal(
        db,
        student.id,
        'workshop_practical',
        'PASS',
        'Safety lesson completed with passing score',
        null,
      )
    }
    if (foundationProgress(db, student.id) >= 100) student.foundation_complete = true
  })
}

export function localRecordVocab(uid: string, termId: string, layer: LanguageLayer, correct: boolean) {
  mutate((db) => {
    const student = db.students.find((s) => s.uid === uid)
    if (!student) throw new Error('Student not found')
    db.vocab_attempts.push({
      id: id('va'),
      student_id: student.id,
      term_id: termId,
      layer,
      correct,
      at: now(),
    })
  })
}

export function localSelectPathway(uid: string, pathway: Pathway) {
  mutate((db) => {
    const student = db.students.find((s) => s.uid === uid)
    if (!student) throw new Error('Student not found')
    if (!student.foundation_complete) {
      throw new Error('Complete foundation learning before selecting a program.')
    }
    if (pathway !== 'construction') {
      throw new Error('Only the Construction pathway is open in this pilot.')
    }
    student.pathway = pathway
    student.program_id = 'course-construction'
    if (!db.enrollments.some((e) => e.student_id === student.id && e.course_id === 'course-construction')) {
      db.enrollments.push({
        id: id('en'),
        student_id: student.id,
        course_id: 'course-construction',
        status: 'active',
        enrolled_at: now(),
      })
    }
  })
}

export function localSubmitAssignment(uid: string, assignmentId: string, content: string) {
  if (looksLikePromptInjection(content)) {
    const err = new Error(
      'Submission blocked: looks like a prompt-injection / instruction override attempt. Rewrite your answer in your own words.',
    )
    ;(err as Error & { code?: string }).code = 'PROMPT_INJECTION_BLOCKED'
    throw err
  }
  if (!content.trim()) throw new Error('Answer is required.')
  mutate((db) => {
    const student = db.students.find((s) => s.uid === uid)
    if (!student) throw new Error('Student not found')
    const existing = db.submissions.find((s) => s.student_id === student.id && s.assignment_id === assignmentId)
    if (existing) {
      existing.content = content
      existing.status = 'submitted'
      existing.submitted_at = now()
    } else {
      db.submissions.push({
        id: id('sub'),
        assignment_id: assignmentId,
        student_id: student.id,
        content,
        status: 'submitted',
        grade: null,
        feedback: '',
        submitted_at: now(),
        graded_at: null,
      })
    }
  })
}

export function localGradeSubmission(submissionId: string, grade: number, feedback: string) {
  mutate((db) => {
    const sub = db.submissions.find((s) => s.id === submissionId)
    if (!sub) throw new Error('Submission not found')
    sub.grade = grade
    sub.feedback = feedback
    sub.status = 'graded'
    sub.graded_at = now()
    const student = db.students.find((s) => s.id === sub.student_id)
    if (student) {
      db.notifications.push({
        id: id('n'),
        user_uid: student.uid,
        title: 'Assignment graded',
        body: `Your submission was graded ${grade}/100. ${feedback}`,
        read: false,
        created_at: now(),
      })
    }
  })
}

export function localSetSafetyGate(
  studentId: string,
  gateKey: string,
  status: SafetyGateStatus,
  reason: string,
  overrideBy: string | null,
) {
  mutate((db) => {
    setSafetyGateLocal(db, studentId, gateKey, status, reason, overrideBy)
  })
}

export function localObserve(input: {
  studentId: string
  competencyId: string
  assessorUid: string
  ratings: Record<string, RubricRating>
  notes: string
}) {
  return mutate((db) => {
    const gate = db.safety_gate_states.find(
      (g) => g.student_id === input.studentId && g.gate_key === 'workshop_practical',
    )
    if (!gate || gate.status !== 'PASS') {
      throw new Error('Practical observation blocked: safety gate is not PASS.')
    }
    const values = Object.values(input.ratings || {})
    let result: CompetencyStatus = 'not_assessed'
    if (values.includes('critical_safety_error')) result = 'remediation_required'
    else if (values.some((v) => v === 'not_observed')) result = 'not_assessed'
    else if (values.every((v) => v === 'demonstrated')) result = 'competent'
    else if (values.some((v) => v === 'demonstrated' || v === 'partially_demonstrated')) result = 'practised'
    else result = 'remediation_required'

    db.practical_observations.push({
      id: id('po'),
      student_id: input.studentId,
      competency_id: input.competencyId,
      assessor_uid: input.assessorUid,
      ratings: input.ratings,
      outcome: result,
      notes: input.notes,
      created_at: now(),
    })
    upsertLearnerCompetency(db, input.studentId, input.competencyId, result, input.assessorUid, input.notes)
    if (result === 'remediation_required') {
      setSafetyGateLocal(
        db,
        input.studentId,
        'workshop_practical',
        'MANUAL_REVIEW',
        'Critical or material gap — remediation required before repeat assessment',
        null,
      )
    }
    return result
  })
}

export function localCreateAnnouncement(
  title: string,
  body: string,
  audience: 'all' | 'students' | 'instructors',
) {
  mutate((db) => {
    db.announcements.unshift({
      id: id('ann'),
      title,
      body,
      audience,
      created_at: now(),
    })
  })
}

export function localReloadFromStorage() {
  localDb = loadPersisted()
}
