import type { PathwayId, PathwayPack } from './types'
import { constructionPack } from './packs/construction'
import { logisticsPack } from './packs/logistics'
import { communityPack } from './packs/community'
import { getActivePathway } from './session'
import { JOURNEY_STEPS } from '../student/journeyCurriculum'

const PACKS: Record<PathwayId, PathwayPack> = {
  construction: constructionPack,
  logistics: logisticsPack,
  community: communityPack,
}

export function getPathwayPack(id: PathwayId = getActivePathway()): PathwayPack {
  return PACKS[id] || constructionPack
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

export { PACKS }
