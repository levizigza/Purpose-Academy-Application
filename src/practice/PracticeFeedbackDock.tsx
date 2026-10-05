import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  getPracticeName,
  isPracticeMode,
  markPracticeFeedbackAck,
  PRACTICE_REVIEWERS,
  practiceFeedbackKey,
  restartPracticeFromTop,
  setPracticeName,
  shouldHidePracticeFeedback,
} from './PracticeMode'
import { submitPracticeFeedback } from './feedbackStore'

function pageTitleFromPath(pathname: string) {
  if (pathname === '/') return 'Home'
  if (pathname === '/journey') {
    try {
      const step = Number(sessionStorage.getItem('pa-student-journey-step-v1') || '0')
      if (step > 0) return `Training · step ${step}`
    } catch {
      /* ignore */
    }
    return 'Training path'
  }
  const bit = pathname.split('/').filter(Boolean).pop() || pathname
  return bit.replace(/-/g, ' ')
}

function currentJourneyStep() {
  try {
    const n = Number(sessionStorage.getItem('pa-student-journey-step-v1') || '0')
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

/** Quiz-like paths: collect feedback after the activity, not mid-question. */
function isQuizContext(pathname: string, search: string) {
  if (pathname.includes('/assignments/')) return true
  if (search.includes('quiz=1') || search.includes('phase=quiz')) return true
  return false
}

type ChatLine = {
  id: string
  role: 'system' | 'user' | 'bot'
  text: string
}

type Props = {
  quizComplete?: boolean
  forceShow?: boolean
}

export function PracticeFeedbackDock({ quizComplete = false, forceShow = false }: Props) {
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(() => getPracticeName())
  const [draftName, setDraftName] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [quizActive, setQuizActive] = useState(false)
  const [quizDone, setQuizDone] = useState(quizComplete)
  const [lines, setLines] = useState<ChatLine[]>([])
  const endRef = useRef<HTMLDivElement | null>(null)
  const [journeyTick, setJourneyTick] = useState(0)

  const liveJourneyStep = pathname === '/journey' ? currentJourneyStep() : 0
  const liveFeedbackKey = practiceFeedbackKey(pathname, liveJourneyStep || undefined)
  const journeyStep = liveJourneyStep
  const hide = !forceShow && shouldHidePracticeFeedback(pathname, journeyStep || undefined)
  const active = !hide && (forceShow || isPracticeMode() || Boolean(name))
  const quiz = isQuizContext(pathname, search) || quizActive
  const needName = !name
  const blockForQuiz = quiz && !quizDone && !needName
  const feedbackKey = liveFeedbackKey

  useEffect(() => {
    setName(getPracticeName())
    setBody('')
    setQuizDone(quizComplete)
    setQuizActive(false)
    setLines([
      {
        id: 'sys-1',
        role: 'bot',
        text: `You’re in Student Practice Mode on ${pageTitleFromPath(pathname)}. Tell me what to fix or improve. I’ll send it to Levi.`,
      },
    ])
  }, [pathname, quizComplete, journeyTick])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [lines, open])

  useEffect(() => {
    const onQuiz = () => setQuizDone(true)
    const onQuizStart = () => {
      setQuizActive(true)
      setQuizDone(false)
    }
    const onQuizEnd = () => {
      setQuizActive(false)
      setQuizDone(true)
    }
    const onOpen = () => setOpen(true)
    const onStep = () => setJourneyTick((n) => n + 1)
    const onStarted = () => {
      setName(getPracticeName())
      setJourneyTick((n) => n + 1)
    }
    window.addEventListener('pa-quiz-complete', onQuiz)
    window.addEventListener('pa-quiz-start', onQuizStart)
    window.addEventListener('pa-quiz-end', onQuizEnd)
    window.addEventListener('pa-practice-open-chat', onOpen)
    window.addEventListener('pa-journey-step', onStep)
    window.addEventListener('pa-practice-started', onStarted)
    return () => {
      window.removeEventListener('pa-quiz-complete', onQuiz)
      window.removeEventListener('pa-quiz-start', onQuizStart)
      window.removeEventListener('pa-quiz-end', onQuizEnd)
      window.removeEventListener('pa-practice-open-chat', onOpen)
      window.removeEventListener('pa-journey-step', onStep)
      window.removeEventListener('pa-practice-started', onStarted)
    }
  }, [])

  if (!active) return null

  function push(role: ChatLine['role'], text: string) {
    setLines((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text }])
  }

  async function onName(e: FormEvent) {
    e.preventDefault()
    const chosen = draftName.trim()
    if (!chosen) return
    setPracticeName(chosen)
    setName(chosen)
    push('user', chosen)
    push('bot', `Thanks, ${chosen}. Leave notes anytime. Then Continue will ask if you sent feedback.`)
  }

  async function onSend(e: FormEvent) {
    e.preventDefault()
    const note = body.trim()
    if (!note) return
    setBusy(true)
    try {
      await submitPracticeFeedback({
        author: name,
        page: pathname + search,
        pageTitle: pageTitleFromPath(pathname),
        body: note,
        kind: quiz ? 'quiz' : 'page',
      })
      markPracticeFeedbackAck(feedbackKey)
      push('user', note)
      push('bot', 'Got it. Saved for Levi in Admin → Practice feedback. You can continue when ready.')
      setBody('')
    } catch (err) {
      push('bot', err instanceof Error ? err.message : 'Could not send that note.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`practice-chat${open ? ' is-open' : ''}`}>
      {!open && (
        <button
          type="button"
          className="practice-chat-tab"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label="Open practice feedback chat"
        >
          <span className="practice-chat-tab-dot" aria-hidden />
          Feedback
        </button>
      )}

      {open && (
        <aside className="practice-chat-panel" role="dialog" aria-label="Practice feedback chat">
          <header className="practice-chat-head">
            <div>
              <strong>Feedback chat</strong>
              <p>Student Practice Mode · {pageTitleFromPath(pathname)}</p>
            </div>
            <button type="button" className="linkish" onClick={() => setOpen(false)}>
              Close
            </button>
          </header>

          <div className="practice-chat-thread">
            {lines.map((line) => (
              <div key={line.id} className={`practice-chat-bubble is-${line.role}`}>
                {line.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="practice-chat-composer">
            {needName ? (
              <form className="stack" onSubmit={onName}>
                <p className="practice-dock-prompt">Who are you reviewing as?</p>
                <div className="practice-name-grid">
                  {PRACTICE_REVIEWERS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`btn btn-secondary on-light${draftName === r ? ' is-picked' : ''}`}
                      onClick={() => setDraftName(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="field">
                  <label htmlFor="practice-other-name">Or type your name</label>
                  <input
                    id="practice-other-name"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="nickname"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={!draftName.trim()}>
                  Start chat
                </button>
              </form>
            ) : blockForQuiz ? (
              <p className="practice-dock-prompt">Finish this quiz first, then send feedback on the whole activity.</p>
            ) : (
              <form className="practice-chat-form" onSubmit={onSend}>
                <label className="sr-only" htmlFor="practice-fb-body">
                  Feedback message
                </label>
                <textarea
                  id="practice-fb-body"
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What felt wrong, missing, or confusing?"
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={busy || !body.trim()}>
                  {busy ? 'Sending…' : 'Send'}
                </button>
              </form>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}

export function PracticeModeBanner() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [name, setName] = useState(() => getPracticeName())
  const [active, setActive] = useState(() => isPracticeMode())

  useEffect(() => {
    const sync = () => {
      setName(getPracticeName())
      setActive(isPracticeMode())
    }
    sync()
    window.addEventListener('pa-practice-started', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-practice-started', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [pathname])

  if (!active) return null
  const onJourney = pathname === '/journey'

  function startOver() {
    restartPracticeFromTop()
    navigate('/journey')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="practice-banner motion-soft-pulse" role="status">
      <span>
        Student Practice Mode{name ? ` · ${name}` : ''}. Registration skipped. Use Back anytime, or Start over to run
        the path from the top.
      </span>
      <span className="practice-banner-actions">
        {onJourney ? (
          <Link className="practice-banner-cta" to="/">
            Review website
          </Link>
        ) : (
          <Link className="practice-banner-cta" to="/journey">
            Continue training
          </Link>
        )}
        <button type="button" className="practice-banner-cta" onClick={startOver}>
          Start over
        </button>
      </span>
    </div>
  )
}
