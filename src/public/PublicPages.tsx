import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { BRAND_ASSETS } from '../brand/assets'
import { BRAND, SCHOOL_TEAM } from '../brand/copy'
import { HeroMotionLayer, Reveal } from '../components/Motion'
import { SitePaMark } from '../components/SitePaMark'
import { EnterBox } from '../gateway/EnterBox'
import { markSequenceComplete } from '../gateway/sequenceProgress'

export function HomePage() {
  return (
    <>
      <section className="hero hero-photo" aria-label={`${BRAND.name} hero`}>
        <HeroMotionLayer />
        <div className="hero-pa-back" aria-hidden>
          <SitePaMark className="hero-pa-mark" />
        </div>
        <div className="hero-inner hero-inner-split">
          <div className="hero-copy">
            <img className="hero-logo" src={BRAND_ASSETS.logoFull} alt={BRAND.name} />
            <p className="hero-school-kicker">{BRAND.place} construction school</p>
            <h1>{BRAND.theme}</h1>
            <p>{BRAND.promise}</p>
            <p className="hero-tagline">{BRAND.tagline}</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/admissions">
                {BRAND.primaryCta}
              </Link>
              <Link className="btn btn-secondary" to="/programs">
                Explore programs
              </Link>
            </div>
          </div>
          <EnterBox />
        </div>
      </section>

      <div className="shell-main">
        <Reveal as="section" className="section school-pillars" delay={40}>
          <p className="section-kicker">Why {BRAND.name}</p>
          <h2>A real school for real site work</h2>
          <p className="lede path-lede">
            We teach construction foundations in Calgary — language for the job site, safety, tools, and supervised
            practice — then guide learners into apprenticeship with employers and Alberta trade pathways.
          </p>
          <div className="pillar-grid">
            <article className="pillar">
              <h3>Foundations</h3>
              <p>Classroom and shop basics: safety gear, tools, measurement, and short workplace English.</p>
            </article>
            <article className="pillar">
              <h3>Hands-on practice</h3>
              <p>Instructors watch you work. You practise until the skill is real — not just a quiz score.</p>
            </article>
            <article className="pillar">
              <h3>Apprenticeship path</h3>
              <p>We prepare you for registered apprenticeship and connect you with hiring partners in Alberta.</p>
            </article>
          </div>
        </Reveal>

        <Reveal as="section" className="section serve-split" delay={60}>
          <div className="serve-copy">
            <p className="section-kicker">Who learns here</p>
            <h2>Built for people ready to belong on site</h2>
            <p className="lede">{BRAND.audience}</p>
            <ul className="school-bullets">
              <li>Mother-tongue support early, then English for the job site</li>
              <li>Safety and tools before heavy equipment</li>
              <li>Clear steps from first day to apprenticeship readiness</li>
            </ul>
            <Link className="btn btn-primary" to="/admissions">
              Start admissions
            </Link>
          </div>
          <figure className="serve-figure">
            <img
              src={BRAND_ASSETS.photoLearners}
              alt="Learners preparing for skilled work with Purpose Academy"
            />
            <figcaption>Shop practice. Site language. Instructors who teach for the trade.</figcaption>
          </figure>
        </Reveal>

        <Reveal as="section" className="section" delay={80}>
          <p className="section-kicker">Programs</p>
          <h2>Construction first — then more trades pathways</h2>
          <p className="lede path-lede">
            Our flagship program builds construction foundations and apprenticeship readiness. Related pathways follow
            the same school model.
          </p>
          <div className="signal-row">
            <Reveal as="article" className="signal construction featured" delay={100}>
              <div className="signal-media">
                <img
                  src={BRAND_ASSETS.photoConstruction}
                  alt="Construction students learning on a job site"
                />
                <img className="signal-icon" src={BRAND_ASSETS.iconConstruction} alt="" />
              </div>
              <h3>Construction Foundations</h3>
              <p>
                Safety, tools, materials, framing awareness, and site English — with instructor verification and an
                apprenticeship pathway.
              </p>
              <span className="badge ok">Enrolling now</span>
            </Reveal>
            <Reveal as="article" className="signal logistics" delay={160}>
              <div className="signal-media">
                <img src={BRAND_ASSETS.photoLogistics} alt="Warehouse and logistics training environment" />
                <img className="signal-icon" src={BRAND_ASSETS.iconLogistics} alt="" />
              </div>
              <h3>Warehousing & Logistics</h3>
              <p>Next program track after Construction is established — same school standard.</p>
              <span className="badge">Coming next</span>
            </Reveal>
            <Reveal as="article" className="signal community" delay={220}>
              <div className="signal-media">
                <img src={BRAND_ASSETS.photoCommunity} alt="Community support professionals at work" />
                <img className="signal-icon" src={BRAND_ASSETS.iconCommunity} alt="" />
              </div>
              <h3>Community Support</h3>
              <p>Planned pathway for people-focused work using the same foundation-to-practice model.</p>
              <span className="badge">Planned</span>
            </Reveal>
          </div>
          <div className="hero-actions" style={{ marginTop: '1.25rem' }}>
            <Link className="btn btn-primary" to="/programs">
              View all programs
            </Link>
          </div>
        </Reveal>

        <Reveal as="section" className="section audience-band" delay={90}>
          <p className="section-kicker">Join the school</p>
          <h2>Students, instructors, and donors</h2>
          <div className="audience-grid">
            <article className="audience-card">
              <h3>Students</h3>
              <p>Apply for Construction Foundations. Learn with support. Move toward apprenticeship.</p>
              <Link className="btn btn-primary" to="/admissions">
                Apply now
              </Link>
            </article>
            <article className="audience-card">
              <h3>Instructors</h3>
              <p>Teach shop skills, observe competency, and mentor the next crew of tradespeople.</p>
              <Link className="btn btn-secondary on-light" to="/enter/instructor">
                Instructor portal
              </Link>
            </article>
            <article className="audience-card">
              <h3>Donors & partners</h3>
              <p>Fund tools, bursaries, and placements so more Calgarians can enter the trades.</p>
              <Link className="btn btn-secondary on-light" to="/give">
                Support the school
              </Link>
            </article>
          </div>
        </Reveal>

        <Reveal as="section" className="section visual-stage visual-stage-photo" delay={100}>
          <div className="visual-stage-inner">
            <p className="section-kicker on-dark">Our promise</p>
            <h2>Foundations that lead to apprenticeship</h2>
            <p className="lede on-dark">
              {BRAND.name} is a construction school in {BRAND.place}. We provide foundation training, practical
              instruction, and a supported path into apprenticeship — with employers and Alberta trade systems in view
              from day one.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/about">
                Meet our team
              </Link>
              <Link className="btn btn-secondary" to="/admissions">
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
        <h1>Construction training that leads somewhere</h1>
        <p className="lede">
          Start with Construction Foundations. Build language, safety, and shop skill. Then move into apprenticeship
          readiness with instructor support and employer partners.
        </p>
      </Reveal>

      <Reveal as="article" className="school-program-feature" delay={60}>
        <div className="school-program-copy">
          <span className="badge ok">Flagship program</span>
          <h2>Construction Foundations</h2>
          <p>
            A full school pathway: site English, safety gear, hand and power tools, measurement, systems awareness, and
            supervised practice. Graduates are prepared to enter registered apprenticeship and work with construction
            employers in Alberta.
          </p>
          <ul className="school-bullets">
            <li>Foundation theory + shop practice</li>
            <li>Instructor observation and Skills Passport</li>
            <li>Apprenticeship orientation and employer connection</li>
          </ul>
          <Link className="btn btn-primary" to="/admissions">
            Apply for Construction
          </Link>
        </div>
        <figure className="school-program-media">
          <img src={BRAND_ASSETS.photoConstruction} alt="Construction foundations training at Purpose Academy" />
        </figure>
      </Reveal>

      <div className="signal-row">
        <Reveal as="article" className="signal logistics muted-signal" delay={120}>
          <div className="signal-media">
            <img src={BRAND_ASSETS.photoLogistics} alt="Logistics training environment" />
            <img className="signal-icon" src={BRAND_ASSETS.iconLogistics} alt="" />
          </div>
          <h2>Warehousing & Logistics</h2>
          <p>Future school track — same foundation-to-practice standard after Construction is proven.</p>
          <span className="badge">Coming next</span>
        </Reveal>
        <Reveal as="article" className="signal community muted-signal" delay={180}>
          <div className="signal-media">
            <img src={BRAND_ASSETS.photoCommunity} alt="Community support training setting" />
            <img className="signal-icon" src={BRAND_ASSETS.iconCommunity} alt="" />
          </div>
          <h2>Community Support</h2>
          <p>Planned program for people-focused careers using our school model.</p>
          <span className="badge">Planned</span>
        </Reveal>
      </div>
    </div>
  )
}

export function AdmissionsPage() {
  return (
    <div className="shell-main stack">
      <Reveal as="header" className="page-header stack">
        <p className="section-kicker">{BRAND.joinLabel}</p>
        <h1>How to join {BRAND.name}</h1>
        <p className="lede">
          Clear steps from application to foundations to apprenticeship readiness — built for newcomers and first-time
          trades learners in {BRAND.place}.
        </p>
      </Reveal>

      <Reveal className="visual-stage visual-stage-photo" delay={80}>
        <div className="visual-stage-inner">
          <ol className="path-steps on-dark">
            <li>Create your student account</li>
            <li>Complete registration — admin confirms your place</li>
            <li>Start Construction Foundations (language, safety, tools)</li>
            <li>Practise with instructors and earn verified skills</li>
            <li>Enter apprenticeship readiness and employer connection</li>
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

      <Reveal className="band stack" delay={120}>
        <h2>What you need to begin</h2>
        <ul className="school-bullets">
          <li>Willingness to learn safety and site English</li>
          <li>Interest in construction work in Alberta</li>
          <li>A way to reach us by email or phone</li>
        </ul>
        <p className="muted">
          Questions before you apply?{' '}
          <Link className="inline-link" to="/contact">
            Contact admissions
          </Link>{' '}
          or email{' '}
          <a className="inline-link" href={`mailto:${BRAND.contactEmail}`}>
            {BRAND.contactEmail}
          </a>
          .
        </p>
      </Reveal>
    </div>
  )
}

export function AboutPage() {
  return (
    <div className="shell-main stack">
      <Reveal as="header" className="page-header stack" delay={0}>
        <p className="section-kicker">About</p>
        <h1>A construction school rooted in Calgary</h1>
        <p className="lede">
          {BRAND.name} exists so people can learn foundations, practise with real instructors, and step into
          apprenticeship — not as a side project, but as a school built for the trades.
        </p>
      </Reveal>

      <Reveal className="serve-split" delay={60}>
        <div className="serve-copy">
          <h2>Our story</h2>
          <p className="lede">
            We started with a clear need: newcomers and job seekers who want construction careers need more than a
            video library. They need language support, shop practice, safety discipline, and a real path into Alberta
            apprenticeship.
          </p>
          <p>
            Today {BRAND.name} operates as a construction school in {BRAND.place}. Construction Foundations is our
            open program. Instructors verify skill. Partners help learners move into work and apprenticeship.
          </p>
        </div>
        <figure className="serve-figure">
          <img src={BRAND_ASSETS.photoCalgary} alt="Calgary skyline — home of Purpose Academy" />
          <figcaption>{BRAND.place} — where our learners live, train, and work.</figcaption>
        </figure>
      </Reveal>

      <Reveal as="section" className="section" delay={100}>
        <p className="section-kicker">People</p>
        <h2>Founders & instructors</h2>
        <p className="lede path-lede">The team that builds the school and teaches the trade.</p>
        <div className="team-grid">
          {SCHOOL_TEAM.map((person) => (
            <article key={person.name} className="team-card">
              <div className="team-avatar" aria-hidden>
                {person.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')}
              </div>
              <h3>{person.name}</h3>
              <p className="team-role">{person.role}</p>
              <p>{person.focus}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="band stack" delay={140}>
        <h2>What we stand for</h2>
        <ul className="school-bullets">
          <li>Foundations before shortcuts</li>
          <li>Instructors who verify what learners can do</li>
          <li>A supported path into apprenticeship</li>
          <li>Respect for newcomers and career changers</li>
        </ul>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/admissions">
            {BRAND.primaryCta}
          </Link>
          <Link className="btn btn-ghost" to="/give">
            Support the school
          </Link>
        </div>
      </Reveal>
    </div>
  )
}

export function GivePage() {
  return (
    <div className="shell-main stack">
      <Reveal as="header" className="page-header stack" delay={0}>
        <p className="section-kicker">Give</p>
        <h1>Help more people enter the trades</h1>
        <p className="lede">
          Donors and industry partners fund tools, student supports, and placements that turn foundations into
          apprenticeships.
        </p>
      </Reveal>

      <Reveal className="audience-grid" delay={80}>
        <article className="audience-card">
          <h3>Student bursaries</h3>
          <p>Remove money barriers so learners can finish foundations and step into work.</p>
        </article>
        <article className="audience-card">
          <h3>Shop & tools</h3>
          <p>Equip bays with the tools and safety gear every construction student needs.</p>
        </article>
        <article className="audience-card">
          <h3>Employer partnerships</h3>
          <p>Sponsor placements and apprenticeship introductions for graduating learners.</p>
        </article>
      </Reveal>

      <Reveal className="band stack" delay={120}>
        <h2>Partner with {BRAND.name}</h2>
        <p>
          Email{' '}
          <a className="inline-link" href={`mailto:${BRAND.contactEmail}?subject=Donor%20or%20partner%20inquiry`}>
            {BRAND.contactEmail}
          </a>{' '}
          to talk about donations, tool drives, or hiring partnerships.
        </p>
        <Link className="btn btn-primary" to="/contact">
          Contact the school
        </Link>
      </Reveal>
    </div>
  )
}

export function ContactPage() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    markSequenceComplete('contact', { detail: name.trim() || 'Visitor' })
    setSent(true)
  }

  return (
    <div className="shell-main stack">
      <Reveal as="header" className="page-header stack">
        <p className="section-kicker">Contact</p>
        <h1>Talk with {BRAND.name}</h1>
        <p className="lede">
          Admissions, instructor interest, donor questions, or employer partnerships — we are based in {BRAND.place}.
        </p>
      </Reveal>
      <Reveal className="band stack" delay={100}>
        <p>
          <strong>{BRAND.name}</strong>
          <br />
          Construction school · {BRAND.place}, Canada
        </p>
        <p>
          Email{' '}
          <a
            className="inline-link"
            href={`mailto:${BRAND.contactEmail}`}
            onClick={() => markSequenceComplete('contact', { detail: 'mailto' })}
          >
            {BRAND.contactEmail}
          </a>
        </p>
        {sent ? (
          <div className="alert ok">
            Thank you{name ? `, ${name}` : ''}. Your message was recorded. Our team will follow up.
          </div>
        ) : (
          <form className="stack" onSubmit={onSubmit} style={{ maxWidth: 480 }}>
            <div className="field">
              <label htmlFor="contact-name">Your name</label>
              <input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label htmlFor="contact-msg">Your question</label>
              <textarea
                id="contact-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Send message
            </button>
          </form>
        )}
        <div className="hero-actions">
          <Link className="btn btn-secondary" to="/admissions">
            {BRAND.primaryCta}
          </Link>
          <Link className="btn btn-ghost" to="/about">
            About the school
          </Link>
        </div>
      </Reveal>
    </div>
  )
}

/** Privacy notice for the school site. */
export function PrivacyNoticePage() {
  return (
    <div className="shell-main stack">
      <Reveal as="header" className="page-header stack">
        <p className="section-kicker">Privacy</p>
        <h1>How we treat your information</h1>
        <p className="lede">
          {BRAND.name} collects only what admissions, learning, and skill evidence need — so trust stays part of the
          school.
        </p>
      </Reveal>
      <Reveal className="band stack" delay={100}>
        <p>
          This site stores account and learning records for school operations. Do not enter unnecessary sensitive
          personal information in demo environments. Production deployments follow Alberta privacy expectations,
          retention limits, and secure processing.
        </p>
        <p>
          We keep identity for access, progress for instruction, and competency evidence for your Skills Passport —
          nothing beyond training and apprenticeship readiness.
        </p>
        <Link className="btn btn-ghost" to="/">
          Back to {BRAND.name}
        </Link>
      </Reveal>
    </div>
  )
}
