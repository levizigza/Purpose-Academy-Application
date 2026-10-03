import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  isSequenceComplete,
  subscribeSequenceProgress,
  type SequenceId,
} from './sequenceProgress'
import { playFoley, unlockFoley } from '../audio/foley'

type Entry = {
  label: string
  help: string
  tone: string
  tool: 'screwdriver' | 'hammer' | 'tape' | 'level' | 'latch'
  completeIds: SequenceId[]
} & ({ to: string; placeholder?: false } | { to?: undefined; placeholder: true })

const ENTRIES: Entry[] = [
  {
    to: '/contact',
    label: 'Contact Us',
    help: 'Ask a question',
    tone: 'contact',
    tool: 'screwdriver',
    completeIds: ['contact'],
  },
  {
    to: '/enter/student',
    label: 'Student',
    help: 'Start learning',
    tone: 'student',
    tool: 'hammer',
    completeIds: ['student'],
  },
  {
    to: '/enter/admin',
    label: 'Admin',
    help: 'Manage the school',
    tone: 'admin',
    tool: 'tape',
    completeIds: ['admin-contact', 'admin-guest'],
  },
  {
    to: '/enter/instructor',
    label: 'Instructor',
    help: 'Teach and check skills',
    tone: 'instructor',
    tool: 'level',
    completeIds: ['instructor'],
  },
  {
    placeholder: true,
    label: 'Purpose Academy Application',
    help: 'Coming soon — reserved',
    tone: 'app',
    tool: 'latch',
    completeIds: [],
  },
]

function ToolEtch({ kind }: { kind: Entry['tool'] }) {
  const common = {
    viewBox: '0 0 48 48',
    className: 'toolbox-tool-svg',
    'aria-hidden': true as const,
  }
  if (kind === 'screwdriver') {
    return (
      <svg {...common}>
        <path d="M22 6h4l2 14h-8l2-14z" fill="currentColor" opacity="0.9" />
        <rect x="20" y="20" width="8" height="18" rx="1.5" fill="currentColor" />
        <path d="M22 38h4l1 6h-6l1-6z" fill="currentColor" opacity="0.75" />
      </svg>
    )
  }
  if (kind === 'hammer') {
    return (
      <svg {...common}>
        <rect x="21" y="14" width="6" height="28" rx="2" fill="currentColor" />
        <path d="M12 12h24v8H12z" fill="currentColor" />
        <path d="M10 10h6v12h-6z" fill="currentColor" opacity="0.85" />
        <path d="M32 8l8 4-2 8-8-3z" fill="currentColor" opacity="0.85" />
      </svg>
    )
  }
  if (kind === 'tape') {
    return (
      <svg {...common}>
        <rect x="10" y="14" width="20" height="22" rx="5" fill="currentColor" />
        <circle cx="20" cy="25" r="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <rect x="28" y="22" width="14" height="6" rx="1" fill="currentColor" opacity="0.8" />
      </svg>
    )
  }
  if (kind === 'level') {
    return (
      <svg {...common}>
        <rect x="6" y="20" width="36" height="10" rx="2" fill="currentColor" />
        <rect x="12" y="22" width="8" height="6" rx="1" fill="#0b2f5c" opacity="0.55" />
        <rect x="28" y="22" width="8" height="6" rx="1" fill="#0b2f5c" opacity="0.55" />
        <circle cx="16" cy="25" r="1.6" fill="#f5c542" />
        <circle cx="32" cy="25" r="1.6" fill="#f5c542" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="12" y="18" width="24" height="18" rx="2" fill="currentColor" />
      <path d="M18 18v-4a6 6 0 0 1 12 0v4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="28" r="2.2" fill="#0b2f5c" opacity="0.55" />
    </svg>
  )
}

function ignoreEmptyLink(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
}

/** Metal toolbox entry panel — each path etched as a tool in the tray. */
export function EnterBox() {
  const [, setTick] = useState(0)
  useEffect(() => subscribeSequenceProgress(() => setTick((t) => t + 1)), [])

  return (
    <aside className="toolbox" aria-label="Purpose Academy toolbox — choose your path">
      <div className="toolbox-handle" aria-hidden>
        <span className="toolbox-handle-bar" />
      </div>
      <div className="toolbox-lid">
        <p className="toolbox-kicker">Choose how to enter</p>
        <h2 className="toolbox-title">Start here</h2>
        <p className="toolbox-lede">Pick Student to begin learning. Other doors are for staff.</p>
      </div>
      <nav className="toolbox-tray" aria-label="Site entry">
        {ENTRIES.map((item, i) => {
          const done =
            item.completeIds.length > 0 &&
            item.completeIds.every((id) => isSequenceComplete(id))
          const partial =
            !done && item.completeIds.some((id) => isSequenceComplete(id))
          const className = `toolbox-slot toolbox-slot-${item.tone}${
            done ? ' is-complete' : partial ? ' is-partial' : ''
          }${item.placeholder ? ' is-placeholder' : ''}`
          const style = { animationDelay: `${0.14 + i * 0.07}s` }
          const help = item.placeholder
            ? item.help
            : done
              ? 'Done — open again'
              : partial
                ? 'Partly done — continue'
                : item.help
          const inner: ReactNode = (
            <>
              <span className="toolbox-etch" aria-hidden>
                <ToolEtch kind={item.tool} />
                {done && <span className="toolbox-check">✓</span>}
              </span>
              <span className="toolbox-text">
                <strong>{item.label}</strong>
                <span>{help}</span>
              </span>
              <span className="toolbox-pull" aria-hidden>
                {item.placeholder ? '·' : '→'}
              </span>
            </>
          )

          function onOpen() {
            void unlockFoley().then(() => playFoley(item.tool === 'latch' ? 'latch' : 'wood'))
          }

          if (item.placeholder) {
            return (
              <a
                key={item.label}
                className={className}
                href=""
                onClick={ignoreEmptyLink}
                aria-disabled="true"
                title="Coming soon"
                style={style}
              >
                {inner}
              </a>
            )
          }

          return (
            <Link
              key={item.to}
              className={className}
              to={item.to}
              style={style}
              onClick={onOpen}
            >
              {inner}
            </Link>
          )
        })}
      </nav>
      <Link className="toolbox-foot" to="/sequences">
        See all paths on this site →
      </Link>
    </aside>
  )
}
