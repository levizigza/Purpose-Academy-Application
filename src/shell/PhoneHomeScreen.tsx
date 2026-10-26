import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { playFoley, unlockFoley } from '../audio/foley'
import { setPhonePhase } from './shellMode'

function useClock() {
  const now = new Date()
  return {
    time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    date: now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),
  }
}

/** iOS-style home screen with the Purpose Academy app icon. */
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
      <div className="phone-home-clock">
        <p className="phone-home-time">{time}</p>
        <p className="phone-home-date">{date}</p>
      </div>

      <div className="phone-home-grid">
        <button type="button" className="phone-home-app" onClick={openApp} aria-label={`Open ${BRAND.name}`}>
          <span className="phone-home-icon">
            <img src={BRAND_ASSETS.logoPOpen} alt="" />
          </span>
          <span className="phone-home-label">{BRAND.name}</span>
        </button>
      </div>

      <p className="phone-home-hint">Tap the Purpose Academy icon to open the app</p>

      <div className="phone-home-dock" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
