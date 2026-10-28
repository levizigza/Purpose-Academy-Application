import { NavLink, Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { homeForRole, useSession } from '../auth/Session'
import { AmbientField, PageMotion } from '../components/Motion'
import { LoadingScreen, SkipLink } from '../components/Ui'
import { PracticeFeedbackDock, PracticeModeBanner } from '../practice/PracticeFeedbackDock'
import { clearPracticeMode, isPracticeMode } from '../practice/PracticeMode'
import type { Role } from '../data/types'
import { DesktopCourseShell } from '../shell/DesktopCourse'
import { PhoneEmulatorShell } from '../shell/PhoneEmulator'
import { clearEnteredSite } from '../auth/EntryPages'
import { clearShellMode, getShellMode, subscribeShellMode, type ShellMode } from '../shell/shellMode'

function BrandLockup({ to, compact = false, dark = false }: { to: string; compact?: boolean; dark?: boolean }) {
  return (
    <Link to={to} className={`brand-lockup brand-lockup-full${compact ? ' compact' : ''}${dark ? ' on-dark' : ''}`}>
      <img
        className="brand-logo"
        src={dark ? BRAND_ASSETS.logoPOpen : BRAND_ASSETS.logoFull}
        alt={BRAND.name}
      />
    </Link>
  )
}

function useLiveShellMode(): ShellMode | null {
  const [mode, setMode] = useState<ShellMode | null>(() => getShellMode())
  useEffect(() => subscribeShellMode(() => setMode(getShellMode())), [])
  return mode
}

/** Minimal chrome for the post-splash toolbox station (desktop). */
function ToolboxLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [practice, setPractice] = useState(() => isPracticeMode())

  useEffect(() => {
    const sync = () => setPractice(isPracticeMode())
    sync()
    window.addEventListener('pa-practice-started', sync)
    window.addEventListener('pa-practice-restarted', sync)
    return () => {
      window.removeEventListener('pa-practice-started', sync)
      window.removeEventListener('pa-practice-restarted', sync)
    }
  }, [])

  return (
    <div className="shell is-toolbox">
      <SkipLink />
      <header className="toolbox-layout-bar">
        <BrandLockup to="/" dark />
        <nav className="toolbox-layout-nav" aria-label="Workshop">
          {practice && (
            <Link className="toolbox-layout-practice" to="/journey">
              Continue Student Practice
            </Link>
          )}
          <Link to="/splash">Replay opening</Link>
          <Link to="/privacy">Privacy</Link>
          <button
            type="button"
            className="linkish"
            onClick={() => {
              clearPracticeMode()
              clearEnteredSite()
              clearShellMode()
              navigate('/', { replace: true })
            }}
          >
            Desktop / Phone
          </button>
        </nav>
      </header>
      <main id="main-content">{children}</main>
    </div>
  )
}

/** Slim support chrome for contact / privacy / enter gates. */
function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell is-support">
      <AmbientField />
      <SkipLink />
      <header className="topbar">
        <div className="topbar-inner">
          <BrandLockup to="/" />
          <div className="topbar-nav">
            <nav className="nav-cluster" aria-label="Support">
              <NavLink to="/">Toolbox</NavLink>
              <NavLink to="/contact">Help</NavLink>
              <NavLink to="/privacy">Privacy</NavLink>
            </nav>
          </div>
        </div>
      </header>
      <main id="main-content">
        <PageMotion>{children}</PageMotion>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong>{BRAND.name}</strong>
            <p className="muted" style={{ margin: 0 }}>
              Learner workshop · {BRAND.tagline}
            </p>
          </div>
          <div className="nav-links">
            <Link to="/">Toolbox</Link>
            <Link to="/contact">Help</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function PublicLayout() {
  const { user, student, logout, loading } = useSession()
  const { pathname } = useLocation()
  const [practice, setPractice] = useState(() => isPracticeMode())
  const shellMode = useLiveShellMode()

  useEffect(() => {
    const sync = () => setPractice(isPracticeMode())
    sync()
    window.addEventListener('pa-practice-started', sync)
    return () => window.removeEventListener('pa-practice-started', sync)
  }, [pathname])

  if (loading) return <LoadingScreen label={`Opening ${BRAND.name}…`} />

  /*
   * Phone mode: entire public surface runs inside the device frame
   * (home → splash → toolbox → Student Practice / enter).
   */
  if (shellMode === 'phone') {
    return (
      <PhoneEmulatorShell>
        <Outlet />
      </PhoneEmulatorShell>
    )
  }

  /* Desktop course wrap for the live journey */
  if (pathname === '/journey' && shellMode === 'course') {
    return (
      <DesktopCourseShell>
        <Outlet />
      </DesktopCourseShell>
    )
  }

  /* Toolbox home after desktop splash */
  if (pathname === '/') {
    return (
      <ToolboxLayout>
        <Outlet />
      </ToolboxLayout>
    )
  }

  /* Enter gates + legal/support — lean chrome */
  const isTrain = pathname === '/enter/student' || (pathname === '/journey' && !shellMode)

  if (
    pathname.startsWith('/enter/') ||
    pathname === '/contact' ||
    pathname === '/privacy' ||
    pathname === '/journey'
  ) {
    return (
      <div className={`shell${isTrain ? ' is-train' : ''} is-support`}>
        <AmbientField />
        <SkipLink />
        <header className="topbar">
          <div className="topbar-inner">
            <BrandLockup to="/" dark={isTrain} />
            <div className="topbar-nav">
              <nav className="nav-cluster" aria-label="Workshop">
                <NavLink to="/">Toolbox</NavLink>
                {practice && <NavLink to="/journey">Training</NavLink>}
                <NavLink to="/contact">Help</NavLink>
                {user && (
                  <NavLink to={homeForRole(user.role, student?.registration_status)}>Portal</NavLink>
                )}
              </nav>
              <div className="nav-actions">
                {user ? (
                  <button type="button" className="linkish nav-signout" onClick={logout}>
                    Sign out
                  </button>
                ) : practice && pathname !== '/journey' ? (
                  <NavLink className="btn btn-primary nav-cta" to="/journey">
                    Continue training
                  </NavLink>
                ) : (
                  <NavLink className="btn btn-secondary nav-cta" to="/">
                    Toolbox
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </header>
        <main id="main-content">
          <PageMotion>
            <PracticeModeBanner />
            <Outlet />
          </PageMotion>
        </main>
        <PracticeFeedbackDock />
        {!isTrain && (
          <footer className="footer">
            <div className="footer-inner">
              <div>
                <strong>{BRAND.name}</strong>
                <p className="muted" style={{ margin: 0 }}>
                  Learner workshop · {BRAND.tagline}
                </p>
              </div>
              <div className="nav-links">
                <Link to="/">Toolbox</Link>
                <Link to="/contact">Help</Link>
                <Link to="/privacy">Privacy</Link>
              </div>
            </div>
          </footer>
        )}
      </div>
    )
  }

  /* Legacy marketing URLs → toolbox */
  return (
    <SupportLayout>
      <Outlet />
    </SupportLayout>
  )
}

function DesktopNav({ role }: { role: Role }) {
  if (role === 'student') {
    return (
      <>
        <NavLink to="/app/student" end>
          Home
        </NavLink>
        <NavLink to="/journey">Guided path</NavLink>
        <NavLink to="/app/student/courses">Learn</NavLink>
        <NavLink to="/app/student/assignments">Tasks</NavLink>
        <NavLink to="/app/student/skills">My skills</NavLink>
        <NavLink to="/app/student/profile">More</NavLink>
      </>
    )
  }
  if (role === 'instructor') {
    return (
      <>
        <NavLink to="/app/instructor" end>
          Today
        </NavLink>
        <NavLink to="/app/instructor/assignments">Grade work</NavLink>
        <NavLink to="/app/instructor/observe">Observe skills</NavLink>
        <NavLink to="/app/instructor/safety">Safety gates</NavLink>
        <NavLink to="/app/instructor/students">Learners</NavLink>
      </>
    )
  }
  return (
    <>
      <NavLink to="/app/admin" end>
        Overview
      </NavLink>
      <NavLink to="/app/admin/students">Approve learners</NavLink>
      <NavLink to="/app/admin/courses">Courses</NavLink>
      <NavLink to="/app/admin/schedules">Schedule</NavLink>
      <NavLink to="/app/admin/reports">Reports</NavLink>
      <NavLink to="/app/admin/feedback">Feedback</NavLink>
      <NavLink to="/app/admin/privacy">Security</NavLink>
    </>
  )
}

function MobileNav({ role }: { role: Role }) {
  if (role === 'student') {
    return (
      <>
        <NavLink to="/app/student" end>
          Home
        </NavLink>
        <NavLink to="/journey">Path</NavLink>
        <NavLink to="/app/student/courses">Learn</NavLink>
        <NavLink to="/app/student/assignments">Tasks</NavLink>
        <NavLink to="/app/student/profile">More</NavLink>
      </>
    )
  }
  if (role === 'instructor') {
    return (
      <>
        <NavLink to="/app/instructor" end>
          Today
        </NavLink>
        <NavLink to="/app/instructor/assignments">Grade</NavLink>
        <NavLink to="/app/instructor/observe">Observe</NavLink>
        <NavLink to="/app/instructor/students">People</NavLink>
      </>
    )
  }
  return (
    <>
      <NavLink to="/app/admin" end>
        Home
      </NavLink>
      <NavLink to="/app/admin/students">Approve</NavLink>
      <NavLink to="/app/admin/courses">Courses</NavLink>
      <NavLink to="/app/admin/reports">Reports</NavLink>
      <NavLink to="/app/admin/feedback">Notes</NavLink>
    </>
  )
}

export function AppLayout({ role }: { role: Role }) {
  const { user, student, logout, loading } = useSession()
  if (loading) return <LoadingScreen label="Opening your training…" />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return <Navigate to={homeForRole(user.role, student?.registration_status)} replace />
  }

  const pendingStudent = role === 'student' && student && student.registration_status !== 'approved'
  const home = homeForRole(role, student?.registration_status)
  const roleLabel =
    role === 'student' ? 'Learner' : role === 'instructor' ? 'Instructor' : 'Admin'

  return (
    <div className="shell app-shell">
      <AmbientField variant="app" />
      <SkipLink />
      <header className="topbar">
        <div className="topbar-inner">
          <BrandLockup to={home} compact />
          <div className="topbar-meta desktop-nav">
            <span className="badge brand">{roleLabel}</span>
            <span className="muted user-chip">{user.full_name}</span>
          </div>
          <div className="topbar-nav desktop-nav">
            <nav className="nav-cluster" aria-label="App menu">
              {pendingStudent ? (
                <NavLink to="/app/student/registration">Registration status</NavLink>
              ) : (
                <DesktopNav role={role} />
              )}
              <NavLink to="/">Toolbox</NavLink>
            </nav>
            <div className="nav-actions">
              <button type="button" className="linkish nav-signout" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>
      <main id="main-content" className="shell-main">
        <PageMotion>
          <PracticeModeBanner />
          <Outlet />
        </PageMotion>
      </main>
      <PracticeFeedbackDock />
      {!pendingStudent && (
        <nav className="bottom-nav" aria-label="Main">
          <MobileNav role={role} />
        </nav>
      )}
    </div>
  )
}

export function RequireApprovedStudent({ children }: { children: React.ReactNode }) {
  const { user, student, loading } = useSession()
  if (loading) return <LoadingScreen />
  if (!user || user.role !== 'student') return <Navigate to="/login" replace />
  if (!student) return <Navigate to="/login" replace />
  if (student.registration_status !== 'approved') {
    return <Navigate to="/app/student/registration" replace />
  }
  return children
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { loading } = useSession()
  if (loading) return <LoadingScreen />
  return (
    <div className="shell">
      <AmbientField />
      <SkipLink />
      <header className="topbar">
        <div className="topbar-inner">
          <BrandLockup to="/" />
          <div className="topbar-nav">
            <nav className="nav-cluster" aria-label="Account">
              <Link to="/">Toolbox</Link>
              <Link to="/contact">Help</Link>
            </nav>
            <div className="nav-actions">
              <Link className="btn btn-primary nav-cta" to="/login">
                {BRAND.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main id="main-content">
        <PageMotion>
          <PracticeModeBanner />
          {children}
        </PageMotion>
      </main>
      <PracticeFeedbackDock />
    </div>
  )
}
