import { useEffect, useState } from 'react'
import { playFoley } from '../audio/foley'
import { skillStationLabel, type SkillId } from './learningMastery'

type FamiliarDetail = {
  skill: SkillId
  level: string
}

const HOLD_MS = 2400

/**
 * Brief mastery beat when a skill first clears Familiar.
 * One idea on stage (§7.2 staging) — not a dashboard toast pile.
 */
export function FamiliarTheater() {
  const [beat, setBeat] = useState<FamiliarDetail | null>(null)

  useEffect(() => {
    function onFamiliar(e: Event) {
      const detail = (e as CustomEvent<FamiliarDetail>).detail
      if (!detail?.skill) return
      setBeat(detail)
      playFoley('latch')
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
        <p className="familiar-theater-kicker">Mastery</p>
        <p className="familiar-theater-stamp" aria-hidden>
          Familiar
        </p>
        <h2 className="familiar-theater-title">{station}</h2>
        <p className="familiar-theater-lede">
          You know this station well enough to keep moving. The next door can open.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setBeat(null)}>
          Continue
        </button>
      </div>
    </div>
  )
}
