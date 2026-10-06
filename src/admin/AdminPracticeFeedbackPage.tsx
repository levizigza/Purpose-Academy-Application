import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  adminUpdatePracticeChange,
  clearLocalPracticeFeedback,
  exportPracticeFeedbackJson,
  fetchPracticeFeedbackFromServer,
  listPracticeFeedback,
  localProposePracticeChange,
  localSetChangeStatus,
  subscribePracticeFeedback,
  type PracticeFeedbackItem,
} from '../practice/feedbackStore'
import { PRACTICE_REVIEWERS } from '../practice/PracticeMode'
import { setActivePreview, statusLabel, type ChangeStatus, type PreviewPatch } from '../practice/changeLoop'

export function AdminPracticeFeedbackPage() {
  const [items, setItems] = useState<PracticeFeedbackItem[]>(() => listPracticeFeedback())
  const [filterAuthor, setFilterAuthor] = useState('all')
  const [filterKind, setFilterKind] = useState<'all' | 'page' | 'quiz'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | ChangeStatus>('all')
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [proposeId, setProposeId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [patchSummary, setPatchSummary] = useState('')
  const [vocabTermId, setVocabTermId] = useState('')
  const [vocabSentence, setVocabSentence] = useState('')
  const [vocabDefinition, setVocabDefinition] = useState('')
  const [vocabGlossEs, setVocabGlossEs] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => subscribePracticeFeedback(() => setItems(listPracticeFeedback())), [])

  useEffect(() => {
    void fetchPracticeFeedbackFromServer().then(setItems)
  }, [])

  const filtered = useMemo(() => {
    return items.filter((f) => {
      if (filterAuthor !== 'all' && f.author !== filterAuthor) return false
      if (filterKind !== 'all' && f.kind !== filterKind) return false
      if (filterStatus !== 'all' && (f.status || 'queued') !== filterStatus) return false
      return true
    })
  }, [items, filterAuthor, filterKind, filterStatus])

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

  async function setTicketStatus(id: string, next: ChangeStatus) {
    setBusy(true)
    setStatus(null)
    try {
      try {
        await adminUpdatePracticeChange({ id, status: next, note: `Status → ${next}` })
      } catch {
        localSetChangeStatus(id, next)
      }
      setItems(listPracticeFeedback())
      setStatus(`Updated ${id} → ${statusLabel(next)}`)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Update failed.')
    } finally {
      setBusy(false)
    }
  }

  async function onPropose(e: FormEvent) {
    e.preventDefault()
    if (!proposeId) return
    setBusy(true)
    setStatus(null)
    try {
      let patch: PreviewPatch | undefined
      if (vocabTermId.trim() && (vocabSentence.trim() || vocabDefinition.trim() || vocabGlossEs.trim())) {
        patch = {
          id: `patch-${Date.now().toString(36)}`,
          summary: patchSummary.trim() || `Vocab fix for ${vocabTermId.trim()}`,
          vocab: [
            {
              pathway: 'logistics',
              termId: vocabTermId.trim(),
              sentence: vocabSentence.trim() || undefined,
              definition: vocabDefinition.trim() || undefined,
              gloss: vocabGlossEs.trim() ? { es: vocabGlossEs.trim() } : undefined,
            },
          ],
        }
      }

      try {
        await adminUpdatePracticeChange({
          id: proposeId,
          status: 'preview_ready',
          previewUrl: previewUrl.trim() || undefined,
          patch: patch || null,
          note: note.trim() || patch?.summary || 'Preview ready for Practice approval.',
        })
      } catch {
        localProposePracticeChange({
          id: proposeId,
          previewUrl: previewUrl.trim() || undefined,
          patch,
          note: note.trim() || patch?.summary,
          by: 'admin',
        })
      }
      setItems(listPracticeFeedback())
      setStatus('Preview published. Reviewer can Try preview in Practice feedback chat.')
      setProposeId(null)
      setPreviewUrl('')
      setPatchSummary('')
      setVocabTermId('')
      setVocabSentence('')
      setVocabDefinition('')
      setVocabGlossEs('')
      setNote('')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not publish preview.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <div>
        <p className="section-kicker">Practice</p>
        <h1>Student practice feedback</h1>
        <p className="lede">
          Notes become change requests. Attach an isolated preview (safe overlay and/or branch URL), ask the reviewer
          to Approve or iterate, then ship — overlapping sitewide scopes are blocked so cross-changes do not collide.
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
          <label>
            Status
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | ChangeStatus)}
            >
              <option value="all">All statuses</option>
              <option value="queued">Queued</option>
              <option value="in_progress">In progress</option>
              <option value="preview_ready">Preview ready</option>
              <option value="needs_iteration">Needs iteration</option>
              <option value="approved">Approved</option>
              <option value="shipped">Shipped</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </label>
        </div>
      </div>

      {proposeId && (
        <form className="panel site-crate stack" onSubmit={(e) => void onPropose(e)}>
          <h2 style={{ margin: 0 }}>Publish preview for {proposeId}</h2>
          <p className="muted" style={{ margin: 0 }}>
            Prefer a branch preview URL for code changes. For vocab/copy, fill the safe overlay fields — reviewers try
            it in their session only until they Approve.
          </p>
          <div className="field">
            <label htmlFor="pf-preview-url">Branch / Pages preview URL (optional)</label>
            <input
              id="pf-preview-url"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="field">
            <label htmlFor="pf-patch-summary">What changed (shown to reviewer)</label>
            <input
              id="pf-patch-summary"
              value={patchSummary}
              onChange={(e) => setPatchSummary(e.target.value)}
              placeholder="Fixed Dolly Spanish gloss + sentence"
            />
          </div>
          <div className="practice-filter-row">
            <label>
              Vocab term id
              <input value={vocabTermId} onChange={(e) => setVocabTermId(e.target.value)} placeholder="dolly" />
            </label>
            <label>
              Spanish gloss
              <input value={vocabGlossEs} onChange={(e) => setVocabGlossEs(e.target.value)} placeholder="Carretilla de mano" />
            </label>
          </div>
          <div className="field">
            <label htmlFor="pf-vocab-def">Definition override</label>
            <input id="pf-vocab-def" value={vocabDefinition} onChange={(e) => setVocabDefinition(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pf-vocab-sent">Sentence override</label>
            <input id="pf-vocab-sent" value={vocabSentence} onChange={(e) => setVocabSentence(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pf-note">Internal note</label>
            <textarea id="pf-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="hero-actions" style={{ marginTop: 0 }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Publish preview
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setProposeId(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="stack">
        {filtered.length === 0 && (
          <div className="panel site-crate">
            <p className="muted" style={{ margin: 0 }}>
              No feedback yet. When someone opens Practice and sends notes, they show up here as change requests.
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
                <span className="badge" style={{ marginLeft: '0.35rem' }}>
                  {statusLabel(f.status || 'queued')}
                </span>
                <span className="badge" style={{ marginLeft: '0.35rem' }}>
                  {f.impact || 'local'}
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
            {!!f.scopes?.length && (
              <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                Scopes: {f.scopes.join(', ')}
              </p>
            )}
            {f.previewUrl && (
              <p style={{ margin: 0 }}>
                Preview:{' '}
                <a href={f.previewUrl} target="_blank" rel="noreferrer">
                  {f.previewUrl}
                </a>
              </p>
            )}
            {f.githubIssueUrl && (
              <p style={{ margin: 0 }}>
                Issue:{' '}
                <a href={f.githubIssueUrl} target="_blank" rel="noreferrer">
                  {f.githubIssueUrl}
                </a>
              </p>
            )}
            {f.agentBrief && (
              <details>
                <summary>Agent brief</summary>
                <pre className="practice-agent-brief">{f.agentBrief}</pre>
              </details>
            )}
            {!!f.rounds?.length && (
              <details>
                <summary>Rounds ({f.rounds.length})</summary>
                <ul className="practice-rounds">
                  {f.rounds.map((r) => (
                    <li key={r.id}>
                      <strong>{r.kind}</strong> · {r.by} · {new Date(r.at).toLocaleString()}
                      <div>{r.note}</div>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <div className="hero-actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn btn-secondary on-light"
                disabled={busy}
                onClick={() => void setTicketStatus(f.id, 'in_progress')}
              >
                Start fix
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => {
                  setProposeId(f.id)
                  setPatchSummary(f.patch?.summary || '')
                  setPreviewUrl(f.previewUrl || '')
                }}
              >
                Publish preview
              </button>
              {f.patch && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setActivePreview(f.id, f.patch!)}
                >
                  Try overlay here
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary on-light"
                disabled={busy || f.status !== 'approved'}
                onClick={() => void setTicketStatus(f.id, 'shipped')}
              >
                Mark shipped
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => void setTicketStatus(f.id, 'dismissed')}
              >
                Dismiss
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
