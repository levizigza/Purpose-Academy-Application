import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  clearCoachProgress,
  getCoachProgress,
  markStationCoachSeen,
  setCoachProgress,
  STATION_COACH,
  stationCoachSeen,
  type CoachStep,
} from './stationCoach'

type Rect = { top: number; left: number; width: number; height: number }

function measure(selector: string): Rect | null {
  const el = document.querySelector(selector)
  if (!(el instanceof HTMLElement)) return null
  const r = el.getBoundingClientRect()
  if (r.width < 2 || r.height < 2) return null
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function resetCoachState(
  stationId: string,
  stepsLen: number,
  setActive: (v: boolean) => void,
  setStepIdx: (v: number) => void,
  stepIdxRef: { current: number },
  consumedSteps: { current: Set<number> },
) {
  const seen = stationCoachSeen(stationId)
  if (seen) {
    setActive(false)
    setStepIdx(0)
    stepIdxRef.current = 0
    consumedSteps.current = new Set()
    clearCoachProgress(stationId)
    return
  }
  const saved = getCoachProgress(stationId)
  setActive(stepsLen > 0)
  setStepIdx(saved)
  stepIdxRef.current = saved
  consumedSteps.current = new Set(Array.from({ length: saved }, (_, i) => i))
}

type Props = {
  stationId: string
  /** Bump when the drill UI changes so we re-measure (e.g. production phase). */
  layoutKey?: string | number | boolean
  /** Optional override steps; defaults to STATION_COACH[stationId]. */
  steps?: CoachStep[]
}

/**
 * First-example coach: spotlight the real control + plain instruction.
 * Call `window` event `pa-station-coach-advance` with `{ stationId }` when
 * the learner does the asked action — or use `advanceStationCoach(stationId)`.
 *
 * Step progress lives in module memory so a card remount after the first
 * press (e.g. VV language → listen layout) does not rewind the coach.
 *
 * Overlay portals to document.body so phone emulator CSS transforms do not
 * skew fixed spotlight coordinates (getBoundingClientRect is viewport-space).
 */
export function StationCoach({ stationId, layoutKey, steps: stepsProp }: Props) {
  const steps = stepsProp ?? STATION_COACH[stationId] ?? []
  const [stepIdx, setStepIdx] = useState(() => getCoachProgress(stationId))
  const [rect, setRect] = useState<Rect | null>(null)
  const [active, setActive] = useState(() => !stationCoachSeen(stationId) && steps.length > 0)
  const [, bump] = useState(0)
  const consumedSteps = useRef<Set<number>>(new Set())
  const stepIdxRef = useRef(stepIdx)

  useEffect(() => {
    const sync = () => {
      const seen = stationCoachSeen(stationId)
      if (seen) {
        setActive(false)
        setStepIdx(0)
        stepIdxRef.current = 0
        consumedSteps.current = new Set()
        clearCoachProgress(stationId)
        return
      }
      /* Start over / remount: clear progress and show step 1 again. */
      clearCoachProgress(stationId)
      consumedSteps.current = new Set()
      stepIdxRef.current = 0
      setStepIdx(0)
      setActive(steps.length > 0)
      bump((n) => n + 1)
    }
    window.addEventListener('pa-station-coach-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-station-coach-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [stationId, steps.length])

  useEffect(() => {
    resetCoachState(stationId, steps.length, setActive, setStepIdx, stepIdxRef, consumedSteps)
  }, [stationId, steps.length])

  stepIdxRef.current = stepIdx

  const step: CoachStep | undefined = active ? steps[stepIdx] : undefined

  const refresh = useCallback(() => {
    if (!step) {
      setRect(null)
      return
    }
    const next = measure(step.target)
    setRect(next)
    if (next) {
      const el = document.querySelector(step.target)
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [step])

  useLayoutEffect(() => {
    refresh()
  }, [refresh, layoutKey, stepIdx, active])

  useEffect(() => {
    if (!active) return
    const onResize = () => refresh()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    const t = window.setInterval(refresh, 400)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
      window.clearInterval(t)
    }
  }, [active, refresh])

  useEffect(() => {
    if (!active) return
    const onAdvance = (e: Event) => {
      const detail = (e as CustomEvent<{ stationId?: string }>).detail
      if (detail?.stationId && detail.stationId !== stationId) return
      const i = stepIdxRef.current
      if (consumedSteps.current.has(i)) return
      consumedSteps.current.add(i)
      const next = i + 1
      if (next >= steps.length) {
        markStationCoachSeen(stationId)
        setActive(false)
        return
      }
      stepIdxRef.current = next
      setCoachProgress(stationId, next)
      setStepIdx(next)
    }
    window.addEventListener('pa-station-coach-advance', onAdvance)
    return () => window.removeEventListener('pa-station-coach-advance', onAdvance)
  }, [active, stationId, steps.length])

  if (!active || !step || typeof document === 'undefined') return null

  /* Wait for the real control — e.g. VV type form mounts only after English plays. */
  if (!rect) return null

  const pad = 8
  const hole = {
    top: Math.max(0, rect.top - pad),
    left: Math.max(0, rect.left - pad),
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  }

  /* Prefer below the hole; flip above when clipped. Prefer right of tall holes so the prompt does not cover Type/Go. */
  const bubbleW = Math.min(280, window.innerWidth - 24)
  const below = hole.top + hole.height + 12
  const above = Math.max(12, hole.top - 92)
  const roomBelow = below + 88 <= window.innerHeight
  const top = roomBelow ? below : above
  const preferRight =
    hole.height > 72 && hole.left + hole.width + 12 + bubbleW < window.innerWidth - 8
  const left = preferRight
    ? hole.left + hole.width + 12
    : Math.min(window.innerWidth - bubbleW - 12, Math.max(12, hole.left))
  const bubbleStyle = { top, left }

  return createPortal(
    <div className="station-coach" aria-live="polite">
      <div className="station-coach-dim" aria-hidden />
      <div
        className="station-coach-hole"
        style={{
          top: hole.top,
          left: hole.left,
          width: hole.width,
          height: hole.height,
        }}
        aria-hidden
      />
      <div className="station-coach-bubble" style={bubbleStyle} role="status">
        <p className="station-coach-kicker">
          First example · {stepIdx + 1} of {steps.length}
        </p>
        <p className="station-coach-say">{step.say}</p>
      </div>
    </div>,
    document.body,
  )
}

/** Fire after the learner does the coached action. */
export function advanceStationCoach(stationId: string) {
  window.dispatchEvent(
    new CustomEvent('pa-station-coach-advance', { detail: { stationId } }),
  )
}
