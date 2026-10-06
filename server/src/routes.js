import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { loadDb, saveDb, resetDb, publicUser, withDb } from './db.js'
import { login as doLogin, signToken, authRequired, requireRole } from './auth.js'
import * as apis from './publicApis.js'
import {
  auditSecurityEvent,
  clampNumber,
  guardUserText,
  isEmail,
  sanitizeText,
  scanPromptInjection,
} from './security.js'
import {
  buildAgentBrief,
  findBlockingTicket,
  inferImpact,
  inferScopes,
  maybeCreateGithubIssue,
  OPEN_STATUSES,
  roundId,
  sanitizePreviewPatch,
} from './practiceChangeLoop.js'

function id(prefix) {
  return `${prefix}-${randomUUID().slice(0, 8)}`
}

function now() {
  return new Date().toISOString()
}

function addAudit(db, actor_uid, action, target, previous_value, new_value, reason) {
  db.audit_events.unshift({
    id: id('audit'),
    actor_uid,
    action,
    target,
    previous_value,
    new_value,
    reason,
    at: now(),
  })
}

function foundationProgress(db, studentId) {
  const modules = db.modules.filter((m) => m.course_id === 'course-foundation')
  const lessons = db.lessons.filter((l) => modules.some((m) => m.id === l.module_id))
  if (!lessons.length) return 0
  const done = lessons.filter((l) =>
    db.lesson_progress.some((p) => p.student_id === studentId && p.lesson_id === l.id && p.completed),
  ).length
  return Math.round((done / lessons.length) * 100)
}

function constructionProgress(db, studentId) {
  const modules = db.modules.filter((m) => m.course_id === 'course-construction')
  const lessons = db.lessons.filter((l) => modules.some((m) => m.id === l.module_id))
  if (!lessons.length) return 0
  const done = lessons.filter((l) =>
    db.lesson_progress.some((p) => p.student_id === studentId && p.lesson_id === l.id && p.completed),
  ).length
  return Math.round((done / lessons.length) * 100)
}

function setSafetyGate(db, studentId, gateKey, status, reason, overrideBy) {
  let gate = db.safety_gate_states.find((g) => g.student_id === studentId && g.gate_key === gateKey)
  const prev = gate?.status ?? 'BLOCKED'
  if (!gate) {
    gate = {
      id: id('sg'),
      student_id: studentId,
      gate_key: gateKey,
      status,
      reason,
      updated_at: now(),
      override_by: overrideBy,
    }
    db.safety_gate_states.push(gate)
  } else {
    gate.status = status
    gate.reason = reason
    gate.updated_at = now()
    gate.override_by = overrideBy
  }
  if (overrideBy) {
    addAudit(db, overrideBy, 'safety_gate_override', `${studentId}:${gateKey}`, prev, status, reason)
  }
}

function upsertLearnerCompetency(db, studentId, competencyId, status, assessorUid, notes) {
  const existing = db.learner_competencies.find(
    (c) => c.student_id === studentId && c.competency_id === competencyId,
  )
  if (existing) {
    if (status === 'competent' && !assessorUid) return
    if (existing.status === 'competent' && status !== 'remediation_required' && status !== 'competent') return
    if (existing.status === 'practised' && status === 'learned') return
    existing.status = status
    existing.assessor_uid = assessorUid
    existing.assessed_at = now()
    existing.notes = notes
  } else {
    if (status === 'competent' && !assessorUid) return
    db.learner_competencies.push({
      id: id('lc'),
      student_id: studentId,
      competency_id: competencyId,
      status,
      assessor_uid: assessorUid,
      assessed_at: now(),
      notes,
    })
  }
}

function requireApprovedStudent(db, uid) {
  const student = db.students.find((s) => s.uid === uid)
  if (!student) return { ok: false, status: 404, error: 'Student not found' }
  if (student.registration_status !== 'approved') {
    return {
      ok: false,
      status: 403,
      error: 'Your registration is not approved yet. You cannot open learning activities.',
      code: 'NOT_APPROVED',
    }
  }
  return { ok: true, student }
}

function stripSecrets(db) {
  return {
    ...db,
    users: db.users.map((u) => publicUser(u)),
  }
}

export function registerRoutes(app) {
  app.get('/api/health', async (_req, res) => {
    try {
      const probe = await apis.httpbinHealth()
      res.json({
        ok: true,
        service: 'purpose-academy-api',
        persistence: 'json-file',
        security: {
          headers: true,
          rateLimit: true,
          promptInjectionGuard: true,
          passwordHashing: 'bcrypt',
          auth: 'jwt',
        },
        publicApis: probe,
      })
    } catch {
      res.json({ ok: true, service: 'purpose-academy-api', publicApis: { ok: false } })
    }
  })

  app.post('/api/security/scan-text', authRequired, (req, res) => {
    const raw = String(req.body?.text || '')
    const scan = scanPromptInjection(raw)
    const cleaned = sanitizeText(raw, { maxLen: 5000 })
    res.json({
      scan,
      length: cleaned.length,
      safePreview: cleaned.slice(0, 200),
    })
  })

  app.post('/api/auth/login', (req, res) => {
    const email = sanitizeText(req.body?.email || '', { maxLen: 200 }).toLowerCase()
    const password = String(req.body?.password || '')
    if (!isEmail(email) || password.length < 6 || password.length > 200) {
      return res.status(400).json({ error: 'Enter a valid email and password.' })
    }
    const user = doLogin(email, password)
    if (!user) {
      withDb((db) => {
        auditSecurityEvent(db, 'anonymous', 'login_failed', email)
      })
      return res.status(401).json({ error: 'Invalid email or password.' })
    }
    const db = loadDb()
    const student = db.students.find((s) => s.uid === user.uid) || null
    const instructor = db.instructors.find((i) => i.uid === user.uid) || null
    const token = signToken(user)
    res.json({ token, user, student, instructor })
  })

  app.post('/api/auth/register', (req, res) => {
    const input = req.body || {}
    const email = sanitizeText(input.email || '', { maxLen: 200 }).toLowerCase()
    const password = String(input.password || '')
    const full_name = guardUserText(input.full_name, { field: 'Full name', maxLen: 120 })
    const phone = sanitizeText(input.phone || '', { maxLen: 40 })
    const address = guardUserText(input.address || 'Calgary, AB', { field: 'Address', maxLen: 200, allowEmpty: true })
    const emergency = guardUserText(input.emergency_contact || '', {
      field: 'Emergency contact',
      maxLen: 200,
      allowEmpty: true,
    })
    const preferred_language = sanitizeText(input.preferred_language || 'English', { maxLen: 40 })

    if (!full_name.ok) return res.status(400).json({ error: full_name.error, code: full_name.code })
    if (!address.ok) return res.status(400).json({ error: address.error, code: address.code })
    if (!emergency.ok) return res.status(400).json({ error: emergency.error, code: emergency.code })
    if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
    if (password.length < 8 || password.length > 200) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }

    try {
      const result = withDb((db) => {
        if (db.users.some((u) => u.email.toLowerCase() === email)) {
          throw new Error('An account with this email already exists.')
        }
        const uid = id('u')
        db.users.push({
          uid,
          email,
          password_hash: bcrypt.hashSync(password, 10),
          full_name: full_name.value,
          role: 'student',
          status: 'active',
          created_at: now(),
        })
        const studentId = id('st')
        db.students.push({
          id: studentId,
          uid,
          phone,
          address: address.value,
          emergency_contact: emergency.value,
          preferred_language,
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
          body: `${full_name.value} submitted registration and needs approval.`,
          read: false,
          created_at: now(),
        })
        const user = publicUser(db.users.find((u) => u.uid === uid))
        const student = db.students.find((s) => s.id === studentId)
        return { user, student, token: signToken(user) }
      })
      res.status(201).json(result)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  app.get('/api/auth/me', authRequired, (req, res) => {
    const db = loadDb()
    const user = publicUser(db.users.find((u) => u.uid === req.user.uid))
    if (!user) return res.status(401).json({ error: 'User not found' })
    const student = db.students.find((s) => s.uid === user.uid) || null
    const instructor = db.instructors.find((i) => i.uid === user.uid) || null
    res.json({ user, student, instructor })
  })

  app.get('/api/state', authRequired, (req, res) => {
    const db = loadDb()
    res.json({
      db: stripSecrets(db),
      meta: {
        foundationProgress: Object.fromEntries(
          db.students.map((s) => [s.id, foundationProgress(db, s.id)]),
        ),
        constructionProgress: Object.fromEntries(
          db.students.map((s) => [s.id, constructionProgress(db, s.id)]),
        ),
      },
    })
  })

  app.get('/api/public/programs', (_req, res) => {
    const db = loadDb()
    res.json({
      courses: db.courses.map(({ id, title, category, description, duration, skills, active }) => ({
        id,
        title,
        category,
        description,
        duration,
        skills,
        active,
      })),
    })
  })

  // ---- Public API enrichments (from public-apis) ----
  app.get('/api/enrich/dictionary/:word', authRequired, async (req, res) => {
    try {
      res.json(await apis.dictionaryLookup(req.params.word))
    } catch (e) {
      res.status(502).json({ error: e.message })
    }
  })

  app.get('/api/enrich/translate', authRequired, async (req, res) => {
    try {
      const text = String(req.query.q || '')
      const to = apis.langCode(String(req.query.to || 'Spanish'))
      const from = String(req.query.from || 'en')
      res.json(await apis.translateText(text, from, to))
    } catch (e) {
      res.status(502).json({ error: e.message })
    }
  })

  app.get('/api/enrich/image/:seed', authRequired, (req, res) => {
    res.json(apis.picsumUrl(req.params.seed, Number(req.query.w) || 640, Number(req.query.h) || 360))
  })

  app.get('/api/enrich/quote', async (_req, res) => {
    try {
      res.json(await apis.randomQuote())
    } catch (e) {
      res.status(502).json({ error: e.message })
    }
  })

  /**
   * Neural text-to-speech for Practice Mode / student vocab.
   * Public (no auth) so Student Practice Mode can hear human-sounding voices.
   * Query: text, lang (en|es|ar|hi|am|ti or language name)
   */
  app.get('/api/enrich/tts', async (req, res) => {
    try {
      const text = String(req.query.text || req.query.q || '')
      const langRaw = String(req.query.lang || 'en')
      const lang = /^[a-z]{2}/i.test(langRaw) ? langRaw : apis.langCode(langRaw)
      const result = await apis.synthesizeSpeech(text, lang)
      res.setHeader('Content-Type', result.contentType)
      res.setHeader('Cache-Control', 'public, max-age=86400')
      res.setHeader('X-PA-TTS-Voice', result.voice)
      res.setHeader('X-PA-TTS-Source', result.source)
      res.setHeader('X-PA-TTS-Cached', result.cached ? '1' : '0')
      res.send(result.buffer)
    } catch (e) {
      res.status(502).json({ error: e.message || 'Speech unavailable' })
    }
  })

  /** Free Dictionary pronunciation for single English words (public-apis). */
  app.get('/api/enrich/pronounce/:word', async (req, res) => {
    try {
      res.json(await apis.englishPronunciation(req.params.word))
    } catch (e) {
      res.status(502).json({ error: e.message })
    }
  })

  app.get('/api/enrich/calgary', async (_req, res) => {
    try {
      res.json(await apis.calgaryWeather())
    } catch (e) {
      res.status(502).json({ error: e.message })
    }
  })

  app.get('/api/enrich/postal/:code', authRequired, async (req, res) => {
    try {
      res.json(await apis.postalLookup(req.params.code))
    } catch (e) {
      res.status(502).json({ error: e.message })
    }
  })

  app.get('/api/enrich/universities', async (_req, res) => {
    try {
      res.json(await apis.canadianUniversities())
    } catch (e) {
      res.status(502).json({ error: e.message })
    }
  })

  app.get('/api/enrich/vocab/:termId', authRequired, async (req, res) => {
    try {
      const db = loadDb()
      const term = db.vocab_terms.find((t) => t.id === req.params.termId)
      if (!term) return res.status(404).json({ error: 'Term not found' })
      const student = db.students.find((s) => s.uid === req.user.uid)
      const dict = await apis.dictionaryLookup(term.english)
      const image = apis.picsumUrl(term.english)
      let translation = null
      if (student?.preferred_language && student.preferred_language !== 'English only') {
        translation = await apis.translateText(
          term.definition,
          'en',
          apis.langCode(student.preferred_language),
        )
      }
      res.json({
        term,
        dictionary: dict,
        image,
        translation,
        sources: [
          'Free Dictionary API',
          'Lorem Picsum',
          translation ? 'MyMemory Translation API' : null,
        ].filter(Boolean),
      })
    } catch (e) {
      res.status(502).json({ error: e.message })
    }
  })

  // ---- Mutations ----
  app.post('/api/admin/students/:studentId/status', authRequired, requireRole('admin'), (req, res) => {
    const status = sanitizeText(req.body?.status || '', { maxLen: 40 })
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid registration status.' })
    }
    const reasonGuard = guardUserText(req.body?.reason || '', {
      field: 'Reason',
      maxLen: 500,
      allowEmpty: true,
    })
    if (!reasonGuard.ok) {
      return res.status(400).json({ error: reasonGuard.error, code: reasonGuard.code })
    }
    withDb((db) => {
      const student = db.students.find((s) => s.id === req.params.studentId)
      if (!student) return res.status(404).json({ error: 'Student not found' })
      const prev = student.registration_status
      student.registration_status = status
      student.notes = reasonGuard.value
      addAudit(db, req.user.uid, 'registration_status', student.id, prev, status, reasonGuard.value)
      db.notifications.push({
        id: id('n'),
        user_uid: student.uid,
        title: status === 'approved' ? 'Registration approved' : 'Registration update',
        body:
          status === 'approved'
            ? 'You can now access foundation learning.'
            : `Status: ${status}. ${reasonGuard.value}`,
        read: false,
        created_at: now(),
      })
      res.json({ student })
    })
  })

  app.post('/api/student/lessons/:lessonId/complete', authRequired, requireRole('student'), (req, res) => {
    const quizScore =
      req.body?.quizScore == null ? null : clampNumber(req.body.quizScore, 0, 100)
    if (req.body?.quizScore != null && quizScore == null) {
      return res.status(400).json({ error: 'Quiz score must be a number from 0 to 100.' })
    }
    withDb((db) => {
      const gate = requireApprovedStudent(db, req.user.uid)
      if (!gate.ok) return res.status(gate.status).json({ error: gate.error, code: gate.code })
      const student = gate.student
      if (student.registration_status !== 'approved') {
        return res.status(403).json({ error: 'Registration not approved' })
      }
      const lessonId = req.params.lessonId
      const existing = db.lesson_progress.find(
        (p) => p.student_id === student.id && p.lesson_id === lessonId,
      )
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
        setSafetyGate(db, student.id, 'workshop_practical', 'PASS', 'Safety lesson completed with passing score', null)
      }
      if (foundationProgress(db, student.id) >= 100) student.foundation_complete = true
      res.json({
        student,
        foundationProgress: foundationProgress(db, student.id),
        constructionProgress: constructionProgress(db, student.id),
      })
    })
  })

  app.post('/api/student/vocab', authRequired, requireRole('student'), (req, res) => {
    const { termId, layer, correct } = req.body || {}
    withDb((db) => {
      const gate = requireApprovedStudent(db, req.user.uid)
      if (!gate.ok) return res.status(gate.status).json({ error: gate.error, code: gate.code })
      const student = gate.student
      db.vocab_attempts.push({
        id: id('va'),
        student_id: student.id,
        term_id: termId,
        layer,
        correct: Boolean(correct),
        at: now(),
      })
      db.evidence_records.push({
        id: id('ev'),
        student_id: student.id,
        competency_id: 'comp-workplace-lang',
        type: 'vocab',
        source_id: termId,
        result: `${layer}:${correct ? 'correct' : 'incorrect'}`,
        created_at: now(),
        reviewer_uid: null,
      })
      res.json({ ok: true })
    })
  })

  app.post('/api/student/pathway', authRequired, requireRole('student'), (req, res) => {
    const pathway = req.body?.pathway
    try {
      const student = withDb((db) => {
        const gate = requireApprovedStudent(db, req.user.uid)
        if (!gate.ok) throw Object.assign(new Error(gate.error), { status: gate.status, code: gate.code })
        const student = gate.student
        if (pathway !== 'construction' && pathway !== 'logistics' && pathway !== 'community') {
          throw new Error('Unknown pathway')
        }
        const courseId =
          pathway === 'logistics'
            ? 'course-logistics'
            : pathway === 'community'
              ? 'course-community'
              : 'course-construction'
        student.foundation_complete = true
        student.pathway = pathway
        student.program_id = courseId
        if (!db.enrollments.some((e) => e.student_id === student.id && e.course_id === courseId)) {
          db.enrollments.push({
            id: id('en'),
            student_id: student.id,
            course_id: courseId,
            status: 'active',
            enrolled_at: now(),
          })
        }
        return student
      })
      res.json({ student })
    } catch (e) {
      res.status(e.status || 400).json({ error: e.message, code: e.code })
    }
  })

  app.post('/api/student/assignments/:assignmentId/submit', authRequired, requireRole('student'), (req, res) => {
    const contentGuard = guardUserText(req.body?.content || '', { field: 'Answer', maxLen: 8000 })
    if (!contentGuard.ok) {
      withDb((db) => {
        if (contentGuard.code === 'PROMPT_INJECTION_BLOCKED') {
          auditSecurityEvent(db, req.user.uid, 'prompt_injection_blocked', 'assignment_submit')
        }
      })
      return res.status(400).json({ error: contentGuard.error, code: contentGuard.code })
    }
    const content = contentGuard.value
    withDb((db) => {
      const gate = requireApprovedStudent(db, req.user.uid)
      if (!gate.ok) return res.status(gate.status).json({ error: gate.error, code: gate.code })
      const student = gate.student
      const assignmentId = req.params.assignmentId
      const existing = db.submissions.find(
        (s) => s.student_id === student.id && s.assignment_id === assignmentId,
      )
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
      db.evidence_records.push({
        id: id('ev'),
        student_id: student.id,
        competency_id: null,
        type: 'assignment',
        source_id: assignmentId,
        result: 'submitted',
        created_at: now(),
        reviewer_uid: null,
      })
      res.json({ ok: true })
    })
  })

  app.post('/api/instructor/submissions/:submissionId/grade', authRequired, requireRole('instructor', 'admin'), (req, res) => {
    const grade = clampNumber(req.body?.grade, 0, 100)
    if (grade == null) return res.status(400).json({ error: 'Grade must be a number from 0 to 100.' })
    const feedbackGuard = guardUserText(req.body?.feedback || '', { field: 'Feedback', maxLen: 4000 })
    if (!feedbackGuard.ok) {
      return res.status(400).json({ error: feedbackGuard.error, code: feedbackGuard.code })
    }
    const feedback = feedbackGuard.value
    withDb((db) => {
      const sub = db.submissions.find((s) => s.id === req.params.submissionId)
      if (!sub) return res.status(404).json({ error: 'Submission not found' })
      sub.grade = grade
      sub.feedback = feedback
      sub.status = 'graded'
      sub.graded_at = now()
      addAudit(db, req.user.uid, 'grade_submission', sub.id, 'submitted', `graded:${grade}`, feedback)
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
      res.json({ submission: sub })
    })
  })

  app.post('/api/instructor/safety/:studentId', authRequired, requireRole('instructor', 'admin'), (req, res) => {
    const status = sanitizeText(req.body?.status || '', { maxLen: 40 })
    if (!['PASS', 'BLOCKED', 'EXPIRED', 'MANUAL_REVIEW'].includes(status)) {
      return res.status(400).json({ error: 'Invalid safety gate status.' })
    }
    const reasonGuard = guardUserText(req.body?.reason || 'Instructor update', {
      field: 'Reason',
      maxLen: 500,
    })
    if (!reasonGuard.ok) {
      return res.status(400).json({ error: reasonGuard.error, code: reasonGuard.code })
    }
    const gateKey = sanitizeText(req.body?.gateKey || 'workshop_practical', { maxLen: 80 })
    withDb((db) => {
      setSafetyGate(db, req.params.studentId, gateKey, status, reasonGuard.value, req.user.uid)
      res.json({ ok: true })
    })
  })

  app.post('/api/instructor/observe', authRequired, requireRole('instructor', 'admin'), (req, res) => {
    const { studentId, competencyId, ratings } = req.body || {}
    const notesGuard = guardUserText(req.body?.notes || '', {
      field: 'Notes',
      maxLen: 4000,
      allowEmpty: true,
    })
    if (!notesGuard.ok) {
      return res.status(400).json({ error: notesGuard.error, code: notesGuard.code })
    }
    const notes = notesGuard.value
    try {
      const outcome = withDb((db) => {
        const gate = db.safety_gate_states.find(
          (g) => g.student_id === studentId && g.gate_key === 'workshop_practical',
        )
        if (!gate || gate.status !== 'PASS') {
          throw new Error('Practical observation blocked: safety gate is not PASS.')
        }
        const values = Object.values(ratings || {})
        let result = 'not_assessed'
        if (values.includes('critical_safety_error')) result = 'remediation_required'
        else if (values.some((v) => v === 'not_observed')) result = 'not_assessed'
        else if (values.every((v) => v === 'demonstrated')) result = 'competent'
        else if (values.some((v) => v === 'demonstrated' || v === 'partially_demonstrated')) result = 'practised'
        else result = 'remediation_required'

        db.practical_observations.push({
          id: id('po'),
          student_id: studentId,
          competency_id: competencyId,
          assessor_uid: req.user.uid,
          ratings,
          outcome: result,
          notes,
          created_at: now(),
        })
        db.evidence_records.push({
          id: id('ev'),
          student_id: studentId,
          competency_id: competencyId,
          type: 'practical',
          source_id: competencyId,
          result,
          created_at: now(),
          reviewer_uid: req.user.uid,
        })
        upsertLearnerCompetency(db, studentId, competencyId, result, req.user.uid, notes)
        addAudit(
          db,
          req.user.uid,
          'practical_observation',
          `${studentId}:${competencyId}`,
          'not_assessed',
          result,
          notes || 'Instructor observation finalized',
        )
        if (result === 'remediation_required') {
          setSafetyGate(
            db,
            studentId,
            'workshop_practical',
            'MANUAL_REVIEW',
            'Critical or material gap. Remediation required before repeat assessment',
            null,
          )
        }
        return result
      })
      res.json({ outcome })
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  app.post('/api/admin/announcements', authRequired, requireRole('admin'), (req, res) => {
    const titleGuard = guardUserText(req.body?.title || '', { field: 'Title', maxLen: 160 })
    const bodyGuard = guardUserText(req.body?.body || '', { field: 'Message', maxLen: 4000 })
    if (!titleGuard.ok) return res.status(400).json({ error: titleGuard.error, code: titleGuard.code })
    if (!bodyGuard.ok) return res.status(400).json({ error: bodyGuard.error, code: bodyGuard.code })
    const audience = sanitizeText(req.body?.audience || 'all', { maxLen: 40 })
    withDb((db) => {
      const ann = {
        id: id('ann'),
        title: titleGuard.value,
        body: bodyGuard.value,
        audience,
        created_at: now(),
      }
      db.announcements.unshift(ann)
      res.status(201).json({ announcement: ann })
    })
  })

  app.post('/api/admin/reset', authRequired, requireRole('admin'), (_req, res) => {
    const db = resetDb()
    res.json({ ok: true, users: db.users.length })
  })

  /** Practice Mode reviewer feedback — public submit, admin read, change-loop review. */
  app.post('/api/practice/feedback', async (req, res) => {
    const authorGuard = guardUserText(req.body?.author || '', { field: 'Name', maxLen: 80 })
    const bodyGuard = guardUserText(req.body?.body || '', { field: 'Feedback', maxLen: 4000 })
    const pageGuard = guardUserText(req.body?.page || '', { field: 'Page', maxLen: 200 })
    const titleGuard = guardUserText(req.body?.pageTitle || pageGuard.value || 'Page', {
      field: 'Page title',
      maxLen: 160,
      allowEmpty: true,
    })
    if (!authorGuard.ok) return res.status(400).json({ error: authorGuard.error, code: authorGuard.code })
    if (!bodyGuard.ok) return res.status(400).json({ error: bodyGuard.error, code: bodyGuard.code })
    if (!pageGuard.ok) return res.status(400).json({ error: pageGuard.error, code: pageGuard.code })
    const kind = req.body?.kind === 'quiz' ? 'quiz' : 'page'
    const clientId = sanitizeText(req.body?.clientId || '', { maxLen: 80 })
    const created = now()
    const scopes = Array.isArray(req.body?.scopes)
      ? req.body.scopes.map((s) => sanitizeText(String(s), { maxLen: 80 })).filter(Boolean).slice(0, 20)
      : inferScopes(pageGuard.value, bodyGuard.value)
    const impact =
      req.body?.impact === 'sitewide' || req.body?.impact === 'shared' || req.body?.impact === 'local'
        ? req.body.impact
        : inferImpact(scopes)
    const entryId = clientId || id('pf')
    const agentBrief = buildAgentBrief({
      id: entryId,
      author: authorGuard.value,
      page: pageGuard.value,
      pageTitle: titleGuard.value || pageGuard.value,
      body: bodyGuard.value,
      scopes,
      impact,
    })

    let githubIssueUrl
    try {
      githubIssueUrl = await maybeCreateGithubIssue({
        pageTitle: titleGuard.value || pageGuard.value,
        body: bodyGuard.value,
        impact,
        agentBrief,
      })
    } catch {
      githubIssueUrl = undefined
    }

    withDb((db) => {
      if (!Array.isArray(db.practice_feedback)) db.practice_feedback = []
      const entry = {
        id: entryId,
        author: authorGuard.value,
        page: pageGuard.value,
        pageTitle: titleGuard.value || pageGuard.value,
        body: bodyGuard.value,
        kind,
        created_at: created,
        updated_at: created,
        status: 'queued',
        impact,
        scopes,
        rounds: [
          {
            id: roundId(),
            at: created,
            by: authorGuard.value,
            kind: 'feedback',
            note: bodyGuard.value,
          },
          {
            id: roundId(),
            at: created,
            by: 'system',
            kind: 'queued',
            note: `Queued as a ${impact} change. A preview will open for approval before it ships live.`,
          },
        ],
        agentBrief,
        githubIssueUrl,
      }
      const existing = db.practice_feedback.findIndex((f) => f.id === entry.id)
      if (existing >= 0) {
        const prev = db.practice_feedback[existing]
        db.practice_feedback[existing] = {
          ...prev,
          ...entry,
          rounds: Array.isArray(prev.rounds) && prev.rounds.length ? prev.rounds : entry.rounds,
          status: prev.status || entry.status,
        }
      } else db.practice_feedback.unshift(entry)
      if (db.practice_feedback.length > 2000) db.practice_feedback.length = 2000
      res.status(201).json({ feedback: existing >= 0 ? db.practice_feedback[existing] : entry })
    })
  })

  /** Reviewer poll — open tickets for one Practice name (no admin auth). */
  app.get('/api/practice/feedback/mine', (req, res) => {
    const authorGuard = guardUserText(req.query?.author || '', { field: 'Name', maxLen: 80 })
    if (!authorGuard.ok) return res.status(400).json({ error: authorGuard.error, code: authorGuard.code })
    const db = loadDb()
    const feedback = (Array.isArray(db.practice_feedback) ? db.practice_feedback : []).filter(
      (f) => f.author === authorGuard.value && OPEN_STATUSES.has(f.status || 'queued'),
    )
    res.json({ feedback })
  })

  /** Reviewer approve / request iteration (must match ticket author). */
  app.post('/api/practice/feedback/:id/review', (req, res) => {
    const authorGuard = guardUserText(req.body?.author || '', { field: 'Name', maxLen: 80 })
    const noteGuard = guardUserText(req.body?.note || '', {
      field: 'Note',
      maxLen: 2000,
      allowEmpty: true,
    })
    if (!authorGuard.ok) return res.status(400).json({ error: authorGuard.error, code: authorGuard.code })
    if (!noteGuard.ok) return res.status(400).json({ error: noteGuard.error, code: noteGuard.code })
    const action = req.body?.action === 'approve' ? 'approve' : req.body?.action === 'iterate' ? 'iterate' : null
    if (!action) return res.status(400).json({ error: 'Action must be approve or iterate.' })
    if (action === 'iterate' && !noteGuard.value) {
      return res.status(400).json({ error: 'Say what still needs to change.', code: 'EMPTY' })
    }
    const ticketId = sanitizeText(req.params.id || '', { maxLen: 80 })
    withDb((db) => {
      if (!Array.isArray(db.practice_feedback)) db.practice_feedback = []
      const idx = db.practice_feedback.findIndex((f) => f.id === ticketId)
      if (idx < 0) return res.status(404).json({ error: 'Change request not found.' })
      const ticket = db.practice_feedback[idx]
      if (ticket.author !== authorGuard.value) {
        return res.status(403).json({ error: 'Only the reviewer who left this note can approve it.' })
      }
      if (!['preview_ready', 'needs_iteration', 'in_progress', 'approved'].includes(ticket.status)) {
        return res.status(400).json({ error: 'This change is not ready for review yet.' })
      }
      const at = now()
      const rounds = Array.isArray(ticket.rounds) ? [...ticket.rounds] : []
      if (action === 'approve') {
        rounds.push({
          id: roundId(),
          at,
          by: authorGuard.value,
          kind: 'approval',
          note: noteGuard.value || 'Approved — ready to ship to the live site.',
        })
        ticket.status = 'approved'
      } else {
        rounds.push({
          id: roundId(),
          at,
          by: authorGuard.value,
          kind: 'iteration_request',
          note: noteGuard.value,
        })
        ticket.status = 'needs_iteration'
      }
      ticket.rounds = rounds
      ticket.updated_at = at
      db.practice_feedback[idx] = ticket
      res.json({ feedback: ticket })
    })
  })

  /** Admin: advance lifecycle, attach preview URL / safe patch, ship or dismiss. */
  app.patch('/api/practice/feedback/:id', authRequired, requireRole('admin'), (req, res) => {
    const ticketId = sanitizeText(req.params.id || '', { maxLen: 80 })
    const noteGuard = guardUserText(req.body?.note || '', {
      field: 'Note',
      maxLen: 2000,
      allowEmpty: true,
    })
    if (!noteGuard.ok) return res.status(400).json({ error: noteGuard.error, code: noteGuard.code })
    const byGuard = guardUserText(req.body?.by || req.user?.full_name || 'admin', {
      field: 'Builder',
      maxLen: 80,
      allowEmpty: true,
    })
    const status = sanitizeText(req.body?.status || '', { maxLen: 40 })
    const allowed = new Set([
      'queued',
      'in_progress',
      'preview_ready',
      'needs_iteration',
      'approved',
      'shipped',
      'dismissed',
    ])
    if (status && !allowed.has(status)) {
      return res.status(400).json({ error: 'Invalid status.' })
    }
    const previewUrlRaw = req.body?.previewUrl
    let previewUrl
    if (previewUrlRaw === null) previewUrl = null
    else if (typeof previewUrlRaw === 'string' && previewUrlRaw.trim()) {
      const cleaned = sanitizeText(previewUrlRaw, { maxLen: 500 })
      if (!/^https?:\/\//i.test(cleaned)) {
        return res.status(400).json({ error: 'Preview URL must start with http(s)://' })
      }
      previewUrl = cleaned
    }
    const patchProvided = Object.prototype.hasOwnProperty.call(req.body || {}, 'patch')
    const patch = patchProvided
      ? req.body.patch === null
        ? null
        : sanitizePreviewPatch(req.body.patch)
      : undefined
    if (patchProvided && req.body.patch != null && !patch) {
      return res.status(400).json({
        error: 'Patch rejected. Use allowlisted cssVars (--*), copy keys, or vocab field overrides only.',
      })
    }

    withDb((db) => {
      if (!Array.isArray(db.practice_feedback)) db.practice_feedback = []
      const idx = db.practice_feedback.findIndex((f) => f.id === ticketId)
      if (idx < 0) return res.status(404).json({ error: 'Change request not found.' })
      const ticket = { ...db.practice_feedback[idx] }
      const nextStatus = status || (patch || previewUrl ? 'preview_ready' : ticket.status)
      if (['in_progress', 'preview_ready'].includes(nextStatus)) {
        const blocker = findBlockingTicket(
          db,
          { scopes: ticket.scopes || [], impact: ticket.impact || 'local' },
          ticket.id,
        )
        if (blocker) {
          return res.status(409).json({
            error: `Blocked by overlapping change ${blocker.id} (${blocker.status}). Finish or dismiss that one first so cross-changes do not collide.`,
            code: 'SCOPE_CONFLICT',
            blockingId: blocker.id,
          })
        }
      }
      const at = now()
      const rounds = Array.isArray(ticket.rounds) ? [...ticket.rounds] : []
      if (patch !== undefined) ticket.patch = patch || undefined
      if (previewUrl !== undefined) ticket.previewUrl = previewUrl || undefined
      if (nextStatus) ticket.status = nextStatus
      const summary =
        noteGuard.value ||
        ticket.patch?.summary ||
        (previewUrl ? `Preview: ${previewUrl}` : '') ||
        `Status → ${ticket.status}`
      rounds.push({
        id: roundId(),
        at,
        by: byGuard.value || 'admin',
        kind:
          ticket.status === 'shipped'
            ? 'ship'
            : ticket.status === 'dismissed'
              ? 'dismiss'
              : ticket.status === 'preview_ready'
                ? 'proposal'
                : 'queued',
        note: summary,
        previewUrl: ticket.previewUrl,
        patchSummary: ticket.patch?.summary,
      })
      ticket.rounds = rounds
      ticket.updated_at = at
      db.practice_feedback[idx] = ticket
      res.json({ feedback: ticket })
    })
  })

  app.get('/api/practice/feedback', authRequired, requireRole('admin'), (_req, res) => {
    const db = loadDb()
    const feedback = Array.isArray(db.practice_feedback) ? db.practice_feedback : []
    res.json({ feedback })
  })
}
