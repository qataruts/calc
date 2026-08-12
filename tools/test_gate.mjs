// حارسُ البوابات — «إتقانٌ بلا رسوب، ومن **أضعف** ما في يده» (`METHOD.md §٥`):
//   node tools/test_gate.mjs
//
// ————— العلّةُ: بوابةٌ تمرّ بلا معنى لا تُفشِل شيئاً —————
//
// البوابةُ سطورٌ قليلة في `gate.js`، وكلُّ خطأٍ فيها **صامت**: لو بنت جلستَها من
// `dueSkills()` بدل `weakestSkills()` لَعملت الشاشةُ وعملت الاختباراتُ كلُّها ومرّ
// الطفلُ — لأنّ **ما حان موعدُه ليس ما ضعف**: يوم البوابة قد لا يكون مستحقّاً إلا
// القويُّ وحدَه، فتسأل البوابةُ عمّا يتقنه وتفتح على ما لا يتقن. ولا يظهر ذلك في
// شاشةٍ ولا في لوحة: يظهر بعد شهرٍ في طفلٍ عبر ولم يعبر.
//
// فيُقلَب السؤال: **تُصنَع سجلّاتُ ليتنر بيدٍ** — طفلٌ أتمّ المراحل الأربع، ومهارتان
// بعينهما أُضعِفتا، **ولا مهارةَ واحدة مستحقّةٌ اليوم** — ثم يُسأل: أتبني البوابةُ
// جلستَها من الضعيفتين؟ فإن بنت من المستحقّ عادت الجلسةُ فارغةً أو من التنويع، وسقط
// هذا الحارس.
//
// وستّةُ أبواب:
//   ١) **المادّة**: من أضعف المهارات لا من المستحقّ — والأضعفُ **أوّلُ** الجلسة.
//   ٢) **المقدار**: عشرةُ تمارين (`GATE_SIZE`)، وتُبنى **من جديد** كل محاولة.
//   ٣) **العبور**: ≥٨٠٪ من المحاولات، ولا عبورَ بجلسةٍ فارغة.
//   ٤) **لا رسوب**: دون العتبة تبقى التاليةُ مقفلة — والإعادةُ فورية بلا حدّ ولا عقاب.
//   ٥) **لكلِّ مهارةٍ تمرينُ مفهومها**: نوعُ التمرين يشترك فيه مفهومان (`equal|5|make`
//      و`bond|10|make` — `METHOD.md §٦`)، فلا يبتلع أحدُهما تمارينَ الآخر.
//   ٦) **ومدى كلِّ بوابةٍ مدَاها هي** (الجلسة ٦): `METHOD.md §٣` يذكر لكلٍّ ممّ تسأل،
//      وبوابةُ العمليات «من أضعف مهارات **المرحلتين ٥–٦**» — فيُصنَع سجلٌّ **أضعفُ ما
//      فيه خارج مداها** ويُسأل: أتبني منه أم من أضعف ما في مداها؟ ولو سقط المدى لَعبر
//      الطفلُ بابَ العمليات وهو يُمتحَن في التقدير الفوريّ، وذلك أخضرُ كاذبٌ صامت.
//
// ————— النومُ الذاتيّ (`docs/SEED.md §٥`) —————
//
// لا مهارةَ تُقاس قبل أوّل شاشة تمرين، فينام البابان الأولان بشرطٍ **مجرود** (لا وحدةَ
// في `app/js/` تحقن بانِيَ التمارين — `setBuilders`) ويستيقظان من تلقائهما. وأبوابُ
// العبور والقفل تعمل من اليوم الأول: هي في بذرة المنصة لا في مادّة المنهج.

import { readFileSync, readdirSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const src = (name) => readFileSync(new URL(name, APP), 'utf8');
const SEED = new Set([
  'main.js', 'progress.js', 'curriculum.js', 'ui.js', 'audio.js', 'review.js', 'parent.js',
]);
const screenFiles = readdirSync(APP).filter((f) => f.endsWith('.js') && !SEED.has(f));

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const progress = await import(new URL('progress.js', APP));
const curriculum = await import(new URL('curriculum.js', APP));
const gate = await import(new URL('gate.js', APP));
const review = await import(new URL('review.js', APP));
const registry = await import(new URL('registry.js', APP));
const { seeded } = await import(new URL('ui.js', APP));
// وحداتُ التمارين تُحمَّل لأثرها: هي التي تسجّل بانِيَ كل نوع (`registerExercise`)
for (const file of screenFiles) await import(new URL(file, APP));

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

// ————— السجلُّ المصنوع: طفلٌ بلغ البوابة الأولى —————
//
// **يُبنى بالواجهة العامّة لا بحقن حالة**: `recordAttempt` هي التي يناديها كلُّ تمرين،
// فما يُصنَع هنا هو عينُ ما يصنعه إصبعُ الطفل — ولو تبدّلت قواعدُ ليتنر تبدّل معها.
//
// **وكلُّ مهارةٍ تنتهي بإصابة**، فيصير موعدُها غداً فصاعداً: فلا مستحقَّ اليوم البتّة.
// وهو الحالُ الذي يفضح `dueSkills()` لو بُنيت البوابةُ منها.

const gateOne = curriculum.GATES[0];
const gateTwo = curriculum.GATES[1];
// **يُتعلَّم إلى بوابة العمليات** كي يُقاس مدَياهما معاً: الأولى من المراحل ١–٤،
// والثانية من ٥–٦ — والفرقُ بينهما لا يظهر إلا في سجلٍّ فيه الطرفان.
const before = curriculum.STAGES.slice(0, curriculum.STAGES
  .findIndex((s) => s.id === gateTwo.after) + 1);
const learned = before.flatMap((stage) => stage.stations);

/** أضعفُ ما في يده — و**كلُّه خارج مدى بوابة العمليات** (المراحل ١–٤). */
const WEAK = ['count|10|give', 'numeral|7|match'];
/**
 * وأضعفُ ما **داخل** مداها (المرحلتان ٥–٦) — وهو دون الأولَين ضعفاً.
 *
 * **ومفتاحٌ لا تدرّسه إلا محطةٌ واحدة** (`sub|5|solve` — ٦·٣): مفتاحٌ تشترك فيه محطاتٌ
 * (`sub|10|solve` في ٦·٥ و٦·٧ و٦·٨) تتضاعف زلّاتُه بعدد محطاته فيسبق المقصود، فيقيس
 * الحارسُ تعدادَ المحطات لا المدى.
 */
const WEAK_OPS = ['sub|5|solve'];

for (const station of learned) {
  progress.setStars(`${station.type}:${station.part}`, 3);
  for (const key of station.skills || []) {
    const [concept, range, kind] = key.split('|');
    // ثلاثُ درجاتٍ من الضعف: خارجُ المدى أضعفُها (ثلاثُ زلّات)، فداخلُه (زلّتان)،
    // فالقويّةُ (بلا زلّة) — والترتيبُ بينها هو ما يقيسه بابُ المدى.
    const tries = WEAK.includes(key) ? [false, false, false, true]
      : WEAK_OPS.includes(key) ? [false, false, true]
        : [true, true, true];
    for (const correct of tries) {
      progress.recordAttempt(concept, Number(range), kind, correct);
    }
  }
}

const skills = progress.skills();
const due = progress.dueSkills();
const weakest = progress.weakestSkills();
const key = (s) => `${s.concept}|${s.range}|${s.kind}`;

console.log('\n— السجلُّ المصنوع: أضعفُ ما في يده ليس ما حان موعدُه —');
ok(skills.length >= 10,
  `طفلٌ أتمّ ${learned.length} محطةً حتى «${gateTwo.title}» و${skills.length} مهارةً مسجَّلة`);
ok(due.length === 0,
  `ولا مهارةَ واحدة **مستحقّةٌ اليوم** (كلُّها انتهت بإصابة، فموعدُها غداً فصاعداً)`
  + (due.length ? ` — مستحقّ: ${due.length}` : ''));
ok(weakest.length === skills.length && WEAK.every((k) => weakest.slice(0, WEAK.length)
  .map(key).includes(k)),
`و**أضعفُ ما في يده أوّلُ القائمة**: ${weakest.slice(0, WEAK.length).map(key).join(' · ')}`);

// ————— ١+٢) مادّةُ البوابة ومقدارُها —————

console.log('\n— ١) البوابة تبني من أضعف المهارات (لا من المستحقّ) —');
const builders = screenFiles.filter((f) => /registerExercise\s*\(/.test(src(f)));
if (!builders.length) {
  dormant('لا وحدةَ تمارينَ تسجّل بانياً بعد (`registerExercise` — الجلسة ٣ تكتب أولاها)');
} else {
  const items = gate.gateItems(gateOne.id, seeded(11));
  ok(items.length === gate.GATE_SIZE,
    `جلسةُ البوابة ${items.length} تمريناً (${gate.GATE_SIZE} بنصّ \`METHOD.md §٥\`)`);
  // **الأضعفُ أولاً**: صدرُ الجلسة هو صدرُ قائمة الضعف نفسُه، مفهوماً ومدىً ونوعاً
  const head = items.slice(0, WEAK.length).map((i) => `${i.concept}|${i.range}|${i.kind}`);
  ok(WEAK.every((k) => head.includes(k)),
    `و**تمارينُها الأولى تمارينُ الأضعف بعينها**: ${head.join(' · ')}`
    + (WEAK.every((k) => head.includes(k)) ? '' : ` — والمنتظَر ${WEAK.join(' · ')}`));
  ok(items.every((i) => i.kind && i.concept),
    'وكلُّ تمرينٍ يحمل مفتاحَ مهارته (فيُسجَّل الخطأ على المطلوب لا على ما لمس)');

  console.log('\n— ٢) تُبنى من جديد كل محاولة (لا نمطَ يُحفَظ فيُستظهَر) —');
  const same = gate.gateItems(gateOne.id, seeded(11)).map((i) => i.id).join('|');
  const other = gate.gateItems(gateOne.id, seeded(29)).map((i) => i.id).join('|');
  ok(same === items.map((i) => i.id).join('|'),
    'البذرةُ نفسُها تبني الجلسةَ نفسَها (فتُقاس ولا تُخمَّن)');
  ok(other !== same, 'ومحاولةٌ أخرى تبني تمارينَ غيرَها — لا يُستظهَر نمطٌ بالإعادة');

  /* ————— ٦) مدى البوابة: لكلٍّ ممّ تسأل (`METHOD.md §٣`) —————

     السجلُّ المصنوع أعلاه **أضعفُ ما فيه خارج مدى بوابة العمليات**: `count|10|give`
     بثلاث زلّات (المرحلة ٢)، ثم `sub|10|solve` بزلّتين (المرحلة ٦). فلو بنت البوابةُ
     من أضعف ما في يده مطلقاً لَتصدّرت جلستَها مهارةُ عدٍّ من المرحلة الثانية، ومضى
     الطفلُ إلى ما بعد العشرة وعملياتُه متزعزعة — وهي عينُ العلّة التي وُجدت لها. */
  console.log('\n— ٦) ولكلِّ بوابةٍ مدَاها المعلَن (الأولى ١–٤ · والعمليات ٥–٦) —');
  const scopeTwo = new Set(curriculum.gateSkills(gateTwo.id));
  const scopeOne = new Set(curriculum.gateSkills(gateOne.id));
  ok(scopeTwo.size > 0 && [...scopeTwo].every((k) => !scopeOne.has(k)),
    `مدَياهما منفصلان: «${gateOne.title}» ${scopeOne.size} مفتاحاً و«${gateTwo.title}» `
    + `${scopeTwo.size} مفتاحاً، ولا مفتاحَ مشترك`);

  const weakestKey = key(weakest[0]);
  ok(!scopeTwo.has(weakestKey) && WEAK.includes(weakestKey),
    `**وأضعفُ ما في يده خارج مدى العمليات**: «${weakestKey}» — فبها يُقاس المدى`);

  const opsItems = gate.gateItems(gateTwo.id, seeded(11));
  const opsHead = opsItems.length ? key(opsItems[0]) : 'لا تمرين';
  ok(opsHead === WEAK_OPS[0],
    `**وبوابةُ العمليات تبدأ بأضعف ما في مدَاها**: «${opsHead}» `
    + `(والمنتظَر «${WEAK_OPS[0]}»)`);
  const outside = opsItems.slice(0, WEAK.length + 1).map(key).filter((k) => !scopeTwo.has(k));
  ok(outside.length === 0,
    'ولا يتصدّرها ما خرج عن مدَاها ولو كان أضعفَ ما في يده'
    + (outside.length ? ` — دخيل: ${outside.join('، ')}` : ''));

  console.log('\n— ٥) لكلِّ مهارةٍ تمرينُ مفهومها (نوعُ التمرين يشترك فيه مفهومان) —');
  // `equal|5|make` (اجعلهما سواء) و`bond|10|make` (أصدقاء العشرة): اسمُ النوع واحد،
  // فلو ابتلع أحدُ المالكين الآخرَ سقطت تمارينُه من المراجعة والبوابة **بلا صوت**.
  const shared = [...new Set(curriculum.stations()
    .flatMap((s) => s.skills || []).map((k) => k.split('|')[2]))]
    .map((kind) => [kind, new Set(curriculum.stations().flatMap((s) => (s.skills || [])
      .filter((k) => k.split('|')[2] === kind).map((k) => k.split('|')[0])))])
    .filter(([, concepts]) => concepts.size > 1);
  if (!shared.length) {
    dormant('لا نوعَ تمرينٍ يشترك فيه مفهومان بعد');
  } else {
    // **والنومُ بالنوع لا بالجميع** (`SEED.md §٩` — درسُ `test_measure` و`test_nodes`):
    // مفهومٌ لم تُسجَّل شاشةُ محطته في الموجِّه بعد **لا مالكَ له**، فمطالبتُه اليوم
    // مطالبةٌ بشيفرة جلسةٍ لم تأتِ. والشرطُ **مجرودٌ من السجلّ** لا رايةٌ تُضبط بيد.
    const typeOf = (concept) => curriculum.stations()
      .find((s) => (s.skills || []).some((k) => k.startsWith(`${concept}|`)))?.type;
    for (const [kind, concepts] of shared) {
      const orphan = [...concepts].filter((c) => !registry.registered().includes(typeOf(c)));
      if (orphan.length) {
        dormant(`[${kind}] لا شاشةَ مسجَّلةً لِـ${orphan.join('، ')} بعد `
          + `(يشترك فيه: ${[...concepts].join('، ')})`);
        continue;
      }
      const got = [...concepts].map((concept) => {
        const skill = curriculum.stations().flatMap((s) => s.skills || [])
          .find((k) => k.startsWith(`${concept}|`) && k.endsWith(`|${kind}`)).split('|');
        /* **والمدى كما كتبه المنهج** (الجلسة ٧): مدياتُ المرحلة ٨ **وصفيةٌ لا عددية**
           (`measure|length|pick`)، فتحويلُها عدداً يعطي `NaN` فيسقط التطابقُ التامّ في
           `stationForSkill` وتُبنى مهارةُ غيرِها — وهو عينُ ما يحرسه هذا الباب، فلا
           يجوز أن يقع فيه هو. */
        const range = Number.isFinite(Number(skill[1])) ? Number(skill[1]) : skill[1];
        const [item] = review.sessionItems([{ concept: skill[0], range, kind }], 1, seeded(7));
        return [concept, item];
      });
      ok(got.every(([concept, item]) => item && item.concept === concept),
        `[${kind}] كلُّ مفهومٍ يُنتج تمرينَ نفسِه (${got
          .map(([c, i]) => `${c} ← ${i ? i.concept : 'لا تمرين'}`).join('، ')})`);

      /* **ومالكُ الجواب هو الذي يرسمه**: `by` فهرسُ الوحدة التي بنت التمرين — فيجب أن
         **يتساوى لمفهومين سكنا وحدةً واحدة ويختلف لمن افترقا**، لا أن يختلف دائماً.
         (كانت المقابلةُ «عددُ المالكين = عددُ المفاهيم» فصحّت للمرحلة ٥ — `equal` في
         `counting.js` و`bond` في `bonds.js` — وسقطت للمرحلة ٦: `add` و`sub` و`diff`
         ثلاثةُ مفاهيم بثلاث شاشات **في وحدةٍ واحدة**، ومُصيِّرُها واحدٌ يوزّع بوجه
         الجولة. والمقيسُ الصحيح **مطابقةُ المالك للملفّ في الحالين**.) */
      const fileOf = (concept) => screenFiles.find((f) => new RegExp(
        `registerScreen\\(\\s*['"\`]${typeOf(concept)}['"\`]`).test(src(f))) || `؟${concept}`;
      const pairs = got.flatMap(([ca, ia], i) =>
        got.slice(i + 1).map(([cb, ib]) => [ca, ia, cb, ib]));
      const split = pairs.filter(([ca, ia, cb, ib]) =>
        (fileOf(ca) === fileOf(cb)) !== (ia && ib && ia.by === ib.by));
      ok(split.length === 0,
        `و[${kind}] لكلٍّ مالكُه فيرسمه مُصيِّرُه هو — مالكٌ واحدٌ لمفاهيم الوحدة الواحدة `
        + `(${got.map(([c, i]) => `${c}:${i ? i.by : '؟'}@${fileOf(c)}`).join('، ')})`
        + (split.length ? ` — **افترق: ${split.map(([a, , b]) => `${a}/${b}`).join('، ')}**` : ''));
    }
  }
}

// ————— ٣) العبور: ≥٨٠٪ من المحاولات، ولا عبورَ بجلسةٍ فارغة —————

console.log('\n— ٣) العبور بالمحاولة لا بالتمرين —');
ok(gate.passed(8, 2) && gate.passed(10, 0) && gate.passed(9, 1),
  `ثمانٍ من عشرٍ تعبر (العتبة ${Math.round(gate.PASS_RATE * 100)}٪)`);
ok(!gate.passed(7, 3) && !gate.passed(0, 5),
  'وسبعٌ من عشرٍ لا تعبر — والعتبةُ نسبةٌ لا عدد');
ok(!gate.passed(0, 0),
  'ولا تُفتَح البوابةُ بجلسةٍ بلا محاولةٍ واحدة (لا عبورَ بالصمت)');

// ————— ٤) لا رسوب: التاليةُ مقفلة، والإعادةُ فورية —————

console.log('\n— ٤) لا رسوب: دونها تبقى التاليةُ مقفلة، بلا حدٍّ ولا عقاب —');
const nodeId = `gate:${gateOne.id}`;
const after = progress.allNodes()[progress.allNodes().findIndex((n) => n.id === nodeId) + 1];
ok(progress.isNodeUnlockedById(nodeId) && !progress.isDone(nodeId),
  `البوابةُ «${gateOne.title}» مفتوحةٌ ولم تُعبَر بعد`);
ok(after && !progress.isNodeUnlockedById(after.id),
  `وما بعدها مقفلٌ ما لم تُعبَر (${after ? after.title : 'لا عقدة'})`);
progress.setStars(nodeId, 2);
ok(after && progress.isNodeUnlockedById(after.id),
  'وتُفتَح التاليةُ بعبورها — لا رسوبَ ولا حدَّ للمحاولات');

// **ولا نصَّ منطوقاً جديداً في البوابة** (`METHOD.md §٥` — تمارينُها تمارينُ المراجعة):
// لو ألّفت نصّاً لَاحتاج تصريفاً، والبوابةُ تُفتح للطفل قبل أن تُصرَّف دفعةٌ.
console.log('\n— وعدُ البوابة: لا محتوى جديداً ولا نصَّ منطوقاً جديداً —');
const gateSrc = src('gate.js');
ok(/sessionItems\s*\(/.test(gateSrc) && /weakestSkills\s*\(/.test(gateSrc),
  'تبني بمحرّك المراجعة نفسِه من `weakestSkills()` — فما يُقاس يُسأل عنه فيها');
ok(!/export\s+const\s+SPOKEN\b/.test(gateSrc),
  'ولا تُعلن نصّاً منطوقاً خاصاً بها (فلا سطرَ يُضاف إلى قائمة الصوت)');

console.log(fails
  ? `\n${fails} فشل`
  : `\nكل اختبارات البوابة ناجحة${asleep ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
process.exit(fails ? 1 : 0);
