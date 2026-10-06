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
  getActivePathway,
  getPathwayJourneySteps,
  getPathwayPack,
  getPathwayUnitGoal,
  pathwayMeta,
  setActivePathway,
  setRecommendedPathway,
  pathwayImage,
  type PathwayId as StreamPathwayId,
} from '../pathways'
import {
  SUPPORT_LANGUAGES,
  LEARNING_UNITS,
  DIGITAL_PRACTICE,
  MATCH_PRACTICE_ROUNDS,
  unitForStep,
  isUnitEntryStep,
  type SupportLang,
  type HomeLang,
  type QuizItem,
  type VocabTerm,
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
import { EyeSpyQuiz } from './EyeSpyQuiz'
import { VocabSheet } from './VocabSheet'
import { LearningPathMap, UnitIntroCard } from './LearningPathMap'
import { PracticeHub, PracticeStatsStrip } from './PracticeHub'
import { getKnownVocabIds, markVocabKnown } from './adaptiveVocab'
import {
  createFollowUpPlan,
  followUpSummary,
  loadFollowUp,
  saveFollowUp,
  updateCheckIn,
  type EmploymentFollowUp,
  type FollowUpDay,
} from './employmentFollowUp'
import {
  advanceBlockedReason,
  canAdvanceFromStep,
  creditKnownVocabMastery,
  markLessonCompleted,
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
  return pathwayImage(item.imageKey) || pathwayImage(item.answer) || pathwayImage(item.emoji)
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

function StepShell({ step, children, onBack, onNext, nextLabel = 'Continue', nextDisabled, transitioning, transitionMsg, supportLang, onOpenHub, onJumpLesson }: {
  step: number; children: ReactNode; onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean
  transitioning?: boolean; transitionMsg?: string; supportLang?: SupportLang
  onOpenHub?: () => void
  onJumpLesson?: (n: number) => void
}) {
  const journeySteps = getPathwayJourneySteps()
  const base = journeySteps[step - 1]
  const motherTongue = supportLang && step >= 3 && step <= 6
  const shellCopy = motherTongue ? ASSESSMENT_SHELL[step as 3 | 4 | 5 | 6] : null
  const title = shellCopy ? assessT(shellCopy.title, supportLang!) : base.title
  const help = shellCopy ? assessT(shellCopy.help, supportLang!) : base.help
  const purpose = shellCopy ? assessT(shellCopy.purpose, supportLang!) : base.purpose
  const unit = unitForStep(step)
  const pct = Math.round((step / 20) * 100)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)
  const practice = isPracticeMode()
  const masteryBlocked = practice ? advanceBlockedReason(step) : null
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
    if (practice && masteryBlocked) {
      playFoley('wrong')
      return
    }
    if (!practice || !shouldAskPracticeFeedback(step)) {
      playFoley('wood')
      markLessonCompleted(step)
      onNext()
      return
    }
    const key = practiceFeedbackKey('/journey', step)
    if (hasPracticeFeedbackAck(key)) {
      playFoley('wood')
      markLessonCompleted(step)
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
    markLessonCompleted(step)
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
            {practice ? ' · Student Practice' : ''}
          </p>
          <div className="train-sound-slot">
            {practice && onOpenHub && (
              <button type="button" className="btn btn-ghost train-hub-btn" onClick={onOpenHub}>
                Path home
              </button>
            )}
            <FoleyToggle compact />
          </div>
        </div>
        <h1 className="train-title">{title}</h1>
        <p className="train-simple-line">{help}</p>
        {practice && <PracticeStatsStrip step={step} />}
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
          {journeySteps.map((s) => {
            const skipped = practice && s.n < PRACTICE_ENTRY_STEP
            const cls = s.n === step ? 'is-current' : skipped ? 'is-skipped' : s.n < step ? 'is-done' : ''
            return <li key={s.n} className={cls} title={skipped ? `${s.title} (skipped in practice)` : s.title} />
          })}
        </ol>
        <LearningPathMap
          currentStep={step}
          practice={practice}
          compact={!practice}
          onOpenHub={onOpenHub}
          onSelectLesson={practice ? onJumpLesson : undefined}
        />
      </header>

      <Reveal className="train-panel" delay={40}>
        {isUnitEntryStep(step) && getPathwayUnitGoal(unit.id) && (
          <UnitIntroCard
            unitId={unit.id}
            goal={getPathwayUnitGoal(unit.id)!.goal}
            outcomes={getPathwayUnitGoal(unit.id)!.outcomes}
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
            disabled={nextDisabled || Boolean(masteryBlocked)}
            title={masteryBlocked || undefined}
          >
            {nextLabel}
          </button>
        )}
      </div>
      {masteryBlocked && (
        <p className="train-mastery-gate" role="status">
          {masteryBlocked} Keep answering until this lesson is Familiar.
        </p>
      )}

      {feedbackPrompt && (
        <div className="practice-next-gate" role="dialog" aria-modal="true" aria-label="Feedback check">
          <div className="practice-next-gate-card">
            <h3>Did you leave feedback on this unit?</h3>
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
    try {
      const step = Number(sessionStorage.getItem(JOURNEY_KEY) || '0')
      const skill = SKILL_BY_STEP[step]
      if (skill) recordSkillAttempt(skill, isCorrect)
    } catch {
      /* ignore */
    }
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
  const [pathwayId, setPathwayId] = useState<StreamPathwayId>(() => getActivePathway())
  const pack = getPathwayPack(pathwayId)
  const meta = pathwayMeta(pathwayId)
  const VOCAB_UNIT = pack.vocab
  const WORD_ACTIONS = pack.wordActions
  const EYE_SPY_SCENES = pack.eyeSpyScenes
  const WORKPLACE_INSTRUCTIONS = pack.workplaceInstructions
  const SITE_PHRASES = pack.sitePhrases
  const SAFETY_QUIZ = pack.safetyQuiz
  const TOOL_CATEGORIES = pack.toolCategories
  const SYSTEM_TOPICS = pack.systemTopics
  const OBSERVATION_SCENARIOS = pack.observationScenarios
  const SITE_DECISIONS = pack.siteDecisions
  const FINAL_QUIZ = pack.finalQuiz
  const EMPLOYMENT_PREP = pack.employmentPrep
  const UNIT_CHECKPOINTS = pack.unitCheckpoints
  const JOURNEY_STEPS = getPathwayJourneySteps(pathwayId)

  useEffect(() => {
    const sync = () => setPathwayId(getActivePathway())
    window.addEventListener('pa-pathway-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-pathway-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [])

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
  const [advanceGateMsg, setAdvanceGateMsg] = useState<string | null>(null)
  const practiceAdvanceRef = useRef<(() => void) | null>(null)
  const [practiceView, setPracticeView] = useState<'hub' | 'lesson' | 'passport'>(() =>
    isPracticeMode() ? 'hub' : 'lesson',
  )
  const [checkpointUnit, setCheckpointUnit] = useState<number | null>(null)
  const [matchRound, setMatchRound] = useState(1)
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

  /* Step 7 visual vocabulary — all five languages; press yours → connect to English */
  const [vocabHeard, setVocabHeard] = useState<Record<string, boolean>>({})
  const [vocabConnected, setVocabConnected] = useState<Record<string, HomeLang>>({})
  const [vocabKnownIds, setVocabKnownIds] = useState<string[]>(() => getKnownVocabIds(getActivePathway()))
  const [vocabSpeakingId, setVocabSpeakingId] = useState<string | null>(null)
  const [vocabIdx, setVocabIdx] = useState(0)
  const [speaking, setSpeaking] = useState<'en' | 'support' | 'both' | null>(null)

  /* Step 9 supported matching */
  const [matchIdx, setMatchIdx] = useState(0)
  const [matchAnswer, setMatchAnswer] = useState<string | null>(null)
  const [matchCorrect, setMatchCorrect] = useState(false)
  const [matchOptions, setMatchOptions] = useState<VocabTerm[]>(() => {
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

  /* Step 20 employment prep + 30/90/180 follow-up */
  const [empIdx, setEmpIdx] = useState(0)
  const [empAnswer, setEmpAnswer] = useState<string | null>(null)
  const [empCorrect, setEmpCorrect] = useState(false)
  const [empForm, setEmpForm] = useState({ resume_goal: '', availability: '' })
  const [empQuizDone, setEmpQuizDone] = useState(false)
  const [followUp, setFollowUp] = useState<EmploymentFollowUp | null>(() => loadFollowUp())

  useEffect(() => {
    const sync = () => setFollowUp(loadFollowUp())
    window.addEventListener('pa-employment-followup-changed', sync)
    return () => window.removeEventListener('pa-employment-followup-changed', sync)
  }, [])

  useEffect(() => {
    const sync = () => setVocabKnownIds(getKnownVocabIds(pathwayId))
    window.addEventListener('pa-vocab-known-changed', sync)
    return () => window.removeEventListener('pa-vocab-known-changed', sync)
  }, [pathwayId])

  useEffect(() => { saveStep(step) }, [step])
  useEffect(() => { if (student?.preferred_language) setSupportLang(student.preferred_language as SupportLang) }, [student?.preferred_language])
  useEffect(() => { primeSpeech() }, [])
  useEffect(() => () => { stopSpeech() }, [])
  useEffect(() => {
    if (isPracticeMode() && practiceView !== 'lesson') return
    const skill = SKILL_BY_STEP[step]
    if (skill) markSkillOpened(skill)
  }, [step, practiceView])

  /* Seed matching options from the adaptive deck when entering step 9. */
  useEffect(() => {
    if (step !== 9) return
    const knownSet = new Set(getKnownVocabIds(pathwayId))
    const unknown = VOCAB_UNIT.filter((t) => !knownSet.has(t.id))
    const deck = unknown.length >= 4 ? unknown : VOCAB_UNIT
    const term = deck[0]
    if (!term) return
    const distractors = VOCAB_UNIT.filter((t) => t.id !== term.id).slice(0, 3)
    setMatchOptions([term, ...distractors].sort(() => Math.random() - 0.5))
  }, [step, pathwayId])

  useEffect(() => {
    /* When pathway changes, reset lesson-local drills so content matches the pack. */
    const term = VOCAB_UNIT[0]
    if (!term) return
    const distractors = VOCAB_UNIT.filter((t) => t.id !== term.id).slice(0, 3)
    setMatchOptions([term, ...distractors].sort(() => Math.random() - 0.5))
    setVocabIdx(0)
    setVocabHeard({})
    setVocabConnected({})
    setVocabKnownIds(getKnownVocabIds(pathwayId))
    setActionIdx(0)
    setActionAnswer(null)
    setActionCorrect(false)
    setMatchIdx(0)
    setMatchAnswer(null)
    setMatchCorrect(false)
    setMatchRound(1)
    setInstrIdx(0)
    setInstrHeard(false)
    setInstrAnswer(null)
    setInstrCorrect(false)
    setPhraseIdx(0)
    setPhraseHeard(false)
    setPhraseAnswer(null)
    setPhraseCorrect(false)
    setToolIdx(0)
    setToolAnswer(null)
    setToolCorrect(false)
    setSysIdx(0)
    setSysAnswer(null)
    setSysCorrect(false)
    setObsIdx(0)
    setObsPicked([])
    setObsChecked(false)
    setObsCorrect(false)
    setSiteIdx(0)
    setSiteAnswer(null)
    setSiteCorrect(false)
    setEmpIdx(0)
    setEmpAnswer(null)
    setEmpCorrect(false)
    setEmpQuizDone(false)
    setFinalPhase('eyespy')
  }, [pathwayId])

  /* Practice mode skips registration entirely */
  useEffect(() => {
    if (!isPracticeMode()) return
    if (step < PRACTICE_ENTRY_STEP) {
      setStep(PRACTICE_ENTRY_STEP)
      saveStep(PRACTICE_ENTRY_STEP)
    }
  }, [step])

  function resetDrillLocals() {
    setActionIdx(0)
    setActionAnswer(null)
    setActionCorrect(false)
    setMatchIdx(0)
    setMatchRound(1)
    setMatchAnswer(null)
    setMatchCorrect(false)
    setInstrIdx(0)
    setInstrHeard(false)
    setInstrAnswer(null)
    setInstrCorrect(false)
    setPhraseIdx(0)
    setPhraseHeard(false)
    setPhraseAnswer(null)
    setPhraseCorrect(false)
    setDigIdx(0)
    setDigAnswer(null)
    setDigCorrect(false)
    setDigTyped('')
    setToolIdx(0)
    setToolAnswer(null)
    setToolCorrect(false)
    setSysIdx(0)
    setSysAnswer(null)
    setSysCorrect(false)
    setObsIdx(0)
    setObsPicked([])
    setObsChecked(false)
    setObsCorrect(false)
    setSiteIdx(0)
    setSiteAnswer(null)
    setSiteCorrect(false)
    setEmpIdx(0)
    setEmpAnswer(null)
    setEmpCorrect(false)
    setAdvanceGateMsg(null)
    setVocabIdx(0)
    setVocabHeard({})
    setVocabConnected({})
    setVocabSpeakingId(null)
  }

  /* Banner "Start over" / fresh Practice Mode entry — jump back to language step */
  useEffect(() => {
    const onRestart = () => {
      if (!isPracticeMode()) return
      setEmpDone(false)
      setEmpQuizDone(false)
      setFollowUp(null)
      setVocabKnownIds([])
      setLogForm({ date: '', tasks: '', supervisor: '' })
      setEmpForm({ resume_goal: '', availability: '' })
      setError(null)
      setTransitioning(false)
      setCheckpointUnit(null)
      setFinalPhase('eyespy')
      setHonestyChecked(false)
      resetDrillLocals()
      setPracticeView('hub')
      setStep(PRACTICE_ENTRY_STEP)
      saveStep(PRACTICE_ENTRY_STEP)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    const onStarted = () => {
      if (!isPracticeMode()) return
      setPracticeView('hub')
    }
    window.addEventListener('pa-practice-restarted', onRestart)
    window.addEventListener('pa-practice-started', onStarted)
    return () => {
      window.removeEventListener('pa-practice-restarted', onRestart)
      window.removeEventListener('pa-practice-started', onStarted)
    }
  }, [])

  function go(next: number, message?: string) {
    stopSpeech()
    setError(null)
    setSpeaking(null)
    setCheckpointUnit(null)
    setAdvanceGateMsg(null)
    const target = Math.min(20, Math.max(1, next))
    if (target !== step) resetDrillLocals()
    if (target === step) {
      resetDrillLocals()
      setStep(target)
      setPracticeView('lesson')
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
      setPracticeView('lesson')
      setTransitioning(false)
      playFoley('ambient-stop')
      playFoley('whoosh')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 900)
  }

  /** After finishing a unit's last lesson, run the unit checkpoint in Practice Mode. */
  function advanceWithOptionalCheckpoint(fromStep: number, nextStep: number, message?: string) {
    const unit = unitForStep(fromStep)
    const unitSteps = JOURNEY_STEPS.filter((s) => s.unit === unit.id).map((s) => s.n)
    const isUnitEnd = unitSteps[unitSteps.length - 1] === fromStep
    const items = UNIT_CHECKPOINTS[unit.id]
    if (isPracticeMode() && isUnitEnd && items?.length && nextStep > fromStep) {
      markLessonCompleted(fromStep)
      setCheckpointUnit(unit.id)
      return
    }
    go(nextStep, message)
  }

  /** Practice mode: ask for feedback at unit boundaries before leaving via in-panel Continues. */
  function requestPracticeAdvance(advance: () => void) {
    if (isPracticeMode() && !canAdvanceFromStep(step)) {
      const reason = advanceBlockedReason(step) || 'Keep practising until this skill is Familiar.'
      setAdvanceGateMsg(reason)
      playFoley('wrong')
      window.setTimeout(() => {
        document.querySelector('.train-advance-gate')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 50)
      return
    }
    setAdvanceGateMsg(null)
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

  function AdvanceGateNote() {
    if (!advanceGateMsg) return null
    return (
      <p className="train-advance-gate alert warn" role="status">
        {advanceGateMsg} Keep answering until this lesson is Familiar.
      </p>
    )
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
          onOpenHub={isPracticeMode() ? () => setPracticeView('hub') : undefined}
          onJumpLesson={(n) => go(n, `Opening step ${n}…`)}
        />
        {practiceAdvancePrompt && (
          <div className="practice-next-gate" role="dialog" aria-modal="true" aria-label="Feedback check">
            <div className="practice-next-gate-card">
              <h3>Did you leave feedback on this unit?</h3>
              <p>
                Scroll the page and use the feedback chat on the side if something felt unclear. Confirm when you are
                ready to move on.
              </p>
              <div className="practice-next-gate-actions">
                <button type="button" className="btn btn-primary" onClick={confirmPracticeAdvanceYes}>
                  Yes, continue
                </button>
                <button type="button" className="btn btn-ghost" onClick={confirmPracticeAdvanceNo}>
                  Not yet. Open chat
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  if (isPracticeMode() && practiceView === 'hub') {
    return (
      <PracticeHub
        currentStep={step}
        pathComplete={empDone && step >= 20}
        onContinue={() => {
          setPracticeView('lesson')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onOpenLesson={(n) => go(n, `Opening step ${n}…`)}
        onOpenPassport={() => {
          setPracticeView('passport')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onRestart={() => {
          resetPracticeProgress()
          setEmpDone(false)
          setEmpQuizDone(false)
          setFollowUp(null)
          setVocabKnownIds([])
          setPracticeView('hub')
          setStep(PRACTICE_ENTRY_STEP)
          saveStep(PRACTICE_ENTRY_STEP)
        }}
      />
    )
  }

  if (isPracticeMode() && practiceView === 'passport') {
    const summary = followUpSummary(followUp)
    return (
      <div className="shell-main practice-passport">
        <header className="page-header stack">
          <button type="button" className="back-link" onClick={() => setPracticeView('hub')}>
            ← Path home
          </button>
          <p className="section-kicker">Verified skill · Practice</p>
          <h1>Skills Passport</h1>
          <p className="lede">
            What you studied and practised on this path — not Red Seal, apprenticeship certification, or a guaranteed
            job. Competent still needs a real instructor later.
          </p>
        </header>
        <div className="train-learn-grid skills-passport-stages">
          <article className="skills-passport-stage">
            <span className="badge brand">Learned</span>
            <h3>Learned</h3>
            <p>Studied in the app — understanding, not yet verified on the job.</p>
          </article>
          <article className="skills-passport-stage">
            <span className="badge brand">Practised</span>
            <h3>Practised</h3>
            <p>Tried through Practice drills and unit checkpoints.</p>
          </article>
          <article className="skills-passport-stage">
            <span className="badge ok">Competent</span>
            <h3>Competent</h3>
            <p>Authorized instructor confirmation — not awarded by Practice alone.</p>
          </article>
        </div>
        <div className="panel stack emp-followup">
          <h2>Employment follow-up</h2>
          <p className="muted" style={{ margin: 0 }}>
            Graduation is not the end. Check in at 30, 90, and 180 days.
          </p>
          {!followUp ? (
            <p>Complete Employment Connection to open your follow-up schedule.</p>
          ) : (
            <>
              <p>
                <strong>{summary.label}</strong>
                {followUp.roleGoal ? ` · Goal: ${followUp.roleGoal}` : ''}
              </p>
              <ul className="list-plain emp-followup-list">
                {followUp.checkIns.map((c) => (
                  <li key={c.day} className={`emp-followup-item is-${c.status}`}>
                    <div>
                      <strong>Day {c.day}</strong>
                      <div className="muted">Due {new Date(c.dueAt).toLocaleDateString()}</div>
                    </div>
                    <span className="badge">{c.status.replace('_', ' ')}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => setPracticeView('hub')}>
            Back to path home
          </button>
          <button
            type="button"
            className="btn btn-secondary on-light"
            onClick={() => {
              setPracticeView('lesson')
              go(20)
            }}
          >
            Open employment step
          </button>
        </div>
      </div>
    )
  }

  if (isPracticeMode() && checkpointUnit && UNIT_CHECKPOINTS[checkpointUnit]) {
    const items = UNIT_CHECKPOINTS[checkpointUnit]
    const unit = LEARNING_UNITS.find((u) => u.id === checkpointUnit) || LEARNING_UNITS[0]
    const nextStep = Math.min(20, (JOURNEY_STEPS.filter((s) => s.unit === checkpointUnit).map((s) => s.n).pop() || checkpointUnit) + 1)
    return (
      <Shell
        step={step}
        onBack={() => setCheckpointUnit(null)}
        nextLabel="Back to lesson"
        onNext={() => setCheckpointUnit(null)}
      >
        <div className="unit-checkpoint">
          <p className="section-kicker">Unit checkpoint</p>
          <h2>
            Unit {unit.id}: {unit.label} review
          </h2>
          <p className="lede">Prove the unit stuck. Pass this review, then unlock the next unit.</p>
          <QuizRunner
            items={items}
            gated
            onComplete={() => {
              recordSkillAttempt('unit-checkpoint', true, 20)
              markLessonCompleted(step)
              setCheckpointUnit(null)
              go(nextStep, `Opening unit ${unitForStep(nextStep).label}…`)
            }}
          />
        </div>
      </Shell>
    )
  }

  function resetVocab() {
    setVocabHeard({})
    setVocabConnected({})
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
    recordSkillAttempt('vocab', true, 8)
  }

  async function connectVocabLang(term: (typeof VOCAB_UNIT)[number], lang: HomeLang) {
    setVocabConnected((c) => ({ ...c, [term.id]: lang }))
    setVocabSpeakingId(term.id)
    stopSpeech()
    await speakSupport(term.gloss[lang], lang)
    setVocabSpeakingId(null)
  }

  function markCurrentVocabKnown(term: (typeof VOCAB_UNIT)[number]) {
    markVocabKnown(pathwayId, term.id)
    setVocabKnownIds(getKnownVocabIds(pathwayId))
    creditKnownVocabMastery()
    playFoley('whoosh')
  }

  function resetMatch() {
    setMatchIdx(0)
    setMatchRound(1)
    setMatchAnswer(null)
    setMatchCorrect(false)
    const term = VOCAB_UNIT[0]
    const distractors = VOCAB_UNIT.filter((t) => t.id !== term.id).slice(0, 3)
    setMatchOptions([term, ...distractors].sort(() => Math.random() - 0.5))
  }
  function resetInstr() { setInstrIdx(0); setInstrHeard(false); setInstrAnswer(null); setInstrCorrect(false) }

  async function ensureDemoStudent() {
    if (user?.role === 'student' && student?.registration_status === 'approved') return true
    setError(null)
    const result = await login('student@purposeacademy.ca', DEMO_PASSWORDS.student)
    if (result.error) { setError(result.error); return false }
    try { await refresh() } catch { /* session set */ }
    return true
  }

  async function finishPathway() {
    const chosen = (interest || getActivePathway()) as StreamPathwayId
    setRecommendedPathway(chosen)
    setActivePathway(chosen)
    setPathwayId(chosen)
    const label = pathwayMeta(chosen).programTitle
    if (isPracticeMode()) {
      go(7, `Opening ${label} vocabulary…`)
      return
    }
    const ok = await ensureDemoStudent()
    if (!ok) return
    try {
      const sid = student?.id
      if (sid) {
        await selectPathway(sid, chosen)
        await refresh()
      }
      go(7, `Opening ${label} vocabulary…`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save pathway')
      go(7, `Opening ${label} vocabulary…`)
    }
  }



  if (step === 1) {
    if (isPracticeMode()) {
      return (
        <Shell step={PRACTICE_ENTRY_STEP} onBack={() => navigate('/')} onNext={() => go(PRACTICE_ENTRY_STEP)}>
          <p className="train-login-lede">Practice skips registration. Opening your language step…</p>
        </Shell>
      )
    }
    return (
      <Shell step={1} onBack={() => navigate('/enter/student')} onNext={() => go(2, 'Opening registration…')} nextLabel="Continue as a new student">
        <div className="train-login">
          <img src={BRAND_ASSETS.logoPOpen} alt="" className="train-login-mark" />
          <p className="train-login-lede">
            You are starting the Purpose Academy student path. Registration comes next, then language support,
            then tools, safety, and practice, one clear station at a time.
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
          <p className="train-login-lede">Practice skips registration. Opening your language step…</p>
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
            <input id="seq-exp" value={regForm.previous_experience} onChange={(e) => setRegForm({ ...regForm, previous_experience: e.target.value })} placeholder="Example: helper on building sites, or none yet" />
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

  /* Step 7: Visual Vocabulary — all five languages; press yours → connect to English */
  if (step === 7) {
    const knownSet = new Set(vocabKnownIds)
    const linkedCount = VOCAB_UNIT.filter(
      (t) => vocabHeard[t.id] && (vocabConnected[t.id] || knownSet.has(t.id)),
    ).length
    const ready = linkedCount >= VOCAB_UNIT.length

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
          speakingId={vocabSpeakingId}
          heard={vocabHeard}
          connected={vocabConnected}
          knownIds={vocabKnownIds}
          onIndexChange={setVocabIdx}
          onPlayEnglish={(term) => void playVocabEnglish(term)}
          onConnectLang={(term, lang) => void connectVocabLang(term, lang)}
          onMarkKnown={(term) => markCurrentVocabKnown(term)}
        />
        <p className="train-vocab-counter">
          {ready
            ? `Linked all ${VOCAB_UNIT.length} words to English · Ready to continue`
            : `Linked ${linkedCount} of ${VOCAB_UNIT.length} words${vocabKnownIds.length ? ` · ${vocabKnownIds.length} already known` : ''}`}
        </p>
      </Shell>
    )
  }

  /* Step 8: Word → Action — see action, check which tool */
  if (step === 8) {
    const knownSet = new Set(vocabKnownIds)
    const unknownActions = WORD_ACTIONS.filter((a) => !knownSet.has(a.termId))
    /* Adaptive: drill unknowns first; keep a short known review only if the deck would be too thin. */
    const actionDeck =
      unknownActions.length >= 3
        ? unknownActions
        : [
            ...unknownActions,
            ...WORD_ACTIONS.filter((a) => knownSet.has(a.termId)).slice(0, Math.max(0, 3 - unknownActions.length)),
          ]
    const safeDeck = actionDeck.length ? actionDeck : WORD_ACTIONS
    const safeIdx = Math.min(actionIdx, safeDeck.length - 1)
    const item = safeDeck[safeIdx]
    const term = VOCAB_UNIT.find((t) => t.id === item.termId)
    const alreadyKnown = knownSet.has(item.termId)
    const isLast = safeIdx >= safeDeck.length - 1
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
        requestPracticeAdvance(() => advanceWithOptionalCheckpoint(8, 9, 'Opening supported practice…'))
        return
      }
      setActionIdx((i) => i + 1)
      setActionAnswer(null)
      setActionCorrect(false)
    }

    return (
      <Shell step={8} onBack={() => { resetVocab(); go(7) }}>
        <p className="train-vocab-counter">
          Action {safeIdx + 1} of {safeDeck.length}
          {knownSet.size ? ` · ${knownSet.size} already known skipped or quick-checked` : ''}
        </p>
        <article className="word-action-card">
          <PictureCard
            image={pathwayImage(term?.imageKey)}
            fit="contain"
            label={item.title}
            caption={item.body}
          />
          {alreadyKnown && (
            <p className="vocab-known-note">Already known — quick confirm the action, then continue.</p>
          )}
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
                {actionCorrect ? 'Yes. Word and action match.' : `Not yet. This action uses the ${term?.english}.`}
              </div>
              <AdvanceGateNote />
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
    const knownSet = new Set(vocabKnownIds)
    const unknownTerms = VOCAB_UNIT.filter((t) => !knownSet.has(t.id))
    const matchDeck =
      unknownTerms.length >= 4
        ? unknownTerms
        : VOCAB_UNIT
    const safeIdx = Math.min(matchIdx, matchDeck.length - 1)
    const term = matchDeck[safeIdx]
    const alreadyKnown = knownSet.has(term.id)
    const isLast = safeIdx >= matchDeck.length - 1
    const roundsNeeded =
      isPracticeMode() && unknownTerms.length <= 3 ? 1 : isPracticeMode() ? MATCH_PRACTICE_ROUNDS : 1

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
        if (matchRound < roundsNeeded) {
          setMatchRound((r) => r + 1)
          setMatchIdx(0)
          setMatchAnswer(null)
          setMatchCorrect(false)
          const first = matchDeck[0]
          const distractors = VOCAB_UNIT.filter((t) => t.id !== first.id).slice(0, 3)
          setMatchOptions([first, ...distractors].sort(() => Math.random() - 0.5))
          playFoley('whoosh')
          return
        }
        requestPracticeAdvance(() => go(10, 'Opening English Eye Spy…'))
        return
      }
      const next = safeIdx + 1
      setMatchIdx(next)
      setMatchAnswer(null)
      setMatchCorrect(false)
      const nextTerm = matchDeck[next]
      const distractors = VOCAB_UNIT.filter((t) => t.id !== nextTerm.id).slice(0, 3)
      setMatchOptions([nextTerm, ...distractors].sort(() => Math.random() - 0.5))
    }

    return (
      <Shell step={9} onBack={() => go(8)}>
        <p className="train-vocab-counter">
          Round {matchRound} of {roundsNeeded} · Match {safeIdx + 1} of {matchDeck.length}
          {unknownTerms.length < VOCAB_UNIT.length
            ? ` · Focusing on ${unknownTerms.length || matchDeck.length} words to strengthen`
            : ''}
        </p>
        <PictureCard
          image={pathwayImage(term.imageKey)}
          fit="contain"
          label="Match the English word to the picture"
          caption="All five languages stay visible. Press any language for help, then choose the English word."
        />
        {alreadyKnown && (
          <p className="vocab-known-note">Already known — quick confirm, then continue.</p>
        )}
        <ul className="vocab-sheet-langs vocab-match-langs" aria-label="All language meanings">
          {(['Amharic', 'Tigrinya', 'Arabic', 'Spanish', 'Hindi'] as HomeLang[]).map((lang) => (
            <li key={lang}>
              <button
                type="button"
                className="vocab-sheet-lang-btn"
                disabled={speaking !== null}
                onClick={() => void playSupport(term.gloss[lang], lang)}
                aria-label={`Hear ${term.gloss[lang]} in ${lang}`}
              >
                <span className="vocab-sheet-lang-name">{lang}</span>
                <span className="vocab-sheet-lang-word">{term.gloss[lang]}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="train-audio-row">
          <button type="button" className="btn btn-secondary on-light" disabled={speaking !== null} onClick={() => void playEnglish(term.english)}>Hear English</button>
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
              {matchCorrect ? 'Yes. Picture and word match.' : `Not yet. The correct word is ${term.english}. Try again.`}
            </div>
            <AdvanceGateNote />
            <button type="button" className="btn btn-primary" onClick={nextMatch}>
              {matchCorrect
                ? (isLast && matchRound >= roundsNeeded ? 'Continue to English Eye Spy' : isLast ? 'Next round' : 'Next match')
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
            image={pathwayImage(instr.imageKey)}
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
        requestPracticeAdvance(() => advanceWithOptionalCheckpoint(12, 13, 'Opening digital skills…'))
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
                {phraseCorrect ? `Yes. ${phrase.why}` : `Not yet. ${phrase.why}`}
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
        <TeachNote>Each card is a real micro-task: learn → try → feedback → next. Empty honesty is fine. Wrong answers teach.</TeachNote>
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
        requestPracticeAdvance(() => advanceWithOptionalCheckpoint(16, 17, 'Opening instructor observation…'))
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
        <WhyWork>On-site days need judgment and a clear log. Practice both before the exam.</WhyWork>
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
            <p className="muted">Capture the habit employers expect: date, tasks, supervisor.</p>
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
          <PictureCard emoji="E" label="Final vocabulary Eye Spy" caption="Exam mode. Up to 3 tries. 100% required. Scenes change on misses." />
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
          {isPracticeMode() ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setPracticeView('passport')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              View Skills Passport →
            </button>
          ) : (
            <Link className="btn btn-ghost" to="/app/student/skills">View Skills Passport →</Link>
          )}
        </div>
      </Shell>
    )
  }

  function handleComplete(e: FormEvent) {
    e.preventDefault()
    const plan = createFollowUpPlan({
      pathway: meta.label,
      roleGoal: empForm.resume_goal,
      availability: empForm.availability,
    })
    saveFollowUp(plan)
    setFollowUp(plan)
    try { sessionStorage.setItem(EMP_KEY, JSON.stringify({ ...empForm, prepDone: true, followUp: true })) } catch { /* */ }
    markSequenceComplete('student', { detail: user?.full_name || 'Student' })
    recordSkillAttempt('employment', true)
    playFoley('metal')
    setEmpDone(true)
  }

  function recordFollowUp(day: FollowUpDay, status: 'employed' | 'seeking' | 'missed' | 'completed') {
    const next = updateCheckIn(day, { status, notes: status === 'employed' ? 'Working' : status })
    if (next) setFollowUp(next)
    playFoley('correct')
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
        <WhyWork>Employment connection starts with clear interview answers, then partner matching.</WhyWork>
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
            Partner focus: {meta.label.toLowerCase()} employers who understand this pathway.
          </div>
          <h3>Employment readiness</h3>
          <div className="field">
            <label htmlFor="emp-goal">Target {meta.label.toLowerCase()} role</label>
            <textarea id="emp-goal" value={empForm.resume_goal} onChange={(e) => setEmpForm({ ...empForm, resume_goal: e.target.value })} required rows={3} placeholder={`e.g. ${meta.label} helper / entry role`} />
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
            Student training path complete. Your Skills Passport and 30 / 90 / 180 day follow-up are open.
          </div>
          <div className="train-learn-grid">
            <LearnCard title="Hiring partner match" body={`Connect with ${meta.label.toLowerCase()} partners hiring from this pathway.`} />
            <LearnCard title="Resume & interview" body="Show skills in clear, short English." />
            <LearnCard
              title="30 / 90 / 180 day follow-up"
              body={followUpSummary(followUp).label}
            />
          </div>

          {followUp && (
            <div className="panel stack emp-followup">
              <h3>Employment follow-up schedule</h3>
              <p className="muted" style={{ margin: 0 }}>
                Purpose Academy stays with you after placement — check in at 30, 90, and 180 days.
              </p>
              <ul className="list-plain emp-followup-list">
                {followUp.checkIns.map((c) => (
                  <li key={c.day} className={`emp-followup-item is-${c.status}`}>
                    <div>
                      <strong>Day {c.day}</strong>
                      <div className="muted">Due {new Date(c.dueAt).toLocaleDateString()}</div>
                      <div className="badge">{c.status.replace('_', ' ')}</div>
                    </div>
                    {c.status === 'scheduled' && (
                      <div className="hero-actions">
                        <button type="button" className="btn btn-primary" onClick={() => recordFollowUp(c.day, 'employed')}>
                          I am working
                        </button>
                        <button type="button" className="btn btn-secondary on-light" onClick={() => recordFollowUp(c.day, 'seeking')}>
                          Still seeking
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="hero-actions">
            {isPracticeMode() ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setPracticeView('passport')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Open Skills Passport
                </button>
                <button
                  type="button"
                  className="btn btn-secondary on-light"
                  onClick={() => {
                    setPracticeView('hub')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Path home
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-primary" to="/app/student/skills">Open Skills Passport</Link>
                <Link className="btn btn-secondary on-light" to="/app/student">Go to my dashboard</Link>
              </>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (isPracticeMode()) {
                  resetPracticeProgress()
                  setEmpDone(false)
                  setEmpQuizDone(false)
                  setFollowUp(null)
                  setVocabKnownIds([])
                  setPracticeView('hub')
                  setStep(PRACTICE_ENTRY_STEP)
                  saveStep(PRACTICE_ENTRY_STEP)
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
