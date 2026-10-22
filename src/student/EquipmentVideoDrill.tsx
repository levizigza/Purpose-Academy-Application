import { useEffect, useMemo, useRef, useState } from 'react'
import { pathwayImage } from '../pathways'
import {
  EQUIPMENT_FAMILIES,
  WAREHOUSE_EQUIPMENT_VIDEOS,
  equipmentVideoUrl,
  type WarehouseEquipmentLesson,
} from '../pathways/packs/warehouseEquipmentVideos'
import { playFoley } from '../audio/foley'
import { recordSkillAttempt } from './learningMastery'
import { isPracticeMode } from '../practice/PracticeMode'

const WATCHED_KEY = 'pa-warehouse-equipment-watched-v1'

function loadWatched(): Set<string> {
  try {
    const raw = sessionStorage.getItem(WATCHED_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveWatched(ids: Set<string>) {
  try {
    sessionStorage.setItem(WATCHED_KEY, JSON.stringify([...ids]))
  } catch {
    /* ignore */
  }
}

type Props = {
  onComplete: () => void
  onSkip?: () => void
}

/**
 * One equipment lesson at a time: family context → 16:9 player → Know / Inspect / Protect.
 * Continue unlocks after the learner finishes (or nearly finishes) each video.
 */
export function EquipmentVideoDrill({ onComplete, onSkip }: Props) {
  const lessons = WAREHOUSE_EQUIPMENT_VIDEOS
  const [idx, setIdx] = useState(0)
  const [watched, setWatched] = useState<Set<string>>(() => loadWatched())
  const [ended, setEnded] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const practice = isPracticeMode()

  const lesson = lessons[Math.min(idx, lessons.length - 1)]
  const familyMeta = EQUIPMENT_FAMILIES.find((f) => f.id === lesson.family)
  const watchedCount = lessons.filter((l) => watched.has(l.id)).length
  const allDone = watchedCount >= lessons.length
  const canAdvanceLesson = ended || progress >= 0.9 || watched.has(lesson.id)

  useEffect(() => {
    setEnded(false)
    setProgress(0)
    const el = videoRef.current
    if (el) {
      el.pause()
      el.currentTime = 0
      el.load()
    }
  }, [lesson.id])

  useEffect(() => {
    // Practice chrome is tall — bring the player into view when the station opens.
    const node = document.querySelector('.equip-video-card')
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const familyLessons = useMemo(
    () => lessons.filter((l) => l.family === lesson.family),
    [lessons, lesson.family],
  )

  function markWatched(item: WarehouseEquipmentLesson) {
    setWatched((prev) => {
      if (prev.has(item.id)) return prev
      const next = new Set(prev)
      next.add(item.id)
      saveWatched(next)
      recordSkillAttempt('equipment-videos', true, 8)
      return next
    })
  }

  function onTimeUpdate() {
    const el = videoRef.current
    if (!el || !el.duration) return
    const p = el.currentTime / el.duration
    setProgress(p)
    if (p >= 0.9) markWatched(lesson)
  }

  function onEnded() {
    setEnded(true)
    markWatched(lesson)
    playFoley('correct')
  }

  function goNext() {
    if (!canAdvanceLesson && !practice) return
    if (!watched.has(lesson.id)) markWatched(lesson)
    if (idx >= lessons.length - 1) {
      if (allDone || watched.has(lesson.id) || practice) {
        recordSkillAttempt('equipment-videos', true, 20)
        playFoley('whoosh')
        onComplete()
      }
      return
    }
    setIdx((i) => i + 1)
    playFoley('whoosh')
  }

  function jumpTo(i: number) {
    if (i < 0 || i >= lessons.length) return
    // Allow revisit anytime; forward jump only to watched or next unwatched in order
    if (i > idx) {
      const priorOk = lessons.slice(0, i).every((l) => watched.has(l.id))
      if (!priorOk && !practice) return
    }
    setIdx(i)
    playFoley('whoosh')
  }

  const poster = pathwayImage(lesson.posterKey)
  const src = equipmentVideoUrl(lesson.file)

  return (
    <article className="equip-video-card">
      <div className="equip-video-head">
        <div>
          <p className="section-kicker">Unit 8 · Video · Warehouse Equipment</p>
          <h2 className="equip-video-title">{lesson.title}</h2>
          <p className="lede equip-video-purpose">{lesson.purpose}</p>
        </div>
        {practice && onSkip ? (
          <button type="button" className="btn btn-ghost" onClick={onSkip}>
            Skip to observation
          </button>
        ) : null}
      </div>

      <p className="train-vocab-counter">
        Lesson {lesson.n} of {lessons.length}
        {' · '}
        {familyMeta?.label ?? lesson.familyLabel}
        {' · '}
        {watchedCount} watched
      </p>

      <div className="equip-video-layout">
        <nav className="equip-video-rail" aria-label="Equipment lessons">
          {EQUIPMENT_FAMILIES.map((fam) => {
            const items = lessons.filter((l) => l.family === fam.id)
            return (
              <div key={fam.id} className="equip-video-family">
                <p className="equip-video-family-label">{fam.label}</p>
                <ol className="equip-video-list">
                  {items.map((item) => {
                    const active = item.id === lesson.id
                    const done = watched.has(item.id)
                    const flatIdx = lessons.findIndex((l) => l.id === item.id)
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`equip-video-rail-btn${active ? ' is-active' : ''}${done ? ' is-done' : ''}`}
                          onClick={() => jumpTo(flatIdx)}
                          aria-current={active ? 'step' : undefined}
                        >
                          <span className="equip-video-rail-n">{item.n}</span>
                          <span className="equip-video-rail-name">{item.title}</span>
                          {done ? <span className="equip-video-rail-check" aria-hidden>✓</span> : null}
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
          <div className="equip-video-stage">
            <video
              key={lesson.id}
              ref={videoRef}
              className="equip-video-player"
              controls
              playsInline
              preload="metadata"
              poster={poster}
              src={src}
              onTimeUpdate={onTimeUpdate}
              onEnded={onEnded}
            >
              <track kind="captions" />
            </video>
            {lesson.poweredStayClear ? (
              <p className="equip-video-stayclear" role="note">
                Powered equipment — stay clear unless you are certified elsewhere. This lesson is awareness only.
              </p>
            ) : null}
          </div>

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
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canAdvanceLesson && !practice}
              onClick={goNext}
            >
              {idx >= lessons.length - 1
                ? allDone || canAdvanceLesson
                  ? 'Continue to observation'
                  : 'Finish this video to continue'
                : canAdvanceLesson
                  ? `Next · ${lessons[idx + 1]?.title}`
                  : 'Watch to unlock next'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
