import type { PathwayId, PathwayPack, PathwayUnitGoal } from './types'
import { constructionPack } from './packs/construction'
import { logisticsPack } from './packs/logistics'
import { communityPack } from './packs/community'
import { getActivePathway } from './session'
import { JOURNEY_STEPS, UNIT_GOALS, type HomeLang, type VocabTerm } from '../student/journeyCurriculum'
import { vocabOverridesFromActivePatch } from '../practice/changeLoop'

const PACKS: Record<PathwayId, PathwayPack> = {
  construction: constructionPack,
  logistics: logisticsPack,
  community: communityPack,
}

const GLOSS_KEY: Record<'am' | 'ti' | 'ar' | 'es' | 'hi', HomeLang> = {
  am: 'Amharic',
  ti: 'Tigrinya',
  ar: 'Arabic',
  es: 'Spanish',
  hi: 'Hindi',
}

function applyVocabPreview(pack: PathwayPack, pathway: PathwayId): PathwayPack {
  const overrides = vocabOverridesFromActivePatch(pathway)
  if (!overrides.length) return pack
  const vocab = pack.vocab.map((term: VocabTerm) => {
    const hit = overrides.find((o) => o.termId === term.id)
    if (!hit) return term
    const gloss = { ...term.gloss }
    if (hit.gloss) {
      for (const [code, value] of Object.entries(hit.gloss)) {
        const lang = GLOSS_KEY[code as keyof typeof GLOSS_KEY]
        if (lang && value) gloss[lang] = value
      }
    }
    return {
      ...term,
      english: hit.english || term.english,
      definition: hit.definition || term.definition,
      sentence: hit.sentence || term.sentence,
      imageKey: hit.imageKey || term.imageKey,
      gloss,
    }
  })
  return { ...pack, vocab }
}

export function getPathwayPack(id: PathwayId = getActivePathway()): PathwayPack {
  const base = PACKS[id] || constructionPack
  return applyVocabPreview(base, id)
}

/** Journey step copy with pathway-specific title/help/purpose overlays. */
export function getPathwayJourneySteps(id: PathwayId = getActivePathway()) {
  const pack = getPathwayPack(id)
  return JOURNEY_STEPS.map((step) => {
    const overlay = pack.stepTitles[step.n]
    if (!overlay) return step
    return {
      ...step,
      title: overlay.title ?? step.title,
      help: overlay.help ?? step.help,
      purpose: overlay.purpose ?? step.purpose,
    }
  })
}

export function getPathwayUnitGoal(unitId: number, id: PathwayId = getActivePathway()): PathwayUnitGoal | undefined {
  const pack = getPathwayPack(id)
  return pack.unitGoals?.[unitId] || UNIT_GOALS[unitId]
}

export { PACKS }
