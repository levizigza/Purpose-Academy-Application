import { useEffect, useState } from 'react'
import { playFoley } from '../audio/foley'

/**
 * Play craft — Candy Crush–style clear joy without scoreboard fear.
 * Presentation only: never writes learning evidence. See docs/PLAY_CRAFT.md.
 */

const CLEARS_KEY = 'pa-play-clears-day-v1'

type ClearsDay = { day: string; count: number }

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function readBoardsClearedToday(): number {
  try {
    const raw = sessionStorage.getItem(CLEARS_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw) as ClearsDay
    if (parsed.day !== todayKey()) return 0
    return Math.max(0, Number(parsed.count) || 0)
  } catch {
    return 0
  }
}

function bumpBoardsClearedToday() {
  const day = todayKey()
  const next = readBoardsClearedToday() + 1
  try {
    sessionStorage.setItem(CLEARS_KEY, JSON.stringify({ day, count: next }))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('pa-play-clears-changed', { detail: { count: next } }))
  return next
}

export type PlayClearDetail = {
  /** Short crew line — e.g. "Board clear" / "Word clear" */
  label: string
  /** Optional nearby remainder, e.g. "2 left" */
  remnant?: string
  /** Larger latch (station) vs tiny clear (one picture / one word) */
  kind?: 'micro' | 'board'
}

/** Fire a satisfying clear beat. Safe to call from any Practice station.
 *  Owns success Foley — callers must not also play correct/latch on the same clear. */
export function firePlayClear(detail: PlayClearDetail) {
  const kind = detail.kind ?? 'micro'
  if (kind === 'board') bumpBoardsClearedToday()
  playFoley(kind === 'board' ? 'latch' : 'correct')
  window.dispatchEvent(new CustomEvent<PlayClearDetail>('pa-play-clear', { detail: { ...detail, kind } }))
}

/** Soft miss framing — never Incorrect / Expected / exam voice. */
export function softMissLine(detail?: string) {
  const t = (detail || '').trim()
  if (!t) return 'Not yet — try again. No rush.'
  if (/^not yet\b/i.test(t)) return t
  return `Not yet — ${t}`
}

/** Primary continue after a miss — same words site-wide. */
export const SOFT_RETRY_LABEL = 'Not yet · try again'

/**
 * Mount once in the Practice shell — listens for pa-play-clear and shows a brief pulse.
 */
export function PlayClearPulse() {
  const [beat, setBeat] = useState<PlayClearDetail | null>(null)

  useEffect(() => {
    function onClear(e: Event) {
      const detail = (e as CustomEvent<PlayClearDetail>).detail
      if (!detail?.label) return
      setBeat(detail)
    }
    window.addEventListener('pa-play-clear', onClear)
    return () => window.removeEventListener('pa-play-clear', onClear)
  }, [])

  useEffect(() => {
    if (!beat) return
    const ms = beat.kind === 'board' ? 900 : 520
    const t = window.setTimeout(() => setBeat(null), ms)
    return () => window.clearTimeout(t)
  }, [beat])

  if (!beat) return null

  return (
    <div
      className={`play-clear-pulse${beat.kind === 'board' ? ' is-board' : ' is-micro'}`}
      role="status"
      aria-live="polite"
    >
      <p className="play-clear-label">{beat.label}</p>
      {beat.remnant ? <p className="play-clear-remnant">{beat.remnant}</p> : null}
    </div>
  )
}

/** Quiet hub metric — presentation progress only. */
export function BoardsClearedToday() {
  const [count, setCount] = useState(() => readBoardsClearedToday())

  useEffect(() => {
    function sync() {
      setCount(readBoardsClearedToday())
    }
    window.addEventListener('pa-play-clears-changed', sync)
    return () => window.removeEventListener('pa-play-clears-changed', sync)
  }, [])

  if (count <= 0) return null

  return (
    <p className="ph-play-clears" role="status">
      Boards cleared today · <strong>{count}</strong>
      <span className="ph-play-clears-hint"> — practice joy, not a grade</span>
    </p>
  )
}
