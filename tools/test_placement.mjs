// حارسُ «بوابة اللحاق» — امتحانُ تحديد المستوى الاختياريّ (الجلسة ل):
//   node tools/test_placement.mjs
// يحرس: app/js/placement.js app/js/parent.js app/js/review.js app/js/gate.js
//   app/js/curriculum.js app/js/progress.js app/js/support.js app/js/main.js
//   app/sw.js app/welcome/guide.html
//   (السلّمُ والشريحةُ ومفاتيحُها المضمونة والعتبةُ والسقفُ والفتحُ ومسطرةُ الامتحان)
// يخرج بـ١ عند أي إخفاق.
//
// **العلّة التي يحرسها**: امتحانٌ **يفتح محطاتٍ بلا أن يلعبها الطفل**. فخطؤه ليس شاشةً
// تُخفق بل **رحلةً تُختصَر بغير حقّ** — لا تُرى في شاشةٍ ولا يشتكي منها أحد. فالمحروسُ
// تسعةٌ كلُّها قيودُ صدق:
//   ١) **السلّمُ مشتقٌّ من `sections()` لا مكتوب، ودرجتُه شريحة** — مرحلةٌ وما يتلوها
//      حتى المرحلة التالية (عبرةُ اقرأ ل٢).
//   ٢) **مادّةُ الدرجة مفاتيحُ عقدها** — وما لا يُقاس بإعفاءٍ مكتوبٍ في المنهج.
//   ٣) **لا تُفتح محطةٌ لم تُمَسّ**: لكل محطةٍ في الشريحة مفتاحٌ مضمون **في كل محاولة**
//      لا بحظّ خلطة — **والتغطيةُ تُحسب** ببذورٍ كثيرة، محطةً محطة.
//   ٤) **سقفُ العيّنة ≤ أثقلِ جلوسٍ مقرَّرٍ في رحلتنا** — محسوباً من المنهج لا مكتوباً.
//   ٥) **العتبةُ عتبةُ بوّابة الإتقان نفسُها**، **وأوّلُ إخفاقٍ يُنهي**.
//   ٦) **البواباتُ لا تُقفز** (تُجتاز بنفسها) — **مُمتحَنٌ بأقسامٍ مصنوعة** لأنّ الحدَّ
//      لا يقع في رحلة اليوم بين مرحلتين.
//   ٧) **الفتحُ نجمةٌ واحدة، ولا قفلَ رجوعاً**، والإعادةُ تستأنف من آخر حدّ.
//   ٨) **ليتنر يقرأ محاولاته كسائرها** بلا وسمٍ خاصّ، ولا تُقيَّد مراجعةَ يوم.
//   ٩) **مسطرةُ الامتحان الواحدة**: وضعُ الدعم لا يُخفّف امتحاناً.
//  ١٠) **بابُه لوحةُ وليّ الأمر وحدَها** — ولا مسارَ في التوجيه يبلغه طفل.
//
// **ومُجرَّبٌ سالباً** — على شيفرةٍ مُعدَّلة عمداً ثم رُدَّت، كلُّها احمرّت هنا بالاسم:
//   • حذفُ فرع البوّابة من `rungsOf` (فتُتخطّى دائماً)   ⇒ §٦ «لم تُجتز تقصُر السلّم»
//   • جعلُ الدرجة قسمَها وحدَه (بلا ضمّ ما يليه)         ⇒ §٦ «يدخل شريحةَ مرحلته»
//   • إسقاطُ `stationKeys` من `due` في `rungItems`      ⇒ §٣ يحمرّ بأسماء المحطات
//   • رفعُ `SAMPLE` فوق أثقلِ جلوسٍ في الرحلة            ⇒ §٤ بالأرقام
//   • نزعُ `duringExam` من `rungItems`                   ⇒ §٩ بسعة الحوض
//   • ردُّ `openRung` بلا شرط `getStars`                 ⇒ §٧ «لا تُنقص نجمةً كسبها»
//
// و**حدودُ الحارس معلَنة**: لا يفتح متصفّحاً — المشهدُ الحيّ في `browser_test.html`
// (نطاق `map`، §١٠: دخولٌ من اللوحة، اجتيازُ درجةٍ، ثم إخفاقٌ يوقف).

import { readFileSync, readdirSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const ROOT = new URL('../', import.meta.url);

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const curriculum = await import(new URL('curriculum.js', APP));
const p = await import(new URL('progress.js', APP));
const gate = await import(new URL('gate.js', APP));
const review = await import(new URL('review.js', APP));
const support = await import(new URL('support.js', APP));
const station = await import(new URL('station.js', APP));
const pl = await import(new URL('placement.js', APP));

/**
 * وحداتُ التمارين — **تُجرَد من الشجرة لا تُكتب قائمةً**: كلُّ وحدةٍ تعلن عقدَ المولّد
 * (`probeRounds`) هي وحدةُ تمارين، فوحدةٌ جديدة تدخل هذا الحارسَ يومَ تُكتب. وبتحميلها
 * تسجّل بانيها في `station.js` — ولا يُقاس امتحانٌ بمُنشئاتٍ ناقصة.
 */
const makers = [];
for (const file of readdirSync(APP).sort()) {
  if (!file.endsWith('.js')) continue;
  if (!/export (?:function|const) probeRounds/.test(readFileSync(new URL(file, APP), 'utf8'))) continue;
  makers.push(await import(new URL(file, APP)));
}

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const src = (name) => readFileSync(new URL(name, APP), 'utf8');
const rootSrc = (name) => readFileSync(new URL(name, ROOT), 'utf8');
const placementSrc = src('placement.js');
/** الشيفرةُ بلا تعليقاتٍ — فلا يُصدَّق جردٌ على جملةٍ في تعليق. */
const bare = (text) => text.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/** طفلٌ عبَر البوابات الثلاث بنفسه — فيمتدّ السلّمُ إلى الرحلة كلِّها. */
function crossGates() {
  for (const node of p.allNodes()) if (node.type === 'gate') p.setStars(node.id, 1);
}

// ————— ١) السلّمُ مشتقٌّ من `sections()`، ودرجتُه شريحة —————

console.log('\n١. السلّم مشتقٌّ من الرحلة، ودرجتُه شريحة');

p.reset();
store.clear();
const journey = p.journey();
const fresh = pl.rungs();
const firstGate = journey.findIndex((s) => s.kind === 'gate');

ok(fresh.length === firstGate,
  `طفلٌ جديد: سلّمُه ما قبل أوّل بوّابة (${fresh.length} درجاتٍ من ${curriculum.STAGES.length})`);
ok(fresh.map((r) => r.id).join('،') === journey.slice(0, firstGate).map((s) => s.id).join('،'),
  `وبترتيب الرحلة نفسِه (${fresh.map((r) => r.id).join(' ← ')})`);

crossGates();
const list = pl.rungs();
ok(list.length === curriculum.STAGES.length,
  `ومَن عبَر البوابات الثلاث امتدّ سلّمُه إلى الرحلة كلِّها (${list.length} درجة)`);
ok(list.map((r) => r.id).join('،') === curriculum.STAGES.map((s) => s.id).join('،'),
  'ودرجاتُه مراحلُ المنهج بأعيانها لا قائمةٌ ثانية تُكتب');

// **مشتقٌّ لا منسوخ**: أقسامُ الشريحة هي أقسامُ `journey()` أنفسُها (المراجعُ نفسُها)
ok(list.every((r) => r.sections.every((s) => journey.includes(s))),
  'وكلُّ قسمٍ في الشريحة هو القسمُ نفسُه من الرحلة — لا نسخةٌ تفترق عنه يوماً');
ok(list.every((r) => r.nodes.length === r.sections.reduce((n, s) => n + s.nodes.length, 0)),
  'وعقدُ الشريحة مسطَّحُ عقد أقسامها كلِّها');
ok(list.every((r) => r.title === r.sections[0].title),
  'واسمُها اسمُ مرحلتها — فما يقرؤه وليُّ الأمر لا يتبدّل');

// وعقدُ السلّم كلِّه = عقدُ الرحلة إلا البوابات (فلا عقدةَ تُقفَز ولا تُكرَّر)
const ladder = list.flatMap((r) => r.nodes.map((n) => n.id));
const wanted = p.allNodes().filter((n) => n.type !== 'gate').map((n) => n.id);
ok(ladder.join('،') === wanted.join('،'),
  `وعقدُ السلّم عقدُ الرحلة كلُّها إلا البوابات (${ladder.length} من ${p.allNodes().length})`);

// ————— ٢) مادّةُ الدرجة: مفاتيحُ عقدها، وما لا يُقاس بإعفاءٍ مكتوب —————

console.log('\n٢. مادّتُها مفاتيحُ عقدها، والمعفى بسببه المكتوب');

const byId = new Map(curriculum.stations().map((s) => [s.id, s]));
let keysFromNodes = true;
for (const rung of list) {
  const declared = new Set(rung.nodes.flatMap((n) => n.skills || []));
  if (pl.rungKeys(rung).some((k) => !declared.has(k))) keysFromNodes = false;
  if (pl.rungKeys(rung).length !== declared.size) keysFromNodes = false;
}
ok(keysFromNodes, 'مفاتيحُ كل درجةٍ هي مفاتيحُ عقدها بلا زيادةٍ ولا نقص');

const measured = list.reduce((n, r) => n + pl.measuredNodes(r).length, 0);
const exempt = list.flatMap((r) => pl.exemptNodes(r));
ok(measured + exempt.length === ladder.length,
  `وعقدُ السلّم إمّا تُقاس (${measured}) وإمّا تُعفى (${exempt.length}) — لا ثالثَ`);
const unexplained = exempt.filter((n) => !(byId.get(n.id)?.exempt || '').trim());
ok(!unexplained.length,
  `ولكلِّ معفاةٍ سببُها المكتوب في المنهج (${exempt.map((n) => n.id).join('، ') || 'لا معفاة'})`
  + (unexplained.length ? ` — بلا سبب: ${unexplained.map((n) => n.id).join('، ')}` : ''));
ok(exempt.every((n) => (byId.get(n.id)?.exempt || '').length > 40),
  'وسببٌ يُكتب لا كلمةٌ تُكتب للمرور (أكثرُ من أربعين حرفاً — مسطرةُ `check_range` نفسُها)');

// **ولا مفتاحَ في السلّم بلا بانٍ**: مهارةٌ تُمتحَن ولا تُبنى لها جولةٌ تسقط صامتةً من
// العيّنة — فتُفتح محطتُها بلا أن تُمَسّ. (وهو نظيرُ «لا مهارةَ تُقاس بلا تمرين».)
const buildless = [];
for (const rung of list) {
  for (const key of pl.rungKeys(rung)) {
    const skill = p.parseSkillKey(key);
    if (!station.exerciseOwners(skill.kind)) buildless.push(key);
  }
}
ok(!buildless.length,
  `ولكلِّ مفتاحٍ في السلّم بانٍ مسجَّل (${buildless.length ? buildless.join('، ') : 'كلُّها'})`);

// ————— ٣) لا تُفتح محطةٌ لم تُمَسّ — التغطيةُ تُحسب لا تُوعَد —————
//
// **العلّةُ**: العيّنةُ خلطٌ، وأكبرُ مراحلنا إحدى عشرةَ محطة — فلو تُركت مفاتيحُ المحطة
// النادرة للحظّ لَظهرت أحياناً، **فتُفتح محطةٌ لم يُذكَر منها شيء**. فالمحروسُ الضمانُ
// في **كل محاولة** لا في متوسّطها.

console.log('\n٣. كلُّ محطةٍ في الشريحة تُمتحَن في كل محاولة');

const SEEDS = 24;
const lengths = [];
for (let i = 0; i < list.length; i++) {
  const rung = list[i];
  const holes = [];
  const sizes = new Set();
  for (let seed = 1; seed <= SEEDS; seed++) {
    const items = pl.rungItems(i, rng(seed * 17 + i + 1));
    sizes.add(items.length);
    const asked = new Set(items.map((it) => p.skillKey(it.concept, it.range, it.kind)));
    for (const node of pl.measuredNodes(rung)) {
      if (!node.skills.some((k) => asked.has(k))) holes.push(`${node.id}/${seed}`);
    }
    // **ولا يُسأل عمّا ليس من الشريحة**: العيّنةُ لا تُكمَّل من خارجها، فلا يُحكَم على
    // مرحلةٍ بخطأٍ في مادّةٍ ليست منها.
    const own = new Set(pl.rungKeys(rung));
    for (const key of asked) if (!own.has(key)) holes.push(`أجنبيّ ${key}/${seed}`);
  }
  lengths.push(`${rung.id}:${[...sizes].join('/')}`);
  ok(!holes.length,
    `[${rung.id}] ${pl.measuredNodes(rung).length} محطةً مقيسة تُمَسّ كلُّها في ${SEEDS} محاولة`
    + (holes.length ? ` — سقط: ${holes.slice(0, 4).join('، ')}` : ''));
}
/* **والسلّمُ يُتسلَّق فعلاً لا يُقاس على سجلٍّ نظيف**: مَن اجتاز درجةً صارت محطاتُها
   «حصيلةً» في يده، وحوضُ تنويع المراجعة يُبنى منها — فلو كُمِّلت العيّنةُ منه لَحُكم
   على مرحلةٍ بخطأٍ في مادّةٍ ليست منها (ومنعَ فتحَها). فيُمشى السلّمُ درجةً درجة
   بالفتح، ويُجرَد ما دخل العيّنة. */
const climbed = [];
p.reset();
store.clear();
crossGates();
for (let i = 0; i < list.length; i++) {
  const own = new Set(pl.rungKeys(list[i]));
  for (let seed = 1; seed <= 6; seed++) {
    for (const item of pl.rungItems(i, rng(seed * 37 + i + 1))) {
      const key = p.skillKey(item.concept, item.range, item.kind);
      if (!own.has(key)) climbed.push(`${list[i].id}/${seed}:${key}`);
    }
  }
  pl.openRung(list[i]);          // اجتازها فصارت محطاتُها حصيلةً في يده
}
ok(!climbed.length,
  'ومَن تسلّق السلّمَ درجةً درجة لا تُكمَّل عيّنتُه من حصيلته السابقة'
  + (climbed.length ? ` — دخل: ${climbed.slice(0, 4).join('، ')}` : ' (٦٦ محاولةً مقيسة)'));
p.reset();
store.clear();
crossGates();

// **ولا قصرَ صامت**: طولُ عيّنة كل درجةٍ يُطبَع — فشريحةٌ مادّتُها أقلُّ من العيّنة
// تُقال بعددها لا تُخبَّأ (المرحلةُ ١١ مفتاحٌ واحد، فتمارينُها المتمايزة قليلة).
console.log(`     أطوالُ العيّنات: ${lengths.join(' · ')}`);
ok(true, 'وطولُ عيّنة كل درجةٍ معلَنٌ أعلاه — لا سقفَ صامت');

// ————— ٤) سقفُ العيّنة: أثقلُ جلوسٍ مقرَّرٍ في رحلتنا، محسوباً من المنهج —————
//
// عبرةُ اكتب: لا يطلب امتحانُ اللحاق من الممتحَن ما لا تطلبه أيُّ محطةٍ من طفلها.
// فيُحسب أثقلُ جلوسٍ في الرحلة من ثلاثة مصادر — جولاتُ المحطات (`probeRounds` بكل
// بذرة)، وجلسةُ المراجعة، وجلسةُ البوّابة — ويُقابَل به السقفُ والعيّنة.

console.log('\n٤. سقفُ العيّنة ≤ أثقلِ جلوسٍ في الرحلة (محسوباً من المنهج)');

let heaviestStation = 0;
let heaviestId = '';
for (const s of curriculum.stations()) {
  for (const m of makers) {
    if (typeof m.probeRounds !== 'function') continue;
    for (const seed of [1, 7, 23, 101]) {
      const rounds = (m.probeRounds(s.id, seed) || []).filter((r) => r.step !== 'watch');
      if (rounds.length > heaviestStation) { heaviestStation = rounds.length; heaviestId = s.id; }
    }
  }
}
const heaviest = Math.max(heaviestStation, review.SESSION_SIZE, gate.GATE_SIZE);
ok(heaviestStation > 0,
  `أثقلُ محطةٍ في الرحلة ${heaviestStation} جولة (${heaviestId})`);
ok(pl.CAP === heaviest,
  `والسقفُ ${pl.CAP} = أثقلُ جلوسٍ مقرَّر (محطةٌ ${heaviestStation} · مراجعةٌ `
  + `${review.SESSION_SIZE} · بوّابةٌ ${gate.GATE_SIZE})`);
ok(/CAP = GATE_SIZE/.test(placementSrc),
  'وهو **مستوردٌ لا مكتوب** — يتحرّك بتحرّك جلسة البوّابة');
ok(pl.SAMPLE <= pl.CAP && pl.SAMPLE > review.SESSION_SIZE,
  `والعيّنةُ ${pl.SAMPLE}: فوق جلسة المراجعة ودون السقف`);
const overCap = [];
for (let i = 0; i < list.length; i++) {
  for (let seed = 1; seed <= 8; seed++) {
    const items = pl.rungItems(i, rng(seed * 29 + i + 1));
    if (items.length > pl.CAP) overCap.push(`${list[i].id}/${seed}:${items.length}`);
  }
}
ok(!overCap.length,
  `ولا درجةَ تتجاوزه في محاولةٍ واحدة${overCap.length ? ` — ${overCap.slice(0, 3).join('، ')}` : ''}`);
ok(pl.sizeFor(new Array(pl.CAP + 5).fill('x')) === pl.CAP && pl.sizeFor([]) === pl.SAMPLE,
  'و`sizeFor` تحدّه بالسقف وترفعه إلى العيّنة — تغطيةٌ أوسعُ من السقف تُحمِّر لا تُختصَر');

// ————— ٥) العتبةُ عتبةُ البوّابة نفسُها، وأوّلُ إخفاقٍ يُنهي —————

console.log('\n٥. عتبةُ الثمانين والوقوفُ عند الشرخ');

ok(/from '\.\/gate\.js'/.test(placementSrc) && /\bpassed\(/.test(placementSrc),
  'الحكمُ بـ`passed` من `gate.js` — عتبةٌ واحدة لا اثنتان تفترقان');
ok(gate.PASS_RATE === 0.8, `والعتبةُ ٨٠٪ (${gate.PASS_RATE * 100})`);
ok(!/0\.8|PASS_RATE\s*=/.test(bare(placementSrc)),
  'ولا رقمَ عتبةٍ ثانٍ مكتوبٌ في الملفّ');
ok(gate.passed(8, 0) && gate.passed(7, 1) && !gate.passed(6, 2) && !gate.passed(0, 0),
  'على عيّنة الثماني: سبعٌ ⇒ عبور، وستٌّ ⇒ لا عبور، وجلسةٌ فارغة لا تفتح شيئاً');
const failBlock = placementSrc.slice(placementSrc.indexOf('if (!open)'),
  placementSrc.indexOf('const more'));
// **والمقيسُ نداءُ الإعادة لا اسمُها**: صنفُ اللوح `celebrate--again` يقع في الشاشتين.
ok(failBlock.length > 100 && !/\bagain\s*(?:\(|[,)])/.test(failBlock),
  'وشاشةُ الإخفاق بلا زرِّ إعادةٍ — أوّلُ إخفاقٍ يُنهي (والإعادةُ من اللوحة)');
const verdictBlock = placementSrc.slice(placementSrc.indexOf('verdict: ({'));
ok(verdictBlock.includes('openRung(rung)')
  && verdictBlock.indexOf('if (open)') < verdictBlock.indexOf('openRung(rung)')
  && verdictBlock.indexOf('openRung(rung)') < verdictBlock.indexOf('if (!open)'),
  'ولا يُفتح شيءٌ إلا بعد `passed` — الفتحُ في فرع العبور وحدَه');

// ————— ٦) البواباتُ لا تُقفز، والشريحةُ تضمّ ما بين المرحلتين —————
//
// الحدّان **صامتان في رحلة اليوم** (لا قسمَ بين مرحلتين، ولا بوّابةَ يقفزها أحد)،
// فلو امتُحنا بها وحدَها لمرّا ولو كانا فاسدَين. فتُحقَن `rungsOf` بأقسامٍ مصنوعة.

console.log('\n٦. البواباتُ لا تُقفز (بأقسامٍ مصنوعة)');

const fake = (kind, id, nodes = []) => ({ kind, id, title: id, nodes });
const ids = (out) => out.map((r) => r.id).join('،');
const heads = new Set(['a', 'b']);
const never = () => false;
const always = () => true;

const withGate = [fake('stage', 'a'), fake('gate', 'gate-x'), fake('stage', 'b')];
ok(ids(pl.rungsOf(withGate, { crossed: never, heads })) === 'a',
  'بوّابةٌ لم تُجتز تقصُر السلّمَ عندها — «البواباتُ لا تُقفز، تُجتاز بنفسها»');
ok(ids(pl.rungsOf(withGate, { crossed: always, heads })) === 'a،b',
  'وإن اجتازها بنفسه مضى السلّمُ إلى ما بعدها');
ok(pl.rungsOf(withGate, { crossed: always, heads })
  .every((r) => !r.sections.some((s) => s.kind === 'gate')),
  'ولا تدخل بوّابةٌ مجتازةٌ شريحةً — تُتخطّى ولا تُضمّ (لا يُفتح ما يُجتاز بنفسه)');

const between = [
  fake('stage', 'a', [{ id: 'a:1', type: 'x', skills: ['k|1|q'] }]),
  fake('interlude', 'after-a', [{ id: 'mid:1', type: 'y', skills: ['k|2|q'] }]),
  fake('stage', 'b', [{ id: 'b:1', type: 'x', skills: ['k|3|q'] }]),
];
const sliced = pl.rungsOf(between, { crossed: always, heads });
ok(ids(sliced) === 'a،b', 'وقسمٌ بين مرحلتين لا يقطع السلّمَ ولا يزيد درجة');
ok(sliced[0].sections.map((s) => s.id).join('،') === 'a،after-a',
  `بل يدخل شريحةَ مرحلته قبله (${sliced[0].sections.map((s) => s.id).join(' + ')})`);
ok(sliced[0].nodes.map((n) => n.id).join('،') === 'a:1،mid:1'
  && pl.rungKeys(sliced[0]).join('،') === 'k|1|q،k|2|q',
  'وعقدُه تُمتحَن مع مرحلتها ثم تُفتح معها — «تُمتحَن الشريحةُ كلُّها فتُفتح كلُّها»');

// وحدُّ الفتح نفسُه: عقدةُ بوّابةٍ لا تُعلَّم منجزةً بحال
const mixed = { nodes: [{ id: 'a:1', type: 'x' }, { id: 'gate:y', type: 'gate' }] };
ok(pl.openableNodes(mixed).join('،') === 'a:1',
  `والفتحُ يستثني عقدةَ البوّابة (${pl.openableNodes(mixed).join('،')})`);
ok(list.flatMap((r) => r.nodes).every((n) => n.type !== 'gate'),
  'ولا عقدةَ بوّابةٍ في السلّم أصلاً — الحدُّ الأوّل قبل الثاني');

// ————— ٧) الفتحُ: نجمةٌ واحدة، ولا قفلَ رجوعاً —————

console.log('\n٧. فتحٌ لا قفل');

p.reset();
store.clear();
const r0 = pl.rungs()[0];
const openedCount = pl.openRung(r0);
ok(openedCount === r0.nodes.length,
  `اجتيازُ الدرجة الأولى يفتح عقدَها كلَّها (${openedCount} عقدة)`);
ok(r0.nodes.every((n) => p.getStars(n.id) === pl.PLACEMENT_STARS) && pl.PLACEMENT_STARS === 1,
  'بنجمةٍ واحدة — تفكّ القفل ولا تدّعي إتقاناً (حكمُ `unlockUpTo` نفسُه)');
const beyond = pl.rungs().slice(1).flatMap((r) => r.nodes);
ok(beyond.every((n) => !p.isDone(n.id)),
  `وما بعد الدرجة لم يُفتح منه شيء (${beyond.length} عقدةً على حالها)`);
ok(pl.startRung() === 1, `والإعادةُ تستأنف من الدرجة التالية (${pl.startRung()})`);

p.setStars(r0.nodes[0].id, 3);
ok(pl.openRung(r0) === 0 && p.getStars(r0.nodes[0].id) === 3,
  'وإعادةُ الامتحان لا تُنقص نجمةً كسبها بلعبه ولا تعيد عدَّ ما فُتح');
ok(pl.openRung({ nodes: [{ id: 'لا-وجود-لها', type: 'x' }] }) === 0
  && !p.snapshot().stars['لا-وجود-لها'],
  'ولا يُعلَّم معرّفٌ لا موضعَ له في الرحلة');

// **والسلّمُ يقف عند البوّابة**: مَن فتح ما قبلها لا يُمتحَن فيما بعدها حتى يعبرها
p.reset();
store.clear();
for (const rung of pl.rungs()) pl.openRung(rung);
const stalled = pl.state();
ok(stalled.left === 0 && stalled.gate === journey[firstGate].title,
  `ومَن أثبت ما قبل البوّابة وقف سلّمُه عندها باسمها («${stalled.gate}»)`);
crossGates();
ok(pl.state().left > 0 && pl.state().next === journey[firstGate + 1].title,
  `فإذا عبَرها بنفسه استُؤنف الامتحانُ من «${pl.state().next}»`);

p.reset();
store.clear();
ok(pl.startRung() === 0 && pl.state().at === 0 && pl.state().left === pl.rungs().length,
  'وطفلٌ جديد يبدأ من أوّلها');

// ————— ٨) ليتنر: كلُّ محاولةٍ قياسٌ حقيقيّ بلا وسمٍ خاصّ —————

console.log('\n٨. ليتنر يقرأ محاولاته كسائرها');

ok(!/recordAttempt/.test(bare(placementSrc)),
  'الامتحانُ لا يكتب في ليتنر بيده — `renderSession` تكتب كلَّ محاولةٍ كما تكتبها المراجعة');
ok(/progress\.recordAttempt\(concept, range, kind, correct\)/.test(src('review.js')),
  'والمحرّكُ يكتب بمفتاح المهارة نفسِه — لا وسمَ «لحاق» ولا استثناء');
ok(!/markReview/.test(bare(placementSrc)),
  'ولا يُقيَّد مراجعةَ يوم: امتحانُ موضعٍ لا جلسةُ تثبيت — فلا يقول للوالد «راجَع» ولم يراجع');
ok(/from '\.\/review\.js'/.test(placementSrc)
  && /sessionItems\(/.test(placementSrc) && /renderSession\(/.test(placementSrc),
  'ويُبنى بـ`sessionItems` ويُعرَض بـ`renderSession` — لا محرّكَ ثانياً');
ok(!/registerExercise|registerScreen|options:\s*\[/.test(placementSrc),
  'ولا يصنع تمريناً بيده — **صفرُ شكلِ تمرينٍ جديد** بالبناء لا بالوعد');

// **صفرُ نصٍّ منطوقٍ جديد**: ما ينطقه الامتحانُ تمارينُ المراجعة نفسُها، ولا `say` فيه
ok(!/\bsay\(|SPOKEN|audio\./.test(bare(placementSrc)),
  'ولا ينطق حرفاً من عنده — لا `say` ولا `SPOKEN` في الملفّ (صفرُ توليد صوت)');

// ————— ٩) مسطرةُ الامتحان الواحدة —————
//
// **العلّة**: حوضٌ أضيق في الامتحان يعني احتمالَ تخمينٍ أعلى ⇒ **فتحاً بغير حقّ**،
// وهو عينُ ما يحرسه هذا الملفّ كلُّه.

console.log('\n٩. وضعُ الدعم لا يُخفّف امتحاناً');

const widths = (rnd) => {
  const out = {};
  for (let i = 0; i < pl.rungs().length; i++) {
    for (const item of pl.rungItems(i, rnd)) {
      if (!item.options) continue;
      (out[item.kind] ??= new Set()).add(item.options.length);
    }
  }
  return Object.fromEntries(Object.entries(out).sort()
    .map(([kind, set]) => [kind, [...set].sort()]));
};

p.reset();
store.clear();
crossGates();
support.reset();
const standingWidth = widths(rng(5));
const standingSize = pl.rungItems(0, rng(9)).length;
support.setMode(true);
ok(support.modeOn() && support.optionCount() === support.KNOBS.pool.supported
  && support.sessionSize() === support.KNOBS.dose.supported,
  `وضعُ الدعم مشتغلٌ الآن: حوضُه ${support.optionCount()} وجرعتُه ${support.sessionSize()} خارج الامتحان`);
const supportedWidth = widths(rng(5));
ok(JSON.stringify(supportedWidth) === JSON.stringify(standingWidth)
  && Object.keys(standingWidth).length > 0,
  `وحوضُ الامتحان لا يضيق بتشغيله — نوعاً نوعاً (${JSON.stringify(supportedWidth)})`);
ok(pl.rungItems(0, rng(9)).length === standingSize && standingSize > support.KNOBS.dose.supported,
  `وعيّنتُه ${standingSize} لا جرعةَ وليّ الأمر (${support.KNOBS.dose.supported})`);
ok(/duringExam\(/.test(placementSrc) && !/KNOBS|sessionSize\(|optionCount\(/.test(placementSrc),
  'ونطاقُه `duringExam` وحدَه — لا مقدارَ من مقادير الوضع يُقرأ في الملفّ');
ok(support.EXAM_OFF.includes('prompt') && !/mayPrompt/.test(placementSrc),
  'ولا تلقينَ فيه بطبقتين: لا تستدعيه الشاشةُ أصلاً، ويعود إلى القائم في النطاق');
ok(support.rate() === support.KNOBS.pace.supported && support.calm() === true
  && support.beat(100) === Math.round(100 * support.KNOBS.beat.supported),
  'ومقابضُ الراحة تسري كما هي — يُقاس بمسطرةٍ واحدة ولا يُمتحَن بشاشةٍ تُربكه');
ok(!support.examOn(), 'والنطاقُ مردودٌ بعد البناء — لا عَلَمَ يعلق مفتوحاً');
support.reset();
p.reset();
store.clear();

// ————— ١٠) بابُه لوحةُ وليّ الأمر وحدَها —————

console.log('\n١٠. بابُه لوحةُ وليّ الأمر وحدَها');

const parentSrc = src('parent.js');
ok(/placementSection/.test(parentSrc) && /امتحان اللحاق/.test(parentSrc),
  'قسمُ «امتحان اللحاق» في اللوحة');
ok(/placement\.renderPlacement\(/.test(parentSrc) && /examining/.test(parentSrc),
  'والامتحانُ يحلّ محلّ اللوحة خلف بوابتها — لا مسارَ ثانياً يبلغه طفل');
ok(!/placement/.test(bare(src('main.js'))),
  'ولا بابَ له في التوجيه — فلا يفتحه طفلٌ بعنوانٍ يكتبه');
ok(!/https:\/\//.test(parentSrc), 'واللوحةُ تبقى صفرَ عناوينَ خارجية');

const sw = rootSrc('app/sw.js');
ok(/'js\/placement\.js'/.test(sw) && /const VERSION = 'v28'/.test(sw),
  'وهو في قشرة v28 فيعمل دون إنترنت');

const guide = rootSrc('app/welcome/guide.html');
ok(/امتحان اللحاق/.test(guide) && /٨٠/.test(guide),
  'وسطرُه في الصفحة التعريفية (`guide.html`) بعتبته');

console.log(fails ? `\n${fails} فشل` : '\nكل اختبارات «بوابة اللحاق» ناجحة');
process.exit(fails ? 1 : 0);
