# UX / UI honest review

Product: **Purpose Academy** (formerly working title Purpose Academy)  
Review date: 2026-09-28  
Audience: newcomers and workforce learners (plain language, low digital familiarity), plus instructors and admins.

## Verdict

The product flow matches the plan (register → approve → foundation → Construction → assignments → skills). After this pass, **navigability is clearer**, especially for students on phones. It is usable for a Construction pilot demo. It is **not** yet production-polished accessibility or content-complete for all pathways.

## What was wrong (honest)

1. **Too many bottom-nav links** — six student tabs crowded small screens.
2. **Jargon labels** — “Assess”, “Skills”, “Admissions” were unclear for some learners.
3. **Next action competed with weather/quotes** — Home did not put the learning CTA first loudly enough.
4. **Raw status words** — “pending”, “BLOCKED” are system speak, not human speak.
5. **Auth screens had no site chrome** — easy to feel lost with no way back to the website/help.
6. **Blank wait while session loaded** — looked broken.
7. **Splash forced a delay** — friction without value.
8. **Security story was invisible** — admins had no clear privacy/security screen copy after going full-stack.

## What we fixed

- Mobile nav: **Home / Learn / Tasks / Skills / More** (student)
- Plain-language nav and status labels (`StatusLabel`)
- **Your next step** card first on student Home
- Skip link, focus rings, larger tap targets (48px)
- Auth shell with Website / Help / Sign in
- Loading screen during session restore
- Splash can be skipped; defaults toward the public site
- Profile “More” page links foundation, program, progress, help
- Admin Security & privacy page documents controls

## Remaining gaps (honest, not yet built)

- Full WCAG audit with screen-reader users
- Offline / poor-connectivity recovery UI
- Multilingual UI chrome (support language is content-only today)
- Instructor tablet observation optimized one-thumb layout
- Logistics / Community pathways still locked by design

## Usability checklist (pilot)

- [ ] New student can register without staff coaching on buttons
- [ ] Pending student understands they must wait
- [ ] Approved student always sees one obvious next lesson
- [ ] Instructor can find grading and observation in under two taps
- [ ] Admin can approve a student from Overview → Approve students
