import { useNavigate } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { clearEnteredSite } from '../auth/EntryPages'
import { playFoley, unlockFoley } from '../audio/foley'
import { PaAppIcon } from './PaAppIcon'
import {
  markEntryChosenThisSession,
  setDesktopPhase,
  setPhonePhase,
  setShellMode,
  type ShellMode,
} from './shellMode'
import { NavCueTarget, NavGlowWrap } from '../practice/NavCue'
import { markNavCueSeen, NAV_CUE } from '../practice/navCues'

/**
 * First screen after load — Desktop | Phone.
 * Desktop arms phase `opening` so App plays the threshold sequence next.
 * Phone goes to home; opening plays inside the device after the PA icon.
 */
export function ModeChooser() {
  const navigate = useNavigate()

  function pick(mode: ShellMode) {
    markEntryChosenThisSession()
    markNavCueSeen(mode === 'phone' ? NAV_CUE.modePhone : NAV_CUE.modeDesktop)
    markNavCueSeen(mode === 'phone' ? NAV_CUE.modeDesktop : NAV_CUE.modePhone)
    void unlockFoley().then(() => {
      playFoley('latch')
      window.setTimeout(() => playFoley('whoosh'), 160)
    })
    navigate('/', { replace: true })
    if (mode === 'phone') {
      clearEnteredSite()
      setDesktopPhase(null)
      setPhonePhase('home')
      setShellMode('phone')
      return
    }
    /* Arm opening before shell mode so the first course render shows splash. */
    clearEnteredSite()
    setDesktopPhase('opening')
    setShellMode('course')
  }

  return (
    <section className="mode-chooser" aria-label={`${BRAND.name} — choose Desktop or Phone`}>
      <div className="mode-chooser-glow" aria-hidden />
      <header className="mode-chooser-brand">
        <img src={BRAND_ASSETS.logoFull} alt={BRAND.name} className="mode-chooser-logo" />
        <p className="mode-chooser-kicker">Start here</p>
        <h1 className="mode-chooser-title">Where will you practice?</h1>
        <p className="mode-chooser-lede">
          Pick a big screen or a phone. Your work stays saved if you switch.
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
                <strong>Desktop</strong>
                <span>A large screen. Good for class.</span>
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
                <strong>Phone</strong>
                <span>A phone screen you can hold.</span>
              </span>
              <span className="mode-door-cta">Enter phone</span>
            </button>
          </NavGlowWrap>
        </NavCueTarget>
      </div>
    </section>
  )
}
