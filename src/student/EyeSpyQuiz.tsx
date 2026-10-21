import { useEffect, useMemo, useState } from 'react'
import { ATTEMPT_POLICY, type EyeSpyHotspot, type EyeSpyScene } from './journeyCurriculum'
import { pathwayImage } from '../pathways'
import { playFoley } from '../audio/foley'
import { recordSkillAttempt } from './learningMastery'
import {
  hasPracticeFeedbackAck,
  isPracticeMode,
  markPracticeFeedbackAck,
  openPracticeChat,
  practiceFeedbackKey,
} from '../practice/PracticeMode'

type Mode = 'exercise' | 'exam'

const CLEAR_ALL_INSTRUCTION =
  'Identify every item in this scene. Tap the picture that matches the English word. Found items stay marked until the board is clear.'

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
 * Eye Spy: clear every workplace photo in the scene.
 * One English word at a time; tap the matching picture to eliminate it.
 * Pass requires identifying every item with no misses.
 */
export function EyeSpyQuiz({
  scenes,
  mode,
  onComplete,
}: {
  scenes: EyeSpyScene[]
  mode: Mode
  onComplete: () => void
}) {
  const boards = useMemo(() => scenes.filter((s) => s.hotspots.length > 0), [scenes])
  const totalFinds = useMemo(
    () => boards.reduce((n, s) => n + findQueue(s).length, 0),
    [boards],
  )
  const [sceneIdx, setSceneIdx] = useState(0)
  const [findIdx, setFindIdx] = useState(0)
  const [foundIds, setFoundIds] = useState<string[]>([])
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [misses, setMisses] = useState(0)
  const [attempt, setAttempt] = useState(1)
  const [phase, setPhase] = useState<'play' | 'scene-clear' | 'summary'>('play')
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)

  const scene = boards[sceneIdx]
  const queue = scene ? findQueue(scene) : []
  const target = queue[findIdx]
  const foundSet = useMemo(() => new Set(foundIds), [foundIds])
  const need = totalFinds
  const maxAttempts = mode === 'exam' ? ATTEMPT_POLICY.examMax : null

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
    if (!wrongId) return
    const t = window.setTimeout(() => setWrongId(null), 700)
    return () => window.clearTimeout(t)
  }, [wrongId])

  function resetBoard() {
    setFindIdx(0)
    setFoundIds([])
    setWrongId(null)
  }

  function tapHotspot(id: string) {
    if (phase !== 'play' || !target) return
    if (foundSet.has(id)) return
    const ok = id === target.id
    recordSkillAttempt(mode === 'exam' ? 'final-exam' : 'eye-spy', ok, ok ? 15 : 0)
    if (ok) {
      playFoley('correct')
      const nextFound = [...foundIds, id]
      setFoundIds(nextFound)
      setCorrectCount((c) => c + 1)
      setWrongId(null)
      if (findIdx + 1 >= queue.length) {
        setPhase('scene-clear')
        return
      }
      setFindIdx((i) => i + 1)
      return
    }
    playFoley('wrong')
    setMisses((m) => m + 1)
    setWrongId(id)
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
          {correctCount} / {need} identified
          {misses > 0 ? ` · ${misses} miss${misses === 1 ? '' : 'es'} (must be 0 to pass)` : ' · clean run'}
        </p>
        <p className="muted">
          You must identify every item in every scene with no mistakes.
        </p>
        {pass ? (
          <button type="button" className="btn btn-primary" onClick={handleComplete}>
            Continue
          </button>
        ) : examLocked ? (
          <p className="alert warn">
            Exam tries used ({maxAttempts}). Review the words, then ask an instructor for another try.
          </p>
        ) : (
          <button type="button" className="btn btn-primary" onClick={retryRun}>
            {mode === 'exam' && maxAttempts
              ? `Try exam again (${attempt + 1} of ${maxAttempts})`
              : 'Try again. Identify every item with no mistakes'}
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
    <div className="eye-spy">
      <p className="train-quiz-counter">
        Scene {sceneIdx + 1} of {boards.length}
        {mode === 'exam' && maxAttempts ? ` · Try ${attempt} of ${maxAttempts}` : ' · Practice (unlimited tries)'}
      </p>
      <p className="eye-spy-instruction">{CLEAR_ALL_INSTRUCTION}</p>
      <p className="eye-spy-scene-title">{scene.title}</p>
      <p className="eye-spy-progress" aria-live="polite">
        {foundIds.length} of {queue.length} found in this scene
      </p>

      {phase === 'play' && target && (
        <p className="eye-spy-word" aria-live="polite">
          Find: <strong>{target.answer}</strong>
        </p>
      )}

      {phase === 'scene-clear' && (
        <p className="eye-spy-word is-clear" aria-live="polite">
          Scene clear. Every item identified.
        </p>
      )}

      <div className="eye-spy-stage" role="group" aria-label="Photo board. Tap the picture that matches the English word">
        <div className="eye-spy-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="eye-spy-tile" />
          ))}
        </div>
        {scene.hotspots.map((h, index) => {
          const img = pathwayImage(h.imageKey)
          const found = foundSet.has(h.id)
          const wrong = wrongId === h.id
          return (
            <button
              key={`${scene.id}-${h.id}`}
              type="button"
              className={`eye-spy-hotspot${found ? ' is-found' : ''}${wrong ? ' is-wrong' : ''}`}
              style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
              onClick={() => tapHotspot(h.id)}
              disabled={phase !== 'play' || found}
              aria-label={found ? `${h.answer}, found` : `Tool spot ${index + 1}`}
            >
              {img ? <img src={img} alt="" /> : <span>{h.label}</span>}
            </button>
          )
        })}
      </div>

      <ul className="eye-spy-cleared" aria-label="Items found">
        {queue.map((h) => (
          <li key={h.id} className={foundSet.has(h.id) ? 'is-found' : ''}>
            {h.answer}
          </li>
        ))}
      </ul>

      {phase === 'scene-clear' && (
        <button type="button" className="btn btn-primary" onClick={nextAfterSceneClear}>
          {sceneIdx + 1 >= boards.length ? 'See results' : 'Next scene'}
        </button>
      )}
    </div>
  )
}
