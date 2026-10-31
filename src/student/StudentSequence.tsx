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
  JOURNEY_STEP_COUNT,
  unitForStep,
  isUnitEntryStep,
  type SupportLang,
  type QuizItem,
  type VocabTerm,
} from './journeyCurriculum'
import {
  isDailyConversationTerm,
  LEVEL1_PAGE_SIZE,
  pickSpecialtyDistractors,
  sentenceLadderGateTerms,
  shuffleChoices,
} from './vocabDistractors'
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
  speakLangCode,
  speakSupport,
  stopSpeech,
} from './speech'
import type { HearLanguage } from './hearLanguages'
import {
  translateVocabWord,
  type UniversalBridge,
  type UniversalHearStatus,
} from './universalHear'
import { ComputerSkillsDrill } from './ComputerSkillsDrill'
import { EquipmentVideoDrill } from './EquipmentVideoDrill'
import { EyeSpyQuiz } from './EyeSpyQuiz'
import { FamiliarTheater } from './FamiliarTheater'
import { PlayClearPulse, SOFT_RETRY_LABEL, firePlayClear, softMissLine } from '../practice/PlayClear'
import { SentenceClozeDrill } from './SentenceClozeDrill'
import { SupportedPracticeGames } from './SupportedPracticeGames'
import { supportedPracticeDeck } from '../pathways/packs/supportedPracticeDeck'
import { pickOrganizeTerms, VocabOrganizeQuiz } from './VocabOrganizeQuiz'
import { VocabSheet } from './VocabSheet'
import { LearningPathMap, UnitIntroCard } from './LearningPathMap'
import { PracticeHub, PracticeStatsStrip } from './PracticeHub'
import {
  getKnownVocabIds,
  hasClearedVocabStation,
  markVocabKnown,
  markVocabStationCleared,
} from './adaptiveVocab'
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
  consumeForcePracticeLesson,
  hasPracticeFeedbackAck,
  isPracticeMode,
  markPracticeFeedbackAck,
  openPracticeChat,
  peekForcePracticeLesson,
  PRACTICE_ENTRY_STEP,
  practiceFeedbackKey,
  resetPracticeProgress,
  shouldAskPracticeFeedback,
} from '../practice/PracticeMode'
import { learnerGet, learnerSet } from '../practice/learnerStore'
import {
  getLearnerSupportLang,
  isSupportLang,
  setLearnerSupportLang,
} from '../practice/learnerLang'
import { StationExplainerGate } from '../practice/StationExplainerGate'
import { StationCoach, advanceStationCoach } from '../practice/StationCoach'
import { InstructionHearChip } from '../practice/InstructionNarration'
import { NavCueTarget, NavGlowRegion, NavGlowWrap } from '../practice/NavCue'
import { markNavCueSeen, NAV_CUE } from '../practice/navCues'

const JOURNEY_KEY = 'pa-student-journey-step-v1'
const OBS_KEY = 'pa-student-observation-v1'
const LOG_KEY = 'pa-student-daily-log-v1'
const EMP_KEY = 'pa-student-employment-v1'

function saveStep(step: number) {
  try {
    learnerSet(JOURNEY_KEY, String(step))
    window.dispatchEvent(new CustomEvent('pa-journey-step', { detail: { step } }))
  } catch { /* */ }
}

function loadStep() {
  try {
    const n = Number(learnerGet(JOURNEY_KEY) || '1')
    return Number.isFinite(n) && n >= 1 && n <= JOURNEY_STEP_COUNT ? n : 1
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

/** Coaching notes below the drill on phone — task/media leads the first viewport. */
function StationContext({ children }: { children: ReactNode }) {
  return (
    <details className="station-context-fold">
      <summary>Why this station · teach note</summary>
      {children}
    </details>
  )
}

function PictureCard({
  emoji,
  label,
  sub,
  caption,
  image,
  fit = 'contain',
}: {
  emoji?: string
  label: string
  sub?: string
  caption?: string
  image?: string
  /** Contain keeps royalty-free objects whole; cover only for intentional scene crops. */
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

function StepShell({ step, children, onBack, onNext, nextLabel = 'Continue', nextDisabled, transitioning, transitionMsg, supportLang, onOpenHub, onJumpLesson, explainerStationId = null }: {
  step: number; children: ReactNode; onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean
  transitioning?: boolean; transitionMsg?: string; supportLang?: SupportLang
  onOpenHub?: () => void
  onJumpLesson?: (n: number) => void
  /** When step 9 is in Word→Action phase, force that explainer. */
  explainerStationId?: string | null
}) {
  const journeySteps = getPathwayJourneySteps()
  const base = journeySteps[step - 1]
  const motherTongue = supportLang && ((step >= 3 && step <= 5) || step === 14)
  const shellCopy = motherTongue ? ASSESSMENT_SHELL[step as 3 | 4 | 5 | 14] : null
  const title = shellCopy ? assessT(shellCopy.title, supportLang!) : base.title
  const help = shellCopy ? assessT(shellCopy.help, supportLang!) : base.help
  const purpose = shellCopy ? assessT(shellCopy.purpose, supportLang!) : base.purpose
  const unit = unitForStep(step)
  const pct = Math.round((step / JOURNEY_STEP_COUNT) * 100)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)
  const practice = isPracticeMode()
  const masteryBlocked = practice ? advanceBlockedReason(step) : null
  const stepKicker = motherTongue
    ? `${assessT(ASSESSMENT_COPY.stepOf, supportLang!)} ${step} ${assessT(ASSESSMENT_COPY.ofTotal, supportLang!)} ${JOURNEY_STEP_COUNT}`
    : `Unit ${unit.id}: ${unit.label}`
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

  const jumpSteps = journeySteps.filter((s) => s.n >= PRACTICE_ENTRY_STEP)

  return (
    <div
      className={`shell-main train-shell${step === 7 ? ' is-organize-wide' : ''}${
        step === 6 ? ' is-visual-vocabulary' : ''
      }${step === 8 ? ' is-eye-spy' : ''}${step === 9 ? ' is-sentence-structure' : ''}${
        step === 12 ? ' is-computer-skills' : ''
      }${step === 18 ? ' is-equipment-video' : ''}${
        /* Choice / match play stations — same task-first fold on desktop night + phone */
        step === 10 || step === 11 || step === 13 || step === 15 || step === 16 || step === 17
          ? ' is-play-choice'
          : ''
      }`}
    >
      <StepTransition active={!!transitioning} message={transitionMsg || 'Moving to the next station…'} />
      <header className="train-header">
        <div className="train-header-top">
          <p className="train-kicker">
            {stepKicker}
            {practice ? ' · Practice' : ''}
          </p>
          <div className="train-sound-slot">
            {/* Desktop wide: keep Path home / Done visible. Phone folds them into Station menu. */}
            <div className="train-hub-row">
              {practice && onOpenHub && (
                <button type="button" className="btn btn-ghost train-hub-btn" onClick={onOpenHub}>
                  Path home
                </button>
              )}
              {practice && (
                <Link className="btn btn-ghost train-hub-btn" to="/app/student">
                  Done for now
                </Link>
              )}
            </div>
            {/* Phone emulator / course shell already have Practice sounds. */}
            <FoleyToggle compact className="train-inline-foley" />
          </div>
        </div>
        {practice && (
          <details className="train-station-menu">
            <summary className="train-station-menu-summary">Station menu</summary>
            <div className="train-station-menu-body">
              <div className="train-station-menu-hub">
                {onOpenHub && (
                  <button type="button" className="btn btn-ghost train-hub-btn" onClick={onOpenHub}>
                    Path home
                  </button>
                )}
                <Link className="btn btn-ghost train-hub-btn" to="/app/student">
                  Done for now
                </Link>
              </div>
              {practice && <PracticeStatsStrip step={step} />}
              {onJumpLesson && (
                <nav className="practice-section-skip" aria-label="Skip between sections for quality review">
                  <button
                    type="button"
                    className="btn btn-ghost practice-section-skip-btn"
                    disabled={step <= PRACTICE_ENTRY_STEP}
                    onClick={() => onJumpLesson(Math.max(PRACTICE_ENTRY_STEP, step - 1))}
                  >
                    Prev section
                  </button>
                  <label className="practice-section-skip-jump">
                    <span>Jump to section</span>
                    <select
                      value={step}
                      onChange={(e) => onJumpLesson(Number(e.target.value))}
                      aria-label="Jump to any practice section"
                    >
                      {jumpSteps.map((s) => (
                        <option key={s.n} value={s.n}>
                          {s.n}. {s.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="btn btn-ghost practice-section-skip-btn"
                    disabled={step >= JOURNEY_STEP_COUNT}
                    onClick={() => onJumpLesson(Math.min(JOURNEY_STEP_COUNT, step + 1))}
                  >
                    Next section
                  </button>
                </nav>
              )}
            </div>
          </details>
        )}
        {/* Desktop review: keep a dedicated jump fold when not using the phone station menu layout */}
        {practice && onJumpLesson && (
          <details className="practice-section-skip-fold">
            <summary className="practice-section-skip-summary">Jump sections (review)</summary>
            <nav className="practice-section-skip" aria-label="Skip between sections for quality review">
              <button
                type="button"
                className="btn btn-ghost practice-section-skip-btn"
                disabled={step <= PRACTICE_ENTRY_STEP}
                onClick={() => onJumpLesson(Math.max(PRACTICE_ENTRY_STEP, step - 1))}
              >
                Prev section
              </button>
              <label className="practice-section-skip-jump">
                <span>Jump to section</span>
                <select
                  value={step}
                  onChange={(e) => onJumpLesson(Number(e.target.value))}
                  aria-label="Jump to any practice section"
                >
                  {jumpSteps.map((s) => (
                    <option key={s.n} value={s.n}>
                      {s.n}. {s.title}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn btn-ghost practice-section-skip-btn"
                disabled={step >= JOURNEY_STEP_COUNT}
                onClick={() => onJumpLesson(Math.min(JOURNEY_STEP_COUNT, step + 1))}
              >
                Next section
              </button>
            </nav>
          </details>
        )}
        <h1 className="train-title">{title}</h1>
        <p className="train-simple-line">{help}</p>
        {!motherTongue && help ? (
          <InstructionHearChip
            english={help}
            auto={false}
            autoKey={`shell-help-${step}`}
            className="train-shell-instr-hear"
          />
        ) : null}
        {practice && <PracticeStatsStrip step={step} className="practice-stats-strip-desktop" />}
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
          {!motherTongue && purpose ? (
            <InstructionHearChip
              english={purpose}
              auto={false}
              autoKey={`shell-purpose-${step}`}
              className="train-shell-instr-hear"
              label="Hear why"
            />
          ) : null}
        </details>
        <div className="train-progress" aria-label={`Progress`}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <ol className="train-dots" aria-label="Step progress">
          {journeySteps.map((s) => {
            const skipped = practice && s.n < PRACTICE_ENTRY_STEP
            const cls = s.n === step ? 'is-current' : skipped ? 'is-skipped' : s.n < step ? 'is-done' : ''
            return <li key={s.n} className={cls} title={skipped ? `${s.title} (skipped in practice)` : s.title} />
          })}
        </ol>
      </header>

      {/* Task / media first (L3). Path map used to sit above the lesson and ate the phone viewport. */}
      <Reveal className="train-panel" delay={40}>
        {isUnitEntryStep(step) && getPathwayUnitGoal(unit.id) && (
          <UnitIntroCard
            unitId={unit.id}
            goal={getPathwayUnitGoal(unit.id)!.goal}
            outcomes={getPathwayUnitGoal(unit.id)!.outcomes}
          />
        )}
        <StationExplainerGate step={step} stationId={explainerStationId}>
          {children}
        </StationExplainerGate>
      </Reveal>

      <div className="train-actions">
        {onBack && (
          <button type="button" className="btn btn-ghost train-back" onClick={onBack}>
            {backLabel}
          </button>
        )}
        {onNext && (
          <NavCueTarget
            cueId={NAV_CUE.stationContinue(step)}
            arrowLabel="Next door"
            arrowSide="above"
            className="train-next-cue"
          >
            <NavGlowWrap cueId={NAV_CUE.stationContinue(step)}>
              <button
                type="button"
                className="btn btn-primary train-next"
                onClick={handleNext}
                disabled={nextDisabled || Boolean(masteryBlocked)}
                title={masteryBlocked || undefined}
              >
                {nextLabel}
              </button>
            </NavGlowWrap>
          </NavCueTarget>
        )}
      </div>

      <LearningPathMap
        currentStep={step}
        practice={practice}
        compact
        collapsedByDefault
        onOpenHub={onOpenHub}
        onSelectLesson={practice ? onJumpLesson : undefined}
      />
      {masteryBlocked && (
        <p className="train-mastery-gate" role="status">
          {masteryBlocked} Keep practising until this station feels comfortable.
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

function QuizRunner({
  items,
  onComplete,
  gated,
  coachStationId,
}: {
  items: QuizItem[]
  onComplete: () => void
  gated?: boolean
  /** When set, first-example coach runs once on item 1 of this station. */
  coachStationId?: string
}) {
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<string | null>(null)
  const [correct, setCorrect] = useState(false)
  const [done, setDone] = useState(false)
  const [gateBlocked, setGateBlocked] = useState(false)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)
  const item = items[idx]
  const coachFirst = Boolean(coachStationId) && idx === 0 && !answered

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
      const step = Number(learnerGet(JOURNEY_KEY) || '0')
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
      const step = Number(learnerGet(JOURNEY_KEY) || '0')
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
    if (coachFirst && coachStationId) advanceStationCoach(coachStationId)
    if (isCorrect) {
      const cleared = score + 1
      const left = items.length - cleared
      firePlayClear({
        label: 'Item clear',
        remnant: left > 0 ? `${left} left` : 'Set clear — continue when ready',
        kind: left === 0 ? 'board' : 'micro',
      })
      setScore(cleared)
    } else {
      playFoley('wrong')
    }
    if (gated && !isCorrect) setGateBlocked(true)
    try {
      const step = Number(learnerGet(JOURNEY_KEY) || '0')
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
        <p className="train-score">{score} of {items.length} clear</p>
        {gated && score < items.length && (
          <p className="play-soft-miss" role="status">
            Safety needs every answer clear. Look again, then try the set once more. No rush.
          </p>
        )}
        {(!gated || score === items.length) && (
          <button type="button" className="btn btn-primary" onClick={handleComplete}>Continue</button>
        )}
        {gated && score < items.length && (
          <button type="button" className="btn btn-primary" onClick={() => { setIdx(0); setScore(0); setDone(false); setAnswered(null); setCorrect(false); }}>
            {SOFT_RETRY_LABEL}
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
  const leftInSet = items.length - idx

  return (
    <div className="train-quiz-item">
      <p className="play-nearby-objective" aria-live="polite">
        Clear this item · {leftInSet} left
      </p>
      <p className="train-quiz-counter">Item {idx + 1} of {items.length}</p>
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
      <div className="train-choice-grid" data-coach="choice-opt">
        {item.options.map((opt) => (
          <ChoiceButton key={opt} state={answered === opt ? (opt === item.answer ? 'correct' : 'wrong') : answered ? (opt === item.answer ? 'correct' : 'idle') : 'idle'} disabled={!!answered && opt !== answered && opt !== item.answer} onClick={() => pick(opt)}>
            {opt}
          </ChoiceButton>
        ))}
      </div>
      {answered && (
        <>
          {correct ? (
            <div className="alert ok">{item.teachCorrect}</div>
          ) : (
            <p className="play-soft-miss" role="status">
              {softMissLine(item.teachWrong)}
            </p>
          )}
          <button type="button" className="btn btn-primary" onClick={next}>
            {gateBlocked ? SOFT_RETRY_LABEL : idx + 1 >= items.length ? 'Continue' : 'Next'}
          </button>
        </>
      )}
      {coachFirst && coachStationId ? (
        <StationCoach stationId={coachStationId} layoutKey={`${item.prompt}-${idx}`} />
      ) : null}
    </div>
  )
}

/* ─── Main sequence page ─── */

export function StudentSequencePage() {
  const navigate = useNavigate()
  const { user, student, login, register, refresh } = useSession()
  const [step, setStep] = useState(loadStep)
  const [pathwayId, setPathwayId] = useState<StreamPathwayId>(() => getActivePathway())
  const [previewTick, setPreviewTick] = useState(0)
  const pack = getPathwayPack(pathwayId)
  const meta = pathwayMeta(pathwayId)
  const VOCAB_UNIT = pack.vocab
  const WORD_ACTIONS = pack.wordActions
  const SENTENCE_CLOZE = pack.sentenceCloze || []
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
  void previewTick

  useEffect(() => {
    const sync = () => setPathwayId(getActivePathway())
    const onPreview = () => setPreviewTick((n) => n + 1)
    window.addEventListener('pa-pathway-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    window.addEventListener('pa-preview-patch-changed', onPreview)
    return () => {
      window.removeEventListener('pa-pathway-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
      window.removeEventListener('pa-preview-patch-changed', onPreview)
    }
  }, [])

  const [supportLang, setSupportLang] = useState<SupportLang>(() => {
    const fromStudent = student?.preferred_language
    if (fromStudent && isSupportLang(fromStudent)) return fromStudent
    return getLearnerSupportLang()
  })
  const [interest, setInterest] = useState<PathwayId | null>(null)
  const [careerInterestDone, setCareerInterestDone] = useState(false)
  const [careerInterestAnswers, setCareerInterestAnswers] = useState<Record<string, LikertValue>>({})
  const [careerStyleAnswers, setCareerStyleAnswers] = useState<Record<string, string>>({})
  const [riasecScores, setRiasecScores] = useState(() => scoreInterestAnswers({}))
  const [actionIdx, setActionIdx] = useState(0)
  const [actionAnswer, setActionAnswer] = useState<string | null>(null)
  const [actionCorrect, setActionCorrect] = useState(false)
  /** Construction: Sentence Structure first, then Word → Action inside step 9. */
  const [step8Phase, setStep8Phase] = useState<'sentences' | 'actions'>('sentences')
  /** Step 10: Picture Match first, then Sentence Match (each with its own explainer video). */
  const [spPhase, setSpPhase] = useState<'picture' | 'sentence'>(() => {
    try {
      return localStorage.getItem('pa-sp-phase-v1') === 'sentence' ? 'sentence' : 'picture'
    } catch {
      return 'picture'
    }
  })
  const [organizeTerms, setOrganizeTerms] = useState<VocabTerm[]>([])
  const [sentenceLevel1, setSentenceLevel1] = useState(false)
  const [finalPhase, setFinalPhase] = useState<'eyespy' | 'written' | 'certificate'>('eyespy')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [transitionMsg, setTransitionMsg] = useState('Moving to the next station…')
  const [practiceAdvancePrompt, setPracticeAdvancePrompt] = useState(false)
  const [advanceGateMsg, setAdvanceGateMsg] = useState<string | null>(null)
  const practiceAdvanceRef = useRef<(() => void) | null>(null)
  const [practiceView, setPracticeView] = useState<'hub' | 'lesson' | 'passport'>(() => {
    if (!isPracticeMode()) return 'lesson'
    /* Portal School path can open a lesson without showing the hub twice. Peek only — consume once on mount. */
    return peekForcePracticeLesson() ? 'lesson' : 'hub'
  })
  useEffect(() => {
    consumeForcePracticeLesson()
  }, [])
  const [checkpointUnit, setCheckpointUnit] = useState<number | null>(null)
  const [empDone, setEmpDone] = useState(() => {
    try { return !!learnerGet(EMP_KEY) } catch { return false }
  })
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [phraseHeard, setPhraseHeard] = useState(false)
  const [phraseAnswer, setPhraseAnswer] = useState<string | null>(null)
  const [phraseCorrect, setPhraseCorrect] = useState(false)

  /* Step 2 registration form — English-first until the learner picks another tongue */
  const [regForm, setRegForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '',
    preferred_language: 'English', previous_experience: '',
  })

  /* Step 6 visual vocabulary — hear L1 → hear English → type English */
  const [vocabHeard, setVocabHeard] = useState<Record<string, boolean>>({})
  const [vocabConnected, setVocabConnected] = useState<Record<string, SupportLang>>({})
  const [vocabUniversal, setVocabUniversal] = useState<Record<string, UniversalBridge>>({})
  const [vocabUniversalBusyId, setVocabUniversalBusyId] = useState<string | null>(null)
  const [vocabUniversalStatus, setVocabUniversalStatus] = useState<UniversalHearStatus>({
    kind: 'idle',
  })
  const [vocabTyped, setVocabTyped] = useState<Record<string, boolean>>({})
  const [vocabKnownIds, setVocabKnownIds] = useState<string[]>(() => getKnownVocabIds(getActivePathway()))
  /** Snapshot at visit: skip-known only on retake after station was cleared once. */
  const [vocabRetake, setVocabRetake] = useState(() => hasClearedVocabStation(getActivePathway()))
  const [vocabSpeakingId, setVocabSpeakingId] = useState<string | null>(null)
  const [vocabIdx, setVocabIdx] = useState(0)
  const [speaking, setSpeaking] = useState<'en' | 'support' | 'both' | null>(null)

  /* Step 11 workplace instructions */
  const [instrIdx, setInstrIdx] = useState(0)
  const [instrHeard, setInstrHeard] = useState(false)
  const [instrAnswer, setInstrAnswer] = useState<string | null>(null)
  const [instrCorrect, setInstrCorrect] = useState(false)

  /* Step 13 digital practice */
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

  useEffect(() => {
    const sync = () => {
      if (step === 6) setVocabRetake(hasClearedVocabStation(pathwayId))
    }
    sync()
    window.addEventListener('pa-vocab-station-cleared-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-vocab-station-cleared-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [step, pathwayId])

  useEffect(() => { saveStep(step) }, [step])
  useEffect(() => {
    if (student?.preferred_language && isSupportLang(student.preferred_language)) {
      setSupportLang(student.preferred_language)
    }
  }, [student?.preferred_language])
  useEffect(() => {
    setLearnerSupportLang(supportLang)
  }, [supportLang])
  useEffect(() => { primeSpeech() }, [])
  useEffect(() => () => { stopSpeech() }, [])
  useEffect(() => {
    if (isPracticeMode() && practiceView !== 'lesson') return
    const skill = SKILL_BY_STEP[step]
    if (skill) markSkillOpened(skill)
  }, [step, practiceView])

  useEffect(() => {
    /* When pathway changes, reset lesson-local drills so content matches the pack. */
    setVocabIdx(0)
    setVocabHeard({})
    setVocabConnected({})
    setVocabTyped({})
    setVocabKnownIds(getKnownVocabIds(pathwayId))
    setActionIdx(0)
    setActionAnswer(null)
    setActionCorrect(false)
    setStep8Phase(getPathwayPack(pathwayId).sentenceCloze?.length ? 'sentences' : 'actions')
    setOrganizeTerms([])
    setSentenceLevel1(false)
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
    setCareerInterestDone(false)
    setFinalPhase('eyespy')
  }, [pathwayId])

  /* Student Practice Mode skips registration entirely */
  useEffect(() => {
    if (!isPracticeMode()) return
    if (step < PRACTICE_ENTRY_STEP) {
      setStep(PRACTICE_ENTRY_STEP)
      saveStep(PRACTICE_ENTRY_STEP)
    }
  }, [step])

  function resetDrillLocals() {
    setOrganizeTerms([])
    setActionIdx(0)
    setActionAnswer(null)
    setActionCorrect(false)
    setSpPhase('picture')
    try {
      localStorage.setItem('pa-sp-phase-v1', 'picture')
    } catch {
      /* ignore */
    }
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
    setAdvanceGateMsg(null)
    setVocabIdx(0)
    setVocabHeard({})
    setVocabConnected({})
    setVocabTyped({})
    setVocabSpeakingId(null)
  }

  /* Banner "Start over" / fresh Student Practice Mode entry — jump back to language step */
  useEffect(() => {
    const onRestart = () => {
      if (!isPracticeMode()) return
      setEmpDone(false)
      setEmpQuizDone(false)
      setFollowUp(null)
      setVocabKnownIds([])
      setVocabRetake(false)
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
    const target = Math.min(JOURNEY_STEP_COUNT, Math.max(1, next))
    if (target !== step) resetDrillLocals()
    /* Quality-review jumps land on Sentence Structure (not mid Word→Action) when opening step 9. */
    if (target === 9) {
      setStep8Phase(getPathwayPack(pathwayId).sentenceCloze?.length ? 'sentences' : 'actions')
    }
    if (target === 10) {
      setSpPhase('picture')
      try {
        localStorage.setItem('pa-sp-phase-v1', 'picture')
      } catch {
        /* ignore */
      }
    }
    if (target === 7) {
      setOrganizeTerms(pickOrganizeTerms(VOCAB_UNIT))
    }
    if (target === step) {
      resetDrillLocals()
      setStep(target)
      setPracticeView('lesson')
      saveStep(target)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setTransitionMsg(message || `Moving to step ${target}…`)
    setTransitioning(true)
    void unlockFoley().then(() => {
      /* Construction-site beds only on Construction; other pathways keep soft UI cues. */
      if (pathwayId === 'construction') {
        playFoley('ambient-start')
        playFoley('hammer')
      } else {
        playFoley('whoosh')
      }
    })
    window.setTimeout(() => {
      setStep(target)
      saveStep(target)
      setPracticeView('lesson')
      setTransitioning(false)
      if (pathwayId === 'construction') playFoley('ambient-stop')
      playFoley('whoosh')
      window.scrollTo({ top: 0, behavior: 'auto' })
      /* Phone mode scrolls inside .iphone-scroll — window scroll alone leaves the lesson mid-fold */
      const phoneScroll = document.querySelector('.iphone-scroll')
      if (phoneScroll instanceof HTMLElement) phoneScroll.scrollTop = 0
    }, 900)
  }

  /** After finishing a unit's last lesson, run the unit checkpoint in Student Practice Mode. */
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

  /** Student Practice Mode: ask for feedback at unit boundaries before leaving via in-panel Continues. */
  function requestPracticeAdvance(advance: () => void) {
    if (isPracticeMode() && !canAdvanceFromStep(step)) {
      const reason = advanceBlockedReason(step) || 'Keep practising until this station feels comfortable.'
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
        {advanceGateMsg} Keep practising until this station feels comfortable.
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
          supportLang={
            (props.step >= 3 && props.step <= 5) || props.step === 14 ? supportLang : undefined
          }
          onOpenHub={isPracticeMode() ? () => setPracticeView('hub') : undefined}
          onJumpLesson={(n) => go(n, `Opening step ${n}…`)}
          explainerStationId={
            props.step === 9 && step8Phase === 'actions'
              ? 'word-action'
              : props.step === 10 && spPhase === 'sentence'
                ? 'sentence-match'
                : null
          }
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
        <PlayClearPulse />
        <FamiliarTheater />
      </>
    )
  }

  if (isPracticeMode() && practiceView === 'hub') {
    return (
      <>
        <PracticeHub
          currentStep={step}
          pathComplete={empDone && step >= JOURNEY_STEP_COUNT}
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
            setVocabRetake(false)
            setPracticeView('hub')
            setStep(PRACTICE_ENTRY_STEP)
            saveStep(PRACTICE_ENTRY_STEP)
          }}
        />
        <PlayClearPulse />
        <FamiliarTheater />
      </>
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
          <p className="section-kicker">Skills record · Practice</p>
          <h1>Skills Passport</h1>
          <p className="play-nearby-objective" aria-live="polite">
            Review your record · Path home when you are done
          </p>
          <p className="lede">
            What you studied and practised on this path — not a trade ticket, Red Seal, or a guaranteed job.
            A real instructor still checks you on the floor later.
          </p>
        </header>
        <div className="train-learn-grid skills-passport-stages">
          <article className="skills-passport-stage">
            <span className="badge brand">Learned</span>
            <h3>Learned</h3>
            <p>Studied in the app — you know the idea.</p>
          </article>
          <article className="skills-passport-stage">
            <span className="badge brand">Practised</span>
            <h3>Practised</h3>
            <p>Tried through Practice drills and unit reviews.</p>
          </article>
          <article className="skills-passport-stage">
            <span className="badge ok">Checked</span>
            <h3>Checked</h3>
            <p>An instructor watches with you on the job — Practice alone does not award this.</p>
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
              go(22)
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
    const nextStep = Math.min(JOURNEY_STEP_COUNT, (JOURNEY_STEPS.filter((s) => s.unit === checkpointUnit).map((s) => s.n).pop() || checkpointUnit) + 1)
    return (
      <Shell
        step={step}
        onBack={() => setCheckpointUnit(null)}
        nextLabel="Back to lesson"
        onNext={() => setCheckpointUnit(null)}
      >
        <div className="unit-checkpoint">
          <p className="section-kicker">Unit practice</p>
          <h2>
            Unit {unit.id}: {unit.label} practice
          </h2>
          <p className="lede">A few pictures to clear this unit. Finish them, then the next unit can open.</p>
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
    const ok = await speakEnglish(term.english)
    setVocabSpeakingId(null)
    /* Offer unlocks typing even when audio is blocked — Hear again remains. */
    setVocabHeard((h) => ({ ...h, [term.id]: true }))
    if (ok) recordSkillAttempt('vocab', true, 8)
  }

  async function connectVocabLang(term: (typeof VOCAB_UNIT)[number], lang: SupportLang) {
    setVocabConnected((c) => ({ ...c, [term.id]: lang }))
    setVocabUniversal((u) => {
      if (!u[term.id]) return u
      const next = { ...u }
      delete next[term.id]
      return next
    })
    setVocabUniversalStatus({ kind: 'idle' })
    setVocabSpeakingId(term.id)
    stopSpeech()
    /*
     * EN chip: play English once and unlock pick+type (no redundant second Hear English).
     * Mother-tongue chips: gloss first, then English — same bridge as before.
     */
    let heard: boolean
    if (lang === 'English') {
      heard = await speakEnglish(term.english)
    } else {
      await speakSupport(term.gloss[lang], lang)
      await new Promise((r) => setTimeout(r, 220))
      heard = await speakEnglish(term.english)
    }
    /*
     * Unlock the type beat after the bridge attempt even if TTS fails
     * (locked autoplay / missing neural). Hear-again stays available;
     * English spelling stays hidden until they type it.
     */
    setVocabHeard((h) => ({ ...h, [term.id]: true }))
    if (heard) recordSkillAttempt('vocab', true, 8)
    setVocabSpeakingId(null)
  }

  /**
   * More languages: translate English vocab → speak translation → speak English → unlock pick+type.
   * Soft errors stay on-card; EN / mother-tongue chips remain available.
   */
  async function connectVocabUniversal(
    term: (typeof VOCAB_UNIT)[number],
    lang: HearLanguage,
  ) {
    setVocabUniversalBusyId(term.id)
    setVocabSpeakingId(term.id)
    setVocabUniversalStatus({ kind: 'loading', phase: 'translate' })
    stopSpeech()

    if (lang.code === 'en' || lang.bcp47.toLowerCase().startsWith('en')) {
      setVocabConnected((c) => ({ ...c, [term.id]: 'English' }))
      setVocabUniversal((u) => {
        if (!u[term.id]) return u
        const next = { ...u }
        delete next[term.id]
        return next
      })
      const heard = await speakEnglish(term.english)
      setVocabHeard((h) => ({ ...h, [term.id]: true }))
      setVocabUniversalStatus({
        kind: 'ready',
        translated: term.english,
        lang,
        source: 'passthrough',
        spoken: heard,
      })
      if (heard) recordSkillAttempt('vocab', true, 8)
      setVocabSpeakingId(null)
      setVocabUniversalBusyId(null)
      return
    }

    try {
      const { translated, source } = await translateVocabWord(term.english, lang)
      setVocabUniversalStatus({ kind: 'loading', phase: 'speak' })
      const spoken = await speakLangCode(translated, lang.code, lang.bcp47)
      setVocabUniversal((u) => ({
        ...u,
        [term.id]: { code: lang.code, name: lang.name, translated, source },
      }))
      setVocabConnected((c) => {
        if (!c[term.id]) return c
        const next = { ...c }
        delete next[term.id]
        return next
      })
      await new Promise((r) => setTimeout(r, 220))
      const heardEn = await speakEnglish(term.english)
      setVocabHeard((h) => ({ ...h, [term.id]: true }))
      setVocabUniversalStatus({
        kind: 'ready',
        translated,
        lang,
        source,
        spoken: spoken || heardEn,
      })
      if (spoken || heardEn) recordSkillAttempt('vocab', true, 8)
    } catch (e) {
      const err = e as Error & { unsupported?: boolean }
      const detail = err?.message || 'Could not translate that language right now.'
      setVocabUniversalStatus(
        err?.unsupported
          ? { kind: 'unsupported', lang, detail }
          : { kind: 'error', detail },
      )
    } finally {
      setVocabSpeakingId(null)
      setVocabUniversalBusyId(null)
    }
  }

  function markCurrentVocabKnown(term: (typeof VOCAB_UNIT)[number]) {
    /* Skip-known is retake-only — never on day-one intake. */
    if (!hasClearedVocabStation(pathwayId)) return
    markVocabKnown(pathwayId, term.id)
    setVocabKnownIds(getKnownVocabIds(pathwayId))
    creditKnownVocabMastery()
    playFoley('whoosh')
  }

  function markVocabTyped(term: (typeof VOCAB_UNIT)[number]) {
    setVocabTyped((t) => ({ ...t, [term.id]: true }))
    recordSkillAttempt('vocab', true, 10)
    /* Success Foley owned by VocabSheet → firePlayClear — do not double-latch. */
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
      go(6, `Opening ${label} vocabulary…`)
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
      go(6, `Opening ${label} vocabulary…`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save pathway')
      go(6, `Opening ${label} vocabulary…`)
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
          markNavCueSeen(NAV_CUE.langPick)
          setRegForm((f) => ({ ...f, preferred_language: supportLang }))
          go(4)
        }}
        nextLabel={assessT(ASSESSMENT_COPY.next, supportLang)}
      >
        <div className="train-lang-pick">
          <p className="play-nearby-objective" aria-live="polite">
            {assessT(ASSESSMENT_COPY.nearbyLangPick, supportLang)}
          </p>
          <h2 className="career-assess-title">{assessT(ASSESSMENT_COPY.langPickTitle, supportLang)}</h2>
          <p className="career-assess-lede">{assessT(ASSESSMENT_COPY.langPickBody, supportLang)}</p>
          <NavCueTarget
            cueId={NAV_CUE.langPick}
            arrowLabel="Languages here"
            arrowSide="above"
            className="train-lang-cue"
          >
            <NavGlowRegion cueId={NAV_CUE.langPick} className="train-lang-grid" dismissOnClick={false}>
              {SUPPORT_LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`train-lang${supportLang === l.id ? ' is-selected' : ''}`}
                  onClick={() => {
                    markNavCueSeen(NAV_CUE.langPick)
                    setSupportLang(l.id)
                  }}
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
            </NavGlowRegion>
          </NavCueTarget>
          <div className="train-bridge">
            <p><strong>{assessT(ASSESSMENT_COPY.introTitle, supportLang)}</strong></p>
            <p>{assessT(ASSESSMENT_COPY.introBody, supportLang)}</p>
          </div>
          <p className="career-assess-lede">{assessT(ASSESSMENT_COPY.langPickHint, supportLang)}</p>
        </div>
      </Shell>
    )
  }

  /* Step 4: Work-style path quiz (10 questions, mother tongue) */
  if (step === 4) {
    return (
      <Shell step={4}>
        <CareerStyleAssessment
          lang={supportLang}
          answers={careerStyleAnswers}
          onChange={(id, optionId) => setCareerStyleAnswers((a) => ({ ...a, [id]: optionId }))}
          onBack={() => go(3)}
          onComplete={(finalStyle) => {
            setCareerStyleAnswers(finalStyle)
            const styleScores = scoreStyleAnswers(finalStyle)
            setInterest(topPathway(styleScores))
            recordSkillAttempt('career-assessment', true, 12)
            go(5, assessT(ASSESSMENT_COPY.seeResults, supportLang))
          }}
        />
      </Shell>
    )
  }

  /* Step 5: Career profile from work-style path quiz */
  if (step === 5) {
    const pathway = interest || 'construction'
    const ranked = rankedRiasec(riasecScores)
    const pathwayScores = scoreStyleAnswers(careerStyleAnswers)
    return (
      <Shell step={5}>
        <CareerAssessmentResult
          lang={supportLang}
          pathway={pathway}
          riasec={riasecScores}
          pathwayScores={pathwayScores}
          ranked={ranked}
          showRiasec={false}
          continueLabel="continueVocab"
          busy={busy}
          error={error}
          onBack={() => go(4)}
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

  /* Step 6: Visual Vocabulary — hear → hear → pick → type (reps that stick) */
  if (step === 6) {
    const knownSet = new Set(vocabKnownIds)
    const wordDone = (t: (typeof VOCAB_UNIT)[number]) =>
      !!vocabHeard[t.id] &&
      !!vocabTyped[t.id] &&
      (!!vocabConnected[t.id] || !!vocabUniversal[t.id] || knownSet.has(t.id))
    const linkedCount = VOCAB_UNIT.filter(wordDone).length
    /**
     * Ladder: Daily Conversation Level-1, then specialty pictures.
     * Construction Sentence Structure must not unlock on greetings alone —
     * gate = DC Level-1 + specialty VV Level-1 (see §6.3a).
     */
    const usesSentenceLadder = SENTENCE_CLOZE.length > 0
    const ladderGateTerms = usesSentenceLadder
      ? sentenceLadderGateTerms(VOCAB_UNIT)
      : VOCAB_UNIT.slice(0, Math.min(LEVEL1_PAGE_SIZE, VOCAB_UNIT.length))
    const journeyGateIds = usesSentenceLadder ? ladderGateTerms.map((t) => t.id) : undefined
    const journeyGateCount = usesSentenceLadder
      ? undefined
      : Math.min(LEVEL1_PAGE_SIZE, VOCAB_UNIT.length)
    const gateLinked = ladderGateTerms.filter(wordDone).length
    const ready = gateLinked >= ladderGateTerms.length
    const dcGate = ladderGateTerms.filter(isDailyConversationTerm)
    const specialtyGate = ladderGateTerms.filter((t) => !isDailyConversationTerm(t))
    const dcLinked = dcGate.filter(wordDone).length
    const specialtyLinked = specialtyGate.filter(wordDone).length
    const firstSpecialtyIdx = VOCAB_UNIT.findIndex((t) => !isDailyConversationTerm(t))
    const canContinue = ready || isPracticeMode()

    return (
      <Shell
        step={6}
        onBack={() => go(5)}
        onNext={
          canContinue
            ? () => {
                /* First-set clear → later visits unlock skip-known (retake), not day-one. */
                if (ready) markVocabStationCleared(pathwayId)
                go(7, 'Opening language organize…')
              }
            : undefined
        }
        nextLabel="Continue to language organize"
        nextDisabled={!canContinue}
      >
        <VocabSheet
          terms={VOCAB_UNIT}
          index={vocabIdx}
          speakingId={vocabSpeakingId}
          heard={vocabHeard}
          connected={vocabConnected}
          universal={vocabUniversal}
          universalBusyId={vocabUniversalBusyId}
          universalStatus={vocabUniversalStatus}
          typed={vocabTyped}
          knownIds={vocabKnownIds}
          journeyGateCount={journeyGateCount}
          journeyGateIds={journeyGateIds}
          allowSkipKnown={vocabRetake}
          onIndexChange={(i) => {
            setVocabIdx(i)
            setVocabUniversalStatus({ kind: 'idle' })
          }}
          onPlayEnglish={(term) => void playVocabEnglish(term)}
          onConnectLang={(term, lang) => void connectVocabLang(term, lang)}
          onUniversalHear={(term, lang) => void connectVocabUniversal(term, lang)}
          onClearUniversalStatus={() => setVocabUniversalStatus({ kind: 'idle' })}
          onMarkKnown={(term) => markCurrentVocabKnown(term)}
          onTypedCorrect={(term) => markVocabTyped(term)}
        />
        {usesSentenceLadder && !ready && dcLinked >= dcGate.length && specialtyGate.length > 0 ? (
          <p className="alert warn train-ladder-nudge" role="status">
            Greetings set is done. Next: workplace pictures
            ({specialtyLinked} of {specialtyGate.length})
            {firstSpecialtyIdx >= 0
              ? ` — open the ${
                  pathwayId === 'logistics'
                    ? 'Logistics'
                    : pathwayId === 'community'
                      ? 'Community'
                      : 'Construction'
                } word pages.`
              : '.'}
            {' '}
            {firstSpecialtyIdx >= 0 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setVocabIdx(firstSpecialtyIdx)
                  playFoley('whoosh')
                }}
              >
                Jump to workplace words
              </button>
            ) : null}
          </p>
        ) : null}
        {ready && !vocabRetake ? (
          <p className="vocab-retake-invite" role="status">
            First set clear. When you come back for another round, you can mark words you already know —
            still hear English and type so it sticks.
          </p>
        ) : null}
        <p className="train-vocab-counter">
          {ready
            ? `Words practised: ${linkedCount}. Next: Language Organize — match each word to its picture.`
            : `Words practised: ${linkedCount}. Keep going — hear, hear, pick, type.`}
        </p>
      </Shell>
    )
  }

  /* Step 7: Language Organize — jumble pictures with five-language words */
  if (step === 7) {
    if (!organizeTerms.length) {
      setOrganizeTerms(pickOrganizeTerms(VOCAB_UNIT))
      return (
        <Shell step={7} onBack={() => go(6)}>
          <p className="lede">Opening language organize…</p>
        </Shell>
      )
    }
    return (
      <Shell step={7} onBack={() => go(6)}>
        <VocabOrganizeQuiz
          terms={organizeTerms}
          onPassed={() => go(8, 'Opening English Eye Spy…')}
          onSkip={isPracticeMode() ? () => go(8, 'Opening English Eye Spy…') : undefined}
        />
        <StationContext>
          <WhyWork>
            {pathwayId === 'logistics'
              ? 'The same warehouse word has one English name and many home-language names. Hear a language, then drop the picture on that word.'
              : 'The same tool has one English name and many home-language names. Hear a language, then drop the picture on that word.'}
          </WhyWork>
          <TeachNote>
            Five short boards. Tap a picture, then Drop on the matching word. Clear every picture to finish the
            round. Hear any language if you want help.
          </TeachNote>
        </StationContext>
      </Shell>
    )
  }

  /* Step 8: English Eye Spy — after Visual Vocabulary + language organize */
  if (step === 8) {
    return (
      <Shell
        step={8}
        onBack={() => go(7)}
      >
        <EyeSpyQuiz
          scenes={EYE_SPY_SCENES}
          mode="exercise"
          pathwayId={pathwayId}
          onComplete={() => {
            setStep8Phase(SENTENCE_CLOZE.length ? 'sentences' : 'actions')
            setSentenceLevel1(false)
            setActionIdx(0)
            setActionAnswer(null)
            setActionCorrect(false)
            advanceWithOptionalCheckpoint(
              8,
              9,
              SENTENCE_CLOZE.length ? 'Opening Sentence Structure…' : 'Opening Word → Action…',
            )
          }}
        />
        <StationContext>
          <WhyWork>
            {pathwayId === 'logistics'
              ? 'On a real warehouse floor every object sits among other goods and equipment. Name each one until the board is clear.'
              : 'On a real site every tool sits among other objects. Name each one until the board is clear.'}
          </WhyWork>
          <TeachNote>
            Tap a picture, then its English name — the pair clears by itself. Empty the board, then the next
            scene. Wrong? Try again. No rush.
          </TeachNote>
        </StationContext>
      </Shell>
    )
  }

  /* Step 9: Construction/Logistics = Sentence Structure → Word → Action; others = Word → Action */
  if (step === 9) {
    if (SENTENCE_CLOZE.length && step8Phase === 'sentences') {
      return (
        <Shell step={9} onBack={() => go(8)}>
          <SentenceClozeDrill
            items={SENTENCE_CLOZE}
            documentLabel={
              pathwayId === 'logistics'
                ? 'Logistics Questions'
                : pathwayId === 'community'
                  ? 'Community Sentence Practice'
                  : 'Construction Questions'
            }
            picturedAnswers={VOCAB_UNIT.filter((t) => t.imageKey).map((t) => t.english)}
            onLevel1Passed={() => {
              setSentenceLevel1(true)
              recordSkillAttempt('sentence-cloze', true, 20)
            }}
            onContinueToActions={() => {
              if (!sentenceLevel1) {
                setSentenceLevel1(true)
                recordSkillAttempt('sentence-cloze', true, 20)
              }
              setActionIdx(0)
              setActionAnswer(null)
              setActionCorrect(false)
              setStep8Phase('actions')
              playFoley('whoosh')
            }}
            onSkipToActions={() => {
              setActionIdx(0)
              setActionAnswer(null)
              setActionCorrect(false)
              setStep8Phase('actions')
              playFoley('whoosh')
            }}
          />
        </Shell>
      )
    }

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
    const actionTermIds = WORD_ACTIONS.map((a) => a.termId)
    const options = shuffleChoices([
      term?.english || item.termId,
      ...pickSpecialtyDistractors(VOCAB_UNIT, item.termId, 3, actionTermIds).map((t) => t.english),
    ])

    const coachFirst = safeIdx === 0 && !actionAnswer

    function pickAction(opt: string) {
      if (actionAnswer) return
      const ok = opt === term?.english
      setActionAnswer(opt)
      setActionCorrect(ok)
      if (coachFirst) advanceStationCoach('word-action')
      recordSkillAttempt('word-action', ok)
      if (ok) {
        const left = safeDeck.length - (safeIdx + 1)
        firePlayClear({
          label: 'Action clear',
          remnant: left > 0 ? `${left} left` : 'Last action — continue when ready',
          kind: left === 0 ? 'board' : 'micro',
        })
      } else {
        playFoley('wrong')
      }
    }

    function nextAction() {
      if (!actionCorrect) {
        setActionAnswer(null)
        setActionCorrect(false)
        return
      }
      if (isLast) {
        requestPracticeAdvance(() => go(10, 'Opening supported practice…'))
        return
      }
      setActionIdx((i) => i + 1)
      setActionAnswer(null)
      setActionCorrect(false)
    }

    return (
      <Shell
        step={9}
        onBack={() => {
          if (SENTENCE_CLOZE.length) {
            setStep8Phase('sentences')
            return
          }
          go(8)
        }}
      >
        {SENTENCE_CLOZE.length ? (
          <p className="train-vocab-counter">Word → Action · after Sentence Structure</p>
        ) : null}
        <p className="play-nearby-objective" aria-live="polite">
          Clear this action · {safeDeck.length - safeIdx} left
        </p>
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
          <p className="train-check-prompt">
            {pathwayId === 'community'
              ? 'Which support item is this action for?'
              : pathwayId === 'logistics'
                ? 'Which warehouse item is this action for?'
                : 'Which tool or material is this action for?'}
          </p>
          <div className="train-choice-grid" data-coach="choice-opt">
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
              {actionCorrect ? (
                <div className="alert ok">Yes. Word and action match.</div>
              ) : (
                <p className="play-soft-miss" role="status">
                  {softMissLine(`This action uses the ${term?.english}.`)}
                </p>
              )}
              <AdvanceGateNote />
              <button type="button" className="btn btn-primary" onClick={nextAction}>
                {actionCorrect
                  ? (isLast ? 'Continue to supported practice' : 'Next action')
                  : SOFT_RETRY_LABEL}
              </button>
            </>
          )}
          {coachFirst ? (
            <StationCoach stationId="word-action" layoutKey={`${item.termId}-${safeIdx}`} />
          ) : null}
        </article>
      </Shell>
    )
  }

  /* Step 10: Supported Practice — Picture Match video→play, then Sentence Match video→play */
  if (step === 10) {
    return (
      <Shell step={10} onBack={() => go(9)}>
        <SupportedPracticeGames
          items={supportedPracticeDeck(pathwayId)}
          game={spPhase}
          onPictureComplete={() => {
            setSpPhase('sentence')
            try {
              localStorage.setItem('pa-sp-phase-v1', 'sentence')
            } catch {
              /* ignore */
            }
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onComplete={() =>
            requestPracticeAdvance(() => go(11, 'Opening workplace instructions…'))
          }
        />
        <StationContext>
          <WhyWork>
            Help is strength. Short sentences with clear photos — practice, not a test.
          </WhyWork>
          <TeachNote>
            Picture Match, then Sentence Match. Two choices. Two clears. Royalty-free workplace photos.
            Wrong? Try again. Then workplace instructions.
          </TeachNote>
        </StationContext>
      </Shell>
    )
  }

  /* Step 11: Workplace instructions — English only */
  if (step === 11) {
    const instr = WORKPLACE_INSTRUCTIONS[instrIdx]
    const isLast = instrIdx >= WORKPLACE_INSTRUCTIONS.length - 1
    const coachFirst = instrIdx === 0 && !instrAnswer

    function pickInstr(opt: string) {
      if (instrAnswer || !instrHeard) return
      const ok = opt === instr.correct
      setInstrAnswer(opt)
      setInstrCorrect(ok)
      if (coachFirst) advanceStationCoach('workplace-instructions')
      recordSkillAttempt('instructions', ok)
      if (ok) {
        const left = WORKPLACE_INSTRUCTIONS.length - (instrIdx + 1)
        firePlayClear({
          label: 'Instruction clear',
          remnant: left > 0 ? `${left} left` : 'Last instruction — continue when ready',
          kind: left === 0 ? 'board' : 'micro',
        })
      } else {
        playFoley('wrong')
      }
    }

    function nextInstr() {
      if (!instrCorrect) {
        setInstrAnswer(null)
        setInstrCorrect(false)
        return
      }
      if (isLast) {
        requestPracticeAdvance(() => go(12, 'Opening Basic Computer Skills…'))
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
        <p className="play-nearby-objective" aria-live="polite">
          Clear this instruction · {WORKPLACE_INSTRUCTIONS.length - instrIdx} left
        </p>
        <p className="train-vocab-counter">Instruction {instrIdx + 1} of {WORKPLACE_INSTRUCTIONS.length} · English only</p>
        <div className="train-instruction">
          <PictureCard
            image={pathwayImage(instr.imageKey)}
            fit="contain"
            label="A worker gives a direction"
            caption="Listen in English (required). Mother-tongue help is optional only."
          />
          <blockquote>&ldquo;{instr.text}&rdquo;</blockquote>
          <div className="train-audio-row" data-coach="instr-hear">
            <button
              type="button"
              className="btn btn-primary"
              disabled={speaking !== null}
              onClick={() => {
                void (async () => {
                  await playEnglish(instr.text)
                  setInstrHeard(true)
                  if (coachFirst) advanceStationCoach('workplace-instructions')
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
          <div className="train-choice-grid" data-coach="instr-choice">
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
            {instrCorrect ? (
              <div className="alert ok">Yes. You heard the tool name and the action.</div>
            ) : (
              <p className="play-soft-miss" role="status">
                {softMissLine(`The action was: "${instr.correct}".`)}
              </p>
            )}
            <button type="button" className="btn btn-primary" onClick={nextInstr}>
              {instrCorrect
                ? (isLast ? 'Continue to Basic Computer Skills' : 'Next instruction')
                : SOFT_RETRY_LABEL}
            </button>
          </>
        )}
        {coachFirst ? (
          <StationCoach stationId="workplace-instructions" layoutKey={`instr-${instrIdx}-${instrHeard}`} />
        ) : null}
      </Shell>
    )
  }

  /* Step 12: Basic Computer Skills — curriculum map position (Unit 6, all pathways) */
  if (step === 12) {
    return (
      <Shell step={12} onBack={() => { resetInstr(); go(11) }}>
        {/* Drill first — At work / Teach note used to push Watch/Try below the phone fold */}
        <ComputerSkillsDrill
          onComplete={() =>
            requestPracticeAdvance(() =>
              advanceWithOptionalCheckpoint(12, 13, 'Opening site language…'),
            )
          }
          onSkip={
            isPracticeMode()
              ? () =>
                  requestPracticeAdvance(() =>
                    advanceWithOptionalCheckpoint(12, 13, 'Opening site language…'),
                  )
              : undefined
          }
        />
        <details className="station-context-fold">
          <summary>Why this station · teach note</summary>
          <WhyWork>
            This may be your first computer. Short videos. Simple English. Then you try each step yourself.
          </WhyWork>
          <TeachNote>
            Pattern for every lesson: Watch → Try → Remember → one check. Misses teach — try again, no rush.
          </TeachNote>
        </details>
      </Shell>
    )
  }

  /* Step 13: Site language — hear phrase, choose meaning, one by one */
  if (step === 13) {
    const phrase = SITE_PHRASES[Math.min(phraseIdx, SITE_PHRASES.length - 1)]
    const isLast = phraseIdx >= SITE_PHRASES.length - 1

    const coachFirst = phraseIdx === 0 && !phraseAnswer

    function pickPhrase(opt: string) {
      if (!phraseHeard || phraseAnswer) return
      const ok = opt === phrase.answer
      setPhraseAnswer(opt)
      setPhraseCorrect(ok)
      if (coachFirst) advanceStationCoach('site-language')
      recordSkillAttempt('site-phrases', ok)
      if (ok) {
        const left = SITE_PHRASES.length - (phraseIdx + 1)
        firePlayClear({
          label: 'Phrase clear',
          remnant: left > 0 ? `${left} left` : 'Last phrase — continue when ready',
          kind: left === 0 ? 'board' : 'micro',
        })
      } else {
        playFoley('wrong')
      }
    }

    function nextPhrase() {
      if (!phraseCorrect) {
        setPhraseAnswer(null)
        setPhraseCorrect(false)
        return
      }
      if (isLast) {
        requestPracticeAdvance(() => go(14, 'Opening work-interest questions…'))
        return
      }
      setPhraseIdx((i) => i + 1)
      setPhraseHeard(false)
      setPhraseAnswer(null)
      setPhraseCorrect(false)
    }

    return (
      <Shell step={13} onBack={() => go(12)}>
        <p className="play-nearby-objective" aria-live="polite">
          Clear this phrase · {SITE_PHRASES.length - phraseIdx} left
        </p>
        <p className="train-vocab-counter">Phrase {phraseIdx + 1} of {SITE_PHRASES.length}</p>
        <article className="phrase-lesson-card">
          <p className="phrase-lesson-en">{phrase.en}</p>
          <button
            type="button"
            className={`btn ${phraseHeard ? 'btn-secondary on-light' : 'btn-primary'}`}
            data-coach="phrase-hear"
            disabled={speaking !== null}
            onClick={() => {
              /* Only the first Hear clears the hear step — Hear again must not skip the choice beat. */
              if (coachFirst && !phraseHeard) advanceStationCoach('site-language')
              void (async () => {
                await playEnglish(phrase.en)
                setPhraseHeard(true)
              })()
            }}
          >
            {phraseHeard ? 'Heard ✓ · Hear again' : 'Hear English'}
          </button>
          <p className="train-check-prompt">What does this phrase mean on site?</p>
          <div className="train-choice-grid" data-coach="choice-opt">
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
          {coachFirst ? (
            <StationCoach
              stationId="site-language"
              layoutKey={`${phrase.en}-${phraseHeard}-${phraseAnswer ?? 'none'}`}
            />
          ) : null}
          {phraseAnswer && (
            <>
              {phraseCorrect ? (
                <div className="alert ok">Yes. {phrase.why}</div>
              ) : (
                <p className="play-soft-miss" role="status">
                  {softMissLine(phrase.why)}
                </p>
              )}
              <button type="button" className="btn btn-primary" onClick={nextPhrase}>
                {phraseCorrect
                  ? (isLast ? 'Continue to work-interest questions' : 'Next phrase')
                  : SOFT_RETRY_LABEL}
              </button>
            </>
          )}
        </article>
      </Shell>
    )
  }

  /* Step 14: Interest assessment (30) after practice — specialize */
  if (step === 14) {
    if (!careerInterestDone) {
      return (
        <Shell step={14}>
          <CareerInterestAssessment
            lang={supportLang}
            answers={careerInterestAnswers}
            onChange={(id, value) => setCareerInterestAnswers((a) => ({ ...a, [id]: value }))}
            onBack={() => go(13)}
            onComplete={(finalAnswers) => {
              setCareerInterestAnswers(finalAnswers)
              const interestPct = scoreInterestAnswers(finalAnswers)
              setRiasecScores(interestPct)
              const combined = combinePathwayScores(pathwayFromRiasec(interestPct), scoreStyleAnswers(careerStyleAnswers))
              setInterest(topPathway(combined))
              setCareerInterestDone(true)
              recordSkillAttempt('career-assessment', true, 20)
            }}
          />
        </Shell>
      )
    }
    const pathway = interest || 'construction'
    const ranked = rankedRiasec(riasecScores)
    const pathwayScores = combinePathwayScores(
      pathwayFromRiasec(riasecScores),
      scoreStyleAnswers(careerStyleAnswers),
    )
    return (
      <Shell step={14}>
        <CareerAssessmentResult
          lang={supportLang}
          pathway={pathway}
          riasec={riasecScores}
          pathwayScores={pathwayScores}
          ranked={ranked}
          showRiasec
          allowPathwaySwitch
          continueLabel="continueSpecialize"
          busy={busy}
          error={error}
          onPathwayChange={(id) => {
            setInterest(id)
            playFoley('whoosh')
          }}
          onBack={() => setCareerInterestDone(false)}
          onContinue={() => {
            void (async () => {
              setBusy(true)
              const chosen = (interest || getActivePathway()) as StreamPathwayId
              setRecommendedPathway(chosen)
              setActivePathway(chosen)
              setPathwayId(chosen)
              if (!isPracticeMode()) {
                const ok = await ensureDemoStudent()
                if (ok) {
                  try {
                    const sid = student?.id
                    if (sid) {
                      await selectPathway(sid, chosen)
                      await refresh()
                    }
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Could not save pathway')
                  }
                }
              }
              setBusy(false)
              requestPracticeAdvance(() =>
                advanceWithOptionalCheckpoint(14, 15, 'Opening safety…'),
              )
            })()
          }}
        />
      </Shell>
    )
  }

  if (step === 15) {
    return (
      <Shell step={15} onBack={() => { setCareerInterestDone(false); go(14) }}>
        <QuizRunner
          items={SAFETY_QUIZ}
          coachStationId="safety"
          onComplete={() => { setToolIdx(0); setToolAnswer(null); setToolCorrect(false); go(16) }}
          gated
        />
      </Shell>
    )
  }

  if (step === 16) {
    const cat = TOOL_CATEGORIES[Math.min(toolIdx, TOOL_CATEGORIES.length - 1)]
    const isLast = toolIdx >= TOOL_CATEGORIES.length - 1

    const coachFirst = toolIdx === 0 && !toolAnswer

    function pickTool(opt: string) {
      if (toolAnswer) return
      const ok = opt === cat.answer
      setToolAnswer(opt)
      setToolCorrect(ok)
      if (coachFirst) advanceStationCoach('tools')
      recordSkillAttempt('tools', ok)
      if (ok) {
        const left = TOOL_CATEGORIES.length - (toolIdx + 1)
        firePlayClear({
          label: 'Tool group clear',
          remnant: left > 0 ? `${left} left` : 'Last group — continue when ready',
          kind: left === 0 ? 'board' : 'micro',
        })
      } else {
        playFoley('wrong')
      }
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
        go(17)
        return
      }
      setToolIdx((i) => i + 1)
      setToolAnswer(null)
      setToolCorrect(false)
    }

    return (
      <Shell step={16} onBack={() => go(15)}>
        <p className="play-nearby-objective" aria-live="polite">
          Clear this tool group · {TOOL_CATEGORIES.length - toolIdx} left
        </p>
        <p className="train-vocab-counter">Tool group {toolIdx + 1} of {TOOL_CATEGORIES.length}</p>
        <article className="topic-lesson-card">
          <span className="train-topic-mark">{cat.mark}</span>
          <h3>{cat.title}</h3>
          <p>{cat.why}</p>
          <p className="train-check-prompt">{cat.prompt}</p>
          <div className="train-choice-grid" data-coach="choice-opt">
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
              {toolCorrect ? (
                <div className="alert ok">Yes.</div>
              ) : (
                <p className="play-soft-miss" role="status">
                  {softMissLine(`It’s ${cat.answer}.`)}
                </p>
              )}
              <button type="button" className="btn btn-primary" onClick={nextTool}>
                {toolCorrect
                  ? (isLast ? 'Continue to systems' : 'Next tool group')
                  : SOFT_RETRY_LABEL}
              </button>
            </>
          )}
          {coachFirst ? (
            <StationCoach stationId="tools" layoutKey={`${cat.title}-${toolIdx}`} />
          ) : null}
        </article>
      </Shell>
    )
  }

  if (step === 17) {
    const topic = SYSTEM_TOPICS[Math.min(sysIdx, SYSTEM_TOPICS.length - 1)]
    const isLast = sysIdx >= SYSTEM_TOPICS.length - 1

    const coachFirst = sysIdx === 0 && !sysAnswer

    function pickSys(opt: string) {
      if (sysAnswer) return
      const ok = opt === topic.answer
      setSysAnswer(opt)
      setSysCorrect(ok)
      if (coachFirst) advanceStationCoach('systems')
      recordSkillAttempt('systems', ok)
      if (ok) {
        const left = SYSTEM_TOPICS.length - (sysIdx + 1)
        firePlayClear({
          label: 'System clear',
          remnant: left > 0 ? `${left} left` : 'Last system — continue when ready',
          kind: left === 0 ? 'board' : 'micro',
        })
      } else {
        playFoley('wrong')
      }
    }

    function nextSys() {
      if (!sysCorrect) {
        setSysAnswer(null)
        setSysCorrect(false)
        return
      }
      if (isLast) {
        requestPracticeAdvance(() => advanceWithOptionalCheckpoint(
              17,
              18, 'Opening equipment videos…'))
        return
      }
      setSysIdx((i) => i + 1)
      setSysAnswer(null)
      setSysCorrect(false)
    }

    return (
      <Shell step={17} onBack={() => go(16)}>
        <p className="play-nearby-objective" aria-live="polite">
          Clear this system · {SYSTEM_TOPICS.length - sysIdx} left
        </p>
        <p className="train-vocab-counter">System {sysIdx + 1} of {SYSTEM_TOPICS.length}</p>
        <article className="topic-lesson-card">
          <span className="train-topic-mark">{topic.mark}</span>
          <h3>{topic.title}</h3>
          <p>{topic.why}</p>
          <p className="train-check-prompt">{topic.prompt}</p>
          <div className="train-choice-grid" data-coach="choice-opt">
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
              {sysCorrect ? (
                <div className="alert ok">Yes.</div>
              ) : (
                <p className="play-soft-miss" role="status">
                  {softMissLine(`It’s ${topic.answer}.`)}
                </p>
              )}
              <button type="button" className="btn btn-primary" onClick={nextSys}>
                {sysCorrect
                  ? (isLast ? 'Continue to instructor check' : 'Next system')
                  : SOFT_RETRY_LABEL}
              </button>
            </>
          )}
          {coachFirst ? (
            <StationCoach stationId="systems" layoutKey={`${topic.title}-${sysIdx}`} />
          ) : null}
        </article>
      </Shell>
    )
  }

  if (step === 18) {
    const equipmentPack =
      pathwayId === 'logistics'
        ? ('warehouse' as const)
        : pathwayId === 'construction'
          ? ('construction' as const)
          : null
    return (
      <Shell step={18} onBack={() => go(17)}>
        {equipmentPack === 'warehouse' ? (
          <>
            <WhyWork>
              After systems, watch each warehouse machine before hands-on training. Know it, inspect it, protect the
              area — then practise with an instructor.
            </WhyWork>
            <TeachNote>
              Fourteen short lessons in equipment families. Watch each video, then answer the practice questions.
              Powered lift trucks are stay-clear awareness only — not operator certification. Soft-gates stay off for
              showcase — every video is open.
            </TeachNote>
            <EquipmentVideoDrill
              pack="warehouse"
              onComplete={() =>
                requestPracticeAdvance(() =>
                  advanceWithOptionalCheckpoint(18, 19, 'Opening instructor check…'),
                )
              }
              onSkip={
                isPracticeMode()
                  ? () =>
                      requestPracticeAdvance(() =>
                        advanceWithOptionalCheckpoint(18, 19, 'Opening instructor check…'),
                      )
                  : undefined
              }
            />
          </>
        ) : equipmentPack === 'construction' ? (
          <>
            <WhyWork>
              After systems, watch each construction machine before hands-on training. Know it, inspect it, protect the
              area — then practise with an instructor.
            </WhyWork>
            <TeachNote>
              Fourteen short lessons in equipment families. Watch each video, then answer the practice questions.
              Powered machines are stay-clear awareness only — not operator certification. Soft-gates stay off for
              showcase — every video is open.
            </TeachNote>
            <EquipmentVideoDrill
              pack="construction"
              onComplete={() =>
                requestPracticeAdvance(() =>
                  advanceWithOptionalCheckpoint(18, 19, 'Opening instructor check…'),
                )
              }
              onSkip={
                isPracticeMode()
                  ? () =>
                      requestPracticeAdvance(() =>
                        advanceWithOptionalCheckpoint(18, 19, 'Opening instructor check…'),
                      )
                  : undefined
              }
            />
          </>
        ) : (
          <article className="topic-lesson-card">
            <p className="section-kicker">Equipment videos</p>
            <h2>Video section · Equipment</h2>
            <p className="lede">
              Construction and Logistics each have fourteen machine lessons with practice questions —{' '}
              <strong>Unit 8 · Video</strong>. Switch pathways to watch them, or continue this pathway to instructor
              observation.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setActivePathway('construction')
                  setPathwayId('construction')
                  playFoley('whoosh')
                }}
              >
                Open Video section · Construction
              </button>
              <button
                type="button"
                className="btn btn-secondary on-light"
                onClick={() => {
                  setActivePathway('logistics')
                  setPathwayId('logistics')
                  playFoley('whoosh')
                }}
              >
                Open Video section · Logistics
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  recordSkillAttempt('equipment-videos', true, 15)
                  requestPracticeAdvance(() =>
                    advanceWithOptionalCheckpoint(18, 19, 'Opening instructor check…'),
                  )
                }}
              >
                Stay on this pathway · Continue
              </button>
            </div>
          </article>
        )}
      </Shell>
    )
  }

    if (step === 19) {
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
      if (ok) {
        const left = OBSERVATION_SCENARIOS.length - (obsIdx + 1)
        firePlayClear({
          label: 'Order clear',
          remnant: left > 0 ? `${left} left` : 'Last practice — continue when ready',
          kind: left === 0 ? 'board' : 'micro',
        })
      } else {
        playFoley('wrong')
      }
      try {
        learnerSet(OBS_KEY, JSON.stringify({ scenario: scenario.id, picked: obsPicked, ok }))
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
        go(20, 'Opening on-site decisions…')
        return
      }
      setObsIdx((i) => i + 1)
      setObsPicked([])
      setObsChecked(false)
      setObsCorrect(false)
    }

    return (
      <Shell step={19} onBack={() => go(18)}>
        <WhyWork>Before a real instructor watches with you, practise the calm order of a skill — step by step.</WhyWork>
        <div className="train-learn-grid">
          <LearnCard mark="L" title="Learned" body="Studied in the app or class." />
          <LearnCard mark="P" title="Practised" body="Tried with supervision." />
          <LearnCard mark="C" title="Checked" body="An instructor confirms it with you on the job." />
        </div>
        <p className="play-nearby-objective" aria-live="polite">
          Clear this order · {OBSERVATION_SCENARIOS.length - obsIdx} left
        </p>
        <p className="train-vocab-counter">Practice {obsIdx + 1} of {OBSERVATION_SCENARIOS.length}</p>
        <article className="topic-lesson-card">
          <h3>{scenario.title}</h3>
          <p><strong>Situation:</strong> {scenario.situation}</p>
          <p className="muted">Skill focus: {scenario.skill}</p>
          <p className="train-check-prompt">Tap the steps in order (1 → {scenario.steps.length}).</p>
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
              {obsCorrect ? (
                <div className="alert ok">{scenario.passNote}</div>
              ) : (
                <p className="play-soft-miss" role="status">
                  {softMissLine(`Try this order: ${ordered.map((s) => s.label).join(' → ')}`)}
                </p>
              )}
              <button type="button" className="btn btn-primary" onClick={nextObs}>
                {obsCorrect
                  ? (isLast ? 'Continue to on-site training' : 'Next practice')
                  : SOFT_RETRY_LABEL}
              </button>
            </>
          )}
        </article>
      </Shell>
    )
  }

  if (step === 20) {
    const item = SITE_DECISIONS[siteIdx]
    const isLast = siteIdx >= SITE_DECISIONS.length - 1

    function pickSite(opt: string) {
      if (siteAnswer) return
      const ok = opt === item.answer
      setSiteAnswer(opt)
      setSiteCorrect(ok)
      recordSkillAttempt('site-log', ok)
      if (ok) {
        const left = SITE_DECISIONS.length - (siteIdx + 1)
        firePlayClear({
          label: 'Decision clear',
          remnant: left > 0 ? `${left} left` : 'Last decision — continue when ready',
          kind: left === 0 ? 'board' : 'micro',
        })
      } else {
        playFoley('wrong')
      }
    }

    function nextSite() {
      if (!siteCorrect) {
        setSiteAnswer(null)
        setSiteCorrect(false)
        return
      }
      if (isLast) {
        try {
          learnerSet(LOG_KEY, JSON.stringify({
            date: logForm.date || new Date().toISOString().slice(0, 10),
            tasks: logForm.tasks || 'Completed site decision practice',
            supervisor: logForm.supervisor || 'Practice supervisor',
            decisions: SITE_DECISIONS.length,
          }))
        } catch { /* */ }
        setFinalPhase('eyespy')
        go(21, 'Opening final check…')
        return
      }
      setSiteIdx((i) => i + 1)
      setSiteAnswer(null)
      setSiteCorrect(false)
    }

    return (
      <Shell step={20} onBack={() => go(19)}>
        <WhyWork>On-site days need judgment and a clear log. Practice both before the final check.</WhyWork>
        <p className="play-nearby-objective" aria-live="polite">
          Clear this decision · {SITE_DECISIONS.length - siteIdx} left
        </p>
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
              {siteCorrect ? (
                <div className="alert ok">{item.teachCorrect}</div>
              ) : (
                <p className="play-soft-miss" role="status">
                  {softMissLine(item.teachWrong)}
                </p>
              )}
              <button type="button" className="btn btn-primary" onClick={nextSite}>
                {siteCorrect
                  ? (isLast ? 'Continue to final check' : 'Next site decision')
                  : SOFT_RETRY_LABEL}
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

  /* Step 21: Final picture practice (limited tries) + written + certificate */
  if (step === 21) {
    if (finalPhase === 'eyespy') {
      return (
        <Shell step={21} onBack={() => go(20)}>
          <PictureCard emoji="E" label="Final picture practice" caption="Clear every picture. You can try a few times. Tap each picture with its word until the board is empty." />
          <EyeSpyQuiz
            scenes={EYE_SPY_SCENES}
            mode="exam"
            pathwayId={pathwayId}
            onComplete={() => { recordSkillAttempt('final-exam', true); setFinalPhase('written') }}
          />
        </Shell>
      )
    }
    if (finalPhase === 'written') {
      return (
        <Shell step={21} onBack={() => setFinalPhase('eyespy')}>
          <PictureCard emoji="W" label="Written practice" caption="Safety, measurement, language, and tools. Get each one clear — you can try the set again." />
          <QuizRunner items={FINAL_QUIZ} onComplete={() => { recordSkillAttempt('final-exam', true); setFinalPhase('certificate') }} gated />
        </Shell>
      )
    }
    return (
      <Shell
        step={21}
        onBack={() => setFinalPhase('written')}
        onNext={honestyChecked ? () => go(22, 'Opening employment…') : undefined}
        nextLabel="Continue to employment"
        nextDisabled={!honestyChecked}
      >
        <div className="train-passport">
          <PictureCard emoji="C" label="Purpose Academy Program Certificate" caption="You cleared the final check. Your Skills Passport keeps a record of what you practised." />
          <ul className="list-plain">
            <li>Picture practice cleared</li>
            <li>Written practice complete</li>
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
    try { learnerSet(EMP_KEY, JSON.stringify({ ...empForm, prepDone: true, followUp: true })) } catch { /* */ }
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

  /* Step 22: Employment connection */
  if (step !== 22) {
    return (
      <Shell step={step} onBack={() => go(Math.max(1, step - 1))}>
        <div className="alert warn">This station is not available yet.</div>
      </Shell>
    )
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
      if (ok) {
        const left = EMPLOYMENT_PREP.length - (empIdx + 1)
        firePlayClear({
          label: 'Prep clear',
          remnant: left > 0 ? `${left} left` : 'Interview prep clear — continue when ready',
          kind: left === 0 ? 'board' : 'micro',
        })
      } else {
        playFoley('wrong')
      }
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
      <Shell step={22} onBack={() => go(21)}>
        <WhyWork>Employment connection starts with clear interview answers, then partner matching.</WhyWork>
        <p className="play-nearby-objective" aria-live="polite">
          Clear this interview question · {EMPLOYMENT_PREP.length - empIdx} left
        </p>
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
              {empCorrect ? (
                <div className="alert ok">{item.teachCorrect}</div>
              ) : (
                <p className="play-soft-miss" role="status">
                  {softMissLine(item.teachWrong)}
                </p>
              )}
              <button type="button" className="btn btn-primary" onClick={nextEmp}>
                {empCorrect
                  ? (isLast ? 'Continue to partner setup' : 'Next interview question')
                  : SOFT_RETRY_LABEL}
              </button>
            </>
          )}
        </article>
      </Shell>
    )
  }

  return (
    <Shell step={22} onBack={() => { setEmpQuizDone(false); go(21) }}>
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
          <button className="btn btn-primary" type="submit">Finish this path</button>
        </form>
      ) : (
        <>
          <div className="alert ok">
            Path complete. Your Skills Passport and 30 / 90 / 180 day follow-up are open.
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
      <p className="train-motto">Learn · Practise · Keep going</p>
    </Shell>
  )
}
