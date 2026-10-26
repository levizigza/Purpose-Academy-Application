import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'

/**
 * App icon = doorway P from the real Purpose Academy logo (white paper + navy).
 * Not the PA monogram mark — critics rejected that as off-brand.
 */
export function PaAppIcon({ className = '' }: { className?: string }) {
  return (
    <span className={`pa-app-icon ${className}`.trim()} aria-hidden>
      <img src={BRAND_ASSETS.logoAppIcon} alt="" />
      <span className="pa-app-icon-sr">{BRAND.name}</span>
    </span>
  )
}
