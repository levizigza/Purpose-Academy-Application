import type { StreamDoc, StreamStep } from './instructorCurricula'

const TRADE_CHOICES = ['Interior Finishing', 'Exterior Finishing', 'Framing and Cabinetry']

/** A hours split is a note for the week, not a block the instructor has to teach. */
export function hoursAside(steps: StreamStep[]): StreamStep | null {
  return steps.find((step) => step.label.trim().toLowerCase() === 'suggested hours') || null
}

export function teachBlocks(steps: StreamStep[]): StreamStep[] {
  return steps.filter((step) => step.label.trim().toLowerCase() !== 'suggested hours')
}

/** Month 6 and 7 offer three trades. The group stays in one of them. */
export function isTradeChoice(steps: StreamStep[]): boolean {
  const blocks = teachBlocks(steps)
  if (blocks.length !== TRADE_CHOICES.length) return false
  const labels = blocks.map((step) => step.label.trim())
  return TRADE_CHOICES.every((name) => labels.includes(name))
}

export type PaperRole = 'plan' | 'teach' | 'evidence' | 'exam'

/** Which part of the week a faculty paper belongs to. */
export function paperRole(doc: StreamDoc): PaperRole {
  const title = doc.title.toLowerCase()
  if (/exam/.test(title)) return 'exam'
  if (/checklist|marking|answer key/.test(title)) return 'evidence'
  if (/plan|binder|eight-month|curriculum/.test(title)) return 'plan'
  return 'teach'
}

export function papersByRole(docs: StreamDoc[]) {
  return {
    plan: docs.filter((doc) => paperRole(doc) === 'plan'),
    teach: docs.filter((doc) => paperRole(doc) === 'teach'),
    evidence: docs.filter((doc) => paperRole(doc) === 'evidence'),
    exam: docs.filter((doc) => paperRole(doc) === 'exam'),
  }
}

/** Month assessment lines such as "Listening 25%." stay as written. */
export function successCriteria(assessment: string): string[] {
  const parts = assessment
    .split(/\.\s+/)
    .map((item) => item.replace(/\.$/, '').trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : [assessment.trim()]
}

/**
 * Logistics days are already written as Instruction / Practice / Evidence.
 * Leave other faculties' blocks whole.
 */
export function splitDayMove(text: string): { model: string; practise: string; evidence: string } | null {
  if (!/Instruction:/i.test(text) || !/Practice:/i.test(text)) return null
  const model = (text.match(/Instruction:\s*([\s\S]*?)(?=\s*Practice:)/i) || [])[1]?.trim() || ''
  const practise = (text.match(/Practice:\s*([\s\S]*?)(?=\s*Evidence:|$)/i) || [])[1]?.trim() || ''
  const evidence = (text.match(/Evidence:\s*([\s\S]*)$/i) || [])[1]?.trim() || ''
  if (!model && !practise) return null
  return { model, practise, evidence }
}
