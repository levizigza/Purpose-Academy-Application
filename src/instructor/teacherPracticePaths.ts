import { useLocation } from 'react-router-dom'

/** Public demo path or signed-in instructor portal — same pages, different base. */
export function useTeacherPracticeBase() {
  const { pathname } = useLocation()
  return pathname.startsWith('/app/instructor')
    ? '/app/instructor/practice'
    : '/teacher-practice'
}
