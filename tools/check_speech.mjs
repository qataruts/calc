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
// وخمسةُ أبواب:
//   ١) **الإعلان**: كلُّ وحدةٍ تنادي `audio.play` (أو `say`) تُعلن `SPOKEN`.
//   ٢) **القائمة**: كلُّ نصٍّ مُعلَنٍ له ملفٌّ مولَّد أو مدخلٌ في القائمة، وصيغةُ
//      المدخل تامّة — ولا مدخلَ في القائمة لا تنطقه وحدة (نصٌّ يُولَّد بلا مستهلك).
//   ٣) **الفئةُ تتبع الموضع**: فئةُ كلِّ مدخلٍ **منتظِرٍ** هي المشتقّةُ من موضع نصّه في
//      الشجرة — لا فئةٌ كُتبت بيد ولا فئةٌ بقيت بعد انتقال النصّ (بابٌ فُتح في الدفعة
//      الثانية يومَ نُقلت جملُ الكشف الثلاث إلى `SAY`، فكادت تُصرَّف بمسحة تعليمة).
//   ٤) **قيدا المنهج**: **لا رقمَ في نصٍّ منطوق** (ق١ — الرمزُ يُسمّى ولا يُقرأ رسمُه)،
//      و**لا معدودٌ مقرونٌ بعدد** (ق٢ — «ثلاث تفاحات» ممنوعةٌ نصّاً).
//   ٥) **الشكلُ الكامل**: كلُّ حرفٍ يحمل حركتَه (قاعدةُ اقرأ الدائمة) — وإلّا احتمل
//      النصُّ قراءتين فأخطأ المولّد وهو لا يدري.
//   ٦) **القناةُ واحدة** (بلاغُ الميدان ١ · الجلسة م١): لا وحدةَ تشغّل صوتاً بيدها —
//      `new Audio` والنطقُ الآليّ في `audio.js` وحدَه، وما سواه ينادي `audio.play`
//      فيقف في الطابور. **ويُقاس عملاً لا نصّاً**: تُستدعى القناةُ في node بعنصرٍ
//      وهميّ، فيُثبَت أنّ الثاني لا يبدأ قبل أن يتمّ الأول، وأنّ الإسكات يُفرغ
//      الطابور. (فحصُ النصّ يمنع البابَ الخلفيّ، وفحصُ العمل يمنع نقضَ القناة نفسِها.)
//
// **والبابُ الثالث يقرأ اشتقاقَ `queue_texts.mjs` نفسِه** (`--wanted-json`) لا نسخةً
// ثانيةً عنه: الحارسُ يحكم والأداةُ تُصلح، **والاشتقاقُ واحدٌ لهما** — ومصدران لحقيقةٍ
// واحدةٍ يفترقان. ومفتاحٌ في `SAY` لا تعرف الأداةُ فئتَه يوقفها، **فيحمرّ هذا البابُ
// بعلّته** بدل أن يمرّ صامتاً.
//
// ————— النومُ الذاتيّ (`docs/SEED.md §٥`) —————
//
// لا وحدةَ تنطق شيئاً قبل أوّل شاشة تمرين، فينام الحارسُ بشرطٍ **مجرود** (لا وحدةَ
// تُعلن `SPOKEN` ولا وحدةَ تنادي `audio.play`) ويستيقظ من تلقائه يومَ تُكتب أولاها.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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
 * **الفئةُ تتبع موضعَ النصّ**: مدخلٌ **منتظِرٌ** فئتُه غير المشتقّة يُصرَّف بمسحةِ أداءٍ
 * ليست له — ويُسمَع في أذن طفل. والمُصرَّفُ (`done`) خارجَ الباب: فئتُه أثرُ ما سُمع،
 * وتبديلُ الكلمة لا يبدّل صوتاً — إنما يُعاد تصريفُه بـ`--requeue` إن أرادت الأذن.
 */
export function categoryDrift(queue, wanted) {
  const drift = [];
  for (const entry of queue) {
    if ((entry.status ?? 'pending') === 'done') continue;
    const now = wanted.get(entry.text);
    if (now && now !== entry.category) drift.push({ text: entry.text, was: entry.category, now });
  }
  return drift;
}

/**
 * **لا معدودٌ مقرونٌ بعدد** (ق٢ · `METHOD.md §٨`): «ثَلَاثُ تُفَّاحَاتْ» ممنوعةٌ نصّاً.
 * ويُجرَد باسم العدد متبوعاً بكلمة — لا بمعنى الجملة: لفظُ عددٍ يليه اسمٌ **إشارةٌ
 * كافية** أن يُراجَع النصّ، وهذا حارسٌ عند البوّابة لا مصحّحُ نحو.
 *
 * **واسمُ العدد المركَّب ليس معدوداً** (الجلسة ٧): «ثَلَاثَةَ عَشَرْ» عددٌ واحد لفظُه
 * كلمتان — وهو **عينُ العدّ المجرد** الذي يفرضه ق٢، لا نقضٌ له. فيُستثنى **بموضعه لا
 * بشكله**: نصٌّ فئتُه المشتقّة `number_name` اسمُ عددٍ بحكم موضعه في `NUMBER_NAME`،
 * وما سواه يُقاس كما كان. ولا يُرخي ذلك الحارسَ: النصُّ نفسُه لو كُتب تعليمةً في
 * وحدةِ تمارينٍ لَسقط (يُثبته `--self-test`).
 */
const COUNTED = new RegExp(
  '(?:^|\\s)(?:وَ)?(?:ثَلَاث|أَرْبَع|خَمْس|سِتّ|سَبْع|ثَمَان|تِسْع|عَشْر|عَشَر)'
  + '[\\u064B-\\u0652\\u0670\\u0629\\u0627\\u064A\\u0648]*\\s+[\\u0621-\\u064A]', 'u');
export const hasCountedNoun = (text, category = null) =>
  category !== 'number_name' && COUNTED.test(String(text));

/**
 * **القناةُ واحدة**: ما يشغّل صوتاً بيده خارج `audio.js`.
 *
 * علّتُه من الميدان (`docs/FIELD.md §١`): صوتان يعملان معاً. ومهما أُحكِم الطابورُ
 * في القناة، فسطرٌ واحدٌ يشغّل عنصراً من خارجها يعيد العيبَ كما كان — **والامتناعُ
 * يُحرَس في المصدر لا يُترَك للانتباه**. (`say` تمرّ: هي بابُ القناة نفسِه.)
 */
export function outsideChannel(src) {
  const rules = [
    [/\bnew\s+Audio\s*\(/g, 'new Audio'],
    [/\bspeechSynthesis\b/g, 'speechSynthesis'],
    [/\bSpeechSynthesisUtterance\b/g, 'SpeechSynthesisUtterance'],
    [/\.play\s*\(\s*\)/g, 'عنصرٌ يُشغَّل بيده (‎.play()‎)'],
  ];
  const hits = [];
  for (const [re, what] of rules) if (re.test(String(src))) hits.push(what);
  return hits;
}

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

/**
 * الاشتقاقُ من الأداة نفسِها (`queue_texts.mjs --wanted-json`) — قراءةٌ لا تكتب شيئاً.
 * وتوقُّفُ الأداة (مفتاحٌ في `SAY` بلا فئة) **علّةٌ تُنقَل بنصّها** فيحمرّ الباب بها.
 */
function derivedCategories() {
  const tool = fileURLToPath(new URL('./queue_texts.mjs', import.meta.url));
  const run = spawnSync(process.execPath, [tool, '--wanted-json'], { encoding: 'utf8' });
  if (run.status !== 0) {
    return { error: (run.stderr || run.stdout || '').trim().split('\n').slice(0, 3).join(' | ') };
  }
  const line = run.stdout.trim().split('\n').reverse().find((l) => l.startsWith('['));
  if (!line) return { error: 'لا مخرَجَ JSON من queue_texts.mjs --wanted-json' };
  return { wanted: new Map(JSON.parse(line)) };
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

  console.log('\n— الفئة: مشتقّةٌ من موضع النصّ لا مكتوبةٌ بيد —');
  const derived = derivedCategories();
  if (derived.error) {
    ok(false, `اشتقاقُ الفئات متعذّر — ${derived.error}`);
  } else {
    const drift = categoryDrift(queue, derived.wanted);
    ok(drift.length === 0,
      `فئةُ كل مدخلٍ منتظِرٍ هي المشتقّةُ من موضعه (${queue.filter((r) => (r.status ?? 'pending') !== 'done').length} منتظِراً)`
      + (drift.length ? ` — **منحرف (يُردّ بـ\`queue_texts --retag\`): ${drift
        .map((d) => `«${d.text}» ${d.was}←${d.now}`).join(' · ')}**` : ''));
  }

  console.log('\n— قيدا المنهج: لا رقمَ منطوق، ولا معدودٌ مقرونٌ بعدد —');
  const digits = unique.filter(hasDigit);
  ok(digits.length === 0,
    'لا رقمَ في نصٍّ منطوق — العددُ يُسمّى ولا يُقرأ رسمُه (ق١)'
    + (digits.length ? ` — ${digits.join(' · ')}` : ''));
  // **والفئةُ من الاشتقاق نفسِه** (لا من القائمة): أسماءُ الأعداد تُعرَف بموضعها في
  // `NUMBER_NAME`، فالمركَّبُ منها («ثَلَاثَةَ عَشَرْ») عددٌ لا معدود. وما تعذّر
  // اشتقاقُه يُقاس بلا استثناء — فالعطبُ لا يفتح باباً.
  const counted = unique.filter((t) => hasCountedNoun(t, derived.wanted?.get(t)));
  ok(counted.length === 0,
    'ولا معدودٌ مقرونٌ بعدد — الكميةُ تُرى وتُعَدّ ولا تُركَّب نحوياً (ق٢)'
    + (counted.length ? ` — ${counted.join(' · ')}` : ''));

  console.log('\n— الشكلُ الكامل: كلُّ حرفٍ يحمل حركتَه —');
  const unvowelled = unique.map((t) => [t, bareLetters(t)]).filter(([, b]) => b.length);
  ok(unvowelled.length === 0,
    `كلُّ النصوص مشكولةٌ بالكامل (${unique.length} نصّاً)`
    + (unvowelled.length ? ` — عارٍ في: ${unvowelled.slice(0, 3)
      .map(([t, b]) => `«${t}» (${b.join('، ')})`).join(' · ')}` : ''));

  console.log('\n— القناةُ واحدة: لا صوتَ خارجها، ولا اثنان فيها معاً —');
  const stray = files.filter((f) => !ENGINE.has(f))
    .map((f) => [f, outsideChannel(read(new URL(f, APP)))])
    .filter(([, hits]) => hits.length);
  ok(stray.length === 0,
    `${files.length - ENGINE.size} وحدةً تنطق عبر \`audio.play\` وحدَها (لا عنصرَ صوتٍ بيدها)`
    + (stray.length ? ` — **خارج القناة: ${stray
      .map(([f, hits]) => `${f} (${hits.join('، ')})`).join(' · ')}**` : ''));
  await channelGate();

  console.log(fails
    ? `\n${fails} فشل`
    : `\nكلُّ نصٍّ منطوقٍ مُعلَنٌ ومصفوفٌ ومشكول، وقناتُه واحدة${asleep ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
  return fails ? 1 : 0;
}

/**
 * **القناةُ تُقاس عملاً**: تُشغَّل في node بعنصرِ صوتٍ وهميّ يسجّل لحظتَي بدئه وتمامه،
 * فيُثبَت ما لا يُثبته نصُّ المصدر — أنّ الثاني **لا يبدأ قبل أن يتمّ الأول**، وأنّ
 * `say` تُرجع وعدَ القناة (لا تبتلعه)، وأنّ الإسكات **يُفرغ الطابور** ولا يعطّله.
 *
 * وهو أخو حارس المتصفّح في `browser_test.html`: ذاك يقيس التعاقبَ في مسار الطفل
 * الحيّ، وهذا يقيس القناةَ نفسَها معزولةً — فينكشف العطبُ في أيّهما وقع.
 */
async function channelGate() {
  const plays = [];
  globalThis.window = globalThis.window || {};
  globalThis.Audio = class {
    constructor(src) { this.src = src; this.on = {}; }
    addEventListener(type, fn) { this.on[type] = fn; }
    removeAttribute() { this.src = ''; }
    load() {}
    pause() { this.close(); }
    close() {
      if (this.row && this.row.t1 === Infinity) {
        this.row.t1 = performance.now();
        clearTimeout(this.timer);
      }
    }
    play() {
      this.row = { t0: performance.now(), t1: Infinity };
      plays.push(this.row);
      this.timer = setTimeout(() => { this.close(); this.on.ended?.(); }, 30);
      return Promise.resolve();
    }
  };

  const audio = await import(new URL('audio.js', APP));
  const station = await import(new URL('station.js', APP));

  // نداءان في اللحظة نفسِها — وهو عينُ ما وقع في الميدان (إعلانُ الخطوة وسؤالُ الشاشة)
  const first = audio.play('أَلِفْ');
  const second = station.say('بَاءْ');
  ok(typeof second?.then === 'function', '`say` تُرجِع وعدَ القناة ولا تبتلعه');
  await Promise.all([first, second]);
  const overlap = plays.length === 2 && plays[1].t0 < plays[0].t1;
  ok(plays.length === 2 && !overlap,
    `ونداءان في اللحظة نفسِها يُسمَعان **بالتتابع لا معاً** (${plays.length} تشغيلاً`
    + `${plays.length === 2 ? `، فاصلُهما ${Math.round(plays[1].t0 - plays[0].t1)}ms` : ''})`);
  ok(plays.every((r) => Number.isFinite(r.t1)),
    'وكلُّ تشغيلٍ يتمّ (لا وعدَ يبقى معلّقاً فيجمّد القناة)');

  const before = plays.length;
  const dropped = [audio.play('جِيمْ'), audio.play('دَالْ')];
  audio.stop();                       // نقرةُ الطفل الناقلة: إسكاتٌ وإفراغ
  await Promise.all(dropped);
  ok(plays.length === before, `والإسكاتُ **يُفرغ الطابور**: ما صُفّ قبله لا يُشغَّل بعده `
    + `(${plays.length - before} تشغيلاً بعد الإسكات)`);
  await audio.play('هَاءْ');
  ok(plays.length === before + 1, 'والقناةُ تعمل بعد الإسكات (إفراغٌ لا تعطيل)');
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

  console.log('\n— الفئةُ المنحرفة تُمسَك، والمُصرَّفُ لا يُمَسّ —');
  const wanted = new Map([['وَهَذَا رَمْزُهَا', 'modeling'], ['خَمْسَةْ', 'number_name']]);
  const drift = (queue) => categoryDrift(queue, wanted);
  check(drift([{ text: 'وَهَذَا رَمْزُهَا', category: 'instruction', status: 'pending' }]).length === 1,
    'منتظِرٌ فئتُه غير المشتقّة يُمسَك (نصٌّ انتقل موضعَه)');
  check(drift([{ text: 'وَهَذَا رَمْزُهَا', category: 'modeling', status: 'pending' }]).length === 0,
    'ومَن وافقت فئتُه موضعَه يمرّ');
  check(drift([{ text: 'وَهَذَا رَمْزُهَا', category: 'instruction', status: 'done' }]).length === 0,
    '**والمُصرَّفُ خارجَ الباب** — فئتُه أثرُ ما سُمع، وتبديلُها لا يبدّل صوتاً');
  check(drift([{ text: 'خَمْسَةْ', category: 'number_name' }]).length === 0,
    'ومدخلٌ بلا حالةٍ يُقرأ منتظِراً ويُقاس');
  check(drift([{ text: 'نَصٌّ بَائِدْ', category: 'instruction', status: 'pending' }]).length === 0,
    'وما لا تنطقه الشجرةُ ليس منحرفاً (بابُ البائد يتولّاه)');

  console.log('\n— قيدا المنهج يُمسكان —');
  check(hasDigit('اِقْرَأْ ٣') && hasDigit('رَقْم 3'), 'الرقمُ في النصّ المنطوق يُمسَك (مشرقياً ومغربياً)');
  check(!hasDigit('ثَلَاثَةْ'), 'واسمُ العدد يمرّ');
  check(hasCountedNoun('ثَلَاثُ تُفَّاحَاتْ'), 'والمعدودُ المقرونُ بعددٍ يُمسَك (ق٢)');
  check(hasCountedNoun('خَمْسَةُ أَقْلَامْ'), 'ومعه صيغةُ المذكّر');
  check(!hasCountedNoun('خَمْسَةْ'), 'والعددُ المجرد يمرّ');
  check(!hasCountedNoun('كَمْ صَارَتْ كُلُّهَا؟'), 'وسؤالُ العدديّة يمرّ');
  check(!hasCountedNoun('ثَلَاثَةَ عَشَرْ', 'number_name'),
    'واسمُ العدد المركَّب يمرّ **بموضعه** (عددٌ لفظُه كلمتان — عينُ العدّ المجرد)');
  check(hasCountedNoun('ثَلَاثَةَ عَشَرْ', 'instruction') && hasCountedNoun('ثَلَاثَةَ عَشَرْ'),
    '**والنصُّ نفسُه تعليمةً يُمسَك** — فالاستثناءُ للموضع لا للشكل، ولا يرخي الحارس');

  console.log('\n— القناةُ واحدة: ما شغّل صوتاً بيده يُمسَك —');
  check(outsideChannel('say(SAY.watch); await audio.play(t);').length === 0,
    'وحدةٌ تنطق عبر القناة تمرّ');
  check(outsideChannel('const el = new Audio(src); el.play();').length === 2,
    '**وعنصرُ صوتٍ يُنشَأ ويُشغَّل خارجها يُمسَك** (وهو ما يعيد التراكب مهما أُحكم الطابور)');
  check(outsideChannel('window.speechSynthesis.cancel();').length === 1,
    'ونطقٌ آليّ من خارج المحرّك يُمسَك');
  check(outsideChannel('new SpeechSynthesisUtterance(t)').length === 1, 'ومعه لسانُه');

  console.log(bad ? `\n${bad} فشل` : '\n✓ الفاحص يمسك المخالفات كلها');
  return bad ? 1 : 0;
}

process.exit(process.argv.includes('--self-test') ? selfTest() : await main());
