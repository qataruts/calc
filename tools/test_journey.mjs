// **حارسُ الرحلة الكاملة** — «تُجتاز من الصفر حتى العقدة الأخيرة»:
//   node tools/test_journey.mjs
//
// ————— العلّةُ التي وُلد منها (بندُ الجلسة ٧) —————
//
// حرّاسُنا كلُّهم يقيسون **قِطَعاً**: هذا يقيس الجبهة، وهذا الرسمَ، وهذا القياس، وهذا
// البوابة. ولا واحدَ منهم يسأل السؤالَ الذي يسأله المالكُ: **أتُجتاز الرحلةُ كلُّها من
// أوّلها إلى آخرها؟** وطريقٌ مسدود في المنتصف — عقدةٌ لا بانيَ لها، أو نجمةٌ لا تفتح
// ما بعدها، أو بوابةٌ تُبنى فارغةً فلا تُعبَر — **يمرّ أخضرَ في كل ما مضى**، ويظهر في
// جهاز طفلٍ بعد أسابيع (وهو عينُ صنف العيب الذي وُلد منه `test_nodes.mjs` في اقرأ).
//
// فهذا الحارس **يمشي الرحلةَ عقدةً عقدة** على سجلٍّ نظيف: يفتح ما انفتح، ويبني مادّةَ
// كلِّ محطة، ويسجّل ما تسجّله لو أصاب الطفلُ فيها، ثم يسأل: **أانفتحت التي بعدها؟**
// حتى العقدة الأخيرة. **ولا يستطيع أن يقيس الرسمَ** (لا DOM هنا) — وذاك عملُ
// `browser_test.html` الذي يسوق الشاشاتِ لمساً؛ وهذا يقيس **البنيةَ والمادّةَ والقفل**.
//
// وستةُ أبواب:
//   ١) **عددُ العقد** — محسوبٌ ثلاثَ مرّاتٍ من ثلاثة مصادر مستقلّة، ويُطبَع.
//   ٢) **البدء** — من سجلٍّ نظيف لا تُفتَح إلا العقدةُ الأولى.
//   ٣) **المشي** — لكل عقدةٍ بانٍ يُنتج خطّتَها (أو إعفاءٌ مكتوب)، وجولاتُ «وحدك»
//      تقيس **مفتاحاً بلغته الرحلةُ** لا مفتاحَ محطةٍ لم تأتِ بعد.
//   ٤) **القفل** — تنفتح التاليةُ بإتمام سابقتها، ولا تنفتح قبله.
//   ٥) **الختام** — تُبلَغ العقدةُ الأخيرة، وتكتمل الجبهةُ، ولا عقدةَ تالية.
//   ٦) **الميدالية** — لكل محطةٍ **معلمُ مرحلتها** في ميدالية ختامها (الجلسة ٨،
//      قيدُ الجلسة هـ): معلمٌ مرسومٌ يعرفه `ui.js`، وهو عينُ معلم قسمها على الخريطة.

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
const { seeded, LANDMARK_NAMES } = await import(new URL('ui.js', APP));
const { medalOf } = await import(new URL('station.js', APP));

/* **والسوابقُ المسجَّلة تُجرَد من نصّ `app/js/` كلِّه** (نظيرُ `test_nodes.mjs`) لا من
   السجلّ الحيّ: بوابةُ الإتقان تسجّلها **بذرةُ المنصة في `main.js`**، و`main.js` يمسّ
   الـDOM وقتَ التحميل فلا يُستورَد هنا. فلو قِيس بالسجلّ الحيّ لَقيل «لا شاشةَ
   للبوابة» وهي مسجَّلةٌ في جهاز الطفل — وذلك أحمرُ كاذب. */
const registered = new Set(readdirSync(APP).filter((f) => f.endsWith('.js'))
  .flatMap((f) => [...src(f).matchAll(/registerScreen\(\s*['"`]([a-z][a-z0-9-]*)['"`]/g)]
    .map((m) => m[1])));

// وحداتُ التمارين تُحمَّل لأثرها: تسجّل شاشاتِها وبانِيَ تمارينها
const modules = [];
for (const file of screenFiles) modules.push([file, await import(new URL(file, APP))]);

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

const nodes = progress.allNodes();

if (!nodes.length) {
  console.log('\n١. عددُ العقد');
  dormant('الرحلةُ فارغة (`app/js/curriculum.js` بذرةٌ تملؤها الجلسة ١)');
  console.log('\nلا رحلةَ تُمشى بعد');
  process.exit(0);
}

// ————— ١) عددُ العقد: ثلاثةُ مصادرَ مستقلّة تتفق، والحارسُ يطبعه —————
//
// **ولِمَ ثلاثة؟** لأنّ رقماً واحداً مطبوعاً لا يُثبت شيئاً: العددُ يُطبَع ليُقابَل.
// فيُحسَب من **الرحلة المؤلَّفة** (`sections()` — وهي التي تقرؤها الخريطة حرفاً)، ومن
// **بيانات المنهج** (`STAGES` و`GATES`)، ومن **نصّ المصدر** (عددُ الجبهات المكتوبة
// وعددُ البوابات) — ومصدرٌ ينحرف عن أخويه بيانٌ ميّت أو عقدةٌ لا تصل.

console.log('\n١. عددُ العقد: ثلاثةُ مصادرَ مستقلّة');

const fromJourney = nodes.length;
const fromData = curriculum.STAGES.reduce((n, s) => n + s.stations.length, 0)
  + curriculum.GATES.length;
const text = src('curriculum.js');
const fromSource = (text.match(/\bfrontier:\s*\{/g) || []).length
  + (text.match(/\bafter:\s*'/g) || []).length;

ok(fromJourney === fromData && fromData === fromSource,
  `**الرحلةُ ${fromJourney} عقدة** — ${curriculum.STAGES.length} مرحلةً `
  + `(${fromJourney - curriculum.GATES.length} محطة) و${curriculum.GATES.length} بوابات. `
  + `والمصادرُ الثلاثة تتفق (الرحلةُ ${fromJourney} · البياناتُ ${fromData} · المصدرُ ${fromSource})`);

const sections = progress.journey();
ok(sections.every((s) => (s.nodes || []).length > 0),
  `وهي ${sections.length} قسماً على الخريطة، لا قسمَ منها بلا عقدة`);
ok(nodes.every((n) => progress.findNode(n.id) && progress.sectionOf(n.id)),
  'وكلُّ عقدةٍ تُوجَد بمعرّفها وتسكن قسماً معلوماً (فتُرسَم ويُوجَّه إليها)');

// ————— بانِي مادّةِ كلِّ محطة: مقروءٌ من الوحدات لا مكتوبٌ هنا —————
//
// كلُّ وحدةِ تمارينٍ تُصدِّر `buildStation(id, seed)` وتردّ `null` لِما ليس من أنواعها،
// فيُسأل كلُّ بانٍ بدوره ويجيب صاحبُها — نظيرُ سجلّ التمارين في `station.js`.

function planOf(id, seed) {
  for (const [file, mod] of modules) {
    if (typeof mod.buildStation !== 'function') continue;
    const plan = mod.buildStation(id, seed);
    if (plan) return { file, plan };
  }
  return null;
}

const stationById = new Map(curriculum.stations().map((s) => [s.id, s]));

// ————— ٢) البدء: من سجلٍّ نظيف لا تُفتَح إلا الأولى —————

console.log('\n٢. البدء: سجلٌّ نظيف');
progress.reset();
ok(progress.unlockFrontier() === 0 && progress.nextNode()?.id === nodes[0].id,
  `الجبهةُ عند أوّل عقدة («${nodes[0].id}») ولا نجمةَ في السجلّ`);
ok(progress.isNodeUnlockedById(nodes[0].id)
  && nodes.slice(1).every((n) => !progress.isNodeUnlockedById(n.id)),
'ولا مفتوحَ سواها في الرحلة كلِّها (القفلُ تسلسليّ)');

// ————— ٣+٤) المشي: عقدةً عقدة من الصفر حتى الختام —————

console.log('\n٣. المشي: كلُّ عقدةٍ تُبنى وتُتَمّ فتفتح التي بعدها');

const problems = [];
const reached = new Set();      // مفاتيحُ ليتنر التي بلغتها الرحلةُ حتى هذه العقدة
let built = 0;
let played = 0;
let gates = 0;
let exempt = 0;

for (const [at, node] of nodes.entries()) {
  const where = `[${node.id}]`;
  if (!progress.isNodeUnlockedById(node.id)) {
    problems.push(`${where} مقفلةٌ وقد أُتمّ كلُّ ما قبلها — **طريقٌ مسدود**`);
    break;
  }
  if (at + 1 < nodes.length && progress.isNodeUnlockedById(nodes[at + 1].id)) {
    problems.push(`${where} فُتحت التي بعدها قبل إتمامها — القفلُ ليس تسلسلياً`);
  }
  if (!registered.has(node.type)) {
    problems.push(`${where} لا شاشةَ مسجَّلةً لنوعها «${node.type}» — عقدةٌ لا تُفتَح`);
    break;
  }

  if (node.type === 'gate') {
    // **البوابةُ تُبنى ممّا في يده**: عشرةُ تمارين من أضعف مهارات مدَاها المعلَن
    const items = gate.gateItems(node.part, seeded(at + 3));
    if (!items.length) {
      problems.push(`${where} بوابةٌ تُبنى جلستُها فارغة — فلا تُعبَر أبداً`);
    } else if (items.length !== gate.GATE_SIZE) {
      problems.push(`${where} جلستُها ${items.length} تمريناً والمنتظَر ${gate.GATE_SIZE}`);
    }
    // وتُعبَر بإصابة كل محاولاتها (والعبورُ يكتب النجمة)
    for (const item of items) progress.recordAttempt(item.concept, item.range, item.kind, true);
    if (!gate.passed(items.length, 0)) problems.push(`${where} لا تُعبَر بإصابةٍ تامّة`);
    gates++;
  } else {
    const station = stationById.get(node.id);
    const made = planOf(node.id, (at + 1) * 97);
    if (!made) {
      // **المعفاةُ تُعرَض ولا تُبنى** (٨·٥ — عرضٌ بلا قياس): إعفاؤها مكتوبٌ في المنهج
      if (!station?.exempt) {
        problems.push(`${where} لا بانِيَ لمادّتها ولا إعفاءَ مكتوب — محطةٌ لا تُلعَب`);
      } else exempt++;
    } else {
      built++;
      const { plan } = made;
      if (!plan.model || !plan.solo?.length) {
        problems.push(`${where} خطّةٌ بلا نمذجةٍ أو بلا جولات «وحدك» (${made.file})`);
      }
      /* **وجولاتُ «وحدك» تقيس مفتاحاً بلغته الرحلةُ**: مفتاحٌ لا تُعلنه محطةٌ مضت
         **ولا محطتُها هي** يُسجَّل في ليتنر ولا يُراجَع من محطته أبداً — فيبقى في
         الصندوق الأول وتكذب لوحةُ وليّ الأمر. والمقيسُ **ما مضى لا محطتُه وحدَها**:
         محطةُ «رمزا ٤ و٥» تراجع رمزَ الاثنين وهو درسُ ٣·١ — مراجعةٌ لا تجاوز. */
      for (const key of station?.skills || []) reached.add(key);
      for (const round of plan.solo || []) {
        const key = `${round.concept}|${round.range}|${round.kind}`;
        if (!reached.has(key)) {
          problems.push(`${where} جولةٌ تقيس «${key}» ولم تبلغه الرحلةُ بعد `
            + '— مفتاحٌ يُسجَّل ولا يُراجَع من محطته');
          break;
        }
        // وتُسجَّل إصابةٌ لكل جولةٍ — وهو ما يفعله الطفلُ الذي أتمّها بلا خطأ
        progress.recordAttempt(round.concept, round.range, round.kind, true);
        played++;
      }
    }
  }

  progress.setStars(node.id, 3);
  if (!progress.isDone(node.id)) {
    problems.push(`${where} نجمتُها لا تُقرأ بمعرّفها — الجبهةُ تتجمّد هنا`);
    break;
  }
}

for (const line of problems.slice(0, 8)) console.log('  ✗', line);
if (problems.length > 8) console.log(`  … و${problems.length - 8} عائقاً آخر`);
fails += problems.length;
if (!problems.length) {
  console.log('  ✓', `مُشيت الرحلةُ كلُّها من الصفر: ${built} محطةً بُنيت مادّتُها `
    + `و${gates} بواباتٍ بُنيت جلساتُها و${exempt} محطةَ تعارفٍ معفاة، `
    + `و${played} جولةَ «وحدك» كلُّها تقيس مفتاحاً بلغته الرحلة (${reached.size} مفتاحاً)`);
}

// ————— ٥) الختام: بلغت العقدةَ الأخيرة —————

console.log('\n٤. الختام: العقدةُ الأخيرة');
const last = nodes[nodes.length - 1];
ok(progress.isDone(last.id), `بلغت الرحلةُ آخرَها («${last.id}» — ${last.title})`);
ok(progress.unlockFrontier() === nodes.length && progress.nextNode() === null,
  `والجبهةُ اكتملت (${progress.unlockFrontier()} من ${nodes.length}) ولا عقدةَ تالية`);
ok(progress.totalStars() === progress.maxTotalStars(),
  `ونجومُها كاملة (${progress.totalStars()} من ${progress.maxTotalStars()})`);
// **وما مشته الرحلةُ صار مقيساً**: سجلُّ ليتنر ليس فارغاً بعد اجتيازها
const skills = progress.skills();
ok(skills.length > 0 && skills.every((s) => s.right > 0),
  `وسجلُّ ليتنر امتلأ بما لعبه (${skills.length} مفتاحاً مقيساً)`);

// ————— ٦) الميدالية: لكلِّ مرحلةٍ معلمُها في ختام محطاتها —————
//
// **قيدُ الجلسة هـ** (حكمُ المدير — `REVIEW_IDENTITY.md §٤`): ميداليةُ الختام تحمل
// معلمَ المرحلة **بياناً لا يداً**. فيُسأل هنا كلُّ ما يقع عليه بصرُ الطفل في لحظة
// الاحتفال: أمعلمٌ **مرسومٌ** يعرفه `ui.js`؟ وأهو **عينُ معلم قسمها** على الخريطة؟
// وأتمثّلت المراحلُ الثماني كلُّها؟ — والوصلةُ تُقرأ من `medalOf` نفسِها التي تناديها
// الشاشة، فلا نسخةَ ثانيةٌ في الحارس تُصدَّق وحدَها.

console.log('\n٥. الميدالية: معلمُ المرحلة في ختام محطاتها');

const stationNodes = nodes.filter((n) => n.type !== 'gate');
const medals = stationNodes.map((n) => ({
  id: n.id, mark: medalOf(n.id), onMap: progress.sectionOf(n.id)?.mark || null,
}));
const blind = medals.filter((m) => !m.mark || !LANDMARK_NAMES.includes(m.mark));
ok(blind.length === 0,
  `${stationNodes.length} محطةً كلُّها تحمل معلماً مرسوماً يعرفه \`ui.js\``
  + (blind.length ? ` — بلا معلم: ${blind.map((m) => m.id).slice(0, 6).join('، ')}` : ''));

const split = medals.filter((m) => m.mark !== m.onMap);
ok(split.length === 0,
  'وهو **عينُ معلم قسمها على الخريطة** (مصدرٌ واحد لا نسختان)'
  + (split.length ? ` — مفترقة: ${split.map((m) => m.id).slice(0, 6).join('، ')}` : ''));

const byStage = curriculum.STAGES.map((stage) => ({
  id: stage.id,
  mark: stage.mark,
  medals: [...new Set(stage.stations
    .map((s) => medalOf(`${s.type}:${s.part}`)))],
}));
const off = byStage.filter((s) => s.medals.length !== 1 || s.medals[0] !== s.mark);
ok(off.length === 0,
  `و**كلُّ مرحلةٍ ميدالياتُها معلمُها هي**: ${byStage.map((s) => s.mark).join(' · ')}`
  + (off.length ? ` — مخالفة: ${off.map((s) => s.id).join('، ')}` : ''));

/* **ويُقرأ الرسمُ لا النيّة**: معلمٌ مرسومٌ بلون المرحلة على قرصٍ بلونها نفسِه
   **يختفي** — فيُطلَب في `ui.js` أن يتبع حبرَ موضعه، وتُطلَب المناداةُ بالبيان في كل
   شاشةٍ تحتفل. (والرسمُ نفسُه يقيسه حارسُ المتصفّح على الشاشة الحيّة.) */
const uiSrc = src('ui.js');
ok(/stroke="currentColor"[\s\S]{0,120}LANDMARKS\[kind\]/.test(uiSrc),
  'ومعلمُ الميدالية يتبع حبرَ قرصها (`currentColor`) فلا يختفي على لون مرحلته');
/* **والمسؤولُ عن ميدالية كلِّ نوعِ محطةٍ مجرودٌ لا مكتوب**: مَن سجّل الشاشةَ يملكها،
   فإمّا أن يرسم ميداليتَه بنفسه (٨·٥ — شاشةٌ مفردةٌ بلا حلقة) وإمّا أن يفوّضها إلى
   حلقة المحطة — وكلاهما يناديها بالبيان. (والبوابةُ خارج هذا: ميداليتُها **وجهُها
   المعلَن** في المنهج، ومراجعةُ اليوم ليست عقدةً في الرحلة ولا مرحلةَ لها.) */
const ownerOf = new Map(readdirSync(APP).filter((f) => f.endsWith('.js'))
  .flatMap((f) => [...src(f).matchAll(/registerScreen\(\s*['"`]([a-z][a-z0-9-]*)['"`]/g)]
    .map((m) => [m[1], f])));
const byHand = [...new Set(stationNodes.map((n) => n.type))].filter((type) => {
  const file = ownerOf.get(type);
  if (!file) return true;
  const body = src(file);
  const own = /landmark\(medalOf\(/.test(body);
  return !(own || (/stationScreen\(/.test(body) && /landmark\(medalOf\(/.test(src('station.js'))));
});
ok(byHand.length === 0,
  `وميداليةُ كلِّ نوعِ محطةٍ تُبنى بالبيان (${[...new Set(stationNodes.map((n) => n.type))].length} نوعاً)`
  + (byHand.length ? ` — بيدٍ: ${byHand.join('، ')}` : ''));

progress.reset();

console.log(fails
  ? `\n${fails} فشل`
  : `\nالرحلةُ تُجتاز كاملةً — ${fromJourney} عقدةً من الصفر حتى الختام`
    + `${asleep ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
process.exit(fails ? 1 : 0);
