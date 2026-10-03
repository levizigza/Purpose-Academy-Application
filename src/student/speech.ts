import type { SupportLang } from './journeyCurriculum'

/** BCP-47 tags for Web Speech API voices. */
export const SUPPORT_LANG_CODE: Record<SupportLang, string> = {
  Spanish: 'es-ES',
  French: 'fr-FR',
  Arabic: 'ar-SA',
  Hindi: 'hi-IN',
  Amharic: 'am-ET',
  Tigrinya: 'ti-ET',
}

const FALLBACK_LANG: Partial<Record<SupportLang, string>> = {
  Amharic: 'am',
  Tigrinya: 'am', // closest common fallback when ti voices are missing
  Arabic: 'ar',
  Hindi: 'hi',
  Spanish: 'es',
  French: 'fr',
}

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null

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
      // Some browsers never fire voiceschanged
      window.setTimeout(() => resolve(syn.getVoices()), 600)
    })
  }
  return voicesReady
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const base = lang.split('-')[0].toLowerCase()
  return (
    voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base)) ||
    null
  )
}

export type SpeakOptions = {
  rate?: number
  pitch?: number
}

/** Cancel any queued speech. */
export function stopSpeech() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}

/** Speak text in a specific language. Returns when utterance ends (or fails). */
export async function speakText(
  text: string,
  lang: string,
  options: SpeakOptions = {},
): Promise<boolean> {
  const clean = text.trim()
  if (!clean || typeof window === 'undefined' || !window.speechSynthesis) return false

  const voices = await loadVoices()
  return new Promise((resolve) => {
    try {
      const utter = new SpeechSynthesisUtterance(clean)
      utter.lang = lang
      utter.rate = options.rate ?? 0.88
      utter.pitch = options.pitch ?? 1
      const voice = pickVoice(voices, lang)
      if (voice) utter.voice = voice
      utter.onend = () => resolve(true)
      utter.onerror = () => resolve(false)
      window.speechSynthesis.speak(utter)
    } catch {
      resolve(false)
    }
  })
}

export async function speakEnglish(text: string): Promise<boolean> {
  return speakText(text, 'en-CA', { rate: 0.86 })
}

export async function speakSupport(text: string, lang: SupportLang): Promise<boolean> {
  const primary = SUPPORT_LANG_CODE[lang]
  const ok = await speakText(text, primary, { rate: 0.88 })
  if (ok) return true
  const fallback = FALLBACK_LANG[lang]
  if (fallback && fallback !== primary) {
    return speakText(text, fallback, { rate: 0.88 })
  }
  // Last resort: still speak so the learner hears something
  return speakText(text, 'en-CA', { rate: 0.9 })
}

/** English first, short pause, then support-language meaning. */
export async function speakBilingual(
  english: string,
  supportText: string,
  lang: SupportLang,
): Promise<void> {
  stopSpeech()
  await speakEnglish(english)
  await wait(320)
  await speakSupport(supportText, lang)
}

function wait(ms: number) {
  return new Promise((r) => window.setTimeout(r, ms))
}

/** Warm voices on first student interaction. */
export function primeSpeech() {
  void loadVoices()
}
