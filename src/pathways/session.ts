import { learnerGet, learnerRemove, learnerSet } from '../practice/learnerStore'
import type { PathwayId } from './types'
import { isPathwayOpen } from './meta'

const PATHWAY_KEY = 'pa-active-pathway-v1'
const RECOMMENDED_KEY = 'pa-recommended-pathway-v1'

function parsePathway(raw: string | null): PathwayId | null {
  if (raw === 'construction' || raw === 'logistics' || raw === 'community') return raw
  return null
}

/** Pathway the learner is currently training in (enrolled / practice). */
export function getActivePathway(): PathwayId {
  try {
    const stored = parsePathway(learnerGet(PATHWAY_KEY))
    if (stored && isPathwayOpen(stored)) return stored
  } catch {
    /* ignore */
  }
  return 'construction'
}

export function setActivePathway(id: PathwayId) {
  try {
    learnerSet(PATHWAY_KEY, id)
    window.dispatchEvent(new CustomEvent('pa-pathway-changed', { detail: { pathway: id } }))
  } catch {
    /* ignore */
  }
}

/** Assessment recommendation (may differ from enrolled if a path was locked historically). */
export function getRecommendedPathway(): PathwayId | null {
  try {
    return parsePathway(learnerGet(RECOMMENDED_KEY))
  } catch {
    return null
  }
}

export function setRecommendedPathway(id: PathwayId) {
  try {
    learnerSet(RECOMMENDED_KEY, id)
  } catch {
    /* ignore */
  }
}

export function clearPathwaySession() {
  try {
    learnerRemove(PATHWAY_KEY)
    learnerRemove(RECOMMENDED_KEY)
  } catch {
    /* ignore */
  }
}
