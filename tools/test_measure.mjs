// حارس «لا تدريسَ بلا قياس»:
//   node tools/test_measure.mjs
//
// ————— بذرةُ المنصة (منسوخٌ من «اِقْرَأْ» ومكيَّف) —————
//
// **العلّة** (من ميدان اقرأ): فجوةُ قياسٍ عاشت أربع عشرة حزمةً صامتة. لا لأنّ أحداً
// أخطأ، بل لأنّ **غياب القياس لا يُفشِل اختباراً**: كلُّ حارسٍ يفحص ما كُتب، ولا حارسَ
// يسأل عمّا لم يُكتب. فكان الدرسُ يعلّم ولا يسجّل مهارةً واحدة، وكانت كلُّ الاختبارات
// خضراء — والبوابةُ ولوحةُ وليّ الأمر عمياوان.
//
// وهذا الحارس يقلب القاعدة: **يجرد الرحلةَ نفسَها** نوعَ محطةٍ نوعَ محطة، ويطالب
// كلَّ محطةٍ تدرّس مهارةً بقياسٍ مقابلٍ في ليتنر — فالغيابُ نفسُه صار فشلاً أحمر.
// ومحطةٌ جديدة تدخل الرحلة بلا قياسٍ ولا إعفاءٍ مكتوب **تُسقِط هذا الاختبار يومَ تُضاف**.
//
// وثلاثةُ أبوابٍ يفحصها لكل نوع محطة:
//   ١) **الإعلان**: لكل نوعٍ في الرحلة إمّا أنواعُ قياسٍ، وإمّا إعفاءٌ بسببٍ مكتوب.
//   ٢) **الشيفرة**: الشاشةُ المالكة تكتب فعلاً بذلك النوع (`recordAttempt`)،
//      والمعفاةُ لا تكتب شيئاً.
//   ٣) **المراجعة**: لكل نوع قياسٍ تمرينٌ يراجعه فعلاً — تُبنى منه جلسةٌ حقيقية،
//      وإلا بقيت المهارة في صندوق ليتنر الأول أبداً فكذبت لوحةُ وليّ الأمر.
//
// ————— النومُ الذاتيّ (`docs/SEED.md §٥`) —————
//
// الرحلةُ فارغةٌ اليوم، فلا نوعَ محطةٍ يُجرَد. والمقياسُ **الجردُ لا رايةٌ تُضبط بيد**:
// أوّلُ محطةٍ تُكتب في `curriculum.js` (الجلسة ١) توقظ **بابَ الإعلان** فيطالب بجدول
// `STATIONS` أدناه؛ وأوّلُ شاشةٍ تُكتب (الجلسة ٣) توقظ **بابَي الشيفرة والمراجعة**.
// فلا يملك أحدٌ أن ينسى إيقاظه.

import { readFileSync, existsSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const src = (name) => readFileSync(new URL(name, APP), 'utf8');
const has = (name) => existsSync(new URL(name, APP));

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const p = await import(new URL('progress.js', APP));

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

// ————— الجرد المُعلَن: نوعُ المحطة ← قياسُها أو سببُ إعفائها —————
//
// **هذا الجدول هو العقد**. مَن أضاف محطةً إلى الرحلة فعليه أن يُدخلها هنا: بقياسٍ
// تملكه، أو بإعفاءٍ يبرّره — ولا ثالث. وليس التعديلُ فيه هروباً من الفشل: كتابةُ
// «هذه المحطة تعلّم ولا تقيس» سطراً صريحاً هي عينُ ما نريده أن يُقرأ في المراجعة.
//
// **والمفاتيحُ مفاتيحُ `METHOD.md §٦`**: (المفهوم × المدى × نوع التمرين) — مثل
// `subitize|3|flash` و`numeral|7|match` و`add|20|bridge`. و`kinds` هنا **أنواعُ
// التمرين** (الحقلُ الثالث)، وهي ما يُكتب في `recordAttempt`.
//
// **الجلسة ١ تملؤه** على الرحلة التي تكتبها. ومن إعفاءاتها المنصوصة سلفاً:
//   • **محطة التعارف ٨·٥** (المغربية 123): تعارُفٌ **بلا قياس** بنصّ القرار ق١
//     (`METHOD.md §٩`) — يعرف الطفل أنّ للأعداد رسماً آخر سيلقاه، ولا يُمتحن فيه.
//   • **البوابات الثلاث**: تقيس ولا تدرّس — تمارينُها تمارينُ المراجعة نفسُها
//     (`sessionItems` في `review.js`)، فتكتب بأنواعِ غيرِها ولا نوعَ لها.

const STATIONS = {
  gate: {
    title: 'بوابة الإتقان',
    file: 'gate.js',
    exempt: 'البوابةُ **تقيس ولا تدرّس**: تمارينُها تمارينُ المراجعة نفسُها '
      + '(`sessionItems`)، فتكتب بأنواعِ غيرِها ولا نوعَ لها. وهذا الإعفاءُ منقولٌ '
      + 'من اقرأ بعلّته لا بنصّه — والبوابةُ عندنا ثلاثٌ لا اثنتان (`METHOD.md §٥`).',
  },
  // ————— الجلسة ١ تُدخل هنا أنواعَ محطات المراحل الثماني —————
};

// ————— ١) الإعلان: لا نوعَ محطةٍ في الرحلة خارج الجرد —————

console.log('\n— جرد الرحلة: كل نوع محطةٍ مُعلَن —');

const types = [...new Set(p.allNodes().map((n) => n.type))].sort();

if (!types.length) {
  dormant('الرحلةُ فارغة (`app/js/curriculum.js` بذرةٌ تملؤها الجلسة ١)');
} else {
  const unknown = types.filter((t) => !STATIONS[t]);
  ok(unknown.length === 0,
    `${types.length} نوعَ محطةٍ في الرحلة، كلُّها في الجرد (${types.join('، ')})`
    + (unknown.length ? ` — **خارج الجرد: ${unknown.join('، ')}** (قياساً أو إعفاءً)` : ''));

  const stale = Object.keys(STATIONS).filter((t) => !types.includes(t));
  ok(stale.length === 0,
    'ولا سطرَ في الجرد لمحطةٍ سقطت من الرحلة'
    + (stale.length ? ` — بائدة: ${stale.join('، ')}` : ''));

  const declared = Object.entries(STATIONS).filter(([t]) => types.includes(t));
  ok(declared.every(([, s]) => (s.kinds?.length > 0) !== Boolean(s.exempt)),
    'ولكلٍّ قياسُها **أو** إعفاؤها المكتوب — لا الاثنان ولا لا شيء');
  ok(declared.filter(([, s]) => s.exempt).every(([, s]) => s.exempt.length > 40),
    'وسببُ الإعفاء جملةٌ تُقرأ لا كلمةٌ تُكتب للمرور');

  // ————— ٢) الشيفرة: المالكةُ تكتب فعلاً، والمعفاةُ لا تكتب —————

  console.log('\n— الشيفرة: مَن أعلن قياساً كتبه —');
  for (const [type, station] of declared) {
    if (!has(station.file)) {
      dormant(`[${type}] ${station.title}: شاشتُها (\`${station.file}\`) لم تُكتب بعد`);
      continue;
    }
    const body = src(station.file);
    if (station.exempt) {
      ok(!/progress\.recordAttempt\s*\(/.test(body),
        `[${type}] ${station.title}: لا تسجّل مهارةً — ${station.exempt.split('(')[0].trim()}`);
      continue;
    }
    const written = station.kinds.filter((kind) =>
      new RegExp(`recordAttempt\\([^;]*['"\`]${kind}['"\`]`, 's').test(body)
      || new RegExp(`score\\([^;]*['"\`]${kind}['"\`]`, 's').test(body));
    ok(written.length === station.kinds.length,
      `[${type}] ${station.title} تكتب ${station.kinds.join(' و')} في ${station.file}`
      + (written.length < station.kinds.length
        ? ` — **غائب: ${station.kinds.filter((k) => !written.includes(k)).join('، ')}**` : ''));
  }

  // ————— ٣) المراجعة: لكل قياسٍ تمرينٌ يراجعه فعلاً —————
  //
  // **لا مهارةَ تُقاس بلا تمرينٍ يراجعها**: فحصٌ حيّ لا نصيّ — يُبنى لكل نوعٍ مستحقٌّ
  // وتُطلَب منه جلسة، فإن لم تُنتج تمرينَه بقيت مهاراتُه في الصندوق الأول أبداً.

  console.log('\n— المراجعة: لكل نوع قياسٍ تمرينُه —');
  const kinds = [...new Set(Object.values(STATIONS).flatMap((s) => s.kinds || []))];
  if (!kinds.length) {
    dormant('لا نوعَ قياسٍ مُعلَناً بعد (الجلسة ١ تكتب المفاتيح، والجلسة ٣ بانيَها)');
  } else {
    const review = await import(new URL('review.js', APP));
    const { seeded } = await import(new URL('ui.js', APP));
    for (const kind of kinds) {
      const due = [{ kind, box: 0, wrong: 1, concept: 'probe', range: 'probe' }];
      const built = [1, 5, 11, 23].some((seed) =>
        review.sessionItems(due, review.SESSION_SIZE, seeded(seed))
          .some((item) => item.kind === kind));
      ok(built, `[${kind}] مهارةٌ مستحقّة تُنتج تمرينَها في جلسة المراجعة`);
    }
    // والبوابةُ تُبنى بالمحرّك نفسِه، فما دخل المراجعةَ دخلها
    ok(/sessionItems/.test(src('gate.js')) && /weakestSkills/.test(src('gate.js')),
      'والبوابةُ تبني بالمحرّك نفسِه من أضعف المهارات — فما يُقاس يُسأل عنه فيها');
  }
}

// ————— ٤) لوحة وليّ الأمر: لا مهارةَ مقيسةٌ لا يقرؤها الوالد —————
//
// **مفهومٌ بعملية لا درجة** (`METHOD.md §٦`): أقسامُ اللوحة السبعة (كمّ · عدّ ·
// رموز · مقارنة · جسور · عمليات · أنماط) تُبنى من سجلّ ليتنر نفسِه لا من عدٍّ ثانٍ
// يفترق عنه — بندُ الجلسة ٨. والوصلةُ محروسةٌ من اليوم.

console.log('\n— لوحة وليّ الأمر: تقرأ من ليتنر نفسِه —');
const parentSrc = src('parent.js');
ok(/progress\.conceptStats\(\)/.test(parentSrc),
  'اللوحةُ تقرأ حصيلةَ المفاهيم من سجلّ ليتنر الحيّ');
ok(/progress\.dueSkills\(\)/.test(parentSrc) && /progress\.skills\(\)/.test(parentSrc),
  'وعددُ المستحقّ والمسجَّل من المصدر نفسِه (لا رقمٌ يُكتب بيد)');
ok(/راجِع مختصاً/.test(parentSrc),
  'وحدُّ النطاق معلَنٌ فيها: تدريسٌ وقياسٌ لا تشخيص (`METHOD.md §١٣`)');

console.log(fails
  ? `\n${fails} فشل`
  : `\nكل اختبارات «لا تدريسَ بلا قياس» ناجحة${asleep ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
process.exit(fails ? 1 : 0);
