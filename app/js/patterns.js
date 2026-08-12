// **المرحلة ٨ — الأَنْمَاطُ وَالقِيَاسُ الوَصْفِيّ** (`METHOD.md §٣`): أربعُ محطاتٍ بشاشتين.
//
//   `pattern`  «نَمَطُ (أ ب أ ب)» ثم «أَنْمَاطُ (أ ب ج) وَ(أ أ ب ب)» — إكمالُ النمط
//   `measure`  «أَطْوَلُ وَأَقْصَر · أَثْقَلُ وَأَخَفّ» ثم «قَبْلُ وَبَعْد»
//
// ————— هذه المرحلةُ لا تُقاس بعدد، وذلك أصلُها لا استثناؤها —————
//
// مفاتيحُ ليتنر هنا **وصفيةٌ لا عددية**: `pattern|abab|extend` و`measure|length|pick`
// (`METHOD.md §٦`) — فمدى المهارة **وجهٌ يُسمّى** لا عددٌ يُقاس عليه، وجبهةُ المحطة
// العدديةُ (العشرة) **سقفٌ لا موضوعُ درس**. وأثرُ ذلك في الشيفرة أنّ `skillOf` تردّ
// المدى نصّاً حيث لم يكن عدداً (`station.js`) — ولولاه لصار المفتاحُ `pattern|NaN|extend`
// وانفصل عن نفسِه صامتاً: يُسجَّل ولا يُسأل عنه أبداً.
//
// ————— والنمطُ **إيقاعٌ يُرى**، وجوابُه من الشريط المرسوم —————
//
// وحدةٌ تتكرّر (أ ب · أ ب ج · أ أ ب ب) حتى تمتلئ خاناتُ الشريط، **وآخرُها سؤال**.
// و«ما يأتي بعده» **لا يُحسَب في الشاشة**: هو ما في الخانة التي تبعد عن السؤال
// **دورةً كاملة**، مقروءاً من `data-item` في الـDOM — فلو رسم المصيِّرُ غيرَ ما أُعلن
// لَصار الجوابُ ما رُسِم لا ما نُوي، وأمسكه حارسُه (`check_render.mjs`).
// والمشتّتاتُ **من عناصر الشريط نفسِه**: يقدّر الطفلُ الإيقاعَ ولا يميّز الغريب.
//
// ————— والقياسُ الوصفيّ مقارنةٌ بالعين لا عدٌّ —————
//
// «أطولُ وأقصر · أثقلُ وأخفّ» (٨·٣) و«قبلُ وبعد» (٨·٤): مشهدٌ واقفٌ على خطٍّ واحد
// — فالفرقُ يُرى لا موضعٌ يخدع — وله وجهان (الجلسة ٨ب، `REVIEW_SCENES.md §٦`):
//
//   **الطولُ بالمقادير** (باقٍ بحكم المدير): الشيءُ نفسُه بأحجامٍ مختلفة، والمقدارُ
//   المرسوم مُعلَنٌ (`data-size`) فتقرأ الشاشةُ منه الأطولَ والأقصر.
//
//   **الثِّقَلُ والزمنُ بأشياءَ حقيقية**: أشياءُ مختلفة بمقدارٍ واحد من جدول `SCENES`
//   في المنهج — الرمزُ المرسوم يُقرأ من الـDOM (`data-item`) **وتُقابَل به رتبتُه
//   المعلَنة** (`sceneRank`): «الفيلُ أثقل» بيانُ منهجٍ لا هندسةُ رسم، وشطرُ
//   «ما رُسِم لا ما نُوِي» باقٍ بحرفه — امتدادُ «الجوابُ من المرسوم» إلى ما ليس كمّاً.
//
// ————— وثلاثةُ عهودٍ أخرى —————
//
// ١) **لا رمزَ عمليةٍ ولا عملية**: جبهةُ المرحلة كلِّها `ops: []` و`signs: []`.
// ٢) **الخطأُ يُرى ولا يُلقَّن**: في النمط **يُضاء الشريطُ دورةً دورة** فيُرى الإيقاعُ
//    نفسُه، وفي القياس **يُضاء الأطولُ والأقصر بترتيب المقدار** فيُرى الفرق.
// ٣) **لا مؤقّتَ ولا عقاب**، والخيارُ الخاطئ لا ينقل.

import * as progress from './progress.js';
import { SCENES, sceneRank } from './curriculum.js';
import { registerScreen } from './registry.js';
import { OBJECTS } from './render.js';
import { h, pick, shuffle, seeded, shake, pop, PATTERN_ACCENT } from './ui.js';
import {
  BEAT, SAY, say, praiseThen, seeder, skillOf, facesOf,
  stationById, stationForSkill, figureBox, quantityCard, usedOf,
  registerExercise, stationScreen,
} from './station.js';

const OPTIONS = 3;
const GUIDED = 2;
const SOLO = 5;

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['pattern', 'measure']);

/**
 * **وحداتُ النمط**: حروفُها هي مفاتيحُ ليتنر نفسُها (`pattern|abab|extend`) — فالوجهُ
 * الذي تدرّسه المحطةُ مقروءٌ من المنهج، والوحدةُ مشتقّةٌ من اسمه حرفاً بحرف.
 * ولا وجهَ في هذه القائمة لا مفتاحَ له، ولا مفتاحَ لا وحدةَ له (يفحصهما `test_measure`).
 */
const UNITS = { abab: 'ab', abc: 'abc', aabb: 'aabb' };

/** أوجهُ القياس ← سؤالاها ووجهُ المشهد — والوجهُ من المفتاح (`measure|length|pick`). */
const MEASURE = {
  length: { big: 'taller', small: 'shorter', count: 2 },
  weight: { big: 'heavier', small: 'lighter', count: 2 },
  time: { count: 3 },
};

// ————— التعليماتُ المنطوقة (مُعلَنةٌ لا مستنتَجة — `check_speech.mjs`) —————
//
// **وجملتا الكشف ليستا هنا**: «وَهَذَا مَا يَأْتِي بَعْدَهْ» و«وَهَذَا تَرْتِيبُهَا
// مِنَ الْأَصْغَرِ إِلَى الْأَكْبَرْ» عرضٌ يُشاهَد لا فعلٌ يُطلَب، فموضعُهما جدولُ `SAY`
// في `station.js` — وبموضعهما تُشتقّ فئتُهما `modeling` (حكمُ المدير، مراجعة الجلسة ٤).

const ASK = {
  extend: 'أَكْمِلِ النَّمَطْ',
  taller: 'أَيُّهُمَا أَطْوَلْ؟',
  shorter: 'أَيُّهُمَا أَقْصَرْ؟',
  heavier: 'أَيُّهُمَا أَثْقَلْ؟',
  lighter: 'أَيُّهُمَا أَخَفّْ؟',
  order: 'رَتِّبْ مِنَ الْأَوَّلِ إِلَى الْآخِرْ',
};

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// **والأعدادُ هنا ليست مادّةَ درس**: `numbers` طولُ الشريط وعددُ أشياء المشهد — وهي
// تحت جبهة المحطة العددية (العشرة) سقفاً لا موضوعاً. ولا رمزَ عدديّ يُعرَض البتّة،
// فالمحطةُ تُقاس بالوجه لا بالعدد — و`numerals` فارغةٌ عمداً.

export const CONSUMES = {
  pattern: {
    numbers: [1, 5, 7, 9], numerals: [], ops: [], signs: [],
    displays: ['objects', 'pattern'],
  },
  measure: {
    numbers: [2, 3], numerals: [], ops: [], signs: [],
    displays: ['objects', 'scene'],
  },
};

// ————— بناءُ جولات النمط —————

/**
 * **شريطُ الوحدة مكرَّرةً دورتين وخانةُ سؤال**: دورةٌ واحدة لا تُرِي تكراراً، وثلاثٌ
 * تُطيل الشريط بلا درسٍ جديد — فالطولُ `٢ × الوحدة + ١` مهما كانت الوحدة.
 */
const stripLength = (unit) => 2 * unit.length + 1;

/**
 * جولةُ «أَكْمِلِ النَّمَط»: الشريطُ مرسومٌ وآخرُ خانةٍ سؤال، والبطاقاتُ **من عناصره**.
 *
 * @param {string} face وجهُ المحطة (`abab` · `abc` · `aabb`) — من مفاتيح المنهج
 */
function patternRound(station, rnd, { face, aided = false } = {}) {
  const skill = skillOf(station, 'pattern', 'extend');
  const next = seeder(rnd);
  const unit = UNITS[face];
  const letters = [...new Set(unit)];
  // رمزٌ لكل حرفٍ من عناصر عالم الطفل، **مختلفةٌ في الشريط الواحد** (وإلّا لا نمط)
  const glyphs = shuffle(OBJECTS.map((o) => o.glyph), rnd).slice(0, letters.length);
  const of = Object.fromEntries(letters.map((l, i) => [l, glyphs[i]]));
  const length = stripLength(unit);
  const items = Array.from({ length },
    (_, i) => (i === length - 1 ? null : of[unit[i % unit.length]]));
  // **الجوابُ حرفُ الخانة التي تبعد دورةً كاملة** — وتقرؤه الشاشةُ من الرسم لا من هنا
  const strip = { display: 'pattern', count: length, seed: next(), items };
  // المشتّتاتُ من عناصر الشريط نفسِه، ويُكمَّل العددُ بعنصرٍ مجاورٍ إن ضاق الحوض
  const spare = shuffle(OBJECTS.map((o) => o.glyph).filter((g) => !glyphs.includes(g)), rnd);
  const pool = [...glyphs, ...spare].slice(0, Math.max(OPTIONS, glyphs.length));
  const options = shuffle(pool, rnd)
    .map((glyph) => ({ display: 'objects', count: 1, seed: next(), glyph }));

  return {
    kind: 'extend', concept: skill.concept, range: face, mode: 'extend', aided,
    ask: ASK.extend,
    hint: 'اُنْظُرْ إِلَى التَّكْرَار، ثُمَّ اخْتَرْ مَا يَأْتِي بَعْدَه',
    // **طولُ الدورة** — به تقرأ الشاشةُ جوابَها من الشريط المرسوم
    period: unit.length,
    strip,
    options,
    figures: [strip, ...options],
    sig: `${station.id}|${face}|${glyphs.join('')}|${strip.seed}`,
  };
}

// ————— بناءُ جولات القياس الوصفيّ —————

/**
 * جولةُ قياسٍ بوجهين (`REVIEW_SCENES.md §٦`):
 *
 * **الطولُ** مشهدُ الشيء الواحد بمقادير — والسؤالُ أطولُ أم أقصر، والحكمُ من
 * `data-size` المرسوم. **والثِّقَلُ** زوجٌ حقيقيّ من `SCENES` (سيارةٌ وبالون…)
 * بمقدارٍ واحد — والحكمُ رتبةُ الرمز المقروء من الرسم. **والزمنُ ترتيبٌ لا اختيار**:
 * تسلسلُ مشهدٍ من يوم الطفل أو نموِّه، يُرتَّب من الأول إلى الآخر برتبه المعلَنة.
 *
 * **والزوجُ الفاصلُ يتصدّر** (حكم المدير): جولاتُ كلِّ وجهٍ تدور على مشاهده
 * **بترتيب الجدول** (`nth`) — فأولُ ثِقَلٍ يلقاه الطفلُ سيارة/بالون، الوحيدُ الذي
 * يفصل الثِّقَلَ عن الحجم، ثم تدور المشاهدُ كلُّها فلا يُترَك واحد.
 */
function measureRound(station, rnd, { face, aided = false, nth = null } = {}) {
  const skill = skillOf(station, 'measure', MEASURE[face].count > 2 ? 'sort' : 'pick');
  const next = seeder(rnd);
  const { count } = MEASURE[face];
  const big = face !== 'time' && rnd() < 0.5;

  let scene;
  let sig;
  if (face === 'length') {
    const ranks = shuffle(Array.from({ length: count }, (_, i) => i + 1), rnd);
    const glyph = pick(OBJECTS, rnd).glyph;
    scene = { display: 'scene', count, seed: next(), glyph, ranks };
    sig = `${station.id}|${face}|${ranks.join('')}|${scene.seed}`;
  } else {
    const pool = SCENES[face];
    const data = pool[(nth ?? Math.floor(rnd() * pool.length)) % pool.length];
    // ترتيبُ العرض قرعةٌ، والرتبةُ ثابتةٌ في المنهج — فالشاشةُ تقرأ ما رُسم وتحكم به
    const items = shuffle(data.items.map((i) => i.glyph), rnd);
    scene = { display: 'scene', count, seed: next(), items };
    sig = `${station.id}|${face}|${data.id}|${items.join('')}|${scene.seed}`;
  }

  return {
    kind: skill.kind, concept: skill.concept, range: face, mode: face === 'time' ? 'sort' : 'pick',
    aided,
    ask: face === 'time' ? ASK.order : ASK[big ? MEASURE[face].big : MEASURE[face].small],
    hint: face === 'time'
      ? 'اِلْمَسِ الأَوَّلَ أَوَّلًا — ثُمَّ مَا يَلِيه'
      : 'قَارِنْ بِعَيْنِكْ، ثُمَّ الْمَسْ',
    // **المطلوبُ أقصى القيم أم أدناها** — والقيمةُ مقدارٌ مرسوم أو رتبةٌ معلَنة
    big,
    scene,
    figures: [scene],
    sig,
  };
}

/** أوجهُ المحطة **من مفاتيحها في المنهج** — لا قائمةَ أوجهٍ مكتوبةٌ في شاشة. */
function stationFaces(station) {
  return station.type === 'pattern'
    ? facesOf(station, 'pattern', 'extend')
    : [...facesOf(station, 'measure', 'pick'), ...facesOf(station, 'measure', 'sort')];
}

/** جولةُ وجهٍ بعينه — و`nth` ترتيبُ الجولة في وجهها (به يتصدّر الزوجُ الفاصل). */
const roundFor = (station, rnd, face, aided, nth) => (station.type === 'pattern'
  ? patternRound(station, rnd, { face, aided })
  : measureRound(station, rnd, { face, aided, nth }));

/**
 * **نمذجةُ المحطة درسُها هي**: النمطُ يُرى تامّاً ثم يُكشَف ما يأتي بعده، والمشهدُ
 * يُرى ثم يُكشَف أطولُه (أو ترتيبُه) — ولا مطالبةَ في «شاهِدْ».
 *
 * **وعدُّ النمذجة عدُّ درسها**: لا `countAloud` هنا — لا شريطُ النمط كمّيةٌ تُعَدّ ولا
 * مشهدُ القياس، فتُضاء عناصرُهما **بإيقاع الدرس**: الشريطُ **دورةً دورة**، والمشهدُ
 * **من الأصغر إلى الأكبر**.
 */
function modelOf(station, rnd) {
  const next = seeder(rnd);
  const face = stationFaces(station)[0];

  if (station.type === 'pattern') {
    const round = patternRound(station, rnd, { face, aided: true });
    /* **والكشفُ الشريطُ تامّاً** لا العنصرَ وحدَه: عنصرٌ واحد في بطاقةِ كمّيةٍ يُرسَم
       نقطةً صغيرة في بياضٍ واسع (أظهرته المراجعةُ البصرية)، **والدرسُ نفسُه أن يُرى
       النمطُ وقد تمّ** — فتُملأ خانةُ السؤال بما يبعد دورةً كاملة ويُعرَض الشريط. */
    const done = [...round.strip.items];
    done[done.length - 1] = done[done.length - 1 - round.period];
    return {
      title: ASK.extend,
      hint: 'نَقْرَأُ التَّكْرَارَ دَوْرَةً دَوْرَة، ثُمَّ نَرَى مَا يَأْتِي بَعْدَه',
      figures: [round.strip],
      count: (figs, alive) => walkStrip(figs[0], round.period, alive),
      reveal: {
        say: SAY.revealNext,
        figures: [{ display: 'pattern', count: round.strip.count, seed: next(), items: done }],
      },
    };
  }

  /* **والمشهدُ يُنمذَج غيرَ مرتَّبٍ ثم يُكشَف مرتَّباً**: فالدرسُ هو الترتيبُ نفسُه —
     وهو جوابُ «أيُّهما أطول» وجوابُ «قبلُ وبعد» معاً. **ولا يُترَك للقرعة**: ترتيبٌ
     مبعثرٌ قد يقع مرتَّباً فيتطابق الكشفُ والمشهد فلا يُرى شيء (أظهرته المراجعةُ
     البصرية) — فيُدار الترتيبُ دورةً واحدة، وهو **أبداً غيرُ المرتَّب** مهما كان العدد.

     **ونمذجةُ الزمن أولُ تسلسلات الجدول** (البيضةُ فالكتكوتُ فالدجاجة): مشهدٌ حقيقيّ
     من `SCENES` يُرتَّب برتبه المعلَنة، والكشفُ **من الأول إلى الآخر** لا من الأصغر
     إلى الأكبر — فليس في يوم الطفل أصغرُ وأكبر. */
  const { count } = MEASURE[face];
  const rotate = (list) => [...list.slice(1), list[0]];
  if (face === 'time') {
    const steps = SCENES.time[0].items.map((i) => i.glyph);       // مرتَّبةٌ رتبةً رتبة
    return {
      title: ASK.order,
      hint: 'يَمْضِي شَيْئًا فَشَيْئًا — فَالأَوَّلُ كَانَ قَبْل',
      range: face,
      figures: [{ display: 'scene', count, seed: next(), items: rotate(steps) }],
      count: (figs, alive) => walkScene(figs[0], worthOf(face), alive),
      reveal: {
        say: SAY.revealFirst,
        figures: [{ display: 'scene', count, seed: next(), items: steps }],
      },
    };
  }
  const glyph = pick(OBJECTS, rnd).glyph;
  const ranks = Array.from({ length: count }, (_, i) => i + 1);   // الأصغرُ يمنة
  return {
    title: ASK.taller,
    hint: 'نَنْظُرُ إِلَيْهَا مَعًا، فَنَرَى أَيُّهَا أَطْوَل',
    range: face,
    figures: [{ display: 'scene', count, seed: next(), glyph, ranks: rotate(ranks) }],
    count: (figs, alive) => walkScene(figs[0], worthOf(face), alive),
    reveal: {
      say: SAY.revealOrder,
      figures: [{ display: 'scene', count, seed: next(), glyph, ranks }],
    },
  };
}

// ————— «يُرى الدرسُ» بدل «يُعَدّ العنصر» —————

/** قراءةُ الشريط من الـDOM: ما في كل خانةٍ، و`null` لخانة السؤال. */
const stripItems = (fig) => fig.cells.map((cell) => cell.dataset.item || null);

/**
 * **يُضاء الشريطُ دورةً دورة** — إيقاعُ النمط يُرى: تُعلَّم خاناتُ الدورة الأولى معاً،
 * ثم الثانية، فيُدرَك التكرارُ بالعين بلا عدٍّ ولا كلام. (ولا اسمَ عددٍ هنا: النمطُ
 * ليس كمّيةً تُعَدّ، وعدُّه بالأعداد يُعلّم درساً آخر.)
 */
async function walkStrip(fig, period, alive = () => true) {
  for (const cell of fig.cells) cell.classList.remove('is-counted');
  for (let at = 0; at < fig.cells.length; at += period) {
    if (!alive()) return false;
    for (const cell of fig.cells.slice(at, at + period)) cell.classList.add('is-counted');
    await new Promise((r) => setTimeout(r, BEAT * 1.4));
  }
  return alive();
}

/** إزالةُ أثر القراءة عن الشريط. */
const clearStrip = (fig) => {
  for (const cell of fig.cells) cell.classList.remove('is-counted');
};

/** أشياءُ المشهد كما رُسمت — **من الـDOM لا من الطلب**: رمزُ كلٍّ ومقدارُه إن أُعلن. */
const sceneItems = (fig) => [...fig.el.querySelectorAll('[data-item]')]
  .map((el) => ({ el, glyph: el.dataset.item, size: Number(el.dataset.size) }));

/**
 * **قيمةُ الشيء في مشهده — وبها يُحكَم**: في الطول مقدارُه المرسوم (`data-size`)،
 * وفي الثِّقَل والزمن **رتبتُه المعلَنة في المنهج** برمزه المقروء من الرسم
 * (`sceneRank` — حكمُ المدير: مصدرُ الحكم بيانٌ يُقَرّ لا هندسةٌ تُحسَب).
 */
const worthOf = (face) => (item) => (face === 'length'
  ? item.size
  : sceneRank(face, item.glyph));

/**
 * **يُضاء المشهدُ بترتيب قيمته** — فيُرى الدرسُ نفسُه: تدرّجُ المقادير في الطول،
 * وخفيفٌ فثقيلٌ في الثِّقَل، وأولٌ فآخرٌ في الزمن. والقيمةُ من `worth` الوجهِ نفسِه
 * الذي تحكم به الشاشة — فما يُضاء هو عينُ ما يُحكَم به.
 */
async function walkScene(fig, worth, alive = () => true) {
  const items = sceneItems(fig).sort((a, b) => worth(a) - worth(b));
  for (const { el } of items) el.classList.remove('is-counted');
  for (const { el } of items) {
    if (!alive()) return false;
    el.classList.add('is-counted');
    await new Promise((r) => setTimeout(r, BEAT * 1.4));
  }
  return alive();
}

/** إزالةُ أثر القراءة عن المشهد. */
const clearScene = (fig) => {
  for (const { el } of sceneItems(fig)) el.classList.remove('is-counted');
};

// ————— خطةُ المحطة —————

export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const faces = stationFaces(station);
  if (!faces.length) return null;

  /* **والأوجهُ تدور على الجولات كلِّها**: محطةُ ٨·٢ وجهان (أ ب ج · أ أ ب ب) ومحطةُ
     ٨·٣ وجهان (طولٌ وثِقَل)، فلو بُنيت بالقرعة لَجاز أن يُمتحَن في وجهٍ ويُترَك آخر.
     **ومشاهدُ الوجه تدور بترتيب جدولها** (`nth` يُعَدّ عبر المحطة كلِّها): فأولُ
     ثِقَلٍ سيارة/بالون — الزوجُ الفاصلُ يتصدّر — ثم سائرُ المشاهد فلا يُترَك واحد. */
  const seen = {};
  const step = (count, aided) => Array.from({ length: count }, (_, i) => {
    const face = faces[i % faces.length];
    const nth = seen[face] ?? 0;
    seen[face] = nth + 1;
    return roundFor(station, rnd, face, aided, nth);
  });

  return { model: modelOf(station, rnd), guided: step(GUIDED, true), solo: step(SOLO, false) };
}

/** جردُ الجولات للحارس — **النمذجةُ والعونُ و«وحدك» كلُّها**، فلا شكلَ يفلت. */
export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة (بابُ الشيفرة في `test_measure.mjs`: مَن أعلن قياساً كتبه) —————

const SCORE = {
  extend: (r, ok) => progress.recordAttempt(r.concept, r.range, 'extend', ok),
  pick: (r, ok) => progress.recordAttempt(r.concept, r.range, 'pick', ok),
  sort: (r, ok) => progress.recordAttempt(r.concept, r.range, 'sort', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

// ————— شاشةُ «أَكْمِلِ النَّمَط» —————

function extendView(round, hooks) {
  const strip = figureBox(round.strip, 'q-strip');
  const items = stripItems(strip);
  const blank = items.indexOf(null);
  // **الجوابُ من الشريط المرسوم**: ما في الخانة التي تبعد عن السؤال دورةً كاملة
  const want = items[blank - round.period];
  const choices = h('div', { class: 'q-choices' });
  const board = h('div', { class: 'q-solve q-solve--pattern' }, strip.box);
  board.dataset.mode = 'extend';
  // **ما تُعلنه الشاشةُ جوابُها المقروءُ من الشريط** — لا نيّةُ المولّد
  board.dataset.answer = String(want);
  let locked = false;

  // **العونُ المرئيّ في «جرِّب معي»**: الدورةُ الأولى مُعلَّمةٌ من أول لحظة
  if (round.aided) {
    for (const cell of strip.cells.slice(0, round.period)) cell.classList.add('is-open');
  }

  for (const spec of round.options) {
    let cell = null;
    const choose = async () => {
      if (locked) return;
      // **ما رسمته البطاقةُ لا ما طُلب منها**: الرمزُ مقروءٌ من صورتها في الـDOM
      const drawn = cell.btn.querySelector('[data-emoji]')?.dataset.emoji;
      const correct = drawn === want;
      hooks.attempt(round, correct);
      if (correct) {
        locked = true;
        cell.btn.classList.add('good');
        pop(cell.btn);
        // تتمّ الخانةُ **بما رُسِم على البطاقة** — فيُرى النمطُ تامّاً
        const image = cell.btn.querySelector('img.emoji');
        strip.cells[blank].querySelector('.fig-ask')?.remove();
        if (image) strip.cells[blank].append(image.cloneNode(true));
        strip.cells[blank].classList.add('is-full');
        await praiseThen(hooks);
        return;
      }
      cell.btn.classList.add('bad');
      shake(cell.btn);
      locked = true;
      // **الخطأُ يُرى ولا يُلقَّن**: يُضاء الشريطُ دورةً دورة فيُدرَك الإيقاع بنفسه
      await say(SAY.together);
      if (!hooks.alive()) return;
      await new Promise((r) => setTimeout(r, BEAT / 2));
      if (!hooks.alive()) return;
      if (!(await walkStrip(strip, round.period, hooks.alive))) return;
      clearStrip(strip);
      cell.btn.classList.remove('bad');
      locked = false;
    };
    cell = quantityCard(spec, { label: 'هَذَا', onclick: choose });
    choices.append(cell.btn);
  }

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board,
    choices);
}

// ————— شاشةُ القياس الوصفيّ: يُلمَس الشيءُ نفسُه في المشهد —————

function measureView(round, hooks) {
  const scene = figureBox(round.scene, 'q-scene');
  const items = sceneItems(scene);
  const board = h('div', { class: 'q-solve q-solve--measure' }, scene.box);
  board.dataset.mode = round.mode;
  /* **الحكمُ بقيمة الوجه على ما رُسِم**: في الطول المقدارُ المرسوم، وفي الثِّقَل
     والزمن رتبةُ الرمز المقروء من الرسم (`worthOf`) — واللوحُ يعلن المطلوبَ باسمه:
     مقداراً في الطول، **ورمزَ الشيء نفسِه** فيما سواه (فلا حجمَ يحمل حكماً). */
  const worth = worthOf(round.range);
  const nameOf = (item) => (round.range === 'length' ? String(item.size) : item.glyph);
  const order = [...items].sort((a, b) => worth(a) - worth(b));
  const want = round.mode === 'sort' ? order : [round.big ? order[order.length - 1] : order[0]];
  board.dataset.answer = nameOf(want[0]);
  let placed = 0;
  let locked = false;

  const taps = items.map((item) => {
    const btn = h('button', {
      class: 'q-pickspot',
      'aria-label': 'هَذَا',
      onclick: () => choose(btn, item),
    });
    // الزرُّ يحمل ما يعلنه المرسوم تحته — مقداراً أو رمزاً — فيُقرأ لا يُصدَّق
    if (round.range === 'length') btn.dataset.size = String(item.size);
    else btn.dataset.item = item.glyph;
    // زرٌّ يسكن موضعَ الشيء نفسِه — مقاسُه ومكانُه من المصيِّر لا من حسابٍ ثانٍ
    for (const key of ['--x', '--y', '--d']) {
      btn.style.setProperty(key, item.el.style.getPropertyValue(key));
    }
    scene.box.append(btn);
    return btn;
  });

  async function choose(btn, item) {
    if (locked || btn.disabled) return;
    const correct = worth(item) === worth(want[placed]);
    hooks.attempt(round, correct);
    if (correct) {
      btn.classList.add('good');
      item.el.classList.add('is-counted');
      pop(btn);
      placed++;
      if (placed < want.length) {
        btn.disabled = true;
        board.dataset.answer = nameOf(want[placed]);
        say(SAY.bravo);
        return;
      }
      locked = true;
      await praiseThen(hooks);
      return;
    }
    btn.classList.add('bad');
    shake(btn);
    locked = true;
    // **الخطأُ يُرى**: يُضاء المشهدُ بترتيب قيمته فيُدرَك التدرّجُ أو التعاقبُ بالعين
    await say(SAY.together);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    if (!(await walkScene(scene, worth, hooks.alive))) return;
    clearScene(scene);
    for (const tap of taps) {
      tap.classList.remove('bad', 'good');
      tap.disabled = false;
    }
    for (const item of items) item.el.classList.remove('is-counted');
    placed = 0;
    board.dataset.answer = nameOf(want[0]);
    locked = false;
  }

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board);
}

const VIEWS = { extend: extendView, pick: measureView, sort: measureView };
const viewOf = (round, hooks) => VIEWS[round.kind](round, hooks);

// ————— التسجيل في الموجِّه وفي المراجعة —————

function screen(type) {
  return (part) => {
    const station = stationById(`${type}:${part}`);
    if (!station) return null;
    return stationScreen({
      nodeId: station.id,
      title: station.title,
      accent: PATTERN_ACCENT,
      make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0xc2b2ae35),
      view: viewOf,
      score,
      save: (stars) => progress.setStars(station.id, stars),
    });
  };
}

/* **وكلُّ سابقةٍ تُسجَّل باسمها صريحاً** لا بحلقةٍ على `TYPES` (`test_nodes.mjs`). */
registerScreen('pattern', screen('pattern'));
registerScreen('measure', screen('measure'));

/**
 * جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات.
 * **والوجهُ من مدى المهارة نفسِه**: `pattern|aabb|extend` تُبنى (أ أ ب ب) لا (أ ب أ ب)،
 * و`measure|weight|pick` تُبنى ثِقَلاً لا طولاً — ولو خُلطا لَراجع غيرَ ما ضعف فيه.
 */
const single = (build, table) => (skill, rnd) => {
  const station = stationForSkill(skill);
  if (!station || !TYPES.has(station.type)) return null;
  const faces = stationFaces(station);
  const face = table[skill.range] ? skill.range : faces[0];
  return face ? build(station, rnd, { face }) : null;
};

registerExercise('extend', { build: single(patternRound, UNITS), view: viewOf });
registerExercise('pick', { build: single(measureRound, MEASURE), view: viewOf });
registerExercise('sort', { build: single(measureRound, MEASURE), view: viewOf });
