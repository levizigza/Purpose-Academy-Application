import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { learnerGet, learnerSet } from '../practice/learnerStore'
import {
  BASIC_COMPUTER_CORE_COUNT,
  BASIC_COMPUTER_SKILLS_VIDEOS,
  COMPUTER_SKILL_FAMILIES,
  computerQuestionReplay,
  computerSkillsVideoUrl,
  type BasicComputerLesson,
  type ComputerTryKind,
} from '../pathways/packs/basicComputerSkillsVideos'
import { playFoley } from '../audio/foley'
import { SOFT_RETRY_LABEL, firePlayClear, softMissLine } from '../practice/PlayClear'
import { recordSkillAttempt } from './learningMastery'
import { isPracticeMode } from '../practice/PracticeMode'
import { StationCoach, advanceStationCoach } from '../practice/StationCoachView'
import { InstructionHearChip } from '../practice/InstructionNarration'

/** Level-4 simple English instruction chrome — translated for L1 narration. */
const COMP_INSTR = {
  watch: 'Watch this short lesson. Then try it.',
  try: 'Try it on the practice screen.',
  check: 'Answer the practice questions. Missed one? Watch that part again.',
} as const

const WATCHED_KEY = 'pa-basic-computer-skills-watched-v2'
const DONE_KEY = 'pa-basic-computer-skills-done-v2'

function loadSet(key: string): Set<string> {
  try {
    const raw = learnerGet(key)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveSet(key: string, ids: Set<string>) {
  try {
    learnerSet(key, JSON.stringify([...ids]))
  } catch {
    /* ignore */
  }
}

/** Stable choice order per question — the right answer is not always first. */
function choiceOrder(id: string, n: number): number[] {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const order = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i -= 1) {
    h = (h * 1103515245 + 12345) >>> 0
    const j = h % (i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

type Props = {
  onComplete: () => void
  onSkip?: () => void
}

type Phase = 'watch' | 'try' | 'questions' | 'cleared'

/**
 * Basic Computer Skills — Level-4 English, absolute-beginner friendly.
 * 5 Basic lessons (required, in order) + 8 Extra lessons (open after the Basics).
 * Each lesson: Watch → Try → 10 practice questions. A miss teaches, replays that part, retries.
 */
export function ComputerSkillsDrill({ onComplete, onSkip }: Props) {
  const lessons = BASIC_COMPUTER_SKILLS_VIDEOS
  const practice = isPracticeMode()
  const [watched, setWatched] = useState<Set<string>>(() => loadSet(WATCHED_KEY))
  const [done, setDone] = useState<Set<string>>(() => loadSet(DONE_KEY))
  const [idx, setIdx] = useState(() => {
    const first = lessons.findIndex((l) => l.core && !loadSet(DONE_KEY).has(l.id))
    return first < 0 ? 0 : first
  })
  const [ended, setEnded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase>('watch')
  const [qIdx, setQIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const replayEndRef = useRef<number | null>(null)
  const watchCoachedRef = useRef(false)

  const lesson = lessons[Math.min(idx, lessons.length - 1)]
  const question = lesson.questions[qIdx]
  const order = useMemo(
    () => (question ? choiceOrder(question.id, question.choices.length) : []),
    [question],
  )
  const coreDone = lessons.filter((l) => l.core && done.has(l.id)).length
  const basicsClear = coreDone >= BASIC_COMPUTER_CORE_COUNT
  const extras = lessons.filter((l) => !l.core)
  const extrasDone = extras.filter((l) => done.has(l.id)).length
  const canLeaveWatch = ended || progress >= 0.85 || watched.has(lesson.id) || practice
  const qCorrect = picked != null && question ? picked === question.answer : false
  const nextCore = lessons.find((l) => l.core && !done.has(l.id) && l.id !== lesson.id)
  const nextExtra = extras.find((l) => !done.has(l.id) && l.id !== lesson.id)

  useEffect(() => {
    setEnded(false)
    setProgress(0)
    setPhase('watch')
    setQIdx(0)
    setPicked(null)
    replayEndRef.current = null
    const el = videoRef.current
    if (el) {
      el.pause()
      el.currentTime = 0
      el.load()
    }
  }, [lesson.id])

  useEffect(() => {
    const phone =
      document.documentElement.classList.contains('pa-phone-shell') ||
      Boolean(document.querySelector('.is-phone-app'))
    if (phone) {
      const sc = document.querySelector('.iphone-scroll')
      if (sc instanceof HTMLElement) sc.scrollTop = 0
      return
    }
    document.querySelector('.comp-skills-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  function markWatched(item: BasicComputerLesson) {
    setWatched((prev) => {
      if (prev.has(item.id)) return prev
      const next = new Set(prev)
      next.add(item.id)
      saveSet(WATCHED_KEY, next)
      return next
    })
  }

  function markDone(item: BasicComputerLesson) {
    setDone((prev) => {
      if (prev.has(item.id)) return prev
      const next = new Set(prev)
      next.add(item.id)
      saveSet(DONE_KEY, next)
      recordSkillAttempt('digital', true, 10)
      return next
    })
  }

  function onTimeUpdate() {
    const el = videoRef.current
    if (!el || !el.duration) return
    const replayEnd = replayEndRef.current
    if (replayEnd != null && el.currentTime >= replayEnd) {
      el.pause()
      replayEndRef.current = null
      return
    }
    if (phase !== 'watch') return
    const p = el.currentTime / el.duration
    setProgress(p)
    if (p >= 0.85) markWatched(lesson)
  }

  function onEnded() {
    if (phase !== 'watch') return
    setEnded(true)
    markWatched(lesson)
    playFoley('whoosh')
  }

  function coachWatchDone() {
    if (idx !== 0 || watchCoachedRef.current) return
    watchCoachedRef.current = true
    advanceStationCoach('computer-skills')
  }

  function goTry() {
    if (!canLeaveWatch) return
    markWatched(lesson)
    coachWatchDone()
    videoRef.current?.pause()
    setPhase('try')
    playFoley('whoosh')
  }

  function onTryComplete() {
    if (idx === 0) advanceStationCoach('computer-skills')
    setPhase('questions')
    setQIdx(0)
    setPicked(null)
    playFoley('whoosh')
  }

  function pickChoice(i: number) {
    if (!question || picked != null) return
    const ok = i === question.answer
    setPicked(i)
    recordSkillAttempt('digital', ok)
    playFoley(ok ? 'correct' : 'wrong')
    requestAnimationFrame(() => {
      document
        .querySelector('.comp-skills-q .equip-video-actions')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  function replayPart() {
    if (!question) return
    const win = computerQuestionReplay(lesson, question)
    const el = videoRef.current
    if (!win || !el) return
    replayEndRef.current = win.end
    el.currentTime = win.start
    void el.play()
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function afterQuestion() {
    if (!question) return
    replayEndRef.current = null
    videoRef.current?.pause()
    if (!qCorrect) {
      setPicked(null)
      return
    }
    if (qIdx < lesson.questions.length - 1) {
      setQIdx((i) => i + 1)
      setPicked(null)
      playFoley('whoosh')
      return
    }
    markDone(lesson)
    setPhase('cleared')
    const coreLeft = lessons.filter((l) => l.core && !done.has(l.id) && l.id !== lesson.id).length
    firePlayClear({
      label: 'Lesson clear',
      remnant: lesson.core
        ? coreLeft > 0
          ? `${coreLeft} basic ${coreLeft === 1 ? 'lesson' : 'lessons'} left`
          : 'Basics clear — extra lessons are open'
        : 'Extra lesson clear',
      kind: lesson.core && coreLeft === 0 ? 'board' : 'micro',
    })
  }

  function openLesson(id: string) {
    const i = lessons.findIndex((l) => l.id === id)
    if (i < 0) return
    const target = lessons[i]
    if (!practice) {
      if (target.core) {
        const priorCore = lessons.slice(0, i).filter((l) => l.core)
        if (!priorCore.every((l) => done.has(l.id))) return
      } else if (!basicsClear) return
    }
    setIdx(i)
    playFoley('whoosh')
  }

  function finish() {
    recordSkillAttempt('digital', true, 20)
    playFoley('whoosh')
    onComplete()
  }

  const src = computerSkillsVideoUrl(lesson.file)
  const coachFirst = idx === 0 && !done.has(lesson.id)
  const showVideo = phase === 'watch' || phase === 'questions'
  const replay = question ? computerQuestionReplay(lesson, question) : null

  return (
    <article className="comp-skills-card equip-video-card">
      <div className="equip-video-head">
        <div>
          <p className="section-kicker">
            Unit 6 · Basic Computer Skills · {lesson.core ? 'Basic lesson' : 'Extra lesson'}
          </p>
          <h2 className="equip-video-title">{lesson.title}</h2>
          <p className="lede equip-video-purpose">{lesson.purpose}</p>
        </div>
      </div>

      <p className="play-nearby-objective" aria-live="polite">
        {phase === 'questions'
          ? `Practice question ${qIdx + 1} of ${lesson.questions.length}`
          : phase === 'try'
            ? 'Try it yourself'
            : phase === 'cleared'
              ? `${lesson.title} · clear`
              : 'Watch, then try'}
      </p>
      <InstructionHearChip
        english={
          phase === 'questions' ? COMP_INSTR.check : phase === 'try' ? COMP_INSTR.try : COMP_INSTR.watch
        }
        auto
        autoKey={`${lesson.id}-${phase}`}
        className="comp-skills-instr-hear"
      />
      <p className="train-vocab-counter">
        Basic {coreDone} of {BASIC_COMPUTER_CORE_COUNT} done
        {' · '}
        Extra {extrasDone} of {extras.length}
        {practice && onSkip ? (
          <>
            {' · '}
            <button type="button" className="linkish comp-skills-skip" onClick={onSkip}>
              Skip to site language
            </button>
          </>
        ) : null}
      </p>

      <div className="equip-video-layout">
        <nav className="equip-video-rail" aria-label="Computer skill lessons">
          {COMPUTER_SKILL_FAMILIES.map((fam) => {
            const items = lessons.filter((l) => l.family === fam.id)
            return (
              <div key={fam.id} className="equip-video-family">
                <p className="equip-video-family-label">{fam.label}</p>
                <ol className="equip-video-list">
                  {items.map((item) => {
                    const active = item.id === lesson.id
                    const finished = done.has(item.id)
                    const i = lessons.findIndex((l) => l.id === item.id)
                    const locked =
                      !practice &&
                      (item.core
                        ? !lessons.slice(0, i).filter((l) => l.core).every((l) => done.has(l.id))
                        : !basicsClear)
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`equip-video-rail-btn${active ? ' is-active' : ''}${finished ? ' is-done' : ''}${locked ? ' is-locked' : ''}`}
                          onClick={() => openLesson(item.id)}
                          disabled={locked}
                          aria-current={active ? 'step' : undefined}
                          title={locked ? (item.core ? 'Finish the lesson before this one' : 'Opens after the 5 basic lessons') : undefined}
                        >
                          <span className="equip-video-rail-n">{item.n}</span>
                          <span className="equip-video-rail-name">{item.title}</span>
                          {finished ? <span className="equip-video-rail-check" aria-hidden>✓</span> : null}
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )
          })}
        </nav>

        <div className="equip-video-main">
          {showVideo ? (
            <div className="equip-video-stage" data-coach="comp-watch">
              <video
                key={lesson.id}
                ref={videoRef}
                className="equip-video-player"
                controls
                playsInline
                preload="metadata"
                src={src}
                onPlay={() => coachWatchDone()}
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
              >
                <track kind="captions" />
              </video>
            </div>
          ) : null}

          {phase === 'watch' ? (
            <>
              <div className="equip-video-kip" aria-label="Watch, try, remember">
                <div className="equip-video-kip-item">
                  <p className="equip-video-kip-label">Watch</p>
                  <p>{lesson.watch}</p>
                </div>
                <div className="equip-video-kip-item">
                  <p className="equip-video-kip-label">Try</p>
                  <p>{lesson.tryIt}</p>
                </div>
                <div className="equip-video-kip-item">
                  <p className="equip-video-kip-label">Remember</p>
                  <p>{lesson.remember}</p>
                </div>
              </div>
              <div className="hero-actions equip-video-actions">
                <button type="button" className="btn btn-primary" disabled={!canLeaveWatch} onClick={goTry}>
                  {canLeaveWatch ? 'Try it now' : 'Keep watching, then try'}
                </button>
              </div>
            </>
          ) : null}

          {phase === 'try' ? (
            <div data-coach="comp-try">
              <ComputerTryPanel kind={lesson.tryKind} lesson={lesson} completed={false} onComplete={onTryComplete} />
            </div>
          ) : null}

          {phase === 'questions' && question ? (
            <div className="equip-video-check comp-skills-q">
              <p className="equip-video-check-kicker">Practice questions</p>
              <h3>
                Question {question.n} of {lesson.questions.length}
              </h3>
              <p className="train-check-prompt">{question.prompt}</p>
              <div className="train-choice-grid">
                {order.map((ci) => {
                  const opt = question.choices[ci]
                  let state: 'idle' | 'correct' | 'wrong' = 'idle'
                  if (picked != null) {
                    if (ci === question.answer) state = 'correct'
                    else if (ci === picked) state = 'wrong'
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`train-choice${state !== 'idle' ? ` is-${state}` : ''}`}
                      disabled={picked != null && ci !== picked && ci !== question.answer}
                      onClick={() => pickChoice(ci)}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              {picked != null ? (
                <>
                  {qCorrect ? (
                    <div className="alert ok">{question.teach}</div>
                  ) : (
                    <p className="play-soft-miss" role="status">
                      {softMissLine(question.teach)}
                    </p>
                  )}
                  <div className="hero-actions equip-video-actions">
                    {!qCorrect && replay ? (
                      <button type="button" className="btn btn-ghost" onClick={replayPart}>
                        Watch that part again · “{replay.text}”
                      </button>
                    ) : null}
                    <button type="button" className="btn btn-primary" onClick={afterQuestion}>
                      {qCorrect
                        ? qIdx >= lesson.questions.length - 1
                          ? 'Finish this lesson'
                          : 'Next question'
                        : SOFT_RETRY_LABEL}
                    </button>
                  </div>
                </>
              ) : (
                <p className="equip-video-family-blurb">Not sure? Press play on the video above.</p>
              )}
            </div>
          ) : null}

          {phase === 'cleared' ? (
            <div className="equip-video-check comp-skills-cleared">
              <p className="equip-video-check-kicker">Lesson clear</p>
              <h3>{lesson.title}</h3>
              <p className="lede">
                {basicsClear
                  ? 'You finished the 5 basic lessons. Keep going to site language — or pick an extra lesson for more practice.'
                  : `Good work. ${BASIC_COMPUTER_CORE_COUNT - coreDone} basic ${BASIC_COMPUTER_CORE_COUNT - coreDone === 1 ? 'lesson' : 'lessons'} left.`}
              </p>
              <div className="hero-actions equip-video-actions">
                {!basicsClear && nextCore ? (
                  <button type="button" className="btn btn-primary" onClick={() => openLesson(nextCore.id)}>
                    Next · {nextCore.title}
                  </button>
                ) : null}
                {basicsClear ? (
                  <button type="button" className="btn btn-primary" onClick={finish}>
                    Continue to site language
                  </button>
                ) : null}
                {basicsClear && nextExtra ? (
                  <button type="button" className="btn btn-ghost" onClick={() => openLesson(nextExtra.id)}>
                    Extra lesson · {nextExtra.title}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {phase === 'watch' && basicsClear ? (
            <div className="hero-actions equip-video-actions">
              <button type="button" className="btn btn-ghost" onClick={finish}>
                Done for now · continue to site language
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {coachFirst ? <StationCoach stationId="computer-skills" layoutKey={`${lesson.id}-${phase}`} /> : null}
    </article>
  )
}

function ComputerTryPanel({
  kind,
  lesson,
  completed,
  onComplete,
}: {
  kind: ComputerTryKind
  lesson: BasicComputerLesson
  completed: boolean
  onComplete: () => void
}) {
  return (
    <section className="comp-try" aria-label="Try it on a practice desktop">
      <p className="comp-try-kicker">Try it</p>
      <h3>{lesson.tryIt}</h3>
      {completed ? (
        <div className="alert ok">Good work. You did the steps.</div>
      ) : null}
      {!completed && kind === 'power' ? <TryPower onDone={onComplete} /> : null}
      {!completed && kind === 'mouse' ? <TryMouse onDone={onComplete} /> : null}
      {!completed && kind === 'keyboard' ? <TryKeyboard onDone={onComplete} /> : null}
      {!completed && kind === 'folder' ? <TryFolder onDone={onComplete} /> : null}
      {!completed && kind === 'subfolder' ? <TrySubfolder onDone={onComplete} /> : null}
      {!completed && kind === 'save-name' ? <TrySaveName onDone={onComplete} /> : null}
      {!completed && kind === 'paragraph' ? <TryParagraph onDone={onComplete} /> : null}
      {!completed && kind === 'window' ? <TryWindow onDone={onComplete} /> : null}
      {!completed && kind === 'search' ? <TrySearch onDone={onComplete} /> : null}
      {!completed && kind === 'email-send' ? <TryEmailSend onDone={onComplete} /> : null}
      {!completed && kind === 'email-reply' ? <TryEmailReply onDone={onComplete} /> : null}
      {!completed && kind === 'attach-save' ? <TryAttachSave onDone={onComplete} /> : null}
      {!completed && kind === 'safe' ? <TrySafe onDone={onComplete} /> : null}
    </section>
  )
}

function TryPower({ onDone }: { onDone: () => void }) {
  const steps = ['Press the power button', 'Wait for the screen', 'Click Start', 'Click Power', 'Click Shut down']
  const [i, setI] = useState(0)
  return (
    <div className="comp-desktop">
      <p className="comp-desktop-hint">Tap each step in order.</p>
      <ol className="comp-step-list">
        {steps.map((label, n) => (
          <li key={label}>
            <button
              type="button"
              className={`btn ${n === i ? 'btn-primary' : 'btn-ghost'}${n < i ? ' is-done-step' : ''}`}
              disabled={n !== i}
              onClick={() => {
                if (n === steps.length - 1) onDone()
                else setI(n + 1)
                playFoley('whoosh')
              }}
            >
              {n < i ? `✓ ${label}` : `${n + 1}. ${label}`}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function TryMouse({ onDone }: { onDone: () => void }) {
  return (
    <div className="comp-desktop">
      <p className="comp-desktop-hint">Move here, then click the yellow Continue button.</p>
      <div className="comp-fake-page">
        <p>Welcome to Purpose Academy</p>
        <button type="button" className="btn btn-primary" onClick={onDone}>
          Continue
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => playFoley('wrong')}>
          Delete account
        </button>
      </div>
    </div>
  )
}

function TryKeyboard({ onDone }: { onDone: () => void }) {
  const [value, setValue] = useState('')
  const ok = value.trim().toLowerCase() === 'safety'
  return (
    <form
      className="comp-desktop"
      onSubmit={(e: FormEvent) => {
        e.preventDefault()
        if (ok) onDone()
        else playFoley('wrong')
      }}
    >
      <p className="comp-desktop-hint">Type the word: <strong>safety</strong></p>
      <div className="field">
        <label htmlFor="comp-type-safety">Your typing</label>
        <input
          id="comp-type-safety"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoFocus
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
        Done
      </button>
    </form>
  )
}

function TryFolder({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const ok = name.trim().toLowerCase() === 'job files'
  return (
    <form
      className="comp-desktop"
      onSubmit={(e) => {
        e.preventDefault()
        if (ok) onDone()
        else playFoley('wrong')
      }}
    >
      <p className="comp-desktop-hint">New folder — type this name: <strong>Job Files</strong></p>
      <div className="comp-folder-icon" aria-hidden>
        <span className="comp-folder-glyph" />
      </div>
      <div className="field">
        <label htmlFor="comp-folder-name">Folder name</label>
        <input
          id="comp-folder-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          autoFocus
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
        Create folder
      </button>
    </form>
  )
}

function TrySubfolder({ onDone }: { onDone: () => void }) {
  const [opened, setOpened] = useState(false)
  const [name, setName] = useState('')
  const ok = name.trim().toLowerCase() === 'week 1'
  return (
    <div className="comp-desktop">
      {!opened ? (
        <>
          <p className="comp-desktop-hint">First open the folder <strong>Job Files</strong>.</p>
          <button type="button" className="comp-folder-card" onClick={() => setOpened(true)}>
            <span className="comp-folder-glyph" aria-hidden />
            Job Files
          </button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (ok) onDone()
            else playFoley('wrong')
          }}
        >
          <p className="comp-desktop-hint">
            Inside Job Files — make a folder named: <strong>Week 1</strong>
          </p>
          <div className="field">
            <label htmlFor="comp-subfolder">Folder name</label>
            <input
              id="comp-subfolder"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
            Make folder
          </button>
        </form>
      )}
    </div>
  )
}

function TrySaveName({ onDone }: { onDone: () => void }) {
  const [place, setPlace] = useState<'Desktop' | 'Documents'>('Desktop')
  const [file, setFile] = useState('')
  const ok = place === 'Documents' && file.trim().toLowerCase() === 'work plan'
  return (
    <form
      className="comp-desktop"
      onSubmit={(e) => {
        e.preventDefault()
        if (ok) {
          playFoley('whoosh')
          onDone()
        } else playFoley('wrong')
      }}
    >
      <p className="comp-desktop-hint">
        Name: <strong>Work plan</strong> · Place: <strong>Documents</strong> · then Save.
      </p>
      <div className="comp-attach-row" role="group" aria-label="Save in">
        {(['Desktop', 'Documents'] as const).map((p) => (
          <button
            key={p}
            type="button"
            className={`btn ${place === p ? 'btn-primary' : 'btn-ghost'}`}
            aria-pressed={place === p}
            onClick={() => setPlace(p)}
          >
            {place === p ? `✓ ${p}` : p}
          </button>
        ))}
      </div>
      <div className="field">
        <label htmlFor="comp-save-file">File name</label>
        <input id="comp-save-file" value={file} onChange={(e) => setFile(e.target.value)} autoComplete="off" />
      </div>
      <button type="submit" className="btn btn-primary" disabled={!file.trim()}>
        Save
      </button>
    </form>
  )
}

function TryParagraph({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState('')
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const ok = sentences.length >= 2 && text.trim().length >= 20
  return (
    <form
      className="comp-desktop"
      onSubmit={(e) => {
        e.preventDefault()
        if (ok) onDone()
        else playFoley('wrong')
      }}
    >
      <p className="comp-desktop-hint">Type 2 short sentences. End each with a period.</p>
      <div className="field">
        <label htmlFor="comp-para">Your paragraph</label>
        <textarea
          id="comp-para"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Today I learned about computers. I can save my work."
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={!ok}>
        Keep writing
      </button>
    </form>
  )
}

function TryWindow({ onDone }: { onDone: () => void }) {
  const [state, setState] = useState<'closed' | 'open' | 'hidden' | 'big'>('closed')
  const [steps, setSteps] = useState<Set<string>>(new Set())
  function did(step: string, next: typeof state) {
    const n = new Set(steps)
    n.add(step)
    setSteps(n)
    setState(next)
    playFoley('whoosh')
    if (step === 'close' && n.has('hide') && n.has('big')) window.setTimeout(onDone, 300)
  }
  return (
    <div className="comp-desktop">
      <p className="comp-desktop-hint">
        {state === 'closed'
          ? steps.has('close')
            ? 'Closed. Open it again, then hide it, make it big, and close it.'
            : 'Double-click Notes to open it.'
          : state === 'hidden'
            ? 'Hidden. Click Notes on the bottom bar to bring it back.'
            : !steps.has('hide')
              ? 'Click the line (–) to hide the window.'
              : !steps.has('big')
                ? 'Click the box (□) to make it big.'
                : 'Click the X to close it.'}
      </p>
      <div className="comp-fake-page comp-win-try">
        {state === 'closed' ? (
          <button type="button" className="btn btn-ghost" onDoubleClick={() => did('open', 'open')}>
            N · Notes (double-click)
          </button>
        ) : null}
        {state === 'open' || state === 'big' ? (
          <div className={`comp-win${state === 'big' ? ' is-big' : ''}`}>
            <div className="comp-win-bar">
              <span>Notes</span>
              <span>
                <button type="button" aria-label="Hide" onClick={() => did('hide', 'hidden')}>
                  –
                </button>
                <button type="button" aria-label="Make big" onClick={() => did('big', 'big')}>
                  □
                </button>
                <button
                  type="button"
                  aria-label="Close"
                  className="is-x"
                  onClick={() => did('close', 'closed')}
                >
                  ✕
                </button>
              </span>
            </div>
            <p>Shopping list</p>
          </div>
        ) : null}
        {state === 'hidden' ? (
          <div className="comp-win-taskbar">
            <button type="button" className="btn btn-primary" onClick={() => did('back', 'open')}>
              Notes
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function TrySearch({ onDone }: { onDone: () => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(false)
  return (
    <div className="comp-desktop">
      <p className="comp-desktop-hint">
        {results ? 'Click the first result.' : (
          <>
            Type <strong>bus times</strong>. Press Enter.
          </>
        )}
      </p>
      {!results ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (q.trim().toLowerCase().includes('bus')) {
              setResults(true)
              playFoley('whoosh')
            } else playFoley('wrong')
          }}
        >
          <div className="field">
            <label htmlFor="comp-search">Search</label>
            <input id="comp-search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!q.trim()}>
            Enter
          </button>
        </form>
      ) : (
        <div className="comp-fake-page">
          <button type="button" className="linkish" onClick={onDone}>
            City Bus — Bus times
          </button>
          <button type="button" className="linkish" onClick={() => playFoley('wrong')}>
            Win a free phone!!!
          </button>
        </div>
      )}
    </div>
  )
}

function TryEmailSend({ onDone }: { onDone: () => void }) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const ok = to.includes('@') && subject.trim().length >= 3 && body.trim().length >= 8
  return (
    <form
      className="comp-desktop comp-email"
      onSubmit={(e) => {
        e.preventDefault()
        if (ok) onDone()
        else playFoley('wrong')
      }}
    >
      <p className="comp-desktop-hint">Fill To, Subject, and message. Then Send.</p>
      <div className="field">
        <label htmlFor="comp-email-to">To</label>
        <input
          id="comp-email-to"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="instructor@work.ca"
          autoComplete="off"
        />
      </div>
      <div className="field">
        <label htmlFor="comp-email-subject">Subject</label>
        <input
          id="comp-email-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Homework"
          autoComplete="off"
        />
      </div>
      <div className="field">
        <label htmlFor="comp-email-body">Message</label>
        <textarea
          id="comp-email-body"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Hello. Here is my work."
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={!ok}>
        Send
      </button>
    </form>
  )
}

function TryEmailReply({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'inbox' | 'reply'>('inbox')
  const [reply, setReply] = useState('')
  return (
    <div className="comp-desktop comp-email">
      {mode === 'inbox' ? (
        <>
          <p className="comp-desktop-hint">You have one email. Click Reply.</p>
          <article className="comp-inbox-msg">
            <p>
              <strong>From:</strong> instructor@work.ca
            </p>
            <p>
              <strong>Subject:</strong> Welcome
            </p>
            <p>Please reply and tell me you are ready.</p>
            <button type="button" className="btn btn-primary" onClick={() => setMode('reply')}>
              Reply
            </button>
          </article>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (reply.trim().length >= 4) onDone()
            else playFoley('wrong')
          }}
        >
          <p className="comp-desktop-hint">Type a short answer, then Send.</p>
          <div className="field">
            <label htmlFor="comp-reply">Your reply</label>
            <textarea
              id="comp-reply"
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Hello. I am ready."
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={reply.trim().length < 4}>
            Send
          </button>
        </form>
      )}
    </div>
  )
}

function TryAttachSave({ onDone }: { onDone: () => void }) {
  const [picker, setPicker] = useState(false)
  const [attached, setAttached] = useState(false)
  return (
    <div className="comp-desktop">
      <p className="comp-desktop-hint">
        {attached ? 'Work plan is in the email. Click Send.' : picker ? 'Click Work plan.' : 'Click Attach.'}
      </p>
      <div className="comp-attach-row">
        {!picker && !attached ? (
          <button type="button" className="btn btn-primary" onClick={() => { setPicker(true); playFoley('whoosh') }}>
            Attach
          </button>
        ) : null}
        {picker ? (
          <>
            <button type="button" className="btn btn-primary" onClick={() => { setPicker(false); setAttached(true); playFoley('whoosh') }}>
              ▤ Work plan
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => playFoley('wrong')}>
              ▤ Shopping list
            </button>
          </>
        ) : null}
        {attached ? (
          <>
            <span className="comp-attach-chip">✓ ▤ Work plan</span>
            <button type="button" className="btn btn-primary" onClick={onDone}>
              Send
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}

function TrySafe({ onDone }: { onDone: () => void }) {
  const options = useMemo(
    () => [
      { label: 'Keep password private', ok: true },
      { label: 'Write password on the wall', ok: false },
      { label: 'Share password with strangers', ok: false },
    ],
    [],
  )
  return (
    <div className="comp-desktop">
      <p className="comp-desktop-hint">Choose the safe habit.</p>
      <div className="train-choice-grid">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            className="train-choice"
            onClick={() => {
              if (o.ok) onDone()
              else playFoley('wrong')
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
