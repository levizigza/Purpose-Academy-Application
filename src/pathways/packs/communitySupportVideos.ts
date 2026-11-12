/**
 * Community Support video lessons.
 * Source: Purpose Academy Community Support rebuilt videos and Q&A.
 * Fourteen captioned lessons. Awareness and phrase practice — not clinical authorization.
 */

export type CommunitySupportFamilyId =
  | 'meet'
  | 'privacy'
  | 'safety'
  | 'visit'
  | 'daily'
  | 'notes'
  | 'handover'

export type CommunitySupportLesson = {
  id: string
  n: number
  title: string
  family: CommunitySupportFamilyId
  familyLabel: string
  /** File under public/media/community-support/ */
  file: string
  posterKey?: string
  purpose: string
  know: string
  inspect: string
  protect: string
  poweredStayClear?: boolean
  /** Source note shown under the player, when the lesson uses outside footage. */
  note?: string
}

export const COMMUNITY_SUPPORT_FAMILIES: {
  id: CommunitySupportFamilyId
  label: string
  blurb: string
}[] = [
  { id: 'meet', label: 'Meet and explain', blurb: 'Welcome someone and check they understood one step.' },
  { id: 'privacy', label: 'Privacy and choice', blurb: 'Ask before you share, and leave the choice with the person.' },
  { id: 'safety', label: 'Calm and safety', blurb: 'Stay calm, then report a safety concern the right way.' },
  { id: 'visit', label: 'Visits and clean hands', blurb: 'Plan a safe visit, and clean your hands before the next task.' },
  { id: 'daily', label: 'Daily tasks', blurb: 'Follow the person\'s plan, then book a clear appointment.' },
  { id: 'notes', label: 'Notes and services', blurb: 'Write only what you saw, then connect the person to a service.' },
  { id: 'handover', label: 'Activities and handover', blurb: 'Plan something people can join, then hand over the facts.' },
]

export const COMMUNITY_SUPPORT_VIDEOS: CommunitySupportLesson[] = [
  {
    id: 'cs-v01',
    n: 1,
    title: 'A helpful first meeting',
    family: 'meet',
    familyLabel: 'Meet and explain',
    file: 'CS-V01_A_helpful_first_meeting.mp4',
    purpose: 'Welcome a visitor, agree one next step, and recognize a task outside your role.',
    know: 'Introduces self and role.',
    inspect: 'Asks the visitor\'s goal and listens.',
    protect: 'Agrees who will act and when.',
  },
  {
    id: 'cs-v02',
    n: 2,
    title: 'Explain one step and check understanding',
    family: 'meet',
    familyLabel: 'Meet and explain',
    file: 'CS-V02_Explain_one_step_and_check_understanding.mp4',
    purpose: 'Give a short instruction, check your explanation, and arrange language support.',
    know: 'Offers a suitable communication choice.',
    inspect: 'Uses simple words and one step at a time.',
    protect: 'Explains again respectfully when needed.',
  },
  {
    id: 'cs-v03',
    n: 3,
    title: 'Ask before sharing information',
    family: 'privacy',
    familyLabel: 'Privacy and choice',
    file: 'CS-V03_Ask_before_sharing_information.mp4',
    purpose: 'Explain a routine referral, check permission, and respond when permission changes.',
    know: 'Explains recipient, details and purpose.',
    inspect: 'Checks understanding and free choice.',
    protect: 'Uses the consent and secure-sharing process.',
  },
  {
    id: 'cs-v04',
    n: 4,
    title: 'Help the person choose and take part',
    family: 'privacy',
    familyLabel: 'Privacy and choice',
    file: 'CS-V04_Help_the_person_choose_and_take_part.mp4',
    purpose: 'Find an access barrier and agree useful support without taking over.',
    know: 'Asks the person\'s goal.',
    inspect: 'Identifies an environmental barrier.',
    protect: 'Supports the agreed part without taking over.',
  },
  {
    id: 'cs-v05',
    n: 5,
    title: 'Support someone who feels upset',
    family: 'safety',
    familyLabel: 'Calm and safety',
    file: 'CS-V05_Support_someone_who_feels_upset.mp4',
    purpose: 'Offer calm, predictable choices and get help when a situation becomes unsafe.',
    know: 'Uses a calm voice and gives space.',
    inspect: 'Offers a real choice.',
    protect: 'Identifies when to leave and get urgent help.',
  },
  {
    id: 'cs-v06',
    n: 6,
    title: 'Listen and report a safety concern',
    family: 'safety',
    familyLabel: 'Calm and safety',
    file: 'CS-V06_Listen_and_report_a_safety_concern.mp4',
    purpose: 'Respond to a disclosure, make the required report, and distinguish emergency, child and covered-adult routes.',
    know: 'Selects 911 for immediate danger.',
    inspect: 'Makes the required child report directly.',
    protect: 'Uses factual secure notes without investigating.',
  },
  {
    id: 'cs-v07',
    n: 7,
    title: 'Plan a safe community visit',
    family: 'visit',
    familyLabel: 'Visits and clean hands',
    file: 'CS-V07_Plan_a_safe_community_visit.mp4',
    purpose: 'Check the visit plan, arrange check-ins, and stop when conditions are unsafe.',
    know: 'Checks route, access and current conditions.',
    inspect: 'Names a check-in contact and response plan.',
    protect: 'Updates the plan when the destination changes.',
  },
  {
    id: 'cs-v08',
    n: 8,
    title: 'Clean your hands before the next task',
    family: 'visit',
    familyLabel: 'Visits and clean hands',
    file: 'CS-V08_Clean_your_hands_before_the_next_task.mp4',
    purpose: 'Choose soap or sanitizer appropriately and demonstrate complete hand cleaning.',
    know: 'Cleans all taught surfaces on both hands.',
    inspect: 'Rubs with soap for at least twenty seconds.',
    protect: 'Explains the missing-supplies response.',
    note: 'Handwashing close-ups: Source CDC, edited from “Fight Germs. Wash Your Hands!” (2016). CDC does not endorse this course.',
  },
  {
    id: 'cs-v09',
    n: 9,
    title: 'Help with a daily task safely',
    family: 'daily',
    familyLabel: 'Daily tasks',
    file: 'CS-V09_Help_with_a_daily_task_safely.mp4',
    purpose: 'Follow the person\'s plan and wishes, check a food concern, and refer tasks outside training.',
    know: 'Checks the current plan and asks the person.',
    inspect: 'Leaves agreed tasks with the person.',
    protect: 'Refers transfers and medicine decisions appropriately.',
  },
  {
    id: 'cs-v10',
    n: 10,
    title: 'Book a clear first appointment',
    family: 'daily',
    familyLabel: 'Daily tasks',
    file: 'CS-V10_Book_a_clear_first_appointment.mp4',
    purpose: 'Collect necessary details and confirm date, time, place, access and safe contact.',
    know: 'Explains why necessary details are collected.',
    inspect: 'Confirms clear date, time and place.',
    protect: 'Updates the record and confirms a change is received.',
  },
  {
    id: 'cs-v11',
    n: 11,
    title: 'Write a short, factual work note',
    family: 'notes',
    familyLabel: 'Notes and services',
    file: 'CS-V11_Write_a_short_factual_work_note.mp4',
    purpose: 'Record observations, exact words, actions and follow-up without guessing.',
    know: 'Separates facts from opinions.',
    inspect: 'Uses quotes only for exact words.',
    protect: 'Corrects and stores the note through the approved process.',
  },
  {
    id: 'cs-v12',
    n: 12,
    title: 'Connect someone to a useful service',
    family: 'notes',
    familyLabel: 'Notes and services',
    file: 'CS-V12_Connect_someone_to_a_useful_service.mp4',
    purpose: 'Check a service with the person, support an agreed contact, and follow up.',
    know: 'Checks need, urgency and current service details.',
    inspect: 'Keeps the person involved in choosing.',
    protect: 'Records an owner, time and safe follow-up method.',
  },
  {
    id: 'cs-v13',
    n: 13,
    title: 'Plan an activity people can join',
    family: 'handover',
    familyLabel: 'Activities and handover',
    file: 'CS-V13_Plan_an_activity_people_can_join.mp4',
    purpose: 'Plan around participant choices, remove barriers, assign safe tasks and check the result.',
    know: 'Uses participant interests and choices.',
    inspect: 'Checks access and privacy, including separate photo permission.',
    protect: 'Checks the budget and records a useful improvement.',
  },
  {
    id: 'cs-v14',
    n: 14,
    title: 'Give a clear handover and ask for feedback',
    family: 'handover',
    familyLabel: 'Activities and handover',
    file: 'CS-V14_Give_a_clear_handover_and_ask_for_feedback.mp4',
    purpose: 'Pass on necessary facts and next actions to an authorized worker, and confirm urgent communication.',
    know: 'Shares only necessary information with an authorized worker.',
    inspect: 'Gives facts and completed actions.',
    protect: 'Uses urgent routes and applies specific feedback.',
  },
]

export function communitySupportVideoUrl(file: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}media/community-support/${file}`
}
