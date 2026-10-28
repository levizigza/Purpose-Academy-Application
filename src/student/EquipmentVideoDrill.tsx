import { useEffect, useMemo, useRef, useState } from 'react'
import { pathwayImage } from '../pathways'
import { learnerGet, learnerSet } from '../practice/learnerStore'
import {
  EQUIPMENT_FAMILIES,
  WAREHOUSE_EQUIPMENT_VIDEOS,
  equipmentVideoUrl,
  type WarehouseEquipmentLesson,
} from '../pathways/packs/warehouseEquipmentVideos'
import {
  VIDEO_SEGMENT_GATES_ENABLED as WAREHOUSE_GATES_ENABLED,
  isEquipmentVideoUnlocked,
  quizForEquipmentLesson,
  type WarehouseVideoChoiceId,
  type WarehouseVideoQuestion,
} from '../pathways/packs/warehouseEquipmentVideoQuizzes'
import {
  CONSTRUCTION_EQUIPMENT_FAMILIES,
  CONSTRUCTION_EQUIPMENT_VIDEOS,
  constructionEquipmentVideoUrl,
  type ConstructionEquipmentLesson,
} from '../pathways/packs/constructionEquipmentVideos'
import {
  VIDEO_SEGMENT_GATES_ENABLED as CONSTRUCTION_GATES_ENABLED,
  isConstructionEquipmentVideoUnlocked,
  quizForConstructionEquipmentLesson,
  type ConstructionVideoChoiceId,
  type ConstructionVideoQuestion,
} from '../pathways/packs/constructionEquipmentVideoQuizzes'
import { playFoley } from '../audio/foley'
import { SOFT_RETRY_LABEL, firePlayClear, softMissLine } from '../practice/PlayClear'
import { recordSkillAttempt } from './learningMastery'
import { isPracticeMode } from '../practice/PracticeMode'
import { StationCoach, advanceStationCoach } from '../practice/StationCoach'

export type EquipmentVideoPack = 'warehouse' | 'construction'

type EquipLesson = WarehouseEquipmentLesson | ConstructionEquipmentLesson
type EquipChoiceId = WarehouseVideoChoiceId | ConstructionVideoChoiceId
type EquipQuestion = WarehouseVideoQuestion | ConstructionVideoQuestion

type Phase = 'watch' | 'answer'

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

type Props = {
  /** Default warehouse — Logistics Unit 8. Construction uses the site-equipment pack. */
  pack?: EquipmentVideoPack
  onComplete: () => void
  onSkip?: () => void
}

const PACK_META = {
  warehouse: {
    watchedKey: 'pa-warehouse-equipment-watched-v1',
    clearedKey: 'pa-warehouse-equipment-cleared-v1',
    unitKicker: 'Unit 8 · Video · Warehouse Equipment',
    clearFloor:
      'practice questions done. This video pairs with the warehouse floor — stay clear of powered equipment unless you are certified elsewhere.',
    gatesEnabled: WAREHOUSE_GATES_ENABLED,
  },
  construction: {
    watchedKey: 'pa-construction-equipment-watched-v1',
    clearedKey: 'pa-construction-equipment-cleared-v1',
    unitKicker: 'Unit 8 · Video · Construction Equipment',
    clearFloor:
      'practice questions done. This video pairs with the construction site — stay clear of powered equipment unless you are certified elsewhere.',
    gatesEnabled: CONSTRUCTION_GATES_ENABLED,
  },
} as const

/**
 * Equipment Video — watch whole video → practice questions → continue.
 * Soft-gate architecture ready (`VIDEO_SEGMENT_GATES_ENABLED`); showcase keeps all open.
 * Packs: warehouse (Logistics) · construction (Construction).
 */
export function EquipmentVideoDrill({ pack = 'warehouse', onComplete, onSkip }: Props) {
  const meta = PACK_META[pack]
  const lessons: EquipLesson[] =
    pack === 'construction' ? CONSTRUCTION_EQUIPMENT_VIDEOS : WAREHOUSE_EQUIPMENT_VIDEOS
  const families =
    pack === 'construction' ? CONSTRUCTION_EQUIPMENT_FAMILIES : EQUIPMENT_FAMILIES
  const lessonIds = useMemo(() => lessons.map((l) => l.id), [lessons])
  const [idx, setIdx] = useState(0)
  const [watched, setWatched] = useState<Set<string>>(() => loadSet(meta.watchedKey))
  const [cleared, setCleared] = useState<Set<string>>(() => loadSet(meta.clearedKey))
  const [ended, setEnded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase>('watch')
  const [qIdx, setQIdx] = useState(0)
  const [picked, setPicked] = useState<EquipChoiceId | null>(null)
  const [qCorrect, setQCorrect] = useState(false)
  const [setJustCleared, setSetJustCleared] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const replayEndRef = useRef<number | null>(null)
  const pulseWatchedRef = useRef<Set<string>>(new Set())
  const watchCoachedRef = useRef(false)
  const practice = isPracticeMode()

  const lesson = lessons[Math.min(idx, lessons.length - 1)]
  const familyMeta = families.find((f) => f.id === lesson.family)
  const quiz =
    pack === 'construction'
      ? quizForConstructionEquipmentLesson(lesson.id)
      : quizForEquipmentLesson(lesson.id)
  const questions: EquipQuestion[] = quiz?.questions ?? []
  const question: EquipQuestion | undefined = questions[qIdx]
  const watchedCount = lessons.filter((l) => watched.has(l.id)).length
  const clearedCount = lessons.filter((l) => cleared.has(l.id)).length
  const allCleared = clearedCount >= lessons.length
  const canLeaveWatch =
    ended || progress >= 0.9 || watched.has(lesson.id) || cleared.has(lesson.id) || practice
  const lessonCleared = cleared.has(lesson.id)
  const coachFirst = idx === 0
  const gatesOn = meta.gatesEnabled

  function isUnlocked(index: number, clearedIds: ReadonlySet<string>): boolean {
    return pack === 'construction'
      ? isConstructionEquipmentVideoUnlocked(index, clearedIds, lessonIds, gatesOn)
      : isEquipmentVideoUnlocked(index, clearedIds, lessonIds, gatesOn)
  }

  function coachWatchDone() {
    if (idx !== 0 || watchCoachedRef.current) return
    watchCoachedRef.current = true
    advanceStationCoach('equipment-video')
  }

  useEffect(() => {
    setEnded(false)
    setProgress(0)
    setPhase('watch')
    setQIdx(0)
    setPicked(null)
    setQCorrect(false)
    setSetJustCleared(false)
    replayEndRef.current = null
    if (idx === 0) watchCoachedRef.current = false
    const el = videoRef.current
    if (el) {
      el.pause()
      el.currentTime = 0
      el.load()
    }
  }, [lesson.id, idx])

  useEffect(() => {
    /* Same phone rule as Computer Skills — do not scroll the title off the fold. */
    const phone =
      document.documentElement.classList.contains('pa-phone-shell') ||
      Boolean(document.querySelector('.is-phone-app'))
    if (phone) {
      const sc = document.querySelector('.iphone-scroll')
      if (sc instanceof HTMLElement) sc.scrollTop = 0
      return
    }
    document.querySelector('.equip-video-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const familyLessons = useMemo(
    () => lessons.filter((l) => l.family === lesson.family),
    [lessons, lesson.family],
  )

  function markWatched(item: EquipLesson) {
    setWatched((prev) => {
      if (prev.has(item.id)) return prev
      const next = new Set(prev)
      next.add(item.id)
      saveSet(meta.watchedKey, next)
      recordSkillAttempt('equipment-videos', true, 8)
      return next
    })
  }

  function markCleared(item: EquipLesson) {
    setCleared((prev) => {
      if (prev.has(item.id)) return prev
      const next = new Set(prev)
      next.add(item.id)
      saveSet(meta.clearedKey, next)
      recordSkillAttempt('equipment-videos', true, 12)
      return next
    })
  }

  function pulseVideoWatched(item: EquipLesson, atIndex: number) {
    if (pulseWatchedRef.current.has(item.id)) return
    pulseWatchedRef.current.add(item.id)
    const left = lessons.length - (atIndex + 1)
    firePlayClear({
      label: 'Video clear',
      remnant: left > 0 ? `${left} left · practice questions next` : 'Practice questions next',
      kind: 'micro',
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
    const p = el.currentTime / el.duration
    setProgress(p)
    if (p >= 0.9) markWatched(lesson)
  }

  function onEnded() {
    setEnded(true)
    markWatched(lesson)
    pulseVideoWatched(lesson, idx)
  }

  function goAnswer() {
    if (!canLeaveWatch) return
    if (!watched.has(lesson.id)) markWatched(lesson)
    coachWatchDone()
    replayEndRef.current = null
    const el = videoRef.current
    if (el) el.pause()
    setPhase('answer')
    setQIdx(0)
    setPicked(null)
    setQCorrect(false)
    setSetJustCleared(false)
    playFoley('whoosh')
    advanceStationCoach('equipment-video')
  }

  function pickChoice(id: EquipChoiceId) {
    if (!question || picked) return
    const ok = id === question.answer
    setPicked(id)
    setQCorrect(ok)
    playFoley(ok ? 'correct' : 'wrong')
    /* Phone fold: keep teach + primary continue above docked train-actions chrome. */
    requestAnimationFrame(() => {
      const primary = document.querySelector(
        '.equip-video-check .equip-video-actions .btn-primary',
      )
      const teach = document.querySelector(
        '.equip-video-check .alert.ok, .equip-video-check .play-soft-miss',
      )
      const target = primary || teach
      if (!(target instanceof HTMLElement)) return
      const panel = document.querySelector('.reveal.train-panel')
      if (panel instanceof HTMLElement && panel.contains(target)) {
        const t = target.getBoundingClientRect()
        const p = panel.getBoundingClientRect()
        const pad = 12
        if (t.bottom > p.bottom - pad) {
          panel.scrollTop += t.bottom - p.bottom + pad
        } else if (t.top < p.top + pad) {
          panel.scrollTop -= p.top + pad - t.top
        }
        return
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  function afterQuestion() {
    if (!question) return
    if (!qCorrect) {
      replayEndRef.current = null
      setPicked(null)
      setQCorrect(false)
      return
    }
    replayEndRef.current = null
    const el = videoRef.current
    if (el) el.pause()
    if (qIdx < questions.length - 1) {
      setQIdx((i) => i + 1)
      setPicked(null)
      setQCorrect(false)
      playFoley('whoosh')
      return
    }
    markCleared(lesson)
    setSetJustCleared(true)
    firePlayClear({
      label: 'Practice clear',
      remnant:
        idx >= lessons.length - 1
          ? 'Equipment set clear — continue when ready'
          : `${lessons.length - (idx + 1)} videos left`,
      kind: idx >= lessons.length - 1 ? 'board' : 'micro',
    })
    playFoley('correct')
  }

  function replayClip() {
    if (!question) return
    const el = videoRef.current
    if (!el) return
    const { startSec, endSec } = question.replay
    replayEndRef.current = endSec
    el.currentTime = startSec
    void el.play()
    playFoley('whoosh')
  }

  function goNext() {
    if (!lessonCleared && !setJustCleared && !practice) return
    if (!watched.has(lesson.id)) markWatched(lesson)
    if (idx === 0) {
      coachWatchDone()
      advanceStationCoach('equipment-video')
    }
    if (idx >= lessons.length - 1) {
      if (allCleared || lessonCleared || setJustCleared || practice) {
        recordSkillAttempt('equipment-videos', true, 20)
        playFoley('whoosh')
        onComplete()
      }
      return
    }
    const nextIdx = idx + 1
    const unlocked = isUnlocked(nextIdx, new Set([...cleared, lesson.id]))
    if (!unlocked && !practice) return
    setIdx(nextIdx)
    playFoley('whoosh')
  }

  function jumpTo(i: number) {
    if (i < 0 || i >= lessons.length) return
    if (i === idx) return
    if (!isUnlocked(i, cleared) && !practice) return
    setIdx(i)
    playFoley('whoosh')
  }

  const poster = pathwayImage(lesson.posterKey)
  const src =
    pack === 'construction'
      ? constructionEquipmentVideoUrl(lesson.file)
      : equipmentVideoUrl(lesson.file)
  const showContinue =
    phase === 'answer' && (setJustCleared || (lessonCleared && qIdx >= questions.length - 1 && qCorrect))

  return (
    <article className="equip-video-card">
      <div className="equip-video-head">
        <div>
          <p className="section-kicker">{meta.unitKicker}</p>
          <h2 className="equip-video-title">{lesson.title}</h2>
          <p className="lede equip-video-purpose">{lesson.purpose}</p>
        </div>
      </div>

      <p className="play-nearby-objective" aria-live="polite">
        {phase === 'watch'
          ? `Clear this video · ${lessons.length - idx} left`
          : setJustCleared || (lessonCleared && showContinue)
            ? `Cleared · ${lesson.title}`
            : `Practice questions · ${Math.max(questions.length - qIdx, 1)} left on this machine`}
      </p>
      <p className="train-vocab-counter">
        Lesson {lesson.n} of {lessons.length}
        {' · '}
        {familyMeta?.label ?? lesson.familyLabel}
        {' · '}
        {watchedCount} watched · {clearedCount} cleared
        {gatesOn ? ' · gates on' : null}
        {practice && onSkip ? (
          <>
            {' · '}
            <button type="button" className="linkish comp-skills-skip" onClick={onSkip}>
              Skip to observation
            </button>
          </>
        ) : null}
      </p>

      <div className="equip-video-layout">
        <nav className="equip-video-rail" aria-label="Equipment lessons">
          {families.map((fam) => {
            const items = lessons.filter((l) => l.family === fam.id)
            return (
              <div key={fam.id} className="equip-video-family">
                <p className="equip-video-family-label">{fam.label}</p>
                <ol className="equip-video-list">
                  {items.map((item) => {
                    const active = item.id === lesson.id
                    const done = cleared.has(item.id)
                    const seen = watched.has(item.id)
                    const flatIdx = lessons.findIndex((l) => l.id === item.id)
                    const unlocked = isUnlocked(flatIdx, cleared)
                    const locked = gatesOn && !unlocked
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`equip-video-rail-btn${active ? ' is-active' : ''}${done ? ' is-done' : ''}${seen && !done ? ' is-watched' : ''}${locked ? ' is-locked' : ''}`}
                          onClick={() => jumpTo(flatIdx)}
                          disabled={locked}
                          aria-current={active ? 'step' : undefined}
                          aria-disabled={locked || undefined}
                          title={
                            locked
                              ? 'Finish the practice questions on the earlier video first'
                              : undefined
                          }
                        >
                          <span className="equip-video-rail-n">{item.n}</span>
                          <span className="equip-video-rail-name">{item.title}</span>
                          {locked ? (
                            <span className="equip-video-rail-lock" aria-hidden>
                              ·
                            </span>
                          ) : done ? (
                            <span className="equip-video-rail-check" aria-hidden>
                              ✓
                            </span>
                          ) : null}
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
          <div
            className="equip-video-stage"
            data-coach={coachFirst && phase === 'watch' ? 'equip-watch' : undefined}
          >
            <video
              key={lesson.id}
              ref={videoRef}
              className="equip-video-player"
              controls
              playsInline
              preload="metadata"
              poster={poster}
              src={src}
              onPlay={() => coachWatchDone()}
              onTimeUpdate={onTimeUpdate}
              onEnded={onEnded}
            >
              <track kind="captions" />
            </video>
            {lesson.poweredStayClear ? (
              <p className="equip-video-stayclear" role="note">
                Powered equipment — stay clear unless you are certified elsewhere. This lesson is
                awareness only.
              </p>
            ) : null}
          </div>

          {phase === 'watch' ? (
            <>
              <div className="equip-video-kip" aria-label="Know, inspect, protect">
                <div className="equip-video-kip-item">
                  <p className="equip-video-kip-label">Know</p>
                  <p>{lesson.know}</p>
                </div>
                <div className="equip-video-kip-item">
                  <p className="equip-video-kip-label">Inspect</p>
                  <p>{lesson.inspect}</p>
                </div>
                <div className="equip-video-kip-item">
                  <p className="equip-video-kip-label">Protect</p>
                  <p>{lesson.protect}</p>
                </div>
              </div>

              <p className="equip-video-family-blurb">
                {familyMeta?.blurb} · {familyLessons.length} lessons in this group.
              </p>

              <div className="hero-actions equip-video-actions">
                {!canLeaveWatch && !practice ? (
                  <p className="play-soft-miss" role="status">
                    Keep watching — then answer a few practice questions. No rush.
                  </p>
                ) : null}
                {lessonCleared ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-coach={coachFirst ? 'equip-next' : undefined}
                    onClick={goNext}
                  >
                    {idx >= lessons.length - 1
                      ? 'Continue to instructor check'
                      : `Next · ${lessons[idx + 1]?.title}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-coach={coachFirst ? 'equip-next' : undefined}
                    disabled={!canLeaveWatch && !practice}
                    onClick={goAnswer}
                  >
                    {canLeaveWatch
                      ? questions.length
                        ? 'Answer practice questions'
                        : 'Continue'
                      : 'Keep watching, then continue'}
                  </button>
                )}
                {lessonCleared ? (
                  <button type="button" className="btn btn-ghost" onClick={goAnswer}>
                    Practice questions again
                  </button>
                ) : null}
              </div>
            </>
          ) : null}

          {phase === 'answer' && question && !setJustCleared ? (
            <div
              className="equip-video-check"
              data-coach={coachFirst ? 'equip-answer' : undefined}
            >
              <p className="equip-video-check-kicker">Practice questions</p>
              <h3>
                Question {question.n} of {questions.length}
              </h3>
              <p className="train-check-prompt">{question.prompt}</p>
              <div className="train-choice-grid">
                {question.choices.map((opt) => {
                  let state: 'idle' | 'correct' | 'wrong' = 'idle'
                  if (picked) {
                    if (opt.id === question.answer) state = 'correct'
                    else if (opt.id === picked) state = 'wrong'
                  }
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`train-choice${state !== 'idle' ? ` is-${state}` : ''}`}
                      disabled={!!picked && opt.id !== picked && opt.id !== question.answer}
                      onClick={() => pickChoice(opt.id)}
                    >
                      <span className="equip-video-choice-id">{opt.id}.</span> {opt.text}
                    </button>
                  )
                })}
              </div>
              {picked ? (
                <>
                  {qCorrect ? (
                    <div className="alert ok">{question.teach}</div>
                  ) : (
                    <p className="play-soft-miss" role="status">
                      {softMissLine(question.teach)}
                    </p>
                  )}
                  <div className="hero-actions equip-video-actions">
                    {!qCorrect ? (
                      <button type="button" className="btn btn-ghost" onClick={replayClip}>
                        Replay that part · {question.replay.label}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-primary"
                      data-coach={coachFirst ? 'equip-next' : undefined}
                      onClick={afterQuestion}
                    >
                      {qCorrect
                        ? qIdx >= questions.length - 1
                          ? 'Clear this machine'
                          : 'Next question'
                        : SOFT_RETRY_LABEL}
                    </button>
                  </div>
                </>
              ) : (
                <p className="equip-video-family-blurb">
                  Watch first, then choose. Replay a short clip if you need a reminder.
                </p>
              )}
            </div>
          ) : null}

          {phase === 'answer' && setJustCleared ? (
            <div className="equip-video-check">
              <p className="equip-video-check-kicker">Station clear</p>
              <h3>{lesson.title} · practice cleared</h3>
              <p className="lede">
                {questions.length} {meta.clearFloor}
              </p>
              <div className="hero-actions equip-video-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  data-coach={coachFirst ? 'equip-next' : undefined}
                  onClick={goNext}
                >
                  {idx >= lessons.length - 1
                    ? 'Continue to instructor check'
                    : `Next · ${lessons[idx + 1]?.title}`}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {coachFirst ? (
        <StationCoach
          stationId="equipment-video"
          layoutKey={`${pack}-${lesson.id}-${phase}-${canLeaveWatch}-${qIdx}-${setJustCleared}`}
        />
      ) : null}
    </article>
  )
}
