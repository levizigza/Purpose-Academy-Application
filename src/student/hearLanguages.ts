/**
 * Searchable hear-language list for Workplace Words universal translator.
 * ISO 639-1 (or common BCP-47 where needed) + display name.
 * Curated for workplace / newcomer learners — not every ISO code.
 */

export type HearLanguage = {
  /** Short code for MyMemory / TTS (e.g. fr, zh-CN, pt-BR) */
  code: string
  /** BCP-47 for browser speechSynthesis */
  bcp47: string
  name: string
  /** Optional native / local name for search */
  native?: string
}

/** Languages already on the six hear chips — still searchable here for parity. */
export const HEAR_LANGUAGES: HearLanguage[] = [
  { code: 'en', bcp47: 'en-US', name: 'English' },
  { code: 'am', bcp47: 'am-ET', name: 'Amharic', native: 'አማርኛ' },
  { code: 'ti', bcp47: 'ti-ET', name: 'Tigrinya', native: 'ትግርኛ' },
  { code: 'ar', bcp47: 'ar-SA', name: 'Arabic', native: 'العربية' },
  { code: 'es', bcp47: 'es-ES', name: 'Spanish', native: 'Español' },
  { code: 'hi', bcp47: 'hi-IN', name: 'Hindi', native: 'हिन्दी' },
  { code: 'fr', bcp47: 'fr-FR', name: 'French', native: 'Français' },
  { code: 'pt-BR', bcp47: 'pt-BR', name: 'Portuguese (Brazil)', native: 'Português' },
  { code: 'pt-PT', bcp47: 'pt-PT', name: 'Portuguese (Portugal)', native: 'Português' },
  { code: 'zh-CN', bcp47: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文' },
  { code: 'zh-TW', bcp47: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文' },
  { code: 'yue', bcp47: 'zh-HK', name: 'Cantonese', native: '廣東話' },
  { code: 'ja', bcp47: 'ja-JP', name: 'Japanese', native: '日本語' },
  { code: 'ko', bcp47: 'ko-KR', name: 'Korean', native: '한국어' },
  { code: 'vi', bcp47: 'vi-VN', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', bcp47: 'th-TH', name: 'Thai', native: 'ไทย' },
  { code: 'tl', bcp47: 'fil-PH', name: 'Tagalog / Filipino', native: 'Tagalog' },
  { code: 'id', bcp47: 'id-ID', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', bcp47: 'ms-MY', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'tr', bcp47: 'tr-TR', name: 'Turkish', native: 'Türkçe' },
  { code: 'fa', bcp47: 'fa-IR', name: 'Persian (Farsi)', native: 'فارسی' },
  { code: 'ur', bcp47: 'ur-PK', name: 'Urdu', native: 'اردو' },
  { code: 'ps', bcp47: 'ps-AF', name: 'Pashto', native: 'پښتو' },
  { code: 'ku', bcp47: 'ku', name: 'Kurdish', native: 'Kurdî' },
  { code: 'so', bcp47: 'so-SO', name: 'Somali', native: 'Soomaali' },
  { code: 'sw', bcp47: 'sw-KE', name: 'Swahili', native: 'Kiswahili' },
  { code: 'ha', bcp47: 'ha-NG', name: 'Hausa' },
  { code: 'yo', bcp47: 'yo-NG', name: 'Yoruba' },
  { code: 'ig', bcp47: 'ig-NG', name: 'Igbo' },
  { code: 'om', bcp47: 'om-ET', name: 'Oromo', native: 'Afaan Oromoo' },
  { code: 'rw', bcp47: 'rw-RW', name: 'Kinyarwanda' },
  { code: 'bn', bcp47: 'bn-BD', name: 'Bengali', native: 'বাংলা' },
  { code: 'pa', bcp47: 'pa-IN', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'gu', bcp47: 'gu-IN', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', bcp47: 'mr-IN', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', bcp47: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', bcp47: 'te-IN', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', bcp47: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', bcp47: 'ml-IN', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'si', bcp47: 'si-LK', name: 'Sinhala', native: 'සිංහල' },
  { code: 'ne', bcp47: 'ne-NP', name: 'Nepali', native: 'नेपाली' },
  { code: 'my', bcp47: 'my-MM', name: 'Burmese', native: 'မြန်မာ' },
  { code: 'km', bcp47: 'km-KH', name: 'Khmer', native: 'ខ្មែរ' },
  { code: 'lo', bcp47: 'lo-LA', name: 'Lao', native: 'ລາວ' },
  { code: 'ru', bcp47: 'ru-RU', name: 'Russian', native: 'Русский' },
  { code: 'uk', bcp47: 'uk-UA', name: 'Ukrainian', native: 'Українська' },
  { code: 'pl', bcp47: 'pl-PL', name: 'Polish', native: 'Polski' },
  { code: 'de', bcp47: 'de-DE', name: 'German', native: 'Deutsch' },
  { code: 'it', bcp47: 'it-IT', name: 'Italian', native: 'Italiano' },
  { code: 'nl', bcp47: 'nl-NL', name: 'Dutch', native: 'Nederlands' },
  { code: 'ro', bcp47: 'ro-RO', name: 'Romanian', native: 'Română' },
  { code: 'hu', bcp47: 'hu-HU', name: 'Hungarian', native: 'Magyar' },
  { code: 'cs', bcp47: 'cs-CZ', name: 'Czech', native: 'Čeština' },
  { code: 'sk', bcp47: 'sk-SK', name: 'Slovak', native: 'Slovenčina' },
  { code: 'bg', bcp47: 'bg-BG', name: 'Bulgarian', native: 'Български' },
  { code: 'sr', bcp47: 'sr-RS', name: 'Serbian', native: 'Српски' },
  { code: 'hr', bcp47: 'hr-HR', name: 'Croatian', native: 'Hrvatski' },
  { code: 'bs', bcp47: 'bs-BA', name: 'Bosnian', native: 'Bosanski' },
  { code: 'sq', bcp47: 'sq-AL', name: 'Albanian', native: 'Shqip' },
  { code: 'el', bcp47: 'el-GR', name: 'Greek', native: 'Ελληνικά' },
  { code: 'he', bcp47: 'he-IL', name: 'Hebrew', native: 'עברית' },
  { code: 'sv', bcp47: 'sv-SE', name: 'Swedish', native: 'Svenska' },
  { code: 'da', bcp47: 'da-DK', name: 'Danish', native: 'Dansk' },
  { code: 'no', bcp47: 'nb-NO', name: 'Norwegian', native: 'Norsk' },
  { code: 'fi', bcp47: 'fi-FI', name: 'Finnish', native: 'Suomi' },
  { code: 'et', bcp47: 'et-EE', name: 'Estonian', native: 'Eesti' },
  { code: 'lv', bcp47: 'lv-LV', name: 'Latvian', native: 'Latviešu' },
  { code: 'lt', bcp47: 'lt-LT', name: 'Lithuanian', native: 'Lietuvių' },
  { code: 'ga', bcp47: 'ga-IE', name: 'Irish', native: 'Gaeilge' },
  { code: 'cy', bcp47: 'cy-GB', name: 'Welsh', native: 'Cymraeg' },
  { code: 'is', bcp47: 'is-IS', name: 'Icelandic', native: 'Íslenska' },
  { code: 'ca', bcp47: 'ca-ES', name: 'Catalan', native: 'Català' },
  { code: 'eu', bcp47: 'eu-ES', name: 'Basque', native: 'Euskara' },
  { code: 'gl', bcp47: 'gl-ES', name: 'Galician', native: 'Galego' },
  { code: 'af', bcp47: 'af-ZA', name: 'Afrikaans' },
  { code: 'zu', bcp47: 'zu-ZA', name: 'Zulu', native: 'isiZulu' },
  { code: 'xh', bcp47: 'xh-ZA', name: 'Xhosa', native: 'isiXhosa' },
  { code: 'ka', bcp47: 'ka-GE', name: 'Georgian', native: 'ქართული' },
  { code: 'hy', bcp47: 'hy-AM', name: 'Armenian', native: 'Հայերեն' },
  { code: 'az', bcp47: 'az-AZ', name: 'Azerbaijani', native: 'Azərbaycan' },
  { code: 'kk', bcp47: 'kk-KZ', name: 'Kazakh', native: 'Қазақ' },
  { code: 'uz', bcp47: 'uz-UZ', name: 'Uzbek', native: 'Oʻzbek' },
  { code: 'mn', bcp47: 'mn-MN', name: 'Mongolian', native: 'Монгол' },
  { code: 'ht', bcp47: 'ht-HT', name: 'Haitian Creole', native: 'Kreyòl ayisyen' },
]

export function filterHearLanguages(query: string): HearLanguage[] {
  const q = query.trim().toLowerCase()
  if (!q) return HEAR_LANGUAGES
  return HEAR_LANGUAGES.filter((lang) => {
    const hay = `${lang.name} ${lang.native || ''} ${lang.code} ${lang.bcp47}`.toLowerCase()
    return hay.includes(q)
  })
}

export function findHearLanguage(code: string): HearLanguage | undefined {
  const needle = code.toLowerCase()
  return HEAR_LANGUAGES.find(
    (l) => l.code.toLowerCase() === needle || l.bcp47.toLowerCase() === needle,
  )
}
