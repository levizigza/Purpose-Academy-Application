import { FormEvent, useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { Reveal } from '../components/Motion'
import { DEMO_PASSWORDS } from '../data/seed'
import {
  clearDevPreview,
  getDevPreviewName,
  isDevPreview,
  startDevPreview,
} from '../dev/DevPreview'
import { markSequenceComplete } from '../gateway/sequenceProgress'
import { selectPathway } from '../data/store'

/**
 * Student journey — same 20-step order as the Purpose Academy ChatGPT sequence.
 * Teaching approach (from PA docs + adult vocational / CLB practice):
 * - One clear job per screen
 * - Picture + short English + optional support language (scaffold, then fade)
 * - Immediate feedback that teaches, not only “right/wrong”
 * - Connect every step to real work
 * - App supports; instructor verifies practical skill
 */

const JOURNEY_KEY = 'pa-student-journey-step-v1'

const STEPS = [
  {
    n: 1,
    title: 'Login',
    help: 'Choose Student to begin your path.',
    purpose: 'Find your door. Students, instructors, and admins enter in different ways.',
  },
  {
    n: 2,
    title: 'Registration',
    help: 'Tell us who you are. We use this to help you.',
    purpose: 'Your name and contact help us support you. This is not a test.',
  },
  {
    n: 3,
    title: 'Baseline Assessment',
    help: 'Look at the picture. Choose the best answer.',
    purpose: 'This shows what you already know — so we start in the right place.',
  },
  {
    n: 4,
    title: 'Career Interest',
    help: 'What type of work interests you most?',
    purpose: 'There is no wrong choice. Tell us what draws you.',
  },
  {
    n: 5,
    title: 'Choose Your Pathway',
    help: 'Confirm Construction for this program.',
    purpose: 'Construction is open now. Logistics and Community Support follow the same model later.',
  },
  {
    n: 6,
    title: 'Support Language',
    help: 'Choose a language that helps you learn.',
    purpose: 'This language is a bridge. Later we practice in English at work.',
  },
  {
    n: 7,
    title: 'Visual Vocabulary',
    help: 'See · Listen · Understand · Repeat',
    purpose: 'First understand the thing. Then learn the English word.',
  },
  {
    n: 8,
    title: 'Supported Practice',
    help: 'Match the word to the picture.',
    purpose: 'Practice with help. Mistakes are part of learning.',
  },
  {
    n: 9,
    title: 'English-Only Vocabulary',
    help: 'Now try without translation.',
    purpose: 'The support bridge steps back. You use English — with the picture still helping.',
  },
  {
    n: 10,
    title: 'Simple Sentences',
    help: 'Build a short work sentence.',
    purpose: 'Words become sentences you can say on a job site.',
  },
  {
    n: 11,
    title: 'Workplace Instructions',
    help: 'Listen. Then show you understood.',
    purpose: 'At work, people give short directions. You need to hear and act.',
  },
  {
    n: 12,
    title: 'Basic Computer Skills',
    help: 'Check the digital skills you can already do.',
    purpose: 'Training uses computers. Honest checks help us support you.',
  },
  {
    n: 13,
    title: 'Safety Training',
    help: 'Safety always comes first.',
    purpose: 'You must know safety before tools and site work open.',
  },
  {
    n: 14,
    title: 'Tools, Materials & Equipment',
    help: 'Know what you will use on site.',
    purpose: 'Name it. Know its job. Later an instructor watches you use it safely.',
  },
  {
    n: 15,
    title: 'Construction Systems & Skills',
    help: 'See the main parts of building work.',
    purpose: 'Big picture first. Then practice each skill with your instructor.',
  },
  {
    n: 16,
    title: 'Hands-On Practical Training',
    help: 'Practice with an instructor watching.',
    purpose: 'Learned → Practised → Competent. Only an instructor can verify the last step.',
  },
  {
    n: 17,
    title: 'On-Site Training',
    help: 'Learn on a real work site.',
    purpose: 'Classroom knowledge meets real tasks, real people, and real feedback.',
  },
  {
    n: 18,
    title: 'Final Assessment',
    help: 'Show what you know and can do.',
    purpose: 'We check safety, knowledge, language, and practical skill — separately.',
  },
  {
    n: 19,
    title: 'Graduation & Skills Passport',
    help: 'Your verified skills, in one place.',
    purpose: 'A clear record of what you studied, practised, and proved — not a job guarantee.',
  },
  {
    n: 20,
    title: 'Employment Connection',
    help: 'Support toward real work.',
    purpose: 'Training should lead toward opportunity: resume help, employers, and follow-up.',
  },
] as const

const LANGUAGES = [
  { id: 'Spanish', flag: '🇪🇸' },
  { id: 'French', flag: '🇫🇷' },
  { id: 'Arabic', flag: '🇸🇦' },
  { id: 'Hindi', flag: '🇮🇳' },
  { id: 'Amharic', flag: '🇪🇹' },
  { id: 'Tigrinya', flag: '🇪🇷' },
] as const

/** Plain support-language glosses for early scaffolding (prototype). */
const GLOSS: Record<string, Record<string, string>> = {
  Hammer: {
    Spanish: 'Martillo',
    French: 'Marteau',
    Arabic: 'Mitraga (مطرقة)',
    Hindi: 'Hathoda (हथौड़ा)',
    Amharic: 'Medosha (መዶሻ)',
    Tigrinya: 'Medasha',
  },
  'Tape measure': {
    Spanish: 'Cinta métrica',
    French: 'Mètre ruban',
    Arabic: 'Sharīt al-qiyās',
    Hindi: 'Tape map',
    Amharic: 'Tape measure',
    Tigrinya: 'Tape measure',
  },
  Saw: {
    Spanish: 'Sierra',
    French: 'Scie',
    Arabic: 'Minshar',
    Hindi: 'Aari',
    Amharic: 'Saw',
    Tigrinya: 'Saw',
  },
  'Hard hat': {
    Spanish: 'Casco de seguridad',
    French: 'Casque de sécurité',
    Arabic: 'Khudhat aman',
    Hindi: 'Safety helmet',
    Amharic: 'Safety helmet',
    Tigrinya: 'Safety helmet',
  },
}

function gloss(term: string, lang: string) {
  return GLOSS[term]?.[lang] || `${lang} meaning`
}

function speak(text: string) {
  try {
    window.speechSynthesis?.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'en-CA'
    utter.rate = 0.9
    window.speechSynthesis?.speak(utter)
  } catch {
    /* audio optional */
  }
}

function saveStep(step: number) {
  try {
    sessionStorage.setItem(JOURNEY_KEY, String(step))
  } catch {
    /* ignore */
  }
}

function loadStep() {
  try {
    const raw = sessionStorage.getItem(JOURNEY_KEY)
    const n = raw ? Number(raw) : 1
    return Number.isFinite(n) && n >= 1 && n <= 20 ? n : 1
  } catch {
    return 1
  }
}

function TeachNote({ children }: { children: ReactNode }) {
  return (
    <aside className="seq-teach" aria-label="Teacher note">
      <span className="seq-teach-label">Teacher tip</span>
      <p>{children}</p>
    </aside>
  )
}

function WhyWork({ children }: { children: ReactNode }) {
  return (
    <p className="seq-why">
      <strong>At work:</strong> {children}
    </p>
  )
}

function PictureCard({
  emoji,
  label,
  sub,
  caption,
}: {
  emoji: string
  label: string
  sub?: string
  caption?: string
}) {
  return (
    <figure className="seq-picture">
      <span className="seq-emoji" aria-hidden>
        {emoji}
      </span>
      <figcaption>
        <strong>{label}</strong>
        {sub && <span className="seq-sub">{sub}</span>}
        {caption && <span className="seq-caption">{caption}</span>}
      </figcaption>
    </figure>
  )
}

function ChoiceButton({
  children,
  onClick,
  state,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  state?: 'correct' | 'wrong' | 'idle'
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className={`seq-choice${state && state !== 'idle' ? ` is-${state}` : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function LearnCard({
  title,
  body,
  mark,
}: {
  title: string
  body: string
  mark?: string
}) {
  return (
    <article className="seq-learn-card">
      {mark && (
        <span className="seq-learn-mark" aria-hidden>
          {mark}
        </span>
      )}
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </article>
  )
}

function CheckItem({
  id,
  title,
  why,
  checked,
  onChange,
}: {
  id: string
  title: string
  why: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <li>
      <label className="seq-check-rich" htmlFor={id}>
        <input id={id} type="checkbox" checked={checked} onChange={onChange} />
        <span>
          <strong>{title}</strong>
          <em>{why}</em>
        </span>
      </label>
    </li>
  )
}

function StepShell({
  step,
  children,
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled,
}: {
  step: number
  children: ReactNode
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
}) {
  const meta = STEPS[step - 1]
  const pct = Math.round((step / 20) * 100)

  const preview = isDevPreview()
  const previewName = preview ? getDevPreviewName() : ''

  return (
    <div className="shell-main stack seq-shell">
      {preview && (
        <div className="dev-preview-banner" role="status">
          Developer preview · {previewName} · no account · temporary
        </div>
      )}
      <header className="seq-header">
        <p className="section-kicker">Step {step} of 20 · Student path</p>
        <h1>{meta.title}</h1>
        <p className="lede">{meta.help}</p>
        <p className="seq-purpose">{meta.purpose}</p>
        <div className="progress seq-progress" aria-label={`Progress ${pct}%`}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <ol className="seq-dots" aria-label="Step progress">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className={s.n === step ? 'is-current' : s.n < step ? 'is-done' : ''}
              title={s.title}
            />
          ))}
        </ol>
      </header>

      <Reveal className="panel stack seq-panel" delay={40}>
        {children}
      </Reveal>

      <div className="seq-actions">
        {onBack && (
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
        )}
        {onNext && (
          <button type="button" className="btn btn-primary" onClick={onNext} disabled={nextDisabled}>
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export function StudentSequencePage() {
  const navigate = useNavigate()
  const { user, student, login, register, refresh } = useSession()
  const [step, setStep] = useState(loadStep)
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'warn' | 'teach'; text: string } | null>(
    null,
  )
  const [choiceState, setChoiceState] = useState<Record<string, 'correct' | 'wrong'>>({})
  const [supportLang, setSupportLang] = useState(student?.preferred_language || 'Amharic')
  const [interest, setInterest] = useState<'construction' | 'logistics' | 'community' | null>(null)
  const [computerChecks, setComputerChecks] = useState<Record<string, boolean>>({})
  const [safetyChecks, setSafetyChecks] = useState<Record<string, boolean>>({})
  const [toolChecks, setToolChecks] = useState<Record<string, boolean>>({})
  const [skillChecks, setSkillChecks] = useState<Record<string, boolean>>({})
  const [sentenceWord, setSentenceWord] = useState('')
  const [vocabBeat, setVocabBeat] = useState(0)
  const [heardAudio, setHeardAudio] = useState(false)
  const [instructionHeard, setInstructionHeard] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [regForm, setRegForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: 'student123',
    preferred_language: 'Amharic',
    previous_experience: '',
  })
  const [devName, setDevName] = useState(getDevPreviewName() === 'Developer' ? '' : getDevPreviewName())
  const preview = isDevPreview()

  useEffect(() => {
    saveStep(step)
  }, [step])

  useEffect(() => {
    if (student?.preferred_language) setSupportLang(student.preferred_language)
  }, [student?.preferred_language])

  useEffect(() => {
    if (step !== 20) return
    markSequenceComplete('student', {
      detail: isDevPreview() ? getDevPreviewName() : user?.full_name || 'Student',
    })
  }, [step, user?.full_name])

  function go(next: number) {
    setFeedback(null)
    setChoiceState({})
    setError(null)
    setVocabBeat(0)
    setHeardAudio(false)
    setInstructionHeard(false)
    setSentenceWord('')
    setStep(Math.min(20, Math.max(1, next)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function ensureDemoStudent() {
    if (isDevPreview()) return true
    if (user?.role === 'student' && student?.registration_status === 'approved') return true
    setError(null)
    const result = await login('student@purposeacademy.ca', DEMO_PASSWORDS.student)
    if (result.error) {
      setError(result.error)
      return false
    }
    try {
      await refresh()
    } catch {
      /* session already set */
    }
    return true
  }

  async function finishPathway() {
    if (isDevPreview()) {
      go(6)
      return
    }
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

  /* ——— 1 Login ——— */
  if (step === 1) {
    return (
      <StepShell
        step={1}
        onBack={() => navigate('/enter/student')}
        onNext={() => go(2)}
        nextLabel="I am a Student — continue"
      >
        <div className="seq-login">
          <img src={BRAND_ASSETS.logoMark} alt="" className="seq-login-mark" />
          <p className="seq-brand">{BRAND.name}</p>
          <p className="seq-welcome">Welcome. Take a breath. We will go one step at a time.</p>
          <div className="seq-role-stack">
            <button type="button" className="seq-role student" onClick={() => go(2)}>
              Student Login
            </button>
            <Link className="seq-role instructor" to="/enter/instructor">
              Instructor Login
            </Link>
            <Link className="seq-role admin" to="/enter/admin">
              Admin Login
            </Link>
          </div>
          <TeachNote>
            Students learn and practice. Instructors teach and check skills. Admins manage the school.
            Choosing the right door keeps your path simple.
          </TeachNote>
        </div>
      </StepShell>
    )
  }

  /* ——— 2 Registration ——— */
  if (step === 2) {
    async function onRegister(e: FormEvent) {
      e.preventDefault()
      setBusy(true)
      setError(null)
      const err = await register({
        full_name: regForm.full_name,
        email: regForm.email,
        password: regForm.password,
        phone: regForm.phone,
        address: 'Calgary, AB',
        emergency_contact: 'Emergency contact',
        preferred_language: regForm.preferred_language,
      })
      setBusy(false)
      if (err) {
        if (/exists/i.test(err)) {
          const result = await login(regForm.email, regForm.password)
          if (!result.error) {
            await refresh()
            go(3)
            return
          }
        }
        setError(err)
        return
      }
      go(3)
    }

    function onDevPreview(e: FormEvent) {
      e.preventDefault()
      startDevPreview(devName)
      go(3)
    }

    /* Developer preview: name already captured — skip full registration form */
    if (preview) {
      return (
        <StepShell
          step={2}
          onBack={() => go(1)}
          onNext={() => go(3)}
          nextLabel={`Continue as ${getDevPreviewName()}`}
        >
          <div className="alert ok">
            Developer preview for <strong>{getDevPreviewName()}</strong>. No email or password
            needed. Full registration is skipped for this walkthrough.
          </div>
          <TeachNote>
            This is temporary. When you delete the developer preview, students will use the full
            registration form below.
          </TeachNote>
        </StepShell>
      )
    }

    return (
      <StepShell step={2} onBack={() => go(1)}>
        {/* TEMPORARY developer path — remove with src/dev/DevPreview.ts */}
        <form className="stack dev-preview-panel" onSubmit={onDevPreview}>
          <p className="section-kicker">Developer only · temporary</p>
          <h2>Quick preview (name only)</h2>
          <p className="lede">Skip email registration. Enter your name and run the full sequence.</p>
          <div className="field">
            <label htmlFor="seq-dev-name">Full name</label>
            <input
              id="seq-dev-name"
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              required
              placeholder="Your full name"
              autoComplete="name"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Enter sequence preview
          </button>
        </form>

        <TeachNote>
          Write slowly. Short answers are fine. Previous experience helps us place you — it is not a
          judgment.
        </TeachNote>
        <form className="stack" onSubmit={onRegister}>
          {error && <div className="alert error">{error}</div>}
          <div className="field">
            <label htmlFor="seq-name">Full name</label>
            <input
              id="seq-name"
              value={regForm.full_name}
              onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
              required
              placeholder="First and last name"
              autoComplete="name"
            />
            <span className="field-hint">Use the name on your ID if you can.</span>
          </div>
          <div className="field">
            <label htmlFor="seq-email">Email</label>
            <input
              id="seq-email"
              type="email"
              value={regForm.email}
              onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              required
              placeholder="you@email.com"
              autoComplete="email"
            />
            <span className="field-hint">We send important updates here.</span>
          </div>
          <div className="field">
            <label htmlFor="seq-phone">Phone</label>
            <input
              id="seq-phone"
              type="tel"
              value={regForm.phone}
              onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              required
              placeholder="403-555-0000"
              autoComplete="tel"
            />
          </div>
          <div className="field">
            <label htmlFor="seq-lang">Preferred language</label>
            <select
              id="seq-lang"
              value={regForm.preferred_language}
              onChange={(e) => setRegForm({ ...regForm, preferred_language: e.target.value })}
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.flag} {l.id}
                </option>
              ))}
            </select>
            <span className="field-hint">We can show meanings in this language while you learn.</span>
          </div>
          <div className="field">
            <label htmlFor="seq-exp">Previous experience</label>
            <input
              id="seq-exp"
              value={regForm.previous_experience}
              onChange={(e) => setRegForm({ ...regForm, previous_experience: e.target.value })}
              placeholder="Example: helper on building sites — or none yet"
            />
            <span className="field-hint">“None yet” is a good answer. Many students start here.</span>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save and continue'}
          </button>
          <button
            type="button"
            className="btn btn-secondary on-light"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              setError(null)
              try {
                const ok = await ensureDemoStudent()
                if (ok) go(3)
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Could not sign in.')
              } finally {
                setBusy(false)
              }
            }}
          >
            Use demo student and continue
          </button>
        </form>
      </StepShell>
    )
  }

  /* ——— 3 Baseline ——— */
  if (step === 3) {
    const locked = feedback?.kind === 'ok'
    return (
      <StepShell
        step={3}
        onBack={() => go(2)}
        onNext={locked ? () => go(4) : undefined}
        nextLabel="Continue — I understand"
      >
        <WhyWork>Workers wear a hard hat to protect the head on a construction site.</WhyWork>
        <PictureCard
          emoji="⛑️"
          label="What is this?"
          caption="Look carefully. Choose the English name."
        />
        <div className="seq-choice-grid">
          {(
            [
              ['Hard hat', 'Yes — this is a hard hat. It is PPE (personal protective equipment).'],
              ['Hammer', 'A hammer hits nails. This picture shows a helmet for the head.'],
              ['Boot', 'Safety boots protect feet. Look at the head covering in the picture.'],
              ['Glove', 'Gloves protect hands. This picture shows protection for the head.'],
            ] as const
          ).map(([opt, teach]) => (
            <ChoiceButton
              key={opt}
              state={choiceState[opt]}
              disabled={locked && opt !== 'Hard hat'}
              onClick={() => {
                const correct = opt === 'Hard hat'
                setChoiceState({ [opt]: correct ? 'correct' : 'wrong' })
                setFeedback({
                  kind: correct ? 'ok' : 'teach',
                  text: teach,
                })
              }}
            >
              {opt}
            </ChoiceButton>
          ))}
        </div>
        {feedback && <div className={`alert ${feedback.kind === 'ok' ? 'ok' : 'warn'}`}>{feedback.text}</div>}
        <TeachNote>
          Baseline is not a pass/fail grade. Wrong answers help your instructor know what to teach
          next.
        </TeachNote>
      </StepShell>
    )
  }

  /* ——— 4 Career interest ——— */
  if (step === 4) {
    return (
      <StepShell
        step={4}
        onBack={() => go(3)}
        onNext={interest ? () => go(5) : undefined}
        nextLabel="Continue with this interest"
      >
        <WhyWork>Your interest helps us match training to the kind of work you want.</WhyWork>
        <p>
          <strong>What type of work interests you most?</strong>
        </p>
        <div className="seq-interest-grid">
          {(
            [
              {
                id: 'construction' as const,
                title: 'Construction',
                img: BRAND_ASSETS.iconConstruction,
                line: 'Build Skills, Build Futures.',
                detail: 'Safety, tools, and building work.',
              },
              {
                id: 'logistics' as const,
                title: 'Logistics',
                img: BRAND_ASSETS.iconLogistics,
                line: 'Move People, Move Opportunities.',
                detail: 'Warehouse and moving goods — opens after Construction is proven.',
              },
              {
                id: 'community' as const,
                title: 'Community Support',
                img: BRAND_ASSETS.iconCommunity,
                line: 'Stronger People, Stronger Communities.',
                detail: 'Helping people in community roles — planned next.',
              },
            ]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`seq-interest${interest === item.id ? ' is-selected' : ''}`}
              onClick={() => setInterest(item.id)}
            >
              <img src={item.img} alt="" />
              <strong>{item.title}</strong>
              <span>{item.line}</span>
              <em className="seq-interest-detail">{item.detail}</em>
            </button>
          ))}
        </div>
        {interest && interest !== 'construction' && (
          <div className="alert warn">
            You chose {interest === 'logistics' ? 'Logistics' : 'Community Support'}. Today’s live
            pathway is Construction — same learning steps, different job focus later. You can still
            continue and see how the path works.
          </div>
        )}
        <TeachNote>Tap the path that feels closest to you. Curiosity is enough to begin.</TeachNote>
      </StepShell>
    )
  }

  /* ——— 5 Choose pathway ——— */
  if (step === 5) {
    return (
      <StepShell step={5} onBack={() => go(4)}>
        {error && <div className="alert error">{error}</div>}
        <PictureCard
          emoji="🏗️"
          label="Construction"
          sub="Build Skills, Build Futures."
          caption="This is the open pathway you can prove with an instructor."
        />
        <WhyWork>
          Construction needs people who know safety words, tools, and how to follow short directions.
        </WhyWork>
        <div className="seq-learn-grid">
          <LearnCard mark="1" title="Language for work" body="Words you hear on a job site." />
          <LearnCard mark="2" title="Safety first" body="Protect yourself and others." />
          <LearnCard mark="3" title="Tools & practice" body="Learn, practise, then prove with an instructor." />
        </div>
        <TeachNote>
          Choosing Construction does not promise a job. It opens a clear path: understand → practise →
          verified skill → employment support.
        </TeachNote>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            await finishPathway()
            setBusy(false)
          }}
        >
          {busy ? 'Saving…' : 'Yes — I choose Construction'}
        </button>
      </StepShell>
    )
  }

  /* ——— 6 Support language ——— */
  if (step === 6) {
    return (
      <StepShell
        step={6}
        onBack={() => go(5)}
        onNext={() => go(7)}
        nextLabel="Use this support language"
      >
        <WhyWork>
          When you understand the idea in a familiar language, English words stick faster.
        </WhyWork>
        <div className="seq-lang-grid">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`seq-lang${supportLang === l.id ? ' is-selected' : ''}`}
              onClick={() => setSupportLang(l.id)}
            >
              <span aria-hidden>{l.flag}</span>
              <strong>{l.id}</strong>
            </button>
          ))}
        </div>
        <div className="seq-bridge">
          <p>
            <strong>How the bridge works</strong>
          </p>
          <ol>
            <li>Early lessons: picture + English + {supportLang}</li>
            <li>Practice: still with help</li>
            <li>Later: English only — like the worksite</li>
          </ol>
        </div>
        <TeachNote>
          Support language makes the path clearer. The goal stays the same: safe English at work.
        </TeachNote>
      </StepShell>
    )
  }

  /* ——— 7 Visual vocabulary — See / Listen / Understand / Repeat ——— */
  if (step === 7) {
    const beats = [
      {
        label: 'See',
        tip: 'Look at the tool. Notice the shape. This is what workers use to hit nails.',
      },
      {
        label: 'Listen',
        tip: 'Hear the English word slowly. You can play it more than once.',
      },
      {
        label: 'Understand',
        tip: `Meaning in ${supportLang}: ${gloss('Hammer', supportLang)}. Now connect picture → meaning → English.`,
      },
      {
        label: 'Repeat',
        tip: 'Say “Hammer” out loud. Speaking helps memory.',
      },
    ]
    const ready = vocabBeat >= 3 && heardAudio

    return (
      <StepShell
        step={7}
        onBack={() => go(6)}
        onNext={ready ? () => go(8) : undefined}
        nextLabel="I can say Hammer"
        nextDisabled={!ready}
      >
        <PictureCard
          emoji="🔨"
          label="Hammer"
          sub={`${supportLang}: ${gloss('Hammer', supportLang)}`}
          caption="See — Listen — Understand — Repeat"
        />
        <div className="seq-layers" role="list">
          {beats.map((b, i) => (
            <span
              key={b.label}
              role="listitem"
              className={i <= vocabBeat ? 'is-active' : ''}
            >
              {b.label}
            </span>
          ))}
        </div>
        <p className="seq-beat-tip">{beats[Math.min(vocabBeat, 3)].tip}</p>
        <div className="hero-actions">
          {vocabBeat === 0 && (
            <button type="button" className="btn btn-primary" onClick={() => setVocabBeat(1)}>
              I see it
            </button>
          )}
          {vocabBeat === 1 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                speak('Hammer')
                setHeardAudio(true)
                setVocabBeat(2)
              }}
            >
              Play English: Hammer
            </button>
          )}
          {vocabBeat === 2 && (
            <>
              <button
                type="button"
                className="btn btn-secondary on-light"
                onClick={() => {
                  speak('Hammer')
                  setHeardAudio(true)
                }}
              >
                Listen again
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setVocabBeat(3)}>
                I understand
              </button>
            </>
          )}
          {vocabBeat >= 3 && (
            <button
              type="button"
              className="btn btn-secondary on-light"
              onClick={() => speak('Hammer')}
            >
              Hear it once more
            </button>
          )}
        </div>
        <WhyWork>Someone may say “Pass me the hammer.” You need the word and the picture in your mind.</WhyWork>
        <TeachNote>
          Do not rush to memorize. First understand. Then the English word has a home.
        </TeachNote>
      </StepShell>
    )
  }

  /* ——— 8 Supported practice ——— */
  if (step === 8) {
    const locked = feedback?.kind === 'ok'
    return (
      <StepShell
        step={8}
        onBack={() => go(7)}
        onNext={locked ? () => go(9) : undefined}
        nextLabel="Continue to English-only practice"
      >
        <WhyWork>Matching picture to word is homework for your eyes and memory.</WhyWork>
        <PictureCard
          emoji="📏"
          label="Match the word to the picture"
          sub={`${supportLang} help: ${gloss('Tape measure', supportLang)}`}
          caption="Still supported — translation is allowed here."
        />
        <div className="seq-choice-grid">
          {(
            [
              ['Tape measure', 'Yes. A tape measure measures length. You will use it often.'],
              ['Hammer', 'A hammer hits. The picture shows a long ribbon used to measure.'],
              ['Saw', 'A saw cuts wood. Look for the measuring tool.'],
              ['Hard hat', 'A hard hat protects the head. This picture is for measuring.'],
            ] as const
          ).map(([opt, teach]) => (
            <ChoiceButton
              key={opt}
              state={choiceState[opt]}
              disabled={locked && opt !== 'Tape measure'}
              onClick={() => {
                const correct = opt === 'Tape measure'
                setChoiceState({ [opt]: correct ? 'correct' : 'wrong' })
                setFeedback({ kind: correct ? 'ok' : 'teach', text: teach })
              }}
            >
              {opt}
            </ChoiceButton>
          ))}
        </div>
        {feedback && <div className={`alert ${feedback.kind === 'ok' ? 'ok' : 'warn'}`}>{feedback.text}</div>}
        <TeachNote>If you miss it, read the tip and try again. That is real practice — not failure.</TeachNote>
      </StepShell>
    )
  }

  /* ——— 9 English-only ——— */
  if (step === 9) {
    const locked = feedback?.kind === 'ok'
    return (
      <StepShell
        step={9}
        onBack={() => go(8)}
        onNext={locked ? () => go(10) : undefined}
        nextLabel="Continue to sentences"
      >
        <div className="seq-bridge-banner">English only now — no translation on the buttons.</div>
        <WhyWork>On many sites, the shared language is English. The picture still helps you.</WhyWork>
        <PictureCard emoji="🪚" label="What is this?" caption="Choose the English word." />
        <div className="seq-choice-grid">
          {(
            [
              ['Saw', 'Yes. A saw cuts wood and other materials. Keep hands clear of the blade.'],
              ['Drill', 'A drill makes holes. The picture shows a blade for cutting.'],
              ['Nail', 'A nail is a small fastener. The picture is a whole tool.'],
              ['Ladder', 'A ladder helps you climb. The picture is a cutting tool.'],
            ] as const
          ).map(([opt, teach]) => (
            <ChoiceButton
              key={opt}
              state={choiceState[opt]}
              disabled={locked && opt !== 'Saw'}
              onClick={() => {
                const correct = opt === 'Saw'
                setChoiceState({ [opt]: correct ? 'correct' : 'wrong' })
                setFeedback({ kind: correct ? 'ok' : 'teach', text: teach })
              }}
            >
              {opt}
            </ChoiceButton>
          ))}
        </div>
        {feedback && <div className={`alert ${feedback.kind === 'ok' ? 'ok' : 'warn'}`}>{feedback.text}</div>}
        <TeachNote>
          You still know {gloss('Saw', supportLang)} in {supportLang} — but at work you answer in English.
        </TeachNote>
      </StepShell>
    )
  }

  /* ——— 10 Simple sentences ——— */
  if (step === 10) {
    const answer = sentenceWord.trim().toLowerCase()
    const ok = answer === 'hammer'
    const bank = ['hammer', 'saw', 'boot']
    return (
      <StepShell
        step={10}
        onBack={() => go(9)}
        onNext={ok ? () => go(11) : undefined}
        nextLabel="Continue to workplace instructions"
      >
        <WhyWork>Short sentences are how people talk when work is busy.</WhyWork>
        <PictureCard emoji="🔨" label="Finish the sentence" caption="This is a _______." />
        <p className="seq-sentence-frame">
          This is a <span className="seq-blank">{sentenceWord || '______'}</span>.
        </p>
        <p className="muted">Tap a word, or type it.</p>
        <div className="seq-word-bank">
          {bank.map((w) => (
            <button
              key={w}
              type="button"
              className={`seq-bank-chip${answer === w ? ' is-selected' : ''}`}
              onClick={() => setSentenceWord(w)}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="seq-sentence">Or type the English word</label>
          <input
            id="seq-sentence"
            value={sentenceWord}
            onChange={(e) => setSentenceWord(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        {sentenceWord && (
          <div className={`alert ${ok ? 'ok' : 'warn'}`}>
            {ok
              ? 'Good. “This is a hammer.” You can show and name the tool.'
              : 'Not yet. Look at the picture. The word starts with “h” and ends with “r”.'}
          </div>
        )}
        <TeachNote>Word bank first if you need it. Typing without help comes next — same sentence.</TeachNote>
      </StepShell>
    )
  }

  /* ——— 11 Workplace instructions ——— */
  if (step === 11) {
    const locked = feedback?.kind === 'ok'
    return (
      <StepShell
        step={11}
        onBack={() => go(10)}
        onNext={locked ? () => go(12) : undefined}
        nextLabel="Continue to computer basics"
      >
        <WhyWork>Supervisors give short directions. Hearing and acting keeps the team safe and fast.</WhyWork>
        <div className="seq-instruction">
          <PictureCard emoji="👷" label="A worker gives a direction" caption="Listen, then choose what to do." />
          <blockquote>“Bring the tape measure.”</blockquote>
          <button
            type="button"
            className="btn btn-secondary on-light"
            onClick={() => {
              speak('Bring the tape measure.')
              setInstructionHeard(true)
            }}
          >
            Play instruction
          </button>
          {!instructionHeard && (
            <p className="muted">Press play at least once before you answer.</p>
          )}
          <p>
            <strong>What should you do?</strong>
          </p>
          <div className="seq-choice-grid">
            {(
              [
                [
                  'Bring the tape measure',
                  'Yes. You heard the tool name and the action: bring it.',
                ],
                [
                  'Bring the hammer',
                  'Close — but the worker said tape measure, not hammer.',
                ],
                [
                  'Put on a hard hat',
                  'Hard hats matter, but that was not this instruction.',
                ],
                [
                  'Start cutting wood',
                  'No cutting was asked. Follow the exact words you heard.',
                ],
              ] as const
            ).map(([opt, teach]) => (
              <ChoiceButton
                key={opt}
                state={choiceState[opt]}
                disabled={!instructionHeard || (locked && opt !== 'Bring the tape measure')}
                onClick={() => {
                  const correct = opt === 'Bring the tape measure'
                  setChoiceState({ [opt]: correct ? 'correct' : 'wrong' })
                  setFeedback({ kind: correct ? 'ok' : 'teach', text: teach })
                }}
              >
                {opt}
              </ChoiceButton>
            ))}
          </div>
        </div>
        {feedback && <div className={`alert ${feedback.kind === 'ok' ? 'ok' : 'warn'}`}>{feedback.text}</div>}
        <TeachNote>If you are unsure at work, it is good to repeat: “Bring the tape measure — yes?”</TeachNote>
      </StepShell>
    )
  }

  /* ——— 12 Computer basics ——— */
  if (step === 12) {
    const items = [
      { title: 'Use a mouse', why: 'Click lessons and buttons on this site.' },
      { title: 'Type', why: 'Write short answers and your name.' },
      { title: 'Save a file', why: 'Keep homework or forms on a computer.' },
      { title: 'Use the internet', why: 'Open training and email from many places.' },
      { title: 'Send an email', why: 'Message instructors and employers.' },
    ]
    const done = items.every((i) => computerChecks[i.title])
    return (
      <StepShell
        step={12}
        onBack={() => go(11)}
        onNext={done ? () => go(13) : undefined}
        nextLabel="Continue to safety"
      >
        <WhyWork>Modern jobs ask for simple computer skills — even on a construction path.</WhyWork>
        <TeachNote>
          Check only what you can do today. Leaving a box empty is honest — we can teach that skill.
        </TeachNote>
        <ul className="seq-check-list">
          {items.map((item) => (
            <CheckItem
              key={item.title}
              id={`pc-${item.title}`}
              title={item.title}
              why={item.why}
              checked={!!computerChecks[item.title]}
              onChange={() =>
                setComputerChecks((c) => ({ ...c, [item.title]: !c[item.title] }))
              }
            />
          ))}
        </ul>
      </StepShell>
    )
  }

  /* ——— 13 Safety ——— */
  if (step === 13) {
    const items = [
      { title: 'PPE', why: 'Hard hat, boots, gloves, eye protection — gear that protects your body.' },
      { title: 'Hazards', why: 'Things that can hurt you: falls, sharp tools, electricity, dust.' },
      { title: 'Tool safety', why: 'How to hold, carry, and store tools so nobody gets cut or hit.' },
      { title: 'Site safety', why: 'Walkways, signs, and rules on a real job site.' },
      { title: 'Emergency procedures', why: 'What to do if someone is hurt or there is a fire.' },
    ]
    const done = items.every((i) => safetyChecks[i.title])
    return (
      <StepShell
        step={13}
        onBack={() => go(12)}
        onNext={done ? () => go(14) : undefined}
        nextLabel="I understand these safety areas"
      >
        <PictureCard emoji="⚠️" label="Safety is built in" caption="Not an extra unit — a gate before practice." />
        <WhyWork>Safe workers protect themselves, their team, and their future on site.</WhyWork>
        <TeachNote>
          Open each idea. In the full program, safety must pass before practical stations unlock.
        </TeachNote>
        <ul className="seq-check-list">
          {items.map((item) => (
            <CheckItem
              key={item.title}
              id={`safe-${item.title}`}
              title={item.title}
              why={item.why}
              checked={!!safetyChecks[item.title]}
              onChange={() => setSafetyChecks((c) => ({ ...c, [item.title]: !c[item.title] }))}
            />
          ))}
        </ul>
      </StepShell>
    )
  }

  /* ——— 14 Tools ——— */
  if (step === 14) {
    const items = [
      { title: 'Hand tools', why: 'Hammer, tape measure, screwdriver — power comes from you.' },
      { title: 'Power tools', why: 'Drill, saw — electricity or batteries. Extra care needed.' },
      { title: 'Materials', why: 'Wood, drywall, fasteners — what you build with.' },
      { title: 'Mobile equipment', why: 'Lifts and machines that move. Only with proper training.' },
    ]
    const done = items.every((i) => toolChecks[i.title])
    return (
      <StepShell
        step={14}
        onBack={() => go(13)}
        onNext={done ? () => go(15) : undefined}
        nextLabel="Continue to construction skills"
      >
        <PictureCard emoji="🧰" label="Tools, materials & equipment" />
        <WhyWork>If you can name it and know its job, you are safer when someone asks for it.</WhyWork>
        <ul className="seq-check-list">
          {items.map((item) => (
            <CheckItem
              key={item.title}
              id={`tool-${item.title}`}
              title={item.title}
              why={item.why}
              checked={!!toolChecks[item.title]}
              onChange={() => setToolChecks((c) => ({ ...c, [item.title]: !c[item.title] }))}
            />
          ))}
        </ul>
        <TeachNote>Knowing the name is step one. Safe use is checked later by an instructor.</TeachNote>
      </StepShell>
    )
  }

  /* ——— 15 Construction systems ——— */
  if (step === 15) {
    const items = [
      { title: 'Framing', why: 'The skeleton of a building — walls and structure.' },
      { title: 'Interior finishes', why: 'What you see inside: drywall, paint, flooring.' },
      { title: 'Exterior systems', why: 'Outside: siding, roofs, weather protection.' },
      { title: 'Trade awareness', why: 'How electricians, plumbers, and HVAC workers fit the build.' },
      { title: 'Measurement & math', why: 'Measure twice. Simple math keeps cuts and levels true.' },
    ]
    const done = items.every((i) => skillChecks[i.title])
    return (
      <StepShell
        step={15}
        onBack={() => go(14)}
        onNext={done ? () => go(16) : undefined}
        nextLabel="Continue to hands-on practice"
      >
        <PictureCard emoji="🪵" label="Construction systems & skills" caption="Big picture before deep practice." />
        <WhyWork>When you know the systems, site talk makes more sense.</WhyWork>
        <ul className="seq-check-list">
          {items.map((item) => (
            <CheckItem
              key={item.title}
              id={`skill-${item.title}`}
              title={item.title}
              why={item.why}
              checked={!!skillChecks[item.title]}
              onChange={() => setSkillChecks((c) => ({ ...c, [item.title]: !c[item.title] }))}
            />
          ))}
        </ul>
      </StepShell>
    )
  }

  /* ——— 16 Hands-on ——— */
  if (step === 16) {
    return (
      <StepShell
        step={16}
        onBack={() => go(15)}
        onNext={() => go(17)}
        nextLabel="I understand Learned → Practised → Competent"
      >
        <PictureCard
          emoji="🤝"
          label="Hands-on with your instructor"
          caption="The app prepares you. People verify you."
        />
        <div className="seq-learn-grid">
          <LearnCard
            mark="L"
            title="Learned"
            body="You studied the idea in the app or class — pictures, words, safety."
          />
          <LearnCard
            mark="P"
            title="Practised"
            body="You tried the skill with supervision. You may still need coaching."
          />
          <LearnCard
            mark="C"
            title="Competent"
            body="An authorized instructor watched and confirmed you meet the standard."
          />
        </div>
        <WhyWork>Employers care about what you can do safely — not only what you clicked online.</WhyWork>
        <TeachNote>
          A video watched or quiz passed is not automatic practical competency. That is Purpose Academy
          policy — and good teaching.
        </TeachNote>
      </StepShell>
    )
  }

  /* ——— 17 On-site ——— */
  if (step === 17) {
    return (
      <StepShell step={17} onBack={() => go(16)} onNext={() => go(18)} nextLabel="Continue to final assessment">
        <PictureCard emoji="🏗️" label="On-site training" caption="Real site. Real tasks. Real feedback." />
        <div className="seq-learn-grid">
          <LearnCard title="Daily log" body="Write what you did. Short notes are fine." />
          <LearnCard title="Tasks completed" body="Track work you finished under supervision." />
          <LearnCard title="Supervisor feedback" body="Listen. Ask what to improve next time." />
          <LearnCard title="Workplace experience" body="Canadian site habits, teamwork, and timing." />
        </div>
        <WhyWork>On-site hours turn classroom words into muscle memory and confidence.</WhyWork>
        <TeachNote>Ask questions early. Supervisors prefer a clear question to an unsafe guess.</TeachNote>
      </StepShell>
    )
  }

  /* ——— 18 Final assessment ——— */
  if (step === 18) {
    return (
      <StepShell
        step={18}
        onBack={() => go(17)}
        onNext={() => go(19)}
        nextLabel="I know what will be checked"
      >
        <PictureCard emoji="📋" label="Final assessment" caption="Several checks — not one single score for everything." />
        <ul className="seq-assess-list">
          <li>
            <strong>Safety exam</strong>
            <span>Can you keep yourself and others safe?</span>
          </li>
          <li>
            <strong>Measurement exam</strong>
            <span>Can you measure and use simple job math?</span>
          </li>
          <li>
            <strong>Knowledge exam</strong>
            <span>Do you understand tools, materials, and systems?</span>
          </li>
          <li>
            <strong>Practical skills</strong>
            <span>Can you perform with an instructor watching?</span>
          </li>
          <li>
            <strong>Workplace language</strong>
            <span>Can you follow and use short English directions?</span>
          </li>
        </ul>
        <TeachNote>
          Prepare calmly. Review your weak spots. Ask your instructor for a practice run if you need
          one.
        </TeachNote>
      </StepShell>
    )
  }

  /* ——— 19 Skills Passport ——— */
  if (step === 19) {
    return (
      <StepShell
        step={19}
        onBack={() => go(18)}
        onNext={() => go(20)}
        nextLabel="Continue to employment connection"
      >
        <div className="seq-passport">
          <PictureCard
            emoji="🎓"
            label="Purpose Academy Program Credential"
            caption="Your Skills Passport collects verified evidence."
          />
          <ul className="list-plain">
            <li>✓ Program learning completed</li>
            <li>✓ Competencies with dates and assessor role</li>
            <li>✓ Digital Skills Passport you can share</li>
          </ul>
          <div className="seq-honesty">
            <p>
              <strong>Shows:</strong> what you learned, practised, and proved.
            </p>
            <p>
              <strong>Does not mean:</strong> Red Seal, a guaranteed job, or a third-party safety ticket
              unless that ticket was earned separately.
            </p>
          </div>
        </div>
        <TeachNote>Honesty builds trust with employers. Clear evidence beats big promises.</TeachNote>
      </StepShell>
    )
  }

  /* ——— 20 Employment ——— */
  return (
    <StepShell step={20} onBack={() => go(19)}>
      <PictureCard
        emoji="🤝"
        label="Employment connection"
        caption="Training should lead toward opportunity — with follow-up, not a dead end."
      />
      <div className="alert ok">
        Student sequence complete. It is now marked on the home page and on{' '}
        <Link className="inline-link" to="/sequences">
          All sequences
        </Link>
        .
      </div>
      <div className="seq-learn-grid">
        <LearnCard title="Resume support" body="Show your skills in clear, short English." />
        <LearnCard title="Employer matching" body="Connect with partners who understand this pathway." />
        <LearnCard title="Job placement help" body="Practice interviews and next steps." />
        <LearnCard title="30 / 90 / 180 day follow-up" body="We check how you are doing after you start work." />
      </div>
      <WhyWork>Keeping a job matters as much as getting one. Follow-up is part of the design.</WhyWork>
      <div className="hero-actions">
        <Link className="btn btn-primary" to="/sequences">
          See all sequences on the site
        </Link>
        <Link className="btn btn-secondary" to="/">
          Back to home
        </Link>
        {!preview && (
          <Link className="btn btn-ghost" to="/app/student">
            Go to my dashboard
          </Link>
        )}
        {preview && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              clearDevPreview()
              navigate('/sequences')
            }}
          >
            End developer preview
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            saveStep(1)
            go(1)
          }}
        >
          Restart sequence
        </button>
      </div>
      <p className="seq-motto">Learn · Practice · Improve · Achieve</p>
      <TeachNote>
        {preview
          ? `Preview complete for ${getDevPreviewName()}. Open All sequences to see every door marked on the site.`
          : 'You finished the guided sequence. Your progress is saved on the site sequences board.'}
      </TeachNote>
    </StepShell>
  )
}
