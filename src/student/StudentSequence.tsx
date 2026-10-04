import { FormEvent, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { BRAND_ASSETS } from '../brand/assets'
import { Reveal } from '../components/Motion'
import { FoleyToggle, StepTransition } from '../components/CrewLoading'
import { playFoley, unlockFoley } from '../audio/foley'
import { DEMO_PASSWORDS } from '../data/seed'
import { markSequenceComplete } from '../gateway/sequenceProgress'
import { selectPathway } from '../data/store'
import {
  JOURNEY_STEPS,
  SUPPORT_LANGUAGES,
  VOCAB_UNIT,
  SAFETY_QUIZ,
  FINAL_QUIZ,
  TOOL_CATEGORIES,
  SYSTEM_TOPICS,
  SITE_PHRASES,
  WORD_ACTIONS,
  EYE_SPY_SCENES,
  UNIT_GOALS,
  WORKPLACE_INSTRUCTIONS,
  DIGITAL_PRACTICE,
  OBSERVATION_SCENARIOS,
  SITE_DECISIONS,
  EMPLOYMENT_PREP,
  unitForStep,
  isUnitEntryStep,
  type SupportLang,
  type QuizItem,
} from './journeyCurriculum'
import {
  CareerAssessmentResult,
  CareerInterestAssessment,
  CareerStyleAssessment,
} from './CareerAssessment'
import {
  combinePathwayScores,
  pathwayFromRiasec,
  rankedRiasec,
  scoreInterestAnswers,
  scoreStyleAnswers,
  topPathway,
  type LikertValue,
  type PathwayId,
  ASSESSMENT_COPY,
  ASSESSMENT_SHELL,
  LANG_NATIVE,
  t as assessT,
} from './careerAssessment'
import {
  primeSpeech,
  speakEnglish,
  speakSupport,
  stopSpeech,
} from './speech'
import { toolImage } from './toolImages'
import { EyeSpyQuiz } from './EyeSpyQuiz'
import { VocabSheet } from './VocabSheet'
import { LearningPathMap, UnitIntroCard } from './LearningPathMap'
import {
  markSkillOpened,
  recordSkillAttempt,
  SKILL_BY_STEP,
} from './learningMastery'
import {
  hasPracticeFeedbackAck,
  isPracticeMode,
  markPracticeFeedbackAck,
  openPracticeChat,
  PRACTICE_ENTRY_STEP,
  practiceFeedbackKey,
  resetPracticeProgress,
  shouldAskPracticeFeedback,
} from '../practice/PracticeMode'

const JOURNEY_KEY = 'pa-student-journey-step-v1'
const OBS_KEY = 'pa-student-observation-v1'
const LOG_KEY = 'pa-student-daily-log-v1'
const EMP_KEY = 'pa-student-employment-v1'

function saveStep(step: number) {
  try {
    sessionStorage.setItem(JOURNEY_KEY, String(step))
    window.dispatchEvent(new CustomEvent('pa-journey-step', { detail: { step } }))
  } catch { /* */ }
}

function loadStep() {
  try {
    const n = Number(sessionStorage.getItem(JOURNEY_KEY) || '1')
    return Number.isFinite(n) && n >= 1 && n <= 20 ? n : 1
  } catch { return 1 }
}

/* ─── Shared UI primitives ─── */

function TeachNote({ children }: { children: ReactNode }) {
  return (
    <aside className="train-teach" aria-label="Teacher note">
      <span className="train-teach-label">Teach note</span>
      <p>{children}</p>
    </aside>
  )
}

function WhyWork({ children }: { children: ReactNode }) {
  return (
    <p className="train-why">
      <strong>At work:</strong> {children}
    </p>
  )
}

function PictureCard({
  emoji,
  label,
  sub,
  caption,
  image,
  fit = 'cover',
}: {
  emoji?: string
  label: string
  sub?: string
  caption?: string
  image?: string
  /** Use contain for single-object tool photos so the whole tool stays visible. */
  fit?: 'cover' | 'contain'
}) {
  return (
    <figure className={`train-picture${image ? ' has-photo' : ''}${image && fit === 'contain' ? ' is-object' : ''}`}>
      {image ? (
        <img className="train-picture-img" src={image} alt="" />
      ) : (
        <span className="train-emoji" aria-hidden>
          {emoji || 'PA'}
        </span>
      )}
      <figcaption>
        <strong>{label}</strong>
        {sub && <span className="train-sub">{sub}</span>}
        {caption && <span className="train-caption">{caption}</span>}
      </figcaption>
    </figure>
  )
}

/** Always show the quiz item's object image — never a random site photo. */
function quizObjectImage(item: QuizItem): string | undefined {
  return toolImage(item.imageKey) || toolImage(item.answer) || toolImage(item.emoji)
}

function ChoiceButton({ children, onClick, state, disabled }: {
  children: ReactNode; onClick: () => void; state?: 'correct' | 'wrong' | 'idle' | 'selected'; disabled?: boolean
}) {
  return (
    <button type="button" className={`train-choice${state && state !== 'idle' ? ` is-${state}` : ''}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function LearnCard({ title, body, mark }: { title: string; body: string; mark?: string }) {
  return (
    <article className="train-learn-card">
      {mark && <span className="train-learn-mark" aria-hidden>{mark}</span>}
      <div><strong>{title}</strong><p>{body}</p></div>
    </article>
  )
}

/* ─── Step shell — SiteWise-inspired training chrome ─── */

function StepShell({ step, children, onBack, onNext, nextLabel = 'Continue', nextDisabled, transitioning, transitionMsg, supportLang }: {
  step: number; children: ReactNode; onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean
  transitioning?: boolean; transitionMsg?: string; supportLang?: SupportLang
}) {
  const base = JOURNEY_STEPS[step - 1]
  const motherTongue = supportLang && step >= 3 && step <= 6
  const shellCopy = motherTongue ? ASSESSMENT_SHELL[step as 3 | 4 | 5 | 6] : null
  const title = shellCopy ? assessT(shellCopy.title, supportLang!) : base.title
  const help = shellCopy ? assessT(shellCopy.help, supportLang!) : base.help
  const purpose = shellCopy ? assessT(shellCopy.purpose, supportLang!) : base.purpose
  const unit = unitForStep(step)
  const pct = Math.round((step / 20) * 100)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)
  const stepKicker = motherTongue
    ? `${assessT(ASSESSMENT_COPY.stepOf, supportLang!)} ${step} ${assessT(ASSESSMENT_COPY.ofTotal, supportLang!)} 20`
    : `Step ${step} of 20 · Unit ${unit.id}: ${unit.label}`
  const whyLabel = motherTongue
    ? ({
        English: 'Why this step?',
        Spanish: '¿Por qué este paso?',
        Arabic: 'لماذا هذه الخطوة؟',
        Hindi: 'यह कदम क्यों?',
        Amharic: 'ይህ ደረጃ ለምን?',
        Tigrinya: 'ስለምንታይ እዚ ደረጃ?',
      } satisfies Record<SupportLang, string>)[supportLang!]
    : 'Why this step?'
  const backLabel = motherTongue
    ? ({
        English: 'Back',
        Spanish: 'Atrás',
        Arabic: 'رجوع',
        Hindi: 'पीछे',
        Amharic: 'ተመለስ',
        Tigrinya: 'ተመለስ',
      } satisfies Record<SupportLang, string>)[supportLang!]
    : 'Back'

  function handleNext() {
    if (!onNext) return
    if (!isPracticeMode() || !shouldAskPracticeFeedback(step)) {
      playFoley('wood')
      onNext()
      return
    }
    const key = practiceFeedbackKey('/journey', step)
    if (hasPracticeFeedbackAck(key)) {
      playFoley('wood')
      onNext()
      return
    }
    /* Scroll the step so reviewers can skim, then ask about feedback at unit boundaries. */
    const panel = document.querySelector('.train-panel')
    const actions = document.querySelector('.train-actions')
    const target = (actions as HTMLElement | null) || (panel as HTMLElement | null)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    }
    window.setTimeout(() => setFeedbackPrompt(true), 420)
  }

  function confirmFeedbackYes() {
    markPracticeFeedbackAck(practiceFeedbackKey('/journey', step))
    setFeedbackPrompt(false)
    playFoley('wood')
    onNext?.()
  }

  function confirmFeedbackNo() {
    setFeedbackPrompt(false)
    openPracticeChat()
  }

  return (
    <div className="shell-main train-shell">
      <StepTransition active={!!transitioning} message={transitionMsg || 'Moving to the next station…'} />
      <header className="train-header">
        <div className="train-header-top">
          <p className="train-kicker">
            {stepKicker}
            {isPracticeMode() ? ' · Practice' : ''}
          </p>
          <div className="train-sound-slot">
            <FoleyToggle compact />
          </div>
        </div>
        <h1 className="train-title">{title}</h1>
        <p className="train-simple-line">{help}</p>
        {!motherTongue && (
          <p className="train-unit-pill" aria-label={`Learning unit ${unit.id}`}>
            <span>Unit {unit.id}</span>
            <strong>{unit.label}</strong>
            <em>Steps {unit.range}</em>
          </p>
        )}
        <details className="train-why-details">
          <summary>{whyLabel}</summary>
          <p className="train-purpose">{purpose}</p>
        </details>
        <div className="train-progress" aria-label={`Progress ${pct}%`}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <ol className="train-dots" aria-label="Step progress">
          {JOURNEY_STEPS.map((s) => {
            const skipped = isPracticeMode() && s.n < PRACTICE_ENTRY_STEP
            const cls = s.n === step ? 'is-current' : skipped ? 'is-skipped' : s.n < step ? 'is-done' : ''
            return <li key={s.n} className={cls} title={skipped ? `${s.title} (skipped in practice)` : s.title} />
          })}
        </ol>
        <LearningPathMap currentStep={step} practice={isPracticeMode()} compact />
      </header>

      <Reveal className="train-panel" delay={40}>
        {isUnitEntryStep(step) && UNIT_GOALS[unit.id] && (
          <UnitIntroCard
            unitId={unit.id}
            goal={UNIT_GOALS[unit.id].goal}
            outcomes={UNIT_GOALS[unit.id].outcomes}
          />
        )}
        {children}
      </Reveal>

      <div className="train-actions">
        {onBack && (
          <button type="button" className="btn btn-ghost train-back" onClick={onBack}>
            {backLabel}
          </button>
        )}
        {onNext && (
          <button
            type="button"
            className="btn btn-primary train-next"
            onClick={handleNext}
            disabled={nextDisabled}
          >
            {nextLabel}
          </button>
        )}
      </div>

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
                Yes — continue
              </button>
              <button type="button" className="btn btn-ghost" onClick={confirmFeedbackNo}>
                Not yet — open chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Multi-item quiz runner ─── */

function QuizRunner({ items, onComplete, gated }: { items: QuizItem[]; onComplete: () => void; gated?: boolean }) {
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<string | null>(null)
  const [correct, setCorrect] = useState(false)
  const [done, setDone] = useState(false)
  const [gateBlocked, setGateBlocked] = useState(false)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)
  const item = items[idx]

  useEffect(() => {
    window.dispatchEvent(new Event('pa-quiz-start'))
    return () => {
      window.dispatchEvent(new Event('pa-quiz-end'))
    }
  }, [])

  useEffect(() => {
    if (done) window.dispatchEvent(new Event('pa-quiz-complete'))
  }, [done])

  function currentStepKey() {
    try {
      const step = Number(sessionStorage.getItem(JOURNEY_KEY) || '0')
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
    try {
      const step = Number(sessionStorage.getItem(JOURNEY_KEY) || '0')
      if (!shouldAskPracticeFeedback(step)) {
        playFoley('wood')
        onComplete()
        return
      }
    } catch {
      /* fall through */
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

  function pick(opt: string) {
    if (answered) return
    const isCorrect = opt === item.answer
    setAnswered(opt)
    setCorrect(isCorrect)
    playFoley(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) setScore((s) => s + 1)
    if (gated && !isCorrect) setGateBlocked(true)
  }

  function next() {
    if (gateBlocked) { setAnswered(null); setCorrect(false); setGateBlocked(false); return }
    if (idx + 1 >= items.length) { setDone(true); return }
    setIdx((i) => i + 1)
    setAnswered(null)
    setCorrect(false)
  }

  if (done) {
    return (
      <div className="train-quiz-summary">
        <p className="train-score">{score} / {items.length} correct</p>
        {gated && score < items.length && (
          <p className="alert warn">Safety requires a perfect score. Review and try again.</p>
        )}
        {(!gated || score === items.length) && (
          <button type="button" className="btn btn-primary" onClick={handleComplete}>Continue</button>
        )}
        {gated && score < items.length && (
          <button type="button" className="btn btn-primary" onClick={() => { setIdx(0); setScore(0); setDone(false); setAnswered(null); setCorrect(false); }}>
            Retry quiz
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
                  Yes — continue
                </button>
                <button type="button" className="btn btn-ghost" onClick={confirmFeedbackNo}>
                  Not yet — open chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const objectImg = quizObjectImage(item)

  return (
    <div className="train-quiz-item">
      <p className="train-quiz-counter">Question {idx + 1} of {items.length}</p>
      <PictureCard
        image={objectImg}
        fit="contain"
        emoji={item.emoji}
        label={item.prompt}
        caption={
          objectImg
            ? 'Look at the picture. Choose the best answer.'
            : 'Read the question. Choose the best answer.'
        }
      />
      <div className="train-choice-grid">
        {item.options.map((opt) => (
          <ChoiceButton key={opt} state={answered === opt ? (opt === item.answer ? 'correct' : 'wrong') : answered ? (opt === item.answer ? 'correct' : 'idle') : 'idle'} disabled={!!answered && opt !== answered && opt !== item.answer} onClick={() => pick(opt)}>
            {opt}
          </ChoiceButton>
        ))}
      </div>
      {answered && (
        <>
          <div className={`alert ${correct ? 'ok' : 'warn'}`}>
            {correct ? item.teachCorrect : item.teachWrong}
          </div>
          <button type="button" className="btn btn-primary" onClick={next}>
            {gateBlocked ? 'Try again' : idx + 1 >= items.length ? 'See results' : 'Next question'}
          </button>
        </>
      )}
    </div>
  )
}

/* ─── Main sequence page ─── */

export function StudentSequencePage() {
  const navigate = useNavigate()
  const { user, student, login, register, refresh } = useSession()
  const [step, setStep] = useState(loadStep)
  const [supportLang, setSupportLang] = useState<SupportLang>(
    (student?.preferred_language as SupportLang) || 'Amharic',
  )
  const [interest, setInterest] = useState<PathwayId | null>(null)
  const [careerInterestAnswers, setCareerInterestAnswers] = useState<Record<string, LikertValue>>({})
  const [careerStyleAnswers, setCareerStyleAnswers] = useState<Record<string, string>>({})
  const [riasecScores, setRiasecScores] = useState(() => scoreInterestAnswers({}))
  const [actionIdx, setActionIdx] = useState(0)
  const [actionAnswer, setActionAnswer] = useState<string | null>(null)
  const [actionCorrect, setActionCorrect] = useState(false)
  const [finalPhase, setFinalPhase] = useState<'eyespy' | 'written' | 'certificate'>('eyespy')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [transitionMsg, setTransitionMsg] = useState('Moving to the next station…')
  const [practiceAdvancePrompt, setPracticeAdvancePrompt] = useState(false)
  const practiceAdvanceRef = useRef<(() => void) | null>(null)
  const [empDone, setEmpDone] = useState(() => {
    try { return !!sessionStorage.getItem(EMP_KEY) } catch { return false }
  })
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [phraseHeard, setPhraseHeard] = useState(false)
  const [phraseAnswer, setPhraseAnswer] = useState<string | null>(null)
  const [phraseCorrect, setPhraseCorrect] = useState(false)

  /* Step 2 registration form */
  const [regForm, setRegForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '',
    preferred_language: 'Amharic', previous_experience: '',
  })

  /* Step 7 visual vocabulary — one picture at a time through the full set */
  const [vocabHeard, setVocabHeard] = useState<Record<string, boolean>>({})
  const [vocabSpeakingId, setVocabSpeakingId] = useState<string | null>(null)
  const [vocabIdx, setVocabIdx] = useState(0)
  const [speaking, setSpeaking] = useState<'en' | 'support' | 'both' | null>(null)

  /* Step 9 supported matching */
  const [matchIdx, setMatchIdx] = useState(0)
  const [matchAnswer, setMatchAnswer] = useState<string | null>(null)
  const [matchCorrect, setMatchCorrect] = useState(false)
  const [matchOptions, setMatchOptions] = useState(() => {
    const term = VOCAB_UNIT[0]
    const distractors = VOCAB_UNIT.filter((t) => t.id !== term.id).slice(0, 3)
    return [term, ...distractors].sort(() => Math.random() - 0.5)
  })

  /* Step 11 workplace instructions */
  const [instrIdx, setInstrIdx] = useState(0)
  const [instrHeard, setInstrHeard] = useState(false)
  const [instrAnswer, setInstrAnswer] = useState<string | null>(null)
  const [instrCorrect, setInstrCorrect] = useState(false)

  /* Step 13 digital practice */
  const [digIdx, setDigIdx] = useState(0)
  const [digAnswer, setDigAnswer] = useState<string | null>(null)
  const [digCorrect, setDigCorrect] = useState(false)
  const [digTyped, setDigTyped] = useState('')

  /* Step 15 tool categories */
  const [toolIdx, setToolIdx] = useState(0)
  const [toolAnswer, setToolAnswer] = useState<string | null>(null)
  const [toolCorrect, setToolCorrect] = useState(false)

  /* Step 16 system topics */
  const [sysIdx, setSysIdx] = useState(0)
  const [sysAnswer, setSysAnswer] = useState<string | null>(null)
  const [sysCorrect, setSysCorrect] = useState(false)

  /* Step 17 observation scenarios */
  const [obsIdx, setObsIdx] = useState(0)
  const [obsPicked, setObsPicked] = useState<string[]>([])
  const [obsChecked, setObsChecked] = useState(false)
  const [obsCorrect, setObsCorrect] = useState(false)

  /* Step 18 site decisions */
  const [siteIdx, setSiteIdx] = useState(0)
  const [siteAnswer, setSiteAnswer] = useState<string | null>(null)
  const [siteCorrect, setSiteCorrect] = useState(false)
  const [logForm, setLogForm] = useState({ date: '', tasks: '', supervisor: '' })

  /* Step 19 honesty */
  const [honestyChecked, setHonestyChecked] = useState(false)

  /* Step 20 employment prep */
  const [empIdx, setEmpIdx] = useState(0)
  const [empAnswer, setEmpAnswer] = useState<string | null>(null)
  const [empCorrect, setEmpCorrect] = useState(false)
  const [empForm, setEmpForm] = useState({ resume_goal: '', availability: '' })
  const [empQuizDone, setEmpQuizDone] = useState(false)

  useEffect(() => { saveStep(step) }, [step])
  useEffect(() => { if (student?.preferred_language) setSupportLang(student.preferred_language as SupportLang) }, [student?.preferred_language])
  useEffect(() => { primeSpeech() }, [])
  useEffect(() => () => { stopSpeech() }, [])
  useEffect(() => {
    const skill = SKILL_BY_STEP[step]
    if (skill) markSkillOpened(skill)
  }, [step])

  /* Practice mode skips registration entirely */
  useEffect(() => {
    if (!isPracticeMode()) return
    if (step < PRACTICE_ENTRY_STEP) {
      setStep(PRACTICE_ENTRY_STEP)
      saveStep(PRACTICE_ENTRY_STEP)
    }
  }, [step])

  /* Banner "Start over" / fresh Practice Mode entry — jump back to language step */
  useEffect(() => {
    const onRestart = () => {
      if (!isPracticeMode()) return
      setEmpDone(false)
      setEmpQuizDone(false)
      setObsIdx(0)
      setObsPicked([])
      setObsChecked(false)
      setObsCorrect(false)
      setSiteIdx(0)
      setSiteAnswer(null)
      setSiteCorrect(false)
      setDigIdx(0)
      setDigAnswer(null)
      setDigCorrect(false)
      setDigTyped('')
      setLogForm({ date: '', tasks: '', supervisor: '' })
      setEmpForm({ resume_goal: '', availability: '' })
      setEmpIdx(0)
      setEmpAnswer(null)
      setEmpCorrect(false)
      setError(null)
      setTransitioning(false)
      setStep(PRACTICE_ENTRY_STEP)
      saveStep(PRACTICE_ENTRY_STEP)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('pa-practice-restarted', onRestart)
    return () => window.removeEventListener('pa-practice-restarted', onRestart)
  }, [])

  function go(next: number, message?: string) {
    stopSpeech()
    setError(null)
    setSpeaking(null)
    const target = Math.min(20, Math.max(1, next))
    if (target === step) {
      setStep(target)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setTransitionMsg(message || `Moving to step ${target}…`)
    setTransitioning(true)
    void unlockFoley().then(() => {
      playFoley('ambient-start')
      playFoley('hammer')
    })
    window.setTimeout(() => {
      setStep(target)
      setTransitioning(false)
      playFoley('ambient-stop')
      playFoley('whoosh')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 900)
  }

  /** Practice mode: ask for feedback at unit boundaries before leaving via in-panel Continues. */
  function requestPracticeAdvance(advance: () => void) {
    if (!isPracticeMode() || !shouldAskPracticeFeedback(step)) {
      advance()
      return
    }
    const key = practiceFeedbackKey('/journey', step)
    if (hasPracticeFeedbackAck(key)) {
      advance()
      return
    }
    practiceAdvanceRef.current = advance
    const panel = document.querySelector('.train-panel')
    if (panel) (panel as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'end' })
    window.setTimeout(() => setPracticeAdvancePrompt(true), 420)
  }

  function confirmPracticeAdvanceYes() {
    markPracticeFeedbackAck(practiceFeedbackKey('/journey', step))
    setPracticeAdvancePrompt(false)
    const fn = practiceAdvanceRef.current
    practiceAdvanceRef.current = null
    playFoley('wood')
    fn?.()
  }

  function confirmPracticeAdvanceNo() {
    setPracticeAdvancePrompt(false)
    practiceAdvanceRef.current = null
    openPracticeChat()
  }

  function Shell(props: {
    step: number; children: ReactNode; onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean
  }) {
    return (
      <>
        <StepShell
          {...props}
          transitioning={transitioning}
          transitionMsg={transitionMsg}
          supportLang={props.step >= 3 && props.step <= 6 ? supportLang : undefined}
        />
        {practiceAdvancePrompt && (
          <div className="practice-next-gate" role="dialog" aria-modal="true" aria-label="Feedback check">
            <div className="practice-next-gate-card">
              <h3>Did you leave feedback on this step?</h3>
              <p>
                Scroll the page and use the feedback chat on the side if something felt unclear. Confirm when you are
                ready to move on.
              </p>
              <div className="practice-next-gate-actions">
                <button type="button" className="btn btn-primary" onClick={confirmPracticeAdvanceYes}>
                  Yes — continue
                </button>
                <button type="button" className="btn btn-ghost" onClick={confirmPracticeAdvanceNo}>
                  Not yet — open chat
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  function resetVocab() {
    setVocabHeard({})
    setVocabSpeakingId(null)
    setVocabIdx(0)
    setSpeaking(null)
    stopSpeech()
  }

  async function playEnglish(text: string) {
    setSpeaking('en')
    stopSpeech()
    await speakEnglish(text)
    setSpeaking(null)
  }

  async function playSupport(text: string, lang: SupportLang = supportLang) {
    setSpeaking('support')
    stopSpeech()
    if (lang === 'English') await speakEnglish(text)
    else await speakSupport(text, lang)
    setSpeaking(null)
  }

  async function playVocabEnglish(term: (typeof VOCAB_UNIT)[number]) {
    setVocabSpeakingId(term.id)
    stopSpeech()
    await speakEnglish(term.english)
    setVocabSpeakingId(null)
    setVocabHeard((h) => ({ ...h, [term.id]: true }))
  }

  async function playVocabLang(term: (typeof VOCAB_UNIT)[number], lang: Exclude<SupportLang, 'English'>) {
    setVocabSpeakingId(term.id)
    stopSpeech()
    await speakSupport(term.gloss[lang], lang)
    setVocabSpeakingId(null)
  }

  function termGloss(term: (typeof VOCAB_UNIT)[number], lang: SupportLang = supportLang) {
    if (lang === 'English') return term.english
    return term.gloss[lang]
  }
  function resetMatch() {
    setMatchIdx(0)
    setMatchAnswer(null)
    setMatchCorrect(false)
    const term = VOCAB_UNIT[0]
    const distractors = VOCAB_UNIT.filter((t) => t.id !== term.id).slice(0, 3)
    setMatchOptions([term, ...distractors].sort(() => Math.random() - 0.5))
  }
  function resetInstr() { setInstrIdx(0); setInstrHeard(false); setInstrAnswer(null); setInstrCorrect(false) }

  function shuffleMatchOptions(idx: number) {
    const term = VOCAB_UNIT[idx]
    const distractors = VOCAB_UNIT.filter((t) => t.id !== term.id).slice(0, 3)
    setMatchOptions([term, ...distractors].sort(() => Math.random() - 0.5))
  }

  async function ensureDemoStudent() {
    if (user?.role === 'student' && student?.registration_status === 'approved') return true
    setError(null)
    const result = await login('student@purposeacademy.ca', DEMO_PASSWORDS.student)
    if (result.error) { setError(result.error); return false }
    try { await refresh() } catch { /* session set */ }
    return true
  }

  async function finishPathway() {
    if (isPracticeMode()) {
      go(7, 'Opening Construction vocabulary…')
      return
    }
    const ok = await ensureDemoStudent()
    if (!ok) return
    try {
      const sid = student?.id
      if (sid) {
        await selectPathway(sid, 'construction')
        await refresh()
      }
      go(7, 'Opening Construction vocabulary…')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save pathway')
      go(7, 'Opening Construction vocabulary…')
    }
  }



  if (step === 1) {
    if (isPracticeMode()) {
      return (
        <Shell step={PRACTICE_ENTRY_STEP} onBack={() => navigate('/')} onNext={() => go(PRACTICE_ENTRY_STEP)}>
          <p className="train-login-lede">Practice mode skips registration. Opening your language step…</p>
        </Shell>
      )
    }
    return (
      <Shell step={1} onBack={() => navigate('/enter/student')} onNext={() => go(2, 'Opening registration…')} nextLabel="Continue as a new student">
        <div className="train-login">
          <img src={BRAND_ASSETS.logoPOpen} alt="" className="train-login-mark" />
          <p className="train-login-lede">
            You are starting the Purpose Academy student path. Registration comes next, then language support,
            then tools, safety, and practice — one clear station at a time.
          </p>
          <div className="train-role-stack">
            <button type="button" className="train-role student" onClick={() => go(2, 'Opening registration…')}>
              Continue as a new student
            </button>
            <Link className="train-role secondary" to="/login?role=student">
              I already have an account
            </Link>
          </div>
          <div className="train-role-alt">
            <Link to="/enter/instructor">Instructor door</Link>
            <span aria-hidden>·</span>
            <Link to="/enter/admin">Admin door</Link>
          </div>
          <TeachNote>
            Students learn and practice. Instructors teach and check skills. Admins manage the school.
          </TeachNote>
        </div>
      </Shell>
    )
  }

  if (step === 2) {
    if (isPracticeMode()) {
      return (
        <Shell step={PRACTICE_ENTRY_STEP} onBack={() => navigate('/')} onNext={() => go(PRACTICE_ENTRY_STEP)}>
          <p className="train-login-lede">Practice mode skips registration. Opening your language step…</p>
        </Shell>
      )
    }
    async function onRegister(e: FormEvent) {
      e.preventDefault()
      if (regForm.password.length < 8) {
        setError('Password needs at least 8 characters.')
        return
      }
      if (regForm.password !== regForm.confirm) {
        setError('Passwords do not match. Type the same password twice.')
        return
      }
      setBusy(true); setError(null)
      const err = await register({
        full_name: regForm.full_name, email: regForm.email, password: regForm.password,
        phone: regForm.phone, address: 'Calgary, AB', emergency_contact: 'Emergency contact',
        preferred_language: regForm.preferred_language || supportLang,
      })
      setBusy(false)
      if (err) {
        if (/exists/i.test(err)) {
          const result = await login(regForm.email, regForm.password)
          if (!result.error) { await refresh(); go(3, 'Opening language choice…'); return }
        }
        setError(err); return
      }
      go(3, 'Opening language choice…')
    }

    return (
      <Shell step={2} onBack={() => go(1)}>
        <TeachNote>
          Write slowly. Short answers are fine. You will choose your mother tongue on the next step.
        </TeachNote>
        <form className="stack" onSubmit={onRegister}>
          {error && <div className="alert error">{error}</div>}
          <div className="field">
            <label htmlFor="seq-name">Full name</label>
            <input id="seq-name" value={regForm.full_name} onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })} required placeholder="First and last name" autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="seq-email">Email</label>
            <input id="seq-email" type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required placeholder="you@email.com" autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="seq-phone">Phone</label>
            <input id="seq-phone" type="tel" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} required placeholder="403-555-0000" autoComplete="tel" />
          </div>
          <div className="field">
            <label htmlFor="seq-password">Password</label>
            <input id="seq-password" type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required minLength={8} placeholder="At least 8 characters" autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="seq-confirm">Confirm password</label>
            <input id="seq-confirm" type="password" value={regForm.confirm} onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })} required minLength={8} placeholder="Type password again" autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="seq-exp">Previous experience</label>
            <input id="seq-exp" value={regForm.previous_experience} onChange={(e) => setRegForm({ ...regForm, previous_experience: e.target.value })} placeholder="Example: helper on building sites — or none yet" />
            <span className="field-hint">&ldquo;None yet&rdquo; is a good answer.</span>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save and continue'}
          </button>
          <button type="button" className="btn btn-secondary on-light" disabled={busy} onClick={async () => {
            setBusy(true); setError(null)
            try { const ok = await ensureDemoStudent(); if (ok) go(3, 'Opening language choice…') }
            catch (e) { setError(e instanceof Error ? e.message : 'Could not sign in.') }
            finally { setBusy(false) }
          }}>
            Continue with demo student account
          </button>
        </form>
      </Shell>
    )
  }

  /* Step 3: Mother tongue — assessment runs fully in this language */
  if (step === 3) {
    return (
      <Shell
        step={3}
        onBack={() => (isPracticeMode() ? navigate('/') : go(2))}
        onNext={() => {
          setRegForm((f) => ({ ...f, preferred_language: supportLang }))
          go(4)
        }}
        nextLabel={assessT(ASSESSMENT_COPY.next, supportLang)}
      >
        <div className="train-lang-pick">
          <h2 className="career-assess-title">{assessT(ASSESSMENT_COPY.langPickTitle, supportLang)}</h2>
          <p className="career-assess-lede">{assessT(ASSESSMENT_COPY.langPickBody, supportLang)}</p>
          <div className="train-lang-grid">
            {SUPPORT_LANGUAGES.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`train-lang${supportLang === l.id ? ' is-selected' : ''}`}
                onClick={() => setSupportLang(l.id)}
                lang={
                  l.id === 'English'
                    ? 'en'
                    : l.id === 'Arabic'
                      ? 'ar'
                      : l.id === 'Hindi'
                        ? 'hi'
                        : l.id === 'Amharic'
                          ? 'am'
                          : l.id === 'Tigrinya'
                            ? 'ti'
                            : 'es'
                }
              >
                <span aria-hidden>{l.flag}</span>
                <strong>{assessT(LANG_NATIVE, l.id)}</strong>
              </button>
            ))}
          </div>
          <div className="train-bridge">
            <p><strong>{assessT(ASSESSMENT_COPY.introTitle, supportLang)}</strong></p>
            <p>{assessT(ASSESSMENT_COPY.introBody, supportLang)}</p>
          </div>
          <p className="career-assess-lede">{assessT(ASSESSMENT_COPY.langPickHint, supportLang)}</p>
        </div>
      </Shell>
    )
  }

  if (step === 4) {
    return (
      <Shell step={4}>
        <CareerInterestAssessment
          lang={supportLang}
          answers={careerInterestAnswers}
          onChange={(id, value) => setCareerInterestAnswers((a) => ({ ...a, [id]: value }))}
          onBack={() => go(3)}
          onComplete={(finalAnswers) => {
            setCareerInterestAnswers(finalAnswers)
            setRiasecScores(scoreInterestAnswers(finalAnswers))
            go(5)
          }}
        />
      </Shell>
    )
  }

  /* Step 5: Work-style fit (mother tongue) */
  if (step === 5) {
    return (
      <Shell step={5}>
        <CareerStyleAssessment
          lang={supportLang}
          answers={careerStyleAnswers}
          onChange={(id, optionId) => setCareerStyleAnswers((a) => ({ ...a, [id]: optionId }))}
          onBack={() => go(4)}
          onComplete={(finalStyle) => {
            setCareerStyleAnswers(finalStyle)
            const interestPct = scoreInterestAnswers(careerInterestAnswers)
            setRiasecScores(interestPct)
            const combined = combinePathwayScores(pathwayFromRiasec(interestPct), scoreStyleAnswers(finalStyle))
            setInterest(topPathway(combined))
            go(6, assessT(ASSESSMENT_COPY.seeResults, supportLang))
          }}
        />
      </Shell>
    )
  }

  /* Step 6: Career profile result (mother tongue) */
  if (step === 6) {
    const pathway = interest || 'construction'
    const ranked = rankedRiasec(riasecScores)
    const pathwayScores = combinePathwayScores(
      pathwayFromRiasec(riasecScores),
      scoreStyleAnswers(careerStyleAnswers),
    )
    return (
      <Shell step={6}>
        <CareerAssessmentResult
          lang={supportLang}
          pathway={pathway}
          riasec={riasecScores}
          pathwayScores={pathwayScores}
          ranked={ranked}
          busy={busy}
          error={error}
          onBack={() => go(5)}
          onContinue={() => {
            void (async () => {
              setBusy(true)
              await finishPathway()
              setBusy(false)
            })()
          }}
        />
      </Shell>
    )
  }

  /* Step 7: Visual Vocabulary — one picture/word at a time through the full set */
  if (step === 7) {
    const heardCount = VOCAB_UNIT.filter((t) => vocabHeard[t.id]).length
    const ready = heardCount >= VOCAB_UNIT.length

    return (
      <Shell
        step={7}
        onBack={() => go(6)}
        onNext={ready ? () => { setActionIdx(0); setActionAnswer(null); setActionCorrect(false); go(8) } : undefined}
        nextLabel="Continue to Word → Action"
        nextDisabled={!ready}
      >
        <VocabSheet
          terms={VOCAB_UNIT}
          index={vocabIdx}
          supportLang={supportLang}
          speakingId={vocabSpeakingId}
          heard={vocabHeard}
          onIndexChange={setVocabIdx}
          onPlayEnglish={(term) => void playVocabEnglish(term)}
          onPlayLang={(term, lang) => void playVocabLang(term, lang)}
        />
        <p className="train-vocab-counter">
          {ready
            ? `Heard all ${VOCAB_UNIT.length} English words · Ready to continue`
            : `Heard ${heardCount} of ${VOCAB_UNIT.length} English words`}
        </p>
      </Shell>
    )
  }

  /* Step 8: Word → Action — see action, check which tool */
  if (step === 8) {
    const item = WORD_ACTIONS[actionIdx]
    const term = VOCAB_UNIT.find((t) => t.id === item.termId)
    const isLast = actionIdx >= WORD_ACTIONS.length - 1
    const options = [
      term?.english || item.termId,
      ...VOCAB_UNIT.filter((t) => t.id !== item.termId).slice(0, 3).map((t) => t.english),
    ]

    function pickAction(opt: string) {
      if (actionAnswer) return
      const ok = opt === term?.english
      setActionAnswer(opt)
      setActionCorrect(ok)
      recordSkillAttempt('word-action', ok)
      playFoley(ok ? 'correct' : 'wrong')
    }

    function nextAction() {
      if (!actionCorrect) {
        setActionAnswer(null)
        setActionCorrect(false)
        return
      }
      if (isLast) {
        resetMatch()
        go(9)
        return
      }
      setActionIdx((i) => i + 1)
      setActionAnswer(null)
      setActionCorrect(false)
    }

    return (
      <Shell step={8} onBack={() => { resetVocab(); go(7) }}>
        <p className="train-vocab-counter">Action {actionIdx + 1} of {WORD_ACTIONS.length}</p>
        <article className="word-action-card">
          <PictureCard
            image={toolImage(term?.imageKey)}
            fit="contain"
            label={item.title}
            caption={item.body}
          />
          <p className="word-action-cue"><strong>Action cue:</strong> {item.actionCue}</p>
          <p className="train-check-prompt">Which tool is this action for?</p>
          <div className="train-choice-grid">
            {options.map((opt) => (
              <ChoiceButton
                key={opt}
                state={actionAnswer === opt ? (actionCorrect ? 'correct' : 'wrong') : actionAnswer ? (opt === term?.english ? 'correct' : 'idle') : 'idle'}
                disabled={!!actionAnswer && opt !== actionAnswer && opt !== term?.english}
                onClick={() => pickAction(opt)}
              >
                {opt}
              </ChoiceButton>
            ))}
          </div>
          {actionAnswer && (
            <>
              <div className={`alert ${actionCorrect ? 'ok' : 'warn'}`}>
                {actionCorrect ? 'Yes — word and action match.' : `Not yet. This action uses the ${term?.english}.`}
              </div>
              <button type="button" className="btn btn-primary" onClick={nextAction}>
                {actionCorrect
                  ? (isLast ? 'Continue to supported practice' : 'Next action')
                  : 'Try again'}
              </button>
            </>
          )}
        </article>
      </Shell>
    )
  }

  /* Step 9: Supported matching */
  if (step === 9) {
    const term = VOCAB_UNIT[matchIdx]
    const isLast = matchIdx >= VOCAB_UNIT.length - 1

    function pickMatch(opt: string) {
      if (matchAnswer) return
      const ok = opt === term.english
      setMatchAnswer(opt)
      setMatchCorrect(ok)
      recordSkillAttempt('matching', ok)
      playFoley(ok ? 'correct' : 'wrong')
    }

    function nextMatch() {
      if (!matchCorrect) {
        setMatchAnswer(null)
        setMatchCorrect(false)
        return
      }
      if (isLast) {
        requestPracticeAdvance(() => go(10, 'Opening English Eye Spy…'))
        return
      }
      const next = matchIdx + 1
      setMatchIdx(next)
      setMatchAnswer(null)
      setMatchCorrect(false)
      shuffleMatchOptions(next)
    }

    return (
      <Shell step={9} onBack={() => go(8)}>
        <p className="train-vocab-counter">Match {matchIdx + 1} of {VOCAB_UNIT.length}</p>
        <PictureCard
          image={toolImage(term.imageKey)}
          fit="contain"
          label="Match the word to the picture"
          sub={supportLang === 'English' ? 'English word' : `${supportLang}: ${termGloss(term)}`}
          caption="Still supported — translation and audio are allowed here."
        />
        <div className="train-audio-row">
          <button type="button" className="btn btn-secondary on-light" disabled={speaking !== null} onClick={() => void playEnglish(term.english)}>Hear English</button>
          {supportLang !== 'English' && (
            <button type="button" className="btn btn-secondary on-light" disabled={speaking !== null} onClick={() => void playSupport(termGloss(term))}>Hear {supportLang}</button>
          )}
        </div>
        <div className="train-choice-grid">
          {matchOptions.map((opt) => (
            <ChoiceButton
              key={opt.id}
              state={matchAnswer === opt.english ? (matchCorrect ? 'correct' : 'wrong') : matchAnswer ? (opt.english === term.english ? 'correct' : 'idle') : 'idle'}
              disabled={!!matchAnswer && opt.english !== matchAnswer && opt.english !== term.english}
              onClick={() => pickMatch(opt.english)}
            >
              {opt.english}
            </ChoiceButton>
          ))}
        </div>
        {matchAnswer && (
          <>
            <div className={`alert ${matchCorrect ? 'ok' : 'warn'}`}>
              {matchCorrect ? 'Yes — picture and word match.' : `Not yet. The correct word is ${term.english}. Try again.`}
            </div>
            <button type="button" className="btn btn-primary" onClick={nextMatch}>
              {matchCorrect
                ? (isLast ? 'Continue to English Eye Spy' : 'Next match')
                : 'Try again'}
            </button>
          </>
        )}
      </Shell>
    )
  }

  /* Step 10: English Eye Spy exercise (unlimited) */
  if (step === 10) {
    return (
      <Shell step={10} onBack={() => { resetMatch(); go(9) }}>
        <WhyWork>On a real site the tool sits among other objects. Prove you can find it.</WhyWork>
        <TeachNote>Exercise mode: unlimited tries. Pass requires 100% with no misses. Wrong answers change the scene.</TeachNote>
        <EyeSpyQuiz scenes={EYE_SPY_SCENES} mode="exercise" onComplete={() => { resetInstr(); go(11) }} />
      </Shell>
    )
  }

  /* Step 11: Workplace instructions — English only */
  if (step === 11) {
    const instr = WORKPLACE_INSTRUCTIONS[instrIdx]
    const isLast = instrIdx >= WORKPLACE_INSTRUCTIONS.length - 1

    function pickInstr(opt: string) {
      if (instrAnswer || !instrHeard) return
      const ok = opt === instr.correct
      setInstrAnswer(opt)
      setInstrCorrect(ok)
      recordSkillAttempt('instructions', ok)
      playFoley(ok ? 'correct' : 'wrong')
    }

    function nextInstr() {
      if (!instrCorrect) {
        setInstrAnswer(null)
        setInstrCorrect(false)
        return
      }
      if (isLast) {
        requestPracticeAdvance(() => go(12, 'Opening site language…'))
        return
      }
      setInstrIdx((i) => i + 1)
      setInstrHeard(false)
      setInstrAnswer(null)
      setInstrCorrect(false)
    }

    return (
      <Shell step={11} onBack={() => go(10)}>
        <WhyWork>Supervisors give short directions. Hearing and acting keeps the team safe.</WhyWork>
        <p className="train-vocab-counter">Instruction {instrIdx + 1} of {WORKPLACE_INSTRUCTIONS.length} · English only</p>
        <div className="train-instruction">
          <PictureCard
            image={toolImage(instr.imageKey)}
            fit="contain"
            label="A worker gives a direction"
            caption="Listen in English (required). Mother-tongue help is optional only."
          />
          <blockquote>&ldquo;{instr.text}&rdquo;</blockquote>
          <div className="train-audio-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={speaking !== null}
              onClick={() => {
                void (async () => {
                  await playEnglish(instr.text)
                  setInstrHeard(true)
                })()
              }}
            >
              {speaking === 'en' ? 'Playing…' : 'Hear English'}
            </button>
            {supportLang !== 'English' && (
              <button
                type="button"
                className="btn btn-ghost"
                disabled={speaking !== null}
                onClick={() => void playSupport(instr.supportHint[supportLang])}
              >
                Optional {supportLang} hint
              </button>
            )}
          </div>
          {!instrHeard && <p className="muted">Hear the English instruction at least once before you answer.</p>}
          <p><strong>What should you do?</strong></p>
          <div className="train-choice-grid">
            {instr.options.map((opt) => (
              <ChoiceButton
                key={opt}
                state={instrAnswer === opt ? (instrCorrect ? 'correct' : 'wrong') : instrAnswer ? (opt === instr.correct ? 'correct' : 'idle') : 'idle'}
                disabled={!instrHeard || (!!instrAnswer && opt !== instrAnswer && opt !== instr.correct)}
                onClick={() => pickInstr(opt)}
              >
                {opt}
              </ChoiceButton>
            ))}
          </div>
        </div>
        {instrAnswer && (
          <>
            <div className={`alert ${instrCorrect ? 'ok' : 'warn'}`}>
              {instrCorrect ? 'Yes. You heard the tool name and the action.' : `Not yet. The correct action was: "${instr.correct}". Try again.`}
            </div>
            <button type="button" className="btn btn-primary" onClick={nextInstr}>
              {instrCorrect
                ? (isLast ? 'Continue to site language' : 'Next instruction')
                : 'Try again'}
            </button>
          </>
        )}
      </Shell>
    )
  }

  /* Step 12: Site language — hear phrase, choose meaning, one by one */
  if (step === 12) {
    const phrase = SITE_PHRASES[Math.min(phraseIdx, SITE_PHRASES.length - 1)]
    const isLast = phraseIdx >= SITE_PHRASES.length - 1

    function pickPhrase(opt: string) {
      if (!phraseHeard || phraseAnswer) return
      const ok = opt === phrase.answer
      setPhraseAnswer(opt)
      setPhraseCorrect(ok)
      recordSkillAttempt('site-phrases', ok)
      playFoley(ok ? 'correct' : 'wrong')
    }

    function nextPhrase() {
      if (!phraseCorrect) {
        setPhraseAnswer(null)
        setPhraseCorrect(false)
        return
      }
      if (isLast) {
        go(13, 'Opening digital skills…')
        return
      }
      setPhraseIdx((i) => i + 1)
      setPhraseHeard(false)
      setPhraseAnswer(null)
      setPhraseCorrect(false)
    }

    return (
      <Shell step={12} onBack={() => { resetInstr(); go(11) }}>
        <p className="train-vocab-counter">Phrase {phraseIdx + 1} of {SITE_PHRASES.length}</p>
        <article className="phrase-lesson-card">
          <p className="phrase-lesson-en">{phrase.en}</p>
          <button
            type="button"
            className={`btn ${phraseHeard ? 'btn-secondary on-light' : 'btn-primary'}`}
            disabled={speaking !== null}
            onClick={() => {
              void (async () => {
                await playEnglish(phrase.en)
                setPhraseHeard(true)
              })()
            }}
          >
            {phraseHeard ? 'Heard ✓ · Hear again' : 'Hear English'}
          </button>
          <p className="train-check-prompt">What does this phrase mean on site?</p>
          <div className="train-choice-grid">
            {phrase.options.map((opt) => (
              <ChoiceButton
                key={opt}
                state={phraseAnswer === opt ? (phraseCorrect ? 'correct' : 'wrong') : phraseAnswer ? (opt === phrase.answer ? 'correct' : 'idle') : 'idle'}
                disabled={!phraseHeard || (!!phraseAnswer && opt !== phraseAnswer && opt !== phrase.answer)}
                onClick={() => pickPhrase(opt)}
              >
                {opt}
              </ChoiceButton>
            ))}
          </div>
          {phraseAnswer && (
            <>
              <div className={`alert ${phraseCorrect ? 'ok' : 'warn'}`}>
                {phraseCorrect ? `Yes — ${phrase.why}` : `Not yet. ${phrase.why}`}
              </div>
              <button type="button" className="btn btn-primary" onClick={nextPhrase}>
                {phraseCorrect
                  ? (isLast ? 'Continue to digital skills' : 'Next phrase')
                  : 'Try again'}
              </button>
            </>
          )}
        </article>
      </Shell>
    )
  }

  if (step === 13) {
    const item = DIGITAL_PRACTICE[digIdx]
    const isLast = digIdx >= DIGITAL_PRACTICE.length - 1
    const isType = 'kind' in item && item.kind === 'type'

    function pickDig(opt: string) {
      if (digAnswer) return
      const ok = opt.toLowerCase() === item.answer.toLowerCase()
      setDigAnswer(opt)
      setDigCorrect(ok)
      recordSkillAttempt('digital', ok)
      playFoley(ok ? 'correct' : 'wrong')
    }

    function submitTyped(e: FormEvent) {
      e.preventDefault()
      pickDig(digTyped.trim())
    }

    function nextDig() {
      if (!digCorrect) {
        setDigAnswer(null)
        setDigCorrect(false)
        setDigTyped('')
        return
      }
      if (isLast) {
        go(14, 'Opening safety…')
        return
      }
      setDigIdx((i) => i + 1)
      setDigAnswer(null)
      setDigCorrect(false)
      setDigTyped('')
    }

    return (
      <Shell step={13} onBack={() => go(12)}>
        <WhyWork>Many learners are new to computers. Practice the exact clicks and typing school work needs.</WhyWork>
        <TeachNote>Each card is a real micro-task: learn → try → feedback → next. Empty honesty is fine — wrong answers teach.</TeachNote>
        <p className="train-vocab-counter">Digital skill {digIdx + 1} of {DIGITAL_PRACTICE.length}</p>
        <article className="topic-lesson-card">
          <h3>{item.title}</h3>
          <p>{item.teach}</p>
          <p className="train-check-prompt">{item.prompt}</p>
          {isType ? (
            <form className="stack" onSubmit={submitTyped}>
              <div className="field">
                <label htmlFor="dig-type">Type your answer</label>
                <input
                  id="dig-type"
                  value={digTyped}
                  onChange={(e) => setDigTyped(e.target.value)}
                  disabled={!!digAnswer}
                  autoComplete="off"
                  required
                />
              </div>
              {!digAnswer && (
                <button type="submit" className="btn btn-primary" disabled={!digTyped.trim()}>
                  Check spelling
                </button>
              )}
            </form>
          ) : (
            <div className="train-choice-grid">
              {(item.options || []).map((opt) => (
                <ChoiceButton
                  key={opt}
                  state={digAnswer === opt ? (digCorrect ? 'correct' : 'wrong') : digAnswer ? (opt === item.answer ? 'correct' : 'idle') : 'idle'}
                  disabled={!!digAnswer && opt !== digAnswer && opt !== item.answer}
                  onClick={() => pickDig(opt)}
                >
                  {opt}
                </ChoiceButton>
              ))}
            </div>
          )}
          {digAnswer && (
            <>
              <div className={`alert ${digCorrect ? 'ok' : 'warn'}`}>
                {digCorrect ? item.teachCorrect : item.teachWrong}
              </div>
              <button type="button" className="btn btn-primary" onClick={nextDig}>
                {digCorrect
                  ? (isLast ? 'Continue to safety' : 'Next digital skill')
                  : 'Try again'}
              </button>
            </>
          )}
        </article>
      </Shell>
    )
  }

  if (step === 14) {
    return (
      <Shell step={14} onBack={() => go(13)}>
        <QuizRunner items={SAFETY_QUIZ} onComplete={() => { setToolIdx(0); setToolAnswer(null); setToolCorrect(false); go(15) }} gated />
      </Shell>
    )
  }

  if (step === 15) {
    const cat = TOOL_CATEGORIES[Math.min(toolIdx, TOOL_CATEGORIES.length - 1)]
    const isLast = toolIdx >= TOOL_CATEGORIES.length - 1

    function pickTool(opt: string) {
      if (toolAnswer) return
      const ok = opt === cat.answer
      setToolAnswer(opt)
      setToolCorrect(ok)
      recordSkillAttempt('tools', ok)
      playFoley(ok ? 'correct' : 'wrong')
    }

    function nextTool() {
      if (!toolCorrect) {
        setToolAnswer(null)
        setToolCorrect(false)
        return
      }
      if (isLast) {
        setSysIdx(0)
        setSysAnswer(null)
        setSysCorrect(false)
        go(16)
        return
      }
      setToolIdx((i) => i + 1)
      setToolAnswer(null)
      setToolCorrect(false)
    }

    return (
      <Shell step={15} onBack={() => go(14)}>
        <p className="train-vocab-counter">Tool group {toolIdx + 1} of {TOOL_CATEGORIES.length}</p>
        <article className="topic-lesson-card">
          <span className="train-topic-mark">{cat.mark}</span>
          <h3>{cat.title}</h3>
          <p>{cat.why}</p>
          <p className="train-check-prompt">{cat.prompt}</p>
          <div className="train-choice-grid">
            {cat.options.map((opt) => (
              <ChoiceButton
                key={opt}
                state={toolAnswer === opt ? (toolCorrect ? 'correct' : 'wrong') : toolAnswer ? (opt === cat.answer ? 'correct' : 'idle') : 'idle'}
                disabled={!!toolAnswer && opt !== toolAnswer && opt !== cat.answer}
                onClick={() => pickTool(opt)}
              >
                {opt}
              </ChoiceButton>
            ))}
          </div>
          {toolAnswer && (
            <>
              <div className={`alert ${toolCorrect ? 'ok' : 'warn'}`}>
                {toolCorrect ? 'Correct.' : `Not yet. The answer is ${cat.answer}.`}
              </div>
              <button type="button" className="btn btn-primary" onClick={nextTool}>
                {toolCorrect
                  ? (isLast ? 'Continue to systems' : 'Next tool group')
                  : 'Try again'}
              </button>
            </>
          )}
        </article>
      </Shell>
    )
  }

  if (step === 16) {
    const topic = SYSTEM_TOPICS[Math.min(sysIdx, SYSTEM_TOPICS.length - 1)]
    const isLast = sysIdx >= SYSTEM_TOPICS.length - 1

    function pickSys(opt: string) {
      if (sysAnswer) return
      const ok = opt === topic.answer
      setSysAnswer(opt)
      setSysCorrect(ok)
      recordSkillAttempt('systems', ok)
      playFoley(ok ? 'correct' : 'wrong')
    }

    function nextSys() {
      if (!sysCorrect) {
        setSysAnswer(null)
        setSysCorrect(false)
        return
      }
      if (isLast) {
        go(17)
        return
      }
      setSysIdx((i) => i + 1)
      setSysAnswer(null)
      setSysCorrect(false)
    }

    return (
      <Shell step={16} onBack={() => go(15)}>
        <p className="train-vocab-counter">System {sysIdx + 1} of {SYSTEM_TOPICS.length}</p>
        <article className="topic-lesson-card">
          <span className="train-topic-mark">{topic.mark}</span>
          <h3>{topic.title}</h3>
          <p>{topic.why}</p>
          <p className="train-check-prompt">{topic.prompt}</p>
          <div className="train-choice-grid">
            {topic.options.map((opt) => (
              <ChoiceButton
                key={opt}
                state={sysAnswer === opt ? (sysCorrect ? 'correct' : 'wrong') : sysAnswer ? (opt === topic.answer ? 'correct' : 'idle') : 'idle'}
                disabled={!!sysAnswer && opt !== sysAnswer && opt !== topic.answer}
                onClick={() => pickSys(opt)}
              >
                {opt}
              </ChoiceButton>
            ))}
          </div>
          {sysAnswer && (
            <>
              <div className={`alert ${sysCorrect ? 'ok' : 'warn'}`}>
                {sysCorrect ? 'Correct.' : `Not yet. The answer is ${topic.answer}.`}
              </div>
              <button type="button" className="btn btn-primary" onClick={nextSys}>
                {sysCorrect
                  ? (isLast ? 'Continue to observation' : 'Next system')
                  : 'Try again'}
              </button>
            </>
          )}
        </article>
      </Shell>
    )
  }

  if (step === 17) {
    const scenario = OBSERVATION_SCENARIOS[obsIdx]
    const isLast = obsIdx >= OBSERVATION_SCENARIOS.length - 1
    const ordered = [...scenario.steps].sort((a, b) => a.correctOrder - b.correctOrder)

    function toggleObsStep(id: string) {
      if (obsChecked) return
      setObsPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    }

    function checkObsOrder() {
      const expected = ordered.map((s) => s.id)
      const ok = obsPicked.length === expected.length && obsPicked.every((id, i) => id === expected[i])
      setObsChecked(true)
      setObsCorrect(ok)
      recordSkillAttempt('observation', ok)
      playFoley(ok ? 'correct' : 'wrong')
      try {
        sessionStorage.setItem(OBS_KEY, JSON.stringify({ scenario: scenario.id, picked: obsPicked, ok }))
      } catch { /* */ }
    }

    function nextObs() {
      if (!obsCorrect) {
        setObsPicked([])
        setObsChecked(false)
        setObsCorrect(false)
        return
      }
      if (isLast) {
        go(18, 'Opening on-site decisions…')
        return
      }
      setObsIdx((i) => i + 1)
      setObsPicked([])
      setObsChecked(false)
      setObsCorrect(false)
    }

    return (
      <Shell step={17} onBack={() => go(16)}>
        <WhyWork>Before a real instructor watches you, rehearse the competent order of a skill.</WhyWork>
        <div className="train-learn-grid">
          <LearnCard mark="L" title="Learned" body="Studied in the app or class." />
          <LearnCard mark="P" title="Practised" body="Tried with supervision." />
          <LearnCard mark="C" title="Competent" body="Authorized instructor confirmed the standard." />
        </div>
        <p className="train-vocab-counter">Observation drill {obsIdx + 1} of {OBSERVATION_SCENARIOS.length}</p>
        <article className="topic-lesson-card">
          <h3>{scenario.title}</h3>
          <p><strong>Situation:</strong> {scenario.situation}</p>
          <p className="muted">Skill focus: {scenario.skill}</p>
          <p className="train-check-prompt">Tap the steps in the correct order (1 → {scenario.steps.length}).</p>
          <div className="train-choice-grid">
            {scenario.steps.map((s) => {
              const pickedAt = obsPicked.indexOf(s.id)
              return (
                <ChoiceButton
                  key={s.id}
                  state={
                    obsChecked
                      ? (pickedAt === s.correctOrder - 1 ? 'correct' : pickedAt >= 0 ? 'wrong' : 'idle')
                      : pickedAt >= 0
                        ? 'correct'
                        : 'idle'
                  }
                  disabled={obsChecked}
                  onClick={() => toggleObsStep(s.id)}
                >
                  {pickedAt >= 0 ? `${pickedAt + 1}. ${s.label}` : s.label}
                </ChoiceButton>
              )
            })}
          </div>
          {!obsChecked && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={obsPicked.length !== scenario.steps.length}
              onClick={checkObsOrder}
            >
              Check my order
            </button>
          )}
          {obsChecked && (
            <>
              <div className={`alert ${obsCorrect ? 'ok' : 'warn'}`}>
                {obsCorrect ? scenario.passNote : `Not yet. Correct order: ${ordered.map((s) => s.label).join(' → ')}`}
              </div>
              <button type="button" className="btn btn-primary" onClick={nextObs}>
                {obsCorrect
                  ? (isLast ? 'Continue to on-site training' : 'Next observation drill')
                  : 'Try again'}
              </button>
            </>
          )}
        </article>
      </Shell>
    )
  }

  if (step === 18) {
    const item = SITE_DECISIONS[siteIdx]
    const isLast = siteIdx >= SITE_DECISIONS.length - 1

    function pickSite(opt: string) {
      if (siteAnswer) return
      const ok = opt === item.answer
      setSiteAnswer(opt)
      setSiteCorrect(ok)
      recordSkillAttempt('site-log', ok)
      playFoley(ok ? 'correct' : 'wrong')
    }

    function nextSite() {
      if (!siteCorrect) {
        setSiteAnswer(null)
        setSiteCorrect(false)
        return
      }
      if (isLast) {
        try {
          sessionStorage.setItem(LOG_KEY, JSON.stringify({
            date: logForm.date || new Date().toISOString().slice(0, 10),
            tasks: logForm.tasks || 'Completed site decision practice',
            supervisor: logForm.supervisor || 'Practice supervisor',
            decisions: SITE_DECISIONS.length,
          }))
        } catch { /* */ }
        setFinalPhase('eyespy')
        go(19, 'Opening final exam…')
        return
      }
      setSiteIdx((i) => i + 1)
      setSiteAnswer(null)
      setSiteCorrect(false)
    }

    return (
      <Shell step={18} onBack={() => go(17)}>
        <WhyWork>On-site days need judgment and a clear log — practice both before the exam.</WhyWork>
        <p className="train-vocab-counter">Site decision {siteIdx + 1} of {SITE_DECISIONS.length}</p>
        <article className="topic-lesson-card">
          <h3>{item.title}</h3>
          <p><strong>Scene:</strong> {item.scene}</p>
          <p className="train-check-prompt">{item.prompt}</p>
          <div className="train-choice-grid">
            {item.options.map((opt) => (
              <ChoiceButton
                key={opt}
                state={siteAnswer === opt ? (siteCorrect ? 'correct' : 'wrong') : siteAnswer ? (opt === item.answer ? 'correct' : 'idle') : 'idle'}
                disabled={!!siteAnswer && opt !== siteAnswer && opt !== item.answer}
                onClick={() => pickSite(opt)}
              >
                {opt}
              </ChoiceButton>
            ))}
          </div>
          {siteAnswer && (
            <>
              <div className={`alert ${siteCorrect ? 'ok' : 'warn'}`}>
                {siteCorrect ? item.teachCorrect : item.teachWrong}
              </div>
              <button type="button" className="btn btn-primary" onClick={nextSite}>
                {siteCorrect
                  ? (isLast ? 'Continue to final exam' : 'Next site decision')
                  : 'Try again'}
              </button>
            </>
          )}
        </article>
        {isLast && siteCorrect && (
          <div className="stack" style={{ marginTop: '1rem' }}>
            <h3>Quick daily log</h3>
            <p className="muted">Capture the habit employers expect — date, tasks, supervisor.</p>
            <div className="field">
              <label htmlFor="log-date">Date</label>
              <input id="log-date" type="date" value={logForm.date} onChange={(e) => setLogForm({ ...logForm, date: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="log-tasks">Tasks today</label>
              <textarea id="log-tasks" value={logForm.tasks} onChange={(e) => setLogForm({ ...logForm, tasks: e.target.value })} rows={2} placeholder="e.g. Measured boards, helped cut three pieces" />
            </div>
            <div className="field">
              <label htmlFor="log-sup">Supervisor</label>
              <input id="log-sup" value={logForm.supervisor} onChange={(e) => setLogForm({ ...logForm, supervisor: e.target.value })} placeholder="e.g. Jordan" />
            </div>
          </div>
        )}
      </Shell>
    )
  }

  /* Step 19: Final Eye Spy exam (up to 3 attempts) + written + certificate */
  if (step === 19) {
    if (finalPhase === 'eyespy') {
      return (
        <Shell step={19} onBack={() => go(18)}>
          <PictureCard emoji="E" label="Final vocabulary Eye Spy" caption="Exam mode — up to 3 tries. 100% required. Scenes change on misses." />
          <EyeSpyQuiz scenes={EYE_SPY_SCENES} mode="exam" onComplete={() => { recordSkillAttempt('final-exam', true); setFinalPhase('written') }} />
        </Shell>
      )
    }
    if (finalPhase === 'written') {
      return (
        <Shell step={19} onBack={() => setFinalPhase('eyespy')}>
          <PictureCard emoji="W" label="Written & knowledge check" caption="Safety, measurement, language, and tools. Perfect score required." />
          <QuizRunner items={FINAL_QUIZ} onComplete={() => { recordSkillAttempt('final-exam', true); setFinalPhase('certificate') }} gated />
        </Shell>
      )
    }
    return (
      <Shell
        step={19}
        onBack={() => setFinalPhase('written')}
        onNext={honestyChecked ? () => go(20, 'Opening employment…') : undefined}
        nextLabel="Continue to employment"
        nextDisabled={!honestyChecked}
      >
        <div className="train-passport">
          <PictureCard emoji="C" label="Purpose Academy Program Certificate" caption="You passed the exam mix. Your Skills Passport collects verified evidence." />
          <ul className="list-plain">
            <li>Vocabulary Eye Spy passed at 100%</li>
            <li>Written / knowledge check complete</li>
            <li>Digital Skills Passport you can share</li>
          </ul>
          <label className="train-honesty-check">
            <input type="checkbox" checked={honestyChecked} onChange={() => setHonestyChecked(!honestyChecked)} />
            <span>I understand what this certificate shows and does not show.</span>
          </label>
          <Link className="btn btn-ghost" to="/app/student/skills">View Skills Passport →</Link>
        </div>
      </Shell>
    )
  }

  function handleComplete(e: FormEvent) {
    e.preventDefault()
    try { sessionStorage.setItem(EMP_KEY, JSON.stringify({ ...empForm, prepDone: true })) } catch { /* */ }
    markSequenceComplete('student', { detail: user?.full_name || 'Student' })
    recordSkillAttempt('employment', true)
    playFoley('metal')
    setEmpDone(true)
  }

  if (!empQuizDone) {
    const item = EMPLOYMENT_PREP[empIdx]
    const isLast = empIdx >= EMPLOYMENT_PREP.length - 1

    function pickEmp(opt: string) {
      if (empAnswer) return
      const ok = opt === item.answer
      setEmpAnswer(opt)
      setEmpCorrect(ok)
      recordSkillAttempt('employment', ok)
      playFoley(ok ? 'correct' : 'wrong')
    }

    function nextEmp() {
      if (!empCorrect) {
        setEmpAnswer(null)
        setEmpCorrect(false)
        return
      }
      if (isLast) {
        setEmpQuizDone(true)
        return
      }
      setEmpIdx((i) => i + 1)
      setEmpAnswer(null)
      setEmpCorrect(false)
    }

    return (
      <Shell step={20} onBack={() => go(19)}>
        <WhyWork>Employment connection starts with clear interview answers — then partner matching.</WhyWork>
        <p className="train-vocab-counter">Interview prep {empIdx + 1} of {EMPLOYMENT_PREP.length}</p>
        <article className="topic-lesson-card">
          <p className="train-check-prompt">{item.prompt}</p>
          <div className="train-choice-grid">
            {item.options.map((opt) => (
              <ChoiceButton
                key={opt}
                state={empAnswer === opt ? (empCorrect ? 'correct' : 'wrong') : empAnswer ? (opt === item.answer ? 'correct' : 'idle') : 'idle'}
                disabled={!!empAnswer && opt !== empAnswer && opt !== item.answer}
                onClick={() => pickEmp(opt)}
              >
                {opt}
              </ChoiceButton>
            ))}
          </div>
          {empAnswer && (
            <>
              <div className={`alert ${empCorrect ? 'ok' : 'warn'}`}>
                {empCorrect ? item.teachCorrect : item.teachWrong}
              </div>
              <button type="button" className="btn btn-primary" onClick={nextEmp}>
                {empCorrect
                  ? (isLast ? 'Continue to partner setup' : 'Next interview question')
                  : 'Try again'}
              </button>
            </>
          )}
        </article>
      </Shell>
    )
  }

  return (
    <Shell step={20} onBack={() => { setEmpQuizDone(false); go(19) }}>
      <PictureCard emoji="H" label="Employment Connection" caption="See hiring partners and enter work with support." />
      {!empDone ? (
        <form className="stack" onSubmit={handleComplete}>
          <div className="alert ok">
            Partner focus: construction employers who understand this pathway.
          </div>
          <h3>Employment readiness</h3>
          <div className="field">
            <label htmlFor="emp-goal">Target construction role</label>
            <textarea id="emp-goal" value={empForm.resume_goal} onChange={(e) => setEmpForm({ ...empForm, resume_goal: e.target.value })} required rows={3} placeholder="e.g. Construction helper / framing crew" />
          </div>
          <div className="field">
            <label htmlFor="emp-avail">Availability</label>
            <input id="emp-avail" value={empForm.availability} onChange={(e) => setEmpForm({ ...empForm, availability: e.target.value })} required placeholder="e.g. Weekdays, full-time" />
          </div>
          <button className="btn btn-primary" type="submit">Complete student training path</button>
        </form>
      ) : (
        <>
          <div className="alert ok">
            Student training path complete. Your Skills Passport and dashboard are ready.
          </div>
          <div className="train-learn-grid">
            <LearnCard title="Hiring partner match" body="Connect with construction companies hiring from this pathway." />
            <LearnCard title="Resume & interview" body="Show skills in clear, short English." />
            <LearnCard title="30 / 90 / 180 day follow-up" body="Support after you start work — not a dead end." />
          </div>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/app/student">Go to my dashboard</Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (isPracticeMode()) {
                  resetPracticeProgress()
                  setEmpDone(false)
                  setEmpQuizDone(false)
                  setStep(PRACTICE_ENTRY_STEP)
                  go(PRACTICE_ENTRY_STEP)
                  return
                }
                saveStep(1)
                setEmpDone(false)
                setEmpQuizDone(false)
                go(1)
              }}
            >
              Restart training path
            </button>
          </div>
        </>
      )}
      <p className="train-motto">Learn · Practice · Improve · Achieve</p>
    </Shell>
  )
}
