import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'
import { PageHeader } from '../components/Ui'
import {
  enterPracticeLesson,
  getJourneyStep,
  openPracticeSpine,
  PRACTICE_ENTRY_STEP,
  restartPracticeFromTop,
} from '../practice/PracticeMode'
import { pathwayMeta, setActivePathway } from '../pathways'
import { PracticeHub } from './PracticeHub'
import { loadFollowUp } from './employmentFollowUp'

/**
 * One school spine inside the student portal.
 * Same PracticeHub curriculum as /journey — lessons open into the live drills.
 */
export function StudentSchoolPathPage() {
  const { user, student } = useSession()
  const navigate = useNavigate()
  const [step, setStep] = useState(() => getJourneyStep())
  const [pathComplete, setPathComplete] = useState(() => {
    try {
      return !!sessionStorage.getItem('pa-student-employment-v1')
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!user) return
    if (student?.pathway) setActivePathway(student.pathway)
    openPracticeSpine(user.full_name)
    setStep(getJourneyStep())
  }, [user, student?.pathway])

  useEffect(() => {
    const sync = () => {
      setStep(getJourneyStep())
      try {
        setPathComplete(!!sessionStorage.getItem('pa-student-employment-v1'))
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('pa-journey-step', sync)
    window.addEventListener('pa-practice-restarted', sync)
    window.addEventListener('pa-practice-started', sync)
    window.addEventListener('pa-mastery-changed', sync)
    return () => {
      window.removeEventListener('pa-journey-step', sync)
      window.removeEventListener('pa-practice-restarted', sync)
      window.removeEventListener('pa-practice-started', sync)
      window.removeEventListener('pa-mastery-changed', sync)
    }
  }, [])

  if (!user || !student) return null

  const enrolledPathway = student.pathway
  const learnerName = user.full_name
  const pathwayLabel = enrolledPathway
    ? pathwayMeta(enrolledPathway).label
    : pathwayMeta('construction').label

  function openLesson(n: number) {
    if (enrolledPathway) setActivePathway(enrolledPathway)
    enterPracticeLesson(learnerName, n)
    navigate('/journey')
  }

  function continuePath() {
    const resume = Math.max(step, PRACTICE_ENTRY_STEP)
    openLesson(pathComplete ? 20 : resume)
  }

  return (
    <div className="stack school-path-page">
      <PageHeader
        kicker="One school spine"
        title="School path"
        help={`The same 20-step ${pathwayLabel} path as Practice — visible here in your account. Open a station to train.`}
        backTo="/app/student"
        backLabel="Home"
      />

      {!enrolledPathway && (
        <div className="panel stack">
          <p style={{ margin: 0 }}>
            Choose Construction, Logistics, or Community Support so this path matches your program.
          </p>
          <Link className="btn btn-secondary on-light" to="/app/student/programs">
            Choose pathway
          </Link>
        </div>
      )}

      <PracticeHub
        surface="portal"
        currentStep={step}
        pathComplete={pathComplete}
        onContinue={continuePath}
        onOpenLesson={openLesson}
        onOpenPassport={() => navigate('/app/student/skills')}
        onRestart={() => {
          restartPracticeFromTop()
          setStep(PRACTICE_ENTRY_STEP)
          setPathComplete(false)
          void loadFollowUp()
        }}
      />
    </div>
  )
}
