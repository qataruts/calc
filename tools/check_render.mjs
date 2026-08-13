// **حارسُ المصيِّر** — الحارس ٢ في `METHOD.md §١٠.٢`:
//   node tools/check_render.mjs              # الفحص على المصيِّر الحيّ
//   node tools/check_render.mjs --self-test  # فحصُ الفاحص: أيمسك المخالفات؟
//
// القاعدة الملزمة: **الكمياتُ تُرسم برمجياً والعددُ المرسوم يُثبَت آلياً** — فالمصيِّر
// يُرجِع العدد الذي رسم، وهذا الحارسُ يقابله بالمقصود **في كل نمطٍ وكل عددٍ من ٠ إلى
// ٢٠ حيث ينطبق**. والغلطُ في الرسم مستحيلٌ بنيوياً لا مستبعَدٌ باجتهاد.
//
// ————— ولِمَ حارسان لا واحد؟ —————
//
// هذا يقرأ **الهندسة** (`plan`) في `node` بلا متصفّح: عدداً وحدوداً وتراكباً وترتيبَ
// ملءٍ من اليمين وتوزيعَ نردٍ قياسياً — وهي حقائقُ أعدادٍ تُجرَّب سالباً بخططٍ مصنوعة.
// وأخوه في `tools/browser_test.html` يقرأ **الرسم** على الشاشة نفسِها بلوحها واتجاهها:
// أنّ ما في DOM هو ما أعلنت الخطة، وأنّ الصورَ حمّلت فعلاً، وأنّ المقاسات المحسوبة
// لا تتراكب. فما يفوت الحسابَ يمسكه القياس، وما يفوت القياسَ يمسكه الحساب.
//
// ————— النومُ الذاتيّ (`docs/SEED.md §٥`) —————
//
// معجمُ أنماط العرض يملكه المنهج (`DISPLAYS` في `curriculum.js`) والمصيِّر يُنفِّذ منه
// ما بلغته الرحلة. فنمطٌ يرسمه المصيِّر ولا يعرفه المنهج **خطأ**، ونمطٌ يعرفه المنهج
// ولا رسّامَ له بعدُ **نائمٌ بشرطٍ مجرود** — يستيقظ من تلقائه يومَ يُكتب رسّامُه، ولا
// رايةَ تُضبط بيد.

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as render from '../app/js/render.js';
import {
  DISPLAYS, LEVEL_MAX, SCENES, SHAPES, SHAPES_WORLD, SKIP_STEPS, shapeOf, stations,
} from '../app/js/curriculum.js';
import { isEmoji, emojiSrc } from '../app/js/ui.js';

const EMOJI_DIR = new URL('../app/emoji/', import.meta.url);
const { R, GAP, CELL } = render.GEOM;

// بذورٌ ثابتة: الحتميةُ تُقاس بإعادة البذرة نفسِها، والتنويعُ باختلافها.
const SEEDS = [0, 1, 7, 23, 101, 4096];
const EPS = 1e-9;

const label = (display, count, seed) => `[${display} · ${count} · بذرة ${seed}]`;

// ————— ١) الشكل: العددُ المرسوم، والحدود، والتراكب —————
//
// **دالّةٌ خالصة على خطةٍ** — لا تعرف مَن ولّدها، فتُجرَّب سالباً بخططٍ مصنوعةٍ مكسورة.

function figureErrors(name, figure, want) {
  const marks = figure.marks || [];
  const errors = marks.length === want ? []
    : [`${name}: رسم ${marks.length} عنصراً والمقصود ${want} `
      + '— **العددُ المرسوم ليس هو المقصود**'];
  return [...errors, ...placeErrors(name, marks, figure.view)];
}

/**
 * **الموضعُ وحدَه**: داخلَ الصندوق، وبلا تراكبٍ ولا تلاصقٍ دون الفاصل الأدنى.
 * مفصولٌ عن عدّ العناصر لأنّ الأنماط التي ليست كمّاً (الشريطُ والمشهد) تُقاس بعددٍ
 * آخر — **وقواعدُ الموضع واحدةٌ لها كلِّها**: ما خرج عن صندوقه يُقتصّ، وما تلاصق
 * لا يُميَّز عمّا جاوره.
 */
function placeErrors(name, marks, view) {
  const errors = [];
  for (const [i, m] of marks.entries()) {
    if (![m.x, m.y, m.r].every(Number.isFinite)) {
      errors.push(`${name}: العنصر ${i} بموضعٍ ليس عدداً`);
      continue;
    }
    if (m.r <= 0) errors.push(`${name}: العنصر ${i} بلا حجم`);
    if (m.x - m.r < -EPS || m.y - m.r < -EPS
      || m.x + m.r > view.w + EPS || m.y + m.r > view.h + EPS) {
      errors.push(`${name}: العنصر ${i} يخرج عن صندوق الشكل `
        + `(${m.x.toFixed(1)}، ${m.y.toFixed(1)}) — فيُقتصّ فلا يُعَدّ`);
    }
  }

  for (let i = 0; i < marks.length; i++) {
    for (let j = i + 1; j < marks.length; j++) {
      const near = Math.hypot(marks[i].x - marks[j].x, marks[i].y - marks[j].y);
      const touch = marks[i].r + marks[j].r;
      if (near < touch - EPS) {
        errors.push(`${name}: العنصران ${i} و${j} **متراكبان** `
          + `(المسافة ${near.toFixed(1)} دون ${touch}) — كميةٌ لا تُعَدّ`);
      } else if (near < touch + GAP - EPS) {
        errors.push(`${name}: العنصران ${i} و${j} متلاصقان دون الفاصل الأدنى `
          + `(${near.toFixed(1)} < ${touch + GAP}) — يفشل التقديرُ الفوريّ`);
      }
    }
  }
  return errors;
}

// ————— ٢) الإطارات: **تُملأ من اليمين** (RTL) —————
//
// والترتيبُ يُشتقّ هنا من **القاعدة** لا من نسخة الشيفرة: الإطارُ الأيمنُ أولاً، ثم
// الصفُّ الأعلى، ثم الخانةُ اليمنى — فلو انقلب الملءُ في المصيِّر سقط هنا.

function fillOrder(figure) {
  const boxes = [...(figure.frames || [])].sort((a, b) => b.x - a.x);   // من اليمين
  const inBox = (c, b) => c.x >= b.x && c.x <= b.x + b.w && c.y >= b.y && c.y <= b.y + b.h;
  return boxes.flatMap((box) => (figure.cells || []).filter((c) => inBox(c, box))
    .sort((a, b) => (a.y - b.y) || (b.x - a.x)));
}

function frameErrors(name, figure, want) {
  const errors = [];
  const order = fillOrder(figure);
  if (order.length !== (figure.cells || []).length) {
    errors.push(`${name}: خانةٌ خارج إطارٍ معلَن (${order.length} من ${figure.cells.length})`);
    return errors;
  }
  const marks = figure.marks || [];
  for (const [i, m] of marks.entries()) {
    const cell = order[i];
    if (!cell || Math.abs(cell.x - m.x) > EPS || Math.abs(cell.y - m.y) > EPS) {
      errors.push(`${name}: العنصر ${i} ليس في خانته من ترتيب **الملء من اليمين** `
        + `(هو عند ${m.x.toFixed(1)}، والمنتظَر ${cell ? cell.x.toFixed(1) : 'لا خانة'})`);
      break;
    }
  }
  if (want > 0 && marks.length && order.length) {
    const first = order[0];
    if (marks[0].x < figure.view.w / 2) {
      errors.push(`${name}: أوّلُ خانةٍ تُملأ في يسار الشكل — والواجهةُ RTL`);
    }
    if (Math.abs(first.x - marks[0].x) > EPS) {
      errors.push(`${name}: الملءُ لا يبدأ من أوّل الترتيب`);
    }
  }
  return errors;
}

// ————— ٢ب) الشقّ: **الكمّيةُ تنشقّ شقّين** (المرحلة ٥ — الجلسة ٥) —————
//
// «جزء-جزء-كلّ يُبنى بصرياً» (`METHOD.md §٢.٥`)، والشقُّ من المصيِّر لا من الشاشة —
// فيُقاس كما يُقاس العدد: **كم عنصراً في كل شقّ، وبأيّ ترتيب**. والترتيبُ شرطٌ لا
// زينة: العدُّ أمام الطفل يمشي على ترتيب الرسم (`countAloud`)، والإطارُ يُملأ من
// اليمين — فشقٌّ يخالف ترتيبَ الرسم يُري الطفلَ جزأين لا يطابقان ما يُعَدّ.

function splitErrors(name, figure, want, split) {
  const errors = [];
  const marks = figure.marks || [];
  const parts = marks.map((m) => m.part);
  if (parts.some((p) => p !== 'a' && p !== 'b')) {
    return [`${name}: عنصرٌ بلا شقٍّ مُعلَن (${parts.join('،') || 'لا عناصر'})`];
  }
  const first = parts.filter((p) => p === 'a').length;
  if (first !== split) {
    errors.push(`${name}: الشقُّ الأول ${first} عنصراً والمقصود ${split} `
      + '— **المرسومُ ليس هو المقسوم**');
  }
  if (parts.length - first !== want - split) {
    errors.push(`${name}: الشقُّ الثاني ${parts.length - first} والمقصود ${want - split}`);
  }
  const turn = parts.indexOf('b');
  if (turn >= 0 && parts.slice(turn).some((p) => p === 'a')) {
    errors.push(`${name}: الشقّان مختلطان في ترتيب الرسم — والعدُّ أمام الطفل يمشي `
      + 'عليه، فيُرى شقٌّ لا يطابق ما يُعَدّ');
  }
  return errors;
}

// ————— ٢ج) سَعةُ اللوح: **ما بقي لا يزحزحه ما زاد** (الجلسة م٥) —————
//
// لوحٌ يعدّله الطفلُ بإصبعه (اجعلهما سواء — `FIELD.md §٤`) يُرسَم من جديدٍ بعد كل
// لمسة. فلو حُسبت شبكتُه على عدده اليوم لَقفز الباقون أماكنَهم كلما تبدّل العدد،
// فقُرئ الفعلُ «تبدّل كلُّ شيء» لا «ذهب واحدٌ من هنا» — وهو نقضُ اللمس المباشر نفسِه.
//
// **فالمقيسُ أنّ مواضعَ `n` هي أوائلُ مواضع `n+1` حرفاً** بالبذرة والسَّعة نفسِها:
// اللوحُ ينمو وينقص **في مكانه**. ويُقاس معه أنّ السَّعةَ **لا تُبتلَع صامتة** حيث
// لا معنى لها (نمطٌ مواضعُه ثابتةٌ أصلاً) ولا حيث تضيق عمّا رُسم فيها.

function roomErrors(display, room, seed) {
  const errors = [];
  let before = null;
  for (let n = 0; n <= room; n++) {
    const marks = render.plan(display, n, { seed, room }).marks;
    if (marks.length !== n) {
      errors.push(`[${display} · سَعة ${room}] رسم ${marks.length} والمقصود ${n}`);
    }
    if (before && JSON.stringify(marks.slice(0, before.length)) !== JSON.stringify(before)) {
      errors.push(`[${display} · سَعة ${room}] العنصرُ ${n} زحزح ما قبله — `
        + '**واللوحُ ينمو في مكانه** فلا يقفز الباقون بلمسةٍ واحدة');
    }
    before = marks;
  }
  return errors;
}

// ————— ٣) النرد: التوزيعُ القياسيّ —————
//
// **جدولٌ مكتوبٌ هنا مستقلاً** عن جدول المصيِّر: مقابلةُ نسخةٍ بنسختها لا تُثبت شيئاً،
// وإنما تُثبت المقابلةُ بالقاعدة المعروفة خارج التطبيق — وجهُ النرد كما يُرسم في
// العالم كلِّه، وهو صورةُ الطفل الذهنية التي لا يجوز أن نخترع غيرَها.

const DICE_FACES = {
  1: ['وسط'],
  2: ['أعلى-يسار', 'أسفل-يمين'],
  3: ['أعلى-يسار', 'وسط', 'أسفل-يمين'],
  4: ['أعلى-يسار', 'أعلى-يمين', 'أسفل-يسار', 'أسفل-يمين'],
  5: ['أعلى-يسار', 'أعلى-يمين', 'وسط', 'أسفل-يسار', 'أسفل-يمين'],
  6: ['أعلى-يسار', 'أعلى-يمين', 'وسط-يسار', 'وسط-يمين', 'أسفل-يسار', 'أسفل-يمين'],
};
const SPOTS = [['أعلى-يسار', 'أعلى-وسط', 'أعلى-يمين'],
  ['وسط-يسار', 'وسط', 'وسط-يمين'],
  ['أسفل-يسار', 'أسفل-وسط', 'أسفل-يمين']];

function diceErrors(name, figure, want) {
  const origin = (figure.view.w - 3 * CELL) / 2;
  const index = (v) => Math.round((v - origin - CELL / 2) / CELL);
  const seen = [];
  for (const m of figure.marks || []) {
    const col = index(m.x);
    const row = index(m.y);
    if (col < 0 || col > 2 || row < 0 || row > 2
      || Math.abs(origin + col * CELL + CELL / 2 - m.x) > EPS
      || Math.abs(origin + row * CELL + CELL / 2 - m.y) > EPS) {
      return [`${name}: نقطةٌ خارج شبكة النرد ٣×٣ (${m.x.toFixed(1)}، ${m.y.toFixed(1)})`];
    }
    seen.push(SPOTS[row][col]);
  }
  const want_ = [...(DICE_FACES[want] || [])].sort();
  const got = [...seen].sort();
  if (want_.join('|') !== got.join('|')) {
    return [`${name}: وجهُ النرد ليس القياسيّ — رسم (${got.join('، ') || 'لا شيء'}) `
      + `والقياسيّ (${want_.join('، ')})`];
  }
  return [];
}

// ————— ٣ب) بطاقةُ الرمز: الرقمُ المرسوم هو المقصود، مشرقياً (الجلسة ٤) —————
//
// **وجدولُ الأرقام مكتوبٌ هنا مستقلاً** عن `arNum` في `ui.js` — كدرس جدول النرد
// سواءً بسواء: مقابلةُ نسخةٍ بنسختها لا تُثبت شيئاً. فيُبنى النصُّ المنتظَر من رسم
// الأرقام المشرقية كما يعرفها من هو خارج التطبيق، ثم يُقابَل بما رسمه المصيِّر.

const EASTERN = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const eastern = (n) => String(n).split('').map((d) => EASTERN[Number(d)]).join('');

function numeralErrors(name, figure, want) {
  const errors = [];
  if (figure.marks.length) {
    errors.push(`${name}: بطاقةُ رمزٍ فيها عناصرُ كمّيةٍ تُعَدّ — الرمزُ يُقرأ ولا يُعَدّ`);
  }
  if (figure.text !== eastern(want)) {
    errors.push(`${name}: كتب «${figure.text}» والمقصود «${eastern(want)}» `
      + '— **الرمزُ المرسوم ليس هو المقصود**');
  }
  if (/[0-9]/.test(String(figure.text))) {
    errors.push(`${name}: رقمٌ مغربيّ (123) في بطاقة رمز — والمشرقيةُ لغةُ التعليم (ق١)`);
  }
  return errors;
}

// ————— ٣ج) خطُّ الأعداد: علاماتُه ومرساتُه وجهتُه (الجلسة ٤) —————
//
// أربعُ حقائقَ تُقاس أعداداً: **العلاماتُ مدىً وواحدة** (خطُّ العشرة إحدى عشرة علامة،
// فلا تسقط منها واحدة) · **متساويةُ التباعد** · **والصفرُ على اليمين** فتتّفق جهةُ
// الخطّ وجهةُ ملء الإطار · **وخاناتُ اللمس تُغطّي علاماتِها ولا تتداخل** (خانةٌ تزيح
// عن علامتها = طفلٌ يلمس موضعاً ويُحسَب له غيرُه).

function lineErrors(name, figure, want) {
  const errors = [];
  const ticks = figure.ticks || [];
  if (ticks.length !== want + 1) {
    errors.push(`${name}: رسم ${ticks.length} علامةً والخطُّ يحتاج ${want + 1} `
      + '(من الصفر إلى مداه) — **العلاماتُ ليست هي المقصود**');
    return errors;
  }
  if (ticks.some((t, i) => t.value !== i)) {
    errors.push(`${name}: قيمُ العلامات ليست متتاليةً من الصفر`);
  }
  const steps = ticks.slice(1).map((t, i) => ticks[i].x - t.x);
  if (steps.some((s) => s <= 0)) {
    errors.push(`${name}: الخطُّ لا يتصاعد إلى اليسار — والصفرُ على اليمين `
      + '(جهةُ ملء الإطار نفسُها، `METHOD.md §٣`)');
  } else if (Math.max(...steps) - Math.min(...steps) > 1e-6) {
    errors.push(`${name}: تباعدُ العلامات غيرُ متساوٍ `
      + `(${Math.min(...steps).toFixed(2)}..${Math.max(...steps).toFixed(2)}) — والمسافةُ معنىً`);
  }
  for (const [i, t] of ticks.entries()) {
    if (t.x - t.r < -EPS || t.x + t.r > figure.view.w + EPS) {
      errors.push(`${name}: العلامة ${i} تخرج عن صندوق الشكل`);
      break;
    }
  }
  if (ticks.length > 1) {
    const gap = ticks[0].x - ticks[1].x;
    if (gap < 2 * ticks[0].r + GAP - EPS) {
      errors.push(`${name}: العلامتان متلاصقتان دون الفاصل الأدنى `
        + `(${gap.toFixed(2)} < ${(2 * ticks[0].r + GAP).toFixed(2)})`);
    }
  }

  const slots = figure.slots || [];
  if (slots.length !== ticks.length) {
    errors.push(`${name}: ${slots.length} خانةَ لمسٍ لِـ${ticks.length} علامة`);
    return errors;
  }
  for (const [i, s] of slots.entries()) {
    const t = ticks[i];
    if (s.value !== t.value || t.x < s.x - EPS || t.x > s.x + s.w + EPS) {
      errors.push(`${name}: خانةُ اللمس ${i} لا تسع علامتَها — يلمس موضعاً ويُحسَب غيرُه`);
      break;
    }
    if (s.x < -EPS || s.x + s.w > figure.view.w + EPS || s.h <= 0) {
      errors.push(`${name}: خانةُ اللمس ${i} تخرج عن صندوق الشكل`);
      break;
    }
    if (i && s.x + s.w > slots[i - 1].x + EPS) {
      errors.push(`${name}: خانتا لمسٍ متداخلتان (${i - 1} و${i})`);
      break;
    }
  }

  // **أرقامُ المرساة**: الصفرُ وطرفُ الخطّ ومضاعفاتُ الخمسة — لا رقمَ لكل علامة،
  // وإلّا صار «أين يقع؟» قراءةَ لافتةٍ لا حسَّ موضع. والقاعدةُ محسوبةٌ هنا مستقلّةً.
  const want_ = ticks.filter((t) => t.value === 0 || t.value === want || t.value % 5 === 0)
    .map((t) => t.value);
  const got = (figure.labels || []).map((l) => l.value);
  if (want_.join('،') !== got.join('،')) {
    errors.push(`${name}: أرقامُ المرساة (${got.join('، ') || 'لا شيء'}) `
      + `والمنتظَر (${want_.join('، ')})`);
  }
  for (const l of figure.labels || []) {
    if (l.text !== eastern(l.value)) {
      errors.push(`${name}: رقمُ مرساةٍ «${l.text}» والمنتظَر «${eastern(l.value)}»`);
      break;
    }
  }
  return errors;
}

// ————— ٣د) شريطُ النمط: خاناتُه طولُه، ومادّتُه ما أُعلن (الجلسة ٧) —————
//
// خمسُ حقائقَ تُقاس أعداداً: **الخاناتُ طولُ الشريط** (فلا تسقط منها واحدة) ·
// **متساويةُ التباعد** · **تُملأ من اليمين** كالإطار (جهةُ القراءة نفسُها) ·
// **وما في كل خانةٍ هو ما أُعلن** (عنصرٌ أو فراغٌ للسؤال) · **ولكلِّ عنصرٍ خانتُه**
// — فعنصرٌ في غير خانته يُري الطفلَ نمطاً غيرَ الذي بُني له.

function patternErrors(name, figure, want) {
  const errors = [];
  const cells = figure.cells || [];
  const items = figure.items || [];
  if (cells.length !== want) {
    errors.push(`${name}: رسم ${cells.length} خانةً والشريطُ ${want} `
      + '— **الخاناتُ ليست هي المقصود**');
    return errors;
  }
  if (items.length !== want) {
    errors.push(`${name}: مادّةُ الشريط ${items.length} والخاناتُ ${want}`);
    return errors;
  }
  const steps = cells.slice(1).map((c, i) => cells[i].x - c.x);
  if (steps.some((s) => s <= 0)) {
    errors.push(`${name}: الشريطُ لا يمضي إلى اليسار — والخاناتُ تُملأ من اليمين `
      + '(جهةُ ملء الإطار نفسُها، `METHOD.md §٣`)');
  } else if (Math.max(...steps) - Math.min(...steps) > 1e-6) {
    errors.push(`${name}: تباعدُ الخانات غيرُ متساوٍ — والنمطُ إيقاعٌ يُرى`);
  }
  if (cells.some((c) => Math.abs(c.y - cells[0].y) > EPS)) {
    errors.push(`${name}: خاناتُ الشريط ليست على صفٍّ واحد`);
  }
  const filled = items.filter(Boolean).length;
  if ((figure.marks || []).length !== filled) {
    errors.push(`${name}: رسم ${(figure.marks || []).length} عنصراً ومادّتُه ${filled} `
      + '— **المرسومُ ليس هو المُعلَن**');
    return errors;
  }
  if (!filled) errors.push(`${name}: شريطٌ بلا عنصرٍ واحد — لا نمطَ في فراغ`);
  let at = 0;
  for (const [i, glyph] of items.entries()) {
    if (!glyph) continue;
    const m = figure.marks[at++];
    if (m.glyph !== glyph) {
      errors.push(`${name}: الخانة ${i} أُعلنت «${glyph}» ورُسم فيها «${m.glyph}»`);
      break;
    }
    if (Math.abs(m.x - cells[i].x) > EPS || Math.abs(m.y - cells[i].y) > EPS) {
      errors.push(`${name}: عنصرُ الخانة ${i} ليس في موضعها — نمطٌ يُرى غيرَ الذي بُني`);
      break;
    }
  }
  return [...errors, ...placeErrors(name, figure.marks || [], figure.view)];
}

// ————— ٣ز) شريطُ الأرقام: **الرقمُ المرسوم هو المقصود مشرقياً** (الجلسة ك) —————
//
// مادّةُ الشريط قد تكون **أعداداً** (النمطُ العدديّ — قفزاتُ `SKIP_STEPS`)، فتُكتب في
// خانتها رقماً. وشرطُ صدقه شرطُ بطاقة الرمز نفسُه: يُقابَل ما رسمه المصيِّر بجدول
// الأرقام **المكتوب هنا مستقلاً** (`eastern`) لا بنسخةٍ عن `arNum` — فمقابلةُ نسخةٍ
// بنسختها لا تُثبت شيئاً. **ولا رقمَ مغربيّ في خانة** (ق١).

function numberStripErrors(name, figure, items) {
  const errors = [];
  for (const [i, item] of items.entries()) {
    if (typeof item !== 'number') continue;
    const drawn = (figure.items || [])[i];
    if (drawn !== eastern(item)) {
      errors.push(`${name}: الخانة ${i} طُلب فيها ${item} ورُسم «${drawn}» `
        + '— **الرقمُ المرسوم ليس هو المقصود**');
    }
    if (/[0-9]/.test(String(drawn))) {
      errors.push(`${name}: رقمٌ مغربيّ (123) في خانة شريط — والمشرقيةُ لغةُ التعليم (ق١)`);
    }
  }
  return errors;
}

/** أشرطةُ الأرقام كما يبنيها المنهج: لكلِّ قفزةٍ كلُّ طولٍ يبلغه دون سقف المستوى. */
function numberStrips() {
  const { min, max } = render.rangeOf('pattern');
  const out = [];
  for (const step of SKIP_STEPS) {
    const most = Math.min(max, Math.floor(LEVEL_MAX / step) + 1);
    for (let length = min; length <= most; length++) {
      out.push({
        step,
        items: Array.from({ length }, (_, i) => (i === length - 1 ? null : i * step)),
      });
    }
  }
  return out;
}

// ————— ٣هـ) مشهدُ القياس: يُقارَن على خطٍّ واحد (الجلستان ٧ و٨ب) —————
//
// وله وجهان، ولكلٍّ شرطُ صدقه:
//
// **مقاديرُ الشيء الواحد** (الطول): الأشياءُ عددُ المشهد · **رتبُها ١..العدد كلُّها
// مرّةً واحدة** (فلا سواءان يُسأل عن أطولهما) · **والمقدارُ يتبع الرتبة** (الأكبرُ
// رتبةً أكبرُ مقداراً — وإلّا كذب المشهدُ على عينه).
//
// **وأشياءُ مختلفة بمقدارٍ واحد** (الثِّقَلُ والزمن — الجلسة ٨ب): **مقاديرُها سواءٌ
// كلُّها** فلا يحمل الحجمُ حكماً (والحكمُ رتبةٌ في المنهج يقرؤها `check_range`)،
// **ولكلٍّ رمزُه المعلَن** ولا رمزَ مكرَّرٌ — شيئان سواءٌ لا يُسأل عن أثقلهما.
//
// **وكلاهما يقف على خطٍّ واحد** فيكون الفرقُ يُرى لا موضعاً يخدع، ويمضي إلى اليسار.

function sceneErrors(name, figure, want) {
  const errors = [];
  const marks = figure.marks || [];
  if (marks.length !== want) {
    errors.push(`${name}: في المشهد ${marks.length} شيئاً والمقصود ${want}`);
    return errors;
  }
  if (figure.items && figure.items.length) {
    const drawn = marks.map((m) => m.glyph);
    if (drawn.join('') !== figure.items.join('')) {
      errors.push(`${name}: أُعلن (${figure.items.join('، ')}) ورُسم (${drawn.join('، ')}) `
        + '— **المرسومُ ليس هو المُعلَن**');
    } else if (new Set(drawn).size !== drawn.length) {
      errors.push(`${name}: رمزٌ مكرَّر في المشهد — ولا يُسأل عن أثقل سواءين`);
    }
    if (marks.some((m) => Math.abs(m.r - marks[0].r) > EPS)) {
      errors.push(`${name}: أشياءُ المشهد بمقاديرَ مختلفة — **والحكمُ في الشيء لا في `
        + 'الحجم** (`REVIEW_SCENES.md §٦`)');
    }
    if (marks.some((m) => m.rank !== undefined)) {
      errors.push(`${name}: مشهدُ أشياءَ يرسم رتبةً — والرتبةُ بيانُ منهجٍ تُقرأ لا مقدارٌ يُرسَم`);
    }
  } else {
    const ranks = marks.map((m) => m.rank);
    const wanted = Array.from({ length: want }, (_, i) => i + 1).join('،');
    if ([...ranks].sort((a, b) => a - b).join('،') !== wanted) {
      errors.push(`${name}: الرتبُ (${ranks.join('، ')}) وليست ١..${want} كلَّها مرّةً واحدة `
        + '— ولا يُسأل «أيُّهما أطول» عن سواءين');
      return errors;
    }
    const bySize = [...marks].sort((a, b) => a.r - b.r);
    if (bySize.some((m, i) => m.rank !== i + 1)) {
      errors.push(`${name}: المقدارُ لا يتبع الرتبة — **المرسومُ ليس هو المقيس**`);
    }
  }
  const base = marks[0].y + marks[0].r;
  if (marks.some((m) => Math.abs(m.y + m.r - base) > EPS)) {
    errors.push(`${name}: الأشياءُ لا تقف على خطٍّ واحد — فالفرقُ موضعٌ يخدع لا طولٌ يُرى`);
  }
  const steps = marks.slice(1).map((m, i) => marks[i].x - m.x);
  if (steps.some((s) => s <= 0)) {
    errors.push(`${name}: المشهدُ لا يمضي إلى اليسار — وجهةُ العرض جهةُ القراءة`);
  }
  return [...errors, ...placeErrors(name, marks, figure.view)];
}

// ————— ٣ح) الشكلُ الهندسيّ: **المرسومُ هو المُعلَن، وأضلاعُه تُعَدّ** (الجلسة ش) —————
//
// المرحلة ٩ تدرّس **رسماً لا صورة** (`METHOD.md §٣`)، فشرطُ صدقها حسابيّ:
//
//   • **عددُ الأضلاع المرسومة هو المُعلَن في المنهج** (`SHAPES[].sides`): مثلثٌ ثلاثُ
//     قِطَع ومربّعٌ أربع ودائرةٌ بلا قِطعة — **وهذا هو الوصلُ بين البيان والرسم**:
//     رقمٌ يُبدَّل في المنهج بلا رسمٍ يوافقه يحمرّ هنا، فلا يُعَدّ الطفلُ ضلعين ويُقال
//     له «ثلاثة».
//   • **والمربّعُ أضلاعُه سواء، والمستطيلُ ضلعاه مختلفان**: وإلّا سُمّي المرسومُ باسم
//     غيره — وهي **المواجهةُ المقصودة** في ٩·٢، فكذبةُ الرسم فيها تهدم الدرس نفسَه.
//   • **ومنتصفُ كلِّ ضلعٍ موضعُ لمسِه** (`sides`): من رسم الضلعَ يقول أين يُلمَس،
//     فلا تحسب الشاشةُ موضعاً ثانياً يفترق عنه فيلمس الطفلُ فراغاً.
//   • **وصفُّ الأشكال يقف على خطٍّ واحد** ويمضي إلى اليسار بلا تراكب — كمشهد القياس؛
//     **وشيءُ العالم أجزاؤه تتلامس عمداً** (السقفُ على الجسم) فلا يسري عليه حدُّ
//     التلاصق، ويبقى شرطُ **ألّا يخرج جزءٌ عن صندوقه**.

function shapeErrors(name, figure, want) {
  const errors = [];
  const marks = figure.marks || [];
  if (marks.length !== want) {
    errors.push(`${name}: رسم ${marks.length} شكلاً والمقصود ${want}`);
    return errors;
  }
  const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  for (const [i, m] of marks.entries()) {
    const known = shapeOf(m.shape);
    if (!known) {
      errors.push(`${name}: الشكل ${i} صنفٌ لا يعرفه المنهج («${m.shape}»)`);
      continue;
    }
    const points = m.points || [];
    if (points.length !== known.sides) {
      errors.push(`${name}: «${m.shape}» رُسم بـ${points.length} ضلعاً والمنهجُ يعلن `
        + `${known.sides} — **المرسومُ ليس هو المُعلَن**`);
      continue;
    }
    const sides = points.map((p, at) => len(p, points[(at + 1) % points.length]));
    if (sides.some((s) => s <= EPS)) {
      errors.push(`${name}: «${m.shape}» فيه ضلعٌ بلا طول — شكلٌ لا يُرى ولا يُلمَس`);
    }
    if (m.shape === 'square' && Math.max(...sides) - Math.min(...sides) > 1e-6) {
      errors.push(`${name}: **مربّعٌ أضلاعُه غيرُ متساوية** `
        + `(${Math.min(...sides).toFixed(1)}..${Math.max(...sides).toFixed(1)}) — `
        + 'فهو مستطيلٌ سُمّي مربّعاً، وذلك هدمُ درس ٩·٢');
    }
    if (m.shape === 'rect' && Math.abs(sides[0] - sides[1]) <= 1e-6) {
      errors.push(`${name}: **مستطيلٌ ضلعاه سواء** — فهو مربّعٌ سُمّي مستطيلاً`);
    }
    if (m.shape === 'circle' && !(m.r > 0)) errors.push(`${name}: دائرةٌ بلا نصف قطر`);
    // **ومنتصفُ الضلع موضعُ لمسه**: لكلِّ ضلعٍ موضعٌ، وهو على الضلع نفسِه
    const spots = m.sides || [];
    if (spots.length !== points.length) {
      errors.push(`${name}: «${m.shape}» له ${points.length} ضلعاً و${spots.length} موضعَ لمس`);
    } else {
      for (const [at, spot] of spots.entries()) {
        const p = points[at];
        const q = points[(at + 1) % points.length];
        if (Math.abs(spot.x - (p[0] + q[0]) / 2) > EPS
          || Math.abs(spot.y - (p[1] + q[1]) / 2) > EPS) {
          errors.push(`${name}: موضعُ لمسِ الضلع ${at} ليس منتصفَه — يلمس فراغاً`);
          break;
        }
      }
    }
    /* **ولا يخرج شكلٌ عن صندوقه**: ما خرج يُقتصّ فلا يُرى ولا يُلمَس. ويُقاس
       **بصندوقه هو** لا بقرصٍ حوله: المستطيلُ عريضٌ قصير، فقرصٌ يسعه يجاوز اللوح
       وهو داخلَه (وهو ما أمسكه هذا البابُ يومَ كُتب). */
    const b = m.box;
    if (b.x < -EPS || b.y < -EPS
      || b.x + b.w > figure.view.w + EPS || b.y + b.h > figure.view.h + EPS) {
      errors.push(`${name}: «${m.shape}» يخرج عن صندوق الشكل `
        + `(${b.x.toFixed(1)}، ${b.y.toFixed(1)} — ${b.w.toFixed(1)}×${b.h.toFixed(1)})`);
    }
    const out = points.find((p) => p[0] < b.x - EPS || p[1] < b.y - EPS
      || p[0] > b.x + b.w + EPS || p[1] > b.y + b.h + EPS);
    if (out) {
      errors.push(`${name}: رأسٌ من «${m.shape}» خارج صندوقه (${out[0].toFixed(1)}، ${out[1].toFixed(1)})`);
    }
    if (m.shape === 'circle'
      && (m.cx - m.r < b.x - EPS || m.cx + m.r > b.x + b.w + EPS)) {
      errors.push(`${name}: دائرةٌ أوسعُ من صندوقها`);
    }
  }
  if (figure.thing) return errors;      // أجزاءُ الشيء تتلامس عمداً، فلا صفَّ ولا فاصل

  const base = marks[0].box.y + marks[0].box.h;
  if (marks.some((m) => Math.abs(m.box.y + m.box.h - base) > EPS)) {
    errors.push(`${name}: الأشكالُ لا تقف على خطٍّ واحد — فالفرقُ موضعٌ يخدع لا شكلٌ يُرى`);
  }
  const steps = marks.slice(1).map((m, i) => marks[i].cx - m.cx);
  if (steps.some((s) => s <= 0)) {
    errors.push(`${name}: صفُّ الأشكال لا يمضي إلى اليسار — وجهةُ العرض جهةُ القراءة`);
  }
  // **ولا يتلاصق شكلان دون الفاصل الأدنى**: حدّان متجاوران يُقرآن شكلاً واحداً
  for (let i = 0; i < marks.length; i++) {
    for (let j = i + 1; j < marks.length; j++) {
      const [a, c] = [marks[i].box, marks[j].box];
      const apart = Math.max(a.x - (c.x + c.w), c.x - (a.x + a.w));
      if (apart < GAP - EPS) {
        errors.push(`${name}: الشكلان ${i} و${j} متلاصقان دون الفاصل الأدنى `
          + `(${apart.toFixed(1)} < ${GAP})`);
      }
    }
  }
  return errors;
}

/** أشياءُ عالم الطفل كما يعلنها المنهج — مادّةُ كنسِ وجه «الأشكال حولنا». */
const worldMaterial = () => SHAPES_WORLD.map((t) => ({ id: t.id, count: t.parts.length }));

// ————— ٤) صدق الصورة: عناصرُ عالم الطفل —————

function objectErrors() {
  const errors = [];
  const files = new Set(readdirSync(fileURLToPath(EMOJI_DIR)));
  const seen = new Set();
  for (const { glyph, name } of render.OBJECTS) {
    const at = `[عنصر «${name || '؟'}»]`;
    if (!name || name.length < 3) errors.push(`${at}: بلا اسمٍ يُراجَع`);
    if (!isEmoji(glyph)) {
      errors.push(`${at}: ليس رمزاً مصوَّراً بقاعدة يونيكود — فيُسلَّم لخطّ النظام`);
      continue;
    }
    if (seen.has(glyph)) errors.push(`${at}: رمزٌ مكرَّر في القائمة`);
    seen.add(glyph);
    const file = emojiSrc(glyph).split('/').pop();
    if (!files.has(file)) {
      errors.push(`${at}: لا ملفَ Twemoji محليّ (${file}) — `
        + 'شغِّل `python3 tools/fetch_twemoji.py`');
    }
  }
  if (!render.OBJECTS.length) errors.push('[صدق الصورة] لا عنصرَ واحداً يُعَدّ');
  /* **وأشياءُ المشاهد صورٌ كسائرها** (الجلسة ٨ب): تُقارَن ولا تُعَدّ — فجدولُها
     مستقلٌّ — **وعقدُ «رسمٌ واحدٌ لكل طفل» يسري عليها**: رمزٌ في `SCENES` بلا ملفِّ
     Twemoji محليّ يُسلَّم لخطّ النظام فيراه كلُّ جهازٍ رسماً، والحكمُ بُني على رسمٍ
     رآه المدير بعينه. */
  for (const [face, table] of Object.entries(SCENES)) {
    for (const scene of table) {
      for (const { glyph, name } of scene.items) {
        const at = `[مشهد ${face} · «${name}»]`;
        if (!isEmoji(glyph)) {
          errors.push(`${at}: ليس رمزاً مصوَّراً بقاعدة يونيكود — فيُسلَّم لخطّ النظام`);
          continue;
        }
        const file = emojiSrc(glyph).split('/').pop();
        if (!files.has(file)) {
          errors.push(`${at}: لا ملفَ Twemoji محليّ (${file}) — `
            + 'شغِّل `python3 tools/fetch_twemoji.py`');
        }
      }
    }
  }
  return errors;
}

// ————— ٥) المعجم: ما يرسمه المصيِّر ⊆ ما يعرفه المنهج —————

function vocabErrors(painted, known) {
  return painted.filter((d) => !known.includes(d))
    .map((d) => `[المعجم] المصيِّر يرسم «${d}» ولا يعرفه المنهج — `
      + 'المعجمُ يملكه `curriculum.js` (`METHOD.md §١٠.١`)');
}

/**
 * وصلُ المنهج بالمصيِّر: **جبهةُ المحطة تحت مدى نمطها**.
 * الأعلى لا يُشترط (محطةٌ جبهتُها ٢٠ تستعمل إطارَ العشرة لِما دون العشرة)، وإنما
 * يُشترط **الأدنى** (محطةٌ تبلغ الصفرَ لا تستعمل نمطاً لا يرسم الصفر) و**أن يكون
 * لكلِّ محطةٍ نمطٌ يبلغ أقصاها**.
 *
 * **ولكلِّ صنفٍ مسطرتُه** (الجلسة ٤): مدى نمط الكمّية كمّياتٌ تُرسم، ومدى بطاقة الرمز
 * **رموزٌ تُقرأ** فيُقابَل بـ`numeral` في الجبهة لا بـ`max` (وهو شدٌّ لا إرخاء: محطةٌ
 * تعرض رمزاً لا يستطيعه المصيِّر تسقط هنا، ولم يكن يُقاس)، ومدى الخطّ **مداه** لا
 * كميةٌ فيه — فلا يُطالَب برسم الصفر كمّاً وهو طرفُه الأيمن أصلاً.
 */
function stationErrors(painted) {
  const errors = [];
  let sleeping = 0;
  for (const station of stations()) {
    const f = station.frontier;
    const mine = (f.displays || []).filter((d) => painted.includes(d));
    if (!mine.length) { sleeping++; continue; }
    for (const d of mine) {
      const { min, max } = render.rangeOf(d);
      const kind = render.kindOf(d);
      if (kind === 'quantity' && f.min < min) {
        errors.push(`[${station.id}] جبهتُها تبلغ ${f.min} و«${d}» لا يرسم دون ${min}`);
      }
      if (kind === 'numeral' && (f.numeral === null || f.numeral > max || f.min < min)) {
        errors.push(`[${station.id}] تعرض بطاقةَ رمزٍ وجبهتُها `
          + `${f.numeral === null ? 'بلا رمزٍ البتّة' : `تبلغ الرمزَ ${f.numeral}`} `
          + `و«${d}» يكتب [${min}..${max}] وحدَه`);
      }
      if (kind === 'line' && f.max > max) {
        errors.push(`[${station.id}] أقصى جبهتها ${f.max} و«${d}» لا يمتدّ فوق ${max}`);
      }
    }
    if (!mine.some((d) => render.rangeOf(d).max >= f.max)) {
      errors.push(`[${station.id}] أقصى جبهتها ${f.max} ولا نمطَ مرسومٌ `
        + `يبلغه (${mine.join('، ')})`);
    }
  }
  return { errors, sleeping };
}

// ————— التشغيل على المصيِّر الحيّ —————

/** مشاهدُ المنهج كلُّها بترتيب رسمٍ ممكن — مادّةُ كنسِ وجهِ الأشياء المختلفة. */
const sceneMaterial = () => Object.values(SCENES).flat()
  .map((scene) => scene.items.map((i) => i.glyph));

function sweep() {
  const errors = [];
  let figures = 0;
  let splits = 0;
  let scenes = 0;
  let strips = 0;
  const painted = render.displays();

  for (const display of painted) {
    const { min, max } = render.rangeOf(display);
    const kind = render.kindOf(display);
    for (let n = min; n <= max; n++) {
      const shapes = [];
      for (const seed of SEEDS) {
        const figure = render.plan(display, n, { seed });
        figures++;
        const name = label(display, n, seed);
        // **لكلِّ صنفٍ مسطرتُه**: الكمُّ يُعَدّ، والرمزُ يُقرأ، والخطُّ تُعَدّ علاماتُه
        if (kind === 'quantity') errors.push(...figureErrors(name, figure, n));
        if (kind === 'numeral') errors.push(...numeralErrors(name, figure, n));
        if (kind === 'line') errors.push(...lineErrors(name, figure, n));
        if (kind === 'pattern') errors.push(...patternErrors(name, figure, n));
        if (kind === 'scene') errors.push(...sceneErrors(name, figure, n));
        if (kind === 'shape') errors.push(...shapeErrors(name, figure, n));
        if (figure.frames.length) errors.push(...frameErrors(name, figure, n));
        if (display === 'dice') errors.push(...diceErrors(name, figure, n));
        if (display === 'objects' && !render.OBJECTS.some((o) => o.glyph === figure.glyph)) {
          errors.push(`${name}: رمزٌ خارج عناصر عالم الطفل («${figure.glyph}»)`);
        }
        // **الحتمية**: البذرةُ نفسُها ترسم الشكلَ نفسَه — لا جولةَ لا تُعاد كما كانت
        if (JSON.stringify(render.plan(display, n, { seed })) !== JSON.stringify(figure)) {
          errors.push(`${name}: البذرةُ نفسُها أعطت شكلاً آخر — المولّد ليس حتمياً`);
        }
        shapes.push(JSON.stringify(figure.marks));
      }
      // **والشقُّ يُقاس على كل مَشَقٍّ ممكن** (٠..العدد): الكمّيةُ تنشقّ ولا يتبدّل
      // موضعُ عنصرٍ واحد بشقّها — فما يُعَدّ هو ما يُرى مقسوماً.
      if (kind === 'quantity') {
        for (let at = 0; at <= n; at++) {
          const figure = render.plan(display, n, { seed: SEEDS[1], split: at });
          splits++;
          const name = `${label(display, n, SEEDS[1])} · شقٌّ عند ${at}`;
          errors.push(...splitErrors(name, figure, n, at));
          errors.push(...figureErrors(name, figure, n));
          if (figure.frames.length) errors.push(...frameErrors(name, figure, n));
          const plain = render.plan(display, n, { seed: SEEDS[1] });
          if (JSON.stringify(figure.marks.map(({ part, ...m }) => m))
            !== JSON.stringify(plain.marks)) {
            errors.push(`${name}: الشقُّ حرّك مواضعَ العناصر — والقسمةُ كسوةٌ لا رسمٌ ثانٍ`);
          }
        }
      }

      const distinct = new Set(shapes).size;
      const jitters = display === 'scatter' || display === 'objects';
      if (jitters && n >= 2 && distinct < 2) {
        errors.push(`[${display} · ${n}] توزيعٌ واحدٌ لكل البذور — `
          + 'والمبعثرُ يتبدّل لئلا تُحفَظ الصورة (`METHOD.md §٢.٣`)');
      }
      if (!jitters && distinct > 1) {
        errors.push(`[${display} · ${n}] الشكلُ يتزحزح بتبدّل البذرة — `
          + 'والنردُ والإطارُ ثابتان ليصيرا صورةً ذهنية (`METHOD.md §٣`)');
      }
    }
  }

  /* **واللوحُ ذو السَّعة يُكنَس بكل سَعةٍ يبلغها لوحُ التسوية** (الجلسة م٥): من صفرٍ
     إلى السَّعة، فيُثبَت أنّ كلَّ عددٍ أوائلُ ما فوقه — وهو أثرُ `room` المقيس. */
  let rooms = 0;
  for (const display of ['scatter', 'objects']) {
    for (const room of [5, 7, 10]) {
      for (const seed of SEEDS.slice(0, 3)) {
        rooms++;
        errors.push(...roomErrors(display, room, seed));
      }
    }
  }
  // **والسَّعةُ تُرمى حيث لا معنى لها أو حيث تضيق** — ولا تُبتلَع صامتة
  for (const [call, why] of [
    [() => render.plan('ten-frame', 3, { room: 10 }), 'نمطٌ مواضعُه ثابتة'],
    [() => render.plan('dice', 3, { room: 6 }), 'وجهُ النرد صورةُ عدده'],
    [() => render.plan('scatter', 7, { seed: 1, room: 5 }), 'سَعةٌ أضيقُ من عددها'],
    [() => render.plan('scatter', 3, { seed: 1, room: 2.5 }), 'سَعةٌ ليست عدداً صحيحاً'],
  ]) {
    let threw = false;
    try { call(); } catch { threw = true; }
    if (!threw) errors.push(`[سَعة] مرّت بلا اعتراض: ${why}`);
  }

  /* **ووجهُ الأشياء المختلفة يُكنَس بمشاهد المنهج نفسِها** (الجلسة ٨ب): كلُّ مشهدٍ
     في `SCENES` يُرسَم بكل ترتيبٍ يمكن أن تقرعه الشاشةُ (دوراتُه)، فيُقابَل المرسومُ
     بالمُعلَن رمزاً رمزاً — والحكمُ لا يقع في الحجم لأنّ المقاديرَ سواءٌ كلُّها. */
  for (const items of sceneMaterial()) {
    for (let turn = 0; turn < items.length; turn++) {
      const order = [...items.slice(turn), ...items.slice(0, turn)];
      const figure = render.plan('scene', order.length, { seed: turn * 13 + 3, items: order });
      scenes++;
      errors.push(...sceneErrors(`[مشهد ${order.join('')}]`, figure, order.length));
    }
  }
  /* **وشريطُ الأرقام يُكنَس بقفزات المنهج نفسِها** (الجلسة ك): كلُّ قفزةٍ بكل طولٍ
     يبلغه، فيُقابَل رقمُ كل خانةٍ بالمرسوم فيها — وخانةُ السؤال تبقى فارغةً تُعلن فراغها. */
  for (const { step, items } of numberStrips()) {
    const figure = render.plan('pattern', items.length, { seed: step * 7 + items.length, items });
    strips++;
    const name = `[شريطُ أرقامٍ بقفزة ${step} · ${items.length} خانة]`;
    errors.push(...patternErrors(name, figure, items.length));
    errors.push(...numberStripErrors(name, figure, items));
  }
  // **ومادّةُ الشريط رمزُ عالمٍ أو عددٌ في مدى بطاقة الرمز** — وما سواه يُرمى لا يُقرَّب
  for (const [bad, why] of [
    [[0, LEVEL_MAX + 10, null], 'عددٌ فوق مدى بطاقة الرمز في خانة'],
    [[0, 1.5, null], 'كسرٌ في خانة'],
    [[0, -2, null], 'عددٌ سالب في خانة'],
    [[0, true, null], 'ما ليس عدداً ولا رمزاً في خانة'],
  ]) {
    if (!throws(() => render.plan('pattern', 3, { items: bad }))) {
      errors.push(`[شريطُ الأرقام] قَبِل ما لا يجوز: ${why}`);
    }
  }

  // **ولا يُرسَم في مشهدٍ رمزٌ خارج جدول المنهج، ولا رمزان سواء، ولا رتبةٌ معه**
  const some = sceneMaterial()[0];
  for (const [bad, why] of [
    [{ items: [some[0], '🛸'] }, 'رمزٌ خارج جدول مشاهد المنهج'],
    [{ items: [some[0], some[0]] }, 'رمزٌ مكرَّرٌ في مشهدٍ واحد'],
    [{ items: [...some], ranks: some.map((_, i) => i + 1) }, 'رتبٌ مع رموزٍ في مشهدٍ واحد'],
    [{ items: [some[0]] }, 'مادّةٌ لا تطابق العدد'],
  ]) {
    if (!throws(() => render.plan('scene', some.length, { ...bad }))) {
      errors.push(`[المشاهد] قَبِل ما لا يجوز: ${why}`);
    }
  }
  if (!throws(() => render.plan('objects', 2, { items: [some[0], some[1]] }))) {
    errors.push('[المشاهد] كمّيةٌ قَبِلت مادّةَ مشهدٍ — ولا رموزَ لِما يُعَدّ');
  }

  /* **وأشكالُ المنهج تُكنَس بكل صفٍّ وكلِّ شيءٍ من عالم الطفل** (الجلسة ش): كلُّ
     صنفٍ مفرداً في بطاقته (فبطاقاتُ الجواب منها)، وكلُّ شيءٍ بأجزائه المعلَنة —
     فيُقابَل عددُ الأضلاع المرسومة بما يعلنه المنهج في كل موضعٍ يراه الطفل. */
  let shapes = 0;
  for (const kind of SHAPES) {
    const figure = render.plan('shape', 1, { seed: 5, shapes: [kind.id] });
    shapes++;
    errors.push(...shapeErrors(`[شكل ${kind.id}]`, figure, 1));
  }
  for (const size of [2, 3, 4]) {
    const kinds = SHAPES.slice(0, size).map((s) => s.id);
    const figure = render.plan('shape', size, { seed: size * 11, shapes: kinds });
    shapes++;
    errors.push(...shapeErrors(`[صفُّ ${kinds.join('،')}]`, figure, size));
  }
  for (const { id, count } of worldMaterial()) {
    const figure = render.plan('shape', count, { seed: 3, thing: id });
    shapes++;
    errors.push(...shapeErrors(`[شيءُ ${id}]`, figure, count));
    // **وأجزاؤه من جدول المنهج بترتيبها** — لا يخترع الرسّامُ جزءاً ولا يُسقِط جزءاً
    const want = SHAPES_WORLD.find((t) => t.id === id).parts.map((p) => p.shape);
    if (figure.shapes.join('|') !== want.join('|')) {
      errors.push(`[شيءُ ${id}]: أعلن (${figure.shapes.join('، ')}) والمنهجُ `
        + `(${want.join('، ')}) — **المرسومُ ليس هو المُعلَن**`);
    }
  }
  // **ومادّةُ الأشكال تُرمى ولا تُقرَّب**: صنفٌ لا يعرفه المنهج أو شيءٌ لا وجودَ له
  for (const [call, why] of [
    [() => render.plan('shape', 2, { shapes: ['circle', 'hexagon'] }), 'صنفٌ خارج أشكال المنهج'],
    [() => render.plan('shape', 2, { shapes: ['circle'] }), 'مادّةٌ لا توافق العدد'],
    [() => render.plan('shape', 1, { thing: 'castle' }), 'شيءٌ خارج جدول عالم المنهج'],
    [() => render.plan('shape', 2, { thing: SHAPES_WORLD[0].id }), 'عددٌ ليس عددَ أجزائه'],
    [() => render.plan('shape', 1, { shapes: ['circle'], thing: SHAPES_WORLD[0].id }),
      'شيءٌ وصفُّ أشكالٍ في لوحٍ واحد'],
    [() => render.plan('scene', 2, { shapes: ['circle', 'square'] }), 'أشكالٌ لنمطٍ لا يرسمها'],
    [() => render.plan('numeral', 1, { thing: SHAPES_WORLD[0].id }), 'شيءُ عالمٍ لبطاقة رمز'],
  ]) {
    let threw = false;
    try { call(); } catch { threw = true; }
    if (!threw) errors.push(`[الأشكال] مرّت بلا اعتراض: ${why}`);
  }

  // **خارجَ المدى يُرمى لا يُقرَّب**: كميةٌ لا يستطيع النمطُ رسمَها خطأُ برمجةٍ يصرخ
  for (const display of painted) {
    const { min, max } = render.rangeOf(display);
    for (const bad of [min - 1, max + 1, 1.5, NaN]) {
      if (!throws(() => render.plan(display, bad))) {
        errors.push(`[${display}] قَبِل العدد ${bad} وهو خارج [${min}..${max}]`);
      }
    }
  }
  if (!throws(() => render.plan('hologram', 1))) errors.push('[المصيِّر] قَبِل نمطاً لا يعرفه');
  if (!throws(() => render.plan('objects', 3, { glyph: 'x' }))) {
    errors.push('[صدق الصورة] قَبِل رمزاً خارج عناصر عالم الطفل');
  }
  // **ولا يُشَقّ ما ليس كمّاً، ولا جزءٌ يجاوز كلَّه** — والطلبُ خطأُ برمجةٍ يصرخ
  for (const display of painted) {
    const { max } = render.rangeOf(display);
    const quantity = render.kindOf(display) === 'quantity';
    for (const bad of [-1, max + 1, 1.5]) {
      if (!throws(() => render.plan(display, max, { split: bad }))) {
        errors.push(`[${display}] قَبِل شقّاً عند ${bad} وهو خارج الكمّية ${max}`);
      }
    }
    if (!quantity && !throws(() => render.plan(display, max, { split: 1 }))) {
      errors.push(`[${display}] قَبِل شقّاً وهو لا يُعَدّ عناصرَ — لا يُقسَم ما ليس كمّاً`);
    }
  }
  return { errors, figures, splits, scenes, strips, rooms, shapes };
}

const throws = (fn) => { try { fn(); return false; } catch { return true; } };

function check() {
  let fails = 0;
  let asleep = 0;

  const door = (title, errors, ok) => {
    console.log(`\n— ${title} —`);
    for (const e of errors.slice(0, 12)) console.log('  ✗', e);
    if (errors.length > 12) console.log(`  … و${errors.length - 12} خطأً آخر`);
    if (!errors.length) console.log('  ✓', ok);
    fails += errors.length;
  };
  const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

  const painted = render.displays();
  const { errors, figures, splits, scenes, strips, rooms, shapes } = sweep();
  const covered = painted.map((d) => render.rangeOf(d));

  const byKind = (kind) => painted.filter((d) => render.kindOf(d) === kind);
  door('١) المرسومُ هو المقصود — كمّاً يُعَدّ ورمزاً يُقرأ وخطّاً يمتدّ وشريطاً يتكرّر',
    errors,
    `${figures} شكلاً و${splits} شقّاً و${scenes} مشهدَ أشياءَ حقيقية `
    + `و${strips} شريطَ أرقامٍ بقفزات المنهج `
    + `(${painted.length} نمطاً × مداه × ${SEEDS.length} بذور): `
    + `${byKind('quantity').length} نمطَ كمّيةٍ رسم عددَه بلا تراكبٍ ولا خروجٍ عن صندوقه `
    + `وانشقّ شقّين بترتيب رسمه، `
    + `و${byKind('numeral').length} بطاقةَ رمزٍ كتبت رقمَها المشرقيّ، `
    + `و${byKind('line').length} خطّاً علاماتُه مدىً وواحدةً متساويةَ التباعد من اليمين، `
    + `و${byKind('pattern').length} شريطَ نمطٍ خاناتُه طولُه ومادّتُه ما أُعلن `
    + '(رمزاً كان أو رقماً مشرقياً)، '
    + `و${byKind('scene').length} مشهدَ قياسٍ مقاديرُه تتبع رتبَها على خطٍّ واحد، `
    + '**وأشياءُ المشاهد الحقيقية سواءٌ في الحجم** فلا حكمَ فيه، '
    + `و${rooms} لوحاً ذا سَعةٍ **ينمو وينقص في مكانه** فلا يزحزح ما زاد ما بقي، `
    + `و${shapes} لوحَ أشكالٍ **أضلاعُها المرسومة هي التي يعلنها المنهج** `
    + `(${SHAPES.map((s) => `${s.name}: ${s.sides}`).join(' · ')})`);

  const sceneGlyphs = Object.values(SCENES).flat().flatMap((s) => s.items);
  door('٢) صدق الصورة: عناصرُ عالم الطفل وأشياءُ المشاهد من Twemoji المحلية',
    objectErrors(),
    `${render.OBJECTS.length} عنصراً معدوداً، لكلٍّ ملفُّه المحليّ واسمُه: `
    + render.OBJECTS.map((o) => o.name).join('، ')
    + `؛ و${sceneGlyphs.length} شيئاً في المشاهد تُقارَن ولا تُعَدّ: `
    + sceneGlyphs.map((i) => i.name).join('، '));

  door('٣) المعجم: ما يرسمه المصيِّر يعرفه المنهج',
    vocabErrors(painted, DISPLAYS),
    `${painted.length} من ${DISPLAYS.length} نمطاً في معجم المنهج، `
    + `والمدى يبلغ ${Math.max(...covered.map((c) => c.max))} (سقفُ المستوى ${LEVEL_MAX})`);

  const bounds = stationErrors(painted);
  door('٤) الوصل: لكل محطةٍ نمطٌ يبلغ جبهتَها',
    bounds.errors,
    `${stations().length - bounds.sleeping} محطةً جبهتُها تحت مدى أنماطها`);

  console.log('\n— تغطيةُ المعجم —');
  const waiting = DISPLAYS.filter((d) => !painted.includes(d));
  if (waiting.length) {
    dormant(`${waiting.length} نمطاً في المنهج بلا رسّامٍ بعد (${waiting.join('، ')})`);
  } else {
    console.log('  ✓', 'لكل نمطٍ في معجم المنهج رسّامُه');
  }
  if (bounds.sleeping) {
    dormant(`${bounds.sleeping} محطةً لا نمطَ مرسومٌ في جبهتها بعد`);
  }
  if (Math.max(...covered.map((c) => c.max)) < LEVEL_MAX) {
    fails++;
    console.log('  ✗', `أقصى ما يرسمه المصيِّر دون سقف المستوى (${LEVEL_MAX})`);
  }

  console.log(fails
    ? `\n${fails} فشل`
    : `\nكلُّ كميةٍ يرسمها المصيِّر هي العددُ المقصود${asleep
      ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
  return fails ? 1 : 0;
}

// ————— فحصُ الفاحص: **مُجرَّبٌ سالباً** —————
//
// لا يُصدَّق حارسٌ لم يُرَ وهو يمسك. فتُصنَع المخالفاتُ من **أشكال المصيِّر الحيّة**
// (نسخةٌ تُعبَث بها) ويُطالَب الفاحصُ بأن يمسك كلَّ واحدة — فإذا رقّ يوماً تحت هندسةٍ
// تحرّكت تحته، سقط هنا لا في جهاز طفل.

function selfTest() {
  let fails = 0;
  const ok = (cond, msg) => {
    if (cond) console.log('  ✓', msg);
    else { fails++; console.log('  ✗', msg); }
  };
  const broke = (figure, mutate) => {
    const copy = structuredClone(figure);
    mutate(copy);
    return copy;
  };
  const found = (rows, needle) => rows.some((row) => row.includes(needle));

  console.log('\n— المصيِّر الحيّ يمرّ نظيفاً —');
  const scatter = render.plan('scatter', 7, { seed: 3 });
  const ten = render.plan('ten-frame', 7);
  const two = render.plan('two-frames', 13);
  const die = render.plan('dice', 5);
  ok(!figureErrors('ش', scatter, 7).length, 'المبعثر: سبعةٌ بلا تراكب');
  ok(!figureErrors('ش', ten, 7).length && !frameErrors('ش', ten, 7).length,
    'وإطارُ العشرة: سبعةٌ في خاناتها من اليمين');
  ok(!figureErrors('ش', two, 13).length && !frameErrors('ش', two, 13).length,
    'وإطارا العشرة: ثلاثةَ عشرَ — عشرةٌ في الأيمن وثلاثةٌ في الذي يليه');
  ok(!diceErrors('ش', die, 5).length, 'والنرد: خمسةٌ على التوزيع القياسيّ');
  ok(!objectErrors().length, 'وعناصرُ عالم الطفل: لكلٍّ ملفُّه المحليّ');

  console.log('\n— ١) الشكل: يُمسَك نقصُ العدد وزيادتُه —');
  ok(found(figureErrors('ش', broke(scatter, (f) => f.marks.pop()), 7), 'ليس هو المقصود'),
    'عنصرٌ ساقطٌ من الرسم يُمسَك (رسم ٦ والمقصود ٧)');
  ok(found(figureErrors('ش', broke(scatter, (f) => f.marks.push({ ...f.marks[0] })), 7),
    'ليس هو المقصود'),
  'وعنصرٌ مكرَّرٌ يُمسَك');
  ok(found(figureErrors('ش', broke(scatter, (f) => { f.marks[1] = { ...f.marks[0] }; }), 7),
    'متراكبان'),
  'وعنصران على موضعٍ واحد يُمسَكان (كميةٌ لا تُعَدّ)');
  ok(found(figureErrors('ش', broke(scatter, (f) => {
    f.marks[1] = { ...f.marks[0], x: f.marks[0].x + 2 * R + GAP / 2 };
  }), 7), 'متلاصقان'),
  'وعنصران متلاصقان دون الفاصل الأدنى يُمسَكان (يفشل التقديرُ الفوريّ)');
  ok(found(figureErrors('ش', broke(scatter, (f) => { f.marks[0].x = f.view.w - 2; }), 7),
    'يخرج عن صندوق'),
  'وعنصرٌ يخرج عن صندوق الشكل يُمسَك (يُقتصّ فلا يُعَدّ)');

  console.log('\n— ٢) الإطارات: يُمسَك الملءُ من غير اليمين —');
  ok(found(frameErrors('ش', broke(ten, (f) => {
    for (const m of f.marks) m.x = f.view.w - m.x;
  }), 7), 'الملء من اليمين'),
  'إطارٌ انقلب ملؤه إلى اليسار يُمسَك (الثباتُ شرطُ الصورة الذهنية)');
  ok(found(frameErrors('ش', broke(ten, (f) => { f.marks.reverse(); }), 7), 'الملء من اليمين'),
    'وملءٌ يبدأ من آخر الترتيب يُمسَك');
  ok(found(frameErrors('ش', broke(ten, (f) => { f.marks[3] = { ...f.cells[9], r: R }; }), 7),
    'الملء من اليمين'),
  'وقفزٌ إلى خانةٍ بعيدة قبل ما قبلها يُمسَك');
  ok(found(frameErrors('ش', broke(two, (f) => {
    f.marks = f.cells.slice(10, 23).map((c) => ({ ...c, r: R }));
  }), 13), 'الملء من اليمين'),
  'وإطاران بدأ ملؤهما من الأيسر يُمسَكان (الحزمةُ التامّة تُرى أولاً)');

  console.log('\n— ٢ب) الشقّ: يُمسَك ما لم يُقسَم كما قيل —');
  const split = render.plan('ten-frame', 7, { split: 5 });
  const spread = render.plan('scatter', 7, { seed: 3, split: 3 });
  ok(!splitErrors('ش', split, 7, 5).length && !splitErrors('ش', spread, 7, 3).length,
    'سبعةٌ تنشقّ خمسةً واثنين — في الإطار وفي المبعثر');
  ok(found(splitErrors('ش', broke(split, (f) => { f.marks[4].part = 'b'; }), 7, 5),
    'ليس هو المقسوم'),
  '**وشقٌّ رسم أربعةً والمقصودُ خمسة يُمسَك** (المرسومُ ليس هو المقسوم)');
  ok(found(splitErrors('ش', broke(split, (f) => {
    f.marks[1].part = 'b'; f.marks[6].part = 'a';
  }), 7, 5), 'مختلطان'),
  'وشقّان مختلطان في ترتيب الرسم يُمسَكان (العدُّ أمام الطفل يمشي على الترتيب)');
  ok(found(splitErrors('ش', broke(split, (f) => { delete f.marks[0].part; }), 7, 5),
    'بلا شقٍّ مُعلَن'),
  'وعنصرٌ بلا شقٍّ يُمسَك');
  ok(throws(() => render.plan('numeral', 7, { split: 3 }))
    && throws(() => render.plan('line', 7, { split: 3 })),
  '**ولا يُشَقّ ما ليس كمّاً**: بطاقةُ رمزٍ وخطُّ أعدادٍ يرميان الطلب');
  ok(throws(() => render.plan('ten-frame', 7, { split: 8 }))
    && throws(() => render.plan('ten-frame', 7, { split: -1 })),
  'وجزءٌ يجاوز كلَّه يُرمى ولا يُقرَّب');

  console.log('\n— ٢ج) السَّعة: يُمسَك لوحٌ يزحزح ما بقي —');
  ok(!roomErrors('scatter', 5, 3).length && !roomErrors('objects', 7, 11).length,
    'لوحٌ بسَعةٍ ينمو من صفرٍ إلى سَعته ولا يتحرّك عنصرٌ رُسم قبلُ');
  ok(roomErrors('scatter', 5, 3).length === 0
    && (() => {
      // **والبابُ يُجرَّب سالباً بلوحٍ بلا سَعة**: شبكتُه من عدده، فيقفز كلُّ شيءٍ
      // بلمسةٍ واحدة — وهو الحالُ الذي وُجد هذا الباب له.
      let moved = 0;
      let before = null;
      for (let n = 0; n <= 5; n++) {
        const marks = render.plan('scatter', n, { seed: 3 }).marks;
        if (before && JSON.stringify(marks.slice(0, before.length)) !== JSON.stringify(before)) moved++;
        before = marks;
      }
      return moved > 0;
    })(),
  '**ولوحٌ بلا سَعةٍ يزحزح ما بقي فعلاً** — فالبابُ يقيس فرقاً واقعاً لا يصدّق دعوى');
  ok(throws(() => render.plan('ten-frame', 3, { room: 10 }))
    && throws(() => render.plan('dice', 3, { room: 6 })),
  'وسَعةٌ تُطلَب لنمطٍ مواضعُه ثابتةٌ تُرمى (لا تُبتلَع صامتة)');
  ok(throws(() => render.plan('scatter', 7, { seed: 1, room: 5 }))
    && throws(() => render.plan('scatter', 3, { seed: 1, room: 2.5 })),
  'وسَعةٌ أضيقُ من عددها أو ليست عدداً صحيحاً تُرمى');

  console.log('\n— ٣) النرد: يُمسَك ما ليس بالتوزيع القياسيّ —');
  ok(found(diceErrors('ش', broke(die, (f) => { f.marks[0].x += 4; }), 5), 'خارج شبكة النرد'),
    'نقطةٌ زاحت عن شبكة ٣×٣ تُمسَك');
  ok(found(diceErrors('ش', broke(die, (f) => {
    f.marks[0] = { ...f.marks[0], x: f.marks[2].x, y: f.marks[0].y };
  }), 5), 'ليس القياسيّ'),
  'ووجهٌ على الشبكة وليس بالتوزيع القياسيّ يُمسَك (لا يُخترع نردٌ آخر)');
  ok(found(diceErrors('ش', render.plan('dice', 4), 5), 'ليس القياسيّ'),
    'ووجهُ أربعةٍ مكان خمسةٍ يُمسَك');

  console.log('\n— ٣ب) بطاقةُ الرمز: يُمسَك رقمٌ ليس هو المقصود —');
  const seven = render.plan('numeral', 7);
  const tenCard = render.plan('numeral', 10);
  ok(!numeralErrors('ش', seven, 7).length && !numeralErrors('ش', tenCard, 10).length,
    'بطاقتا ٧ و١٠ تكتبان رقمَهما المشرقيّ');
  ok(found(numeralErrors('ش', seven, 8), 'ليس هو المقصود'),
    'ورمزٌ في بطاقة عددٍ آخر يُمسَك (٧ مكان ٨)');
  ok(found(numeralErrors('ش', broke(tenCard, (f) => { f.text = '٠١'; }), 10), 'ليس هو المقصود'),
    'ورقمٌ منكوسُ المنازل يُمسَك (٠١ مكان ١٠)');
  ok(found(numeralErrors('ش', broke(seven, (f) => { f.text = '7'; }), 7), 'رقمٌ مغربيّ'),
    'ورقمٌ مغربيّ (123) في بطاقة رمزٍ يُمسَك (ق١)');
  ok(found(numeralErrors('ش', broke(seven, (f) => { f.marks.push({ x: 1, y: 1, r: R }); }), 7),
    'يُقرأ ولا يُعَدّ'),
  'وبطاقةُ رمزٍ فيها عناصرُ كمّيةٍ تُعَدّ تُمسَك');

  console.log('\n— ٣ج) خطُّ الأعداد: يُمسَك النقصُ والانقلابُ والانزياح —');
  const rail = render.plan('line', 10);
  const rail20 = render.plan('line', 20);
  ok(!lineErrors('ش', rail, 10).length && !lineErrors('ش', rail20, 20).length,
    'خطّا العشرة والعشرين نظيفان (العلاماتُ مدىً وواحدة، والصفرُ يمنة)');
  ok(found(lineErrors('ش', broke(rail, (f) => { f.ticks.pop(); }), 10), 'ليست هي المقصود'),
    'وعلامةٌ ساقطةٌ من الخطّ تُمسَك');
  ok(found(lineErrors('ش', broke(rail, (f) => {
    for (const t of f.ticks) t.x = f.view.w - t.x;
  }), 10), 'الصفرُ على اليمين'),
  'وخطٌّ انقلب فصار الصفرُ يساراً يُمسَك (جهةُ ملء الإطار نفسُها)');
  ok(found(lineErrors('ش', broke(rail, (f) => { f.ticks[3].x -= 9; }), 10), 'غيرُ متساوٍ'),
    'وعلامةٌ انزاحت فاختلّ التباعد تُمسَك (المسافةُ معنىً)');
  ok(found(lineErrors('ش', broke(rail, (f) => { f.slots[4].x -= 40; }), 10), 'لا تسع علامتَها'),
    'وخانةُ لمسٍ زاحت عن علامتها تُمسَك (يلمس موضعاً ويُحسَب غيرُه)');
  ok(found(lineErrors('ش', broke(rail, (f) => { f.slots[4].w *= 2.5; }), 10), 'متداخلتان'),
    'وخانتا لمسٍ متداخلتان تُمسَكان');
  ok(found(lineErrors('ش', broke(rail, (f) => {
    f.labels = f.ticks.map((t) => ({ ...t, text: String(t.value) }));
  }), 10), 'أرقامُ المرساة'),
  'ورقمٌ فوق كلِّ علامةٍ يُمسَك — «أين يقع؟» حسُّ موضعٍ لا قراءةُ لافتة');

  console.log('\n— ٣د) شريطُ النمط: يُمسَك ما خالف مادّتَه أو إيقاعَه —');
  const strip = render.plan('pattern', 5, { seed: 1 });
  const trio = render.plan('pattern', 7, {
    items: [render.OBJECTS[0].glyph, render.OBJECTS[1].glyph, render.OBJECTS[2].glyph,
      render.OBJECTS[0].glyph, render.OBJECTS[1].glyph, render.OBJECTS[2].glyph, null],
  });
  ok(!patternErrors('ش', strip, 5).length && !patternErrors('ش', trio, 7).length,
    'شريطا (أ ب أ ب ؟) و(أ ب ج أ ب ج ؟) نظيفان — خاناتُهما طولُهما ومادّتُهما ما أُعلن');
  ok(found(patternErrors('ش', broke(strip, (f) => { f.cells.pop(); }), 5),
    'ليست هي المقصود'),
  'وخانةٌ ساقطةٌ من الشريط تُمسَك');
  ok(found(patternErrors('ش', broke(strip, (f) => { f.marks[1].glyph = f.items[0]; }), 5),
    'ورُسم فيها'),
  '**وعنصرٌ رُسم غيرَ ما أُعلن في خانته يُمسَك** (نمطٌ يُرى غيرَ الذي بُني)');
  ok(found(patternErrors('ش', broke(strip, (f) => { f.marks[1].x = f.marks[0].x; }), 5),
    'ليس في موضعها'),
  'وعنصرٌ زاح عن خانته يُمسَك');
  ok(found(patternErrors('ش', broke(strip, (f) => {
    for (const c of f.cells) c.x = f.view.w - c.x;
  }), 5), 'إلى اليسار'),
  'وشريطٌ انقلب فصارت أولى خاناته يساراً يُمسَك (جهةُ ملء الإطار نفسُها)');
  ok(found(patternErrors('ش', broke(strip, (f) => { f.cells[2].x -= 9; }), 5), 'غيرُ متساوٍ'),
    'وخانةٌ انزاحت فاختلّ الإيقاع تُمسَك (النمطُ إيقاعٌ يُرى)');
  ok(throws(() => render.plan('pattern', 5, { items: [null, null, null, null] }))
    && throws(() => render.plan('pattern', 5, { items: [null, null, null, null, 'x'] })),
  'ومادّةٌ لا توافق الطولَ أو فيها رمزٌ خارج عناصر عالم الطفل تُرمى ولا تُقرَّب');
  ok(throws(() => render.plan('ten-frame', 5, { items: [null] })),
    'ولا مادّةَ خاناتٍ لِما ليس شريطَ نمط');

  console.log('\n— ٣ز) شريطُ الأرقام: يُمسَك رقمٌ ليس هو المقصود (الجلسة ك) —');
  const jump = SKIP_STEPS[SKIP_STEPS.length - 1];        // أكبرُ قفزة: ٠ · القفزة · سؤال
  const numItems = [0, jump, null];
  const numStrip = render.plan('pattern', numItems.length, { seed: 5, items: numItems });
  ok(!patternErrors('ش', numStrip, numItems.length).length
    && !numberStripErrors('ش', numStrip, numItems).length,
  `شريطُ أرقامٍ بقفزة ${jump} نظيف — خاناتُه طولُه وأرقامُه مشرقيةٌ بمقاديرها`);
  ok(found(numberStripErrors('ش', broke(numStrip, (f) => { f.items[1] = '٩٩'; }), numItems),
    'ليس هو المقصود'),
  '**ورقمٌ رُسم غيرَ ما طُلب في خانته يُمسَك** (٩٩ مكان القفزة)');
  ok(found(numberStripErrors('ش', broke(numStrip, (f) => { f.items[1] = String(jump); }),
    numItems), 'رقمٌ مغربيّ'),
  'ورقمٌ مغربيّ (123) في خانةٍ يُمسَك (ق١)');
  ok(found(patternErrors('ش', broke(numStrip, (f) => { f.marks[1].glyph = '٧'; }),
    numItems.length), 'ورُسم فيها'),
  'وخانةٌ أُعلنت رقماً ورُسم فيها غيرُه تُمسَك (شريطٌ يُرى غيرَ الذي بُني)');
  ok(throws(() => render.plan('pattern', 3, { items: [0, LEVEL_MAX + 1, null] }))
    && throws(() => render.plan('pattern', 3, { items: [0, 1.5, null] }))
    && throws(() => render.plan('pattern', 3, { items: [0, -1, null] })),
  `وعددٌ فوق مدى بطاقة الرمز (${LEVEL_MAX}) أو كسرٌ أو سالبٌ في خانةٍ يُرمى ولا يُقرَّب`);
  ok(numberStrips().length >= SKIP_STEPS.length,
    `وقفزاتُ المنهج كلُّها مكنوسةٌ بأطوالها (${numberStrips().length} شريطاً من `
    + `${SKIP_STEPS.length} قفزات)`);

  console.log('\n— ٣هـ) مشهدُ القياس: يُمسَك ما كذب على العين —');
  const pair = render.plan('scene', 2, { seed: 4 });
  const three = render.plan('scene', 3, { seed: 5, ranks: [2, 3, 1] });
  ok(!sceneErrors('ش', pair, 2).length && !sceneErrors('ش', three, 3).length,
    'مشهدا شيئين وثلاثةٍ نظيفان — المقدارُ يتبع الرتبة والكلُّ على خطٍّ واحد');
  ok(found(sceneErrors('ش', broke(pair, (f) => { f.marks[0].r = f.marks[1].r / 2; }), 2),
    'ليس هو المقيس'),
  '**ومقدارٌ لا يتبع رتبتَه يُمسَك** (الأصغرُ رسماً يُسمّى الأكبر)');
  ok(found(sceneErrors('ش', broke(pair, (f) => { f.marks[1].rank = f.marks[0].rank; }), 2),
    'سواءين'),
  'ورتبتان متساويتان تُمسَكان (لا يُسأل «أيُّهما أطول» عن سواءين)');
  ok(found(sceneErrors('ش', broke(pair, (f) => { f.marks[1].y -= 20; }), 2), 'خطٍّ واحد'),
    'وشيءٌ رُفع عن خطّ الأرض يُمسَك (الفرقُ موضعٌ يخدع لا طولٌ يُرى)');
  ok(found(sceneErrors('ش', broke(pair, (f) => {
    const [a, b] = f.marks; f.marks = [b, a];
  }), 2), 'إلى اليسار'),
  'ومشهدٌ انقلب فمضى إلى اليمين يُمسَك');
  ok(throws(() => render.plan('scene', 3, { ranks: [1, 1, 2] }))
    && throws(() => render.plan('scene', 3, { ranks: [1, 2] }))
    && throws(() => render.plan('objects', 3, { ranks: [1, 2, 3] })),
  'ورتبٌ مكرَّرةٌ أو ناقصةٌ أو على نمطٍ لا يُقارَن مقدارُه تُرمى');

  console.log('\n— ٣و) مشهدُ الأشياء المختلفة: **لا حكمَ في الحجم** (الجلسة ٨ب) —');
  const real = sceneMaterial()[0];
  const seq = sceneMaterial().find((s) => s.length === 3) || real;
  const things = render.plan('scene', real.length, { seed: 2, items: real });
  const trioScene = render.plan('scene', seq.length, { seed: 6, items: seq });
  ok(!sceneErrors('ش', things, real.length).length
    && !sceneErrors('ش', trioScene, seq.length).length,
  `مشهدا ${real.join('')} و${seq.join('')} نظيفان — أشياءُ مختلفة بمقدارٍ واحد على خطٍّ واحد`);
  ok(found(sceneErrors('ش', broke(things, (f) => { f.marks[0].r /= 2; }), real.length),
    'الحكمُ في الشيء لا في'),
  '**ومشهدٌ رسم شيئاً أصغرَ من أخيه يُمسَك** — لو حمل الحجمُ حكماً لَعاد القياسُ حجماً');
  ok(found(sceneErrors('ش', broke(things, (f) => { f.marks[1].glyph = f.marks[0].glyph; }),
    real.length), 'المرسومُ ليس هو المُعلَن'),
  '**ورمزٌ رُسم غيرَ ما أُعلن يُمسَك** — والشاشةُ تحكم بما قرأت من الرسم');
  ok(found(sceneErrors('ش', broke(things, (f) => {
    f.marks[0].glyph = f.marks[1].glyph; f.items[0] = f.items[1];
  }), real.length), 'مكرَّر'),
  'ورمزان سواءٌ في مشهدٍ واحد يُمسَكان (لا يُسأل عن أثقلهما)');
  ok(found(sceneErrors('ش', broke(things, (f) => { f.marks[0].rank = 1; }), real.length),
    'بيانُ منهجٍ تُقرأ'),
  'ورتبةٌ رُسمت في مشهد أشياءَ تُمسَك — الرتبةُ تُقرأ من المنهج ولا تُرسَم');
  ok(found(sceneErrors('ش', broke(things, (f) => { f.marks[1].y -= 20; }), real.length),
    'خطٍّ واحد'),
  'وشيءٌ رُفع عن خطّ الأرض في مشهد الأشياء يُمسَك كذلك');
  ok(throws(() => render.plan('scene', 2, { items: [real[0], '\u{1F6F8}'] }))
    && throws(() => render.plan('scene', 2, { items: [real[0], real[0]] }))
    && throws(() => render.plan('scene', real.length, { items: real, ranks: [1, 2] }))
    && throws(() => render.plan('objects', 2, { items: [real[0], real[1]] })),
  'ورمزٌ خارج جدول المشاهد أو مكرَّرٌ أو معه رتبٌ أو على نمطٍ يُعَدّ — كلُّه يُرمى');

  console.log('\n— ٣ح) الشكلُ الهندسيّ: يُمسَك ما خالف أضلاعَه المعلَنة (الجلسة ش) —');
  const row = render.plan('shape', 3, { seed: 9, shapes: ['circle', 'triangle', 'square'] });
  const twins = render.plan('shape', 2, { seed: 4, shapes: ['square', 'rect'] });
  const house = render.plan('shape', SHAPES_WORLD[0].parts.length, { seed: 2, thing: SHAPES_WORLD[0].id });
  ok(!shapeErrors('ش', row, 3).length && !shapeErrors('ش', twins, 2).length,
    'صفّا (دائرةٌ ومثلثٌ ومربّع) و(مربّعٌ ومستطيل) نظيفان — أضلاعُهما ما يعلنه المنهج');
  ok(!shapeErrors('ش', house, house.marks.length).length,
    `وشيءُ العالم «${SHAPES_WORLD[0].id}» نظيف — أجزاؤه تتلامس ولا تخرج عن صندوقه`);
  ok(found(shapeErrors('ش', broke(row, (f) => { f.marks[1].points.pop(); }), 3),
    'المرسومُ ليس هو المُعلَن'),
  '**ومثلثٌ رُسم بضلعين يُمسَك** — والمنهجُ يعلن ثلاثة، فالطفلُ يَعُدّ ما رُسِم');
  ok(found(shapeErrors('ش', broke(twins, (f) => {
    const [, m] = f.marks; const b = m.box;
    m.points = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.w], [b.x, b.y + b.w]];
  }), 2), 'ضلعاه سواء'),
  '**ومستطيلٌ رُسم مربّعاً يُمسَك** — وهو عينُ ما تفرّق فيه محطةُ ٩·٢');
  ok(found(shapeErrors('ش', broke(row, (f) => {
    const m = f.marks[2]; m.points[1][0] += 24;
  }), 3), 'أضلاعُه غيرُ متساوية'),
  '**ومربّعٌ رُسم مستطيلاً يُمسَك** — فلا يُسمّى المرسومُ باسم غيره');
  ok(found(shapeErrors('ش', broke(row, (f) => { f.marks[1].sides[0].x += 12; }), 3),
    'ليس منتصفَه'),
  'وموضعُ لمسِ ضلعٍ زاح عن منتصفه يُمسَك (يلمس فراغاً)');
  ok(found(shapeErrors('ش', broke(row, (f) => { f.marks[0].box.y -= 30; }), 3), 'خطٍّ واحد'),
    'وشكلٌ رُفع عن خطّ الأرض يُمسَك');
  ok(found(shapeErrors('ش', broke(row, (f) => {
    f.marks[1].box.x = f.marks[0].box.x - 4; f.marks[1].cx = f.marks[0].cx - 4;
  }), 3), 'متلاصقان'),
  'وشكلان متلاصقان دون الفاصل يُمسَكان (يُقرآن شكلاً واحداً)');
  ok(found(shapeErrors('ش', broke(row, (f) => { f.marks[0].shape = 'hexagon'; }), 3),
    'لا يعرفه المنهج'),
  'وصنفٌ لا يعرفه المنهج يُمسَك (لا اسمَ له ولا أضلاع)');
  ok(found(shapeErrors('ش', broke(house, (f) => { f.marks[0].box.y -= 40; }),
    house.marks.length), 'يخرج عن صندوق'),
  'وجزءٌ من شيءِ العالم خرج عن صندوقه يُمسَك');
  ok(!found(shapeErrors('ش', house, house.marks.length), 'متلاصقان'),
    '**وأجزاءُ الشيء تتلامس ولا تُمسَك** — السقفُ على الجسم عمداً، والحدُّ للصفّ وحدَه');
  ok(throws(() => render.plan('shape', 2, { shapes: ['circle', 'hexagon'] }))
    && throws(() => render.plan('shape', 1, { thing: 'castle' }))
    && throws(() => render.plan('shape', 2, { thing: SHAPES_WORLD[0].id }))
    && throws(() => render.plan('scene', 2, { shapes: ['circle', 'square'] })),
  'وصنفٌ أو شيءٌ خارج جدول المنهج، أو عددٌ ليس عددَ أجزائه، أو أشكالٌ لنمطٍ لا يرسمها — كلُّه يُرمى');

  console.log('\n— ٤) صدق الصورة والمعجم: يُمسَك ما لا صورةَ له —');
  ok(found(vocabErrors(['dice', 'hologram'], DISPLAYS), 'ولا يعرفه المنهج'),
    'نمطٌ يرسمه المصيِّر ولا يعرفه المنهج يُمسَك');
  ok(!vocabErrors(render.displays(), DISPLAYS).length, 'وأنماطُ المصيِّر الحيّة كلُّها معلومة');
  ok(throws(() => render.plan('objects', 3, { glyph: '\u{1F480}' })),
    'ورمزٌ خارج عناصر عالم الطفل يُرفَض (صدقُ الصورة عقدٌ لا ذوق)');
  ok(throws(() => render.plan('dice', 0)) && throws(() => render.plan('dice', 7)),
    'وعددٌ خارج مدى النمط يُرمى لا يُقرَّب (لا وجهَ نردٍ لصفرٍ ولا لسبعة)');
  ok(throws(() => render.plan('two-frames', LEVEL_MAX + 1)),
    `وما فوق سقف المستوى (${LEVEL_MAX}) يُرمى — المئةُ لـ«اِحْسِبْ ٢» (ق٣)`);

  console.log('\n— ٥) الحتمية والتنويع —');
  const twice = [0, 0].map(() => JSON.stringify(render.plan('scatter', 9, { seed: 42 })));
  ok(twice[0] === twice[1], 'البذرةُ نفسُها ترسم الشكلَ نفسَه (تُعاد الجولةُ كما كانت)');
  ok(new Set(SEEDS.map((s) => JSON.stringify(render.plan('scatter', 9, { seed: s }).marks))).size > 1,
    'وبذورٌ مختلفة توزّع الكميةَ توزيعاتٍ مختلفة (لئلا تُحفَظ الصورة)');
  ok(new Set(SEEDS.map((s) => JSON.stringify(render.plan('ten-frame', 9, { seed: s }).marks))).size === 1,
    'والإطارُ لا يتزحزح بتبدّل البذرة (مرساةٌ لا مفاجأة)');
  ok(new Set(SEEDS.map((s) => render.plan('objects', 5, { seed: s }).glyph)).size > 1,
    'وعناصرُ عالم الطفل تتبدّل بالبذرة (يُعَدّ كلُّ شيء — التجريد، `METHOD.md §٢.٤`)');

  console.log(fails ? `\n${fails} فشل` : '\n✓ الحارس يمسك المخالفات كلها');
  return fails ? 1 : 0;
}

process.exit(process.argv.includes('--self-test') ? selfTest() : check());
