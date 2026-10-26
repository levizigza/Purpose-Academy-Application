import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'

/**
 * App icon that matches the logo lockup: navy doorway P on white paper.
 * Never invent a gold/dark dialect — the mark on the home screen is the brand.
 */
export function PaAppIcon({ className = '' }: { className?: string }) {
  return (
    <span className={`pa-app-icon ${className}`.trim()} aria-hidden>
      <img src={BRAND_ASSETS.logoMark} alt="" />
      <span className="pa-app-icon-sr">{BRAND.name}</span>
    </span>
  )
}
