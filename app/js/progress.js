// تقدّم الطفل: نجوم كل عقدة + القفل التسلسلي + سجلّ المهارات ودقائق الاستعمال
// والنسخة الاحتياطية — محفوظ كله في localStorage. حساب واحد، وجهاز واحد، بلا سحابة.
//
// ————— بذرةُ المنصة (منسوخةٌ من «اِقْرَأْ» ومجرَّدةٌ من مادّته) —————
//
// بنيةُ هذا الملفّ ومنطقُه من اقرأ حرفاً بحرف — الجبهةُ الكسولة، وصناديقُ ليتنر،
// والترحيلُ الرحيم، والنسخةُ الاحتياطية، وصلابةُ التخزين. والمبدَّلُ فيه شيئان:
//
// ١) **الرحلةُ لم تعد تُبنى هنا**: كانت `journey()` في اقرأ تعرف المجموعاتِ والبساتين
//    والسورَ فتؤلّف منها الأقسام. وهنا تقرأ `sections()` من `curriculum.js` وكفى —
//    فلا تعرف هذه الوحدةُ مرحلةً ولا محطةً ولا عدداً، ويكتب المنهجَ صاحبُه.
// ٢) **مفتاحُ المهارة صار (المفهوم × المدى × نوع التمرين)** — `METHOD.md §٦` —
//    بدل (الحرف × الحركة × نوع التمرين). والآليةُ واحدة: مفتاحٌ نصّيّ ثلاثيّ.
//
// وما سقط من اقرأ سقط بعلّته: عدّادُ خفوت التشكيل وسجلُّ «اقرأ لي» ومخزنُ الصوت —
// أبوابُ قراءةٍ لا حساب. والجردُ الكامل بأسبابه في `docs/SEED.md`.

import { sections } from './curriculum.js';
import * as support from './support.js';

const STORE_KEY = 'ihsib.progress.v1';
export const VERSION = 1;
export const MAX_STARS = 3;

/** تباعد ليتنر بالأيام (`METHOD.md §٦`): الإصابة ترفع الصندوق، والخطأ يعيده صفراً. */
export const BOX_DAYS = [0, 1, 2, 4, 8, 16];
export const MAX_BOX = BOX_DAYS.length - 1;
export const MASTERED_BOX = 3;       // من بلغه في كل تمارينه يُعدّ متقناً

const listeners = new Set();

// ————— ذاكرة البنية والجبهة —————
// بنية الرحلة ثابتة وقت التشغيل (بيانات منهج لا حالة طفل)، فتُبنى مرّة واحدة في
// الجلسة. وحدها «جبهة الفتح» تتحرّك بالنجوم، فتُبطَل مع كل حفظ لا مع كل قراءة.
let journeyCache = null;
let nodesCache = null;
let indexCache = null;      // معرّف العقدة ← موضعها في الرحلة (بحثٌ بزمن ثابت)
let frontierCache = null;   // موضع أول عقدة ناقصة — null = يحتاج حساباً

function blank() {
  return {
    v: VERSION,
    stars: {},        // معرّف عقدة ← نجوم
    skills: {},       // «مفهوم|مدى|تمرين» ← {right, wrong, box, due, seen, since}
    days: {},         // «YYYY-MM-DD» ← ثوانٍ من الاستعمال الفعلي
    reviews: {},      // «YYYY-MM-DD» ← {tries, right, at}
    seconds: 0,
    startedAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** ترقية حالة قديمة إلى النسخة الحالية دون فقد نجوم الطفل. */
function migrate(data) {
  if (!data || typeof data !== 'object' || typeof data.stars !== 'object') return null;
  if (data.v !== VERSION) return null;
  return { ...blank(), ...data, v: VERSION };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return blank();
    return migrate(JSON.parse(raw)) || blank();
  } catch {
    return blank();   // تخزين معطّل أو ممتلئ: نكمل في الذاكرة بلا انهيار
  }
}

let state = load();

/* **وضعُ المعاينة** (بذرةُ اقرأ — أمر المالك، ١٣ أغسطس ٢٠٢٦): المعلّمُ الذي يفحص
   يحتاج أن يرى المحطات كلَّها، والطفلُ يحتاج ألّا يقفز إلى ما لم يبلغه — **والقفلُ
   التسلسليّ جوهرُ المنهج لا قيدٌ عليه**.

   فبـ`?preview=1`: تُفتَح الرحلةُ كلُّها للتصفّح، **ولا يُكتب حرفٌ في تقدّم أحد** —
   `save()` يصير بلا أثرٍ على القرص (ويبقى إخطارُ الشاشات ليُرسَم ما يجري في الجلسة).

   **وهو غيرُ `?dev=1`**: ذاك يملأ التقدّمَ فعلاً (أدواتُ تطوير)، وهذا لا يمسّه. */
export const PREVIEW = typeof location !== 'undefined'
  && new URLSearchParams(location.search).get('preview') === '1';

function save() {
  frontierCache = null;   // النجوم وحدها تحرّك الجبهة، وكل تغيّر فيها يمرّ من هنا
  state.updatedAt = Date.now();
  if (!PREVIEW) {                       // معاينةٌ: تُرسَم الجلسةُ ولا يُمَسّ القرص
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      console.warn('[progress] تعذّر الحفظ في localStorage');
    }
  }
  for (const fn of listeners) fn(state);
}

/** الاشتراك في تغيّر التقدّم (لإعادة رسم الخريطة). */
export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ————— الرحلة وعقدها —————

/**
 * الرحلة كاملةً بأقسامها بالترتيب — **من `curriculum.js` وحدَه**.
 * فلا تعرف هذه الوحدة مرحلةً ولا بوابةً: مَن يملك البيانات يملك الترتيب.
 */
export function journey() {
  if (!journeyCache) journeyCache = sections();
  return journeyCache;
}

/** كل عقد الرحلة بالترتيب — عليها يقوم القفل التسلسلي وحساب النجوم. */
export function allNodes() {
  if (!nodesCache) nodesCache = journey().flatMap((section) => section.nodes || []);
  return nodesCache;
}

/** موضع العقدة في الرحلة أو ‑١ — من فهرسٍ مبنيّ مرّة، لا بمسح القائمة في كل نداء. */
function indexOf(id) {
  if (!indexCache) indexCache = new Map(allNodes().map((n, i) => [n.id, i]));
  const index = indexCache.get(id);
  return index === undefined ? -1 : index;
}

export function findNode(id) {
  const index = indexOf(id);
  return index < 0 ? null : allNodes()[index];
}

/** القسم الذي تسكنه هذه العقدة (لعنوانها على الخريطة وفي لوحة وليّ الأمر). */
export function sectionOf(id) {
  return journey().find((s) => (s.nodes || []).some((n) => n.id === id)) || null;
}

/** إبطالُ ذاكرة البنية — تستعمله الاختبارات حين تُبدّل بيانات المنهج تحتها. */
export function invalidateJourney() {
  journeyCache = nodesCache = indexCache = frontierCache = null;
}

// ————— النجوم —————

export function getStars(id) {
  return state.stars[id] || 0;
}

export function isDone(id) {
  return getStars(id) > 0;
}

/**
 * تسجيل نتيجة عقدة. لا يُنقص ما سبق: تكرار المحطة يرفع النجوم ولا يخفضها.
 * @returns {boolean} هل تحسّنت النتيجة؟
 */
export function setStars(id, stars) {
  const n = Math.max(0, Math.min(MAX_STARS, Math.round(stars)));
  if (n <= getStars(id)) return false;
  state.stars[id] = n;
  save();
  return true;
}

export function totalStars() {
  return allNodes().reduce((sum, n) => sum + getStars(n.id), 0);
}

export function maxTotalStars() {
  return allNodes().length * MAX_STARS;
}

/** نجوم قسمٍ وسقفُه ومنجَزُه — لبطاقة المحطة على الخريطة. */
export function sectionStars(section) {
  const nodes = section?.nodes || [];
  return {
    earned: nodes.reduce((sum, n) => sum + getStars(n.id), 0),
    max: nodes.length * MAX_STARS,
    doneNodes: nodes.filter((n) => isDone(n.id)).length,
    totalNodes: nodes.length,
  };
}

// ————— القفل التسلسلي —————
// قاعدة واحدة تحكم الرحلة كلها: العقدة تُفتح بإتمام كل ما قبلها في `allNodes()`.
//
// والحبلُ الواحد يختصر القاعدة في رقم: ما دام كل ما قبل العقدة يجب أن يكون منجَزاً،
// فيكفي موضعُ **أول عقدة ناقصة** — «جبهة الفتح». وبها صار القفل قراءةَ رقمٍ لكل
// عقدة بدل مسحِ كل سوابقها (درسُ بطء الخريطة على آيباد قديم في اقرأ).

/**
 * «جبهة الفتح»: موضع أول عقدة لم تُنجَز (وطولُ الرحلة إن أُتمّت كلها).
 * كل ما قبلها منجَزٌ بالضرورة، فالعقدة مفتوحة إن كان موضعها ≤ الجبهة — وهي عينُ
 * القاعدة الأصلية لا تقريبٌ لها. تُحسب كسولاً مرّةً وتُبطَل مع كل حفظ.
 */
export function unlockFrontier() {
  if (frontierCache === null) {
    const nodes = allNodes();
    let i = 0;
    while (i < nodes.length && isDone(nodes[i].id)) i++;
    frontierCache = i;
  }
  return frontierCache;
}

/**
 * العقدة مفتوحة = كل ما سبقها في الرحلة مُنجَز (أي: موضعها ≤ الجبهة).
 *
 * **وما أنجزه الطفلُ يبقى مفتوحاً — ترحيلٌ رحيم** (الجلسة ش، والتطبيق حيٌّ بأجهزة
 * أطفال): يومَ تدخل الرحلةَ محطاتٌ جديدة **قبل** عقدةٍ عبرها الطفلُ فعلاً، ترجع جبهةُ
 * الفتح إلى أوّل الجديد — وذلك صوابٌ (مادّةٌ جديدة تُلعَب). ولو وقف القفلُ عند
 * الجبهة وحدَها **لانغلقت على صاحبها بوابةٌ عبرها ومحطاتٌ أتمّها**، وهو أذىً محضٌ:
 * لا يُعلّمه شيئاً ولا يحمي منهجاً. **والمنجَزُ لا يُسرَّب**: عقدةٌ لها نجمةٌ عقدةٌ
 * لعبها بيده، ففتحُها ردٌّ لحقّه لا تجاوزٌ لقفل. (ويحرسه `test_journey.mjs` بسجلٍّ
 * مكتملٍ يُفتَح على رحلةٍ موسَّعة: لا نجمةَ تُمحى ولا مفتوحٌ يُقفَل.)
 */
export function isNodeUnlockedById(id) {
  const index = indexOf(id);
  if (index < 0) return false;
  if (isDone(id)) return true;
  // **المعاينةُ تفتح القفلَ ولا تدّعي إتماماً** (درسُ اقرأ): دفعُ الجبهة إلى آخر
  // الرحلة يقول للمقيّم «أتممتَ الرحلة كلها» — وهو خبرٌ كاذب. فالجبهةُ تبقى على
  // حقيقتها (ومنها «تابع من هنا» ونسبةُ الإنجاز)، والقفلُ وحدَه يُرفَع.
  if (PREVIEW) return true;
  return index <= unlockFrontier();
}

/** أول عقدة لم تُنجَز في الرحلة — «تابع من هنا». */
export function nextNode() {
  return allNodes()[unlockFrontier()] || null;   // خارج القائمة = اكتملت الرحلة
}

// ————— سجلّ المهارات والتكرار المتباعد (`METHOD.md §٦`) —————

/** رقم اليوم المحلي (لا UTC): وحدة الجدولة في التكرار المتباعد. */
export function dayNumber(date = new Date()) {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / 86400000);
}

/** مفتاح اليوم «YYYY-MM-DD» بالتقويم المحلي (لسجلّ الدقائق والمراجعات). */
export function dayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * **مفتاح المهارة: المفهوم × المدى × نوع التمرين** (`METHOD.md §٦`).
 * مثل `subitize|3|flash` و`numeral|7|match` و`add|10|solve` — والقائمةُ النهائية
 * يملكها `curriculum.js` ويجردها `test_measure.mjs`.
 */
export function skillKey(concept, range, kind) {
  return `${concept}|${range ?? 'none'}|${kind}`;
}

/**
 * **المدى عدداً إن كان عدداً، ونصّاً إن لم يكن** — قاعدةٌ واحدة لمصدرٍ واحد.
 *
 * مفاتيحُ `METHOD.md §٦` مدياتُها عدديةٌ في المراحل ١–٧ (`numeral|٧|match`) ووصفيةٌ في
 * المرحلة ٨ (`pattern|abab|extend`)، وهي **تُكتب نصّاً في المفتاح** فتُقرأ نصّاً. وكان
 * لهذه القاعدة موضعان: هذا الملفُّ يقرأ السجلَّ فيردّ المدى **نصّاً دائماً**،
 * و`station.js` يقرأ المنهجَ فيردّه عدداً حيث كان عدداً — فمهارةٌ تُقرأ من السجلّ
 * مدَاها «٧» ومحطتُها تدرّس ٧، **فلا يتطابقان**. وأثرُه صمتٌ لا حمرة: مراجعةُ رمزٍ
 * ضعيفٍ كانت تُبنى على رمزٍ **مجاورٍ** بالقرعة (`reviewRound` في `numerals.js` تشترط
 * `taught.includes(skill.range)` فلا تصدق أبداً)، فيراجع الطفلُ ما لم يضعف فيه —
 * وأمسكه حارسُ البوابة يومَ تحرّك مجرى القرعة (الجلسة ك). **فصار للقاعدة مصدرٌ واحد
 * هنا** ويقرأه `station.js`.
 */
export const spanOf = (text) =>
  (Number.isFinite(Number(text)) && text !== '' ? Number(text) : text);

export function parseSkillKey(key) {
  const [concept, range, kind] = String(key).split('|');
  return { concept, range: spanOf(range), kind };
}

export function getSkill(key) {
  return state.skills[key] || null;
}

/** كل المهارات المسجّلة: [{key, concept, range, kind, right, wrong, box, due, seen, since}] */
export function skills() {
  return Object.entries(state.skills).map(([key, s]) => ({ key, ...parseSkillKey(key), ...s }));
}

/**
 * تسجيل محاولة واحدة. الصحيحة ترفع صندوق ليتنر فيتباعد موعدها،
 * والخاطئة تعيده إلى الصفر فتعود المهارة في مراجعة اليوم نفسه (`METHOD.md §٦`).
 *
 * **والخطأ يُسجَّل على المهارة المطلوبة لا على ما لمس** (`METHOD.md §٤`) — يفرضه
 * المُنادي بتمرير مفتاح الهدف، وهو عقدُ شاشات التمارين مع هذه الوحدة.
 *
 * **والملقَّنُ لا يُحتسب إتقاناً** (وضعُ الدعم — الجلسة د، المبدأ الثاني «العونُ
 * يُسجَّل ولا يُزوَّر القياس»): محاولةٌ وقع فيها تلميحٌ قبلها (`helped`) **لا ترفع
 * صندوقاً ولا تُسجَّل صواباً ولا خطأً** — تُسجَّل معانةً وتبقى المهارةُ مستحقّةً
 * كما كانت، **فالعونُ لا يُبعد موعداً ولا يبلغ صندوقَ الإتقان أبداً**. وموضعُ
 * القاعدة هنا — **في وحدة القياس لا في الشاشة** — فما من شاشةٍ تستطيع أن تلقّن
 * وتحتسب. ويحرسه `tools/test_support.mjs`.
 *
 * @returns {object|null} حالة المهارة بعد التسجيل
 */
export function recordAttempt(concept, range, kind, correct, today = dayNumber(), helped = false) {
  if (!concept || !kind) return null;
  const key = skillKey(concept, range, kind);
  const s = state.skills[key]
    || { right: 0, wrong: 0, box: 0, due: today, seen: today, since: today };
  /* **و`since` أوّلُ يومٍ قِيست فيه هذه المهارة** (الجلسة ٨): لوحةُ وليّ الأمر تقول
     «راجِع مختصاً» عند تعثّرٍ **أسابيع** (`METHOD.md §١٣`)، ومدّةُ التعثّر لا تُعرَف
     من الصندوق ولا من `seen` (وهو آخرُ يوم) — فتُقيَّد بدايتُها يومَ تبدأ.
     وسجلٌّ قديم بلا `since` يبدأ عدُّه من اليوم: لا نخترع له ماضياً لم نقِسه. */
  if (s.since === undefined) s.since = today;
  if (helped) {
    /* **المعانةُ تُسجَّل ولا تُحتسب**: لا صندوقَ يرتفع ولا صوابٌ ولا خطأٌ يُعَدّ —
       ويبقى موعدُها كما كان (وإن تقدّم فإلى اليومِ لا بعده)، فمَن أُعين على مهارةٍ
       يلقاها ثانيةً بلا عون. */
    s.helped = (s.helped || 0) + 1;
    s.due = Math.min(s.due ?? today, today);
    s.seen = today;
    state.skills[key] = s;
    save();
    return s;
  }
  if (correct) {
    s.right++;
    s.box = Math.min(MAX_BOX, s.box + 1);
  } else {
    s.wrong++;
    s.box = 0;
  }
  /* **وتقاربُ المواعيد مقبضُ دعمٍ في موضعٍ واحد** (`support.days`): مطفأً يردّ
     `BOX_DAYS` حرفاً، ومشتغلاً يقرّبها ولا ينزل بموعدٍ دون يوم. */
  s.due = today + support.days(BOX_DAYS[s.box]);
  s.seen = today;
  state.skills[key] = s;
  save();
  return s;
}

/** ترتيب الضعف: أدنى صندوق، ثم أكثر أخطاءً، ثم أقدم استحقاقاً (وأخيراً المفتاح لثبات الترتيب). */
const byWeakness = (a, b) =>
  a.box - b.box || b.wrong - a.wrong || a.due - b.due || a.key.localeCompare(b.key);

/**
 * المستحقّ للمراجعة اليوم، الأضعف أولاً.
 * (المهارة التي لم تُلمس بعدُ ليست هنا — المراجعة تراجع ما مرّ به الطفل فعلاً.)
 */
export function dueSkills(today = dayNumber()) {
  return skills().filter((s) => s.due <= today).sort(byWeakness);
}

/**
 * كل المهارات المسجّلة بالأضعف أولاً **بلا نظر إلى موعد ليتنر** — مادّةُ البوابات
 * الثلاث (`METHOD.md §٥`): البوابة تسأل عن أضعف ما في يده لا عمّا حان موعده، فقد
 * يحين موعد القويّ وحده يوم البوابة فتمرّ بلا معنى.
 */
export function weakestSkills() {
  return skills().sort(byWeakness);
}

/**
 * حصيلةُ كل مفهومٍ من سجلّه — مادّةُ أقسام لوحة وليّ الأمر (`METHOD.md §٦`):
 * متقن (كل تمارينه بلغت صندوق الإتقان)، أو متعثّر (خطآن فأكثر وما زال في الصناديق
 * الدنيا)، أو قيد التعلّم. **مفهومٌ بعملية لا درجة** — واللوحة تترجمه عبارةً.
 */
export function conceptStats() {
  const byConcept = new Map();
  for (const s of skills()) {
    const acc = byConcept.get(s.concept)
      || { concept: s.concept, right: 0, wrong: 0, minBox: MAX_BOX, kinds: 0, seen: 0, parts: [] };
    acc.right += s.right;
    acc.wrong += s.wrong;
    acc.minBox = Math.min(acc.minBox, s.box);
    acc.kinds++;
    acc.seen = Math.max(acc.seen, s.seen);
    acc.parts.push(s);
    byConcept.set(s.concept, acc);
  }
  return [...byConcept.values()]
    .map((a) => ({
      ...a,
      // **ومهاراتُ المفهوم بالأضعف أوّلاً** (الجلسة ٨): منها تُبنى عبارةُ اللوحة —
      // أقصى ما أتقن، وما يحتاج تثبيتَه — بترتيب الضعف نفسِه الذي تبني به المراجعة.
      parts: a.parts.sort(byWeakness),
      attempts: a.right + a.wrong,
      mastered: a.minBox >= MASTERED_BOX,
      struggling: a.wrong >= 2 && a.minBox <= 1,
    }))
    .sort((a, b) => a.concept.localeCompare(b.concept));
}

// ————— دقائق الاستعمال —————

/** إضافة زمن استعمال فعلي (يُستدعى بنبضة من main.js وقت انتباه الطفل فقط). */
export function addSeconds(sec, key = dayKey()) {
  const n = Math.max(0, Math.round(sec));
  if (!n) return;
  state.seconds += n;
  state.days[key] = (state.days[key] || 0) + n;
  save();
}

export function secondsOn(key = dayKey()) {
  return state.days[key] || 0;
}

export function totalSeconds() {
  return state.seconds;
}

/** آخر N يوماً منتهيةً باليوم: [{key, seconds}] — للوحة وليّ الأمر. */
export function usageDays(count = 7, today = new Date()) {
  const out = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    out.push({ key: dayKey(d), seconds: secondsOn(dayKey(d)) });
  }
  return out;
}

// ————— جلسة المراجعة اليومية —————

export function reviewOf(key = dayKey()) {
  return state.reviews[key] || null;
}

/**
 * تسجيل مراجعة أُتمّت اليوم. الوحدة **محاولة** لا تمرين — تمرينٌ فيه محاولة لكل
 * عنصر، فخلطهما يكذب على وليّ الأمر في نسبة الإصابة. وهي وحدةُ عبور البوابة نفسُها.
 */
export function markReview(tries, right, key = dayKey()) {
  const before = state.reviews[key];
  state.reviews[key] = {
    tries: (before?.tries || 0) + tries,
    right: (before?.right || 0) + right,
    at: Date.now(),
  };
  save();
  return state.reviews[key];
}

/** أيام المراجعة المتتالية المنتهية باليوم أو بالأمس (لا تنكسر السلسلة قبل نوم الطفل). */
export function reviewStreak(today = new Date()) {
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    if (state.reviews[dayKey(d)]) streak++;
    else if (i > 0 || streak) break;
  }
  return streak;
}

// ————— النسخة الاحتياطية: نقلُ تقدّم الطفل بين الأجهزة —————
//
// **العلّة** (بذرةُ اقرأ): التقدّم في هذا الجهاز وحده — لا حساب ولا سحابة (عهدُ
// الخصوصية). وثمنُها أن **محو بيانات المتصفّح أو حذف التطبيق المثبَّت يمحو رحلة
// الطفل كلها**، وأن تبديل الجهاز يبدأ من الصفر. فالمخرج ملفٌّ صغير يملكه وليّ الأمر:
// نجومٌ وصناديقُ ليتنر ودقائقُ ومراجعات.

export const BACKUP_KIND = 'ihsib.progress';
export const BACKUP_FORMAT = 1;      // شكل الملف نفسه — لا نسخة حالة الطفل (`VERSION`)

/** النسخة كما تُكتب في الملف: ترويسةٌ تعرّف نفسها، وحالةُ الطفل كاملةً. */
export function backup(at = Date.now()) {
  return { kind: BACKUP_KIND, format: BACKUP_FORMAT, savedAt: at, state: snapshot() };
}

export function backupText(bundle = backup()) {
  return JSON.stringify(bundle, null, 1);
}

/** اسم الملف بيومه — فتتراكم نسخُ وليّ الأمر مرتَّبةً بلا أن يطمس بعضها بعضاً. */
export function backupName(date = new Date()) {
  return `ihsib-progress-${dayKey(date)}.json`;
}

/**
 * قراءة ملفٍ اختاره وليّ الأمر. **لا يُستعاد مجهولٌ**: كل رفضٍ يُعلَن بسببه بالعربية،
 * لأن الاستعادة تكتب فوق تقدّم قائم — وخطؤها لا يُستدرك.
 * @returns {{bundle: object}|{error: string}}
 */
export function readBackup(text) {
  let raw;
  try {
    raw = JSON.parse(String(text ?? ''));
  } catch {
    return { error: 'تعذّرت قراءة الملف — ليس ملفَ نسخةٍ صالحاً.' };
  }
  if (!raw || typeof raw !== 'object' || raw.kind !== BACKUP_KIND) {
    return { error: 'هذا الملف ليس نسخةَ تقدّمٍ من «اِحْسِبْ».' };
  }
  const format = Number(raw.format);
  if (!Number.isFinite(format)) return { error: 'ملف النسخة معطوب — لا يعلن شكله.' };
  if (format > BACKUP_FORMAT) {
    return { error: 'هذه النسخة من إصدارٍ أحدث من التطبيق — حدِّث التطبيق ثم استعِدها.' };
  }
  const next = migrate(raw.state);
  if (!next) return { error: 'ملف النسخة معطوب — لا تقدّم فيه.' };
  return { bundle: { ...raw, state: next } };
}

/**
 * ما في النسخة بعبارة وليّ الأمر — يُعرض **قبل** التأكيد: نسخةٌ خاطئة تُستعاد فوق
 * تقدّمٍ حقيقيّ خسارةٌ لا رجعة فيها، ورقمُ نجومها ويومُها يميّزانها في نظرة.
 * والنجومُ تُحسب على عقد الرحلة الحالية وحدها (لا على مفاتيح لا وجود لها اليوم).
 */
export function backupSummary(bundle) {
  const stars = bundle?.state?.stars || {};
  const done = allNodes().filter((n) => stars[n.id] > 0);
  return {
    savedAt: bundle?.savedAt || 0,
    nodes: done.length,
    stars: done.reduce((sum, n) => sum + Math.min(MAX_STARS, stars[n.id]), 0),
    skills: Object.keys(bundle?.state?.skills || {}).length,
    seconds: bundle?.state?.seconds || 0,
  };
}

/**
 * الاستعادة: حالةُ النسخة تحلّ محلّ الحالة القائمة كاملةً (لا دمج — دمجُ رحلتين
 * يصنع طفلاً ثالثاً لا وجود له).
 */
export function restore(bundle) {
  const next = bundle?.state;
  if (!next || typeof next.stars !== 'object') return false;
  state = { ...blank(), ...next, v: VERSION };
  save();
  return true;
}

// ————— تحكّم وليّ الأمر في الرحلة (خلف بوابته الحسابية) —————

/**
 * فتحٌ يدويّ إلى عقدةٍ بعينها — لطفلٍ يعرف ما قبلها فلا يُحبَس في أوّلها.
 * كل ما قبلها يُعدّ متماً **بنجمةٍ واحدة**: تفكّ القفل ولا تدّعي إتقاناً، فتبقى
 * العقدةُ تدعوه إلى لعبها والنجومُ تعلو حين يلعبها. ولا تُنقَص نجمةٌ كُسبت.
 * @returns {number} عدد العقد التي فُتحت فعلاً
 */
export function unlockUpTo(id) {
  const pending = unfinishedBefore(id);
  for (const node of pending) state.stars[node.id] = 1;
  if (pending.length) save();
  return pending.length;
}

function unfinishedBefore(id) {
  const index = indexOf(id);
  return index < 0 ? [] : allNodes().slice(0, index).filter((n) => !getStars(n.id));
}

/** كم عقدةً ناقصة قبل هذه العقدة — ما سيفتحه `unlockUpTo` **قبل** أن يفعله. */
export const pendingBefore = (id) => unfinishedBefore(id).length;

/**
 * تصفير محطةٍ لإعادة التدريب: نجومُ عقدها إلى الصفر، فتعود جبهةُ الفتح إليها.
 *
 * وثلاثة قيود مقصودة: **سجلّ ليتنر لا يُمسّ** (ما قِيس من مهارات الطفل حقٌّ له،
 * وإعادةُ التدريب لا تمحو تاريخه)؛ و**نجومُ ما بعدها تبقى محفوظة** — وتبقى **مفتوحةً
 * كما كسبها** (الترحيلُ الرحيم في `isNodeUnlockedById`، الجلسة ش): جبهةُ الفتح ترجع
 * إلى المحطة المصفَّرة فتدعوه إليها («تابع من هنا»)، ولا يُغلَق عليه ما أتمّه بيده؛
 * ودقائقُ الاستعمال والمراجعات لا تُمسّ.
 * @returns {number} عدد العقد التي صُفِّرت
 */
export function clearSection(sectionId) {
  const section = journey().find((s) => s.id === sectionId);
  if (!section) return 0;
  let cleared = 0;
  for (const node of section.nodes || []) {
    if (!state.stars[node.id]) continue;
    delete state.stars[node.id];
    cleared++;
  }
  if (cleared) save();
  return cleared;
}

/** حصيلةُ محطةٍ (عقدُها والمنجَز منها ونجومُه) — لعرض أثر التصفير **قبل** وقوعه. */
export function sectionProgress(sectionId) {
  const section = journey().find((s) => s.id === sectionId);
  if (!section) return null;
  const done = (section.nodes || []).filter((n) => getStars(n.id) > 0);
  return {
    nodes: (section.nodes || []).length,
    done: done.length,
    stars: done.reduce((sum, n) => sum + getStars(n.id), 0),
  };
}

// ————— صلابة التخزين —————
//
// التقدّم في `localStorage`، والمتصفّح **يُخلي** تخزين المواقع حين يضيق القرص —
// وiOS أشدّها في ذلك — فيذهب تقدّم الطفل بلا فعلٍ من أحد. والوسمُ الدائم يستثنيه
// من الإخلاء. يُطلب عند بوابة وليّ الأمر (فعلُ بالغٍ لا فعلُ طفل)، و**رفضُه لا
// يعطّل شيئاً**: الجواب يُعرض على وليّ الأمر ليعرف أنّ النسخة الاحتياطية آكد.

const storageApi = () => (typeof navigator !== 'undefined' && navigator.storage) || null;

/** طلب التخزين الدائم. يردّ `true`/`false`، و`null` إن كان المتصفّح لا يعرفه. */
export async function askPersistence() {
  const api = storageApi();
  if (!api?.persist) return null;
  try {
    return await api.persist();
  } catch {
    return null;   // تصفّح خاص أو منعٌ من المستخدم: لا شيء ينكسر
  }
}

/** حال التخزين اليوم بلا طلبٍ جديد (للعرض في اللوحة). */
export async function persistedStorage() {
  const api = storageApi();
  if (!api?.persisted) return null;
  try {
    return await api.persisted();
  } catch {
    return null;
  }
}

/**
 * **كم من بنك الصوت على هذا الجهاز؟** (يعرضه وليّ الأمر — الجلسة ص)
 *
 * العلّةُ من اقرأ حرفاً: كان إخفاقُ الخزن **يُبتلَع صامتاً** — ومنه ضيقُ حصة التخزين
 * على الأجهزة الأقدم — فتنقص ملفاتٌ ولا يعلم أحد، ثم يصمت الصوتُ في الطائرة أو
 * السيارة فيُظنّ العيبُ في البرنامج. فالعددُ معروضٌ: يرى وليُّ الأمر النقصَ قبل أن
 * يفاجئه.
 *
 * ويُقرأ **من المخزون نفسِه** لا من تقديرٍ عندنا: عاملُ الخدمة يملك المخزن، وهذه
 * تعدّ ما فيه وتقابله ببيان البنك. و`null` تعني «لا جواب» (متصفّحٌ بلا Cache API أو
 * تصفّحٌ خاصّ أو بنكٌ لم يُولَّد) — فيسقط السطرُ ولا ينكسر شيء.
 */
export async function audioStored() {
  if (typeof caches === 'undefined') return null;
  try {
    const name = (await caches.keys()).find((n) => n.startsWith('ihsib-audio'));
    if (!name) return null;
    const app = new URL('../', import.meta.url);
    const hit = await caches.match(new URL('audio/manifest.json', app));
    const manifest = hit ? await hit.json() : null;
    const total = manifest ? Object.keys(manifest).length : 0;
    if (!total) return null;
    const have = (await (await caches.open(name)).keys()).length;
    return { stored: Math.min(have, total), total };
  } catch {
    return null;
  }
}

// ————— إدارة —————

export function snapshot() {
  return JSON.parse(JSON.stringify(state));
}

export function reset() {
  state = blank();
  save();
}
