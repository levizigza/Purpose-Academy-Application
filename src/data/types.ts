export type Role = 'student' | 'instructor' | 'admin'

export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

export type Pathway = 'construction' | 'logistics' | 'community' | null

export type SafetyGateStatus = 'PASS' | 'BLOCKED' | 'EXPIRED' | 'MANUAL_REVIEW'

export type CompetencyStatus =
  | 'learned'
  | 'practised'
  | 'competent'
  | 'remediation_required'
  | 'not_assessed'

export type RubricRating =
  | 'demonstrated'
  | 'partially_demonstrated'
  | 'not_demonstrated'
  | 'critical_safety_error'
  | 'not_observed'

export type LanguageLayer =
  | 'see_hear'
  | 'understand'
  | 'recognize'
  | 'recall'
  | 'sentence'
  | 'instruction'

export interface User {
  uid: string
  email: string
  password?: string
  password_hash?: string
  full_name: string
  role: Role
  status: 'active' | 'inactive'
  created_at: string
}

export interface Student {
  id: string
  uid: string
  phone: string
  address: string
  emergency_contact: string
  preferred_language: string
  registration_status: RegistrationStatus
  pathway: Pathway
  foundation_complete: boolean
  program_id: string | null
  notes: string
}

export interface Instructor {
  id: string
  uid: string
  specialty: string
  assigned_course_ids: string[]
}

export interface Course {
  id: string
  title: string
  category: 'foundation' | 'construction' | 'logistics' | 'community'
  description: string
  duration: string
  skills: string[]
  active: boolean
}

export interface Module {
  id: string
  course_id: string
  title: string
  order: number
  description: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  order: number
  content: string
  lesson_type: 'language' | 'safety' | 'skills' | 'practical_prep'
  vocabulary_ids?: string[]
  quiz?: QuizQuestion[]
  competency_id?: string
  safety_critical?: boolean
}

export interface QuizQuestion {
  id: string
  prompt: string
  choices: string[]
  answer_index: number
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  status: 'active' | 'completed'
  enrolled_at: string
}

export interface Assignment {
  id: string
  course_id: string
  title: string
  description: string
  due_date: string
  created_by: string
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  content: string
  status: 'pending' | 'submitted' | 'graded'
  grade: number | null
  feedback: string
  submitted_at: string | null
  graded_at: string | null
}

export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  completed: boolean
  quiz_score: number | null
  completed_at: string | null
}

export interface VocabTerm {
  id: string
  english: string
  definition: string
  support_meaning: string
  sentence: string
  category: 'general' | 'construction' | 'safety'
  image_hint: string
}

export interface VocabAttempt {
  id: string
  student_id: string
  term_id: string
  layer: LanguageLayer
  correct: boolean
  at: string
}

export interface Competency {
  id: string
  title: string
  description: string
  category: string
  safety_critical: boolean
  version: string
  criteria: string[]
}

export interface LearnerCompetency {
  id: string
  student_id: string
  competency_id: string
  status: CompetencyStatus
  assessor_uid: string | null
  assessed_at: string | null
  notes: string
}

export interface EvidenceRecord {
  id: string
  student_id: string
  competency_id: string | null
  type: 'lesson' | 'quiz' | 'assignment' | 'practical' | 'vocab'
  source_id: string
  result: string
  created_at: string
  reviewer_uid: string | null
}

export interface SafetyGateState {
  id: string
  student_id: string
  gate_key: string
  status: SafetyGateStatus
  reason: string
  updated_at: string
  override_by: string | null
}

export interface PracticalObservation {
  id: string
  student_id: string
  competency_id: string
  assessor_uid: string
  ratings: Record<string, RubricRating>
  outcome: CompetencyStatus
  notes: string
  created_at: string
}

export interface Notification {
  id: string
  user_uid: string
  title: string
  body: string
  read: boolean
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  audience: 'all' | 'students' | 'instructors'
  created_at: string
}

export interface AuditEvent {
  id: string
  actor_uid: string
  action: string
  target: string
  previous_value: string
  new_value: string
  reason: string
  at: string
}

export interface ScheduleItem {
  id: string
  course_id: string
  title: string
  starts_at: string
  location: string
  instructor_uid: string
}

export interface AppDatabase {
  users: User[]
  students: Student[]
  instructors: Instructor[]
  courses: Course[]
  modules: Module[]
  lessons: Lesson[]
  enrollments: Enrollment[]
  assignments: Assignment[]
  submissions: Submission[]
  lesson_progress: LessonProgress[]
  vocab_terms: VocabTerm[]
  vocab_attempts: VocabAttempt[]
  competencies: Competency[]
  learner_competencies: LearnerCompetency[]
  evidence_records: EvidenceRecord[]
  safety_gate_states: SafetyGateState[]
  practical_observations: PracticalObservation[]
  notifications: Notification[]
  announcements: Announcement[]
  audit_events: AuditEvent[]
  schedules: ScheduleItem[]
}
