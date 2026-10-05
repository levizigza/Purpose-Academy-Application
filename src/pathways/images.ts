/**
 * Pathway visual resolver.
 * Construction keeps photo-quality tool images.
 * Logistics / Community use clear labeled SVG cards until dedicated photos land.
 */
import { toolImage as constructionToolImage } from '../student/toolImages'

const LABEL: Record<string, { title: string; tone: string; mark: string }> = {
  'log-pallet': { title: 'Pallet', tone: '#3d8f6e', mark: 'PL' },
  'log-scanner': { title: 'Scanner', tone: '#2f6f55', mark: 'SC' },
  'log-label': { title: 'Shipping label', tone: '#4ea37f', mark: 'LB' },
  'log-vest': { title: 'Safety vest', tone: '#e8a317', mark: 'SV' },
  'log-dolly': { title: 'Hand truck', tone: '#356f58', mark: 'HT' },
  'log-manifest': { title: 'Manifest', tone: '#245844', mark: 'MF' },
  'log-rack': { title: 'Storage rack', tone: '#1d4637', mark: 'RK' },
  'com-badge': { title: 'Name badge', tone: '#7c5cbf', mark: 'NB' },
  'com-clipboard': { title: 'Clipboard', tone: '#6347a0', mark: 'CB' },
  'com-first-aid': { title: 'First aid kit', tone: '#c44b4b', mark: 'FA' },
  'com-gloves': { title: 'Protective gloves', tone: '#5b8fd6', mark: 'GL' },
  'com-schedule': { title: 'Schedule', tone: '#6b57b0', mark: 'SCH' },
  'com-phone': { title: 'Work phone', tone: '#4d3d8c', mark: 'PH' },
  'com-welcome': { title: 'Welcome desk', tone: '#8a6fd0', mark: 'WD' },
}

const svgCache = new Map<string, string>()

function svgCard(key: string): string {
  const cached = svgCache.get(key)
  if (cached) return cached
  const meta = LABEL[key]
  if (!meta) return ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b121c"/>
      <stop offset="100%" stop-color="${meta.tone}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="480" rx="28" fill="url(#g)"/>
  <rect x="48" y="48" width="544" height="384" rx="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" stroke-width="3"/>
  <circle cx="320" cy="200" r="78" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" stroke-width="3"/>
  <text x="320" y="214" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="42" font-weight="800" fill="#fff">${meta.mark}</text>
  <text x="320" y="330" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-size="36" font-weight="700" fill="#fff">${meta.title}</text>
  <text x="320" y="372" text-anchor="middle" font-family="Source Sans 3, Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.72)">Purpose Academy</text>
</svg>`
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  svgCache.set(key, url)
  return url
}

/** Resolve an image for any pathway vocab / quiz / Eye Spy key. */
export function pathwayImage(key?: string | null): string | undefined {
  if (!key) return undefined
  const fromConstruction = constructionToolImage(key)
  if (fromConstruction) return fromConstruction
  if (key in LABEL) return svgCard(key)
  return undefined
}
