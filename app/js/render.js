// **مصيِّر الكميات** — قلبُ «اِحْسِبْ» البصريّ (`METHOD.md §١٠.٢` · `DESIGN.md §٥`).
//
// ————— العهد الذي يقوم عليه هذا الملف —————
//
// «الكمياتُ تُرسم برمجياً والعددُ المرسوم يُثبَت آلياً» (عهدُ العائلة، `CLAUDE.md`).
// فلا صورةَ كميةٍ تُرسم بيد، ولا عددَ يُكتب في ملفٍّ ويُصدَّق: **المصيِّر يُرجِع العدد
// الذي رسم**، ويقابله `tools/check_render.mjs` بالمقصود في كل نمطٍ وكل عددٍ من ٠ إلى
// ٢٠ حيث ينطبق — فالغلطُ في الرسم **مستحيلٌ بنيوياً** لا مستبعَدٌ باجتهاد.
//
// ————— شطران: هندسةٌ خالصة ثم رسمٌ في DOM —————
//
// `plan()` **دالّةٌ خالصة بلا DOM**: تُرجِع مواضعَ العناصر أعداداً — فتُقرأ في `node`
// بلا متصفّح، وتُجرَّب سالباً بخططٍ مصنوعةٍ مكسورة. و`paint()` تبني الشكل من الخطة
// و**تَعُدّ ما رسمت من DOM نفسِه** (`[data-mark]`) لا من العدد المطلوب — فلو أسقط
// رسّامٌ عنصراً أو كرّره لانكشف في العدد المُرجَع، لا في جهاز طفل.
//
// ولا يمسّ هذا الملفُّ الـDOM وقتَ التحميل، فيبقى قابلاً للاستيراد في `node` (عقدُ
// الوحدات الخالصة نفسُه الذي تلتزم به مولّدات الجلسة ٣).
//
// ————— لِمَ الأشكالُ بمقاييسَ مشتركة —————
//
// **حجمُ العنصر واحدٌ في كل الأنماط** (`R` أدناه)، وأدنى فاصلٍ بين حافتَي عنصرين
// واحد (`GAP`). وعلّتُه تعليميةٌ لا جمالية: الطفلُ في «أيُّهما أكثر» يقارن **عدداً**،
// فلو كبر عنصرُ الأقلّ لصارت المقارنةُ بصرَ مساحةٍ لا حسَّ عدد — وهو عينُ الخطأ الذي
// تبنيه الرحلة لتهدمه. ولذلك تُرسم الأشكالُ كلُّها بوحدةٍ واحدة (`--unit` في CSS).

import { h, faceEl, seeded, shuffle, arNum, latinNum, icon, go, topbar, brandMark } from './ui.js';

// ————— المقاييس (بوحدات الرسم — و`--unit` في `app.css` يحوّلها إلى بكسل) —————

/** نصفُ قطر العنصر: ٤٤ وحدةً قطراً — يُلمَس بإصبع طفل الرابعة ويُعَدّ بها. */
const R = 22;
/** أدنى فاصلٍ بين حافتَي عنصرين — دونه تتلاصق الكميةُ فيفشل التقديرُ الفوريّ. */
const GAP = 12;
/** أصغرُ خليةٍ تسع عنصراً بفاصله — وعليها تقوم البراهين الهندسية أدناه. */
const CELL = 2 * R + GAP;
/** هامشُ الشكل: لا يلتصق عنصرٌ بحافة الصندوق. */
const PAD = 12;

/** المقاييس معلَنةٌ للحارس — فيحسب حدودَه منها ولا يكتبها بيد. */
export const GEOM = { R, GAP, CELL, PAD };

// ————— عناصرُ عالم الطفل: عقدُ «صدق الصورة» —————
//
// **ثلاثةُ شروطٍ لا رابع** لِما يجوز أن يُعَدّ في هذا التطبيق:
//   ١) **شيءٌ واحدٌ معدود** يُلمَس بالإصبع — لا كتلةَ ولا مشهدَ ولا مجموعةَ أشياء
//      في رسمٍ واحد (لا «سلّةُ تفاح»)، وإلا اختلّ التناظرُ الفرديّ في «المس وعُدّ».
//   ٢) **رسمٌ واحدٌ لكل طفل**: من Twemoji المخزونة في `app/emoji/` — لا محرفٌ يُسلَّم
//      لخطّ النظام فيصير صورةً لكل جهاز (مهمةُ «أيقونات لا إيموجي»، `ui.js`).
//   ٣) **الكميةُ الواحدة متجانسة**: كلُّ عناصرها رسمٌ واحد — فالمعدودُ لا يزاحم العدد.
//
// **والاسمُ هنا للمراجعة لا للنطق** (ق٢، `METHOD.md §٨`): لا يُنطَق معدودٌ مقروناً
// بعددٍ أبداً، والصوتُ يعدّ مجرداً «واحد، اثنان…». وتسميةُ الشيء مفردةً جائزة.
//
// ويجردها `tools/fetch_twemoji.py` من هذا الملفّ نفسِه فينزّل **المستعمَل وحدَه**.

export const OBJECTS = [
  { glyph: '🍎', name: 'تُفَّاحَة' },
  { glyph: '⭐', name: 'نَجْمَة' },
  { glyph: '🐟', name: 'سَمَكَة' },
  { glyph: '🎈', name: 'بَالُون' },
  { glyph: '🌼', name: 'زَهْرَة' },
  { glyph: '🦋', name: 'فَرَاشَة' },
  { glyph: '🚗', name: 'سَيَّارَة' },
  { glyph: '🍪', name: 'كَعْكَة' },
];

// ————— النرد ١–٦: التوزيعُ القياسيّ حرفياً —————
//
// **لا يُخترع توزيعٌ آخر** (`DESIGN.md §٥.١`): وجهُ النرد صورةٌ ذهنيةٌ يعرفها الطفل
// من خارج التطبيق (لعبةٌ في البيت)، فاختراعُ ترتيبٍ جديد يهدم نفعَها ويحوّل التقديرَ
// الفوريّ إلى حفظِ صورةٍ من صنعنا. والشبكةُ ٣×٣ بأعمدتها من **اليسار** كما يُرسم
// النردُ في العالم كلِّه: هو جسمٌ لا نصّ، ولا يُقلَب باتجاه الكتابة.

const DICE = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};

function dicePlan(count) {
  const origin = PAD + 4;                       // الشبكةُ ٣×٣ في وسط بطاقة النرد
  return {
    marks: DICE[count].map(([col, row]) => ({
      x: origin + col * CELL + CELL / 2,
      y: origin + row * CELL + CELL / 2,
      r: R,
    })),
  };
}

// ————— الإطارات: تُملأ **من اليمين** (واجهةٌ RTL) —————
//
// **الثباتُ شرطُ أن يصير الإطارُ صورةً ذهنية** (`METHOD.md §٣` — ٣·٥، و`DESIGN.md
// §٥.٣`): الصفُّ العلويّ من اليمين ثم السفليّ من اليمين، لا يتبدّل أبداً. وإطارٌ
// يُملأ مرّةً من اليمين ومرّةً من اليسار لا يصير مرساةً للطفل أبداً.
//
// و`cells` تُرجَع كلُّها — لا الممتلئةُ وحدَها: **الخانةُ الفارغة جزءٌ من المعنى**
// («كم بقي للعشرة؟» — المرحلة ٥)، والحارسُ يقرأ منها ترتيبَ الملء ويقابله باليمين.

function frameGeom(cols, rows, x0, y0) {
  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let fromRight = 0; fromRight < cols; fromRight++) {
      cells.push({
        x: x0 + (cols - 1 - fromRight) * CELL + CELL / 2,
        y: y0 + row * CELL + CELL / 2,
      });
    }
  }
  return { cells, box: { x: x0, y: y0, w: cols * CELL, h: rows * CELL } };
}

const filled = (cells, count) => cells.slice(0, count).map((c) => ({ ...c, r: R }));

function framePlan(cols, rows) {
  return (count) => {
    const { cells, box } = frameGeom(cols, rows, PAD, PAD);
    return { cells, frames: [box], marks: filled(cells, count) };
  };
}

/**
 * إطارا عشرة (١١–٢٠): **عشرةٌ وآحاد** (`METHOD.md §٣` المرحلة ٧).
 * والأوّلُ منهما **على اليمين** — يُملأ حتى العشرة ثم يبدأ الذي يليه، فتُرى الحزمةُ
 * التامّة أولاً وما زاد عليها آحاداً. وهو ترتيبُ القراءة نفسُه.
 */
function twoFramesPlan(count) {
  const right = frameGeom(5, 2, VIEWS['two-frames'].w - PAD - 5 * CELL, PAD);
  const left = frameGeom(5, 2, PAD, PAD);
  const cells = [...right.cells, ...left.cells];
  return { cells, frames: [right.box, left.box], marks: filled(cells, count) };
}

// ————— المبعثر: **بلا تراكبٍ مُثبَتٍ هندسياً**، حتميٌّ ببذرة —————
//
// **العشوائيةُ مقصودة** (`METHOD.md §٢.٣`): توزيعاتٌ مختلفة للعدد الواحد تمنع أن
// يحفظ الطفلُ الصورةَ بدل أن يقدّرها. و**الحتميةُ ببذرة** شرطُ أن تُعاد الجولةُ كما
// كانت (`METHOD.md §١٠.١`) فتُجرَد في الحارس.
//
// **وبرهانُ «لا تراكب» بنيويّ لا إحصائيّ**: تُقسَم الساحةُ شبكةَ خلايا لا يقلّ ضلعُها
// عن `CELL`، ويُنتقى منها `count` خليةً بالقرعة، ويُزاح مركزُ كل عنصرٍ **داخل خليته
// وحدَها** بحيث يبقى قرصُه متراجعاً عن حدود الخلية بـ`GAP/2`. فعنصران في خليتين
// مختلفتين يفصل بينهما `GAP` على الأقلّ في أحد المحورين — **مهما كانت القرعة**.
// (وشبكةٌ أوسعُ من الحاجة بالنصف تعطي إزاحةً حرّة فلا تُقرأ الصورةُ شبكةً.)

function gridFor(count, field) {
  const maxCols = Math.floor(field.w / CELL);
  const maxRows = Math.floor(field.h / CELL);
  const need = Math.min(Math.ceil(count * 1.6), maxCols * maxRows);
  let cols = Math.min(maxCols, Math.max(1, Math.round(Math.sqrt((need * field.w) / field.h))));
  const rows = Math.min(maxRows, Math.max(1, Math.ceil(need / cols)));
  if (cols * rows < need) cols = Math.min(maxCols, Math.ceil(need / rows));
  return { cols, rows };
}

function scatterPlan(count, rnd, view) {
  // الساحةُ متراجعةٌ عن حافة البطاقة بهامشها، فلا يلتصق عنصرٌ بالحدّ فيُقرأ نصفَ شيء
  const field = { x: PAD, y: PAD, w: view.w - 2 * PAD, h: view.h - 2 * PAD };
  const { cols, rows } = gridFor(count, field);
  const cellW = field.w / cols;
  const cellH = field.h / rows;
  const inset = R + GAP / 2;                    // تراجُعُ القرص عن حدود خليته
  const chosen = shuffle([...Array(cols * rows).keys()], rnd).slice(0, count);
  return {
    grid: { cols, rows },
    marks: chosen.map((i) => ({
      x: field.x + (i % cols) * cellW + inset + rnd() * (cellW - 2 * inset),
      y: field.y + Math.floor(i / cols) * cellH + inset + rnd() * (cellH - 2 * inset),
      r: R,
    })),
  };
}

// ————— بطاقةُ الرمز: **رقمٌ مشرقيّ في صندوقٍ بمقاس بطاقة الكمية** (الجلسة ٤) —————
//
// **ولِمَ يمرّ الرمزُ من المصيِّر أصلاً وهو نصٌّ لا هندسة؟** لأنّ عقدَ هذا التطبيق
// «الشيفرةُ تُرجِع ما فعلت لا ما نوت» (`METHOD.md §١٠.٢`): بطاقةٌ تكتب رقمَها بيدها
// تُصدَّق على دعواها، وبطاقةٌ من هنا **يُقرأ رقمُها من الـDOM بعد رسمه** (`readNumeral`)
// فيقابله الحارس بالمقصود — كما يُقرأ عددُ النقاط من `[data-mark]`. وبه تلتقي شاشةُ
// المرحلة ٣ على عددٍ واحد: كمّيةٌ تقول «رسمتُ سبعاً» وبطاقةٌ تقول «رسمتُ سبعة».
//
// **ومقاسُها مقاسُ بطاقة النرد** حرفاً (الصندوقُ نفسُه): الرمزُ تسميةٌ لكمٍّ عرفه، فلا
// يكبر عليه ولا يصغر — ويقعان في «طابِقْ» متجاورين بلا أن يرجّح الحجمُ أحدَهما.
//
// **والأرقامُ مشرقيةٌ حصراً** (ق١، `METHOD.md §٩`) ومصدرُها `arNum` وحدَه — ولا يكتب
// هذا الملفُّ محرفَ رقمٍ واحداً بيده.

function numeralPlan(count) {
  return { text: arNum(count), marks: [] };
}

/** قراءةُ الرمز المرسوم عدداً — **من نصّ الـDOM لا من `count`**، و‑١ لِما لا يُقرأ. */
const readNumeral = (text) => (/^[٠-٩]+$/.test(String(text || '')) ? Number(latinNum(text)) : -1);

// ————— خطُّ الأعداد: **يبدأ من اليمين** (واجهةٌ RTL) —————
//
// **و`count` هنا مدى الخطّ لا كميةٌ تُعَدّ**: `plan('line', 10)` خطٌّ من الصفر إلى
// العشرة — إحدى عشرة علامة. وهو أوّلُ نمطٍ في المصيِّر ليس كمّاً، فلذلك أعلن كلُّ
// رسّامٍ **صنفَه** (`kind`) أدناه: يقرأ الحارسُ الكمَّ بعدّ عناصره، والرمزَ بقراءة
// نصّه، والخطَّ بعدّ علاماته — ولا يُقاس نمطٌ بمسطرة غيره.
//
// **والصفرُ على اليمين** ليتّفق الخطُّ والإطارُ على جهةٍ واحدة: إطارُ العشرة يُملأ من
// اليمين (`METHOD.md §٣` — ٣·٥)، فلو تصاعد الخطُّ إلى اليمين لتناقض المرساتان في
// ذهن الطفل ولزمه أن يقلب اتجاهَ العدّ بين شاشتين. (بندٌ يُرفع إلى مدير المشروع.)
//
// **والعلاماتُ المسمّاةُ مرساةٌ لا قائمةُ أجوبة**: يُكتب رقمُ الصفر وطرفِ الخطّ ومضاعفاتُ
// الخمسة وحدَها — فلو كُتب رقمُ كلِّ علامةٍ لصار «أين يقع؟» قراءةَ لافتةٍ لا حسَّ موضع.

const LINE_AXIS = 86;      // ارتفاعُ المحور من أعلى الصندوق — وما فوقه ساحةُ الاختيار

function linePlan(count) {
  const view = VIEWS.line;
  const step = (view.w - 2 * (PAD + R)) / count;
  const r = Math.min(R / 2, step / 2 - GAP / 2);
  const half = Math.min(step / 2, PAD + R);        // نصفُ الخانة، محبوسٌ في الصندوق
  const x0 = view.w - PAD - R;                     // **الصفرُ على اليمين**
  const ticks = [];
  for (let value = 0; value <= count; value++) {
    ticks.push({ value, x: x0 - value * step, y: LINE_AXIS, r });
  }
  return {
    marks: [],
    axis: { x1: x0 - count * step, x2: x0, y: LINE_AXIS },
    ticks,
    // **خانةُ كل علامة**: ساحةُ اللمس فوقها، من المصيِّر نفسِه لا من حساب الشاشة
    slots: ticks.map((t) => ({ value: t.value, x: t.x - half, y: 0, w: 2 * half, h: LINE_AXIS })),
    labels: ticks.filter((t) => t.value === 0 || t.value === count || t.value % 5 === 0)
      .map((t) => ({ value: t.value, x: t.x, y: LINE_AXIS, text: arNum(t.value) })),
  };
}

// ————— سِجلُّ الأنماط —————
//
// **المعجمُ يملكه المنهج** (`DISPLAYS` في `curriculum.js`)، وهذا الملفُّ يُنفِّذ منه ما
// بلغته الرحلة. ويقابل `tools/check_render.mjs` الجردين: نمطٌ يرسمه المصيِّر ولا
// يعرفه المنهج **خطأ**، ونمطٌ يعرفه المنهج ولا رسّامَ له بعدُ **نائمٌ يستيقظ ذاتياً**
// يومَ يُكتب رسّامُه (`docs/SEED.md §٥`) — فلا رايةَ تُضبط بيد.

const VIEWS = {
  dice: { w: 2 * (PAD + 4) + 3 * CELL, h: 2 * (PAD + 4) + 3 * CELL },
  scatter: { w: 440, h: 320 },
  objects: { w: 440, h: 320 },
  'five-frame': { w: 2 * PAD + 5 * CELL, h: 2 * PAD + CELL },
  'ten-frame': { w: 2 * PAD + 5 * CELL, h: 2 * PAD + 2 * CELL },
  'two-frames': { w: 4 * PAD + 10 * CELL, h: 2 * PAD + 2 * CELL },
  // بطاقةُ الرمز بصندوق بطاقة النرد نفسِه — الرمزُ تسميةٌ لكمٍّ لا بديلٌ أكبرُ منه
  numeral: { w: 2 * (PAD + 4) + 3 * CELL, h: 2 * (PAD + 4) + 3 * CELL },
  line: { w: 660, h: 140 },
};

/**
 * **ولكلِّ رسّامٍ صنفُه** (`kind`، الجلسة ٤): `quantity` كمّيةٌ تُعَدّ عناصرُها ·
 * `numeral` رمزٌ يُقرأ نصُّه · `line` خطٌّ تُعَدّ علاماتُه. وبه يعرف **قارئُ المرسوم**
 * (`read`) كيف يُرجِع ما رُسِم فعلاً، ويعرف الحارسُ بأيّ مسطرةٍ يقيس — فلا يُطالَب
 * الرمزُ بأن يرسم سبعةَ أشياء ولا الكمّيةُ بأن تكتب رقماً.
 */
const PAINTERS = {
  dice: { kind: 'quantity', min: 1, max: 6, plan: dicePlan, paint: paintDots },
  scatter: { kind: 'quantity', min: 0, max: 20, plan: scatterPlan, paint: paintDots },
  objects: { kind: 'quantity', min: 0, max: 20, plan: scatterPlan, paint: paintObjects },
  'five-frame': { kind: 'quantity', min: 0, max: 5, plan: framePlan(5, 1), paint: paintDots },
  'ten-frame': { kind: 'quantity', min: 0, max: 10, plan: framePlan(5, 2), paint: paintDots },
  'two-frames': { kind: 'quantity', min: 0, max: 20, plan: twoFramesPlan, paint: paintDots },
  numeral: { kind: 'numeral', min: 0, max: 20, plan: numeralPlan, paint: paintNumeral },
  // **الخطُّ من عددٍ واحدٍ فصاعداً**: خطٌّ بلا مسافةٍ ليس خطّاً — والمدى هنا مدى
  // الخطّ لا كميةٌ تُعَدّ، فالصفرُ طرفُه الأيمن دائماً لا قيمةٌ يُطلَب رسمُها.
  line: { kind: 'line', min: 1, max: 20, plan: linePlan, paint: paintLine },
};

/**
 * **قارئو المرسوم** — لكلِّ صنفٍ قراءتُه من الـDOM نفسِه لا من العدد المطلوب:
 * الكمّيةُ تُعَدّ عناصرُها، والرمزُ يُقرأ نصُّه عدداً، والخطُّ تُعَدّ علاماتُه فيُرَدّ
 * مداه. وهو عينُ عقد `drawn`: **الفرقُ بين النية والفعل مقيسٌ لا مظنون**.
 */
const READERS = {
  quantity: (el) => el.querySelectorAll('[data-mark]').length,
  numeral: (el) => readNumeral(el.querySelector('[data-numeral]')?.dataset.numeral),
  line: (el) => el.querySelectorAll('[data-tick]').length - 1,
};

/** أنماطُ العرض التي يرسمها المصيِّر اليوم، بترتيب الرحلة. */
export const displays = () => Object.keys(PAINTERS);

/** صنفُ النمط: `quantity` أو `numeral` أو `line` — بأيّ مسطرةٍ يُقاس المرسوم. */
export const kindOf = (display) => PAINTERS[display]?.kind || null;

/** مدى النمط: `dice` من ١ (لا وجهَ لصفر)، وسواه من ٠ إلى سقفه. */
export function rangeOf(display) {
  const painter = PAINTERS[display];
  return painter ? { min: painter.min, max: painter.max } : null;
}

// ————— الخطة: هندسةٌ خالصة تُقرأ في node —————

/**
 * خطةُ شكلٍ: مواضعُ العناصر أعداداً، بلا DOM ولا متصفّح.
 *
 * @param {string} display نمطُ العرض من `displays()`
 * @param {number} count   العدد المقصود — **وخارجَ مدى النمط يُرمى لا يُقرَّب**:
 *   كميةٌ لا يستطيع النمطُ رسمَها خطأُ برمجةٍ يجب أن يصرخ، لا أن يُرسَم أقربُ منها.
 * @param {{seed?: number, glyph?: string}} opts البذرة (الحتمية) ورمزُ العنصر.
 */
export function plan(display, count, opts = {}) {
  const painter = PAINTERS[display];
  if (!painter) throw new RangeError(`نمطُ عرضٍ لا يعرفه المصيِّر: «${display}»`);
  if (!Number.isInteger(count) || count < painter.min || count > painter.max) {
    throw new RangeError(
      `العدد ${count} خارج مدى «${display}» [${painter.min}..${painter.max}] — `
      + 'ولا يُقرَّب عددٌ لا يستطيع النمطُ رسمَه');
  }
  if (opts.glyph && !OBJECTS.some((o) => o.glyph === opts.glyph)) {
    throw new RangeError('رمزٌ خارج عناصر عالم الطفل — «صدق الصورة» عقدٌ لا ذوق');
  }

  const view = VIEWS[display];
  const rnd = seeded((opts.seed ?? 0) >>> 0);
  const glyph = display === 'objects'
    ? (opts.glyph || OBJECTS[Math.floor(rnd() * OBJECTS.length)].glyph)
    : null;

  return {
    display, count, view, r: R, glyph, kind: painter.kind,
    seed: (opts.seed ?? 0) >>> 0,
    cells: [], frames: [], ticks: [], slots: [], labels: [], text: null,
    ...painter.plan(count, rnd, view),
  };
}

// ————— الرسم: من الخطة إلى DOM، والعددُ يُعَدّ من الرسم —————
//
// وSVG يُبنى نصّاً ثم يُسنَد إلى `innerHTML` (نمطُ `ui.js` نفسُه في المعالم والمرشد):
// `document.createElement` يصنع عنصراً بفضاء أسماء HTML لا SVG، فلا يُرسَم.

function svgFigure(figure, inner) {
  const el = h('div', {});
  el.innerHTML = `<svg viewBox="0 0 ${figure.view.w} ${figure.view.h}"
    preserveAspectRatio="xMidYMid meet" aria-hidden="true">${inner}</svg>`;
  return el;
}

const dot = (m) => `<circle data-mark cx="${m.x.toFixed(2)}" cy="${m.y.toFixed(2)}"`
  + ` r="${m.r}" class="fig-dot"/>`;

function paintDots(figure) {
  const cells = figure.cells.map((c) => `<rect data-cell class="fig-cell"`
    + ` x="${c.x - CELL / 2}" y="${c.y - CELL / 2}" width="${CELL}" height="${CELL}"/>`).join('');
  const frames = figure.frames.map((f) => `<rect class="fig-frame" x="${f.x}" y="${f.y}"`
    + ` width="${f.w}" height="${f.h}" rx="7"/>`).join('');
  return svgFigure(figure, cells + frames + figure.marks.map(dot).join(''));
}

/**
 * **موضعُ عنصرٍ نسبةً من صندوق الشكل** — يستعمله رسمُ عناصر عالم الطفل **وطبقةُ اللمس**
 * في شاشات «المس وعُدّ» معاً (الجلسة ٣).
 *
 * وعلّةُ إخراجه من `paintObjects`: لو حسبت الشاشةُ مواضعَ أهدافِ اللمس بنفسها لصار
 * للعنصر موضعان — واحدٌ يُرى وواحدٌ يُلمَس — فيفترقان يومَ يتحرّك أحدهما، ويلمس الطفلُ
 * فراغاً. **والمصيِّر واحد** (`METHOD.md §١٠.٢`): من رسم العنصرَ يقول أين وضعه.
 */
export function spotStyle(mark, view) {
  return {
    '--x': `${((mark.x - mark.r) / view.w) * 100}%`,
    '--y': `${((mark.y - mark.r) / view.h) * 100}%`,
    '--d': `${((2 * mark.r) / view.w) * 100}%`,
  };
}

/**
 * **ساحةٌ مستطيلة نسبةً من صندوق الشكل** — لخانات خطّ الأعداد (`slots`)، وعلّتُها
 * علّةُ `spotStyle` نفسُها: من رسم الخانةَ يقول أين هي، فلا يُحسَب موضعُها مرّتين.
 * (وهي مستطيلٌ لا قرص: خانةُ الخطّ عمودٌ قائم لا نقطةٌ — فيبلغ هدفَ اللمس ارتفاعاً
 * وإن ضاق عرضُه بازدحام العلامات.)
 */
export function spanStyle(box, view) {
  return {
    '--x': `${(box.x / view.w) * 100}%`,
    '--y': `${(box.y / view.h) * 100}%`,
    '--w': `${(box.w / view.w) * 100}%`,
    '--h': `${(box.h / view.h) * 100}%`,
  };
}

/**
 * عناصرُ عالم الطفل: كلُّ عنصرٍ **من المُصيِّر الواحد** (`faceEl` في `ui.js`) — فلا
 * موضعَ ثانٍ في التطبيق يحوّل رمزاً إلى صورة، ولا محرفَ يُسلَّم لخطّ النظام. ومواضعُها
 * نسبٌ مئوية من الصندوق، فتتبع مقاسَه أيّاً كان (`--unit`) بالهندسة نفسِها.
 */
function paintObjects(figure) {
  const el = h('div', {});
  for (const m of figure.marks) {
    const mark = faceEl(figure.glyph, 'fig-mark');
    mark.dataset.mark = '';
    for (const [key, value] of Object.entries(spotStyle(m, figure.view))) {
      mark.style.setProperty(key, value);
    }
    el.append(mark);
  }
  return el;
}

/**
 * **بطاقةُ الرمز**: الرقمُ المشرقيّ نصّاً في صندوقه — و`data-numeral` تُعلن ما كُتب
 * فيه، فيقرؤه `READERS.numeral` من الـDOM ولا يُصدَّق على دعواه.
 *
 * ونصٌّ لا SVG: رسمُ الرقم خطٌّ (Noto Naskh) لا هندسةٌ نرسمها — و`<text>` في SVG
 * يُقاس بمقاييس الخطّ فلا يتوسّط صندوقَه على كل جهاز.
 */
function paintNumeral(figure) {
  return h('div', {},
    h('span', { class: 'fig-numeral num', 'data-numeral': figure.text }, figure.text));
}

/**
 * **خطُّ الأعداد**: محورٌ وعلاماتٌ وأرقامُ المرساة — والصفرُ على اليمين.
 * وكلُّ علامةٍ تحمل قيمتَها (`data-value`) فتقرؤها الشاشةُ من المرسوم لا من حسابٍ ثانٍ.
 */
function paintLine(figure) {
  const { axis, ticks, labels } = figure;
  const rail = `<line class="fig-axis" x1="${axis.x1.toFixed(2)}" y1="${axis.y}"`
    + ` x2="${axis.x2.toFixed(2)}" y2="${axis.y}"/>`;
  const dots = ticks.map((t) => `<circle data-tick data-value="${t.value}"`
    + ` cx="${t.x.toFixed(2)}" cy="${t.y}" r="${t.r.toFixed(2)}" class="fig-tick"/>`).join('');
  const text = labels.map((l) => `<text class="fig-label num" x="${l.x.toFixed(2)}"`
    + ` y="${l.y + 34}" text-anchor="middle">${l.text}</text>`).join('');
  return svgFigure(figure, rail + dots + text);
}

/**
 * **يرسم الشكلَ ويُرجِع ما رسم**.
 *
 * `drawn` **يُقرأ من الـDOM** لا من `count` (بقارئ صنفه — `READERS`): لو أسقط رسّامٌ
 * عنصراً أو كتب رقماً غيرَ المطلوب لظهر الفرقُ في المُرجَع فأمسكه الحارس. وهو نصُّ
 * `METHOD.md §١٠.٢`، وعليه تقوم أجوبةُ التمارين كلِّها.
 */
export function paint(display, count, opts = {}) {
  const figure = plan(display, count, opts);
  const painter = PAINTERS[display];
  const el = painter.paint(figure);
  el.className = `figure figure--${display}`;
  el.style.setProperty('--vw', String(figure.view.w));
  el.style.setProperty('--vh', String(figure.view.h));
  el.setAttribute('aria-hidden', 'true');
  const drawn = READERS[painter.kind](el);
  el.dataset.display = display;
  el.dataset.kind = painter.kind;
  el.dataset.count = String(count);
  el.dataset.drawn = String(drawn);
  return { el, drawn, plan: figure };
}

// ————— لوحُ المراجعة البصرية (`?dev=1`) —————
//
// **مرجعٌ بصريّ لا شاشةُ تمرين**: يعرض كلَّ نمطٍ بكل عددٍ يستطيعه، على الشاشة نفسِها
// بلوحها ولونها واتجاهها — فمنه تُؤخذ اللقطاتُ المرجعية (`browser_test.py
// --render-shots`)، وعليه يقيس حارسُ المتصفّح التراكبَ وترتيبَ الملء من اليمين.
// ولا يُسجَّل إلا في وضع التجربة (`main.js`)، فلا طريقَ إليه من شاشة طفل.

const TITLES = {
  dice: 'النَّرْد ١–٦ — التَّوْزِيعُ القِيَاسِيّ',
  scatter: 'المُبَعْثَر — بِلَا تَرَاكُب، حَتْمِيٌّ بِبَذْرَة',
  objects: 'عَنَاصِرُ عَالَمِ الطِّفْل — Twemoji مَحَلِّيَّة',
  'five-frame': 'إِطَارُ الخَمْسَة — يُمْلَأُ مِنَ اليَمِين',
  'ten-frame': 'إِطَارُ العَشَرَة — يُمْلَأُ مِنَ اليَمِين',
  'two-frames': 'إِطَارَا العَشَرَة — عَشَرَةٌ وَآحَاد',
  numeral: 'بِطَاقَةُ الرَّمْز — مَشْرِقِيَّةٌ حَصْراً',
  line: 'خَطُّ الأَعْدَاد — الصِّفْرُ مِنَ اليَمِين',
};

function sheet(display) {
  const { min, max } = rangeOf(display);
  const items = [];
  for (let n = min; n <= max; n++) {
    // بذرةٌ مختلفة لكل عدد (فيُرى تنوّعُ المبعثر)، ورمزٌ يدور على العناصر كلها
    // (فتُراجَع صورةُ كلٍّ منها) — وكلاهما حتميّ: اللقطةُ نفسُها في كل تشغيل.
    const { el } = paint(display, n, {
      seed: n * 37 + 11,
      glyph: display === 'objects' ? OBJECTS[n % OBJECTS.length].glyph : undefined,
    });
    items.push(h('div', { class: 'gallery-item' },
      el, h('span', { class: 'gallery-num num' }, arNum(n))));
  }
  return h('section', { class: 'gallery-sheet' },
    h('h2', {}, TITLES[display] || display), h('div', { class: 'gallery-row' }, items));
}

/** لوحُ المصيِّر: `#/render/all` أو `#/render/<النمط>`. */
export function renderGallery(part) {
  const names = part === 'all' ? displays() : displays().filter((d) => d === part);
  if (!names.length) return null;

  return h('div', {},
    topbar(
      h('button', { class: 'btn btn--ghost', onclick: () => go('#/') }, icon('repeat'), ' الخريطة'),
      h('span', { class: 'spacer' }),
      brandMark('h1'),
    ),
    h('main', { class: 'gallery' },
      h('p', { class: 'hint' },
        'لوحُ المصيِّر — مرجعٌ بصريّ لأنماط الكميات، لا يظهر للطفل.'),
      names.map(sheet)),
  );
}
