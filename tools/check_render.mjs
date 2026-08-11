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
 */
function stationErrors(painted) {
  const errors = [];
  let sleeping = 0;
  for (const station of stations()) {
    const mine = (station.frontier.displays || []).filter((d) => painted.includes(d));
    if (!mine.length) { sleeping++; continue; }
    for (const d of mine) {
      const { min } = render.rangeOf(d);
      if (station.frontier.min < min) {
        errors.push(`[${station.id}] جبهتُها تبلغ ${station.frontier.min} و«${d}» `
          + `لا يرسم دون ${min}`);
      }
    }
    if (!mine.some((d) => render.rangeOf(d).max >= station.frontier.max)) {
      errors.push(`[${station.id}] أقصى جبهتها ${station.frontier.max} ولا نمطَ مرسومٌ `
        + `يبلغه (${mine.join('، ')})`);
    }
  }
  return { errors, sleeping };
}

// ————— التشغيل على المصيِّر الحيّ —————

function sweep() {
  const errors = [];
  let figures = 0;
  const painted = render.displays();

  for (const display of painted) {
    const { min, max } = render.rangeOf(display);
    for (let n = min; n <= max; n++) {
      const shapes = [];
      for (const seed of SEEDS) {
        const figure = render.plan(display, n, { seed });
        figures++;
        const name = label(display, n, seed);
        errors.push(...figureErrors(name, figure, n));
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
  return { errors, figures };
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
  const { errors, figures } = sweep();
  const covered = painted.map((d) => render.rangeOf(d));

  door('١) العددُ المرسوم هو المقصود — والحدودُ والتراكبُ والترتيب',
    errors,
    `${figures} شكلاً (${painted.length} نمطاً × مداه × ${SEEDS.length} بذور): `
    + 'كلُّ شكلٍ رسم عددَه، بلا تراكبٍ ولا خروجٍ عن صندوقه');

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

  console.log('\n— ٣) النرد: يُمسَك ما ليس بالتوزيع القياسيّ —');
  ok(found(diceErrors('ش', broke(die, (f) => { f.marks[0].x += 4; }), 5), 'خارج شبكة النرد'),
    'نقطةٌ زاحت عن شبكة ٣×٣ تُمسَك');
  ok(found(diceErrors('ش', broke(die, (f) => {
    f.marks[0] = { ...f.marks[0], x: f.marks[2].x, y: f.marks[0].y };
  }), 5), 'ليس القياسيّ'),
  'ووجهٌ على الشبكة وليس بالتوزيع القياسيّ يُمسَك (لا يُخترع نردٌ آخر)');
  ok(found(diceErrors('ش', render.plan('dice', 4), 5), 'ليس القياسيّ'),
    'ووجهُ أربعةٍ مكان خمسةٍ يُمسَك');

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
