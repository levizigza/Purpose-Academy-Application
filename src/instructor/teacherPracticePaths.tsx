import { useLocation, useNavigate } from 'react-router-dom'
import { setActivePathway, type PathwayId } from '../pathways'
import { resumeOrEnterPractice } from '../practice/PracticeMode'
import { getInstructorPracticeName } from '../practice/InstructorPracticeMode'

/** Public demo path or signed-in instructor portal — same pages, different base. */
export function useTeacherPracticeBase() {
  const { pathname } = useLocation()
  return pathname.startsWith('/app/instructor')
    ? '/app/instructor/practice'
    : '/teacher-practice'
}

/** Open Student Practice on the stream being taught, without wiping either history. */
export function StudentPathButton({ pathway }: { pathway: PathwayId }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={() => {
        setActivePathway(pathway)
        resumeOrEnterPractice(getInstructorPracticeName() || 'Instructor')
        navigate('/journey')
      }}
    >
      See the student path
    </button>
  )
}
