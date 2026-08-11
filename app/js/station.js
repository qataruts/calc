// **حلقةُ المحطة** — الهيكلُ المشترك لشاشات تمارين «اِحْسِبْ» (`METHOD.md §٤`).
//
// ————— أربعُ خطوات لا ثالثةَ لها بينها —————
//
//   ١) **شاهِدْ**    نمذجةٌ بلا مطالبة: كميةٌ تُعَدّ أمامه عنصراً عنصراً بالصوت.
//   ٢) **جَرِّبْ مَعِي** جولتان بعونٍ مرئيّ — **غيرُ مقيستين في ليتنر** (نصُّ §٤:
//      «وحدك … وهي المقيسة»)، فلا يُحاسَب الطفلُ على خطوةِ تعلُّمٍ بعون.
//   ٣) **وَحْدَكْ**   أربعُ جولاتٍ إلى ستّ مستقلّة — وهي المقيسة وحدَها.
//   ٤) **كافِئْ**    نجومٌ بعتبةٍ **متناسبة مع طول النشاط** واحتفالٌ قصير.
//
// ————— وثلاثةُ عهودٍ يفرضها هذا الملفّ على كل شاشةٍ تركبه —————
//
// أ) **لا رمزَ عدديّ على الشاشة** (`METHOD.md §٣` المرحلة ١: «لا رمز عددي واحد على
//    الشاشة في هذه المرحلة كلها»): فلا `arNum` في شيءٍ يراه الطفل هنا — لا في نقاط
//    الجولات ولا في شريط الخطوات ولا في عدّادٍ. والجولاتُ **خرزاتٌ تمتلئ** لا أرقام،
//    والخطواتُ **أسماؤها** لا أعدادُها. ويحرسه فحصٌ في `browser_test.html` يجرد النصَّ
//    المعروض على شاشة محطةٍ حيّة.
// ب) **معالجةُ الخطأ واحدة**: الخيارُ الخاطئ **لا ينقل** — هزّةٌ ثم **تُعَدّ الكميةُ
//    المعنية أمامه عنصراً عنصراً** (`countAloud`) ثم يحاول ثانية. ولا تلقينَ للصواب
//    **قبل** المحاولة، ولا شاشةَ خطأ ولا عقاب.
// ج) **الشاشةُ لا تدّعي عدداً**: جوابُ كل تمرينٍ يُقرأ من **ما رسمه المصيِّر فعلاً**
//    (`drawn` في `render.js`) لا من العدد الذي طُلب — فلو أسقط رسّامٌ عنصراً لَما صار
//    التمرينُ كاذباً على الطفل. وهو امتدادُ عقد الجلسة ٢ إلى شاشات الجلسة ٣.
//
// ————— وحقنُ المراجعة يقع هنا مرّةً واحدة —————
//
// `review.js` **هيكلٌ لا يعرف تمريناً** (`SEED.md §٧.٢`)، ومادّتُه تُحقَن بـ`setBuilders`.
// وهي تُحقَن **مرّةً**، فلو نادتها كلُّ وحدةِ تمارينٍ لَمحت الثانيةُ الأولى. فهذا الملفّ
// يحقن **موزِّعاً** يقرأ سجلَّ التمارين أدناه، وتسجّل كلُّ وحدةٍ تمارينَها فيه
// (`registerExercise`) — فوحدةُ الجلسة ٤ تدخل المراجعةَ بلا سطرٍ يُعدَّل هنا.

import * as progress from './progress.js';
import * as audio from './audio.js';
import { stations } from './curriculum.js';
import { paint, spotStyle } from './render.js';
import { setBuilders } from './review.js';
import {
  h, icon, go, topbar, starsRow, mascot, cheer, toast, shuffle, arNum, DEV,
} from './ui.js';

// ————— إيقاعُ الشاشة (بالمللي ثانية) — لا مؤقّتَ ضغطٍ في أيٍّ منها —————

/** فاصلُ العدّ بين عنصرٍ وعنصر: يُسمَع الاسمُ ويُرى التعليم. */
export const BEAT = 620;
/** مهلةُ العرض الخاطف في «كم ترى؟» — **طبيعةُ تمرينٍ لا مؤقّتُ ضغط** (`METHOD.md §٢.٧`):
 *  تمنع العدَّ فتُجبِر التقدير، وتُعاد بنقرةٍ **بلا حدٍّ ولا احتساب**. */
export const FLASH_MS = 1200;
/** فاصلُ الانتقال بعد الصواب — أثرٌ يُرى قبل الجولة التالية. */
export const AFTER_RIGHT_MS = 780;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ————— أسماءُ الأعداد: **العدُّ المجرد فقط** (ق٢ · `METHOD.md §٨`) —————
//
// «واحد، اثنان، ثلاثة…» موحّداً في كل التمارين، **ولا يُنطَق معدودٌ مقروناً بعددٍ
// أبداً**. والمدى هنا ١–١٠ لأنّ المرحلتين ١–٢ لا تتجاوزان العشرة؛ وما فوقها يدخل مع
// المرحلة ٧ (يُبنى حزمةً وآحاداً)، و«صِفْرْ» يدخل مع محطته ٣·٨ — فلا نصَّ يُصفّ قبل
// أن تحتاجه شاشة.

export const NUMBER_NAME = {
  1: 'وَاحِدْ',
  2: 'اِثْنَانْ',
  3: 'ثَلَاثَةْ',
  4: 'أَرْبَعَةْ',
  5: 'خَمْسَةْ',
  6: 'سِتَّةْ',
  7: 'سَبْعَةْ',
  8: 'ثَمَانِيَةْ',
  9: 'تِسْعَةْ',
  10: 'عَشَرَةْ',
};

/** جملُ الحلقة نفسِها (نمذجةٌ واحتفال) — تعليماتُ كل تمرينٍ في وحدته. */
export const SAY = {
  watch: 'اُنْظُرْ وَعُدَّ مَعِي',
  withMe: 'الْآنَ جَرِّبْ مَعِي',
  alone: 'وَالْآنَ وَحْدَكْ',
  together: 'لِنَعُدَّهَا مَعًا',
  bravo: 'أَحْسَنْتْ',
  great: 'رَائِعْ',
};

/**
 * **كلُّ نصٍّ قد تنطقه هذه الوحدة** — يجرده `tools/check_speech.mjs` فيطالب له بملفٍّ
 * مولَّد أو مكاناً في `tools/audio_queue.json`. إعلانٌ لا استنتاج: نصٌّ يُنطَق ولا
 * يُعلَن هنا يسمعه الطفلُ بصوتٍ آليّ ولا يعرف أحدٌ أنّه فات.
 */
export const SPOKEN = [...Object.values(NUMBER_NAME), ...Object.values(SAY)];

/** نطقٌ لا يوقف الشاشة: الصوتُ زينةُ الدرس لا شرطُ تقدّمه (بلاغُ صمت الآيباد). */
export const say = (text) => { if (text) audio.play(text); };

// ————— المنهجُ يقول المدى: المهارةُ والمحطة —————

/** مفتاحُ ليتنر الذي تدرّسه هذه المحطة بهذا (المفهوم × نوع التمرين) — أو `null`. */
export function skillOf(station, concept, kind) {
  const key = (station.skills || []).find((k) => {
    const [c, , t] = k.split('|');
    return c === concept && t === kind;
  });
  if (!key) return null;
  const [, range] = key.split('|');
  return { concept, range: Number(range), kind };
}

/** محطةٌ بمعرّفها من المنهج (`curriculum.js` وحدَه يملك الرحلة). */
export const stationById = (id) => stations().find((s) => s.id === id) || null;

/**
 * المحطةُ التي تُبنى منها مادّةُ مهارةٍ في المراجعة.
 *
 * تُطلَب أولاً بمفتاحها التامّ (فيُبنى التمرينُ على جبهة المحطة التي تدرّسه فعلاً)،
 * وإلّا فأوّلُ محطةٍ تدرّس نوعَ التمرين نفسَه — ومنها يأتي المدى. والثانيةُ ليست
 * تساهلاً: بها تُجيب المراجعةُ عن مهارةٍ سُجِّلت بمدىً لا محطةَ له اليوم بدل أن تصمت.
 */
export function stationForSkill(skill) {
  const all = stations();
  const exact = all.find((s) =>
    (s.skills || []).includes(`${skill.concept}|${skill.range}|${skill.kind}`));
  return exact || all.find((s) =>
    (s.skills || []).some((k) => k.split('|')[2] === skill.kind)) || null;
}

// ————— جردُ ما تستهلكه الجولة (البابان ٤+٥ في `check_range.py`) —————

/**
 * **ما تستعمله جولةٌ واحدة، بالصنف** — يقابله الحارسُ بجبهة محطتها.
 *
 * وكلُّ جولةٍ تُعلن `figures`: **كلَّ شكلٍ سيُرسَم فيها** بلا استثناء (الهدفُ والخيارات
 * والنموذج)، فالجردُ يقرأ ما سيراه الطفل لا ما نوى المولّد. و`extra` لِما يبلغه عددٌ
 * **بيد الطفل** ولم يُرسَم ابتداءً (حدّا «اجعلهما سواء» مثلاً).
 */
export const usedOf = (round) => ({
  numbers: [...new Set([...round.figures.map((f) => f.count), ...(round.extra || [])])],
  numerals: [],
  ops: [],
  signs: [],
  displays: [...new Set(round.figures.map((f) => f.display))],
});

// ————— أدواتُ التوليد: حتميةٌ ببذرة، ومشتّتاتٌ متجاورة —————

/** الأعدادُ من `a` إلى `b` — حوضُ الجولة، ومصدرُه **جبهةُ المحطة** لا رقمٌ مكتوب. */
export const span = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/**
 * **المشتّتاتُ أعدادٌ متجاورة** (`METHOD.md §٣`: «أمام ٣: ٢ و٤ لا ١ و٥») — يقدّر الطفل
 * ولا يخمّن. وهي قاعدةُ أحواض الخيارات في الرحلة كلها، فموضعُها هنا لا في شاشةٍ بعينها.
 * وما ضاق حوضُه (١–٢) يعطي خياراتٍ أقلّ — ولا يُخرَج عن الجبهة لتكميل عدد.
 */
export function nearOptions(target, pool, wanted, rnd) {
  const near = [];
  for (let d = 1; d <= pool.length && near.length < wanted; d++) {
    for (const c of shuffle([target - d, target + d], rnd)) {
      if (c !== target && pool.includes(c) && !near.includes(c)) near.push(c);
    }
  }
  return near.slice(0, wanted);
}

/** بذرةٌ جديدة لكل شكل — من مولّد الجولة نفسِه، فتُعاد الجولةُ كما كانت. */
export const seeder = (rnd) => () => Math.floor(rnd() * 0xffffffff);

// ————— الأشكال: بطاقةُ كميةٍ وطبقةُ لمس —————

/**
 * شكلُ كميةٍ جاهزٌ للشاشة: **العددُ يُقرأ من المصيِّر لا من الطلب**.
 * `drawn` هو ما رُسِم فعلاً (`[data-mark]` في `render.js`)، وعليه تقوم أجوبةُ التمارين.
 */
export function figureOf({ display, count, seed, glyph }) {
  const { el, drawn, plan } = paint(display, count, { seed, glyph });
  return { el, drawn, plan, marks: [...el.querySelectorAll('[data-mark]')] };
}

/** صندوقٌ يحمل الشكلَ وتسكن فوقه طبقةُ اللمس (الشكلُ نفسُه يبقى `aria-hidden`). */
export function figureBox(spec, className = '') {
  const fig = figureOf(spec);
  const box = h('div', { class: `q-figure ${className}`.trim() }, fig.el);
  return { ...fig, box };
}

/**
 * **بطاقةُ اختيارٍ كمّية** — الجوابُ في المرحلتين ١–٢ **اختيارُ كمّ لا رمز**
 * (`METHOD.md §٣`): يطابق الطفلُ كمّاً بكمّ، فلا رقمَ على زرٍّ ولا تحت صورة.
 */
export function quantityCard(spec, { onclick, label }) {
  const fig = figureOf(spec);
  const btn = h('button', { class: 'qcard', 'aria-label': label, onclick }, fig.el);
  return { btn, drawn: fig.drawn, marks: fig.marks };
}

/**
 * **طبقةُ اللمس**: زرٌّ شفّافٌ فوق كل عنصرٍ مرسوم، موضعُه من `spotStyle` في المصيِّر
 * نفسِه — فلا يُحسَب موضعُ العنصر مرّتين ولا يلمس الطفلُ فراغاً.
 *
 * وهي **زرٌّ حقيقيّ** (`<button>`) لا مستمعٌ على شكل: بها يجرد حارسُ هدف اللمس في
 * `browser_test.html` عناصرَ العدّ من تلقائه (وعدُ `DESIGN.md §٥`).
 */
export function touchLayer(fig, onTap) {
  const layer = h('div', { class: 'fig-taps' });
  const taps = fig.plan.marks.map((mark, i) => {
    const btn = h('button', {
      class: 'fig-tap',
      css: spotStyle(mark, fig.plan.view),
      'aria-label': 'عُدَّ هَذَا',
      onclick: () => onTap(i, btn),
    });
    layer.append(btn);
    return btn;
  });
  fig.box?.append(layer);
  return { layer, taps };
}

/**
 * **يَعُدّ الكميةَ أمام الطفل عنصراً عنصراً** — قلبُ معالجة الخطأ (`METHOD.md §٤`):
 * يرى الصوابَ **عدّاً** لا تلقيناً. ويُستعمَل في «شاهِد» نمذجةً وفي الخطأ تصحيحاً.
 *
 * @param {object[]} figures أشكالٌ تُعَدّ بالتتابع (المقارنةُ تَعُدّ الطرفين)
 * @param {() => boolean} alive «أما زالت هذه الجولة هي الجارية؟» — فلا يعدّ بعد انتقال
 */
export async function countAloud(figures, alive = () => true) {
  for (const fig of figures) {
    for (const mark of fig.marks) mark.classList.remove('is-counted');
  }
  for (const fig of figures) {
    for (const [i, mark] of fig.marks.entries()) {
      if (!alive()) return false;
      mark.classList.add('is-counted');
      say(NUMBER_NAME[i + 1]);
      await wait(BEAT);
    }
    if (!alive()) return false;
    await wait(BEAT / 2);
  }
  return true;
}

/** إزالةُ أثر العدّ (قبل إعادة العرض). */
export const clearCount = (fig) => {
  for (const mark of fig.marks) mark.classList.remove('is-counted');
};

// ————— نجومُ المحطة —————

/**
 * ٣ بلا خطأ · ٢ بعتبةٍ **متناسبة مع طول النشاط** («زلّة لكل جولتين») · ١ سواها.
 * وهي قاعدةُ `METHOD.md §٤` حرفاً — لا عددٌ مطلق يظلم الطويلَ ويسامح القصير.
 */
export const starsForStation = (errors, rounds) =>
  (errors === 0 ? 3 : errors <= Math.ceil(rounds / 2) ? 2 : 1);

// ————— شاشةُ المحطة —————

const PHASES = [
  { key: 'watch', name: 'شَاهِدْ' },
  { key: 'guided', name: 'جَرِّبْ مَعِي' },
  { key: 'solo', name: 'وَحْدَكْ' },
];

/**
 * @param {object} o
 * @param {string} o.nodeId  معرّف العقدة (`<النوع>:<الجزء>`) — **الشاشةُ المالكةُ تكتب
 *   نجمتَه بمعرّفه هو** (`save`)، وهو عينُ ما يحرسه `test_nodes.mjs`.
 * @param {string} o.title   عنوانُ المحطة كما في المنهج
 * @param {string} o.accent  لونُ المرحلة
 * @param {() => object} o.make  بناءُ خطة الجولات — **يُنادى في كل إعادة**، فلا نمطَ
 *   يُحفَظ فيُستظهَر. يُرجِع `{model, guided, solo}`.
 * @param {Function} o.view  `(round, hooks) => Node` — مُصيِّرُ الجولة الواحدة
 * @param {Function} o.score `(round, correct) => void` — تسجيلُ محاولةٍ في ليتنر
 * @param {Function} o.save  `(stars) => void` — كتابةُ نجمة العقدة
 */
export function stationScreen({ nodeId, title, accent, make, view, score, save }) {
  let plan = make();
  const state = { phase: 0, index: 0, errors: 0, done: false, token: 0 };

  const stepsBar = h('ol', { class: 'steps' });
  const beads = h('ol', { class: 'beads' });
  const body = h('div', { class: 'station-body' });

  const phases = PHASES.filter((p) => p.key === 'watch' || plan[p.key].length);
  const rounds = () => (phases[state.phase].key === 'watch' ? [] : plan[phases[state.phase].key]);

  function paintSteps() {
    stepsBar.replaceChildren(...phases.map((p, i) => h('li', {
      class: `step${!state.done && i === state.phase ? ' step--now' : ''}`
        + `${state.done || i < state.phase ? ' step--done' : ''}`,
    },
      // **علامةٌ لا رقم**: لا رمزَ عدديّ على شاشة المرحلة ١ (`METHOD.md §٣`)
      h('span', { class: 'step-dot', 'aria-hidden': 'true' },
        state.done || i < state.phase ? '✓' : '●'),
      h('span', { class: 'step-name' }, p.name),
    )));
  }

  /** خرزاتُ الجولات — تمتلئ واحدةً واحدة، **بلا رقمٍ واحد** (عهد أ أعلاه). */
  function paintBeads() {
    const list = rounds();
    beads.replaceChildren(...list.map((_, i) => h('li', {
      class: `bead${!state.done && i === state.index ? ' bead--now' : ''}`
        + `${state.done || i < state.index ? ' bead--done' : ''}`,
      'aria-label': i < state.index ? 'جولةٌ تمّت' : 'جولة',
    })));
    beads.hidden = list.length === 0;
  }

  const hooks = () => {
    const token = state.token;
    const measured = phases[state.phase].key === 'solo';
    return {
      measured,
      alive: () => token === state.token,
      /** محاولةٌ واحدة — **المقيسُ «وحدك» وحدَه** (`METHOD.md §٤`). */
      attempt: (round, correct) => {
        if (!measured) return;
        score(round, correct);
        if (!correct) state.errors++;
      },
      done: () => { if (token === state.token) advance(); },
    };
  };

  function paint() {
    audio.stop();
    state.token++;
    paintSteps();
    paintBeads();
    const phase = phases[state.phase];
    body.replaceChildren(phase.key === 'watch'
      ? watchStep(plan.model, hooks())
      : view(plan[phase.key][state.index], hooks()));
  }

  function advance() {
    const list = rounds();
    if (state.index < list.length - 1) {
      state.index++;
      paint();
      return;
    }
    if (state.phase < phases.length - 1) {
      state.phase++;
      state.index = 0;
      say(phases[state.phase].key === 'solo' ? SAY.alone : SAY.withMe);
      paint();
      return;
    }
    finish();
  }

  /**
   * **خطوةُ «شاهِدْ»**: الكميةُ تُعَدّ أمامه بالصوت — نمذجةٌ **بلا مطالبة** (`METHOD.md §٤`).
   * ولا زرَّ «تابع» قبل أن ينتهي العدّ: الخطوةُ عرضٌ لا امتحان، ولا يُترك معلَّقاً بعده.
   */
  function watchStep(model, api) {
    // كميتان تُعَدّان في النمذجة (المقارنةُ والتسوية) تأخذان مقاسَ المقارنة لا مقاسَ
    // البطل الواحد — وإلّا خرجت الثانيةُ عن الشاشة فلم يُرَ الطرفان معاً، وهو المقصود.
    const stage = h('div', { class: `q-stage${model.figures.length > 1 ? ' q-pair' : ' q-hero'}` });
    const foot = h('div', { class: 'row foot' });
    const figures = model.figures.map((spec) => {
      const fig = figureBox(spec);
      stage.append(fig.box);
      return fig;
    });

    const run = async () => {
      foot.replaceChildren();
      say(SAY.watch);
      await wait(BEAT);
      if (!(await countAloud(figures, api.alive))) return;
      foot.replaceChildren(
        h('button', { class: 'btn', onclick: run }, icon('repeat'), ' أَعِدْ'),
        h('button', { class: 'btn btn--primary next', onclick: api.done }, 'تَابِعْ ←'),
      );
    };
    run();

    return h('div', {}, mascot('mascot mascot--hello'),
      h('h2', {}, model.title), h('p', { class: 'hint' }, model.hint), stage, foot);
  }

  function finish() {
    audio.stop();
    state.done = true;
    state.token++;
    paintSteps();
    paintBeads();

    const stars = starsForStation(state.errors, plan.solo.length);
    const before = progress.getStars(nodeId);
    save(stars);
    say(state.errors === 0 ? SAY.great : SAY.bravo);

    const line = state.errors === 0 ? cheer('بلا خطأ واحد!')
      : state.errors <= Math.ceil(plan.solo.length / 2)
        ? 'أتممتَ المحطة — وزلّاتُك قليلة.'
        : 'أتممتَ المحطة، وبالإعادة تزيد نجومك.';

    body.replaceChildren(h('div', { class: 'celebrate' },
      mascot('mascot mascot--cheer'),
      h('div', { class: 'celebrate-face' }, icon('party')),
      h('h2', {}, 'أَحْسَنْت!'),
      starsRow(stars, 'big-stars'),
      h('p', { class: 'hint' }, line),
      before > stars && h('p', { class: 'hint' }, 'ونجومُك السابقة محفوظة.'),
      h('div', { class: 'row foot' },
        h('button', { class: 'btn btn--primary', onclick: () => go('#/') }, '→ الخريطة'),
        h('button', {
          class: 'btn',
          onclick: () => {
            plan = make();       // إعادةٌ تبني جولاتِها من جديد — لا نمطَ يُستظهَر
            Object.assign(state, { phase: 0, index: 0, errors: 0, done: false });
            paint();
          },
        }, icon('repeat'), ' أَعِدْ'),
      ),
    ));
  }

  paint();

  return h('div', { class: 'screen station-screen', css: { '--accent': accent } },
    topbar(
      h('button', {
        class: 'btn',
        onclick: () => {
          if (state.done || (state.phase === 0 && state.index === 0)
            || confirm('تريد الخروج قبل إتمام المحطة؟')) go('#/');
        },
      }, '→ الخريطة'),
      h('span', { class: 'spacer' }),
      h('span', { class: 'pill' }, title),
    ),
    h('main', { class: 'screen-card' },
      stepsBar,
      beads,
      body,
      DEV && h('div', { class: 'dev' },
        h('div', { class: 'dev-title' }, 'أدوات التجربة (?dev=1)'),
        h('div', { class: 'dev-row' },
          h('span', {}, `الجولات: ${plan.solo.map((r) => r.kind).join('، ')}`),
          h('button', { class: 'btn', onclick: () => toast(`أخطاء: ${arNum(state.errors)}`) },
            'عدّ الأخطاء'),
          h('button', { class: 'btn', onclick: finish }, 'إنهاء المحطة الآن'),
        )),
    ),
  );
}

// ————— سِجلُّ التمارين وحقنُ المراجعة —————
//
// **موزِّعٌ واحد بدل حقنٍ متكرّر**: `setBuilders` تُحقَن مرّةً هنا، وكلُّ وحدةِ تمارين
// تسجّل أنواعَها في هذا السجلّ — فما دخل الرحلةَ دخل المراجعةَ والبواباتِ معه، ولا
// يفترق التمرينُ الذي يُدرَّس عن التمرين الذي يُراجَع.

const EXERCISES = new Map();   // نوعُ التمرين ← { build, view }

/**
 * تسجيلُ نوع تمرينٍ في المراجعة.
 * @param {string} kind  الحقلُ الثالث من مفتاح ليتنر (`METHOD.md §٦`)
 * @param {{build: Function, view: Function}} spec
 *   `build(skill, rnd)` يبني جولةً من محطةِ تلك المهارة، و`view(round, hooks)` يرسمها.
 */
export function registerExercise(kind, spec) {
  EXERCISES.set(kind, spec);
}

/** تمرينُ مهارةٍ مستحقّة — يقرؤه محرّكُ المراجعة والبوابات معاً. */
function itemFor(skill, rnd = Math.random) {
  const spec = EXERCISES.get(skill.kind);
  if (!spec) return null;
  const round = spec.build(skill, rnd);
  return round ? { ...round, id: `${round.kind}|${round.sig}` } : null;
}

/**
 * حوضُ التنويع: تماريُن من **حصيلة الطفل** — محطاتٌ أتمّها فعلاً، ومهاراتُها التي
 * تدرّسها. فلا يُسأل في المراجعة عمّا لم يبلغه (نظيرُ «المفكوكية بالبناء» في اقرأ).
 */
function fillersOf(rnd = Math.random) {
  const out = [];
  for (const station of stations()) {
    if (!progress.isDone(station.id)) continue;
    for (const key of station.skills || []) {
      const [concept, range, kind] = key.split('|');
      if (!EXERCISES.has(kind)) continue;
      out.push(() => itemFor({ concept, range: Number(range), kind }, rnd));
    }
  }
  return shuffle(out, rnd);
}

/** مُصيِّرُ تمرين المراجعة — التمرينُ نفسُه الذي في المحطة، بعقد المحرّك. */
function viewFor(item, api) {
  const spec = EXERCISES.get(item.kind);
  if (!spec) return h('p', { class: 'hint' }, 'لا تمرين بعد.');
  return spec.view(item, {
    measured: true,
    alive: api.fresh,
    // **الخطأ يُسجَّل على المهارة المطلوبة لا على ما لمس** (`METHOD.md §٤`)
    attempt: (round, correct) => api.score(round.concept, round.range, round.kind, correct),
    done: api.next,
  });
}

setBuilders({ item: itemFor, fillers: fillersOf, view: viewFor });
