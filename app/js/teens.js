// **المرحلة ٧ — العَشَرَةُ وَمَا بَعْدَهَا ١١–٢٠** (`METHOD.md §٣`): إحدى عشرةَ محطة.
//
//   `teen`    «حُزْمَةُ العَشَرَة» ثم «١١–١٥» ثم «١٦–١٩» ثم «العِشْرُونَ وَخَطُّ ٠–٢٠»
//   `bridge`  «اِصْنَعْ عَشَرَةً أَوَّلًا» ثم «ثَبِّتِ العُبُورَ صُعُودًا» — بحقائقَ جديدة
//   `skip`    «اِعْدُدْ قَفْزًا» — بالاثنين والخمسة والعشرة على الخطّ (الجلسة ك)
//   `sub`     «اِطْرَحْ ضِمْنَ ٢٠» و«ثَبِّتِ العُبُورَ نُزُولًا» — عبوراً نازلاً
//   `double`  «المُزْدَوَجَاتُ إِلَى ٢٠» · و`fluent` «طَلَاقَةٌ ضِمْنَ ٢٠» ختامَ المرحلة
//             — **وأربعتُها تملكها `ops.js`** بحكم `curriculum.js` (نوعُ الشاشة واحدٌ
//             ونوعُ التمرين واحد، والمحطةُ تقرأ جبهتَها هناك)
//
// ————— العهدُ الأكبر: **ما فوق العشرة يُبنى ولا يُعَدّ فرادى** —————
//
// تعديلٌ معتمد في `METHOD.md §٢.٢` (مراجعة الجلسة ١): شرطُ «لا رمزَ قبل عدّ عدده»
// **موقوفٌ عند العشرة** (`COUNT_MAX`)، فبوابةُ «عدّاً» لأعداد ١١–٢٠ **هي بناؤها من
// العشرة والآحاد** لا لمسُها واحداً واحداً. وأثرُه في هذه الوحدة ثلاثةٌ لا واحد:
//
//   • **لا لمسَ ولا عدَّ فرادى**: لا طبقةَ لمسٍ على أربعةَ عشرَ عنصراً، ولا مشيَ
//     `countAloud` عليها — وإنما **حزمةٌ تُسمّى ثم آحادٌ تُعَدّ فوقها** (`countUp`):
//     «عشرةٌ تامّة… أحدَ عشرَ، اثنا عشر». وهو نصُّ ٧·٢ حرفاً: «خمسةَ عشرَ = عشرةٌ وخمسة».
//   • **والبناءُ فعلٌ بيده**: خانتان تُملآن — حزمةً وآحاداً — فيُرى العددُ مركَّباً قبل
//     أن يُقرأ مركَّباً (٧·٣ «قراءةُ الرمز المركّب» هي الوجهُ الثاني، بعده لا قبله).
//   • **والحزمةُ من المصيِّر لا من رقمٍ يُكتب هنا**: سَعةُ إطار العشرة هي مقدارُها،
//     وخاناتُه الفارغة هي «كم بقي» — كما في المرحلة ٥ سواءً بسواء.
//
// ————— و«اصنعْ عشرةً أولاً» خطوتان لا خطوة (٧·٥) —————
//
// «٨ + ٥ = ٨ + ٢ + ٣» (`METHOD.md §٣`): فلا يُسأل عن الحصيلة ابتداءً، وإنما **يُسأل
// أوّلاً كم يُكمِل العشرة** فتُفتَح خاناتُ الإطار الفارغة سؤالاً، ثم **يُسمّى تمامُها**،
// ثم يُسأل عن الحصيلة في الإطارين. وشقُّ المُضاف من المصيِّر (`split`) فيُرى بلونين:
// هذا ما يُكمِل العشرة، وهذا ما يفضل عنها — **بلا سطرِ تلوينٍ واحد** في الشاشة.
//
// ————— وخمسةُ عهودٍ أخرى —————
//
// ١) **الجوابُ من المرسوم**: العددُ المبنيّ مجموعُ ما رسمته الخانتان، و«ما يُكمِل
//    العشرة» **خاناتُ الإطار الفارغة** المقروءةُ من الـDOM، والحصيلةُ ما رسمه الإطاران.
// ٢) **التجاوزُ امتناعٌ في البنية**: بطاقةٌ تزيد على ما بقي **تُعطَّل** (نظيرُ الجسور)،
//    وما وُضع **يُرَدّ بلمسة**.
// ٣) **الخطأُ يُعَدّ أمامه بعدِّ درسِه**: في البناء والقراءة **حزمةٌ ثم آحادٌ فوقها**،
//    وفي خطوة العبور الأولى **تُعَدّ الخاناتُ الفارغة** — لا تلقينَ قبل المحاولة.
// ٤) **مدى المحطة ما تدرّسه أوّلاً ثم مراجعةٌ لِما دونه** (`bandOf` — نظيرُ `reachOf`
//    في العمليات و`wholesOf` في الجسور): «١٦–١٩» تبني في السبعةَ عشرَ أكثرَ مما تبني
//    في الاثنَي عشر، وإلّا صار اسمُ المحطة عنواناً لا حدّاً.
// ٥) **وخطُّ ٠–٢٠ تمرينُ المرحلة ٤ نفسُه بمداه الممتدّ** (٧·٤ تعلن `line|20|place`):
//    فيُستعار مولّدُه ومُصيِّرُه من `compare.js` ولا يُنسخان — نسختان تفترقان يوماً في
//    «يُعَدّ على الخطّ ولا يُلقَّن»، والمقيسُ واحدٌ فالتمرينُ واحد.

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { stations, SKIP_STEPS } from './curriculum.js';
import { rangeOf, kindOf } from './render.js';
import { h, icon, pick, shuffle, seeded, shake, pop, arNum, BOND_ACCENT } from './ui.js';
import {
  BEAT, NUMBER_NAME, SAY, say, praiseThen, span, nearOptions, seeder, skillOf,
  stationById, stationForSkill, figureBox, numeralCard, quantityCard, countAloud,
  countCells, clearCount, clearCells, clearLine, countMarks, slotLayer,
  usedOf, registerExercise, stationScreen,
} from './station.js';
import { lineRound, lineView } from './compare.js';

const OPTIONS = 3;         // ثلاثُ بطاقات: الجوابُ ومجاوراه (`METHOD.md §٣`)
const GUIDED = 2;          // «جرِّب معي» — جولتان بعونٍ مرئيّ، غيرُ مقيستين
const SOLO = 5;            // «وحدك» (`METHOD.md §٤`: ٤–٦)

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['teen', 'bridge', 'skip']);

/** حزمةُ العشرة — **من المصيِّر**: سَعةُ إطارها هي مقدارُها، ولا رقمَ يُكتب هنا. */
const TEN = rangeOf('ten-frame').max;

// ————— التعليماتُ المنطوقة —————
//
// **مُعلَنةٌ لا مستنتَجة** (`check_speech.mjs`): لكلٍّ ملفٌّ مولَّد أو مكانٌ في
// `tools/audio_queue.json`. ولا رقمَ في نصٍّ منطوق (ق١)، ولا معدودٌ مقرونٌ بعدد (ق٢).
//
// **ونصّان منها مصروفان أصلاً** فلا يُؤلَّف لهما ثانٍ بمعناهما (زهدٌ صوتيّ — حكمُ
// المدير، مراجعة الجلسة ٦ البند ٦): «كَمْ بَقِيَ لِتَمْتَلِئَ الْعَشَرَةْ؟» سؤالُ الجسور
// نفسُه (المرحلة ٥) وهو عينُ خطوة العبور الأولى، و«كَمْ صَارَتْ مَعًا؟» سؤالُ الجمع.

// **ونصٌّ واحدٌ جديد في هذه الجلسة** (الجلسة ك): سؤالُ العدّ القفزيّ — وسائرُ ما تنطقه
// المحطةُ الجديدة مصروفٌ أصلاً (أسماءُ الأعداد للقفزات، و«وَهَذَا مَوْضِعُهُ عَلَى
// الْخَطّ» لكشفها، ودعوةُ «شاهِدْ» من جدول الحلقة) — زهدٌ صوتيّ بحكم المدير.

const ASK = {
  build: 'اِبْنِ الْعَدَدْ',
  read: 'كَمْ هَذَا؟',
  ten: 'وَقَدِ اكْتَمَلَتِ الْعَشَرَةْ',
  rest: 'كَمْ بَقِيَ لِتَمْتَلِئَ الْعَشَرَةْ؟',
  total: 'كَمْ صَارَتْ مَعًا؟',
  jump: 'إِلَى أَيْنَ تَقْفِزْ؟',
};

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// **الإعلانُ أرضيةٌ لا سقف**: يقابله الحارسُ بجبهة **كلِّ** محطةٍ من محطات النوع،
// فالمُعلَنُ ما تشترك فيه كلُّها. ومن ذلك أنّ `teen` لا يعلن الإطارين ولا ما فوق
// العشرة: أوّلُ محطاته «حُزْمَةُ العَشَرَة» وجبهتُها العشرةُ وإطارٌ واحد — وما زاد
// **يُجرَد جولةً جولة** على جبهة محطته في `probeRounds`.

export const CONSUMES = {
  teen: {
    numbers: span(0, TEN), numerals: span(0, TEN), ops: [], signs: [],
    displays: ['ten-frame', 'numeral'],
  },
  bridge: {
    numbers: span(0, 20), numerals: span(0, 20), ops: ['add'], signs: ['+'],
    displays: ['ten-frame', 'two-frames', 'numeral'],
  },
  // **والقفزُ خطٌّ ورمزٌ ولا عمليةَ فيه**: العدُّ قفزاً عدٌّ لا جمع — لا علامةَ ولا
  // عمليةَ في جبهته، ومداه مدى الخطّ نفسِه (`METHOD.md §٣` — الجلسة ك).
  skip: {
    numbers: span(0, 20), numerals: span(0, 20), ops: [], signs: [],
    displays: ['numeral', 'line'],
  },
};

// ————— درسُ المحطة: مقروءٌ من المنهج لا مكتوبٌ هنا —————

/** أضيقُ نمطِ كمّيةٍ في الجبهة يسع هذا العدد — الإطارُ مرساةٌ لا اختيارُ ذوق. */
function frameFor(frontier, count) {
  return frontier.displays
    .filter((d) => {
      const range = rangeOf(d);
      return range && kindOf(d) === 'quantity' && count >= range.min && count <= range.max;
    })
    .sort((a, b) => rangeOf(a).max - rangeOf(b).max)[0] || null;
}

/**
 * **ما تبنيه المحطةُ أوّلاً**: الشريحةُ الجديدة بين ما بلغته سابقتُها وما تبلغه هي —
 * مقروءةً من ترتيب محطات النوع في المنهج لا مكتوبةً هنا. و**محطةُ الحزمة وحدَها
 * تُعرَف بأنّها لا تملك الإطارين** (٧·١ جبهتُها إطارٌ واحد): فمادّتُها العشرةُ نفسُها.
 */
function bandOf(station) {
  const f = station.frontier;
  if (!f.displays.includes('two-frames')) return { low: f.max, high: f.max };
  const family = stations().filter((s) => s.type === station.type);
  const at = family.findIndex((s) => s.id === station.id);
  const before = at > 0 ? family[at - 1].frontier.max : TEN;
  return { low: Math.max(TEN + 1, before + 1), high: f.max };
}

/** هدفُ الجولة: ثلثاها من شريحة المحطة، وثلثُها مراجعةٌ لِما دونها من التعشيرات. */
function targetOf(station, rnd) {
  const { low, high } = bandOf(station);
  const older = span(TEN + 1, low - 1);
  return older.length && rnd() >= 2 / 3 ? pick(older, rnd) : pick(span(low, high), rnd);
}

/**
 * **أوجهُ المحطة**: تُبنى ثم تُقرأ (٧·٣ «قراءةُ الرمز المركّب» — بعد البناء لا قبله)،
 * **وتُوضَع على الخطّ حيث أعلنت المحطةُ ذلك** (٧·٤ تكتب `line|20|place`) — فالأوجهُ
 * مقروءةٌ من مفاتيح المنهج لا مكتوبةٌ في شاشة.
 */
function facesOf(station) {
  if (station.type === 'bridge') return ['bridge'];
  if (station.type === 'skip') return ['skip'];
  return skillOf(station, 'line', 'place')
    ? ['build', 'read', 'place'] : ['build', 'read'];
}

// ————— العدُّ فوق الحزمة: **عشرةٌ تامّة ثم آحادٌ فوقها** —————

/**
 * قلبُ المرحلة كلِّها (`METHOD.md §٢.٢` المعتمد): ما دون العشرة **يُعَدّ فرادى**،
 * والعشرةُ **تُسمّى حزمةً تامّة**، وما فوقها **يُعَدّ عليها** — «عشرةٌ تامّة… أحدَ
 * عشرَ، اثنا عشر». فلا يمشي إصبعٌ على أربعةَ عشرَ عنصراً واحداً واحداً أبداً.
 */
async function countUp(fig, alive = () => true) {
  clearCount(fig);
  const bundle = fig.marks.slice(0, Math.min(TEN, fig.drawn));
  const ones = fig.marks.slice(bundle.length);
  if (bundle.length < TEN) return countAloud([fig], alive);
  for (const mark of bundle) mark.classList.add('is-counted');
  await say(ASK.ten);
  if (!alive()) return false;
  await new Promise((r) => setTimeout(r, BEAT));
  if (!ones.length) return alive();
  return countMarks(ones, (i) => TEN + i + 1, alive);
}

/**
 * **العدُّ قفزاً على الخطّ** (الجلسة ك): تُضاء مواقعُ القفزة وحدَها — كلٌّ باسم عددها —
 * من الصفر حتى الموضع المقصود. فيُسمَع «اثنان، أربعة، ستّة» ويُرى مكانُ كلٍّ على الخطّ
 * معاً، وهو معنى العدّ القفزيّ لا مجرّدُ حفظِ سلسلة.
 *
 * **والمواضعُ تُقرأ من الخطّ المرسوم** (`data-value`) لا من حسابٍ ثانٍ — فما يُضاء عند
 * الخطأ عينُ ما يُحكَم به (نظيرُ `countAlongLine` في `compare.js`).
 */
async function countJumps(fig, step, upTo, alive = () => true) {
  clearLine(fig);
  for (const tick of fig.ticks) {
    const value = Number(tick.dataset.value);
    if (value > upTo) break;
    if (value % step) continue;
    if (!alive()) return false;
    tick.classList.add('is-counted');
    // **العلامةُ تُضاء ثم يُنتظَر اسمُها** — والصفرُ موضعُ الانطلاق فلا يُسمّى
    if (value > 0) await say(NUMBER_NAME[value]);
    if (!alive()) return false;
    await new Promise((r) => setTimeout(r, BEAT));
  }
  return alive();
}

// ————— بناءُ الجولات (حتميٌّ ببذرة) —————

/**
 * **جولةُ بناء**: الرمزُ معلومٌ فوق، وخانتاه تحته — **حزمةٌ وآحاد**. وما دون العشرةِ
 * خانةٌ واحدة (٧·١: تُبنى العشرةُ نفسُها حزمةً)، وما فوقها خانتان.
 */
function buildRound(station, rnd, { aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'teen', 'build');
  const next = seeder(rnd);
  const target = targetOf(station, rnd);
  const ones = target - TEN;
  const shape = frameFor(f, target);

  // بطاقاتُ البناء: **الحزمةُ حاضرةٌ دائماً** ومعها آحادٌ مجاورة — والعشرون حزمتان
  const values = ones > 0
    ? shuffle([TEN, ones, ...nearOptions(ones, span(1, TEN - 1), OPTIONS - 1, rnd)], rnd)
    : shuffle([TEN, ...nearOptions(TEN, span(1, TEN), OPTIONS - 1, rnd)], rnd);
  const symbol = { display: 'numeral', count: target, seed: next() };
  const check = { display: shape, count: target, seed: next(), split: Math.min(TEN, target) };
  const options = values.map((v) => ({ display: 'ten-frame', count: v, seed: next() }));

  return {
    kind: 'build', concept: skill.concept, range: skill.range, mode: 'build', aided,
    ask: ASK.build,
    hint: ones > 0
      ? 'حُزْمَةُ العَشَرَةِ أَوَّلًا، ثُمَّ الآحَادُ فَوْقَهَا'
      : 'اِمْلَأِ الإِطَارَ حَتَّى تَصِيرَ حُزْمَةً تَامَّة',
    slots: ones > 0 ? 2 : 1,
    // الرمزُ هو المطلوب، والكمّيةُ تُكشَف **عند الخطأ وحدَه** فتُعَدّ حزمةً وآحاداً
    symbol, check, options,
    figures: [symbol, check, ...options],
    sig: `${station.id}|build|${target}|${symbol.seed}`,
  };
}

/**
 * **جولةُ قراءة** (٧·٣ «قراءةُ الرمز المركّب»): الإطاران مبنيّان — حزمةً وآحاداً
 * بلونين من المصيِّر — والمطلوبُ رمزُهما. وهي **بعد البناء** لا قبله.
 */
function readRound(station, rnd, { aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'teen', 'build');
  const next = seeder(rnd);
  const target = targetOf(station, rnd);
  const shape = frameFor(f, target);
  const pool = span(f.min, f.numeral);
  const values = shuffle([target, ...nearOptions(target, pool, OPTIONS - 1, rnd)], rnd);
  const fact = { display: shape, count: target, seed: next(), split: Math.min(TEN, target) };
  const options = values.map((v) => ({ display: 'numeral', count: v, seed: next() }));

  return {
    kind: 'build', concept: skill.concept, range: skill.range, mode: 'read', aided,
    ask: ASK.read,
    hint: 'حُزْمَةٌ وَآحَادٌ — فَمَا رَمْزُهَا؟',
    fact, options,
    figures: [fact, ...options],
    sig: `${station.id}|read|${target}|${fact.seed}`,
  };
}

/**
 * **جولةُ عبورٍ صاعد** (٧·٥): «٨ + ٥» — إطارٌ فيه ثمانيةٌ وخاناتُه الفارغة سؤالٌ أوّل،
 * والمُضافُ **منشقٌّ شقّين**: ما يُكمِل العشرة وما يفضل عنها. ثم الحصيلةُ في الإطارين.
 */
function bridgeRound(station, rnd, { aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'add', 'bridge');
  const next = seeder(rnd);
  /* **ومحطةُ التثبيت تعبر من أبعد** (٧·٦ «ثبِّتِ العبورَ صعوداً» — الجلسة ك): الأولى
     تبدأ **قريباً من العشرة** فالعبورُ قصير (ينقصها واحدٌ إلى أربعة)، والثانية تبدأ
     **من نصفها** فما ينقص العشرةَ أكثر (خمسةٌ وستّة) — فتُلقى الحقائقُ التي لم تُلقَ
     لا الحقائقُ نفسُها باسمٍ آخر. **وموضعُها من ترتيب المنهج** لا من معرّفٍ يُكتب هنا:
     أوّلُ محطةٍ من نوعها تُقدِّم، وما بعدها يُثبِّت. */
  const family = stations().filter((s) => s.type === station.type);
  const fix = family.findIndex((s) => s.id === station.id) > 0;
  const start = fix
    ? pick(span(Math.ceil(TEN / 2) - 1, Math.ceil(TEN / 2)), rnd)
    : pick(span(Math.ceil(TEN / 2) + 1, TEN - 1), rnd);
  const need = TEN - start;
  const add = pick(span(need + 1, Math.min(TEN - 1, f.max - start)), rnd);
  const total = start + add;
  const sign = f.signs.includes('+') ? '+' : null;

  // الإطارُ الأول: خاناتُه الفارغة هي السؤالُ الأول (تُقرأ من الرسم)
  const frame = { display: 'ten-frame', count: start, seed: next() };
  // المُضاف: شقٌّ يُكمِل العشرة وشقٌّ يفضل — **من المصيِّر لا من الشاشة**
  const give = { display: 'ten-frame', count: add, seed: next(), split: need };
  // الحصيلة: الإطاران، حزمةً وآحاداً
  const whole = { display: 'two-frames', count: total, seed: next(), split: TEN };
  const terms = sign
    ? [{ display: 'numeral', count: start, seed: next() },
      { display: 'numeral', count: add, seed: next() }]
    : [];
  const first = shuffle([need, ...nearOptions(need, span(1, TEN - 1), OPTIONS - 1, rnd)], rnd)
    .map((v) => ({ display: 'numeral', count: v, seed: next() }));
  const second = shuffle(
    [total, ...nearOptions(total, span(f.min, f.numeral), OPTIONS - 1, rnd)], rnd)
    .map((v) => ({ display: 'numeral', count: v, seed: next() }));

  return {
    kind: 'bridge', concept: skill.concept, range: skill.range, mode: 'bridge', aided,
    ops: ['add'], signs: sign ? [sign] : [],
    sign,
    ask: ASK.rest,
    hint: 'أَكْمِلِ الْعَشَرَةَ أَوَّلًا، ثُمَّ انْظُرْ مَا فَضَل',
    frame, give, whole, terms, first, second,
    figures: [frame, give, whole, ...terms, ...first, ...second],
    sig: `${station.id}|${start}+${add}|${frame.seed}`,
  };
}

/**
 * **جولةُ عدٍّ قفزيّ** (٧·٩ — تعديلُ «التكثيف المستهدف»): خطُّ الأعداد كلُّه مرسوم،
 * ومواقعُ القفزات الأولى **مُضاءة**، والسؤالُ أين تقع التالية.
 *
 * **والقفزةُ من المنهج** (`SKIP_STEPS`) لا من هذه الشاشة — وهي قفزاتُ «النمط العدديّ»
 * نفسُها بمصدرٍ واحد. **والجوابُ من المرسوم**: تقرأ الشاشةُ ما أُضيء على الخطّ فتعرف
 * القفزةَ وموضعَ التالية، وقيمةُ الخانة من `data-value` على زرّها.
 * **وخياراتُ الموضع مجاورة** كسائر أحواض الخيارات (`METHOD.md §٣`).
 */
function skipRound(station, rnd, { aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'skip', 'count');
  const next = seeder(rnd);
  const step = pick(SKIP_STEPS, rnd);
  // مواقعُ القفزة كلُّها من الصفر إلى الجبهة — والصفرُ أوّلُها (منه تبدأ القفزة)
  const stops = span(0, Math.floor(f.max / step)).map((i) => i * step);
  // كم موقعاً يُضاء قبل السؤال: اثنان على الأقلّ (فتُرى القفزةُ)، والسؤالُ ما بعدها
  const shown = pick(span(2, stops.length - 1), rnd);
  const target = stops[shown];
  const spots = shuffle(
    [target, ...nearOptions(target, span(f.min, f.max), OPTIONS - 1, rnd)], rnd);
  const rail = { display: 'line', count: f.max, seed: next() };

  return {
    kind: 'count', concept: skill.concept, range: skill.range, mode: 'skip', aided,
    ask: ASK.jump,
    hint: 'اُنْظُرْ إِلَى القَفَزَاتِ المُضَاءَة، ثُمَّ الْمَسْ مَوْضِعَ التَّالِيَة',
    step,
    lit: stops.slice(0, shown),
    rail,
    spots,
    figures: [rail],
    sig: `${station.id}|${step}|${target}|${rail.seed}`,
  };
}

/** جولةُ وجهٍ بعينه — والأوجهُ من `facesOf` (مقروءةً من مفاتيح المنهج). */
function roundFor(station, rnd, face, aided) {
  if (face === 'read') return readRound(station, rnd, { aided });
  if (face === 'place') return lineRound(station, rnd, { aided });
  if (face === 'bridge') return bridgeRound(station, rnd, { aided });
  if (face === 'skip') return skipRound(station, rnd, { aided });
  return buildRound(station, rnd, { aided });
}

/**
 * **نمذجةُ المحطة درسُها هي**: العددُ يُبنى أمامه — **حزمةٌ تُسمّى تامّةً ثم آحادٌ
 * تُعَدّ فوقها** — ثم يُكشَف رمزُه. ومحطةُ العبور تُنمذَج بعبورها: يُكمَل الإطارُ ثم
 * يُعَدّ ما فضل في الذي يليه.
 */
function modelOf(station, rnd) {
  const f = station.frontier;
  const next = seeder(rnd);

  /* **ونمذجةُ القفز قفزةٌ تُرى وتُسمَع**: يُعَدّ على الخطّ **بالقفزة الأولى** (أصغرِ
     قفزات المنهج) حتى منتصف الجبهة، ثم يُكشَف رمزُ الموضع الذي بلغه — فيلتقي المكانُ
     والعددُ كما يلتقيان في «أين يقع؟». وتُبقيها القفزةُ الأصغرُ درساً لا استعراضاً. */
  if (station.type === 'skip') {
    const step = SKIP_STEPS[0];
    const upTo = step * Math.max(2, Math.floor(f.max / (2 * step)));
    return {
      title: ASK.jump,
      hint: 'نَقْفِزُ عَلَى الخَطِّ قَفْزَةً قَفْزَة — وَنُسَمِّي كُلَّ مَوْضِعٍ نَبْلُغُهُ',
      figures: [{ display: 'line', count: f.max, seed: next() }],
      count: (figs, alive) => countJumps(figs[0], step, upTo, alive),
      reveal: {
        say: SAY.revealSpot,
        figures: [{ display: 'numeral', count: upTo, seed: next() }],
      },
    };
  }

  if (station.type === 'bridge') {
    const round = bridgeRound(station, rnd, { aided: true });
    return {
      title: ASK.total,
      hint: 'نُكْمِلُ الْعَشَرَةَ أَوَّلًا، ثُمَّ نَعُدُّ مَا فَضَلَ فَوْقَهَا',
      ops: round.ops,
      figures: [round.whole],
      count: (figs, alive) => countUp(figs[0], alive),
      reveal: {
        say: SAY.reveal,
        figures: [{ display: 'numeral', count: round.whole.count, seed: next() }],
      },
    };
  }

  const target = bandOf(station).high;
  return {
    title: ASK.build,
    hint: target > TEN
      ? 'عَشَرَةٌ تَامَّةٌ فِي إِطَارِهَا، ثُمَّ الآحَادُ فَوْقَهَا'
      : 'عَشَرَةٌ تَمْلَأُ الإِطَارَ فَتَصِيرُ حُزْمَةً وَاحِدَة',
    figures: [{
      display: frameFor(f, target), count: target, seed: next(), split: Math.min(TEN, target),
    }],
    count: (figs, alive) => countUp(figs[0], alive),
    reveal: {
      say: SAY.reveal,
      figures: [{ display: 'numeral', count: target, seed: next() }],
    },
  };
}

/** خطةُ المحطة: نمذجةٌ بكشف الرمز، ثم جولتان بعون، ثم «وحدك» — والأوجهُ بالدور. */
export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const faces = facesOf(station);

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
  build: (r, ok) => progress.recordAttempt(r.concept, r.range, 'build', ok),
  place: (r, ok) => progress.recordAttempt(r.concept, r.range, 'place', ok),
  bridge: (r, ok) => progress.recordAttempt(r.concept, r.range, 'bridge', ok),
  count: (r, ok) => progress.recordAttempt(r.concept, r.range, 'count', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

// ————— شاشةُ «اِبْنِ الْعَدَد»: حزمةٌ وآحادٌ في خانتين —————
//
// **ولِمَ لا تُستعار شاشةُ الجسور** وهي أشبهُ شيءٍ بها؟ لأنّ درسَهما مختلف في
// **معالجة الخطأ** وهي قلبُ الشاشة: الجسرُ يَعُدّ الكلَّ عنصراً عنصراً، وهذه
// **لا تَعُدّ فوق العشرة فرادى أبداً** (`METHOD.md §٢.٢` المعتمد) — تُسمّي الحزمةَ
// ثم تَعُدّ الآحاد فوقها. فشاشةٌ واحدة بفرعين تخفي هذا الفرق، والفرقُ هو الدرس.

function buildView(round, hooks) {
  const symbol = figureBox(round.symbol, 'q-bond-whole');
  const check = figureBox(round.check);
  const slots = Array.from({ length: round.slots }, () => h('button', {
    class: 'q-slot', 'aria-label': 'رُدَّ هَذَا الجُزْء', disabled: true,
  }));
  const placed = [];
  const cards = [];
  let locked = false;

  const board = h('div', { class: 'q-bond' }, symbol.box, h('div', { class: 'q-parts' }, ...slots));
  const checkBox = h('div', { class: 'q-check' }, check.box);
  const choices = h('div', { class: 'q-choices' });
  const tip = h('p', { class: 'note note--tip' }, icon('repeat'), ' اِنْقُرْ عَلَى الجُزْءِ لِتَرُدَّهُ');
  checkBox.hidden = true;
  tip.hidden = true;

  // **المطلوبُ من المرسوم**: ما رسمته بطاقةُ الرمز ناقصَ ما رسمته الخانات
  const need = () => symbol.drawn - placed.reduce((sum, p) => sum + p.drawn, 0);

  function paint() {
    board.dataset.need = String(need());
    board.dataset.slots = String(slots.length - placed.length);
    for (const [i, slot] of slots.entries()) {
      slot.replaceChildren(...(placed[i] ? [placed[i].box] : []));
      slot.classList.toggle('is-full', Boolean(placed[i]));
      slot.disabled = locked || !placed[i];
    }
    tip.hidden = placed.length === 0;
    // **التجاوزُ امتناعٌ في البنية**: ما يزيد على ما بقي لا يُلمَس أصلاً
    for (const cell of cards) {
      cell.btn.disabled = locked || placed.length >= slots.length || cell.drawn > need();
    }
  }

  for (const [i, slot] of slots.entries()) {
    slot.addEventListener('click', () => {
      if (locked || !placed[i]) return;
      placed.splice(i, 1);
      paint();
    });
  }

  async function judge() {
    const correct = need() === 0;
    hooks.attempt(round, correct);
    if (correct) {
      locked = true;
      for (const slot of slots) slot.classList.add('good');
      pop(board);
      await praiseThen(hooks);
      return;
    }
    shake(board);
    locked = true;
    paint();
    // **يُبنى أمامه ولا يُلقَّن**: تُكشَف الكمّيةُ فتُسمّى حزمتُها وتُعَدّ آحادُها
    await say(SAY.together);
    if (!hooks.alive()) return;
    checkBox.hidden = false;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    if (!(await countUp(check, hooks.alive))) return;
    checkBox.hidden = true;
    clearCount(check);
    placed.length = 0;
    locked = false;
    paint();
  }

  for (const spec of round.options) {
    let cell = null;
    const choose = async () => {
      if (locked || placed.length >= slots.length) return;
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

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board,
    checkBox,
    choices,
    tip);
}

// ————— شاشةُ «كَمْ هَذَا؟»: الإطاران مبنيّان والمطلوبُ رمزُهما —————

function readView(round, hooks) {
  const fact = figureBox(round.fact, 'q-fact-fig');
  const board = h('div', { class: 'q-solve q-solve--teen' },
    h('div', { class: 'q-fact' }, h('div', { class: 'q-fact-body' }, fact.box)));
  board.dataset.mode = 'read';
  board.dataset.answer = String(fact.drawn);      // **الجوابُ من المرسوم**
  const choices = h('div', { class: 'q-choices' });
  let locked = false;

  for (const spec of round.options) {
    let cell = null;
    const choose = async () => {
      if (locked) return;
      const correct = cell.drawn === fact.drawn;
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
      await say(SAY.together);
      if (!hooks.alive()) return;
      await new Promise((r) => setTimeout(r, BEAT / 2));
      if (!hooks.alive()) return;
      if (!(await countUp(fact, hooks.alive))) return;
      clearCount(fact);
      cell.btn.classList.remove('bad');
      locked = false;
    };
    cell = numeralCard(spec.count, spec.seed, { label: 'هَذَا الرَّمْز', onclick: choose });
    choices.append(cell.btn);
  }

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board,
    choices);
}

// ————— شاشةُ «اِصْنَعْ عَشَرَةً أَوَّلًا»: سؤالان في جولةٍ واحدة —————

function bridgeView(round, hooks) {
  const frame = figureBox(round.frame, 'q-fact-fig');
  const give = figureBox(round.give, 'q-fact-part');
  const whole = figureBox(round.whole, 'q-fact-fig');
  const head = h('h2', {}, round.ask);
  const hint = h('p', { class: 'hint' }, round.hint);
  const choices = h('div', { class: 'q-choices' });
  let locked = false;
  let second = false;

  const slot = h('span', { class: 'q-ask num' }, '؟');
  const line = [];
  for (const [i, spec] of round.terms.entries()) {
    if (i) line.push(h('span', { class: 'q-sign num', 'aria-hidden': 'true' }, round.sign));
    line.push(figureBox(spec, 'q-term').box);
  }
  const sentence = line.length ? h('div', { class: 'q-sentence' }, ...line, slot) : null;

  // **خاناتُ الإطار الفارغة هي السؤالُ الأول** — مقروءةً من الرسم لا من عددٍ مكتوب
  const gap = frame.cells.length - frame.drawn;
  const stage = h('div', { class: 'q-meet' }, frame.box, give.box);
  const board = h('div', { class: 'q-solve q-solve--bridge' },
    ...(sentence ? [sentence] : []),
    h('div', { class: 'q-fact' }, h('div', { class: 'q-fact-body' }, stage)));
  board.dataset.mode = 'bridge';
  board.dataset.answer = String(gap);

  /** الخطوةُ الثانية: الإطارُ اكتمل حزمةً، والحصيلةُ في الإطارين — فكم صارت معاً؟ */
  async function toTotal() {
    second = true;
    board.dataset.answer = String(whole.drawn);
    head.textContent = ASK.total;
    hint.textContent = 'حُزْمَةٌ تَامَّةٌ وَمَا فَضَلَ فَوْقَهَا';
    stage.replaceChildren(whole.box);
    for (const cell of [...choices.children]) cell.remove();
    for (const spec of round.second) choices.append(cardFor(spec));
    await say(ASK.total);
  }

  function cardFor(spec) {
    let cell = null;
    const choose = async () => {
      if (locked) return;
      const want = Number(board.dataset.answer);
      const correct = cell.drawn === want;
      hooks.attempt(round, correct);
      if (correct) {
        cell.btn.classList.add('good');
        pop(cell.btn);
        if (!second) {
          locked = true;
          await say(ASK.ten);
          if (!hooks.alive()) return;
          locked = false;
          await toTotal();
          return;
        }
        locked = true;
        slot.textContent = arNum(whole.drawn);   // تتمّ الجملةُ بما رُسِم في الإطارين
        slot.classList.add('is-full');
        await praiseThen(hooks);
        return;
      }
      cell.btn.classList.add('bad');
      shake(cell.btn);
      locked = true;
      await say(SAY.together);
      if (!hooks.alive()) return;
      await new Promise((r) => setTimeout(r, BEAT / 2));
      if (!hooks.alive()) return;
      // **الخطأُ يُعَدّ أمامه بعدِّ درسِه**: الخاناتُ الفارغة أوّلاً، ثم الحزمةُ وآحادُها
      const shown = second
        ? await countUp(whole, hooks.alive)
        : await countCells(frame, hooks.alive);
      if (!shown) return;
      if (second) clearCount(whole);
      else clearCells(frame);
      cell.btn.classList.remove('bad');
      locked = false;
    };
    cell = numeralCard(spec.count, spec.seed, { label: 'هَذَا الرَّمْز', onclick: choose });
    return cell.btn;
  }

  for (const spec of round.first) choices.append(cardFor(spec));
  say(round.ask);

  return h('div', {}, head, hint, board, choices);
}

// ————— شاشةُ «اِعْدُدْ قَفْزًا»: الخطُّ مرسومٌ وقفزاتُه مُضاءة —————

function skipView(round, hooks) {
  const rail = figureBox(round.rail, 'q-rail');
  const board = h('div', { class: 'q-solve q-solve--skip' },
    h('div', { class: 'q-linebox' }, rail.box));
  board.dataset.mode = 'skip';
  let locked = false;

  /* **ما أُضيء يُقرأ من الخطّ نفسِه**: تُعلَّم مواقعُ القفزات المعروضة، ثم **تُقرأ من
     الـDOM** فتُشتقّ منها القفزةُ وموضعُ التالية — فالجوابُ ما رُسِم لا ما نُوي. ولو
     أضاء الرسمُ غيرَ ما طُلب لَتبدّل الجوابُ معه ولم تكذب الشاشةُ على الطفل. */
  const wanted = new Set(round.lit);
  for (const tick of rail.ticks) {
    if (wanted.has(Number(tick.dataset.value))) tick.classList.add('is-open');
  }
  const shown = rail.ticks.filter((t) => t.classList.contains('is-open'))
    .map((t) => Number(t.dataset.value));
  const step = shown.length > 1 ? shown[1] - shown[0] : round.step;
  const want = shown[shown.length - 1] + step;
  board.dataset.answer = String(want);
  board.dataset.step = String(step);

  slotLayer(rail, round.spots, async (value, btn) => {
    if (locked) return;
    const correct = value === want;
    hooks.attempt(round, correct);
    if (correct) {
      locked = true;
      btn.classList.add('good');
      pop(btn);
      // **ويتمّ الإيقاعُ أمامه**: يُضاء الموضعُ الذي أصاب فتصير القفزاتُ متّصلة
      const hit = rail.ticks.find((t) => Number(t.dataset.value) === value);
      hit?.classList.add('is-open');
      await praiseThen(hooks);
      return;
    }
    btn.classList.add('bad');
    shake(btn);
    locked = true;
    // **الخطأُ يُعَدّ أمامه بعدِّ درسِه**: يُقفَز على الخطّ من الصفر حتى الموضع الصحيح
    await say(SAY.together);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    if (!(await countJumps(rail, step, want, hooks.alive))) return;
    clearLine(rail);            // (وأثرُ «ما قُفِز إليه» باقٍ: `is-open` لا يُمحى)
    btn.classList.remove('bad');
    locked = false;
  });

  /* **والعونُ المرئيّ في «جرِّب معي»**: يُقفَز على الخطّ مرّةً واحدة **بعد تمام
     السؤال** — نمذجةٌ بعون، وهي غيرُ مقيسةٍ في ليتنر (نظيرُ «أين يقع؟»). */
  (async () => {
    await say(round.ask);
    if (!round.aided || !hooks.alive()) return;
    if (!(await countJumps(rail, step, shown[shown.length - 1], hooks.alive))) return;
    if (hooks.alive()) clearLine(rail);
  })();

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board,
    h('p', { class: 'hint' }, 'اِلْمَسِ المَوْضِعَ الَّذِي تَظُنُّه'),
  );
}

const VIEWS = { build: buildView, read: readView, bridge: bridgeView, skip: skipView };
const viewOf = (round, hooks) => (round.kind === 'place'
  ? lineView(round, hooks)                       // خطُّ ٠–٢٠: تمرينُ المرحلة ٤ بمداه
  : VIEWS[round.mode](round, hooks));

// ————— التسجيل في الموجِّه وفي المراجعة —————

function screen(type) {
  return (part) => {
    const station = stationById(`${type}:${part}`);
    if (!station) return null;
    return stationScreen({
      nodeId: station.id,
      title: station.title,
      accent: BOND_ACCENT,
      make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x85ebca6b),
      view: viewOf,
      score,
      save: (stars) => progress.setStars(station.id, stars),
    });
  };
}

/* **وكلُّ سابقةٍ تُسجَّل باسمها صريحاً** لا بحلقةٍ على `TYPES`: حارسُ «لا عقدةَ بلا
   كاتبِ نجمة» (`test_nodes.mjs`) يجرد السوابقَ المسجَّلة **من نصّ الشيفرة**. */
registerScreen('teen', screen('teen'));
registerScreen('bridge', screen('bridge'));
registerScreen('skip', screen('skip'));

/**
 * جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات.
 * **وتُرَدّ `null` لِما ليس من هذا النوع**: نوعا `build` و`place` قد يشترك فيهما
 * مالكان (`line|10|place` في `compare.js` و`line|20|place` هنا)، فيُسأل كلٌّ بدوره.
 */
const single = (build) => (skill, rnd) => {
  const station = stationForSkill(skill);
  return station && TYPES.has(station.type) ? build(station, rnd) : null;
};

registerExercise('build', {
  build: single((s, r) => (r() < 0.5 ? buildRound(s, r) : readRound(s, r))),
  view: viewOf,
});
registerExercise('place', { build: single((s, r) => lineRound(s, r)), view: viewOf });
registerExercise('bridge', { build: single((s, r) => bridgeRound(s, r)), view: viewOf });
registerExercise('count', { build: single((s, r) => skipRound(s, r)), view: viewOf });
