import type { SupportLang } from './journeyCurriculum'

/**
 * Speech for Purpose Academy student audio.
 *
 * Priority (most human → fallback):
 * 1. Baked Edge neural MP3s in /tts (GitHub Pages — no API required)
 * 2. Live Microsoft Edge neural TTS via /api/enrich/tts (local / hosted API)
 * 3. Free Dictionary human pronunciation for single English words — short timeout
 * 4. Browser speechSynthesis (last resort — often robotic)
 */

/** BCP-47 tags for Web Speech API voices. */
export const SUPPORT_LANG_CODE: Record<SupportLang, string> = {
  English: 'en-US',
  Spanish: 'es-ES',
  Arabic: 'ar-SA',
  Hindi: 'hi-IN',
  Amharic: 'am-ET',
  Tigrinya: 'ti-ET',
}

/** Short codes for the neural TTS API. */
export const SUPPORT_TTS_LANG: Record<SupportLang, string> = {
  English: 'en',
  Spanish: 'es',
  Arabic: 'ar',
  Hindi: 'hi',
  Amharic: 'am',
  Tigrinya: 'ti',
}

const FALLBACK_LANG: Partial<Record<SupportLang, string>> = {
  English: 'en',
  Amharic: 'am',
  Tigrinya: 'am',
  Arabic: 'ar',
  Hindi: 'hi',
  Spanish: 'es',
}

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null
let currentAudio: HTMLAudioElement | null = null
const audioUrlCache = new Map<string, string>()
let bakedManifest: Record<string, string> | null | undefined

function apiBase() {
  const configured = import.meta.env.VITE_API_URL as string | undefined
  return configured?.replace(/\/$/, '') || ''
}

function assetBase() {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

async function loadBakedManifest(): Promise<Record<string, string> | null> {
  if (bakedManifest !== undefined) return bakedManifest
  try {
    const res = await fetch(`${assetBase()}tts/manifest.json`, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) {
      bakedManifest = null
      return null
    }
    bakedManifest = (await res.json()) as Record<string, string>
    return bakedManifest
  } catch {
    bakedManifest = null
    return null
  }
}

async function speakBaked(text: string, langCode: string): Promise<boolean> {
  const clean = text.trim().replace(/\s+/g, ' ')
  if (!clean) return false
  const manifest = await loadBakedManifest()
  if (!manifest) return false
  const file = manifest[`${langCode}::${clean}`]
  if (!file) return false
  return playAudioUrl(`${assetBase()}tts/${file}`)
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return Promise.resolve([])
  }
  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      const syn = window.speechSynthesis
      const current = syn.getVoices()
      if (current.length) {
        resolve(current)
        return
      }
      const done = () => {
        syn.removeEventListener('voiceschanged', done)
        resolve(syn.getVoices())
      }
      syn.addEventListener('voiceschanged', done)
      setTimeout(() => resolve(syn.getVoices()), 500)
    })
  }
  return voicesReady
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
  const exact = voices.find((v) => v.lang === lang)
  if (exact) return exact
  const prefix = lang.split('-')[0]
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.removeAttribute('src')
      currentAudio.load()
    } catch {
      /* ignore */
    }
    currentAudio = null
  }
}

export function primeSpeech() {
  void loadVoices()
}

function playAudioUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }
    stopSpeech()
    const audio = new Audio(url)
    currentAudio = audio
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null
      resolve(true)
    }
    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null
      resolve(false)
    }
    void audio.play().catch(() => {
      if (currentAudio === audio) currentAudio = null
      resolve(false)
    })
  })
}

async function speakNeural(text: string, langCode: string): Promise<boolean> {
  const clean = text.trim()
  if (!clean) return false
  /* Static Pages with no VITE_API_URL has no /api — skip the 404 round-trip. */
  const base = apiBase()
  if (!base && import.meta.env.PROD) return false
  const key = `${langCode}::${clean}`
  let url = audioUrlCache.get(key)
  if (!url) {
    const endpoint = `${base}/api/enrich/tts?lang=${encodeURIComponent(langCode)}&text=${encodeURIComponent(clean)}`
    try {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(12000) })
      if (!res.ok) return false
      const blob = await res.blob()
      if (!blob.size) return false
      url = URL.createObjectURL(blob)
      if (audioUrlCache.size > 80) {
        const first = audioUrlCache.keys().next().value
        if (first) {
          URL.revokeObjectURL(audioUrlCache.get(first)!)
          audioUrlCache.delete(first)
        }
      }
      audioUrlCache.set(key, url)
    } catch {
      return false
    }
  }
  return playAudioUrl(url)
}

/** Optional Free Dictionary recording — never block neural TTS if the API is slow. */
async function speakDictionaryEnglish(word: string): Promise<boolean> {
  const clean = word.trim()
  if (!clean || /\s/.test(clean)) return false
  try {
    const res = await fetch(
      `${apiBase()}/api/enrich/pronounce/${encodeURIComponent(clean.toLowerCase())}`,
      { signal: AbortSignal.timeout(2000) },
    )
    if (!res.ok) return false
    const data = (await res.json()) as { audio?: string | null; found?: boolean }
    if (!data.audio) return false
    return playAudioUrl(data.audio)
  } catch {
    return false
  }
}

function speakBrowser(text: string, lang: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve(false)
      return
    }
    void loadVoices().then((voices) => {
      stopSpeech()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang
      const voice = pickVoice(voices, lang)
      if (voice) u.voice = voice
      /* Slightly slower / lower pitch softens the default robotic cadence. */
      u.rate = 0.92
      u.pitch = 1
      u.onend = () => resolve(true)
      u.onerror = () => resolve(false)
      window.speechSynthesis.speak(u)
    })
  })
}

async function speak(text: string, langCode: string, browserLang: string): Promise<boolean> {
  const bakedOk = await speakBaked(text, langCode)
  if (bakedOk) return true
  const neuralOk = await speakNeural(text, langCode)
  if (neuralOk) return true
  if (langCode === 'en') {
    const dictOk = await speakDictionaryEnglish(text)
    if (dictOk) return true
  }
  return speakBrowser(text, browserLang)
}

export async function speakEnglish(text: string): Promise<boolean> {
  return speak(text, 'en', 'en-US')
}

export async function speakSupport(text: string, lang: SupportLang): Promise<boolean> {
  const code = SUPPORT_TTS_LANG[lang]
  const browser = SUPPORT_LANG_CODE[lang]
  const ok = await speak(text, code, browser)
  if (ok) return true
  const fallback = FALLBACK_LANG[lang]
  if (fallback && fallback !== code) {
    return speak(text, fallback, fallback)
  }
  return false
}

export async function speakBilingual(
  english: string,
  supportText: string,
  lang: SupportLang,
): Promise<boolean> {
  const a = await speakEnglish(english)
  await new Promise((r) => setTimeout(r, 280))
  const b = await speakSupport(supportText, lang)
  return a && b
}
