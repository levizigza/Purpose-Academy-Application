/**
 * Yonas Community Support visual vocabulary workbook sets.
 *
 * Source: the shared Yonas Community Support folder, CSW1–CSW25 workbook pages
 * and CSWE1–CSWE25 picture checks. Images are optimized local copies in
 * public/workbooks/community/. The source sets are teaching material under
 * instructor review — not an accreditation claim and not a substitute for the
 * proposed eight-month curriculum.
 */

export type WorkbookCategory =
  | 'people'
  | 'communication'
  | 'daily'
  | 'safety'
  | 'community'
  | 'work'
  | 'health'

export type CommunityWorkbook = {
  n: number
  title: string
  /** Short, searchable description based on the first pictures on the page. */
  focus: string
  words: number
  category: WorkbookCategory
  /** Source worksheet name in the Yonas Drive folder. */
  source: string
}

export const WORKBOOK_SOURCE_FOLDER =
  'https://drive.google.com/drive/folders/1nIu2hLJbRsQLTSuZQoWkk9QD7lTu6wiP'

export const WORKBOOK_CATEGORIES: { id: WorkbookCategory; label: string }[] = [
  { id: 'people', label: 'People & roles' },
  { id: 'communication', label: 'Communication' },
  { id: 'daily', label: 'Daily living' },
  { id: 'safety', label: 'Safety' },
  { id: 'community', label: 'Community' },
  { id: 'work', label: 'Work & digital' },
  { id: 'health', label: 'Health' },
]

export const COMMUNITY_WORKBOOKS: readonly CommunityWorkbook[] = [
  {
    n: 1,
    title: 'People and Roles Vocabulary',
    focus: 'Client, participant, resident, individual and family',
    words: 20,
    category: 'people',
    source: 'CSW1',
  },
  {
    n: 2,
    title: 'People and Roles Visual Vocabulary',
    focus: 'Team, leader, manager, professional and specialist',
    words: 20,
    category: 'people',
    source: 'CSW2',
  },
  {
    n: 3,
    title: 'Communication, Education and Health Worker Visual Vocabulary',
    focus: 'Employer, employee, student, teacher and nurse',
    words: 20,
    category: 'people',
    source: 'CSW3',
  },
  {
    n: 4,
    title: 'Communication and Documentation Visual Vocabulary',
    focus: 'Message, explanation, instruction, direction and request',
    words: 20,
    category: 'communication',
    source: 'CSW4',
  },
  {
    n: 5,
    title: 'Communication, Interpretation and Support Skills Visual Vocabulary',
    focus: 'Report, note, translation, interpretation and vocabulary',
    words: 20,
    category: 'communication',
    source: 'CSW5',
  },
  {
    n: 6,
    title: 'Care and Support Visual Vocabulary',
    focus: 'Care, help, assistance, need and choice',
    words: 25,
    category: 'daily',
    source: 'CSW6',
  },
  {
    n: 7,
    title: 'Daily Living and Independence Skills Visual Vocabulary',
    focus: 'Cooking, cleaning, laundry, shopping and budgeting',
    words: 20,
    category: 'daily',
    source: 'CSW7',
  },
  {
    n: 8,
    title: 'Medical and Health Vocabulary',
    focus: 'Appointment, treatment, therapy and symptom',
    words: 20,
    category: 'health',
    source: 'CSW8',
  },
  {
    n: 9,
    title: 'Health and Wellness Vocabulary',
    focus: 'Healthy food, water, sleep, rest and hygiene',
    words: 20,
    category: 'health',
    source: 'CSW9',
  },
  {
    n: 10,
    title: 'Safety and Infection Control Vocabulary',
    focus: 'Safety, safe, hazard, risk and accident',
    words: 20,
    category: 'safety',
    source: 'CSW10',
  },
  {
    n: 11,
    title: 'Safety, Infection Control and Professional Practice Vocabulary',
    focus: 'Wash, disinfect, germ, virus and bacteria',
    words: 20,
    category: 'safety',
    source: 'CSW11',
  },
  {
    n: 12,
    title: 'Community Safety, Emergency Planning and Social Services Vocabulary',
    focus: 'Incident report, crisis, de-escalation and first aid kit',
    words: 20,
    category: 'safety',
    source: 'CSW12',
  },
  {
    n: 13,
    title: 'Community Resources and Services Vocabulary',
    focus: 'Housing, shelter, food bank, healthcare and transportation',
    words: 20,
    category: 'community',
    source: 'CSW13',
  },
  {
    n: 14,
    title: 'Community Services and Support Programs Vocabulary',
    focus: 'Senior, mental health, addiction, crisis and outreach services',
    words: 20,
    category: 'community',
    source: 'CSW14',
  },
  {
    n: 15,
    title: 'Housing and Daily Living Vocabulary',
    focus: 'Housing, home, apartment, room and bedroom',
    words: 20,
    category: 'daily',
    source: 'CSW15',
  },
  {
    n: 16,
    title: 'Housing, Utilities, Food and Daily Living Vocabulary',
    focus: 'Utility, electricity, water bill, heating and food',
    words: 20,
    category: 'daily',
    source: 'CSW16',
  },
  {
    n: 17,
    title: 'Mental Health and Emotions Vocabulary',
    focus: 'Mental health, emotion, feeling, emotional support and stress',
    words: 20,
    category: 'health',
    source: 'CSW17',
  },
  {
    n: 18,
    title: 'Mental Health and Coping Skills Vocabulary',
    focus: 'Coping, coping skill, resilience, motivation and behaviour',
    words: 20,
    category: 'health',
    source: 'CSW18',
  },
  {
    n: 19,
    title: 'Workplace and Job Skills Vocabulary',
    focus: 'Workplace, professionalism, responsibility, reliability and punctuality',
    words: 20,
    category: 'work',
    source: 'CSW19',
  },
  {
    n: 20,
    title: 'Workplace and Job Skills Vocabulary (Part 2)',
    focus: 'Break, supervisor, policy, procedure and code of conduct',
    words: 20,
    category: 'work',
    source: 'CSW20',
  },
  {
    n: 21,
    title: 'Documentation and Computer Skills Vocabulary',
    focus: 'Documentation, document, record, report and progress note',
    words: 20,
    category: 'work',
    source: 'CSW21',
  },
  {
    n: 22,
    title: 'Technology and Community Vocabulary',
    focus: 'Username, login, logout, email and Microsoft Word',
    words: 20,
    category: 'work',
    source: 'CSW22',
  },
  {
    n: 23,
    title: 'Culture, Diversity and Community Vocabulary',
    focus: 'Religion, tradition, custom, language barrier and cultural difference',
    words: 20,
    category: 'community',
    source: 'CSW23',
  },
  {
    n: 24,
    title: 'Employment and Career Vocabulary',
    focus: 'Employment, career, job, employer and employee',
    words: 20,
    category: 'work',
    source: 'CSW24',
  },
  {
    n: 25,
    title: 'Health, Mobility and Wellbeing Vocabulary',
    focus: 'Mobility, transfer, position, comfort and pain',
    words: 20,
    category: 'health',
    source: 'CSW25',
  },
]

export function workbookByNumber(n: number | undefined) {
  return COMMUNITY_WORKBOOKS.find((set) => set.n === n)
}

export function workbookSetLabel(n: number) {
  return `Set ${String(n).padStart(2, '0')}`
}

export function workbookImage(n: number, kind: 'workbook' | 'check' | 'thumb' = 'workbook') {
  const base = import.meta.env.BASE_URL || '/'
  const stem = kind === 'check' ? 'check' : 'csw'
  const suffix = kind === 'thumb' ? '-thumb' : ''
  return `${base}workbooks/community/${stem}-${String(n).padStart(2, '0')}${suffix}.webp`
}
