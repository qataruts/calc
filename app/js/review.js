// محرّك جلسة المراجعة — **هيكلُه لا تمارينُه** (`FAMILY.md §٥`).
//
// ————— بذرةُ المنصة (منسوخةٌ من «اِقْرَأْ» ومجرَّدةٌ من مادّته) —————
//
// في اقرأ كان هذا الملفّ شيئين مختلطين: **محرّكَ جلسةٍ** محايداً (نقاطُ التقدّم،
// تسلسلُ التمارين، تسجيلُ المحاولة، شاشةُ الختام، الإعادةُ ببناءٍ جديد) و**ثمانيةَ
// تمارينَ** تعرف الحرفَ والحركةَ والمقطع. فبقي هنا **الأول وحدَه**، وصار الثاني
// يُحقَن: مَن يبني تمريناً يمرّره، ومَن يرسمه يمرّر مُصيِّرَه.
//
// وثلاثةُ قيودٍ تحكم هذا الملفّ، منقولةٌ بعلّتها لا بنصّها:
// ١) **لا محتوى جديداً**: المراجعة لا تعرض إلا تمارين المحطات القائمة، فكلُّ نصّ
//    تنطقه له ملفٌّ مولَّد أو مكانٌ في `tools/audio_queue.json` — لا نصَّ يُؤلَّف
//    من أجل المراجعة (وهذا ما يجعل الجلسة الصوتية مستقلّةً عن جلسات التطوير).
// ٢) **المفكوكية بالبناء**: مادّةُ الجلسة من حصيلة الطفل فعلاً (ما أتمّه من محطات)،
//    ونظيرُها هنا **الجبهة**: لا يُسأل عن عددٍ أو عمليةٍ فوق جبهة ما بلغ — يفرضه
//    `check_range.py` على كل جولةٍ مولَّدة (`METHOD.md §١٠.١`).
// ٣) **لا مهارةَ تُقاس بلا تمرينٍ يراجعها**: كلُّ مفتاحٍ يدخل ليتنر يجب أن يكون له
//    بانٍ في `itemFor` — وإلا بقيت المهارةُ في الصندوق الأول أبداً فكذبت لوحةُ وليّ
//    الأمر. يفرضه `test_measure.mjs` حيّاً (يطلب جلسةً لكل نوعٍ مستحقّ).

import * as progress from './progress.js';
import * as audio from './audio.js';
import { sessionSize } from './support.js';
import {
  h, icon, toast, go, arNum, arCount, starsRow, topbar, mascot, cheer, shuffle, onScreen, DEV,
  PAUSE_ACCENT,
} from './ui.js';

/* جلسة قصيرة تُنجَز في دقائق (`METHOD.md §٦`) — **وهو `standing` لمقبض الجرعة** في
   `support.js`: الرقمُ مكتوبٌ هنا مرّةً واحدة ويقابله الفاحصُ بالجدول، والمقروءُ عند
   البناء `sessionSize()` فيتبع الوضعَ إن شُغِّل. */
export const SESSION_SIZE = 6;
const ACCENT = PAUSE_ACCENT;      // المراجعة تثبيتُ مهارات — لونها لون البوابات

/**
 * نجوم الجلسة: ٣ بلا خطأ، ٢ ما دامت الأخطاء ≤ عدد التمارين، وإلا ١.
 * وهي قاعدةُ اقرأ المعتمدة: **العتبات تتناسب مع طول النشاط** (`METHOD.md §٤`) —
 * «زلّة لكل جولتين» لا عدداً مطلقاً يظلم الطويلَ ويسامح القصير.
 */
export const starsForReview = (errors, items) => (errors === 0 ? 3 : errors <= items ? 2 : 1);

// ————— بناء الجلسة: الأضعف أولاً ثم تنويعٌ من الحصيلة —————

/**
 * جلسة اليوم: المستحقّ من سجلّ المهارات أولاً (الأضعف أولاً)، ثم — إن لم يكتمل
 * العدد — تمارين من حصيلة الطفل تنويعاً.
 *
 * **دالّة خالصة**: كل ما تحتاجه يُحقَن، فتُختبر في node بلا متصفّح. وهذا هو موضعُ
 * الفصل بين الهيكل والمادّة:
 *
 * @param {object[]} due       مهاراتٌ مستحقّة بالأضعف أولاً (`dueSkills`/`weakestSkills`)
 * @param {Function} itemFor   `(skill, rnd) => item|null` — بناءُ تمرينٍ لمهارة (الجلسات ٣+)
 * @param {Function[]} fillers دوالُّ تنويعٍ `() => item|null` من حصيلة الطفل
 * @param {object} longs       سقفُ التمارين الطويلة لكل نوع: `{kind: max}`
 * @param {number} size        عدد التمارين
 * @param {Function} rnd       مولّدٌ حتميّ ببذرة
 */
export function buildSession({
  due = [], itemFor = () => null, fillers = [], longs = {},
  size = sessionSize(), rnd = Math.random,
} = {}) {
  const items = [];
  const seen = new Set();
  const used = {};

  const add = (item) => {
    if (!item || seen.has(item.id)) return false;
    if (item.kind in longs) {
      used[item.kind] = used[item.kind] || 0;
      if (used[item.kind] >= longs[item.kind]) return false;
      used[item.kind]++;
    }
    seen.add(item.id);
    items.push(item);
    return true;
  };

  for (const skill of due) {
    if (items.length >= size) break;
    add(itemFor(skill, rnd));
  }

  // **يُخلَط الحوضُ كلُّه لا كلُّ صنفٍ على حدة** (درسُ اقرأ): قائمةٌ مرتَّبةً بالأصناف
  // يبتلع صدرُها الجلسةَ كلَّها، فلا يُرى صنفٌ قليلُ العدد في التنويع أبداً — وهو عينُ
  // ما جعل الرتابةَ مرفوعاً في المراجعة الخارجية.
  const mixed = shuffle(fillers, rnd);
  for (let i = 0; items.length < size && i < mixed.length * 2; i++) {
    add(mixed[i % mixed.length]());
  }

  return items.slice(0, size);
}

// ————— محرّك الجلسة —————
//
// شاشتان تركبانه: «مراجعة اليوم» و**البوابات الثلاث** (`METHOD.md §٥`). وما يفترقان
// فيه **مادّةُ الجلسة وحكمُ ختامها** لا ميكانيكيةُ التمارين — فبقي المحرّك واحداً لا
// يُنسَخ: نسختان منه تفترقان يوماً في تسجيل الخطأ أو في «لا تلقين للجواب».
//
// @param {() => object[]} make     بناء تمارين المحاولة — يُستدعى في كل إعادة (لا نمط يُحفظ)
// @param {(item, api) => Node} view مُصيِّر التمرين الواحد (الجلسات ٣+) — يتلقّى `api`
// @param {(ctx) => Node} verdict    شاشة الختام: تتلقّى {right, errors, items, again}
// @param {string} pill · accent · leaveAsk  زينة الشاشة وسؤال المغادرة
//
// و`api` الممرَّرة إلى المُصيِّر عقدُه مع المحرّك:
//   `score(concept, range, kind, correct)` — تسجيلُ محاولةٍ في ليتنر وفي عدّاد الجلسة
//   `wrong(el, replay)` — معالجةُ الخطأ الموحَّدة (هزّةٌ ثم إعادةُ عرضٍ، بلا تلقين)
//   `right(el)` — أثرُ الصواب ثم التمرين التالي
//   `next()` · `rnd` · `alive()` — «أما زالت هذه الجولة هي الجارية؟»

/**
 * **ومُصيِّرُ التمرين افتراضُه المحقون** (إصلاحُ الجلسة ٥ — `SEED.md §٩`): كانت
 * `renderSession` تطلبه من مُناديها، فمرّرته «مراجعةُ اليوم» **ونسيته البوابة** —
 * فكانت البوابةُ ترتمي `TypeError` أوّلَ ما تجد في يد الطفل مهارةً تُسأل عنها، ويبقى
 * على شاشته ما كان. ولم يظهر ذلك قطّ لأنّ البوابةَ لا تُرسَم إلا بجلسةٍ غيرِ فارغة.
 * فصار الافتراضُ **المُصيِّرَ المحقون نفسَه** (`viewFor`): مَن أراد غيرَه مرّره، ومَن
 * سكت أصاب — ولا يبقى بابٌ يُنسى.
 */
export function renderSession({
  make, view = (item, api) => viewFor(item, api), verdict,
  pill, accent = ACCENT, leaveAsk, header = null,
}) {
  let items = make();
  if (!items.length) return null;   // لا حصيلة بعدُ: `main.js` يعيده إلى الخريطة

  const state = { index: 0, errors: 0, right: 0, done: false, token: 0 };

  const dots = h('ol', { class: 'dots' });
  const body = h('div', { class: 'station-body' });
  /** جذرُ الشاشة — وبه تحيا تمارينُها وتموت (`onScreen` في `ui.js` · م٥). */
  let root = null;
  const live = () => onScreen(root);

  function paintDots() {
    dots.replaceChildren(...items.map((item, i) => h('li', {
      class: `dot${!state.done && i === state.index ? ' dot--now' : ''}`
        + `${state.done || i < state.index ? ' dot--done' : ''}`,
      'aria-label': `تمرين ${arNum(i + 1)}`,
    }, i < state.index || state.done ? '✓' : arNum(i + 1))));
  }

  /**
   * الانتقالُ إلى التمرين التالي — **ولا ينتقل من غادر** (بلاغ الميدان ٥ · م٥):
   * يُنادى بعد مهلةٍ (`right`) وبعد كلمةِ صواب، فلو وقع الانتقالُ وقد غادر الطفلُ
   * إلى الخريطة لَرسم جولةً جديدة **ونطق سؤالَها فوقها**.
   */
  function next() {
    if (!live()) return;
    if (state.index < items.length - 1) {
      state.index++;
      paint();
    } else {
      finish();
    }
  }

  /**
   * **معالجة الخطأ** (`METHOD.md §٤`، عهدُ «لا شاشة خطأ»): الخيار الخاطئ لا ينقل —
   * هزّةٌ وتلوينٌ ثم **يُعاد العرضُ ليرى الصواب بنفسه**، بلا تلقينٍ وبلا عقاب.
   * وما يُعاد عرضُه يملكه التمرين (تُعدُّ الكميةُ أمامه، أو يُصفّ الجمعان متحاذيين).
   */
  function wrong(el, replay) {
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;                  // إعادة تشغيل الحركة
    el.classList.add('shake', 'bad');
    setTimeout(() => el.classList.remove('bad'), 700);
    // **وإعادةُ العرض لا تقع بعد المغادرة** (م٥): يُعاد العرضُ بصوته، فلو وقع بعدها
    // تكلّم على الخريطة.
    if (replay) setTimeout(() => { if (live()) replay(); }, 450);
  }

  /** صواب: أثرٌ بصريّ ثم التمرين التالي بعد فاصلٍ يُرى. */
  function right(el) {
    if (el) {
      el.classList.add('good');
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
    setTimeout(next, 750);
  }

  /**
   * تسجيل محاولة. **المفتاحُ مفتاحُ المهارة المطلوبة لا ما لمس الطفل** (`METHOD.md §٤`)
   * — فمن أخطأ في «كم ترى؟» يُسجَّل خطؤه على التقدير لا على العدد الذي نقره.
   */
  const score = (concept, range, kind, correct) => {
    progress.recordAttempt(concept, range, kind, correct);
    if (correct) state.right++;
    else state.errors++;
  };

  const api = {
    score,
    wrong,
    right,
    next,
    alive: live,
  };

  function paint() {
    audio.stop();
    state.token++;
    paintDots();
    const item = items[state.index];
    const token = state.token;
    // **وحياةُ التمرين شرطان** (م٥): أن يكون هو الجاري، **وأن تكون شاشتُه على
    // الصفحة** — فحلقةُ عدٍّ في تمرينٍ غادره الطفل تموت بمغادرته لا بمهلتها.
    body.replaceChildren(view(item, {
      ...api,
      fresh: () => live() && token === state.token,
    }));
  }

  /** إعادة المحاولة: تمارين تُبنى من جديد (لا نمط يُحفظ فيُستظهَر) وحالةٌ نظيفة. */
  function again() {
    const built = make();
    if (!built.length) return void go('#/');
    items = built;
    Object.assign(state, { index: 0, errors: 0, right: 0, done: false });
    paint();
  }

  function finish() {
    audio.stop();
    state.done = true;
    state.token++;
    paintDots();
    body.replaceChildren(verdict({ right: state.right, errors: state.errors, items, again }));
  }

  paint();

  root = h('div', { class: 'screen station-screen', css: { '--accent': accent } },
    topbar(
      h('button', {
        class: 'btn',
        onclick: () => { if (state.done || state.index === 0 || confirm(leaveAsk)) go('#/'); },
      }, icon('map'), ' الخريطة'),
      h('span', { class: 'spacer' }),
      h('span', { class: 'pill' }, pill),
    ),
    h('main', { class: 'screen-card' },
      header,
      dots,
      body,
      DEV && h('div', { class: 'dev' },
        h('div', { class: 'dev-title' }, 'أدوات التجربة (?dev=1)'),
        h('div', { class: 'dev-row' },
          h('span', {}, `التمارين: ${items.map((i) => i.kind).join('، ')}`),
          h('button', { class: 'btn', onclick: () => toast(`أخطاء: ${arNum(state.errors)}`) }, 'عدّ الأخطاء'),
          h('button', { class: 'btn', onclick: finish }, 'إنهاء الجلسة الآن'),
        )),
    ),
  );
  return root;
}

// ————— شاشة مراجعة اليوم —————
//
// **مادّتُها تدخل مع أول شاشة تمرين** (الجلسة ٤ في `SESSIONS.md`: «تفعيل القياس …
// والمراجعة اليومية»). واليومَ لا حصيلةَ ولا مهارةَ مقيسة، فتعود `null` — و`main.js`
// يردّ الطفلَ إلى الخريطة برسالةٍ لطيفة. وهذا **الغيابُ صريحٌ لا صامت**: بانياها
// (`itemFor` و`fillers`) معلَّقان هنا بأسمائهما، فمن يملأهما يعرف أين يضع يده.

/** بانِي تمرينٍ لمهارةٍ مستحقّة — تحقنه الجلسات ٣+ عبر `setBuilders`. */
let itemFor = () => null;
/** دوالُّ التنويع من حصيلة الطفل — تحقنها الجلسات ٣+. */
let fillersOf = () => [];
/** مُصيِّر التمرين الواحد — تحقنه الجلسات ٣+. */
let viewFor = () => h('p', { class: 'hint' }, 'لا تمرين بعد.');
/** سقفُ التمارين الطويلة لكل نوع. */
let longKinds = {};

/**
 * حقنُ مادّة المراجعة — تناديها وحدةُ التمارين مرّةً عند تحميلها.
 * وبها يبقى هذا الملفّ **هيكلاً**: لا يعرف تمريناً، ويعرف كيف تُدار الجلسة.
 */
export function setBuilders({ item, fillers, view, longs } = {}) {
  if (item) itemFor = item;
  if (fillers) fillersOf = fillers;
  if (view) viewFor = view;
  if (longs) longKinds = longs;
}

/** تمارينُ جلسةٍ من مهاراتٍ بعينها — تستعملها المراجعةُ والبوابات معاً.
 *  **والجرعةُ تُقرأ عند كل بناء** لا مرّةً عند التحميل — فمن بدّل المقبضَ في اللوحة
 *  يجد أثرَه في جلسة اليوم لا في إقلاعٍ قادم.
 *
 *  **وحوضُ التنويع يُحقَن ليُمنَع** (الجلسة ل): امتحانُ اللحاق يقيس **شريحةً بعينها**
 *  ليفتحها، فلو كمّل عيّنتَه من حصيلة الطفل لَحُكم على مرحلةٍ بخطأٍ في مادّةٍ ليست
 *  منها — فيمرّره فارغاً. ومَن سكت أخذ الحوضَ كما كان (المراجعةُ والبوّابات). */
export function sessionItems(due, size = sessionSize(), rnd = Math.random, fillers = null) {
  return buildSession({
    due, itemFor, fillers: fillers || fillersOf(rnd), longs: longKinds, size, rnd,
  });
}

export function renderReview() {
  const make = () => sessionItems(progress.dueSkills());

  return renderSession({
    make,
    pill: 'مراجعة اليوم',
    leaveAsk: 'تريد الخروج قبل إتمام المراجعة؟',
    verdict: ({ right, errors, items }) => {
      progress.markReview(right + errors, right);
      const stars = starsForReview(errors, items.length);
      const streak = progress.reviewStreak();
      const line = errors === 0
        ? cheer('مراجعة بلا خطأ واحد!')
        : `أصبتَ ${arNum(right)} من ${arNum(right + errors)} محاولة — وما أخطأتَ فيه يعود غداً.`;

      return h('div', { class: 'celebrate' },
        mascot('mascot mascot--cheer'),
        h('div', { class: 'celebrate-face' }, icon('repeat')),
        h('h2', {}, 'أتممتَ مراجعة اليوم!'),
        starsRow(stars, 'big-stars'),
        h('p', { class: 'hint' }, line),
        streak > 1 && h('p', { class: 'note' },
          icon('flame'),
          ` ${arCount(streak, ['يوم', 'يومان متتاليان', 'أيام متتالية', 'يوماً متتالياً'])} من المراجعة`),
        h('div', { class: 'row foot' },
          h('button', { class: 'btn btn--primary', onclick: () => go('#/') },
            icon('map'), ' الخريطة')),
      );
    },
  });
}
