// **حلقةُ المحطة** — الهيكلُ المشترك لشاشات تمارين «اِحْسِبْ» (`METHOD.md §٤`).
//
// ————— أربعُ خطوات لا ثالثةَ لها بينها —————
//
//   ١) **شاهِدْ**    نمذجةٌ بلا مطالبة: كميةٌ تُعَدّ أمامه عنصراً عنصراً بالصوت.
//   ٢) **جَرِّبْ مَعِي** جولتان بعونٍ مرئيّ — **غيرُ مقيستين في ليتنر** (نصُّ §٤:
//      «وحدك … وهي المقيسة»)، فلا يُحاسَب الطفلُ على خطوةِ تعلُّمٍ بعون.
//   ٣) **وَحْدَكْ**   أربعُ جولاتٍ إلى ستّ مستقلّة — وهي المقيسة وحدَها.
//   ٤) **كافِئْ**    نجومٌ بعتبةٍ **متناسبة مع طول النشاط** واحتفالٌ قصير.
//
// ————— وثلاثةُ عهودٍ يفرضها هذا الملفّ على كل شاشةٍ تركبه —————
//
// أ) **لا رمزَ عدديّ على الشاشة** (`METHOD.md §٣` المرحلة ١: «لا رمز عددي واحد على
//    الشاشة في هذه المرحلة كلها»): فلا `arNum` في شيءٍ يراه الطفل هنا — لا في نقاط
//    الجولات ولا في شريط الخطوات ولا في عدّادٍ. والجولاتُ **خرزاتٌ تمتلئ** لا أرقام،
//    والخطواتُ **أسماؤها** لا أعدادُها. ويحرسه فحصٌ في `browser_test.html` يجرد النصَّ
//    المعروض على شاشة محطةٍ حيّة.
// ب) **معالجةُ الخطأ واحدة**: الخيارُ الخاطئ **لا ينقل** — هزّةٌ ثم **تُعَدّ الكميةُ
//    المعنية أمامه عنصراً عنصراً** (`countAloud`) ثم يحاول ثانية. ولا تلقينَ للصواب
//    **قبل** المحاولة، ولا شاشةَ خطأ ولا عقاب.
// ج) **الشاشةُ لا تدّعي عدداً**: جوابُ كل تمرينٍ يُقرأ من **ما رسمه المصيِّر فعلاً**
//    (`drawn` في `render.js`) لا من العدد الذي طُلب — فلو أسقط رسّامٌ عنصراً لَما صار
//    التمرينُ كاذباً على الطفل. وهو امتدادُ عقد الجلسة ٢ إلى شاشات الجلسة ٣.
//
// ————— وحقنُ المراجعة يقع هنا مرّةً واحدة —————
//
// `review.js` **هيكلٌ لا يعرف تمريناً** (`SEED.md §٧.٢`)، ومادّتُه تُحقَن بـ`setBuilders`.
// وهي تُحقَن **مرّةً**، فلو نادتها كلُّ وحدةِ تمارينٍ لَمحت الثانيةُ الأولى. فهذا الملفّ
// يحقن **موزِّعاً** يقرأ سجلَّ التمارين أدناه، وتسجّل كلُّ وحدةٍ تمارينَها فيه
// (`registerExercise`) — فوحدةُ الجلسة ٤ تدخل المراجعةَ بلا سطرٍ يُعدَّل هنا.

import * as progress from './progress.js';
import * as audio from './audio.js';
import { stations } from './curriculum.js';
import { paint, spotStyle, spanStyle } from './render.js';
import { setBuilders } from './review.js';
import {
  h, icon, go, topbar, starsRow, mascot, cheer, toast, shuffle, arNum, landmark, DEV,
} from './ui.js';

// ————— إيقاعُ الشاشة (بالمللي ثانية) — لا مؤقّتَ ضغطٍ في أيٍّ منها —————

/** فاصلُ العدّ بين عنصرٍ وعنصر: يُسمَع الاسمُ ويُرى التعليم. */
export const BEAT = 620;
/** مهلةُ العرض الخاطف في «كم ترى؟» — **طبيعةُ تمرينٍ لا مؤقّتُ ضغط** (`METHOD.md §٢.٧`):
 *  تمنع العدَّ فتُجبِر التقدير، وتُعاد بنقرةٍ **بلا حدٍّ ولا احتساب**. */
export const FLASH_MS = 1200;
/** فاصلُ الانتقال بعد الصواب — أثرٌ يُرى قبل الجولة التالية. */
export const AFTER_RIGHT_MS = 780;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ————— أسماءُ الأعداد: **العدُّ المجرد فقط** (ق٢ · `METHOD.md §٨`) —————
//
// «واحد، اثنان، ثلاثة…» موحّداً في كل التمارين، **ولا يُنطَق معدودٌ مقروناً بعددٍ
// أبداً**. و**«صِفْرْ» دخل مع محطته ٣·٨** (الجلسة ٤ — والصفرُ متأخرٌ عمداً،
// `METHOD.md §٢.٦`) — فلا نصَّ يُصفّ قبل أن تحتاجه شاشة.
//
// **وموضعُ الصفر أوّلُ الجدول ولا يُعَدّ به**: `countAloud` تبدأ من الاسم الأول
// (`NUMBER_NAME[1]`) فلا يُنطَق «صفر» على عنصرٍ مرسوم — وإنما يُنطَق **اسماً لكمّية
// «لا شيء»** في محطته وحدَها، وهو عينُ ما تُقدِّمه.
//
// **وأسماءُ ١١–٢٠ دخلت مع المرحلة ٧** (الجلسة ٧): وهي أسماءٌ **تُقال ولا تُعَدّ بها
// آحاد** — نصُّ `METHOD.md §٢.٢` المعتمد أنّ ما فوق العشرة **يُبنى** حزمةً وآحاداً
// ولا يُعَدّ فرادى (`COUNT_MAX`). فموضعُ نطقها ثلاثةٌ لا رابع: **العدُّ فوق الحزمة**
// («عَشَرَة… أَحَدَ عَشَرْ، اثْنَا عَشَرْ»)، و**النزولُ عبرها** في الطرح، و**اسمُ ما
// بُني** عند كشفه. ولا يُمشى بها على عشرين عنصراً واحداً واحداً.
//
// **وصيغتُها صيغةُ العدّ المجرد** (لا معدودَ معها): «أَحَدَ عَشَرْ» لا «إحدى عشرة».

export const NUMBER_NAME = {
  0: 'صِفْرْ',
  1: 'وَاحِدْ',
  2: 'اِثْنَانْ',
  3: 'ثَلَاثَةْ',
  4: 'أَرْبَعَةْ',
  5: 'خَمْسَةْ',
  6: 'سِتَّةْ',
  7: 'سَبْعَةْ',
  8: 'ثَمَانِيَةْ',
  9: 'تِسْعَةْ',
  10: 'عَشَرَةْ',
  11: 'أَحَدَ عَشَرْ',
  12: 'اِثْنَا عَشَرْ',
  13: 'ثَلَاثَةَ عَشَرْ',
  14: 'أَرْبَعَةَ عَشَرْ',
  15: 'خَمْسَةَ عَشَرْ',
  16: 'سِتَّةَ عَشَرْ',
  17: 'سَبْعَةَ عَشَرْ',
  18: 'ثَمَانِيَةَ عَشَرْ',
  19: 'تِسْعَةَ عَشَرْ',
  20: 'عِشْرُونْ',
};

/**
 * جملُ الحلقة نفسِها (نمذجةٌ واحتفال) — تعليماتُ كل تمرينٍ في وحدته.
 *
 * **وجملُ الكشف الثلاثُ هنا لا في وحداتها** (حكمُ المدير، مراجعة الجلسة ٤ البند ٥):
 * «وَهَذَا رَمْزُهَا» جملةُ **عرضٍ يُشاهَد** لا فعلٍ يُطلَب — نمذجةٌ بطبعها، ومسحةُ
 * الأداء تُسمَع في أذن طفل. **والفئةُ تُشتقّ من موضع النصّ ولا تُعدَّل بيد**
 * (`queue_texts.mjs`)، فنقلُها إلى فئتها **نقلُ موضعها**: جدولُ `SAY` ← `modeling`.
 * وهي فوق ذلك جملُ خطوة «شاهِدْ» التي يقولها `watchStep` أدناه (`model.reveal.say`)
 * — فموضعُها الصحيح جدولُ الحلقة، ومنطوقُها لوحدةٍ واحدةٍ أو لثلاث سواء.
 */
export const SAY = {
  watch: 'اُنْظُرْ وَعُدَّ مَعِي',
  withMe: 'الْآنَ جَرِّبْ مَعِي',
  alone: 'وَالْآنَ وَحْدَكْ',
  together: 'لِنَعُدَّهَا مَعًا',
  reveal: 'وَهَذَا رَمْزُهَا',
  revealPair: 'وَهَذَانِ رَمْزَاهُمَا',
  revealSpot: 'وَهَذَا مَوْضِعُهُ عَلَى الْخَطّ',
  // **كشفُ الشقّ** (المرحلة ٥): الكمّيةُ تُعَدّ ثم يُرى شقّاها — وهي جملةُ عرضٍ
  // تُشاهَد كأخواتها فوقها، فموضعُها هذا الجدولُ لا وحدةُ التمارين.
  revealSplit: 'وَتَنْشَقُّ إِلَى هَذَيْنِ الْجُزْأَيْنْ',
  revealRest: 'وَهَذَا مَا بَقِيَ لَهَا',
  // **كشفُ المرحلة ٨** (الجلسة ٧): النمطُ يُرى تامّاً، والمقادير تُقارَن، والمشهدُ
  // يُرتَّب — وثلاثتُها **عرضٌ يُشاهَد** لا فعلٌ يُطلَب، فموضعُها هذا الجدول.
  revealNext: 'وَهَذَا مَا يَأْتِي بَعْدَهْ',
  revealOrder: 'وَهَذَا تَرْتِيبُهَا مِنَ الْأَصْغَرِ إِلَى الْأَكْبَرْ',
  // **وكشفُ الزمن بلسانه** (الجلسة ٨ب): تسلسلُ البيضةِ والشروقِ ليس فيه أصغرُ
  // وأكبر — فالترتيبُ «من الأول إلى الآخر» بلفظ سؤال المحطة نفسِه.
  revealFirst: 'وَهَذَا تَرْتِيبُهَا مِنَ الْأَوَّلِ إِلَى الْآخِرْ',
  bravo: 'أَحْسَنْتْ',
  great: 'رَائِعْ',
};

/**
 * **كلُّ نصٍّ قد تنطقه هذه الوحدة** — يجرده `tools/check_speech.mjs` فيطالب له بملفٍّ
 * مولَّد أو مكاناً في `tools/audio_queue.json`. إعلانٌ لا استنتاج: نصٌّ يُنطَق ولا
 * يُعلَن هنا يسمعه الطفلُ بصوتٍ آليّ ولا يعرف أحدٌ أنّه فات.
 */
export const SPOKEN = [...Object.values(NUMBER_NAME), ...Object.values(SAY)];

/**
 * **قولٌ يُنتظَر**: يقف النصُّ في قناة الصوت (`audio.js`) ويُرجِع وعدَه — يتمّ بتمام
 * الكلام. فمن أراد أن يتكلّم ويمضي ناداها ومضى، **ومن أراد أن ينتقل انتظرها**.
 *
 * **بلاغُ الميدان ١** (`docs/FIELD.md §١`): كانت تُطلِق وتبتلع الوعد، فكان كلُّ تعاقبٍ
 * معلَّقاً بمهلاتٍ ثابتة — يدهس الملفَّ الأطولَ من مهلته، ويمضي بالشاشة فوق كلامٍ لم
 * يتمّ. والوعدُ هنا هو الإصلاح كلُّه: الطابورُ يمنع التراكب، وانتظارُه يمنع الدهس.
 */
export const say = (text) => (text ? audio.play(text) : Promise.resolve(false));

/**
 * **الانتقالُ بعد تمام الكلام** (م١·٢): تُقال كلمةُ الصواب **وتُنتظَر**، ثم يُرى الأثرُ
 * لحظةً، ثم يُنتقَل — فلا جولةَ تبدأ وكلمةُ سابقتها في الجوّ. وهي ختامُ كل تمرينٍ
 * أصاب فيه الطفل، فموضعُها الحلقةُ لا كلُّ شاشةٍ على حدة.
 */
export async function praiseThen(hooks, text = SAY.bravo) {
  await say(text);
  await wait(AFTER_RIGHT_MS);
  if (hooks.alive()) hooks.done();
}

// ————— المنهجُ يقول المدى: المهارةُ والمحطة —————

/**
 * **المدى عدداً إن كان عدداً، ونصّاً إن لم يكن** (الجلسة ٧) — **ومصدرُها `progress.js`**
 * (الجلسة ك): القاعدةُ واحدةٌ لقارئ المنهج وقارئ السجلّ، ولو كانت نسختين لَافترقتا
 * (وقد افترقتا فعلاً — القصةُ عند `spanOf` هناك).
 *
 * مفاتيحُ `METHOD.md §٦` مدياتُها عدديةٌ في المراحل ١–٧ (`numeral|٧|match`) و**وصفيةٌ
 * في المرحلة ٨** (`pattern|abab|extend` · `measure|length|pick`): فالنمطُ ليس له عددٌ
 * يُقاس عليه، وإنما **وجهٌ يُسمّى**. فلو رُدَّ كلُّ مدىً عدداً لصار مدى النمط `NaN`
 * ولانفصل مفتاحُ ليتنر عن نفسِه صامتاً — يُسجَّل `pattern|NaN|extend` ولا يُسأل عنه أبداً.
 */
const spanOf = progress.spanOf;

/** مفتاحُ ليتنر الذي تدرّسه هذه المحطة بهذا (المفهوم × نوع التمرين) — أو `null`. */
export function skillOf(station, concept, kind) {
  const key = (station.skills || []).find((k) => {
    const [c, , t] = k.split('|');
    return c === concept && t === kind;
  });
  if (!key) return null;
  const [, range] = key.split('|');
  return { concept, range: spanOf(range), kind };
}

/**
 * **كلُّ مديات هذه المحطة** بهذا (المفهوم × نوع التمرين) — عدداً أو وصفاً.
 * وبها تدور محطةُ ٨·٢ على وجهَيها (`abc` ثم `aabb`) كما تدور محطةُ الرموز على رمزيها:
 * ما تدرّسه المحطةُ **هو ما أعلنته**، وشاشتُها تسأل عنه وحدَه.
 */
export function facesOf(station, concept, kind) {
  return (station.skills || [])
    .map((key) => key.split('|'))
    .filter(([c, , t]) => c === concept && t === kind)
    .map(([, range]) => spanOf(range));
}

/**
 * **المديات التي تدرّسها هذه المحطة** بهذا (المفهوم × نوع التمرين) — مقروءةً من
 * مفاتيح المنهج لا مكتوبةً في شاشة. وعليها تقوم المرحلة ٣: مفتاحٌ **لكل رمز**
 * (`numeral|٦|match` و`numeral|٧|match` — `METHOD.md §٦`)، فما تدرّسه المحطةُ هو
 * ما أعلنته، وشاشتُها تسأل عنه وحدَه.
 */
export function rangesOf(station, concept, kind) {
  return (station.skills || [])
    .map((key) => key.split('|'))
    .filter(([c, , t]) => c === concept && t === kind)
    .map(([, range]) => Number(range))
    .filter((n) => Number.isInteger(n));
}

/** محطةٌ بمعرّفها من المنهج (`curriculum.js` وحدَه يملك الرحلة). */
export const stationById = (id) => stations().find((s) => s.id === id) || null;

/**
 * **معلمُ ميدالية هذه المحطة** — معلمُ مرحلتها كما تعلنه بيانات المنهج (`mark`).
 *
 * (حكمُ المدير على مقترح الجلسة هـ — `REVIEW_IDENTITY.md §٤`): كانت الميداليةُ
 * أيقونةَ واجهةٍ محايدة (`party`) بينما اقرأ تضع في ميداليتها **بطلَ عالمها** — الحرفَ
 * الذي تعلّمه الآن — ولعالمنا ثمانيةُ معالمَ تعلنها المراحلُ بأنفسها. فتحملُه
 * الميداليةُ **بياناً لا يداً**: لا اسمَ معلمٍ مكتوبٌ في شاشة، ولا جدولَ ثانٍ يفترق
 * عن الخريطة — وحارسُه في `test_journey.mjs` يمشي العقدَ فيسأل كلَّ واحدةٍ عن معلمها.
 */
export const medalOf = (id) => stationById(id)?.mark || null;

/**
 * المحطةُ التي تُبنى منها مادّةُ مهارةٍ في المراجعة.
 *
 * تُطلَب أولاً بمفتاحها التامّ (فيُبنى التمرينُ على جبهة المحطة التي تدرّسه فعلاً)،
 * وإلّا فأوّلُ محطةٍ تدرّس نوعَ التمرين نفسَه — ومنها يأتي المدى. والثانيةُ ليست
 * تساهلاً: بها تُجيب المراجعةُ عن مهارةٍ سُجِّلت بمدىً لا محطةَ له اليوم بدل أن تصمت.
 */
export function stationForSkill(skill) {
  const all = stations();
  const exact = all.find((s) =>
    (s.skills || []).includes(`${skill.concept}|${skill.range}|${skill.kind}`));
  return exact || all.find((s) =>
    (s.skills || []).some((k) => k.split('|')[2] === skill.kind)) || null;
}

// ————— جردُ ما تستهلكه الجولة (البابان ٤+٥ في `check_range.py`) —————

/**
 * **كلُّ شكلٍ سيُرسَم في الجولة** — الهدفُ والخيارات والنموذج **وما يُكشَف بعد العدّ**
 * (`reveal` في حلقة تقديم الرمز): فالجردُ يقرأ ما سيراه الطفل لا ما نوى المولّد.
 */
export const figuresOf = (round) => [...(round.figures || []), ...(round.reveal?.figures || [])];

/**
 * **ما تستعمله جولةٌ واحدة، بالصنف** — يقابله الحارسُ بجبهة محطتها.
 *
 * و`extra` لِما يبلغه عددٌ **بيد الطفل** ولم يُرسَم ابتداءً (حدّا «اجعلهما سواء»).
 *
 * **والرمزُ يُجرَد من نمطه لا من نيّة الشاشة** (الجلسة ٤): كلُّ شكلٍ نمطُه `numeral`
 * رمزٌ معروض، وكلُّ خطِّ أعدادٍ يكتب أرقامَ مرساته حتى مداه — فيقابلهما الحارسُ بـ
 * `numeral` في الجبهة (أقصى رمز)، لا بأقصى الكمّ. و`numerals` في الجولة لِما زاد.
 */
export const usedOf = (round) => {
  const figures = figuresOf(round);
  return {
    numbers: [...new Set([...figures.map((f) => f.count), ...(round.extra || [])])],
    numerals: [...new Set([
      ...figures.filter((f) => f.display === 'numeral' || f.display === 'line')
        .map((f) => f.count),
      /* **ومادّةُ الشريط رموزٌ حيث كانت أعداداً** (النمطُ العدديّ — الجلسة ك): خانةٌ
         تكتب العشرين رمزٌ معروض كبطاقةٍ تكتبه — فتُجرَد بمسطرة الرمز (`numeral` في
         الجبهة). ولولا ذلك لمرّ شريطٌ يقفز إلى العشرين في محطةٍ جبهتُها العشرة ولا
         يشتكي حارس: عددُ الشريط طولُه لا مادّتُه، فلا يمسكه جردُ الأعداد. */
      ...figures.flatMap((f) => (f.items || []).filter((v) => Number.isInteger(v))),
      ...(round.numerals || []),
    ])],
    // **والعمليةُ ورمزُها من إعلان الجولة** (المرحلة ٦): الجولةُ تعلن ما تفعل (`ops`)
    // وما تعرض من علاماتٍ (`signs`) — **والعلامةُ مقروءةٌ من جبهة محطتها** لا مكتوبةً
    // في شاشة، فمحطةُ ٦·١ «آلةُ الجمع بلا رمز» تفعل ولا تعلن علامةً، ويسقط في
    // `check_range.py` كلُّ رمزٍ خرج عن جبهته.
    ops: [...new Set(round.ops || [])],
    signs: [...new Set(round.signs || [])],
    displays: [...new Set(figures.map((f) => f.display))],
    // **ومشاهدُ الأشياء تُجرَد برموزها ووجهِها** (الجلسة ٨ب): كلُّ مشهدٍ سيُرسَم
    // (`items`) مع وجه جولته (`range` — ثِقَلٌ أو زمن)، فيفرض `check_range.py` أنّ
    // لكلِّ رمزٍ رتبةً معلَنة في `SCENES` ولا رتبتين متساويتين في سؤالٍ واحد.
    scenes: figures.filter((f) => f.display === 'scene' && f.items)
      .map((f) => ({ face: round.range, items: [...f.items] })),
  };
};

// ————— أدواتُ التوليد: حتميةٌ ببذرة، ومشتّتاتٌ متجاورة —————

/** الأعدادُ من `a` إلى `b` — حوضُ الجولة، ومصدرُه **جبهةُ المحطة** لا رقمٌ مكتوب. */
export const span = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/**
 * **المشتّتاتُ أعدادٌ متجاورة** (`METHOD.md §٣`: «أمام ٣: ٢ و٤ لا ١ و٥») — يقدّر الطفل
 * ولا يخمّن. وهي قاعدةُ أحواض الخيارات في الرحلة كلها، فموضعُها هنا لا في شاشةٍ بعينها.
 * وما ضاق حوضُه (١–٢) يعطي خياراتٍ أقلّ — ولا يُخرَج عن الجبهة لتكميل عدد.
 */
export function nearOptions(target, pool, wanted, rnd) {
  const near = [];
  for (let d = 1; d <= pool.length && near.length < wanted; d++) {
    for (const c of shuffle([target - d, target + d], rnd)) {
      if (c !== target && pool.includes(c) && !near.includes(c)) near.push(c);
    }
  }
  return near.slice(0, wanted);
}

/** بذرةٌ جديدة لكل شكل — من مولّد الجولة نفسِه، فتُعاد الجولةُ كما كانت. */
export const seeder = (rnd) => () => Math.floor(rnd() * 0xffffffff);

// ————— الأشكال: بطاقةُ كميةٍ وطبقةُ لمس —————

/**
 * شكلُ كميةٍ جاهزٌ للشاشة: **العددُ يُقرأ من المصيِّر لا من الطلب**.
 * `drawn` هو ما رُسِم فعلاً (`[data-mark]` في `render.js`)، وعليه تقوم أجوبةُ التمارين.
 */
export function figureOf(spec) {
  /* **وما سوى النمطِ والعدد يمرّ إلى المصيِّر كما هو** (إصلاحُ الجلسة ٧): كانت هذه
     الدالّة **تُعدِّد** ما تمرّره (بذرةً ورمزاً وشقّاً)، فلمّا كسب المصيِّرُ خيارَين
     جديدين (`items` مادّةُ شريط النمط · `ranks` رتبُ مشهد القياس) **سقطا في الطريق
     صامتين**: تُبنى الجولةُ بمادّتها ويُرسَم الشكلُ بالافتراضيّ — فيُعَدّ نمطٌ غيرُ
     الذي وُلِّد. ولا يمسكه حارسُ المصيِّر (يقيس ما رُسِم بما طُلب منه هو، وقد اتّفقا)،
     وإنما أمسكه حارسُ المتصفّح: **بطاقاتُ الجواب ليس فيها ما رسمه الشريط**.
     فصار التمريرُ **بالباقي** لا بالتعداد — فخيارٌ جديد يصل من تلقائه. */
  const { display, count, upTo, ...opts } = spec;
  const { el, drawn, plan } = paint(display, count, opts);
  return {
    el,
    drawn,
    plan,
    // **والشقُّ يُقرأ من الرسم كما يُقرأ العدد** (`data-split` في `render.js`): عددُ ما
    // وُسِم بالشقّ الأول **فعلاً** — وعليه يقوم جوابُ الطرح («كم بقي؟» = ما لم يُزَل)،
    // فلا تدّعي شاشةٌ بقيّةً لم تبقَ على الشاشة.
    split: el.dataset.split === undefined ? null : Number(el.dataset.split),
    // حدُّ العدّ على خطّ الأعداد إن كان الشكلُ خطّاً (`countAloud`)
    upTo,
    marks: [...el.querySelectorAll('[data-mark]')],
    // علاماتُ خطّ الأعداد — تُقرأ من الرسم نفسِه ليُعَدَّ عليها أمام الطفل
    ticks: [...el.querySelectorAll('[data-tick]')],
    // **خاناتُ الإطار كلُّها** — والفارغةُ منها جزءٌ من المعنى («كم بقي للعشرة؟»،
    // المرحلة ٥): تُقرأ من الرسم فيُعَدّ عليها أمام الطفل، ومنها سَعةُ الإطار.
    cells: [...el.querySelectorAll('[data-cell]')],
  };
}

/** صندوقٌ يحمل الشكلَ وتسكن فوقه طبقةُ اللمس (الشكلُ نفسُه يبقى `aria-hidden`). */
export function figureBox(spec, className = '') {
  const fig = figureOf(spec);
  const box = h('div', { class: `q-figure ${className}`.trim() }, fig.el);
  return { ...fig, box };
}

/**
 * **بطاقةُ اختيار** — صانعٌ واحد لكل بطاقات الأجوبة في الرحلة، ومادّتُها من المصيِّر
 * وحدَه: `drawn` هو ما رُسِم فعلاً، وعليه يقوم الحكم.
 */
function cardOf(spec, { onclick, label, className = '' }) {
  const fig = figureOf(spec);
  const btn = h('button', {
    class: `qcard ${className}`.trim(), 'aria-label': label, onclick,
  }, fig.el);
  return { btn, drawn: fig.drawn, marks: fig.marks, plan: fig.plan };
}

/**
 * **بطاقةُ اختيارٍ كمّية** — الجوابُ في المرحلتين ١–٢ **اختيارُ كمّ لا رمز**
 * (`METHOD.md §٣`): يطابق الطفلُ كمّاً بكمّ، فلا رقمَ على زرٍّ ولا تحت صورة.
 */
export const quantityCard = (spec, opts) => cardOf(spec, opts);

/**
 * **بطاقةُ اختيارٍ رمزية** — ومن المرحلة ٣ فصاعداً وحدَها (`METHOD.md §٣`): الرمزُ
 * تسميةٌ لكمٍّ عبر بوابتَي الكمّ والعدّ، فلا تظهر هذه البطاقةُ في شاشةٍ قبل موضعها.
 * وهي بطاقةُ المصيِّر نفسِها (`numeral`)، فرقمُها **مقروءٌ من الرسم** لا مكتوبٌ هنا.
 */
export const numeralCard = (value, seed, opts) =>
  cardOf({ display: 'numeral', count: value, seed }, { ...opts, className: 'qcard--numeral' });

/**
 * **طبقةُ اللمس**: زرٌّ شفّافٌ فوق كل عنصرٍ مرسوم، موضعُه من `spotStyle` في المصيِّر
 * نفسِه — فلا يُحسَب موضعُ العنصر مرّتين ولا يلمس الطفلُ فراغاً.
 *
 * وهي **زرٌّ حقيقيّ** (`<button>`) لا مستمعٌ على شكل: بها يجرد حارسُ هدف اللمس في
 * `browser_test.html` عناصرَ العدّ من تلقائه (وعدُ `DESIGN.md §٥`).
 */
export function touchLayer(fig, onTap) {
  const layer = h('div', { class: 'fig-taps' });
  const taps = fig.plan.marks.map((mark, i) => {
    const btn = h('button', {
      class: 'fig-tap',
      css: spotStyle(mark, fig.plan.view),
      'aria-label': 'عُدَّ هَذَا',
      onclick: () => onTap(i, btn),
    });
    layer.append(btn);
    return btn;
  });
  fig.box?.append(layer);
  return { layer, taps };
}

/**
 * **طبقةُ خانات خطّ الأعداد**: زرٌّ فوق مواضعَ بعينها من الخطّ، مقاسُه ومكانُه من
 * `slots` في المصيِّر نفسِه — فلا يُحسَب موضعُ الخانة مرّتين.
 *
 * **والخياراتُ مواضعُ متجاورة لا الخطُّ كلُّه** (`METHOD.md §٣`: «المشتّتات أعدادٌ
 * متجاورة»): وهي قاعدةُ أحواض الخيارات نفسُها مطبَّقةً على المواضع — يقدّر الطفلُ
 * موضعاً بين موضعين ولا يخبط في إحدى عشرة خانة، وتبقى الخانةُ واسعةً تبلغ هدفَ اللمس.
 *
 * **والقيمةُ تُقرأ من الزرّ المرسوم** (`data-value`) لا من متغيّرٍ في الإغلاق — امتدادُ
 * عقد «الجوابُ من المرسوم» إلى المواضع.
 */
export function slotLayer(fig, values, onTap) {
  const layer = h('div', { class: 'fig-slots' });
  const wanted = new Set(values);
  const slots = fig.plan.slots.filter((s) => wanted.has(s.value)).map((slot) => {
    const btn = h('button', {
      class: 'fig-slot',
      css: spanStyle(slot, fig.plan.view),
      'data-value': String(slot.value),
      'aria-label': 'هَذَا المَوْضِع',
      onclick: () => onTap(Number(btn.dataset.value), btn),
    }, h('span', { class: 'fig-pin', 'aria-hidden': 'true' }));
    layer.append(btn);
    return btn;
  });
  fig.box?.append(layer);
  return { layer, slots };
}

/**
 * **يَعُدّ على خطّ الأعداد أمام الطفل** — معالجةُ الخطأ في شاشات الخطّ: تُضاء العلامةُ
 * بعد العلامة من الصفر إلى الموضع الصحيح مع اسم كل عدد، فيرى الصوابَ **عدّاً** لا
 * تلقيناً (`METHOD.md §٤`) — والخطُّ نفسُه هو المسطرة.
 */
export async function countAlongLine(fig, upTo, alive = () => true) {
  for (const tick of fig.ticks) tick.classList.remove('is-counted');
  for (const tick of fig.ticks) {
    const value = Number(tick.dataset.value);
    if (value > upTo) break;
    if (!alive()) return false;
    tick.classList.add('is-counted');
    // **العلامةُ تُضاء ثم يُنتظَر اسمُها ثم الفاصل** — فلا يسبق العدُّ المرئيُّ الصوتَ
    if (value > 0) await say(NUMBER_NAME[value]);
    if (!alive()) return false;
    await wait(BEAT);
  }
  return alive();
}

/** إزالةُ أثر العدّ عن علامات الخطّ. */
export const clearLine = (fig) => {
  for (const tick of fig.ticks) tick.classList.remove('is-counted');
};

/**
 * **يَعُدّ خاناتِ الإطار الفارغةَ أمام الطفل** — معالجةُ الخطأ في «كم بقي للعشرة؟»
 * (`METHOD.md §٣` — ٥·٥ و٥·٦): الخانةُ الفارغة **مكانٌ يُرى** لا عدمٌ يُتخيَّل، فتُضاء
 * واحدةً بعد واحدة باسمها فيرى الطفلُ الجوابَ **عدّاً** لا تلقيناً (`METHOD.md §٤`).
 *
 * ويبدأ العدُّ من الواحد على أوّل خانةٍ فارغة: المقيسُ **ما بقي** لا ما امتلأ.
 */
export async function countCells(fig, alive = () => true) {
  const empty = fig.cells.slice(fig.drawn);
  for (const cell of empty) cell.classList.remove('is-counted');
  for (const [i, cell] of empty.entries()) {
    if (!alive()) return false;
    cell.classList.add('is-counted');
    await say(NUMBER_NAME[i + 1]);
    if (!alive()) return false;
    await wait(BEAT);
  }
  return alive();
}

/** إزالةُ أثر العدّ عن خانات الإطار. */
export const clearCells = (fig) => {
  for (const cell of fig.cells) cell.classList.remove('is-counted');
};

/**
 * **يَعُدّ الكميةَ أمام الطفل عنصراً عنصراً** — قلبُ معالجة الخطأ (`METHOD.md §٤`):
 * يرى الصوابَ **عدّاً** لا تلقيناً. ويُستعمَل في «شاهِد» نمذجةً وفي الخطأ تصحيحاً.
 *
 * @param {object[]} figures أشكالٌ تُعَدّ بالتتابع (المقارنةُ تَعُدّ الطرفين)
 * @param {() => boolean} alive «أما زالت هذه الجولة هي الجارية؟» — فلا يعدّ بعد انتقال
 */
export async function countAloud(figures, alive = () => true) {
  for (const fig of figures) {
    for (const mark of fig.marks) mark.classList.remove('is-counted');
    clearLine(fig);
  }
  for (const fig of figures) {
    // **وخطُّ الأعداد يُعَدّ عليه لا فيه**: لا عناصرَ له تُعَدّ، وإنما مواضعُ تُقطَع
    // واحداً بعد واحد — و`upTo` يحدّ المشيَ عند الموضع المقصود (`METHOD.md §٣` — ٤·٢).
    if (!fig.marks.length && fig.ticks.length) {
      if (!(await countAlongLine(fig, fig.upTo ?? Infinity, alive))) return false;
    }
    for (const [i, mark] of fig.marks.entries()) {
      if (!alive()) return false;
      mark.classList.add('is-counted');
      // **العنصرُ يُعلَّم ثم يُنتظَر اسمُه ثم الفاصل** (`BEAT` فاصلٌ **بين** الجمل لا
      // بديلٌ عن انتظارها): فيقع الاسمُ على معدوده تماماً، ولا يدهس اسمٌ اسماً.
      await say(NUMBER_NAME[i + 1]);
      if (!alive()) return false;
      await wait(BEAT);
    }
    if (!alive()) return false;
    await wait(BEAT / 2);
  }
  return true;
}

/**
 * **يَعُدّ عناصرَ بعينها من شكلٍ مرسوم، ولكلٍّ اسمُه** — قلبُ «يُعَدّ أمامه» في
 * العمليات (`METHOD.md §٣` المرحلة ٦).
 *
 * وعلّةُ كونها **واحدة**: عدُّ المرحلة ٦ ثلاثةُ أوجهٍ في المنهج — **تصاعديٌّ من الأكبر**
 * (٦·٤: «سبعة… ثمانية، تسعة»)، و**تنازليٌّ** في الطرح (٦·٥)، و**عدُّ الفرق** في
 * المقارنة (٦·٦) — وهي في الفعل مشيٌ واحدٌ على عناصرَ مرسومة يختلف فيه **أيُّها يُمشى
 * عليه** و**أيُّ اسمٍ يُنطَق عند كلٍّ**. فلا ثلاثُ آلياتٍ تفترق يوماً في الانتظار
 * والإسكات، وإنما اثنان يُمرَّران.
 *
 * @param {Element[]} marks عناصرُ الرسم بترتيب العدّ — **من الـDOM لا من عددٍ مطلوب**
 * @param {(i: number) => number} name العددُ الذي يُنطَق عند العنصر رقم `i`
 * @param {() => boolean} alive «أما زالت هذه الجولة هي الجارية؟»
 * @param {string} cls الصنفُ الذي يُعلَّم به المعدود
 */
export async function countMarks(marks, name, alive = () => true, cls = 'is-counted') {
  for (const [i, mark] of marks.entries()) {
    if (!alive()) return false;
    mark.classList.add(cls);
    // **العنصرُ يُعلَّم ثم يُنتظَر اسمُه ثم الفاصل** — كعدّ الكميات سواءً بسواء
    await say(NUMBER_NAME[name(i)]);
    if (!alive()) return false;
    await wait(BEAT);
  }
  return alive();
}

/** إزالةُ أثر العدّ (قبل إعادة العرض). */
export const clearCount = (fig) => {
  for (const mark of fig.marks) mark.classList.remove('is-counted');
};

// ————— نجومُ المحطة —————

/**
 * ٣ بلا خطأ · ٢ بعتبةٍ **متناسبة مع طول النشاط** («زلّة لكل جولتين») · ١ سواها.
 * وهي قاعدةُ `METHOD.md §٤` حرفاً — لا عددٌ مطلق يظلم الطويلَ ويسامح القصير.
 */
export const starsForStation = (errors, rounds) =>
  (errors === 0 ? 3 : errors <= Math.ceil(rounds / 2) ? 2 : 1);

// ————— شاشةُ المحطة —————

const PHASES = [
  { key: 'watch', name: 'شَاهِدْ' },
  { key: 'guided', name: 'جَرِّبْ مَعِي' },
  { key: 'solo', name: 'وَحْدَكْ' },
];

/**
 * @param {object} o
 * @param {string} o.nodeId  معرّف العقدة (`<النوع>:<الجزء>`) — **الشاشةُ المالكةُ تكتب
 *   نجمتَه بمعرّفه هو** (`save`)، وهو عينُ ما يحرسه `test_nodes.mjs`.
 * @param {string} o.title   عنوانُ المحطة كما في المنهج
 * @param {string} o.accent  لونُ المرحلة
 * @param {() => object} o.make  بناءُ خطة الجولات — **يُنادى في كل إعادة**، فلا نمطَ
 *   يُحفَظ فيُستظهَر. يُرجِع `{model, guided, solo}`.
 * @param {Function} o.view  `(round, hooks) => Node` — مُصيِّرُ الجولة الواحدة
 * @param {Function} o.score `(round, correct) => void` — تسجيلُ محاولةٍ في ليتنر
 * @param {Function} o.save  `(stars) => void` — كتابةُ نجمة العقدة
 */
export function stationScreen({ nodeId, title, accent, make, view, score, save }) {
  let plan = make();
  const state = { phase: 0, index: 0, errors: 0, done: false, token: 0 };

  const stepsBar = h('ol', { class: 'steps' });
  const beads = h('ol', { class: 'beads' });
  const body = h('div', { class: 'station-body' });

  const phases = PHASES.filter((p) => p.key === 'watch' || plan[p.key].length);
  const rounds = () => (phases[state.phase].key === 'watch' ? [] : plan[phases[state.phase].key]);

  function paintSteps() {
    stepsBar.replaceChildren(...phases.map((p, i) => h('li', {
      class: `step${!state.done && i === state.phase ? ' step--now' : ''}`
        + `${state.done || i < state.phase ? ' step--done' : ''}`,
    },
      // **علامةٌ لا رقم**: لا رمزَ عدديّ على شاشة المرحلة ١ (`METHOD.md §٣`)
      h('span', { class: 'step-dot', 'aria-hidden': 'true' },
        state.done || i < state.phase ? '✓' : '●'),
      h('span', { class: 'step-name' }, p.name),
    )));
  }

  /** خرزاتُ الجولات — تمتلئ واحدةً واحدة، **بلا رقمٍ واحد** (عهد أ أعلاه). */
  function paintBeads() {
    const list = rounds();
    beads.replaceChildren(...list.map((_, i) => h('li', {
      class: `bead${!state.done && i === state.index ? ' bead--now' : ''}`
        + `${state.done || i < state.index ? ' bead--done' : ''}`,
      'aria-label': i < state.index ? 'جولةٌ تمّت' : 'جولة',
    })));
    beads.hidden = list.length === 0;
  }

  const hooks = () => {
    const token = state.token;
    const measured = phases[state.phase].key === 'solo';
    return {
      measured,
      alive: () => token === state.token,
      /** محاولةٌ واحدة — **المقيسُ «وحدك» وحدَه** (`METHOD.md §٤`). */
      attempt: (round, correct) => {
        if (!measured) return;
        score(round, correct);
        if (!correct) state.errors++;
      },
      done: () => { if (token === state.token) advance(); },
    };
  };

  /**
   * @param {boolean} silence أيُفرَغ طابورُ الصوت قبل الرسم؟ نعم في كل انتقالٍ يقطعه
   *   الطفلُ بنقرته (م١·٣) — **ولا** حين يكون الانتقالُ نفسُه قد صفَّ جملتَه أولاً
   *   (إعلانُ الخطوة أدناه): وإلّا أفرغ الرسمُ ما صفَّه المُعلِن قبله بسطر.
   */
  function paint(silence = true) {
    if (silence) audio.stop();
    state.token++;
    paintSteps();
    paintBeads();
    const phase = phases[state.phase];
    body.replaceChildren(phase.key === 'watch'
      ? watchStep(plan.model, hooks())
      : view(plan[phase.key][state.index], hooks()));
  }

  function advance() {
    const list = rounds();
    if (state.index < list.length - 1) {
      state.index++;
      paint();
      return;
    }
    if (state.phase < phases.length - 1) {
      state.phase++;
      state.index = 0;
      /* **إعلانُ الخطوة ثم سؤالُها، في قناةٍ واحدة**: يُسكَت ما مضى **مرّةً**، ثم
         يُصَفّ الإعلان، ثم يرسم `paint` بلا إسكاتٍ ثانٍ — فيقف سؤالُ الشاشة خلفه في
         الطابور. وهذا **موضعُ «الصوتين المتكرّرين»** الذي بلّغ عنه الميدان: كان
         الإعلانُ والسؤالُ يُطلَقان في اللحظة نفسِها، وكلٌّ يُسكت ما قبله **قبل أن
         يبدأ** — فلا يُسكت أحدُهما الآخر، ثم يعملان معاً. */
      audio.stop();
      say(phases[state.phase].key === 'solo' ? SAY.alone : SAY.withMe);
      paint(false);
      return;
    }
    finish();
  }

  /**
   * **خطوةُ «شاهِدْ»**: الكميةُ تُعَدّ أمامه بالصوت — نمذجةٌ **بلا مطالبة** (`METHOD.md §٤`).
   * ولا زرَّ «تابع» قبل أن ينتهي العدّ: الخطوةُ عرضٌ لا امتحان، ولا يُترك معلَّقاً بعده.
   *
   * **و`model.reveal` حلقةُ تقديم الرمز** (`METHOD.md §٣` المرحلة ٣): «كميةٌ معروضة ←
   * تُعدّ ← **يظهر الرمزُ فوقها** ← مطابقةٌ ذهاباً وإياباً». فالمكشوفُ لا يُعرَض قبل
   * العدّ بحالٍ — ترتيبُ الخطوتين **هو الدرس**: الرمزُ تسميةٌ لكمٍّ عُدّ للتوّ، ولو
   * ظهر معه لصار صورةً ثانيةً تُحفَظ. ويُعاد الكشفُ مع كل إعادة، فلا يبقى معلَّقاً.
   */
  function watchStep(model, api) {
    /* كميتان تُعَدّان في النمذجة (المقارنةُ والتسوية) تأخذان مقاسَ المقارنة لا مقاسَ
       البطل الواحد — وإلّا خرجت الثانيةُ عن الشاشة فلم يُرَ الطرفان معاً، وهو المقصود.

       **و`model.rows` تَرُصُّهما صفّاً تحت صفّ** (قيدُ إصلاح مراجعة الجلسة ٦): نمذجةُ
       «كم الفرق؟» تقول «نَعُدُّ مَا يَفْضُلُ فِي **الصَّفِّ الْأَعْلَى**»، وكانت تعرضهما
       **جنباً إلى جنب** — فالكلامُ لا يطابق العين، ولا صفَّ أعلى في الصورة أصلاً.
       والتحاذي صفّين **هو الدرس** (`METHOD.md §٤` المعتمد)، فتُرَصّ النمذجةُ كما
       تُرَصّ «وحدك» — لا يُبدَّل النصُّ ليوافق ما رُسِم. */
    const stage = h('div', {
      class: `q-stage${model.figures.length > 1 ? (model.rows ? ' q-rows' : ' q-pair') : ' q-hero'}`,
    });
    const shown = h('div', { class: 'q-reveal', hidden: true });
    const foot = h('div', { class: 'row foot' });
    const figures = model.figures.map((spec) => {
      const fig = figureBox(spec);
      stage.append(fig.box);
      return fig;
    });

    const run = async () => {
      foot.replaceChildren();
      shown.replaceChildren();
      shown.hidden = true;
      // **الدعوةُ تُسمَع تامّةً قبل أن يبدأ العدّ** — أوّلُ ما يسمعه الطفلُ عند الفتح
      await say(SAY.watch);
      if (!api.alive()) return;
      await wait(BEAT);
      /* **وعدُّ النمذجة درسُ المحطة نفسِه**: الأصلُ أن تُعَدّ الكميةُ عنصراً عنصراً من
         الواحد، ومحطةٌ درسُها **عدٌّ آخر** (تنازليٌّ في الطرح، وعدُّ الفرق في المقارنة —
         `METHOD.md §٣` المرحلة ٦) تمرّر عدَّها هي. فلا تُنمذَج بعدٍّ ليس درسَها. */
      if (!(await (model.count || countAloud)(figures, api.alive))) return;
      if (model.reveal) {
        shown.replaceChildren(...model.reveal.figures.map((spec) => figureBox(spec).box));
        shown.hidden = false;
        await say(model.reveal.say);
        if (!api.alive()) return;
        await wait(BEAT);
        if (!api.alive()) return;
      }
      foot.replaceChildren(
        h('button', { class: 'btn', onclick: run }, icon('repeat'), ' أَعِدْ'),
        h('button', { class: 'btn btn--primary next', onclick: api.done }, 'تَابِعْ ←'),
      );
    };
    run();

    // **والرمزُ يظهر فوقها** (`METHOD.md §٣` حرفاً): الرمزُ لافتةٌ فوق الكمّية لا سطرٌ
    // بعدها — فيقع بصرُ الطفل عليهما معاً، والأعلى تسميةٌ للأسفل.
    return h('div', {}, mascot('mascot mascot--hello'),
      h('h2', {}, model.title), h('p', { class: 'hint' }, model.hint), shown, stage, foot);
  }

  function finish() {
    audio.stop();
    state.done = true;
    state.token++;
    paintSteps();
    paintBeads();

    const stars = starsForStation(state.errors, plan.solo.length);
    const before = progress.getStars(nodeId);
    save(stars);
    say(state.errors === 0 ? SAY.great : SAY.bravo);

    const line = state.errors === 0 ? cheer('بلا خطأ واحد!')
      : state.errors <= Math.ceil(plan.solo.length / 2)
        ? 'أتممتَ المحطة — وزلّاتُك قليلة.'
        : 'أتممتَ المحطة، وبالإعادة تزيد نجومك.';

    /* **وفي الميدالية معلمُ المرحلة** (حكمُ المدير — `REVIEW_IDENTITY.md §٤`): بطلُ
       عالم العدّ في لحظة الاحتفال، مقروءاً من `mark` المعلَن لا مكتوباً هنا.
       و`icon('party')` تبقى **احتياطاً لا يقع**: معلمٌ لا رسمَ له يُحمِر حارسَ
       الرحلة قبل أن يصل إلى شاشة (فلا احتفالَ بلا وجه، ولا وجهٌ يُكتب بيد). */
    body.replaceChildren(h('div', { class: 'celebrate' },
      mascot('mascot mascot--cheer'),
      h('div', { class: 'celebrate-face' }, landmark(medalOf(nodeId)) || icon('party')),
      h('h2', {}, 'أَحْسَنْت!'),
      starsRow(stars, 'big-stars'),
      h('p', { class: 'hint' }, line),
      before > stars && h('p', { class: 'hint' }, 'ونجومُك السابقة محفوظة.'),
      h('div', { class: 'row foot' },
        h('button', { class: 'btn btn--primary', onclick: () => go('#/') }, '→ الخريطة'),
        h('button', {
          class: 'btn',
          onclick: () => {
            plan = make();       // إعادةٌ تبني جولاتِها من جديد — لا نمطَ يُستظهَر
            Object.assign(state, { phase: 0, index: 0, errors: 0, done: false });
            paint();
          },
        }, icon('repeat'), ' أَعِدْ'),
      ),
    ));
  }

  paint();

  return h('div', { class: 'screen station-screen', css: { '--accent': accent } },
    topbar(
      h('button', {
        class: 'btn',
        onclick: () => {
          if (state.done || (state.phase === 0 && state.index === 0)
            || confirm('تريد الخروج قبل إتمام المحطة؟')) go('#/');
        },
      }, '→ الخريطة'),
      h('span', { class: 'spacer' }),
      h('span', { class: 'pill' }, title),
    ),
    h('main', { class: 'screen-card' },
      stepsBar,
      beads,
      body,
      DEV && h('div', { class: 'dev' },
        h('div', { class: 'dev-title' }, 'أدوات التجربة (?dev=1)'),
        h('div', { class: 'dev-row' },
          h('span', {}, `الجولات: ${plan.solo.map((r) => r.kind).join('، ')}`),
          h('button', { class: 'btn', onclick: () => toast(`أخطاء: ${arNum(state.errors)}`) },
            'عدّ الأخطاء'),
          h('button', { class: 'btn', onclick: finish }, 'إنهاء المحطة الآن'),
        )),
    ),
  );
}

// ————— سِجلُّ التمارين وحقنُ المراجعة —————
//
// **موزِّعٌ واحد بدل حقنٍ متكرّر**: `setBuilders` تُحقَن مرّةً هنا، وكلُّ وحدةِ تمارين
// تسجّل أنواعَها في هذا السجلّ — فما دخل الرحلةَ دخل المراجعةَ والبواباتِ معه، ولا
// يفترق التمرينُ الذي يُدرَّس عن التمرين الذي يُراجَع.

// **ونوعُ التمرين ليس مالكاً وحيداً** (الجلسة ٥): مفتاحُ ليتنر ثلاثةٌ (مفهوم × مدى ×
// نوع تمرين)، و**النوعُ وحدَه قد يشترك فيه مفهومان** بنصّ `METHOD.md §٦`: `equal|5|make`
// (اجعلهما سواء — المرحلة ٢) و`bond|10|make` (أصدقاء العشرة — المرحلة ٥). فلو كان
// السجلُّ نوعاً ← وحدةً واحدة **لمحت الثانيةُ الأولى** بلا صوتٍ ولا فشل: تسقط تمارينُ
// «اجعلهما سواء» من المراجعة والبوابة معاً، ولوحةُ وليّ الأمر تحسبها مقيسة.
//
// فالسجلُّ نوعٌ ← **قائمةُ مالكين**، ويُسأل كلٌّ عن المهارة بدوره: مَن كانت محطتُها من
// أنواعه بناها، ومَن سواه ردّ `null` (وهو ما تفعله `single` في كل وحدة أصلاً). وأوّلُ
// بانٍ يجيب هو صاحبُها — والجوابُ يحمل **مالكَه** (`by`) فيرسمه مُصيِّرُه هو لا مُصيِّرُ
// شريكه في الاسم.

const EXERCISES = new Map();   // نوعُ التمرين ← [{ build, view }]

/**
 * تسجيلُ نوع تمرينٍ في المراجعة.
 * @param {string} kind  الحقلُ الثالث من مفتاح ليتنر (`METHOD.md §٦`)
 * @param {{build: Function, view: Function}} spec
 *   `build(skill, rnd)` يبني جولةً من محطةِ تلك المهارة **أو `null` إن لم تكن له**،
 *   و`view(round, hooks)` يرسمها.
 */
export function registerExercise(kind, spec) {
  EXERCISES.set(kind, [...(EXERCISES.get(kind) || []), spec]);
}

/** مالكو نوع تمرينٍ بترتيب تسجيلهم — للعدّة والتشخيص. */
export const exerciseOwners = (kind) => (EXERCISES.get(kind) || []).length;

/** تمرينُ مهارةٍ مستحقّة — يقرؤه محرّكُ المراجعة والبوابات معاً. */
function itemFor(skill, rnd = Math.random) {
  for (const [by, spec] of (EXERCISES.get(skill.kind) || []).entries()) {
    const round = spec.build(skill, rnd);
    if (round) return { ...round, by, id: `${round.kind}|${round.sig}` };
  }
  return null;
}

/**
 * حوضُ التنويع: تماريُن من **حصيلة الطفل** — محطاتٌ أتمّها فعلاً، ومهاراتُها التي
 * تدرّسها. فلا يُسأل في المراجعة عمّا لم يبلغه (نظيرُ «المفكوكية بالبناء» في اقرأ).
 */
function fillersOf(rnd = Math.random) {
  const out = [];
  for (const station of stations()) {
    if (!progress.isDone(station.id)) continue;
    for (const key of station.skills || []) {
      const [concept, range, kind] = key.split('|');
      if (!EXERCISES.has(kind)) continue;
      out.push(() => itemFor({ concept, range: Number(range), kind }, rnd));
    }
  }
  return shuffle(out, rnd);
}

/** مُصيِّرُ تمرين المراجعة — التمرينُ نفسُه الذي في المحطة، بعقد المحرّك. */
function viewFor(item, api) {
  // **ويرسمه مالكُه**: `by` هو الذي بناه (أعلاه) — فلا يرسم صاحبُ «اجعلهما سواء»
  // جولةَ جسرٍ لأنّ اسمَ نوعهما واحد.
  const spec = (EXERCISES.get(item.kind) || [])[item.by ?? 0];
  if (!spec) return h('p', { class: 'hint' }, 'لا تمرين بعد.');
  return spec.view(item, {
    measured: true,
    alive: api.fresh,
    // **الخطأ يُسجَّل على المهارة المطلوبة لا على ما لمس** (`METHOD.md §٤`)
    attempt: (round, correct) => api.score(round.concept, round.range, round.kind, correct),
    done: api.next,
  });
}

setBuilders({ item: itemFor, fillers: fillersOf, view: viewFor });
