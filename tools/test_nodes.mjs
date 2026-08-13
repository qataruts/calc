// حارسُ «لا عقدةَ بلا كاتبِ نجمة»:
//   node tools/test_nodes.mjs
// يحرس: app/js/**
//   («لا عقدةَ بلا كاتبِ نجمة»: العقدُ من المنهج وكاتبوها في الوحدات)
//
// ————— بذرةُ المنصة (منسوخٌ من «اِقْرَأْ» ومكيَّف) —————
//
// **العيبُ الذي وُلد منه** (بلاغ المالك في اقرأ، ١٣ أغسطس ٢٠٢٦): «البرنامج توقّف عند
// هذا الموضع، وعند الانتهاء منه لا يفتح الحلقة التالية».
//
// وعلّتُه معرّفان لعقدةٍ واحدة: الرحلةُ تنشئ العقدة بمعرّف، والشاشةُ تكتب نجمتَها
// بمعرّفٍ آخر. فالنجمةُ تُحفظ في مكانٍ لا يُقرأ ⇒ `isDone` كاذبةٌ أبداً ⇒ **الجبهةُ
// تتجمّد عند تلك العقدة فلا يُفتَح بعدها شيءٌ ما حيي الجهاز**.
//
// وهو صنفٌ يستحقّ حارساً لا إصلاحاً: **كلُّ عقدةٍ في الرحلة يجب أن يكون لها شاشةٌ
// تكتب نجمتَها بمعرّفها هو**. وسابقةٌ لا كاتبَ لها تعني طريقاً مسدوداً في الرحلة —
// ولا يظهر في اختبارٍ ولا لقطة، بل في جهاز طفلٍ بعد أسابيع.
//
// ————— النومُ الذاتيّ (`docs/SEED.md §٥`) —————
//
// هذا الحارس يقيس **علاقةَ الرحلة بشاشاتها**، فلا معنى له قبل أن يوجد الطرفان.
// فمقياسُه **الجردُ لا رايةٌ تُضبط بيد**، على درجتين:
//   • الرحلةُ فارغة (اليوم) ⇒ ينام كلُّه — الجلسة ١ توقظ درجتَه الأولى بكتابة المنهج.
//   • رحلةٌ بلا شاشاتِ تمارين بعدُ (الجلسة ١–٢) ⇒ تعمل درجةُ **بنية المعرّفات**
//     وتنام درجةُ **كاتب النجمة** — توقظها الجلسةُ ٣ بأول شاشة محطة.
// وبهذا لا يملك أحدٌ أن ينسى إيقاظه: الجردُ يجده يومَ يصير له ما يقيسه.

import { readFileSync, readdirSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const read = (name) => readFileSync(new URL(name, APP), 'utf8');

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const progress = await import(new URL('progress.js', APP));
const nodes = progress.allNodes();

// **وحداتُ البذرة لا تُعدّ شاشاتِ تمارين**: هذه هي المنصةُ نفسُها (مصنعُ العقد
// والموجِّهُ والمحرّكاتُ)، وما يقيسه الحارسُ **مَن يكتب النجمة** من شاشات المحطات.
// و`gate.js` **خارج هذه القائمة قصداً**: هو من البذرة، لكنه **شاشةٌ تكتب نجمةَ
// عقدتها** (`gate:<البوابة>`) — فمَن أخرجه من الجرد أعمى الحارسَ عن سابقة البوابات.
const SEED = new Set([
  'main.js', 'progress.js', 'curriculum.js', 'ui.js', 'audio.js', 'review.js', 'parent.js',
]);
const modules = readdirSync(APP).filter((f) => f.endsWith('.js'));
const screenFiles = modules.filter((f) => !SEED.has(f));

console.log('\n١. بنيةُ معرّفات الرحلة');

if (!nodes.length) {
  dormant('الرحلةُ فارغة (`app/js/curriculum.js` بذرةٌ تملؤها الجلسة ١)');
} else {
  ok(nodes.length > 0, `الرحلةُ فيها ${nodes.length} عقدة`);

  const ids = nodes.map((n) => n.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  ok(dupes.length === 0,
    `وكلُّ معرّفٍ فريد${dupes.length ? ` — مكرَّر: ${[...new Set(dupes)].join('، ')}` : ''}`);
  ok(ids.every((id) => id && id.includes(':')), 'ولكلٍّ سابقةٌ ومعرّف «<النوع>:<الجزء>»');
  ok(nodes.every((n) => n.type && n.part), 'ولكلٍّ نوعٌ وجزءٌ مُعلَنان (بهما يوجّه main.js)');
  // القسمُ يحمل عقدَه، والعقدةُ تعرف قسمَها — وإلا عميت عنها لوحةُ وليّ الأمر
  ok(nodes.every((n) => progress.sectionOf(n.id)), 'وكلُّ عقدةٍ تسكن قسماً معلوماً');
}

console.log('\n٢. لكل سابقةِ عقدةٍ شاشةٌ تكتب نجمتَها');

// **نومُه صار بالسابقة لا بالرحلة كلها** (الجلسة ١، وقد أيقظت الرحلةُ هذا الباب):
// الرحلةُ اثنتان وعشرون سابقةً تُكتب شاشاتُها في **خمس جلسات**، فمطالبةُ الجميع يوم
// تُكتب أوّلُ شاشة تُسقِط الجلسةَ الثالثة بذنب السابعة. والمقياسُ الصحيح **الموجِّه**:
// سابقةٌ سجّلت شاشتَها فيه (`registerScreen('<السابقة>'`) لها شاشةٌ فعلاً، فيجب أن
// يكتب أحدٌ نجمتَها بمعرّفها هو — وهذا عينُ العيب الذي وُلد منه الحارس. وسابقةٌ لم
// تُسجَّل بعدُ نائمةٌ بشرطٍ **مجرود** يستيقظ يومَ تُسجَّل. ولا يخفّ الحارسُ بذلك بل
// **يشتدّ**: كان يقيس بوجود ملفٍّ ما في المجلد، وصار يقيس بالتسجيل عينِه.
if (!nodes.length) {
  dormant('لا عقدةَ في الرحلة تُنسَب إلى كاتب (الجلسة ١ تكتب المنهج)');
} else {
  // **مصنعُ العقد والموجِّه يُستثنيان**: `progress.js` ينشئ المعرّفات و`main.js`
  // يحرس بها الطريق — وكلاهما يذكر كلَّ سابقة. والمقيسُ **مَن يكتب النجمة** لا مَن
  // يذكر الاسم؛ ولولا هذا الاستثناء لمرّ العيبُ نفسُه.
  const writers = new Map();
  for (const name of screenFiles) {
    const src = read(name);
    if (!src.includes('setStars(')) continue;
    const literals = new Set([...src.matchAll(/['"`]([a-z][a-z0-9-]*)['"`:]/g)].map((m) => m[1]));
    writers.set(name, literals);
  }

  // السوابقُ المسجَّلة في الموجِّه — تُجرَد من `app/js/` كلِّها (البوابةُ تسجّلها
  // بذرةُ المنصة في `main.js`، ووحداتُ التمارين تسجّل نفسَها من الجلسة ٣).
  const registered = new Set(modules.flatMap((name) =>
    [...read(name).matchAll(/registerScreen\(\s*['"`]([a-z][a-z0-9-]*)['"`]/g)].map((m) => m[1])));

  const prefixes = [...new Set(nodes.map((n) => n.id.split(':')[0]))].sort();
  const waiting = prefixes.filter((prefix) => !registered.has(prefix));
  const live = prefixes.filter((prefix) => registered.has(prefix));

  ok(writers.size > 0, `شاشاتٌ تكتب النجوم: ${writers.size} وحدة`);

  const orphans = live.filter((prefix) =>
    ![...writers].some(([, set]) => set.has(prefix)));
  ok(orphans.length === 0,
    `ولا سابقةَ مسجَّلةٍ بلا كاتب (${live.length} من ${prefixes.length} سابقة)`
    + (orphans.length ? ` — يتيمة: ${orphans.join('، ')}` : ''));

  if (waiting.length) {
    dormant(`${waiting.length} سابقةً لم تُسجَّل شاشتُها في الموجِّه بعد `
      + `(${waiting.join('، ')})`);
  }
}

console.log(fails
  ? `\n${fails} فشل`
  : `\nكل اختبارات عقد الرحلة ناجحة${asleep ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
process.exit(fails ? 1 : 0);
