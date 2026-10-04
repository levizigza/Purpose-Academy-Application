import { FormEvent, useEffect, useState, type ReactNode } from 'react'
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
  BASELINE_QUIZ,
  SAFETY_QUIZ,
  FINAL_QUIZ,
  TOOL_CATEGORIES,
  SYSTEM_TOPICS,
  COMPUTER_SKILLS,
  INTEREST_PATHS,
  WORD_ACTIONS,
  EYE_SPY_SCENES,
  type SupportLang,
  type QuizItem,
} from './journeyCurriculum'
import {
  primeSpeech,
  speakBilingual,
  speakEnglish,
  speakSupport,
  stopSpeech,
} from './speech'
import { toolImage } from './toolImages'
import { EyeSpyQuiz } from './EyeSpyQuiz'
import {
  hasPracticeFeedbackAck,
  isPracticeMode,
  markPracticeFeedbackAck,
  openPracticeChat,
  PRACTICE_ENTRY_STEP,
  practiceFeedbackKey,
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

function CheckItem({ id, title, why, checked, onChange }: {
  id: string; title: string; why: string; checked: boolean; onChange: () => void
}) {
  return (
    <li>
      <label className="train-check-rich" htmlFor={id}>
        <input id={id} type="checkbox" checked={checked} onChange={onChange} />
        <span><strong>{title}</strong><em>{why}</em></span>
      </label>
    </li>
  )
}

/* ─── Step shell — SiteWise-inspired training chrome ─── */

function StepShell({ step, children, onBack, onNext, nextLabel = 'Continue', nextDisabled, transitioning, transitionMsg }: {
  step: number; children: ReactNode; onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean
  transitioning?: boolean; transitionMsg?: string
}) {
  const meta = JOURNEY_STEPS[step - 1]
  const pct = Math.round((step / 20) * 100)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)

  function handleNext() {
    if (!onNext) return
    if (!isPracticeMode()) {
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
    /* Scroll the step so reviewers can skim, then ask about feedback at the bottom. */
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
          <p className="train-kicker">Step {step} of 20{isPracticeMode() ? ' · Practice' : ''}</p>
          <div className="train-sound-slot">
            <FoleyToggle compact />
          </div>
        </div>
        <h1 className="train-title">{meta.title}</h1>
        <p className="train-simple-line">{meta.help}</p>
        <details className="train-why-details">
          <summary>Why this step?</summary>
          <p className="train-purpose">{meta.purpose}</p>
        </details>
        <div className="train-progress" aria-label={`Progress ${pct}%`}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <ol className="train-dots" aria-label="Step progress">
          {JOURNEY_STEPS.map((s) => (
            <li key={s.n} className={s.n === step ? 'is-current' : s.n < step ? 'is-done' : ''} title={s.title} />
          ))}
        </ol>
      </header>

      <Reveal className="train-panel" delay={40}>
        {children}
      </Reveal>

      <div className="train-actions">
        {onBack && (
          <button type="button" className="btn btn-ghost train-back" onClick={onBack}>
            Back
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
          <button type="button" className="btn btn-primary" onClick={onComplete}>Continue</button>
        )}
        {gated && score < items.length && (
          <button type="button" className="btn btn-primary" onClick={() => { setIdx(0); setScore(0); setDone(false); setAnswered(null); setCorrect(false); }}>
            Retry quiz
          </button>
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
  const [interest, setInterest] = useState<'construction' | 'logistics' | 'community' | null>(null)
  const [skillChecks, setSkillChecks] = useState<Record<string, boolean>>({})
  const [actionIdx, setActionIdx] = useState(0)
  const [actionDone, setActionDone] = useState<Record<string, boolean>>({})
  const [finalPhase, setFinalPhase] = useState<'eyespy' | 'written' | 'certificate'>('eyespy')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [transitionMsg, setTransitionMsg] = useState('Moving to the next station…')
  const [empDone, setEmpDone] = useState(() => {
    try { return !!sessionStorage.getItem(EMP_KEY) } catch { return false }
  })
  const [phraseHeard, setPhraseHeard] = useState<Record<string, boolean>>({})
  const [phraseSaid, setPhraseSaid] = useState<Record<string, boolean>>({})

  /* Step 2 registration form */
  const [regForm, setRegForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '',
    preferred_language: 'Amharic', previous_experience: '',
  })

  /* Step 7 vocab cycle — See / Listen / Understand / Repeat */
  const [vocabIdx, setVocabIdx] = useState(0)
  const [vocabBeat, setVocabBeat] = useState(0) // 0 See, 1 Listen, 2 Understand, 3 Repeat
  const [heardEnglish, setHeardEnglish] = useState(false)
  const [heardSupport, setHeardSupport] = useState(false)
  const [saidAloud, setSaidAloud] = useState(false)
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

  /* Step 13 computer skills */
  const [compChecks, setCompChecks] = useState<Record<string, boolean>>({})

  /* Step 15 tool categories */
  const [toolSeen, setToolSeen] = useState<Record<string, boolean>>({})

  /* Step 16 system topics */
  const [sysSeen, setSysSeen] = useState<Record<string, boolean>>({})

  /* Step 17 observation form */
  const [obsForm, setObsForm] = useState({ skill: '', station: '', notes: '' })

  /* Step 18 daily log */
  const [logForm, setLogForm] = useState({ date: '', tasks: '', supervisor: '' })

  /* Step 19 honesty */
  const [honestyChecked, setHonestyChecked] = useState(false)

  /* Step 20 employment */
  const [empForm, setEmpForm] = useState({ resume_goal: '', availability: '' })

  useEffect(() => { saveStep(step) }, [step])
  useEffect(() => { if (student?.preferred_language) setSupportLang(student.preferred_language as SupportLang) }, [student?.preferred_language])
  useEffect(() => { primeSpeech() }, [])
  useEffect(() => () => { stopSpeech() }, [])

  /* Practice mode skips registration entirely */
  useEffect(() => {
    if (!isPracticeMode()) return
    if (step < PRACTICE_ENTRY_STEP) {
      setStep(PRACTICE_ENTRY_STEP)
      saveStep(PRACTICE_ENTRY_STEP)
    }
  }, [step])

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

  function Shell(props: {
    step: number; children: ReactNode; onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean
  }) {
    return <StepShell {...props} transitioning={transitioning} transitionMsg={transitionMsg} />
  }

  function resetVocabBeatFlags() {
    setVocabBeat(0)
    setHeardEnglish(false)
    setHeardSupport(false)
    setSaidAloud(false)
    setSpeaking(null)
    stopSpeech()
  }

  function resetVocab() {
    setVocabIdx(0)
    resetVocabBeatFlags()
  }

  async function playEnglish(text: string) {
    setSpeaking('en')
    stopSpeech()
    await speakEnglish(text)
    setSpeaking(null)
    setHeardEnglish(true)
  }

  async function playSupport(text: string) {
    setSpeaking('support')
    stopSpeech()
    await speakSupport(text, supportLang)
    setSpeaking(null)
    setHeardSupport(true)
  }

  async function playBoth(english: string, supportText: string) {
    setSpeaking('both')
    stopSpeech()
    await speakBilingual(english, supportText, supportLang)
    setSpeaking(null)
    setHeardEnglish(true)
    setHeardSupport(true)
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


  const INSTRUCTIONS: {
    text: string
    correct: string
    options: string[]
    imageKey: string
    supportHint: Record<SupportLang, string>
  }[] = [
    {
      text: 'Bring the tape measure.',
      correct: 'Bring the tape measure',
      imageKey: 'tape-measure',
      options: ['Bring the tape measure', 'Bring the hammer', 'Put on a hard hat', 'Start cutting wood'],
      supportHint: {
        Spanish: 'Trae la cinta metrica.',
        Arabic: 'Ahdir sharit al-qiyas.',
        Hindi: 'Tape measure lao.',
        Amharic: 'Melekiya tape amtu.',
        Tigrinya: 'Melekiya tape amtsu.',
      },
    },
    {
      text: 'Pass me the level.',
      correct: 'Pass me the level',
      imageKey: 'level',
      options: ['Pass me the level', 'Pass the hammer', 'Open the door', 'Put on boots'],
      supportHint: {
        Spanish: 'Pasame el nivel.',
        Arabic: 'Nawilni al-mizan.',
        Hindi: 'Level mujhe do.',
        Amharic: 'Dereja melekiyawun situn.',
        Tigrinya: 'Dereja melekiya habuni.',
      },
    },
    {
      text: 'Check the wall with the level.',
      correct: 'Check the wall with the level',
      imageKey: 'level',
      options: ['Check the wall with the level', 'Check the floor with a hammer', 'Bring the drill', 'Remove your PPE'],
      supportHint: {
        Spanish: 'Revisa la pared con el nivel.',
        Arabic: 'Ifhas al-jidar bil-mizan.',
        Hindi: 'Level se deewar check karo.',
        Amharic: 'Dereja melekiya bewetakom gidgidawun yaregagtu.',
        Tigrinya: 'Bdereja melekiya n mendek aregagtsu.',
      },
    },
  ]

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

  /* Step 3: Mother tongue for assessment (bridge later removed in English-only steps) */
  if (step === 3) {
    return (
      <Shell
        step={3}
        onBack={() => (isPracticeMode() ? navigate('/') : go(2))}
        onNext={() => {
          setRegForm((f) => ({ ...f, preferred_language: supportLang }))
          go(4)
        }}
        nextLabel="Use this language for my assessment"
      >
        <WhyWork>Early checks use a language you understand. Later site talk is English only.</WhyWork>
        <div className="train-lang-grid">
          {SUPPORT_LANGUAGES.map((l) => (
            <button key={l.id} type="button" className={`train-lang${supportLang === l.id ? ' is-selected' : ''}`} onClick={() => setSupportLang(l.id)}>
              <span aria-hidden>{l.flag}</span>
              <strong>{l.id}</strong>
            </button>
          ))}
        </div>
        <div className="train-bridge">
          <p><strong>How language works</strong></p>
          <ol>
            <li>Assessment & early vocab: English + {supportLang}</li>
            <li>Practice: still with help</li>
            <li>Eye Spy: English only</li>
            <li>Site instructions: English required; mother tongue optional once</li>
          </ol>
        </div>
        <TeachNote>Choose the mother tongue that helps you most for assessment and early learning.</TeachNote>
      </Shell>
    )
  }

  if (step === 4) {
    return (
      <Shell step={4} onBack={() => go(3)}>
        <WhyWork>Baseline shows what you already know — so we start in the right place.</WhyWork>
        <TeachNote>Baseline is not pass/fail. Support language: {supportLang}.</TeachNote>
        <QuizRunner items={BASELINE_QUIZ} onComplete={() => go(5)} />
      </Shell>
    )
  }

  /* Step 5: Interest + skills picture assessment */
  if (step === 5) {
    const path = INTEREST_PATHS.find((p) => p.id === interest)
    return (
      <Shell
        step={5}
        onBack={() => go(4)}
        onNext={interest ? () => go(6, 'Opening your result…') : undefined}
        nextLabel="See my path result"
      >
        <WhyWork>What you want and what you can already do help place you on a path.</WhyWork>
        <p><strong>What are you interested in?</strong></p>
        <div className="train-interest-grid">
          {INTEREST_PATHS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`train-interest${interest === item.id ? ' is-selected' : ''}`}
              onClick={() => { setInterest(item.id); setSkillChecks({}) }}
            >
              <img
                src={item.id === 'construction' ? BRAND_ASSETS.iconConstruction : item.id === 'logistics' ? BRAND_ASSETS.iconLogistics : BRAND_ASSETS.iconCommunity}
                alt=""
              />
              <strong>{item.title}</strong>
              <span>{item.line}</span>
              <em className="train-interest-detail">{item.detail}</em>
            </button>
          ))}
        </div>
        {path && (
          <>
            <p><strong>What can you do? (optional — answer honestly)</strong></p>
            <ul className="train-check-list">
              {path.skills.map((s) => (
                <CheckItem
                  key={s.id}
                  id={`sk-${s.id}`}
                  title={s.label}
                  why="Check only if this is true for you."
                  checked={!!skillChecks[s.id]}
                  onChange={() => setSkillChecks((c) => ({ ...c, [s.id]: !c[s.id] }))}
                />
              ))}
            </ul>
          </>
        )}
        <TeachNote>Choose an interest to continue. Empty skill boxes are honest — we can teach those.</TeachNote>
      </Shell>
    )
  }

  /* Step 6: Result + Construction pathway */
  if (step === 6) {
    const title = interest === 'logistics' ? 'Logistics' : interest === 'community' ? 'Community Support' : 'Construction'
    return (
      <Shell step={6} onBack={() => go(5)}>
        {error && <div className="alert error">{error}</div>}
        <div className="alert ok">
          You chose <strong>{title}</strong>. Today&rsquo;s open program is <strong>Construction</strong>.
        </div>
        <PictureCard emoji="C" label="Construction" sub="Build Skills, Build Futures." caption="Open pathway you can prove with an instructor." />
        <WhyWork>Construction needs safety words, tools, and short English directions.</WhyWork>
        <div className="train-learn-grid">
          <LearnCard mark="1" title="Language for work" body="Words you hear on a job site." />
          <LearnCard mark="2" title="Safety first" body="Protect yourself and others." />
          <LearnCard mark="3" title="Tools & practice" body="Learn, practise, then prove with an instructor." />
        </div>
        {interest && interest !== 'construction' && (
          <div className="alert warn">
            You showed interest in {title}. Today&rsquo;s live path is Construction — same steps, different job focus later.
          </div>
        )}
        <button type="button" className="btn btn-primary" disabled={busy} onClick={async () => { setBusy(true); await finishPathway(); setBusy(false) }}>
          {busy ? 'Saving…' : 'Continue into Construction vocabulary'}
        </button>
      </Shell>
    )
  }

  /* Step 7: Chart-style Visual Vocabulary — See / Listen / Understand / Repeat */
  if (step === 7) {
    const term = VOCAB_UNIT[vocabIdx]
    const gloss = term.gloss[supportLang]
    const beats = [
      { label: 'See', tip: `Look at the clear picture. ${term.definition}` },
      { label: 'Listen', tip: `Hear English, then ${supportLang}. Both required.` },
      { label: 'Understand', tip: `English: ${term.english}. ${supportLang}: ${gloss}.` },
      { label: 'Repeat', tip: `Say “${term.english}” out loud, then confirm.` },
    ]
    const listenDone = heardEnglish && heardSupport
    const ready = vocabBeat >= 3 && saidAloud && listenDone
    const isLast = vocabIdx >= VOCAB_UNIT.length - 1

    function advanceVocab() {
      if (isLast) { go(8); setActionIdx(0); return }
      setVocabIdx((i) => i + 1)
      resetVocabBeatFlags()
    }

    return (
      <Shell
        step={7}
        onBack={() => go(6)}
        onNext={ready ? advanceVocab : undefined}
        nextLabel={isLast ? 'Continue to Word → Action' : `Next word (${vocabIdx + 2}/${VOCAB_UNIT.length})`}
        nextDisabled={!ready}
      >
        <p className="train-vocab-counter">Construction Level 1 · Word {vocabIdx + 1} of {VOCAB_UNIT.length}</p>
        <article className="vocab-chart-card">
          <header className="vocab-chart-head">
            <span className="vocab-chart-num">{vocabIdx + 1}</span>
            <strong className="vocab-chart-en">{term.english}</strong>
            <ul className="vocab-chart-gloss" aria-label="Translations">
              {SUPPORT_LANGUAGES.map((l) => (
                <li key={l.id} className={l.id === supportLang ? 'is-active' : ''}>
                  <span className="vocab-flag">{l.flag}</span>
                  <span>{term.gloss[l.id]}</span>
                </li>
              ))}
            </ul>
          </header>
          <div className="vocab-chart-media">
            <PictureCard
              image={toolImage(term.imageKey)}
              fit="contain"
              emoji={term.emoji}
              label={vocabBeat === 0 ? 'What is this?' : term.english}
              sub={vocabBeat >= 2 ? `${supportLang}: ${gloss}` : term.definition}
              caption={term.sentence}
            />
          </div>
        </article>

        <div className="train-layers" role="list" aria-label="Learning actions">
          {beats.map((b, i) => (
            <span key={b.label} role="listitem" className={`${i === vocabBeat ? 'is-current' : ''} ${i < vocabBeat ? 'is-active' : ''}`}>
              {b.label}
            </span>
          ))}
        </div>
        <p className="train-beat-tip">{beats[Math.min(vocabBeat, 3)].tip}</p>

        {vocabBeat === 0 && (
          <div className="train-action-block">
            <button type="button" className="btn btn-primary" onClick={() => setVocabBeat(1)}>I see it — go to Listen</button>
          </div>
        )}
        {vocabBeat === 1 && (
          <div className="train-action-block">
            <div className="train-audio-row">
              <button type="button" className={`btn ${heardEnglish ? 'btn-secondary on-light' : 'btn-primary'}`} disabled={speaking !== null} onClick={() => void playEnglish(term.english)}>
                {speaking === 'en' ? 'Playing…' : heardEnglish ? 'Heard English ✓' : 'Hear English'}
              </button>
              <button type="button" className={`btn ${heardSupport ? 'btn-secondary on-light' : 'btn-primary'}`} disabled={speaking !== null} onClick={() => void playSupport(gloss)}>
                {speaking === 'support' ? 'Playing…' : heardSupport ? `Heard ${supportLang} ✓` : `Hear ${supportLang}`}
              </button>
              <button type="button" className="btn btn-ghost" disabled={speaking !== null} onClick={() => void playBoth(term.english, gloss)}>Hear both</button>
            </div>
            <button type="button" className="btn btn-primary" disabled={!listenDone} onClick={() => setVocabBeat(2)}>Continue to Understand</button>
          </div>
        )}
        {vocabBeat === 2 && (
          <div className="train-action-block">
            <p className="muted">Picture → {supportLang} meaning → English word on the site.</p>
            <button type="button" className="btn btn-primary" onClick={() => setVocabBeat(3)}>I understand — go to Repeat</button>
          </div>
        )}
        {vocabBeat === 3 && (
          <div className="train-action-block">
            <div className="train-audio-row">
              <button type="button" className="btn btn-secondary on-light" disabled={speaking !== null} onClick={() => void playEnglish(term.english)}>Play English model</button>
            </div>
            <label className="train-honesty-check">
              <input type="checkbox" checked={saidAloud} onChange={() => setSaidAloud(!saidAloud)} />
              <span>I said “{term.english}” out loud.</span>
            </label>
          </div>
        )}
      </Shell>
    )
  }

  /* Step 8: Word → Action */
  if (step === 8) {
    const item = WORD_ACTIONS[actionIdx]
    const term = VOCAB_UNIT.find((t) => t.id === item.termId)
    const isLast = actionIdx >= WORD_ACTIONS.length - 1
    const seen = !!actionDone[item.id]
    return (
      <Shell
        step={8}
        onBack={() => { resetVocab(); go(7) }}
        onNext={seen ? () => {
          if (isLast) { resetMatch(); go(9); return }
          setActionIdx((i) => i + 1)
        } : undefined}
        nextLabel={isLast ? 'Continue to supported practice' : 'Next action'}
      >
        <WhyWork>Seeing the action helps your brain link the English word to real movement.</WhyWork>
        <article className="word-action-card">
          <PictureCard
            image={toolImage(term?.imageKey)}
            fit="contain"
            label={item.title}
            caption={item.body}
          />
          <p className="word-action-cue"><strong>Action cue:</strong> {item.actionCue}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setActionDone((d) => ({ ...d, [item.id]: true }))}
          >
            {seen ? 'Watched ✓' : 'I studied this action'}
          </button>
        </article>
        <TeachNote>Connect the English word to a real job-site action.</TeachNote>
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
      playFoley(ok ? 'correct' : 'wrong')
    }

    function nextMatch() {
      if (!matchCorrect) {
        setMatchAnswer(null)
        setMatchCorrect(false)
        return
      }
      if (isLast) { go(10, 'Opening English Eye Spy…'); return }
      const next = matchIdx + 1
      setMatchIdx(next)
      setMatchAnswer(null)
      setMatchCorrect(false)
      shuffleMatchOptions(next)
    }

    return (
      <Shell step={9} onBack={() => go(8)}>
        <WhyWork>Matching picture to word is practice for your eyes and memory.</WhyWork>
        <p className="train-vocab-counter">Match {matchIdx + 1} of {VOCAB_UNIT.length}</p>
        <PictureCard
          image={toolImage(term.imageKey)}
          fit="contain"
          label="Match the word to the picture"
          sub={`${supportLang}: ${term.gloss[supportLang]}`}
          caption="Still supported — translation and audio are allowed here."
        />
        <div className="train-audio-row">
          <button type="button" className="btn btn-secondary on-light" disabled={speaking !== null} onClick={() => void playEnglish(term.english)}>Hear English</button>
          <button type="button" className="btn btn-secondary on-light" disabled={speaking !== null} onClick={() => void playSupport(term.gloss[supportLang])}>Hear {supportLang}</button>
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
    const instr = INSTRUCTIONS[instrIdx]
    const isLast = instrIdx >= INSTRUCTIONS.length - 1

    function pickInstr(opt: string) {
      if (instrAnswer || !instrHeard) return
      const ok = opt === instr.correct
      setInstrAnswer(opt)
      setInstrCorrect(ok)
      playFoley(ok ? 'correct' : 'wrong')
    }

    function nextInstr() {
      if (!instrCorrect) {
        setInstrAnswer(null)
        setInstrCorrect(false)
        return
      }
      if (isLast) { go(12, 'Opening site language…'); return }
      setInstrIdx((i) => i + 1)
      setInstrHeard(false)
      setInstrAnswer(null)
      setInstrCorrect(false)
    }

    return (
      <Shell step={11} onBack={() => go(10)}>
        <WhyWork>Supervisors give short directions. Hearing and acting keeps the team safe.</WhyWork>
        <p className="train-vocab-counter">Instruction {instrIdx + 1} of {INSTRUCTIONS.length} · English only</p>
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
            <button
              type="button"
              className="btn btn-ghost"
              disabled={speaking !== null}
              onClick={() => void playSupport(instr.supportHint[supportLang])}
            >
              Optional {supportLang} hint
            </button>
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

  /* Step 12: Site language — practical phrases */
  if (step === 12) {
    const phrases = [
      { en: 'Measure twice, cut once.', why: 'Stops waste and mistakes.' },
      { en: 'Hard hats on in the bay.', why: 'Safety rule you will hear every day.' },
      { en: 'Pass me the level.', why: 'Short tool request between workers.' },
      { en: 'Hold the board steady.', why: 'Teamwork on a cut or install.' },
    ]
    const allReady = phrases.every((p) => phraseHeard[p.en] && phraseSaid[p.en])
    return (
      <Shell
        step={12}
        onBack={() => { resetInstr(); go(11) }}
        onNext={allReady ? () => go(13, 'Opening digital skills…') : undefined}
        nextLabel="Continue to digital skills"
      >
        <WhyWork>These phrases show up on Alberta job sites. Know these words well.</WhyWork>
        <div className="phrase-practice">
          {phrases.map((p) => (
            <div key={p.en} className="phrase-practice-item">
              <strong>{p.en}</strong>
              <p className="muted">{p.why}</p>
              <div className="train-audio-row">
                <button
                  type="button"
                  className={`btn ${phraseHeard[p.en] ? 'btn-secondary on-light' : 'btn-primary'}`}
                  disabled={speaking !== null}
                  onClick={() => {
                    void (async () => {
                      await playEnglish(p.en)
                      setPhraseHeard((h) => ({ ...h, [p.en]: true }))
                    })()
                  }}
                >
                  {phraseHeard[p.en] ? 'Heard ✓' : 'Hear English'}
                </button>
              </div>
              <label className="train-honesty-check">
                <input
                  type="checkbox"
                  checked={!!phraseSaid[p.en]}
                  onChange={() => setPhraseSaid((s) => ({ ...s, [p.en]: !s[p.en] }))}
                />
                <span>I said this phrase out loud.</span>
              </label>
            </div>
          ))}
        </div>
        <TeachNote>Hear each phrase. Say it out loud. Then continue.</TeachNote>
      </Shell>
    )
  }

  if (step === 13) {
    return (
      <Shell step={13} onBack={() => go(12)} onNext={() => go(14, 'Opening safety…')} nextLabel="Continue to safety">
        <WhyWork>This may be someone’s first computer. Every skill here is practical for Canadian training.</WhyWork>
        <TeachNote>Check only what you can do today. Empty boxes are honest — we can teach those skills.</TeachNote>
        <ul className="train-check-list">
          {COMPUTER_SKILLS.map((s) => (
            <CheckItem key={s.id} id={`pc-${s.id}`} title={s.title} why={s.why} checked={!!compChecks[s.id]} onChange={() => setCompChecks((c) => ({ ...c, [s.id]: !c[s.id] }))} />
          ))}
        </ul>
      </Shell>
    )
  }

  if (step === 14) {
    return (
      <Shell step={14} onBack={() => go(13)}>
        <PictureCard emoji="!" label="Safety is a gate" caption="Alberta / Canada site safety in simple English with clear imagery." />
        <WhyWork>Safe workers protect themselves, their team, and their future on site.</WhyWork>
        <QuizRunner items={SAFETY_QUIZ} onComplete={() => go(15)} gated />
      </Shell>
    )
  }

  if (step === 15) {
    const allSeen = TOOL_CATEGORIES.every((c) => toolSeen[c.title])
    return (
      <Shell step={15} onBack={() => go(14)} onNext={allSeen ? () => go(16) : undefined} nextLabel="Continue to systems">
        <PictureCard emoji="T" label="Tools & Equipment" caption="Tap each category. Know the name before you use it." />
        <div className="train-card-grid">
          {TOOL_CATEGORIES.map((cat) => (
            <button key={cat.title} type="button" className={`train-topic-card${toolSeen[cat.title] ? ' is-seen' : ''}`} onClick={() => setToolSeen((s) => ({ ...s, [cat.title]: true }))}>
              <span className="train-topic-mark">{cat.mark}</span>
              <strong>{cat.title}</strong>
              <p>{cat.why}</p>
            </button>
          ))}
        </div>
      </Shell>
    )
  }

  if (step === 16) {
    const allSeen = SYSTEM_TOPICS.every((t) => sysSeen[t.title])
    return (
      <Shell step={16} onBack={() => go(15)} onNext={allSeen ? () => go(17) : undefined} nextLabel="Continue to observation">
        <PictureCard emoji="S" label="Construction Systems" caption="Your role fits the whole build — not one task alone." />
        <div className="train-card-grid">
          {SYSTEM_TOPICS.map((topic) => (
            <button key={topic.title} type="button" className={`train-topic-card${sysSeen[topic.title] ? ' is-seen' : ''}`} onClick={() => setSysSeen((s) => ({ ...s, [topic.title]: true }))}>
              <span className="train-topic-mark">{topic.mark}</span>
              <strong>{topic.title}</strong>
              <p>{topic.why}</p>
            </button>
          ))}
        </div>
      </Shell>
    )
  }

  if (step === 17) {
    function saveObs(e: FormEvent) {
      e.preventDefault()
      try { sessionStorage.setItem(OBS_KEY, JSON.stringify(obsForm)) } catch { /* */ }
      go(18)
    }
    return (
      <Shell step={17} onBack={() => go(16)}>
        <PictureCard emoji="I" label="Instructor observation" caption="Learned → Practised → Competent under real observation." />
        <div className="train-learn-grid">
          <LearnCard mark="L" title="Learned" body="Studied in the app or class." />
          <LearnCard mark="P" title="Practised" body="Tried with supervision." />
          <LearnCard mark="C" title="Competent" body="Authorized instructor confirmed the standard." />
        </div>
        <form className="stack" onSubmit={saveObs}>
          <h3>Ask an instructor to watch a skill</h3>
          <div className="field">
            <label htmlFor="obs-skill">Skill to observe</label>
            <select id="obs-skill" value={obsForm.skill} onChange={(e) => setObsForm({ ...obsForm, skill: e.target.value })} required>
              <option value="">Choose a skill…</option>
              {VOCAB_UNIT.map((t) => (
                <option key={t.id} value={t.english}>{t.english}</option>
              ))}
              <option value="Safety gear check">Safety gear check</option>
              <option value="Follow a short instruction">Follow a short instruction</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="obs-station">Where?</label>
            <select id="obs-station" value={obsForm.station} onChange={(e) => setObsForm({ ...obsForm, station: e.target.value })} required>
              <option value="">Choose a place…</option>
              <option value="Workshop bay 1">Workshop bay 1</option>
              <option value="Workshop bay 2">Workshop bay 2</option>
              <option value="Classroom">Classroom</option>
              <option value="Job site">Job site</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="obs-notes">Notes for instructor (optional)</label>
            <textarea id="obs-notes" value={obsForm.notes} onChange={(e) => setObsForm({ ...obsForm, notes: e.target.value })} rows={3} placeholder="Ask instructor to help write if needed." />
          </div>
          <button className="btn btn-primary" type="submit">Save request and continue</button>
        </form>
      </Shell>
    )
  }

  if (step === 18) {
    function saveLog(e: FormEvent) {
      e.preventDefault()
      try { sessionStorage.setItem(LOG_KEY, JSON.stringify(logForm)) } catch { /* */ }
      setFinalPhase('eyespy')
      go(19)
    }
    return (
      <Shell step={18} onBack={() => go(17)}>
        <PictureCard emoji="O" label="On-site training" caption="Real workplace feedback from supervised site work." />
        <form className="stack" onSubmit={saveLog}>
          <h3>Daily log + supervisor feedback</h3>
          <div className="field">
            <label htmlFor="log-date">Date</label>
            <input id="log-date" type="date" value={logForm.date} onChange={(e) => setLogForm({ ...logForm, date: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="log-tasks">Tasks completed today</label>
            <textarea id="log-tasks" value={logForm.tasks} onChange={(e) => setLogForm({ ...logForm, tasks: e.target.value })} required rows={3} />
          </div>
          <div className="field">
            <label htmlFor="log-sup">Supervisor / workplace feedback</label>
            <textarea id="log-sup" value={logForm.supervisor} onChange={(e) => setLogForm({ ...logForm, supervisor: e.target.value })} rows={2} placeholder="What did the site say to improve?" />
          </div>
          <button className="btn btn-primary" type="submit">Save log and continue to final exam</button>
        </form>
      </Shell>
    )
  }

  /* Step 19: Final Eye Spy exam (up to 3 attempts) + written + certificate */
  if (step === 19) {
    if (finalPhase === 'eyespy') {
      return (
        <Shell step={19} onBack={() => go(18)}>
          <PictureCard emoji="E" label="Final vocabulary Eye Spy" caption="Exam mode — up to 3 tries. 100% required. Scenes change on misses." />
          <EyeSpyQuiz scenes={EYE_SPY_SCENES} mode="exam" onComplete={() => setFinalPhase('written')} />
        </Shell>
      )
    }
    if (finalPhase === 'written') {
      return (
        <Shell step={19} onBack={() => setFinalPhase('eyespy')}>
          <PictureCard emoji="W" label="Written & knowledge check" caption="Safety, measurement, language, and tools. Perfect score required." />
          <QuizRunner items={FINAL_QUIZ} onComplete={() => setFinalPhase('certificate')} gated />
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
    try { sessionStorage.setItem(EMP_KEY, JSON.stringify(empForm)) } catch { /* */ }
    markSequenceComplete('student', { detail: user?.full_name || 'Student' })
    playFoley('metal')
    setEmpDone(true)
  }

  return (
    <Shell step={20} onBack={() => go(19)}>
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
                const restart = isPracticeMode() ? PRACTICE_ENTRY_STEP : 1
                saveStep(restart)
                setEmpDone(false)
                go(restart)
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
