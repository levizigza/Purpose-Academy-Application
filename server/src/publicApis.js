/**
 * Free open-source / no-key APIs from https://github.com/public-apis/public-apis
 * Used server-side so the browser never hits CORS walls.
 */

const LANG_MAP = {
  Amharic: 'am',
  Spanish: 'es',
  Arabic: 'ar',
  Tagalog: 'tl',
  French: 'fr',
  'English only': 'en',
  English: 'en',
}

export function langCode(name) {
  return LANG_MAP[name] || 'es'
}

/** Free Dictionary API — https://dictionaryapi.dev/ */
export async function dictionaryLookup(word) {
  const q = encodeURIComponent(String(word).trim().toLowerCase())
  const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${q}`)
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
  if (tl === 'en' || tl === sl) {
    return { translated: text, source: 'passthrough', from: sl, to: tl }
  }
  const url = new URL('https://api.mymemory.translated.net/get')
  url.searchParams.set('q', text)
  url.searchParams.set('langpair', `${sl}|${tl}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error('Translation service unavailable')
  const data = await res.json()
  return {
    translated: data?.responseData?.translatedText || text,
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
