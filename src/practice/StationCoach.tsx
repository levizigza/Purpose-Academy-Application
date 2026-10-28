import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  markStationCoachSeen,
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
 */
export function StationCoach({ stationId, layoutKey, steps: stepsProp }: Props) {
  const steps = stepsProp ?? STATION_COACH[stationId] ?? []
  const [stepIdx, setStepIdx] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [active, setActive] = useState(() => !stationCoachSeen(stationId) && steps.length > 0)
  const [, bump] = useState(0)
  /** One advance per step — pressing the same control twice must not skip ahead. */
  const consumedSteps = useRef<Set<number>>(new Set())

  useEffect(() => {
    const sync = () => {
      bump((n) => n + 1)
      if (stationCoachSeen(stationId)) setActive(false)
    }
    window.addEventListener('pa-station-coach-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-station-coach-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [stationId])

  useEffect(() => {
    setActive(!stationCoachSeen(stationId) && steps.length > 0)
    setStepIdx(0)
    consumedSteps.current = new Set()
  }, [stationId, steps.length])

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
      setStepIdx((i) => {
        if (consumedSteps.current.has(i)) return i
        consumedSteps.current.add(i)
        const next = i + 1
        if (next >= steps.length) {
          markStationCoachSeen(stationId)
          setActive(false)
          return i
        }
        return next
      })
    }
    window.addEventListener('pa-station-coach-advance', onAdvance)
    return () => window.removeEventListener('pa-station-coach-advance', onAdvance)
  }, [active, stationId, steps.length])

  if (!active || !step) return null

  const pad = 8
  const hole = rect
    ? {
        top: Math.max(0, rect.top - pad),
        left: Math.max(0, rect.left - pad),
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null

  const bubbleStyle = hole
    ? {
        top: Math.min(window.innerHeight - 88, hole.top + hole.height + 12),
        left: Math.min(window.innerWidth - 280, Math.max(12, hole.left)),
      }
    : { top: '30%', left: '50%', transform: 'translateX(-50%)' as const }

  return (
    <div className="station-coach" aria-live="polite">
      <div className="station-coach-dim" aria-hidden />
      {hole ? (
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
      ) : null}
      <div className="station-coach-bubble" style={bubbleStyle} role="status">
        <p className="station-coach-kicker">
          First example · {stepIdx + 1} of {steps.length}
        </p>
        <p className="station-coach-say">{step.say}</p>
      </div>
    </div>
  )
}

/** Fire after the learner does the coached action. */
export function advanceStationCoach(stationId: string) {
  window.dispatchEvent(
    new CustomEvent('pa-station-coach-advance', { detail: { stationId } }),
  )
}
