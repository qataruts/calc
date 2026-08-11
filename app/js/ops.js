// **المرحلة ٦ — اِجْمَعْ وَاطْرَحْ ضِمْنَ ١٠** (`METHOD.md §٣`): ثماني محطاتٍ بخمس شاشات.
//
//   `add`     «آلَةُ الجَمْع» (**بلا رمز**) ثم «رَمْزُ + وَالجَمْعُ ضِمْنَ ٥» ثم «اِجْمَعْ ضِمْنَ ١٠»
//   `sub`     «رَمْزُ − وَالطَّرْحُ ضِمْنَ ٥» ثم «اِطْرَحْ ضِمْنَ ١٠»
//   `diff`    «كَمِ الفَرْقُ بَيْنَهُمَا؟» — المقارنةُ معنىً ثانٍ للطرح
//   `zero`    «الصِّفْرُ فِي العَمَلِيَّات» — ن+٠ وَن−٠ وَن−ن
//   `fluent`  «طَلَاقَةٌ ضِمْنَ ١٠» — حقائقُ مختلطة
//
// وخمستُها في ملفٍّ واحد بقاعدة «**كلُّ نوع شاشةٍ يُنجَز في جلسةٍ واحدة**» (مراجعة
// الجلسة ١): بابُ الشيفرة في `test_measure.mjs` يطالب النوعَ بأنواع تمارينه كلِّها متى
// وُجد ملفُّه، وهي هنا نوعٌ واحد (`solve`) ودرسٌ واحد في المنهج (المرحلة ٦).
//
// ————— العهدُ الأكبر: **الجمعُ تركيبُ معلومٍ لا طقسٌ رمزيّ** —————
//
// نصُّ `METHOD.md §٢.٥`: «جسور الأعداد تُبنى بصرياً **قبل** أي رمز عملية — فالجمع
// تركيبُ معلوم لا طقسٌ رمزي»، ونصُّ §٣ في هذه المرحلة: «كل حقيقة عملية تُعرَض
// **بالكمية والرمز معاً** أولاً، ثم بالرمز وحده والكمية عوناً عند النقر». وهما شيءٌ
// واحد يقع في هذه الوحدة على ثلاث درجات:
//
//   • **٦·١ بلا علامةٍ البتّة**: كميتان تلتقيان فتُعَدّ الحصيلة — والعمليةُ **فعلٌ يُرى**
//     قبل أن يكون سطراً يُقرأ. والعلامةُ في ٦·٢ **تسميةٌ لِما فُعِل** كما كان الرمزُ في
//     المرحلة ٣ تسميةً لكمٍّ عُرِف.
//   • **أوّلُ لقاءٍ بالحقيقة**: «شاهِدْ» و«جَرِّبْ مَعِي» — الجملةُ الرمزية **وكمّيتُها
//     معروضتان معاً** في لحظةٍ واحدة (يفحصه حارسُ المتصفّح).
//   • **«وحدك»**: الرمزُ وحدَه، **والكمّيةُ عوناً عند النقر** — عونٌ لا يُحتسَب ولا يُحَدّ
//     (نظيرُ «أَعِدِ العَرْض» في الخطف).
//
// ————— ورمزُ العملية **من جبهة المحطة حصراً** —————
//
// لا يكتب هذا الملفُّ علامةَ جمعٍ ولا طرحٍ بيده: `signFor` تقرأ `SIGNS` من المنهج
// وتردّها **إن أذنت بها جبهةُ المحطة** (`signs`) — فمحطةُ ٦·١ جبهتُها `signs: []`
// فتُرَدّ `null` ولا جملةَ تُرسَم أصلاً. ويجرده `check_range.py` جولةً جولة (`usedOf`
// تُعلن `ops` و`signs`) **مُجرَّباً سالباً**، ويجرد حارسُ المتصفّح النصَّ المعروض نفسَه.
//
// ————— وأربعةُ عهودٍ أخرى تحكم هذه الوحدة —————
//
// ١) **الجوابُ من المرسوم**: مجموعُ الجمع هو ما رسمه المصيِّر في الكمّية المجموعة
//    (`drawn`)، وباقي الطرح هو **ما لم يُشطَب منها** (`split` مقروءاً من الـDOM)، والفرقُ
//    هو فرقُ ما رُسِم في الصفّين — فلا عددٌ تدّعيه شاشة.
// ٢) **الخطأُ يُعَدّ أمامه بعدِّ درسِه هو** (`METHOD.md §٣` — المرحلة ٦): تصاعدياً **من
//    الأكبر** في الجمع (٦·٤: «سبعة… ثمانية، تسعة»)، وتنازلياً مع كل مغادرٍ في الطرح
//    (٦·٥)، وعدّاً للفائض في الفرق (٦·٦). وثلاثتُها `countMarks` واحدة في `station.js`.
// ٣) **الكمّيةُ تنشقّ شقّين** كما في المرحلة ٥ (`split` في المصيِّر): في الجمع شقّاها
//    الجمعان، وفي الطرح شقّاها **الباقي والمغادر** — فيُرى الجسرُ نفسُه وقد صار عملية.
// ٤) **لا مؤقّتَ ولا عقاب**: الخيارُ الخاطئ لا ينقل، ولا حدَّ لكشف الكمّية.

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { SIGNS } from './curriculum.js';
import { rangeOf, OBJECTS } from './render.js';
import { h, icon, pick, shuffle, seeded, shake, pop, arNum, BOND_ACCENT } from './ui.js';
import {
  BEAT, NUMBER_NAME, SAY, say, praiseThen, span, nearOptions, seeder, skillOf,
  stationById, stationForSkill, figureBox, numeralCard, countAloud, countMarks,
  clearCount, usedOf, registerExercise, stationScreen,
} from './station.js';

const OPTIONS = 3;         // ثلاثُ بطاقات: الجوابُ ومجاوراه (`METHOD.md §٣`)
const GUIDED = 2;          // «جرِّب معي» — جولتان بعونٍ مرئيّ، غيرُ مقيستين
const SOLO = 5;            // «وحدك» (`METHOD.md §٤`: ٤–٦)

/** أنواعُ الشاشات التي تملكها هذه الوحدة (يقابلها `STATIONS` في `test_measure.mjs`). */
const TYPES = new Set(['add', 'sub', 'diff', 'zero', 'fluent']);

/** أنواعٌ اسمُها وجهُها: محطتُها تدرّس وجهاً واحداً لا تخلطه بغيره. */
const SINGLE = new Set(['add', 'sub', 'diff']);

/**
 * **أوجهُ الصفر الثلاثة** — بنصّ `METHOD.md §٣` (٦·٧): «ن+٠، ن−٠، ن−ن». وهي ثلاثُ
 * حقائقَ لا واحدة: الصفرُ يُضاف فلا يزيد، ويُؤخذ فلا ينقص، **والكلُّ يُؤخذ فيبقى صفر**.
 */
const ZERO_FACES = ['plus-zero', 'minus-zero', 'minus-self'];

/** وجهُ الجولة ← وضعُها المرسوم: جمعٌ أو طرحٌ أو فرق. */
const MODE_OF = {
  add: 'add', sub: 'sub', diff: 'diff',
  'plus-zero': 'add', 'minus-zero': 'sub', 'minus-self': 'sub',
};

// ————— التعليماتُ المنطوقة —————
//
// **مُعلَنةٌ لا مستنتَجة** (`check_speech.mjs`): لكلٍّ ملفٌّ مولَّد أو مكانٌ في
// `tools/audio_queue.json`. ولا رقمَ في نصٍّ منطوق (ق١)، ولا معدودٌ مقرونٌ بعدد (ق٢).
//
// **و«كَمْ صَارَتْ كُلُّهَا؟» نصٌّ مصروفٌ أصلاً** (سؤالُ العدديّة في المرحلة ٢): وهو عينُ
// سؤال «آلة الجمع» — كميتان التقتا فكم صارت كلُّها؟ — فلا يُؤلَّف له نصٌّ ثانٍ بمعناه.

const ASK = {
  join: 'كَمْ صَارَتْ كُلُّهَا؟',
  add: 'كَمْ صَارَتْ مَعًا؟',
  sub: 'كَمْ بَقِيَ؟',
  diff: 'كَمِ الْفَرْقُ بَيْنَهُمَا؟',
};

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// **الإعلانُ أرضيةٌ لا سقف**: الحارسُ يقابله بجبهة **كلِّ** محطةٍ من محطات النوع،
// فالمُعلَن ما تشترك فيه كلُّها وما زاد يُجرَد **جولةً جولة** في `probeRounds`. ومن
// ذلك أثران بيّنان: `add` يعلن `signs: []` لأنّ من محطاته **آلةَ الجمع بلا رمز**،
// و`sub` لا يعلن نمطَ كمّيةٍ واحداً لأنّ من محطاته **اطرح ضمن ٢٠** (المرحلة ٧)
// وأنماطُها الإطاران لا عناصرُ عالم الطفل.

export const CONSUMES = {
  add: {
    numbers: span(0, 5), numerals: span(0, 5), ops: ['add'], signs: [],
    displays: ['objects', 'numeral'],
  },
  sub: {
    numbers: span(0, 5), numerals: span(0, 5), ops: ['sub'], signs: ['−'],
    displays: ['numeral'],
  },
  diff: {
    numbers: span(0, 10), numerals: span(0, 10), ops: ['sub'], signs: ['−'],
    displays: ['objects', 'ten-frame', 'numeral'],
  },
  zero: {
    numbers: span(0, 10), numerals: span(0, 10), ops: ['add', 'sub'], signs: ['+', '−'],
    displays: ['objects', 'ten-frame', 'numeral'],
  },
  fluent: {
    numbers: span(0, 10), numerals: span(0, 10), ops: ['add', 'sub'], signs: ['+', '−'],
    displays: ['objects', 'ten-frame', 'numeral'],
  },
};

// ————— درسُ المحطة: مقروءٌ من المنهج لا مكتوبٌ هنا —————

/**
 * **آلةُ الجمع** (٦·١): المحطةُ التي **تفعل العمليةَ ولا تسمّيها** — عمليةٌ في جبهتها
 * وصفرُ علامة. وهي القراءةُ الوحيدة التي تفرّق ٦·١ عن ٦·٢، ومصدرُها الجبهةُ نفسُها
 * لا معرّفُ محطةٍ يُكتب في شاشة.
 */
const isMachine = (station) => station.frontier.ops.length > 0
  && station.frontier.signs.length === 0;

/** **رمزُ العملية من الجبهة حصراً** — وإلّا فلا علامةَ تُرسَم ولا تُعلَن. */
const signFor = (frontier, op) => (frontier.signs.includes(SIGNS[op]) ? SIGNS[op] : null);

/**
 * **أوجهُ جولات المحطة بالدور**: نوعُ الشاشة إن كان وجهاً بعينه، وأوجهُ الصفر الثلاثة
 * في محطته، وإلّا **فعملياتُ جبهتها كلُّها** — وهي «الحقائقُ المختلطة» في محطة الطلاقة
 * (٦·٨) مقروءةً من `ops` لا مكتوبةً هنا.
 */
function facesOf(station) {
  if (station.type === 'zero') return ZERO_FACES;
  if (SINGLE.has(station.type)) return [station.type];
  return station.frontier.ops;
}

// ————— اختيارُ الأنماط من جبهة المحطة —————

/** أنماطُ الكمّيات في الجبهة التي تستطيع رسمَ هذه الأعداد (بلا رمزٍ ولا خطّ). */
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
 * **الإطارُ مرساة** (`METHOD.md §٣` — ٣·٥: «يبقى عموداً فقرياً»): أضيقُ إطارٍ يسع
 * الأعداد كلَّها — فيُرى «٦ = ٥ + ١» في صفّه الأعلى، ويُرى الطرحُ **خاناتٍ تفرغ**.
 */
function frameFor(frontier, counts, rnd) {
  const usable = usableFor(frontier, counts);
  const frames = usable.filter((d) => d.endsWith('-frame'))
    .sort((a, b) => rangeOf(a).max - rangeOf(b).max);
  return frames[0] || pick(usable, rnd);
}

/**
 * **والمجموعتان تلتقيان خارج الإطار** (٦·١): إطارٌ لكلٍّ ثم إطارٌ للحصيلة يقرؤه الطفلُ
 * ثلاثةَ أشياء لا شيئاً واحداً صار من شيئين — فيُختار نمطٌ غيرُ مؤطَّر ما دام في الجبهة.
 */
function plainFor(frontier, counts, rnd) {
  const usable = usableFor(frontier, counts);
  const plain = usable.filter((d) => !d.endsWith('-frame'));
  return pick(plain.length ? plain : usable, rnd);
}

/**
 * **ورمزُ عالم الطفل واحدٌ في الجولة كلِّها** (عهدُ المرحلة ٥): جمعُ سمكتين وثلاثِ
 * زهراتٍ ضمُّ صنفين، والمقصودُ ضمُّ عددين.
 */
const glyphOf = (rnd) => pick(OBJECTS, rnd).glyph;

/**
 * **مدى الحقيقة: ما تدرّسه المحطةُ أولاً، ثم مراجعةٌ لِما دونه** — نظيرُ `wholesOf` في
 * الجسور و`targetsOf` في الرموز. الجبهةُ **سقفٌ ودرسُها أعلاه**: محطةُ «اجمعْ ضمن ١٠»
 * تجمع في العشرة والتسعة والثمانية أكثر مما تجمع في الاثنين، وإلّا صار «ضمن ١٠»
 * اسماً لا حدّاً وخرج الطفلُ من المحطة ولم يبلغ ما سُمّيت به.
 *
 * @param {number} low أدنى ما يصلح لهذا الوجه (كلٌّ لا ينشقّ دون اثنين)
 */
function reachOf(frontier, rnd, low = 2) {
  const top = Math.max(low, Math.ceil((frontier.max * 2) / 3));
  const pool = rnd() < 2 / 3 ? span(top, frontier.max) : span(low, Math.max(low, top - 1));
  return pick(pool, rnd);
}

/** بطاقاتُ الجواب: الجوابُ ومجاوراه من مدى رموز المحطة (`METHOD.md §٣`). */
function optionsFor(frontier, answer, rnd, next) {
  const pool = span(frontier.min, frontier.numeral);
  return shuffle([answer, ...nearOptions(answer, pool, OPTIONS - 1, rnd)], rnd)
    .map((v) => ({ display: 'numeral', count: v, seed: next() }));
}

// ————— بناءُ الجولات (حتميٌّ ببذرة) —————

/**
 * **جولةُ جمع**: كمّيةٌ واحدة **منشقّةٌ شقّين** هي الحصيلةُ وجمعاها معاً.
 *
 * **والأكبرُ أوّلاً** (`METHOD.md §٣` — ٦·٤: «العدّ التصاعدي **من الأكبر**»): يُكتب في
 * الجملة أولاً ويُرسَم في الشقّ الأول، فيتّفق ترتيبُ القراءة وترتيبُ الرسم وموضعُ بدء
 * العدّ — ولو افترقت لَرأى الطفلُ شقّاً لا يطابق ما يُقرأ ولا ما يُعَدّ.
 *
 * @param {boolean} zero وجهُ «ن + ٠» في محطة الصفر (٦·٧)
 */
function sumRound(station, rnd, { aided = false, zero = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'add', 'solve');
  const next = seeder(rnd);
  const machine = isMachine(station);
  const glyph = glyphOf(rnd);

  const total = reachOf(f, rnd, zero ? 1 : 2);
  const small = zero ? 0 : 1 + Math.floor(rnd() * Math.floor(total / 2));
  const big = total - small;

  const shape = machine
    ? plainFor(f, [total, big, small], rnd)
    : frameFor(f, [total], rnd);
  const fact = { display: shape, count: total, seed: next(), glyph, split: big };
  /* **الآلةُ وحدَها تعرض المجموعين كمّيتين**: هما ما يلتقي، وسواها يعرضهما رمزين.
     **ولونُ كلِّ مجموعةٍ لونُ شقّها في الحصيلة** — ويقع ذلك في المصيِّر لا في الشاشة:
     الأولى شقٌّ أوّلُ كلُّها (`split` = عددُها)، والثانية شقٌّ ثانٍ كلُّها (`split: 0`)
     — فيُعرَف بالنظر أيُّ عناصر الحصيلة جاءت من أيّ مجموعة، بلا سطرِ تلوينٍ واحد. */
  const parts = machine
    ? [{ display: shape, count: big, seed: next(), glyph, split: big },
      { display: shape, count: small, seed: next(), glyph, split: 0 }]
    : [];
  const sign = signFor(f, 'add');
  const terms = sign
    ? [{ display: 'numeral', count: big, seed: next() },
      { display: 'numeral', count: small, seed: next() }]
    : [];
  const options = optionsFor(f, total, rnd, next);

  return {
    kind: 'solve', concept: skill.concept, range: skill.range,
    mode: 'add', machine, sign, aided,
    ops: ['add'], signs: sign ? [sign] : [],
    ask: machine ? ASK.join : ASK.add,
    hint: machine
      ? 'تَلْتَقِيَانِ فَتَصِيرَانِ وَاحِدَة — ثُمَّ عُدَّهَا'
      : 'اُنْظُرْ إِلَى الكَمِّيَّةِ تَحْتَ الجُمْلَة',
    fact, parts, terms, options,
    figures: [fact, ...parts, ...terms, ...options],
    sig: `${station.id}|${big}+${small}|${fact.seed}`,
  };
}

/**
 * **جولةُ طرح**: كمّيةٌ يُشطَب منها بعضُها — **الإزالةُ مرئية** (`METHOD.md §٣` ٦·٣).
 * وشقّاها **الباقي والمغادر**، فالمغادرُ آخرُ ما مُلئ في الإطار (يفرغ من حيث امتلأ).
 *
 * @param {'some'|'none'|'all'} take وجهُ المحطة: طرحٌ عاديّ · ن−٠ · ن−ن (٦·٧)
 */
function takeRound(station, rnd, { aided = false, take = 'some' } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'sub', 'solve');
  const next = seeder(rnd);
  const glyph = glyphOf(rnd);

  const whole = reachOf(f, rnd, 2);
  const gone = take === 'none' ? 0
    : take === 'all' ? whole
      : 1 + Math.floor(rnd() * (whole - 1));
  const rest = whole - gone;

  const shape = frameFor(f, [whole], rnd);
  const fact = { display: shape, count: whole, seed: next(), glyph, split: rest };
  const sign = signFor(f, 'sub');
  const terms = sign
    ? [{ display: 'numeral', count: whole, seed: next() },
      { display: 'numeral', count: gone, seed: next() }]
    : [];
  const options = optionsFor(f, rest, rnd, next);

  return {
    kind: 'solve', concept: skill.concept, range: skill.range,
    mode: 'sub', sign, aided,
    ops: ['sub'], signs: sign ? [sign] : [],
    ask: ASK.sub,
    // (وتصلح للصفر كما تصلح لغيره: ما شُطِب غادر، وإن لم يُشطَب شيءٌ بقي الكلُّ)
    hint: 'مَا شُطِبَ غَادَر — وَالبَاقِي هُوَ الجَوَاب',
    fact, parts: [], terms, options,
    figures: [fact, ...terms, ...options],
    sig: `${station.id}|${whole}-${gone}|${fact.seed}`,
  };
}

/**
 * **جولةُ فرق** (٦·٦): كمّيتان في صفّين متحاذيين، **والفائضُ في الأعلى هو الجواب** —
 * «المقارنةُ معنىً ثانٍ للطرح» (`METHOD.md §٣`). والتحاذي صفّين هو عينُ ما تُصحَّح به
 * المقارنةُ في المرحلة ٤ (تعديلُ `METHOD.md §٤` المعتمد)، فيُرى الفرقُ خانةً بخانة.
 */
function diffRound(station, rnd, { aided = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'diff', 'solve');
  const next = seeder(rnd);
  const glyph = glyphOf(rnd);

  const hi = reachOf(f, rnd, 2);
  // **والصفُّ الأدنى كمّيةٌ لا فراغ**: «كم الفرقُ بينهما؟» مقارنةُ كمّيتين، وصفٌّ خالٍ
  // يجعلها عدّاً للصفّ الأعلى وحدَه — فيسقط المعنى الثاني للطرح الذي وُضعت له المحطة.
  const lo = pick(span(1, hi - 1), rnd);
  const shape = frameFor(f, [hi, lo], rnd);
  const rows = [
    { display: shape, count: hi, seed: next(), glyph, split: lo },
    { display: shape, count: lo, seed: next(), glyph },
  ];
  const sign = signFor(f, 'sub');
  const terms = sign
    ? [{ display: 'numeral', count: hi, seed: next() },
      { display: 'numeral', count: lo, seed: next() }]
    : [];
  const options = optionsFor(f, hi - lo, rnd, next);

  return {
    kind: 'solve', concept: skill.concept, range: skill.range,
    mode: 'diff', sign, aided,
    ops: ['sub'], signs: sign ? [sign] : [],
    ask: ASK.diff,
    hint: 'صَفٌّ تَحْتَ صَفّ — كَمْ يَفْضُلُ الأَعْلَى؟',
    rows, parts: [], terms, options,
    figures: [...rows, ...terms, ...options],
    sig: `${station.id}|${hi}~${lo}|${rows[0].seed}`,
  };
}

/** جولةُ وجهٍ بعينه — الوجهُ من `facesOf`، والوضعُ من `MODE_OF`. */
function roundFor(station, rnd, face, aided) {
  const mode = MODE_OF[face];
  if (mode === 'diff') return diffRound(station, rnd, { aided });
  if (mode === 'add') return sumRound(station, rnd, { aided, zero: face === 'plus-zero' });
  return takeRound(station, rnd, {
    aided,
    take: face === 'minus-zero' ? 'none' : face === 'minus-self' ? 'all' : 'some',
  });
}

/**
 * **نمذجةُ المحطة درسُها هي** (`METHOD.md §٤`): كمّيةُ الحقيقة تُعَدّ **بعدّ درسِها** —
 * تصاعديّاً في الجمع، وتنازليّاً مع كل مغادرٍ في الطرح، وعدّاً للفائض في الفرق — ثم
 * **يُكشَف رمزُ ما عُدّ** (`SAY.reveal`)، فتلتقي الكمّيةُ والرمزُ في أول لقاء بالحقيقة.
 */
function modelOf(station, rnd) {
  const face = facesOf(station)[0];
  const round = roundFor(station, rnd, face, true);
  const next = seeder(rnd);

  if (round.mode === 'diff') {
    const [big, small] = round.rows;
    return {
      title: ASK.diff,
      hint: 'نَعُدُّ مَا يَفْضُلُ فِي الصَّفِّ الأَعْلَى',
      ops: round.ops,
      figures: [big, small],
      count: (figs, alive) => {
        for (const fig of figs) clearCount(fig);      // «أَعِدْ» تبدأ من نظيف
        return countMarks(
          figs[0].marks.filter((m) => m.dataset.part === 'b'), (i) => i + 1, alive);
      },
      reveal: {
        say: SAY.reveal,
        figures: [{ display: 'numeral', count: big.count - small.count, seed: next() }],
      },
    };
  }

  if (round.mode === 'sub') {
    const rest = round.fact.split;
    return {
      title: ASK.sub,
      hint: 'نَعُدُّ نَازِلِينَ مَعَ كُلِّ وَاحِدٍ يُغَادِر',
      ops: round.ops,
      figures: [round.fact],
      // **يُسمّى الكلُّ ثم يُعَدّ نزولاً**: «خمسة… أربعة، ثلاثة» — والمغادرُ يُشطَب وقتَ
      // اسمِه لا قبله، فيقع العددُ على فعلِه (`METHOD.md §٣` — ٦·٥).
      count: async (figs, alive) => {
        const [fig] = figs;
        for (const mark of fig.marks) mark.classList.remove('is-counted', 'is-gone');
        const gone = fig.marks.filter((m) => m.dataset.part === 'b');
        if (!gone.length) return countAloud(figs, alive);
        await say(NUMBER_NAME[fig.drawn]);
        if (!alive()) return false;
        await new Promise((r) => setTimeout(r, BEAT));
        return countMarks(gone, (i) => fig.drawn - i - 1, alive, 'is-gone');
      },
      reveal: {
        say: SAY.reveal,
        figures: [{ display: 'numeral', count: rest, seed: next() }],
      },
    };
  }

  return {
    title: round.ask,
    // (والنمذجةُ تعرض الحصيلةَ بمجموعَيها لونين، فيُقال ما يُرى لا ما لا يُرى)
    hint: round.machine
      ? 'مَجْمُوعَتَانِ صَارَتَا وَاحِدَة — فَلْنَعُدَّهَا'
      : 'نَعُدُّهَا كُلَّهَا، ثُمَّ نَرَى رَمْزَهَا',
    ops: round.ops,
    figures: [round.fact],
    reveal: {
      say: SAY.reveal,
      figures: [{ display: 'numeral', count: round.fact.count, seed: next() }],
    },
  };
}

/** خطةُ المحطة: نمذجةٌ بكشف الرمز، ثم جولتان بعون، ثم «وحدك» — والأوجهُ بالدور. */
export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const faces = facesOf(station);

  /* **والأوجهُ تدور على الجولات كلِّها**: محطةُ الصفر ثلاثةُ أوجه ومحطةُ الطلاقة
     وجهان، فلو بُنيت بالقرعة لَجاز أن يُمتحَن الطفلُ في وجهٍ ويُترَك وجهان. */
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
  solve: (r, ok) => progress.recordAttempt(r.concept, r.range, 'solve', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

// ————— كمّيةُ الحقيقة: لكلِّ وجهٍ رسمُها وجوابُها وعدُّها —————
//
// **والجوابُ من المرسوم في الثلاثة**: مجموعُ الجمع ما رسمه المصيِّر (`drawn`)، وباقي
// الطرح **ما لم يُشطَب** (`split` مقروءاً من الـDOM)، والفرقُ فرقُ ما رُسِم في الصفّين.

const FACT = {
  add(round) {
    const merged = figureBox(round.fact, 'q-fact-fig');
    const parts = round.parts.map((spec) => figureBox(spec, 'q-fact-part'));
    /* **كميتان تلتقيان** (٦·١): تُرى المجموعتان أولاً ثم تصيران واحدةً بشقَّيهما —
       فالعمليةُ فعلٌ يقع أمامه لا سطرٌ يُقرأ. وما سوى الآلة يعرض الحصيلةَ من أول لحظة
       (جملتُها الرمزيةُ تقول ما اجتمع). */
    const meet = parts.length ? h('div', { class: 'q-meet' }, ...parts.map((p) => p.box)) : null;
    const box = h('div', { class: 'q-fact-body' }, meet, merged.box);
    let joined = !meet;
    // **وتبقى المجموعتان بعد الالتقاء**: الحصيلةُ تنزل تحتهما ولا تمحوهما — فيرى الطفلُ
    // «هاتان صارتا هذه» في لحظةٍ واحدة، ولا يفوته الدرسُ إن نظر بعد حين.
    const join = () => {
      if (joined) return;
      joined = true;
      merged.box.hidden = false;
    };
    if (meet) {
      merged.box.hidden = true;
      setTimeout(join, BEAT * 2);
    }
    return {
      box,
      figs: [merged],
      answer: () => merged.drawn,
      // **العدُّ التصاعديُّ من الأكبر** (٦·٤): يُسمّى الشقُّ الأكبر ثم يُعَدّ ما بعده عليه
      walk: async (alive) => {
        join();
        const from = merged.split ?? 0;
        if (from <= 0 || from >= merged.drawn) {
          return countMarks(merged.marks, (i) => i + 1, alive);
        }
        for (const mark of merged.marks.slice(0, from)) mark.classList.add('is-counted');
        await say(NUMBER_NAME[from]);
        if (!alive()) return false;
        await new Promise((r) => setTimeout(r, BEAT));
        return countMarks(merged.marks.slice(from), (i) => from + i + 1, alive);
      },
    };
  },

  sub(round) {
    const fig = figureBox(round.fact, 'q-fact-fig');
    const gone = fig.marks.filter((m) => m.dataset.part === 'b');
    // **الإزالةُ مرئيةٌ من أول لحظة**: ما غادر مشطوبٌ، والسؤالُ ما بقي
    for (const mark of gone) mark.classList.add('is-gone');
    return {
      box: h('div', { class: 'q-fact-body' }, fig.box),
      figs: [fig],
      answer: () => fig.split,
      walk: async (alive) => {
        if (!gone.length) return countMarks(fig.marks, (i) => i + 1, alive);
        await say(NUMBER_NAME[fig.drawn]);
        if (!alive()) return false;
        await new Promise((r) => setTimeout(r, BEAT));
        return countMarks(gone, (i) => fig.drawn - i - 1, alive);
      },
    };
  },

  diff(round) {
    const rows = round.rows.map((spec) => figureBox(spec, 'q-row'));
    const [big, small] = rows;
    const extra = big.marks.filter((m) => m.dataset.part === 'b');
    return {
      box: h('div', { class: 'q-fact-body q-rows' }, ...rows.map((r) => r.box)),
      figs: rows,
      answer: () => big.drawn - small.drawn,
      walk: (alive) => countMarks(extra, (i) => i + 1, alive),
    };
  },
};

// ————— الشاشة —————

/**
 * لوحُ العملية: **الجملةُ فوق وكمّيتُها تحتها**.
 *
 * والجملةُ تُبنى من بطاقات المصيِّر وحدَها ومن **علامة الجبهة** — فلا رقمَ مكتوبٌ بيد
 * ولا علامةَ في محطةٍ لا تأذن بها. وخانةُ السؤال «؟» تُملأ بما أصاب **مقروءاً من
 * البطاقة المرسومة**، فتتمّ الجملةُ أمامه.
 */
function solveView(round, hooks) {
  const fact = FACT[round.mode](round);
  const board = h('div', { class: `q-solve q-solve--${round.mode}` });
  board.dataset.mode = round.mode;
  board.dataset.answer = String(fact.answer());

  const slot = h('span', { class: 'q-ask num' }, '؟');
  const line = [];
  for (const [i, spec] of round.terms.entries()) {
    if (i) line.push(h('span', { class: 'q-sign num', 'aria-hidden': 'true' }, round.sign));
    line.push(figureBox(spec, 'q-term').box);
  }
  const sentence = line.length ? h('div', { class: 'q-sentence' }, ...line, slot) : null;

  const factBox = h('div', { class: 'q-fact' }, fact.box);
  /* **أوّلُ لقاءٍ بالحقيقة: الكمّيةُ والرمزُ معاً** ثم **الرمزُ وحدَه والكمّيةُ عوناً عند
     النقر** (`METHOD.md §٣`). ومحطةُ الآلة بلا جملةٍ أصلاً، فكمّيتُها هي السؤالُ ولا
     تُحجَب. والعونُ **بلا حدٍّ ولا احتساب** — نظيرُ «أَعِدِ العَرْض» في الخطف. */
  const peek = h('button', { class: 'btn btn--ghost q-peek' },
    icon('eye'), ' أَرِنِي الكَمِّيَّة');
  const bare = Boolean(sentence) && !round.aided;
  factBox.hidden = bare;
  peek.hidden = !bare;

  const reveal = () => {
    factBox.hidden = false;
    peek.hidden = true;
  };
  peek.addEventListener('click', reveal);

  const choices = h('div', { class: 'q-choices' });
  let locked = false;

  for (const spec of round.options) {
    let cell = null;
    const choose = async () => {
      if (locked) return;
      const correct = cell.drawn === fact.answer();
      hooks.attempt(round, correct);
      if (correct) {
        locked = true;
        cell.btn.classList.add('good');
        pop(cell.btn);
        slot.textContent = arNum(cell.drawn);      // تتمّ الجملةُ بما رُسِم على البطاقة
        slot.classList.add('is-full');
        await praiseThen(hooks);
        return;
      }
      cell.btn.classList.add('bad');
      shake(cell.btn);
      locked = true;                 // ولا نقرةَ ثانيةً تفتح تصحيحاً فوق تصحيح
      // **الخطأُ يُعَدّ أمامه ولا يُلقَّن**: تُكشَف كمّيةُ الحقيقة فتُمشى بعدّ درسِها
      await say(SAY.together);
      if (!hooks.alive()) return;
      reveal();
      await new Promise((r) => setTimeout(r, BEAT / 2));
      if (!hooks.alive()) return;
      if (!(await fact.walk(hooks.alive))) return;
      for (const fig of fact.figs) clearCount(fig);
      cell.btn.classList.remove('bad');
      locked = false;
    };
    cell = numeralCard(spec.count, spec.seed, { label: 'هَذَا الرَّمْز', onclick: choose });
    choices.append(cell.btn);
  }

  board.append(...(sentence ? [sentence] : []), factBox, peek);
  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.hint),
    board,
    choices);
}

// ————— التسجيل في الموجِّه وفي المراجعة —————

function screen(type) {
  return (part) => {
    const station = stationById(`${type}:${part}`);
    if (!station) return null;
    return stationScreen({
      nodeId: station.id,
      title: station.title,
      accent: BOND_ACCENT,
      make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x9e3779b9),
      view: solveView,
      score,
      save: (stars) => progress.setStars(station.id, stars),
    });
  };
}

/* **وكلُّ سابقةٍ تُسجَّل باسمها صريحاً** لا بحلقةٍ على `TYPES`: حارسُ «لا عقدةَ بلا
   كاتبِ نجمة» (`test_nodes.mjs`) يجرد السوابقَ المسجَّلة **من نصّ الشيفرة**، فتسجيلٌ
   بمتغيّرٍ يُعميه عن خمس سوابقَ فينام عنها وهي حيّة — وذلك أخضرُ كاذب. */
registerScreen('add', screen('add'));
registerScreen('sub', screen('sub'));
registerScreen('diff', screen('diff'));
registerScreen('zero', screen('zero'));
registerScreen('fluent', screen('fluent'));

/**
 * جولةٌ واحدة لمهارةٍ مستحقّة — مادّةُ المراجعة والبوابات.
 *
 * **والوجهُ من محطة المهارة لا من اسم النوع**: مهارةُ `sub|10|solve` محطتُها «اطرح ضمن
 * ١٠» فتُبنى طرحاً، ومهارةُ `diff|10|solve` محطتُها الفرق فتُبنى فرقاً — ولو خُلطا
 * لَراجع الطفلُ غيرَ ما ضعف فيه.
 */
function reviewRound(skill, rnd) {
  const station = stationForSkill(skill);
  if (!station || !TYPES.has(station.type)) return null;
  const faces = facesOf(station).filter((face) => {
    const mode = MODE_OF[face];
    return mode === 'diff' ? skill.concept === 'diff' : mode === skill.concept;
  });
  return roundFor(station, rnd, pick(faces.length ? faces : facesOf(station), rnd), false);
}

registerExercise('solve', { build: reviewRound, view: solveView });
