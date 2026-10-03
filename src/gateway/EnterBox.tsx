import { useEffect, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  isSequenceComplete,
  subscribeSequenceProgress,
  type SequenceId,
} from './sequenceProgress'

type Entry = {
  label: string
  help: string
  mark: string
  tone: string
  completeIds: SequenceId[]
} & ({ to: string; placeholder?: false } | { to?: undefined; placeholder: true })

const ENTRIES: Entry[] = [
  {
    to: '/contact',
    label: 'Contact Us',
    help: 'Ask a question',
    mark: '1',
    tone: 'contact',
    completeIds: ['contact'],
  },
  {
    to: '/enter/student',
    label: 'Student',
    help: 'Start learning',
    mark: '2',
    tone: 'student',
    completeIds: ['student'],
  },
  {
    to: '/enter/admin',
    label: 'Admin',
    help: 'Manage the school',
    mark: '3',
    tone: 'admin',
    completeIds: ['admin-contact', 'admin-guest'],
  },
  {
    to: '/enter/instructor',
    label: 'Instructor',
    help: 'Teach and check skills',
    mark: '4',
    tone: 'instructor',
    completeIds: ['instructor'],
  },
  {
    placeholder: true,
    label: 'Purpose Academy Application',
    help: 'Coming soon — link reserved',
    mark: '5',
    tone: 'app',
    completeIds: [],
  },
]

function ignoreEmptyLink(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
}

/** Clickable entry panel beside the brand theme — one clear door per role. */
export function EnterBox() {
  const [, setTick] = useState(0)
  useEffect(() => subscribeSequenceProgress(() => setTick((t) => t + 1)), [])

  return (
    <aside className="enter-box" aria-label="Enter Purpose Academy">
      <p className="enter-box-kicker">Enter here</p>
      <h2 className="enter-box-title">Choose your door</h2>
      <p className="enter-box-lede">Tap one. We will guide you.</p>
      <nav className="enter-box-nav" aria-label="Site entry">
        {ENTRIES.map((item, i) => {
          const done =
            item.completeIds.length > 0 &&
            item.completeIds.every((id) => isSequenceComplete(id))
          const partial =
            !done && item.completeIds.some((id) => isSequenceComplete(id))
          const className = `enter-box-link enter-box-link-${item.tone}${
            done ? ' is-complete' : partial ? ' is-partial' : ''
          }${item.placeholder ? ' is-placeholder' : ''}`
          const style = { animationDelay: `${0.12 + i * 0.08}s` }
          const inner = (
            <>
              <span className="enter-box-icon" aria-hidden>
                {done ? '✓' : item.mark}
              </span>
              <span className="enter-box-text">
                <strong>{item.label}</strong>
                <span>
                  {item.placeholder
                    ? item.help
                    : done
                      ? 'Completed — open again'
                      : partial
                        ? 'Partly done — continue'
                        : item.help}
                </span>
              </span>
              <span className="enter-box-arrow" aria-hidden>
                {item.placeholder ? '—' : '→'}
              </span>
            </>
          )

          if (item.placeholder) {
            return (
              <a
                key={item.label}
                className={className}
                href=""
                onClick={ignoreEmptyLink}
                aria-disabled="true"
                title="Reserved for the future Purpose Academy Application"
                style={style}
              >
                {inner}
              </a>
            )
          }

          return (
            <Link key={item.to} className={className} to={item.to} style={style}>
              {inner}
            </Link>
          )
        })}
      </nav>
      <Link className="enter-box-all" to="/sequences">
        See all sequences on this site →
      </Link>
    </aside>
  )
}
