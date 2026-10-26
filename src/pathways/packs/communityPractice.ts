/**
 * Community Support Foundations practice layers aligned to Community Visual Vocabulary.
 * Eye Spy uses the same clear-all mold as Construction / Logistics (ten boards).
 * termIds / hotspot ids match community-NNN; imageKeys use com-vv-NNN object photos
 * (role→workplace cue remasters) or remastered com-* keys when titles match.
 */
import type { EyeSpyScene } from '../../student/journeyCurriculum'
import { hint } from '../packHelpers'
import type { WordAction, WorkplaceInstruction } from '../types'

/** Level-1 people / roles + core support words drive Word → Action. */
export const COMMUNITY_WORD_ACTIONS: WordAction[] = [
  { id: 'wa-volunteer', termId: 'community-001', title: 'Volunteer in action', body: 'Arrive on time. Follow the agency rules. Help only with tasks you were trained for.', actionCue: 'On time. Follow rules. Stay in role.' },
  { id: 'wa-social-worker', termId: 'community-002', title: 'Social worker awareness', body: 'Listen carefully. Write clear notes. Escalate worries to a supervisor when you are unsure.', actionCue: 'Listen. Clear notes. Escalate when unsure.' },
  { id: 'wa-caregiver', termId: 'community-003', title: 'Caregiver in action', body: 'Ask before you help with personal care. Protect privacy. Follow the support plan.', actionCue: 'Ask first. Protect privacy. Follow the plan.' },
  { id: 'wa-counsellor', termId: 'community-004', title: 'Counsellor awareness', body: 'Keep conversations private. Do not share details in public spaces.', actionCue: 'Private talk. No public sharing.' },
  { id: 'wa-mentor', termId: 'community-005', title: 'Mentor in action', body: 'Share experience with respect. Let the person make their own choices.', actionCue: 'Respect. Guide. Leave choice with them.' },
  { id: 'wa-facilitator', termId: 'community-006', title: 'Facilitator in action', body: 'Give everyone a turn to speak. Keep the group discussion on topic.', actionCue: 'Equal turns. Stay on topic.' },
  { id: 'wa-coordinator', termId: 'community-007', title: 'Coordinator in action', body: 'Check the schedule. Confirm times with the team before the outing.', actionCue: 'Check schedule. Confirm times.' },
  { id: 'wa-advocate', termId: 'community-009', title: 'Advocate in action', body: 'Speak up for the person\'s rights. Use calm, clear English with staff and families.', actionCue: 'Rights first. Calm clear English.' },
  { id: 'wa-outreach', termId: 'community-016', title: 'Outreach worker in action', body: 'Meet people where they are. Offer support without pressure.', actionCue: 'Meet people where they are. No pressure.' },
  { id: 'wa-caseworker', termId: 'community-017', title: 'Caseworker in action', body: 'Follow the case notes. Update only what you observed. Keep files secure.', actionCue: 'Follow notes. Observed facts. Secure files.' },
  { id: 'wa-support-staff', termId: 'community-019', title: 'Support staff in action', body: 'Wear your name badge. Ask for help when a task is outside your training.', actionCue: 'Badge on. Ask when unsure.' },
  { id: 'wa-supervisor', termId: 'community-020', title: 'Supervisor check-in', body: 'Report safety concerns to your supervisor the same day. Do not wait.', actionCue: 'Same-day report. Do not wait.' },
  { id: 'wa-hygiene', termId: 'community-087', title: 'Hygiene in action', body: 'Wash or sanitize your hands before and after support tasks.', actionCue: 'Clean hands before and after.' },
  { id: 'wa-consent', termId: 'community-413', title: 'Consent in action', body: 'Check consent before you enter a private space or start a support task.', actionCue: 'Consent first. Then begin.' },
  { id: 'wa-barrier', termId: 'community-178', title: 'Barrier awareness', body: 'Name the barrier clearly. Ask what support would help the person access the service.', actionCue: 'Name the barrier. Ask what helps.' },
  { id: 'wa-community-service', termId: 'community-495', title: 'Community service in action', body: 'Show up ready to help. Finish the assigned task. Leave the space better than you found it.', actionCue: 'Show up ready. Finish the task. Leave it better.' },
]

const CLEAR_ALL =
  'Identify every item in this scene. Tap the picture that matches the English word. Found items stay marked until the board is clear.'

function spot(
  id: string,
  label: string,
  imageKey: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  return { id, label, answer: label, imageKey, x, y, w, h }
}

/** Ten boards. Each scene must be cleared item-by-item (word → picture). */
export const COMMUNITY_EYE_SPY_SCENES: EyeSpyScene[] = [
  {
    id: 'support-team',
    title: 'Support team',
    instruction: CLEAR_ALL,
    findOrder: ['community-001', 'community-002', 'community-003', 'community-020'],
    hotspots: [
      spot('community-001', 'Volunteer', 'com-vv-001', 10, 14, 24, 30),
      spot('community-002', 'Social worker', 'com-vv-002', 66, 12, 26, 30),
      spot('community-003', 'Caregiver', 'com-vv-003', 12, 52, 26, 30),
      spot('community-020', 'Supervisor', 'com-vv-020', 56, 50, 28, 30),
    ],
  },
  {
    id: 'guidance-circle',
    title: 'Guidance circle',
    instruction: CLEAR_ALL,
    findOrder: ['community-004', 'community-005', 'community-006', 'community-009'],
    hotspots: [
      spot('community-004', 'Counsellor', 'com-vv-004', 12, 12, 24, 30),
      spot('community-005', 'Mentor', 'com-vv-005', 66, 14, 24, 28),
      spot('community-006', 'Facilitator', 'com-vv-006', 14, 52, 26, 30),
      spot('community-009', 'Advocate', 'com-vv-009', 56, 50, 28, 30),
    ],
  },
  {
    id: 'agency-desk',
    title: 'Agency desk',
    instruction: CLEAR_ALL,
    findOrder: ['community-007', 'community-011', 'community-017', 'community-019'],
    hotspots: [
      spot('community-007', 'Coordinator', 'com-vv-007', 10, 14, 24, 30),
      spot('community-011', 'Assistant', 'com-vv-011', 66, 12, 26, 30),
      spot('community-017', 'Caseworker', 'com-vv-017', 12, 52, 26, 30),
      spot('community-019', 'Support staff', 'com-vv-019', 56, 50, 28, 30),
    ],
  },
  {
    id: 'health-outreach',
    title: 'Health outreach',
    instruction: CLEAR_ALL,
    findOrder: ['community-014', 'community-015', 'community-016', 'community-013'],
    hotspots: [
      spot('community-014', 'Nurse', 'com-vv-014', 10, 14, 24, 30),
      spot('community-015', 'Health worker', 'com-vv-015', 66, 12, 26, 30),
      spot('community-016', 'Outreach worker', 'com-vv-016', 12, 52, 28, 30),
      spot('community-013', 'Educator', 'com-vv-013', 56, 50, 28, 30),
    ],
  },
  {
    id: 'learning-team',
    title: 'Learning team',
    instruction: CLEAR_ALL,
    findOrder: ['community-012', 'community-008', 'community-010', 'community-018'],
    hotspots: [
      spot('community-012', 'Trainer', 'com-vv-012', 10, 14, 24, 30),
      spot('community-008', 'Organizer', 'com-vv-008', 66, 12, 26, 30),
      spot('community-010', 'Leader', 'com-vv-010', 12, 52, 26, 30),
      spot('community-018', 'Mediator', 'com-vv-018', 56, 50, 28, 30),
    ],
  },
  {
    id: 'access-and-dignity',
    title: 'Access and dignity',
    instruction: CLEAR_ALL,
    findOrder: ['community-087', 'community-413', 'community-177', 'community-178'],
    hotspots: [
      spot('community-087', 'Hygiene', 'com-hygiene', 10, 14, 24, 30),
      spot('community-413', 'Consent', 'com-consent', 66, 12, 26, 30),
      spot('community-177', 'Challenge', 'com-vv-177', 12, 52, 26, 30),
      spot('community-178', 'Barrier', 'com-vv-178', 56, 50, 28, 30),
    ],
  },
  {
    id: 'solutions-desk',
    title: 'Solutions desk',
    instruction: CLEAR_ALL,
    findOrder: ['community-179', 'community-180', 'community-175', 'community-495'],
    hotspots: [
      spot('community-179', 'Solution', 'com-vv-179', 10, 14, 24, 30),
      spot('community-180', 'Strategy', 'com-vv-180', 66, 12, 26, 30),
      spot('community-175', 'Awareness day', 'com-vv-175', 12, 52, 28, 30),
      spot('community-495', 'Community service', 'com-vv-495', 54, 50, 30, 30),
    ],
  },
  {
    id: 'community-places',
    title: 'Community places',
    instruction: CLEAR_ALL,
    findOrder: ['community-043', 'community-044', 'community-045', 'community-046'],
    hotspots: [
      spot('community-043', 'Shelter', 'com-vv-043', 10, 14, 24, 30),
      spot('community-044', 'Clinic', 'com-vv-044', 66, 12, 26, 30),
      spot('community-045', 'School', 'com-vv-045', 12, 52, 26, 30),
      spot('community-046', 'Program', 'com-vv-046', 54, 50, 30, 30),
    ],
  },
  {
    id: 'daily-support',
    title: 'Daily support',
    instruction: CLEAR_ALL,
    findOrder: ['community-051', 'community-052', 'community-055', 'community-059'],
    hotspots: [
      spot('community-051', 'Support', 'com-vv-051', 10, 14, 24, 30),
      spot('community-052', 'Assistance', 'com-vv-052', 66, 12, 26, 30),
      spot('community-055', 'Outreach', 'com-vv-055', 12, 52, 26, 30),
      spot('community-059', 'Inclusion', 'com-vv-059', 56, 50, 28, 30),
    ],
  },
  {
    id: 'service-close',
    title: 'Service close',
    instruction: CLEAR_ALL,
    findOrder: ['community-494', 'community-496', 'community-258', 'community-049'],
    hotspots: [
      spot('community-494', 'Public initiative', 'com-vv-494', 10, 14, 28, 30),
      spot('community-496', 'Social responsibility', 'com-vv-496', 64, 12, 28, 30),
      spot('community-258', 'Clean-up campaign', 'com-vv-258', 12, 52, 30, 30),
      spot('community-049', 'Initiative', 'com-vv-049', 56, 50, 28, 30),
    ],
  },
]

/** Workplace instruction checks — specialty words from Community VV sentences. */
export const COMMUNITY_WORKPLACE_INSTRUCTIONS: WorkplaceInstruction[] = [
  {
    text: 'Ask before you help with personal care.',
    correct: 'Ask before you help with personal care',
    imageKey: 'com-vv-003',
    options: [
      'Ask before you help with personal care',
      'Start care without asking',
      'Share details in the hallway',
      'Skip the support plan',
    ],
    supportHint: hint(
      'Ask before you help with personal care.',
      'Pregunta antes de ayudar con el cuidado personal.',
      'اسأل قبل أن تساعد في الرعاية الشخصية.',
      'निजी देखभाल में मदद से पहले पूछो।',
      'ከግል እንክብካቤ እርዳታ በፊት ጠይቁ።',
      'ቅድሚ ሓገዝ ናይ ውልቃዊ ክንክን ሕተቱ።',
    ),
  },
  {
    text: 'Check consent before you enter a private space.',
    correct: 'Check consent before you enter a private space',
    imageKey: 'com-consent',
    options: [
      'Check consent before you enter a private space',
      'Walk in without knocking',
      'Leave the door open for others',
      'Post photos of the visit',
    ],
    supportHint: hint(
      'Check consent before you enter a private space.',
      'Verifica el consentimiento antes de entrar a un espacio privado.',
      'تحقق من الموافقة قبل دخول مكان خاص.',
      'निजी जगह में प्रवेश से पहले सहमति जाँचो।',
      'ወደ የግል ቦታ ከመግባትዎ በፊት ፈቃድ ያረጋግጡ።',
      'ቅድሚ ናብ ውልቃዊ ቦታ ምእታው ፍቓድ ኣረጋግጹ።',
    ),
  },
  {
    text: 'Wash your hands before and after the support task.',
    correct: 'Wash your hands before and after the support task',
    imageKey: 'com-hygiene',
    options: [
      'Wash your hands before and after the support task',
      'Skip washing if you are busy',
      'Use the same gloves all day',
      'Only wash at the end of the week',
    ],
    supportHint: hint(
      'Wash your hands before and after the support task.',
      'Lávate las manos antes y después de la tarea de apoyo.',
      'اغسل يديك قبل وبعد مهمة الدعم.',
      'सहायता कार्य से पहले और बाद में हाथ धोओ।',
      'የድጋፍ ሥራ ከመጀመርዎ በፊትና በኋላ እጆችዎን ይታጠቡ።',
      'ቅድሚን ድሕሪን ናይ ድጋፍ ስራሕ ኢድኩም ተሓጸቡ።',
    ),
  },
  {
    text: 'Report a safety concern to your supervisor the same day.',
    correct: 'Report a safety concern to your supervisor the same day',
    imageKey: 'com-vv-020',
    options: [
      'Report a safety concern to your supervisor the same day',
      'Wait until next month',
      'Ignore the concern',
      'Post it on social media',
    ],
    supportHint: hint(
      'Report a safety concern to your supervisor the same day.',
      'Informa una preocupación de seguridad a tu supervisor el mismo día.',
      'أبلغ مشرفك عن مصدر قلق يتعلق بالسلامة في نفس اليوم.',
      'सुरक्षा चिंता उसी दिन पर्यवेक्षक को बताओ।',
      'የደህንነት ስጋትን በተመሳሳይ ቀን ለተቆጣጣሪዎ ያሳውቁ።',
      'ናይ ድሕንነት ሻቕሎት ኣብቲ መዓልቲ ንተቖጻጻሪኹም ኣፍልጡ።',
    ),
  },
  {
    text: 'Follow the support plan for today’s visit.',
    correct: 'Follow the support plan for today’s visit',
    imageKey: 'com-support-plan',
    options: [
      'Follow the support plan for today’s visit',
      'Invent your own plan',
      'Skip the written goals',
      'Change medication without training',
    ],
    supportHint: hint(
      'Follow the support plan for today’s visit.',
      'Sigue el plan de apoyo para la visita de hoy.',
      'اتبع خطة الدعم لزيارة اليوم.',
      'आज की मुलाकात के लिए सहायता योजना का पालन करो।',
      'የዛሬውን ጉብኝት የድጋፍ እቅድ ይከተሉ።',
      'ናይ ሎሚ ምብጻሕ ናይ ድጋፍ ውጥን ተኸተሉ።',
    ),
  },
  {
    text: 'Keep private information out of public conversations.',
    correct: 'Keep private information out of public conversations',
    imageKey: 'com-vv-004',
    options: [
      'Keep private information out of public conversations',
      'Talk about clients in the elevator',
      'Leave notes on a café table',
      'Share passwords with coworkers',
    ],
    supportHint: hint(
      'Keep private information out of public conversations.',
      'Mantén la información privada fuera de conversaciones públicas.',
      'أبقِ المعلومات الخاصة خارج المحادثات العامة.',
      'निजी जानकारी सार्वजनिक बातचीत से बाहर रखो।',
      'የግል መረጃን ከሕዝብ ውይይት ውጭ ያቆዩ።',
      'ውልቃዊ ሓበሬታ ካብ ሕዝባዊ ዘተ ኣርሕቁ።',
    ),
  },
]
