/** Shared brand vocabulary — Purpose Academy as a Calgary construction school. */
export const BRAND = {
  name: 'Purpose Academy',
  place: 'Calgary, Alberta',
  /** Hero-level school identity */
  theme: 'Build your future in construction',
  promise:
    'A Calgary construction school for foundations, language for the job site, and a clear path into apprenticeship.',
  audience:
    'Newcomers, career changers, and job seekers who want hands-on construction training with real instructors.',
  primaryCta: 'Apply now',
  primaryCtaTo: '/admissions',
  secondaryCta: 'Sign in',
  secondaryCtaTo: '/login',
  joinLabel: 'Admissions',
  joinTo: '/admissions',
  trainingLabel: 'Student portal',
  trainingTo: '/welcome',
  contactEmail: 'hello@purposeacademy.ca',
  domain: 'purposeacademy.ca',
  tagline: 'Foundations. Practice. Apprenticeship.',
} as const

/** About page — founding team and instructors (update with live bios as they land). */
export const SCHOOL_TEAM = [
  {
    role: 'Founder & Executive Director',
    name: 'Levi Zigza',
    focus: 'School vision, community partnerships, and student success in Calgary.',
  },
  {
    role: 'Construction Program Lead',
    name: 'Jordan Hale',
    focus: 'Shop instruction, safety standards, and apprenticeship readiness.',
  },
  {
    role: 'Language & Workplace Readiness',
    name: 'Amira Bekele',
    focus: 'Site English, mother-tongue support, and workplace communication.',
  },
  {
    role: 'Industry & Employer Partnerships',
    name: 'Marcus Chen',
    focus: 'Hiring partners, work placements, and apprenticeship introductions.',
  },
] as const
