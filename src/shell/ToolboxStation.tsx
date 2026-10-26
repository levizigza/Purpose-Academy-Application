import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { EnterBox } from '../gateway/EnterBox'
import { SitePaMark } from '../components/SitePaMark'
import { getShellMode } from './shellMode'

/**
 * Post-opening toolbox — Student, Practice, Instructor, Admin.
 * Shown after desktop splash Enter, or inside the phone after the in-device opening.
 */
export function ToolboxStation() {
  const inPhone = getShellMode() === 'phone'

  return (
    <section
      className={`toolbox-station${inPhone ? ' is-in-phone' : ''}`}
      aria-label={`${BRAND.name} toolbox`}
    >
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
            {inPhone
              ? 'Pull a tray on the phone — Practice, Student, Instructor, or Admin.'
              : 'Pull a tray — Practice, Student, Instructor, or Admin — and step onto the path.'}
          </p>
        </header>

        <EnterBox />
      </div>
    </section>
  )
}
