/**
 * Hear-in-L1 control for station instructions (coach, explainer, video chrome).
 * Soft status; English stay available via optional EN hear.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  learnerWantsL1Narration,
  EXTRA_LANG_EVENT,
  resolveLearnerHearLanguage,
} from './learnerLang'
import {
  narrateInstruction,
  narrateInstructionEnglish,
  type InstructionNarrationStatus,
} from '../student/instructionNarration'
import { stopSpeech } from '../student/speech'
import type { HearLanguage } from '../student/hearLanguages'

/** A Hear press must not talk over a lesson or explainer that is already playing. */
function pausePlayingVideos() {
  document.querySelectorAll('video').forEach((node) => {
    if (node instanceof HTMLVideoElement && !node.paused) node.pause()
  })
}

type ChipProps = {
  /** Level-4 simple English source (translated for L1). */
  english: string
  /** Auto-speak once when preferred lang is not English. */
  auto?: boolean
  /** Remount / phase key so auto fires again on new instruction. */
  autoKey?: string | number | boolean
  className?: string
  /** Compact label override. */
  label?: string
  /**
   * Chosen language beside English. False keeps this instruction in English
   * even when a home language is selected.
   */
  bilingual?: boolean
}

function statusLine(
  status: InstructionNarrationStatus,
  opts: { hearAttempted?: boolean } = {},
): string | null {
  if (status.kind === 'loading') {
    return status.phase === 'translate' ? 'Finding your language…' : 'Playing…'
  }
  if (status.kind === 'unsupported') {
    return `Can’t speak ${status.lang.name} yet — English stays available.`
  }
  if (status.kind === 'error') {
    return status.detail || 'Audio resting — try again, or use English.'
  }
  if (status.kind === 'ready' && !status.englishOnly) {
    /* Written L1 is the default; audio warning only after an explicit Hear press. */
    if (opts.hearAttempted && !status.played) {
      return `${status.lang.name}: ${status.spoken} · Audio didn’t play — check sound.`
    }
    return `${status.lang.name}: ${status.spoken}`
  }
  return null
}

export function InstructionHearChip({
  english,
  auto = false,
  autoKey,
  className = '',
  label,
  bilingual = true,
}: ChipProps) {
  const [lang, setLang] = useState<HearLanguage>(() => resolveLearnerHearLanguage())
  const [status, setStatus] = useState<InstructionNarrationStatus>({ kind: 'idle' })
  const [busy, setBusy] = useState(false)
  const [hearAttempted, setHearAttempted] = useState(false)
  const autoDone = useRef<string | null>(null)
  const wantsL1 = bilingual && learnerWantsL1Narration(lang)

  useEffect(() => {
    const sync = () => setLang(resolveLearnerHearLanguage())
    window.addEventListener('pa-support-lang-changed', sync)
    window.addEventListener(EXTRA_LANG_EVENT, sync)
    return () => {
      window.removeEventListener('pa-support-lang-changed', sync)
      window.removeEventListener(EXTRA_LANG_EVENT, sync)
    }
  }, [])

  const playL1 = useCallback(async () => {
    if (!english.trim() || busy) return
    window.speechSynthesis?.cancel()
    stopSpeech()
    pausePlayingVideos()
    setBusy(true)
    setHearAttempted(true)
    setStatus({ kind: 'loading', phase: 'translate' })
    try {
      setStatus({ kind: 'loading', phase: 'speak' })
      const next = await narrateInstruction(english, {
        lang,
        skipEnglishPreferred: false,
      })
      setStatus(next)
    } finally {
      setBusy(false)
    }
  }, [english, lang, busy])

  const playEn = useCallback(async () => {
    if (!english.trim() || busy) return
    window.speechSynthesis?.cancel()
    stopSpeech()
    pausePlayingVideos()
    setBusy(true)
    setHearAttempted(true)
    try {
      const ok = await narrateInstructionEnglish(english)
      setStatus(
        ok
          ? {
              kind: 'ready',
              english,
              spoken: english,
              lang: { code: 'en', bcp47: 'en-US', name: 'English' },
              source: 'passthrough',
              played: true,
              englishOnly: true,
            }
          : { kind: 'error', detail: 'English audio didn’t play — check sound.' },
      )
    } finally {
      setBusy(false)
    }
  }, [english, busy])

  /* Written L1 under the English instruction — no need to press Hear first. */
  useEffect(() => {
    setHearAttempted(false)
    if (!wantsL1 || !english.trim()) {
      if (!auto) setStatus({ kind: 'idle' })
      return
    }
    let cancelled = false
    setStatus({ kind: 'loading', phase: 'translate' })
    void narrateInstruction(english, {
      lang,
      skipEnglishPreferred: false,
      speak: false,
    }).then((next) => {
      if (cancelled) return
      setStatus(next)
    })
    return () => {
      cancelled = true
    }
  }, [english, lang, wantsL1, auto])

  useEffect(() => {
    if (!auto || !wantsL1 || !english.trim()) return
    const key = `${autoKey ?? english}::${lang.code}`
    if (autoDone.current === key) return
    autoDone.current = key
    void playL1()
  }, [auto, autoKey, english, lang.code, wantsL1, playL1])

  if (!english.trim()) return null

  const line = statusLine(status, { hearAttempted })
  const primaryLabel =
    label ||
    (wantsL1 ? `Hear ${lang.name}` : 'Hear English')

  return (
    <div className={`instr-narration${className ? ` ${className}` : ''}`}>
      <div className="instr-narration-bar">
        <button
          type="button"
          className="instr-narration-hear"
          disabled={busy}
          onClick={() => void (wantsL1 ? playL1() : playEn())}
        >
          {busy ? 'Working…' : primaryLabel}
        </button>
        {wantsL1 ? (
          <button
            type="button"
            className="instr-narration-en"
            disabled={busy}
            onClick={() => void playEn()}
          >
            Hear English
          </button>
        ) : null}
      </div>
      {line ? (
        <p
          className={`instr-narration-status${
            status.kind === 'error' || status.kind === 'unsupported'
              ? ' is-soft-miss'
              : status.kind === 'loading'
                ? ' is-loading'
                : ' is-ok'
          }`}
          role="status"
          aria-live="polite"
        >
          {line}
        </p>
      ) : null}
    </div>
  )
}

export function useAutoInstructionNarration(
  english: string,
  key: string | number | boolean | null | undefined,
  enabled = true,
) {
  const [status, setStatus] = useState<InstructionNarrationStatus>({ kind: 'idle' })
  const done = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || key == null || !english.trim()) return
    const lang = resolveLearnerHearLanguage()
    if (!learnerWantsL1Narration(lang)) {
      setStatus({ kind: 'idle' })
      return
    }
    const stamp = `${key}::${lang.code}::${english}`
    if (done.current === stamp) return
    done.current = stamp
    let cancelled = false
    setStatus({ kind: 'loading', phase: 'translate' })
    void narrateInstruction(english, { lang }).then((next) => {
      if (!cancelled) setStatus(next)
    })
    return () => {
      cancelled = true
    }
  }, [english, key, enabled])

  return status
}
