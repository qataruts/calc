// **المرحلة ٥ — ركِّبْ وفكِّكْ** (`METHOD.md §٣`): ستُّ محطاتٍ بشاشةٍ واحدة.
//
//   `bond`  «جُسُورُ ٣ وَ٤» ثم «جُسُورُ ٥» ثم «اِصْنَعِ الخَمْسَةَ بِطَرِيقَتَيْن»
//           ثم «جُسُورُ ٦ وَ٧» ثم «جُسُورُ ٨ وَ٩» وآخرُها «أَصْدِقَاءُ العَشَرَة».
//
// ————— العهدُ الأكبر: **لا رمزَ عمليةٍ واحد في هذه المرحلة** —————
//
// نصُّ `METHOD.md §٣`: «جزء-جزء-كلّ **قبل رمزَي + و−** — لا رمز عملية واحد في هذه
// المرحلة». وجبهاتُ المحطات الستّ كلُّها `ops: []` و`signs: []` في `curriculum.js`،
// **ويفرضه `check_range.py` على كل جولةٍ مولَّدة** (البابان ٤+٥) لا على نيّةِ كاتبٍ:
// جولةٌ تستعمل عمليةً أو علامةً تسقط حمراءَ باسمها. فالجمعُ في المرحلة ٦ **تسميةٌ
// لِما فعله هنا بيده** — كما كان الرمزُ في المرحلة ٣ تسميةً لكمٍّ عرفه.
//
// ————— والتمرينُ «اِصْنَعِ العَدَد» (`METHOD.md §٧`) —————
//
// لا «أوجِدِ المجهول»: الطفلُ **يبني** الكلَّ من جزأين بيده، فيرى الكلَّ وجزأيه معاً
// في لحظةٍ واحدة — وهو معنى «الجسر». وله وجهان تقتضيهما محطاتُ المرحلة:
//   • **الجزآن معاً** (`pair`): الكلُّ معلومٌ وخانتاه فارغتان، فيملؤهما ببطاقتَي كمّ.
//     و«اصْنَعْهُ بِطَرِيقَةٍ أُخْرَى» في محطة ٥·٣ — الطريقتان في جولةٍ واحدة.
//   • **ما بقي للعشرة** (`rest`): إطارُ عشرةٍ فيه بعضُه، **وخاناتُه الفارغة هي السؤال**
//     — تمهيداً في ٥·٥ (`METHOD.md §٣`) وموضوعاً في ٥·٦ «أصدقاء العشرة».
//
// ————— وخمسةُ عهودٍ تحكم هذه الوحدة —————
//
// ١) **الكلُّ يُسمّى رمزاً والأجزاءُ تُبنى كمّاً**: الرمزُ عبر بوابتَيه (المرحلتان ٣–٤)
//    فصار اسماً معروفاً، والجسرُ **يُبنى بصرياً** بنصّ `METHOD.md §٢.٥` — فبطاقاتُ
//    الأجزاء كمّياتٌ تُعَدّ لا أرقامٌ تُقرأ.
// ٢) **الحكمُ من المرسوم**: مجموعُ ما رسمه المصيِّرُ في الخانتين يقابل ما رسمته بطاقةُ
//    الكلّ (`drawn`)، و«ما بقي» يقابل **خاناتِ الإطار المرسومة** (`[data-cell]`) —
//    فلا عددٌ تدّعيه شاشة. وحتى **سَعةُ العشرة** مقروءةٌ من الإطار لا مكتوبةً هنا.
// ٣) **التجاوزُ امتناعٌ في البنية**: بطاقةٌ تزيد على ما بقي **تُعطَّل** — كما يُعطَّل
//    العنصرُ المعدود في «المس وعُدّ»، فلا يُبنى كلٌّ أكبرُ من كلِّه ولو ألحّ الإصبع.
//    وما وُضع **يُراجَع بالإصبع**: نقرةٌ على الخانة تردّ جزأها (نظيرُ «أعطني ن»).
// ٤) **الخطأُ يُعَدّ أمامه ولا يُلقَّن**: في `pair` تُكشَف كمّيةُ الكلّ **فتُعَدّ**
//    عنصراً عنصراً، وفي `rest` تُعَدّ **الخاناتُ الفارغة** واحدةً واحدة — يرى الصوابَ
//    عدّاً (`METHOD.md §٤`).
// ٥) **الخمسةُ مرساةً حيث يقولها المنهج** (٥·٤: «إطارُ العشرة، الخمسةُ مرساةً — ٦=٥+١»):
//    وتُقرأ من **جبهة المحطة** لا من رقمٍ يُكتب هنا — محطةٌ تُبقي إطارَ الخمسة في
//    أنماطها هي التي تُرسي عليه، ومقدارُ المرساة سَعةُ ذلك الإطار من المصيِّر نفسِه.

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { stations } from './curriculum.js';
import { rangeOf, OBJECTS } from './render.js';
import { h, icon, pick, shuffle, seeded, shake, pop, BOND_ACCENT } from './ui.js';
import {
  BEAT, SAY, say, praiseThen, span, nearOptions, seeder, skillOf, rangesOf,
  stationById, stationForSkill, figureBox, quantityCard, countAloud,
  countCells, clearCount, clearCells, usedOf, registerExercise, stationScreen,
  roundGate,
} from './station.js';

const GUIDED = 2;          // «جرِّب معي» — جولتان بعونٍ مرئيّ، غيرُ مقيستين
const SOLO = 5;            // «وحدك» (`METHOD.md §٤`: ٤–٦)
const WAYS_SOLO = 4;       // ومحطةُ الطريقتين أقلُّ جولاتٍ: **كلُّ جولةٍ فيها طريقتان**
const CARDS = 5;           // سقفُ بطاقات الأجزاء — زوجان صحيحان وواحدةٌ لا تُكمِل

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['bond']);

/** سَعةُ الإطارين **من المصيِّر لا من رقمٍ يُكتب هنا** — عليهما تقوم المرساة و«ما بقي». */
const FIVE = rangeOf('five-frame').max;
const TEN = rangeOf('ten-frame').max;

// ————— التعليماتُ المنطوقة —————
//
// **مُعلَنةٌ لا مستنتَجة** (`check_speech.mjs`): لكلٍّ ملفٌّ مولَّد أو مكانٌ في
// `tools/audio_queue.json`. ولا رقمَ في نصٍّ منطوق (ق١)، ولا معدودٌ مقرونٌ بعدد (ق٢).
//
// **وجملتا الكشف ليستا هنا**: «وَتَنْشَقُّ إِلَى هَذَيْنِ الْجُزْأَيْنْ» و«وَهَذَا مَا
// بَقِيَ لَهَا» عرضٌ يُشاهَد لا فعلٌ يُطلَب، فموضعُهما جدولُ `SAY` في `station.js`
// (وبموضعهما تُشتقّ فئتُهما `modeling` — حكمُ المدير، مراجعة الجلسة ٤ البند ٥).

const ASK = {
  make: 'اصْنَعْهُ بِجُزْأَيْنْ',
  again: 'وَالْآنَ بِطَرِيقَةٍ أُخْرَى',
  rest: 'كَمْ بَقِيَ لِتَمْتَلِئَ الْعَشَرَةْ؟',
};

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// **الإعلانُ أرضيةٌ لا سقف**: لهذا النوع ستُّ محطاتٍ جبهاتُها مختلفة (ضمن ٤ … ضمن ١٠)،
// والحارسُ يقابل الإعلانَ **بكلٍّ منها** — فالمُعلَن ما تشترك فيه كلُّها: الأعدادُ
// والرموزُ ١–٤، ونمطا عناصرِ عالم الطفل وبطاقةِ الرمز. وما زاد في محطةٍ بعينها
// **يُجرَد جولةً جولة** على جبهتها في `probeRounds`.

export const CONSUMES = {
  bond: {
    numbers: [1, 2, 3, 4], numerals: [1, 2, 3, 4], ops: [], signs: [],
    displays: ['objects', 'numeral'],
  },
};

// ————— درسُ المحطة: مقروءٌ من المنهج لا مكتوبٌ هنا —————

/**
 * **محطةُ «بطريقتين»**: هي التي **لا تُضيف مفتاحاً جديداً** إلى ما قبلها — فمادّتُها
 * مادّةُ سابقتها، ودرسُها أن يُصنَع العددُ نفسُه بوجهين لا أن يُتعلَّم جسرٌ جديد
 * (٥·٣ «اِصْنَعِ الخَمْسَةَ بِطَرِيقَتَيْن» ومفتاحُها `bond|5|make` كسابقتها).
 * وهو استدلالٌ من بيانات المنهج نفسِها، فلا معرّفَ محطةٍ يُكتب في شاشة.
 */
function isTwoWays(station) {
  const family = stations().filter((s) => TYPES.has(s.type));
  const before = new Set(family.slice(0, family.findIndex((s) => s.id === station.id))
    .flatMap((s) => s.skills || []));
  return (station.skills || []).length > 0 && (station.skills || []).every((k) => before.has(k));
}

/**
 * **«كم بقي للعشرة؟»**: تدخل حين تقترب جبهةُ المحطة من سَعة إطار العشرة — تمهيداً
 * حين تبقى خانةٌ واحدة (٥·٥: ضمن ٩)، وموضوعاً حين تبلغها (٥·٦: ضمن ١٠ — «أصدقاء
 * العشرة»). وهو نصُّ `METHOD.md §٣` مقروءاً من الجبهة والمصيِّر، لا رقماً يُكتب هنا.
 */
function restShare(station) {
  const f = station.frontier;
  if (!f.displays.includes('ten-frame') || TEN - f.max > 1) return 'none';
  return f.max === TEN ? 'all' : 'one';     // موضوعُ المحطة · أو جولةٌ واحدة تمهيداً
}

// ————— اختيارُ الأنماط من جبهة المحطة —————

/** أنماطُ الكمّيات في الجبهة التي تستطيع رسمَ هذا العدد (بلا رمزٍ ولا خطّ). */
function usableFor(frontier, counts) {
  const low = Math.min(...counts);
  const high = Math.max(...counts);
  return frontier.displays
    .filter((d) => d !== 'numeral' && d !== 'line')
    .filter((d) => {
      const range = rangeOf(d);
      return range && low >= range.min && high <= range.max;
    });
}

/**
 * نمطُ **الكلّ** حين يُعرَض كمّيةً (النمذجةُ والعونُ والتصحيح): يُفضَّل **أضيقُ إطارٍ
 * يسعه** — فالإطارُ مرساةٌ بنصّ `METHOD.md §٣` (٥·٢ في إطار الخمسة، و٥·٤ في إطار
 * العشرة)، والخمسةُ في إطار العشرة تملأ صفَّه الأعلى فيُرى «٦ = ٥ + ١» بنظرة.
 */
function wholeDisplay(frontier, count, rnd) {
  const usable = usableFor(frontier, [count]);
  const frames = usable.filter((d) => d.endsWith('-frame'))
    .sort((a, b) => rangeOf(a).max - rangeOf(b).max);
  return frames[0] || pick(usable, rnd);
}

/**
 * **ورمزُ عالم الطفل واحدٌ في الجولة كلِّها**: جزآن يصيران كلّاً واحداً، فلو كان أحدُهما
 * سمكاتٍ والآخرُ زهراتٍ لَصار الضمُّ ضمَّ صنفين — والمقصودُ ضمُّ عددين. (والتجريدُ
 * محفوظٌ بين الجولات: الرمزُ يدور عليها كلِّها.)
 */
const glyphOf = (rnd) => pick(OBJECTS, rnd).glyph;

/** نمطٌ **واحد** لبطاقات الأجزاء كلِّها: بطاقاتٌ بأنماطٍ مختلفة تقارن شكلين لا كمّين. */
function cardDisplay(frontier, counts, rnd) {
  const usable = usableFor(frontier, counts);
  const plain = usable.filter((d) => !d.endsWith('-frame'));
  return pick(plain.length ? plain : usable, rnd);
}

// ————— أهدافُ الجولات: ما تدرّسه المحطةُ أولاً، ثم مراجعةٌ لِما دونه —————

/**
 * **الكلُّ الذي يُصنَع**: مفاتيحُ المحطة أولاً (`bond|٧|make` ← السبعة)، ويُكمَّل ما بقي
 * بما دونها **من أعلى الجبهة** — فمحطةُ «جسور ٦ و٧» تصنع السبعةَ والستّة لا الاثنين،
 * ومحطةُ «جسور ٣ و٤» تصنع الأربعةَ والثلاثة. محسوبٌ من الجبهة لا مكتوباً بيد.
 *
 * (والجسرُ لا يقوم دون اثنين: كلٌّ أدناه لا ينشقّ جزأين، فيُحَدّ الحوضُ من أسفل.)
 */
function wholesOf(station, count, rnd) {
  const f = station.frontier;
  const taught = rangesOf(station, 'bond', 'make').filter((n) => n >= 2);
  // **ومحطةُ الطريقتين تصنع عددَها وحدَه**: درسُها وجهان لعددٍ واحد لا عددان
  if (isTwoWays(station)) return Array.from({ length: count }, () => taught[0]);
  const older = span(Math.max(3, f.max - 1), f.max - 1).filter((n) => !taught.includes(n));
  const focus = Math.max(taught.length, Math.ceil((count * 2) / 3));
  const out = [];
  while (out.length < focus) out.push(...shuffle(taught, rnd));
  const rest = shuffle(older, rnd);
  for (let i = 0; out.length < count; i++) {
    out.push(rest.length ? rest[i % rest.length] : pick(taught, rnd));
  }
  return shuffle(out.slice(0, count), rnd);
}

/**
 * **بطاقاتُ الأجزاء**: زوجان يصنعان الكلّ (فتُمكن الطريقتان)، وبطاقةٌ لا تُكمِل معهما
 * (فليس كلُّ ما على الشاشة صواباً). و**الزوجُ الأول (١ ومَعه بقيّتُه) حاضرٌ دائماً**:
 * به لا تُغلَق الجولةُ أبداً — مهما وُضع جزءٌ أولاً بقي في الحوض ما يصلح لِما بقي.
 */
function partCards(whole, rnd) {
  const pairs = [];
  for (let a = 1; a * 2 <= whole; a++) pairs.push([a, whole - a]);
  const chosen = [pairs[0], ...shuffle(pairs.slice(1), rnd).slice(0, 1)].filter(Boolean);
  const values = [...new Set(chosen.flat())];
  const lonely = shuffle(span(1, whole - 1), rnd)
    .find((v) => !values.includes(v) && !values.includes(whole - v));
  if (lonely !== undefined) values.push(lonely);
  return shuffle(values.slice(0, CARDS), rnd);
}

// ————— بناءُ الجولات (حتميٌّ ببذرة) —————

/**
 * جولةُ «اصنعه بجزأين»: الكلُّ بطاقةُ رمزٍ، وخانتان تُملآن ببطاقتَي كمّ.
 * @param {boolean} ways أتُطلَب **طريقةٌ ثانية** بعد الأولى؟ (محطة ٥·٣)
 * @param {boolean} aided أيُعرَض الكلُّ كمّيةً منشقّةً عوناً؟ («جرِّب معي» وحدَها)
 */
function pairRound(station, rnd, { whole, ways = false, aided = false }) {
  const f = station.frontier;
  const skill = skillOf(station, 'bond', 'make');
  const next = seeder(rnd);
  const values = partCards(whole, rnd);
  const card = cardDisplay(f, values, rnd);
  const glyph = glyphOf(rnd);
  // **الخمسةُ مرساةً حيث أبقاها المنهجُ في الجبهة** (٥·٤): الشقُّ المعروض في العون
  // خمسةٌ وبقيّتُها، وإلّا فشقٌّ من أزواج الجولة نفسِها.
  const anchor = whole > FIVE && f.displays.includes('five-frame')
    ? FIVE : pick(values.filter((v) => values.includes(whole - v)), rnd) ?? 1;
  const shape = wholeDisplay(f, whole, rnd);
  const symbol = { display: 'numeral', count: whole, seed: next() };
  const quantity = { display: shape, count: whole, seed: next(), glyph };
  const aid = { ...quantity, seed: next(), split: anchor };
  const options = values.map((v) => ({ display: card, count: v, seed: next(), glyph }));

  return {
    kind: 'make', concept: skill.concept, range: skill.range,
    mode: 'pair', ways, aided,
    ask: ASK.make,
    hint: ways
      ? 'اِمْلَأِ الخَانَتَيْن — ثُمَّ اصْنَعْهُ مَرَّةً أُخْرَى بِجُزْأَيْنِ غَيْرِهِمَا'
      : 'اِخْتَرْ جُزْأَيْنِ يَصِيرَانِ مَعًا هَذَا العَدَد',
    whole: symbol,
    // **العونُ المرئيّ في «جرِّب معي»**: الكلُّ كمّيةً **منشقّةً شقّين** — يُرى الجسرُ
    // قبل أن يُطلَب. وفي «وحدك» يُرفَع العون (`METHOD.md §٤`).
    aid: aided ? aid : null,
    // كمّيةُ الكلّ تُكشَف **عند الخطأ وحدَه** فتُعَدّ أمامه — لا تلقينَ قبل المحاولة
    check: quantity,
    options,
    figures: [symbol, quantity, ...(aided ? [aid] : []), ...options],
    sig: `${station.id}|${whole}|${symbol.seed}`,
  };
}

/**
 * جولةُ «كم بقي لتمتلئ العشرة؟»: إطارٌ فيه بعضُه، **وخاناتُه الفارغة هي السؤال**.
 *
 * **ولا يُرسَم فيها عددُ العشرة قطّ**: الإطارُ سَعتُه، لا كمّيةٌ تُعَدّ — وبه تصحّ
 * المحطة ٥·٥ وجبهتُها ضمن التسعة (تمهيدٌ بنصّ `METHOD.md §٣`).
 */
function restRound(station, rnd, { aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'bond', 'make');
  const next = seeder(rnd);
  // ما يُملأ: من نصف الإطار إلى ما تبلغه الجبهة (ودون سعته: إطارٌ ممتلئٌ لا يُسأل عنه)
  const filled = pick(span(Math.max(1, TEN - f.max, Math.floor(TEN / 2)),
    Math.min(f.max, TEN - 1)), rnd);
  const rest = TEN - filled;
  const values = shuffle([rest, ...nearOptions(rest, span(1, f.max), 2, rnd)], rnd);
  const card = cardDisplay(f, values, rnd);
  const glyph = glyphOf(rnd);
  const frame = { display: 'ten-frame', count: filled, seed: next() };
  const options = values.map((v) => ({ display: card, count: v, seed: next(), glyph }));

  return {
    kind: 'make', concept: skill.concept, range: skill.range,
    mode: 'rest', aided,
    ask: ASK.rest,
    hint: 'انْظُرْ إِلَى الخَانَاتِ الفَارِغَة',
    frame,
    options,
    figures: [frame, ...options],
    sig: `${station.id}|${filled}|${frame.seed}`,
  };
}

/** خطةُ المحطة: نمذجةٌ بكشف الشقّ، ثم جولتان بعون، ثم «وحدك». */
export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const f = station.frontier;
  const next = seeder(rnd);
  const ways = isTwoWays(station);
  const share = restShare(station);
  const solo = ways ? WAYS_SOLO : SOLO;

  /**
   * جولاتُ خطوةٍ: جسورٌ بجزأين، ومعها «ما بقي» بنصيبه من المحطة — **وتمهيدُها يقع في
   * «جرِّب معي» كما يقع في «وحدك»**: نوعُ سؤالٍ لا يُرى إلا في الخطوة المقيسة امتحانٌ
   * بما لم يُنمذَج (`METHOD.md §٤`).
   */
  const step = (count, aided) => {
    const rests = share === 'all' ? count : (share === 'one' ? 1 : 0);
    const wholes = wholesOf(station, count - rests, rnd);
    return [
      ...wholes.map((whole) => pairRound(station, rnd, { whole, ways, aided })),
      ...Array.from({ length: rests }, () => restRound(station, rnd, { aided })),
    ];
  };

  // **النمذجةُ درسُ المحطة نفسِه**: حيث كان الموضوعُ «ما بقي» نُمذِج الإطارَ وما بقي
  // له، وحيث كان جسراً نُمذِج الكمّيةَ **تنشقّ شقّين** — وهو نصُّ ٥·١ حرفاً.
  const model = share === 'all'
    ? (() => {
      const filled = Math.max(1, f.max - 1);
      return {
        title: ASK.rest,
        hint: 'نَعُدُّ مَا فِيهِ، ثُمَّ نَرَى مَا بَقِيَ لَهُ',
        figures: [{ display: 'ten-frame', count: filled, seed: next() }],
        reveal: {
          say: SAY.revealRest,
          figures: [{
            display: cardDisplay(f, [TEN - filled], rnd), count: TEN - filled,
            seed: next(), glyph: glyphOf(rnd),
          }],
        },
      };
    })()
    : (() => {
      const whole = Math.max(2, f.max);
      const part = whole > FIVE && f.displays.includes('five-frame')
        ? FIVE : Math.ceil(whole / 2);
      const card = cardDisplay(f, [part, whole - part], rnd);
      const glyph = glyphOf(rnd);
      return {
        title: ASK.make,
        hint: 'نَعُدُّهَا كُلَّهَا، ثُمَّ نَرَى جُزْأَيْهَا',
        figures: [{
          display: wholeDisplay(f, whole, rnd), count: whole, seed: next(), split: part, glyph,
        }],
        reveal: {
          say: SAY.revealSplit,
          figures: [
            { display: card, count: part, seed: next(), glyph },
            { display: card, count: whole - part, seed: next(), glyph },
          ],
        },
      };
    })();

  return { model, guided: step(GUIDED, true), solo: step(solo, false) };
}

/** جردُ الجولات للحارس — **النمذجةُ والعونُ و«وحدك» كلُّها**، فلا شكلَ يفلت. */
export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة (بابُ الشيفرة في `test_measure.mjs`: مَن أعلن قياساً كتبه) —————

const SCORE = {
  make: (r, ok) => progress.recordAttempt(r.concept, r.range, 'make', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

// ————— شاشةُ «اصنعه بجزأين» —————

/**
 * لوحُ الجسر: الكلُّ فوق، وخانتاه تحته، وبطاقاتُ الأجزاء أسفلَهما.
 *
 * **والمقدارُ الباقي محسوبٌ من المرسوم** (`data-need`): ما رسمته بطاقةُ الكلّ ناقصَ ما
 * رسمته الخانتان — وعليه يقوم تعطيلُ ما يتجاوزه والحكمُ عند الامتلاء معاً، فلا حسابان
 * يفترقان.
 */
function pairView(round, hooks) {
  const whole = figureBox(round.whole, 'q-bond-whole');
  const check = figureBox(round.check);
  // **الخانةُ زرٌّ حقيقيّ**: ما وُضع فيها يُرَدّ بلمسةٍ عليها، فتبلغ هدفَ اللمس
  // ويجردها حارسُ المتصفّح من تلقائه (كطبقة اللمس في «المس وعُدّ»).
  const slots = [0, 1].map(() => h('button', {
    class: 'q-slot', 'aria-label': 'رُدَّ هَذَا الجُزْء', disabled: true,
  }));
  const placed = [];                    // ما وُضع في الخانتين، بترتيبه
  const spent = new Set();              // قيمُ الطريقة الأولى — لا تُعاد في الثانية
  const cards = [];
  /* **وقفلٌ مالكُه واحد** (بلاغ الميدان ٦): يُؤخَذ بالكبسة ويُرَدّ في كل حال —
     **ويُعاد رسمُ اللوح كلّما رُدّ** (`onFree` أدناه) فلا يبقى زرٌّ معطَّلاً لأنّ
     آخرَ رسمةٍ وقعت والقفلُ مأخوذ. */
  const gate = roundGate('اصنع العدد');
  let second = false;

  const head = h('h2', {}, round.ask);
  const hint = h('p', { class: 'hint' }, round.hint);
  const board = h('div', { class: 'q-bond' }, whole.box, h('div', { class: 'q-parts' }, ...slots));
  const checkBox = h('div', { class: 'q-check' }, check.box);
  const choices = h('div', { class: 'q-choices' });
  // تذكيرٌ لا يظهر إلا حين يصير له معنىً: جزءٌ وُضع يُمكن ردُّه
  const tip = h('p', { class: 'note note--tip' }, icon('repeat'), ' اِنْقُرْ عَلَى الجُزْءِ لِتَرُدَّهُ');
  checkBox.hidden = true;
  tip.hidden = true;

  const need = () => whole.drawn - placed.reduce((sum, p) => sum + p.drawn, 0);

  function paint() {
    board.dataset.need = String(need());
    board.dataset.slots = String(slots.length - placed.length);
    for (const [i, slot] of slots.entries()) {
      slot.replaceChildren(...(placed[i] ? [placed[i].box] : []));
      slot.classList.toggle('is-full', Boolean(placed[i]));
      slot.disabled = gate.held || !placed[i];    // لا ردَّ لخانةٍ فارغة
    }
    tip.hidden = placed.length === 0;
    // **التجاوزُ امتناعٌ في البنية**: ما يزيد على ما بقي لا يُلمَس أصلاً
    for (const cell of cards) {
      cell.btn.disabled = gate.held || placed.length >= slots.length
        || cell.drawn > need() || spent.has(cell.drawn);
    }
  }
  gate.onFree = paint;

  /** ردُّ جزءٍ وُضع — **الالتقاطُ يُراجَع بالإصبع** (نظيرُ «أعطني ن»). */
  const take = gate.guard((index) => {
    if (!placed[index]) return;
    placed.splice(index, 1);
  });

  for (const [i, slot] of slots.entries()) {
    slot.addEventListener('click', () => take(i));
  }

  /** جولةٌ جديدة داخل الجولة: **الطريقةُ الثانية** — لا تُعاد قيمتا الأولى. */
  async function anotherWay() {
    second = true;
    for (const p of placed) spent.add(p.drawn);
    placed.length = 0;
    head.textContent = ASK.again;
    hint.textContent = 'جُزْآنِ غَيْرُ اللَّذَيْنِ صَنَعْتَ بِهِمَا';
    paint();
    await say(ASK.again);
  }

  const judge = gate.guard(async () => {
    const correct = need() === 0;
    hooks.attempt(round, correct);
    if (correct) {
      for (const slot of slots) slot.classList.add('good');
      pop(board);
      paint();
      if (round.ways && !second) {
        await say(SAY.bravo);
        if (!hooks.alive()) return;
        for (const slot of slots) slot.classList.remove('good');
        await anotherWay();      // والجولةُ لم تنتهِ: تُرَدّ الحريةُ عند الخروج
        return;
      }
      gate.end();
      await praiseThen(hooks);
      return;
    }
    shake(board);
    paint();
    // **يُعَدُّ الكلُّ أمامه** — يرى كم كان يريد، ولا يُقال له أيَّ جزأين يختار
    await say(SAY.together);
    if (!hooks.alive()) return;
    checkBox.hidden = false;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    await countAloud([check], hooks.alive);
    checkBox.hidden = true;
    clearCount(check);
    placed.length = 0;
  });

  for (const spec of round.options) {
    let cell = null;
    const choose = async () => {
      if (gate.held || placed.length >= slots.length) return;
      placed.push(figureBox(spec));
      paint();
      if (placed.length === slots.length) await judge();
    };
    cell = quantityCard(spec, { label: 'هَذَا الجُزْء', onclick: choose });
    cards.push(cell);
    choices.append(cell.btn);
  }

  paint();
  say(round.ask);

  return h('div', {}, head, hint, board,
    round.aid && h('div', { class: 'q-aid' }, figureBox(round.aid).box),
    checkBox, choices, tip);
}

// ————— شاشةُ «كم بقي لتمتلئ العشرة؟» —————

/**
 * إطارٌ فيه بعضُه وخاناتُه الفارغة ظاهرة — **والسَّعةُ تُقرأ من خاناته المرسومة**
 * (`fig.cells`) لا من عددٍ مكتوب هنا، فلا تدّعي الشاشةُ عشرةً لم تُرسَم.
 */
function restView(round, hooks) {
  const frame = figureBox(round.frame, 'q-bond-frame');
  const rest = frame.cells.length - frame.drawn;
  const board = h('div', { class: 'q-bond q-bond--frame' }, frame.box);
  board.dataset.need = String(rest);
  board.dataset.slots = '1';
  // **العونُ في «جرِّب معي»**: الخاناتُ الفارغة تُعلَّم فتُرى مكاناً ينتظر
  if (round.aided) for (const cell of frame.cells.slice(frame.drawn)) cell.classList.add('is-open');

  const choices = h('div', { class: 'q-choices' });
  const gate = roundGate('كم بقي للعشرة؟');

  for (const spec of round.options) {
    let cell = null;
    // ولا نقرةَ ثانيةً تفتح تصحيحاً فوق تصحيح — والقفلُ يُرَدّ في كل حال (البلاغ ٦)
    const choose = gate.guard(async () => {
      const correct = cell.drawn === rest;
      hooks.attempt(round, correct);
      if (correct) {
        gate.end();
        cell.btn.classList.add('good');
        pop(cell.btn);
        await praiseThen(hooks);
        return;
      }
      cell.btn.classList.add('bad');
      shake(cell.btn);
      await say(SAY.together);
      if (!hooks.alive()) return;
      await new Promise((r) => setTimeout(r, BEAT / 2));
      if (!hooks.alive()) return;
      // **تُعَدُّ الخاناتُ الفارغة أمامه** — يرى ما بقي مكاناً مكاناً لا رقماً يُقال
      await countCells(frame, hooks.alive);
      clearCells(frame);
      cell.btn.classList.remove('bad');
    });
    cell = quantityCard(spec, { label: 'هَذَا مَا بَقِي', onclick: choose });
    choices.append(cell.btn);
  }

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board,
    choices);
}

const VIEWS = { pair: pairView, rest: restView };
const viewOf = (round, hooks) => VIEWS[round.mode](round, hooks);

// ————— التسجيل في الموجِّه وفي المراجعة —————

function screen(part) {
  const station = stationById(`bond:${part}`);
  if (!station) return null;
  return stationScreen({
    nodeId: station.id,
    title: station.title,
    accent: BOND_ACCENT,
    make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x27d4eb2f),
    view: viewOf,
    score,
    save: (stars) => progress.setStars(station.id, stars),
  });
}

registerScreen('bond', screen);

/**
 * جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات.
 *
 * **وتُرَدّ `null` لِما ليس من هذا النوع**: نوعُ التمرين `make` يشترك فيه مفهومان
 * (`equal|5|make` و`bond|10|make` — `METHOD.md §٦`)، فيُسأل كلُّ مالكٍ عن المهارة
 * ويجيب صاحبُها (`registerExercise` في `station.js`).
 */
function reviewRound(skill, rnd) {
  const station = stationForSkill(skill);
  if (!station || !TYPES.has(station.type)) return null;
  if (restShare(station) === 'all') return restRound(station, rnd);
  return pairRound(station, rnd, { whole: wholesOf(station, 1, rnd)[0] ?? station.frontier.max });
}

registerExercise('make', { build: reviewRound, view: viewOf });
