import type { StreamDoc } from './instructorCurricula'

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
