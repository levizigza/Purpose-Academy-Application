import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { FoleyToggle } from '../components/CrewLoading'
import { PracticeFeedbackDock, PracticeModeBanner } from '../practice/PracticeFeedbackDock'
import { restartPracticeFromTop } from '../practice/PracticeMode'
import { clearShellMode } from './shellMode'

/**
 * Desktop course presentation — wide learning surface without marketing chrome.
 * Same curriculum as the phone shell; framed for instructor demos and web study.
 */
export function DesktopCourseShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.add('pa-course-shell')
    return () => document.documentElement.classList.remove('pa-course-shell')
  }, [])

  function exitToToolbox() {
    navigate('/')
  }

  function exitToModes() {
    clearShellMode()
    navigate('/', { replace: true })
  }

  function startOver() {
    restartPracticeFromTop()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="course-stage">
      <header className="course-topbar">
        <div className="course-topbar-inner">
          <button type="button" className="course-back" onClick={exitToToolbox}>
            ← Toolbox
          </button>
          <div className="course-brand">
            <img src={BRAND_ASSETS.logoPOpen} alt="" width={36} height={36} />
            <div>
              <strong>{BRAND.name}</strong>
              <span>Desktop mode</span>
            </div>
          </div>
          <div className="course-topbar-actions">
            <FoleyToggle />
            <button type="button" className="btn btn-secondary course-action" onClick={startOver}>
              Start over
            </button>
            <button type="button" className="btn btn-ghost course-action" onClick={exitToModes}>
              Exit to modes
            </button>
          </div>
        </div>
      </header>

      <PracticeModeBanner />

      <main id="main-content" className="course-main shell is-train is-course-app">
        {children}
      </main>

      <PracticeFeedbackDock />

      <footer className="course-footer">
        <span>
          {BRAND.name} · {BRAND.tagline}
        </span>
        <button type="button" className="linkish" onClick={exitToToolbox}>
          Back to toolbox
        </button>
        <button type="button" className="linkish" onClick={exitToModes}>
          Desktop / Phone
        </button>
      </footer>
    </div>
  )
}
