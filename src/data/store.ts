import { useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'
import { createSeedDatabase } from './seed'
import type {
  AppDatabase,
  LanguageLayer,
  Pathway,
  RegistrationStatus,
  RubricRating,
  SafetyGateStatus,
  Student,
  User,
} from './types'

type Meta = {
  foundationProgress: Record<string, number>
  constructionProgress: Record<string, number>
}

let db: AppDatabase = createSeedDatabase()
let meta: Meta = { foundationProgress: {}, constructionProgress: {} }
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((l) => l())
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getDb(): AppDatabase {
  return db
}

export function getMeta() {
  return meta
}

/** Subscribe to store updates so role pages re-render after mutations/refresh. */
export function useDb(): AppDatabase {
  const [, setTick] = useState(0)
  useEffect(() => subscribe(() => setTick((t) => t + 1)), [])
  return db
}

export function useMeta() {
  const [, setTick] = useState(0)
  useEffect(() => subscribe(() => setTick((t) => t + 1)), [])
  return meta
}

export async function refreshState() {
  if (!getToken()) {
    db = createSeedDatabase()
    meta = { foundationProgress: {}, constructionProgress: {} }
    notify()
    return
  }
  const data = await api<{ db: AppDatabase; meta: Meta }>('/api/state')
  db = data.db
  meta = data.meta
  notify()
}

export async function loginRequest(email: string, password: string) {
  const data = await api<{
    token: string
    user: User
    student: Student | null
  }>('/api/auth/login', { method: 'POST', json: { email, password } })
  setToken(data.token)
  await refreshState()
  return data
}

export async function registerRequest(input: {
  full_name: string
  email: string
  password: string
  phone: string
  address: string
  emergency_contact: string
  preferred_language: string
}) {
  const data = await api<{ token: string; user: User; student: Student }>('/api/auth/register', {
    method: 'POST',
    json: input,
  })
  setToken(data.token)
  await refreshState()
  return data
}

export async function fetchMe() {
  if (!getToken()) return null
  try {
    const data = await api<{ user: User; student: Student | null }>('/api/auth/me')
    await refreshState()
    return data
  } catch {
    setToken(null)
    return null
  }
}

export function logoutLocal() {
  setToken(null)
  db = createSeedDatabase()
  meta = { foundationProgress: {}, constructionProgress: {} }
  notify()
}

export function getStudentByUid(uid: string) {
  return db.students.find((s) => s.uid === uid) ?? null
}

export function foundationProgress(studentId: string) {
  return meta.foundationProgress[studentId] ?? 0
}

export function constructionProgress(studentId: string) {
  return meta.constructionProgress[studentId] ?? 0
}

export function vocabMasteryPercent(studentId: string, termIds: string[]) {
  if (termIds.length === 0) return 100
  const layers: LanguageLayer[] = ['recognize', 'recall']
  let hits = 0
  let total = 0
  for (const termId of termIds) {
    for (const layer of layers) {
      total += 1
      const attempts = db.vocab_attempts.filter(
        (a) => a.student_id === studentId && a.term_id === termId && a.layer === layer,
      )
      if (attempts.length && attempts[attempts.length - 1].correct) hits += 1
    }
  }
  return Math.round((hits / total) * 100)
}

export function getSafetyGate(studentId: string, gateKey = 'workshop_practical') {
  return db.safety_gate_states.find((g) => g.student_id === studentId && g.gate_key === gateKey) ?? null
}

export async function setRegistrationStatus(
  _adminUid: string,
  studentId: string,
  status: RegistrationStatus,
  reason: string,
) {
  await api(`/api/admin/students/${studentId}/status`, {
    method: 'POST',
    json: { status, reason },
  })
  await refreshState()
}

export async function completeLesson(studentId: string, lessonId: string, quizScore: number | null) {
  void studentId
  await api(`/api/student/lessons/${lessonId}/complete`, {
    method: 'POST',
    json: { quizScore },
  })
  await refreshState()
}

export async function recordVocabAttempt(
  studentId: string,
  termId: string,
  layer: LanguageLayer,
  correct: boolean,
) {
  void studentId
  await api('/api/student/vocab', {
    method: 'POST',
    json: { termId, layer, correct },
  })
  await refreshState()
}

export async function selectPathway(studentId: string, pathway: Pathway) {
  void studentId
  await api('/api/student/pathway', {
    method: 'POST',
    json: { pathway },
  })
  await refreshState()
}

export async function submitAssignment(studentId: string, assignmentId: string, content: string) {
  void studentId
  await api(`/api/student/assignments/${assignmentId}/submit`, {
    method: 'POST',
    json: { content },
  })
  await refreshState()
}

export async function gradeSubmission(
  instructorUid: string,
  submissionId: string,
  grade: number,
  feedback: string,
) {
  void instructorUid
  await api(`/api/instructor/submissions/${submissionId}/grade`, {
    method: 'POST',
    json: { grade, feedback },
  })
  await refreshState()
}

export async function setSafetyGate(
  studentId: string,
  gateKey: string,
  status: SafetyGateStatus,
  reason: string,
  overrideBy: string | null,
) {
  void overrideBy
  await api(`/api/instructor/safety/${studentId}`, {
    method: 'POST',
    json: { status, reason, gateKey },
  })
  await refreshState()
}

export async function recordPracticalObservation(input: {
  studentId: string
  competencyId: string
  assessorUid: string
  ratings: Record<string, RubricRating>
  notes: string
}) {
  void input.assessorUid
  const data = await api<{ outcome: string }>('/api/instructor/observe', {
    method: 'POST',
    json: {
      studentId: input.studentId,
      competencyId: input.competencyId,
      ratings: input.ratings,
      notes: input.notes,
    },
  })
  await refreshState()
  return data.outcome
}

export async function createAnnouncement(
  title: string,
  body: string,
  audience: 'all' | 'students' | 'instructors',
) {
  await api('/api/admin/announcements', {
    method: 'POST',
    json: { title, body, audience },
  })
  await refreshState()
}

export async function resetDatabase() {
  await api('/api/admin/reset', { method: 'POST', json: {} })
  await refreshState()
}

export async function enrichVocab(termId: string) {
  return api<{
    term: { english: string; definition: string; image_hint: string }
    dictionary: {
      found: boolean
      definition: string | null
      phonetic: string | null
      audio: string | null
      examples: string[]
    }
    image: { imageUrl: string; source: string }
    translation: { translated: string; source: string; to: string } | null
    sources: string[]
  }>(`/api/enrich/vocab/${termId}`)
}

export async function enrichQuote() {
  return api<{ content: string; author: string; source: string }>('/api/enrich/quote')
}

export async function enrichCalgary() {
  return api<{
    place: { displayName: string; lat: number; lon: number }
    current: { temperature_2m: number; wind_speed_10m: number }
    units: { temperature_2m: string; wind_speed_10m: string }
    source: string
  }>('/api/enrich/calgary')
}
