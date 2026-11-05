import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  COMMUNITY_WORKBOOKS,
  WORKBOOK_CATEGORIES,
  WORKBOOK_SOURCE_FOLDER,
  workbookByNumber,
  workbookImage,
  workbookSetLabel,
  type WorkbookCategory,
} from './communityWorkbooks'
import { useTeacherPracticeBase } from './teacherPracticePaths'

type Filter = 'all' | WorkbookCategory

/**
 * Community Support workbook library — 25 Yonas visual vocabulary sets.
 * Instructors preview the translated workbook, then use the picture check.
 */
export function CommunityWorkbooksPage() {
  const { setNumber } = useParams<{ setNumber?: string }>()
  const navigate = useNavigate()
  const base = useTeacherPracticeBase()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const panelId = useId()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [tab, setTab] = useState<'workbook' | 'check'>('workbook')

  const active = workbookByNumber(Number(setNumber))
  const activeIndex = active ? COMMUNITY_WORKBOOKS.findIndex((set) => set.n === active.n) : -1
  const previous = activeIndex > 0 ? COMMUNITY_WORKBOOKS[activeIndex - 1] : undefined
  const next =
    activeIndex >= 0 && activeIndex < COMMUNITY_WORKBOOKS.length - 1
      ? COMMUNITY_WORKBOOKS[activeIndex + 1]
      : undefined

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return COMMUNITY_WORKBOOKS.filter((set) => {
      if (filter !== 'all' && set.category !== filter) return false
      if (!needle) return true
      const category = WORKBOOK_CATEGORIES.find((c) => c.id === set.category)?.label || ''
      const haystack = `${set.n} ${workbookSetLabel(set.n)} ${set.title} ${set.focus} ${category} ${set.source}`
      return haystack.toLowerCase().includes(needle)
    })
  }, [filter, query])

  useEffect(() => {
    if (!active) return
    setTab('workbook')
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => {
      headingRef.current?.focus({ preventScroll: true })
      headingRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    }, 30)
    return () => window.clearTimeout(timer)
  }, [active?.n])

  const filteredByCategory = (id: Filter) =>
    id === 'all' ? COMMUNITY_WORKBOOKS.length : COMMUNITY_WORKBOOKS.filter((set) => set.category === id).length

  const selectTab = (nextTab: 'workbook' | 'check', focus = false) => {
    setTab(nextTab)
    if (!focus) return
    const id = nextTab === 'workbook' ? `${panelId}-workbook-tab` : `${panelId}-check-tab`
    window.requestAnimationFrame(() => document.getElementById(id)?.focus())
  }

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextTab =
      event.key === 'ArrowLeft' || event.key === 'Home' ? 'workbook' : 'check'
    selectTab(nextTab, true)
  }

  return (
    <div className="stack wb-page">
      <header className="wb-page-head">
        <div>
          <p className="section-kicker">Instructor · Community Support</p>
          <h1>Community Support Workbooks</h1>
          <p className="lede">
            Twenty-five visual vocabulary sets from Yonas Tesfagabr, Community Support instructor. Each
            set pairs a translated workbook page with a picture check, so learners can meet the words and
            then name the pictures in English.
          </p>
        </div>
        <div className="wb-page-actions">
          <Link className="btn btn-ghost" to={base}>
            Instructor Practice
          </Link>
          <Link className="btn btn-primary" to="/journey">
            Student Practice
          </Link>
        </div>
      </header>

      <div className="wb-use-row" aria-label="How to use a workbook set">
        <p>
          <span>1</span> <strong>Preview</strong> the translated workbook together.
        </p>
        <p>
          <span>2</span> <strong>Teach</strong> a few pictures at a time.
        </p>
        <p>
          <span>3</span> <strong>Check</strong> with the picture page.
        </p>
      </div>

      <p className="wb-draft-note">
        Draft teaching material for instructor and program review. These sets support the proposed eight-month
        curriculum; they do not replace it, and they are not an accreditation or certification claim.
      </p>

      {active && (
        <section className="wb-viewer panel" aria-labelledby={`${panelId}-title`}>
          <div className="wb-viewer-head">
            <div>
              <p className="section-kicker">
                {workbookSetLabel(active.n)} ·{' '}
                {WORKBOOK_CATEGORIES.find((category) => category.id === active.category)?.label}
              </p>
              <h2 id={`${panelId}-title`} ref={headingRef} tabIndex={-1}>
                {active.title}
              </h2>
              <p className="wb-viewer-focus">{active.focus}</p>
            </div>
            <button
              type="button"
              className="wb-viewer-close"
              onClick={() => navigate(`${base}/workbooks`)}
            >
              All workbooks
            </button>
          </div>

          <div className="wb-viewer-tools">
            <div className="wb-tabs" role="tablist" aria-label="Workbook view">
              <button
                type="button"
                role="tab"
                id={`${panelId}-workbook-tab`}
                aria-selected={tab === 'workbook'}
                aria-controls={`${panelId}-panel`}
                tabIndex={tab === 'workbook' ? 0 : -1}
                className={tab === 'workbook' ? 'is-on' : ''}
                onClick={() => selectTab('workbook')}
                onKeyDown={onTabKeyDown}
              >
                Workbook
              </button>
              <button
                type="button"
                role="tab"
                id={`${panelId}-check-tab`}
                aria-selected={tab === 'check'}
                aria-controls={`${panelId}-panel`}
                tabIndex={tab === 'check' ? 0 : -1}
                className={tab === 'check' ? 'is-on' : ''}
                onClick={() => selectTab('check')}
                onKeyDown={onTabKeyDown}
              >
                Picture check
              </button>
            </div>
            <div className="wb-viewer-actions">
              <a
                className="btn btn-secondary on-light"
                href={workbookImage(active.n, tab === 'check' ? 'check' : 'workbook')}
                target="_blank"
                rel="noreferrer"
              >
                Open full image
              </a>
              <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
                Print
              </button>
            </div>
          </div>

          <div
            id={`${panelId}-panel`}
            role="tabpanel"
            aria-labelledby={tab === 'workbook' ? `${panelId}-workbook-tab` : `${panelId}-check-tab`}
          >
            <figure className="wb-frame">
              <img
                key={`${active.n}-${tab}`}
                src={workbookImage(active.n, tab === 'check' ? 'check' : 'workbook')}
                alt={
                  tab === 'check'
                    ? `${active.title}: picture check page. Match each picture to the English word.`
                    : `${active.title}: visual vocabulary workbook page with ${active.words} words and translations.`
                }
              />
              <figcaption>
                {tab === 'check'
                  ? 'Picture check — translations are removed, but each picture keeps its English word. Ask the learner to say the word and point to the picture; cover the word for a harder recall.'
                  : `Workbook page — ${active.words} words with translations. Preview it, then move to the picture check.`}
              </figcaption>
            </figure>
            {tab === 'workbook' && (
              <p className="wb-phone-hint">
                On a phone, open the full image to zoom in on a word.
              </p>
            )}
          </div>

          <nav className="wb-pager" aria-label="Workbook sets">
            {previous ? (
              <Link className="btn btn-ghost" to={`${base}/workbooks/${previous.n}`}>
                Previous set · {workbookSetLabel(previous.n)}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link className="btn btn-ghost" to={`${base}/workbooks/${next.n}`}>
                Next set · {workbookSetLabel(next.n)}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </section>
      )}

      {!active && (
        <section className="wb-library" aria-labelledby={`${panelId}-library`}>
          <div className="wb-library-head">
            <div>
              <h2 id={`${panelId}-library`}>All 25 sets</h2>
              <p className="muted">
                Showing {filtered.length} of {COMMUNITY_WORKBOOKS.length}. Open a set to preview its workbook
                and picture check.
              </p>
            </div>
            <label className="wb-search">
              <span>Find a set</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Roles, safety, housing…"
                autoComplete="off"
              />
            </label>
          </div>

          <div className="wb-filters" role="group" aria-label="Filter sets by topic">
            <button
              type="button"
              className={filter === 'all' ? 'is-on' : ''}
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All <span>{filteredByCategory('all')}</span>
            </button>
            {WORKBOOK_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className={filter === category.id ? 'is-on' : ''}
                aria-pressed={filter === category.id}
                onClick={() => setFilter(category.id)}
              >
                {category.label} <span>{filteredByCategory(category.id)}</span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="panel wb-empty">
              <h3>No set matches that search.</h3>
              <p>Try a word from a title, or clear the filters to see all 25 sets.</p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setQuery('')
                  setFilter('all')
                }}
              >
                Clear search and filters
              </button>
            </div>
          ) : (
            <div className="wb-grid">
              {filtered.map((set) => (
                <Link
                  key={set.n}
                  className="wb-card"
                  to={`${base}/workbooks/${set.n}`}
                  aria-label={`Open ${workbookSetLabel(set.n)}: ${set.title}`}
                >
                  <span className="wb-card-media">
                    <img
                      src={workbookImage(set.n, 'thumb')}
                      alt=""
                      loading="lazy"
                      width={480}
                      height={320}
                    />
                    <span className="wb-card-num">{workbookSetLabel(set.n)}</span>
                  </span>
                  <span className="wb-card-body">
                    <strong>{set.title}</strong>
                    <span className="wb-card-focus">{set.focus}</span>
                    <span className="wb-card-meta">
                      {set.words} words · workbook + picture check
                    </span>
                    <span className="wb-card-open">Open set</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <details className="panel wb-source">
        <summary>Source and review notes</summary>
        <div className="stack">
          <p>
            Workbook pages are CSW1–CSW25 and picture checks are CSWE1–CSWE25 from the{' '}
            <a className="inline-link" href={WORKBOOK_SOURCE_FOLDER} target="_blank" rel="noreferrer">
              Yonas Community Support folder
            </a>{' '}
            shared by Yonas Tesfagabr, Community Support instructor. The app uses optimized copies; the
            linked folder remains the source of record.
          </p>
          <p>
            The source uses five learner languages: Spanish, Arabic, Hindi, Amharic and Tigrinya. It does not
            include French. Check each set against current program materials before teaching it.
          </p>
          <p>
            Use fictional learner examples. Protect privacy, ask permission, respect choice, and seek supervisor
            guidance when unsure. Physical or clinical assistance requires separate training, authorization and
            supervision.
          </p>
          <p>
            <Link className="inline-link" to={base}>
              See how these sets connect to Instructor Practice
            </Link>
            .
          </p>
        </div>
      </details>
    </div>
  )
}
