// **المرحلة ٢ — العَدُّ المرتبط بالكمّ** (`METHOD.md §٣`): ستُّ محطاتٍ بشاشتين.
//
//   `count`  «الْمِسْ وَعُدَّ» ١–٣ ثم ١–٥ ثم ٦–٧ ثم ٨–١٠، وختامُها «الترتيب لا يغيّر العدد»
//            ومعها «أَعْطِنِي هَذَا العَدَد» في محطة ٢·٥
//   `equal`  «اجْعَلْهُمَا سَوَاء» ضمن ٥
//
// ————— مبادئُ العدّ الخمسة تُدرَّس قصداً لا عرَضاً (`METHOD.md §٢.٤`) —————
//
// ١) **التناظرُ الفرديّ مفروضٌ بنيوياً**: لمسةٌ لكل عنصر، **ولا يُحتسَب عنصرٌ مرتين**
//    — الزرُّ فوق العنصر الملموس **يُعطَّل** (`disabled`)، فاللمسةُ الثانية عليه لا
//    تفعل شيئاً حرفاً (نصُّ `METHOD.md §٣`). وليس ذلك تحقّقاً بعد الحدث بل **امتناعاً
//    في البنية**: لا سبيلَ إلى عدّ الواحد مرّتين ولو أراد.
// ٢) **ثباتُ الترتيب**: الأسماءُ تُنطَق بترتيبها من `NUMBER_NAME`، واحدةً لكل لمسة.
// ٣) **العدديّة**: بعد كل عدٍّ يُسأل «كَمْ صَارَتْ كُلُّهَا؟» — آخِرُ ما نطقتَ هو الجواب.
// ٤) **التجريد**: كلُّ شيءٍ يُعَدّ — نقاطٌ ومبعثرٌ وعناصرُ عالم الطفل.
// ٥) **لا أهميةَ للترتيب**: محطةُ ٢·٦ تَعُدُّ الكميةَ ثم تبعثرها فتُعَدُّ ثانيةً —
//    والعددُ هو هو.
//
// وثلاثةٌ تسري هنا كما تسري على المرحلة ١: **لا رمزَ عدديّ على الشاشة** (جوابُ العدديّة
// **بطاقةُ كمّ**)، و**معالجةُ الخطأ عدٌّ أمامه لا تلقين**، و**الجولاتُ حتميةٌ ببذرة**
// يجردها `probeRounds` قبل أن يراها طفل.

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { h, icon, landmark, pick, shuffle, seeded, shake, pop, QUANTITY_ACCENT } from './ui.js';
import {
  AFTER_RIGHT_MS, BEAT, FLASH_MS, NUMBER_NAME, SAY, say, praiseThen, span, nearOptions, seeder, skillOf,
  stationById, stationForSkill, figureBox, quantityCard, markButton, touchLayer, countAloud,
  clearCount, usedOf, registerExercise, stationScreen, roundGate,
} from './station.js';

const OPTIONS = 3;
const GUIDED = 2;
const SOLO = 5;

const TYPES = new Set(['count', 'equal']);

const ASK = {
  touch: 'الْمِسْ وَعُدَّ',
  howMany: 'كَمْ صَارَتْ كُلُّهَا؟',
  again: 'بَعْثَرْتُهَا، فَكَمْ صَارَتْ؟',
  give: 'أَعْطِنِي هَذَا الْعَدَدْ',
  equal: 'اجْعَلْهُمَا سَوَاءْ',
};

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه الوحدة (الباب ٤ في `check_range.py`) —————
//
// أرضيةُ ما تشترك فيه جبهاتُ محطات كل نوع (خمسُ محطاتِ عدٍّ أضيقُها ١–٣ بالمبعثر
// والعناصر)، وما زاد يُجرَد **جولةً جولة** على جبهة محطته في `probeRounds`.

export const CONSUMES = {
  count: {
    numbers: [1, 2, 3], numerals: [], ops: [], signs: [],
    displays: ['scatter', 'objects'],
  },
  equal: {
    numbers: [1, 2, 3, 4, 5], numerals: [], ops: [], signs: [],
    displays: ['scatter', 'objects'],
  },
};

// ————— المدى المُركَّز لكل محطة —————
//
// **الجبهةُ سقفٌ والتركيزُ درس**: محطةُ «٦–٧» جبهتُها ١–٧ (فلها أن تراجع ما دونها)
// وموضوعُها الستةُ والسبعة. فيُوزَن الاختيارُ إلى أعلى الجبهة **بلا خروجٍ عنها**:
// أوّلُ ثلثٍ من الجولات مراجعةٌ لما دون، وسائرُها في مادّة المحطة — وهو ما يقوله
// عنوانُ المحطة نفسُه في `curriculum.js`. ولا رقمَ يُكتب هنا لا يعرفه المنهج: الحدُّ
// الأعلى جبهتُه، والأدنى **ثلثاها الأعلى** محسوباً.
function focusPool(frontier) {
  const lo = Math.max(frontier.min, frontier.max - 2);
  return { wide: span(frontier.min, frontier.max), focus: span(lo, frontier.max) };
}

/**
 * نمطُ الكمّية التي تُلمَس: يدور على أنماط الجبهة فيتحقّق **التجريد** (كلُّ شيء يُعَدّ
 * — `METHOD.md §٢.٤`). ويخرج النردُ منها: وجهُه صورةٌ ثابتة تُعرَف بنظرة، والمقصودُ
 * هنا لمسةٌ لكل عنصر لا تقديرٌ فوريّ.
 */
function touchDisplay(frontier, rnd) {
  const usable = frontier.displays.filter((d) => d !== 'dice');
  return pick(usable.length ? usable : frontier.displays, rnd);
}

/** نمطُ بطاقات الجواب: النردُ إن بلغه المدى (بطاقةُ كمٍّ لا رمز)، وإلّا المبعثر. */
function cardDisplay(frontier, counts) {
  if (frontier.displays.includes('dice') && Math.max(...counts) <= 6) return 'dice';
  if (frontier.displays.includes('scatter')) return 'scatter';
  return frontier.displays[0];
}

// ————— بناءُ الجولات —————

/** جولةُ «المس وعُدّ» ثم سؤالُ العدديّة — و`restage` في محطة «الترتيب لا يغيّر العدد». */
function touchRound(station, rnd, { wide = false, restage = false } = {}) {
  const f = station.frontier;
  const skill = skillOf(station, 'count', 'touch');
  const pools = focusPool(f);
  const pool = wide ? pools.wide : pools.focus;
  const count = pick(pool, rnd);
  const counts = shuffle([count, ...nearOptions(count, pools.wide, OPTIONS - 1, rnd)], rnd);
  const card = cardDisplay(f, counts);
  const next = seeder(rnd);
  const subject = { display: touchDisplay(f, rnd), count, seed: next() };
  const shuffled = restage ? { ...subject, seed: next() } : null;
  const options = counts.map((c) => ({ display: card, count: c, seed: next() }));
  return {
    kind: 'touch', concept: skill.concept, range: skill.range,
    ask: ASK.touch, subject, shuffled, options,
    figures: [subject, ...(shuffled ? [shuffled] : []), ...options],
    sig: `${station.id}|${subject.seed}`,
  };
}

/**
 * جولةُ «أعطني ن»: نموذجٌ كمّيّ ومَبْسَطٌ أوسعُ منه — يلتقط الطفلُ منه بقدر النموذج.
 *
 * **والنموذجُ كمّيةٌ لا رمز** (المرحلة ٢ بلا رمز): يُنطَق العددُ اسماً ويُرى كمّاً،
 * والمقيسُ **إنتاجُ كمٍّ بقدرٍ معلوم** — وهو عينُ التناظر الفرديّ من جهته الأخرى.
 *
 * **ويُخطَف النموذجُ في «وحدك» وحدَها** (قيدُ الجلسة ٩ الافتتاحيّ — القرارُ المؤجَّل
 * في مراجعة الدفعة الصوتية الثالثة، حُسم مُقَرّاً): نموذجٌ مرئيٌّ **دائم** يحوّل
 * «أعطني ن» **مطابقةً بصرية** — يضع الطفلُ إصبعاً على نقطةٍ هنا ونقطةٍ هناك حتى
 * يستوي المنظران، فلا يُقاس إنتاجُ كمٍّ بقدرٍ معلوم أصلاً. فصار المطلوبُ **يُسمّى
 * باسمه** (وشرطُه تحقّق: أسماءُ الأعداد مصروفةٌ مُقَرّة) و**يُرى خطفةً ثم يُغطّى** —
 * فيحمله الطفلُ في ذهنه ويلتقط بقدره. و`flash` علامةُ الخطوة لا خاصّةَ الجولة:
 * «جرِّب معي» يبقى ظاهرَ النموذج (عونٌ مرئيّ في خطوة التعلّم بعون).
 */
function giveRound(station, rnd, flash = false) {
  const f = station.frontier;
  const skill = skillOf(station, 'count', 'give');
  const lo = Math.max(f.min, 2);
  const target = pick(span(lo, Math.max(lo, f.max - 3)), rnd);
  const pool = Math.min(f.max, target + 2 + Math.floor(rnd() * 2));
  const next = seeder(rnd);
  const model = { display: cardDisplay(f, [target]), count: target, seed: next() };
  const field = { display: touchDisplay(f, rnd), count: pool, seed: next() };
  return {
    kind: 'give', concept: skill.concept, range: skill.range, flash,
    ask: ASK.give, model, field, figures: [model, field],
    sig: `${station.id}|${field.seed}`,
  };
}

/**
 * جولةُ «اجعلهما سواء»: كمّيتان مختلفتان، ويزيد الطفلُ في إحداهما أو ينقص من الأخرى
 * حتى تتساويا. **ولا رمزَ عمليةٍ ولا علامة** (المرحلة ٢ بلا عملياتٍ أصلاً)، **ولا
 * كلمةَ تشغيلٍ واحدة**: كان الفعلُ زرَّي «أَضِفْ» و«أَزِلْ» تحت كلِّ لوح وزرَّ تأكيدٍ
 * ثالثاً — خمسةُ نصوصٍ في شاشةٍ واحدة أمام جمهورٍ **قبل-قارئ**، فوقف عندها طفلٌ حقيقيّ
 * (`docs/FIELD.md §٤`). فصار الفعلُ **لمساً مباشراً**: يُلمَس عنصرٌ فيذهب، ويُلمَس
 * فراغُ اللوح فيأتي واحد — وهو عينُ ما تعلّمه في «المس وعُدّ» قبل محطتين.
 *
 * **واللوحُ يسعُ ما قد يبلغه** (`room` في `render.js`): تُحسَب مواضعُه على الجبهة كلِّها
 * لا على عدده اليوم — فلا يقفز الباقون أماكنَهم كلما تبدّل العدد، ويُقرأ الفعلُ
 * «ذهب واحدٌ من هنا» لا «تبدّل كلُّ شيء».
 *
 * **واللوحان جنباً إلى جنب** (أمرُ المالك — م٦): رُصّا صفّاً تحت صفّ في م٥ لحقّ
 * الإصبع، فلمّا عاد زرُّ الحكم أسفلَهما هبط تحت طيّة الشاشة بعشرة بكسل (أمسكه
 * الحارسُ: أسفلُه ١٢٠٤ من ١١٩٤). فصارا متجاورين ويُرى الثلاثةُ في نظرةٍ واحدة،
 * وحقُّ الإصبع محفوظٌ في `app.css`: الرسمُ يأخذ أكبرَ ما يسعه العرض، ولهدف اللمس
 * أرضيّةٌ لا ينزل عنها.
 */
function equalRound(station, rnd) {
  const f = station.frontier;
  const skill = skillOf(station, 'equal', 'make');
  const pool = span(f.min, f.max);
  const a = pick(pool, rnd);
  const mates = pool.filter((c) => c !== a);
  const b = pick(mates, rnd);
  const next = seeder(rnd);
  const display = touchDisplay(f, rnd);
  const left = { display, count: a, seed: next(), room: f.max };
  const right = { display, count: b, seed: next(), room: f.max };
  return {
    kind: 'make', concept: skill.concept, range: skill.range,
    ask: ASK.equal, left, right, lo: f.min, hi: f.max,
    figures: [left, right],
    // **حدّا ما يبلغه العددُ بيد الطفل** — يُجرَدان كما تُجرَد الأشكال، فلا يخرج
    // «أَضِفْ» عن الجبهة ولا «أَزِلْ» عن أدناها.
    extra: span(f.min, f.max),
    sig: `${station.id}|${left.seed}`,
  };
}

export function buildStation(stationId, seed) {
  const station = stationById(stationId);
  if (!station || !TYPES.has(station.type)) return null;
  const rnd = seeded(seed >>> 0);
  const f = station.frontier;
  const next = seeder(rnd);

  if (station.type === 'equal') {
    const display = touchDisplay(f, rnd);
    const big = next();
    const small = next();
    /* **والنمذجةُ تُري الغايةَ وتسمّيها**: تُعَدُّ الكميتان المختلفتان، ثم يُكشَف
       اللوحان **مستويين** وبينهما الميزانُ المتوازن مع «صَارَا سَوَاءْ» — فيعرف
       الطفلُ ما المطلوبُ منه ومتى يتمّ، بلا سطرٍ يُقرأ (أمرُ المالك، الجلسة م٥).
       واللوحُ الأصغرُ يُكشَف بقدر الأكبر **ببذرته هو**: هو نفسُه وقد نما في مكانه.

       **وتكبس النمذجةُ الميزانَ بنفسها** (`press` — الجلسة م٦): استوى اللوحان ←
       كُبِس الزرُّ ← ظهر الميزانُ ونُطق «صَارَا سَوَاءْ». فيتعلّم الطفلُ **الفعلَ
       الذي يُعلن به جوابه** مشاهدةً لا قراءةً، ولا نصَّ تعليماتٍ جديد. */
    return {
      model: {
        title: ASK.equal, hint: 'نَعُدُّ هَذِهِ وَهَذِهِ، ثُمَّ نُسَوِّي بَيْنَهُمَا',
        figures: [
          { display, count: f.max, seed: big, room: f.max },
          { display, count: Math.max(f.min, f.max - 2), seed: small, room: f.max },
        ],
        reveal: {
          sign: 'scales',
          press: 'scales',
          say: SAY.revealSame,
          figures: [
            { display, count: f.max, seed: big, room: f.max },
            { display, count: f.max, seed: small, room: f.max },
          ],
        },
      },
      guided: Array.from({ length: GUIDED }, () => equalRound(station, rnd)),
      solo: Array.from({ length: SOLO }, () => equalRound(station, rnd)),
    };
  }

  const restage = station.part === 'scatter';
  const gives = Boolean(skillOf(station, 'count', 'give'));
  const solo = [
    touchRound(station, rnd, { wide: true, restage }),
    touchRound(station, rnd, { restage }),
    touchRound(station, rnd, { restage }),
    touchRound(station, rnd, { restage }),
    // **وهي جولاتُ «وحدك»** — فنموذجُها يُخطَف (أعلاه)
    gives ? giveRound(station, rnd, true) : touchRound(station, rnd, { restage }),
  ];
  if (gives) solo.push(giveRound(station, rnd, true));

  return {
    model: {
      title: ASK.touch,
      hint: restage
        ? 'نَعُدُّهَا، ثُمَّ نُبَعْثِرُهَا وَنَعُدُّهَا — وَالعَدَدُ هُوَ هُوَ'
        : 'لَمْسَةٌ لِكُلِّ وَاحِد، وَآخِرُ مَا نَطَقْتُ هُوَ الجَوَاب',
      figures: [{ display: touchDisplay(f, rnd), count: f.max, seed: next() }],
    },
    guided: Array.from({ length: GUIDED },
      (_, i) => touchRound(station, rnd, { wide: i === 0 })),
    solo,
  };
}

export function probeRounds(stationId, seed) {
  const plan = buildStation(stationId, seed);
  if (!plan) return [];
  return [plan.model, ...plan.guided, ...plan.solo].map(usedOf);
}

// ————— تسجيلُ المحاولة (لكلِّ نوعٍ سطرُه باسمه — بابُ الشيفرة في `test_measure.mjs`) —————

const SCORE = {
  touch: (r, ok) => progress.recordAttempt(r.concept, r.range, 'touch', ok),
  give: (r, ok) => progress.recordAttempt(r.concept, r.range, 'give', ok),
  make: (r, ok) => progress.recordAttempt(r.concept, r.range, 'make', ok),
};

const score = (round, correct) => SCORE[round.kind]?.(round, correct);

// ————— شاشةُ «المس وعُدّ» —————

/**
 * لوحُ العدّ: كميةٌ فوقها **طبقةُ لمس** (`touchLayer`)، كلُّ لمسةٍ تُعلّم عنصراً وتنطق
 * اسمَ رتبته. ويُرجِع `whenDone` حين يُعَدُّ آخرُ عنصر.
 *
 * **والعنصرُ الملموس يُعطَّل**: لا يُحتسَب مرتين ولو ألحّ الإصبع (`METHOD.md §٣` — ٢·١).
 */
function countBoard(spec, { onFinish, alive }) {
  const fig = figureBox(spec, 'q-touch');
  let counted = 0;
  const { taps } = touchLayer(fig, async (index, btn) => {
    counted++;
    btn.disabled = true;                       // **التناظرُ الفرديّ بنيويّ لا مراقَب**
    btn.classList.add('is-counted');
    fig.marks[index]?.classList.add('is-counted');
    const last = counted === fig.marks.length;
    // **إصبعُ الطفل تسبق الصوت وهو حقُّها**: كلُّ لمسةٍ تنطق اسمَها في القناة، فإن
    // تعجّل وقف الاسمُ في الطابور ولم يدهس سابقَه — **ولا يُسأل «كم صارت؟» إلا بعد
    // أن يتمّ اسمُ آخر عنصر**، فلا يقع السؤالُ فوق عدّه.
    await say(NUMBER_NAME[counted]);
    // **وسؤالُ العدديّة لا يقع بعد المغادرة** (بلاغ الميدان ٥ · م٥): يُصَفّ بعد مهلة،
    // فيُسأل الحياةُ **عند وقوعه** لا عند تأجيله — وإلّا نطق فوق الخريطة.
    if (last && alive()) setTimeout(() => { if (alive()) onFinish(); }, BEAT);
  });
  return { fig, taps, reset: () => {
    counted = 0;
    clearCount(fig);
    for (const btn of taps) { btn.disabled = false; btn.classList.remove('is-counted'); }
  } };
}

function touchView(round, hooks) {
  const head = h('h2', {}, round.ask);
  const hint = h('p', { class: 'hint' }, 'الْمِسْ كُلَّ وَاحِدٍ مَرَّةً وَاحِدَة');
  const stage = h('div', { class: 'q-stage' });
  const choices = h('div', { class: 'q-choices' });
  const foot = h('div', { class: 'row foot' });
  let board = null;
  const gate = roundGate('المس وعُدّ');
  let asked = false;
  let restaged = false;

  /** سؤالُ **العدديّة**: «كم صارت كلها؟» — والجوابُ بطاقةُ كمٍّ لا رمز. */
  function ask(prompt) {
    asked = true;
    head.textContent = prompt;
    hint.textContent = 'اِخْتَرِ الْبِطَاقَةَ الَّتِي فِيهَا مِثْلُهَا';
    say(prompt);
    choices.replaceChildren(...round.options.map((spec) => {
      const { btn, drawn } = quantityCard(spec, {
        label: 'هَذِهِ',
        onclick: gate.guard(async () => {
          // **الجوابُ ما رُسِم**: عددُ ما عَدَّه الطفلُ هو عددُ ما رسم المصيِّر
          const correct = drawn === board.fig.drawn;
          hooks.attempt(round, correct);
          if (correct) {
            btn.classList.add('good');
            pop(btn);
            /* **لا أهميةَ للترتيب** (٢·٦): تُبعثَر الكميةُ نفسُها وتُعَدُّ ثانيةً —
               والجوابُ هو هو، فيراه الطفلُ بيده لا يُخبَر به. **والبعثرةُ انتقالٌ**،
               فتنتظر تمامَ كلمة الصواب كما ينتظره الانتقال إلى الجولة التالية. */
            await say(SAY.bravo);
            if (!hooks.alive()) return;
            await new Promise((r) => setTimeout(r, AFTER_RIGHT_MS));
            if (!hooks.alive()) return;
            if (round.shuffled && !restaged) {
              restaged = true;
              // **والجولةُ لم تنتهِ**: تُبعثَر الكميةُ وتُسأل ثانيةً — فيُرَدّ القفل
              stageFigure(round.shuffled, ASK.again);
            } else {
              gate.end();          // الجولةُ انتهت: لا نقرةَ فوق انتقال
              hooks.done();
            }
            return;
          }
          btn.classList.add('bad');
          shake(btn);
          await say(SAY.together);
          if (!hooks.alive()) return;
          await new Promise((r) => setTimeout(r, BEAT / 2));
          if (!hooks.alive()) return;
          await countAloud([board.fig], hooks.alive);
          btn.classList.remove('bad');
        }),
      });
      return btn;
    }));
  }

  /** بعد سؤال العدديّة الأول: **البعثرة** في محطة «الترتيب لا يغيّر العدد» (٢·٦). */
  function stageFigure(spec, prompt) {
    stage.replaceChildren();
    choices.replaceChildren();
    asked = false;
    board = countBoard(spec, { alive: hooks.alive, onFinish: () => ask(prompt) });
    stage.append(board.fig.box);
    foot.replaceChildren(h('button', {
      class: 'btn',
      onclick: () => { if (!asked) board.reset(); },
    }, icon('repeat'), ' اِبْدَأِ الْعَدَّ مِنْ جَدِيد'));
  }

  stageFigure(round.subject, ASK.howMany);
  say(round.ask);

  return h('div', {}, head, hint, stage, foot, choices);
}

// ————— شاشةُ «أعطني هذا العدد» —————

function giveView(round, hooks) {
  const model = figureBox(round.model, 'q-model');
  const field = figureBox(round.field, 'q-touch');
  const picked = new Set();
  const gate = roundGate('أعطني هذا العدد');

  /* **غطاءُ الخطف** — غطاءُ «كم ترى؟» نفسُه بعلّته نفسِها (`METHOD.md §٢.٧`): ورقةٌ
     هادئة تحلّ محلّ النموذج، **لا عدّادَ ولا شريطَ يفرغ**. وهو مرفوعٌ في «جرِّب معي»
     ومسدولٌ في «وحدك» بعد الخطفة. */
  const cover = h('div', { class: 'q-cover', 'aria-hidden': 'true' }, icon('eye'));
  model.box.append(cover);
  const show = () => { cover.hidden = true; };
  const hide = () => { cover.hidden = false; };
  show();

  /** الخطفةُ: يُرى النموذجُ لحظةً ثم يُغطّى — وتُعاد **بلا حدٍّ ولا احتساب**. */
  async function flash() {
    if (!round.flash) return;
    clearCount(model);
    show();
    await new Promise((r) => setTimeout(r, FLASH_MS));
    if (!hooks.alive()) return;
    hide();
  }

  touchLayer(field, gate.guard((index, btn) => {
    // **الالتقاطُ يُراجَع بالإصبع**: ما التُقط يُترَك بلمسةٍ ثانية — وهو غيرُ العدّ
    // (هناك لا يُحتسَب عنصرٌ مرتين، وهنا يبني الطفلُ كمّاً ويصحّحه قبل أن يقول «تمّ»).
    if (picked.has(index)) picked.delete(index); else picked.add(index);
    btn.classList.toggle('is-picked', picked.has(index));
    field.marks[index]?.classList.toggle('is-counted', picked.has(index));
  }));

  /* **و«تَمَّ» يُرى بصورته** (جردُ الصنف — م٥): زرٌّ تتوقف عليه الجولةُ ووسيلتُه
     الوحيدة كلمةٌ حاجزٌ أمام قبل-قارئ. فصار صحّاً يُرى، والكلمةُ زينةُ الوالد.
     (ولا يسقط الزرُّ نفسُه كما سقط زرُّ «صارا سواء»: هناك بلوغُ التساوي **حالٌ**
     تُرى فتُحكَم، وهنا الالتقاطُ **بناءٌ** لا يُعرَف تمامُه إلا بقول صاحبه — فحكمٌ
     تلقائيّ على كمٍّ في منتصف بنائه خطأٌ يُسجَّل على طفلٍ لم يفرغ بعد.) */
  const done = h('button', { class: 'btn btn--primary btn--wide next' },
    icon('check'), ' تَمَّ');
  done.addEventListener('click', gate.guard(async () => {
    const correct = picked.size === model.drawn;
    hooks.attempt(round, correct);
    if (correct) {
      gate.end();
      done.classList.add('good');
      pop(done);
      await praiseThen(hooks);
      return;
    }
    shake(done);
    await say(SAY.together);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    show();                                   // الغطاءُ يُرفع ليُعَدَّ المطلوبُ أمامه
    await countAloud([model], hooks.alive);   // يرى المطلوبَ عدّاً، ثم يُصحّح بيده
    clearCount(model);
    if (round.flash) hide();                  // ثم يعود الغطاءُ ويحاول ثانية
  }));

  const foot = h('div', { class: 'row foot' });
  if (round.flash) {
    foot.append(h('button', { class: 'btn', onclick: flash },
      icon('repeat'), ' أَعِدِ الْعَرْض'));
  }
  foot.append(done);

  /* **يُسمّى المطلوبُ ثم يُخطَف نموذجُه** (قيدُ الجلسة ٩): الاسمُ يُنتظَر تامّاً قبل
     الخطفة — وإلّا جرت فوق الكلام فاختلف زمنُ العرض بطول جملةٍ لا يملكها الطفل
     (درسُ «كم ترى؟»). **والاسمُ من المرسوم لا من المطلوب**: يُنطق `NUMBER_NAME`
     لِما رسمه المصيِّرُ فعلاً، فلا يسمع الطفلُ اسماً يخالف ما رأى. */
  (async () => {
    await say(round.ask);
    if (!hooks.alive()) return;
    if (round.flash) {
      await say(NUMBER_NAME[model.drawn]);
      if (!hooks.alive()) return;
    }
    flash();
  })();

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, round.flash
      ? 'اِلْتَقِطْ مِنَ الصُّنْدُوقِ بِقَدْرِ مَا سَمِعْتَ وَرَأَيْت'
      : 'اِلْتَقِطْ مِنَ الصُّنْدُوقِ بِقَدْرِ الْبِطَاقَة'),
    h('div', { class: 'q-give' }, model.box, field.box),
    foot,
  );
}

// ————— شاشةُ «اجعلهما سواء» —————
//
// **بلا نصٍّ تشغيليٍّ واحد** (`docs/FIELD.md §٤` — أوّلُ امتحان طفلٍ حقيقيّ): سقطت
// خمسةُ نصوصٍ من هذه الشاشة دفعةً — «أَضِفْ» و«أَزِلْ» تحت كلِّ لوح، وزرُّ «صَارَا
// سَوَاء» أسفلَها — وبقي مكانَها **فعلٌ وحكمٌ**:
//
//   • **الفعلُ لمسٌ مباشر**: عنصرٌ يُلمَس فيذهب، وفراغُ اللوح يُلمَس فيأتي واحد.
//   • **والحكمُ كبسةٌ يُعلنها الطفل** — **ميزانٌ يُرى ولا يُقرأ** (حسمُ بند المراقبة،
//     `FIELD.md §٦`؛ والجلسةُ م٥ كانت قد أسقطت الزرَّ أصلاً فصار الحكمُ تلقائياً عند
//     بلوغ التساوي بعد وقفة). **وشهادةُ الميدان نقضت التلقائيّ بلفظ المالك**: «لا
//     يوجد submit لصارا سواء فالطفل يبقى يزيد حتى يكونوا سواء أوتوماتيكياً» — أي
//     أنّ النقر المتكرّر يبلغ التساوي **فيُحتفَل بنجاحٍ لم يقصده الطفل**. فعاد
//     الزرُّ **صورةً بلا حرف**: يجتمع فيه التزامُ إعلان الجواب وقاعدةُ اللاقراءة.
//   • **والتساوي يُرى ويُسمَع** بعد الكبسة: ميزانٌ متوازن بين اللوحين مع «صَارَا
//     سَوَاءْ» — ولا رمزَ «=»، فهو ليس من معجم هذا المستوى (أمرُ المالك، ١٣ أغسطس).
//
// **ومعالجةُ الخطأ عدٌّ أمامه كسائر الشاشات**، وموضعُها **الكبسة** لا الحركة: من
// أعلن التساوي واللوحان مختلفان عُدَّت الكميتان أمامه ثم يواصل بلا حدّ. وكانت م٥
// تجعل الخطأَ **الحركةَ المبعِدة** — وعلّتُها المكتوبة يومَها «في تمرينٍ لا خيارَ فيه
// يُنقَر»؛ فلمّا عاد الخيارُ يُنقَر عاد الخطأُ إلى موضعه: **الجوابُ المُعلَن**. فالحركةُ
// بحثٌ حرٌّ لا يُحاسَب عليه (زيادةٌ ونقصٌ حتى يرضى)، والكبسةُ وحدَها قولٌ يُحكَم له
// أو عليه — ولا يُقاس على طفلٍ إلا ما قصد. والمقيسُ `equal|5|make` كما هو.

function equalView(round, hooks) {
  const state = { left: round.left.count, right: round.right.count };
  const pair = h('div', { class: 'q-pair q-equal' });
  const figs = {};
  /* **وقفلٌ واحد لِلَمسةٍ وكبسة** (بلاغ الميدان ٦): كان `locked` للتصحيح و`judged`
     لانتهاء الجولة، وكلاهما يُرفَع بسطر. صارا حالَي بوابةٍ واحدة: مأخوذةٌ ما دام
     الحكمُ يعمل (فلا لمسةَ تُغيّر اللوحَ تحت العدّ)، **ومنتهيةٌ** بالصواب (`end`). */
  const gate = roundGate('اجعلهما سواء');

  const gap = () => Math.abs(figs.left.fig.drawn - figs.right.fig.drawn);
  /** الميزانُ المتوازن — معلمُ مرحلة المقارنة نفسُه (`ui.js`)، لا رسمٌ ثانٍ له. */
  const sign = h('span', { class: 'q-balance', hidden: true }, landmark('scales'));

  /**
   * لمسةٌ تُغيِّر اللوح: **من المرسوم لا من العدد المطلوب**، وما جاوز الجبهةَ لا يقع
   * — امتناعٌ في البنية كما في «اصنع العدد» (المرحلة ٥). **ولا حكمَ فيها**: تقريباً
   * كانت أو مباعدة، فهي بحثُ الطفل عن جوابه لا جوابُه.
   */
  const tap = gate.guard((key, delta) => {
    const next = state[key] + delta;
    if (next < round.lo || next > round.hi) return;      // لا يخرج عن جبهة محطته
    state[key] = next;
    draw();
  });

  /**
   * **الكبسة: الجوابُ يُعلَن** — والحكمُ **من المرسوم** (`drawn` لا `state`).
   * سواءٌ ⇒ ميزانٌ ولفظُه واحتفال؛ ومختلفان ⇒ تُعَدّ الكميتان أمامه ثم يعود يعدّل
   * ويُعلن ثانيةً **بلا حدٍّ** — لا شاشةَ خطأ ولا تراجعَ عن لمسته.
   */
  const judge = gate.guard(async () => {
    const correct = gap() === 0;
    hooks.attempt(round, correct);
    if (correct) {
      gate.end();
      sign.hidden = false;
      pop(sign);
      await say(SAY.revealSame);
      if (!hooks.alive()) return;
      await praiseThen(hooks);
      return;
    }
    shake(scaleBtn);
    await say(SAY.together);
    if (!hooks.alive()) return;
    await new Promise((r) => setTimeout(r, BEAT / 2));
    if (!hooks.alive()) return;
    await countAloud([figs.left.fig, figs.right.fig], hooks.alive);
    clearCount(figs.left.fig);
    clearCount(figs.right.fig);
  });

  /* **وزرُّ الحكم ميزانٌ بلا حرف** (م٦): صورتُه صورةُ الميزان الذي يظهر بين اللوحين
     عند التساوي وصورةُ زرّ «هما سواء» في محطة المقارنة — معلمٌ واحدٌ يُتعلَّم مرّةً.
     **وأوّلُ لقاءٍ به في نمذجة محطته**: تكبسه النمذجةُ بنفسها فيتعلّمه مشاهدةً. */
  const scaleBtn = markButton('scales', { onclick: judge, label: SAY.revealBoth });

  function side(key, spec) {
    const holder = h('div', { class: 'q-side' });
    const stage = h('div', { class: 'q-stage q-board' });
    figs[key] = { holder, stage, spec };
    holder.append(stage);
    return holder;
  }

  function draw() {
    for (const key of ['left', 'right']) {
      const { stage, spec } = figs[key];
      const fig = figureBox({ ...spec, count: state[key] });
      figs[key].fig = fig;
      /* **واللوحُ كلُّه زرٌّ يأتي بواحد**: يملأ صندوقَ الشكل **تحت** طبقة اللمس،
         فنقرةٌ على فراغٍ بين العناصر تبلغه ونقرةٌ على عنصرٍ تبلغ زرَّه هو (طبقةُ
         اللمس لا تعترض ما ليس فوق عنصر — `pointer-events` في اللوح). وهو **زرٌّ
         حقيقيّ** لا مستمعٌ على صندوق: تصله لوحةُ المفاتيح كما يصله الإصبع، ولا
         يتداخل مع أزرار العناصر لأنه أخوها لا أبوها. */
      fig.box.append(h('button', {
        class: 'q-add', 'aria-label': 'زِدْ وَاحِدًا', onclick: () => tap(key, +1),
      }));
      // **وزرٌّ فوق كلِّ عنصرٍ يُبعده** — بموضعه من المصيِّر (كطبقة العدّ)، فيبلغ
      // هدفَ اللمس ويجرده حارسُ المتصفّح من تلقائه.
      const { taps } = touchLayer(fig, () => tap(key, -1));
      for (const btn of taps) btn.setAttribute('aria-label', 'أَبْعِدْ هَذَا');
      stage.replaceChildren(fig.box);
    }
  }

  pair.append(side('left', round.left), sign, side('right', round.right));
  draw();

  say(round.ask);

  return h('div', {},
    h('h2', {}, round.ask),
    h('p', { class: 'hint' }, 'الْمِسْ وَاحِدًا لِيَذْهَب، وَالْمِسِ الفَرَاغَ لِيَأْتِيَ وَاحِد'),
    pair,
    h('div', { class: 'row foot q-judge' }, scaleBtn),
  );
}

const VIEWS = { touch: touchView, give: giveView, make: equalView };
const viewOf = (round, hooks) => VIEWS[round.kind](round, hooks);

// ————— التسجيل في الموجِّه وفي المراجعة —————

function screen(type) {
  return (part) => {
    const station = stationById(`${type}:${part}`);
    if (!station) return null;
    return stationScreen({
      nodeId: station.id,
      title: station.title,
      accent: QUANTITY_ACCENT,
      make: () => buildStation(station.id, (Date.now() >>> 0) ^ 0x85ebca6b),
      view: viewOf,
      score,
      save: (stars) => progress.setStars(station.id, stars),
    });
  };
}

registerScreen('count', screen('count'));
registerScreen('equal', screen('equal'));

const single = (build) => (skill, rnd) => {
  const station = stationForSkill(skill);
  return station && TYPES.has(station.type) ? build(station, rnd) : null;
};

registerExercise('touch', { build: single((s, r) => touchRound(s, r)), view: viewOf });
// **والمراجعةُ «وحدك» بطبعها** (لا خطوةَ عونٍ فيها): فنموذجُها يُخطَف كذلك
registerExercise('give', { build: single((s, r) => giveRound(s, r, true)), view: viewOf });
registerExercise('make', { build: single(equalRound), view: viewOf });
