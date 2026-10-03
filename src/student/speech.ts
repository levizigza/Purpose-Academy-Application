import type { SupportLang } from './journeyCurriculum'

/** BCP-47 tags for Web Speech API voices. */
export const SUPPORT_LANG_CODE: Record<SupportLang, string> = {
  Spanish: 'es-ES',
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
}

export function primeSpeech() {
  void loadVoices()
}

function speak(text: string, lang: string): Promise<boolean> {
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
      u.onend = () => resolve(true)
      u.onerror = () => resolve(false)
      window.speechSynthesis.speak(u)
    })
  })
}

export async function speakEnglish(text: string): Promise<boolean> {
  return speak(text, 'en-US')
}

export async function speakSupport(text: string, lang: SupportLang): Promise<boolean> {
  const primary = SUPPORT_LANG_CODE[lang]
  const ok = await speak(text, primary)
  if (ok) return true
  const fallback = FALLBACK_LANG[lang]
  if (fallback) return speak(text, fallback)
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
