import { BRAND } from '../brand/copy'
import { playFoley, unlockFoley } from '../audio/foley'
import { PaAppIcon } from './PaAppIcon'
import { setPhonePhase } from './shellMode'

function useClock() {
  const now = new Date()
  return {
    time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    date: now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),
  }
}

/**
 * Home screen for demos — one app, showcased like iOS:
 * ~60pt icon, optical center, air around it (not a left-parked grid cell).
 */
export function PhoneHomeScreen() {
  const { time, date } = useClock()

  function openApp() {
    void unlockFoley().then(() => {
      playFoley('latch')
      window.setTimeout(() => playFoley('whoosh'), 140)
    })
    setPhonePhase('splash')
  }

  return (
    <div className="phone-home" role="main" aria-label={`${BRAND.name} phone home screen`}>
      <div className="phone-home-wallpaper" aria-hidden />

      <header className="phone-home-clock">
        <p className="phone-home-time">{time}</p>
        <p className="phone-home-date">{date}</p>
      </header>

      <div className="phone-home-stage">
        <button
          type="button"
          className="phone-home-app"
          onClick={openApp}
          aria-label={`Open ${BRAND.name}`}
        >
          <PaAppIcon className="phone-home-icon" />
          <span className="phone-home-label">{BRAND.name}</span>
        </button>
        <p className="phone-home-hint">Tap to open</p>
      </div>

      <div className="phone-home-dock" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
