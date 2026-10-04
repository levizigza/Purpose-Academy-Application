/**
 * Purpose Academy Career Pathway Assessment
 * Inspired by Holland RIASEC / O*NET Interest Profiler patterns:
 * rate work activities on a 5-point scale, score six interest areas,
 * map the profile to Construction · Logistics · Community pathways.
 *
 * Assessment content is shown in the learner's mother tongue — not English.
 */

import type { SupportLang } from './journeyCurriculum'

export type PathwayId = 'construction' | 'logistics' | 'community'
export type RiasecArea = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

export type LangText = Record<SupportLang, string>

export type AssessmentItem = {
  id: string
  area: RiasecArea
  /** Activity statement the learner rates — mother tongue only in the UI. */
  text: LangText
}

export type LikertValue = 1 | 2 | 3 | 4 | 5

export const LIKERT_OPTIONS: { value: LikertValue; label: LangText }[] = [
  {
    value: 1,
    label: {
      Spanish: 'No me gusta nada',
      Arabic: 'لا أحب ذلك أبداً',
      Hindi: 'बिल्कुल पसंद नहीं',
      Amharic: 'በጣም አልወድም',
      Tigrinya: 'ብጣዕሚ ኣይፈትዎን',
    },
  },
  {
    value: 2,
    label: {
      Spanish: 'No me gusta',
      Arabic: 'لا أحب',
      Hindi: 'पसंद नहीं',
      Amharic: 'አልወድም',
      Tigrinya: 'ኣይፈትዎን',
    },
  },
  {
    value: 3,
    label: {
      Spanish: 'No estoy seguro/a',
      Arabic: 'لست متأكداً',
      Hindi: 'पक्का नहीं',
      Amharic: 'እርግጠኛ አይደለሁም',
      Tigrinya: 'ኣይርግጽን',
    },
  },
  {
    value: 4,
    label: {
      Spanish: 'Me gusta',
      Arabic: 'أحب ذلك',
      Hindi: 'पसंद है',
      Amharic: 'እወዳለሁ',
      Tigrinya: 'የፈትዎ',
    },
  },
  {
    value: 5,
    label: {
      Spanish: 'Me gusta mucho',
      Arabic: 'أحب ذلك كثيراً',
      Hindi: 'बहुत पसंद है',
      Amharic: 'በጣም እወዳለሁ',
      Tigrinya: 'ብጣዕሚ የፈትዎ',
    },
  },
]

export const ASSESSMENT_COPY = {
  introTitle: {
    Spanish: 'Evaluación de carrera',
    Arabic: 'تقييم المسار المهني',
    Hindi: 'कैरियर आकलन',
    Amharic: 'የሙያ ግምገማ',
    Tigrinya: 'ናይ ሞያ ግምገማ',
  } satisfies LangText,
  introBody: {
    Spanish:
      'Responde con honestidad. No hay respuestas correctas o incorrectas. Usamos tus preferencias de trabajo para ver qué camino te conviene más.',
    Arabic:
      'أجب بصدق. لا توجد إجابات صحيحة أو خاطئة. نستخدم تفضيلاتك في العمل لمعرفة المسار الأنسب لك.',
    Hindi:
      'ईमानदारी से जवाब दें। सही या गलत जवाब नहीं हैं। हम आपके काम की पसंद से देखेंगे कि आपके लिए कौन सा रास्ता बेहतर है।',
    Amharic:
      'በታማኝነት መልስ። ትክክል ወይም ስህተት የለም። የሥራ ፍላጎትዎን ተመልክተን የትኛው መንገድ እንደሚስማማ እንገምታለን።',
    Tigrinya:
      'ብቅንዕና መልስ። ቅኑዕ ወይ ጌጋ መልሲ የለን። ናይ ስራሕ ፍቓድካ ተመሊጥና ኣየናይ መንገዲ ዝሰማማዕ ንርኢ።',
  } satisfies LangText,
  part1Hint: {
    Spanish: 'Si esto fuera tu trabajo, ¿cuánto te gustaría hacerlo?',
    Arabic: 'لو كان هذا عملك، ما مدى رغبتك في القيام به؟',
    Hindi: 'अगर यह आपका काम होता, तो आपको कितना अच्छा लगता?',
    Amharic: 'ይህ ሥራዎ ቢሆን፣ ምን ያህል ማድረግ ይወዱ ነበር?',
    Tigrinya: 'እዚ ስራሕካ እንተኾይኑ፣ ክንደይ ክትገብሮ ትፈቱ?',
  } satisfies LangText,
  part2Title: {
    Spanish: 'Cómo te gusta trabajar',
    Arabic: 'كيف تحب أن تعمل',
    Hindi: 'आप कैसे काम करना पसंद करते हैं',
    Amharic: 'እንዴት መሥራት ይወዳሉ',
    Tigrinya: 'ከመይ ጌርካ ክትሰርሕ ትፈቱ',
  } satisfies LangText,
  part2Hint: {
    Spanish: 'Elige la opción que más se parece a ti.',
    Arabic: 'اختر الخيار الأقرب إليك.',
    Hindi: 'जो विकल्प आपसे सबसे मिलता-जुलता हो, उसे चुनें।',
    Amharic: 'ከእርስዎ ጋር የሚመሳሰለውን ምርጫ ይምረጡ።',
    Tigrinya: 'ምስካ ዝመሳሰል ምርጫ ምረጽ።',
  } satisfies LangText,
  progress: {
    Spanish: 'Pregunta',
    Arabic: 'سؤال',
    Hindi: 'प्रश्न',
    Amharic: 'ጥያቄ',
    Tigrinya: 'ሕቶ',
  } satisfies LangText,
  of: {
    Spanish: 'de',
    Arabic: 'من',
    Hindi: 'में से',
    Amharic: 'ከ',
    Tigrinya: 'ካብ',
  } satisfies LangText,
  next: {
    Spanish: 'Siguiente',
    Arabic: 'التالي',
    Hindi: 'अगला',
    Amharic: 'ቀጣይ',
    Tigrinya: 'ቀጻሊ',
  } satisfies LangText,
  seeResults: {
    Spanish: 'Ver mi resultado',
    Arabic: 'عرض نتيجتي',
    Hindi: 'मेरा परिणाम देखें',
    Amharic: 'ውጤቴን ይመልከቱ',
    Tigrinya: 'ውጽኢተይ ርአ',
  } satisfies LangText,
  resultTitle: {
    Spanish: 'Tu perfil de carrera',
    Arabic: 'ملفّك المهني',
    Hindi: 'आपका कैरियर प्रोफ़ाइल',
    Amharic: 'የእርስዎ የሙያ መገለጫ',
    Tigrinya: 'ናይ ሞያ መግለጺኻ',
  } satisfies LangText,
  resultLead: {
    Spanish: 'Según tus respuestas, este es el camino que mejor te encaja hoy.',
    Arabic: 'بناءً على إجاباتك، هذا هو المسار الأنسب لك اليوم.',
    Hindi: 'आपके जवाबों के अनुसार, आज आपके लिए यही रास्ता सबसे अच्छा है।',
    Amharic: 'በመልሶችዎ መሠረት፣ ዛሬ ለእርስዎ የሚስማማው መንገድ ይህ ነው።',
    Tigrinya: 'ብመሰረት መልስታትካ፣ ሎሚ ዝሰማማዕካ መንገዲ እዚ እዩ።',
  } satisfies LangText,
  openNow: {
    Spanish: 'Programa abierto hoy: Construcción',
    Arabic: 'البرنامج المفتوح اليوم: البناء',
    Hindi: 'आज खुला कार्यक्रम: निर्माण',
    Amharic: 'ዛሬ ክፍት ፕሮግራም፡ ግንባታ',
    Tigrinya: 'ሎሚ ክፉት ፕሮግራም፡ ህንጻ',
  } satisfies LangText,
  continueVocab: {
    Spanish: 'Continuar al vocabulario de construcción',
    Arabic: 'المتابعة إلى مفردات البناء',
    Hindi: 'निर्माण शब्दावली पर जारी रखें',
    Amharic: 'ወደ የግንባታ ቃላት ቀጥል',
    Tigrinya: 'ናብ ናይ ህንጻ ቃላት ቀጽል',
  } satisfies LangText,
}

/** Part 1 — work-activity interest items (RIASEC), school/trade adapted. */
export const CAREER_INTEREST_ITEMS: AssessmentItem[] = [
  {
    id: 'r1',
    area: 'R',
    text: {
      Spanish: 'Usar herramientas con las manos para construir o reparar algo',
      Arabic: 'استخدام أدوات يدوية لبناء أو إصلاح شيء',
      Hindi: 'हाथ के औज़ार से कुछ बनाना या ठीक करना',
      Amharic: 'በእጅ መሣሪያዎች አንድ ነገር መገንባት ወይም ማስተካከል',
      Tigrinya: 'ብኢድ መሳርሒታት ሓደ ነገር ምህናጽ ወይ ምእራም',
    },
  },
  {
    id: 'i1',
    area: 'I',
    text: {
      Spanish: 'Averiguar por qué una máquina o un sistema no funciona',
      Arabic: 'اكتشاف سبب تعطّل آلة أو نظام',
      Hindi: 'पता लगाना कि कोई मशीन या सिस्टम क्यों नहीं चल रहा',
      Amharic: 'አንድ ማሽን ወይም ስርዓት ለምን እንደማይሰራ ማወቅ',
      Tigrinya: 'ሓደ ማሽን ወይ ስርዓት ስለምንታይ ከምዘይሰርሕ ምፍላጥ',
    },
  },
  {
    id: 'a1',
    area: 'A',
    text: {
      Spanish: 'Diseñar o mejorar cómo se ve un espacio o un edificio',
      Arabic: 'تصميم أو تحسين مظهر مكان أو مبنى',
      Hindi: 'किसी जगह या इमारत का रूप डिज़ाइन या सुधार करना',
      Amharic: 'የቦታ ወይም የህንፃ መልክን መንደፍ ወይም ማሻሻል',
      Tigrinya: 'ናይ ቦታ ወይ ህንጻ መልክዕ ምንዳፍ ወይ ምምሕያሽ',
    },
  },
  {
    id: 's1',
    area: 'S',
    text: {
      Spanish: 'Ayudar a alguien nuevo a aprender una tarea con calma',
      Arabic: 'مساعدة شخص جديد على تعلم مهمة بهدوء',
      Hindi: 'किसी नए व्यक्ति को शांति से कोई काम सिखाना',
      Amharic: 'አዲስ ሰው አንድ ሥራ በጸጥታ እንዲማር መርዳት',
      Tigrinya: 'ሓድሽ ሰብ ሓደ ዕማም ብህድኣት ክመሃር ምሕጋዝ',
    },
  },
  {
    id: 'e1',
    area: 'E',
    text: {
      Spanish: 'Organizar un equipo pequeño para terminar un trabajo a tiempo',
      Arabic: 'تنظيم فريق صغير لإنهاء عمل في الوقت المحدد',
      Hindi: 'काम समय पर खत्म करने के लिए छोटी टीम व्यवस्थित करना',
      Amharic: 'ሥራ በጊዜው ለማጠናቀቅ ትንሽ ቡድን ማደራጀት',
      Tigrinya: 'ስራሕ ብግዜኡ ንምውዳእ ንእሽቶ ጋንታ ምውዳብ',
    },
  },
  {
    id: 'c1',
    area: 'C',
    text: {
      Spanish: 'Llevar un registro claro de materiales, horas o entregas',
      Arabic: 'الاحتفاظ بسجل واضح للمواد أو الساعات أو التسليمات',
      Hindi: 'सामग्री, घंटे या डिलीवरी का साफ़ रिकॉर्ड रखना',
      Amharic: 'የቁሳቁስ፣ ሰዓት ወይም አቅርቦት ግልጽ መዝገብ መያዝ',
      Tigrinya: 'ናይ ኣቕሑ፣ ሰዓታት ወይ ኣቀራርባ ንጹር መዝገብ ምሓዝ',
    },
  },
  {
    id: 'r2',
    area: 'R',
    text: {
      Spanish: 'Trabajar al aire libre en un sitio de construcción',
      Arabic: 'العمل في الهواء الطلق في موقع بناء',
      Hindi: 'निर्माण स्थल पर बाहर काम करना',
      Amharic: 'በግንባታ ቦታ በውጭ መሥራት',
      Tigrinya: 'ኣብ ናይ ህንጻ ቦታ ኣብ ደገ ምስራሕ',
    },
  },
  {
    id: 'i2',
    area: 'I',
    text: {
      Spanish: 'Medir con cuidado y comprobar que los números son correctos',
      Arabic: 'القياس بدقة والتحقق من صحة الأرقام',
      Hindi: 'सावधानी से मापना और संख्याएँ सही जाँचना',
      Amharic: 'በጥንቃቄ መለካት እና ቁጥሮች ትክክል መሆናቸውን ማረጋገጥ',
      Tigrinya: 'ብጥንቃቐ ምዕቃንን ቁጽርታት ቅኑዓት ምዃኖም ምርግጋጽን',
    },
  },
  {
    id: 'a2',
    area: 'A',
    text: {
      Spanish: 'Crear un dibujo o plano sencillo antes de construir',
      Arabic: 'عمل رسم أو مخطط بسيط قبل البناء',
      Hindi: 'बनाने से पहले सरल चित्र या नक्शा बनाना',
      Amharic: 'ከመገንባት በፊት ቀላል ሥዕል ወይም እቅድ መሥራት',
      Tigrinya: 'ቅድሚ ምህናጽ ቀሊል ስእሊ ወይ ውጥን ምግባር',
    },
  },
  {
    id: 's2',
    area: 'S',
    text: {
      Spanish: 'Escuchar a las personas y ayudarlas con un problema práctico',
      Arabic: 'الاستماع إلى الناس ومساعدتهم في مشكلة عملية',
      Hindi: 'लोगों की सुनना और व्यावहारिक समस्या में मदद करना',
      Amharic: 'ሰዎችን ማዳመጥ እና በተግባራዊ ችግር መርዳት',
      Tigrinya: 'ሰባት ምስማዕን ብተግባራዊ ጸገም ምሕጋዝን',
    },
  },
  {
    id: 'e2',
    area: 'E',
    text: {
      Spanish: 'Hablar con un cliente o supervisor sobre el progreso del trabajo',
      Arabic: 'التحدث مع عميل أو مشرف عن تقدّم العمل',
      Hindi: 'काम की प्रगति के बारे में ग्राहक या सुपरवाइज़र से बात करना',
      Amharic: 'ስለ ሥራ እድገት ከደንበኛ ወይም ተቆጣጣሪ ጋር መነጋገር',
      Tigrinya: 'ብዛዕባ ናይ ስራሕ ምዕባለ ምስ ዓሚል ወይ ተቖጻጻሪ ምዝራብ',
    },
  },
  {
    id: 'c2',
    area: 'C',
    text: {
      Spanish: 'Seguir una lista de pasos en el mismo orden cada día',
      Arabic: 'اتباع قائمة خطوات بنفس الترتيب كل يوم',
      Hindi: 'हर दिन एक ही क्रम में कदमों की सूची का पालन करना',
      Amharic: 'በየቀኑ ተመሳሳይ ቅደም ተከተል ያለውን የእርምጃዎች ዝርዝር መከተል',
      Tigrinya: 'መዓልታዊ ብተመሳሳሊ ተኸታታሊ ናይ ስጉምትታት ዝርዝር ምክታል',
    },
  },
  {
    id: 'r3',
    area: 'R',
    text: {
      Spanish: 'Levantar, mover o instalar materiales pesados con seguridad',
      Arabic: 'رفع أو نقل أو تركيب مواد ثقيلة بأمان',
      Hindi: 'भारी सामग्री को सुरक्षित रूप से उठाना, ले जाना या लगाना',
      Amharic: 'ከባድ ቁሳቁሶችን በደህንነት ማንሳት፣ ማንቀሳቀስ ወይም መጫን',
      Tigrinya: 'ከቢድ ኣቕሑ ብድሕንነት ምልዓል፣ ምንቅስቓስ ወይ ምትኳል',
    },
  },
  {
    id: 'i3',
    area: 'I',
    text: {
      Spanish: 'Aprender cómo funcionan los sistemas de un edificio (agua, electricidad, estructura)',
      Arabic: 'تعلّم كيف تعمل أنظمة المبنى (ماء، كهرباء، هيكل)',
      Hindi: 'सीखना कि इमारत के सिस्टम कैसे काम करते हैं (पानी, बिजली, संरचना)',
      Amharic: 'የህንፃ ስርዓቶች እንዴት እንደሚሠሩ መማር (ውሃ፣ ኤሌክትሪክ፣ አወቃቀር)',
      Tigrinya: 'ናይ ህንጻ ስርዓታት ከመይ ከምዝሰርሑ ምምሃር (ማይ፣ ኤሌክትሪክ፣ ኣቃውማ)',
    },
  },
  {
    id: 'a3',
    area: 'A',
    text: {
      Spanish: 'Elegir materiales y acabados para que el resultado se vea bien',
      Arabic: 'اختيار المواد والتشطيبات ليبدو الناتج جيداً',
      Hindi: 'परिणाम अच्छा दिखे, इसके लिए सामग्री और फ़िनिश चुनना',
      Amharic: 'ውጤቱ ጥሩ እንዲታይ ቁሳቁሶችን እና ማጠናቀቂያዎችን መምረጥ',
      Tigrinya: 'ውጽኢት ጽቡቕ ክረአ ቁሳቁስን ምውዳእን ምምራጽ',
    },
  },
  {
    id: 's3',
    area: 'S',
    text: {
      Spanish: 'Trabajar en un rol que apoya a familias o a la comunidad',
      Arabic: 'العمل في دور يدعم العائلات أو المجتمع',
      Hindi: 'परिवारों या समुदाय की मदद करने वाली भूमिका में काम करना',
      Amharic: 'ቤተሰቦችን ወይም ማህበረሰብን በሚደግፍ ሚና መሥራት',
      Tigrinya: 'ስድራቤታት ወይ ማሕበረሰብ ዝድግፍ ተራ ምስራሕ',
    },
  },
  {
    id: 'e3',
    area: 'E',
    text: {
      Spanish: 'Tomar decisiones rápidas cuando el plan del día cambia',
      Arabic: 'اتخاذ قرارات سريعة عندما يتغيّر خطة اليوم',
      Hindi: 'जब दिन की योजना बदल जाए तो तेज़ी से फ़ैसला लेना',
      Amharic: 'የቀኑ እቅድ ሲቀየር ፈጣን ውሳኔዎችን መስጠት',
      Tigrinya: 'ናይ መዓልቲ ውጥን ምስ ተቐየረ ቅልጡፍ ውሳኔታት ምሃብ',
    },
  },
  {
    id: 'c3',
    area: 'C',
    text: {
      Spanish: 'Mantener el almacén o el taller limpio, etiquetado y en orden',
      Arabic: 'الحفاظ على المستودع أو الورشة نظيفاً ومرتّباً مع تسميات واضحة',
      Hindi: 'गोदाम या वर्कशॉप को साफ़, लेबल वाला और व्यवस्थित रखना',
      Amharic: 'መጋዘን ወይም አውደ ጥናት ንጹህ፣ መለያ ያለው እና ሥርዓት ያለው ማድረግ',
      Tigrinya: 'መኽዘን ወይ ኣውደ ጥናት ንጹህ፣ ምልክት ዘለዎን ስርዓት ዘለዎን ምግባር',
    },
  },
]

/** Part 2 — work-style / fit items (forced preference pairs scored to pathways). */
export type StyleItem = {
  id: string
  prompt: LangText
  options: { id: string; pathway: PathwayId; label: LangText }[]
}

export const CAREER_STYLE_ITEMS: StyleItem[] = [
  {
    id: 'st1',
    prompt: {
      Spanish: '¿Dónde te sientes más cómodo trabajando?',
      Arabic: 'أين تشعر براحة أكبر في العمل؟',
      Hindi: 'आप कहाँ काम करके सबसे सहज महसूस करते हैं?',
      Amharic: 'የት መሥራት የበለጠ ምቹ ይሰማዎታል?',
      Tigrinya: 'ኣበይ ክትሰርሕ ዝያዳ ምቹእ ይስምዓካ?',
    },
    options: [
      {
        id: 'st1a',
        pathway: 'construction',
        label: {
          Spanish: 'En un sitio o taller, con herramientas',
          Arabic: 'في موقع أو ورشة، مع أدوات',
          Hindi: 'साइट या वर्कशॉप में, औज़ारों के साथ',
          Amharic: 'በቦታ ወይም አውደ ጥናት፣ ከመሣሪያዎች ጋር',
          Tigrinya: 'ኣብ ቦታ ወይ ኣውደ ጥናት፣ ምስ መሳርሒታት',
        },
      },
      {
        id: 'st1b',
        pathway: 'logistics',
        label: {
          Spanish: 'En un almacén o con cargas y entregas',
          Arabic: 'في مستودع أو مع شحنات وتوصيلات',
          Hindi: 'गोदाम में या सामान और डिलीवरी के साथ',
          Amharic: 'በመጋዘን ወይም ከጭነትና አቅርቦት ጋር',
          Tigrinya: 'ኣብ መኽዘን ወይ ምስ ጽዕነትን ኣቀራርባን',
        },
      },
      {
        id: 'st1c',
        pathway: 'community',
        label: {
          Spanish: 'Con personas, escuchando y ayudando',
          Arabic: 'مع الناس، بالاستماع والمساعدة',
          Hindi: 'लोगों के साथ, सुनकर और मदद करके',
          Amharic: 'ከሰዎች ጋር፣ በማዳመጥ እና በመርዳት',
          Tigrinya: 'ምስ ሰባት፣ ብምስማዕን ምሕጋዝን',
        },
      },
    ],
  },
  {
    id: 'st2',
    prompt: {
      Spanish: '¿Qué te da más satisfacción al final del día?',
      Arabic: 'ما الذي يمنحك رضا أكبر في نهاية اليوم؟',
      Hindi: 'दिन के अंत में आपको सबसे ज़्यादा संतोष क्या देता है?',
      Amharic: 'በቀኑ መጨረሻ የበለጠ እርካታ የሚሰጥዎት ምንድን ነው?',
      Tigrinya: 'ኣብ መወዳእታ መዓልቲ ዝያዳ ዕግበት ዝህበካ እንታይ እዩ?',
    },
    options: [
      {
        id: 'st2a',
        pathway: 'construction',
        label: {
          Spanish: 'Ver algo físico que construí o arreglé',
          Arabic: 'رؤية شيء ملموس بنيته أو أصلحته',
          Hindi: 'कुछ ठोस देखना जो मैंने बनाया या ठीक किया',
          Amharic: 'የገነባሁትን ወይም ያስተካከልኩትን ነገር ማየት',
          Tigrinya: 'ዝሃነጽኩ ወይ ዘእረምኩ ነገር ምርኣይ',
        },
      },
      {
        id: 'st2b',
        pathway: 'logistics',
        label: {
          Spanish: 'Que todo llegó completo y a tiempo',
          Arabic: 'أن كل شيء وصل كاملاً وفي الوقت المحدد',
          Hindi: 'सब कुछ पूरा और समय पर पहुँच गया',
          Amharic: 'ሁሉም ነገር ሙሉ እና በጊዜው መድረሱ',
          Tigrinya: 'ኩሉ ነገር ምሉእን ብግዜኡን ምብጻሕ',
        },
      },
      {
        id: 'st2c',
        pathway: 'community',
        label: {
          Spanish: 'Que una persona se sintió apoyada por mí',
          Arabic: 'أن شخصاً شعر بالدعم بفضلي',
          Hindi: 'किसी व्यक्ति को मेरी वजह से सहारा मिला',
          Amharic: 'አንድ ሰው በእኔ ድጋፍ እንደተሰማው ማወቅ',
          Tigrinya: 'ሓደ ሰብ ብድጋፈይ ከምዝተሰምዐ ምፍላጥ',
        },
      },
    ],
  },
  {
    id: 'st3',
    prompt: {
      Spanish: '¿Qué se te da más naturalmente?',
      Arabic: 'ما الأمر الذي يأتيك بشكل أكثر طبيعية؟',
      Hindi: 'आपमें स्वाभाविक रूप से क्या ज़्यादा आता है?',
      Amharic: 'በተፈጥሮ የበለጠ የሚመጣልዎት ምንድን ነው?',
      Tigrinya: 'ብተፈጥሮ ዝያዳ ዝመጽእልካ እንታይ እዩ?',
    },
    options: [
      {
        id: 'st3a',
        pathway: 'construction',
        label: {
          Spanish: 'Trabajar con mis manos y seguir medidas exactas',
          Arabic: 'العمل بيدَيّ واتباع القياسات الدقيقة',
          Hindi: 'हाथों से काम करना और सटीक माप का पालन',
          Amharic: 'በእጆቼ መሥራት እና ትክክለኛ መለኪያዎችን መከተል',
          Tigrinya: 'ብኢደይ ምስራሕን ትኽክለኛ መለክዒታት ምክታልን',
        },
      },
      {
        id: 'st3b',
        pathway: 'logistics',
        label: {
          Spanish: 'Organizar, contar y mover cosas con orden',
          Arabic: 'تنظيم وعدّ ونقل الأشياء بترتيب',
          Hindi: 'चीज़ों को व्यवस्थित करना, गिनना और क्रम से ले जाना',
          Amharic: 'ነገሮችን በሥርዓት ማደራጀት፣ መቁጠር እና ማንቀሳቀስ',
          Tigrinya: 'ነገራት ብስርዓት ምውዳብ፣ ምቁጻርን ምንቅስቓስን',
        },
      },
      {
        id: 'st3c',
        pathway: 'community',
        label: {
          Spanish: 'Hablar con calma y cuidar a las personas',
          Arabic: 'التحدث بهدوء والعناية بالناس',
          Hindi: 'शांति से बात करना और लोगों की देखभाल',
          Amharic: 'በጸጥታ መነጋገር እና ሰዎችን መንከባከብ',
          Tigrinya: 'ብህድኣት ምዝራብን ሰባት ምኽባልን',
        },
      },
    ],
  },
  {
    id: 'st4',
    prompt: {
      Spanish: 'En un equipo, ¿qué rol prefieres?',
      Arabic: 'في فريق، أي دور تفضّل؟',
      Hindi: 'टीम में आप कौन सी भूमिका पसंद करते हैं?',
      Amharic: 'በቡድን ውስጥ የትኛውን ሚና ይመርጣሉ?',
      Tigrinya: 'ኣብ ጋንታ ኣየናይ ተራ ትመርጽ?',
    },
    options: [
      {
        id: 'st4a',
        pathway: 'construction',
        label: {
          Spanish: 'Hacer la parte práctica del trabajo en el sitio',
          Arabic: 'القيام بالجزء العملي من العمل في الموقع',
          Hindi: 'साइट पर काम का व्यावहारिक हिस्सा करना',
          Amharic: 'በቦታው የሥራውን ተግባራዊ ክፍል ማከናወን',
          Tigrinya: 'ኣብቲ ቦታ ናይ ስራሕ ተግባራዊ ክፋል ምግባር',
        },
      },
      {
        id: 'st4b',
        pathway: 'logistics',
        label: {
          Spanish: 'Controlar que materiales y plazos estén correctos',
          Arabic: 'التأكد من صحة المواد والمواعيد',
          Hindi: 'सामग्री और समय-सीमा सही रखना',
          Amharic: 'ቁሳቁሶችና ጊዜያት ትክክል መሆናቸውን ማረጋገጥ',
          Tigrinya: 'ኣቕሑን ግዜታትን ቅኑዓት ምዃኖም ምርግጋጽ',
        },
      },
      {
        id: 'st4c',
        pathway: 'community',
        label: {
          Spanish: 'Apoyar al equipo y a las personas que llegan',
          Arabic: 'دعم الفريق والأشخاص الوافدين',
          Hindi: 'टीम और आने वाले लोगों का समर्थन करना',
          Amharic: 'ቡድኑን እና የሚመጡ ሰዎችን መደገፍ',
          Tigrinya: 'ጋንታን ዝመጹ ሰባትን ምድጋፍ',
        },
      },
    ],
  },
  {
    id: 'st5',
    prompt: {
      Spanish: '¿Qué tipo de aprendizaje te motiva más?',
      Arabic: 'أي نوع من التعلّم يحفّزك أكثر؟',
      Hindi: 'किस तरह का सीखना आपको ज़्यादा प्रेरित करता है?',
      Amharic: 'የትኛው የመማር ዓይነት የበለጠ ያነሳሳዎታል?',
      Tigrinya: 'ኣየናይ ዓይነት ትምህርቲ ዝያዳ የነቓቕዓካ?',
    },
    options: [
      {
        id: 'st5a',
        pathway: 'construction',
        label: {
          Spanish: 'Aprender seguridad, herramientas y oficio paso a paso',
          Arabic: 'تعلّم السلامة والأدوات والحرفة خطوة بخطوة',
          Hindi: 'सुरक्षा, औज़ार और हुनर कदम-दर-कदम सीखना',
          Amharic: 'ደህንነት፣ መሣሪያዎች እና ሙያን ደረጃ በደረጃ መማር',
          Tigrinya: 'ድሕንነት፣ መሳርሒታትን ሞያን ብደረጃ ምምሃር',
        },
      },
      {
        id: 'st5b',
        pathway: 'logistics',
        label: {
          Spanish: 'Aprender sistemas, etiquetas y flujo de mercancías',
          Arabic: 'تعلّم الأنظمة والملصقات وتدفّق البضائع',
          Hindi: 'सिस्टम, लेबल और माल की आवाजाही सीखना',
          Amharic: 'ስርዓቶችን፣ መለያዎችን እና የእቃ ፍሰትን መማር',
          Tigrinya: 'ስርዓታት፣ ምልክታትን ናይ ኣቕሓ ፍሰትን ምምሃር',
        },
      },
      {
        id: 'st5c',
        pathway: 'community',
        label: {
          Spanish: 'Aprender a apoyar personas con paciencia y respeto',
          Arabic: 'تعلّم دعم الناس بالصبر والاحترام',
          Hindi: 'धैर्य और सम्मान से लोगों का साथ देना सीखना',
          Amharic: 'ሰዎችን በትዕግስትና ክብር መደገፍ መማር',
          Tigrinya: 'ሰባት ብትዕግስትን ክብርን ምድጋፍ ምምሃር',
        },
      },
    ],
  },
  {
    id: 'st6',
    prompt: {
      Spanish: '¿Qué futuro te atrae más?',
      Arabic: 'أي مستقبل يجذبك أكثر؟',
      Hindi: 'कौन सा भविष्य आपको ज़्यादा आकर्षित करता है?',
      Amharic: 'የትኛው የወደፊት እይታ የበለጠ ይስባል?',
      Tigrinya: 'ኣየናይ መጻኢ ራእይ ዝያዳ የማስከካ?',
    },
    options: [
      {
        id: 'st6a',
        pathway: 'construction',
        label: {
          Spanish: 'Oficio de construcción y camino de aprendizaje',
          Arabic: 'حرفة البناء ومسار التلمذة المهنية',
          Hindi: 'निर्माण का हुनर और अप्रेंटिसशिप का रास्ता',
          Amharic: 'የግንባታ ሙያ እና የሙያ ሥልጠና መንገድ',
          Tigrinya: 'ናይ ህንጻ ሞያን ናይ ሞያ ስልጠና መንገድን',
        },
      },
      {
        id: 'st6b',
        pathway: 'logistics',
        label: {
          Spanish: 'Trabajo de almacén, transporte o suministro',
          Arabic: 'عمل المستودعات أو النقل أو التوريد',
          Hindi: 'गोदाम, परिवहन या आपूर्ति का काम',
          Amharic: 'የመጋዘን፣ መጓጓዣ ወይም አቅርቦት ሥራ',
          Tigrinya: 'ናይ መኽዘን፣ መጓዓዝያ ወይ ኣቀራርባ ስራሕ',
        },
      },
      {
        id: 'st6c',
        pathway: 'community',
        label: {
          Spanish: 'Trabajo de apoyo comunitario o cuidado de personas',
          Arabic: 'عمل الدعم المجتمعي أو رعاية الناس',
          Hindi: 'सामुदायिक सहायता या लोगों की देखभाल का काम',
          Amharic: 'የማህበረሰብ ድጋፍ ወይም የሰዎች እንክብካቤ ሥራ',
          Tigrinya: 'ናይ ማሕበረሰብ ድጋፍ ወይ ናይ ሰባት ክንክን ስራሕ',
        },
      },
    ],
  },
]

export const RIASEC_LABELS: Record<RiasecArea, LangText> = {
  R: {
    Spanish: 'Práctico / Manual',
    Arabic: 'عملي / يدوي',
    Hindi: 'व्यावहारिक / हस्तकौशल',
    Amharic: 'ተግባራዊ / በእጅ',
    Tigrinya: 'ተግባራዊ / ብኢድ',
  },
  I: {
    Spanish: 'Analítico / Investigador',
    Arabic: 'تحليلي / باحث',
    Hindi: 'विश्लेषणात्मक / खोज',
    Amharic: 'መርማሪ / ትንታኔ',
    Tigrinya: 'መርማሪ / ትንታነ',
  },
  A: {
    Spanish: 'Creativo / Diseño',
    Arabic: 'إبداعي / تصميم',
    Hindi: 'रचनात्मक / डिज़ाइन',
    Amharic: 'ፈጣሪ / ንድፍ',
    Tigrinya: 'ፈጣሪ / ንድፊ',
  },
  S: {
    Spanish: 'Social / Ayuda',
    Arabic: 'اجتماعي / مساعدة',
    Hindi: 'सामाजिक / सहायता',
    Amharic: 'ማህበራዊ / እገዛ',
    Tigrinya: 'ማሕበራዊ / ሓገዝ',
  },
  E: {
    Spanish: 'Liderazgo / Acción',
    Arabic: 'قيادة / مبادرة',
    Hindi: 'नेतृत्व / पहल',
    Amharic: 'አመራር / ተነሳሽነት',
    Tigrinya: 'መራሕነት / ተበግሶ',
  },
  C: {
    Spanish: 'Organizado / Orden',
    Arabic: 'منظّم / ترتيب',
    Hindi: 'व्यवस्थित / क्रम',
    Amharic: 'ሥርዓታማ / ቅደም ተከተል',
    Tigrinya: 'ስርዓታዊ / ተኸታታሊ',
  },
}

export const PATHWAY_RESULT: Record<
  PathwayId,
  { title: LangText; summary: LangText; strengths: LangText[] }
> = {
  construction: {
    title: {
      Spanish: 'Construcción',
      Arabic: 'البناء',
      Hindi: 'निर्माण',
      Amharic: 'ግንባታ',
      Tigrinya: 'ህንጻ',
    },
    summary: {
      Spanish:
        'Tus respuestas muestran fuerza en trabajo práctico, herramientas, medición y oficios de sitio. Construction Foundations es tu mejor comienzo.',
      Arabic:
        'تُظهر إجاباتك قوة في العمل العملي والأدوات والقياس ومهن الموقع. أسس البناء هي أفضل بداية لك.',
      Hindi:
        'आपके जवाब व्यावहारिक काम, औज़ार, माप और साइट के हुनर में मज़बूती दिखाते हैं। Construction Foundations आपके लिए सबसे अच्छी शुरुआत है।',
      Amharic:
        'መልሶችዎ በተግባራዊ ሥራ፣ መሣሪያዎች፣ መለኪያ እና የቦታ ሙያ ጥንካሬ ያሳያሉ። Construction Foundations የእርስዎ ምርጥ መጀመሪያ ነው።',
      Tigrinya:
        'መልስታትካ ኣብ ተግባራዊ ስራሕ፣ መሳርሒታት፣ መለክዒን ናይ ቦታ ሞያን ሓይሊ የርኢ። Construction Foundations ዝበለጸ ጅማሮኻ እዩ።',
    },
    strengths: [
      {
        Spanish: 'Te motiva el trabajo con las manos y resultados visibles',
        Arabic: 'يحفّزك العمل اليدوي والنتائج المرئية',
        Hindi: 'हाथों से काम और दिखने वाले नतीजे आपको प्रेरित करते हैं',
        Amharic: 'በእጅ ሥራ እና የሚታዩ ውጤቶች ያነሳሳዎታል',
        Tigrinya: 'ብኢድ ስራሕን ዝረአ ውጽኢታትን የነቓቕዕካ',
      },
      {
        Spanish: 'Encajas con seguridad, herramientas y aprendizaje de oficio',
        Arabic: 'تناسبك السلامة والأدوات وتعلّم الحرفة',
        Hindi: 'सुरक्षा, औज़ार और हुनर सीखना आपके अनुकूल है',
        Amharic: 'ከደህንነት፣ መሣሪያዎች እና የሙያ ትምህርት ጋር ይስማማሉ',
        Tigrinya: 'ምስ ድሕንነት፣ መሳርሒታትን ናይ ሞያ ትምህርትን ትሰማማዕ',
      },
    ],
  },
  logistics: {
    title: {
      Spanish: 'Logística',
      Arabic: 'اللوجستيات',
      Hindi: 'लॉजिस्टिक्स',
      Amharic: 'ሎጂስቲክስ',
      Tigrinya: 'ሎጂስቲክስ',
    },
    summary: {
      Spanish:
        'Tus respuestas destacan organización, movimiento de materiales y sistemas ordenados. Hoy empiezas con Construction Foundations; logística abre después con el mismo estándar.',
      Arabic:
        'تُبرز إجاباتك التنظيم وحركة المواد والأنظمة المرتبة. اليوم تبدأ بأسس البناء؛ اللوجستيات تُفتح لاحقاً بنفس المعيار.',
      Hindi:
        'आपके जवाब संगठन, सामग्री की आवाजाही और व्यवस्थित सिस्टम दिखाते हैं। आज Construction Foundations से शुरू करें; लॉजिस्टिक्स बाद में उसी मानक से खुलेगा।',
      Amharic:
        'መልሶችዎ ድርጅት፣ የቁሳቁስ እንቅስቃሴ እና ሥርዓታማ ስርዓቶችን ያሳያሉ። ዛሬ Construction Foundations ይጀምሩ፤ ሎጂስቲክስ በኋላ በተመሳሳይ ደረጃ ይከፈታል።',
      Tigrinya:
        'መልስታትካ ውደባ፣ ናይ ኣቕሑ ምንቅስቓስን ስርዓታዊ ስርዓታትን የርኢ። ሎሚ Construction Foundations ጀምር፤ ሎጂስቲክስ ድሕሪኡ ብተመሳሳሊ መለክዒ ክኽፈት እዩ።',
    },
    strengths: [
      {
        Spanish: 'Te sientes bien con orden, etiquetas y entregas',
        Arabic: 'ترتاح مع الترتيب والملصقات والتسليمات',
        Hindi: 'क्रम, लेबल और डिलीवरी आपको सुहाती है',
        Amharic: 'ከሥርዓት፣ መለያዎች እና አቅርቦቶች ጋር ምቹ ነዎት',
        Tigrinya: 'ምስ ስርዓት፣ ምልክታትን ኣቀራርባን ምቹእ ኢኻ',
      },
    ],
  },
  community: {
    title: {
      Spanish: 'Apoyo comunitario',
      Arabic: 'الدعم المجتمعي',
      Hindi: 'सामुदायिक सहायता',
      Amharic: 'የማህበረሰብ ድጋፍ',
      Tigrinya: 'ናይ ማሕበረሰብ ድጋፍ',
    },
    summary: {
      Spanish:
        'Tus respuestas destacan ayudar personas con paciencia y respeto. Hoy el programa abierto es Construction Foundations; la vía comunitaria viene después.',
      Arabic:
        'تُبرز إجاباتك مساعدة الناس بالصبر والاحترام. البرنامج المفتوح اليوم هو أسس البناء؛ مسار المجتمع يأتي لاحقاً.',
      Hindi:
        'आपके जवाब धैर्य और सम्मान से लोगों की मदद दिखाते हैं। आज खुला कार्यक्रम Construction Foundations है; सामुदायिक मार्ग बाद में आएगा।',
      Amharic:
        'መልሶችዎ ሰዎችን በትዕግስትና ክብር መርዳትን ያሳያሉ። ዛሬ ክፍት ፕሮግራም Construction Foundations ነው፤ የማህበረሰብ መንገድ በኋላ ይመጣል።',
      Tigrinya:
        'መልስታትካ ሰባት ብትዕግስትን ክብርን ምሕጋዝ የርኢ። ሎሚ ክፉት ፕሮግራም Construction Foundations እዩ፤ ናይ ማሕበረሰብ መንገዲ ድሕሪኡ ክመጽእ እዩ።',
    },
    strengths: [
      {
        Spanish: 'Te motiva el contacto humano y el apoyo práctico',
        Arabic: 'يحفّزك التواصل الإنساني والدعم العملي',
        Hindi: 'मानवीय संपर्क और व्यावहारिक सहायता आपको प्रेरित करती है',
        Amharic: 'የሰው ግንኙነት እና ተግባራዊ ድጋፍ ያነሳሳዎታል',
        Tigrinya: 'ናይ ሰብ ርክብን ተግባራዊ ድጋፍን የነቓቕዕካ',
      },
    ],
  },
}

export type AssessmentScores = Record<RiasecArea, number>
export type PathwayScores = Record<PathwayId, number>

export function emptyRiasec(): AssessmentScores {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
}

export function scoreInterestAnswers(answers: Record<string, LikertValue>): AssessmentScores {
  const scores = emptyRiasec()
  const counts: AssessmentScores = emptyRiasec()
  for (const item of CAREER_INTEREST_ITEMS) {
    const v = answers[item.id]
    if (!v) continue
    scores[item.area] += v
    counts[item.area] += 1
  }
  // Normalize to 0–100 percent of max (5 * count)
  const pct = emptyRiasec()
  ;(Object.keys(scores) as RiasecArea[]).forEach((k) => {
    const max = Math.max(1, counts[k] * 5)
    pct[k] = Math.round((scores[k] / max) * 100)
  })
  return pct
}

export function scoreStyleAnswers(answers: Record<string, string>): PathwayScores {
  const scores: PathwayScores = { construction: 0, logistics: 0, community: 0 }
  for (const item of CAREER_STYLE_ITEMS) {
    const chosen = answers[item.id]
    const opt = item.options.find((o) => o.id === chosen)
    if (opt) scores[opt.pathway] += 1
  }
  return scores
}

/** Map RIASEC profile → school pathways (systemic weighting). */
export function pathwayFromRiasec(riasec: AssessmentScores): PathwayScores {
  return {
    construction: Math.round(riasec.R * 0.55 + riasec.C * 0.2 + riasec.I * 0.15 + riasec.E * 0.1),
    logistics: Math.round(riasec.C * 0.4 + riasec.R * 0.3 + riasec.E * 0.2 + riasec.I * 0.1),
    community: Math.round(riasec.S * 0.55 + riasec.E * 0.2 + riasec.A * 0.15 + riasec.C * 0.1),
  }
}

export function combinePathwayScores(a: PathwayScores, b: PathwayScores): PathwayScores {
  return {
    construction: a.construction + b.construction * 18, // style picks weighted meaningfully
    logistics: a.logistics + b.logistics * 18,
    community: a.community + b.community * 18,
  }
}

export function topPathway(scores: PathwayScores): PathwayId {
  const entries = Object.entries(scores) as [PathwayId, number][]
  entries.sort((x, y) => y[1] - x[1])
  return entries[0]?.[0] || 'construction'
}

export function rankedRiasec(scores: AssessmentScores): RiasecArea[] {
  return (Object.entries(scores) as [RiasecArea, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
}

export function t(table: LangText, lang: SupportLang): string {
  return table[lang] || table.Spanish
}
