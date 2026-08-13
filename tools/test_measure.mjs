// حارس «لا تدريسَ بلا قياس»:
//   node tools/test_measure.mjs
// يحرس: app/js/**
//   («لا تدريسَ بلا قياس»: المحطاتُ من المنهج والمفاتيحُ من الوحدات)
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
//
// **وقد أيقظت الجلسةُ ١ بابَ الإعلان** (وأضافت إليه بابَ «لا انحراف بين الجردين»)،
// وبقي البابان الآخران نائمين بشرطَيهما المجرودين: الشيفرةُ تنام لكل نوعٍ لم يُكتب
// ملفُّ شاشته، والمراجعةُ تنام ما دامت **لا وحدةَ تمارينَ تحقن بانِيَ التمارين**
// (`setBuilders` في `review.js`) — فلا مهارةَ يمكن أن تُنتج تمرينَها قبل أن يُحقَن
// بانيها. وشرطُ نومها **مجرودٌ من `app/js/` لا مضبوطٌ بيد**، فتستيقظ من تلقائها يوم
// تكتب الجلسةُ ٣ أوّلَ مولّد. (بندٌ يُرفع إلى مدير المشروع — `SESSIONS.md`.)

import { readFileSync, readdirSync, existsSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const src = (name) => readFileSync(new URL(name, APP), 'utf8');
const has = (name) => existsSync(new URL(name, APP));

// وحداتُ البذرة ليست شاشاتِ تمارين (نظيرُ `SEED` في `test_nodes.mjs`)
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

const p = await import(new URL('progress.js', APP));
const curriculum = await import(new URL('curriculum.js', APP));

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

// **والنوعُ اسمُ الشاشة لا اسمُ المفهوم** (`curriculum.js` في رأسه): شاشتان قد
// تقيسان مفهوماً واحداً لأنهما درسان في جلستين — `more` (أيُّهما أكثر بالكميات،
// `compare|5|more`) و`compare` (أكبرُ وأصغر بالرموز، `compare|10|pick`). ولذلك
// **كلُّ نوعٍ يُنجَز في جلسةٍ واحدة**: نوعٌ تتوزّع أنواعُ تمارينه على جلستين يبقى
// أحمرَ بينهما بحقّ، وليس ذلك عيباً في الجدول بل في تقسيم الشاشات.

const STATIONS = {
  // ————— المرحلتان ١–٢: الكمّ والعدّ (الجلسة ٣) —————
  subitize: { title: 'كم ترى؟ (تقديرٌ فوريّ)', file: 'quantity.js', kinds: ['flash'] },
  match: { title: 'طابِقِ الكميتين', file: 'quantity.js', kinds: ['set'] },
  more: { title: 'أيُّهما أكثر؟ (بالكميات)', file: 'quantity.js', kinds: ['more', 'set'] },
  count: { title: 'المس وعُدّ · أعطني ن', file: 'counting.js', kinds: ['touch', 'give'] },
  equal: { title: 'اجعلهما سواء', file: 'counting.js', kinds: ['make'] },

  // ————— المرحلتان ٣–٤: الرموز والمقارنة (الجلسة ٤) —————
  numeral: { title: 'رموز ٠–١٠', file: 'numerals.js', kinds: ['match'] },
  compare: { title: 'أكبر وأصغر (بالرموز)', file: 'compare.js', kinds: ['pick'] },
  line: { title: 'أين يقع؟ (خطُّ الأعداد)', file: 'compare.js', kinds: ['place'] },
  order: { title: 'رتِّب', file: 'compare.js', kinds: ['sort'] },
  neighbor: { title: 'السابق والتالي', file: 'compare.js', kinds: ['next'] },

  // ————— المرحلة ٥: ركِّب وفكِّك (الجلسة ٥) —————
  bond: { title: 'جسور الأعداد', file: 'bonds.js', kinds: ['make'] },

  // ————— المرحلة ٦: العمليات ضمن ١٠ (الجلسة ٦) —————
  add: { title: 'الجمع', file: 'ops.js', kinds: ['solve'] },
  sub: { title: 'الطرح', file: 'ops.js', kinds: ['solve'] },
  diff: { title: 'الطرح فرقاً', file: 'ops.js', kinds: ['solve'] },
  zero: { title: 'الصفر في العمليات', file: 'ops.js', kinds: ['solve'] },
  fluent: { title: 'طلاقة ضمن ١٠ وضمن ٢٠', file: 'ops.js', kinds: ['solve'] },
  // **والمزدوجات محطتان في مرحلتين** (الجلسة ك): ضمن ١٠ (٦·٥) وإلى ٢٠ (٧·٩) — شاشةٌ
  // واحدة تقرأ جبهتَها، ونوعُ تمرينها نوعُ العمليات نفسُه فمالكُها ملفُّها.
  double: { title: 'المزدوجات', file: 'ops.js', kinds: ['solve'] },

  // ————— المرحلة ٧: ١١–٢٠ (الجلسة ٧) —————
  teen: { title: 'العشرة وما بعدها', file: 'teens.js', kinds: ['build', 'place'] },
  bridge: { title: 'اجمع بالعبور', file: 'teens.js', kinds: ['bridge'] },
  // **والعدُّ القفزيّ عدٌّ لا جمع** (الجلسة ك): نوعُ تمرينه `count` — يُعَدّ على الخطّ
  // قفزةً قفزة، ولا علامةَ عمليةٍ في جبهته.
  skip: { title: 'اعدُدْ قفزاً', file: 'teens.js', kinds: ['count'] },

  // ————— المرحلة ٨: الأنماط والقياس (الجلسة ٧) —————
  pattern: { title: 'أكمِل النمط', file: 'patterns.js', kinds: ['extend'] },
  measure: { title: 'القياس الوصفي', file: 'patterns.js', kinds: ['pick', 'sort'] },

  // ————— المرحلة ٩: الأشكال الأولى (الجلسة ش) —————
  // **نوعٌ واحد بثلاثة قياسات** (`METHOD.md §٣` المرحلة ٩): التمييزُ بالاسم في
  // محطتين، وعدُّ الأضلاع، والشكلُ في عالم الطفل — وشاشتُها واحدةٌ تقرأ موضعَها.
  shape: { title: 'الأشكال الأولى', file: 'shapes.js', kinds: ['name', 'sides', 'world'] },

  // ————— المعفاتان بسببَيهما المكتوبين —————
  intro: {
    title: 'تعارُف: أرقامٌ أخرى (١٢٣)',
    // **وملفُّها مفردٌ عن شاشات المرحلة ٨ عمداً**: بابُ الشيفرة يطالب المعفاةَ بألّا
    // تكتب مهارةً البتّة، فلو سكنت ملفَّ شاشةٍ تقيس لَما أمكن إثباتُ إعفائها.
    file: 'intro.js',
    exempt: 'محطةُ تعارفٍ على الأرقام المغربية (123) **بلا قياسٍ عليها** بنصّ القرار '
      + 'ق١ (`METHOD.md §٩`): يعرف الطفل أنّ للأعداد رسماً آخر سيلقاه، ولا يُمتحن '
      + 'فيه — فلا مفتاحَ ليتنر واحداً يُكتب من هذه المحطة.',
  },
  gate: {
    title: 'بوابة الإتقان',
    file: 'gate.js',
    exempt: 'البوابةُ **تقيس ولا تدرّس**: تمارينُها تمارينُ المراجعة نفسُها '
      + '(`sessionItems`)، فتكتب بأنواعِ غيرِها ولا نوعَ لها. وهذا الإعفاءُ منقولٌ '
      + 'من اقرأ بعلّته لا بنصّه — والبوابةُ عندنا ثلاثٌ لا اثنتان (`METHOD.md §٥`).',
  },
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

  // ————— ١ب) لا انحرافَ بين الجردين (زيادةُ الجلسة ١) —————
  //
  // **العلّة**: صار للقياس مصدران — المنهجُ يعلن مفاتيح كل محطة (`skills` في
  // `curriculum.js`)، وهذا الجدولُ يعلن أنواعَ تمارين كل شاشة. ومصدران لحقيقةٍ
  // واحدة يفترقان بلا حارس: تُضاف محطةٌ بنوع تمرينٍ جديد فيبقى الجدولُ ساكتاً،
  // فيمرّ بابُ الشيفرة أخضرَ وهو لا يطالب بالجديد. فيُقابَل الجردان هنا صنفاً بصنف.

  const fromCurriculum = new Map();
  for (const station of curriculum.stations()) {
    const set = fromCurriculum.get(station.type) || new Set();
    for (const key of station.skills || []) set.add(key.split('|')[2]);
    fromCurriculum.set(station.type, set);
  }
  const drift = [...fromCurriculum].filter(([type, set]) => {
    const listed = new Set(STATIONS[type]?.kinds || []);
    return set.size !== listed.size || [...set].some((k) => !listed.has(k));
  });
  ok(drift.length === 0,
    `وأنواعُ تمارين كل شاشةٍ في الجدول هي التي يعلنها المنهج (${fromCurriculum.size} نوعاً)`
    + (drift.length ? ` — منحرفة: ${drift.map(([t, s]) => `${t} (المنهج: ${[...s].join('،') || 'لا شيء'
      })`).join('، ')}` : ''));

  const claiming = [...fromCurriculum].filter(([type, set]) => set.size && STATIONS[type]?.exempt);
  ok(claiming.length === 0,
    'ولا محطةَ معفاةٍ تعلن مفتاحَ ليتنر في المنهج'
    + (claiming.length ? ` — ${claiming.map(([t]) => t).join('، ')}` : ''));

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
  // **والنومُ بالنوع لا بالجميع** (إصلاحُ الجلسة ٣ — `SEED.md §٩`، نظيرُ ما وقع
  // لـ`test_nodes` في الجلسة ١): أنواعُ التمارين الخمسةَ عشرَ تُكتب شاشاتُها في **خمس
  // جلسات**، فمطالبةُ الجميع يومَ يُحقَن أوّلُ بانٍ تُسقِط الجلسةَ الثالثة بذنب
  // السابعة. والشرطُ الصحيحُ شرطُ بابِ الشيفرة نفسِه: **نوعُ تمرينٍ لا ملفَّ لأيّ
  // شاشةٍ تدرّسه بعد** نائمٌ، وما وُجد ملفُّ شاشته **يُطالَب فوراً** — والجردُ يجيب،
  // لا رايةٌ تُضبط بيد.
  const owners = (kind) => Object.values(STATIONS)
    .filter((s) => (s.kinds || []).includes(kind));
  const injectors = screenFiles.filter((f) => /setBuilders\s*\(/.test(src(f)));
  if (!kinds.length) {
    dormant('لا نوعَ قياسٍ مُعلَناً بعد (الجلسة ١ تكتب المفاتيح، والجلسة ٣ بانيَها)');
  } else if (!injectors.length) {
    dormant(`${kinds.length} نوعَ قياسٍ مُعلَناً، ولا وحدةَ تمارينَ تحقن بانيَها بعد `
      + '(`setBuilders` — الجلسة ٣ تكتب أولاها)');
  } else {
    // **تُحمَّل وحداتُ التمارين كلُّها**: هي التي تسجّل بانِيَ كل نوع، فبلا تحميلها
    // يُقاس الهيكلُ فارغاً فيُقال «لا تمرين» وفي الشجرة تمرين. وتحميلُها هنا يُثبت
    // معه **عقدَ الوحدة الخالصة**: تُستورَد في node بلا متصفّح (`check_range.py`).
    for (const file of screenFiles) await import(new URL(file, APP));
    const review = await import(new URL('review.js', APP));
    const { seeded } = await import(new URL('ui.js', APP));
    for (const kind of kinds) {
      const waiting = owners(kind).every((s) => !has(s.file));
      if (waiting) {
        dormant(`[${kind}] لا شاشةَ تدرّسه بعد `
          + `(${[...new Set(owners(kind).map((s) => s.file))].join('، ')})`);
        continue;
      }
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
