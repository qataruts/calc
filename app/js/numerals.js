// **المرحلة ٣ — الرموز ٠–١٠** (`METHOD.md §٣`): ثماني محطاتٍ بشاشةٍ واحدة.
//
//   `numeral`  «رُمُوزُ ١ ٢ ٣» ثم «ثَبِّتْ» ثم «٤ ٥» و«٦ ٧» و«٨ ٩» و«العَشَرَة»،
//              وآخرُها **الصِّفْر** بإطارٍ فارغ.
//
// ————— حلقةُ تقديم الرمز: أربع خطواتٍ بترتيبها، والترتيبُ هو الدرس —————
//
// نصُّ `METHOD.md §٣`: «كميةٌ معروضة ← تُعدّ ← يظهر الرمزُ فوقها ← مطابقةُ رمز↔كمية
// **ذهاباً وإياباً**». وهي هنا:
//   ١) **شاهِدْ**: كميةٌ تُعَدّ أمامه عنصراً عنصراً، **ثمّ** يُكشَف رمزُها ويُسمّى
//      (`model.reveal` في `station.js`) — ولا يُعرَض الرمزُ قبل العدّ بحال: الرمزُ
//      **تسميةٌ لمعروف**، ولو ظهر مع الكمّية لصار صورةً ثانيةً تُحفَظ (`METHOD.md §٢.١`).
//   ٢) **جَرِّبْ مَعِي**: جولتان بعونٍ مرئيّ، غيرُ مقيستين.
//   ٣) **وَحْدَكْ**: الجولاتُ تتناوب اتجاهين لا اتجاهاً واحداً —
//      **ذهاباً** كمّيةٌ معروضة وبطاقاتُ رموز، **وإياباً** رمزٌ معروض وبطاقاتُ كمّيات.
//      فمن حفظ صورةَ الاتجاه الواحد لم ينفعه حفظُه، ولا يُقاس الرمزُ إلا بالوجهين.
//   ٤) **كافِئْ**.
//
// ————— وأربعةُ عهودٍ تحكم هذه الوحدة —————
//
// ١) **الرمزُ من المصيِّر لا من الشاشة**: بطاقةُ الرمز `numeral` في `render.js`،
//    ورقمُها **يُقرأ من الرسم** (`drawn`) كما يُقرأ عددُ النقاط — فيلتقي طرفا المطابقة
//    على عددٍ واحد **كلاهما مقروءٌ لا مدَّعىً**. ولا يكتب هذا الملفُّ رقماً بيده أبداً.
// ٢) **الأرقامُ مشرقيةٌ حصراً** (ق١، `METHOD.md §٩`) — ومصدرُها `arNum` في المصيِّر.
// ٣) **مفتاحُ ليتنر لكلِّ رمزٍ على حدة** (`numeral|7|match` — `METHOD.md §٦`): فمدى
//    الجولة **هو الرمزُ المسؤول عنه**، وما تدرّسه المحطةُ مقروءٌ من `skills` في المنهج
//    لا مكتوبٌ هنا. وبه يعود إلى المراجعة **الرمزُ الضعيف بعينه** لا مرحلةٌ كاملة.
// ٤) **الخطأُ يُعَدّ أمامه ولا يُلقَّن**: ذهاباً تُعَدّ الكميةُ فيسمع آخرَ اسمٍ نطقناه
//    (العدديّة هي الجواب)، وإياباً يُسمّى الرمزُ المعروض — وهو **السؤالُ لا الجواب** —
//    وتُعَدّ البطاقةُ التي لمس فيسمع أنّها تنتهي إلى اسمٍ آخر.

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { rangeOf } from './render.js';
import { h, pick, shuffle, seeded, shake, pop, NUMERAL_ACCENT } from './ui.js';
import {
  BEAT, NUMBER_NAME, SAY, say, praiseThen, span, nearOptions, seeder, rangesOf,
  stationById, stationForSkill, figureBox, quantityCard, numeralCard, countAloud,
  clearCount, usedOf, registerExercise, stationScreen,
} from './station.js';

const OPTIONS = 3;         // ثلاثُ بطاقات: هدفٌ ومجاوران (`METHOD.md §٣`)
const GUIDED = 2;          // «جرِّب معي» — جولتان بعونٍ مرئيّ

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['numeral']);

// ————— التعليماتُ المنطوقة —————
//
// **مُعلَنةٌ لا مستنتَجة** (`check_speech.mjs`): لكلٍّ ملفٌّ مولَّد أو مكانٌ في
// `tools/audio_queue.json`. ولا رقمَ في نصٍّ منطوق (ق١)، ولا معدودٌ مقرونٌ بعدد (ق٢).

// **وجملةُ الكشف ليست هنا**: «وَهَذَا رَمْزُهَا» عرضٌ يُشاهَد لا فعلٌ يُطلَب، فموضعُها
// جدولُ `SAY` في `station.js` (`SAY.reveal`) — وبموضعها تُشتقّ فئتُها `modeling` لا
// `instruction`، فتُصرَّف بمسحة النمذجة (حكمُ المدير، مراجعة الجلسة ٤ البند ٥).

const ASK = {
  toNumeral: 'أَيُّ رَمْزٍ لَهَا؟',
  toQuantity: 'أَيْنَ هَذَا الْعَدَدْ؟',
};

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// **الإعلانُ أرضيةٌ لا سقف**: لهذا النوع ثماني محطاتٍ جبهاتُها مختلفة (١–٣ … ٠–١٠)،
// والحارسُ يقابل الإعلانَ **بكلٍّ منها** — فالمُعلَن ما تشترك فيه كلُّها: الأعدادُ
// والرموزُ ١–٣، والأنماطُ المبعثرُ وعناصرُ عالم الطفل وبطاقةُ الرمز. وما زاد في محطةٍ
// بعينها **يُجرَد جولةً جولة** على جبهتها في `probeRounds`.

export const CONSUMES = {
  numeral: {
    numbers: [1, 2, 3], numerals: [1, 2, 3], ops: [], signs: [],
    displays: ['scatter', 'objects', 'numeral'],
  },
};

// ————— اختيارُ الأنماط من جبهة المحطة —————

/**
 * نمطُ الكمّية التي يُسمّى رمزُها — من جبهة المحطة، **ومن يستطيع رسمَ هذا العدد**
 * (مدى النمط مُعلَنٌ في المصيِّر: لا وجهَ نردٍ لسبعة، ولا إطارَ خمسةٍ لثمانية).
 *
 * **والصفرُ إطارٌ فارغ لا ساحةٌ خالية** (`METHOD.md §٣` — ٣·٨): الخانةُ الفارغة تقول
 * «لا شيءَ هنا» ويُرى مكانُه؛ والساحةُ الخالية تقول «لم يُرسَم شيء» فتلتبس بالعطب.
 */
function quantityDisplay(frontier, count, rnd, { frame = false } = {}) {
  const usable = frontier.displays
    .filter((d) => d !== 'numeral' && d !== 'line')
    .filter((d) => {
      const range = rangeOf(d);
      return range && count >= range.min && count <= range.max;
    });
  const frames = usable.filter((d) => d.endsWith('-frame'));
  // **والنمذجةُ تُفضّل الإطار حيث تُتيحه الجبهة**: إطارُ الخمسة يدخل في ٣·٣ وإطارُ
  // العشرة في ٣·٥ وهو «عمودٌ فقريّ» بنصّ `METHOD.md §٣` — فمحطةٌ تُقدِّمه في عنوانها
  // تعرضه في نمذجتها. وفي الجولات يدور النمطُ على ما تُتيحه الجبهة (التجريد).
  if (count === 0 || frame) return frames[0] || usable[0];
  return pick(usable, rnd);
}

/** نمطٌ **واحد** لبطاقات الجولة كلِّها: بطاقاتٌ بأنماطٍ مختلفة تقارن شكلين لا كمّين. */
function cardDisplay(frontier, counts, rnd) {
  const low = Math.min(...counts);
  const high = Math.max(...counts);
  const usable = frontier.displays
    .filter((d) => d !== 'numeral' && d !== 'line')
    .filter((d) => {
      const range = rangeOf(d);
      return range && low >= range.min && high <= range.max;
    });
  const frames = usable.filter((d) => d.endsWith('-frame'));
  if (low === 0) return frames[0] || usable[0];
  return pick(usable, rnd);
}

// ————— أهدافُ الجولات: ما تدرّسه المحطةُ أولاً، ثم مراجعةٌ لِما دونه —————

/**
 * **الجبهةُ سقفٌ والرموزُ المُعلَنةُ درس** (نظيرُ `focusPool` في `counting.js`): تُبنى
 * أهدافُ الجولات من **مفاتيح المحطة نفسِها** (`numeral|٦|match` و`numeral|٧|match`)،
 * ويُكمَّل ما بقي مراجعةً من رموزٍ دونها في الجبهة — فلا رقمَ يُكتب هنا لا يعرفه المنهج.
 */
function targetsOf(station, count, rnd) {
  const taught = rangesOf(station, 'numeral', 'match');
  const f = station.frontier;
  const older = span(f.min, f.numeral).filter((n) => !taught.includes(n));
  const focus = Math.max(taught.length, Math.ceil((count * 2) / 3));
  const out = [];
  while (out.length < focus) out.push(...shuffle(taught, rnd));
  const rest = shuffle(older, rnd);
  for (let i = 0; out.length < count; i++) {
    out.push(rest.length ? rest[i % rest.length] : pick(taught, rnd));
  }
  return out.slice(0, count);
}

// ————— بناءُ الجولات (حتميٌّ ببذرة) —————

/**
 * جولةُ مطابقةٍ في أحد الاتجاهين.
 * @param {boolean} toNumeral **ذهاباً**: كمّيةٌ معروضة وبطاقاتُ رموز.
 *                            وإلّا **إياباً**: رمزٌ معروض وبطاقاتُ كمّيات.
 */
function matchRound(station, rnd, { target, toNumeral, aided = false }) {
  const f = station.frontier;
  const pool = span(f.min, f.numeral);
  const counts = shuffle([target, ...nearOptions(target, pool, OPTIONS - 1, rnd)], rnd);
  const next = seeder(rnd);
  const card = cardDisplay(f, counts, rnd);
  const hero = { display: quantityDisplay(f, target, rnd), count: target, seed: next() };
  const symbol = { display: 'numeral', count: target, seed: next() };

  const options = toNumeral
    ? counts.map((c) => ({ display: 'numeral', count: c, seed: next() }))
    : counts.map((c) => ({ display: card, count: c, seed: next() }));

  return {
    kind: 'match', concept: 'numeral', range: target, toNumeral, aided,
    ask: toNumeral ? ASK.toNumeral : ASK.toQuantity,
    hint: toNumeral
      ? 'عُدَّهَا، ثُمَّ اخْتَرْ رَمْزَهَا'
      : 'اِخْتَرِ الْكَمِّيَّةَ الَّتِي يُسَمِّيهَا هَذَا الرَّمْز',
    subject: toNumeral ? hero : symbol,
    // **العونُ المرئيّ في «جرِّب معي»**: الطرفان معاً (`METHOD.md §٤`) — وفي «وحدك» طرفٌ
    aid: aided ? (toNumeral ? symbol : hero) : null,
    options,
    figures: [hero, symbol, ...options],
    sig: `${station.id}|${target}|${hero.seed}`,
  };
}

/** خطةُ المحطة: نمذجةٌ بكشف الرمز، ثم جولتان بعون، ثم «وحدك» بالاتجاهين. */
export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const f = station.frontier;
  const next = seeder(rnd);
  const taught = rangesOf(station, 'numeral', 'match');

  // **جولاتُ «وحدك» أربعٌ إلى ستّ** (`METHOD.md §٤`) — والأكثرُ لمحطةٍ تدرّس رموزاً
  // أكثر، فلا يُختصر رمزٌ من رموزها. محسوبٌ من المنهج لا مكتوباً بيد.
  const solo = Math.min(6, Math.max(4, taught.length + 3));

  const shown = taught[0];
  const model = {
    title: ASK.toNumeral,
    hint: shown === 0
      ? 'إِطَارٌ فَارِغ — لَا شَيْءَ فِيهِ، وَلِهَذَا رَمْزُهُ'
      : 'نَعُدُّهَا مَعًا، ثُمَّ يَظْهَرُ رَمْزُهَا',
    figures: [{
      display: quantityDisplay(f, shown, rnd, { frame: true }), count: shown, seed: next(),
    }],
    reveal: { say: SAY.reveal, figures: [{ display: 'numeral', count: shown, seed: next() }] },
  };

  const guided = targetsOf(station, GUIDED, rnd).map((target, i) =>
    matchRound(station, rnd, { target, toNumeral: i % 2 === 0, aided: true }));
  const alone = targetsOf(station, solo, rnd).map((target, i) =>
    matchRound(station, rnd, { target, toNumeral: i % 2 === 0 }));

  return { model, guided, solo: alone };
}

/** جردُ الجولات للحارس — **النمذجةُ والعونُ و«وحدك» كلُّها**، فلا شكلَ يفلت. */
export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة (بابُ الشيفرة في `test_measure.mjs`: مَن أعلن قياساً كتبه) —————

const SCORE = {
  match: (r, ok) => progress.recordAttempt(r.concept, r.range, 'match', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

// ————— الشاشة —————

/**
 * مطابقةُ رمزٍ بكمّ في الاتجاهين.
 *
 * **والحكمُ من المرسوم في الطرفين**: `drawn` بطاقةِ الرمز رقمُها المقروءُ من نصّها،
 * و`drawn` بطاقةِ الكمّية عددُ عناصرها المعدودُ من الـDOM — فيلتقيان على عددٍ واحد،
 * ولا تدّعي شاشةٌ عدداً لم يُرسَم.
 */
function matchView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-hero' });
  const subject = figureBox(round.subject);
  stage.append(subject.box);

  const aidBox = h('div', { class: 'q-aid' });
  if (round.aid) aidBox.append(figureBox(round.aid).box);

  const choices = h('div', { class: 'q-choices' });
  let locked = false;

  /** **الخطأ يُعَدّ ولا يُلقَّن** — والمعدودُ كمّيةٌ حاضرة: المعروضةُ ذهاباً، والمَلْموسةُ إياباً. */
  async function correction(card, chosen) {
    locked = true;
    // الرمزُ المعروض سؤالٌ لا جواب — فلا يُسمّى إلا حين تكون الكميّةُ هي المعروضة
    if (!round.toNumeral) await say(NUMBER_NAME[round.range]);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    const counted = round.toNumeral ? subject : chosen;
    if (!(await countAloud([counted], hooks.alive))) return;
    card.classList.remove('bad');
    clearCount(counted);
    locked = false;
  }

  for (const spec of round.options) {
    let cell = null;
    const choose = async () => {
      if (locked) return;
      const correct = cell.drawn === subject.drawn;
      hooks.attempt(round, correct);
      if (correct) {
        locked = true;
        cell.btn.classList.add('good');
        pop(cell.btn);
        await praiseThen(hooks);
        return;
      }
      cell.btn.classList.add('bad');
      shake(cell.btn);
      locked = true;                 // ولا نقرةَ ثانيةً تفتح تصحيحاً فوق تصحيح
      await say(SAY.together);
      if (!hooks.alive()) return;
      await new Promise((r) => setTimeout(r, BEAT / 2));
      if (hooks.alive()) await correction(cell.btn, cell);
    };
    cell = spec.display === 'numeral'
      ? numeralCard(spec.count, spec.seed, { label: 'هَذَا الرَّمْز', onclick: choose })
      : quantityCard(spec, { label: 'هَذِهِ', onclick: choose });
    choices.append(cell.btn);
  }

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    stage,
    round.aid && aidBox,
    choices,
  );
}

// ————— التسجيل في الموجِّه وفي المراجعة —————

function screen(part) {
  const station = stationById(`numeral:${part}`);
  if (!station) return null;
  return stationScreen({
    nodeId: station.id,
    title: station.title,
    accent: NUMERAL_ACCENT,
    make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0xc2b2ae35),
    view: matchView,
    score,
    save: (stars) => progress.setStars(station.id, stars),
  });
}

registerScreen('numeral', screen);

/**
 * جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات.
 * **ويُطلَب الرمزُ الضعيفُ بعينه** إن كانت محطتُه تدرّسه، وإلّا فمن رموزها — فالمراجعةُ
 * تعيد ما ضعف لا ما جاوره (وهو معنى «مفتاحٌ لكل رمز»).
 */
function reviewRound(skill, rnd) {
  const station = stationForSkill(skill);
  if (!station || !TYPES.has(station.type)) return null;
  const taught = rangesOf(station, 'numeral', 'match');
  const target = taught.includes(skill.range) ? skill.range : pick(taught, rnd);
  return matchRound(station, rnd, { target, toNumeral: rnd() < 0.5 });
}

registerExercise('match', { build: reviewRound, view: matchView });
