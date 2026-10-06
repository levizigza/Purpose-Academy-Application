import { FormEvent, useEffect, useState } from 'react'
import {
  clearActivePreview,
  getActivePreviewPatch,
  getActivePreviewTicketId,
  statusLabel,
} from './changeLoop'
import {
  fetchMyChangeTickets,
  getPracticeFeedback,
  reviewPracticeChange,
  type PracticeFeedbackItem,
} from './feedbackStore'
import { getPracticeName, isPracticeMode } from './PracticeMode'

/**
 * Shown while a Practice reviewer is previewing an isolated proposed fix.
 * Approve ships the ticket to "approved"; iterate sends it back for another pass.
 */
export function PreviewPatchBanner() {
  const [ticket, setTicket] = useState<PracticeFeedbackItem | null>(null)
  const [patchSummary, setPatchSummary] = useState<string | null>(null)
  const [iterateOpen, setIterateOpen] = useState(false)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  function syncFromSession() {
    const id = getActivePreviewTicketId()
    const patch = getActivePreviewPatch()
    setPatchSummary(patch?.summary || null)
    setTicket(id ? getPracticeFeedback(id) || null : null)
  }

  useEffect(() => {
    syncFromSession()
    const onPatch = () => syncFromSession()
    const onFb = () => syncFromSession()
    window.addEventListener('pa-preview-patch-changed', onPatch)
    window.addEventListener('storage', onFb)
    return () => {
      window.removeEventListener('pa-preview-patch-changed', onPatch)
      window.removeEventListener('storage', onFb)
    }
  }, [])

  if (!isPracticeMode() || !ticket || !patchSummary) return null

  async function onApprove() {
    const author = getPracticeName() || ticket!.author
    setBusy(true)
    setMessage(null)
    try {
      const next = await reviewPracticeChange({ id: ticket!.id, author, action: 'approve' })
      setTicket(next)
      clearActivePreview()
      setMessage('Approved. Builder can ship this to the live site.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not approve.')
    } finally {
      setBusy(false)
    }
  }

  async function onIterate(e: FormEvent) {
    e.preventDefault()
    const author = getPracticeName() || ticket!.author
    setBusy(true)
    setMessage(null)
    try {
      const next = await reviewPracticeChange({
        id: ticket!.id,
        author,
        action: 'iterate',
        note,
      })
      setTicket(next)
      clearActivePreview()
      setIterateOpen(false)
      setNote('')
      setMessage('Sent back for another pass. Leave more notes anytime.')
      void fetchMyChangeTickets(author)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not send iteration notes.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="practice-preview-banner" role="status">
      <div className="practice-preview-banner-main">
        <strong>Previewing a proposed fix</strong>
        <span>
          {patchSummary} · {statusLabel(ticket.status || 'preview_ready')} · only you see this overlay
        </span>
        {ticket.previewUrl && (
          <a className="practice-preview-link" href={ticket.previewUrl} target="_blank" rel="noreferrer">
            Open branch preview
          </a>
        )}
      </div>
      <div className="practice-preview-banner-actions">
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void onApprove()}>
          Approve
        </button>
        <button
          type="button"
          className="btn btn-secondary on-light"
          disabled={busy}
          onClick={() => setIterateOpen((v) => !v)}
        >
          Needs iteration
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() => {
            clearActivePreview()
            setTicket(null)
          }}
        >
          Exit preview
        </button>
      </div>
      {iterateOpen && (
        <form className="practice-preview-iterate" onSubmit={onIterate}>
          <label htmlFor="preview-iterate-note">What still needs to change?</label>
          <textarea
            id="preview-iterate-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
            placeholder="Be specific — what should look or read differently?"
          />
          <button type="submit" className="btn btn-primary" disabled={busy || !note.trim()}>
            Send iteration notes
          </button>
        </form>
      )}
      {message && <p className="practice-preview-msg">{message}</p>}
    </div>
  )
}
