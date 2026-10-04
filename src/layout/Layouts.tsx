import { NavLink, Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { homeForRole, useSession } from '../auth/Session'
import { AmbientField, PageMotion } from '../components/Motion'
import { LoadingScreen, SkipLink } from '../components/Ui'
import { PracticeFeedbackDock, PracticeModeBanner } from '../practice/PracticeFeedbackDock'
import { isPracticeMode } from '../practice/PracticeMode'
import type { Role } from '../data/types'

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

export function PublicLayout() {
  const { user, student, logout, loading } = useSession()
  const { pathname } = useLocation()
  const [practice, setPractice] = useState(() => isPracticeMode())

  useEffect(() => {
    const sync = () => setPractice(isPracticeMode())
    sync()
    window.addEventListener('pa-practice-started', sync)
    return () => window.removeEventListener('pa-practice-started', sync)
  }, [pathname])

  if (loading) return <LoadingScreen label={`Opening ${BRAND.name}…`} />

  const isTrain = pathname === '/journey' || pathname === '/enter/student'

  return (
    <div className={`shell${isTrain ? ' is-train' : ''}`}>
      <AmbientField />
      <SkipLink />
      <header className="topbar">
        <div className="topbar-inner">
          <BrandLockup to="/" dark={isTrain} />
          <div className="topbar-nav">
            <nav className="nav-cluster" aria-label="Website">
              <NavLink to="/programs">Programs</NavLink>
              <NavLink to={BRAND.joinTo}>{BRAND.joinLabel}</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/give">Give</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              {practice && <NavLink to="/journey">Training</NavLink>}
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
              ) : practice ? (
                <NavLink className="btn btn-secondary nav-cta" to="/">
                  Review website
                </NavLink>
              ) : (
                <NavLink className="btn btn-primary nav-cta" to="/login">
                  {BRAND.secondaryCta}
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
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong>{BRAND.name}</strong>
            <p className="muted" style={{ margin: 0 }}>
              Construction school in {BRAND.place}. {BRAND.tagline}
            </p>
          </div>
          <div className="nav-links">
            <Link to="/about">About</Link>
            <Link to="/programs">Programs</Link>
            <Link to="/give">Give</Link>
            <Link to="/contact">Contact</Link>
            {practice ? <Link to="/journey">Training path</Link> : <Link to="/login">{BRAND.secondaryCta}</Link>}
          </div>
        </div>
      </footer>
    </div>
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
              <NavLink to="/">Website</NavLink>
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
              <Link to="/">Website</Link>
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
