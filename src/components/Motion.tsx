import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll-triggered reveal — site-wide building block for imagery and sections. */
export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'article' | 'header' | 'li'
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const alreadyInView = () => {
      const rect = node.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      return rect.top < vh * 0.92 && rect.bottom > 40
    }
    if (alreadyInView()) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      // @ts-expect-error polymorphic ref
      ref={ref}
      className={`reveal ${shown ? 'is-visible' : ''} ${className}`.trim()}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  )
}

/** Remounts on route change so each page enters with a smooth site transition. */
export function PageMotion({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-motion page-motion-smooth">
      {children}
    </div>
  )
}

/** Soft floating light orbs — visual atmosphere behind content. */
export function AmbientField({ variant = 'default' }: { variant?: 'default' | 'hero' | 'app' }) {
  return (
    <div className={`ambient ambient-${variant}`} aria-hidden>
      <span className="ambient-orb ambient-orb-a" />
      <span className="ambient-orb ambient-orb-b" />
      <span className="ambient-orb ambient-orb-c" />
    </div>
  )
}

/** Hero doorway light + drifting sparkles for marketing surfaces. */
export function HeroMotionLayer() {
  return (
    <div className="hero-motion" aria-hidden>
      <div className="hero-beam" />
      <div className="hero-spark hero-spark-1" />
      <div className="hero-spark hero-spark-2" />
      <div className="hero-spark hero-spark-3" />
      <div className="hero-spark hero-spark-4" />
    </div>
  )
}
