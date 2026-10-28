import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  explainerForStep,
  hasWatchedExplainer,
  markExplainerWatched,
  videoSrc,
  type StationExplainer,
} from './stationExplainers'
import { markNavCueSeen, NAV_CUE, navCueActive } from './navCues'
import { NavGlowButton } from './NavCue'

type Props = {
  step: number
  children: ReactNode
}

/**
 * First visit to a station: short how-it-works video, then the drill.
 * Desktop night + phone paper inherit the same gate (dual-shell CSS).
 */
export function StationExplainerGate({ step, children }: Props) {
  const explainer = explainerForStep(step)
  const [ready, setReady] = useState(() => (explainer ? hasWatchedExplainer(explainer.id) : true))
  const [, bump] = useState(0)

  useEffect(() => {
    const sync = () => {
      bump((n) => n + 1)
      const next = explainerForStep(step)
      setReady(next ? hasWatchedExplainer(next.id) : true)
    }
    window.addEventListener('pa-station-explainers-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-station-explainers-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [step])

  useEffect(() => {
    const next = explainerForStep(step)
    setReady(next ? hasWatchedExplainer(next.id) : true)
  }, [step])

  if (!explainer || ready) return <>{children}</>
  return (
    <ExplainerCard
      explainer={explainer}
      onDone={() => {
        markExplainerWatched(explainer.id)
        markNavCueSeen(NAV_CUE.explainerWatch(explainer.id))
        setReady(true)
      }}
    />
  )
}

function ExplainerCard({
  explainer,
  onDone,
}: {
  explainer: StationExplainer
  onDone: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ended, setEnded] = useState(false)
  const [failed, setFailed] = useState(false)
  const cueId = NAV_CUE.explainerWatch(explainer.id)
  const glowContinue = navCueActive(cueId) || ended || failed

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const tryPlay = () => {
      void el.play().catch(() => {
        /* user gesture may be required — controls stay visible */
      })
    }
    tryPlay()
  }, [explainer.id])

  return (
    <article className="station-explainer" aria-labelledby={`explainer-${explainer.id}-title`}>
      <p className="section-kicker">How this station works</p>
      <h2 id={`explainer-${explainer.id}-title`}>{explainer.title}</h2>
      <p className="lede station-explainer-lede">{explainer.lede}</p>
      <p className="play-nearby-objective" aria-live="polite">
        Watch once · then the station opens
      </p>

      <div className="station-explainer-stage">
        {!failed ? (
          <video
            ref={videoRef}
            className="station-explainer-video"
            src={videoSrc(explainer.video)}
            controls
            playsInline
            preload="auto"
            onEnded={() => setEnded(true)}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="station-explainer-fallback" role="status">
            <p>
              Video could not load on this device. Read the steps above, then continue — the station
              works the same way.
            </p>
          </div>
        )}
      </div>

      <div className="station-explainer-actions">
        <NavGlowButton
          cueId={cueId}
          className={`btn btn-primary station-explainer-continue${glowContinue ? '' : ' is-wait'}`}
          disabled={!ended && !failed}
          onClick={onDone}
        >
          {ended || failed ? 'Continue to station' : 'Watch to unlock'}
        </NavGlowButton>
        {failed ? (
          <button type="button" className="btn btn-ghost" onClick={onDone}>
            Skip video · open station
          </button>
        ) : null}
      </div>
    </article>
  )
}
