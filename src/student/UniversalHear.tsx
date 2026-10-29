import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { filterHearLanguages, type HearLanguage } from './hearLanguages'
import type { UniversalBridge, UniversalHearStatus } from './universalHear'

type Props = {
  english: string
  disabled?: boolean
  /** Active universal bridge for this card (if any). */
  bridge: UniversalBridge | null
  busy: boolean
  status: UniversalHearStatus
  onPick: (lang: HearLanguage) => void
  onCloseStatus?: () => void
}

/**
 * Searchable “More languages” hear control for Workplace Words.
 * Translates the English workplace word and speaks it — honest loading / soft fail.
 */
export function UniversalHearControl({
  english,
  disabled,
  bridge,
  busy,
  status,
  onPick,
  onCloseStatus,
}: Props) {
  const panelId = useId()
  const inputId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const matches = useMemo(() => filterHearLanguages(query).slice(0, 40), [query])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    /* Close picker once a language is chosen and work starts. */
    if (busy) setOpen(false)
  }, [busy])

  const statusLine = (() => {
    if (status.kind === 'loading') {
      return status.phase === 'translate'
        ? 'Finding your word…'
        : 'Playing audio…'
    }
    if (status.kind === 'unsupported') {
      return `We can’t translate into ${status.lang.name} yet. Try another language, or use English.`
    }
    if (status.kind === 'error') {
      return status.detail || 'Translation is resting — try again, or press English.'
    }
    if (status.kind === 'ready') {
      if (!status.spoken) {
        return `${status.lang.name}: ${status.translated} · Audio didn’t play — check sound, or hear English.`
      }
      return `${status.lang.name}: ${status.translated}`
    }
    if (bridge) {
      return `${bridge.name}: ${bridge.translated}`
    }
    return null
  })()

  return (
    <div className="vocab-universal" ref={rootRef}>
      <div className="vocab-universal-bar">
        <button
          type="button"
          className={`vocab-universal-toggle${open ? ' is-open' : ''}${bridge ? ' is-bridged' : ''}`}
          disabled={disabled || busy}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="vocab-universal-glyph" aria-hidden>
            ◈
          </span>
          <span className="vocab-universal-label">
            {bridge ? `Heard in ${bridge.name}` : 'More languages'}
          </span>
          <span className="vocab-universal-hint">
            {busy ? 'Working…' : bridge ? 'Change' : 'Translate & hear'}
          </span>
        </button>
      </div>

      {open && (
        <div
          className="vocab-universal-panel"
          id={panelId}
          role="dialog"
          aria-label="Pick a language to hear this word"
        >
          <label className="vocab-universal-search-label" htmlFor={inputId}>
            Search languages
          </label>
          <input
            id={inputId}
            ref={inputRef}
            className="vocab-universal-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a language — French, Somali, Tagalog…"
            autoComplete="off"
            disabled={busy}
          />
          <ul className="vocab-universal-list" role="listbox" aria-label="Languages">
            {matches.length === 0 ? (
              <li className="vocab-universal-empty">No match — try another spelling.</li>
            ) : (
              matches.map((lang) => (
                <li key={lang.code}>
                  <button
                    type="button"
                    className="vocab-universal-option"
                    role="option"
                    disabled={busy}
                    onClick={() => {
                      onPick(lang)
                      setQuery('')
                    }}
                  >
                    <span className="vocab-universal-option-name">
                      {lang.name}
                      {lang.native ? (
                        <span className="vocab-universal-option-native"> · {lang.native}</span>
                      ) : null}
                    </span>
                    <span className="vocab-universal-option-code">{lang.code}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
          <p className="vocab-universal-footnote">
            Hears a translation of <strong>{english ? 'this word' : 'the word'}</strong>, then
            English — same pick + type clear. Works offline-ish via your browser voice when the
            server is quiet.
          </p>
        </div>
      )}

      {statusLine && (
        <p
          className={`vocab-universal-status${
            status.kind === 'error' || status.kind === 'unsupported'
              ? ' is-soft-miss'
              : status.kind === 'loading'
                ? ' is-loading'
                : ' is-ok'
          }`}
          role="status"
          aria-live="polite"
        >
          {statusLine}
          {(status.kind === 'error' || status.kind === 'unsupported') && onCloseStatus ? (
            <button type="button" className="vocab-universal-dismiss" onClick={onCloseStatus}>
              OK
            </button>
          ) : null}
        </p>
      )}
    </div>
  )
}
