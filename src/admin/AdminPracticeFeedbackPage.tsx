import { useEffect, useMemo, useState } from 'react'
import {
  clearLocalPracticeFeedback,
  exportPracticeFeedbackJson,
  fetchPracticeFeedbackFromServer,
  listPracticeFeedback,
  subscribePracticeFeedback,
  type PracticeFeedbackItem,
} from '../practice/feedbackStore'
import { PRACTICE_REVIEWERS } from '../practice/PracticeMode'

export function AdminPracticeFeedbackPage() {
  const [items, setItems] = useState<PracticeFeedbackItem[]>(() => listPracticeFeedback())
  const [filterAuthor, setFilterAuthor] = useState('all')
  const [filterKind, setFilterKind] = useState<'all' | 'page' | 'quiz'>('all')
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => subscribePracticeFeedback(() => setItems(listPracticeFeedback())), [])

  useEffect(() => {
    void fetchPracticeFeedbackFromServer().then(setItems)
  }, [])

  const filtered = useMemo(() => {
    return items.filter((f) => {
      if (filterAuthor !== 'all' && f.author !== filterAuthor) return false
      if (filterKind !== 'all' && f.kind !== filterKind) return false
      return true
    })
  }, [items, filterAuthor, filterKind])

  const authors = useMemo(() => {
    const set = new Set<string>([...PRACTICE_REVIEWERS])
    items.forEach((f) => set.add(f.author))
    return [...set]
  }, [items])

  function downloadJson() {
    const blob = new Blob([exportPracticeFeedbackJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `practice-feedback-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function refresh() {
    setBusy(true)
    setStatus(null)
    try {
      const next = await fetchPracticeFeedbackFromServer()
      setItems(next)
      setStatus(`Loaded ${next.length} note${next.length === 1 ? '' : 's'}.`)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not refresh.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <div>
        <p className="section-kicker">Practice Mode</p>
        <h1>Reviewer feedback</h1>
        <p className="lede">
          Notes from ChuChu, Yonas, Kinfe, Saba, Levi (and other reviewers) while walking the full site without
          registration. Use this inbox to decide what to fix next.
        </p>
      </div>

      <div className="panel site-plan stack">
        <div className="hero-actions" style={{ marginTop: 0 }}>
          <button type="button" className="btn btn-primary" onClick={() => void refresh()} disabled={busy}>
            {busy ? 'Refreshing…' : 'Refresh'}
          </button>
          <button type="button" className="btn btn-secondary on-light" onClick={downloadJson}>
            Export JSON
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (window.confirm('Clear feedback saved on this device?')) {
                clearLocalPracticeFeedback()
                setItems([])
              }
            }}
          >
            Clear local copy
          </button>
        </div>
        {status && <div className="alert ok">{status}</div>}
        <div className="practice-filter-row">
          <label>
            Who
            <select value={filterAuthor} onChange={(e) => setFilterAuthor(e.target.value)}>
              <option value="all">Everyone</option>
              {authors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kind
            <select
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value as 'all' | 'page' | 'quiz')}
            >
              <option value="all">All</option>
              <option value="page">Page notes</option>
              <option value="quiz">After quiz</option>
            </select>
          </label>
        </div>
      </div>

      <div className="stack">
        {filtered.length === 0 && (
          <div className="panel site-crate">
            <p className="muted" style={{ margin: 0 }}>
              No feedback yet. When reviewers open Practice Mode and send notes, they show up here.
            </p>
          </div>
        )}
        {filtered.map((f) => (
          <article key={f.id} className="panel stack practice-feedback-card">
            <header className="practice-feedback-card-head">
              <div>
                <strong>{f.author}</strong>
                <span className="badge brand" style={{ marginLeft: '0.5rem' }}>
                  {f.kind}
                </span>
                {!f.synced && <span className="badge">this device</span>}
              </div>
              <time className="muted" dateTime={f.created_at}>
                {new Date(f.created_at).toLocaleString()}
              </time>
            </header>
            <p className="muted" style={{ margin: 0 }}>
              {f.pageTitle} · <code>{f.page}</code>
            </p>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{f.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
