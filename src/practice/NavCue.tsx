import {
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { markNavCueSeen, navCueActive } from './navCues'

type ArrowSide = 'above' | 'below' | 'left' | 'right'

type NavArrowProps = {
  cueId: string
  label: string
  side?: ArrowSide
  className?: string
}

/** Soft pulsing arrow that points at the next door — dismisses with the cue. */
export function NavArrow({ cueId, label, side = 'above', className = '' }: NavArrowProps) {
  const [, bump] = useState(0)
  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-nav-cues-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-nav-cues-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [])

  if (!navCueActive(cueId)) return null

  return (
    <div
      className={`nav-arrow is-${side}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="nav-arrow-label">{label}</span>
      <span className="nav-arrow-glyph" aria-hidden>
        {side === 'left' ? '←' : side === 'right' ? '→' : side === 'above' ? '↓' : '↑'}
      </span>
    </div>
  )
}

type GlowProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  cueId: string
  /** Mark cue seen on click (default true). */
  dismissOnClick?: boolean
}

/** Primary action with a calm amber/navy glow while the cue is active. */
export function NavGlowButton({
  cueId,
  dismissOnClick = true,
  className = '',
  onClick,
  children,
  ...rest
}: GlowProps) {
  const [, bump] = useState(0)
  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-nav-cues-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-nav-cues-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [])

  const active = navCueActive(cueId)
  const cls = `${className}${active ? ' nav-glow-cta' : ''}`.trim()

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (dismissOnClick && active) markNavCueSeen(cueId)
    onClick?.(e)
  }

  return (
    <button type="button" className={cls} onClick={handleClick} {...rest}>
      {children}
    </button>
  )
}

type WrapProps = {
  cueId: string
  children: ReactElement
  dismissOnClick?: boolean
}

/** Wrap an existing button element with glow + dismiss (clone). */
export function withNavGlow(_cueId: string, active: boolean, className: string) {
  return active ? `${className} nav-glow-cta`.trim() : className
}

export function NavGlowWrap({ cueId, children, dismissOnClick = true }: WrapProps) {
  const [, bump] = useState(0)
  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-nav-cues-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-nav-cues-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [])

  if (!isValidElement(children)) return children
  const active = navCueActive(cueId)
  const child = children as ReactElement<{
    className?: string
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void
    style?: CSSProperties
  }>
  const prevClass = child.props.className || ''
  return cloneElement(child, {
    className: withNavGlow(cueId, active, prevClass),
    onClick: (e: MouseEvent<HTMLButtonElement>) => {
      if (dismissOnClick && active) markNavCueSeen(cueId)
      child.props.onClick?.(e)
    },
  })
}

type RegionProps = {
  cueId: string
  children: ReactNode
  /** Mark cue seen on click inside the region (default true). */
  dismissOnClick?: boolean
  className?: string
}

/**
 * Soft glow around a non-button region (language grids, chip rows).
 * Same once-then-quiet grammar as NavGlowButton — shared Desktop ↔ Phone.
 */
export function NavGlowRegion({
  cueId,
  children,
  dismissOnClick = true,
  className = '',
}: RegionProps) {
  const [, bump] = useState(0)
  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-nav-cues-changed', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-nav-cues-changed', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [])

  const active = navCueActive(cueId)
  const cls = `${className}${active ? ' nav-glow-cta nav-glow-region' : ''}`.trim()

  function handleClick() {
    if (dismissOnClick && active) markNavCueSeen(cueId)
  }

  return (
    <div className={cls} onClick={handleClick}>
      {children}
    </div>
  )
}

type TargetProps = {
  cueId: string
  arrowLabel: string
  arrowSide?: ArrowSide
  children: ReactNode
  className?: string
}

/** Arrow + glowing child stack — use around primary continues. */
export function NavCueTarget({
  cueId,
  arrowLabel,
  arrowSide = 'above',
  children,
  className = '',
}: TargetProps) {
  return (
    <div className={`nav-cue-target${className ? ` ${className}` : ''}`}>
      <NavArrow cueId={cueId} label={arrowLabel} side={arrowSide} />
      {children}
    </div>
  )
}
