// **المرحلة ١١ — القِيَاسُ بِوَحْدَة** (`METHOD.md §٣`، تعديلٌ معتمد ١٣ أغسطس ٢٠٢٦):
// ثلاثُ محطاتٍ بشاشةٍ واحدةٍ ثلاثةُ أوجه.
//
//   `units:count`   «كَمْ وَحْدَةً طُولُه؟» — الوحدةُ تُكرَّر ولا تُترَك فجوة
//   `units:longer`  «أَيُّهُمَا أَطْوَلُ بِالوَحَدَات؟» — القياسُ يحكم حيث تخدع العين
//   `units:hand`    «قِسْ بِيَدِك» — من القراءة إلى الصنع
//
// ————— الجسرُ من الوصف إلى القياس —————
//
// المرحلة ٨ تقارن «أطولُ وأقصر» **بالعين** (مقاديرُ الشيء الواحد)، وهذه تسأل **«كم
// وحدةً؟»** — فتصير المقارنةُ قياساً. **وهو عدٌّ مُطبَّق**: تكرارُ وحدةٍ واحدة وعدُّها،
// لا مهارةٌ جديدة — ولذلك جاءت بعد أن أتقن العدَّ بالتناظر الفرديّ بعشر مراحل.
// ومسارُ الطول عند Clements & Sarama يضع «القياسَ طرفاً لطرف» في الخامسة.
//
// ————— وعهودُ الشاشة كما هي، ولها هنا وجهُها —————
//
// ١) **لا فجوةَ ولا تراكب — بنيةً لا وعداً**: موضعُ الوحدة **مشتقٌّ من دليلها** في
//    المصيِّر (`render.js`)، فتلاصقُها حسابٌ لا توفيق. **والوحدةُ واحدةٌ في السؤال**:
//    عرضٌ واحدٌ لا يتبدّل، فلا يُقاس شريطٌ بوحدتين مختلفتين — يفرضه حارسُ المصيِّر.
// ٢) **الجوابُ من المرسوم**: عددُ الوحدات `drawn` معدوداً من الـDOM، وطولُ الشريط
//    `data-span` **محسوباً من عرضه المرسوم** — لا من نيّة المولّد.
// ٣) **الجوابُ يُعلَن ولا يقع** (عهدُ م٦): في «قِسْ بيدك» ما يصنعه الطفلُ **حالٌ تُرى**
//    قد تُبلَغ بالنقر المتكرّر — فلها **زرُّ حكمٍ بلا حرف** (مسطرةٌ تُرى)، **تكبسه
//    نمذجتُها بنفسها**. وفي أختيها الجوابُ اختيارٌ يُنقَر، والنقرةُ هي الإعلان.
// ٤) **الخطأُ يُعَدّ أمامه**: تُضاء الوحداتُ واحدةً واحدة بأسمائها — فيرى القياسَ
//    **عدّاً** لا تلقيناً (`METHOD.md §٤`)، وهو عينُ درس المحطة.
// ٥) **لا نصَّ تشغيلياً واحداً**: السؤالُ يُسمَع، والجوابُ بطاقةُ رمزٍ أو لمسةٌ على
//    المرسوم أو كبسةُ معلم — ولا زرَّ فيه حروفٌ وحدَها (`FIELD.md §٤`).

import * as progress from './progress.js';
import { UNIT_SPAN } from './curriculum.js';
import { registerScreen } from './registry.js';
import { spanStyle } from './render.js';
import { h, pick, shuffle, seeded, shake, pop, PATTERN_ACCENT } from './ui.js';
import {
  BEAT, NUMBER_NAME, SAY, say, praiseThen, span, nearOptions, seeder, skillOf,
  stationById, stationForReview, figureBox, numeralCard, markButton, countMarks,
  probeOf, registerExercise, stationScreen, roundGate,
} from './station.js';

const OPTIONS = 3;
const GUIDED = 2;
const SOLO = 5;

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['units']);

// ————— التعليماتُ المنطوقة (مُعلَنةٌ لا مستنتَجة — `check_speech.mjs`) —————
//
// **و«أَيُّهُمَا أَطْوَلْ؟» جملةُ المرحلة ٨ بلفظها**: تعلّمها الطفلُ في القياس الوصفيّ،
// وهذه المحطةُ **هي هي وقد صار الحكمُ بالعدّ لا بالنظر** — فيُسمَع اللفظُ الذي يعرفه
// ولا يُخترَع له ثانٍ. وملفُّها مصروفٌ في البنك، فلا تزيد القائمةَ سطراً.

const ASK = {
  count: 'كَمْ وَحْدَةً طُولُهْ؟',
  taller: 'أَيُّهُمَا أَطْوَلْ؟',
  hand: 'قِسْ بِيَدِكْ',
};

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// أرضيةُ ما تشترك فيه جبهاتُ محطاتها الثلاث: شريطٌ يُقاس وبطاقةُ رمزٍ لجوابه —
// والأطوالُ تُجرَد **جولةً جولة** على جبهة محطتها.

export const CONSUMES = {
  units: { numbers: [0], numerals: [], ops: [], signs: [], displays: ['units'] },
};

/** أطوالُ الشريط الممكنة بالوحدات — من بيانات المنهج لا من رقمٍ في شاشة. */
const spans = () => span(UNIT_SPAN.min, UNIT_SPAN.max);

/** حوضُ بطاقات الجواب: أعدادُ الوحدات وحدَها — لا سقفُ الجبهة (وهو عشرون). */
const answerPool = (frontier) => span(Math.max(frontier.min, 1), UNIT_SPAN.max);

// ————— بناءُ الجولات —————

/**
 * جولةُ «كَمْ وَحْدَةً طُولُه؟» (١١·١): شريطٌ **مقيسٌ تامّاً** وبطاقاتُ رمز.
 * والجوابُ عددُ ما رُصّ تحته مقروءاً من الـDOM لا طولٌ يُحسَب بالبكسل.
 */
function countRound(station, rnd, { len, aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'measure', 'units');
  const next = seeder(rnd);
  const bar = { display: 'units', count: len, seed: next(), span: len };
  const options = shuffle(
    [len, ...nearOptions(len, answerPool(f), OPTIONS - 1, rnd)], rnd)
    .map((n) => ({ display: 'numeral', count: n, seed: next() }));

  return {
    kind: 'units', concept: skill.concept, range: skill.range, mode: 'count', aided,
    ask: ASK.count,
    hint: 'عُدَّ الوَحَدَاتِ تَحْتَ الشَّرِيط، ثُمَّ اخْتَرْ رَمْزَ عَدَدِهَا',
    len,
    bar,
    options,
    figures: [bar, ...options],
    sig: `${station.id}|${len}|${bar.seed}`,
  };
}

/**
 * جولةُ «أَيُّهُمَا أَطْوَلُ بِالوَحَدَات؟» (١١·٢): **شريطان يفترقان بوحدةٍ واحدة**.
 *
 * **والفرقُ وحدةٌ عمداً** (`METHOD.md §٣`: «القياسُ يحكم حيث تخدع العين»): فرقٌ أوسع
 * تحسمه النظرةُ فلا يبقى للقياس عمل، ووحدةٌ واحدة تردّ الحكمَ إلى العدّ. ولا وحدتين
 * مختلفتين تخدعان العين كذباً — الخداعُ هنا **قِصَرُ الفرق** لا اختلافُ المسطرة.
 */
function longerRound(station, rnd, { len, aided = false } = {}) {
  const skill = skillOf(station, 'measure', 'units');
  const next = seeder(rnd);
  const short = Math.min(len, UNIT_SPAN.max - 1);
  const pair = shuffle([short, short + 1], rnd);
  const bars = pair.map((n) => ({ display: 'units', count: n, seed: next(), span: n }));

  return {
    kind: 'units', concept: skill.concept, range: skill.range, mode: 'longer', aided,
    ask: ASK.taller,
    hint: 'لَا تَحْكُمْ بِالنَّظَر — عُدَّ وَحَدَاتِ كُلِّ شَرِيطٍ ثُمَّ الْمِسِ الأَطْوَل',
    len: short + 1,
    bars,
    figures: bars,
    sig: `${station.id}|${pair.join('-')}|${bars[0].seed}`,
  };
}

/**
 * جولةُ «قِسْ بِيَدِك» (١١·٣): شريطٌ **بلا وحدةٍ واحدة**، يرصّها الطفلُ حتى يستوفيه.
 *
 * **ولا يتجاوزه**: المصيِّرُ يرمي وحدةً فوق طول شريطها (`span` في `render.js`) —
 * فالتراكبُ **ممتنعٌ في البنية** لا مراقَبٌ بعد وقوعه، كما امتنع تجاوزُ الإطار في
 * المرحلة ٥ وعدُّ العنصر مرتين في المرحلة ٢.
 */
function handRound(station, rnd, { len, aided = false } = {}) {
  const skill = skillOf(station, 'measure', 'units');
  const next = seeder(rnd);
  const bar = { display: 'units', count: 0, seed: next(), span: len };

  return {
    kind: 'units', concept: skill.concept, range: skill.range, mode: 'hand', aided,
    ask: ASK.hand,
    hint: 'الْمِسْ تَحْتَ الشَّرِيطِ لِتَضَعَ وَحْدَة، وَالْمِسِ الوَحْدَةَ لِتَرْفَعَهَا',
    len,
    bar,
    figures: [bar],
    // **حدُّ ما يبلغه عددُ الوحدات بيد الطفل** — يُجرَد كما تُجرَد الأشكال
    extra: span(0, len),
    sig: `${station.id}|${len}|${bar.seed}`,
  };
}

const BUILD = { count: countRound, longer: longerRound, hand: handRound };

/** وجهُ المحطة من جزئها — شاشةٌ واحدةٌ تقرأ موضعَها من المنهج. */
const modeOf = (station) => (BUILD[station.part] ? station.part : 'count');

const roundFor = (station, rnd, len, aided) =>
  BUILD[modeOf(station)](station, rnd, { len, aided });

/**
 * **نمذجةُ المحطة درسُها هي** (`METHOD.md §٤`): يُقرأ الشريطُ **وحدةً وحدة** بأسمائها،
 * ثم يُكشَف رمزُ عددها فوقه — **حلقةُ تقديم الرمز بعينها** (`METHOD.md §٣` المرحلة ٣)
 * فلا نصَّ منطوقاً جديداً لها. وفي «قِسْ بيدك» **تُكبَس المسطرةُ قبل الكشف**: يرى
 * الطفلُ ترتيبَ ما سيصنعه بيده (رُصَّ ← أُعلِن ← عُدّ).
 */
function modelOf(station, rnd) {
  const next = seeder(rnd);
  const mode = modeOf(station);
  const len = Math.min(UNIT_SPAN.min + 2, UNIT_SPAN.max);

  if (mode === 'longer') {
    const bars = [len, len + 1].map((n) => ({ display: 'units', count: n, seed: next(), span: n }));
    return {
      title: ASK.taller,
      hint: 'نَعُدُّ وَحَدَاتِ هَذَا ثُمَّ وَحَدَاتِ هَذَا — فَالعَدَدُ يَحْكُم',
      rows: true,
      figures: bars,
      count: (figs, alive) => walkAll(figs, alive),
    };
  }

  const bar = { display: 'units', count: len, seed: next(), span: len };
  return {
    title: mode === 'hand' ? ASK.hand : ASK.count,
    hint: 'نَرُصُّ الوَحَدَاتِ مُتَلَاصِقَةً مِنَ الطَّرَف، ثُمَّ نَعُدُّهَا وَنَرَى رَمْزَهَا',
    figures: [bar],
    count: (figs, alive) => walkUnits(figs[0], alive),
    reveal: {
      say: SAY.reveal,
      ...(mode === 'hand' ? { press: 'ruler' } : {}),
      figures: [{ display: 'numeral', count: len, seed: next() }],
    },
  };
}

// ————— «يُعَدُّ الشريطُ وحدةً وحدة» —————

/** وحداتُ شريطٍ مرسوم بترتيب رصّها — **من الـDOM لا من العدد المطلوب**. */
const unitsIn = (fig) => [...fig.el.querySelectorAll('[data-unit]')];

/** طولُ الشريط بالوحدات **كما أعلنه رسمُه** (`data-span` محسوبٌ من عرضه المرسوم). */
const spanIn = (fig) => Number(fig.el.querySelector('[data-bar]')?.dataset.span);

/** إزالةُ أثر العدّ عن وحدات الشريط. */
const clearUnits = (fig) => {
  for (const u of unitsIn(fig)) u.classList.remove('is-counted');
};

/**
 * **يَعُدّ وحداتِ الشريط أمامه** — نمذجةً وتصحيحاً معاً (`METHOD.md §٤`).
 * والعدُّ `countMarks` **واحدةٌ** كسائر الرحلة: تُعلَّم الوحدةُ ويُنطَق عددُها ويُنتظَر.
 */
async function walkUnits(fig, alive = () => true) {
  clearUnits(fig);
  return countMarks(unitsIn(fig), (i) => i + 1, alive);
}

/** يمشي على شريطٍ بعد شريط — مقارنةُ «أيُّهما أطول» تَعُدّ الطرفين. */
async function walkAll(figs, alive = () => true) {
  for (const fig of figs) {
    if (!alive()) return false;
    if (!(await walkUnits(fig, alive))) return false;
    await new Promise((r) => setTimeout(r, BEAT / 2));
  }
  return alive();
}

// ————— خطةُ المحطة —————

export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const lengths = shuffle(spans(), rnd);

  /* **والأطوالُ تدور على الجولات**: سبعةُ أطوالٍ وخمسُ جولات، فلا يتكرّر طولٌ في
     جلسةٍ واحدة ولا يُبنى النمطُ على طولٍ بعينه يحفظه الطفل. */
  const step = (count, aided) => Array.from({ length: count },
    (_, i) => roundFor(station, rnd, lengths[i % lengths.length], aided));

  return { model: modelOf(station, rnd), guided: step(GUIDED, true), solo: step(SOLO, false) };
}

/** جردُ الجولات للحارس — **النمذجةُ والعونُ و«وحدك» كلُّها**. */
export function probeRounds(stationId, seed) {
  return probeOf(buildStation(stationId, seed));
}

// ————— تسجيلُ المحاولة (بابُ الشيفرة في `test_measure.mjs`: مَن أعلن قياساً كتبه) —————

const SCORE = {
  units: (r, ok) => progress.recordAttempt(r.concept, r.range, 'units', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

// ————— شاشةُ «كَمْ وَحْدَةً طُولُه؟» (١١·١) —————

function countView(round, hooks) {
  const fig = figureBox(round.bar, 'q-ruler');
  const board = h('div', { class: 'q-solve q-solve--units' }, fig.box);
  board.dataset.mode = 'count';
  // **الجوابُ من المرسوم**: عددُ الوحدات المعدود من الـDOM لا طولٌ يُحسَب
  const want = fig.drawn;
  board.dataset.answer = String(want);
  board.dataset.span = String(spanIn(fig));
  const choices = h('div', { class: 'q-choices' });
  const gate = roundGate('كم وحدةً طولُه؟');

  for (const spec of round.options) {
    const { btn, drawn } = numeralCard(spec.count, spec.seed, {
      label: 'هَذَا الرَّمْز',
      onclick: gate.guard(async () => {
        const correct = drawn === want;
        hooks.attempt(round, correct);
        if (correct) {
          gate.end();
          btn.classList.add('good');
          pop(btn);
          await praiseThen(hooks);
          return;
        }
        btn.classList.add('bad');
        shake(btn);
        // **الخطأُ يُعَدّ أمامه**: تُضاء الوحداتُ واحدةً واحدة بأسمائها
        await say(SAY.together);
        if (!hooks.alive()) return;
        await walkUnits(fig, hooks.alive);
        clearUnits(fig);
        btn.classList.remove('bad');
      }),
    });
    choices.append(btn);
  }

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board,
    choices);
}

// ————— شاشةُ «أَيُّهُمَا أَطْوَلُ بِالوَحَدَات؟» (١١·٢) —————

function longerView(round, hooks) {
  const stage = h('div', { class: 'q-rulers' });
  const board = h('div', { class: 'q-solve q-solve--units' }, stage);
  board.dataset.mode = 'longer';
  const gate = roundGate('أيُّهما أطولُ بالوحدات؟');

  const bars = round.bars.map((spec) => {
    const fig = figureBox(spec, 'q-ruler');
    const btn = h('button', {
      class: 'q-barpick', 'aria-label': 'هَذَا', onclick: () => choose(btn, fig),
    }, fig.box);
    stage.append(btn);
    return { fig, btn };
  });
  // **الجوابُ من المرسوم**: أكثرُ الشريطين وحداتٍ معدودةً من الـDOM
  const most = Math.max(...bars.map((b) => b.fig.drawn));
  board.dataset.answer = String(most);

  const choose = gate.guard(async (btn, fig) => {
    const correct = fig.drawn === most && bars.filter((b) => b.fig.drawn === most).length === 1;
    hooks.attempt(round, correct);
    if (correct) {
      gate.end();
      btn.classList.add('good');
      pop(btn);
      await praiseThen(hooks);
      return;
    }
    btn.classList.add('bad');
    shake(btn);
    // **الخطأُ يُعَدّ أمامه**: يُعَدّ الشريطان واحداً بعد الآخر فيُسمَع الفرق
    await say(SAY.together);
    if (!hooks.alive()) return;
    await walkAll(bars.map((b) => b.fig), hooks.alive);
    for (const b of bars) { clearUnits(b.fig); b.btn.classList.remove('bad'); }
  });

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board);
}

// ————— شاشةُ «قِسْ بِيَدِك» (١١·٣) —————
//
// **من القراءة إلى الصنع**: يرصّ الطفلُ الوحداتِ بنفسه — لمسةٌ تحت الشريط تضع واحدة،
// ولمسةٌ على وحدةٍ ترفعها — ثم **يُعلن قياسَه كبساً**، فتُعَدّ أمامه وحدةً وحدة.

function handView(round, hooks) {
  const state = { laid: 0 };
  const stage = h('div', { class: 'q-stage q-ruler-board' });
  const board = h('div', { class: 'q-solve q-solve--units' }, stage);
  board.dataset.mode = 'hand';
  board.dataset.answer = String(round.len);
  let fig = null;
  /* **قفلٌ مالكُه واحد** (بلاغ الميدان ٦): كان `locked` للتعليم و`judged` لانتهاء
     الجولة — صارا حالَي بوابةٍ واحدة تُرَدّ في كل حال. */
  const gate = roundGate('قِسْ بيدك');

  /**
   * لمسةٌ تضع وحدةً أو ترفعها — **ولا حكمَ فيها**: بحثُ الطفل لا جوابُه.
   *
   * **ورفعُ وحدةٍ يرفع ما بعدها** (لا وحدَها): الوحداتُ **متلاصقةٌ بنيةً**، فرفعُ
   * واحدةٍ من الوسط يفتح فجوةً لا يرسمها المصيِّرُ أصلاً. فلمسةُ الوحدة رقم `i`
   * تقول «أريدها هكذا» — يبقى ما قبلها ويذهب ما بعدها، فتُقرأ اللمسةُ كما نُويت
   * ويبقى القياسُ صادقاً في كل لحظة.
   */
  const setLaid = gate.guard((next) => {
    // **والتجاوزُ ممتنعٌ في البنية**: المصيِّرُ لا يرسم وحدةً فوق طول شريطها
    if (next < 0 || next > round.len) return;
    state.laid = next;
    draw();
  });

  /**
   * **الكبسة: القياسُ يُعلَن** — والحكمُ **من المرسوم**: عددُ الوحدات المرصوصة يبلغ
   * طولَ الشريط كما أعلنه رسمُه. فإن بلغه عُدَّت أمامه (العدديّةُ ختامُ القياس)،
   * وإلّا عُدَّ ما رصّ ثم يُكمل بيده **بلا حدٍّ ولا عقاب**.
   */
  const judge = gate.guard(async () => {
    const correct = fig.drawn === spanIn(fig);
    hooks.attempt(round, correct);
    if (correct) {
      gate.end();
      pop(judgeBtn);
      if (!(await walkUnits(fig, hooks.alive))) return;
      if (!hooks.alive()) return;
      await praiseThen(hooks);
      return;
    }
    shake(judgeBtn);
    await say(SAY.together);
    if (!hooks.alive()) return;
    await walkUnits(fig, hooks.alive);
    clearUnits(fig);
  });

  /* **زرُّ الحكم مسطرةٌ بلا حرف** (م٦): معلمُ مرحلة القياس نفسُه من `ui.js` — وأوّلُ
     لقاءٍ به في نمذجة محطته، تكبسه بنفسها. */
  const judgeBtn = markButton('ruler', { onclick: judge, label: ASK.hand });

  function draw() {
    fig = figureBox({ ...round.bar, count: state.laid }, 'q-ruler');
    /* **والشريطُ كلُّه زرٌّ يضع وحدة**: يملأ صندوقَ الشكل **تحت** أزرار الوحدات
       (لوحُ «اجعلهما سواء» نفسُه)، فنقرةُ الفراغ تبلغه ونقرةُ الوحدة تبلغ زرَّها هي. */
    fig.box.append(h('button', {
      class: 'q-add', 'aria-label': 'ضَعْ وَحْدَة', onclick: () => setLaid(state.laid + 1),
    }));
    /* **وزرُّ الوحدة بصندوقها من المصيِّر** (لا بقرصٍ حولها): الوحدةُ مستطيلٌ قائم،
       فدائرةُ لمسٍ حولها تبتلع جارتَها — وموضعُها `spanStyle` من الخطة نفسِها. */
    const layer = h('div', { class: 'fig-taps' });
    for (const u of fig.plan.units) {
      layer.append(h('button', {
        class: 'fig-tap fig-tap--unit',
        css: spanStyle(u, fig.plan.view),
        'aria-label': 'ارْفَعْ هَذِهِ',
        onclick: () => setLaid(u.i),
      }));
    }
    fig.box.append(layer);
    stage.replaceChildren(fig.box);
  }

  draw();
  if (round.aided) stage.classList.add('is-open');
  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board,
    h('div', { class: 'row foot q-judge' }, judgeBtn));
}

const VIEWS = { count: countView, longer: longerView, hand: handView };
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
      make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x165667b1),
      view: viewOf,
      score,
      save: (stars) => progress.setStars(station.id, stars),
    });
  };
}

registerScreen('units', screen('units'));

/**
 * جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات.
 *
 * **والوجهُ يدور على أوجه المفتاح الثلاثة**: المفتاحُ واحدٌ لثلاث محطات
 * (`measure|8|units`)، فالمراجعةُ تسأل عن أحدها بالقرعة لا عن الأولى أبداً — وإلّا
 * لم يُراجَع «قِسْ بيدك» ولا المقارنةُ بالوحدات قطّ، وهما ثمرةُ المرحلة.
 *
 * **وقرعتُها هذه صارت سنّةَ الرحلة كلِّها** (م٨، ب‑٥): كانت مكتوبةً هنا وحدَها بين
 * أحدَ عشرَ بانياً، فرُفعت إلى `stationForReview` في `station.js` — موضعٌ واحد لسياسةٍ
 * واحدة، فلا تفترق ثلاثةُ ملفّاتٍ في عهدٍ واحد ثانيةً.
 */
const single = () => (skill, rnd) => {
  const station = stationForReview(skill, rnd, TYPES);
  if (!station || !TYPES.has(station.type)) return null;
  return roundFor(station, rnd, pick(spans(), rnd), false);
};

registerExercise('units', { build: single(), view: viewOf });
