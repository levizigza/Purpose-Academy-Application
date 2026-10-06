import { BRAND_ASSETS } from '../brand/assets'
import type { PathwayId, PathwayMeta } from './types'

export const PATHWAY_META: Record<PathwayId, PathwayMeta> = {
  construction: {
    id: 'construction',
    label: 'Construction',
    programTitle: 'Construction Foundations',
    tagline: 'Build Skills, Build Futures.',
    accent: '#e8a317',
    soft: 'rgba(232, 163, 23, 0.14)',
    courseId: 'course-construction',
    photo: 'photoConstruction',
    icon: 'iconConstruction',
    open: true,
  },
  logistics: {
    id: 'logistics',
    label: 'Logistics',
    programTitle: 'Logistics Foundations',
    tagline: 'Move People, Move Opportunities.',
    accent: '#3d8f6e',
    soft: 'rgba(61, 143, 110, 0.14)',
    courseId: 'course-logistics',
    photo: 'photoLogistics',
    icon: 'iconLogistics',
    open: true,
  },
  community: {
    id: 'community',
    label: 'Community Support',
    programTitle: 'Community Support Foundations',
    tagline: 'Help People. Strengthen Community.',
    accent: '#7c5cbf',
    soft: 'rgba(124, 92, 191, 0.14)',
    courseId: 'course-community',
    photo: 'photoCommunity',
    icon: 'iconCommunity',
    open: true,
  },
}

export const PATHWAY_ORDER: PathwayId[] = ['construction', 'logistics', 'community']

export function pathwayMeta(id: PathwayId): PathwayMeta {
  return PATHWAY_META[id]
}

export function pathwayPhoto(id: PathwayId): string {
  const meta = PATHWAY_META[id]
  return BRAND_ASSETS[meta.photo]
}

export function pathwayIcon(id: PathwayId): string {
  const meta = PATHWAY_META[id]
  return BRAND_ASSETS[meta.icon]
}

export function isPathwayOpen(id: PathwayId): boolean {
  return PATHWAY_META[id].open
}

export function courseIdForPathway(id: PathwayId): string {
  return PATHWAY_META[id].courseId
}
