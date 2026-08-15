// **المرحلة ١٠ — القِسْمَةُ بِالعَدْل** (`METHOD.md §٣`، تعديلٌ معتمد ١٣ أغسطس ٢٠٢٦):
// أربعُ محطاتٍ بشاشةٍ واحدةٍ وجهان.
//
//   `share:two`    «بِالعَدْلِ بَيْنَ اثْنَيْن» — العدلُ يُصنَع باللمس
//   `share:each`   «كَمْ لِكُلِّ وَاحِد؟» — الجوابُ **حصّةٌ لا مجموع**
//   `share:rest`   «مَا يَنْقَسِمُ وَمَا لَا يَنْقَسِم» — أوّلُ لقاءٍ بالباقي
//   `share:three`  «بِالعَدْلِ بَيْنَ ثَلَاثَة» — القسمةُ تتجاوز النصف
//
// ————— لِمَ جاءت بعد المزدوجات لا قبلها —————
//
// **القسمةُ بالتساوي هي المزدوجُ مقلوباً** (`METHOD.md §٣` المرحلة ١٠): الجسورُ تشقّ
// الكلَّ شقّين (المرحلة ٥)، والمزدوجاتُ تجمع نصفين متساويين (٦·٥ و٧·٩) — وهذه تردّ
// الثمانيةَ أربعةً وأربعة. وطفلُ الخامسة **يقسم بالعدل فطرةً** قبل أن يعرف اسمها،
// فالمحطةُ تسمّي ما يفعله ولا تعلّمه فعلاً جديداً.
//
// ————— وعهودُ الشاشة كما هي، ولها هنا وجهُها —————
//
// ١) **لا نصَّ تشغيلياً واحداً** (`FIELD.md §٤` — قاعدةُ اللاقراءة): الفعلُ **لمسٌ
//    مباشر** — يُلمَس فراغُ الوعاء فيأتي إليه واحدٌ من الكومة، ويُلمَس ما فيه فيعود.
//    وهو عينُ ما تعلّمه في «اجعلهما سواء» (٢·٣)، فلا لوحَ ثانٍ يُتعلَّم لفعلٍ واحد.
// ٢) **الجوابُ يُعلَن كبساً ولا يقع صدفة** (عهدُ م٦ — `FIELD.md §٦`): القسمةُ العادلة
//    **حالٌ تُرى**، والنقرُ المتكرّر يبلغها عرَضاً — فلها **زرُّ حكمٍ بلا حرف**
//    (`markButton`) معلمُه معلمُ مرحلته، **تكبسه نمذجتُها بنفسها**.
// ٣) **الباقي يُرى ويُسمّى ولا يُعَدّ خطأً** (`METHOD.md §٣`): خمسةٌ على اثنين يبقى
//    واحدٌ **ظاهراً في الكومة** فيُسمّى «وَبَقِيَ وَاحِدْ» — تمهيدٌ صادقٌ للقسمة، وعهدُ
//    «لا شاشة خطأ» معاً. **وحدُّ العدل: تستوي الأوعيةُ ولا يبقى ما يُقسَم** — فلو بقي
//    في الكومة قدرُ الأوعية فأكثر لم يتمّ التوزيعُ بعد.
// ٤) **الخطأُ يُعَدّ أمامه بعدّ درسِه**: لا عدٌّ واحدٌ للجميع، وإنما **توزيعٌ بالتناوب**
//    — واحدٌ لهذا وواحدٌ لهذا ويُسمّى نصيبُ كلٍّ وهو يكبر، فيرى **طريقةَ** العدل لا
//    جوابَه فقط (`METHOD.md §٤`).
// ٥) **الجوابُ من المرسوم**: نصيبُ الوعاء `drawn` الذي عدّه المصيِّرُ من عناصره، لا
//    من العدد الذي طُلب منه.
//
// ————— ولا رمزَ عمليةٍ ولا علامة —————
//
// جبهةُ المرحلة `ops: []` و`signs: []`: **القسمةُ تُصنَع باللمس**، ورمزُها بابُ مستوىً
// آخر. والرمزُ العدديُّ لا يظهر إلا في «كم لكلِّ واحد؟» — بطاقةَ جوابٍ في موضعها من
// الرحلة (عددٌ عبر بواباته الثلاث قبل مراحل).

import * as progress from './progress.js';
import { shareAt } from './curriculum.js';
import { registerScreen } from './registry.js';
import { OBJECTS } from './render.js';
import { h, pick, shuffle, seeded, shake, pop, BOND_ACCENT } from './ui.js';
import {
  BEAT, SAY, say, praiseThen, span, nearOptions, seeder, skillOf,
  stationById, stationForReview, figureBox, numeralCard, markButton, touchLayer, countMarks,
  countAloud, clearCount, probeOf, registerExercise, stationScreen, roundGate,
} from './station.js';

const OPTIONS = 3;
const GUIDED = 2;
const SOLO = 5;

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['share']);

// ————— التعليماتُ المنطوقة (مُعلَنةٌ لا مستنتَجة — `check_speech.mjs`) —————
//
// **وجملتا الكشف ليستا هنا**: «صَارَ لِكُلٍّ مِثْلُ الْآخَرْ» و«وَبَقِيَ وَاحِدْ» **قولُ
// ما يُرى** لا فعلٌ يُطلَب — نمذجةٌ بطبعها، فموضعُهما جدولُ `SAY` في `station.js`
// وبموضعهما تُشتقّ فئتُهما (حكمُ المدير، مراجعة الجلسة ٤).

const ASK = {
  deal: 'وَزِّعْ بِالْعَدْلْ',
  each: 'كَمْ لِكُلِّ وَاحِدْ؟',
};

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// أرضيةُ ما تشترك فيه جبهاتُ محطات النوع الأربع: كومةٌ وأوعيةٌ من عناصر عالم الطفل،
// **والصفرُ منها** (وعاءٌ لم يُوضَع فيه شيءٌ بعد) — وما زاد (بطاقاتُ «كم لكلِّ واحد؟»
// وأعدادُ المجاميع) يُجرَد **جولةً جولة** على جبهة محطته.

export const CONSUMES = {
  share: { numbers: [0], numerals: [], ops: [], signs: [], displays: ['objects'] },
};

/** نمطُ الكومة والأوعية: من جبهة المحطة، وواحدٌ للجولة كلِّها (لا كومةٌ بنمطٍ ووعاءٌ بآخر). */
const boardDisplay = (frontier, rnd) =>
  pick(frontier.displays.filter((d) => d !== 'numeral'), rnd);

/** نصيبُ الواحد وما يبقى — حسابُ بيانٍ لا حكمُ شاشة (الشاشةُ تقرأ ما رُسِم). */
const shareOf = (total, bowls) => ({ each: Math.floor(total / bowls), left: total % bowls });

// ————— بناءُ الجولات —————

/**
 * جولةُ «وَزِّعْ بِالعَدْل» (١٠·١ و١٠·٣ و١٠·٤): كومةٌ وأوعيةٌ فارغة، يُوزَّع باللمس.
 *
 * **والمجموعُ من بيانات المنهج** (`SHARE` في `curriculum.js`) لا من قرعةٍ في الشاشة:
 * مَن كتب المحطةَ كتب مجاميعَها، فمحطةُ الباقي **كلُّ مجاميعها تُبقي بقيّة** وأخواتُها
 * لا تُبقي شيئاً — يفرضه `check_range.py`.
 */
function dealRound(station, rnd, { total, aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'share', 'make');
  const info = shareAt(station.part);
  const next = seeder(rnd);
  const display = boardDisplay(f, rnd);
  const glyph = display === 'objects' ? pick(OBJECTS, rnd).glyph : undefined;
  const spec = (count) => ({ display, count, seed: next(), room: total, glyph });
  const pile = spec(total);
  const bowls = Array.from({ length: info.bowls }, () => spec(0));

  return {
    kind: 'make', concept: skill.concept, range: skill.range, mode: 'deal', aided,
    ask: ASK.deal,
    hint: 'الْمِسْ دَاخِلَ الوِعَاءِ لِيَأْتِيَ وَاحِد، وَالْمِسْ مَا فِيهِ لِيَعُود',
    total,
    bowls: info.bowls,
    ...shareOf(total, info.bowls),
    pile,
    boards: bowls,
    figures: [pile, ...bowls],
    // **حدّا ما يبلغه عددُ وعاءٍ بيد الطفل** — يُجرَدان كما تُجرَد الأشكال
    extra: span(0, total),
    sig: `${station.id}|${total}|${pile.seed}`,
  };
}

/**
 * جولةُ «كَمْ لِكُلِّ وَاحِد؟» (١٠·٢): الكلُّ **مقسومٌ أمامه**، والسؤالُ عن نصيب الواحد.
 *
 * **والمشتّتُ الأولُ المجموعُ نفسُه**: هو الالتباسُ الذي تُبنى له المحطة («الجوابُ
 * حصّةٌ لا مجموع» — `METHOD.md §٣`)، فلا يُترَك للقرعة أن تأتي به أو تدعه.
 */
function eachRound(station, rnd, { total, aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'share', 'each');
  const info = shareAt(station.part);
  const next = seeder(rnd);
  const display = boardDisplay(f, rnd);
  const glyph = display === 'objects' ? pick(OBJECTS, rnd).glyph : undefined;
  const { each } = shareOf(total, info.bowls);
  const boards = Array.from({ length: info.bowls },
    () => ({ display, count: each, seed: next(), room: total, glyph }));
  const pool = span(Math.max(f.min, 1), f.numeral);
  const values = [each, total, ...nearOptions(each, pool, OPTIONS, rnd)];
  const options = shuffle([...new Set(values)].slice(0, OPTIONS), rnd)
    .map((n) => ({ display: 'numeral', count: n, seed: next() }));

  return {
    kind: 'each', concept: skill.concept, range: skill.range, mode: 'each', aided,
    ask: ASK.each,
    hint: 'اُنْظُرْ إِلَى وِعَاءٍ وَاحِد — كَمْ فِيه؟',
    total,
    bowls: info.bowls,
    each,
    boards,
    options,
    figures: [...boards, ...options],
    sig: `${station.id}|${total}|${boards[0].seed}`,
  };
}

/** مجاميعُ المحطة من بيانات المنهج — تدور على الجولات فلا يُترَك مجموعٌ لم يُلقَ. */
const totalsOf = (station) => shareAt(station.part)?.totals || [];

const roundFor = (station, rnd, total, aided) => (station.part === 'each'
  ? eachRound(station, rnd, { total, aided })
  : dealRound(station, rnd, { total, aided }));

/**
 * **نمذجةُ المحطة درسُها هي** (`METHOD.md §٤`): تُرى الأوعيةُ مقسومةً بالعدل
 * **وتُعَدّ بالتناوب** — واحدٌ لهذا وواحدٌ لهذا — ثم **تُكبَس صورةُ الحكم** فيرى
 * الطفلُ ترتيبَ ما سيصنعه بيده. وفي «كم لكلِّ واحد؟» يُعَدّ وعاءٌ واحدٌ ثم يُكشَف رمزُه
 * (حلقةُ تقديم الرمز بعينها — `METHOD.md §٣` المرحلة ٣).
 */
function modelOf(station, rnd) {
  const f = station.frontier;
  const next = seeder(rnd);
  const info = shareAt(station.part);
  const total = totalsOf(station)[0];
  const { each, left } = shareOf(total, info.bowls);
  const display = boardDisplay(f, rnd);
  const glyph = display === 'objects' ? pick(OBJECTS, rnd).glyph : undefined;
  const bowl = (count) => ({ display, count, seed: next(), room: total, glyph });

  if (station.part === 'each') {
    const boards = Array.from({ length: info.bowls }, () => bowl(each));
    return {
      title: ASK.each,
      hint: 'نَعُدُّ مَا فِي وِعَاءٍ وَاحِد، ثُمَّ نَرَى رَمْزَ عَدَدِه',
      figures: boards,
      count: (figs, alive) => countAloud([figs[0]], alive),
      reveal: {
        say: SAY.reveal,
        figures: [{ display: 'numeral', count: each, seed: next() }],
      },
    };
  }

  const boards = Array.from({ length: info.bowls }, () => bowl(each));
  return {
    title: ASK.deal,
    hint: 'وَاحِدٌ لِهَذَا وَوَاحِدٌ لِهَذَا، حَتَّى يَصِيرَ لِكُلٍّ مِثْلُ الآخَر',
    figures: [...boards, ...(left ? [bowl(left)] : [])],
    count: (figs, alive) => dealAloud(figs.slice(0, info.bowls), info.bowls, alive),
    reveal: {
      // **والحكمُ يُكبَس في النمذجة كما يُكبَس في الشاشة** (عهدُ م٦): صورةُ الزرّ
      // معطَّلةً تنخفض ثم ترتدّ، فيتعلّم الطفلُ **الفعلَ الذي يُعلن به جوابه** مشاهدةً.
      sign: 'share',
      press: 'share',
      say: SAY.revealFair,
      figures: boards.map((b) => ({ ...b, seed: next() })),
    },
  };
}

// ————— «يُوزَّع أمامه بالتناوب» بدل «يُعَدّ عنصراً عنصراً» —————

/** عناصرُ وعاءٍ مرسوم بترتيب رسمها — **من الـDOM لا من العدد المطلوب**. */
const itemsIn = (fig) => [...fig.el.querySelectorAll('[data-mark]')];

/**
 * **يُوزِّع أمامه واحداً واحداً بالتناوب** — عدُّ درسِ هذه المرحلة (`METHOD.md §٤`:
 * «تُعَدّ الكميةُ المعنية أمامه»، وعدُّ كلِّ محطةٍ عدُّ درسها).
 *
 * فيُعلَّم عنصرٌ في الوعاء الأول ويُنطَق «واحد»، ثم عنصرٌ في الثاني ويُنطَق «واحد»،
 * ثم «اثنان» و«اثنان»… — **فيُسمَع أنّ نصيبَ كلٍّ يكبر معاً**، وهو معنى العدل نفسُه.
 * ولا آليةَ عدٍّ ثانية: `countMarks` واحدةٌ يُمرَّر إليها **ترتيبُ المشي** و**اسمُ كلِّ
 * خطوة** (`METHOD.md §٣` المرحلة ٦ — عدُّ الدرس لا عدٌّ للجميع).
 */
async function dealAloud(figs, bowls, alive = () => true) {
  const rows = figs.map(itemsIn);
  for (const marks of rows) for (const m of marks) m.classList.remove('is-counted');
  const walk = [];
  const most = Math.max(0, ...rows.map((r) => r.length));
  for (let k = 0; k < most; k++) for (const marks of rows) if (marks[k]) walk.push(marks[k]);
  // اسمُ الخطوة نصيبُ الوعاء وقد بلغ هذا الحدّ — لا رتبةُ العنصر في المشي
  return countMarks(walk, (i) => Math.floor(i / bowls) + 1, alive);
}

// ————— خطةُ المحطة —————

export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const totals = totalsOf(station);
  if (!totals.length) return null;

  /* **والمجاميعُ تدور على الجولات كلِّها**: محطةُ الاثنين أربعةُ مجاميع ومحطةُ الثلاثة
     مجموعان — فلو بُنيت بالقرعة لَجاز أن يُمتحَن في واحدٍ ويُترَك الباقي. */
  const step = (count, aided) => Array.from({ length: count },
    (_, i) => roundFor(station, rnd, totals[i % totals.length], aided));

  return { model: modelOf(station, rnd), guided: step(GUIDED, true), solo: step(SOLO, false) };
}

/** جردُ الجولات للحارس — **النمذجةُ والعونُ و«وحدك» كلُّها**، فلا عددٌ يفلت. */
export function probeRounds(stationId, seed) {
  return probeOf(buildStation(stationId, seed));
}

// ————— تسجيلُ المحاولة (بابُ الشيفرة في `test_measure.mjs`: مَن أعلن قياساً كتبه) —————

const SCORE = {
  make: (r, ok) => progress.recordAttempt(r.concept, r.range, 'make', ok),
  each: (r, ok) => progress.recordAttempt(r.concept, r.range, 'each', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

// ————— شاشةُ «وَزِّعْ بِالعَدْل» (١٠·١ و١٠·٣ و١٠·٤) —————

function dealView(round, hooks) {
  const state = { bowls: round.boards.map(() => 0) };
  const figs = { bowls: [] };
  /* **قفلٌ مالكُه واحد** (بلاغ الميدان ٦): كان `locked` للتعليم و`judged` لانتهاء
     الجولة، وكلاهما يُرفَع بسطرٍ في نهاية مسار. صارا حالَي بوابةٍ واحدة تُرَدّ
     في كل حال — فلا يبقى لوحٌ صامتاً بعد كبسةٍ عثرت. */
  const gate = roundGate('وزِّعْ بالعدل');

  const stage = h('div', { class: 'q-share' });
  const pileStage = h('div', { class: 'q-stage q-board q-pile' });
  const bowlsRow = h('div', { class: 'q-bowls' });
  const board = h('div', { class: 'q-solve q-solve--share' }, stage);
  board.dataset.mode = 'deal';
  // **ما تُعلنه الشاشةُ جوابُها**: نصيبُ الواحد وما يبقى — يقابلهما الحارسُ بما رُسِم
  board.dataset.answer = String(round.each);
  board.dataset.left = String(round.left);
  board.dataset.bowls = String(round.bowls);

  const taken = () => state.bowls.reduce((a, b) => a + b, 0);

  /** لمسةٌ تنقل واحداً بين الكومة والوعاء — **ولا حكمَ فيها**: بحثُ الطفل لا جوابُه. */
  const move = gate.guard((at, delta) => {
    const next = state.bowls[at] + delta;
    if (next < 0 || next > round.total) return;
    if (delta > 0 && taken() >= round.total) return;      // لا يُؤخَذ من كومةٍ فرغت
    state.bowls[at] = next;
    draw();
  });

  /**
   * **الكبسة: الجوابُ يُعلَن** — والحكمُ **من المرسوم** (`drawn` لا `state`):
   * تستوي الأوعيةُ **ولا يبقى في الكومة ما يُقسَم** (أقلُّ من عددها). فما بقي دونها
   * **باقٍ يُرى ويُسمّى** لا نقصٌ يُعاقَب عليه.
   */
  const judge = gate.guard(async () => {
    const counts = figs.bowls.map((b) => b.fig.drawn);
    const rest = figs.pile.drawn;
    const correct = counts.every((n) => n === counts[0]) && rest < round.bowls;
    hooks.attempt(round, correct);
    if (correct) {
      gate.end();
      pop(judgeBtn);
      for (const b of figs.bowls) b.stage.classList.add('is-fair');
      await say(SAY.revealFair);
      if (!hooks.alive()) return;
      if (rest > 0) {
        /* **والباقي يُرى ويُسمّى**: يبقى في الكومة ظاهراً ويُضاء ويُقال «وَبَقِيَ
           وَاحِدْ» — لا يُخفى ولا يُعَدّ خطأً (`METHOD.md §٣` المرحلة ١٠). */
        for (const m of itemsIn(figs.pile)) m.classList.add('is-counted');
        await say(SAY.revealLeft);
        if (!hooks.alive()) return;
      }
      await praiseThen(hooks);
      return;
    }
    shake(judgeBtn);
    // **الخطأُ يُوزَّع أمامه بالتناوب** — يرى الطريقةَ لا الجوابَ وحدَه
    await say(SAY.together);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    const shown = showFair();
    if (await dealAloud(shown, round.bowls, hooks.alive)) {
      await new Promise((r) => setTimeout(r, BEAT));
    }
    draw();                                   // ثم يعود لوحُه كما تركه فيُكمِل بيده
  });

  /* **زرُّ الحكم صورةٌ بلا حرف** (م٦): معلمُ مرحلة القسمة نفسُه من `ui.js` — وأوّلُ
     لقاءٍ به في نمذجة محطته، تكبسه بنفسها. */
  const judgeBtn = markButton('share', { onclick: judge, label: SAY.revealFair });

  /** يرسم القسمةَ العادلة لحظةَ التعليم — ثم يُردّ لوحُ الطفل كما تركه. */
  function showFair() {
    const shown = [];
    for (const [at, holder] of figs.bowls.entries()) {
      const fig = figureBox({ ...round.boards[at], count: round.each });
      holder.stage.replaceChildren(fig.box);
      shown.push(fig);
    }
    const rest = figureBox({ ...round.pile, count: round.left });
    pileStage.replaceChildren(rest.box);
    return shown;
  }

  function draw() {
    const left = round.total - taken();
    figs.pile = figureBox({ ...round.pile, count: left });
    pileStage.replaceChildren(figs.pile.box);
    for (const [at, holder] of figs.bowls.entries()) {
      const fig = figureBox({ ...round.boards[at], count: state.bowls[at] });
      holder.fig = fig;
      /* **والوعاءُ كلُّه زرٌّ يأتي بواحد** (لوحُ «اجعلهما سواء» نفسُه): يملأ صندوقَ
         الشكل **تحت** طبقة اللمس، فنقرةُ الفراغ تبلغه ونقرةُ العنصر تبلغ زرَّه هو. */
      fig.box.append(h('button', {
        class: 'q-add', 'aria-label': 'ضَعْ وَاحِدًا هُنَا', onclick: () => move(at, +1),
      }));
      const { taps } = touchLayer(fig, () => move(at, -1));
      for (const btn of taps) btn.setAttribute('aria-label', 'أَعِدْ هَذَا');
      holder.stage.replaceChildren(fig.box);
    }
  }

  for (let i = 0; i < round.bowls; i++) {
    const holder = h('div', { class: 'q-side' });
    const bowlStage = h('div', { class: 'q-stage q-board' });
    if (round.aided) bowlStage.classList.add('is-open');
    holder.append(bowlStage);
    bowlsRow.append(holder);
    figs.bowls.push({ stage: bowlStage, holder });
  }
  stage.append(pileStage, bowlsRow);
  draw();

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board,
    h('div', { class: 'row foot q-judge' }, judgeBtn));
}

// ————— شاشةُ «كَمْ لِكُلِّ وَاحِد؟» (١٠·٢) —————
//
// **الجوابُ حصّةٌ لا مجموع**: الأوعيةُ مقسومةٌ أمامه، والمشتّتُ الأولُ **المجموع** —
// فمن قرأ الصورةَ «كم كلُّها؟» أخطأ، ومن قرأها «كم لكلِّ واحد؟» أصاب.

function eachView(round, hooks) {
  const stage = h('div', { class: 'q-bowls' });
  const board = h('div', { class: 'q-solve q-solve--share' }, stage);
  board.dataset.mode = 'each';
  const choices = h('div', { class: 'q-choices' });
  const gate = roundGate('كم لكلِّ واحد؟');

  const bowls = round.boards.map((spec, i) => {
    const fig = figureBox(spec);
    const holder = h('div', { class: 'q-side' },
      h('div', { class: `q-stage q-board${round.aided && i === 0 ? ' is-open' : ''}` }, fig.box));
    stage.append(holder);
    return fig;
  });
  // **الجوابُ من المرسوم**: نصيبُ الوعاء الأول كما عدّه المصيِّرُ من عناصره
  const want = bowls[0].drawn;
  board.dataset.answer = String(want);

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
        // **الخطأُ يُعَدّ أمامه**: يُعَدّ **وعاءٌ واحد** — فالمقيسُ نصيبُه لا مجموعُها
        await say(SAY.together);
        if (!hooks.alive()) return;
        await new Promise((r) => setTimeout(r, BEAT / 2));
        if (!hooks.alive()) return;
        await countAloud([bowls[0]], hooks.alive);
        clearCount(bowls[0]);
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

const VIEWS = { deal: dealView, each: eachView };
const viewOf = (round, hooks) => VIEWS[round.mode](round, hooks);

// ————— التسجيل في الموجِّه وفي المراجعة —————

function screen(type) {
  return (part) => {
    const station = stationById(`${type}:${part}`);
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
  };
}

registerScreen('share', screen('share'));

/**
 * جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات.
 *
 * **ومحطتُها بالقرعة من كلِّ مَن يدرّس نوعَها** (م٨، ب‑٥ — `stationForReview`): `make`
 * تدرّسه ثلاثُ محطات — بين اثنين، **وما لا ينقسم**، وبين ثلاثة. وكانت تُبنى من
 * **آخرها** («بين ثلاثة») فرارَاً من أولاها — **فسقطت محطةُ الباقي من المراجعة أبداً،
 * وهي الفكرةُ الجديدة الوحيدة في المرحلة**. فالقرعةُ تُدخل الثلاثةَ حوضاً واحداً،
 * ومجموعُ كلٍّ بالقرعة من مجاميعها هي (`SHARE` — والباقي يوافق موضعَه).
 */
const single = (build) => (skill, rnd) => {
  const station = stationForReview(skill, rnd, TYPES);
  if (!station || !TYPES.has(station.type)) return null;
  const totals = totalsOf(station);
  return totals.length ? build(station, rnd, { total: pick(totals, rnd) }) : null;
};

registerExercise('make', { build: single(dealRound), view: viewOf });
registerExercise('each', { build: single(eachRound), view: viewOf });
