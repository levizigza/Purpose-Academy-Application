import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { FoleyToggle } from '../components/CrewLoading'
import { restartPracticeFromTop } from '../practice/PracticeMode'
import { clearShellMode } from './shellMode'

/** Logical iPhone 15 Pro points — scaled to fit the stage. */
const PHONE_W = 393
const PHONE_H = 852

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function usePhoneScale(wrapRef: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const fit = () => {
      const padX = 48
      const padY = 120
      const availW = Math.max(280, window.innerWidth - padX)
      const availH = Math.max(400, window.innerHeight - padY)
      const next = Math.min(1.12, availW / PHONE_W, availH / PHONE_H)
      setScale(Math.max(0.55, next))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(document.documentElement)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [wrapRef])
  return scale
}

/**
 * Presentation bezel: a faithful iPhone 15 Pro frame around the live learner app.
 * Content is the real `/journey` tree — not a mock — so demos stay functional.
 */
export function PhoneEmulatorShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const wrapRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scale = usePhoneScale(wrapRef)
  const time = useClock()

  useEffect(() => {
    /* Keep scroll inside the device, not the outer page. */
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.classList.add('pa-phone-shell')
    return () => {
      document.body.style.overflow = prev
      document.documentElement.classList.remove('pa-phone-shell')
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [])

  function exitToToolbox() {
    clearShellMode()
    navigate('/')
  }

  return (
    <div className="phone-stage">
      <header className="phone-stage-bar">
        <button type="button" className="phone-stage-back" onClick={exitToToolbox}>
          ← Toolbox
        </button>
        <div className="phone-stage-meta">
          <strong>iPhone 15 Pro</strong>
          <span>Purpose Academy · Learner app</span>
        </div>
        <div className="phone-stage-actions">
          <FoleyToggle />
          <button
            type="button"
            className="phone-stage-link"
            onClick={() => {
              restartPracticeFromTop()
              scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            Restart path
          </button>
        </div>
      </header>

      <div className="phone-stage-floor" aria-hidden />

      <div
        className="phone-scale-wrap"
        ref={wrapRef}
        style={{ width: PHONE_W * scale, height: PHONE_H * scale }}
      >
        <div
          className="iphone"
          style={{
            width: PHONE_W,
            height: PHONE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          role="img"
          aria-label="iPhone emulator running Purpose Academy"
        >
          <div className="iphone-titanium" aria-hidden>
            <span className="iphone-btn iphone-btn-silent" />
            <span className="iphone-btn iphone-btn-vol-up" />
            <span className="iphone-btn iphone-btn-vol-down" />
            <span className="iphone-btn iphone-btn-power" />
          </div>

          <div className="iphone-bezel">
            <div className="iphone-screen">
              <div className="iphone-status" aria-hidden>
                <span className="iphone-status-time">{time}</span>
                <span className="iphone-island">
                  <span className="iphone-island-cam" />
                </span>
                <span className="iphone-status-glyphs">
                  <span className="iphone-signal" />
                  <span className="iphone-wifi" />
                  <span className="iphone-battery" />
                </span>
              </div>

              <div className="iphone-scroll shell is-train is-phone-app" ref={scrollRef}>
                {children}
              </div>

              <div className="iphone-home-bar" aria-hidden>
                <span />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="phone-stage-hint">
        Live learner path inside the device. Scroll and tap as you would on a phone.
      </p>
    </div>
  )
}
