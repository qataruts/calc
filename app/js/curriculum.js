// بيانات المنهج — **المصدر الوحيد للحقيقة** في «اِحْسِبْ» (قاعدة `SESSIONS.md` العامة).
//
// ————— الجلسة ١: المراحل الثماني والبوابات الثلاث (`METHOD.md §٣`) —————
//
// كتبت الجلسةُ ٠ **الوصلة** ولم تكتب مادّةً: `progress.js` يبني الرحلة من `sections()`،
// و`main.js` يرسم الخريطة من وصف الأقسام، و`gate.js` يقرأ بوابتَه من `gateById`. وهذه
// الجلسة تملأ البيانات وحدَها — و**لم يُعدَّل سطرٌ واحد خارج هذا الملفّ** لتظهر الرحلةُ
// كاملةً على الخريطة بقفلها التسلسليّ. وهو معنى «الرحلة تُحسب من البيانات».
//
// ————— العقد الذي يلتزم به هذا الملفّ —————
//
// ١) **كلُّ محطةٍ تُعلن جبهتَها** (`METHOD.md §١٠.١`): أدنى عدد · أقصى عدد · أقصى رمز ·
//    العمليات · رموزُ العمليات · أنماطُ العرض. وعليها يقوم `tools/check_range.py`:
//    لا تمرينَ يستعمل عدداً أو عمليةً أو رمزاً **فوق جبهة محطته**.
//    و**رموزُ العمليات حقلٌ مستقلّ عن العمليات** لأنّ المنهج يفرّق بينهما: المحطة ٦·١
//    «آلةُ الجمع **بلا رمز**» عمليةٌ بلا علامة، والمرحلة ٥ كلُّها بلا عمليةٍ ولا علامة.
// ٢) **الرحلةُ محسوبةٌ لا مكتوبة**: `sections()` تؤلّف المراحلَ والبوابات بترتيبها،
//    وعددُ العقد يُشتقّ من البيانات ويطبعه الحارس — ولا رقمَ يُكتب بيد.
// ٣) **القفلُ تسلسليّ**: ترتيبُ `sections()` هو ترتيبُ الرحلة، وتُفتَح العقدةُ بإتمام
//    كل ما قبلها — لا يعرف `progress.js` غيرَ هذا الترتيب.
// ٤) **البوابات الثلاث** (`METHOD.md §٥`) أقسامٌ في مواضعها، تقف كلُّ واحدةٍ بعد
//    المرحلة التي تُعلنها في `after`.
// ٥) **محطةُ التعارف ٨·٥ بإعفائها المكتوب** — تعارُفٌ بلا قياس (ق١، `METHOD.md §٩`).
//
// ————— النوعُ والمفهوم يفترقان قصداً —————
//
// `type` **اسمُ الشاشة**: به يوجّه `main.js` (`#/<النوع>/<الجزء>`)، وبه تسجّل وحدةُ
// التمارين نفسَها (`registerScreen`)، وبه يجرد `test_measure.mjs`.
// و**المفهومُ** حقلُ ليتنر الأول في `skills` (`METHOD.md §٦`) — وقد يفترقان: محطاتُ
// «أيُّهما أكثر» بالكميات شاشتُها `more` ومفهومُها `compare` (المفتاح `compare|5|more`)،
// وشاشةُ المقارنة بالرموز `compare` (المفتاح `compare|10|pick`) — **شاشتان لأنّهما
// درسان في جلستين، ومفهومٌ واحد لأنّ المقيسَ واحد**.

import {
  arNum, QUANTITY_ACCENT, NUMERAL_ACCENT, BOND_ACCENT, PATTERN_ACCENT, PAUSE_ACCENT,
} from './ui.js';

// ————— معجمُ الجبهة —————
//
// **المعجمُ مُعلَنٌ هنا** لا في الحارس: مَن يملك المنهج يملك ما يجوز فيه، والحارسُ
// يقرأ منه — فنمطُ عرضٍ أو عمليةٌ خارج هذه القوائم تسقط في `check_range.py`.

/** العمليات التي يعرفها المستوى الأول (ق٣: الحدّ عشرون). */
export const OPS = ['add', 'sub'];

/** رموزُ العمليات — علامةٌ لكل عملية، ولا تُعرَض إلا بعد أن تُفعل بلا رمز. */
export const SIGNS = { add: '+', sub: '−' };

/**
 * أنماطُ عرض الكميات التي يرسمها المصيِّر (الجلسة ٢) — وهذه أسماؤها في الجبهة:
 *   `dice`        نقاطُ النرد القياسية (١–٦)
 *   `scatter`     توزيعٌ مبعثر بلا تراكب — يمنع حفظ الصورة (`METHOD.md §٢.٣`)
 *   `objects`     عناصرُ عالم الطفل من Twemoji المحلية بعقد «صدق الصورة»
 *   `five-frame`  إطارُ الخمسة (صفٌّ واحد، يُملأ من اليمين)
 *   `ten-frame`   إطارُ العشرة — العمودُ الفقريّ البصريّ للرحلة
 *   `two-frames`  إطارا عشرة (١١–٢٠): عشرةٌ وآحاد
 *   `numeral`     بطاقةُ رمزٍ مشرقيّ
 *   `line`        خطُّ الأعداد
 *   `pattern`     شريطُ نمطٍ متكرّر
 *   `scene`       مشهدٌ للقياس الوصفي (أطول/أثقل، قبل/بعد)
 *   `shape`       شكلٌ هندسيّ يرسمه المصيِّر (المرحلة ٩ — لا إيموجي ملتبس)
 */
export const DISPLAYS = [
  'dice', 'scatter', 'objects', 'five-frame', 'ten-frame', 'two-frames',
  'numeral', 'line', 'pattern', 'scene', 'shape',
];

/** سقفُ المستوى الأول (ق٣، `METHOD.md §١.٣`) — المئةُ والمنازل لـ«اِحْسِبْ ٢». */
export const LEVEL_MAX = 20;

/** حدُّ التقدير الفوري بحثياً (`METHOD.md §٢.٣`) — فوقه يُعَدّ ولا يُقدَّر بنظرة. */
export const SUBITIZE_MAX = 5;

/**
 * حدُّ العدّ فرادى: فوق العشرة **تُبنى** الأعداد حزمةً وآحاداً ولا تُعَدّ واحداً واحداً
 * (`METHOD.md §٣` المرحلة ٧: «عشرةٌ وآحاد») — وبه يقف شرطُ «لا رمزَ قبل عدّ عدده».
 */
export const COUNT_MAX = 10;

/**
 * **قفزاتُ العدّ** (`METHOD.md §٣` — تعديلُ «التكثيف المستهدف»): بالاثنين والخمسة
 * والعشرة حتى العشرين.
 *
 * **ومصدرُها واحدٌ لشاشتين**: «اِعْدُدْ قَفْزاً» تقفز بها على الخطّ، و«النمطُ العدديّ»
 * يبني بها شريطَه — ونصُّ المنهج أنّ الثاني **يوافق** الأول. فلو كُتبت القفزاتُ في كلِّ
 * شاشةٍ على حدةٍ لَجاز أن يفترقا يوماً: يُدرَّس نمطٌ لا يُعَدّ، ويُعَدّ نمطٌ لا يُدرَّس —
 * وهو انحرافٌ لا يُفشِل شيئاً. **وكلُّ قفزةٍ تقسم سقفَ المستوى** فتنتهي عنده تماماً ولا
 * تجاوزه (يفرضه `check_range.py`)، فلا قفزةَ تخرج بالطفل عن ق٣ ولو بخانةٍ واحدة.
 */
export const SKIP_STEPS = [2, 5, 10];

// ————— مشاهدُ القياس الوصفيّ: أشياءُ عالمٍ حقيقيّ برتبٍ معلَنة (الجلسة ٨ب) —————
//
// أحكامُ لوحة المرشَّحات (`REVIEW_SCENES.md §٦` — `METHOD.md §٣` المعدَّل): محطتا
// ٨·٣ و٨·٤ تُقارنان **أشياءَ مختلفةً بمقدارٍ واحد** — فحقيقةُ «الفيلُ أثقلُ من
// الريشة» **بيانُ منهجٍ يُقَرّ هنا** لا هندسةُ رسمٍ تُحسَب: الرمزُ المرسوم يُقرأ من
// الـDOM (`data-item`) وتُقابَل به رتبتُه المعلَنة، فيبقى شطرُ «ما رُسِم لا ما نُوِي»
// ويتبدّل مصدرُ الحكم. **والجدولُ مستقلٌّ عن `OBJECTS` عمداً** (حكمُ الموضع §٤.٣):
// عناصرُ المشاهد **تُقارَن ولا تُعَدّ**، وخلطُها بالمعدود يفتح على مولّدات الكميات
// ما لا يصح. والرسومُ من Twemoji المخزونة كسائر الرموز (يجردها `fetch_twemoji`).
//
// **وشرطان يحرسانه** (`check_range.py`): كلُّ رمزٍ في مشهدٍ له رتبةٌ هنا، ولا
// رتبتين متساويتين في سؤالٍ واحد — ولا يُسأل «أيُّهما أثقل» عن سواءين.

/**
 * مشاهدُ القياس ببُعديها — **الرتبةُ فيها هي الحكم** (١ أدناها):
 *   `weight` أزواجُ الثِّقَل (٨·٣): ١ الأخفُّ و٢ الأثقلُ **في عالم الطفل حقيقةً**.
 *     **والأولُ يتصدّر** (حكم المدير): سيارة/بالون هو الزوجُ الفاصل بين الثِّقَل
 *     والحجم — البالونُ قد يُرى كبيراً وهو أخفّ، وذلك عينُ درس المحطة.
 *   `time` تسلسلاتُ الزمن (٨·٤): الرتبةُ موضعُ المشهد في يومه أو نموّه (١ الأول)،
 *     والترتيبُ لا يحتمل جدلاً (عقدُ «صدق الصورة» §٢.٥ في `REVIEW_SCENES.md`).
 * والاسمُ للمراجعة لا للنطق (ق٢): لا يُنطَق معدودٌ ولا مشهدٌ مقروناً بعدد.
 */
export const SCENES = {
  weight: [
    {
      id: 'car-balloon',
      items: [
        { glyph: '🚗', name: 'سَيَّارَة', rank: 2 },
        { glyph: '🎈', name: 'بَالُون', rank: 1 },
      ],
    },
    {
      id: 'elephant-feather',
      items: [
        { glyph: '🐘', name: 'فِيل', rank: 2 },
        { glyph: '🪶', name: 'رِيشَة', rank: 1 },
      ],
    },
    {
      id: 'melon-strawberry',
      items: [
        { glyph: '🍉', name: 'بَطِّيخَة', rank: 2 },
        { glyph: '🍓', name: 'فَرَاوْلَة', rank: 1 },
      ],
    },
  ],
  time: [
    {
      id: 'egg-chick-hen',
      items: [
        { glyph: '🥚', name: 'بَيْضَة', rank: 1 },
        { glyph: '🐣', name: 'كَتْكُوت', rank: 2 },
        { glyph: '🐔', name: 'دَجَاجَة', rank: 3 },
      ],
    },
    {
      id: 'sunrise-day-night',
      items: [
        { glyph: '🌅', name: 'شُرُوق', rank: 1 },
        { glyph: '☀️', name: 'نَهَار', rank: 2 },
        { glyph: '🌙', name: 'لَيْل', rank: 3 },
      ],
    },
    {
      id: 'seed-sprout-tree',
      items: [
        { glyph: '🌰', name: 'بَذْرَة', rank: 1 },
        { glyph: '🌱', name: 'بُرْعُم', rank: 2 },
        { glyph: '🌳', name: 'شَجَرَة', rank: 3 },
      ],
    },
  ],
};

/**
 * رتبةُ رمزٍ في بُعده (`weight` أو `time`) — أو `null` لرمزٍ لا رتبةَ له.
 * وبها تحكم شاشةُ القياس على ما قرأته من الـDOM، ويفرض الفاحصُ ألّا رمزَ بلا رتبة.
 */
export function sceneRank(face, glyph) {
  for (const scene of SCENES[face] || []) {
    const item = scene.items.find((i) => i.glyph === glyph);
    if (item) return item.rank;
  }
  return null;
}

// ————— الأشكالُ الأولى: أربعةٌ يرسمها المصيِّر هندسياً (المرحلة ٩ — الجلسة ش) —————
//
// **الشكلُ رسمٌ لا صورة** (`METHOD.md §٣` المرحلة ٩): «الشكلُ يرسمه المصيِّر هندسياً
// (صنفٌ سادس بقارئ مرسومه: `data-shape` وعددُ أضلاعه محسوبٌ من المرسوم) — **لا إيموجي
// ملتبس** (عقد صدق الصورة)». فالمثلثُ عندنا ثلاثةُ أضلاعٍ تُرسَم وتُعَدّ من الـDOM،
// لا محرفٌ يُسلَّم لخطّ النظام فيصير في كل جهازٍ رسماً.
//
// **وترتيبُ الجدول ترتيبُ التقديم**، و`at` **موضعُ تقديم كلِّ شكل** (جزءُ محطته):
// ٩·١ متباعدا الصورة (دائرةٌ ومثلث) ثم ٩·٢ الشبيهان قصداً (مربّعٌ ومستطيل) —
// فحوضُ خيارات المحطة **يُقرأ من هنا** (`shapesUpTo`) ولا يُكتب في شاشة، وما لم
// يُقدَّم بعدُ لا يُرسَم فيها (يفرضه `check_range.py`).
//
// **والأضلاعُ بيانُ منهجٍ يُقابَل بالمرسوم**: `sides` هنا ما يُدرَّس، وهندسةُ
// `render.js` ترسم ما ترسم — ويقابل الحارسُ الاثنين، فرقمٌ يُبدَّل هنا بلا رسمٍ
// يوافقه **يحمرّ** ولا يمرّ إلى طفل.
//
// **والاسمُ يُنطَق** (بخلاف أسماء المشاهد): فهو مشكولٌ بالكامل، ومصفوفٌ في القائمة
// الصوتية عبر `SPOKEN` في `shapes.js` — ولا معدودَ فيه مقروناً بعدد (ق٢).

export const SHAPES = [
  { id: 'circle', name: 'دَائِرَةْ', sides: 0, at: 'pair' },
  { id: 'triangle', name: 'مُثَلَّثْ', sides: 3, at: 'pair' },
  { id: 'square', name: 'مُرَبَّعْ', sides: 4, at: 'twins' },
  { id: 'rect', name: 'مُسْتَطِيلْ', sides: 4, at: 'twins' },
];

/** شكلٌ بمعرّفه — أو `null` لمعرّفٍ لا تعرفه بياناتُ المنهج. */
export const shapeOf = (id) => SHAPES.find((s) => s.id === id) || null;

/**
 * **الأشكالُ التي قُدِّمت حتى هذه المحطة** (بجزئها) — حوضُ خياراتها ومادّةُ أسئلتها.
 * وما بعدها لا يدخلها: المشتّتُ من المدروس حصراً (`METHOD.md §٣`).
 */
export function shapesUpTo(part) {
  const order = [...new Set(SHAPES.map((s) => s.at))];
  const at = order.indexOf(part);
  return at < 0 ? SHAPES.slice() : SHAPES.filter((s) => order.indexOf(s.at) <= at);
}

/** الأشكالُ التي تُقدَّم في هذه المحطة وحدَها — موضوعُ درسها (والباقي مراجعة). */
export const shapesAt = (part) => SHAPES.filter((s) => s.at === part);

// ————— أشياءُ عالم الطفل مبنيّةً من أشكالنا (٩·٤ «الأشكالُ حَوْلَنَا») —————
//
// **بيتٌ سقفُه مثلثٌ وبابُه مستطيل** — والشكلُ فيها **مرسومٌ لا مُدَّعىً**: من رسم
// السقفَ مثلثاً هو من يُعلن `data-shape`، فتقرأ الشاشةُ جوابَها من الرسم كما تقرأ
// عددَ الكمّية من عناصرها. وهو عينُ شرط «صدق الصورة» في أنقى صوره: **الفرقُ حقيقيٌّ
// في الصورة نفسِها** لا في نيّة كاتبها.
//
// **وموضعُ كلِّ جزءٍ نسبةٌ من صندوقٍ واحد** (٠..١، والصفرُ أعلى الصندوق ويساره
// هندسةً): يحسبها المصيِّر بكسلاً على أيّ مقاس، فيبقى الشيءُ هو هو على كل جهاز.
// وشرطان يحرسان صدقَ الرسم (`check_range.py` بابٌ ١د): **المربّعُ والدائرةُ صندوقُهما
// مربَّع** (فلا يُسمّى مربّعاً ما رُسم مستطيلاً)، **والمستطيلُ صندوقُه مختلفُ الضلعين**
// (فلا يُسمّى مستطيلاً ما رُسم مربّعاً) — والكذبةُ في الرسم أشدُّ من الكذبة في الاسم.
//
// **وبندٌ مرفوعٌ للمدير** (`SESSIONS.md` — الجلسة ش): نصُّ `METHOD.md §٣` يقول
// «مطابقةُ شكلٍ بأشياءَ من عالم الطفل (`objects` القائمة)»، وعناصرُ `OBJECTS` الثمانية
// **ليس فيها مثلثٌ ولا مربّعٌ ولا مستطيلٌ صادق** (فيها الدائرةُ وحدَها: كعكةٌ وبالون)،
// وإدخالُ رسومٍ جديدة إلى عالم الطفل يقتضي عينَ المالك سلفاً (سنّةُ الجلسة ٨ب في
// `REVIEW_SCENES.md`). فبُنيت أشياءُ العالم **من أشكالنا نفسِها** — لا رسمَ جديد
// يدخل، ولا دعوى شكلٍ على صورةٍ لم نرسمها.

// **ولكلِّ جزءٍ أرضيّةُ إصبع** (`PART_MIN` أدناه): الجزءُ هدفُ لمسٍ يُسأل عنه، فلا
// يصغر عن رُبع الصندوق في أضيق بُعديه — ولو صغر لَبلغ على شاشة الهاتف دون عتبة اللمس
// (`METHOD.md §١١`) فاحمرّ حارسُ المتصفّح بحقّ. يفرضه `check_range.py` حساباً.

export const SHAPES_WORLD = [
  {
    id: 'house',
    name: 'بَيْت',
    parts: [
      { shape: 'triangle', x: 0.08, y: 0.04, w: 0.84, h: 0.34 },   // السَّقف
      { shape: 'square', x: 0.20, y: 0.38, w: 0.60, h: 0.60 },     // الجِسم
      { shape: 'rect', x: 0.38, y: 0.66, w: 0.25, h: 0.32 },       // الباب
    ],
  },
  {
    id: 'train',
    name: 'قِطَار',
    parts: [
      { shape: 'rect', x: 0.05, y: 0.24, w: 0.82, h: 0.38 },       // العَربة
      { shape: 'square', x: 0.58, y: 0.30, w: 0.25, h: 0.25 },     // النافذة
      { shape: 'circle', x: 0.14, y: 0.63, w: 0.25, h: 0.25 },     // عَجَلة
      { shape: 'circle', x: 0.55, y: 0.63, w: 0.25, h: 0.25 },     // عَجَلة
    ],
  },
  {
    id: 'tree',
    name: 'شَجَرَة',
    parts: [
      // **التاجُ دائرةٌ لا مثلثٌ فيه ثمرة** (حكمُ المدير على لوح المرشَّحات، ١٣ أغسطس
      // ٢٠٢٦): كان مثلثاً في جوفه قرصٌ وساقٌ تحته فلا يسمّيه طفلٌ شجرةً — وهو رسمُ
      // الطفل الكلاسيكيّ: تاجٌ مستدير على جِذعٍ قائم. **ولكلِّ شكلٍ موضعان** بعده
      // (الدائرةُ هنا وعجلا القطار · والمثلثُ سقفُ البيت وشراعُ القارب) فلا يصير
      // سؤالُ شكلٍ جواباً واحداً بعينه.
      { shape: 'circle', x: 0.18, y: 0.04, w: 0.64, h: 0.64 },     // التاج
      // والجِذعُ يلتقي التاجَ عند حافّته لا في جوفه (تاجُه يبلغ ٠٫٦٨): لمسةُ تلاقٍ
      // تصله ولا تُقرأ خطّاً داخل التاج.
      { shape: 'rect', x: 0.375, y: 0.645, w: 0.25, h: 0.335 },    // الجِذع
    ],
  },
  {
    id: 'boat',
    name: 'قَارِب',
    parts: [
      { shape: 'triangle', x: 0.28, y: 0.04, w: 0.48, h: 0.54 },   // الشِّراع
      { shape: 'rect', x: 0.08, y: 0.60, w: 0.82, h: 0.26 },       // البَدَن
    ],
  },
];

/** أدنى نسبةِ جزءٍ من صندوق الشيء — أرضيّةُ إصبعِ طفلٍ على شاشة هاتف. */
export const PART_MIN = 0.25;

/** شيءٌ من عالم الطفل بمعرّفه — أو `null`. */
export const worldThing = (id) => SHAPES_WORLD.find((t) => t.id === id) || null;

/** الأشياءُ التي فيها هذا الشكلُ مرسوماً — ومنها تُبنى أسئلةُ «الأشكالُ حَوْلَنَا». */
export const thingsWith = (shape) =>
  SHAPES_WORLD.filter((t) => t.parts.some((p) => p.shape === shape));

// ————— مفاهيمُ الحساب: أقسامُ لوحة وليّ الأمر السبعة (`METHOD.md §٦`) —————
//
// **«مفهومٌ بعملية لا درجة»** — نصُّ المنهج: «لوحة وليّ الأمر: مفهومٌ بعملية لا درجة —
// (يقدّر حتى ٥ فوراً)، (يحتاج تثبيت جسور ١٠) — بأقسامها (كمّ · عدّ · رموز · مقارنة ·
// جسور · عمليات · أنماط)». فما يقرؤه الوالدُ **فعلٌ يفعله طفلُه**، لا نسبةً ولا نجمة.
//
// **وموضعُ هذا الجدول بيانات المنهج لا شاشةُ اللوحة** (الجلسة ٨): المفاهيمُ حقلُ ليتنر
// الأوّل الذي تكتبه محطاتُ هذا الملفّ (`skills`)، فمن كتب المفتاح يسمّيه — واللوحةُ
// **تُترجم ولا تخترع**. ولو سكنت العباراتُ `parent.js` لَصار للمفاهيم مصدران يفترقان:
// مفهومٌ جديد في محطةٍ جديدة يمرّ صامتاً فلا يراه الوالدُ أبداً. **وحارسُه**
// `test_parent.mjs`: كلُّ مفهومٍ تكتبه الرحلةُ له سطرٌ هنا، ولا سطرَ لمفهومٍ سقط منها.
//
// **والمدى يُملأ من سجلّ ليتنر الحيّ** (`{ما}`): أقصى مدىً أتقنه في «يفعل»، ومدى
// أضعف مهارةٍ في «يحتاج» — فلا رقمَ في هذه العبارات مكتوبٌ بيد.

// **وهذه العباراتُ بلا شكل — عمداً**: لسانُ الوالد لا لسانُ الطفل، وسائرُ لوحة وليّ
// الأمر نصٌّ عاديّ. والشكلُ في هذا التطبيق علامةُ ما **يُقرأ للطفل أو يُنطَق**
// (`check_speech.mjs` يشترطه على كل نصٍّ منطوق) — فتركُه هنا يقول إنّ هذه لا تُنطَق.

/** أقسامُ اللوحة السبعة بترتيب الرحلة — عناوينُها كما في `METHOD.md §٦`. */
export const CONCEPT_SECTIONS = [
  { id: 'quantity', title: 'الكمّ' },
  { id: 'counting', title: 'العدّ' },
  { id: 'numerals', title: 'الرموز' },
  { id: 'compare', title: 'المقارنة' },
  { id: 'bonds', title: 'الجسور' },
  { id: 'ops', title: 'العمليات' },
  { id: 'patterns', title: 'الأنماط' },
  // **قسمٌ ثامن بالمرحلة ٩** (الجلسة ش): الهندسةُ مسارٌ موازٍ في مسارات التعلّم،
  // فلها في لوحة الوالد سطرُها — **مفهومٌ بعملية لا درجة** كإخوته.
  { id: 'shapes', title: 'الأشكال' },
];

/**
 * **أسماءُ المديات الوصفية** (المرحلة ٨): مفاتيحُها وجهٌ يُسمّى لا عددٌ يُقاس
 * (`pattern|abab|extend` · `measure|weight|pick`) — فتُسمّى هنا بلسان الوالد.
 * ومدىً وصفيّ بلا اسمٍ هنا يُحمِر `test_parent.mjs` (لا يُعرَض مفتاحٌ خام لوالد).
 */
export const RANGE_NAMES = {
  abab: '(أ ب أ ب)',
  abc: '(أ ب ج)',
  aabb: '(أ أ ب ب)',
  num: 'الأعداد القافزة',
  length: 'الأطولَ والأقصر',
  weight: 'الأثقلَ والأخفّ',
  time: 'قبلُ وبعد',
};

/**
 * المفهومُ ← قسمُه وعبارتاه. `does` ما يفعله إذا أتقن، و`needs` ما يحتاج تثبيتَه —
 * وفيهما `{ما}` موضعُ المدى الذي يُقرأ من ليتنر.
 */
export const CONCEPTS = {
  subitize: {
    section: 'quantity', title: 'التقدير الفوريّ',
    does: 'يقدّر حتى {ما} فوراً', needs: 'يحتاج تثبيت التقدير حتى {ما}',
  },
  match: {
    section: 'quantity', title: 'مطابقة الكميات',
    does: 'يطابق كميتين حتى {ما}', needs: 'يحتاج تثبيت المطابقة حتى {ما}',
  },
  count: {
    section: 'counting', title: 'العدّ بالتناظر الفرديّ',
    does: 'يعدّ حتى {ما} بلمسةٍ لكل عنصر', needs: 'يحتاج تثبيت العدّ حتى {ما}',
  },
  equal: {
    section: 'counting', title: 'اجعلهما سواء',
    does: 'يسوّي كميتين حتى {ما}', needs: 'يحتاج تثبيت التسوية حتى {ما}',
  },
  skip: {
    section: 'counting', title: 'العدُّ قفزاً',
    does: 'يعدّ قفزاً حتى {ما} (بالاثنين والخمسة والعشرة)',
    needs: 'يحتاج تثبيت العدّ قفزاً حتى {ما}',
  },
  numeral: {
    section: 'numerals', title: 'رموز الأعداد',
    does: 'يقرأ الرموز حتى {ما}', needs: 'يحتاج تثبيت الرمز {ما}',
  },
  teen: {
    section: 'numerals', title: 'العشرة وما بعدها',
    does: 'يبني ويقرأ حتى {ما} عشرةً وآحاداً',
    needs: 'يحتاج تثبيت بناء {ما} عشرةً وآحاداً',
  },
  compare: {
    section: 'compare', title: 'أيّهما أكثر',
    does: 'يقارن حتى {ما}', needs: 'يحتاج تثبيت المقارنة حتى {ما}',
  },
  line: {
    section: 'compare', title: 'خطّ الأعداد',
    does: 'يضع العدد في موضعه حتى {ما}', needs: 'يحتاج تثبيت خطّ الأعداد حتى {ما}',
  },
  order: {
    section: 'compare', title: 'الترتيب',
    does: 'يرتّب حتى {ما}', needs: 'يحتاج تثبيت الترتيب حتى {ما}',
  },
  neighbor: {
    section: 'compare', title: 'السابق والتالي',
    does: 'يعرف السابق والتالي حتى {ما}', needs: 'يحتاج تثبيت السابق والتالي حتى {ما}',
  },
  bond: {
    section: 'bonds', title: 'جسور الأعداد',
    does: 'يصنع جسور {ما}', needs: 'يحتاج تثبيت جسور {ما}',
  },
  add: {
    section: 'ops', title: 'الجمع',
    does: 'يجمع ضمن {ما}', needs: 'يحتاج تثبيت الجمع ضمن {ما}',
  },
  sub: {
    section: 'ops', title: 'الطرح',
    does: 'يطرح ضمن {ما}', needs: 'يحتاج تثبيت الطرح ضمن {ما}',
  },
  diff: {
    section: 'ops', title: 'الفرق بين عددين',
    does: 'يجد الفرق ضمن {ما}', needs: 'يحتاج تثبيت الفرق ضمن {ما}',
  },
  double: {
    section: 'ops', title: 'المزدوجات',
    does: 'يعرف المزدوجات حتى {ما} فوراً', needs: 'يحتاج تثبيت المزدوجات حتى {ما}',
  },
  pattern: {
    section: 'patterns', title: 'إكمال النمط',
    does: 'يكمل نمط {ما}', needs: 'يحتاج تثبيت نمط {ما}',
  },
  measure: {
    section: 'patterns', title: 'القياس الوصفيّ',
    does: 'يميّز {ما} بعينه', needs: 'يحتاج تثبيت {ما}',
  },
  shape: {
    section: 'shapes', title: 'الأشكال الأولى',
    does: 'يميّز {ما} أشكالٍ ويعدّ أضلاعها',
    needs: 'يحتاج تثبيت الأشكال وعدَّ أضلاعها',
  },
};

/** وصفُ مفهومٍ بمعرّفه (حقلُ ليتنر الأول) — أو `null` لمفهومٍ لا تعرفه بياناتُ المنهج. */
export const conceptOf = (id) => CONCEPTS[id] || null;

/** **كلُّ مفهومٍ تكتبه الرحلةُ فعلاً** — مجرودٌ من مفاتيح المحطات لا مكتوبٌ في قائمة. */
export function journeyConcepts() {
  return [...new Set(stations()
    .flatMap((station) => (station.skills || []).map((key) => key.split('|')[0])))];
}

/**
 * المدى كما يقرؤه وليُّ الأمر: عدداً بالمشرقية، أو **اسمَ وجهه** إن كان وصفياً.
 * @returns {string} نصُّ المدى، أو `''` لمدىً وصفيّ لا اسمَ له (يُمسكه حارسُ اللوحة).
 */
export function rangeText(range) {
  if (range === null || range === undefined || range === '') return '';
  const n = Number(range);
  return Number.isFinite(n) ? arNum(n) : (RANGE_NAMES[range] || '');
}

// ————— المراحل الثماني ومحطاتها (`METHOD.md §٣`) —————
//
// كلُّ مرحلةٍ قسمٌ على الخريطة يصف نفسَه (عنوانٌ ووجهٌ ومعلمٌ ولون)، ومحطاتُها عقدُه.
// و`skills` مفاتيحُ ليتنر التي تدرّسها المحطة **(مفهوم × مدى × نوع تمرين)** —
// `METHOD.md §٦` — ومنها يجرد `test_measure.mjs` أنواعَ التمارين لكل نوع شاشة.

export const STAGES = [
  {
    id: 'stage1',
    title: 'الكَمُّ بِلَا رَمْز',
    sub: 'يَرَى الكَمِّيَّةَ وَيُقَارِنُهَا قَبْلَ أَنْ يَعْرِفَ رَقْمَهَا',
    accent: QUANTITY_ACCENT,
    kind: 'quantity',
    mark: 'dots',
    stations: [
      {
        type: 'subitize', part: 'two', title: 'كَمْ تَرَى؟ ١–٢',
        frontier: { min: 1, max: 2, numeral: null, ops: [], signs: [], displays: ['dice'] },
        skills: ['subitize|2|flash'],
      },
      {
        type: 'subitize', part: 'three', title: 'كَمْ تَرَى؟ ١–٣',
        frontier: { min: 1, max: 3, numeral: null, ops: [], signs: [], displays: ['dice', 'scatter'] },
        skills: ['subitize|3|flash'],
      },
      {
        type: 'match', part: 'three', title: 'طَابِقِ الكَمِّيَّتَيْن',
        frontier: { min: 1, max: 3, numeral: null, ops: [], signs: [], displays: ['dice', 'scatter'] },
        skills: ['match|3|set'],
      },
      {
        type: 'more', part: 'three', title: 'أَيُّهُمَا أَكْثَر؟ ١–٣',
        frontier: { min: 1, max: 3, numeral: null, ops: [], signs: [], displays: ['dice', 'scatter'] },
        skills: ['compare|3|more'],
      },
      {
        type: 'subitize', part: 'five', title: 'كَمْ تَرَى؟ ٤–٥',
        frontier: { min: 1, max: 5, numeral: null, ops: [], signs: [], displays: ['dice', 'scatter'] },
        skills: ['subitize|5|flash'],
      },
      {
        type: 'more', part: 'five', title: 'كَثِيرٌ وَقَلِيلٌ وَسَوَاء',
        frontier: { min: 1, max: 5, numeral: null, ops: [], signs: [], displays: ['dice', 'scatter'] },
        skills: ['compare|5|more', 'match|5|set'],
      },
    ],
  },
  {
    id: 'stage2',
    title: 'العَدُّ المُرْتَبِطُ بِالكَمّ',
    sub: 'لَمْسَةٌ لِكُلِّ عُنْصُر، وَآخِرُ مَا نَطَقْتَ هُوَ الجَوَاب',
    accent: QUANTITY_ACCENT,
    kind: 'quantity',
    mark: 'count',
    stations: [
      {
        type: 'count', part: 'three', title: 'اِلْمَسْ وَعُدَّ ١–٣',
        frontier: { min: 1, max: 3, numeral: null, ops: [], signs: [], displays: ['dice', 'scatter', 'objects'] },
        skills: ['count|3|touch'],
      },
      {
        type: 'count', part: 'five', title: 'اِلْمَسْ وَعُدَّ ١–٥',
        frontier: { min: 1, max: 5, numeral: null, ops: [], signs: [], displays: ['dice', 'scatter', 'objects'] },
        skills: ['count|5|touch'],
      },
      {
        type: 'equal', part: 'five', title: 'اِجْعَلْهُمَا سَوَاء',
        frontier: { min: 1, max: 5, numeral: null, ops: [], signs: [], displays: ['scatter', 'objects'] },
        skills: ['equal|5|make'],
      },
      {
        type: 'count', part: 'seven', title: 'اِلْمَسْ وَعُدَّ ٦–٧',
        frontier: { min: 1, max: 7, numeral: null, ops: [], signs: [], displays: ['scatter', 'objects'] },
        skills: ['count|7|touch'],
      },
      {
        type: 'count', part: 'ten', title: 'اِلْمَسْ وَعُدَّ ٨–١٠',
        frontier: { min: 1, max: 10, numeral: null, ops: [], signs: [], displays: ['scatter', 'objects'] },
        skills: ['count|10|touch', 'count|10|give'],
      },
      {
        type: 'count', part: 'scatter', title: 'التَّرْتِيبُ لَا يُغَيِّرُ العَدَد',
        frontier: { min: 1, max: 10, numeral: null, ops: [], signs: [], displays: ['scatter', 'objects'] },
        skills: ['count|10|touch'],
      },
    ],
  },
  {
    id: 'stage3',
    title: 'الرُّمُوزُ ١–١٠',
    sub: 'الرَّمْزُ تَسْمِيَةٌ لِكَمٍّ عَرَفَهُ، لَا تَعْرِيفٌ لِمَجْهُول',
    accent: NUMERAL_ACCENT,
    kind: 'numeral',
    mark: 'frame',
    stations: [
      {
        type: 'numeral', part: 'one-three', title: 'رُمُوزُ ١ ٢ ٣',
        frontier: { min: 1, max: 3, numeral: 3, ops: [], signs: [], displays: ['dice', 'scatter', 'objects', 'numeral'] },
        skills: ['numeral|1|match', 'numeral|2|match', 'numeral|3|match'],
      },
      {
        type: 'numeral', part: 'fix-three', title: 'ثَبِّتْ ١–٣',
        frontier: { min: 1, max: 3, numeral: 3, ops: [], signs: [], displays: ['dice', 'scatter', 'objects', 'numeral'] },
        skills: ['numeral|1|match', 'numeral|2|match', 'numeral|3|match'],
      },
      {
        type: 'numeral', part: 'four-five', title: 'رَمْزَا ٤ وَ٥ · إِطَارُ الخَمْسَة',
        frontier: { min: 1, max: 5, numeral: 5, ops: [], signs: [], displays: ['dice', 'scatter', 'objects', 'five-frame', 'numeral'] },
        skills: ['numeral|4|match', 'numeral|5|match'],
      },
      {
        type: 'numeral', part: 'fix-five', title: 'ثَبِّتْ ١–٥',
        frontier: { min: 1, max: 5, numeral: 5, ops: [], signs: [], displays: ['dice', 'scatter', 'objects', 'five-frame', 'numeral'] },
        skills: ['numeral|1|match', 'numeral|2|match', 'numeral|3|match', 'numeral|4|match', 'numeral|5|match'],
      },
      {
        type: 'numeral', part: 'six-seven', title: 'رَمْزَا ٦ وَ٧ · إِطَارُ العَشَرَة',
        frontier: { min: 1, max: 7, numeral: 7, ops: [], signs: [], displays: ['scatter', 'objects', 'five-frame', 'ten-frame', 'numeral'] },
        skills: ['numeral|6|match', 'numeral|7|match'],
      },
      {
        type: 'numeral', part: 'eight-nine', title: 'رَمْزَا ٨ وَ٩',
        frontier: { min: 1, max: 9, numeral: 9, ops: [], signs: [], displays: ['scatter', 'objects', 'ten-frame', 'numeral'] },
        skills: ['numeral|8|match', 'numeral|9|match'],
      },
      {
        type: 'numeral', part: 'ten', title: 'العَشَرَة',
        frontier: { min: 1, max: 10, numeral: 10, ops: [], signs: [], displays: ['scatter', 'objects', 'ten-frame', 'numeral'] },
        skills: ['numeral|10|match'],
      },
      {
        // **الصفرُ متأخرٌ عمداً** (`METHOD.md §٢.٦`): كميةُ «لا شيء» أصعبُ إدراكاً،
        // وتقديمُه المبكر يشوّش المطابقة كمية↔رمز. وهنا أوّلُ محطةٍ جبهتُها تبلغ الصفر.
        type: 'numeral', part: 'zero', title: 'الصِّفْر',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['scatter', 'objects', 'five-frame', 'ten-frame', 'numeral'] },
        skills: ['numeral|0|match'],
      },
    ],
  },
  {
    id: 'stage4',
    title: 'قَارِنْ وَرَتِّبْ',
    sub: 'أَكْبَرُ وَأَصْغَر، وَأَيْنَ يَقَعُ عَلَى الخَطّ',
    accent: NUMERAL_ACCENT,
    kind: 'numeral',
    mark: 'scales',
    stations: [
      {
        type: 'compare', part: 'ten', title: 'أَكْبَرُ وَأَصْغَر',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['scatter', 'objects', 'ten-frame', 'numeral'] },
        skills: ['compare|10|pick'],
      },
      {
        type: 'line', part: 'ten', title: 'أَيْنَ يَقَع؟ ٠–١٠',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['numeral', 'line'] },
        skills: ['line|10|place'],
      },
      {
        type: 'order', part: 'ten', title: 'رَتِّبْ',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['numeral', 'ten-frame'] },
        skills: ['order|10|sort'],
      },
      {
        type: 'neighbor', part: 'ten', title: 'السَّابِقُ وَالتَّالِي',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['numeral', 'line', 'ten-frame'] },
        skills: ['neighbor|10|next'],
      },
    ],
  },
  {
    id: 'stage5',
    title: 'رَكِّبْ وَفَكِّكْ',
    sub: 'جُسُورُ الأَعْدَادِ قَبْلَ رَمْزَيْ + وَ−',
    accent: BOND_ACCENT,
    kind: 'bond',
    mark: 'bond',
    stations: [
      // **لا عمليةَ ولا رمزَ عمليةٍ في هذه المرحلة كلها** (`METHOD.md §٣` المرحلة ٥):
      // جزء-جزء-كلّ يُبنى بصرياً، فالجمعُ بعدها تركيبُ معلومٍ لا طقسٌ رمزيّ.
      {
        type: 'bond', part: 'four', title: 'جُسُورُ ٣ وَ٤',
        frontier: { min: 0, max: 4, numeral: 4, ops: [], signs: [], displays: ['scatter', 'objects', 'numeral'] },
        skills: ['bond|4|make'],
      },
      {
        type: 'bond', part: 'five', title: 'جُسُورُ ٥',
        frontier: { min: 0, max: 5, numeral: 5, ops: [], signs: [], displays: ['objects', 'five-frame', 'numeral'] },
        skills: ['bond|5|make'],
      },
      {
        type: 'bond', part: 'make-five', title: 'اِصْنَعِ الخَمْسَةَ بِطَرِيقَتَيْن',
        frontier: { min: 0, max: 5, numeral: 5, ops: [], signs: [], displays: ['objects', 'five-frame', 'numeral'] },
        skills: ['bond|5|make'],
      },
      {
        type: 'bond', part: 'seven', title: 'جُسُورُ ٦ وَ٧',
        frontier: { min: 0, max: 7, numeral: 7, ops: [], signs: [], displays: ['objects', 'five-frame', 'ten-frame', 'numeral'] },
        skills: ['bond|7|make'],
      },
      {
        type: 'bond', part: 'nine', title: 'جُسُورُ ٨ وَ٩',
        frontier: { min: 0, max: 9, numeral: 9, ops: [], signs: [], displays: ['objects', 'ten-frame', 'numeral'] },
        skills: ['bond|9|make'],
      },
      {
        type: 'bond', part: 'ten', title: 'أَصْدِقَاءُ العَشَرَة',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['objects', 'ten-frame', 'numeral'] },
        skills: ['bond|10|make'],
      },
    ],
  },
  {
    id: 'stage6',
    title: 'اِجْمَعْ وَاطْرَحْ ضِمْنَ ١٠',
    sub: 'الجَمْعُ تَرْكِيبُ مَعْلُوم، وَالطَّرْحُ إِزَالَةٌ وَفَرْق',
    accent: BOND_ACCENT,
    kind: 'bond',
    mark: 'machine',
    stations: [
      {
        // **أوّلُ عمليةٍ في الرحلة، وهي بلا رمز** (`METHOD.md §٣` المحطة ٦·١):
        // كميتان تلتقيان فتُعدّ الحصيلة — والرمزُ في ٦·٢ تسميةٌ لِما فعله هنا.
        type: 'add', part: 'machine', title: 'آلَةُ الجَمْع',
        frontier: { min: 0, max: 5, numeral: 5, ops: ['add'], signs: [], displays: ['objects', 'scatter', 'five-frame', 'numeral'] },
        skills: ['add|5|solve'],
      },
      {
        type: 'add', part: 'five', title: 'رَمْزُ + وَالجَمْعُ ضِمْنَ ٥',
        frontier: { min: 0, max: 5, numeral: 5, ops: ['add'], signs: ['+'], displays: ['objects', 'five-frame', 'numeral'] },
        skills: ['add|5|solve'],
      },
      {
        type: 'sub', part: 'five', title: 'رَمْزُ − وَالطَّرْحُ ضِمْنَ ٥',
        frontier: { min: 0, max: 5, numeral: 5, ops: ['sub'], signs: ['−'], displays: ['objects', 'five-frame', 'numeral'] },
        skills: ['sub|5|solve'],
      },
      {
        type: 'add', part: 'ten', title: 'اِجْمَعْ ضِمْنَ ١٠',
        frontier: { min: 0, max: 10, numeral: 10, ops: ['add'], signs: ['+'], displays: ['objects', 'ten-frame', 'numeral'] },
        skills: ['add|10|solve'],
      },
      {
        // **المزدوجات بعد «اجمعْ ضمن ١٠»** (تعديلُ «التكثيف المستهدف» — الجلسة ك):
        // كميتان **متطابقتان** تُريان مرآةً، فيُعرَف المزدوجُ بالنظر قبل أن يُحسَب —
        // وهي أقوى استراتيجيات الطلاقة بحثياً، ومنها تُشتقّ الجيرانُ لاحقاً (٦+٧ =
        // ٦+٦ وواحد). وعقودُ المرحلة ٦ كلُّها تسري عليها: كمّيةٌ ورمزٌ معاً أوّلَ لقاء،
        // والجوابُ من المرسوم، والخطأُ يُعَدّ بعدّ درسِه (تصاعدياً من النصف المعلوم).
        // **وأنماطُها الإطارات وحدَها**: المزدوجُ صورةٌ تُرى بنظرةٍ — إطارٌ بجوار إطارٍ
        // مثلِه — والمبعثرُ يُري كمّيتين متساويتين ولا يُري تطابقاً.
        type: 'double', part: 'ten', title: 'المُزْدَوَجَاتُ ضِمْنَ ١٠',
        frontier: { min: 0, max: 10, numeral: 10, ops: ['add'], signs: ['+'], displays: ['five-frame', 'ten-frame', 'numeral'] },
        skills: ['double|10|solve'],
      },
      {
        type: 'sub', part: 'ten', title: 'اِطْرَحْ ضِمْنَ ١٠',
        frontier: { min: 0, max: 10, numeral: 10, ops: ['sub'], signs: ['−'], displays: ['objects', 'ten-frame', 'numeral'] },
        skills: ['sub|10|solve'],
      },
      {
        type: 'diff', part: 'ten', title: 'كَمِ الفَرْقُ بَيْنَهُمَا؟',
        frontier: { min: 0, max: 10, numeral: 10, ops: ['sub'], signs: ['−'], displays: ['objects', 'ten-frame', 'numeral'] },
        skills: ['diff|10|solve'],
      },
      {
        type: 'zero', part: 'ten', title: 'الصِّفْرُ فِي العَمَلِيَّات',
        frontier: { min: 0, max: 10, numeral: 10, ops: ['add', 'sub'], signs: ['+', '−'], displays: ['objects', 'ten-frame', 'numeral'] },
        skills: ['add|10|solve', 'sub|10|solve'],
      },
      {
        type: 'fluent', part: 'ten', title: 'طَلَاقَةٌ ضِمْنَ ١٠',
        frontier: { min: 0, max: 10, numeral: 10, ops: ['add', 'sub'], signs: ['+', '−'], displays: ['objects', 'ten-frame', 'numeral'] },
        skills: ['add|10|solve', 'sub|10|solve'],
      },
    ],
  },
  {
    id: 'stage7',
    title: 'العَشَرَةُ وَمَا بَعْدَهَا ١١–٢٠',
    sub: 'حُزْمَةُ العَشَرَة، وَالعُبُورُ صُعُودًا وَنُزُولًا',
    accent: BOND_ACCENT,
    kind: 'bond',
    mark: 'frame',
    stations: [
      {
        type: 'teen', part: 'ten-unit', title: 'حُزْمَةُ العَشَرَة',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['ten-frame', 'numeral'] },
        skills: ['teen|10|build'],
      },
      {
        type: 'teen', part: 'fifteen', title: '١١–١٥ عَشَرَةٌ وَآحَاد',
        frontier: { min: 0, max: 15, numeral: 15, ops: [], signs: [], displays: ['ten-frame', 'two-frames', 'numeral'] },
        skills: ['teen|15|build'],
      },
      {
        type: 'teen', part: 'nineteen', title: '١٦–١٩',
        frontier: { min: 0, max: 19, numeral: 19, ops: [], signs: [], displays: ['ten-frame', 'two-frames', 'numeral'] },
        skills: ['teen|19|build'],
      },
      {
        type: 'teen', part: 'twenty', title: 'العِشْرُونَ وَخَطُّ ٠–٢٠',
        frontier: { min: 0, max: 20, numeral: 20, ops: [], signs: [], displays: ['ten-frame', 'two-frames', 'numeral', 'line'] },
        skills: ['teen|20|build', 'line|20|place'],
      },
      {
        type: 'bridge', part: 'twenty', title: 'اِصْنَعْ عَشَرَةً أَوَّلًا',
        frontier: { min: 0, max: 20, numeral: 20, ops: ['add'], signs: ['+'], displays: ['ten-frame', 'two-frames', 'numeral'] },
        skills: ['add|20|bridge'],
      },
      {
        // **أصعبُ مهارات المستوى تأخذ محطتين لا واحدة** (تعديلُ «التكثيف المستهدف»):
        // ٧·٥ تعبر **من قريبٍ من العشرة** (ينقصها واحدٌ أو اثنان)، وهذه تعبر **من
        // أبعد** — ما ينقص العشرةَ أكثر — فتُلقى الحقائقُ التي لم تُلقَ، لا الحقائقُ
        // نفسُها باسمٍ آخر. والشاشةُ شاشةُ ٧·٥ نفسُها (`bridge`) تقرأ موضعَها من المنهج.
        type: 'bridge', part: 'fix', title: 'ثَبِّتِ العُبُورَ صُعُودًا',
        frontier: { min: 0, max: 20, numeral: 20, ops: ['add'], signs: ['+'], displays: ['ten-frame', 'two-frames', 'numeral'] },
        skills: ['add|20|bridge'],
      },
      {
        type: 'sub', part: 'twenty', title: 'اِطْرَحْ ضِمْنَ ٢٠',
        frontier: { min: 0, max: 20, numeral: 20, ops: ['sub'], signs: ['−'], displays: ['ten-frame', 'two-frames', 'numeral'] },
        skills: ['sub|20|solve'],
      },
      {
        // **وتثبيتُ النزول كذلك**: ٧·٦ تعبر في ثلثَي جولاتها، وهذه **في كلِّها** —
        // فلا جولةَ تبقى دون العشرة، ووقفةُ الحزمة تُسمَع في كل واحدة.
        type: 'sub', part: 'fix', title: 'ثَبِّتِ العُبُورَ نُزُولًا',
        frontier: { min: 0, max: 20, numeral: 20, ops: ['sub'], signs: ['−'], displays: ['ten-frame', 'two-frames', 'numeral'] },
        skills: ['sub|20|solve'],
      },
      {
        // **والمزدوجاتُ إلى العشرين** (٦+٦ … ١٠+١٠): مزدوجُ ٦·٥ب فوق العشرة —
        // كميتان متطابقتان في إطارَين، والعبورُ يقع في عدّها فتُسمَع العشرةُ تامّةً.
        type: 'double', part: 'twenty', title: 'المُزْدَوَجَاتُ إِلَى ٢٠',
        frontier: { min: 0, max: 20, numeral: 20, ops: ['add'], signs: ['+'], displays: ['ten-frame', 'numeral'] },
        skills: ['double|20|solve'],
      },
      {
        // **اِعْدُدْ قَفْزاً**: بالاثنين والخمسة والعشرة (`SKIP_STEPS`) **على الخطّ** —
        // تُضاء مواقعُ القفزات فيُرى الإيقاعُ، والسؤالُ أين تقع القفزةُ التالية.
        // **والجوابُ من المرسوم**: قفزتُه فرقُ ما أُضيء على الخطّ، وموضعُه قيمةُ خانته.
        type: 'skip', part: 'twenty', title: 'اِعْدُدْ قَفْزًا',
        frontier: { min: 0, max: 20, numeral: 20, ops: [], signs: [], displays: ['numeral', 'line'] },
        skills: ['skip|20|count'],
      },
      {
        // **ختامُ المرحلة: حقائقُ العبور والمزدوجات مختلطةً إلى ليتنر** — جمعٌ وطرحٌ
        // ومزدوجٌ بالدور على جبهة العشرين، كما تخلط ٦·٨ حقائقَ العشرة.
        type: 'fluent', part: 'twenty', title: 'طَلَاقَةٌ ضِمْنَ ٢٠',
        frontier: { min: 0, max: 20, numeral: 20, ops: ['add', 'sub'], signs: ['+', '−'], displays: ['ten-frame', 'two-frames', 'numeral'] },
        skills: ['add|20|solve', 'sub|20|solve', 'double|20|solve'],
      },
    ],
  },
  {
    id: 'stage8',
    title: 'الأَنْمَاطُ وَالقِيَاسُ الوَصْفِيّ',
    sub: 'أَكْمِلِ النَّمَط، وَقَارِنْ بِالطُّولِ وَالثِّقَلِ وَالزَّمَن',
    accent: PATTERN_ACCENT,
    kind: 'pattern',
    mark: 'pattern',
    stations: [
      // مادّةُ هذه المرحلة أشكالٌ ومشاهد لا أعداد، وجبهتُها العدديةُ حصيلةُ ما بلغ
      // (العشرة) — سقفٌ لا موضوعُ درس.
      {
        type: 'pattern', part: 'abab', title: 'نَمَطُ (أ ب أ ب)',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['objects', 'pattern'] },
        skills: ['pattern|abab|extend'],
      },
      {
        type: 'pattern', part: 'abc', title: 'أَنْمَاطُ (أ ب ج) وَ(أ أ ب ب)',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['objects', 'pattern'] },
        skills: ['pattern|abc|extend', 'pattern|aabb|extend'],
      },
      {
        // **النمطُ العدديّ** (تعديلُ «التكثيف المستهدف»): شريطُ أرقامٍ يقفز بقفزةٍ من
        // `SKIP_STEPS` — **يوافق «اِعْدُدْ قَفْزاً» بمصدرٍ واحد** — وخانتُه الأخيرة
        // سؤال. وهو النمطُ نفسُه (٨·١ و٨·٢) وقد صارت مادّتُه أعداداً بدل الأشياء:
        // فيُرى الإيقاعُ رقماً كما رُئي صورةً، **والجوابُ من الشريط المرسوم**.
        type: 'pattern', part: 'num', title: 'النَّمَطُ العَدَدِيّ',
        frontier: { min: 0, max: 20, numeral: 20, ops: [], signs: [], displays: ['pattern', 'numeral'] },
        skills: ['pattern|num|extend'],
      },
      {
        type: 'measure', part: 'size', title: 'أَطْوَلُ وَأَقْصَر · أَثْقَلُ وَأَخَفّ',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['objects', 'scene'] },
        skills: ['measure|length|pick', 'measure|weight|pick'],
      },
      {
        type: 'measure', part: 'time', title: 'قَبْلُ وَبَعْد',
        frontier: { min: 0, max: 10, numeral: 10, ops: [], signs: [], displays: ['objects', 'scene'] },
        skills: ['measure|time|sort'],
      },
      {
        // **محطةُ تعارفٍ بلا قياس** (ق١، `METHOD.md §٩`): يعرف الطفل أنّ للأعداد
        // رسماً آخر سيلقاه، ولا يُمتحن فيه — ولذلك `skills` فارغة و`exempt` مكتوب.
        type: 'intro', part: 'latin', title: 'تَعَارُفٌ: أَرْقَامٌ أُخْرَى',
        frontier: { min: 0, max: 20, numeral: 20, ops: [], signs: [], displays: ['numeral'] },
        skills: [],
        exempt: 'محطةُ تعارفٍ على الأرقام المغربية (123) **بلا قياسٍ عليها** بنصّ '
          + 'القرار ق١ (`METHOD.md §٩`): يعرف الطفل أنّ للأعداد رسماً آخر سيلقاه، '
          + 'ولا يُمتحن فيه — فلا مفتاحَ ليتنر واحداً يُكتب من هذه المحطة.',
      },
    ],
  },
  {
    // ————— المرحلة ٩ — الأشكالُ الأولى (تعديلٌ معتمد، `METHOD.md §٣`) —————
    //
    // **موضعُها ذيلُ الرحلة قبل بوابة الختام** بثلاث علل معلَنة: **عدُّ الأضلاع
    // يوظّف عدّاً متقناً** فلا يسبقه · **وبوابةُ الختام تشملها بمداها المعلَن**
    // (الرحلة كلُّها) فلا تدريسَ بلا بوابة · **والتطبيقُ حيٌّ بأجهزة أطفال**،
    // والإضافةُ في الذيل لا تزحزح محطةً قائمة ولا تكسر تقدّماً محفوظاً.
    //
    // **وهي مجالٌ لا مدى**: لا تمسّ ق٣ بحرف — أكبرُ عددٍ فيها خمسةٌ (خياراتُ عدّ
    // الأضلاع)، وجبهتُها العدديةُ سقفٌ لا موضوعُ درس.
    id: 'stage9',
    title: 'الأَشْكَالُ الأُولَى',
    sub: 'يَعْرِفُ الشَّكْلَ رَسْمًا وَاسْمًا، وَيَعُدُّ أَضْلَاعَهُ بِإِصْبَعِه',
    accent: PATTERN_ACCENT,
    kind: 'pattern',
    mark: 'shapes',
    stations: [
      {
        // **متباعدا الصورة أولاً** (`METHOD.md §٢.٤` نظيراً): دائرةٌ ومثلث — لا
        // يلتبسان بحال، فيُبنى الاسمُ على رسمٍ بيّن قبل أن يُطلَب تمييزُ الشبيهين.
        type: 'shape', part: 'pair', title: 'الدَّائِرَةُ وَالمُثَلَّث',
        frontier: { min: 0, max: 5, numeral: 5, ops: [], signs: [], displays: ['shape'] },
        skills: ['shape|4|name'],
      },
      {
        // **والشبيهان قصداً بعد التباعد**: المربّعُ والمستطيل — المواجهةُ المقصودة،
        // وحوضُها الأشكالُ الأربعةُ كلُّها (ما قُدِّم يُراجَع، وما يُدرَّس يتصدّر).
        type: 'shape', part: 'twins', title: 'المُرَبَّعُ وَالمُسْتَطِيل',
        frontier: { min: 0, max: 5, numeral: 5, ops: [], signs: [], displays: ['shape'] },
        skills: ['shape|4|name'],
      },
      {
        // **العدُّ المتقن يخدم الهندسة**: لمسةٌ لكلِّ ضلعٍ ثم «كم صارت كلها؟» —
        // وهي «المس وعُدّ» بعينها على ما ليس كمّاً، فلذلك جاءت بعد الرحلة لا قبلها.
        // **والدائرةُ خارجَها** (لا ضلعَ يُلمَس فيها)، واسمُها يُقال في أختيها.
        type: 'shape', part: 'sides', title: 'كَمْ ضِلْعًا؟',
        frontier: { min: 0, max: 5, numeral: 5, ops: [], signs: [], displays: ['shape', 'numeral'] },
        skills: ['shape|4|sides'],
      },
      {
        // **الشكلُ في الحياة لا في الورقة**: بيتٌ وقطارٌ وشجرةٌ وقارب — يُلمَس فيها
        // الشكلُ المطلوب، والجوابُ `data-shape` المقروءُ من المرسوم.
        type: 'shape', part: 'world', title: 'الأَشْكَالُ حَوْلَنَا',
        frontier: { min: 0, max: 5, numeral: 5, ops: [], signs: [], displays: ['shape'] },
        skills: ['shape|4|world'],
      },
    ],
  },
];

// ————— البوابات الثلاث (`METHOD.md §٥`) —————
//
// إتقانٌ **بلا رسوب**: جلسةٌ من أضعف مهارات ليتنر، عشرةُ تمارين، والعبور بـ≥٨٠٪ —
// ودونها تبقى التالية مقفلة مع إعادةٍ فورية بلا حدّ ولا عقاب. و`after` **موضعُها
// المعلَن**: تقف البوابةُ بعد المرحلة التي تحمل هذا المعرّف.
//
// **ومداها مُعلَنٌ كذلك** (`from` — الجلسة ٦): `METHOD.md §٣` يذكر لكل بوابةٍ **ممّ
// تسأل**، وهي ثلاثةُ مديات لا مدىً واحد: الأولى «من أضعف مهارات ليتنر **في المراحل
// ١–٤**»، والثانية «من أضعف مهارات **المرحلتين ٥–٦**»، والثالثة «من أضعف مهارات
// **الرحلة كلّها**». فالأولى والثالثة تبدآن من أوّل الرحلة، **والثانيةُ لا** — ولولا
// إعلانِ المدى لَسألت بوابةُ العمليات عن أضعف ما في يد الطفل ولو كان تقديراً فورياً
// من المرحلة الأولى، فتُفتَح العملياتُ على غير ما تحرسه.

export const GATES = [
  {
    id: 'quantity',
    after: 'stage4',
    from: 'stage1',
    title: 'عُبُورُ الكَمّ',
    hint: 'عَشَرَةُ تَمَارِينَ مِنْ أَضْعَفِ مَا فِي يَدِكَ — وَلَا رُسُوب.',
    face: '★',
  },
  {
    id: 'ops',
    after: 'stage6',
    from: 'stage5',
    title: 'عُبُورُ العَمَلِيَّات',
    hint: 'ثَبِّتِ الجُسُورَ وَالعَمَلِيَّاتِ قَبْلَ أَنْ تُجَاوِزَ العَشَرَة.',
    face: '★',
  },
  {
    // **وموضعُها تبع الرحلةَ حين طالت** (الجلسة ش): كانت بعد المرحلة ٨، فلمّا دخلت
    // **المرحلة ٩ في الذيل** صارت بعدها — نصُّ `METHOD.md §٣`: «مرحلةٌ تاسعة في ذيل
    // الرحلة **قبل بوابة الختام**». ومداها `stage1` كما هو، فتشمل مفاتيحَ الأشكال
    // من تلقائها (يُثبته `test_gate.mjs` بسجلٍّ مصنوع).
    id: 'final',
    after: 'stage9',
    from: 'stage1',
    title: 'خِتَامُ التَّأْسِيس',
    hint: 'مِنْ أَضْعَفِ مَا فِي الرِّحْلَةِ كُلِّهَا — وَهُوَ بَابُ «اِحْسِبْ ٢».',
    face: '★',
  },
];

// ————— الرحلة: تُحسب من البيانات ولا تُكتب بيد —————

/** قسمُ مرحلةٍ كما تقرؤه الخريطة — عقدُه محطاتُها بترتيبها. */
function stageSection(stage) {
  return {
    kind: stage.kind,
    id: stage.id,
    title: stage.title,
    sub: stage.sub,
    face: arNum(STAGES.indexOf(stage) + 1),
    mark: stage.mark,
    accent: stage.accent,
    nodes: stage.stations.map((station, i) => ({
      id: `${station.type}:${station.part}`,
      type: station.type,
      part: station.part,
      title: station.title,
      face: arNum(i + 1),
      frontier: station.frontier,
      skills: station.skills,
      exempt: station.exempt,
    })),
  };
}

/** قسمُ بوابةٍ — عقدةٌ واحدة تفتحها `gate.js` بمعرّفها. */
function gateSection(gate) {
  return {
    kind: 'gate',
    id: `gate-${gate.id}`,
    title: gate.title,
    sub: gate.hint,
    face: gate.face,
    mark: 'gate',
    accent: PAUSE_ACCENT,
    nodes: [{
      id: `gate:${gate.id}`,
      type: 'gate',
      part: gate.id,
      title: gate.title,
      face: gate.face,
    }],
  };
}

/**
 * **أقسامُ الرحلة بالترتيب** — الوصلةُ الوحيدة بين المنهج والواجهة.
 *
 * تُؤلَّف تأليفاً: مرحلةٌ ثم بوابتُها إن أعلنت بوابةٌ موضعَها بعدها — فلا ترتيبَ
 * مكتوبٌ بيد، ولا عددَ محطاتٍ يُحصى في مكانين.
 */
export function sections() {
  const out = [];
  for (const stage of STAGES) {
    out.push(stageSection(stage));
    for (const gate of GATES.filter((g) => g.after === stage.id)) out.push(gateSection(gate));
  }
  return out;
}

/**
 * محطاتُ الرحلة كلُّها بالترتيب (بلا البوابات) — مادّةُ `check_range.py`.
 *
 * **ومعلمُ مرحلتها معها** (`mark` — حكمُ المدير على مقترح الجلسة هـ): ميداليةُ ختام
 * المحطة تحمل معلمَ مرحلتها **بياناً لا يداً**، فتقرؤه `station.js` من هنا كما تقرؤه
 * الخريطةُ من `sections()` — مصدرٌ واحد لا نسختان تفترقان.
 */
export function stations() {
  return STAGES.flatMap((stage) => stage.stations.map((station) => ({
    ...station,
    id: `${station.type}:${station.part}`,
    stage: stage.id,
    mark: stage.mark,
  })));
}

/** جبهةُ محطةٍ بمعرّفها — يقرؤها مولّدُ التمارين قبل أن يولّد. */
export function frontierOf(id) {
  return stations().find((station) => station.id === id)?.frontier || null;
}

/** البوابةُ التي تقف قبل هذا الموضع، أو `null` — بيانٌ مُعلَن لا شرطٌ مضمر. */
export function gateBefore(where) {
  return GATES.find((gate) => gate.after === where) || null;
}

/** بوابةٌ بمعرّفها (تستعملها شاشةُ البوابة في `gate.js`). */
export function gateById(id) {
  return GATES.find((gate) => gate.id === id) || null;
}

/**
 * **مفاتيحُ ليتنر التي تسأل عنها بوابةٌ** — من مرحلة `from` إلى مرحلتها المعلنة في
 * `after` (`METHOD.md §٣`)، مقروءةً من محطاتها لا مكتوبةً في قائمة.
 *
 * والبوابةُ **تقيس ولا تدرّس**، فمادّتُها مفاتيحُ ما قبلها — والمدى هو الذي يفرّق
 * بوابةَ العمليات عن أختيها: تسأل عن الجسور والعمليات وحدَها، فلا يتصدّر جلستَها
 * ضعفٌ في التقدير الفوريّ عبر الطفلُ بابَه قبل مراحل.
 */
export function gateSkills(id) {
  const gate = gateById(id);
  if (!gate) return [];
  const order = STAGES.map((stage) => stage.id);
  const from = order.indexOf(gate.from);
  const to = order.indexOf(gate.after);
  if (from < 0 || to < from) return [];
  return [...new Set(STAGES.slice(from, to + 1)
    .flatMap((stage) => stage.stations.flatMap((station) => station.skills || [])))];
}
