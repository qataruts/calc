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
import { DISPLAYS, LEVEL_MAX, stations } from '../app/js/curriculum.js';
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
  const errors = [];
  const marks = figure.marks || [];

  if (marks.length !== want) {
    errors.push(`${name}: رسم ${marks.length} عنصراً والمقصود ${want} `
      + '— **العددُ المرسوم ليس هو المقصود**');
  }

  for (const [i, m] of marks.entries()) {
    if (![m.x, m.y, m.r].every(Number.isFinite)) {
      errors.push(`${name}: العنصر ${i} بموضعٍ ليس عدداً`);
      continue;
    }
    if (m.r <= 0) errors.push(`${name}: العنصر ${i} بلا حجم`);
    if (m.x - m.r < -EPS || m.y - m.r < -EPS
      || m.x + m.r > figure.view.w + EPS || m.y + m.r > figure.view.h + EPS) {
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

function sweep() {
  const errors = [];
  let figures = 0;
  let splits = 0;
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
  return { errors, figures, splits };
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
  const { errors, figures, splits } = sweep();
  const covered = painted.map((d) => render.rangeOf(d));

  const byKind = (kind) => painted.filter((d) => render.kindOf(d) === kind);
  door('١) المرسومُ هو المقصود — كمّاً يُعَدّ ورمزاً يُقرأ وخطّاً يمتدّ',
    errors,
    `${figures} شكلاً و${splits} شقّاً (${painted.length} نمطاً × مداه × ${SEEDS.length} بذور): `
    + `${byKind('quantity').length} نمطَ كمّيةٍ رسم عددَه بلا تراكبٍ ولا خروجٍ عن صندوقه `
    + `وانشقّ شقّين بترتيب رسمه، `
    + `و${byKind('numeral').length} بطاقةَ رمزٍ كتبت رقمَها المشرقيّ، `
    + `و${byKind('line').length} خطّاً علاماتُه مدىً وواحدةً متساويةَ التباعد من اليمين`);

  door('٢) صدق الصورة: عناصرُ عالم الطفل من Twemoji المحلية',
    objectErrors(),
    `${render.OBJECTS.length} عنصراً معدوداً، لكلٍّ ملفُّه المحليّ واسمُه: `
    + render.OBJECTS.map((o) => o.name).join('، '));

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
