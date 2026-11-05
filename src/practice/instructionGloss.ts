/**
 * Curated Level-4 instruction glosses for Practice chrome.
 *
 * Mother-tongue lines explain *what to do* (type in the box, pick a match).
 * They never replace the English word / sentence the learner must produce.
 * Machine translate remains the fallback for unlisted strings.
 */

import type { HearLanguage } from '../student/hearLanguages'

/** Same normalize as instructionNarration — kept local to avoid import cycles. */
function level4InstructionEnglish(text: string): string {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/[·•]/g, '.')
    .trim()
    .slice(0, 420)
}

/** Lang code → English source (normalized) → gloss. */
const GLOSS: Record<string, Record<string, string>> = {
  am: {
    'Type the English word you picked and heard.':
      'የመረጡትን እና የሰሙትን የእንግሊዝኛ ቃል በሳጥኑ ውስጥ ይጻፉ።',
    'Pick the matching English word below, then type it.':
      'ከታች የሚመሳሰለውን የእንግሊዝኛ ቃል ይምረጡ፣ ከዚያ በሳጥኑ ውስጥ ይጻፉት።',
    'Clear this word · pick the match, then type it':
      'ይህን ቃል ያጠናቅቁ · ተመሳሳዩን ይምረጡ፣ ከዚያ ይጻፉት።',
    'Clear this word. Press a language you know — or More languages — then pick and type.':
      'ይህን ቃል ያጠናቅቁ። የሚያውቁትን ቋንቋ ይጫኑ — ወይም ተጨማሪ ቋንቋዎች — ከዚያ ይምረጡ እና ይጻፉ።',
    'Type that word · then Go': 'ያንን ቃል ይጻፉ · ከዚያ Go ይጫኑ።',
    'Press a language you know': 'የሚያውቁትን ቋንቋ ይጫኑ።',
    'Pick the matching English word': 'የሚመሳሰለውን የእንግሊዝኛ ቃል ይምረጡ።',
    'Type the full sentence you picked and heard.':
      'የመረጡትን እና የሰሙትን ሙሉ ዓረፍተ ነገር በሳጥኑ ውስጥ ይጻፉ።',
    'Type the full sentence you heard': 'የሰሙትን ሙሉ ዓረፍተ ነገር ይጻፉ።',
    'Hear the sentence, then type it.': 'ዓረፍተ ነገሩን ይስሙ፣ ከዚያ ይጻፉት።',
    'Type here…': 'እዚህ ይጻፉ…',
    'Type the full sentence…': 'ሙሉ ዓረፍተ ነገሩን ይጻፉ…',
    'Look. Hear. Pick the match. Type it.': 'ይመልከቱ። ይስሙ። ተመሳሳዩን ይምረጡ። ይጻፉት።',
    'One word at a time. Press a language you understand (English is included), or More languages to hear a translation. Pick the match. Type it.':
      'በአንድ ጊዜ አንድ ቃል። የሚረዱትን ቋንቋ ይጫኑ (እንግሊዝኛም አለ)፣ ወይም ትርጉም ለመስማት ተጨማሪ ቋንቋዎች። ተመሳሳዩን ይምረጡ። ይጻፉት።',
    'Press Hear English': 'Hear English ይጫኑ።',
    'Press what you should do': 'ማድረግ ያለብዎትን ይጫኑ።',
    'Press a picture': 'ስዕል ይጫኑ።',
    'Drop it on the empty box': 'በባዶ ሳጥኑ ላይ ያስቀምጡት።',
    'Press a picture on the board': 'በሰሌዳው ላይ ስዕል ይጫኑ።',
    'Press the matching English word — they clear together':
      'የሚመሳሰለውን የእንግሊዝኛ ቃል ይጫኑ — አብረው ይጠፋሉ።',
    'Pick the full sentence that fits': 'የሚስማማውን ሙሉ ዓረፍተ ነገር ይምረጡ።',
    'Hear the sentence': 'ዓረፍተ ነገሩን ይስሙ።',
    'Press the answer that fits': 'የሚስማማውን መልስ ይጫኑ።',
    'Your turn': 'የእርስዎ ተራ',
    'Go': 'ሂድ',
  },
  ti: {
    'Type the English word you picked and heard.':
      'ዝመረጽኩምንን ከዝሰማዕኩምንን እንግሊዝኛ ቃል ኣብቲ ሳንዱቕ ጽሓፉ።',
    'Pick the matching English word below, then type it.':
      'ኣብ ታሕቲ ዝመሳሰል እንግሊዝኛ ቃል ምረጹ፣ ድሕሪኡ ጽሓፍዎ።',
    'Type that word · then Go': 'እቲ ቃል ጽሓፉ · ድሕሪኡ Go ጠውቁ።',
    'Press a language you know': 'ትፈልጥዎ ቋንቋ ጠውቁ።',
    'Type the full sentence you picked and heard.':
      'ዝመረጽኩምንን ከዝሰማዕኩምንን ምሉእ ሓረግ ኣብቲ ሳንዱቕ ጽሓፉ።',
    'Type here…': 'ኣብዚ ጽሓፉ…',
    'Your turn': 'ናትኩም ተራ',
  },
  es: {
    'Type the English word you picked and heard.':
      'Escriba en la casilla la palabra en inglés que eligió y escuchó.',
    'Pick the matching English word below, then type it.':
      'Elija abajo la palabra en inglés que coincide y luego escríbala.',
    'Type that word · then Go': 'Escriba esa palabra · luego pulse Go.',
    'Press a language you know': 'Pulse un idioma que conozca.',
    'Type the full sentence you picked and heard.':
      'Escriba en la casilla la oración completa que eligió y escuchó.',
    'Type here…': 'Escriba aquí…',
    'Your turn': 'Su turno',
  },
  ar: {
    'Type the English word you picked and heard.':
      'اكتب في المربع الكلمة الإنجليزية التي اخترتها وسمعتها.',
    'Pick the matching English word below, then type it.':
      'اختر الكلمة الإنجليزية المطابقة في الأسفل، ثم اكتبها.',
    'Type that word · then Go': 'اكتب تلك الكلمة · ثم اضغط Go.',
    'Press a language you know': 'اضغط لغة تعرفها.',
    'Type the full sentence you picked and heard.':
      'اكتب في المربع الجملة الكاملة التي اخترتها وسمعتها.',
    'Type here…': 'اكتب هنا…',
    'Your turn': 'دورك',
  },
  hi: {
    'Type the English word you picked and heard.':
      'जो अंग्रेज़ी शब्द आपने चुना और सुना, उसे बॉक्स में लिखें।',
    'Pick the matching English word below, then type it.':
      'नीचे मिलता-जुलता अंग्रेज़ी शब्द चुनें, फिर लिखें।',
    'Type that word · then Go': 'वह शब्द लिखें · फिर Go दबाएँ।',
    'Press a language you know': 'वह भाषा दबाएँ जो आप जानते हैं।',
    'Type the full sentence you picked and heard.':
      'जो पूरा वाक्य आपने चुना और सुना, उसे बॉक्स में लिखें।',
    'Type here…': 'यहाँ लिखें…',
    'Your turn': 'आपकी बारी',
  },
}

function langBucket(lang: HearLanguage): string {
  const code = (lang.code || '').toLowerCase()
  const bcp = (lang.bcp47 || '').toLowerCase()
  if (code === 'am' || bcp.startsWith('am')) return 'am'
  if (code === 'ti' || bcp.startsWith('ti')) return 'ti'
  if (code === 'es' || bcp.startsWith('es')) return 'es'
  if (code === 'ar' || bcp.startsWith('ar')) return 'ar'
  if (code === 'hi' || bcp.startsWith('hi')) return 'hi'
  return code.split('-')[0] || code
}

function glossKey(text: string): string {
  return level4InstructionEnglish(text).toLowerCase()
}

/** Exact curated gloss for a Level-4 instruction, or null. */
export function lookupInstructionGloss(
  englishSource: string,
  lang: HearLanguage,
): string | null {
  if (lang.code === 'en' || lang.bcp47.toLowerCase().startsWith('en')) return null
  const bucket = langBucket(lang)
  const pack = GLOSS[bucket]
  if (!pack) return null
  const want = glossKey(englishSource)
  if (!want) return null
  for (const [en, gloss] of Object.entries(pack)) {
    if (glossKey(en) === want) return gloss
  }
  return null
}
