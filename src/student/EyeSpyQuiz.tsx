import { useEffect, useMemo, useState } from 'react'
import { ATTEMPT_POLICY, type EyeSpyScene } from './journeyCurriculum'
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

function scenesForGroup(all: EyeSpyScene[], group: string) {
  return all.filter((s) => s.variantGroup === group)
}

function pickGroups(all: EyeSpyScene[]): string[] {
  const seen = new Set<string>()
  const groups: string[] = []
  for (const s of all) {
    if (!seen.has(s.variantGroup)) {
      seen.add(s.variantGroup)
      groups.push(s.variantGroup)
    }
  }
  return groups
}

/**
 * Eye Spy: find the target object in a busy site scene.
 * Wrong answer loses a point; scene rotates AFTER feedback.
 * Pass requires 100% (no misses). Exercises unlimited; exams limited.
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
  const groups = useMemo(() => pickGroups(scenes), [scenes])
  const [groupIdx, setGroupIdx] = useState(0)
  const [variantIdx, setVariantIdx] = useState(0)
  const [pickedHotspot, setPickedHotspot] = useState<string | null>(null)
  const [pickedName, setPickedName] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [misses, setMisses] = useState(0)
  const [attempt, setAttempt] = useState(1)
  const [phase, setPhase] = useState<'play' | 'feedback' | 'summary'>('play')
  const [lastOk, setLastOk] = useState(false)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)

  const group = groups[groupIdx]
  const variants = scenesForGroup(scenes, group)
  const scene = variants[variantIdx % Math.max(variants.length, 1)]
  const target = scene.hotspots.find((h) => h.id === scene.targetId)!
  const nameOptions = useMemo(() => {
    const opts = [target.answer, ...scene.distractors]
    return [...opts].sort(() => Math.random() - 0.5)
  }, [scene.id, target.answer, scene.distractors])

  const maxAttempts = mode === 'exam' ? ATTEMPT_POLICY.examMax : null
  const need = groups.length

  useEffect(() => {
    window.dispatchEvent(new Event('pa-quiz-start'))
    return () => {
      window.dispatchEvent(new Event('pa-quiz-end'))
    }
  }, [])

  useEffect(() => {
    if (phase === 'summary') window.dispatchEvent(new Event('pa-quiz-complete'))
  }, [phase])

  function resetPick() {
    setPickedHotspot(null)
    setPickedName(null)
  }

  function confirm() {
    if (!pickedHotspot || !pickedName) return
    const ok = pickedHotspot === scene.targetId && pickedName === target.answer
    setLastOk(ok)
    recordSkillAttempt(mode === 'exam' ? 'final-exam' : 'eye-spy', ok, ok ? 15 : 0)
    if (ok) {
      setCorrectCount((c) => c + 1)
      playFoley('correct')
    } else {
      setMisses((m) => m + 1)
      playFoley('wrong')
      // Keep the current scene + picks visible during feedback; rotate on continue.
    }
    setPhase('feedback')
  }

  function nextAfterFeedback() {
    if (!lastOk) {
      setVariantIdx((v) => v + 1)
      resetPick()
      setPhase('play')
      return
    }
    if (groupIdx + 1 >= need) {
      setPhase('summary')
      return
    }
    setGroupIdx((i) => i + 1)
    setVariantIdx(0)
    resetPick()
    setPhase('play')
  }

  function retryRun() {
    setAttempt((a) => a + 1)
    setGroupIdx(0)
    setVariantIdx(0)
    setCorrectCount(0)
    setMisses(0)
    resetPick()
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

  if (phase === 'summary') {
    const pass = correctCount >= need && misses === 0
    const examLocked = mode === 'exam' && maxAttempts != null && attempt >= maxAttempts && !pass

    return (
      <div className="train-quiz-summary eye-spy-summary">
        <p className="train-score">
          {correctCount} / {need} found
          {misses > 0 ? ` · ${misses} miss${misses === 1 ? '' : 'es'} (must be 0 to pass)` : ' · clean run'}
        </p>
        <p className="muted">
          You must find every tool with no mistakes. Wrong answers change the scene.
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
              : 'Try again. Find every tool with no mistakes'}
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
        Scene {groupIdx + 1} of {need}
        {mode === 'exam' && maxAttempts ? ` · Try ${attempt} of ${maxAttempts}` : ' · Practice (unlimited tries)'}
      </p>
      <p className="eye-spy-instruction">{scene.instruction}</p>
      <p className="eye-spy-scene-title">{scene.title}</p>

      <div className="eye-spy-stage" role="group" aria-label="Site scene. Tap the correct tool">
        <div className="eye-spy-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="eye-spy-tile" />
          ))}
        </div>
        {scene.hotspots.map((h, index) => {
          const img = pathwayImage(h.imageKey)
          const selected = pickedHotspot === h.id
          return (
            <button
              key={`${scene.id}-${h.id}-${variantIdx}`}
              type="button"
              className={`eye-spy-hotspot${selected ? ' is-selected' : ''}${phase === 'feedback' && lastOk && h.id === scene.targetId ? ' is-target' : ''}${phase === 'feedback' && !lastOk && selected ? ' is-wrong' : ''}${phase === 'feedback' && !lastOk && h.id === scene.targetId ? ' is-target' : ''}`}
              style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
              onClick={() => phase === 'play' && setPickedHotspot(h.id)}
              disabled={phase !== 'play'}
              aria-label={`Tool spot ${index + 1}`}
            >
              {img ? <img src={img} alt="" /> : <span>{h.label}</span>}
            </button>
          )
        })}
      </div>

      <p className="eye-spy-prompt">What English name matches the tool you tapped?</p>
      <div className="train-choice-grid">
        {nameOptions.map((opt) => {
          let cls = 'train-choice'
          if (phase === 'play' && pickedName === opt) cls += ' is-selected'
          if (phase === 'feedback') {
            if (opt === target.answer) cls += ' is-correct'
            else if (pickedName === opt) cls += ' is-wrong'
          }
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

      {phase === 'play' && (
        <button
          type="button"
          className="btn btn-primary"
          disabled={!pickedHotspot || !pickedName}
          onClick={confirm}
        >
          Check answer
        </button>
      )}

      {phase === 'feedback' && (
        <>
          <div className={`alert ${lastOk ? 'ok' : 'warn'}`}>
            {lastOk
              ? `Yes. That is the ${target.answer}.`
              : `Not yet. The correct tool is the ${target.answer}. Next try uses a new scene.`}
          </div>
          <button type="button" className="btn btn-primary" onClick={nextAfterFeedback}>
            {lastOk ? (groupIdx + 1 >= need ? 'See results' : 'Next scene') : 'Try the new scene'}
          </button>
        </>
      )}
    </div>
  )
}
