import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../auth/Session'
import {
  enterPracticeLesson,
  getJourneyStep,
  openPracticeSpine,
  PRACTICE_ENTRY_STEP,
  restartPracticeFromTop,
} from '../practice/PracticeMode'
import { pathwayMeta, pathwayPhoto, setActivePathway } from '../pathways'
import { PracticeHub } from './PracticeHub'
import { loadFollowUp } from './employmentFollowUp'

/**
 * One school spine inside the student portal.
 * Shop-floor optics: order, belonging, one station — not a doomscroll dashboard.
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
  const pathwayId = enrolledPathway ?? 'construction'
  const meta = pathwayMeta(pathwayId)
  const photo = pathwayPhoto(pathwayId)

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
    <div className="school-path-page">
      <header className="school-path-stage-head">
        <div className="school-path-stage-copy">
          <Link className="school-path-back" to="/app/student">
            ← Home
          </Link>
          <p className="section-kicker on-dark">One practice spine</p>
          <h1>Practice path</h1>
          <p className="school-path-stage-lede">
            {meta.programTitle}. Clear order. One station. Leave with pride when you are done for now —
            this is training, not a feed.
          </p>
          {!enrolledPathway && (
            <Link className="btn btn-secondary" to="/app/student/programs">
              Choose your pathway
            </Link>
          )}
        </div>
        <figure className="school-path-stage-media" aria-hidden>
          <img src={photo} alt="" />
          <figcaption>{meta.tagline}</figcaption>
        </figure>
      </header>

      <PracticeHub
        surface="portal"
        currentStep={step}
        pathComplete={pathComplete}
        onContinue={continuePath}
        onOpenLesson={openLesson}
        onOpenPassport={() => navigate('/app/student/skills')}
        onDoneForNow={() => navigate('/app/student')}
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
