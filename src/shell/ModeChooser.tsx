import { useNavigate } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { clearEnteredSite } from '../auth/EntryPages'
import { playFoley, unlockFoley } from '../audio/foley'
import { PaAppIcon } from './PaAppIcon'
import { setPhonePhase, setShellMode, type ShellMode } from './shellMode'
import { NavCueTarget, NavGlowWrap } from '../practice/NavCue'
import { markNavCueSeen, NAV_CUE } from '../practice/navCues'

/**
 * First screen after load — split Desktop | Phone.
 * Craft L3/L4: one composition, two doors, brand hero-level.
 */
export function ModeChooser() {
  const navigate = useNavigate()

  function pick(mode: ShellMode) {
    markNavCueSeen(mode === 'phone' ? NAV_CUE.modePhone : NAV_CUE.modeDesktop)
    markNavCueSeen(mode === 'phone' ? NAV_CUE.modeDesktop : NAV_CUE.modePhone)
    void unlockFoley().then(() => {
      playFoley('latch')
      window.setTimeout(() => playFoley('whoosh'), 160)
    })
    navigate('/', { replace: true })
    if (mode === 'phone') {
      clearEnteredSite()
      setPhonePhase('home')
      setShellMode('phone')
      return
    }
    clearEnteredSite()
    setShellMode('course')
  }

  return (
    <section className="mode-chooser" aria-label={`${BRAND.name} — choose Desktop or Phone`}>
      <div className="mode-chooser-glow" aria-hidden />
      <header className="mode-chooser-brand">
        <img src={BRAND_ASSETS.logoFull} alt={BRAND.name} className="mode-chooser-logo" />
        <p className="mode-chooser-kicker">Learner workshop</p>
        <h1 className="mode-chooser-title">How do you want to train?</h1>
        <p className="mode-chooser-lede">
          Desktop for the full web course. Phone for a live app demo inside a real device frame.
          Your practice history stays with you when you switch — same progress on both.
        </p>
      </header>

      <div className="mode-chooser-split">
        <NavCueTarget cueId={NAV_CUE.modeDesktop} arrowLabel="Pick a door" arrowSide="above">
          <NavGlowWrap cueId={NAV_CUE.modeDesktop} dismissOnClick={false}>
            <button type="button" className="mode-door mode-door-desktop" onClick={() => pick('course')}>
              <span className="mode-door-visual" aria-hidden>
                <span className="mode-door-monitor">
                  <span className="mode-door-monitor-screen" />
                  <span className="mode-door-monitor-stand" />
                  <span className="mode-door-monitor-base" />
                </span>
              </span>
              <span className="mode-door-copy">
                <strong>Desktop mode</strong>
                <span>Opening animation, then the toolbox — Student Practice, Student, Instructor, Admin.</span>
              </span>
              <span className="mode-door-cta">Enter desktop</span>
            </button>
          </NavGlowWrap>
        </NavCueTarget>

        <NavCueTarget cueId={NAV_CUE.modePhone} arrowLabel="Or here" arrowSide="above">
          <NavGlowWrap cueId={NAV_CUE.modePhone} dismissOnClick={false}>
            <button type="button" className="mode-door mode-door-phone" onClick={() => pick('phone')}>
              <span className="mode-door-visual" aria-hidden>
                <span className="mode-door-handset">
                  <span className="mode-door-handset-screen">
                    <PaAppIcon />
                  </span>
                </span>
              </span>
              <span className="mode-door-copy">
                <strong>Phone mode</strong>
                <span>Tap the Purpose Academy icon, watch the opening, then open the toolbox on the phone.</span>
              </span>
              <span className="mode-door-cta">Enter phone</span>
            </button>
          </NavGlowWrap>
        </NavCueTarget>
      </div>
    </section>
  )
}
