import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LoginPage, RegisterPage, ForgotPasswordPage } from './auth/AuthPages'
import { RoleSelectionPage, SplashPage, WelcomePage, hasEnteredSite, markEnteredSite } from './auth/EntryPages'
import { SessionProvider, useSession, homeForRole } from './auth/Session'
import { AdminCoursesPage, AdminDashboardPage, AdminPrivacyPage, AdminReportsPage, AdminSchedulesPage, AdminStudentsPage } from './admin/AdminPages'
import { AdminPracticeFeedbackPage } from './admin/AdminPracticeFeedbackPage'
import {
  InstructorAssignmentsPage,
  InstructorDashboardPage,
  InstructorObservePage,
  InstructorSafetyPage,
  InstructorStudentsPage,
} from './instructor/InstructorPages'
import { AppLayout, AuthShell, PublicLayout, RequireApprovedStudent } from './layout/Layouts'
import {
  FoundationPage,
  LessonViewPage,
  ProgramSelectionPage,
  StudentCoursesPage,
} from './learning/LearningPages'
import {
  AdminContactSequencePage,
  AdminEnterPage,
  AdminGuestSequencePage,
  InstructorEnterPage,
  StudentEnterPage,
} from './gateway/GatewayPages'
import {
  AdmissionsPage,
  AboutPage,
  ContactPage,
  GivePage,
  HomePage,
  PrivacyNoticePage,
  ProgramsPage,
} from './public/PublicPages'
import { SkillsPassportPage } from './skills/SkillsPassportPage'
import { StudentSequencePage } from './student/StudentSequence'
import {
  StudentAssignmentsPage,
  StudentProgressPage,
  SubmissionPage,
} from './student/AssignmentsProgress'
import {
  StudentHomePage,
  StudentProfilePage,
  StudentRegistrationStatusPage,
} from './student/StudentCore'

function AppHomeRedirect() {
  const { user, student } = useSession()
  if (!user) return <Navigate to="/welcome" replace />
  return <Navigate to={homeForRole(user.role, student?.registration_status)} replace />
}

/** Auth and legal paths should work even if the splash was skipped or stuck. */
const SPLASH_BYPASS = new Set([
  '/login',
  '/register',
  '/welcome',
  '/roles',
  '/forgot-password',
  '/privacy',
  '/contact',
  '/enter/student',
  '/enter/admin',
  '/enter/admin/contact',
  '/enter/admin/guest',
  '/enter/instructor',
  '/journey',
  '/about',
  '/give',
])

function AppRoutes() {
  const location = useLocation()
  const [entered, setEntered] = useState(() => hasEnteredSite())
  const bypassSplash =
    SPLASH_BYPASS.has(location.pathname) || location.pathname.startsWith('/enter/')

  useEffect(() => {
    if (bypassSplash && !hasEnteredSite()) {
      markEnteredSite()
      setEntered(true)
    }
  }, [bypassSplash])

  if (!entered && !bypassSplash) {
    return <SplashPage onEnter={() => setEntered(true)} />
  }

  return (
    <Routes>
      <Route path="/splash" element={<SplashPage onEnter={() => setEntered(true)} />} />
      <Route
        path="/welcome"
        element={
          <AuthShell>
            <WelcomePage />
          </AuthShell>
        }
      />
      <Route
        path="/roles"
        element={
          <AuthShell>
            <RoleSelectionPage />
          </AuthShell>
        }
      />
      <Route
        path="/login"
        element={
          <AuthShell>
            <LoginPage />
          </AuthShell>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthShell>
            <ForgotPasswordPage />
          </AuthShell>
        }
      />
      <Route
        path="/register"
        element={
          <AuthShell>
            <RegisterPage />
          </AuthShell>
        }
      />

      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/give" element={<GivePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/sequences" element={<Navigate to="/" replace />} />
        <Route path="/privacy" element={<PrivacyNoticePage />} />
        <Route path="/enter/student" element={<StudentEnterPage />} />
        <Route path="/enter/admin" element={<AdminEnterPage />} />
        <Route path="/enter/admin/contact" element={<AdminContactSequencePage />} />
        <Route path="/enter/admin/guest" element={<AdminGuestSequencePage />} />
        <Route path="/enter/instructor" element={<InstructorEnterPage />} />
        <Route path="/journey" element={<StudentSequencePage />} />
      </Route>

      <Route path="/app" element={<AppHomeRedirect />} />

      <Route path="/app/student" element={<AppLayout role="student" />}>
        <Route path="registration" element={<StudentRegistrationStatusPage />} />
        <Route
          index
          element={
            <RequireApprovedStudent>
              <StudentHomePage />
            </RequireApprovedStudent>
          }
        />
        <Route
          path="foundation"
          element={
            <RequireApprovedStudent>
              <FoundationPage />
            </RequireApprovedStudent>
          }
        />
        <Route
          path="programs"
          element={
            <RequireApprovedStudent>
              <ProgramSelectionPage />
            </RequireApprovedStudent>
          }
        />
        <Route
          path="courses"
          element={
            <RequireApprovedStudent>
              <StudentCoursesPage />
            </RequireApprovedStudent>
          }
        />
        <Route
          path="lessons/:lessonId"
          element={
            <RequireApprovedStudent>
              <LessonViewPage />
            </RequireApprovedStudent>
          }
        />
        <Route
          path="assignments"
          element={
            <RequireApprovedStudent>
              <StudentAssignmentsPage />
            </RequireApprovedStudent>
          }
        />
        <Route
          path="assignments/:assignmentId"
          element={
            <RequireApprovedStudent>
              <SubmissionPage />
            </RequireApprovedStudent>
          }
        />
        <Route
          path="progress"
          element={
            <RequireApprovedStudent>
              <StudentProgressPage />
            </RequireApprovedStudent>
          }
        />
        <Route
          path="skills"
          element={
            <RequireApprovedStudent>
              <SkillsPassportPage />
            </RequireApprovedStudent>
          }
        />
        <Route
          path="profile"
          element={
            <RequireApprovedStudent>
              <StudentProfilePage />
            </RequireApprovedStudent>
          }
        />
      </Route>

      <Route path="/app/instructor" element={<AppLayout role="instructor" />}>
        <Route index element={<InstructorDashboardPage />} />
        <Route path="assignments" element={<InstructorAssignmentsPage />} />
        <Route path="observe" element={<InstructorObservePage />} />
        <Route path="safety" element={<InstructorSafetyPage />} />
        <Route path="students" element={<InstructorStudentsPage />} />
      </Route>

      <Route path="/app/admin" element={<AppLayout role="admin" />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="schedules" element={<AdminSchedulesPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="feedback" element={<AdminPracticeFeedbackPage />} />
        <Route path="privacy" element={<AdminPrivacyPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <SessionProvider>
      <AppRoutes />
    </SessionProvider>
  )
}
