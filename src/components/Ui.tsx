import { Link } from 'react-router-dom'
import { BRAND } from '../brand/copy'
import { AmbientField, Reveal } from './Motion'

export function SkipLink() {
  return (
    <a className="skip-link" href="#main-content">
      Skip to main content
    </a>
  )
}

export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="splash" role="status" aria-live="polite">
      <AmbientField />
      <div>
        <img src="/brand/logo-full.jpg" alt="" style={{ width: 140, height: 'auto' }} />
        <h1 className="sr-only">{BRAND.name}</h1>
        <p className="muted">{label}</p>
      </div>
    </div>
  )
}

export function PageHeader({
  kicker,
  title,
  help,
  backTo,
  backLabel = 'Back',
}: {
  kicker?: string
  title: string
  help?: string
  backTo?: string
  backLabel?: string
}) {
  return (
    <Reveal as="header" className="page-header stack" delay={0}>
      {backTo && (
        <Link className="back-link" to={backTo}>
          ← {backLabel}
        </Link>
      )}
      {kicker && <p className="section-kicker">{kicker}</p>}
      <h1>{title}</h1>
      {help && <p className="lede">{help}</p>}
    </Reveal>
  )
}

export function StatusLabel({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: string }> = {
    pending: { label: 'Not submitted yet', tone: 'warn' },
    approved: { label: 'Approved — ready to learn', tone: 'ok' },
    rejected: { label: 'Not approved', tone: 'danger' },
    submitted: { label: 'Sent — waiting for review', tone: 'brand' },
    graded: { label: 'Graded', tone: 'ok' },
    PASS: { label: 'Safety cleared', tone: 'ok' },
    BLOCKED: { label: 'Safety blocked', tone: 'warn' },
    EXPIRED: { label: 'Safety expired', tone: 'danger' },
    MANUAL_REVIEW: { label: 'Needs instructor review', tone: 'warn' },
    learned: { label: 'Learned', tone: 'brand' },
    practised: { label: 'Practised', tone: 'brand' },
    competent: { label: 'Competent (verified)', tone: 'ok' },
    remediation_required: { label: 'Needs more practice', tone: 'danger' },
    not_assessed: { label: 'Not assessed yet', tone: 'warn' },
  }
  const item = map[status] || { label: status.replaceAll('_', ' '), tone: 'brand' }
  return <span className={`badge ${item.tone}`}>{item.label}</span>
}

export function RegistrationStatusLabel({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: string }> = {
    pending: { label: 'Waiting for approval', tone: 'warn' },
    approved: { label: 'Approved — ready to learn', tone: 'ok' },
    rejected: { label: 'Not approved', tone: 'danger' },
  }
  const item = map[status] || { label: status, tone: 'brand' }
  return <span className={`badge ${item.tone}`}>{item.label}</span>
}

export function NextStepCard({
  title,
  body,
  to,
  cta,
}: {
  title: string
  body: string
  to: string
  cta: string
}) {
  return (
    <Reveal className="panel next-step stack" delay={60}>
      <p className="section-kicker">Your next step</p>
      <h2>{title}</h2>
      <p>{body}</p>
      <Link className="btn btn-primary" to={to}>
        {cta}
      </Link>
    </Reveal>
  )
}
