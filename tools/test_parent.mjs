// **حارسُ لوحة وليّ الأمر ونسختِه الاحتياطية** — «مفهومٌ بعملية لا درجة»:
//   node tools/test_parent.mjs
//
// ————— العلّتان اللتان وُلد منهما (بندُ الجلسة ٨) —————
//
// ١) **اللوحةُ تكذب بصمت.** نصُّ `METHOD.md §٦`: «لوحة وليّ الأمر: مفهومٌ بعملية لا
//    درجة — (يقدّر حتى ٥ فوراً)، (يحتاج تثبيت جسور ١٠)». وعبارةٌ كهذه إن كُتب رقمُها
//    بيدٍ أو اشتُقّ من غير سجلّ ليتنر **بقيت صحيحةَ الشكل وكاذبةَ المعنى**: يقرأ
//    الوالدُ «يقدّر حتى ٥» وطفلُه ما جاوز الثلاثة، ولا اختبارَ يحمرّ. فيُصنَع هنا
//    سجلٌّ بيدٍ (بالواجهة التي يناديها كلُّ تمرين)، ثم يُسأل: **أتقول اللوحةُ ما في
//    السجلّ؟** ثم يُبدَّل السجلُّ ويُسأل: **أتبدّلت العبارة؟** — فرقمٌ لا يتحرّك بحركة
//    السجلّ رقمٌ مكتوبٌ بيد ولو بدا محسوباً.
//
// ٢) **النسخةُ الاحتياطية لا تُختبَر إلا يومَ يحتاجها أحد.** وهي آخرُ ما يملكه وليُّ
//    الأمر حين يمحو المتصفّحُ التخزين أو يبدّل الجهاز — فحقلٌ يسقط منها (دقائقُ
//    التعلّم، صناديقُ ليتنر، مواعيدُها) **لا يظهر يوم الحفظ بل يوم الاستعادة**، وحينها
//    لا رجعة. فتُمشى الرحلةُ كلُّها هنا، وتُصدَّر، ويُمحى الجهاز، وتُستعاد — ثم تُقابَل
//    حقلاً حقلاً.
//
// وستةُ أبواب:
//   ١) **المفاهيم**: كلُّ مفهومٍ تكتبه الرحلةُ له عبارتُه وقسمُه المعلَن، ولا سطرَ
//      بائد، ولا مدىً وصفيٌّ بلا اسمٍ يُقرأ.
//   ٢) **العبارة من السجلّ**: نصُّ المنهج حرفاً على سجلٍّ مصنوع.
//   ٣) **الرقمُ محسوبٌ لا مكتوب**: يتبدّل السجلُّ فتتبدّل العبارة.
//   ٤) **لسانُ الوالد**: لا مفتاحَ خام ولا رقمَ مغربيّ في سطرٍ يقرؤه.
//   ٥) **حدُّ النطاق**: «راجِع مختصاً» لا تُقال لزلّةٍ، وتُقال لتعثّرِ أسابيع.
//   ٦) **النسخة**: تحفظ الرحلة كاملةً وتستعيدها، وترفض ما ليس منها **بسببه**.
//
// ————— النومُ الذاتيّ (`docs/SEED.md §٥`) —————
//
// رحلةٌ فارغة = لا مفهومَ يُترجَم: ينام البابان ١–٤ بشرطهما المجرود (لا مفتاحَ ليتنر
// في `curriculum.js`) ويستيقظان يومَ تُكتب أوّلُ محطة. وبابا الحدّ والنسخة من بذرة
// المنصة، فيعملان من اليوم الأول.

import { readFileSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const src = (name) => readFileSync(new URL(name, APP), 'utf8');

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const progress = await import(new URL('progress.js', APP));
const curriculum = await import(new URL('curriculum.js', APP));
const parent = await import(new URL('parent.js', APP));

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

const lineOf = (concept) => parent.conceptLines().find((l) => l.concept === concept)?.line || '';
const record = (key, tries, day) => {
  const [concept, range, kind] = key.split('|');
  // **والمدى عدداً إن كان عدداً ونصّاً إن لم يكن** (`spanOf` في `station.js`): مفاتيحُ
  // المرحلة ٨ وصفية، و«٠» عددٌ لا يُسقِطه اختبارُ الصدق.
  const span = Number.isFinite(Number(range)) && range !== '' ? Number(range) : range;
  for (const correct of tries) progress.recordAttempt(concept, span, kind, correct, day);
};

// ————— ١) المفاهيم: كلُّ ما تكتبه الرحلةُ له عبارتُه وقسمُه —————

console.log(`\n١. المفاهيم: أقسامُ اللوحة (${curriculum.CONCEPT_SECTIONS.length})`);

const written = curriculum.journeyConcepts();
const sections = curriculum.CONCEPT_SECTIONS.map((s) => s.id);

if (!written.length) {
  dormant('لا مفتاحَ ليتنر في الرحلة بعد (`curriculum.js` بذرةٌ تملؤها الجلسة ١)');
} else {
  const homeless = written.filter((c) => !curriculum.conceptOf(c));
  ok(homeless.length === 0,
    `${written.length} مفهوماً تكتبها الرحلةُ، كلُّها معلَنةٌ بعبارتها`
    + (homeless.length ? ` — بلا عبارة: ${homeless.join('، ')}` : ''));

  const stale = Object.keys(curriculum.CONCEPTS).filter((c) => !written.includes(c));
  ok(stale.length === 0,
    'ولا عبارةَ لمفهومٍ سقط من الرحلة' + (stale.length ? ` — بائدة: ${stale.join('، ')}` : ''));

  const alien = written.filter((c) => !sections.includes(curriculum.conceptOf(c)?.section));
  ok(alien.length === 0,
    `وكلُّ مفهومٍ في قسمٍ من الأقسام (${curriculum.CONCEPT_SECTIONS.map((s) => s.title).join(' · ')})`
    + (alien.length ? ` — خارجها: ${alien.join('، ')}` : ''));

  // **ولا قسمَ فارغ**: قسمٌ في اللوحة لا مفهومَ فيه ترويسةٌ تعد الوالدَ بما لا يجيء
  const empty = sections.filter((id) =>
    !written.some((c) => curriculum.conceptOf(c).section === id));
  ok(empty.length === 0,
    'ولكلِّ قسمٍ مفهومٌ يسكنه (فلا ترويسةٌ تعد الوالدَ بما لا يجيء)' + (empty.length ? ` — فارغ: ${empty.join('، ')}` : ''));

  // **والمدى الوصفيّ يُسمّى** (المرحلة ٨): مفتاحٌ خام في لوحةِ والدٍ عيبٌ لا اختصار
  const faces = [...new Set(curriculum.stations()
    .flatMap((s) => (s.skills || []).map((k) => k.split('|')[1]))
    .filter((r) => !Number.isFinite(Number(r))))];
  const unnamed = faces.filter((f) => !curriculum.rangeText(f));
  ok(unnamed.length === 0,
    `و${faces.length} مدىً وصفياً لها أسماءٌ تُقرأ (${faces.map((f) => curriculum.rangeText(f)).join(' · ')})`
    + (unnamed.length ? ` — بلا اسم: ${unnamed.join('، ')}` : ''));
}

// ————— السجلُّ المصنوع: طفلٌ في منتصف الرحلة —————
//
// **يُبنى بالواجهة العامّة** (`recordAttempt`) لا بحقن حالة — فهو عينُ ما يصنعه إصبعُ
// الطفل، ولو تبدّلت قواعدُ ليتنر تبدّل معه. وثلاثُ حالاتٍ مقصودة:
//   • **أتقن التقدير الفوريّ كلَّه** (٢ و٣ و٥) — فالعبارةُ «يقدّر حتى ٥ فوراً».
//   • **تعثّر في جسور ١٠ وحدَها** وأتقن ما دونها — «يحتاج تثبيت جسور ١٠».
//   • **بين بين في العدّ**: أتقن حتى ٥ ويتدرّب على ١٠.

const today = progress.dayNumber();
progress.reset();
for (const key of ['subitize|2|flash', 'subitize|3|flash', 'subitize|5|flash']) {
  record(key, [true, true, true], today);
}
for (const key of ['bond|4|make', 'bond|5|make', 'bond|7|make', 'bond|9|make']) {
  record(key, [true, true, true], today);
}
record('bond|10|make', [false, false], today);
record('count|3|touch', [true, true, true], today);
record('count|5|touch', [true, true, true], today);
record('count|10|touch', [true], today);

console.log('\n٢. العبارة: مقروءةٌ من سجلّ ليتنر الحيّ');

const lines = parent.conceptLines();
ok(lineOf('subitize') === 'يقدّر حتى ٥ فوراً',
  `مَن أتقن التقدير حتى ٥ تقول لوحتُه: «${lineOf('subitize')}» (ونصُّ المنهج: «يقدّر حتى ٥ فوراً»)`);
ok(lineOf('bond') === 'يحتاج تثبيت جسور ١٠',
  `ومَن تعثّر في جسور ١٠ تقول: «${lineOf('bond')}» (ونصُّ المنهج: «يحتاج تثبيت جسور ١٠»)`);
ok(/حتى ٥/.test(lineOf('count')) && /يتدرّب على ١٠/.test(lineOf('count')),
  `ومَن هو بين بين يُقال ما أتقن ثم ما يتدرّب عليه: «${lineOf('count')}»`);
ok(lines.length === 3 && lines.every((l) => sections.includes(l.section)),
  `ولا سطرَ لمفهومٍ لم يُقَس بعد (${lines.length} أسطر لثلاثة مفاهيم قِيست)`);
ok(lines[0].state === 'mastered' && lines.some((l) => l.state === 'struggling'),
  'ولكلِّ سطرٍ حالُه (أتقن · يتعثّر · بينهما) — وهي لونُ حافةٍ لا درجة');

/* **وتعثّرُ اليوم ليس تعثّرَ أسابيع** (`METHOD.md §١٣`): يُقاس على سجلٍّ **فيه تعثّرٌ
   قائم** (جسورُ العشرة أعلاه) لا على سجلٍّ صافٍ — وإلّا مرّ البابُ لخلوّ السجلّ. */
const fresh = lines.filter((l) => l.state === 'struggling');
ok(fresh.length > 0 && fresh.every((l) => !l.stuck),
  `وتعثّرُ اليوم لا يرفع إشارةَ «راجِع مختصاً» (${fresh.length} متعثّرٌ اليوم، ولا إشارة)`);

// ————— ٣) الرقمُ محسوبٌ لا مكتوب: يتبدّل السجلُّ فتتبدّل العبارة —————

console.log('\n٣. الرقمُ يتحرّك بحركة السجلّ');

const wasSubitize = lineOf('subitize');
const wasBond = lineOf('bond');
record('bond|10|make', [true, true, true], today);      // ثبّت الجسرَ العاشر
record('count|10|touch', [true, true], today);          // وأتمّ العدّ إلى العشرة
ok(lineOf('bond') === 'يصنع جسور ١٠' && lineOf('bond') !== wasBond,
  `ثبّت جسور ١٠ فصارت: «${lineOf('bond')}» (وكانت «${wasBond}»)`);
ok(lineOf('count') === 'يعدّ حتى ١٠ بلمسةٍ لكل عنصر',
  `وأتمّ العدّ فصارت: «${lineOf('count')}»`);
ok(lineOf('subitize') === wasSubitize,
  'ومفهومٌ لم يُمَسّ لم تتبدّل عبارتُه (فلا عبارةَ تتحرّك بغير سجلّها)');

// ————— ٤) لسانُ الوالد: لا مفتاحَ خام ولا رقمَ مغربيّ —————

console.log('\n٤. لسانُ الوالد');

const all = parent.conceptLines();
const raw = all.filter((l) => /\|/.test(l.line) || /[a-z]/i.test(l.line));
ok(raw.length === 0,
  'لا مفتاحَ ليتنر خاماً في سطرٍ يقرؤه الوالد'
  + (raw.length ? ` — ${raw.map((l) => l.line).join('، ')}` : ''));
const western = all.filter((l) => /[0-9]/.test(l.line));
ok(western.length === 0,
  'ولا رقمَ مغربيّ (ق١: المشرقيةُ في كل موضع)'
  + (western.length ? ` — ${western.map((l) => l.line).join('، ')}` : ''));
ok(all.every((l) => l.title && l.line && l.line.length > 4),
  'ولكلِّ مفهومٍ اسمٌ وجملةٌ فعلية تُقرأ');

// ————— ٥) حدُّ النطاق: «راجِع مختصاً» إشارةٌ عند تعثّرِ أسابيع لا عند زلّة —————

console.log('\n٥. حدُّ النطاق (`METHOD.md §١٣`)');

progress.reset();
record('numeral|7|match', [false, false, false], today - 30);   // تعثّرٌ بدأ قبل شهر
record('numeral|7|match', [false, true, false], today - 2);     // وما يزال في الصندوق الأدنى
record('numeral|3|match', [true, true, true], today - 30);
const stuck = parent.conceptLines().filter((l) => l.stuck);
ok(stuck.length === 1 && stuck[0].concept === 'numeral',
  `ومَن تعثّر في مفهومٍ واحد ثلاثةَ أسابيع تُرفَع له الإشارةُ باسم المفهوم (${stuck
    .map((s) => s.title).join('، ') || 'لا شيء'})`);
ok(/راجِع مختصاً/.test(src('parent.js')) && /لا يشخّص/.test(src('parent.js')),
  'وتُكتب باللفظ المنصوص، ومعها أنّ التطبيق **يدرّس ويقيس ولا يشخّص**');

// ————— ٥ب) توصيةُ اليوم: صحّةُ الطفل قبل التحصيل، والمراجعةُ قبل الجديد —————
//
// **ترتيبٌ لا مجموعةُ نصائح**: سقفُ الوقت يسبق كلَّ تحصيل (`METHOD.md §٤` وعهدُ
// «لا إرهاق»)، والمراجعةُ تسبق المحطةَ الجديدة (تثبيتُ المتزعزع قبل البناء عليه).

const tip = (over) => parent.recommend(over).title;
ok(tip({ started: false, dueCount: 3, secondsToday: 9000 }) === 'ابدآ الرحلة معاً',
  'مَن لم يبدأ يُدعى إلى البداية قبل كل شيء');
ok(tip({ started: true, dueCount: 5, secondsToday: 16 * 60, nextTitle: 'محطة' })
  === 'أخذ نصيبه اليوم',
  `وسقفُ اليوم (${parent.minutesText(15 * 60)}) **يسبق التحصيل**: لا مراجعةَ تُقترَح فوقه`);
ok(tip({ started: true, dueCount: 5, secondsToday: 300, nextTitle: 'محطة' })
  === 'ابدأ بمراجعة اليوم',
  'والمراجعةُ تسبق المحطة الجديدة ما دام في يده مستحقّ');
ok(tip({ started: true, dueCount: 0, secondsToday: 300, nextTitle: 'محطة' })
  === 'واصِلا المحطة التالية',
  'فإذا لم يبق مستحقٌّ فالتالية');

// ————— ٦) النسخة الاحتياطية: الرحلةُ كاملةً تُصدَّر وتُستعاد —————

console.log('\n٦. النسخة الاحتياطية: الرحلةُ كاملةً');

progress.reset();
const nodes = progress.allNodes();
if (!nodes.length) {
  dormant('لا رحلةَ تُنسَخ بعد');
} else {
  // طفلٌ مشى الرحلةَ كلَّها: نجومٌ ومهاراتٌ ودقائقُ ومراجعاتٌ ومواعيدُ ليتنر
  for (const node of nodes) progress.setStars(node.id, 3);
  for (const station of curriculum.stations()) {
    for (const key of station.skills || []) record(key, [true, false, true], today);
  }
  progress.addSeconds(600);
  progress.addSeconds(300, progress.dayKey(new Date(Date.now() - 86400000)));
  progress.markReview(10, 9);

  const before = progress.snapshot();
  const text = progress.backupText();
  const sum = progress.backupSummary(progress.backup());
  ok(sum.nodes === nodes.length && sum.stars === progress.totalStars()
    && sum.skills === progress.skills().length,
  `تُقرأ النسخةُ قبل استعادتها: ★${sum.stars} في ${sum.nodes} عقدة و${sum.skills} مهارة`);

  progress.reset();                                   // جهازٌ مُحي كما يقع فعلاً
  ok(progress.totalStars() === 0 && progress.skills().length === 0,
    'ويُمحى الجهازُ فلا نجمةَ ولا مهارة (كما يفعل المتصفّحُ حين يضيق القرص)');

  const read = progress.readBackup(text);
  ok(!read.error && progress.restore(read.bundle), 'ثم تُقرأ النسخةُ وتُستعاد');

  const after = progress.snapshot();
  const same = (field) => JSON.stringify(before[field]) === JSON.stringify(after[field]);
  const fields = ['stars', 'skills', 'days', 'reviews', 'seconds', 'startedAt'];
  const lost = fields.filter((f) => !same(f));
  ok(lost.length === 0,
    `وتعود الرحلةُ **كاملةً**: ${fields.join(' · ')}`
    + (lost.length ? ` — سقط منها: ${lost.join('، ')}` : ''));
  ok(progress.totalStars() === progress.maxTotalStars()
    && progress.skills().every((s) => s.box > 0 && s.due > 0 && s.since !== undefined),
  `ونجومُها ومواعيدُ ليتنر معها (${progress.totalStars()} نجمة و${progress.skills().length} مهارة بمواعيدها)`);
  ok(progress.nextNode() === null && progress.unlockFrontier() === nodes.length,
    'وجبهةُ الفتح تُحسب من المستعاد (فيتابع الطفلُ من حيث وقف لا من أوّل الرحلة)');

  // **وما ليس نسخةً يُرَدّ بسببه** — الاستعادةُ تكتب فوق تقدّمٍ حقيقيّ فلا تقع بظنّ
  const bad = [
    ['ليس بجيسون', 'لا شيء'],
    ['ملفُّ تطبيقٍ آخر', JSON.stringify({ kind: 'iqra.progress', format: 1, state: {} })],
    ['نسخةٌ من إصدارٍ أحدث', JSON.stringify({ kind: progress.BACKUP_KIND, format: 99, state: {} })],
    ['نسخةٌ بلا تقدّم', JSON.stringify({ kind: progress.BACKUP_KIND, format: 1, state: {} })],
  ];
  const passed = bad.filter(([, raw]) => !progress.readBackup(raw).error);
  ok(passed.length === 0,
    `و${bad.length} ملفّاتٍ ليست نسخةً تُرَدّ **بسببها معلَناً** (${bad
      .map(([name, raw]) => `${name}: ${progress.readBackup(raw).error?.slice(0, 22) || 'قُبِل!'}…`)
      .join(' · ')})`);
  progress.reset();
}

console.log(fails
  ? `\n${fails} فشل`
  : `\nلوحةُ وليّ الأمر تقرأ من ليتنر الحيّ، والنسخةُ تحفظ الرحلةَ كاملةً${
    asleep ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
process.exit(fails ? 1 : 0);
