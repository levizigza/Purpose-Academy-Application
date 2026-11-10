import { useEffect, useRef, useState, type ReactNode } from 'react'
import { INSTRUCTOR_FILM_SEEN_KEY } from '../practice/InstructorPracticeMode'
import { videoSrc } from '../practice/stationExplainers'
import { stopSpeech } from '../student/speech'

const FULL = 'explainers/instructor-walkthrough.mp4'

export type InstructorFilmClip = 'streams' | 'weeks' | 'block' | 'workbooks'

const REMINDERS: Record<InstructorFilmClip, { file: string; title: string; note: string }> = {
  streams: {
    file: 'explainers/instructor-walkthrough-streams.mp4',
    title: 'How to choose a stream',
    note: 'Three cards. The gold button opens the months.',
  },
  weeks: {
    file: 'explainers/instructor-walkthrough-weeks.mp4',
    title: 'How to open the next week',
    note: 'Only the current month is open. The gold card is the week to teach.',
  },
  block: {
    file: 'explainers/instructor-walkthrough-block.mp4',
    title: 'How to teach the block',
    note: 'Stay on the block marked You are here. The gold button is the only next step.',
  },
  workbooks: {
    file: 'explainers/instructor-walkthrough-workbooks.mp4',
    title: 'How to use the picture workbooks',
    note: 'Preview the words, then hide the translations and ask for the English word.',
  },
}

function quiet() {
  stopSpeech()
  window.speechSynthesis?.cancel()
}

export function hasSeenInstructorFilm() {
  try {
    return localStorage.getItem(INSTRUCTOR_FILM_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function markInstructorFilmSeen() {
  try {
    localStorage.setItem(INSTRUCTOR_FILM_SEEN_KEY, '1')
  } catch {
    /* private mode */
  }
}

/**
 * First visit plays the full walkthrough and holds the room until it ends.
 * After that, a short clip from the same film sits at the top of the page.
 */
export function InstructorFilmGate({ clip, children }: { clip: InstructorFilmClip; children: ReactNode }) {
  const [seen, setSeen] = useState(hasSeenInstructorFilm)
  const [replay, setReplay] = useState(false)

  useEffect(() => {
    const reset = () => {
      setReplay(false)
      setSeen(hasSeenInstructorFilm())
    }
    window.addEventListener('pa-instructor-practice-restarted', reset)
    window.addEventListener('pa-instructor-practice-started', reset)
    return () => {
      window.removeEventListener('pa-instructor-practice-restarted', reset)
      window.removeEventListener('pa-instructor-practice-started', reset)
    }
  }, [])

  if (!seen || replay) {
    return (
      <OpeningFilm
        onDone={() => {
          markInstructorFilmSeen()
          setSeen(true)
          setReplay(false)
        }}
      />
    )
  }

  return (
    <>
      <Reminder clip={clip} onReplay={clip === 'streams' ? () => setReplay(true) : undefined} />
      {children}
    </>
  )
}

function OpeningFilm({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ended, setEnded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    quiet()
    const el = videoRef.current
    if (!el) return
    el.muted = false
    void el.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    )
  }, [])

  function playFromButton() {
    const el = videoRef.current
    if (!el) return
    quiet()
    el.muted = false
    void el.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    )
  }

  const canContinue = ended || failed

  return (
    <article className="tp-film" aria-labelledby="instructor-film-title">
      <p className="tp-kicker">How Instructor Practice works</p>
      <h2 id="instructor-film-title">Watch this once</h2>
      <p>
        This walk goes through every room, from choosing a stream to clearing a week. What you hear is
        what is on the screen.
      </p>
      {!failed ? (
        <video
          ref={videoRef}
          src={videoSrc(FULL)}
          controls
          playsInline
          preload="auto"
          muted={false}
          onPlay={() => {
            quiet()
            setPlaying(true)
          }}
          onPause={() => {
            const el = videoRef.current
            if (!el || el.ended) return
            setPlaying(false)
          }}
          onEnded={() => {
            setPlaying(false)
            setEnded(true)
          }}
          onError={() => setFailed(true)}
        />
      ) : (
        <p role="status">The video could not load on this device. The rooms below work the same way.</p>
      )}
      <div className="tp-film-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={playing && !canContinue}
          onClick={() => {
            if (canContinue) onDone()
            else playFromButton()
          }}
        >
          {canContinue ? 'Continue' : playing ? 'Watching…' : 'Play the video'}
        </button>
      </div>
    </article>
  )
}

function Reminder({ clip, onReplay }: { clip: InstructorFilmClip; onReplay?: () => void }) {
  const reminder = REMINDERS[clip]
  return (
    <figure className="tp-film tp-reminder">
      <p className="tp-kicker">Reminder</p>
      <strong>{reminder.title}</strong>
      <p>{reminder.note}</p>
      <video
        src={videoSrc(reminder.file)}
        controls
        playsInline
        preload="metadata"
        onPlay={quiet}
      />
      {onReplay ? (
        <div className="tp-film-actions">
          <button type="button" className="btn btn-ghost" onClick={onReplay}>
            Play the full walkthrough
          </button>
        </div>
      ) : null}
    </figure>
  )
}
