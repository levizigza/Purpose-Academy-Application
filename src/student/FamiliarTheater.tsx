import { useEffect, useState } from 'react'
import { skillStationLabel, type SkillId } from './learningMastery'

type FamiliarDetail = {
  skill: SkillId
  level: string
}

const HOLD_MS = 2400

/**
 * Brief beat when a skill first clears Comfortable (internal Familiar).
 * One idea on stage (§7.2 staging) — door language, not a grading ceremony.
 * Visual only: success Foley is owned by firePlayClear (avoids double latch
 * when a board clear and Comfortable land on the same attempt).
 */
export function FamiliarTheater() {
  const [beat, setBeat] = useState<FamiliarDetail | null>(null)

  useEffect(() => {
    function onFamiliar(e: Event) {
      const detail = (e as CustomEvent<FamiliarDetail>).detail
      if (!detail?.skill) return
      setBeat(detail)
    }
    window.addEventListener('pa-familiar-earned', onFamiliar)
    return () => window.removeEventListener('pa-familiar-earned', onFamiliar)
  }, [])

  useEffect(() => {
    if (!beat) return
    const t = window.setTimeout(() => setBeat(null), HOLD_MS)
    return () => window.clearTimeout(t)
  }, [beat])

  if (!beat) return null

  const station = skillStationLabel(beat.skill)

  return (
    <div className="familiar-theater" role="status" aria-live="polite">
      <div className="familiar-theater-stage">
        <p className="familiar-theater-kicker">Station clear</p>
        <p className="familiar-theater-stamp" aria-hidden>
          Ready
        </p>
        <h2 className="familiar-theater-title">{station}</h2>
        <p className="familiar-theater-lede">
          This station feels solid enough to keep moving. The next door can open.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setBeat(null)}>
          Continue
        </button>
      </div>
    </div>
  )
}
