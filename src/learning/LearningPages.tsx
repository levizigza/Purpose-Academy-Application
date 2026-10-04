import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSession } from '../auth/Session'
import {
  completeLesson,
  enrichVocab,
  foundationProgress,
  getDb, useDb,
  getSafetyGate,
  recordVocabAttempt,
  selectPathway,
  vocabMasteryPercent,
} from '../data/store'
import type { LanguageLayer, VocabTerm } from '../data/types'
import { speakBilingual, speakEnglish, speakSupport, stopSpeech } from '../student/speech'
import type { SupportLang } from '../student/journeyCurriculum'

const LAYERS: { id: LanguageLayer; label: string; help: string }[] = [
  { id: 'see_hear', label: 'See & hear', help: 'Picture + English word' },
  { id: 'understand', label: 'Understand', help: 'Meaning + support language' },
  { id: 'recognize', label: 'Recognize', help: 'Choose the correct term' },
  { id: 'recall', label: 'Recall', help: 'Produce without translation' },
  { id: 'sentence', label: 'Sentence', help: 'Use in a workplace phrase' },
  { id: 'instruction', label: 'Instruction', help: 'Follow a short direction' },
]

const SUPPORT_LANGS = new Set([
  'English',
  'Spanish',
  'Arabic',
  'Hindi',
  'Amharic',
  'Tigrinya',
])

function asSupportLang(value: string): SupportLang {
  return (SUPPORT_LANGS.has(value) ? value : 'Spanish') as SupportLang
}

function VocabPractice({
  terms,
  studentId,
  supportLanguage,
}: {
  terms: VocabTerm[]
  studentId: string
  supportLanguage: string
}) {
  const [index, setIndex] = useState(0)
  const [layerIdx, setLayerIdx] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [choiceState, setChoiceState] = useState<Record<string, 'correct' | 'wrong'>>({})
  const [enrich, setEnrich] = useState<{
    imageUrl?: string
    definition?: string | null
    audio?: string | null
    translation?: string | null
    sources?: string[]
  } | null>(null)
  const term = terms[index]
  const layer = LAYERS[layerIdx]
  const mastery = vocabMasteryPercent(
    studentId,
    terms.map((t) => t.id),
  )
  const englishOnly = mastery >= 80

  useEffect(() => {
    let cancelled = false
    if (!term) return
    ;(async () => {
      try {
        const data = await enrichVocab(term.id)
        if (cancelled) return
        setEnrich({
          imageUrl: data.image.imageUrl,
          definition: data.dictionary.definition || term.definition,
          audio: data.dictionary.audio,
          translation: data.translation?.translated ?? null,
          sources: data.sources,
        })
      } catch {
        if (!cancelled) setEnrich(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [term?.id])

  if (!term) return <p>No vocabulary linked to this lesson.</p>

  function next() {
    setFeedback(null)
    setChoiceState({})
    if (layerIdx < LAYERS.length - 1) setLayerIdx((i) => i + 1)
    else {
      setLayerIdx(0)
      setIndex((i) => (i + 1) % terms.length)
    }
  }

  async function onRecognize(choice: string) {
    const correct = choice === term.english
    await recordVocabAttempt(studentId, term.id, 'recognize', correct)
    setChoiceState({ [choice]: correct ? 'correct' : 'wrong' })
    setFeedback(correct ? 'Correct.' : `The English word is “${term.english}”.`)
  }

  async function onRecall(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const answer = String(data.get('recall') || '')
      .trim()
      .toLowerCase()
    const correct = answer === term.english.toLowerCase()
    await recordVocabAttempt(studentId, term.id, 'recall', correct)
    setFeedback(correct ? 'Correct recall.' : `Expected “${term.english}”.`)
  }

  const distractors = useMemo(() => {
    const others = getDb()
      .vocab_terms.filter((t) => t.id !== term.id)
      .slice(0, 3)
      .map((t) => t.english)
    return [...others, term.english].sort(() => Math.random() - 0.5)
  }, [term.id, term.english])

  return (
    <div className="panel stack vocab-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <strong>
          Layer {layerIdx + 1}/{LAYERS.length}: {layer.label}
        </strong>
        <span className={`badge ${mastery >= 80 ? 'ok' : 'brand'}`}>
          Mastery prototype {mastery}% {englishOnly ? '· English-only bridge' : '· support language on'}
        </span>
      </div>
      <p className="muted">{layer.help}</p>
      <div
        className="vocab-visual"
        aria-hidden
        style={
          enrich?.imageUrl
            ? {
                backgroundImage: `linear-gradient(145deg, rgba(217,235,226,0.75), rgba(240,223,196,0.7)), url(${enrich.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'var(--brand-deep)',
              }
            : undefined
        }
      >
        {term.image_hint}
      </div>
      {enrich?.sources && (
        <p className="muted" style={{ fontSize: '0.8rem' }}>
          Live enrichments: {enrich.sources.join(' · ')}
        </p>
      )}

      {layer.id === 'see_hear' && (
        <>
          <h3>{term.english}</h3>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                stopSpeech()
                if (enrich?.audio) {
                  try {
                    await new Audio(enrich.audio).play()
                  } catch {
                    await speakEnglish(term.english)
                  }
                } else {
                  await speakEnglish(term.english)
                }
                await recordVocabAttempt(studentId, term.id, 'see_hear', true)
                setFeedback('English audio played.')
              }}
            >
              Hear English
            </button>
            {!englishOnly && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => {
                  const supportText = enrich?.translation || term.support_meaning || term.english
                  await speakSupport(supportText, asSupportLang(supportLanguage))
                  await recordVocabAttempt(studentId, term.id, 'see_hear', true)
                  setFeedback(`${supportLanguage} audio played.`)
                }}
              >
                Hear {supportLanguage}
              </button>
            )}
            {!englishOnly && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={async () => {
                  const supportText = enrich?.translation || term.support_meaning || term.english
                  await speakBilingual(term.english, supportText, asSupportLang(supportLanguage))
                  await recordVocabAttempt(studentId, term.id, 'see_hear', true)
                  setFeedback('Heard English, then support language.')
                }}
              >
                Play both
              </button>
            )}
          </div>
        </>
      )}

      {layer.id === 'understand' && (
        <>
          <h3>{term.english}</h3>
          <p>{enrich?.definition || term.definition}</p>
          {!englishOnly && (
            <p>
              Support language ({supportLanguage}):{' '}
              <em>{enrich?.translation || term.support_meaning}</em>
            </p>
          )}
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void speakEnglish(term.english)}
            >
              Hear English
            </button>
            {!englishOnly && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  void speakSupport(
                    enrich?.translation || term.support_meaning || term.english,
                    asSupportLang(supportLanguage),
                  )
                }
              >
                Hear {supportLanguage}
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={async () => {
                await recordVocabAttempt(studentId, term.id, 'understand', true)
                setFeedback('Meaning marked understood.')
              }}
            >
              I understand
            </button>
          </div>
        </>
      )}

      {layer.id === 'recognize' && (
        <div className="choice-grid">
          {distractors.map((c) => (
            <button
              key={c}
              type="button"
              className={choiceState[c]}
              onClick={() => onRecognize(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {layer.id === 'recall' && (
        <form onSubmit={onRecall} className="stack">
          <p>Type the English word (no translation cue):</p>
          <div className="field">
            <label htmlFor="recall">English term</label>
            <input id="recall" name="recall" required autoComplete="off" />
          </div>
          <button className="btn btn-primary" type="submit">
            Check recall
          </button>
        </form>
      )}

      {layer.id === 'sentence' && (
        <>
          <p>
            Workplace phrase: <strong>{term.sentence}</strong>
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={async () => {
              await recordVocabAttempt(studentId, term.id, 'sentence', true)
              setFeedback('Sentence practice recorded.')
            }}
          >
            I can say this
          </button>
        </>
      )}

      {layer.id === 'instruction' && (
        <>
          <p>
            Follow: “Point to or name the <strong>{term.english}</strong> before starting the task.”
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={async () => {
              await recordVocabAttempt(studentId, term.id, 'instruction', true)
              setFeedback('Instruction practice recorded.')
            }}
          >
            Done
          </button>
        </>
      )}

      {feedback && <div className="alert ok">{feedback}</div>}
      <button type="button" className="btn btn-secondary on-light" onClick={next}>
        Next step
      </button>
    </div>
  )
}

export function FoundationPage() {
  const { student } = useSession()
  const db = useDb()
  if (!student) return null
  const modules = db.modules
    .filter((m) => m.course_id === 'course-foundation')
    .sort((a, b) => a.order - b.order)
  const prog = foundationProgress(student.id)

  return (
    <div className="stack">
      <div>
        <p className="section-kicker">Foundation</p>
        <h1>Language and communication preparation</h1>
        <p className="lede">Every learner starts here, the first step on the path to verified work readiness.</p>
        <div className="progress" aria-label={`Foundation ${prog}%`}>
          <span style={{ width: `${prog}%` }} />
        </div>
        <p className="muted">{prog}% complete</p>
      </div>
      {modules.map((mod) => {
        const lessons = db.lessons.filter((l) => l.module_id === mod.id).sort((a, b) => a.order - b.order)
        return (
          <div className="panel stack" key={mod.id}>
            <h2>{mod.title}</h2>
            <p className="muted">{mod.description}</p>
            <ul className="list-plain">
              {lessons.map((lesson) => {
                const done = db.lesson_progress.some(
                  (p) => p.student_id === student.id && p.lesson_id === lesson.id && p.completed,
                )
                return (
                  <li key={lesson.id}>
                    <Link to={`/app/student/lessons/${lesson.id}`}>
                      {lesson.title} {done ? '✓' : ''}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
      {student.foundation_complete && (
        <Link className="btn btn-primary" to="/app/student/programs">
          Select specialization
        </Link>
      )}
    </div>
  )
}

export function ProgramSelectionPage() {
  const { student } = useSession()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const db = useDb()
  if (!student) return null

  const programs = db.courses.filter((c) => c.category !== 'foundation')

  async function choose(category: 'construction' | 'logistics' | 'community') {
    if (!student) return
    try {
      await selectPathway(student.id, category)
      navigate('/app/student/courses')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to select program')
    }
  }

  return (
    <div className="stack">
      <p className="section-kicker">Pathway</p>
      <h1>Choose your specialization</h1>
      <p className="lede">After foundation, select one pathway. Construction is the live path you can prove.</p>
      {!student.foundation_complete && (
        <div className="alert warn">Complete foundation learning before selecting a program.</div>
      )}
      {error && <div className="alert error">{error}</div>}
      <div className="grid-3">
        {programs.map((course) => {
          const locked = !course.active
          return (
            <div className={`panel stack ${locked ? 'locked-card' : ''}`} key={course.id}>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <p className="muted">Duration: {course.duration}</p>
              <ul>
                {course.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!student.foundation_complete || locked || student.pathway === course.category}
                onClick={() => choose(course.category as 'construction' | 'logistics' | 'community')}
              >
                {student.pathway === course.category ? 'Selected' : 'Select program'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function StudentCoursesPage() {
  const { student } = useSession()
  const db = useDb()
  if (!student) return null
  const enrollments = db.enrollments.filter((e) => e.student_id === student.id)

  return (
    <div className="stack">
      <h1>Courses</h1>
      <div className="hero-actions">
        <Link className="btn btn-ghost" to="/app/student/foundation">
          Foundation
        </Link>
        {student.foundation_complete && (
          <Link className="btn btn-secondary on-light" to="/app/student/programs">
            Program selection
          </Link>
        )}
      </div>
      {enrollments.map((en) => {
        const course = db.courses.find((c) => c.id === en.course_id)
        if (!course) return null
        const modules = db.modules.filter((m) => m.course_id === course.id).sort((a, b) => a.order - b.order)
        return (
          <div className="panel stack" key={en.id}>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            {modules.map((mod) => (
              <div key={mod.id}>
                <h3>{mod.title}</h3>
                <ul className="list-plain">
                  {db.lessons
                    .filter((l) => l.module_id === mod.id)
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => {
                      const done = db.lesson_progress.some(
                        (p) => p.student_id === student.id && p.lesson_id === lesson.id && p.completed,
                      )
                      return (
                        <li key={lesson.id}>
                          <Link to={`/app/student/lessons/${lesson.id}`}>
                            {lesson.title} {done ? '✓' : ''}
                          </Link>
                        </li>
                      )
                    })}
                </ul>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function LessonViewPage() {
  const { lessonId } = useParams()
  const { student } = useSession()
  const db = useDb()
  const [quizIndex, setQuizIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  if (!student || !lessonId) return null
  const lesson = db.lessons.find((l) => l.id === lessonId)
  if (!lesson) return <p>Lesson not found.</p>

  const terms = (lesson.vocabulary_ids || [])
    .map((id) => db.vocab_terms.find((t) => t.id === id))
    .filter(Boolean) as VocabTerm[]

  const gate = getSafetyGate(student.id)
  const isPractical = lesson.lesson_type === 'practical_prep'
  const blocked = isPractical && gate?.status !== 'PASS'

  const quiz = lesson.quiz || []
  const quizDone = quiz.length === 0 || answered >= quiz.length
  const quizPct = quiz.length ? Math.round((score / quiz.length) * 100) : 100
  const quizPassed = quiz.length === 0 || quizPct >= 80

  function answerQuestion(choiceIndex: number) {
    const q = quiz[quizIndex]
    if (!q) return
    const correct = choiceIndex === q.answer_index
    const nextScore = score + (correct ? 1 : 0)
    const nextAnswered = answered + 1
    setScore(nextScore)
    setAnswered(nextAnswered)
    setQuizIndex((i) => Math.min(i + 1, quiz.length))
    if (!correct) {
      setMessage(
        `Not quite. The better answer is “${q.choices[q.answer_index]}”. You can retry the check after this round.`,
      )
    } else {
      setMessage(null)
    }
    if (quiz.length && nextAnswered >= quiz.length) {
      const pct = Math.round((nextScore / quiz.length) * 100)
      if (pct < 80) {
        setMessage(
          `Score ${pct}%. You need at least 80% to finish this lesson. Tap Retry quiz, then choose carefully.`,
        )
      } else {
        setMessage(`Quiz passed at ${pct}%. Tap Mark lesson complete to save your progress.`)
      }
    }
  }

  async function finish() {
    const pct = quiz.length ? Math.round((score / quiz.length) * 100) : 100
    if (quiz.length && pct < 80) {
      setMessage(
        `Score ${pct}%. You need at least 80% to finish this lesson. Tap Retry quiz, then choose carefully.`,
      )
      return
    }
    try {
      await completeLesson(student!.id, lesson!.id, quiz.length ? pct : null)
      setMessage(`Lesson completed${quiz.length ? ` · quiz ${pct}%` : ''}.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not save lesson progress.')
    }
  }

  function retryQuiz() {
    setQuizIndex(0)
    setScore(0)
    setAnswered(0)
    setMessage(null)
  }

  return (
    <div className="stack">
      <Link to="/app/student/courses" className="muted">
        ← Back to courses
      </Link>
      <h1>{lesson.title}</h1>
      <p>{lesson.content}</p>

      {blocked && (
        <div className="alert warn">
          Safety gate {gate?.status}: {gate?.reason}. Complete Safety Basics with a passing quiz before practical prep.
        </div>
      )}

      {!blocked && terms.length > 0 && (
        <VocabPractice
          terms={terms}
          studentId={student.id}
          supportLanguage={student.preferred_language}
        />
      )}

      {!blocked && quiz.length > 0 && answered < quiz.length && (
        <div className="panel stack" data-testid="knowledge-check">
          <h2>Knowledge check</h2>
          <p>
            Question {quizIndex + 1} of {quiz.length}
          </p>
          <p>
            <strong>{quiz[quizIndex]?.prompt}</strong>
          </p>
          <div className="choice-grid quiz-choices">
            {quiz[quizIndex]?.choices.map((c, i) => (
              <button key={c} type="button" onClick={() => answerQuestion(i)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {message && (
        <div
          className={`alert ${
            /completed|passed/i.test(message)
              ? 'ok'
              : /Score|Not quite|need at least|Could not/i.test(message)
                ? 'warn'
                : 'ok'
          }`}
        >
          {message}
        </div>
      )}

      {!blocked && quiz.length > 0 && quizDone && !quizPassed && (
        <button type="button" className="btn btn-ghost" onClick={retryQuiz}>
          Retry quiz
        </button>
      )}

      {!blocked && quizDone && quizPassed && (
        <button type="button" className="btn btn-primary" onClick={finish}>
          Mark lesson complete
        </button>
      )}

      {isPractical && !blocked && (
        <p className="muted">
          Practical competency still requires instructor observation on the Assess screen. Completing this page only
          prepares you.
        </p>
      )}

      {message?.includes('completed') && (
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/app/student')}>
          Back to Home
        </button>
      )}
    </div>
  )
}
