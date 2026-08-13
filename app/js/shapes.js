// **المرحلة ٩ — الأَشْكَالُ الأُولَى** (`METHOD.md §٣`، تعديلٌ معتمد ١٣ أغسطس ٢٠٢٦):
// أربعُ محطاتٍ بشاشةٍ واحدةٍ ثلاثةُ أوجه.
//
//   `shape:pair`   «الدَّائِرَةُ وَالمُثَلَّث» — تمييزٌ بين **متباعدَي الصورة**
//   `shape:twins`  «المُرَبَّعُ وَالمُسْتَطِيل» — **الشبيهان قصداً** بعد التباعد
//   `shape:sides`  «كَمْ ضِلْعًا؟» — **العدُّ المتقن يخدم الهندسة**
//   `shape:world`  «الأَشْكَالُ حَوْلَنَا» — الشكلُ في الحياة لا في الورقة
//
// ————— لِمَ جاءت في الذيل لا في الصدر —————
//
// عدُّ الأضلاع **يوظّف عدّاً متقناً** (لمسةٌ لكلّ ضلعٍ ثم «كم صارت كلها؟» — وهي
// «المس وعُدّ» بعينها على ما ليس كمّاً)، فلا يسبق درسَه. وبوابةُ الختام **تشملها
// بمداها المعلَن** (الرحلة كلُّها) فلا تدريسَ بلا بوابة. والتطبيقُ **حيٌّ بأجهزة
// أطفال**، والإضافةُ في الذيل لا تزحزح محطةً قائمة (`METHOD.md §٣` المرحلة ٩).
//
// ————— وعهودُ الشاشة كما هي، ولها هنا وجهُها —————
//
// ١) **لا نصَّ تشغيلياً واحداً** (`FIELD.md §٤` — قاعدةُ اللاقراءة): السؤالُ **يُسمَع**
//    والجوابُ **بطاقةُ شكلٍ تُرى** أو لمسةٌ على المرسوم — ولا زرَّ فيه حروفٌ وحدَها.
// ٢) **التناظرُ الفرديّ في عدّ الأضلاع**: الضلعُ الملموس يُعلَّم **ويُعطَّل زرُّه**،
//    فلا يُحتسَب مرتين ولو ألحّ الإصبع — امتناعٌ في البنية لا تحقّقٌ بعده.
// ٣) **الخطأُ يُعَدّ أمامه ولا يُلقَّن**: يُضاء الشكلُ المطلوب وتُعَدّ أضلاعُه واحداً
//    واحداً ثم يُسمّى — فيرى الصوابَ **عدّاً** (`METHOD.md §٤`)، والدائرةُ تُضاء
//    وتُسمّى (لا ضلعَ فيها يُعَدّ، وذلك عينُ ما يميّزها).
// ٤) **الصوتُ عبر القناة**: `say` تُنتظَر، والانتقالُ بعد تمام الكلمة (`praiseThen`).
// ٥) **الجوابُ من المرسوم**: صنفُ الشكل يُقرأ من `data-shape`، وعددُ الأضلاع من
//    `data-sides` **الذي عدّه المصيِّرُ من قِطَعه** — لا من جدولٍ ولا من نيّة المولّد.
//
// ————— ولا رمزَ عدديّ إلا حيث يُعَدّ —————
//
// جبهةُ المرحلة `ops: []` و`signs: []`، وأقصى رمزٍ فيها **خمسة** — بطاقاتُ جواب
// «كم ضلعاً؟» وحدَها (٣ و٤ وجاراهما). ولا عددَ فوق ذلك: **مجالٌ لا مدى** (ق٣ لم يُمَسّ).

import * as progress from './progress.js';
import { SHAPES, shapeOf, shapesUpTo, shapesAt, stations, thingsWith } from './curriculum.js';
import { registerScreen } from './registry.js';
import { h, pick, shuffle, seeded, shake, pop, PATTERN_ACCENT } from './ui.js';
import {
  BEAT, NUMBER_NAME, SAY, say, praiseThen, span, nearOptions, seeder, skillOf, countMarks,
  stationById, stationForSkill, figureBox, numeralCard, quantityCard, touchLayer, usedOf,
  registerExercise, stationScreen,
} from './station.js';

const OPTIONS = 3;
const GUIDED = 2;
const SOLO = 5;

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['shape']);

// ————— التعليماتُ المنطوقة (مُعلَنةٌ لا مستنتَجة — `check_speech.mjs`) —————
//
// **وسؤالُ كلِّ شكلٍ جملةٌ واحدة** لا تركيبَ اسمٍ على تعليمة: «أَيْنَ الدَّائِرَةْ؟»
// تُصرَّف مرّةً فتُسمَع جملةً عربيةً تامّة، ولو رُكِّبت من ملفّين لَسُمعت مقطوعةً في
// أذن طفل. **وأسماءُ الأشكال الأربعة من `SHAPES` في المنهج** لا مكتوبةً هنا: مَن
// كتب الشكلَ يسمّيه (كما يفعل `CONCEPTS` بمفاتيح ليتنر).

const ASK = {
  circle: 'أَيْنَ الدَّائِرَةْ؟',
  triangle: 'أَيْنَ الْمُثَلَّثْ؟',
  square: 'أَيْنَ الْمُرَبَّعْ؟',
  rect: 'أَيْنَ الْمُسْتَطِيلْ؟',
  /* **ودعوةُ العدّ هي دعوتُه في ٢·١ بلفظها**: «الْمِسْ وَعُدَّ» تعلّمها الطفلُ على
     الكميات، وهذه المحطةُ هي هي على ما ليس كمّاً — فيُسمَع اللفظُ الذي يعرفه ولا
     يُخترَع له ثانٍ. **وملفُّها مصروفٌ في البنك** (الدفعة الأولى) فلا تزيد القائمةَ
     سطراً، وإعلانُها هنا إعلانُ ما تنطقه هذه الوحدةُ فعلاً (`check_speech.mjs`). */
  touch: 'الْمِسْ وَعُدَّ',
  sides: 'كَمْ ضِلْعًا؟',
};

export const SPOKEN = [...Object.values(ASK), ...SHAPES.map((s) => s.name)];

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// أرضيةُ ما تشترك فيه جبهاتُ محطات النوع الأربع: لوحُ أشكالٍ واحد على الأقلّ ولا رمز
// — وما زاد (بطاقاتُ «كم ضلعاً؟» وأجزاءُ شيء العالم) يُجرَد **جولةً جولة**.

export const CONSUMES = {
  shape: { numbers: [1], numerals: [], ops: [], signs: [], displays: ['shape'] },
};

/** اسمُ الشكل المنطوق — من بيانات المنهج (`SHAPES`) لا من جدولٍ ثانٍ هنا. */
const nameOf = (kind) => shapeOf(kind)?.name || '';

/** الأشكالُ التي تُعَدّ أضلاعُها: ما له ضلعٌ يُلمَس — والدائرةُ خارجَها بطبعها. */
const polygonsOf = (part) => shapesUpTo(part).filter((s) => s.sides > 0);

/**
 * **حوضُ خيارات الشكل: الأشبهُ فالأشبه** (قاعدةُ «المشتّتات متجاورة» — `METHOD.md §٣`).
 *
 * وجوارُ الأشكال ليس عدداً: **أشبهُ الأشكال بالمربّع مستطيلٌ** (شريكُه في محطته
 * وفي عدد أضلاعه)، ثم ما شاركه عددَ أضلاعه، ثم ما بعُد. فيُبنى الحوضُ من المُقدَّم
 * وحدَه (`shapesUpTo`) مرتَّباً بهذا القرب — يميّز الطفلُ ولا يخمّن.
 */
function nearShapes(kind, part, wanted, rnd) {
  const me = shapeOf(kind);
  const rest = shapesUpTo(part).filter((s) => s.id !== kind);
  const rank = (s) => (s.at === me.at ? 0 : s.sides === me.sides ? 1 : 2);
  return shuffle(rest, rnd)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, wanted)
    .map((s) => s.id);
}

// ————— بناءُ الجولات —————

/**
 * جولةُ «أَيْنَ هَذَا الشَّكْل؟» (٩·١ و٩·٢): يُسمَع الاسمُ وتُرى بطاقاتُ الأشكال.
 *
 * **والبطاقةُ شكلٌ مرسوم لا كلمة**، والجوابُ `data-shape` المقروءُ منها — فلو رسم
 * المصيِّرُ غيرَ ما أُعلن لَصار الصوابُ ما رُسِم ولم تكذب الشاشةُ على الطفل.
 */
function nameRound(station, rnd, { face, aided = false } = {}) {
  const skill = skillOf(station, 'shape', 'name');
  const next = seeder(rnd);
  const others = nearShapes(face, station.part, OPTIONS - 1, rnd);
  const options = shuffle([face, ...others], rnd)
    .map((kind) => ({ display: 'shape', count: 1, seed: next(), shapes: [kind] }));

  return {
    kind: 'name', concept: skill.concept, range: skill.range, mode: 'name', aided,
    face,
    ask: ASK[face],
    hint: 'انْظُرْ إِلَى الأَشْكَال، ثُمَّ الْمِسِ الَّذِي سَمِعْتَ اسْمَه',
    options,
    figures: options,
    sig: `${station.id}|${face}|${options[0].seed}`,
  };
}

/**
 * جولةُ «كَمْ ضِلْعًا؟» (٩·٣): شكلٌ واحدٌ كبير، لكلِّ ضلعٍ لمسةٌ تُعلّمه وتنطق عدده،
 * ثم يُسأل **سؤالَ العدديّة** («آخِرُ ما نطقتَ هو الجواب» — `METHOD.md §٢.٤`).
 *
 * **والجوابُ من المرسوم**: عددُ الأضلاع يُقرأ من `data-sides` الذي عدّه المصيِّرُ من
 * قِطَعه هو — لا من `SHAPES[].sides` في المنهج (وذاك يقابله الحارس).
 */
function sidesRound(station, rnd, { face, aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'shape', 'sides');
  const next = seeder(rnd);
  const board = { display: 'shape', count: 1, seed: next(), shapes: [face] };
  const sides = shapeOf(face).sides;
  const options = shuffle(
    [sides, ...nearOptions(sides, span(Math.max(f.min, 1), f.numeral), OPTIONS - 1, rnd)], rnd)
    .map((n) => ({ display: 'numeral', count: n, seed: next() }));

  return {
    kind: 'sides', concept: skill.concept, range: skill.range, mode: 'sides', aided,
    face,
    ask: ASK.sides,
    hint: 'الْمِسْ كُلَّ ضِلْعٍ مَرَّةً وَاحِدَة',
    board,
    options,
    figures: [board, ...options],
    sig: `${station.id}|${face}|${board.seed}`,
  };
}

/**
 * جولةُ «الأَشْكَالُ حَوْلَنَا» (٩·٤): شيءٌ من عالم الطفل **مبنيٌّ من أشكالنا**
 * (`SHAPES_WORLD` في المنهج)، ويُلمَس فيه الشكلُ المسموع.
 *
 * **والأشياءُ تدور بترتيب جدولها** (`nth`) فلا يُترَك واحدٌ منها، والشكلُ المسؤول
 * عنه موجودٌ فيها بالضرورة (`thingsWith`) — فلا سؤالَ بلا جواب.
 */
function worldRound(station, rnd, { face, aided = false, nth = null } = {}) {
  const skill = skillOf(station, 'shape', 'world');
  const next = seeder(rnd);
  const pool = thingsWith(face);
  const thing = pool[(nth ?? Math.floor(rnd() * pool.length)) % pool.length];
  const scene = {
    display: 'shape', count: thing.parts.length, seed: next(), thing: thing.id,
  };

  return {
    kind: 'world', concept: skill.concept, range: skill.range, mode: 'world', aided,
    face,
    ask: ASK[face],
    hint: 'الأَشْكَالُ فِي كُلِّ شَيْءٍ حَوْلَك — فَأَيْنَ هُوَ هُنَا؟',
    thing: thing.id,
    scene,
    figures: [scene],
    sig: `${station.id}|${face}|${thing.id}|${scene.seed}`,
  };
}

/** أوجهُ المحطة: ما تدرّسه هي أوّلاً (وما قبلها مراجعةٌ في حوض الخيارات). */
function stationFaces(station) {
  if (station.part === 'sides') return polygonsOf(station.part).map((s) => s.id);
  if (station.part === 'world') return shapesUpTo(station.part).map((s) => s.id);
  return shapesAt(station.part).map((s) => s.id);
}

/** جولةُ وجهٍ بعينه — و`nth` ترتيبُ الجولة في وجهها (به تدور أشياءُ العالم). */
const roundFor = (station, rnd, face, aided, nth) => {
  if (station.part === 'sides') return sidesRound(station, rnd, { face, aided });
  if (station.part === 'world') return worldRound(station, rnd, { face, aided, nth });
  return nameRound(station, rnd, { face, aided });
};

/**
 * **نمذجةُ المحطة درسُها هي** (`METHOD.md §٤`): يُرى الشكلُ ويُسمّى، وتُعَدّ أضلاعُه
 * في محطة العدّ، ويُلمَس في شيئه في محطة العالم — **بلا مطالبة**.
 */
function modelOf(station, rnd) {
  const next = seeder(rnd);
  const faces = stationFaces(station);

  if (station.part === 'sides') {
    const face = faces[0];
    return {
      title: ASK.sides,
      hint: 'نَعُدُّ أَضْلَاعَهُ ضِلْعًا ضِلْعًا، ثُمَّ نَرَى رَمْزَ عَدَدِهَا',
      figures: [{ display: 'shape', count: 1, seed: next(), shapes: [face] }],
      count: (figs, alive) => walkFigure(figs[0], alive),
      // **وحلقةُ تقديم الرمز كما هي** (`METHOD.md §٣` المرحلة ٣): يُعَدّ أوّلاً ثم
      // يُكشَف رمزُ ما عُدّ فوقه — والجملةُ جملتُها نفسُها، فلا نصَّ منطوقاً جديد.
      reveal: {
        say: SAY.reveal,
        figures: [{ display: 'numeral', count: shapeOf(face).sides, seed: next() }],
      },
    };
  }

  if (station.part === 'world') {
    const face = faces[0];
    const thing = thingsWith(face)[0];
    return {
      title: ASK[face],
      hint: 'كُلُّ شَيْءٍ حَوْلَنَا أَشْكَال — نَنْظُرُ فَنَرَاهَا فِيه',
      figures: [{ display: 'shape', count: thing.parts.length, seed: next(), thing: thing.id }],
      count: (figs, alive) => walkFigure(figs[0], alive),
    };
  }

  // **ومحطةُ التمييز تُري الشكلين معاً وتسمّيهما**: يُضاء كلٌّ ثم يُقال اسمُه
  return {
    title: ASK[faces[0]],
    hint: 'هَذَانِ شَكْلَان — نَنْظُرُ إِلَى كُلِّ وَاحِدٍ ثُمَّ نَسْمَعُ اسْمَه',
    figures: [{ display: 'shape', count: faces.length, seed: next(), shapes: faces }],
    count: (figs, alive) => walkFigure(figs[0], alive),
  };
}

// ————— «يُرى الدرسُ ويُسمَع» بدل «يُعَدّ العنصر» —————

/** أشكالُ الشكل المرسوم كما رُسمت — **من الـDOM لا من الطلب**. */
const shapesIn = (fig) => [...fig.el.querySelectorAll('[data-shape]')];

/** قِطَعُ شكلٍ مرسوم — وهي أضلاعُه التي تُعَدّ (والدائرةُ بلا قِطَع). */
const sidesIn = (el) => [...el.querySelectorAll('[data-side]')];

/** عددُ أضلاعِ شكلٍ **كما عدّها المصيِّرُ من قِطَعه** (`data-sides`). */
const sidesOf = (el) => Number(el.dataset.sides);

/** إزالةُ أثر العدّ عن شكلٍ ومحتواه. */
function clearShape(el) {
  el.classList.remove('is-counted');
  for (const side of sidesIn(el)) side.classList.remove('is-counted');
}

/**
 * **يُضاء الشكلُ وتُعَدّ أضلاعُه ثم يُسمّى** — قلبُ «الخطأ يُعَدّ أمامه ولا يُلقَّن»
 * في هذه المرحلة (`METHOD.md §٤`)، وهو عينُ نمذجتها.
 *
 * والعدُّ `countMarks` **واحدةٌ** كسائر الرحلة: تُعلَّم القِطعةُ ويُنطَق عددُها
 * ويُنتظَر تمامُه. **والدائرةُ لا ضلعَ لها** فتُضاء وتُسمّى — وذلك عينُ ما يميّزها.
 */
async function showShape(el, alive = () => true) {
  el.classList.add('is-counted');
  if (!(await countMarks(sidesIn(el), (i) => i + 1, alive))) return false;
  await say(nameOf(el.dataset.shape));
  return alive();
}

/** يمشي على أشكال الشكل المرسوم واحداً واحداً — نمذجةً أو تصحيحاً. */
async function walkFigure(fig, alive = () => true) {
  for (const el of shapesIn(fig)) clearShape(el);
  for (const el of shapesIn(fig)) {
    if (!alive()) return false;
    if (!(await showShape(el, alive))) return false;
    await new Promise((r) => setTimeout(r, BEAT / 2));
  }
  return alive();
}

// ————— خطةُ المحطة —————

export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const faces = stationFaces(station);
  if (!faces.length) return null;

  /* **والأوجهُ تدور على الجولات كلِّها**: محطةُ التمييز وجهان (فلا يُمتحَن في أحدهما
     ويُترَك الآخر)، ومحطةُ الأضلاع ثلاثة، ومحطةُ العالم أربعة — و`nth` يدير أشياءَ
     العالم بترتيب جدولها فلا يبقى شيءٌ لم يره. */
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
  name: (r, ok) => progress.recordAttempt(r.concept, r.range, 'name', ok),
  sides: (r, ok) => progress.recordAttempt(r.concept, r.range, 'sides', ok),
  world: (r, ok) => progress.recordAttempt(r.concept, r.range, 'world', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

// ————— شاشةُ «أَيْنَ هَذَا الشَّكْل؟» (٩·١ و٩·٢) —————

function nameView(round, hooks) {
  const choices = h('div', { class: 'q-choices' });
  const board = h('div', { class: 'q-solve q-solve--shape' }, choices);
  board.dataset.mode = 'name';
  // **ما تُعلنه الشاشةُ جوابُها**: صنفُ الشكل المطلوب — يقابله الحارسُ بما لُمس
  board.dataset.answer = round.face;
  let locked = false;

  const cards = round.options.map((spec) => {
    let cell = null;
    const choose = async () => {
      if (locked) return;
      // **ما رسمته البطاقةُ لا ما طُلب منها**: صنفُ الشكل مقروءٌ من الـDOM
      const drawn = cell.btn.querySelector('[data-shape]');
      const correct = drawn?.dataset.shape === round.face;
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
      locked = true;
      /* **الخطأُ يُعَدّ أمامه**: يُضاء الشكلُ المطلوب على بطاقته وتُعَدّ أضلاعُه ثم
         يُسمّى — فيرى الصوابَ عدّاً لا تلقيناً، ويربط الاسمَ برسمه بيده لا بأذنه. */
      await say(SAY.together);
      if (!hooks.alive()) return;
      const want = cards.map((c) => c.btn.querySelector('[data-shape]'))
        .find((el) => el?.dataset.shape === round.face);
      if (want && !(await showShape(want, hooks.alive))) return;
      if (!hooks.alive()) return;
      if (want) clearShape(want);
      cell.btn.classList.remove('bad');
      locked = false;
    };
    cell = quantityCard(spec, { label: 'هَذَا', onclick: choose, className: 'qcard--shape' });
    choices.append(cell.btn);
    return cell;
  });

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board);
}

// ————— شاشةُ «كَمْ ضِلْعًا؟» (٩·٣) —————
//
// **حلقةُ «المس وعُدّ» بعينها على ما ليس كمّاً**: لمسةٌ لكلِّ ضلعٍ تُعلّمه وتنطق
// عددَه **وتُعطّل زرَّه** (فلا يُحتسَب مرتين)، ثم يُسأل «كم صارت كلها؟» ببطاقات الرمز
// — والرمزُ هنا في موضعه: عددٌ عبر بواباته الثلاث قبل مراحل.

function sidesView(round, hooks) {
  const fig = figureBox(round.board, 'q-sides');
  const shapeEl = shapesIn(fig)[0];
  // **الجوابُ من المرسوم**: ما عدّه المصيِّرُ من قِطَعه هو، لا `SHAPES[].sides`
  const want = sidesOf(shapeEl);
  // **الدعوةُ أولاً ثم سؤالُ العدديّة** (رتبةُ «المس وعُدّ» في ٢·٢ نفسُها): يُلمَس
  // كلُّ ضلعٍ فيُسمّى عددُه، ثم يُسأل «كم صارت كلها؟» — وآخرُ ما نطق هو الجواب.
  const head = h('h2', {}, ASK.touch);
  const hint = h('p', { class: 'hint' }, round.hint);
  const choices = h('div', { class: 'q-choices' });
  const board = h('div', { class: 'q-solve q-solve--sides' }, fig.box);
  board.dataset.mode = 'sides';
  board.dataset.answer = String(want);
  let counted = 0;
  let asked = false;
  let locked = false;

  const sides = sidesIn(shapeEl);
  const { taps } = touchLayer(fig, async (index, btn) => {
    if (asked) return;
    counted++;
    btn.disabled = true;                     // **التناظرُ الفرديّ بنيويّ لا مراقَب**
    btn.classList.add('is-counted');
    sides[index]?.classList.add('is-counted');
    const last = counted === sides.length;
    await say(NUMBER_NAME[counted]);
    // **وسؤالُ العدديّة لا يقع بعد المغادرة** (بلاغ الميدان ٥): يُسأل الحياةُ عند وقوعه
    if (last && hooks.alive()) setTimeout(() => { if (hooks.alive()) ask(); }, BEAT);
  }, fig.plan.marks[0].sides);

  /** سؤالُ **العدديّة**: «كم ضلعاً؟» — وجوابُه بطاقةُ رمزٍ في موضعها من الرحلة. */
  function ask() {
    if (asked) return;
    asked = true;
    head.textContent = round.ask;
    hint.textContent = 'اِخْتَرِ الرَّمْزَ الَّذِي يُسَاوِي مَا عَدَدْت';
    say(round.ask);
    choices.replaceChildren(...round.options.map((spec) => {
      const { btn, drawn } = numeralCard(spec.count, spec.seed, {
        label: 'هَذَا الرَّمْز',
        onclick: async () => {
          if (locked) return;
          // **ما رسمته البطاقةُ لا ما طُلب منها**
          const correct = drawn === want;
          hooks.attempt(round, correct);
          if (correct) {
            locked = true;
            btn.classList.add('good');
            pop(btn);
            await praiseThen(hooks);
            return;
          }
          btn.classList.add('bad');
          shake(btn);
          locked = true;
          // **الخطأُ يُعَدّ أمامه**: تُعَدّ الأضلاعُ ضلعاً ضلعاً ثم يُسمّى الشكل
          await say(SAY.together);
          if (!hooks.alive()) return;
          clearShape(shapeEl);
          if (!(await showShape(shapeEl, hooks.alive))) return;
          if (!hooks.alive()) return;
          btn.classList.remove('bad');
          locked = false;
        },
      });
      return btn;
    }));
  }

  // **العونُ المرئيّ في «جرِّب معي»**: الشكلُ مُعلَّمٌ من أول لحظة فتُرى حدودُه
  if (round.aided) shapeEl.classList.add('is-open');

  say(ASK.touch);

  return h('div', {}, head, hint, board, choices);
}

// ————— شاشةُ «الأَشْكَالُ حَوْلَنَا» (٩·٤) —————
//
// **الشيءُ مبنيٌّ من أشكالنا** (`SHAPES_WORLD`): سقفُ البيت مثلثٌ رسمناه، فالدعوى
// مرسومةٌ لا مُدَّعاة — والجوابُ `data-shape` المقروءُ من الجزء الملموس.

function worldView(round, hooks) {
  const fig = figureBox(round.scene, 'q-thing');
  const parts = shapesIn(fig);
  const board = h('div', { class: 'q-solve q-solve--thing' }, fig.box);
  board.dataset.mode = 'world';
  board.dataset.answer = round.face;
  board.dataset.thing = round.thing;
  let locked = false;

  const taps = parts.map((el, i) => {
    const mark = fig.plan.marks[i];
    const btn = h('button', {
      class: 'q-pickspot q-pickspot--shape',
      'aria-label': 'هَذَا',
      onclick: () => choose(btn, el),
    });
    // الزرُّ يحمل ما يعلنه المرسومُ تحته — فيُقرأ لا يُصدَّق
    btn.dataset.shape = el.dataset.shape;
    for (const [key, value] of Object.entries({
      '--x': `${((mark.box.x) / fig.plan.view.w) * 100}%`,
      '--y': `${((mark.box.y) / fig.plan.view.h) * 100}%`,
      '--w': `${(mark.box.w / fig.plan.view.w) * 100}%`,
      '--h': `${(mark.box.h / fig.plan.view.h) * 100}%`,
    })) btn.style.setProperty(key, value);
    fig.box.append(btn);
    return btn;
  });

  async function choose(btn, el) {
    if (locked) return;
    // **الجوابُ من المرسوم**: صنفُ الجزء الملموس كما أعلنه المصيِّر
    const correct = el.dataset.shape === round.face;
    hooks.attempt(round, correct);
    if (correct) {
      locked = true;
      btn.classList.add('good');
      el.classList.add('is-counted');
      pop(btn);
      await praiseThen(hooks);
      return;
    }
    btn.classList.add('bad');
    shake(btn);
    locked = true;
    // **الخطأُ يُرى ويُعَدّ**: يُضاء الجزءُ المطلوب وتُعَدّ أضلاعُه ثم يُسمّى
    await say(SAY.together);
    if (!hooks.alive()) return;
    const want = parts.find((p) => p.dataset.shape === round.face);
    if (want && !(await showShape(want, hooks.alive))) return;
    if (!hooks.alive()) return;
    if (want) clearShape(want);
    for (const tap of taps) tap.classList.remove('bad', 'good');
    locked = false;
  }

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board);
}

const VIEWS = { name: nameView, sides: sidesView, world: worldView };
const viewOf = (round, hooks) => VIEWS[round.mode](round, hooks);

// ————— التسجيل في الموجِّه وفي المراجعة —————

function screen(type) {
  return (part) => {
    const station = stationById(`${type}:${part}`);
    if (!station) return null;
    return stationScreen({
      nodeId: station.id,
      title: station.title,
      accent: PATTERN_ACCENT,
      make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x9e3779b9),
      view: viewOf,
      score,
      save: (stars) => progress.setStars(station.id, stars),
    });
  };
}

registerScreen('shape', screen('shape'));

/**
 * جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات.
 *
 * **والوجهُ يدور بالقرعة على ما تدرّسه محطتُها**: مفتاحُ الأشكال واحدٌ لأربعتها
 * (`shape|4|name`)، فالمراجعةُ تسأل عن أحدها لا عن الأول أبداً.
 *
 * **ومحطتُها آخرُ مَن يدرّس نوعَها لا أولُه**: `name` تدرّسه محطتان — التمييزُ
 * المتباعد (دائرةٌ ومثلث) ثم **الشبيهان قصداً** (مربّعٌ ومستطيل) — و`stationForSkill`
 * تردّ أولاهما، فلو بُنيت المراجعةُ منها **لما رُوجع المربّعُ والمستطيل أبداً** وهما
 * أصعبُ ما في المرحلة وأحوجُ ما يكون إلى تثبيت. فتُبنى من **آخر** محطةٍ تدرّس النوعَ:
 * حوضُها أوسعُ وفيه ما قبله (وهو عينُ ما تفعله المحطةُ نفسُها في جولاتها).
 */
const single = (build) => (skill, rnd) => {
  const station = stationForSkill(skill);
  if (!station || !TYPES.has(station.type)) return null;
  const widest = [...stations()].reverse().find((s) => TYPES.has(s.type)
    && (s.skills || []).some((key) => key.split('|')[2] === skill.kind)) || station;
  /* **وأوجهُ المراجعة ما تعلّمه كلُّه لا ما تدرّسه محطةٌ بعينها**: `stationFaces`
     تردّ **درسَ المحطة** (وهو ما يجب أن تدور عليه جولاتُها هي)، والمراجعةُ تسأل عن
     المفتاح كلِّه — فحوضُها الأشكالُ المُقدَّمة حتى تلك المحطة (والأضلاعُ ما يُعَدّ
     منها). ولولا ذلك لَراجعت نصفَ ما تعلّم ونسيت نصفَه. */
  const faces = (widest.part === 'sides' ? polygonsOf(widest.part) : shapesUpTo(widest.part))
    .map((s) => s.id);
  return faces.length ? build(widest, rnd, { face: pick(faces, rnd) }) : null;
};

registerExercise('name', { build: single(nameRound), view: viewOf });
registerExercise('sides', { build: single(sidesRound), view: viewOf });
registerExercise('world', { build: single(worldRound), view: viewOf });
