/**
 * Free open-source / no-key APIs from https://github.com/public-apis/public-apis
 * Used server-side so the browser never hits CORS walls.
 * Neural TTS via Microsoft Edge Read Aloud (msedge-tts) — no paid key.
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const LANG_MAP = {
  Amharic: 'am',
  Tigrinya: 'ti',
  Spanish: 'es',
  Arabic: 'ar',
  Hindi: 'hi',
  Tagalog: 'tl',
  Filipino: 'tl',
  French: 'fr',
  Portuguese: 'pt',
  German: 'de',
  Chinese: 'zh-CN',
  Japanese: 'ja',
  Korean: 'ko',
  Vietnamese: 'vi',
  Somali: 'so',
  Persian: 'fa',
  Farsi: 'fa',
  Urdu: 'ur',
  Russian: 'ru',
  Ukrainian: 'uk',
  Polish: 'pl',
  Turkish: 'tr',
  'English only': 'en',
  English: 'en',
}

export function langCode(name) {
  const raw = String(name || '').trim()
  if (!raw) return 'es'
  /* Already an ISO / BCP-47-ish code (fr, zh-CN, pt-BR). */
  if (/^[a-z]{2,3}(-[A-Za-z0-9]+)?$/i.test(raw) && !LANG_MAP[raw]) {
    return raw
  }
  return LANG_MAP[raw] || raw.toLowerCase().slice(0, 8) || 'es'
}

/** Free Dictionary API — https://dictionaryapi.dev/ */
export async function dictionaryLookup(word) {
  const q = encodeURIComponent(String(word).trim().toLowerCase())
  let res
  try {
    /* Dictionaryapi.dev often stalls; never block student audio on it. */
    res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${q}`, {
      signal: AbortSignal.timeout(2500),
    })
  } catch {
    return {
      word,
      found: false,
      definition: null,
      phonetic: null,
      audio: null,
      partOfSpeech: null,
      examples: [],
    }
  }
  if (!res.ok) {
    return {
      word,
      found: false,
      definition: null,
      phonetic: null,
      audio: null,
      partOfSpeech: null,
      examples: [],
    }
  }
  const data = await res.json()
  const entry = data[0]
  const meaning = entry?.meanings?.[0]
  const def = meaning?.definitions?.[0]
  const phoneticAudio =
    entry?.phonetics?.find((p) => p.audio)?.audio ||
    entry?.phonetics?.[0]?.audio ||
    null
  return {
    word: entry?.word || word,
    found: true,
    definition: def?.definition || null,
    phonetic: entry?.phonetic || entry?.phonetics?.[0]?.text || null,
    audio: phoneticAudio,
    partOfSpeech: meaning?.partOfSpeech || null,
    examples: (meaning?.definitions || [])
      .map((d) => d.example)
      .filter(Boolean)
      .slice(0, 3),
    source: 'Free Dictionary API (dictionaryapi.dev)',
  }
}

/**
 * MyMemory Translation API (free, no key for light use)
 * Fallback listed alongside LibreTranslate in public-apis language tools.
 */
export async function translateText(text, sourceLang, targetLang) {
  const sl = sourceLang || 'en'
  const tl = targetLang || 'es'
  const clean = String(text || '').trim()
  if (!clean) throw new Error('Text is required')
  if (tl === 'en' || tl === sl || String(tl).toLowerCase().startsWith('en')) {
    return { translated: clean, source: 'passthrough', from: sl, to: tl }
  }
  const url = new URL('https://api.mymemory.translated.net/get')
  url.searchParams.set('q', clean.slice(0, 480))
  url.searchParams.set('langpair', `${sl}|${tl}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error('Translation service unavailable')
  const data = await res.json()
  const translated = String(data?.responseData?.translatedText || '').trim()
  const status = Number(data?.responseStatus)
  if (!translated || /INVALID/i.test(translated) || (status && status !== 200)) {
    const err = new Error(
      translated && /INVALID/i.test(translated)
        ? translated
        : data?.responseDetails || 'Language pair not supported for translation',
    )
    err.code = 'UNSUPPORTED_LANG'
    throw err
  }
  return {
    translated,
    source: 'MyMemory Translation API',
    from: sl,
    to: tl,
  }
}

/** Lorem Picsum — https://picsum.photos/ */
export function picsumUrl(seed, width = 640, height = 360) {
  const safe = encodeURIComponent(String(seed).replace(/\s+/g, '-').toLowerCase())
  return {
    imageUrl: `https://picsum.photos/seed/${safe}/${width}/${height}`,
    source: 'Lorem Picsum (picsum.photos)',
  }
}

/** Quotable — https://github.com/lukePeavey/quotable */
export async function randomQuote(tags = 'education|wisdom|success') {
  const fallback = {
    content: 'Measure twice, cut once.',
    author: 'Workshop proverb',
    source: 'local-fallback',
  }
  try {
    const url = `https://api.quotable.io/random?tags=${encodeURIComponent(tags)}`
    const res = await fetch(url)
    if (!res.ok) {
      const adviceRes = await fetch('https://api.adviceslip.com/advice')
      if (adviceRes.ok) {
        const advice = await adviceRes.json()
        return {
          content: advice?.slip?.advice || fallback.content,
          author: 'Advice Slip',
          source: 'Advice Slip API',
        }
      }
      return fallback
    }
    const data = await res.json()
    return {
      content: data.content,
      author: data.author,
      tags: data.tags,
      source: 'Quotable API',
    }
  } catch {
    try {
      const adviceRes = await fetch('https://api.adviceslip.com/advice')
      if (adviceRes.ok) {
        const advice = await adviceRes.json()
        return {
          content: advice?.slip?.advice || fallback.content,
          author: 'Advice Slip',
          source: 'Advice Slip API',
        }
      }
    } catch {
      /* ignore */
    }
    return fallback
  }
}

/** Nominatim (OpenStreetMap) — https://nominatim.org/ */
export async function geocodeCalgary() {
  const url =
    'https://nominatim.openstreetmap.org/search?city=Calgary&country=Canada&format=json&limit=1'
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Purpose AcademyLearningApp/0.1 (educational demo; contact@purposeacademy.ca)',
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error('Geocoding unavailable')
  const data = await res.json()
  const hit = data[0]
  if (!hit) return null
  return {
    displayName: hit.display_name,
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    source: 'Nominatim / OpenStreetMap',
  }
}

/** Open-Meteo (free weather, commonly used with open geo data) */
export async function calgaryWeather() {
  const place = await geocodeCalgary()
  if (!place) return null
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(place.lat))
  url.searchParams.set('longitude', String(place.lon))
  url.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m')
  url.searchParams.set('timezone', 'America/Edmonton')
  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather unavailable')
  const data = await res.json()
  return {
    place,
    current: data.current,
    units: data.current_units,
    source: 'Open-Meteo + Nominatim',
  }
}

/** Zippopotam.us — Canadian postal lookup */
export async function postalLookup(code) {
  const cleaned = String(code).replace(/\s+/g, '')
  const res = await fetch(`https://api.zippopotam.us/ca/${encodeURIComponent(cleaned)}`)
  if (!res.ok) return { found: false, code: cleaned }
  const data = await res.json()
  return {
    found: true,
    code: data['post code'] || cleaned,
    country: data.country,
    places: data.places,
    source: 'Zippopotam.us',
  }
}

/** Universities List (GitHub raw) — for admissions context */
export async function canadianUniversities(limit = 12) {
  const res = await fetch(
    'https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json',
  )
  if (!res.ok) throw new Error('Universities list unavailable')
  const data = await res.json()
  return {
    items: data
      .filter((u) => u.country === 'Canada')
      .slice(0, limit)
      .map((u) => ({ name: u.name, domains: u.domains, web: u.web_pages?.[0] })),
    source: 'university-domains-list (Hipo)',
  }
}

/** Httpbin health/echo — connectivity check from public-apis Development category */
export async function httpbinHealth() {
  const res = await fetch('https://httpbin.org/get?app=purpose-academy')
  if (!res.ok) return { ok: false }
  const data = await res.json()
  return { ok: true, origin: data.origin, url: data.url, source: 'Httpbin' }
}

/**
 * Neural TTS — Microsoft Edge Read Aloud voices (free, no API key).
 * Far more natural than browser speechSynthesis for student vocab audio.
 * Fallback: Google Translate TTS (public undocumented endpoint) then none.
 *
 * Languages used by Purpose Academy support bridge:
 * English, Spanish, Arabic, Hindi, Amharic. Tigrinya falls back to Amharic voice.
 */
const EDGE_VOICE = {
  // Jenny — clear instructional English for warehouse / workplace vocab
  en: 'en-US-JennyNeural',
  es: 'es-MX-DaliaNeural',
  ar: 'ar-SA-ZariyahNeural',
  hi: 'hi-IN-SwaraNeural',
  am: 'am-ET-MekdesNeural',
  ti: 'am-ET-MekdesNeural', // no Edge ti voice yet — closest Ge'ez-script neural
  /* Universal hear — common Edge neural voices (skip to Google TTS when missing). */
  fr: 'fr-FR-DeniseNeural',
  de: 'de-DE-KatjaNeural',
  pt: 'pt-BR-FranciscaNeural',
  'pt-br': 'pt-BR-FranciscaNeural',
  'pt-pt': 'pt-PT-RaquelNeural',
  it: 'it-IT-ElsaNeural',
  nl: 'nl-NL-ColetteNeural',
  pl: 'pl-PL-ZofiaNeural',
  ru: 'ru-RU-SvetlanaNeural',
  uk: 'uk-UA-PolinaNeural',
  tr: 'tr-TR-EmelNeural',
  ja: 'ja-JP-NanamiNeural',
  ko: 'ko-KR-SunHiNeural',
  zh: 'zh-CN-XiaoxiaoNeural',
  'zh-cn': 'zh-CN-XiaoxiaoNeural',
  'zh-tw': 'zh-TW-HsiaoChenNeural',
  vi: 'vi-VN-HoaiMyNeural',
  th: 'th-TH-PremwadeeNeural',
  id: 'id-ID-GadisNeural',
  ms: 'ms-MY-YasminNeural',
  tl: 'fil-PH-BlessicaNeural',
  fil: 'fil-PH-BlessicaNeural',
  fa: 'fa-IR-DilaraNeural',
  ur: 'ur-PK-UzmaNeural',
  bn: 'bn-IN-TanishaaNeural',
  ta: 'ta-IN-PallaviNeural',
  te: 'te-IN-ShrutiNeural',
  mr: 'mr-IN-AarohiNeural',
  gu: 'gu-IN-DhwaniNeural',
  kn: 'kn-IN-SapnaNeural',
  ml: 'ml-IN-SobhanaNeural',
  pa: 'pa-IN-VaaniNeural',
  he: 'he-IL-HilaNeural',
  el: 'el-GR-AthinaNeural',
  ro: 'ro-RO-AlinaNeural',
  hu: 'hu-HU-NoemiNeural',
  cs: 'cs-CZ-VlastaNeural',
  sk: 'sk-SK-ViktoriaNeural',
  bg: 'bg-BG-KalinaNeural',
  hr: 'hr-HR-GabrijelaNeural',
  sr: 'sr-RS-SophieNeural',
  sv: 'sv-SE-SofieNeural',
  da: 'da-DK-ChristelNeural',
  nb: 'nb-NO-PernilleNeural',
  no: 'nb-NO-PernilleNeural',
  fi: 'fi-FI-NooraNeural',
  et: 'et-EE-AnuNeural',
  lv: 'lv-LV-EveritaNeural',
  lt: 'lt-LT-OnaNeural',
  ca: 'ca-ES-JoanaNeural',
  sw: 'sw-KE-ZuriNeural',
  so: 'so-SO-UbaxNeural',
  af: 'af-ZA-AdriNeural',
  zu: 'zu-ZA-ThandoNeural',
  is: 'is-IS-GudrunNeural',
  ga: 'ga-IE-OrlaNeural',
  cy: 'cy-GB-NiaNeural',
  sq: 'sq-AL-AnilaNeural',
  mk: 'mk-MK-MarijaNeural',
  az: 'az-AZ-BanuNeural',
  kk: 'kk-KZ-AigulNeural',
  uz: 'uz-UZ-MadinaNeural',
  hy: 'hy-AM-AnahitNeural',
  ka: 'ka-GE-EkaNeural',
  ne: 'ne-NP-HemkalaNeural',
  si: 'si-LK-ThiliniNeural',
  my: 'my-MM-NilarNeural',
  km: 'km-KH-SreymomNeural',
  lo: 'lo-LA-KeomanyNeural',
  mn: 'mn-MN-YesuiNeural',
}

/** Learner-friendly speaking rate (slightly slower than default for clarity). */
const EDGE_RATE = {
  en: 0.9,
  es: 0.92,
  ar: 0.92,
  hi: 0.92,
  am: 0.92,
  ti: 0.92,
}

/**
 * Spoken forms for English logistics terms Edge sometimes rushes or misreads.
 * Manifest keys stay as the written word; only synthesis input is adjusted.
 */
const EN_SPOKEN = {
  Aisle: 'aisle',
  aisle: 'aisle',
  PPE: 'P P E',
  'OS&D': 'O S and D',
  QR: 'Q R',
  ID: 'I D',
  SKU: 'S K U',
  GPS: 'G P S',
  USB: 'U S B',
  WiFi: 'why fie',
  'Wi-Fi': 'why fie',
  App: 'app',
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function spokenText(text, lang) {
  if (lang !== 'en') return text
  if (Object.prototype.hasOwnProperty.call(EN_SPOKEN, text)) return EN_SPOKEN[text]
  // Expand common all-caps workplace acronyms letter-by-letter (2–5 letters)
  if (/^[A-Z]{2,5}$/.test(text)) return text.split('').join(' ')
  return text
}

const TTS_CACHE = new Map()
const TTS_CACHE_MAX = 120

function ttsCacheKey(text, lang) {
  return `${lang}::${text}`
}

function rememberTts(key, buffer, contentType, voice, source) {
  if (TTS_CACHE.size >= TTS_CACHE_MAX) {
    const first = TTS_CACHE.keys().next().value
    TTS_CACHE.delete(first)
  }
  TTS_CACHE.set(key, { buffer, contentType, voice, source, at: Date.now() })
}

function resolveEdgeVoice(lang) {
  const raw = String(lang || 'en').toLowerCase()
  if (EDGE_VOICE[raw]) return EDGE_VOICE[raw]
  const short = raw.split('-')[0]
  return EDGE_VOICE[short] || null
}

async function edgeNeuralSpeech(text, lang) {
  const voice = resolveEdgeVoice(lang)
  if (!voice) throw new Error(`No Edge neural voice for ${lang}`)
  const short = String(lang || 'en').toLowerCase().split('-')[0]
  const rate = EDGE_RATE[short] ?? EDGE_RATE[lang] ?? 0.92
  const speak = escapeXml(spokenText(text, short))
  const tts = new MsEdgeTTS()
  // Higher bitrate + slightly slower rate → clearer workplace vocabulary audio
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
  const { audioStream } = tts.toStream(speak, { rate, pitch: '+0Hz', volume: 100 })
  const chunks = []
  for await (const chunk of audioStream) chunks.push(chunk)
  const buffer = Buffer.concat(chunks)
  if (!buffer.length) throw new Error('Empty Edge TTS audio')
  return { buffer, contentType: 'audio/mpeg', voice, source: 'Microsoft Edge neural TTS (msedge-tts)' }
}

/** Google Translate TTS — listed widely as a free anonymous TTS endpoint. */
async function googleTranslateSpeech(text, lang) {
  const raw = String(lang || 'en').toLowerCase()
  const tl = raw === 'ti' ? 'am' : raw
  const url = new URL('https://translate.google.com/translate_tts')
  url.searchParams.set('ie', 'UTF-8')
  url.searchParams.set('client', 'tw-ob')
  url.searchParams.set('tl', tl)
  url.searchParams.set('q', text.slice(0, 180))
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (PurposeAcademy; educational)' },
  })
  if (!res.ok) throw new Error(`Google TTS unavailable (${res.status})`)
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.length < 500) throw new Error('Google TTS returned empty audio')
  return {
    buffer,
    contentType: 'audio/mpeg',
    voice: `gtts-${tl}`,
    source: 'Google Translate TTS',
  }
}

/**
 * Synthesize short speech for vocab / instruction audio.
 * @param {string} text
 * @param {string} lang BCP-47-ish code: en|es|ar|hi|am|ti|fr|zh-CN|…
 */
export async function synthesizeSpeech(text, lang = 'en') {
  const clean = String(text || '').trim().replace(/\s+/g, ' ')
  if (!clean) throw new Error('Text is required')
  if (clean.length > 280) throw new Error('Text too long for speech (max 280 characters)')
  const code = String(lang || 'en').toLowerCase()
  const key = ttsCacheKey(clean, code)
  const hit = TTS_CACHE.get(key)
  if (hit) return { ...hit, cached: true }

  let result
  try {
    result = await edgeNeuralSpeech(clean, code)
  } catch {
    try {
      result = await googleTranslateSpeech(clean, code)
    } catch {
      const short = code.split('-')[0]
      if (short !== code) result = await googleTranslateSpeech(clean, short)
      else throw new Error(`Speech unavailable for language ${code}`)
    }
  }
  rememberTts(key, result.buffer, result.contentType, result.voice, result.source)
  return { ...result, cached: false }
}

/** Free Dictionary pronunciation URL when available (human recordings for many English words). */
export async function englishPronunciation(word) {
  const dict = await dictionaryLookup(word)
  return {
    word: dict.word,
    audio: dict.audio,
    phonetic: dict.phonetic,
    source: dict.source,
    found: Boolean(dict.audio),
  }
}
