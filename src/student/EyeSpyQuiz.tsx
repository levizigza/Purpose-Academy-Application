import { useEffect, useMemo, useState } from 'react'
import { ATTEMPT_POLICY, type EyeSpyHotspot, type EyeSpyScene } from './journeyCurriculum'
import { EYE_SPY_ATMOSPHERE, pathwayImage } from '../pathways'
import type { PathwayId } from '../pathways/types'
import { playFoley } from '../audio/foley'
import { recordSkillAttempt } from './learningMastery'
import {
  hasPracticeFeedbackAck,
  isPracticeMode,
  markPracticeFeedbackAck,
  openPracticeChat,
  practiceFeedbackKey,
} from '../practice/PracticeMode'
import { SOFT_RETRY_LABEL, firePlayClear } from '../practice/PlayClear'

type Mode = 'exercise' | 'exam'

const CLEAR_ALL_INSTRUCTION =
  'Tap a picture on the job site, then tap its English name. A correct pair disappears. Clear the whole board to move on.'

function bakedSceneUrl(pathwayId: PathwayId | undefined, scene: EyeSpyScene) {
  if (!pathwayId || !scene?.id) return undefined
  const base = import.meta.env.BASE_URL || '/'
  return `${base}media/eye-spy/${pathwayId}-${scene.id}.jpg`
}

function atmosphereFor(pathwayId: PathwayId | undefined, sceneIdx: number, scene: EyeSpyScene) {
  if (scene.sceneBgKey) {
    const keyed = pathwayImage(scene.sceneBgKey)
    if (keyed) return keyed
  }
  const baked = bakedSceneUrl(pathwayId, scene)
  if (baked) return baked
  const pack = pathwayId ? EYE_SPY_ATMOSPHERE[pathwayId] : undefined
  if (!pack?.length) return undefined
  return pack[sceneIdx % pack.length]
}

export function findQueue(scene: EyeSpyScene): EyeSpyHotspot[] {
  if (scene.findOrder?.length) {
    return scene.findOrder
      .map((id) => scene.hotspots.find((h) => h.id === id))
      .filter((h): h is EyeSpyHotspot => Boolean(h))
  }
  const first = scene.targetId ? scene.hotspots.find((h) => h.id === scene.targetId) : undefined
  const rest = scene.hotspots.filter((h) => h.id !== scene.targetId)
  return first ? [first, ...rest] : scene.hotspots
}

/**
 * Eye Spy: pair each remaining picture with its English name.
 * A correct pair vanishes. The scene is done when the board is empty.
 * Clear every picture. Misses mean try that board again — no exam theatre.
 */
export function EyeSpyQuiz({
  scenes,
  mode,
  onComplete,
  pathwayId,
}: {
  scenes: EyeSpyScene[]
  mode: Mode
  onComplete: () => void
  /** When set, hotspots sit on a rotating workplace atmosphere floor. */
  pathwayId?: PathwayId
}) {
  const boards = useMemo(() => scenes.filter((s) => s.hotspots.length > 0), [scenes])
  const totalFinds = useMemo(
    () => boards.reduce((n, s) => n + findQueue(s).length, 0),
    [boards],
  )
  const [sceneIdx, setSceneIdx] = useState(0)
  const [foundIds, setFoundIds] = useState<string[]>([])
  const [pickedHotspot, setPickedHotspot] = useState<string | null>(null)
  const [pickedName, setPickedName] = useState<string | null>(null)
  const [wrongPair, setWrongPair] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [misses, setMisses] = useState(0)
  const [attempt, setAttempt] = useState(1)
  const [phase, setPhase] = useState<'play' | 'scene-clear' | 'summary'>('play')
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)

  const scene = boards[sceneIdx]
  const queue = scene ? findQueue(scene) : []
  const foundSet = useMemo(() => new Set(foundIds), [foundIds])
  const remaining = queue.filter((h) => !foundSet.has(h.id))
  const nameOptions = useMemo(
    () => remaining.map((h) => h.answer).sort((a, b) => a.localeCompare(b)),
    [remaining],
  )
  const need = totalFinds
  const maxAttempts = mode === 'exam' ? ATTEMPT_POLICY.examMax : null
  const sceneBg = scene ? atmosphereFor(pathwayId, sceneIdx, scene) : undefined
  const sceneMode = Boolean(sceneBg)
  /** Baked floors already include the tool photos — hotspots are transparent taps. */
  const bakedMode = Boolean(scene && pathwayId && !scene.sceneBgKey && sceneBg?.includes('/media/eye-spy/'))

  useEffect(() => {
    window.dispatchEvent(new Event('pa-quiz-start'))
    return () => {
      window.dispatchEvent(new Event('pa-quiz-end'))
    }
  }, [])

  useEffect(() => {
    if (phase === 'summary') window.dispatchEvent(new Event('pa-quiz-complete'))
  }, [phase])

  useEffect(() => {
    if (!wrongPair) return
    const t = window.setTimeout(() => setWrongPair(false), 700)
    return () => window.clearTimeout(t)
  }, [wrongPair])

  function resetPicks() {
    setPickedHotspot(null)
    setPickedName(null)
    setWrongPair(false)
  }

  function resetBoard() {
    setFoundIds([])
    resetPicks()
  }

  function confirm() {
    if (phase !== 'play' || !pickedHotspot || !pickedName) return
    const hotspot = remaining.find((h) => h.id === pickedHotspot)
    const ok = Boolean(hotspot && hotspot.answer === pickedName)
    recordSkillAttempt(mode === 'exam' ? 'final-exam' : 'eye-spy', ok, ok ? 15 : 0)
    if (ok && hotspot) {
      const nextFound = [...foundIds, hotspot.id]
      const left = queue.length - nextFound.length
      setFoundIds(nextFound)
      setCorrectCount((c) => c + 1)
      resetPicks()
      if (nextFound.length >= queue.length) {
        firePlayClear({ label: 'Board clear', remnant: 'Every pair matched', kind: 'board' })
        setPhase('scene-clear')
      } else {
        firePlayClear({
          label: 'Pair clear',
          remnant: left === 1 ? '1 left on this board' : `${left} left on this board`,
          kind: 'micro',
        })
      }
      return
    }
    playFoley('wrong')
    setMisses((m) => m + 1)
    setWrongPair(true)
  }

  function nextAfterSceneClear() {
    if (sceneIdx + 1 >= boards.length) {
      setPhase('summary')
      return
    }
    setSceneIdx((i) => i + 1)
    resetBoard()
    setPhase('play')
  }

  function retryRun() {
    setAttempt((a) => a + 1)
    setSceneIdx(0)
    setCorrectCount(0)
    setMisses(0)
    resetBoard()
    setPhase('play')
  }

  function currentStepKey() {
    try {
      const step = Number(sessionStorage.getItem('pa-student-journey-step-v1') || '0')
      return practiceFeedbackKey('/journey', step || undefined)
    } catch {
      return practiceFeedbackKey('/journey')
    }
  }

  function handleComplete() {
    if (!isPracticeMode()) {
      playFoley('wood')
      onComplete()
      return
    }
    const key = currentStepKey()
    if (hasPracticeFeedbackAck(key)) {
      playFoley('wood')
      onComplete()
      return
    }
    const panel = document.querySelector('.train-panel')
    if (panel) (panel as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'end' })
    window.setTimeout(() => setFeedbackPrompt(true), 420)
  }

  function confirmFeedbackYes() {
    markPracticeFeedbackAck(currentStepKey())
    setFeedbackPrompt(false)
    playFoley('wood')
    onComplete()
  }

  function confirmFeedbackNo() {
    setFeedbackPrompt(false)
    openPracticeChat()
  }

  if (!scene || !boards.length) {
    return <p className="alert warn">No Eye Spy scenes are ready for this pathway.</p>
  }

  if (phase === 'summary') {
    const pass = correctCount >= need && misses === 0
    const examLocked = mode === 'exam' && maxAttempts != null && attempt >= maxAttempts && !pass

    return (
      <div className="train-quiz-summary eye-spy-summary">
        <p className="train-score">
          {correctCount} of {need} pictures named
          {misses > 0 ? ` · ${misses} miss${misses === 1 ? '' : 'es'} — try again` : ' · board clear'}
        </p>
        <p className="muted">
          Pair every picture with its English name until each board is empty.
        </p>
        {pass ? (
          <button type="button" className="btn btn-primary" onClick={handleComplete}>
            Continue
          </button>
        ) : examLocked ? (
          <p className="alert warn">
            Three tries used. Review the words, then ask an instructor for another go.
          </p>
        ) : (
          <button type="button" className="btn btn-primary" onClick={retryRun}>
            {mode === 'exam' && maxAttempts
              ? `${SOFT_RETRY_LABEL} (${attempt + 1} of ${maxAttempts})`
              : `${SOFT_RETRY_LABEL}. Clear every picture`}
          </button>
        )}
        {feedbackPrompt && (
          <div className="practice-next-gate" role="dialog" aria-modal="true" aria-label="Feedback check">
            <div className="practice-next-gate-card">
              <h3>Did you leave feedback on this step?</h3>
              <p>
                Scroll the page and use the feedback chat on the side if something felt unclear. Confirm when you are
                ready to move on.
              </p>
              <div className="practice-next-gate-actions">
                <button type="button" className="btn btn-primary" onClick={confirmFeedbackYes}>
                  Yes, continue
                </button>
                <button type="button" className="btn btn-ghost" onClick={confirmFeedbackNo}>
                  Not yet. Open chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`eye-spy${sceneMode ? ' is-scene-mode' : ''}`}>
      <p className="play-nearby-objective" aria-live="polite">
        {phase === 'scene-clear'
          ? 'Board clear — next door can open'
          : remaining.length === 0
            ? 'Board empty'
            : `Clear this board · ${remaining.length} left`}
      </p>
      <p className="train-quiz-counter">
        Scene {sceneIdx + 1} of {boards.length}
        {mode === 'exam' && maxAttempts ? ` · Try ${attempt} of ${maxAttempts}` : ' · Practice — take your time'}
      </p>
      <p className="eye-spy-instruction">{CLEAR_ALL_INSTRUCTION}</p>
      {wrongPair ? (
        <p className="play-soft-miss" role="status">
          Not yet · wrong pair — try again. No rush.
        </p>
      ) : null}
      <p className="eye-spy-scene-title">{scene.title}</p>
      <p className="eye-spy-progress" aria-live="polite">
        {remaining.length === 0
          ? 'Board empty'
          : `${foundIds.length} of ${queue.length} cleared`}
      </p>

      {phase === 'scene-clear' && (
        <p className="eye-spy-word is-clear" aria-live="polite">
          Board empty. Every pair matched.
        </p>
      )}

      <div
        className={`eye-spy-stage${sceneMode ? ' is-scene' : ' is-tiles'}${bakedMode ? ' is-baked' : ''}`}
        role="group"
        aria-label={
          sceneMode
            ? 'Job-site photo board. Tap a tool in the picture, then tap its English name'
            : 'Photo board. Tap a picture, then tap its English name'
        }
        style={sceneMode && sceneBg ? { backgroundImage: `url(${sceneBg})` } : undefined}
      >
        {sceneMode && !bakedMode ? <span className="eye-spy-scene-veil" aria-hidden /> : null}
        {scene.hotspots.map((h, index) => {
          if (foundSet.has(h.id)) return null
          const img = bakedMode ? undefined : pathwayImage(h.imageKey)
          const selected = pickedHotspot === h.id
          const style = sceneMode
            ? {
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${Math.max(h.w, 18)}%`,
                height: `${Math.max(h.h, 16)}%`,
              }
            : undefined
          return (
            <button
              key={`${scene.id}-${h.id}`}
              type="button"
              className={`eye-spy-hotspot${bakedMode ? ' is-baked-tap' : ''}${selected ? ' is-selected' : ''}${
                wrongPair && selected ? ' is-wrong' : ''
              }`}
              style={style}
              onClick={() => phase === 'play' && setPickedHotspot(h.id)}
              disabled={phase !== 'play'}
              aria-label={h.label || `Tool spot ${index + 1}`}
            >
              {img ? <img src={img} alt="" /> : bakedMode ? <span className="sr-only">{h.label}</span> : <span>{h.label}</span>}
            </button>
          )
        })}
      </div>

      {phase === 'play' && remaining.length > 0 && (
        <>
          <p className="eye-spy-prompt">What English name matches the picture you tapped?</p>
          <div className="train-choice-grid">
            {nameOptions.map((opt) => {
              let cls = 'train-choice'
              if (pickedName === opt) cls += wrongPair ? ' is-wrong' : ' is-selected'
              return (
                <button
                  key={opt}
                  type="button"
                  className={cls}
                  disabled={phase !== 'play'}
                  onClick={() => setPickedName(opt)}
                >
                  {opt}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!pickedHotspot || !pickedName}
            onClick={confirm}
          >
            Match
          </button>
        </>
      )}

      {phase === 'scene-clear' && (
        <button type="button" className="btn btn-primary" onClick={nextAfterSceneClear}>
          {sceneIdx + 1 >= boards.length ? 'Finish' : 'Next scene'}
        </button>
      )}
    </div>
  )
}
