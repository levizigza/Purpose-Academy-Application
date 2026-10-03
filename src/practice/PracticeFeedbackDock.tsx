import { FormEvent, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  getPracticeName,
  isPracticeMode,
  PRACTICE_REVIEWERS,
  setPracticeName,
} from './PracticeMode'
import { submitPracticeFeedback } from './feedbackStore'

function pageTitleFromPath(pathname: string) {
  if (pathname === '/') return 'Home'
  if (pathname === '/journey') return 'Training path'
  const bit = pathname.split('/').filter(Boolean).pop() || pathname
  return bit.replace(/-/g, ' ')
}

/** Quiz-like paths: collect feedback after the activity, not mid-question. */
function isQuizContext(pathname: string, search: string) {
  if (pathname.includes('/assignments/')) return true
  if (search.includes('quiz=1') || search.includes('phase=quiz')) return true
  return false
}

type Props = {
  /** When true (e.g. after Eye Spy summary), unlock quiz feedback. */
  quizComplete?: boolean
  forceShow?: boolean
}

export function PracticeFeedbackDock({ quizComplete = false, forceShow = false }: Props) {
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(() => getPracticeName())
  const [draftName, setDraftName] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [quizActive, setQuizActive] = useState(false)
  const [quizDone, setQuizDone] = useState(quizComplete)

  const active = forceShow || isPracticeMode() || Boolean(name)
  const quiz = isQuizContext(pathname, search) || quizActive
  const needName = !name
  const blockForQuiz = quiz && !quizDone && !needName

  useEffect(() => {
    setName(getPracticeName())
    setStatus(null)
    setBody('')
    setQuizDone(quizComplete)
    setQuizActive(false)
  }, [pathname, quizComplete])

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
    window.addEventListener('pa-quiz-complete', onQuiz)
    window.addEventListener('pa-quiz-start', onQuizStart)
    window.addEventListener('pa-quiz-end', onQuizEnd)
    return () => {
      window.removeEventListener('pa-quiz-complete', onQuiz)
      window.removeEventListener('pa-quiz-start', onQuizStart)
      window.removeEventListener('pa-quiz-end', onQuizEnd)
    }
  }, [])

  if (!active) return null

  async function onName(e: FormEvent) {
    e.preventDefault()
    const chosen = draftName.trim()
    if (!chosen) return
    setPracticeName(chosen)
    setName(chosen)
  }

  async function onSend(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await submitPracticeFeedback({
        author: name,
        page: pathname + search,
        pageTitle: pageTitleFromPath(pathname),
        body,
        kind: quiz ? 'quiz' : 'page',
      })
      setBody('')
      setStatus('Sent — thank you. Levi can review it in Admin → Practice feedback.')
      setOpen(false)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not send.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`practice-dock${open ? ' is-open' : ''}`}>
      {!open && (
        <button
          type="button"
          className="practice-dock-tab motion-bob"
          onClick={() => setOpen(true)}
          aria-expanded={false}
        >
          Feedback
        </button>
      )}
      {open && (
        <div className="practice-dock-panel site-crate" role="dialog" aria-label="Practice feedback">
          <div className="practice-dock-head">
            <strong>Practice feedback</strong>
            <button type="button" className="linkish" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <p className="muted practice-dock-lede">
            For Chu Chu, Yonas, Kinfe, Saba &amp; Levi — note bugs or ideas on this page.
          </p>

          {needName ? (
            <form className="stack" onSubmit={onName}>
              <p className="practice-dock-prompt">First, who are you?</p>
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
                Continue
              </button>
            </form>
          ) : blockForQuiz ? (
            <p className="practice-dock-prompt">
              Finish this quiz first — then send feedback on the whole activity.
            </p>
          ) : (
            <form className="stack" onSubmit={onSend}>
              <p className="muted" style={{ margin: 0 }}>
                Sending as <strong>{name}</strong> · {pageTitleFromPath(pathname)}
                {quiz ? ' (after quiz)' : ''}
              </p>
              <div className="field">
                <label htmlFor="practice-fb-body">What should we fix or improve?</label>
                <textarea
                  id="practice-fb-body"
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Be specific — page, step, what felt wrong or confusing…"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={busy || !body.trim()}>
                {busy ? 'Sending…' : 'Send feedback'}
              </button>
            </form>
          )}
          {status && <div className="alert ok">{status}</div>}
        </div>
      )}
    </div>
  )
}

export function PracticeModeBanner() {
  const name = getPracticeName()
  if (!isPracticeMode()) return null
  return (
    <div className="practice-banner motion-soft-pulse" role="status">
      Practice mode{name ? ` · ${name}` : ''} — full site preview, no registration. Use Feedback to send notes.
    </div>
  )
}
