import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { FoleyToggle } from '../components/CrewLoading'
import { SplashPage } from '../auth/EntryPages'
import { restartPracticeFromTop } from '../practice/PracticeMode'
import {
  getSavedPhoneDeviceId,
  PHONE_DEVICES,
  resolvePhoneDevice,
  savePhoneDeviceId,
  type PhoneDevice,
} from './phoneDevices'
import { PhoneHomeScreen } from './PhoneHomeScreen'
import {
  clearShellMode,
  getPhonePhase,
  setPhonePhase,
  subscribePhonePhase,
  type PhonePhase,
} from './shellMode'

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function usePhoneScale(device: PhoneDevice) {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const fit = () => {
      const padX = 56
      const padY = 200
      const availW = Math.max(260, window.innerWidth - padX)
      const availH = Math.max(360, window.innerHeight - padY)
      const next = Math.min(1.05, availW / device.width, availH / device.height)
      setScale(Math.max(0.42, next))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [device.width, device.height])
  return scale
}

function useLivePhonePhase(): PhonePhase {
  const [phase, setPhase] = useState(() => getPhonePhase())
  useEffect(() => subscribePhonePhase(() => setPhase(getPhonePhase())), [])
  return phase
}

/**
 * Live phone presentation shell.
 * Phases: home (PA icon) → splash → toolbox → app (Practice / enter routes).
 *
 * Layout uses `.is-phone-app` + container queries so content follows device width,
 * not the outer desktop viewport.
 */
export function PhoneEmulatorShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [deviceId, setDeviceId] = useState(() => getSavedPhoneDeviceId())
  const device = useMemo(() => resolvePhoneDevice(deviceId), [deviceId])
  const scale = usePhoneScale(device)
  const time = useClock()
  const phase = useLivePhonePhase()

  useEffect(() => {
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
  }, [deviceId, phase])

  function exitToModes() {
    /* Keep learner history — Desktop and Phone share one progress store. */
    clearShellMode()
    navigate('/', { replace: true })
  }

  function backInsidePhone() {
    if (phase === 'app') {
      setPhonePhase('toolbox')
      navigate('/', { replace: true })
      return
    }
    if (phase === 'toolbox') {
      setPhonePhase('splash')
      return
    }
    if (phase === 'splash') {
      setPhonePhase('home')
      return
    }
    exitToModes()
  }

  function pickDevice(id: string) {
    savePhoneDeviceId(id)
    setDeviceId(id)
  }

  const frameStyle = {
    '--phone-w': `${device.width}px`,
    '--phone-h': `${device.height}px`,
    '--phone-radius': `${device.radius}px`,
    '--phone-inset': `${device.inset}px`,
    '--phone-screen-radius': `${Math.max(28, device.radius - device.inset)}px`,
  } as CSSProperties

  const backLabel =
    phase === 'app' ? '← Toolbox' : phase === 'home' ? '← Modes' : phase === 'splash' ? '← Home' : '← Opening'

  const phaseLabel =
    phase === 'home'
      ? 'Home screen'
      : phase === 'splash'
        ? 'Opening animation'
        : phase === 'toolbox'
          ? 'Toolbox'
          : 'Learner app'

  return (
    <div className="phone-stage">
      <header className="phone-stage-bar">
        <button type="button" className="phone-stage-back" onClick={backInsidePhone}>
          {backLabel}
        </button>
        <div className="phone-stage-meta">
          <strong>{device.label}</strong>
          <span>
            Purpose Academy · {phaseLabel} · {device.width}×{device.height}
          </span>
        </div>
        <div className="phone-stage-actions">
          <FoleyToggle />
          {phase === 'app' && (
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
          )}
          <button type="button" className="phone-stage-link" onClick={exitToModes}>
            Exit phone
          </button>
        </div>
      </header>

      <div className="phone-device-picker" role="group" aria-label="Phone size">
        {PHONE_DEVICES.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`phone-device-chip${d.id === deviceId ? ' is-active' : ''}`}
            onClick={() => pickDevice(d.id)}
            title={`${d.label} · ${d.width}×${d.height}`}
          >
            {d.short}
          </button>
        ))}
      </div>

      <div className="phone-stage-floor" aria-hidden />

      <div className="phone-scale-wrap" style={{ width: device.width * scale, height: device.height * scale }}>
        <div
          className={`iphone finish-${device.finish} island-${device.island}`}
          style={{
            ...frameStyle,
            width: device.width,
            height: device.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          role="region"
          aria-label={`${device.label} emulator running Purpose Academy`}
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
                {device.island === 'dynamic' && (
                  <span className="iphone-island">
                    <span className="iphone-island-cam" />
                  </span>
                )}
                {device.island === 'notch' && <span className="iphone-notch" />}
                {device.island === 'none' && <span className="iphone-island-spacer" />}
                <span className="iphone-status-glyphs">
                  <span className="iphone-signal" />
                  <span className="iphone-wifi" />
                  <span className="iphone-battery" />
                </span>
              </div>

              <div
                className={`iphone-scroll shell is-train is-phone-app phone-phase-${phase}`}
                ref={scrollRef}
                data-phone-device={device.id}
                data-phone-phase={phase}
              >
                {phase === 'home' && <PhoneHomeScreen />}
                {phase === 'splash' && (
                  <SplashPage
                    embedded
                    onEnter={() => {
                      setPhonePhase('toolbox')
                      navigate('/', { replace: true })
                    }}
                  />
                )}
                {(phase === 'toolbox' || phase === 'app') && children}
              </div>

              <div className="iphone-home-bar" aria-hidden>
                <span />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="phone-stage-hint">
        {phase === 'home'
          ? 'Tap the Purpose Academy icon on the home screen to launch the app.'
          : phase === 'splash'
            ? 'Watch the opening on the phone, then strike Enter to open the toolbox.'
            : phase === 'toolbox'
              ? 'Open a tray — Practice, Student, Instructor, or Admin — inside the device.'
              : 'Live learner path inside the device. Pick a phone size above, then scroll and tap.'}
      </p>
    </div>
  )
}
