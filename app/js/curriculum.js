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
 */
export const DISPLAYS = [
  'dice', 'scatter', 'objects', 'five-frame', 'ten-frame', 'two-frames',
  'numeral', 'line', 'pattern', 'scene',
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
        type: 'sub', part: 'twenty', title: 'اِطْرَحْ ضِمْنَ ٢٠',
        frontier: { min: 0, max: 20, numeral: 20, ops: ['sub'], signs: ['−'], displays: ['ten-frame', 'two-frames', 'numeral'] },
        skills: ['sub|20|solve'],
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
    id: 'final',
    after: 'stage8',
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

/** محطاتُ الرحلة كلُّها بالترتيب (بلا البوابات) — مادّةُ `check_range.py`. */
export function stations() {
  return STAGES.flatMap((stage) => stage.stations.map((station) => ({
    ...station,
    id: `${station.type}:${station.part}`,
    stage: stage.id,
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
