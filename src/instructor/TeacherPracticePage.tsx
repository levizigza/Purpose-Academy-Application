import { useEffect, useState, type CSSProperties } from 'react'
import './instructorPathways.css'
import { Link, useNavigate } from 'react-router-dom'
import { useTeacherPracticeBase } from './teacherPracticePaths'
import {
  INSTRUCTOR_STREAM_ORDER,
  instructorStream,
  type InstructorStream,
  type InstructorStreamId,
  type StreamDoc,
  type StreamWeek,
} from './instructorCurricula'
import { papersForWeek } from './weekPapers'
import { paperRole, papersByRole, splitDayMove, successCriteria, type PaperRole } from './lessonCycle'
import {
  getInstructorPracticeName,
  getInstructorPracticePathway,
  getInstructorPracticeSession,
  getInstructorPracticeStep,
  getInstructorPracticeView,
  hasInstructorPracticeFeedbackAck,
  instructorPracticeFeedbackKey,
  instructorSessionsClearedCount,
  isInstructorPracticeMode,
  isInstructorSessionCleared,
  markInstructorPracticeFeedbackAck,
  markInstructorSessionCleared,
  openInstructorPracticeChat,
  restartInstructorPathway,
  setInstructorPracticePathway,
  setInstructorPracticeSession,
  setInstructorPracticeStep,
  setInstructorPracticeView,
  shouldAskInstructorPracticeFeedback,
} from '../practice/InstructorPracticeMode'
import { NavCueTarget, NavGlowWrap } from '../practice/NavCue'
import { NAV_CUE } from '../practice/navCues'
import { pathwayIcon, pathwayMeta, pathwayPhoto } from '../pathways/meta'
import { playFoley, unlockFoley } from '../audio/foley'

function useInstructorPracticeLive() {
  const [, bump] = useState(0)
  useEffect(() => {
    const sync = () => bump((n) => n + 1)
    window.addEventListener('pa-instructor-practice-changed', sync)
    window.addEventListener('pa-instructor-practice-started', sync)
    window.addEventListener('pa-instructor-practice-restarted', sync)
    window.addEventListener('pa-instructor-practice-feedback-ack', sync)
    return () => {
      window.removeEventListener('pa-instructor-practice-changed', sync)
      window.removeEventListener('pa-instructor-practice-started', sync)
      window.removeEventListener('pa-instructor-practice-restarted', sync)
      window.removeEventListener('pa-instructor-practice-feedback-ack', sync)
    }
  }, [])
  return {
    active: isInstructorPracticeMode(),
    name: getInstructorPracticeName(),
    view: getInstructorPracticeView(),
    pathwayId: getInstructorPracticePathway(),
    sessionN: getInstructorPracticeSession(),
  }
}

type DocKind = PaperRole | 'video'

function docKind(doc: StreamDoc): DocKind {
  if (doc.title.toLowerCase().includes('video')) return 'video'
  return paperRole(doc)
}

const DOC_KIND_LABEL: Record<DocKind, string> = {
  plan: 'Plan',
  teach: 'Teach',
  evidence: 'Check',
  exam: 'Exam',
  video: 'Video',
}

function isReviewDoc(doc: StreamDoc): boolean {
  const title = doc.title.toLowerCase()
  if (title.includes('video')) return false
  return /marking|checklist|examination|exam|answer key/.test(title)
}

function splitDocs(docs: StreamDoc[]) {
  return {
    teach: docs.filter((doc) => !isReviewDoc(doc)),
    review: docs.filter((doc) => isReviewDoc(doc)),
  }
}

function nextOpenWeek(stream: InstructorStream): StreamWeek | undefined {
  return stream.weeks.find((week) => !isInstructorSessionCleared(stream.id, week.n))
}

/** Hour labels repeat. The lesson sentence is the name a person can follow. */
function blockName(step: { label: string; text: string }, steps: { label: string }[]) {
  const vague = /^\d+\s*hours?$/i.test(step.label.trim())
  const duplicated = steps.filter((item) => item.label === step.label).length > 1
  const sentence = step.text.replace(/\s+/g, ' ').trim()
  if ((vague || duplicated) && sentence) return sentence
  return step.label
}

function cueStreamId(openId: string | null): InstructorStreamId {
  const known = INSTRUCTOR_STREAM_ORDER.find((id) => id === openId)
  if (known) return known
  for (const id of INSTRUCTOR_STREAM_ORDER) {
    const stream = instructorStream(id)
    if (stream && nextOpenWeek(stream)) return id
  }
  return 'construction'
}

function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="tp-meter" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}

function Trail({ crumbs }: { crumbs: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="tp-trail" aria-label="Where you are">
      {crumbs.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="tp-trail-item">
          {index > 0 ? <span className="tp-trail-sep" aria-hidden>/</span> : null}
          {crumb.onClick ? (
            <button type="button" onClick={crumb.onClick}>
              {crumb.label}
            </button>
          ) : (
            <strong>{crumb.label}</strong>
          )}
        </span>
      ))}
    </nav>
  )
}

const PATH_STEPS = [
  { id: 'stream', label: 'Stream', hint: 'Choose a faculty' },
  { id: 'week', label: 'Week', hint: 'Open the next week' },
  { id: 'block', label: 'Block', hint: 'Teach this block' },
  { id: 'clear', label: 'Clear', hint: 'Mark the week done' },
] as const

function PathMap({
  current,
  onJump,
}: {
  current: (typeof PATH_STEPS)[number]['id']
  onJump?: Partial<Record<(typeof PATH_STEPS)[number]['id'], () => void>>
}) {
  const at = PATH_STEPS.findIndex((step) => step.id === current)
  return (
    <ol className="tp-pathmap" aria-label="The four rooms, in order">
      {PATH_STEPS.map((step, index) => {
        const jump = index < at ? onJump?.[step.id] : undefined
        return (
          <li key={step.id} className={index === at ? 'is-here' : index < at ? 'is-done' : ''}>
            {jump ? (
              <button type="button" onClick={jump}>
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
                <em>Back to this room</em>
              </button>
            ) : (
              <>
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
                <em>{index === at ? 'You are here' : step.hint}</em>
              </>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Follow({ step, title, detail }: { step: number; title: string; detail: string }) {
  return (
    <section className="tp-follow" aria-label="What to do now">
      <span>Step {step} of 4</span>
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
      </div>
    </section>
  )
}

function DocRow({ doc }: { doc: StreamDoc }) {
  const kind = docKind(doc)
  return (
    <li>
      <a className="tp-doc" href={doc.href} target="_blank" rel="noreferrer">
        <span className={`tp-doc-mark is-${kind}`}>{DOC_KIND_LABEL[kind]}</span>
        <span className="tp-doc-copy">
          <strong>{doc.title}</strong>
          <span>{doc.note}</span>
        </span>
        <span className="tp-doc-go">Open</span>
      </a>
    </li>
  )
}

function DocShelf({
  title,
  kicker,
  docs,
  empty,
}: {
  title: string
  kicker: string
  docs: StreamDoc[]
  empty: string
}) {
  return (
    <section className="panel tp-card tp-shelf">
      <p className="tp-kicker">{kicker}</p>
      <h2>{title}</h2>
      {docs.length === 0 ? <p className="tp-note">{empty}</p> : null}
      <ul className="tp-doc-list">
        {docs.map((item) => (
          <DocRow key={item.href + item.title} doc={item} />
        ))}
      </ul>
    </section>
  )
}

function TeachingCycle() {
  const steps = [
    ['1', 'Aim', 'Say what they will be able to do.'],
    ['2', 'Model', 'Show the task before they try it.'],
    ['3', 'Practise', 'Do it together, then they do it.'],
    ['4', 'Evidence', 'Keep work that matches the aim.'],
  ]
  return (
    <ol className="tp-cycle" aria-label="How a week is taught">
      {steps.map(([n, title, text]) => (
        <li key={title}>
          <span>{n}</span>
          <strong>{title}</strong>
          <em>{text}</em>
        </li>
      ))}
    </ol>
  )
}

function RootTree({
  name,
  openId,
  sessionN,
}: {
  name: string
  openId: string | null
  sessionN: number
}) {
  const pointed = cueStreamId(openId)
  return (
    <div className="stack tp-page">
      <header className="tp-head">
        <div>
          <p className="tp-kicker on-dark">Instructor Practice</p>
          <h1>Choose a stream</h1>
          <p className="lede">
            {name ? `${name}. ` : ''}
            The same four rooms every time: stream, then months, then one week, then the block you teach.
          </p>
        </div>
      </header>
      <Follow
        step={1}
        title="Choose one stream"
        detail="Open the marked card. You land on Month 1 through Month 8, in order. Each month holds its own weeks."
      />
      <Trail crumbs={[{ label: 'Streams' }]} />
      <PathMap current="stream" />

      <div className="tp-root-grid">
        {INSTRUCTOR_STREAM_ORDER.map((id) => {
          const stream = instructorStream(id)
          if (!stream) return null
          const tone = pathwayMeta(id)
          const cleared = instructorSessionsClearedCount(id)
          const open = openId === id
          const pointedHere = pointed === id
          return (
            <article className={`tp-root${open ? ' is-open' : ''}`} key={id}>
              <div className="panel tp-card tp-root-card" style={{ '--tp-accent': tone.accent } as CSSProperties}>
                <div className="tp-banner">
                  <img src={pathwayPhoto(id)} alt="" />
                </div>
                <img className="tp-stream-icon" src={pathwayIcon(id)} alt="" />
                <p className="tp-kicker">{stream.program}</p>
                <h2>{stream.title}</h2>
                <p className="tp-summary">{stream.summary}</p>
                {stream.credit ? (
                  <p className="tp-credit">
                    Instructor: <strong>{stream.credit}</strong>
                  </p>
                ) : null}
                <Meter value={cleared} max={stream.weeks.length} label={`${cleared} of ${stream.weeks.length} weeks clear`} />
                <p className="tp-note">
                  {cleared} of {stream.weeks.length} weeks clear
                  {open ? ` · Week ${sessionN} was the last one opened` : ''}
                </p>
                <ol className="tp-pips" aria-label="Months in this stream">
                  {stream.months.map((month) => {
                    const weeks = stream.weeks.filter((week) => week.month === month.n)
                    const done = weeks.filter((week) => isInstructorSessionCleared(id, week.n)).length
                    const state = weeks.length > 0 && done === weeks.length ? 'is-full' : done > 0 ? 'is-some' : ''
                    return (
                      <li key={month.n} className={state} title={month.title}>
                        <span>{month.n}</span>
                      </li>
                    )
                  })}
                </ol>
                <p className="tp-leads">Opens the eight months</p>
                {pointedHere ? (
                  <NavCueTarget cueId={NAV_CUE.instructorStream(id)} arrowLabel="Open this stream" arrowSide="above">
                    <NavGlowWrap cueId={NAV_CUE.instructorStream(id)}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          void unlockFoley().then(() => playFoley('latch'))
                          setInstructorPracticePathway(id)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      >
                        Open {stream.title}
                      </button>
                    </NavGlowWrap>
                  </NavCueTarget>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      void unlockFoley().then(() => playFoley('latch'))
                      setInstructorPracticePathway(id)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    Open {stream.title}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function StreamHub({
  stream,
  base,
  name,
  practice,
}: {
  stream: InstructorStream
  base: string
  name: string
  practice: boolean
}) {
  const navigate = useNavigate()
  const clearedCount = instructorSessionsClearedCount(stream.id)
  const shelves = splitDocs(stream.docs)
  const upcoming = nextOpenWeek(stream)
  const [openMonth, setOpenMonth] = useState(upcoming?.month ?? stream.months[0]?.n ?? 1)

  function openWeek(week: StreamWeek) {
    void unlockFoley().then(() => playFoley('latch'))
    setInstructorPracticeSession(week.n)
    setInstructorPracticeStep(0)
    setInstructorPracticeView('session')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="stack tp-page tp-hub">
      <header className="tp-head">
        <div>
          <p className="tp-kicker on-dark">Instructor · {stream.title}</p>
          <h1>{stream.program}</h1>
          <p className="lede">
            {name ? `${name}. ` : ''}
            Months run in order. Inside a month, teach the week marked Next before the later ones.
          </p>
          {stream.credit ? (
            <p className="tp-credit on-dark">
              Instructor: <strong>{stream.credit}</strong>
            </p>
          ) : null}
        </div>
        <div className="tp-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setInstructorPracticeView('roots')}>
            All streams
          </button>
          {stream.id === 'community' ? (
            <Link className="btn btn-primary" to={`${base}/workbooks`}>
              Open 25 picture workbooks
            </Link>
          ) : null}
          <Link className="btn btn-ghost" to="/journey">
            Student Practice
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              restartInstructorPathway(stream.id)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            Start this pathway over
          </button>
        </div>
      </header>

      <Follow
        step={2}
        title={upcoming ? `Open week ${upcoming.n}` : 'Every week is clear'}
        detail={
          upcoming
            ? `${upcoming.title}. This opens the aim, then the days in order, then only this week’s papers.`
            : 'Open any week below if you want to teach it again. The papers stay with that week.'
        }
      />
      <Trail
        crumbs={[
          { label: 'Streams', onClick: () => setInstructorPracticeView('roots') },
          { label: stream.title },
        ]}
      />
      <PathMap current="week" onJump={{ stream: () => setInstructorPracticeView('roots') }} />
      <TeachingCycle />

      {upcoming ? (
        <NavCueTarget cueId={NAV_CUE.instructorWeek(stream.id, upcoming.n)} arrowLabel="Teach this week" arrowSide="above">
          <section className="panel tp-card tp-next">
            <p className="tp-kicker">Do this now</p>
            <h2>
              Week {upcoming.n} · {upcoming.title}
            </h2>
            <p>Month {upcoming.month}. The gold week in the list below is this same week.</p>
            <NavGlowWrap cueId={NAV_CUE.instructorWeek(stream.id, upcoming.n)}>
              <button type="button" className="btn btn-primary" onClick={() => openWeek(upcoming)}>
                Open week {upcoming.n}
              </button>
            </NavGlowWrap>
          </section>
        </NavCueTarget>
      ) : (
        <section className="panel tp-card tp-next">
          <p className="tp-kicker">Progress</p>
          <h2>All {stream.weeks.length} weeks are clear</h2>
          <p>Open any week below to teach it again. The papers stay with that week.</p>
        </section>
      )}

      <div className="tp-hub-layout">
        <div className="tp-months">
          <section className="panel tp-card tp-progress-card">
            <p className="tp-kicker">Progress</p>
            <h2>
              {clearedCount} of {stream.weeks.length} weeks clear
            </h2>
            <Meter
              value={clearedCount}
              max={stream.weeks.length}
              label={`${clearedCount} of ${stream.weeks.length} weeks clear`}
            />
          </section>

          {stream.months.map((month) => {
            const weeks = stream.weeks.filter((week) => week.month === month.n)
            const doneCount = weeks.filter((week) => isInstructorSessionCleared(stream.id, week.n)).length
            const open = openMonth === month.n
            return (
              <section className={`panel tp-card tp-month${open ? ' is-open' : ''}`} key={month.n}>
                <button
                  type="button"
                  className="tp-month-toggle"
                  aria-expanded={open}
                  onClick={() => setOpenMonth(open ? 0 : month.n)}
                >
                  <span className="tp-month-n">{month.n}</span>
                  <span>
                    <span className="tp-kicker">Month {month.n} · {doneCount} of {weeks.length} weeks clear</span>
                    <strong className="tp-month-title">{month.title}</strong>
                  </span>
                  <em>{open ? 'Hide weeks' : 'Show weeks'}</em>
                </button>
                {open ? (
                  <>
                    <p>{month.objective}</p>
                    <p className="tp-note">Assessment: {month.assessment}</p>
                    {month.scope ? <p className="tp-note">{month.scope}</p> : null}
                    <Meter value={doneCount} max={weeks.length} label={`${doneCount} of ${weeks.length} weeks clear this month`} />
                    <div className="tp-week-list">
                      {weeks.map((week) => {
                        const done = isInstructorSessionCleared(stream.id, week.n)
                        const isNext = upcoming?.n === week.n
                        return (
                          <button
                            type="button"
                            className={`tp-week${done ? ' is-clear' : ''}${isNext ? ' is-next' : ''}`}
                            key={week.n}
                            onClick={() => openWeek(week)}
                          >
                            <span className="tp-week-n">{week.n}</span>
                            <strong>{week.title}</strong>
                            <em>{done ? 'Clear · open again' : isNext ? 'Next · opens the week' : 'Opens the week'}</em>
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : null}
              </section>
            )
          })}
        </div>

        <aside className="tp-side" aria-label="Faculty papers">
          <p className="tp-side-lead">These papers cover the whole stream. Open a week when you need that week’s own plan and examination.</p>
          <DocShelf kicker="Find the papers" title="Documents" docs={shelves.teach} empty="No teaching papers are linked for this stream." />
          <DocShelf kicker="Mark the week" title="Reviews" docs={shelves.review} empty="No marking papers are linked for this stream." />
          {stream.dayNote ? <p className="tp-side-lead">{stream.dayNote}</p> : null}
          <p className="tp-side-lead">{stream.studentPath}</p>
          {practice ? (
            <button type="button" className="btn btn-secondary on-light" onClick={() => openInstructorPracticeChat()}>
              Leave a review of this stream
            </button>
          ) : null}
        </aside>
      </div>

      <div className="tp-workbench-exit">
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
          Done for now · Toolbox
        </button>
      </div>
    </div>
  )
}

function CyclePapers({ docs }: { docs: StreamDoc[] }) {
  const grouped = papersByRole(docs)
  const groups = [
    { kicker: 'Before you teach', title: 'Plan', docs: grouped.plan, empty: 'No plan is filed for this part.' },
    { kicker: 'During the block', title: 'Teach from', docs: grouped.teach, empty: 'No teaching paper is filed for this part.' },
    { kicker: 'While they work', title: 'Evidence', docs: grouped.evidence, empty: 'No checklist or marking guide is filed for this part.' },
    { kicker: 'At the end of the week', title: 'Examination', docs: grouped.exam, empty: 'No examination is filed for this part.' },
  ]
  return (
    <div className="tp-paper-stack">
      {groups.map((group) => (
        <DocShelf key={group.title} kicker={group.kicker} title={group.title} docs={group.docs} empty={group.empty} />
      ))}
    </div>
  )
}

function WeekWorkbench({
  stream,
  week,
  practice,
}: {
  stream: InstructorStream
  week: StreamWeek
  practice: boolean
}) {
  const navigate = useNavigate()
  const month = stream.months.find((item) => item.n === week.month)
  const stepCount = Math.max(1, week.steps.length)
  const stepIdx = getInstructorPracticeStep(stepCount)
  const step = week.steps[stepIdx] || week.steps[0]
  const moves = step ? splitDayMove(step.text) : null
  const cleared = isInstructorSessionCleared(stream.id, week.n)
  const [feedbackPrompt, setFeedbackPrompt] = useState(false)
  const shelves = splitDocs(stream.docs)
  const specificPapers = papersForWeek(stream.id, week.n)
  const cueId = NAV_CUE.instructorBlock(stream.id, week.n)

  function goHub() {
    setInstructorPracticeView('hub')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function finishWeek() {
    markInstructorSessionCleared(stream.id, week.n)
    const key = instructorPracticeFeedbackKey(week.n, stream.id)
    if (practice && shouldAskInstructorPracticeFeedback(week.n) && !hasInstructorPracticeFeedbackAck(key)) {
      setFeedbackPrompt(true)
      return
    }
    goHub()
  }

  function advance() {
    void unlockFoley().then(() => playFoley('latch'))
    if (stepIdx < week.steps.length - 1) {
      setInstructorPracticeStep(stepIdx + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    finishWeek()
  }

  function ackFeedback(leftNote: boolean) {
    markInstructorPracticeFeedbackAck(instructorPracticeFeedbackKey(week.n, stream.id))
    setFeedbackPrompt(false)
    if (leftNote) openInstructorPracticeChat()
    goHub()
  }

  const nextStep = week.steps[stepIdx + 1]
  const hereName = step ? blockName(step, week.steps) : 'this block'
  const nextName = nextStep ? blockName(nextStep, week.steps) : ''
  const continueLabel = nextStep ? `Continue to ${nextName}` : 'Clear this week'

  return (
    <div className="tp-workbench stack">
      <header className="tp-head">
        <p className="tp-kicker on-dark">
          Month {week.month}
          {month ? ` · ${month.title}` : ''} · 30 hours
        </p>
        <h1>{week.title}</h1>
        <p className="lede">
          {stream.title} · Week {week.n} · block {stepIdx + 1} of {stepCount}
          {cleared ? ' · This week is already clear' : ''}
        </p>
      </header>

      <Follow
        step={nextStep ? 3 : 4}
        title={nextStep ? hereName : 'Clear this week'}
        detail={
          nextStep
            ? `This is the block marked You are here. The button moves you to ${nextName}.`
            : 'This is the last block. The button marks the week clear and returns you to the months.'
        }
      />
      <Trail
        crumbs={[
          { label: 'Streams', onClick: () => setInstructorPracticeView('roots') },
          { label: stream.title, onClick: goHub },
          { label: `Week ${week.n}` },
        ]}
      />
      <PathMap
        current={stepIdx < week.steps.length - 1 ? 'block' : 'clear'}
        onJump={{
          stream: () => setInstructorPracticeView('roots'),
          week: goHub,
        }}
      />

      <div className="tp-week-layout">
        <div className="tp-week-main">
          <div className="tp-shelves">
            <section className="panel tp-card tp-shelf">
              <p className="tp-kicker">Aim</p>
              <h2>What they will be able to do</h2>
              {week.outcomes.length > 0 ? (
                <ul className="tp-criteria">
                  {week.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              ) : month ? (
                <p>{month.objective}</p>
              ) : null}
              {stream.dayNote && stream.id === 'community' ? <p className="tp-note">{stream.dayNote}</p> : null}
            </section>
            <section className="panel tp-card tp-shelf">
              <p className="tp-kicker">Success</p>
              <h2>You will know it landed when</h2>
              {month ? (
                <ul className="tp-criteria">
                  {successCriteria(month.assessment).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="tp-note">Use the week’s evidence before you clear it.</p>
              )}
              {month?.scope ? <p className="tp-note">{month.scope}</p> : null}
            </section>
          </div>

          <ol className="tp-phase-rail" aria-label="Week blocks">
            {week.steps.map((item, i) => (
              <li key={`${item.label}-${i}`} className={i === stepIdx ? 'is-current' : i < stepIdx ? 'is-done' : ''}>
                <button
                  type="button"
                  disabled={i > stepIdx && !cleared}
                  onClick={() => {
                    if (i <= stepIdx || cleared) setInstructorPracticeStep(i)
                  }}
                >
                  <span aria-hidden>{i + 1}</span>
                  <strong>{blockName(item, week.steps)}</strong>
                  <em>
                    {item.label !== blockName(item, week.steps) ? `${item.label} · ` : ''}
                    {i === stepIdx ? 'You are here' : i < stepIdx ? 'Done' : 'Later'}
                  </em>
                </button>
              </li>
            ))}
          </ol>

          {step ? (
            <article className="panel tp-card tp-phase-card" aria-live="polite">
              <p className="tp-kicker">This block{step.label !== hereName ? ` · ${step.label}` : ''}</p>
              <h2>{hereName}</h2>
              {moves ? (
                <div className="tp-moves">
                  <div className="tp-move">
                    <p className="tp-kicker">Model</p>
                    <p>{moves.model}</p>
                  </div>
                  <div className="tp-move">
                    <p className="tp-kicker">Practise together</p>
                    <p>{moves.practise}</p>
                  </div>
                  {moves.evidence ? (
                    <div className="tp-move">
                      <p className="tp-kicker">Keep this evidence</p>
                      <p>{moves.evidence}</p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <p>{step.text}</p>
                  <p className="tp-note">
                    Model it first. Practise it with the group. Keep one piece of work before you leave this block.
                  </p>
                </>
              )}
              <NavCueTarget cueId={cueId} arrowLabel={stepIdx < week.steps.length - 1 ? 'Next block' : 'Clear this week'} arrowSide="above">
                <NavGlowWrap cueId={cueId}>
                  <button type="button" className="btn btn-primary" onClick={advance}>
                    {continueLabel}
                  </button>
                </NavGlowWrap>
              </NavCueTarget>
            </article>
          ) : null}
        </div>

        <aside className="tp-side" aria-label="This week's papers">
          <p className="tp-side-lead">This week’s papers. Plan, then teach, then the checklist, then the examination.</p>
          <CyclePapers docs={specificPapers.length > 0 ? specificPapers : stream.docs} />
          {specificPapers.length > 0 ? (
            <details className="tp-all-papers">
              <summary>All documents and reviews for {stream.title}</summary>
              <div className="tp-paper-stack">
                <DocShelf kicker="Whole stream" title="Documents" docs={shelves.teach} empty="" />
                <DocShelf kicker="Whole stream" title="Reviews" docs={shelves.review} empty="" />
              </div>
            </details>
          ) : null}
          {practice ? (
            <button type="button" className="btn btn-secondary on-light" onClick={() => openInstructorPracticeChat()}>
              Leave a review of this week
            </button>
          ) : null}
          <p className="tp-side-lead">{stream.studentPath}</p>
          <Link className="btn btn-ghost" to="/journey">
            Open Student Practice
          </Link>
        </aside>
      </div>

      {feedbackPrompt && (
        <div className="tp-feedback-prompt panel tp-card" role="dialog" aria-modal="true">
          <h3>This month is finished</h3>
          <p>Open the feedback chat if a week in this month needs a review. Or return to the months without a note.</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => ackFeedback(true)}>
              Open feedback chat
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => ackFeedback(false)}>
              Continue without a note
            </button>
          </div>
        </div>
      )}

      <div className="tp-workbench-exit">
        <button type="button" className="btn btn-ghost" onClick={goHub}>
          ← {stream.title} weeks
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
          Done for now · Toolbox
        </button>
      </div>
    </div>
  )
}

export function TeacherPracticePage() {
  const base = useTeacherPracticeBase()
  const live = useInstructorPracticeLive()
  const stream = instructorStream(live.pathwayId)
  const practice = live.active && !base.startsWith('/app/')

  if (live.view === 'roots' || !stream) {
    return <RootTree name={live.name} openId={live.pathwayId} sessionN={live.sessionN} />
  }

  if (live.view === 'session') {
    const week = stream.weeks.find((item) => item.n === live.sessionN) || stream.weeks[0]
    if (week) return <WeekWorkbench stream={stream} week={week} practice={practice} />
  }

  return <StreamHub stream={stream} base={base} name={live.name} practice={practice} />
}
