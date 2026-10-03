import { FormEvent, useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { Reveal } from '../components/Motion'
import { DEMO_PASSWORDS } from '../data/seed'
import { markSequenceComplete } from '../gateway/sequenceProgress'
import { selectPathway } from '../data/store'
import {
  JOURNEY_STEPS,
  SUPPORT_LANGUAGES,
  VOCAB_UNIT,
  BASELINE_QUIZ,
  SAFETY_QUIZ,
  ENGLISH_QUIZ,
  FINAL_QUIZ,
  TOOL_CATEGORIES,
  SYSTEM_TOPICS,
  COMPUTER_SKILLS,
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

const JOURNEY_KEY = 'pa-student-journey-step-v1'
const OBS_KEY = 'pa-student-observation-v1'
const LOG_KEY = 'pa-student-daily-log-v1'
const EMP_KEY = 'pa-student-employment-v1'

function saveStep(step: number) {
  try { sessionStorage.setItem(JOURNEY_KEY, String(step)) } catch { /* */ }
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
  children: ReactNode; onClick: () => void; state?: 'correct' | 'wrong' | 'idle'; disabled?: boolean
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

function StepShell({ step, children, onBack, onNext, nextLabel = 'Continue', nextDisabled }: {
  step: number; children: ReactNode; onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean
}) {
  const meta = JOURNEY_STEPS[step - 1]
  const pct = Math.round((step / 20) * 100)

  return (
    <div className="shell-main train-shell">
      <header className="train-header">
        <p className="train-kicker">Step {step} of 20 · Student Training Path</p>
        <h1 className="train-title">{meta.title}</h1>
        <p className="train-help">{meta.help}</p>
        <p className="train-purpose">{meta.purpose}</p>
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
        {onBack && <button type="button" className="btn btn-ghost" onClick={onBack}>Back</button>}
        {onNext && <button type="button" className="btn btn-primary" onClick={onNext} disabled={nextDisabled}>{nextLabel}</button>}
      </div>
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

  function pick(opt: string) {
    if (answered) return
    const isCorrect = opt === item.answer
    setAnswered(opt)
    setCorrect(isCorrect)
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
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Step 2 registration form */
  const [regForm, setRegForm] = useState({
    full_name: '', email: '', phone: '', password: 'student123',
    preferred_language: 'Amharic', previous_experience: '',
  })

  /* Step 7 vocab cycle — See / Listen / Understand / Repeat */
  const [vocabIdx, setVocabIdx] = useState(0)
  const [vocabBeat, setVocabBeat] = useState(0) // 0 See, 1 Listen, 2 Understand, 3 Repeat
  const [heardEnglish, setHeardEnglish] = useState(false)
  const [heardSupport, setHeardSupport] = useState(false)
  const [saidAloud, setSaidAloud] = useState(false)
  const [speaking, setSpeaking] = useState<'en' | 'support' | 'both' | null>(null)

  /* Step 8 supported matching */
  const [matchIdx, setMatchIdx] = useState(0)
  const [matchAnswer, setMatchAnswer] = useState<string | null>(null)
  const [matchCorrect, setMatchCorrect] = useState(false)

  /* Step 10 sentence building */
  const [sentIdx, setSentIdx] = useState(0)
  const [sentWord, setSentWord] = useState('')

  /* Step 11 workplace instructions */
  const [instrIdx, setInstrIdx] = useState(0)
  const [instrHeard, setInstrHeard] = useState(false)
  const [instrAnswer, setInstrAnswer] = useState<string | null>(null)
  const [instrCorrect, setInstrCorrect] = useState(false)

  /* Step 12 computer skills */
  const [compChecks, setCompChecks] = useState<Record<string, boolean>>({})

  /* Step 14 tool categories */
  const [toolSeen, setToolSeen] = useState<Record<string, boolean>>({})

  /* Step 15 system topics */
  const [sysSeen, setSysSeen] = useState<Record<string, boolean>>({})

  /* Step 16 observation form */
  const [obsForm, setObsForm] = useState({ skill: '', station: '', notes: '' })

  /* Step 17 daily log */
  const [logForm, setLogForm] = useState({ date: '', tasks: '', supervisor: '' })

  /* Step 19 honesty */
  const [honestyChecked, setHonestyChecked] = useState(false)

  /* Step 20 employment */
  const [empForm, setEmpForm] = useState({ resume_goal: '', availability: '' })

  useEffect(() => { saveStep(step) }, [step])
  useEffect(() => { if (student?.preferred_language) setSupportLang(student.preferred_language as SupportLang) }, [student?.preferred_language])
  useEffect(() => { primeSpeech() }, [])
  useEffect(() => () => { stopSpeech() }, [])

  function go(next: number) {
    stopSpeech()
    setError(null)
    setSpeaking(null)
    setStep(Math.min(20, Math.max(1, next)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
  function resetMatch() { setMatchIdx(0); setMatchAnswer(null); setMatchCorrect(false) }
  function resetSent() { setSentIdx(0); setSentWord('') }
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
    const ok = await ensureDemoStudent()
    if (!ok) return
    try {
      const sid = student?.id
      if (sid && student?.foundation_complete) {
        await selectPathway(sid, 'construction')
        await refresh()
      }
      go(6)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save pathway')
      go(6)
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
        French: 'Apporte le metre ruban.',
        Arabic: 'Ahdir sharit al-qiyas.',
        Hindi: 'Tape measure lao.',
        Amharic: 'Melekiya tape amtu.',
        Tigrinya: 'Melekiya tape amtsu.',
      },
    },
    {
      text: 'Pass me the level.',
      correct: 'Pass the level',
      imageKey: 'level',
      options: ['Pass the level', 'Pass the hammer', 'Open the door', 'Put on boots'],
      supportHint: {
        Spanish: 'Pasame el nivel.',
        French: 'Passe-moi le niveau.',
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
        French: 'Verifie le mur avec le niveau.',
        Arabic: 'Ifhas al-jidar bil-mizan.',
        Hindi: 'Level se deewar check karo.',
        Amharic: 'Dereja melekiya bewetakom gidgidawun yaregagtu.',
        Tigrinya: 'Bdereja melekiya n mendek aregagtsu.',
      },
    },
  ]

  if (step === 1) {
    return (
      <StepShell step={1} onBack={() => navigate('/enter/student')} onNext={() => go(2)} nextLabel="I am a Student — continue">
        <div className="train-login">
          <img src={BRAND_ASSETS.logoMark} alt="" className="train-login-mark" />
          <p className="train-brand">{BRAND.name}</p>
          <p className="train-welcome">Welcome. Take a breath. We will go one step at a time.</p>
          <div className="train-role-stack">
            <button type="button" className="train-role student" onClick={() => go(2)}>Student Login</button>
            <Link className="train-role instructor" to="/enter/instructor">Instructor Login</Link>
            <Link className="train-role admin" to="/enter/admin">Admin Login</Link>
          </div>
          <TeachNote>
            Students learn and practice. Instructors teach and check skills. Admins manage the school.
            Choosing the right door keeps your path simple.
          </TeachNote>
        </div>
      </StepShell>
    )
  }

  /* ——— Step 2: Registration ——— */
  if (step === 2) {
    async function onRegister(e: FormEvent) {
      e.preventDefault()
      setBusy(true); setError(null)
      const err = await register({
        full_name: regForm.full_name, email: regForm.email, password: regForm.password,
        phone: regForm.phone, address: 'Calgary, AB', emergency_contact: 'Emergency contact',
        preferred_language: regForm.preferred_language,
      })
      setBusy(false)
      if (err) {
        if (/exists/i.test(err)) {
          const result = await login(regForm.email, regForm.password)
          if (!result.error) { await refresh(); go(3); return }
        }
        setError(err); return
      }
      go(3)
    }

    return (
      <StepShell step={2} onBack={() => go(1)}>
        <TeachNote>
          Write slowly. Short answers are fine. Previous experience helps us place you — it is not a judgment.
        </TeachNote>
        <form className="stack" onSubmit={onRegister}>
          {error && <div className="alert error">{error}</div>}
          <div className="field">
            <label htmlFor="seq-name">Full name</label>
            <input id="seq-name" value={regForm.full_name} onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })} required placeholder="First and last name" autoComplete="name" />
            <span className="field-hint">Use the name on your ID if you can.</span>
          </div>
          <div className="field">
            <label htmlFor="seq-email">Email</label>
            <input id="seq-email" type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required placeholder="you@email.com" autoComplete="email" />
            <span className="field-hint">We send important updates here.</span>
          </div>
          <div className="field">
            <label htmlFor="seq-phone">Phone</label>
            <input id="seq-phone" type="tel" value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} required placeholder="403-555-0000" autoComplete="tel" />
          </div>
          <div className="field">
            <label htmlFor="seq-lang">Preferred language</label>
            <select id="seq-lang" value={regForm.preferred_language} onChange={(e) => setRegForm({ ...regForm, preferred_language: e.target.value })}>
              {SUPPORT_LANGUAGES.map((l) => (<option key={l.id} value={l.id}>{l.flag} {l.id}</option>))}
            </select>
            <span className="field-hint">We can show meanings in this language while you learn.</span>
          </div>
          <div className="field">
            <label htmlFor="seq-exp">Previous experience</label>
            <input id="seq-exp" value={regForm.previous_experience} onChange={(e) => setRegForm({ ...regForm, previous_experience: e.target.value })} placeholder="Example: helper on building sites — or none yet" />
            <span className="field-hint">&ldquo;None yet&rdquo; is a good answer. Many students start here.</span>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save and continue'}
          </button>
          <button type="button" className="btn btn-secondary on-light" disabled={busy} onClick={async () => {
            setBusy(true); setError(null)
            try { const ok = await ensureDemoStudent(); if (ok) go(3) }
            catch (e) { setError(e instanceof Error ? e.message : 'Could not sign in.') }
            finally { setBusy(false) }
          }}>
            Continue with demo student account
          </button>
          <p className="muted">Demo account: <strong>student@purposeacademy.ca</strong> — a real demo login, not a preview skip.</p>
        </form>
      </StepShell>
    )
  }

  /* ——— Step 3: Baseline Assessment (all items) ——— */
  if (step === 3) {
    return (
      <StepShell step={3} onBack={() => go(2)}>
        <WhyWork>Baseline shows what you already know — so we start in the right place.</WhyWork>
        <TeachNote>Baseline is not pass/fail. Wrong answers help your instructor know what to teach next.</TeachNote>
        <QuizRunner items={BASELINE_QUIZ} onComplete={() => go(4)} />
      </StepShell>
    )
  }

  /* ——— Step 4: Career Interest ——— */
  if (step === 4) {
    return (
      <StepShell step={4} onBack={() => go(3)} onNext={interest ? () => go(5) : undefined} nextLabel="Continue with this interest">
        <WhyWork>Your interest helps us match training to the kind of work you want.</WhyWork>
        <p><strong>What type of work interests you most?</strong></p>
        <div className="train-interest-grid">
          {([
            { id: 'construction' as const, title: 'Construction', img: BRAND_ASSETS.iconConstruction, line: 'Build Skills, Build Futures.', detail: 'Safety, tools, and building work.' },
            { id: 'logistics' as const, title: 'Logistics', img: BRAND_ASSETS.iconLogistics, line: 'Move People, Move Opportunities.', detail: 'Warehouse and moving goods — opens after Construction.' },
            { id: 'community' as const, title: 'Community Support', img: BRAND_ASSETS.iconCommunity, line: 'Stronger People, Stronger Communities.', detail: 'Helping people in community roles — planned next.' },
          ]).map((item) => (
            <button key={item.id} type="button" className={`train-interest${interest === item.id ? ' is-selected' : ''}`} onClick={() => setInterest(item.id)}>
              <img src={item.img} alt="" />
              <strong>{item.title}</strong>
              <span>{item.line}</span>
              <em className="train-interest-detail">{item.detail}</em>
            </button>
          ))}
        </div>
        {interest && interest !== 'construction' && (
          <div className="alert warn">
            You chose {interest === 'logistics' ? 'Logistics' : 'Community Support'}. Today&rsquo;s live
            pathway is Construction — same learning steps, different job focus later.
          </div>
        )}
        <TeachNote>Tap the path that feels closest to you. Curiosity is enough to begin.</TeachNote>
      </StepShell>
    )
  }

  /* ——— Step 5: Choose Pathway ——— */
  if (step === 5) {
    return (
      <StepShell step={5} onBack={() => go(4)}>
        {error && <div className="alert error">{error}</div>}
        <PictureCard emoji="🏗️" label="Construction" sub="Build Skills, Build Futures." caption="This is the open pathway you can prove with an instructor." />
        <WhyWork>Construction needs people who know safety words, tools, and how to follow short directions.</WhyWork>
        <div className="train-learn-grid">
          <LearnCard mark="1" title="Language for work" body="Words you hear on a job site." />
          <LearnCard mark="2" title="Safety first" body="Protect yourself and others." />
          <LearnCard mark="3" title="Tools & practice" body="Learn, practise, then prove with an instructor." />
        </div>
        <TeachNote>Choosing Construction does not promise a job. It opens a clear path: understand → practise → verified skill → employment support.</TeachNote>
        <button type="button" className="btn btn-primary" disabled={busy} onClick={async () => { setBusy(true); await finishPathway(); setBusy(false) }}>
          {busy ? 'Saving…' : 'Yes — I choose Construction'}
        </button>
      </StepShell>
    )
  }

  /* ——— Step 6: Support Language ——— */
  if (step === 6) {
    return (
      <StepShell step={6} onBack={() => go(5)} onNext={() => { resetVocab(); go(7) }} nextLabel="Use this support language">
        <WhyWork>When you understand the idea in a familiar language, English words stick faster.</WhyWork>
        <div className="train-lang-grid">
          {SUPPORT_LANGUAGES.map((l) => (
            <button key={l.id} type="button" className={`train-lang${supportLang === l.id ? ' is-selected' : ''}`} onClick={() => setSupportLang(l.id)}>
              <span aria-hidden>{l.flag}</span>
              <strong>{l.id}</strong>
            </button>
          ))}
        </div>
        <div className="train-bridge">
          <p><strong>How the bridge works</strong></p>
          <ol>
            <li>Early lessons: picture + English + {supportLang}</li>
            <li>Practice: still with help</li>
            <li>Later: English only — like the worksite</li>
          </ol>
        </div>
        <TeachNote>Support language makes the path clearer. The goal stays the same: safe English at work.</TeachNote>
      </StepShell>
    )
  }

  /* ——— Step 7: Visual Vocabulary — See / Listen / Understand / Repeat ——— */
  if (step === 7) {
    const term = VOCAB_UNIT[vocabIdx]
    const gloss = term.gloss[supportLang]
    const beats = [
      {
        label: 'See',
        tip: `Look at the picture. Notice the shape and use. This tool: ${term.definition}`,
      },
      {
        label: 'Listen',
        tip: `Press Hear English, then Hear ${supportLang}. You must hear both before you continue.`,
      },
      {
        label: 'Understand',
        tip: `English: ${term.english}. ${supportLang}: ${gloss}. Connect picture → meaning → English word.`,
      },
      {
        label: 'Repeat',
        tip: `Say “${term.english}” out loud. Play English again to model your voice, then confirm.`,
      },
    ]
    const listenDone = heardEnglish && heardSupport
    const ready = vocabBeat >= 3 && saidAloud && listenDone
    const isLast = vocabIdx >= VOCAB_UNIT.length - 1

    function advanceVocab() {
      if (isLast) {
        go(8)
        resetMatch()
        return
      }
      setVocabIdx((i) => i + 1)
      resetVocabBeatFlags()
    }

    return (
      <StepShell
        step={7}
        onBack={() => go(6)}
        onNext={ready ? advanceVocab : undefined}
        nextLabel={isLast ? 'Continue to practice' : `Next word (${vocabIdx + 2}/${VOCAB_UNIT.length})`}
        nextDisabled={!ready}
      >
        <p className="train-vocab-counter">
          Word {vocabIdx + 1} of {VOCAB_UNIT.length}
        </p>
        <PictureCard
          image={toolImage(term.imageKey)}
          fit="contain"
          emoji={term.emoji}
          label={vocabBeat === 0 ? 'What is this?' : term.english}
          sub={vocabBeat >= 2 ? `${supportLang}: ${gloss}` : vocabBeat === 0 ? 'Look first — do not rush the word yet.' : 'Listen carefully'}
          caption="See → Listen → Understand → Repeat"
        />

        <div className="train-layers" role="list" aria-label="Learning actions">
          {beats.map((b, i) => (
            <span
              key={b.label}
              role="listitem"
              className={`${i === vocabBeat ? 'is-current' : ''} ${i < vocabBeat ? 'is-active' : ''}`}
            >
              {b.label}
            </span>
          ))}
        </div>
        <p className="train-beat-tip">{beats[Math.min(vocabBeat, 3)].tip}</p>

        {/* SEE */}
        {vocabBeat === 0 && (
          <div className="train-action-block">
            <p className="train-action-label">Action: See</p>
            <p className="muted">Study the picture. When you can picture this tool on a job site, continue.</p>
            <button type="button" className="btn btn-primary" onClick={() => setVocabBeat(1)}>
              I see it — go to Listen
            </button>
          </div>
        )}

        {/* LISTEN — bilingual audio required */}
        {vocabBeat === 1 && (
          <div className="train-action-block">
            <p className="train-action-label">Action: Listen</p>
            <p className="muted">
              Hear the English workplace word, then the same idea in {supportLang}.
            </p>
            <div className="train-audio-row">
              <button
                type="button"
                className={`btn ${heardEnglish ? 'btn-secondary on-light' : 'btn-primary'}`}
                disabled={speaking !== null}
                onClick={() => void playEnglish(term.english)}
              >
                {speaking === 'en' ? 'Playing English…' : heardEnglish ? 'Hear English again' : 'Hear English'}
              </button>
              <button
                type="button"
                className={`btn ${heardSupport ? 'btn-secondary on-light' : 'btn-primary'}`}
                disabled={speaking !== null}
                onClick={() => void playSupport(gloss)}
              >
                {speaking === 'support'
                  ? `Playing ${supportLang}…`
                  : heardSupport
                    ? `Hear ${supportLang} again`
                    : `Hear ${supportLang}`}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={speaking !== null}
                onClick={() => void playBoth(term.english, gloss)}
              >
                {speaking === 'both' ? 'Playing both…' : 'Play both (English → support)'}
              </button>
            </div>
            <ul className="train-listen-check" aria-label="Listen checklist">
              <li className={heardEnglish ? 'is-done' : ''}>English heard{heardEnglish ? ' ✓' : ''}</li>
              <li className={heardSupport ? 'is-done' : ''}>{supportLang} heard{heardSupport ? ' ✓' : ''}</li>
            </ul>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!listenDone || speaking !== null}
              onClick={() => setVocabBeat(2)}
            >
              I heard both — go to Understand
            </button>
          </div>
        )}

        {/* UNDERSTAND */}
        {vocabBeat === 2 && (
          <div className="train-action-block">
            <p className="train-action-label">Action: Understand</p>
            <div className="train-meaning-card">
              <p>
                <strong>English:</strong> {term.english}
              </p>
              <p>
                <strong>{supportLang}:</strong> {gloss}
              </p>
              <p>
                <strong>Meaning:</strong> {term.definition}
              </p>
              <p className="muted">Work sentence: “{term.sentence}”</p>
            </div>
            <div className="train-audio-row">
              <button
                type="button"
                className="btn btn-secondary on-light"
                disabled={speaking !== null}
                onClick={() => void playEnglish(term.english)}
              >
                Hear English
              </button>
              <button
                type="button"
                className="btn btn-secondary on-light"
                disabled={speaking !== null}
                onClick={() => void playSupport(gloss)}
              >
                Hear {supportLang}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={speaking !== null}
                onClick={() => void playEnglish(term.sentence)}
              >
                Hear the work sentence
              </button>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setVocabBeat(3)}>
              I understand — go to Repeat
            </button>
          </div>
        )}

        {/* REPEAT */}
        {vocabBeat === 3 && (
          <div className="train-action-block">
            <p className="train-action-label">Action: Repeat</p>
            <p className="muted">
              Play the model, then say <strong>{term.english}</strong> out loud. Your voice is the practice.
            </p>
            <div className="train-audio-row">
              <button
                type="button"
                className="btn btn-primary"
                disabled={speaking !== null}
                onClick={() => void playEnglish(term.english)}
              >
                {speaking === 'en' ? 'Playing model…' : 'Play English model'}
              </button>
              <button
                type="button"
                className="btn btn-secondary on-light"
                disabled={speaking !== null}
                onClick={() => void playSupport(gloss)}
              >
                Hear {supportLang} meaning
              </button>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={speaking !== null}
              onClick={() => setSaidAloud(true)}
            >
              {saidAloud ? 'Marked — I said it ✓' : 'I said it out loud'}
            </button>
          </div>
        )}

        <WhyWork>
          Someone may say “{term.sentence}” You need the sound of the English word and the meaning in your mind.
        </WhyWork>
        <TeachNote>
          Listen is not a label — press the buttons and hear both languages. Support language is a bridge; English is
          the worksite word.
        </TeachNote>
      </StepShell>
    )
  }

  /* ——— Step 8: Supported Matching (multiple terms) ——— */
  if (step === 8) {
    const term = VOCAB_UNIT[matchIdx]
    const isLast = matchIdx >= VOCAB_UNIT.length - 1
    const distractors = VOCAB_UNIT.filter((t) => t.id !== term.id).slice(0, 3)
    const options = [term, ...distractors].sort(() => Math.random() - 0.5)

    function pickMatch(opt: string) {
      if (matchAnswer) return
      const isCorrect = opt === term.english
      setMatchAnswer(opt)
      setMatchCorrect(isCorrect)
    }

    function nextMatch() {
      if (isLast) { go(9); return }
      setMatchIdx((i) => i + 1)
      setMatchAnswer(null)
      setMatchCorrect(false)
    }

    return (
      <StepShell step={8} onBack={() => { resetVocab(); go(7) }}>
        <WhyWork>Matching picture to word is homework for your eyes and memory.</WhyWork>
        <p className="train-vocab-counter">Match {matchIdx + 1} of {VOCAB_UNIT.length}</p>
        <PictureCard
          image={toolImage(term.imageKey)}
          fit="contain"
          emoji={term.emoji}
          label="Match the word to the picture"
          sub={`${supportLang} help: ${term.gloss[supportLang]}`}
          caption="Still supported — translation and audio are allowed here."
        />
        <div className="train-audio-row">
          <button
            type="button"
            className="btn btn-secondary on-light"
            disabled={speaking !== null}
            onClick={() => void playEnglish(term.english)}
          >
            Hear English
          </button>
          <button
            type="button"
            className="btn btn-secondary on-light"
            disabled={speaking !== null}
            onClick={() => void playSupport(term.gloss[supportLang])}
          >
            Hear {supportLang}
          </button>
        </div>
        <div className="train-choice-grid">
          {options.map((o) => (
            <ChoiceButton key={o.id} state={matchAnswer === o.english ? (matchCorrect ? 'correct' : 'wrong') : matchAnswer ? (o.english === term.english ? 'correct' : 'idle') : 'idle'} disabled={!!matchAnswer && o.english !== term.english && o.english !== matchAnswer} onClick={() => pickMatch(o.english)}>
              {o.english}
            </ChoiceButton>
          ))}
        </div>
        {matchAnswer && (
          <>
            <div className={`alert ${matchCorrect ? 'ok' : 'warn'}`}>
              {matchCorrect ? `Yes — ${term.english}: ${term.definition}` : `That was ${matchAnswer}. The correct answer is ${term.english}: ${term.definition}`}
            </div>
            <button type="button" className="btn btn-primary" onClick={nextMatch}>
              {isLast ? 'Continue to English-only' : 'Next match'}
            </button>
          </>
        )}
        <TeachNote>If you miss it, read the tip and try again. That is real practice — not failure.</TeachNote>
      </StepShell>
    )
  }

  /* ——— Step 9: English-Only Quiz (all items) ——— */
  if (step === 9) {
    return (
      <StepShell step={9} onBack={() => { resetMatch(); go(8) }}>
        <div className="train-bridge-banner">English only now — no translation on the buttons.</div>
        <WhyWork>On many sites, the shared language is English. The picture still helps you.</WhyWork>
        <QuizRunner items={ENGLISH_QUIZ} onComplete={() => { resetSent(); go(10) }} />
      </StepShell>
    )
  }

  /* ——— Step 10: Simple Sentences (cycle vocab terms) ——— */
  if (step === 10) {
    const term = VOCAB_UNIT[sentIdx]
    const answer = sentWord.trim().toLowerCase()
    const expected = term.english.toLowerCase()
    const ok = answer === expected
    const isLast = sentIdx >= VOCAB_UNIT.length - 1
    const bank = VOCAB_UNIT.map((t) => t.english.toLowerCase())

    function nextSent() {
      if (isLast) { go(11); resetInstr(); return }
      setSentIdx((i) => i + 1)
      setSentWord('')
    }

    return (
      <StepShell step={10} onBack={() => go(9)}>
        <WhyWork>Short sentences are how people talk when work is busy.</WhyWork>
        <p className="train-vocab-counter">Sentence {sentIdx + 1} of {VOCAB_UNIT.length}</p>
        <PictureCard
          image={toolImage(term.imageKey)}
          fit="contain"
          emoji={term.emoji}
          label="Finish the sentence"
          caption={`Hint: ${term.definition}`}
        />
        <p className="train-sentence-frame">
          This is a <span className="train-blank">{sentWord || '______'}</span>.
        </p>
        <p className="muted">Tap a word, or type it.</p>
        <div className="train-word-bank">
          {bank.map((w) => (
            <button key={w} type="button" className={`train-bank-chip${answer === w ? ' is-selected' : ''}`} onClick={() => setSentWord(w)}>{w}</button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="seq-sentence">Or type the English word</label>
          <input id="seq-sentence" value={sentWord} onChange={(e) => setSentWord(e.target.value)} autoComplete="off" spellCheck={false} />
        </div>
        {sentWord && (
          <div className={`alert ${ok ? 'ok' : 'warn'}`}>
            {ok ? `Good. "${term.sentence}"` : `Not yet. The word you need is "${term.english}".`}
          </div>
        )}
        {ok && (
          <button type="button" className="btn btn-primary" onClick={nextSent}>
            {isLast ? 'Continue to workplace instructions' : 'Next sentence'}
          </button>
        )}
        <TeachNote>Word bank first if you need it. Typing without help comes next.</TeachNote>
      </StepShell>
    )
  }

  /* ——— Step 11: Workplace Instructions (multiple) ——— */
  if (step === 11) {
    const instr = INSTRUCTIONS[instrIdx]
    const isLast = instrIdx >= INSTRUCTIONS.length - 1

    function pickInstr(opt: string) {
      if (instrAnswer) return
      const isCorrect = opt === instr.correct
      setInstrAnswer(opt)
      setInstrCorrect(isCorrect)
    }

    function nextInstr() {
      if (isLast) { go(12); return }
      setInstrIdx((i) => i + 1)
      setInstrHeard(false)
      setInstrAnswer(null)
      setInstrCorrect(false)
    }

    return (
      <StepShell step={11} onBack={() => { resetSent(); go(10) }}>
        <WhyWork>Supervisors give short directions. Hearing and acting keeps the team safe and fast.</WhyWork>
        <p className="train-vocab-counter">Instruction {instrIdx + 1} of {INSTRUCTIONS.length}</p>
        <div className="train-instruction">
          <PictureCard
            image={toolImage(instr.imageKey)}
            fit="contain"
            label="A worker gives a direction"
            caption="Listen in English (required). Support language is optional help."
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
              {speaking === 'en' ? 'Playing English…' : 'Hear English instruction'}
            </button>
            <button
              type="button"
              className="btn btn-secondary on-light"
              disabled={speaking !== null}
              onClick={() => void playSupport(instr.supportHint[supportLang])}
            >
              {speaking === 'support' ? `Playing ${supportLang}…` : `Hear ${supportLang} help`}
            </button>
          </div>
          {!instrHeard && <p className="muted">Hear the English instruction at least once before you answer.</p>}
          <p><strong>What should you do?</strong></p>
          <div className="train-choice-grid">
            {instr.options.map((opt) => (
              <ChoiceButton key={opt} state={instrAnswer === opt ? (instrCorrect ? 'correct' : 'wrong') : instrAnswer ? (opt === instr.correct ? 'correct' : 'idle') : 'idle'} disabled={!instrHeard || (!!instrAnswer && opt !== instrAnswer && opt !== instr.correct)} onClick={() => pickInstr(opt)}>
                {opt}
              </ChoiceButton>
            ))}
          </div>
        </div>
        {instrAnswer && (
          <>
            <div className={`alert ${instrCorrect ? 'ok' : 'warn'}`}>
              {instrCorrect ? 'Yes. You heard the tool name and the action.' : `Close — the correct action was: "${instr.correct}".`}
            </div>
            <button type="button" className="btn btn-primary" onClick={nextInstr}>
              {isLast ? 'Continue to computer basics' : 'Next instruction'}
            </button>
          </>
        )}
        <TeachNote>If you are unsure at work, repeat the instruction: confirm understanding.</TeachNote>
      </StepShell>
    )
  }

  /* ——— Step 12: Computer Skills Checklist ——— */
  if (step === 12) {
    const done = COMPUTER_SKILLS.every((s) => compChecks[s.id])
    return (
      <StepShell step={12} onBack={() => { resetInstr(); go(11) }} onNext={done ? () => go(13) : undefined} nextLabel="Continue to safety training">
        <WhyWork>Modern jobs ask for simple computer skills — even on a construction path.</WhyWork>
        <TeachNote>Check only what you can do today. Leaving a box empty is honest — we can teach that skill.</TeachNote>
        <ul className="train-check-list">
          {COMPUTER_SKILLS.map((s) => (
            <CheckItem key={s.id} id={`pc-${s.id}`} title={s.title} why={s.why} checked={!!compChecks[s.id]} onChange={() => setCompChecks((c) => ({ ...c, [s.id]: !c[s.id] }))} />
          ))}
        </ul>
      </StepShell>
    )
  }

  /* ——— Step 13: Safety Quiz (gated) ——— */
  if (step === 13) {
    return (
      <StepShell step={13} onBack={() => go(12)}>
        <PictureCard emoji="⚠️" label="Safety is a gate" caption="You must answer correctly to continue. This is not optional." />
        <WhyWork>Safe workers protect themselves, their team, and their future on site.</WhyWork>
        <TeachNote>Safety must pass before practical stations unlock. Review carefully.</TeachNote>
        <QuizRunner items={SAFETY_QUIZ} onComplete={() => go(14)} gated />
      </StepShell>
    )
  }

  /* ——— Step 14: Tool Categories (interactive cards) ——— */
  if (step === 14) {
    const allSeen = TOOL_CATEGORIES.every((c) => toolSeen[c.title])
    return (
      <StepShell step={14} onBack={() => go(13)} onNext={allSeen ? () => go(15) : undefined} nextLabel="Continue to construction systems">
        <PictureCard emoji="🧰" label="Tools, Materials & Equipment" caption="Tap each category to learn about it." />
        <WhyWork>If you can name it and know its job, you are safer when someone asks for it.</WhyWork>
        <div className="train-card-grid">
          {TOOL_CATEGORIES.map((cat) => (
            <button key={cat.title} type="button" className={`train-topic-card${toolSeen[cat.title] ? ' is-seen' : ''}`} onClick={() => setToolSeen((s) => ({ ...s, [cat.title]: true }))}>
              <span className="train-topic-mark">{cat.mark}</span>
              <strong>{cat.title}</strong>
              <p>{cat.why}</p>
            </button>
          ))}
        </div>
        <TeachNote>Knowing the name is step one. Safe use is checked later by an instructor.</TeachNote>
      </StepShell>
    )
  }

  /* ——— Step 15: System Topics (interactive cards) ——— */
  if (step === 15) {
    const allSeen = SYSTEM_TOPICS.every((t) => sysSeen[t.title])
    return (
      <StepShell step={15} onBack={() => go(14)} onNext={allSeen ? () => go(16) : undefined} nextLabel="Continue to hands-on training">
        <PictureCard emoji="🪵" label="Construction Systems & Skills" caption="Tap each topic to learn about it." />
        <WhyWork>When you know the systems, site talk makes more sense.</WhyWork>
        <div className="train-card-grid">
          {SYSTEM_TOPICS.map((topic) => (
            <button key={topic.title} type="button" className={`train-topic-card${sysSeen[topic.title] ? ' is-seen' : ''}`} onClick={() => setSysSeen((s) => ({ ...s, [topic.title]: true }))}>
              <span className="train-topic-mark">{topic.mark}</span>
              <strong>{topic.title}</strong>
              <p>{topic.why}</p>
            </button>
          ))}
        </div>
        <TeachNote>Big picture before deep practice.</TeachNote>
      </StepShell>
    )
  }

  /* ——— Step 16: Practical Observation Request Form ——— */
  if (step === 16) {
    function saveObs(e: FormEvent) {
      e.preventDefault()
      try { sessionStorage.setItem(OBS_KEY, JSON.stringify(obsForm)) } catch { /* */ }
      go(17)
    }
    return (
      <StepShell step={16} onBack={() => go(15)}>
        <PictureCard emoji="🤝" label="Hands-on with your instructor" caption="The app prepares you. People verify you." />
        <div className="train-learn-grid">
          <LearnCard mark="L" title="Learned" body="You studied the idea in the app or class." />
          <LearnCard mark="P" title="Practised" body="You tried the skill with supervision." />
          <LearnCard mark="C" title="Competent" body="An authorized instructor confirmed you meet the standard." />
        </div>
        <WhyWork>Employers care about what you can do safely — not only what you clicked online.</WhyWork>
        <TeachNote>A video watched or quiz passed is not automatic practical competency.</TeachNote>
        <form className="stack" onSubmit={saveObs}>
          <h3>Request instructor observation</h3>
          <div className="field">
            <label htmlFor="obs-skill">Skill to observe</label>
            <input id="obs-skill" value={obsForm.skill} onChange={(e) => setObsForm({ ...obsForm, skill: e.target.value })} required placeholder="e.g. Tape measure use" />
          </div>
          <div className="field">
            <label htmlFor="obs-station">Station / location</label>
            <input id="obs-station" value={obsForm.station} onChange={(e) => setObsForm({ ...obsForm, station: e.target.value })} required placeholder="e.g. Workshop bay 2" />
          </div>
          <div className="field">
            <label htmlFor="obs-notes">Notes for instructor</label>
            <textarea id="obs-notes" value={obsForm.notes} onChange={(e) => setObsForm({ ...obsForm, notes: e.target.value })} rows={3} placeholder="Anything the instructor should know" />
          </div>
          <button className="btn btn-primary" type="submit">Save request and continue</button>
        </form>
      </StepShell>
    )
  }

  /* ——— Step 17: On-site Daily Log ——— */
  if (step === 17) {
    function saveLog(e: FormEvent) {
      e.preventDefault()
      try { sessionStorage.setItem(LOG_KEY, JSON.stringify(logForm)) } catch { /* */ }
      go(18)
    }
    return (
      <StepShell step={17} onBack={() => go(16)}>
        <PictureCard emoji="🏗️" label="On-site training" caption="Real site. Real tasks. Real feedback." />
        <div className="train-learn-grid">
          <LearnCard title="Daily log" body="Write what you did. Short notes are fine." />
          <LearnCard title="Tasks completed" body="Track work you finished under supervision." />
          <LearnCard title="Supervisor feedback" body="Listen. Ask what to improve next time." />
        </div>
        <WhyWork>On-site hours turn classroom words into muscle memory and confidence.</WhyWork>
        <TeachNote>Ask questions early. Supervisors prefer a clear question to an unsafe guess.</TeachNote>
        <form className="stack" onSubmit={saveLog}>
          <h3>Daily log entry</h3>
          <div className="field">
            <label htmlFor="log-date">Date</label>
            <input id="log-date" type="date" value={logForm.date} onChange={(e) => setLogForm({ ...logForm, date: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="log-tasks">Tasks completed today</label>
            <textarea id="log-tasks" value={logForm.tasks} onChange={(e) => setLogForm({ ...logForm, tasks: e.target.value })} required rows={3} placeholder="What did you work on today?" />
          </div>
          <div className="field">
            <label htmlFor="log-sup">Supervisor note</label>
            <textarea id="log-sup" value={logForm.supervisor} onChange={(e) => setLogForm({ ...logForm, supervisor: e.target.value })} rows={2} placeholder="Any feedback from your supervisor" />
          </div>
          <button className="btn btn-primary" type="submit">Save log and continue</button>
        </form>
      </StepShell>
    )
  }

  /* ——— Step 18: Final Quiz (all items + score) ——— */
  if (step === 18) {
    return (
      <StepShell step={18} onBack={() => go(17)}>
        <PictureCard emoji="📋" label="Final Assessment" caption="Safety, knowledge, language, and practical readiness." />
        <WhyWork>Separate checks — not one blurry score for everything.</WhyWork>
        <TeachNote>Prepare calmly. Review your weak spots. Ask your instructor for a practice run if you need one.</TeachNote>
        <QuizRunner items={FINAL_QUIZ} onComplete={() => go(19)} />
      </StepShell>
    )
  }

  /* ——— Step 19: Skills Passport + Honesty Box ——— */
  if (step === 19) {
    return (
      <StepShell step={19} onBack={() => go(18)} onNext={honestyChecked ? () => go(20) : undefined} nextLabel="Continue to employment connection" nextDisabled={!honestyChecked}>
        <div className="train-passport">
          <PictureCard emoji="🎓" label="Purpose Academy Program Credential" caption="Your Skills Passport collects verified evidence." />
          <ul className="list-plain">
            <li>✓ Program learning completed</li>
            <li>✓ Competencies with dates and assessor role</li>
            <li>✓ Digital Skills Passport you can share</li>
          </ul>
          <div className="train-honesty">
            <p><strong>Shows:</strong> what you learned, practised, and proved.</p>
            <p><strong>Does not mean:</strong> Red Seal, a guaranteed job, or a third-party safety ticket unless that ticket was earned separately.</p>
          </div>
          <label className="train-honesty-check">
            <input type="checkbox" checked={honestyChecked} onChange={() => setHonestyChecked(!honestyChecked)} />
            <span>I understand what this credential shows and does not show.</span>
          </label>
          <Link className="btn btn-ghost" to="/app/student/skills">View Skills Passport →</Link>
        </div>
        <TeachNote>Honesty builds trust with employers. Clear evidence beats big promises.</TeachNote>
      </StepShell>
    )
  }

  /* ——— Step 20: Employment Connection ——— */
  function handleComplete(e: FormEvent) {
    e.preventDefault()
    try { sessionStorage.setItem(EMP_KEY, JSON.stringify(empForm)) } catch { /* */ }
    markSequenceComplete('student', { detail: user?.full_name || 'Student' })
  }

  const sequenceMarked = (() => {
    try { return !!sessionStorage.getItem(EMP_KEY) } catch { return false }
  })()

  return (
    <StepShell step={20} onBack={() => go(19)}>
      <PictureCard emoji="🤝" label="Employment Connection" caption="Training should lead toward opportunity — with follow-up, not a dead end." />
      {!sequenceMarked ? (
        <form className="stack" onSubmit={handleComplete}>
          <h3>Employment readiness</h3>
          <div className="field">
            <label htmlFor="emp-goal">Resume goal</label>
            <textarea id="emp-goal" value={empForm.resume_goal} onChange={(e) => setEmpForm({ ...empForm, resume_goal: e.target.value })} required rows={3} placeholder="What job are you aiming for?" />
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
            Student training path complete. Your progress is marked on{' '}
            <Link className="inline-link" to="/sequences">All sequences</Link>.
          </div>
          <div className="train-learn-grid">
            <LearnCard title="Resume support" body="Show your skills in clear, short English." />
            <LearnCard title="Employer matching" body="Connect with partners who understand this pathway." />
            <LearnCard title="Job placement help" body="Practice interviews and next steps." />
            <LearnCard title="30 / 90 / 180 day follow-up" body="We check how you are doing after you start work." />
          </div>
          <WhyWork>Keeping a job matters as much as getting one. Follow-up is part of the design.</WhyWork>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/app/student">Go to my dashboard</Link>
            <Link className="btn btn-secondary on-light" to="/sequences">See all sequences</Link>
            <button type="button" className="btn btn-ghost" onClick={() => { saveStep(1); go(1) }}>Restart training path</button>
          </div>
        </>
      )}
      <p className="train-motto">Learn · Practice · Improve · Achieve</p>
      <TeachNote>You finished the guided training path. Your progress is saved.</TeachNote>
    </StepShell>
  )
}
