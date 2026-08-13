// أدوات واجهة مشتركة بين الشاشات (بلا إطار عمل): بناء DOM، أرقام المشرق، رسائل عابرة،
// المُصيِّر الواحد للوجوه، وأيقونات الواجهة الخطية.
// لا تلمس هذه الوحدة الـDOM وقت التحميل، فتبقى قابلة للاستيراد في اختبارات node.
//
// ————— بذرةُ المنصة (منسوخةٌ من «اِقْرَأْ» ومجرَّدةٌ من مادّته) —————
// سقط منها ما كان يعرف حرفاً أو قصةً أو بستاناً (`letterTitle` · `nodeTitle` بأنواع
// اقرأ · `coverEl` · `inkLift`/`giantInk` — رفعةُ حبر الحرف العربي في صندوقه، ولا
// حرفَ بطلاً في هذا التطبيق). وبقي المحايد كما هو حرفاً بحرف. الجرد في `docs/SEED.md`.

export const DEV = typeof location !== 'undefined'
  && new URLSearchParams(location.search).get('dev') === '1';

// ألوان المراحل — مصدر الحقيقة للقيم لوحُ `app.css` (متغيّرات CSS)، وهذه أسماؤها.
// لونٌ مطفأ واحد يميّز كل مرحلة، والمشهد يتغيّر بمعالم المحطات لا بصراخ الألوان.
export const QUANTITY_ACCENT = 'var(--accent-quantity)';   // الكمّ والعدّ
export const NUMERAL_ACCENT = 'var(--accent-numeral)';     // الرموز والمقارنة
export const BOND_ACCENT = 'var(--accent-bond)';           // الجسور والعمليات
export const PATTERN_ACCENT = 'var(--accent-pattern)';     // الأنماط والقياس
export const PAUSE_ACCENT = 'var(--accent-gate)';          // البوابات والمراجعة

// ————— أرقام المشرق (قرار ق١ · `METHOD.md §٩`) —————
// **الأرقام المشرقية لغةُ التعليم والواجهة كلتيهما** — فلا يُكتب رقمٌ لاتينيّ على
// شاشةِ طفل. وكلُّ من يعرض عدداً يمرّ من هنا.

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
export const arNum = (n) => String(n).replace(/\d/g, (d) => AR_DIGITS[+d]);

/** المغربية (123) — **للتعارف وحدَه** في المحطة ٨·٥، ولا قياسَ عليها (ق١). */
export const latinNum = (n) => String(n).replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));

/**
 * صياغة المعدود بالعربية الصحيحة: [مفرد، مثنى، جمع قلة (٣–١٠)، مفرد منصوب (١١+)].
 *
 * **وموضعُها الواجهةُ المكتوبة لوليّ الأمر لا الصوتَ للطفل**: قرار ق٢ يمنع أن
 * **يُنطَق** معدودٌ مقروناً بعدد (`METHOD.md §٨`)، وشاشةُ وليّ الأمر نصٌّ يقرؤه بالغٌ
 * عربيّ — و«٨ دقيقة» غلطٌ لا يليق. فلا تُستعمل هذه في نصٍّ يُمرَّر إلى `audio.play`.
 */
export function arCount(n, [one, two, few, many]) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${arNum(n)} ${few}`;
  return `${arNum(n)} ${many}`;
}

// ————— بناء DOM —————

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'css') for (const [k, v] of Object.entries(value)) el.style.setProperty(k, v);
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in el) el[key] = value;
    else el.setAttribute(key, value);
  }
  for (const child of children.flat(2)) {
    if (child == null || child === false) continue;
    el.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return el;
}

let toastTimer = 0;
/** رسالةٌ عابرة — ومعها أيقونةُ واجهةٍ اختيارية (لا محرفَ إيموجي في نصّها). */
export function toast(message, iconName) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.replaceChildren(...[iconName && icon(iconName), message].filter(Boolean));
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
}

export function go(hash) {
  location.hash = hash;
}

export function topbar(...extra) {
  return h('header', { class: 'topbar' }, extra);
}

export function starsRow(count, className = 'node-stars') {
  return h('span', { class: className, 'aria-hidden': 'true' },
    [0, 1, 2].map((i) => h('span', { class: i < count ? 'on' : '' }, i < count ? '★' : '☆')));
}

// ————— عناصر الهوية: الشخصية المرشدة والعلامة — SVG مضمّن لا صور نقطية —————

// «حاسِب» — الشخصية المرشدة: بومةٌ صغيرة بعيون واسعة، ألوانها من لوح التصميم نفسِه
// (متغيّرات CSS داخل SVG فتتبع الثيم الليليّ بلا نسخةٍ ثانية).
const MASCOT_SVG = `
<svg viewBox="0 0 64 64" role="img">
  <ellipse cx="32" cy="58" rx="14" ry="3" fill="var(--ink)" opacity=".08"/>
  <path d="M32 12c11 0 19 9 19 20s-8 18-19 18-19-7-19-18 8-20 19-20z" fill="var(--accent-numeral)"/>
  <path d="M32 12c11 0 19 9 19 20s-8 18-19 18-19-7-19-18 8-20 19-20z" fill="none"
    stroke="var(--ink)" stroke-width="2" opacity=".22"/>
  <ellipse cx="32" cy="42" rx="11" ry="8" fill="var(--card)" opacity=".55"/>
  <circle cx="24.5" cy="28" r="6.5" fill="var(--card)"/>
  <circle cx="39.5" cy="28" r="6.5" fill="var(--card)"/>
  <circle cx="25.4" cy="28.6" r="3" fill="var(--ink)"/>
  <circle cx="38.6" cy="28.6" r="3" fill="var(--ink)"/>
  <circle cx="26.4" cy="27.6" r="1" fill="var(--card)"/>
  <circle cx="39.6" cy="27.6" r="1" fill="var(--card)"/>
  <path d="M32 33l-3.2 3.6h6.4z" fill="var(--star)"/>
  <path d="M18 15q3 5 7 6M46 15q-3 5-7 6" fill="none" stroke="var(--ink)"
    stroke-width="2" stroke-linecap="round" opacity=".5"/>
</svg>`;

/** الشخصية المرشدة — تظهر في بدايات المحطات والاحتفالات. */
export function mascot(className = 'mascot') {
  const el = h('span', { class: className, 'aria-hidden': 'true' });
  el.innerHTML = MASCOT_SVG;
  return el;
}

// اسمُ التطبيق ورسمُ علامته: **مشكولٌ بالكامل** (سياسةُ العائلة في التسمية —
// `FAMILY.md §٦`) وهو تمايزُنا وبيانُ منهجٍ في آن. لا يُكتب هذا الرسم في موضعٍ آخر:
// كلُّ من يعرضه يستورده من هنا.
export const BRAND = 'اِحْسِبْ';

/** علامةُ التطبيق: الكلمةُ مشكولةً بخطّ العلامة (Kufam — الجلسة هـ)، ومرشدُها إلى جانبها. */
export function brandMark(tag = 'span') {
  return h(tag, { class: 'brand' },
    h('span', { class: 'brand-word' }, BRAND),
    mascot('brand-owl'));
}

// معلم بصري لكل نوع محطة — زخرفةٌ صامتة بلون المرحلة.
const LANDMARKS = {
  // نقاطٌ ثلاث في مثلث — معلمُ محطات الكمّ والتقدير الفوري
  dots: '<circle cx="20" cy="34" r="5"/><circle cx="32" cy="16" r="5"/>'
    + '<circle cx="44" cy="34" r="5"/><path d="M8 44h48"/>',
  // يدٌ تعدّ — معلمُ محطات العدّ بالتناظر الفردي
  count: '<path d="M8 44h48"/><path d="M20 40V22a4 4 0 0 1 8 0v18"/>'
    + '<path d="M28 40V16a4 4 0 0 1 8 0v24"/><path d="M36 40V20a4 4 0 0 1 8 0v20"/>',
  // إطارُ العشرة — العمودُ الفقريّ البصريّ للرحلة (يُملأ من اليمين، RTL)
  frame: '<rect x="8" y="14" width="48" height="22" rx="3"/><path d="M8 25h48"/>'
    + '<path d="M18.4 14v22M28.8 14v22M39.2 14v22M49.6 14v22"/><path d="M8 44h48"/>',
  // ميزانٌ بكفّتين — معلمُ محطات المقارنة والترتيب
  scales: '<path d="M32 8v34"/><path d="M22 42h20"/><path d="M8 18h48"/><path d="M8 18v10"/>'
    + '<path d="M56 18v10"/><path d="M2 28a6 6 0 0 0 12 0"/><path d="M50 28a6 6 0 0 0 12 0"/>',
  // جسرٌ ينشقّ شقّين — معلمُ محطات «ركِّب وفكِّك»
  bond: '<circle cx="32" cy="14" r="8"/><circle cx="16" cy="38" r="8"/>'
    + '<circle cx="48" cy="38" r="8"/><path d="M27 20 21 32M37 20l6 12"/><path d="M6 48h52"/>',
  // آلةٌ تجمع كميّتين — معلمُ محطات العمليات
  machine: '<rect x="12" y="14" width="40" height="24" rx="4"/><path d="M26 26h12M32 20v12"/>'
    + '<path d="M12 20H4M52 20h8"/><path d="M8 44h48"/>',
  // نمطٌ متكرّر — معلمُ محطات الأنماط
  pattern: '<rect x="8" y="20" width="10" height="10" rx="2"/>'
    + '<circle cx="30" cy="25" r="5"/><rect x="40" y="20" width="10" height="10" rx="2"/>'
    + '<path d="M56 20v10"/><path d="M8 42h48"/>',
  // ثلاثةُ أشكالٍ على خطٍّ واحد — معلمُ محطات «الأشكال الأولى» (المرحلة ٩)
  shapes: '<circle cx="13" cy="26" r="8"/><path d="M33 17l8 17H25z"/>'
    + '<rect x="45" y="18" width="16" height="16" rx="2"/><path d="M5 42h54"/>',
  // البوابة: قوسٌ على عمودين ومصراعاه — معلمُ محطة الإتقان قبل المفاصل الكبرى
  gate: '<path d="M6 44h52"/><path d="M13 44V25a19 19 0 0 1 38 0v19"/>'
    + '<path d="M32 44V6"/><path d="M22 44V27a10 10 0 0 1 20 0v17"/>',
};

// ————— «أيقونات لا إيموجي» (عهدُ العائلة، مهمةُ اقرأ ٧ أغسطس ٢٠٢٦) —————
//
// **العلّة**: إيموجي خطِّ النظام ليس صورةً واحدة — هو صورةٌ لكل جهاز. فما يراجعه
// المالك على أبل يراه طفلٌ آخر على أندرويد رسماً مختلفاً، فينقلب عليه حكمُ «صدق
// الصورة»؛ والرموزُ الحديثة تظهر في الأجهزة الأقدم مربّعاً فارغاً. والعلاج قسمان:
//
//   • **رموز البيانات** (عناصرُ عالم الطفل التي تُعدّ: تفاحة، نجمة، سمكة): تُرسم
//     من Twemoji المخزونة في `app/emoji/` — الرمزُ نفسُه لا يتغيّر، وإنما صار رسمُه
//     ملفَّ SVG واحداً لكل طفل. ويجلبها `tools/fetch_twemoji.py`. (الجلسة ٢.)
//   • **رموز الواجهة** (زرّ السماع، الاحتفال، القفل، الإعادة…): أيقوناتُنا الخطية
//     أدناه لا Twemoji — لغةُ الواجهة عندنا SVG خطيّ أصلاً.
//
// ولا يبقى في التطبيق محرفُ إيموجي واحد يُسلَّم إلى خطّ النظام.

// «رمزٌ مصوَّر» قاعدةُ يونيكود لا ذوق: `Emoji_Presentation=Yes` (رسمُه الملوّن هو
// الأصل)، أو محرفٌ أُلحق به مُحدِّدُ التصوير `U+FE0F`. وبها تخرج «✦» و«✓» و«★»
// و«←» — محارفُ نصّية تُرسم بخطّ النصّ نفسِه ولا شأن لها بهذه المهمة.
const PRESENTATION = '\u{231A}-\u{231B}\u{23E9}-\u{23EC}\u{23F0}\u{23F3}\u{25FD}-\u{25FE}\u{2614}-\u{2615}'
  + '\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-'
  + '\u{26C5}\u{26CE}\u{26D4}\u{26EA}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{26FD}\u{2705}'
  + '\u{270A}-\u{270B}\u{2728}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2795}-\u{2797}'
  + '\u{27B0}\u{27BF}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-'
  + '\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}-\u{1F202}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F236}'
  + '\u{1F238}-\u{1F23A}\u{1F250}-\u{1F251}\u{1F300}-\u{1F320}\u{1F32D}-\u{1F335}\u{1F337}-'
  + '\u{1F37C}\u{1F37E}-\u{1F393}\u{1F3A0}-\u{1F3CA}\u{1F3CF}-\u{1F3D3}\u{1F3E0}-\u{1F3F0}'
  + '\u{1F3F4}\u{1F3F8}-\u{1F43E}\u{1F440}\u{1F442}-\u{1F4FC}\u{1F4FF}-\u{1F53D}\u{1F54B}-'
  + '\u{1F54E}\u{1F550}-\u{1F567}\u{1F57A}\u{1F595}-\u{1F596}\u{1F5A4}\u{1F5FB}-\u{1F64F}'
  + '\u{1F680}-\u{1F6C5}\u{1F6CC}\u{1F6D0}-\u{1F6D2}\u{1F6D5}-\u{1F6D7}\u{1F6DC}-\u{1F6DF}'
  + '\u{1F6EB}-\u{1F6EC}\u{1F6F4}-\u{1F6FC}\u{1F7E0}-\u{1F7EB}\u{1F7F0}\u{1F90C}-\u{1F93A}'
  + '\u{1F93C}-\u{1F945}\u{1F947}-\u{1F9FF}\u{1FA70}-\u{1FA7C}\u{1FA80}-\u{1FA88}\u{1FA90}-'
  + '\u{1FABD}\u{1FABF}-\u{1FAC5}\u{1FACE}-\u{1FADB}\u{1FAE0}-\u{1FAE8}\u{1FAF0}-\u{1FAF8}';
const BASE_CHARS = '\u{A9}\u{AE}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{21AA}\u{231A}-\u{231B}\u{2328}'
  + '\u{23CF}-\u{23FA}\u{24C2}\u{25AA}-\u{25FE}\u{2600}-\u{27BF}\u{2934}-\u{2935}\u{2B00}-'
  + '\u{2BFF}\u{3030}\u{303D}\u{3297}\u{3299}\u{1F000}-\u{1FAFF}';
const ZWJ = '\u{200D}';
const VS16 = '\u{FE0F}';
const EMOJI_RE = new RegExp(
  `^(?:[${PRESENTATION}]${VS16}?|[${BASE_CHARS}]${VS16})`
  + `(?:${ZWJ}(?:[${PRESENTATION}]|[${BASE_CHARS}])${VS16}?)*$`, 'u');

/** أهذا النصُّ رمزٌ مصوَّر بتمامه؟ (رقمٌ مشرقيّ أو «✦»: لا). */
export const isEmoji = (text) => typeof text === 'string' && EMOJI_RE.test(text);

/**
 * مسارُ ملف الرمز في `app/emoji/` — نقاطُه بالست عشري موصولةً بشرطة.
 * وقاعدةُ `U+FE0F` قاعدةُ مجموعة Twemoji نفسِها: يُحذف المُحدِّد إلا في تسلسل ZWJ.
 * (ولا يُكتب في هذا الملف محرفُ إيموجي واحد ولو في تعليق — النطاقات أعلاه بالهروب لذلك.)
 */
export function emojiSrc(glyph) {
  const text = glyph.includes(ZWJ) ? glyph : glyph.replaceAll(VS16, '');
  return `emoji/${[...text].map((ch) => ch.codePointAt(0).toString(16)).join('-')}.svg`;
}

/**
 * صورةُ الرمز — مربّعةٌ بمقاس سطرها (`1em`) فتحلّ محلّ المحرف في مكانه بلا إزاحة.
 * و`data-emoji` تُعلن أيَّ رمزٍ ترسم: كان الرمزُ نصّاً يُقرأ من الشاشة فصار صورة،
 * فلولا الإعلانُ لعميت عنه اختباراتُ المتصفّح التي تتحقّق أنّ المعروض هو المقصود.
 */
export const emojiImg = (glyph) => h('img', {
  class: 'emoji', src: emojiSrc(glyph), alt: '', 'aria-hidden': 'true',
  draggable: false, 'data-emoji': glyph,
});

/**
 * **المُصيِّر الواحد**: وجهٌ في صندوقه — رمزاً مصوَّراً كان أو رقماً أو أيقونةً خطية.
 *
 * الصندوقُ الخارجيّ يبقى كما كان بصنفه وتنسيقه (فحجم الوجه ولونه من CSS كما هما)،
 * وإنما يتبدّل ما بداخله: `<img>` للمصوَّر، ونصٌّ للرقم المشرقيّ. فما من موضعٍ في
 * التطبيق يكتب وجهاً في DOM إلا من هنا.
 *
 * **وهو غيرُ مُصيِّر الكميات** (الجلسة ٢): ذاك يرسم الكمّ نفسَه بـSVG ويُرجِع العددَ
 * الذي رسم ليقابله حارسُه، وهذا يضع وجهاً في صندوق.
 */
export function faceEl(value, className, tag = 'span') {
  const drawn = !!value?.nodeType || isEmoji(value);      // صورةٌ أو أيقونة، لا نصّاً
  const inner = value?.nodeType ? value : (drawn ? emojiImg(value) : value);
  // الصورةُ زينةٌ لا نصّ: تُخفى عن قارئ الشاشة كما كان الرمزُ يُخفى قبلها، أما
  // النصُّ (الرقمُ المشرقيّ) فيبقى مقروءاً.
  return h(tag, { class: className, 'aria-hidden': drawn ? 'true' : null }, inner);
}

// أيقونات الواجهة — لغةُ المعالم نفسُها: خطٌّ بلا ملء، يتبع لون نصّه (`currentColor`).
// كلُّها في صندوق 24×24، فيكفي المقاسَ سطرُها.
const ICONS = {
  // مكبّر الصوت — زرّ «اسمع»
  ear: '<path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z"/>'
    + '<path d="M15.6 9.2a4 4 0 0 1 0 5.6"/><path d="M18.3 6.4a8 8 0 0 1 0 11.2"/>',
  // عينٌ مفتوحة — «شاهِد ثم أجب» في التقدير الفوري (لا مؤقّت: عرضٌ يُعاد بلا حدّ)
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/>'
    + '<circle cx="12" cy="12" r="3.2"/>',
  // وثبةُ فرح — احتفالُ الختام (وهي شقيقةُ النجمة في اللوح لا صورةُ مفرقعات)
  party: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3"/>'
    + '<path d="M2.5 12h3M18.5 12h3"/><path d="m5.3 5.3 2.1 2.1M16.6 16.6l2.1 2.1"/>'
    + '<path d="m18.7 5.3-2.1 2.1M7.4 16.6l-2.1 2.1"/>',
  // قفلٌ مغلق — المحطة التي لم يبلغها بعد
  lock: '<rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2"/>'
    + '<path d="M8.2 10.5V7.2a3.8 3.8 0 0 1 7.6 0v3.3"/>',
  // سهمان يدوران — المراجعة و«تابع من هنا» وزرّ إعادة العرض
  repeat: '<path d="M4 11V9.6A4.6 4.6 0 0 1 8.6 5H19"/><path d="m16.4 2.4 2.9 2.6-2.9 2.6"/>'
    + '<path d="M20 13v1.4a4.6 4.6 0 0 1-4.6 4.6H5"/><path d="m7.6 21.6-2.9-2.6 2.9-2.6"/>',
  // أسرة — بوابةُ وليّ الأمر (لا وجهَ طفلٍ يُنقر عليه بالخطأ)
  family: '<circle cx="7.5" cy="6.8" r="2.8"/><circle cx="16.8" cy="7.6" r="2.4"/>'
    + '<circle cx="12.2" cy="14.4" r="2"/><path d="M3 15.5a4.5 4.5 0 0 1 8.2-2.6"/>'
    + '<path d="M13.2 13.2a4 4 0 0 1 7.3 2.3"/><path d="M8.6 21a3.7 3.7 0 0 1 7.2 0"/>',
  // وجهٌ يبتسم — بشرى العبور واللمسات اللطيفة
  smile: '<circle cx="12" cy="12" r="8.8"/><path d="M8.2 14.4a4.7 4.7 0 0 0 7.6 0"/>'
    + '<circle cx="9.2" cy="10" r=".9" fill="currentColor" stroke="none"/>'
    + '<circle cx="14.8" cy="10" r=".9" fill="currentColor" stroke="none"/>',
  // لهبٌ — سلسلةُ أيام المراجعة المتتالية
  flame: '<path d="M12 2.8c.4 3.4 4.6 5.3 4.6 9.6a4.6 4.6 0 0 1-9.2 0c0-1.9.9-3.2 1.9-4.2'
    + '.1 1.5.9 2.4 1.8 2.4 1.3 0 1.4-2.4-.5-4.4z"/>'
    + '<path d="M12 20.9a2.6 2.6 0 0 1-2.6-2.6c0-1.5 2.6-3.4 2.6-3.4s2.6 1.9 2.6 3.4'
    + 'A2.6 2.6 0 0 1 12 20.9z"/>',
  // هديّةٌ معقودة — فتحُ المرحلة التالية
  gift: '<rect x="3.5" y="9.4" width="17" height="4" rx="1"/>'
    + '<path d="M5.2 13.4V20h13.6v-6.6"/><path d="M12 9.4V20"/>'
    + '<path d="M12 9.4c-3.4 0-5-.7-5-2.3S9.6 4.5 12 9.4z"/>'
    + '<path d="M12 9.4c3.4 0 5-.7 5-2.3S14.4 4.5 12 9.4z"/>',
  // ————— ثلاثٌ لجردِ الصنف (الجلسة م٥ · `FIELD.md §٤`) —————
  // زرٌّ إلزاميٌّ وسيلتُه الوحيدة نصٌّ حاجزٌ أمام جمهورٍ قبل-قارئ، فلكلٍّ من هذه
  // الثلاثة صورتُه: **صحٌّ** لِما تمّ، **ومضيٌّ** لِما بعده، **وخريطةٌ** للعودة.
  // صحٌّ — «تَمَّ» في «أعطني هذا العدد»
  check: '<path d="m4.6 12.6 4.9 4.9L19.4 6.8"/>',
  // سهمٌ إلى الأمام — و**أمامُنا اليسار** (واجهةٌ RTL): «تَابِعْ» بعد النمذجة
  onward: '<path d="M20 12H4.6"/><path d="m10.8 5.4-6.2 6.6 6.2 6.6"/>',
  // خريطةٌ مطويّة — بابُ العودة إلى الرحلة من كل شاشة
  map: '<path d="M9.2 4.2 3.6 6.6v13.2l5.6-2.4 5.6 2.4 5.6-2.4V4.2l-5.6 2.4z"/>'
    + '<path d="M9.2 4.2v13.2M14.8 6.6v13.2"/>',
};

/**
 * أيقونةُ واجهة — رمزٌ من صنع الواجهة لا من بيانات المنهج.
 * تتبع لون نصّها ومقاسَه، فتقع من الزرّ موقعَ محرفها الذي كانت. وحيث كان الرمز في
 * **شارةٍ** مقيسةٍ بالبكسل (قفلُ العقدة) تُوضع داخلها لا مكانَها: الشارةُ صندوقُها
 * والأيقونةُ حبرُها، فلا يتنازع صنفان على مقاسٍ واحد.
 */
export function icon(name) {
  if (!ICONS[name]) return null;
  const el = h('span', { class: 'ui-icon', 'aria-hidden': 'true' });
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  return el;
}

/** أسماء أيقونات الواجهة — يقرؤها حارسُ «لا إيموجي في الشيفرة». */
export const ICON_NAMES = Object.keys(ICONS);

/**
 * معلم المحطة — زخرفةٌ صامتة تتبع **لون نصّها** (`currentColor`) كأيقونات الواجهة.
 *
 * **ولمَ `currentColor` لا `var(--accent)`** (حكمُ المدير على مقترح الجلسة هـ —
 * `REVIEW_IDENTITY.md §٤`): صار للمعلم موضعان لا موضعٌ واحد — الخريطةُ حيث لونُه
 * لونُ المرحلة (تضبطه `.station-mark` في اللوح)، **وميداليةُ الختام** حيث القرصُ
 * نفسُه بلون المرحلة — فلو رُسم بلونها اختفى عليها. فالمعلمُ يأخذ لونَ حبر موضعه،
 * وكلُّ موضعٍ يقول لونَه مرّةً واحدة في CSS.
 */
export function landmark(kind) {
  if (!LANDMARKS[kind]) return null;
  const el = h('span', { class: 'station-mark', 'aria-hidden': 'true' });
  el.innerHTML = `<svg viewBox="0 0 64 48" fill="none" stroke="currentColor"
    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${LANDMARKS[kind]}</svg>`;
  return el;
}

/** أسماء المعالم — يقرؤها `curriculum.js` حين يصف أقسامَه. */
export const LANDMARK_NAMES = Object.keys(LANDMARKS);

/**
 * **أما زالت هذه الشاشةُ في الصفحة؟** — وبها تموت كلُّ حلقةٍ بمغادرة شاشتها.
 *
 * **بلاغُ الميدان ٥** (`docs/FIELD.md §٥`، ثلاثُ تأكيداتٍ من المالك آخرُها من الحيّ):
 * «رجعتُ للصفحة الرئيسية ودخلتُ من جديد فيبدأ العدُّ من ثلاثة ويعمل عدّادان معاً»، ثم
 * «التطبيق يتابع العدَّ بعد العودة للصفحة الرئيسية». وعلّتُه أنّ `alive` كانت **رقماً
 * في الشاشة لا حياةً لها**: `token === state.token` يتبدّل عند رسم جولةٍ جديدة
 * **داخل** الشاشة، ولا يعلم شيئاً عن مغادرتها. فمن غادر إلى الخريطة تركَ حلقةَ العدّ
 * حيّةً تنتظر مهلتَها ثم **تصفّ جملتَها التالية في قناةٍ فارغة فتُسمَع فوق الخريطة**
 * — والعودةُ تفتح حلقةً ثانية فوق الأولى.
 *
 * **والحياةُ من الصفحة لا من عدّاد**: الموجِّه يستبدل الشاشةَ (`app.replaceChildren`)
 * فينقطع جذرُها من المستند — وهذا وحدَه هو الحدث. فلا سِجلَّ يُمسَك ولا إلغاءَ يُنادى
 * ولا شاشةَ تُنسى: **ما ليس على الصفحة لا يتكلّم**، وهو امتناعٌ في البنية لا انتباهٌ
 * يُرجى. (وقبل أن يُسنَد الجذرُ — لحظةَ بناء الشاشة — لا شيءَ انقطع، فتمرّ.)
 */
export const onScreen = (root) => root?.isConnected !== false;

/**
 * سطرُ الإتقان: نصُّه ثم وثبةُ الفرح — بديلُ محرف الاحتفال الذي كان يُختم به النصّ.
 * (يُمرَّر إلى `h` كما يُمرَّر النصّ، فهي تفرد المصفوفة على أبنائها.)
 */
export const cheer = (text) => [text, ' ', icon('party')];

/** هزّة قصيرة تنبّه الطفل إلى خطأ دون كلام. */
export function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth;   // إعادة تشغيل الحركة
  el.classList.add('shake');
}

/** وثبة قصيرة تحتفي بالصواب دون كلام. */
export function pop(el) {
  el.classList.remove('pop');
  void el.offsetWidth;   // إعادة تشغيل الحركة
  el.classList.add('pop');
}

// ————— عشوائية (قابلة للحقن في الاختبارات) —————
//
// **كلُّ مولّدٍ في هذا التطبيق حتميٌّ ببذرة** (`METHOD.md §١٠.١`): لا تمرين مكتوب
// بيد، ولا جولة لا تُعاد كما كانت. فتُحقَن `rnd` في كل موضعٍ يعتمد الصدفة.

export function shuffle(list, rnd = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const pick = (list, rnd = Math.random) => list[Math.floor(rnd() * list.length)];

/** مولّدٌ حتميّ ببذرة (LCG) — تستعمله المولّدات والاختبارات فتُعاد الجولةُ نفسُها. */
export function seeded(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
