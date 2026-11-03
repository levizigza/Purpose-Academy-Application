import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { filterHearLanguages, type HearLanguage } from './hearLanguages'

type Props = {
  selected: HearLanguage | null
  onPick: (lang: HearLanguage) => void
  onClear: () => void
}

/**
 * Your Language (step 3) — searchable "More languages" beyond the six built-in
 * chips. Uses the same universal translator as Workplace Words.
 */
export function MoreLanguagesPick({ selected, onPick, onClear }: Props) {
  const panelId = useId()
  const inputId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const matches = useMemo(
    () => filterHearLanguages(query).filter((l) => l.code !== 'en').slice(0, 60),
    [query],
  )

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [open])

  return (
    /* Tile sits inside .train-lang-grid (display: contents) — same box as the six chips. */
    <div className="train-lang-more">
      <button
        type="button"
        className={`train-lang train-lang-more-btn${selected ? ' is-selected' : ''}${open ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={selected ? `${selected.name} — change language` : 'More languages — search 90+'}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden>{selected ? selected.code.toUpperCase() : '+90'}</span>
        <strong>{selected ? selected.native || selected.name : 'More languages'}</strong>
      </button>

      {open && (
        <div className="vocab-universal-panel" id={panelId} role="dialog" aria-label="Pick your language">
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
          />
          <ul className="vocab-universal-list" role="listbox" aria-label="Languages">
            {matches.length === 0 ? (
              <li className="vocab-universal-empty">No match — try another spelling.</li>
            ) : (
              matches.map((lang) => (
                <li key={lang.code}>
                  <button
                    type="button"
                    className={`vocab-universal-option${selected?.code === lang.code ? ' is-selected' : ''}`}
                    role="option"
                    aria-selected={selected?.code === lang.code}
                    onClick={() => {
                      onPick(lang)
                      setQuery('')
                      setOpen(false)
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
            Screens stay in simple English. Each question also shows in your language with a
            ▶ Hear button. Workplace Words can say every word in your language too.
          </p>
          {selected && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                onClear()
                setOpen(false)
              }}
            >
              Use the six languages above
            </button>
          )}
        </div>
      )}
    </div>
  )
}
