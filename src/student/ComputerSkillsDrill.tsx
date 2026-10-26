import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  BASIC_COMPUTER_SKILLS_VIDEOS,
  COMPUTER_SKILL_FAMILIES,
  computerSkillsVideoUrl,
  type BasicComputerLesson,
  type ComputerTryKind,
} from '../pathways/packs/basicComputerSkillsVideos'
import { playFoley } from '../audio/foley'
import { recordSkillAttempt } from './learningMastery'
import { isPracticeMode } from '../practice/PracticeMode'

const WATCHED_KEY = 'pa-basic-computer-skills-watched-v1'
const DONE_KEY = 'pa-basic-computer-skills-done-v1'

function loadSet(key: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveSet(key: string, ids: Set<string>) {
  try {
    sessionStorage.setItem(key, JSON.stringify([...ids]))
  } catch {
    /* ignore */
  }
}

type Props = {
  onComplete: () => void
  onSkip?: () => void
}

type Phase = 'watch' | 'try' | 'check'

/**
 * Basic Computer Skills — Level-4 English, absolute-beginner friendly.
 * Watch a short captioned video → try a simple desktop task → answer one check.
 */
export function ComputerSkillsDrill({ onComplete, onSkip }: Props) {
  const lessons = BASIC_COMPUTER_SKILLS_VIDEOS
  const [idx, setIdx] = useState(0)
  const [watched, setWatched] = useState<Set<string>>(() => loadSet(WATCHED_KEY))
  const [done, setDone] = useState<Set<string>>(() => loadSet(DONE_KEY))
  const [ended, setEnded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase>('watch')
  const [tryReady, setTryReady] = useState(false)
  const [checkAnswer, setCheckAnswer] = useState<string | null>(null)
  const [checkCorrect, setCheckCorrect] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const practice = isPracticeMode()

  const lesson = lessons[Math.min(idx, lessons.length - 1)]
  const familyMeta = COMPUTER_SKILL_FAMILIES.find((f) => f.id === lesson.family)
  const watchedCount = lessons.filter((l) => watched.has(l.id)).length
  const doneCount = lessons.filter((l) => done.has(l.id)).length
  const allDone = doneCount >= lessons.length
  const canLeaveWatch = ended || progress >= 0.85 || watched.has(lesson.id) || practice

  useEffect(() => {
    setEnded(false)
    setProgress(0)
    setPhase('watch')
    setTryReady(false)
    setCheckAnswer(null)
    setCheckCorrect(false)
    const el = videoRef.current
    if (el) {
      el.pause()
      el.currentTime = 0
      el.load()
    }
  }, [lesson.id])

  useEffect(() => {
    /*
     * Phone: jump already sets .iphone-scroll to top. scrollIntoView(block:start)
     * on the card shoved the train title above the fold (showcase: blank chrome).
     * Desktop course: soft-scroll the card into view under the sticky topbar.
     */
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
    const p = el.currentTime / el.duration
    setProgress(p)
    if (p >= 0.85) markWatched(lesson)
  }

  function onEnded() {
    setEnded(true)
    markWatched(lesson)
    playFoley('correct')
  }

  function goTry() {
    if (!canLeaveWatch) return
    markWatched(lesson)
    setPhase('try')
    playFoley('whoosh')
  }

  function onTryComplete() {
    setTryReady(true)
    setPhase('check')
    playFoley('correct')
  }

  function pickCheck(opt: string) {
    if (checkAnswer) return
    const ok = opt === lesson.checkAnswer
    setCheckAnswer(opt)
    setCheckCorrect(ok)
    recordSkillAttempt('digital', ok)
    playFoley(ok ? 'correct' : 'wrong')
    if (ok) markDone(lesson)
  }

  function goNext() {
    if (!checkCorrect && !practice) {
      setCheckAnswer(null)
      setCheckCorrect(false)
      return
    }
    if (!done.has(lesson.id)) markDone(lesson)
    if (idx >= lessons.length - 1) {
      recordSkillAttempt('digital', true, 20)
      playFoley('whoosh')
      onComplete()
      return
    }
    setIdx((i) => i + 1)
    playFoley('whoosh')
  }

  function jumpTo(i: number) {
    if (i < 0 || i >= lessons.length) return
    if (i > idx) {
      const priorOk = lessons.slice(0, i).every((l) => done.has(l.id))
      if (!priorOk && !practice) return
    }
    setIdx(i)
    playFoley('whoosh')
  }

  const src = computerSkillsVideoUrl(lesson.file)

  return (
    <article className="comp-skills-card equip-video-card">
      <div className="equip-video-head">
        <div>
          <p className="section-kicker">Unit 6 · Basic Computer Skills</p>
          <h2 className="equip-video-title">{lesson.title}</h2>
          <p className="lede equip-video-purpose">{lesson.purpose}</p>
        </div>
      </div>

      <p className="train-vocab-counter">
        Lesson {lesson.n} of {lessons.length}
        {' · '}
        {familyMeta?.label ?? lesson.familyLabel}
        {' · '}
        {doneCount} finished
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
                    const flatIdx = lessons.findIndex((l) => l.id === item.id)
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`equip-video-rail-btn${active ? ' is-active' : ''}${finished ? ' is-done' : ''}`}
                          onClick={() => jumpTo(flatIdx)}
                          aria-current={active ? 'step' : undefined}
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
          {phase === 'watch' ? (
            <>
              <div className="equip-video-stage">
                <video
                  key={lesson.id}
                  ref={videoRef}
                  className="equip-video-player"
                  controls
                  playsInline
                  preload="metadata"
                  src={src}
                  onTimeUpdate={onTimeUpdate}
                  onEnded={onEnded}
                >
                  <track kind="captions" />
                </video>
              </div>

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
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canLeaveWatch}
                  onClick={goTry}
                >
                  {canLeaveWatch ? 'Try it now' : 'Watch to unlock practice'}
                </button>
              </div>
            </>
          ) : null}

          {phase === 'try' || phase === 'check' ? (
            <ComputerTryPanel
              kind={lesson.tryKind}
              lesson={lesson}
              completed={tryReady}
              onComplete={onTryComplete}
            />
          ) : null}

          {phase === 'check' ? (
            <div className="comp-skills-check topic-lesson-card">
              <h3>Quick check</h3>
              <p className="train-check-prompt">{lesson.checkPrompt}</p>
              <div className="train-choice-grid">
                {lesson.checkOptions.map((opt) => {
                  let state: 'idle' | 'correct' | 'wrong' = 'idle'
                  if (checkAnswer) {
                    if (opt === lesson.checkAnswer) state = 'correct'
                    else if (opt === checkAnswer) state = 'wrong'
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`train-choice${state !== 'idle' ? ` is-${state}` : ''}`}
                      disabled={!!checkAnswer && opt !== checkAnswer && opt !== lesson.checkAnswer}
                      onClick={() => pickCheck(opt)}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              {checkAnswer ? (
                <>
                  <div className={`alert ${checkCorrect ? 'ok' : 'warn'}`}>
                    {checkCorrect ? lesson.checkCorrect : lesson.checkWrong}
                  </div>
                  <button type="button" className="btn btn-primary" onClick={goNext}>
                    {checkCorrect
                      ? idx >= lessons.length - 1
                        ? allDone || done.has(lesson.id)
                          ? 'Continue to site language'
                          : 'Finish this lesson'
                        : `Next · ${lessons[idx + 1]?.title}`
                      : 'Try again'}
                  </button>
                </>
              ) : null}
            </div>
          ) : null}

          <p className="equip-video-family-blurb">
            {familyMeta?.blurb} · {watchedCount} videos started · {doneCount} lessons finished.
          </p>
        </div>
      </div>
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
      {!completed && kind === 'save-doc' ? <TrySaveDoc onDone={onComplete} /> : null}
      {!completed && kind === 'email-send' ? <TryEmailSend onDone={onComplete} /> : null}
      {!completed && kind === 'email-reply' ? <TryEmailReply onDone={onComplete} /> : null}
      {!completed && kind === 'attach-save' ? <TryAttachSave onDone={onComplete} /> : null}
      {!completed && kind === 'safe' ? <TrySafe onDone={onComplete} /> : null}
    </section>
  )
}

function TryPower({ onDone }: { onDone: () => void }) {
  const steps = ['Press power button', 'Wait for screen', 'Start → Power → Shut down']
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
        Check
      </button>
    </form>
  )
}

function TryFolder({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const ok = name.trim().toLowerCase() === 'school work'
  return (
    <form
      className="comp-desktop"
      onSubmit={(e) => {
        e.preventDefault()
        if (ok) onDone()
        else playFoley('wrong')
      }}
    >
      <p className="comp-desktop-hint">New folder — type this name: <strong>School Work</strong></p>
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
          <p className="comp-desktop-hint">First open the folder <strong>School Work</strong>.</p>
          <button type="button" className="comp-folder-card" onClick={() => setOpened(true)}>
            <span className="comp-folder-glyph" aria-hidden />
            School Work
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
            Inside School Work — create subfolder: <strong>Week 1</strong>
          </p>
          <div className="field">
            <label htmlFor="comp-subfolder">Subfolder name</label>
            <input
              id="comp-subfolder"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
            Create subfolder
          </button>
        </form>
      )}
    </div>
  )
}

function TrySaveName({ onDone }: { onDone: () => void }) {
  const [folder, setFolder] = useState('')
  const [file, setFile] = useState('')
  const ok =
    folder.trim().toLowerCase() === 'school work' && file.trim().toLowerCase() === 'safety notes'
  return (
    <form
      className="comp-desktop"
      onSubmit={(e) => {
        e.preventDefault()
        if (ok) onDone()
        else playFoley('wrong')
      }}
    >
      <p className="comp-desktop-hint">
        Save As → folder <strong>School Work</strong> → name <strong>Safety Notes</strong>
      </p>
      <div className="field">
        <label htmlFor="comp-save-folder">Folder</label>
        <input id="comp-save-folder" value={folder} onChange={(e) => setFolder(e.target.value)} autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor="comp-save-file">File name</label>
        <input id="comp-save-file" value={file} onChange={(e) => setFile(e.target.value)} autoComplete="off" />
      </div>
      <button type="submit" className="btn btn-primary" disabled={!folder.trim() || !file.trim()}>
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

function TrySaveDoc({ onDone }: { onDone: () => void }) {
  const [saved, setSaved] = useState(false)
  return (
    <div className="comp-desktop">
      <p className="comp-desktop-hint">Your document is open. Click Save.</p>
      <div className="comp-fake-page">
        <p className="comp-doc-title">Safety Notes</p>
        <p>Wear your hard hat on site.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setSaved(true)
            playFoley('correct')
            window.setTimeout(onDone, 400)
          }}
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
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
          placeholder="instructor@school.ca"
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
              <strong>From:</strong> instructor@school.ca
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
  const [attached, setAttached] = useState(false)
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    if (attached && saved) onDone()
  }, [attached, saved, onDone])
  return (
    <div className="comp-desktop">
      <p className="comp-desktop-hint">1) Attach Safety Notes. 2) Save the file from the email.</p>
      <div className="comp-attach-row">
        <button
          type="button"
          className={`btn ${attached ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => {
            setAttached(true)
            playFoley('whoosh')
          }}
          disabled={attached}
        >
          {attached ? '✓ Attached Safety Notes' : 'Attach · Safety Notes'}
        </button>
        <button
          type="button"
          className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => {
            setSaved(true)
            playFoley('whoosh')
          }}
          disabled={!attached || saved}
        >
          {saved ? '✓ Saved to School Work' : 'Save attachment to School Work'}
        </button>
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
