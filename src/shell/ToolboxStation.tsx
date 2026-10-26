import { useEffect } from 'react'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { EnterBox } from '../gateway/EnterBox'
import { SitePaMark } from '../components/SitePaMark'
import { clearShellMode } from './shellMode'

/**
 * Post-splash gateway. Marketing site lives elsewhere —
 * this station only launches the Phone App or Desktop Course.
 */
export function ToolboxStation() {
  useEffect(() => {
    clearShellMode()
  }, [])

  return (
    <section className="toolbox-station" aria-label={`${BRAND.name} toolbox`}>
      <div className="toolbox-station-glow" aria-hidden />
      <div className="toolbox-station-pa" aria-hidden>
        <SitePaMark className="toolbox-station-mark" />
      </div>

      <div className="toolbox-station-inner">
        <header className="toolbox-station-hero">
          <img className="toolbox-station-logo" src={BRAND_ASSETS.logoFull} alt={BRAND.name} />
          <p className="toolbox-station-kicker">Learner workshop</p>
          <h1 className="toolbox-station-title">Open the toolbox</h1>
          <p className="toolbox-station-lede">
            Choose how you want to train — a phone app you can demo on an iPhone frame, or the full
            desktop course for the web.
          </p>
        </header>

        <EnterBox />
      </div>
    </section>
  )
}
