// **حارسُ النصّ المنطوق** — «لا صوتَ يخرج من التطبيق لم يمرّ ببروتوكول الصوت»:
//   node tools/check_speech.mjs              # الفحص على الشجرة الحيّة
//   node tools/check_speech.mjs --self-test  # فحصُ الفاحص: أيمسك المخالفات؟
//
// ————— العيبُ الذي وُلد منه (`docs/AUDIO_QUEUE.md`) —————
//
// فصلُ الصوت عن التطوير عهدٌ (`METHOD.md §٨`): جلسةُ التطوير **تصفّ** نصوصَها في
// `tools/audio_queue.json` وجلسةُ الصوتيات تصرّفها. وثمنُ هذا الفصل أنّ **نسيانَ سطرٍ
// في القائمة لا يُفشِل شيئاً**: التطبيق يعمل، والاختباراتُ خضراء، ويحتاط `audio.js`
// بالنطق الآليّ — فيسمع الطفلُ صوتاً آلياً لنصٍّ لا يعلم أحدٌ أنّه فات، وينكشف ذلك
// في جهازٍ لا في شجرة. وهو عينُ صنف «حراسة الغياب»: لا حارسَ يسأل عمّا لم يُكتب.
//
// فهذا الحارس يقلب القاعدة: **كلُّ وحدةٍ تُعلن ما تنطق** (`export const SPOKEN`)،
// ويُطالَب كلُّ نصٍّ مُعلَنٍ بملفٍّ مولَّد **أو** بمكانٍ في قائمة الانتظار — والغيابُ
// نفسُه صار فشلاً أحمر.
//
// وأربعةُ أبواب:
//   ١) **الإعلان**: كلُّ وحدةٍ تنادي `audio.play` (أو `say`) تُعلن `SPOKEN`.
//   ٢) **القائمة**: كلُّ نصٍّ مُعلَنٍ له ملفٌّ مولَّد أو مدخلٌ في القائمة، وصيغةُ
//      المدخل تامّة — ولا مدخلَ في القائمة لا تنطقه وحدة (نصٌّ يُولَّد بلا مستهلك).
//   ٣) **قيدا المنهج**: **لا رقمَ في نصٍّ منطوق** (ق١ — الرمزُ يُسمّى ولا يُقرأ رسمُه)،
//      و**لا معدودٌ مقرونٌ بعدد** (ق٢ — «ثلاث تفاحات» ممنوعةٌ نصّاً).
//   ٤) **الشكلُ الكامل**: كلُّ حرفٍ يحمل حركتَه (قاعدةُ اقرأ الدائمة) — وإلّا احتمل
//      النصُّ قراءتين فأخطأ المولّد وهو لا يدري.
//
// ————— النومُ الذاتيّ (`docs/SEED.md §٥`) —————
//
// لا وحدةَ تنطق شيئاً قبل أوّل شاشة تمرين، فينام الحارسُ بشرطٍ **مجرود** (لا وحدةَ
// تُعلن `SPOKEN` ولا وحدةَ تنادي `audio.play`) ويستيقظ من تلقائه يومَ تُكتب أولاها.

import { readFileSync, readdirSync, existsSync } from 'node:fs';

const APP = new URL('../app/js/', import.meta.url);
const QUEUE = new URL('./audio_queue.json', import.meta.url);
const BANK = new URL('../app/audio/manifest.json', import.meta.url);

const read = (url) => readFileSync(url, 'utf8');
const files = readdirSync(APP).filter((f) => f.endsWith('.js'));

// وحداتُ المنصة التي لا تنطق بطبعها (`audio.js` نفسُه محرّكُ النطق لا مصدرَ نصّ)
const ENGINE = new Set(['audio.js']);

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

// ————— القواعدُ الأربع: دوالُّ خالصة تُجرَّب سالباً —————

const LETTER = /[ء-غف-ي]/;
const MARK = /[ً-ْٰ]/;
/** حروفُ المدّ لا تحمل حركة: الألفُ أبداً، والواوُ والياءُ بعد ضمّةٍ وكسرة. */
const SILENT = new Set(['ا', 'ى', 'آ']);

/** علاماتُ الحرف الذي يبدأ عند `at` — شدّةً وحركةً بأيّ ترتيبٍ كُتبتا. */
function marksAfter(chars, at) {
  const marks = [];
  for (let i = at + 1; i < chars.length && MARK.test(chars[i]); i++) marks.push(chars[i]);
  return marks;
}

/**
 * **الشكلُ الكامل**: كلُّ حرفٍ يحمل حركتَه أو سكونَه — ويُستثنى حرفُ المدّ، ولامُ
 * التعريف الشمسية (تسكن بلا علامةٍ أمام مشدَّد). ويُرجِع الحروفَ العارية.
 */
export function bareLetters(text) {
  const chars = [...String(text)];
  const bare = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (!LETTER.test(ch) || SILENT.has(ch)) continue;
    const next = chars[i + 1] || '';
    if (MARK.test(next)) continue;
    // واوُ ومدُّ الياء بعد حركتهما، ولامُ «ال» قبل مشدَّد (الشمسية تسكن بلا علامة)
    const prev = chars[i - 1] || '';
    if (ch === 'و' && prev === 'ُ') continue;
    if (ch === 'ي' && prev === 'ِ') continue;
    if (ch === 'ل' && prev === 'ا' && marksAfter(chars, i + 1).includes('ّ')) continue;
    bare.push(`${ch}@${i}`);
  }
  return bare;
}

/** **لا رقمَ في نصٍّ منطوق** (ق١): يُسمّى العددُ ولا يُقرأ رسمُه — مشرقياً كان أو مغربياً. */
export const hasDigit = (text) => /[0-9٠-٩]/.test(String(text));

/**
 * **ما يستر النصَّ من النطق الآليّ**: ملفٌّ في البنك، **أو** مكانٌ في القائمة ما زال
 * ينتظر. ومدخلٌ `done` بلا ملفٍّ لا يستر شيئاً — بل هو أخطرُ من الغياب: القائمةُ
 * تقول «صُرِّف» والطفلُ يسمع نطقاً آلياً. (شُدَّ في الجلسة ص يومَ صار في القائمة
 * منجَزٌ يُقابَل به — قبلها كان كلُّ مدخلٍ منتظِراً فلا فرقَ يُقاس.)
 */
export function coverOf(text, banked, entry) {
  if (banked.has(text)) return 'ملف';
  if (!entry) return '';
  return (entry.status ?? 'pending') === 'done' ? 'مُصرَّفٌ بلا ملف' : 'انتظار';
}

/**
 * **لا معدودٌ مقرونٌ بعدد** (ق٢ · `METHOD.md §٨`): «ثَلَاثُ تُفَّاحَاتْ» ممنوعةٌ نصّاً.
 * ويُجرَد باسم العدد متبوعاً بكلمة — لا بمعنى الجملة: لفظُ عددٍ يليه اسمٌ **إشارةٌ
 * كافية** أن يُراجَع النصّ، وهذا حارسٌ عند البوّابة لا مصحّحُ نحو.
 */
const COUNTED = new RegExp(
  '(?:^|\\s)(?:وَ)?(?:ثَلَاث|أَرْبَع|خَمْس|سِتّ|سَبْع|ثَمَان|تِسْع|عَشْر|عَشَر)'
  + '[\\u064B-\\u0652\\u0670\\u0629\\u0627\\u064A\\u0648]*\\s+[\\u0621-\\u064A]', 'u');
export const hasCountedNoun = (text) => COUNTED.test(String(text));

// ————— جردُ الشجرة —————

function declaredSpoken() {
  const out = new Map();      // ملفٌّ ← نصوصُه المعلَنة
  const speakers = [];        // ملفاتٌ تنطق ولا تُعلن
  for (const file of files) {
    if (ENGINE.has(file)) continue;
    const src = read(new URL(file, APP));
    const declares = /export\s+const\s+SPOKEN\b/.test(src);
    const speaks = /audio\.play\s*\(|\bsay\s*\(/.test(src);
    if (declares) out.set(file, null);
    else if (speaks) speakers.push(file);
  }
  return { out, speakers };
}

async function spokenOf(file) {
  const mod = await import(new URL(file, APP));
  return Array.isArray(mod.SPOKEN) ? mod.SPOKEN : [];
}

async function main() {
  const { out, speakers } = declaredSpoken();

  console.log('\n— الإعلان: مَن نطق أعلن —');
  if (!out.size && !speakers.length) {
    dormant('لا وحدةَ تنطق نصّاً بعد (`SPOKEN` — الجلسة ٣ تكتب أولاها)');
  } else {
    ok(speakers.length === 0,
      `${out.size} وحدةً تُعلن نصوصَها المنطوقة`
      + (speakers.length ? ` — **تنطق ولا تُعلن: ${speakers.join('، ')}**` : ''));
  }

  const texts = [];
  for (const file of out.keys()) texts.push(...await spokenOf(file));
  const unique = [...new Set(texts)];

  if (!unique.length) {
    console.log(fails ? `\n${fails} فشل` : `\nلا نصَّ منطوقاً بعد (و${asleep} نائم بقيدٍ في docs/SEED.md)`);
    process.exit(fails ? 1 : 0);
  }

  console.log('\n— القائمة: لكل نصٍّ ملفُّه أو مكانُه في الانتظار —');
  const queue = JSON.parse(read(QUEUE));
  const bank = existsSync(BANK) ? Object.values(JSON.parse(read(BANK))) : null;
  const queued = new Map(queue.map((row) => [row.text, row]));
  const banked = new Set(bank || []);

  const cover = new Map(unique.map((t) => [t, coverOf(t, banked, queued.get(t))]));
  const orphan = unique.filter((t) => !cover.get(t));
  ok(orphan.length === 0,
    `${unique.length} نصّاً مُعلَناً، لكلٍّ ملفُّه أو مكانُه في القائمة`
    + (orphan.length ? ` — **خارج القائمة: ${orphan.slice(0, 5).join(' · ')}**` : ''));

  // **وما قيل عنه «صُرِّف» له ملفٌّ فعلاً**: قائمةٌ تقول `done` وبنكٌ خالٍ منه = طفلٌ
  // يسمع نطقاً آلياً ولا حارسَ يشتكي — وهو عينُ الصنف الذي وُلد منه هذا الفاحص.
  const broke = unique.filter((t) => cover.get(t) === 'مُصرَّفٌ بلا ملف');
  const withFile = unique.filter((t) => cover.get(t) === 'ملف').length;
  ok(broke.length === 0,
    `ومنها ${withFile} له ملفٌّ مولَّد و${unique.length - withFile} ما زال ينتظر`
    + (broke.length ? ` — **مُصرَّفٌ بلا ملف: ${broke.slice(0, 5).join(' · ')}**` : ''));

  const stale = queue.filter((row) => !unique.includes(row.text));
  ok(stale.length === 0,
    'ولا مدخلَ في القائمة لا تنطقه وحدة (نصٌّ يُولَّد بلا مستهلك)'
    + (stale.length ? ` — بائد: ${stale.slice(0, 5).map((r) => r.text).join(' · ')}` : ''));

  const FIELDS = ['text', 'category', 'requestedBy', 'priority', 'status'];
  const CATEGORIES = new Set(['number_name', 'instruction', 'celebration', 'modeling']);
  const broken = queue.filter((row) => FIELDS.some((f) => row[f] === undefined)
    || !CATEGORIES.has(row.category));
  ok(broken.length === 0,
    `وصيغةُ كل مدخلٍ تامّةٌ بفئةٍ من الأربع (${queue.length} مدخلاً)`
    + (broken.length ? ` — معطوب: ${broken.length}` : ''));

  console.log('\n— قيدا المنهج: لا رقمَ منطوق، ولا معدودٌ مقرونٌ بعدد —');
  const digits = unique.filter(hasDigit);
  ok(digits.length === 0,
    'لا رقمَ في نصٍّ منطوق — العددُ يُسمّى ولا يُقرأ رسمُه (ق١)'
    + (digits.length ? ` — ${digits.join(' · ')}` : ''));
  const counted = unique.filter(hasCountedNoun);
  ok(counted.length === 0,
    'ولا معدودٌ مقرونٌ بعدد — الكميةُ تُرى وتُعَدّ ولا تُركَّب نحوياً (ق٢)'
    + (counted.length ? ` — ${counted.join(' · ')}` : ''));

  console.log('\n— الشكلُ الكامل: كلُّ حرفٍ يحمل حركتَه —');
  const unvowelled = unique.map((t) => [t, bareLetters(t)]).filter(([, b]) => b.length);
  ok(unvowelled.length === 0,
    `كلُّ النصوص مشكولةٌ بالكامل (${unique.length} نصّاً)`
    + (unvowelled.length ? ` — عارٍ في: ${unvowelled.slice(0, 3)
      .map(([t, b]) => `«${t}» (${b.join('، ')})`).join(' · ')}` : ''));

  console.log(fails
    ? `\n${fails} فشل`
    : `\nكلُّ نصٍّ منطوقٍ مُعلَنٌ ومصفوفٌ ومشكول${asleep ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
  return fails ? 1 : 0;
}

// ————— فحصُ الفاحص: **مُجرَّبٌ سالباً** —————

function selfTest() {
  let bad = 0;
  const check = (cond, msg) => { if (cond) console.log('  ✓', msg); else { bad++; console.log('  ✗', msg); } };

  console.log('\n— الشكلُ الكامل يمسك العاري —');
  check(bareLetters('خَمْسَةْ').length === 0, 'نصٌّ مشكولٌ بالكامل يمرّ');
  check(bareLetters('وَاحِدْ').length === 0, 'وحرفُ المدّ لا يُطالَب بحركة (الألف)');
  check(bareLetters('طَابِقِ الْكَمِّيَّتَيْنْ').length === 0, 'ولامُ التعريف الساكنة تمرّ');
  check(bareLetters('الشَّمْسْ').length === 0, 'ولامُ «ال» الشمسية أمام مشدَّدٍ تمرّ');
  check(bareLetters('خمسة').length > 0, 'ونصٌّ عارٍ يُمسَك');
  check(bareLetters('خَمْسه').length > 0, 'وحرفٌ واحدٌ عارٍ في نصٍّ مشكولٍ يُمسَك');

  console.log('\n— السترُ من النطق الآليّ: ملفٌّ أو انتظارٌ، لا دعوى —');
  const bank = new Set(['خَمْسَةْ']);
  check(coverOf('خَمْسَةْ', bank, { status: 'done' }) === 'ملف', 'ما له ملفٌّ مستورٌ بملفه');
  check(coverOf('رَائِعْ', bank, { status: 'pending' }) === 'انتظار',
    'وما ينتظر التصريفَ مستورٌ باحتياط النطق مؤقتاً');
  check(coverOf('رَائِعْ', bank, {}) === 'انتظار', 'ومدخلٌ بلا حالةٍ يُقرأ منتظِراً');
  check(coverOf('رَائِعْ', bank, { status: 'done' }) === 'مُصرَّفٌ بلا ملف',
    '**ومدخلٌ يقول «صُرِّف» ولا ملفَ له يُمسَك** — الأخطرُ من الغياب');
  check(coverOf('رَائِعْ', bank, undefined) === '', 'ونصٌّ خارج القائمة والبنك لا سترَ له');

  console.log('\n— قيدا المنهج يُمسكان —');
  check(hasDigit('اِقْرَأْ ٣') && hasDigit('رَقْم 3'), 'الرقمُ في النصّ المنطوق يُمسَك (مشرقياً ومغربياً)');
  check(!hasDigit('ثَلَاثَةْ'), 'واسمُ العدد يمرّ');
  check(hasCountedNoun('ثَلَاثُ تُفَّاحَاتْ'), 'والمعدودُ المقرونُ بعددٍ يُمسَك (ق٢)');
  check(hasCountedNoun('خَمْسَةُ أَقْلَامْ'), 'ومعه صيغةُ المذكّر');
  check(!hasCountedNoun('خَمْسَةْ'), 'والعددُ المجرد يمرّ');
  check(!hasCountedNoun('كَمْ صَارَتْ كُلُّهَا؟'), 'وسؤالُ العدديّة يمرّ');

  console.log(bad ? `\n${bad} فشل` : '\n✓ الفاحص يمسك المخالفات كلها');
  return bad ? 1 : 0;
}

process.exit(process.argv.includes('--self-test') ? selfTest() : await main());
