import type { SupportLang } from './journeyCurriculum'

/**
 * Speech for Purpose Academy student audio.
 *
 * Priority (most human → fallback):
 * 1. Microsoft Edge neural TTS via /api/enrich/tts (Jenny / Dalia / Zariyah / Swara / Mekdes)
 * 2. Free Dictionary human pronunciation for single English words (public-apis) — short timeout
 * 3. Browser speechSynthesis (last resort — often robotic)
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

function apiBase() {
  const configured = import.meta.env.VITE_API_URL as string | undefined
  return configured?.replace(/\/$/, '') || ''
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
  const key = `${langCode}::${clean}`
  let url = audioUrlCache.get(key)
  if (!url) {
    const endpoint = `${apiBase()}/api/enrich/tts?lang=${encodeURIComponent(langCode)}&text=${encodeURIComponent(clean)}`
    try {
      const res = await fetch(endpoint)
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
