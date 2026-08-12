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
// «أطولُ وأقصر · أثقلُ وأخفّ» (٨·٣) و«قبلُ وبعد» (٨·٤): مشهدٌ فيه **الشيءُ نفسُه
// بمقادير** واقفاً على خطٍّ واحد — فالفرقُ ارتفاعٌ يُرى لا موضعٌ يخدع، والمقارنةُ على
// المقدار لا على الصنف. **والمقدارُ المرسوم مُعلَنٌ** (`data-size`) فتقرأ الشاشةُ منه
// الأطولَ والأقصر — امتدادُ «الجوابُ من المرسوم» إلى ما ليس كمّاً.
//
// ————— وثلاثةُ عهودٍ أخرى —————
//
// ١) **لا رمزَ عمليةٍ ولا عملية**: جبهةُ المرحلة كلِّها `ops: []` و`signs: []`.
// ٢) **الخطأُ يُرى ولا يُلقَّن**: في النمط **يُضاء الشريطُ دورةً دورة** فيُرى الإيقاعُ
//    نفسُه، وفي القياس **يُضاء الأطولُ والأقصر بترتيب المقدار** فيُرى الفرق.
// ٣) **لا مؤقّتَ ولا عقاب**، والخيارُ الخاطئ لا ينقل.

import * as progress from './progress.js';
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
 * جولةُ قياسٍ: مشهدٌ فيه الشيءُ نفسُه بمقادير — **والسؤالُ أطولُ أم أقصر** (أو أثقل
 * وأخفّ: الشيءُ الواحد كلّما كبر ثقُل، وهي مقارنةٌ مباشرة كما ينصّ المنهج).
 *
 * **و«قبلُ وبعد» ترتيبٌ لا اختيار**: المقاديرُ الثلاثةُ مشهدُ شيءٍ **ينمو**، فيُرتَّب
 * من الأول إلى الآخر — الأصغرُ أوّلُ ما كان.
 */
function measureRound(station, rnd, { face, aided = false } = {}) {
  const skill = skillOf(station, 'measure', MEASURE[face].count > 2 ? 'sort' : 'pick');
  const next = seeder(rnd);
  const { count } = MEASURE[face];
  const ranks = shuffle(Array.from({ length: count }, (_, i) => i + 1), rnd);
  const glyph = pick(OBJECTS, rnd).glyph;
  const scene = { display: 'scene', count, seed: next(), glyph, ranks };
  const big = face !== 'time' && rnd() < 0.5;

  return {
    kind: skill.kind, concept: skill.concept, range: face, mode: face === 'time' ? 'sort' : 'pick',
    aided,
    ask: face === 'time' ? ASK.order : ASK[big ? MEASURE[face].big : MEASURE[face].small],
    hint: face === 'time'
      ? 'اِلْمَسِ الأَصْغَرَ أَوَّلًا — فَهُوَ مَا كَانَ قَبْل'
      : 'قَارِنْ بِعَيْنِكْ، ثُمَّ الْمَسْ',
    // **المطلوبُ أكبرُ المقادير أم أصغرُها** — والحكمُ من `data-size` في الرسم
    big,
    scene,
    figures: [scene],
    sig: `${station.id}|${face}|${ranks.join('')}|${scene.seed}`,
  };
}

/** أوجهُ المحطة **من مفاتيحها في المنهج** — لا قائمةَ أوجهٍ مكتوبةٌ في شاشة. */
function stationFaces(station) {
  return station.type === 'pattern'
    ? facesOf(station, 'pattern', 'extend')
    : [...facesOf(station, 'measure', 'pick'), ...facesOf(station, 'measure', 'sort')];
}

/** جولةُ وجهٍ بعينه. */
const roundFor = (station, rnd, face, aided) => (station.type === 'pattern'
  ? patternRound(station, rnd, { face, aided })
  : measureRound(station, rnd, { face, aided }));

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
     من الأصغر إلى الأكبر — وهو جوابُ «أيُّهما أطول» وجوابُ «قبلُ وبعد» معاً.
     **ولا يُترَك للقرعة**: رتبٌ مبعثرةٌ قد تقع مرتَّبةً فيتطابق الكشفُ والمشهد فلا
     يُرى شيء (أظهرته المراجعةُ البصرية) — فتُدار الرتبُ دورةً واحدة، وهي **أبداً
     غيرُ المرتَّبة** مهما كان العدد. */
  const { count } = MEASURE[face];
  const glyph = pick(OBJECTS, rnd).glyph;
  const sorted = face === 'time';
  const ranks = Array.from({ length: count }, (_, i) => i + 1);   // الأصغرُ يمنة
  return {
    title: sorted ? ASK.order : ASK.taller,
    hint: sorted
      ? 'يَكْبَرُ شَيْئًا فَشَيْئًا — فَالأَصْغَرُ كَانَ قَبْل'
      : 'نَنْظُرُ إِلَيْهَا مَعًا، فَنَرَى أَيُّهَا أَطْوَل',
    figures: [{
      display: 'scene', count, seed: next(), glyph, ranks: [...ranks.slice(1), ranks[0]],
    }],
    count: (figs, alive) => walkScene(figs[0], alive),
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

/** أشياءُ المشهد بمقاديرها المرسومة — **من الـDOM لا من الطلب**. */
const sceneItems = (fig) => [...fig.el.querySelectorAll('[data-item]')]
  .map((el) => ({ el, size: Number(el.dataset.size) }));

/**
 * **يُضاء المشهدُ من الأصغر إلى الأكبر** — فيُرى التدرّجُ نفسُه: هو جوابُ «أيُّهما
 * أطول» وجوابُ «قبلُ وبعد» معاً، ويُقرأ من المقادير المرسومة لا من رتبةٍ نويناها.
 */
async function walkScene(fig, alive = () => true) {
  const items = sceneItems(fig).sort((a, b) => a.size - b.size);
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
     ٨·٣ وجهان (طولٌ وثِقَل)، فلو بُنيت بالقرعة لَجاز أن يُمتحَن في وجهٍ ويُترَك آخر. */
  const step = (count, aided) => Array.from({ length: count },
    (_, i) => roundFor(station, rnd, faces[i % faces.length], aided));

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
  const order = [...items].sort((a, b) => a.size - b.size);
  // **الحكمُ من المقدار المرسوم**: أكبرُ ما رُسِم أو أصغرُه — لا رتبةٌ نويناها
  const want = round.mode === 'sort' ? order : [round.big ? order[order.length - 1] : order[0]];
  board.dataset.answer = String(want[0].size);
  let placed = 0;
  let locked = false;

  const taps = items.map(({ el, size }) => {
    const btn = h('button', {
      class: 'q-pickspot',
      'aria-label': 'هَذَا',
      'data-size': String(size),
      onclick: () => choose(btn, el, size),
    });
    // زرٌّ يسكن موضعَ الشيء نفسِه — مقاسُه ومكانُه من المصيِّر لا من حسابٍ ثانٍ
    for (const key of ['--x', '--y', '--d']) {
      btn.style.setProperty(key, el.style.getPropertyValue(key));
    }
    scene.box.append(btn);
    return btn;
  });

  async function choose(btn, el, size) {
    if (locked || btn.disabled) return;
    const correct = size === want[placed].size;
    hooks.attempt(round, correct);
    if (correct) {
      btn.classList.add('good');
      el.classList.add('is-counted');
      pop(btn);
      placed++;
      if (placed < want.length) {
        btn.disabled = true;
        board.dataset.answer = String(want[placed].size);
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
    // **الخطأُ يُرى**: يُضاء المشهدُ من الأصغر إلى الأكبر فيُدرَك التدرّجُ بالعين
    await say(SAY.together);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    if (!(await walkScene(scene, hooks.alive))) return;
    clearScene(scene);
    for (const tap of taps) {
      tap.classList.remove('bad', 'good');
      tap.disabled = false;
    }
    for (const item of items) item.el.classList.remove('is-counted');
    placed = 0;
    board.dataset.answer = String(want[0].size);
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
