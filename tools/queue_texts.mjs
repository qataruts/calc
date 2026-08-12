// **مسوِّي القائمة الصوتية** — يقابل ما تنطقه الشجرة بما في `tools/audio_queue.json`:
//
//   node tools/queue_texts.mjs                 # عرضُ الناقص والبائد والمنحرف (لا يكتب)
//   node tools/queue_texts.mjs --add           # إضافةُ الناقص إلى القائمة
//   node tools/queue_texts.mjs --prune         # إسقاطُ المنتظِر الذي لم يعد يُنطق
//   node tools/queue_texts.mjs --retag         # ردُّ فئةِ المنتظِر إلى المشتقّة من موضعه
//   node tools/queue_texts.mjs --wanted-json   # «المطلوب» JSON (لعدّة الصوت)
//
// منسوخٌ ومجرَّدٌ من `read@77a14b3` (`docs/SEED.md §٣`). **وجلساتُ التطوير لا تشغّل
// المولّد ولا تلمس `app/audio/`** — تضيف نصوصَها هنا فقط (`docs/AUDIO_QUEUE.md`).
//
// ————— ولِمَ أداةٌ ومعها حارس؟ —————
//
// `check_speech.mjs` **يحكم**: نصٌّ يُنطق ولا يُصَفّ فشلٌ أحمر، ومدخلٌ لا تنطقه وحدةٌ
// فشلٌ أحمر. وهذه الأداةُ **تُصلِح** ما حكم به: تُضيف الناقص وتُسقط البائد. فالحارسُ
// لا يعدّل شيئاً (وذلك شرطُ كونه حارساً)، والأداةُ لا تحكم على أحد.
//
// ————— والمفترقُ عن اقرأ: المصدرُ إعلانٌ لا تخمين —————
//
// مستخرجُ اقرأ يمشي في بيانات المنهج والمعجم والقصص فيلتقط النصوص **بمعرفته بها**،
// وفئةُ كلِّ نصٍّ **تُخمَّن من شكله** (عددُ حروفه، أفيه فراغ؟). وهنا: كلُّ وحدةٍ
// **تُعلن** ما تنطق (`export const SPOKEN` — عهدُ الجلسة ٣)، فالجردُ إعلانٌ لا
// استقراء. **والفئةُ تُشتقّ من موضع النصّ في الشجرة لا من شكله**:
//
//   قيمةٌ في `NUMBER_NAME` (من `station.js`)      ← `number_name`
//   قيمةٌ في `SAY` (من `station.js`)              ← `modeling` أو `celebration` بمفتاحها
//   قيمةٌ في `SPOKEN` وحدةِ تمارينٍ (تُعلن `CONSUMES`) ← `instruction`
//
// **ولا تُخمَّن فئةٌ البتّة**: الفئةُ تختار **تعليمةَ الأداء** في المولّد، ومسحةٌ خاطئة
// تُسمع في أذن طفل. فمفتاحٌ جديد في `SAY` لا تعرفه هذه الأداة **يوقفها باسمه** ويُطلب
// تصنيفُه — وهو أهونُ من أن يُصرَّف احتفالٌ بمسحة تعليمة.
//
// ————— والمنحرفُ ثالثُ الثلاثة (الدفعة الثانية) —————
//
// كان للأداة بابان: الناقصُ يُضاف والبائدُ يُسقَط. وثالثٌ ظهر يومَ **نُقل نصٌّ من
// موضعٍ إلى موضع**: «وَهَذَا رَمْزُهَا» انتقلت من وحدة تمارينَ إلى جدول `SAY` بحكم
// المدير (مراجعة الجلسة ٤ البند ٥) فصارت فئتُها المشتقّة `modeling`، **ومدخلُها في
// القائمة ما زال يقول `instruction`** — فلا هو ناقصٌ (مصفوفٌ أصلاً) ولا بائدٌ
// (تنطقه الشجرةُ بعدُ)، ويُصرَّف بمسحةٍ ليست له وأحدٌ لا يدري. فالفئةُ تُشتقّ من
// الموضع، **والمنتظِرُ يُردّ إلى مشتقّه** (`--retag`)، ولا تُعدَّل فئةٌ بيد.
//
// **والمُصرَّفُ لا يُمَسّ**: تغييرُ فئةِ ملفٍّ مولَّدٍ لا يغيّر صوتَه — إنما يُعاد
// تصريفُه بـ`--requeue` إن أرادت الأذنُ مسحةً أخرى، فيُقاس ما يُسمع لا ما يُكتب.

import { readFileSync, readdirSync, renameSync, writeFileSync, existsSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const APP = new URL('app/js/', ROOT);
const QUEUE = new URL('tools/audio_queue.json', ROOT);
const MANIFEST = new URL('app/audio/manifest.json', ROOT);

const REQUESTED_BY = process.env.QUEUE_BY || 'session-audio';
const ENGINE = new Set(['audio.js']);          // محرّكُ النطق لا مصدرَ نصّ

/** جملُ الحلقة في `station.js` ← فئتُها. مفتاحٌ خارجها يوقف الأداة (انظر الرأس). */
const SAY_CATEGORY = {
  watch: 'modeling',
  withMe: 'modeling',
  alone: 'modeling',
  together: 'modeling',
  reveal: 'modeling',        // «وَهَذَا رَمْزُهَا» — كشفٌ يُشاهَد لا فعلٌ يُطلَب
  revealPair: 'modeling',
  revealSpot: 'modeling',
  revealSplit: 'modeling',   // «وَتَنْشَقُّ إِلَى هَذَيْنِ الْجُزْأَيْنْ» — شقُّ الكمّية يُشاهَد
  revealRest: 'modeling',    // «وَهَذَا مَا بَقِيَ لَهَا» — وكذلك ما بقي للإطار
  revealNext: 'modeling',    // «وَهَذَا مَا يَأْتِي بَعْدَهْ» — تمامُ النمط يُشاهَد
  revealOrder: 'modeling',   // «وَهَذَا تَرْتِيبُهَا…» — ترتيبُ المقادير يُشاهَد
  revealFirst: 'modeling',   // «…مِنَ الْأَوَّلِ إِلَى الْآخِرْ» — تسلسلُ الزمن يُشاهَد
  revealBoth: 'modeling',    // «هُمَا سَوَاءْ» — الميزانُ المتوازن يُكشَف في النمذجة
  revealSame: 'modeling',    // «صَارَا سَوَاءْ» — قولُ ما يُرى حين يستوي اللوحان
  bravo: 'celebration',
  great: 'celebration',
};

/** الأضيقُ أولاً: نصٌّ ورد في موضعين يأخذ فئتَه الأضيق. */
const CATEGORY_ORDER = ['number_name', 'celebration', 'modeling', 'instruction'];

const read = (url) => readFileSync(url, 'utf8');

/**
 * كلُّ نصٍّ تُعلنه الشجرة ← فئتُه، بترتيب لقاء الطفل به (الأعدادُ ثم الحلقةُ ثم التعليمات).
 *
 * **وهي الاشتقاقُ الوحيد**: يقرؤه الحارسُ (`check_speech.mjs`) من `--wanted-json` لا
 * بنسخةٍ ثانيةٍ عنده — فالحارسُ يحكم والأداةُ تُصلح، **والاشتقاقُ واحدٌ لهما**، ولو
 * نُسخ لصار لحقيقةٍ واحدةٍ مصدران يفترقان (وهو عينُ ما أُسقط في الدفعة الأولى، البند ٣).
 */
async function declaredTexts() {
  const files = readdirSync(APP).filter((f) => f.endsWith('.js') && !ENGINE.has(f));
  const out = new Map();
  const errors = [];
  const add = (text, cat) => {
    if (!text) return;
    const had = out.get(text);
    if (!had || CATEGORY_ORDER.indexOf(cat) < CATEGORY_ORDER.indexOf(had)) out.set(text, cat);
  };

  // ١) أسماءُ الأعداد وجملُ الحلقة — من `station.js` بأسماء تصديرها لا بشكل نصوصها
  const station = await import(new URL('station.js', APP));
  for (const name of Object.values(station.NUMBER_NAME || {})) add(name, 'number_name');
  for (const [key, text] of Object.entries(station.SAY || {})) {
    const cat = SAY_CATEGORY[key];
    if (!cat) errors.push(`مفتاحٌ جديد في SAY لا تعرف الأداةُ فئتَه: «${key}» = «${text}»`);
    else add(text, cat);
  }

  // ٢) تعليماتُ التمارين — كلُّ وحدةٍ تُعلن `CONSUMES` وحدةُ تمارين
  for (const file of files) {
    if (file === 'station.js') continue;
    if (!/export\s+const\s+SPOKEN\b/.test(read(new URL(file, APP)))) continue;
    const mod = await import(new URL(file, APP));
    if (!Array.isArray(mod.SPOKEN)) continue;
    const isExercise = !!mod.CONSUMES;
    for (const text of mod.SPOKEN) {
      if (!isExercise && !out.has(text)) {
        errors.push(`نصٌّ في «${file}» ولا هو تعليمةُ تمرينٍ ولا من جداول station: «${text}»`);
        continue;
      }
      add(text, 'instruction');
    }
  }

  // ٣) **ولا نصَّ مُعلَنٌ يفلت**: يُقابَل الجردُ بما يراه `check_speech.mjs` نفسُه
  const seen = new Set();
  for (const file of files) {
    if (!/export\s+const\s+SPOKEN\b/.test(read(new URL(file, APP)))) continue;
    for (const t of (await import(new URL(file, APP))).SPOKEN || []) seen.add(t);
  }
  for (const t of seen) {
    if (!out.has(t)) errors.push(`نصٌّ مُعلَنٌ لم تُشتقّ له فئة: «${t}»`);
  }

  return { out, errors };
}

// ————————————————— المقابلة بالموجود —————————————————

const { out: wanted, errors } = await declaredTexts();
if (errors.length) {
  console.error('لا تُخمَّن فئةٌ — صنّفها ثم أعِد التشغيل:');
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

const manifest = existsSync(MANIFEST) ? JSON.parse(read(MANIFEST)) : {};
const have = new Set(Object.values(manifest));
const queue = JSON.parse(read(QUEUE));
const queued = new Set(queue.map((e) => e.text));

const missing = [...wanted].filter(([text]) => !have.has(text) && !queued.has(text));
const counts = {};
for (const [, cat] of missing) counts[cat] = (counts[cat] || 0) + 1;

console.log(`نصوصُ الشجرة المُعلَنة: ${wanted.size} | لها ملف: ${[...wanted].filter(([t]) => have.has(t)).length}`
  + ` | في القائمة أصلاً: ${[...wanted].filter(([t]) => queued.has(t)).length} | ناقص: ${missing.length}`);
if (missing.length) {
  console.log(Object.entries(counts).map(([c, n]) => `${c}: ${n}`).join('، '));
  for (const [text, cat] of missing) console.log(`  + ${text}   (${cat})`);
}

// **المنحرفُ**: مدخلٌ منتظِرٌ فئتُه ليست المشتقّةَ من موضع نصّه اليوم (انظر الرأس).
// ويحكم به `check_speech.mjs` من هذا الاشتقاق نفسِه (`--wanted-json`) فيحمرّ حتى يُردّ.
const drift = queue.filter((e) => (e.status ?? 'pending') !== 'done'
  && wanted.has(e.text) && wanted.get(e.text) !== e.category);
if (drift.length) {
  console.log(`\nمنحرفُ الفئة: ${drift.length} مدخلاً منتظِراً فئتُه غير مشتقّةٍ من موضعه`
    + ' — يُردّ بـ`--retag`:');
  for (const e of drift) console.log(`  ~ ${e.text}   (${e.category} ← ${wanted.get(e.text)})`);
}

/**
 * كتابةٌ ذرّية بنمط `mark_done` في المولّد: ملفٌّ مؤقّت ثم استبدال، **وإعادةُ قراءةٍ
 * قُبيل الكتابة** — فالمصرِّف عمليةٌ حيّة قد تُحوِّل مدخلاً إلى `done` بين قراءتنا
 * وكتابتنا، فلا نكتب لقطةً قديمة فوق عمله. ولا يُمَسّ مدخلٌ `done` أبداً.
 */
function rewriteQueue(edit) {
  const disk = JSON.parse(read(QUEUE));
  const next = edit(disk);
  const tmp = new URL(`tools/audio_queue.${process.pid}.tmp`, ROOT);
  writeFileSync(tmp, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  renameSync(tmp, QUEUE);
  return next;
}

/** أولويةُ التصريف: الأعدادُ أولاً ثم التعليماتُ ثم النمذجةُ ثم الاحتفال — كترتيب لقاء الطفل. */
const PRIORITY = { number_name: 10, instruction: 20, modeling: 30, celebration: 40 };
/** ما ردّته الأذنُ يتقدّم الصفَّ (`--requeue` في المصرِّف) — ولا تخفضه إعادةُ تصنيف. */
const URGENT_PRIORITY = 10;

if (process.argv.includes('--add') && missing.length) {
  const added = missing.map(([text, category]) => ({
    text,
    category,
    requestedBy: REQUESTED_BY,
    priority: PRIORITY[category] ?? 100,
    status: 'pending',
    doneAt: null,
  }));
  rewriteQueue((disk) => {
    const known = new Set(disk.map((e) => e.text));
    return [...disk, ...added.filter((e) => !known.has(e.text))];
  });
  console.log(`\nأُضيف ${added.length} نصاً إلى tools/audio_queue.json`);
}

// ————————————— الردّ: فئةُ المنتظِر تتبع موضعَ نصّه —————————————
//
// **والأولويةُ تتبع الفئة**: ترتيبُ التصريف «كترتيب لقاء الطفل»، فنصٌّ صار نمذجةً
// يأخذ أولويتَها. وما رُفعت أولويتُه بيدٍ لأمرٍ عارض (`--requeue` = ١٠) **لا يُخفَض**:
// إصلاحُ عيبٍ مسموع يتقدّم الصفَّ ولو تغيّرت فئتُه.

if (process.argv.includes('--retag')) {
  if (!drift.length) {
    console.log('\nالردّ: لا مدخلَ منتظِراً فئتُه غير مشتقّةٍ من موضعه — القائمة مستوية.');
  } else {
    const fixed = new Map(drift.map((e) => [e.text, wanted.get(e.text)]));
    rewriteQueue((disk) => disk.map((e) => {
      const cat = (e.status ?? 'pending') !== 'done' ? fixed.get(e.text) : null;
      if (!cat) return e;
      const urgent = (e.priority ?? 100) <= URGENT_PRIORITY;
      return { ...e, category: cat, priority: urgent ? e.priority : (PRIORITY[cat] ?? 100) };
    }));
    console.log(`\nرُدَّ ${fixed.size} مدخلاً إلى فئته المشتقّة في tools/audio_queue.json`);
  }
}

// ————————————————— التقليم: إسقاطُ المنتظِر الذي لم يعد يُنطق —————————————————
//
// تغيّرُ صياغةٍ في شاشةٍ يترك نصَّها القديم في القائمة، وتصريفُه إهدارٌ للحصة وملفٌّ
// يتيمٌ في البنك. **والتقليمُ محصورٌ حصراً**: `pending` وحدَه (لا يُمَسّ `done` ولا ملفٌّ
// مولَّد)، وما لم تعد الشجرةُ تُعلنه، وما ليس له ملفٌّ في الفهرس.

if (process.argv.includes('--prune')) {
  const keep = new Set([...wanted.keys(), ...have]);
  const dead = queue.filter((e) => (e.status ?? 'pending') !== 'done' && !keep.has(e.text));
  const deadTexts = new Set(dead.map((e) => e.text));

  if (!dead.length) {
    console.log('\nالتقليم: لا مدخلَ منتظِراً خارج الحاجة — القائمة نظيفة.');
  } else {
    for (const e of dead) console.log(`  − ${e.text}   (${e.category} · ${e.requestedBy})`);
    const before = queue.length;
    const next = rewriteQueue((disk) => disk.filter(
      (e) => !((e.status ?? 'pending') !== 'done' && deadTexts.has(e.text))));
    console.log(`\nحُذف ${before - next.length} مدخلاً من tools/audio_queue.json (بقي ${next.length})`);
  }
}

if (process.argv.includes('--wanted-json')) {
  console.log(JSON.stringify([...wanted].map(([t, c]) => [t, c])));
}
