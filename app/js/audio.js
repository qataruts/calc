// الصوت: ملفات mp3 مولَّدة مسبقاً في app/audio/ (انظر tools/generate_audio.py).
// اسم كل ملف = sha1 لنصّه العربي (أول ١٢ خانة) — نفس الاشتقاق هنا وفي بايثون،
// فاستبدال أي ملف بتسجيل بشري لاحقاً لا يمسّ الشيفرة.
// عند غياب الملف: احتياط بـ Web Speech API حتى لا يصمت الدرس أبداً.
//
// **وسمُ المحتوى (`?v=`)**: الاسم من النصّ لا من المحتوى، فاستبدال الصوت تحت
// المفتاح نفسه لا يغيّر الرابط — والجهاز الذي خزّن القديم في عامل الخدمة يبقى
// عليه، فيُسمع الحرفُ الواحد بصوتين بحسب تاريخ أول طلب. لذلك نطلب الملف موسوماً
// ببصمة بايتاته من `audio/versions.json` (يكتبها المولّد): تبديلُ المحتوى يغيّر
// الرابط فيُكسَر كاشُ ذلك الملف **وحده**، وما لم يُبدَّل يبقى مخزوناً كما هو.
// وغيابُ البيان لا يُعطّل شيئاً — رابطٌ بلا وسم كما كان.

import * as support from './support.js';

const AUDIO_URL = new URL('../audio/', import.meta.url);
const MANIFEST_URL = new URL('manifest.json', AUDIO_URL);
const VERSIONS_URL = new URL('versions.json', AUDIO_URL);

// الوسم على http(s) وحده: بعض المتصفّحات ترفض عنوان `file:` بسلسلة استعلام،
// ولا كاش هناك أصلاً — فلا حاجة إلى الوسم ولا خسارة بتركه.
const TAGGABLE = typeof location !== 'undefined' && /^https?:$/.test(location.protocol);

let manifestKeys = null;   // Set لمفاتيح الملفات الموجودة (null = لم يُقرأ الفهرس بعد)
let versions = null;       // مفتاح ← بصمة محتواه (null = لا بيان بصمات)
let manifestLoad = null;
const cache = new Map();   // نص → مفتاح (تفادي إعادة حساب sha1)

// ————— **القناةُ الواحدة**: طابورٌ لا يبدأ فيه نصٌّ وفي الجوّ نصٌّ يعمل —————
//
// **بلاغُ الميدان ١** (`docs/FIELD.md §١`): «يبدأ بـ«انظر وا… اثنان»، الصوت متراكب
// فوق بعضه، مقطوش». وعلّتُه كانت هنا: `play()` **تُطلِق ولا تُنتظَر**، فمن ناداها
// مرّتين في تعاقبٍ واحد وقعت الثانيةُ فوق الأولى بوجهين:
//
//   • **الدهس**: نداءٌ بعد ٦٢٠ مللي على ملفٍّ طولُه ثانية يقطع أوّلَه في منتصفه —
//     فالتعاقبُ كان معلّقاً بمهلاتٍ ثابتة (`wait(BEAT)`) لا بتمام الصوت.
//   • **التراكب**: نداءان **في نفس اللحظة** (جملةُ الخطوة ثم سؤالُ الشاشة) — كلٌّ
//     منهما يُسكت ما قبله **ثم** يقف عند `await ready()`، فلا تجد إحداهما الأخرى
//     لتوقفها (لم تبدأ بعد!) ثم تعملان جميعاً. **وإسكاتُ ما لم يبدأ لا يُسكت شيئاً**
//     — فالعلاجُ طابورٌ لا إسكاتٌ أسرع.
//
// فصار للصوت قناةٌ واحدة: كلُّ نداءٍ يقف في ذيل سلسلةٍ من الوعود، ولا يبدأ إلا بعد
// أن يتمّ ما قبله (`ended` أو انقطاعٌ مقصود)، **و`play()` تُرجع وعدَه** — به تنتظر
// الشاشةُ تمامَ الكلام قبل أن تنتقل. **والامتناعُ بنيويٌّ لا اتفاق**: لا موضعَ في
// الشيفرة يشغّل صوتاً خارج هذه السلسلة (بابُ «القناةُ واحدة» في `check_speech.mjs`).
//
// ————— **ومقابلةُ اقرأ** (الجلسة م٢ · `read@9220ab1` — بلاغُ طفلةٍ حقيقية) —————
//
// إصلاحُ التكدّس هناك ثلاثةُ بنود، قوبلت بقناتنا بنداً بنداً **ولم يُنقل الملفُّ فوقها**
// (حكمُ مراجعة م١، البند ٢) — فالقناةُ تحلّ أصلَ العلّة (لا دهسَ، فلا سباقَ إسكات):
//   ١) **الإيقافُ المتعمَّد ليس عطلاً**: هناك `_hush` يحلّ الوعد قبل الإيقاف، وهنا
//      `cut()` نفسُها — تسويةٌ هادئة بـfalse لا رفضٌ يسقط في `catch` إعادة المحاولة.
//      **وأُتمّ ما نقص**: جيلٌ يُقرأ في ذلك الـ`catch` نفسِه (انظر `playNow`) — لأنّ
//      عطباً حقيقياً قد يصادف إسكاتاً، فتمضي الإعادةُ على نصٍّ غادره الطفل.
//   ٢) **المتجاوَزُ لا يبقى وعدُه معلَّقاً** (عطبٌ كشفه فحصُهم السالب): عندنا يُسوّى
//      المشتغلُ بـ`cut()`، ومن كان في الطابور يُسوّى **عند دوره** بـfalse — فلا وعدَ
//      يتجمّد، ولا شاشةَ تنتظر كلاماً لن يجيء.
//   ٣) **`playSequence` لا تمضي بعد التجاوز**: أُتمّ (جيلٌ يُقرأ عند البدء).
// **وما لم يُنقل عمداً**: `tail`/`quiet()`/`afterSpeech()` — تلك جوابُ اقرأ لبلاغِنا
// نحن («لا انتظارَ للكلام»)، وجوابُنا له الطابورُ نفسُه: `play()` وعدٌ يُنتظَر مباشرةً،
// فذيلٌ ثانٍ فوق الطابور مِرفقٌ لا يحرس شيئاً. **وحارسُه** `tools/test_audio_stack.mjs`.

let queue = Promise.resolve();   // ذيلُ القناة — ما بعده ينتظره
let epoch = 0;                   // كلُّ إسكاتٍ يزيده، فيسقط كلُّ ما كان في الطابور
let endCurrent = null;           // إنهاءُ ما يعمل الآن (إسكاتٌ بيد الطفل)

// ————— sha1 خالص (بلا اعتماد على crypto.subtle كي يعمل من file:// أيضاً) —————
function sha1Hex(bytes) {
  const total = ((((bytes.length + 8) >> 6) + 1) << 6);
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const dv = new DataView(buf.buffer);
  const bits = bytes.length * 8;
  dv.setUint32(total - 8, Math.floor(bits / 4294967296), false);
  dv.setUint32(total - 4, bits >>> 0, false);

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  const w = new Uint32Array(80);

  for (let i = 0; i < total; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4, false);
    for (let j = 16; j < 80; j++) {
      const n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
      w[j] = (n << 1) | (n >>> 31);
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (j < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const t = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) >>> 0;
      e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  return [h0, h1, h2, h3, h4].map((x) => x.toString(16).padStart(8, '0')).join('');
}

/** مفتاح النص = اسم ملفه الصوتي (بلا امتداد). */
export function keyFor(text) {
  let key = cache.get(text);
  if (!key) {
    key = sha1Hex(new TextEncoder().encode(text)).slice(0, 12);
    cache.set(text, key);
  }
  return key;
}

/** قراءة فهرس الأصوات مرة واحدة — لمعرفة الموجود قبل محاولة تشغيله.
 *  ومعه بيانُ البصمات: غيابُه لا يمنع التشغيل (روابط بلا وسم)، فلا يُربَط
 *  سماعُ الطفل بملفٍّ ثانٍ قد يتأخّر. */
export function ready() {
  if (!manifestLoad) {
    const index = fetch(MANIFEST_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((m) => { manifestKeys = new Set(Object.keys(m)); })
      .catch(() => { manifestKeys = null; });   // بلا فهرس: نجرّب الملف ثم نحتاط بالنطق
    const tags = fetch(VERSIONS_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((v) => { versions = v; })
      .catch(() => { versions = null; });
    manifestLoad = Promise.all([index, tags]).then(() => undefined);
  }
  return manifestLoad;
}

function urlFor(text) {
  const key = keyFor(text);
  const href = new URL(`${key}.mp3`, AUDIO_URL).href;
  const tag = TAGGABLE && versions ? versions[key] : null;
  return tag ? `${href}?v=${tag}` : href;
}

/** هل للنص ملف مولَّد؟ (null = الفهرس غير مقروء بعد — نادِ ready() أولاً). */
export function hasFile(text) {
  return manifestKeys ? manifestKeys.has(keyFor(text)) : null;
}

/** **إطلاقُ موارد عنصرٍ فرغنا منه** (بلاغ المالك، ١٣ أغسطس ٢٠٢٦: بطءُ الصوت على
 *  الآيباد، ثم صمتٌ تامّ لا يزيله إلا إعادةُ تشغيل الجهاز):
 *
 *  لكل نطقٍ عنصرُه — مئاتٌ في الجلسة الواحدة — وكان كلٌّ يبقى معلَّقاً بمصدره بعد أن
 *  يصمت. وiOS يحدّ ما تفكّه الصفحةُ من وسائطَ حيّة، وحدُّه في **خادم الوسائط** لا في
 *  الصفحة — ولذلك لا تُصلحه إعادةُ تثبيت التطبيق وتُصلحه إعادةُ تشغيل الجهاز. فصار
 *  العنصرُ يُطلَق فورَ فراغه: يُوقَف، ويُنزَع مصدرُه، ويُعاد تحميله فارغاً.
 *
 *  **ولم يُمَسّ تسلسلُ التشغيل بحرف**: العنصرُ لكل نطقٍ كما كان، والوعدُ يُحلّ عند
 *  `ended` ويُرفَض عند `error` كما كان. وجُرّبت بدائلُ أوسع (عنصرٌ واحد يُعاد
 *  استعماله، ثم عنصران يتناوبان) **فأسقطت حارسَ «صفر طلبات شبكية في دورة التسجيل»
 *  متقطّعاً**، فرُدّت — والخصوصيةُ لا تُقايَض بجزءٍ من ثانية. */
function releaseEl(el) {
  if (!el) return;
  try {
    el.pause();
    el.removeAttribute('src');
    el.load();
  } catch { /* عنصرٌ لم يبلغ حالةً تسمح — لا يمنع شيئاً */ }
}

/**
 * **إسكاتُ القناة وإفراغُ طابورها** — نقرةُ الطفل التي تنقل مشروعةٌ ومنضبطة
 * (`SESSIONS.md` م١·٣): ما يعمل الآن يُقطَع، **وما كان في الطابور لا يُشغَّل بعدها**
 * — فلا يُكمل صوتُ شاشةٍ سابقة فوق اللاحقة. والقطعُ المقصود ليس تراكباً.
 */
export function stop() {
  epoch++;                                  // ما ينتظر دورَه يسقط عند دوره
  if (endCurrent) endCurrent();
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
}

/**
 * **زمنٌ مقدَّرٌ لنصٍّ لا نسمعه** — حروفُه المنطوقة في وسيط نطق الطفل.
 * تُستعمَل حارساً للتجميد ومهلةً للصامت: **مهلةٌ محسوبة لا تجميدٌ أبديّ ولا صفر**.
 */
export function estimateMs(text) {
  const letters = String(text).replace(/[ً-ْٰ\s]/g, '').length;
  return Math.min(6000, Math.max(700, letters * 130));
}

function playFile(text) {
  return new Promise((resolve, reject) => {
    const el = new Audio(urlFor(text));
    el.preload = 'auto';
    /* **سرعةُ السماع مقبضُ دعمٍ لا ملفٌّ ثانٍ** (الجلسة د): الملفُّ هو هو والكلمةُ هي
       هي — يُبطَّأ تشغيلُها قليلاً حين يُشغَّل الوضع، و`١` مطفأً فلا يُمَسّ العنصر.
       (والمتصفّحُ يحفظ الطبقةَ افتراضاً فلا يغلُظ الصوت.) */
    el.playbackRate = support.rate();
    let settled = false;
    let timer = 0;
    const close = () => {
      settled = true;
      clearTimeout(timer);
      if (endCurrent === cut) endCurrent = null;
      releaseEl(el);                     // بعد التمام: صمتٌ فلا حاجة إلى موارده
    };
    const end = (heard) => { if (!settled) { close(); resolve(heard); } };
    const fail = (err) => { if (!settled) { close(); reject(err); } };
    /** إسكاتٌ مقصود: يُنهي الوعدَ ولا يرمي — القناةُ تمضي إلى ما بعده. */
    const cut = () => end(false);
    endCurrent = cut;

    /* **حارسُ التجميد**: `ended` قد لا يجيء أبداً (وسيطٌ يُفصَل، ملفٌّ يعلَق بعد أن
       بدأ) — ولو انتظرته القناةُ بلا حدّ لَتجمّد الدرسُ كلُّه على طفل. فمهلةٌ من طول
       الملفّ متى عُرف، ومن طول نصّه قبل ذلك. */
    const arm = () => {
      clearTimeout(timer);
      /* **والمهلةُ تُقسَم على سرعة التشغيل**: ما طولُه ثانيةٌ يُسمَع في أطولَ منها إن
         بُطِّئ — فلو بقيت المهلةُ على الطول المكتوب لَقطعت الكلامَ في وضع الدعم. */
      const speed = el.playbackRate > 0 ? el.playbackRate : 1;
      const ms = (Number.isFinite(el.duration) && el.duration > 0
        ? el.duration * 1000 : estimateMs(text)) / speed + 1500;
      timer = setTimeout(cut, ms);
    };
    arm();
    el.addEventListener('loadedmetadata', arm, { once: true });
    el.addEventListener('ended', () => end(true), { once: true });
    el.addEventListener('error', () => fail(new Error('audio')), { once: true });
    el.play().catch(fail);
  });
}

/**
 * **صمتٌ بزمنه**: نصٌّ لا سبيل إلى سماعه (لا ملفَّ له ولا نطقَ آليّ في هذا الوسيط)
 * يأخذ زمنَه المقدَّر ثم تمضي القناة — فلا تجري الشاشةُ فوق كلامٍ يُفترَض أنه يُقال،
 * ولا تقف تنتظر ما لن يجيء. وهو **الاحتياطُ عند غياب الملف** (`SESSIONS.md` م١·٢).
 */
function hush(text) {
  return new Promise((resolve) => {
    const done = () => { clearTimeout(timer); endCurrent = null; resolve(false); };
    const timer = setTimeout(done, estimateMs(text));
    endCurrent = done;
  });
}

/**
 * احتياط: نطق آلي من المتصفح — أبطأ قليلاً كي تتضح الحروف لأذن الطفل.
 * لا يرمي أبداً: متصفّح بلا نطق (أو يرفض النصّ) يعود بـfalse، فلا يسقط الدرس
 * على طفل بسبب صوت — وهذا الاحتياط هو ما يشتغل للنصوص المنتظِرة في قائمة الصوت.
 *
 * **ولسانُ المتصفّح يعلَق** (عيبٌ معروف في محرّكات النطق): `end` قد لا يجيء، فمهلةٌ
 * محسوبة من طول النصّ ورتبةِ بطئه تفكّ القناةَ بدل أن يقف الدرس.
 */
function speak(text) {
  return new Promise((resolve) => {
    let timer = 0;
    let settled = false;
    const done = (heard) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (endCurrent === cut) endCurrent = null;
      resolve(heard);
    };
    const cut = () => done(false);
    try {
      const synth = window.speechSynthesis;
      if (!synth || !window.SpeechSynthesisUtterance) return done(false);
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      u.rate = 0.75;
      u.onend = () => done(true);
      u.onerror = () => done(false);
      timer = setTimeout(cut, estimateMs(text) / 0.75 + 1500);
      endCurrent = cut;
      synth.cancel();
      synth.speak(u);
    } catch {
      done(false);
    }
  });
}

/** الاحتياطُ كلُّه: نطقٌ آليّ إن وُجد، وإلّا **صمتٌ بزمنه** — ولا تجميدَ بحال. */
async function fallback(text) {
  return (await speak(text)) || hush(text);
}

/**
 * تشغيل نصّ عربي **في القناة**: يقف في ذيل الطابور، فإذا جاء دورُه بحث عن ملفه
 * المولَّد، فإن غاب نطقه المتصفح. ولا يبدأ وفي الجوّ نصٌّ يعمل — بنيةً لا اتفاقاً.
 *
 * @returns {Promise<boolean>} وعدٌ **يتمّ بتمام الكلام** (`ended`) — به تنتظر الشاشةُ
 *   قبل أن تنتقل. وقيمتُه: صحيحٌ إن سُمع شيءٌ فعلاً.
 */
export function play(text) {
  if (!text) return Promise.resolve(false);
  const mine = epoch;
  // **الإسقاطُ عند الدور لا عند الصفّ**: ما أُسكِت بعد أن صُفّ لا يُشغَّل حين يجيء دورُه
  const turn = queue.then(() => (mine === epoch ? playNow(text, mine) : false));
  queue = turn.then(() => undefined, () => undefined);
  return turn;
}

async function playNow(text, mine) {
  await ready();
  // **وقراءةُ الفهرس أوّلَ مرّة انتظارُ شبكة**: من أُسكِت خلالها لا يُشغَّل بعدها
  if (mine !== epoch) return false;
  // **الاحتياطُ لغياب الملف لا لبطء الشبكة** (بلاغ المالك، ١٣ أغسطس ٢٠٢٦: «عند
  // التقدّم بسرعة في الحروف يبدأ الصوتُ الآليّ»):
  //
  // كان `catch` واحدٌ يبتلع الحالتين — فمَن تصفّح بسرعةٍ قبل أن يكتمل خزنُ الصوت
  // سمع **نطقاً آلياً لحرفٍ له ملفٌّ بحقّ**، لأنّ ملفَّه تأخّر لا لأنّه غائب. وهو
  // نقضٌ لوعدٍ معلَن على بوّابتنا: «لا ينطق التطبيق شيئاً بصوت آليّ لحظيّ».
  //
  // فصارت الحالتان اثنتين: **ما لا ملفَّ له في الفهرس** يُنطَق آلياً (وهو المقصود
  // أصلاً — نصوصُ قائمة الصوت المنتظِرة)، **وما له ملفٌّ ولم يُحمَّل** يُعاد طلبُه
  // مرّةً ثم يصمت — فالصمتُ ثانيةً خيرٌ من صوتٍ آليّ يسمعه معلّمٌ يقيّم التطبيق.
  const known = manifestKeys ? manifestKeys.has(keyFor(text)) : null;
  if (known === false) {
    console.warn(`[audio] لا ملف لـ «${text}» — احتياط بالنطق الآلي`);
    return fallback(text);
  }
  try {
    return await playFile(text);
  } catch {
    // **والعطبُ الذي يصادفه إسكاتٌ لا يُبعَث** (منقولُ اقرأ الميدانيّ، `read@9220ab1`
    // — الجلسة م٢): القناةُ تجعل الإسكاتَ المتعمَّد **تسويةً هادئة** (`cut` يحلّ
    // الوعدَ بـfalse) فلا يبلغ هذا `catch` أصلاً — **إلا أن يتصادفا**: ملفٌّ يتعثّر
    // تحميلُه في اللحظة التي ينقر فيها الطفلُ فينتقل. وبلا هذا السطر تمضي إعادةُ
    // المحاولة (أو الاحتياط) على نصِّ شاشةٍ غادرها الطفل، فيُسمَع **قبل** كلام
    // الشاشة الجديدة التي تنتظر دورَها في الطابور. والقناةُ تمنع التراكب ولا تمنع
    // البعث — فالجيلُ (`epoch`) هو ما يمنعه.
    if (mine !== epoch) return false;           // أُسكتنا عمداً — لا إعادةَ ولا احتياط
    if (known !== true) return fallback(text);  // فهرسٌ لم يُقرأ: لا نعرف، فالاحتياط
    try {
      return await playFile(text);              // موجودٌ وتأخّر: محاولةٌ ثانية
    } catch {
      console.warn(`[audio] تعذّر تحميل ملف «${text}» — صمتٌ ولا نطق آليّ`);
      // **والصمتُ بزمنه**: لا يُدهَس الدرسُ لأنّ ملفاً تعذّر — يمضي بمهلةٍ محسوبة
      return hush(text);
    }
  }
}

/**
 * تشغيل نصوص متتابعة (مقاطع كلمة مثلاً) مع فاصل قصير بينها.
 *
 * **والتتابعُ جيلٌ واحد** (منقولُ اقرأ الميدانيّ، `read@9220ab1` — الجلسة م٢): كان
 * يمضي إلى آخره ولو تجاوزه إسكات، **فيصفّ بقيّتَه بجيلٍ جديد** — أي أنّ `stop()`
 * يُفرغ الطابور ثم يملؤه هذا التتابعُ المتجاوَز من حيث وقف، فيُسمع كلامُ شاشةٍ
 * غادرها الطفل بعد أن غادرها. فصار يقرأ جيلَه عند البدء ويسقط عند أوّل تغيّر —
 * ولا فاصلَ يُنتظَر بعد السقوط.
 *
 * **ولا `stop()` في أوّله** (خلافاً لنسخة اقرأ): هناك يُسكِت لأنّ `play` تدهس، وهنا
 * الطابورُ يُرتّب — فإسكاتُه هنا يقتل كلامَ شاشةٍ لم تفرغ بعد.
 */
export async function playSequence(texts, gapMs = 220) {
  const mine = epoch;
  for (const t of texts) {
    if (mine !== epoch) return;
    await play(t);
    if (gapMs && mine === epoch) await new Promise((r) => setTimeout(r, gapMs));
  }
}

/** تحميل مسبق لأصوات الشاشة التالية (لا يشغّلها). */
export function preload(texts) {
  for (const t of texts) {
    if (manifestKeys && !manifestKeys.has(keyFor(t))) continue;
    const el = new Audio();
    el.preload = 'auto';
    el.src = urlFor(t);
  }
}
