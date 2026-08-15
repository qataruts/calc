// **المرحلة ١ — الكَمُّ بلا رمز** (`METHOD.md §٣`): ستُّ محطاتٍ بثلاث شاشات.
//
//   `subitize`  «كَمْ تَرَى؟»            — التقديرُ الفوريّ ١–٢ ثم ١–٣ ثم ٤–٥
//   `match`     «طَابِقِ الكَمِّيَّتَيْن»  — توزيعان مختلفان للعدد نفسِه
//   `more`      «أَيُّهُمَا أَكْثَر؟»      — المقارنةُ البصرية، وسواءٌ في الأخيرة
//
// ————— أربعةُ عهودٍ تحكم هذه الوحدة —————
//
// ١) **لا رمزَ عدديّ واحد** في المرحلة كلِّها (`METHOD.md §٣`): الجوابُ **بطاقةُ كمّ**
//    لا رقم — «فالطفل يطابق كمّاً بكمّ». ولا رقمَ في نصٍّ ولا تحت بطاقة ولا في عدّاد.
// ٢) **الخطفُ طبيعةُ تمرينٍ لا مؤقّتُ ضغط** (`METHOD.md §٢.٧`): يُعرَض الكمُّ لحظةً
//    فيُجبَر التقديرُ ويمتنع العدّ — ثم **يُعاد العرضُ بنقرة، بلا حدٍّ ولا احتساب**،
//    وصياغتُه للطفل «شَاهِدْ ثُمَّ أَجِبْ». ولا عدّادَ ينزل ولا شريطَ يفرغ.
// ٣) **المشتّتاتُ متجاورة** (`nearOptions` في `station.js`) ومن الجبهة حصراً.
// ٤) **الجولاتُ حتميةٌ ببذرة** ولا تمرينَ مكتوبٌ بيد (`METHOD.md §١٠.١`): يبنيها
//    `buildStation` وحدَها، ويجردها `probeRounds` للحارس — فما يُجرَد هو ما يُلعَب.

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { h, icon, landmark, pick, shuffle, seeded, shake, pop, QUANTITY_ACCENT } from './ui.js';
import {
  BEAT, FLASH_MS, SAY, say, praiseThen, span, nearOptions, seeder, skillOf,
  stationById, stationForReview, figureBox, quantityCard, countAloud, clearCount,
  probeOf, registerExercise, stationScreen, roundGate,
} from './station.js';

const OPTIONS = 3;         // ثلاثُ بطاقاتٍ: هدفٌ ومجاوران
const GUIDED = 2;          // «جرِّب معي» — جولتان بعونٍ مرئيّ (`METHOD.md §٤`)
const SOLO = 5;            // «وحدك» — أربعٌ إلى ستّ، وهي المقيسة

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['subitize', 'match', 'more']);

// ————— التعليماتُ المنطوقة —————
//
// **مُعلَنةٌ لا مستنتَجة**: يجردها `tools/check_speech.mjs` فيطالب لكلٍّ بملفٍّ مولَّد
// أو مكانٍ في `tools/audio_queue.json`. ولا معدودَ مقروناً بعددٍ في واحدةٍ منها (ق٢).

const ASK = {
  flash: 'كَمْ تَرَى؟',
  watch: 'شَاهِدْ ثُمَّ أَجِبْ',
  set: 'طَابِقِ الْكَمِّيَّتَيْنْ',
  more: 'أَيُّهُمَا أَكْثَرْ؟',
};

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// **الإعلانُ أرضيةٌ لا سقف**: لنوع الشاشة الواحد محطاتٌ جبهاتُها مختلفة (`subitize`
// ثلاثٌ: ١–٢ ثم ١–٣ ثم ١–٥)، والحارسُ يقابل الإعلانَ **بكل** محطةٍ من نوعه — فالمُعلَن
// هو ما تشترك فيه جبهاتُها كلُّها. وما زاد عليه في محطةٍ بعينها **يُجرَد جولةً جولة**
// في `probeRounds` على جبهتها هي، وهو الفحصُ الأصدق: يقرأ ما سيراه الطفل لا ما نوينا.

export const CONSUMES = {
  subitize: { numbers: [1, 2], numerals: [], ops: [], signs: [], displays: ['dice'] },
  match: { numbers: [1, 2, 3], numerals: [], ops: [], signs: [], displays: ['dice', 'scatter'] },
  more: { numbers: [1, 2, 3], numerals: [], ops: [], signs: [], displays: ['dice', 'scatter'] },
};

// ————— اختيارُ أنماط العرض من جبهة المحطة —————

/**
 * نمطُ الكمّية المسؤول عنها السؤال: **ما ليس نرداً إن أتاحته الجبهة**.
 * وعلّتُه أنّ الهدفَ لو كان نرداً والخياراتُ نرداً لصار التمرينُ مطابقةَ **صورة** لا
 * تقديرَ كمّ. وحيث لا تُتيح الجبهةُ غيرَ النرد (المحطة الأولى، ١–٢) فالكمّان أصغرُ من
 * أن تُحفَظ صورتُهما — وهي أوّلُ لقاءٍ بالتقدير أصلاً.
 */
function heroDisplay(frontier, rnd) {
  const others = frontier.displays.filter((d) => d !== 'dice');
  return others.length ? pick(others, rnd) : frontier.displays[0];
}

/**
 * نمطُ بطاقات الاختيار: **النردُ أولاً** (`METHOD.md §٣`: «الخيارات بطاقات كميات (نرد)»)
 * ما دام كلُّ عددٍ فيها يقع في مدى وجوه النرد؛ وإلّا فالمبعثر. ونمطٌ **واحد** لبطاقات
 * الجولة كلِّها — بطاقاتٌ بأنماطٍ مختلفة تجعل المقارنةَ بين شكلين لا بين كمّين.
 */
function cardDisplay(frontier, counts) {
  if (frontier.displays.includes('dice') && Math.max(...counts) <= 6) return 'dice';
  if (frontier.displays.includes('scatter')) return 'scatter';
  return frontier.displays[0];
}

// ————— بناءُ الجولات (حتميٌّ ببذرة) —————

/** جولةُ «كم ترى؟» — خاطفةً في «وحدك»، وظاهرةً في «جرِّب معي». */
function flashRound(station, rnd, flash) {
  const f = station.frontier;
  const skill = skillOf(station, 'subitize', 'flash');
  const pool = span(f.min, f.max);
  const count = pick(pool, rnd);
  const counts = shuffle([count, ...nearOptions(count, pool, OPTIONS - 1, rnd)], rnd);
  const card = cardDisplay(f, counts);
  const next = seeder(rnd);
  const target = { display: heroDisplay(f, rnd), count, seed: next() };
  const options = counts.map((c) => ({ display: card, count: c, seed: next() }));
  return {
    kind: 'flash', concept: skill.concept, range: skill.range, flash,
    ask: ASK.flash, hint: flash ? ASK.watch : 'اُنْظُرْ، وَاخْتَرْ مِثْلَهَا',
    target, options, figures: [target, ...options],
    sig: `${station.id}|${target.seed}`,
  };
}

/**
 * جولةُ «طابِقِ الكميتين» — **توزيعان مختلفان للعدد نفسِه** (`METHOD.md §٣` — ١·٣):
 * الهدفُ بنمطٍ والخياراتُ بنمطٍ آخر، فلا تُطابَق صورةٌ بصورة.
 */
function matchRound(station, rnd) {
  const f = station.frontier;
  const skill = skillOf(station, 'match', 'set');
  const pool = span(f.min, f.max);
  const count = pick(pool, rnd);
  const counts = shuffle([count, ...nearOptions(count, pool, OPTIONS - 1, rnd)], rnd);
  const card = cardDisplay(f, counts);
  const other = f.displays.filter((d) => d !== card);
  const next = seeder(rnd);
  const target = { display: other.length ? pick(other, rnd) : card, count, seed: next() };
  const options = counts.map((c) => ({ display: card, count: c, seed: next() }));
  return {
    kind: 'set', concept: skill.concept, range: skill.range, flash: false,
    ask: ASK.set, hint: 'اِخْتَرِ الْبِطَاقَةَ الَّتِي فِيهَا مِثْلُهَا',
    target, options, figures: [target, ...options],
    sig: `${station.id}|${target.seed}`,
  };
}

/**
 * جولةُ «أيُّهما أكثر» — **فارقٌ واضح ثم متقارب** (`METHOD.md §٣` — ١·٤)، و«سَوَاء»
 * تدخل في المحطة الختامية وحدَها (١·٦ «كثيرٌ وقليلٌ وسواء»).
 */
function moreRound(station, rnd, { close = false, same = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'compare', 'more');
  // «سَوَاء» تدخل مع المحطة الختامية وحدَها — وتُعرَف بأنّها هي التي تختم بالمطابقة
  // (١·٦ «كثيرٌ وقليلٌ وسواء»، وهي وحدَها تدرّس `match|5|set`). وشرطٌ **واحد** يحكم
  // الزرَّ والتلميحَ وتوليدَ الجولة المتساوية معاً، فلا تُولَّد جولةٌ لا جوابَ لها.
  const closing = Boolean(skillOf(station, 'match', 'set'));
  const pool = span(f.min, f.max);
  const next = seeder(rnd);
  let a = pick(pool, rnd);
  let b;
  if (same) {
    b = a;
  } else {
    const gap = close ? [1] : span(2, Math.max(2, f.max - f.min));
    const mates = pool.filter((c) => gap.includes(Math.abs(c - a)));
    b = mates.length ? pick(mates, rnd) : pool.find((c) => c !== a);
    if (b === undefined) { a = pool[pool.length - 1]; b = pool[0]; }
  }
  const display = heroDisplay(f, rnd);
  const left = { display, count: a, seed: next() };
  const right = { display, count: b, seed: next() };
  return {
    kind: 'more', concept: skill.concept, range: skill.range,
    ask: ASK.more,
    hint: closing ? 'اِلْمَسِ الأَكْثَر — وَقَدْ يَكُونَانِ سَوَاء' : 'اِلْمَسِ الأَكْثَر',
    left, right, sameAllowed: closing, figures: [left, right],
    sig: `${station.id}|${left.seed}`,
  };
}

/**
 * **خطةُ المحطة**: نمذجةٌ ثم جولتان بعون ثم جولاتُ «وحدك» — وكلُّها من بذرةٍ واحدة،
 * فتُعاد الجلسةُ نفسُها ويُجرَد ما فيها قبل أن يراه طفل.
 */
export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const f = station.frontier;
  const next = seeder(rnd);

  if (station.type === 'subitize') {
    const shown = { display: heroDisplay(f, rnd), count: f.max, seed: next() };
    return {
      model: {
        title: ASK.flash, hint: 'سَنَعُدُّهَا مَعًا، ثُمَّ تُقَدِّرُهَا بِنَظْرَة',
        figures: [shown],
      },
      guided: Array.from({ length: GUIDED }, () => flashRound(station, rnd, false)),
      solo: Array.from({ length: SOLO }, () => flashRound(station, rnd, true)),
    };
  }

  if (station.type === 'match') {
    const shown = { display: heroDisplay(f, rnd), count: f.max, seed: next() };
    return {
      model: {
        title: ASK.set, hint: 'الْكَمِّيَّةُ نَفْسُهَا قَدْ تُرْسَمُ بِأَكْثَرَ مِنْ شَكْل',
        figures: [shown],
      },
      guided: Array.from({ length: GUIDED }, () => matchRound(station, rnd)),
      solo: Array.from({ length: SOLO }, () => matchRound(station, rnd)),
    };
  }

  // `more` — والمحطة الختامية (١·٦) تختم بالمطابقة كما ينصّ المنهج
  const closing = Boolean(skillOf(station, 'match', 'set'));
  const display = heroDisplay(f, rnd);
  const big = { display, count: f.max, seed: next() };
  const small = { display, count: Math.max(f.min, f.max - 2), seed: next() };
  /* **وفي الختامية يُكشَف الميزانُ أوّلَ لقاء** (جردُ الصنف — الجلسة م٥): المحطةُ
     الوحيدة التي فيها «هُمَا سَوَاء» تُري بعد العدّ **كمّيتين متساويتين وبينهما
     الميزانُ المتوازن** وتسمّيه — فيعرف الطفلُ صورةَ الزرّ ومعناه قبل أن يحتاجه،
     ولا يقف أمام كلمتين لا يقرؤهما (`docs/FIELD.md §٤`). */
  const level = { display, count: f.max, seed: next() };
  return {
    model: {
      title: ASK.more, hint: 'نَعُدُّ هَذِهِ ثُمَّ هَذِهِ، فَنَرَى أَيُّهُمَا أَكْثَر',
      figures: [big, small],
      reveal: closing
        ? { sign: 'scales', say: SAY.revealBoth, figures: [big, level] }
        : undefined,
    },
    guided: [
      moreRound(station, rnd),
      closing ? matchRound(station, rnd) : moreRound(station, rnd, { close: true }),
    ],
    solo: closing
      ? [
        moreRound(station, rnd),
        moreRound(station, rnd, { same: true }),
        moreRound(station, rnd, { close: true }),
        moreRound(station, rnd, { close: true }),
        matchRound(station, rnd),
        matchRound(station, rnd),
      ]
      : [
        moreRound(station, rnd),
        moreRound(station, rnd),
        moreRound(station, rnd, { close: true }),
        moreRound(station, rnd, { close: true }),
        moreRound(station, rnd, { close: true }),
      ],
  };
}

/** جردُ الجولات للحارس — **النمذجةُ والعونُ و«وحدك» كلُّها**، فلا شكلَ يفلت. */
export function probeRounds(stationId, seed) {
  return probeOf(buildStation(stationId, seed));
}

// ————— تسجيلُ المحاولة —————
//
// **لكلِّ نوعِ تمرينٍ سطرُه باسمه صريحاً**: فما تكتبه هذه الوحدة في ليتنر **مقروءٌ في
// شيفرتها** لا مستنتَجٌ من متغيّر — وعليه يقوم بابُ الشيفرة في `test_measure.mjs`
// («مَن أعلن قياساً كتبه»). والمفتاحُ مفتاحُ **المهارة المطلوبة** لا ما لمس الطفل.

const SCORE = {
  flash: (r, ok) => progress.recordAttempt(r.concept, r.range, 'flash', ok),
  set: (r, ok) => progress.recordAttempt(r.concept, r.range, 'set', ok),
  more: (r, ok) => progress.recordAttempt(r.concept, r.range, 'more', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

// ————— الشاشات —————

/**
 * «كم ترى؟» و«طابِق»: كمّيةٌ ثم بطاقاتُ كمّ.
 *
 * **الخطف** (في `flash` وحدَه): يُعرَض الكمُّ ثم يُغطّى — والغطاءُ ليس عقاباً ولا
 * سباقاً: زرُّ «أَعِدِ الْعَرْض» تحته **بلا حدٍّ ولا احتساب**، ولا شيءَ يُقاس إلا
 * الاختيار. **ومعالجةُ الخطأ**: يُرفَع الغطاءُ وتُعَدُّ الكميةُ أمامه عنصراً عنصراً،
 * ثم يُعاد الغطاءُ ويحاول ثانية — **يرى الصوابَ عدّاً لا تلقيناً**.
 */
function chooseView(round, hooks) {
  const stage = h('div', { class: 'q-stage q-hero' });
  const cover = h('div', { class: 'q-cover', 'aria-hidden': 'true' }, icon('eye'));
  const target = figureBox(round.target);
  stage.append(target.box, cover);

  const choices = h('div', { class: 'q-choices' });
  const foot = h('div', { class: 'row foot' });
  const gate = roundGate('كم ترى؟');

  // الغطاءُ مرفوعٌ في «جرِّب معي» (الكميةُ حاضرةٌ عوناً) ومسدولٌ في «وحدك» بعد الخطفة
  const show = () => { cover.hidden = true; };
  const hide = () => { cover.hidden = false; };
  show();

  async function flash() {
    if (!round.flash) return;
    clearCount(target);
    show();
    await new Promise((r) => setTimeout(r, FLASH_MS));
    if (!hooks.alive()) return;
    hide();
  }

  async function correction(card) {
    show();
    await countAloud([target], hooks.alive);
    if (!hooks.alive()) return;
    card.classList.remove('bad');
    if (round.flash) { hide(); clearCount(target); }
  }

  for (const spec of round.options) {
    const { btn, drawn } = quantityCard(spec, {
      label: 'هَذِهِ',
      // **ولا نقرةَ ثانيةً تفتح تصحيحاً ثانياً** فوق الأول: القفلُ من لحظة الحكم،
      // **ويُرَدّ في كل حال** (بلاغُ الميدان ٦) — فالخطأُ لا يُغلق الجولة.
      onclick: gate.guard(async () => {
        // **الجوابُ من المصيِّر لا من الطلب**: يُقابَل ما رُسِم بما رُسِم (`drawn`)
        const correct = drawn === target.drawn;
        hooks.attempt(round, correct);
        if (correct) {
          gate.end();
          btn.classList.add('good');
          pop(btn);
          // **يُرفَع الغطاءُ عند الصواب**: يرى الكميةَ التي قدّرها فيصدّق تقديرَه —
          // وهي تغذيةٌ راجعة على الحسّ نفسِه لا مكافأةٌ زائدة.
          show();
          await praiseThen(hooks);
          return;
        }
        btn.classList.add('bad');
        shake(btn);
        await say(SAY.together);
        if (!hooks.alive()) return;
        await new Promise((r) => setTimeout(r, BEAT / 2));
        if (hooks.alive()) await correction(btn);
        btn.classList.remove('bad');
      }),
    });
    choices.append(btn);
  }

  if (round.flash) {
    foot.append(h('button', {
      class: 'btn',
      onclick: flash,
    }, icon('repeat'), ' أَعِدِ الْعَرْض'));
  }

  /* **السؤالُ يُسمَع تامّاً ثم تُخطَف الكميّة**: لولا الانتظارُ لَجرت الخطفةُ فوق
     السؤال، فاختلف زمنُ العرض من جولةٍ إلى جولة بطول جملةٍ لا يملكها الطفل. */
  (async () => {
    await say(round.ask);
    if (hooks.alive()) flash();
  })();

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    stage,
    foot,
    choices,
  );
}

/**
 * «أيُّهما أكثر؟» — بطاقتان تُلمَس أكثرُهما، ومعهما «سَوَاء» في المحطة الختامية.
 *
 * **ومعالجةُ الخطأ عدٌّ لا تلقين**: تُعَدُّ الكميتان أمامه واحدةً بعد أخرى فيسمع
 * «واحد اثنان» هنا و«واحد اثنان ثلاثة» هناك، ثم يحاول ثانية.
 * (ونصُّ §٤ يذكر أيضاً **صفّين متحاذيين** يُرى بينهما الفارق عنصراً بعنصر — وهو
 * يقتضي نمطَ صفٍّ واحد لا تُتيحه جبهةُ المرحلة ١، فرُفع الأمرُ إلى مدير المشروع
 * ولم يُقرَّر ذاتياً؛ `SESSIONS.md` بندُ الجلسة ٣.)
 */
function moreView(round, hooks) {
  const pair = h('div', { class: 'q-pair' });
  const foot = h('div', { class: 'row foot' });
  const gate = roundGate('أيُّهما أكثر؟');

  const sides = [round.left, round.right].map((spec) => {
    const fig = figureBox(spec);
    const btn = h('button', { class: 'qcard qcard--side', 'aria-label': 'هَذِهِ أَكْثَر' },
      fig.box);
    pair.append(btn);
    return { fig, btn, drawn: fig.drawn };
  });

  // **الحكمُ من المرسوم**: أكثرُهما هي التي رسم المصيِّرُ فيها أكثر — لا التي طُلبت
  const [a, b] = sides;
  const answer = a.drawn === b.drawn ? 'same' : (a.drawn > b.drawn ? a : b);

  const judge = gate.guard(async (choice, el) => {
    const correct = choice === answer;
    hooks.attempt(round, correct);
    if (correct) {
      gate.end();
      el.classList.add('good');
      pop(el);
      await praiseThen(hooks);
      return;
    }
    el.classList.add('bad');
    shake(el);
    await say(SAY.together);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    await countAloud(sides.map((s) => s.fig), hooks.alive);
    el.classList.remove('bad');
  });

  for (const side of sides) side.btn.addEventListener('click', () => judge(side, side.btn));

  /* **وزرُّ التساوي يُرى قبل أن يُقرأ** (جردُ الصنف — `FIELD.md §٤`): هنا وقف أوّلُ
     طفلٍ حقيقيّ («توقّف عند «هما سواء» فلم يعلم ما يصنع حتى شرحتُ له») — كلمتان في
     زرٍّ أمام جمهورٍ **قبل-قارئ**. فصار يحمل **الميزانَ المتوازن**، وهو معلمُ مرحلة
     المقارنة نفسُه من `ui.js` لا رسمٌ ثانٍ له؛ **وأوّلُ لقاءٍ به في نمذجة محطته**
     (`buildStation` أعلاه): يُكشَف اللوحان مستويين وبينهما الميزانُ مع «هُمَا سَوَاءْ»
     — فيُرى ويُسمَع قبل أن يُطلَب. والكلمةُ تبقى **زينةً لوليّ الأمر**. */
  if (round.sameAllowed) {
    const sameBtn = h('button', { class: 'btn btn--wide same-btn' },
      landmark('scales'), ' هُمَا سَوَاء');
    sameBtn.addEventListener('click', () => judge('same', sameBtn));
    foot.append(sameBtn);
  }

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    pair,
    foot,
  );
}

const viewOf = (round, hooks) =>
  (round.kind === 'more' ? moreView(round, hooks) : chooseView(round, hooks));

// ————— التسجيل في الموجِّه وفي المراجعة —————
//
// **الشاشةُ تسجّل نفسَها** (`SEED.md §٧.١`): لا يعرف `main.js` اسمَ شاشةٍ هنا، ولا
// تدخل محطةٌ جديدة من هذه الأنواع بسطرٍ يُعدَّل خارج `curriculum.js`.

function screen(type) {
  return (part) => {
    const station = stationById(`${type}:${part}`);
    if (!station) return null;
    return stationScreen({
      nodeId: station.id,
      title: station.title,
      accent: QUANTITY_ACCENT,
      make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x9e3779b9),
      view: viewOf,
      score,
      save: (stars) => progress.setStars(station.id, stars),
    });
  };
}

registerScreen('subitize', screen('subitize'));
registerScreen('match', screen('match'));
registerScreen('more', screen('more'));

/** جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات (`review.js`). */
const single = (build) => (skill, rnd) => {
  const station = stationForReview(skill, rnd, TYPES);
  return station && TYPES.has(station.type) ? build(station, rnd) : null;
};

registerExercise('flash', { build: single((s, r) => flashRound(s, r, true)), view: viewOf });
registerExercise('set', { build: single(matchRound), view: viewOf });
registerExercise('more', { build: single(moreRound), view: viewOf });
