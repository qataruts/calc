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
// وخمسةُ أبواب:
//   ١) **المادّة**: من أضعف المهارات لا من المستحقّ — والأضعفُ **أوّلُ** الجلسة.
//   ٢) **المقدار**: عشرةُ تمارين (`GATE_SIZE`)، وتُبنى **من جديد** كل محاولة.
//   ٣) **العبور**: ≥٨٠٪ من المحاولات، ولا عبورَ بجلسةٍ فارغة.
//   ٤) **لا رسوب**: دون العتبة تبقى التاليةُ مقفلة — والإعادةُ فورية بلا حدّ ولا عقاب.
//   ٥) **لكلِّ مهارةٍ تمرينُ مفهومها**: نوعُ التمرين يشترك فيه مفهومان (`equal|5|make`
//      و`bond|10|make` — `METHOD.md §٦`)، فلا يبتلع أحدُهما تمارينَ الآخر.
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
const before = curriculum.STAGES.slice(0, curriculum.STAGES
  .findIndex((s) => s.id === gateOne.after) + 1);
const learned = before.flatMap((stage) => stage.stations);
const WEAK = ['numeral|7|match', 'count|10|give'];

for (const station of learned) {
  progress.setStars(`${station.type}:${station.part}`, 3);
  for (const key of station.skills || []) {
    const [concept, range, kind] = key.split('|');
    const weak = WEAK.includes(key);
    // الضعيفةُ: زلّتان ثم إصابة (صندوقٌ أول، وموعدٌ غداً) · والقويّة: ثلاثُ إصابات
    for (const correct of (weak ? [false, false, true] : [true, true, true])) {
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
  `طفلٌ أتمّ ${learned.length} محطةً قبل «${gateOne.title}» و${skills.length} مهارةً مسجَّلة`);
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
  const items = gate.gateItems(seeded(11));
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
  const same = gate.gateItems(seeded(11)).map((i) => i.id).join('|');
  const other = gate.gateItems(seeded(29)).map((i) => i.id).join('|');
  ok(same === items.map((i) => i.id).join('|'),
    'البذرةُ نفسُها تبني الجلسةَ نفسَها (فتُقاس ولا تُخمَّن)');
  ok(other !== same, 'ومحاولةٌ أخرى تبني تمارينَ غيرَها — لا يُستظهَر نمطٌ بالإعادة');

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
        const [item] = review.sessionItems(
          [{ concept: skill[0], range: Number(skill[1]), kind }], 1, seeded(7));
        return [concept, item];
      });
      ok(got.every(([concept, item]) => item && item.concept === concept),
        `[${kind}] كلُّ مفهومٍ يُنتج تمرينَ نفسِه (${got
          .map(([c, i]) => `${c} ← ${i ? i.concept : 'لا تمرين'}`).join('، ')})`);
      ok(new Set(got.map(([, i]) => i && i.by)).size === concepts.size,
        `و[${kind}] لكلٍّ مالكُه فيرسمه مُصيِّرُه هو (${got
          .map(([c, i]) => `${c}:${i ? i.by : '؟'}`).join('، ')})`);
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
