import { useEffect, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  SEQUENCE_CATALOG,
  clearSequenceProgress,
  completedCount,
  getSequenceProgress,
  getStudentJourneyStep,
  isSequenceComplete,
  subscribeSequenceProgress,
  type SequenceId,
} from './sequenceProgress'

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function ignoreEmptyLink(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
}

/** Site-visible board of every entry sequence + completion state. */
export function SequenceBoard({ compact = false }: { compact?: boolean }) {
  const [, setTick] = useState(0)
  const [studentStep, setStudentStep] = useState(0)

  useEffect(() => subscribeSequenceProgress(() => setTick((t) => t + 1)), [])
  useEffect(() => {
    setStudentStep(getStudentJourneyStep())
    const onStorage = () => setStudentStep(getStudentJourneyStep())
    window.addEventListener('storage', onStorage)
    const id = window.setInterval(() => setStudentStep(getStudentJourneyStep()), 1200)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.clearInterval(id)
    }
  }, [])

  const trackable = SEQUENCE_CATALOG.filter((s) => !s.placeholder)
  const done = completedCount()
  const total = trackable.length
  const records = getSequenceProgress()

  return (
    <section
      className={`sequence-board${compact ? ' is-compact' : ''}`}
      aria-label="Site sequences and completion"
    >
      <div className="sequence-board-head">
        <div>
          <p className="section-kicker">On this site</p>
          <h2>{compact ? 'Your sequences' : 'All sequences. Open and track'}</h2>
          <p className="lede">
            {done} of {total} live paths complete in this browser.
            {studentStep > 0 && studentStep < 20
              ? ` Student path is on step ${studentStep} of 20.`
              : ''}{' '}
            The Purpose Academy Application slot is reserved for later.
          </p>
        </div>
        {done > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (window.confirm('Clear sequence completion marks on this browser?')) {
                clearSequenceProgress()
              }
            }}
          >
            Clear marks
          </button>
        )}
      </div>

      <ul className="sequence-board-list">
        {SEQUENCE_CATALOG.map((item) => {
          const placeholder = !!item.placeholder
          const complete = !placeholder && isSequenceComplete(item.id)
          const record = records.find((r) => r.id === item.id)
          const studentInProgress =
            item.id === 'student' && !complete && studentStep > 0 && studentStep < 20
          return (
            <li
              key={item.id}
              className={`sequence-board-item${complete ? ' is-complete' : ''}${
                studentInProgress ? ' is-progress' : ''
              }${placeholder ? ' is-placeholder' : ''}`}
            >
              <span className="sequence-board-status" aria-hidden>
                {placeholder ? '…' : complete ? '✓' : studentInProgress ? `${studentStep}` : '○'}
              </span>
              <div className="sequence-board-copy">
                <strong>{item.label}</strong>
                <span>{item.help}</span>
                {complete && record && (
                  <em>Completed {formatWhen(record.completedAt)}</em>
                )}
                {studentInProgress && <em>In progress. Step {studentStep} of 20</em>}
                {placeholder && <em>Empty link for now. Destination comes later</em>}
              </div>
              {placeholder ? (
                <a
                  className="btn btn-secondary on-light sequence-board-link is-empty-link"
                  href=""
                  onClick={ignoreEmptyLink}
                  aria-disabled="true"
                  title="Reserved for the future Purpose Academy Application"
                >
                  Reserved
                </a>
              ) : (
                <Link
                  className="btn btn-secondary on-light sequence-board-link"
                  to={item.id === 'student' && studentInProgress ? '/journey' : item.to}
                >
                  {complete ? 'Open again' : studentInProgress ? 'Continue' : 'Open'}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function sequenceTone(id: SequenceId) {
  if (id === 'contact') return 'contact'
  if (id === 'student') return 'student'
  if (id === 'future-app') return 'app'
  if (id.startsWith('admin')) return 'admin'
  return 'instructor'
}
