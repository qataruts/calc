// **المرحلة ٤ — قارِنْ ورتِّبْ** (`METHOD.md §٣`): أربعُ محطاتٍ بأربع شاشات.
//
//   `compare`   «أَيُّهُمَا أَكْبَر؟»   — المقارنةُ **بالرمزين**، والتحقّقُ بالكميات
//   `line`      «أَيْنَ يَقَع؟»       — موضعُ العدد على خطّ ٠–١٠
//   `order`     «رَتِّبْ»            — ثلاثُ بطاقاتٍ إلى أربعٍ تصاعدياً
//   `neighbor`  «السَّابِقُ وَالتَّالِي» — جارُ العدد من الجهتين، ومفهومُ التساوي
//
// ————— لِمَ أربعُ شاشاتٍ في ملفٍّ واحد —————
//
// **قاعدةٌ معتمدة**: «كلُّ نوع شاشةٍ يُنجَز في جلسةٍ واحدة» (مراجعة الجلسة ١) — وبابُ
// الشيفرة في `test_measure.mjs` يطالب ملفَّ النوع بأنواع تمارينه كلِّها متى وُجد. وهذه
// الأربعةُ درسٌ واحد في المنهج (المرحلة ٤) وجلسةٌ واحدة، فملفُّها واحد.
//
// ————— وخمسةُ عهودٍ تحكم هذه الوحدة —————
//
// ١) **المقارنةُ بالرمز والتحقّقُ بالكمّ** (`METHOD.md §٣` — ٤·١): يُسأل عن الرمزين،
//    فإن أخطأ **رُئيت الكميتان** — فالرمزُ لا يُقارَن حفظاً بل رجوعاً إلى ما يعنيه.
// ٢) **التحاذي صفّين يسري من المرحلة ٣ فصاعداً** (تعديلٌ معتمد في `METHOD.md §٤`):
//    الكميتان في **إطارَي عشرةٍ متطابقين**، أحدُهما تحت الآخر — وكلاهما يُملأ من اليمين
//    بالهندسة نفسِها، فتتحاذى الخانةُ بالخانة ويُرى الفارقُ موضعاً قبل أن يُعَدّ. وهو
//    ما لم تُتِحه المرحلةُ الأولى (إطارُ الخمسة يُقدَّم درساً في ٣·٣) فأُجِّل إلى هنا.
// ٣) **خياراتُ الموضع مجاورةٌ كخيارات العدد**: «أين يقع؟» ثلاثُ خاناتٍ متجاورة على
//    الخطّ لا إحدى عشرةَ خانة — يقدّر الطفلُ موضعاً بين موضعين، وتبقى الخانةُ تبلغ
//    هدفَ اللمس. وهي قاعدةُ أحواض الخيارات نفسُها (`METHOD.md §٣`) مطبَّقةً على المواضع.
// ٤) **الخطأُ يُعَدّ أمامه**: على الخطّ **يُعَدّ عليه** من الصفر إلى الموضع الصحيح
//    (`countAlongLine`)، وفي المقارنة والترتيب **تُعَدّ الكميةُ المعنية** في إطارها.
// ٥) **الجوابُ من المرسوم**: أرقامُ البطاقات مقروءةٌ من `drawn`، وقيمةُ خانة الخطّ
//    مقروءةٌ من `data-value` على الزرّ نفسِه — لا من متغيّرٍ في الإغلاق.

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { h, icon, pick, shuffle, seeded, shake, pop, arNum, NUMERAL_ACCENT } from './ui.js';
import {
  BEAT, NUMBER_NAME, SAY, say, praiseThen, span, nearOptions, seeder, skillOf,
  stationById, stationForReview, figureBox, numeralCard, countAloud, clearCount,
  countAlongLine, clearLine, slotLayer, probeOf, registerExercise, stationScreen,
  roundGate,
} from './station.js';

const OPTIONS = 3;
const GUIDED = 2;
const SOLO = 5;

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['compare', 'line', 'order', 'neighbor']);

// ————— التعليماتُ المنطوقة (مُعلَنةٌ لا مستنتَجة — `check_speech.mjs`) —————

const ASK = {
  bigger: 'أَيُّهُمَا أَكْبَرْ؟',
  smaller: 'أَيُّهُمَا أَصْغَرْ؟',
  place: 'أَيْنَ يَقَعْ؟',
  sort: 'رَتِّبْ مِنَ الْأَصْغَرِ إِلَى الْأَكْبَرْ',
  after: 'مَا الَّذِي يَأْتِي بَعْدَهُ؟',
  before: 'مَا الَّذِي يَأْتِي قَبْلَهُ؟',
  same: 'أَيُّهُمَا يُسَاوِيهِ؟',
};

// **وجملتا الكشف ليستا هنا**: «وَهَذَانِ رَمْزَاهُمَا» و«وَهَذَا مَوْضِعُهُ عَلَى الْخَطّ»
// عرضٌ يُشاهَد لا فعلٌ يُطلَب، فموضعُهما جدولُ `SAY` في `station.js` — وبموضعهما
// تُشتقّ فئتُهما `modeling` (حكمُ المدير، مراجعة الجلسة ٤ البند ٥).

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// لكلِّ نوعٍ هنا محطةٌ واحدة، فالإعلانُ جبهتُها هي — وما وراءه يُجرَد **جولةً جولة**.

export const CONSUMES = {
  compare: {
    numbers: [0, 10], numerals: [0, 10], ops: [], signs: [],
    displays: ['numeral', 'ten-frame'],
  },
  line: {
    numbers: [0, 10], numerals: [0, 10], ops: [], signs: [],
    displays: ['numeral', 'line'],
  },
  order: {
    numbers: [0, 10], numerals: [0, 10], ops: [], signs: [],
    displays: ['numeral', 'ten-frame'],
  },
  neighbor: {
    numbers: [0, 10], numerals: [0, 10], ops: [], signs: [],
    displays: ['numeral', 'line', 'ten-frame'],
  },
};

/**
 * نمطُ التحقّق الكمّيّ: إطارٌ يبلغ جبهةَ المحطة — به يقع التحاذي صفّاً تحت صفّ.
 * **وقد لا يكون للمحطة نمطُ كمّيةٍ أصلاً** (٤·٢ «أين يقع؟» جبهتُها رمزٌ وخطٌّ لا كمية)
 * فتُرجِع `null`، ويكون تصحيحُها **عدّاً على الخطّ نفسِه** لا رجوعاً إلى إطار.
 */
function checkDisplay(frontier) {
  return frontier.displays.find((d) => d === 'ten-frame')
    || frontier.displays.find((d) => d === 'five-frame')
    || frontier.displays.find((d) => d !== 'numeral' && d !== 'line')
    || null;
}

// ————— ٤·١ «أَيُّهُمَا أَكْبَر؟» — بالرمزين —————

function compareRound(station, rnd, { aided = false, close = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'compare', 'pick');
  const pool = span(f.min, f.numeral);
  const a = pick(pool, rnd);
  // **فارقٌ واضح ثم متقارب** (`METHOD.md §٣` — قاعدةُ المقارنة منذ ١·٤): المتجاوران
  // يُمتحَنان في «وحدك»، والمتباعدان أولاً — فالمقارنةُ تشتدّ ولا تبدأ شديدة.
  const mates = pool.filter((n) => n !== a && (!close || Math.abs(n - a) === 1));
  const b = pick(mates.length ? mates : pool.filter((n) => n !== a), rnd);
  const bigger = rnd() < 0.5;
  const next = seeder(rnd);
  const check = checkDisplay(f);
  const left = { display: 'numeral', count: a, seed: next() };
  const right = { display: 'numeral', count: b, seed: next() };
  const checks = [
    { display: check, count: a, seed: next() },
    { display: check, count: b, seed: next() },
  ];
  return {
    kind: 'pick', concept: skill.concept, range: skill.range, bigger, aided,
    ask: bigger ? ASK.bigger : ASK.smaller,
    hint: 'اُنْظُرْ إِلَى الرَّمْزَيْن، وَاخْتَرْ',
    left,
    right,
    // كميّتا التحقّق: تُرسمان عند الخطأ (وفي «جرِّب معي» من أول لحظة) — ومُعلَنتان
    // في `figures` لأنّ الجردَ يقرأ **ما قد يراه الطفل** لا ما يُرسَم في الحال.
    checks,
    figures: [left, right, ...checks],
    sig: `${station.id}|${a}|${b}|${left.seed}`,
  };
}

function compareView(round, hooks) {
  const pair = h('div', { class: 'q-pair' });
  const check = h('div', { class: 'q-check q-rows', hidden: !round.aided });
  const gate = roundGate('أيُّهما أكبر؟');

  const sides = [round.left, round.right].map((spec) => {
    const cell = numeralCard(spec.count, spec.seed, {
      label: 'هَذَا', onclick: () => judge(cell),
    });
    pair.append(cell.btn);
    return cell;
  });
  const frames = round.checks.map((spec) => figureBox(spec, 'q-row'));
  check.replaceChildren(...frames.map((fig) => fig.box));

  const [a, b] = sides;
  // **الحكمُ من المرسوم**: يُقابَل رقمُ البطاقة المقروءُ من نصّها لا العددُ المطلوب
  const answer = round.bigger
    ? (a.drawn > b.drawn ? a : b)
    : (a.drawn < b.drawn ? a : b);

  const judge = gate.guard(async (choice) => {
    const correct = choice === answer;
    hooks.attempt(round, correct);
    if (correct) {
      gate.end();
      choice.btn.classList.add('good');
      pop(choice.btn);
      await praiseThen(hooks);
      return;
    }
    choice.btn.classList.add('bad');
    shake(choice.btn);
    /* **الرجوعُ إلى الكمّ**: يُكشَف الإطاران متحاذيين صفّاً تحت صفّ — فيُرى الفارقُ
       خانةً بخانة — ثم يُعَدّان أمامه. وهو تعديلُ `METHOD.md §٤` المعتمد. */
    check.hidden = false;
    await say(SAY.together);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    await countAloud(frames, hooks.alive);
    choice.btn.classList.remove('bad');
    for (const fig of frames) clearCount(fig);
  });

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    pair,
    check,
  );
}

// ————— ٤·٢ «أَيْنَ يَقَع؟» — خطُّ الأعداد —————

/**
 * **ومولّدُ الخطّ ومُصيِّرُه مُصدَّران** (الجلسة ٧): المحطة ٧·٤ تعلن `line|20|place`
 * فتسأل السؤالَ نفسَه بمداه الممتدّ — و**التمرينُ واحدٌ فلا يُنسَخ**: نسختان تفترقان
 * يوماً في «يُعَدّ على الخطّ ولا يُلقَّن»، والمقيسُ (`line|…|place`) واحدٌ في ليتنر
 * وفي لوحة وليّ الأمر. والمولّدُ **يقرأ جبهةَ محطته** فيمتدّ الخطُّ بامتدادها.
 */
export function lineRound(station, rnd, { aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'line', 'place');
  const pool = span(f.min, f.max);
  const target = pick(pool, rnd);
  const spots = shuffle([target, ...nearOptions(target, pool, OPTIONS - 1, rnd)], rnd);
  const next = seeder(rnd);
  const card = { display: 'numeral', count: target, seed: next() };
  const rail = { display: 'line', count: f.max, seed: next() };
  return {
    kind: 'place', concept: skill.concept, range: skill.range, aided,
    ask: ASK.place, hint: 'الصِّفْرُ فِي أَوَّلِ الخَطِّ مِنَ اليَمِين',
    card, rail, spots, target,
    figures: [card, rail],
    sig: `${station.id}|${target}|${rail.seed}`,
  };
}

export function lineView(round, hooks) {
  const card = figureBox(round.card, 'q-model');
  const rail = figureBox(round.rail, 'q-rail');
  const gate = roundGate('أين يقع؟');

  const { slots } = slotLayer(rail, round.spots, gate.guard(async (value, btn) => {
    // **الجوابُ من المرسوم**: قيمةُ الخانة من الزرّ، ورقمُ البطاقة من نصّها
    const correct = value === card.drawn;
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
    await say(SAY.together);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    // **يُعَدّ على الخطّ نفسِه** من الصفر إلى موضعه — يرى الصوابَ عدّاً لا تلقيناً
    if (await countAlongLine(rail, card.drawn, hooks.alive)) {
      await new Promise((r) => setTimeout(r, BEAT));
    }
    btn.classList.remove('bad');
    clearLine(rail);
  }));

  /* **العونُ المرئيّ في «جرِّب معي»** (`METHOD.md §٤`): يُعَدّ على الخطّ من الصفر
     مرّةً واحدة **بعد أن يتمّ السؤال** — نمذجةٌ بعونٍ، وهي **غيرُ مقيسة** في ليتنر.
     ولولا الانتظارُ لَسبق العدُّ المرئيُّ صوتَه بطول السؤال. */
  (async () => {
    await say(round.ask);
    if (!round.aided || !hooks.alive()) return;
    if (!(await countAlongLine(rail, card.drawn, hooks.alive))) return;
    await new Promise((r) => setTimeout(r, BEAT));
    if (hooks.alive()) clearLine(rail);
  })();

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    h('div', { class: 'q-stage q-hero' }, card.box),
    h('div', { class: 'q-linebox' }, rail.box),
    h('p', { class: 'hint' }, 'اِلْمَسِ المَوْضِعَ الَّذِي تَظُنُّه'),
  );
}

// ————— ٤·٣ «رَتِّبْ» — تصاعدياً —————

function orderRound(station, rnd, { aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'order', 'sort');
  const pool = span(f.min, f.numeral);
  const size = 3 + Math.floor(rnd() * 2);              // ثلاثُ بطاقاتٍ أو أربع
  const values = shuffle(pool, rnd).slice(0, size);
  const next = seeder(rnd);
  const check = checkDisplay(f);
  const cards = shuffle(values, rnd).map((n) => ({ display: 'numeral', count: n, seed: next() }));
  const checks = cards.map((c) => ({ display: check, count: c.count, seed: next() }));
  return {
    kind: 'sort', concept: skill.concept, range: skill.range, aided,
    ask: ASK.sort, hint: 'اِلْمَسِ الأَصْغَرَ أَوَّلًا',
    cards,
    checks,
    figures: [...cards, ...checks],
    sig: `${station.id}|${values.join('-')}|${cards[0].seed}`,
  };
}

function orderView(round, hooks) {
  const tray = h('ol', { class: 'q-tray' });
  const rack = h('div', { class: 'q-rack' });
  const check = h('div', { class: 'q-check q-rows', hidden: !round.aided });
  const gate = roundGate('رتِّبها');
  let placed = 0;

  const cells = round.cards.map((spec) => {
    const cell = numeralCard(spec.count, spec.seed, {
      label: 'هَذَا', onclick: () => choose(cell),
    });
    rack.append(cell.btn);
    return cell;
  });
  const frames = round.checks.map((spec, i) => ({
    fig: figureBox(spec, 'q-row'), value: cells[i].drawn,
  }));
  // **العونُ المرئيّ في «جرِّب معي»**: الكمياتُ حاضرةٌ متحاذيةً من أول لحظة
  if (round.aided) check.replaceChildren(...frames.map((f) => f.fig.box));

  /** الترتيبُ من **المرسوم**: تُرتَّب البطاقاتُ بأرقامها المقروءة لا بما طُلب رسمُه. */
  const remaining = () => cells.filter((c) => !c.btn.disabled);
  const nextRight = () => Math.min(...remaining().map((c) => c.drawn));

  const choose = gate.guard(async (cell) => {
    if (cell.btn.disabled) return;
    const correct = cell.drawn === nextRight();
    hooks.attempt(round, correct);
    if (correct) {
      cell.btn.disabled = true;
      cell.btn.classList.add('good');
      pop(cell.btn);
      placed++;
      tray.append(h('li', { class: 'q-slot num' }, arNum(cell.drawn)));
      // بطاقةٌ في موضعها: كلمةُ صوابٍ تُصَفّ — وآخرُها **تُنتظَر** ثم يُنتقَل
      if (placed === cells.length) {
        gate.end();
        await praiseThen(hooks);
      } else {
        say(SAY.bravo);
      }
      return;
    }
    cell.btn.classList.add('bad');
    shake(cell.btn);
    /* **تُرى الكمياتُ الباقيةُ متحاذية** (صفٌّ تحت صفّ) فيُقارِن بنفسه، **وتُعَدّ التي
       لمس** وحدَها — فلا تلقينَ للصواب، وإنما رجوعٌ من الرمز إلى ما يعنيه. */
    const left = new Set(remaining().map((c) => c.drawn));
    check.replaceChildren(...frames.filter((f) => left.has(f.value)).map((f) => f.fig.box));
    check.hidden = false;
    await say(SAY.together);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    const mine = frames.find((f) => f.value === cell.drawn);
    if (mine) {
      await countAloud([mine.fig], hooks.alive);
      clearCount(mine.fig);
    }
    cell.btn.classList.remove('bad');
  });

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    tray,
    rack,
    check,
  );
}

// ————— ٤·٤ «السَّابِقُ وَالتَّالِي» ومفهومُ التساوي —————

const NEIGHBOR_MODES = ['after', 'before', 'same'];

function neighborRound(station, rnd, mode = null, aided = false) {
  const f = station.frontier;
  const skill = skillOf(station, 'neighbor', 'next');
  const pool = span(f.min, f.max);
  const face = mode || pick(NEIGHBOR_MODES, rnd);
  const lo = face === 'after' ? f.min : f.min + 1;
  const hi = face === 'after' ? f.max - 1 : f.max;
  const given = pick(span(lo, hi), rnd);
  const target = face === 'after' ? given + 1 : face === 'before' ? given - 1 : given;
  const counts = shuffle([target, ...nearOptions(target, pool.filter(
    (n) => face === 'same' || n !== given), OPTIONS - 1, rnd)], rnd);
  const next = seeder(rnd);
  const check = checkDisplay(f);
  const card = { display: 'numeral', count: given, seed: next() };
  const options = counts.map((c) => ({ display: 'numeral', count: c, seed: next() }));
  // **الجيرانُ يُرَون على الخطّ، والتساوي يُرى في الإطارين**: لكلِّ وجهٍ عونُ تصحيحه
  const rail = face === 'same' ? null : { display: 'line', count: f.max, seed: next() };
  const checks = face === 'same'
    ? counts.map((c) => ({ display: check, count: c, seed: next() }))
    : [];
  return {
    kind: 'next', concept: skill.concept, range: skill.range, mode: face, given, target, aided,
    ask: face === 'after' ? ASK.after : face === 'before' ? ASK.before : ASK.same,
    hint: face === 'same'
      ? 'الْعَدَدَانِ سَوَاءٌ إِذَا كَانَ رَمْزُهُمَا وَاحِدًا'
      : 'الخَطُّ يُرِيكَ الجِيرَان',
    card,
    options,
    rail,
    checks,
    figures: [card, ...options, ...(rail ? [rail] : []), ...checks],
    sig: `${station.id}|${face}|${given}|${card.seed}`,
  };
}

function neighborView(round, hooks) {
  const card = figureBox(round.card, 'q-model');
  const choices = h('div', { class: 'q-choices' });
  const check = h('div', { class: 'q-check q-rows', hidden: !(round.aided && !round.rail) });
  const railBox = h('div', { class: 'q-linebox', hidden: !round.aided });
  const rail = round.rail ? figureBox(round.rail, 'q-rail') : null;
  if (rail) railBox.append(rail.box);
  const frames = round.checks.map((spec) => figureBox(spec, 'q-row'));
  if (round.aided && frames.length) check.replaceChildren(...frames.map((fig) => fig.box));
  const gate = roundGate('السابق والتالي');

  const cells = round.options.map((spec) => {
    const cell = numeralCard(spec.count, spec.seed, {
      label: 'هَذَا', onclick: () => choose(cell),
    });
    choices.append(cell.btn);
    return cell;
  });

  const choose = gate.guard(async (cell) => {
    // **الحكمُ من المرسوم**: جارُ الرقم المقروء على البطاقة المعروضة
    const want = round.mode === 'after' ? card.drawn + 1
      : round.mode === 'before' ? card.drawn - 1 : card.drawn;
    const correct = cell.drawn === want;
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
    if (rail) {
      /* **يُعَدّ على الخطّ حتى العدد المعروض** — فيرى أين يقف، وجاراه إلى جانبه
         يراهما بنفسه. عدٌّ لا تلقين: الخطُّ لا يقول أيُّ البطاقات صحيحة. */
      railBox.hidden = false;
      await countAlongLine(rail, card.drawn, hooks.alive);
      clearLine(rail);
    } else {
      check.replaceChildren(...frames.map((fig) => fig.box));
      check.hidden = false;
      const mine = frames[cells.indexOf(cell)];
      if (mine) {
        await countAloud([mine.fig], hooks.alive);
        clearCount(mine.fig);
      }
    }
    cell.btn.classList.remove('bad');
  });

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    h('div', { class: 'q-stage q-hero' }, card.box),
    choices,
    railBox,
    check,
  );
}

// ————— خطةُ المحطة —————

const BUILD = {
  compare: (st, rnd, o) => compareRound(st, rnd, o),
  line: (st, rnd, o) => lineRound(st, rnd, o),
  order: (st, rnd, o) => orderRound(st, rnd, o),
  neighbor: (st, rnd, o) => neighborRound(st, rnd, o.mode, o.aided),
};

/**
 * **نمذجةُ كلِّ نوع** — ما يُعرَض في «شاهِدْ» بلا مطالبة، وترتيبُه هو الدرس:
 *
 *   • المقارنةُ والترتيب: **كميتان تُعَدّان متحاذيتين ثم يُكشَف رمزاهما** — فيرى الطفلُ
 *     أنّ الرمزَ الأكبر يقابل الكمَّ الأكبر، وهو ما تقوم عليه المرحلةُ كلُّها.
 *   • الخطُّ والجيران: **يُعَدّ على الخطّ من الصفر** إلى موضعٍ ثم يُكشَف رمزُه — والخطُّ
 *     نفسُه هو الكمية المعدودة هنا (محطةُ ٤·٢ جبهتُها رمزٌ وخطٌّ لا كمية).
 */
function modelOf(station, rnd) {
  const f = station.frontier;
  const next = seeder(rnd);
  const check = checkDisplay(f);
  const shown = Math.max(f.min, Math.min(f.max, Math.round(f.max / 2)));

  /* **ولكلِّ محطةٍ نمذجةُ درسها لا نمذجةُ جارتها**: «رتِّب» تُنمذَج بثلاث كميّاتٍ
     تُعَدّ **من الأصغر إلى الأكبر** ثم تُكشَف رموزُها بترتيبها — فالترتيبُ يُرى قبل
     أن يُطلَب. ولو نُمذجت بمقارنةِ اثنتين لَنمذجنا درساً آخر. */
  if (check && station.type === 'order') {
    const steps = [1, 2, 3].map((i) =>
      Math.max(f.min + 1, Math.round((f.max * i) / 4)));
    const seeds = steps.map(() => next());
    return {
      title: ASK.sort,
      hint: 'نَعُدُّهَا وَاحِدَةً وَاحِدَة، مِنَ الأَصْغَرِ إِلَى الأَكْبَر',
      figures: steps.map((n, i) => ({ display: check, count: n, seed: seeds[i] })),
      reveal: {
        say: SAY.revealPair,
        figures: steps.map((n) => ({ display: 'numeral', count: n, seed: next() })),
      },
    };
  }

  if (check && station.type === 'compare') {
    // **النمذجةُ لا تُطيل**: كميّتان من ثلثَي الجبهة لا من أقصاها — العدُّ أمامه
    // درسٌ يُرى لا انتظارٌ يُملّ، والفارقُ بينهما هو المقصود لا كِبَرُهما.
    const big = Math.max(f.min + 1, Math.ceil((f.max * 2) / 3));
    const small = Math.max(f.min, big - 3);
    return {
      title: ASK.bigger,
      hint: 'نَعُدُّ هَذِهِ وَهَذِهِ، فَنَرَى أَيُّهُمَا أَكْبَر — ثُمَّ نَقْرَأُ رَمْزَيْهِمَا',
      figures: [
        { display: check, count: big, seed: next() },
        { display: check, count: small, seed: next() },
      ],
      reveal: {
        say: SAY.revealPair,
        figures: [
          { display: 'numeral', count: big, seed: next() },
          { display: 'numeral', count: small, seed: next() },
        ],
      },
    };
  }

  return {
    title: station.type === 'line' ? ASK.place : ASK.after,
    hint: 'الصِّفْرُ فِي أَوَّلِ الخَطِّ مِنَ اليَمِين، وَكُلَّمَا مَشَيْنَا زَادَ وَاحِدًا',
    // **الخطُّ يُعَدّ عليه** (`upTo`): علامةٌ بعد علامةٍ باسمها حتى الموضع المقصود
    figures: [{ display: 'line', count: f.max, seed: next(), upTo: shown }],
    reveal: {
      say: SAY.revealSpot,
      figures: [{ display: 'numeral', count: shown, seed: next() }],
    },
  };
}

export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const build = BUILD[station.type];

  // **الجيرانُ ثلاثةُ أوجه** (سابقٌ وتالٍ ويساوي — `METHOD.md §٣` ٤·٤)، فتُوزَّع
  // جولاتُ «وحدك» عليها كلِّها بالدور: لا يُمتحَن في وجهٍ ويُترَك وجهان.
  const modes = station.type === 'neighbor'
    ? Array.from({ length: SOLO }, (_, i) => NEIGHBOR_MODES[i % NEIGHBOR_MODES.length])
    : [];

  return {
    model: modelOf(station, rnd),
    guided: Array.from({ length: GUIDED },
      (_, i) => build(station, rnd, { aided: true, mode: modes[i], close: false })),
    // **فارقٌ واضح ثم متقارب**: تشتدّ المقارنةُ جولةً بعد جولة ولا تبدأ شديدة
    solo: Array.from({ length: SOLO },
      (_, i) => build(station, rnd, { mode: modes[i], close: i >= 2 })),
  };
}

export function probeRounds(stationId, seed) {
  return probeOf(buildStation(stationId, seed));
}

// ————— تسجيلُ المحاولة (بابُ الشيفرة: مَن أعلن قياساً كتبه، ولكلِّ نوعٍ سطرُه) —————

const SCORE = {
  pick: (r, ok) => progress.recordAttempt(r.concept, r.range, 'pick', ok),
  place: (r, ok) => progress.recordAttempt(r.concept, r.range, 'place', ok),
  sort: (r, ok) => progress.recordAttempt(r.concept, r.range, 'sort', ok),
  next: (r, ok) => progress.recordAttempt(r.concept, r.range, 'next', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

const VIEWS = {
  pick: compareView, place: lineView, sort: orderView, next: neighborView,
};
const viewOf = (round, hooks) => VIEWS[round.kind](round, hooks);

// ————— التسجيل في الموجِّه وفي المراجعة —————

function screen(type) {
  return (part) => {
    const station = stationById(`${type}:${part}`);
    if (!station) return null;
    return stationScreen({
      nodeId: station.id,
      title: station.title,
      accent: NUMERAL_ACCENT,
      make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x27d4eb2f),
      view: viewOf,
      score,
      save: (stars) => progress.setStars(station.id, stars),
    });
  };
}

/* **وكلُّ سابقةٍ تُسجَّل باسمها صريحاً** لا بحلقةٍ على `TYPES`: حارسُ «لا عقدةَ بلا
   كاتبِ نجمة» (`test_nodes.mjs`) يجرد السوابقَ المسجَّلة **من نصّ الشيفرة**، فتسجيلٌ
   بمتغيّرٍ يُعميه عن أربع سوابقَ فينام عنها وهي حيّة — وذلك أخضرُ كاذب. */
registerScreen('compare', screen('compare'));
registerScreen('line', screen('line'));
registerScreen('order', screen('order'));
registerScreen('neighbor', screen('neighbor'));

/** جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات (`review.js`). */
const single = (build) => (skill, rnd) => {
  const station = stationForReview(skill, rnd, TYPES);
  return station && TYPES.has(station.type) ? build(station, rnd) : null;
};

registerExercise('pick', { build: single((s, r) => compareRound(s, r)), view: viewOf });
registerExercise('place', { build: single(lineRound), view: viewOf });
registerExercise('sort', { build: single(orderRound), view: viewOf });
registerExercise('next', { build: single((s, r) => neighborRound(s, r)), view: viewOf });
