import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  isSequenceComplete,
  subscribeSequenceProgress,
  type SequenceId,
} from './sequenceProgress'
import { playFoley, unlockFoley } from '../audio/foley'
import {
  getPracticeName,
  PRACTICE_REVIEWERS,
  startPracticeMode,
} from '../practice/PracticeMode'
import { setShellMode, type ShellMode } from '../shell/shellMode'

type ToolKind = 'phone' | 'desktop' | 'wrench' | 'tape' | 'level'

type Entry = {
  label: string
  help: string
  tone: string
  tool: ToolKind
  completeIds: SequenceId[]
  shell: ShellMode
  practice?: boolean
}

const ENTRIES: Entry[] = [
  {
    label: 'Phone App',
    help: 'iPhone learner experience',
    tone: 'phone',
    tool: 'phone',
    completeIds: ['student'],
    shell: 'phone',
    practice: true,
  },
  {
    label: 'Desktop Course',
    help: 'Full course on the web',
    tone: 'course',
    tool: 'desktop',
    completeIds: ['student'],
    shell: 'course',
    practice: true,
  },
  {
    label: 'Instructor',
    help: 'Teach and check skills',
    tone: 'instructor',
    tool: 'level',
    completeIds: ['instructor'],
    shell: 'course',
  },
  {
    label: 'Admin',
    help: 'Manage the school',
    tone: 'admin',
    tool: 'tape',
    completeIds: ['admin-contact', 'admin-guest'],
    shell: 'course',
  },
]

function ToolEtch({ kind }: { kind: ToolKind }) {
  const common = {
    viewBox: '0 0 48 48',
    className: 'toolbox-tool-svg',
    'aria-hidden': true as const,
  }
  if (kind === 'phone') {
    return (
      <svg {...common}>
        <rect x="14" y="6" width="20" height="36" rx="4" fill="currentColor" />
        <rect x="17" y="10" width="14" height="24" rx="1.5" fill="#0b2f5c" opacity="0.45" />
        <circle cx="24" cy="38" r="1.8" fill="#0b2f5c" opacity="0.55" />
      </svg>
    )
  }
  if (kind === 'desktop') {
    return (
      <svg {...common}>
        <rect x="6" y="8" width="36" height="24" rx="2" fill="currentColor" />
        <rect x="9" y="11" width="30" height="18" rx="1" fill="#0b2f5c" opacity="0.4" />
        <rect x="18" y="34" width="12" height="3" rx="1" fill="currentColor" />
        <rect x="12" y="38" width="24" height="3" rx="1" fill="currentColor" opacity="0.85" />
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
      <path
        fill="currentColor"
        d="M34 8c-4 0-7 2.4-8.2 5.8L14 25.6l-3.2-3.2-3.6 3.6 8.8 8.8 3.6-3.6-3-3L29 16.4c3.2.2 6.2-1.6 7.6-4.6L32 14l-2-2 4.2-4z"
      />
      <rect
        x="10"
        y="30"
        width="8"
        height="12"
        rx="1.5"
        transform="rotate(-35 14 36)"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  )
}

function PracticeNameGate({
  onCancel,
  onReady,
  title,
}: {
  onCancel: () => void
  onReady: (name: string) => void
  title: string
}) {
  const [name, setName] = useState(() => getPracticeName() || 'Showcase')
  return (
    <div className="practice-gate" role="dialog" aria-modal="true" aria-label={`${title} name`}>
      <div className="practice-gate-card site-crate">
        <p className="section-kicker">{title}</p>
        <h2>Who is exploring?</h2>
        <p className="lede">
          Walk the learner path without registration — perfect for demos and reviews. Pick a name so
          feedback stays attached to you.
        </p>
        <div className="practice-name-grid">
          {['Showcase', ...PRACTICE_REVIEWERS].map((r) => (
            <button
              key={r}
              type="button"
              className={`btn btn-secondary on-light${name === r ? ' is-picked' : ''}`}
              onClick={() => setName(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="field">
          <label htmlFor="practice-gate-name">Name</label>
          <input
            id="practice-gate-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="nickname"
          />
        </div>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!name.trim()}
            onClick={() => onReady(name.trim())}
          >
            Enter {title}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/** Metal toolbox entry panel — trays pull out, then fly into Phone or Desktop Course. */
export function EnterBox() {
  const navigate = useNavigate()
  const boxRef = useRef<HTMLElement>(null)
  const [, setTick] = useState(0)
  const [openTray, setOpenTray] = useState<string | null>(null)
  const [flying, setFlying] = useState(false)
  const [flyLabel, setFlyLabel] = useState('')
  const [pendingShell, setPendingShell] = useState<ShellMode | null>(null)
  const [gateTitle, setGateTitle] = useState('Phone App')

  useEffect(() => subscribeSequenceProgress(() => setTick((t) => t + 1)), [])

  function destinationFor(item: Entry) {
    if (item.label === 'Instructor') return '/enter/instructor'
    if (item.label === 'Admin') return '/enter/admin'
    return '/journey'
  }

  function launchTo(to: string, label: string, shell: ShellMode | null) {
    if (flying) return
    if (shell) setShellMode(shell)
    void unlockFoley().then(() => {
      playFoley('latch')
      window.setTimeout(() => playFoley('whoosh'), 180)
      window.setTimeout(() => playFoley('wood'), 420)
    })
    setFlyLabel(label)
    setFlying(true)
    document.documentElement.classList.add('pa-page-wipe')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delay = reduce ? 100 : 920
    window.setTimeout(() => {
      navigate(to)
      window.setTimeout(() => {
        document.documentElement.classList.remove('pa-page-wipe')
        setFlying(false)
        setOpenTray(null)
      }, 420)
    }, delay)
  }

  function beginLearner(name: string) {
    if (!pendingShell) return
    const shell = pendingShell
    const label = shell === 'phone' ? 'Phone App' : 'Desktop Course'
    startPracticeMode(name)
    setPendingShell(null)
    setOpenTray(label)
    void unlockFoley().then(() => {
      playFoley('latch')
      playFoley('metal')
    })
    window.setTimeout(() => launchTo('/journey', label, shell), 380)
  }

  return (
    <>
      <aside
        ref={boxRef}
        className={`toolbox${flying ? ' is-flying' : ''}`}
        aria-label="Purpose Academy tool chest. choose Phone App or Desktop Course"
      >
        <div className="toolbox-rim" aria-hidden />
        <div className="toolbox-handle" aria-hidden>
          <span className="toolbox-handle-cap left" />
          <span className="toolbox-handle-bar" />
          <span className="toolbox-handle-cap right" />
        </div>
        <div className="toolbox-lid">
          <div className="toolbox-badge" aria-hidden>
            PA
          </div>
          <p className="toolbox-kicker">Tool chest</p>
          <h2 className="toolbox-title">Open a tray</h2>
          <p className="toolbox-lede">Phone app or desktop course — pull a tray and step in.</p>
          <div className="toolbox-latches" aria-hidden>
            <span />
            <span />
          </div>
        </div>

        <div className="toolbox-body">
          <div className="toolbox-rivets" aria-hidden>
            <span />
            <span />
            <span />
            <span />
          </div>
          <nav className="toolbox-tray" aria-label="Workshop entry">
            {ENTRIES.map((item, i) => {
              const done =
                item.completeIds.length > 0 &&
                item.completeIds.every((id) => isSequenceComplete(id))
              const partial =
                !done && item.completeIds.some((id) => isSequenceComplete(id))
              const isOpen = openTray === item.label
              const className = `toolbox-slot toolbox-slot-${item.tone}${
                done ? ' is-complete' : partial ? ' is-partial' : ''
              }${isOpen ? ' is-open' : ''}${item.practice ? ' is-practice' : ''}`
              const style = { animationDelay: `${0.14 + i * 0.07}s` }
              const help = done ? 'Done. Open again' : partial ? 'Partly done. Continue' : item.help
              const inner: ReactNode = (
                <>
                  {item.practice && (
                    <span className="practice-point" aria-hidden>
                      <span className="practice-point-arrow">➜</span>
                      <span className="practice-point-label">Learners</span>
                    </span>
                  )}
                  <span className="toolbox-etch" aria-hidden>
                    <ToolEtch kind={item.tool} />
                    {done && <span className="toolbox-check">✓</span>}
                  </span>
                  <span className="toolbox-text">
                    <strong>{item.label}</strong>
                    <span>{help}</span>
                  </span>
                  <span className="toolbox-pull" aria-hidden>
                    {isOpen ? '↗' : '⟶'}
                  </span>
                </>
              )

              return (
                <button
                  key={item.label}
                  type="button"
                  className={className}
                  style={style}
                  onClick={() => {
                    if (item.practice) {
                      void unlockFoley().then(() => playFoley('metal'))
                      setGateTitle(item.label)
                      setPendingShell(item.shell)
                      return
                    }
                    setOpenTray(item.label)
                    void unlockFoley().then(() => {
                      playFoley('latch')
                      playFoley('wood')
                    })
                    window.setTimeout(() => {
                      launchTo(destinationFor(item), item.label, null)
                    }, 380)
                  }}
                >
                  {inner}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="toolbox-feet" aria-hidden>
          <span />
          <span />
        </div>
      </aside>

      {pendingShell && (
        <PracticeNameGate
          title={gateTitle}
          onCancel={() => setPendingShell(null)}
          onReady={beginLearner}
        />
      )}

      {flying && (
        <div className="toolbox-flyout" role="status" aria-live="polite">
          <div className="toolbox-flyout-chest">
            <div className="toolbox-flyout-lid">
              <p className="toolbox-kicker">Tool chest</p>
              <h2 className="toolbox-title">{flyLabel}</h2>
              <p className="toolbox-lede">Tray opening. Stepping onto the path…</p>
            </div>
            <div className="toolbox-flyout-tray" />
          </div>
        </div>
      )}

    </>
  )
}
