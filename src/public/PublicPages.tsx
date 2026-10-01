import { Link } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND } from '../brand/copy'
import { HeroMotionLayer, Reveal } from '../components/Motion'

export function HomePage() {
  return (
    <>
      <section className="hero" aria-label={`${BRAND.name} hero`}>
        <HeroMotionLayer />
        <div className="hero-inner">
          <img className="hero-logo" src={BRAND_ASSETS.logoFull} alt={BRAND.name} />
          <h1>{BRAND.theme}</h1>
          <p>{BRAND.promise}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to={BRAND.primaryCtaTo}>
              {BRAND.primaryCta}
            </Link>
            <Link className="btn btn-secondary" to={BRAND.secondaryCtaTo}>
              {BRAND.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <div className="shell-main">
        <Reveal as="section" className="section">
          <p className="section-kicker">Who we serve</p>
          <h2>People ready to belong at work</h2>
          <p className="lede">
            {BRAND.audience} {BRAND.name} holds language, workplace talk, and trade readiness in one path —
            Construction first — so progress feels purposeful, not scattered.
          </p>
        </Reveal>

        <Reveal as="section" className="section" delay={80}>
          <p className="section-kicker">The path</p>
          <h2>Three doors into work</h2>
          <div className="signal-row">
            <Reveal as="article" className="signal construction" delay={120}>
              <img src={BRAND_ASSETS.iconConstruction} alt="" />
              <h3>Construction</h3>
              <p>Safety, tools, and practical skill — the live pathway with instructor verification.</p>
            </Reveal>
            <Reveal as="article" className="signal logistics" delay={200}>
              <img src={BRAND_ASSETS.iconLogistics} alt="" />
              <h3>Logistics</h3>
              <p>Warehouse and supply-chain readiness — next after Construction is proven.</p>
            </Reveal>
            <Reveal as="article" className="signal community" delay={280}>
              <img src={BRAND_ASSETS.iconCommunity} alt="" />
              <h3>Community Support</h3>
              <p>Client care and professional conduct — planned on the same foundation architecture.</p>
            </Reveal>
          </div>
        </Reveal>

        <Reveal as="section" className="section visual-stage" delay={100}>
          <div className="visual-stage-inner">
            <p className="section-kicker on-dark">Honest promise</p>
            <h2>What {BRAND.name} stands for</h2>
            <p className="lede on-dark">
              We do not replace apprenticeship, Red Seal, or third-party safety tickets. We do not promise a job. We do
              build a clear route from understanding, to practice, to instructor-verified readiness for entry-level work
              in {BRAND.place}.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/programs">
                See programs
              </Link>
              <Link className="btn btn-secondary" to={BRAND.joinTo}>
                {BRAND.primaryCta}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  )
}

export function ProgramsPage() {
  return (
    <div className="shell-main stack">
      <Reveal as="header" className="page-header stack" delay={0}>
        <p className="section-kicker">Programs</p>
        <h1>Build toward work you can prove</h1>
        <p className="lede">
          Construction is the live pathway. Logistics and Community Support reuse the same foundation-to-verification
          architecture.
        </p>
      </Reveal>
      <div className="signal-row">
        <Reveal as="article" className="signal construction featured" delay={80}>
          <img src={BRAND_ASSETS.iconConstruction} alt="" />
          <h2>Construction</h2>
          <p>
            Safety, tools, materials, drywall, flooring, painting, and blueprint basics — with safety gates and human
            observation.
          </p>
          <span className="badge ok">Active pathway</span>
        </Reveal>
        <Reveal as="article" className="signal logistics muted-signal" delay={160}>
          <img src={BRAND_ASSETS.iconLogistics} alt="" />
          <h2>Warehousing & Logistics</h2>
          <p>Inventory, packing, receiving, and warehouse safety — after Construction is proven.</p>
          <span className="badge">Coming next</span>
        </Reveal>
        <Reveal as="article" className="signal community muted-signal" delay={240}>
          <img src={BRAND_ASSETS.iconCommunity} alt="" />
          <h2>Community Support</h2>
          <p>Client communication, documentation, and professional conduct — planned pathway.</p>
          <span className="badge">Planned</span>
        </Reveal>
      </div>
      <Reveal delay={280}>
        <Link className="btn btn-primary" to={BRAND.joinTo}>
          {BRAND.primaryCta}
        </Link>
      </Reveal>
    </div>
  )
}

export function AdmissionsPage() {
  return (
    <div className="shell-main stack">
      <Reveal as="header" className="page-header stack">
        <p className="section-kicker">{BRAND.joinLabel}</p>
        <h1>Start your path into {BRAND.name}</h1>
        <p className="lede">
          Register once. An admin confirms your place. Then foundation learning opens — and Construction follows when
          you are ready.
        </p>
      </Reveal>
      <Reveal className="visual-stage" delay={100}>
        <div className="visual-stage-inner">
          <ol className="path-steps on-dark">
            <li>Create your student account</li>
            <li>Wait for registration approval</li>
            <li>Complete foundation preparation</li>
            <li>Select the Construction pathway</li>
            <li>Learn, practise, and earn instructor verification</li>
          </ol>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/register">
              Create student account
            </Link>
            <Link className="btn btn-secondary" to="/login">
              {BRAND.secondaryCta}
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

export function ContactPage() {
  return (
    <div className="shell-main stack">
      <Reveal as="header" className="page-header stack">
        <p className="section-kicker">Help</p>
        <h1>We are here in {BRAND.place}</h1>
        <p className="lede">Questions about joining or opening training? Reach the {BRAND.name} team.</p>
      </Reveal>
      <Reveal className="band stack" delay={100}>
        <p>
          <strong>{BRAND.name}</strong>
          <br />
          {BRAND.place}, Canada
        </p>
        <p>
          Email{' '}
          <a className="inline-link" href={`mailto:${BRAND.contactEmail}`}>
            {BRAND.contactEmail}
          </a>
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to={BRAND.trainingTo}>
            {BRAND.trainingLabel}
          </Link>
          <Link className="btn btn-ghost" to={BRAND.joinTo}>
            {BRAND.primaryCta}
          </Link>
        </div>
      </Reveal>
    </div>
  )
}

export function PrivacyNoticePage() {
  return (
    <div className="shell-main stack">
      <Reveal as="header" className="page-header stack">
        <p className="section-kicker">Privacy</p>
        <h1>How we treat your information</h1>
        <p className="lede">
          {BRAND.name} collects only what learning and evidence need — so trust stays part of the brand promise.
        </p>
      </Reveal>
      <Reveal className="band stack" delay={100}>
        <p>
          This demonstration stores account and learning records on a local {BRAND.name} API (file-backed). Do not enter
          real sensitive personal information. A production deployment would follow Alberta PIPA-aligned safeguards,
          retention limits, and processor agreements.
        </p>
        <p>
          We keep identity for access, progress for instruction, and competency evidence for your Skills Passport —
          nothing beyond the path to verified readiness.
        </p>
        <Link className="btn btn-ghost" to="/">
          Back to {BRAND.name}
        </Link>
      </Reveal>
    </div>
  )
}
