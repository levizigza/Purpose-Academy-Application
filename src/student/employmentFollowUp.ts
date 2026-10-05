/**
 * Employment follow-up — Purpose Academy mold (chart step 20).
 * Training does not end at graduation: 30 / 90 / 180 day check-ins
 * measure whether graduates enter and remain in work.
 */

export type FollowUpDay = 30 | 90 | 180

export type FollowUpStatus = 'scheduled' | 'completed' | 'missed' | 'employed' | 'seeking'

export type FollowUpCheckIn = {
  day: FollowUpDay
  /** ISO date the check-in is due (from path completion). */
  dueAt: string
  status: FollowUpStatus
  notes: string
  completedAt?: string
}

export type EmploymentFollowUp = {
  pathway: string
  roleGoal: string
  availability: string
  completedAt: string
  checkIns: FollowUpCheckIn[]
}

const KEY = 'pa-employment-followup-v1'

function addDays(iso: string, days: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function createFollowUpPlan(input: {
  pathway: string
  roleGoal: string
  availability: string
}): EmploymentFollowUp {
  const completedAt = new Date().toISOString()
  return {
    pathway: input.pathway,
    roleGoal: input.roleGoal,
    availability: input.availability,
    completedAt,
    checkIns: ([30, 90, 180] as FollowUpDay[]).map((day) => ({
      day,
      dueAt: addDays(completedAt, day),
      status: 'scheduled',
      notes: '',
    })),
  }
}

export function loadFollowUp(): EmploymentFollowUp | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as EmploymentFollowUp
  } catch {
    return null
  }
}

export function saveFollowUp(plan: EmploymentFollowUp) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(plan))
    window.dispatchEvent(new CustomEvent('pa-employment-followup-changed'))
  } catch {
    /* ignore */
  }
}

export function updateCheckIn(
  day: FollowUpDay,
  patch: Partial<Pick<FollowUpCheckIn, 'status' | 'notes'>>,
): EmploymentFollowUp | null {
  const plan = loadFollowUp()
  if (!plan) return null
  const next: EmploymentFollowUp = {
    ...plan,
    checkIns: plan.checkIns.map((c) =>
      c.day === day
        ? {
            ...c,
            ...patch,
            completedAt:
              patch.status && patch.status !== 'scheduled'
                ? new Date().toISOString()
                : c.completedAt,
          }
        : c,
    ),
  }
  saveFollowUp(next)
  return next
}

export function followUpSummary(plan: EmploymentFollowUp | null) {
  if (!plan) {
    return { label: 'Not started', employed: false, nextDue: null as FollowUpCheckIn | null }
  }
  const employed = plan.checkIns.some((c) => c.status === 'employed')
  const nextDue =
    plan.checkIns.find((c) => c.status === 'scheduled') ??
    plan.checkIns.find((c) => c.status === 'missed') ??
    null
  if (employed) return { label: 'In work · follow-up active', employed: true, nextDue }
  if (nextDue) return { label: `Next check-in: day ${nextDue.day}`, employed: false, nextDue }
  return { label: 'Follow-up complete', employed: false, nextDue: null }
}
