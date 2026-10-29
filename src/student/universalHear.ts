/**
 * Workplace Words universal hear — translate English vocab + speak it.
 *
 * Design informed by public OSS / free APIs (protocols studied; not proprietary scrape):
 * - LibreTranslate (github.com/LibreTranslate/LibreTranslate) + Argos Translate engine —
 *   preferred self-host shape; hosted libretranslate.com requires a paid key (Pages can't
 *   host the server). Optional `VITE_LIBRETRANSLATE_URL` hits a self-hosted /translate.
 * - MyMemory Translation API (CORS-open, no key) — static GitHub Pages fallback.
 * - Purpose Academy `/api/enrich/translate` when Render API is awake (MyMemory server-side).
 * - TTS: existing Edge neural (`msedge-tts` / baked MP3s) → Google TTS → Web Speech API
 *   (`speechSynthesis` + BCP-47), inspired by edge-tts / MsEdgeTTS voice lists.
 * - Avoid Lingva / unofficial Google-translate proxies in production (ToS risk).
 *
 * Session cache: word + lang → translation. Soft errors never silent-fail.
 */

import type { HearLanguage } from './hearLanguages'
import { speakLangCode } from './speech'

export type UniversalHearStatus =
  | { kind: 'idle' }
  | { kind: 'loading'; phase: 'translate' | 'speak' }
  | {
      kind: 'ready'
      translated: string
      lang: HearLanguage
      source: string
      spoken: boolean
    }
  | { kind: 'unsupported'; lang: HearLanguage; detail: string }
  | { kind: 'error'; detail: string }

export type UniversalBridge = {
  code: string
  name: string
  translated: string
  source: string
}

type CacheEntry = {
  translated: string
  source: string
}

const sessionCache = new Map<string, CacheEntry>()

function cacheKey(word: string, langCode: string) {
  return `${word.trim().toLowerCase()}::${langCode.toLowerCase()}`
}

function apiBase() {
  const configured = import.meta.env.VITE_API_URL as string | undefined
  return configured?.replace(/\/$/, '') || ''
}

function looksInvalidTranslation(text: string): boolean {
  const t = text.trim()
  if (!t) return true
  if (/INVALID/i.test(t)) return true
  if (/IS AN INVALID/i.test(t)) return true
  if (/PLEASE SELECT TWO DISTINCT/i.test(t)) return true
  return false
}

async function translateViaApi(word: string, to: string): Promise<CacheEntry | null> {
  const base = apiBase()
  if (!base && import.meta.env.PROD) return null
  try {
    const url = `${base || ''}/api/enrich/translate?q=${encodeURIComponent(word)}&from=en&to=${encodeURIComponent(to)}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = (await res.json()) as { translated?: string; source?: string }
    if (!data.translated || looksInvalidTranslation(data.translated)) return null
    return {
      translated: data.translated.trim(),
      source: data.source || 'Purpose Academy translate API',
    }
  } catch {
    return null
  }
}

/**
 * Optional self-hosted LibreTranslate (Argos) — set VITE_LIBRETRANSLATE_URL to an
 * instance root (e.g. https://translate.example.com). CORS must allow our Pages origin.
 * Protocol: POST /translate { q, source, target, format } → { translatedText }
 * @see https://github.com/LibreTranslate/LibreTranslate
 */
async function translateViaLibreTranslate(word: string, to: string): Promise<CacheEntry | null> {
  const root = String(import.meta.env.VITE_LIBRETRANSLATE_URL || '')
    .trim()
    .replace(/\/$/, '')
  if (!root) return null
  try {
    const res = await fetch(`${root}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: word.slice(0, 480),
        source: 'en',
        target: to.split('-')[0],
        format: 'text',
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { translatedText?: string; error?: string }
    const translated = String(data.translatedText || '').trim()
    if (!translated || looksInvalidTranslation(translated) || data.error) return null
    return {
      translated,
      source: 'LibreTranslate (self-hosted / Argos)',
    }
  } catch {
    return null
  }
}

/** MyMemory — free, no key, CORS *. https://mymemory.translated.net/doc/spec.php */
async function translateViaMyMemory(word: string, to: string): Promise<CacheEntry> {
  const url = new URL('https://api.mymemory.translated.net/get')
  url.searchParams.set('q', word.slice(0, 480))
  url.searchParams.set('langpair', `en|${to}`)
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error('Translation service unavailable right now')
  const data = (await res.json()) as {
    responseStatus?: number | string
    responseData?: { translatedText?: string }
    responseDetails?: string
  }
  const translated = String(data.responseData?.translatedText || '').trim()
  const status = Number(data.responseStatus)
  if (looksInvalidTranslation(translated) || (status && status !== 200)) {
    const detail =
      looksInvalidTranslation(translated) && /INVALID/i.test(translated)
        ? translated
        : data.responseDetails || 'This language is not available for translate-and-hear yet.'
    const err = new Error(detail) as Error & { unsupported?: boolean }
    err.unsupported = true
    throw err
  }
  return {
    translated,
    source: 'MyMemory Translation API',
  }
}

export async function translateVocabWord(
  english: string,
  lang: HearLanguage,
): Promise<CacheEntry> {
  const clean = english.trim()
  if (!clean) throw new Error('No word to translate')
  if (lang.code === 'en' || lang.bcp47.startsWith('en')) {
    return { translated: clean, source: 'passthrough' }
  }
  const key = cacheKey(clean, lang.code)
  const hit = sessionCache.get(key)
  if (hit) return hit

  const viaApi = await translateViaApi(clean, lang.code)
  if (viaApi) {
    sessionCache.set(key, viaApi)
    return viaApi
  }

  const viaLt = await translateViaLibreTranslate(clean, lang.code)
  if (viaLt) {
    sessionCache.set(key, viaLt)
    return viaLt
  }

  const viaMm = await translateViaMyMemory(clean, lang.code)
  sessionCache.set(key, viaMm)
  return viaMm
}

/**
 * Translate + speak the English workplace word in `lang`.
 * Always returns a status — never silent-fails.
 */
export async function hearVocabInLanguage(
  english: string,
  lang: HearLanguage,
): Promise<UniversalHearStatus> {
  try {
    const { translated, source } = await translateVocabWord(english, lang)
    const spoken = await speakLangCode(translated, lang.code, lang.bcp47)
    if (!spoken) {
      return {
        kind: 'ready',
        translated,
        lang,
        source,
        spoken: false,
      }
    }
    return {
      kind: 'ready',
      translated,
      lang,
      source,
      spoken: true,
    }
  } catch (e) {
    const err = e as Error & { unsupported?: boolean }
    const detail = err?.message || 'Could not translate that language right now.'
    if (err?.unsupported) {
      return { kind: 'unsupported', lang, detail }
    }
    return { kind: 'error', detail }
  }
}

export function clearUniversalHearCache() {
  sessionCache.clear()
}
