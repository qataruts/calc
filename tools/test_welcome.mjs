// حارسُ «المرجع التعريفيّ» (`app/welcome/` — أربعُ صفحاتٍ بقشرةٍ واحدة):
//   node tools/test_welcome.mjs
//
// المحروسُ هنا ثمانية، وكلُّها شروطُ قبولٍ لا زينة:
//   ١) **خارج التطبيق**: لا في قائمة SHELL، ولا يجيب عنها عاملُ الخدمة، ولا تسجّل
//      عاملاً، ولا تصل بيانَ التطبيق (manifest) — فلا تدخل PWA المثبَّتة بحال.
//   ٢) **لا مَورد شبكيّ خارجيّ البتّة**: كلُّ ما تجلبه الصفحةُ عند فتحها ملفٌّ في هذا
//      المستودع وموجودٌ فعلاً. **والاستثناءُ المعلَن واحد**: عنوانُ موقعنا في ترويسة
//      المطبوع — وهو `<a>` يُفتَح إن نُقر ولا يُجلَب.
//   ٣) **قشرةٌ واحدة**: شريطُ التنقّل نفسُه في الصفحات الأربع، وصفحتُه الحالية معلَّمة.
//   ٤) **اللوح ليس منسوخاً**: لا لونَ بقيمته في التنسيق — بل متغيّرات `app.css`.
//   ٥) **أرقامُها صادقة**: كلُّ رقمٍ موسومٍ `data-stat` في أيّ صفحة **يُحسب من بيانات
//      المنهج** ويُقارَن — فتوسعةُ المنهج تُسقِط الفحصَ قبل أن تُسقِط صدقَ الصفحة.
//   ٦) **حارسُ التغطية — لا نوعَ محطةٍ يُترَك**: لكل نوعِ عقدةٍ في الرحلة بطاقتُه في
//      صفحة المنهج (`data-covers`) بعددِ محطاته (`data-count`) وبنمطها الواحد
//      (ثلاثةُ حقول) — **ونوعٌ جديد يدخل الرحلةَ غداً يُحمِر هذا البابَ باسمه**.
//   ٧) **لا وعدَ بما ليس في التطبيق**: كلُّ اسمِ زرٍّ تَعِد به الصفحةُ يُقابَل بنصّه في
//      `app/js/parent.js` و`app/js/main.js` — فلو غُيّر اسمٌ هناك احمرّ هنا.
//   ٨) **النصُّ منقولٌ من البيانات لا مُعادُ الصياغة**: أسماءُ المراحل والبوابات
//      وقراراتُ المنهج تُقرأ وقتَ الفحص من مصادرها ويُقابَل بها ما في الصفحة.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const APP = new URL('app/', ROOT);
const WELCOME = new URL('welcome/', APP);
const read = (path, base = WELCOME) => readFileSync(new URL(path, base), 'utf8');

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };

const PAGE_NAMES = ['index.html', 'curriculum.html', 'method.html', 'guide.html'];
const PAGES = Object.fromEntries(PAGE_NAMES.map((name) => [name, read(name)]));
const html = PAGES['index.html'];
const cur = PAGES['curriculum.html'];
const method = PAGES['method.html'];
const guide = PAGES['guide.html'];
const css = read('welcome.css');
const sw = read('sw.js', APP);
const parentJs = read('js/parent.js', APP);
const mainJs = read('js/main.js', APP);

// بيانات المنهج — منها تُحسب أرقام الصفحات (لا تُصدَّق كما كُتبت)
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const JS = new URL('js/', APP);
const progress = await import(new URL('progress.js', JS));
const { STAGES, GATES, LEVEL_MAX, CONCEPT_SECTIONS, SIGNS, stations } = await import(new URL('curriculum.js', JS));
const emojiIndex = JSON.parse(read('emoji/index.json', APP));
// **بنكُ الصوت يُحسب من بيانه لا يُقدَّر**: بصمةٌ لكل ملفٍّ مولَّد في `versions.json`،
// فدفعةٌ جديدة تُسقِط الفحصَ يومَ تُصرَّف — وذاك الحارسُ يعمل لا عيبٌ فيه.
const audioVersions = JSON.parse(read('audio/versions.json', APP));

/* **استثناءان معلَنان لا أكثر** (أمرُ المالك عبر العائلة، ١٣ أغسطس ٢٠٢٦ —
   `2026-08-13-email-and-family-link.md`): كان الحارسُ يقول «إلا عنوانَ موقعنا» فحسب،
   فلمّا أُمر بسطر بوابة العائلة **صُحّح بقراره المعلَن ولم يُحوَّط حوله** (كذا فعلت
   اقرأ). والفرقُ بين الاثنين وبين رابطٍ خارجيّ ثالث: هذان **بيتُنا**، ولا يُجلَب
   منهما بايتٌ عند الفتح — يُفتحان إن نُقرا. */
const SITE = 'https://calc.mishkat.qa/';            // عنوانُنا في ترويسة المطبوع
const FAMILY = 'https://learn.mishkat.qa/';         // بوابةُ العائلة في الفوتر
const ALLOWED = [SITE, FAMILY];

// ————— ١. خارج التطبيق وخارج قشرة عامل الخدمة —————

console.log('\n١. خارج التطبيق');

for (const [name, text] of Object.entries(PAGES)) {
  ok(!/<link[^>]*rel=["']manifest["']/.test(text) && !/serviceWorker/.test(text)
    && !/<script/i.test(text),
    `${name}: لا بيانَ تطبيقٍ ولا عاملَ خدمة ولا سطرَ جافاسكربت واحداً`);
}
ok(/const WELCOME = new URL\('welcome\/'/.test(sw), 'وعامل الخدمة يعرف مسارها مشتقّاً من نطاقه');
// ردُّ التنقّل يجيب index.html عن كل تنقّلٍ في النطاق — فلولا الاستثناء **قبله**
// لفُتح التطبيقُ مكان الصفحة على كل جهازٍ ثبّته، فلا تُرى الصفحة أبداً.
const bypass = sw.indexOf('url.pathname.startsWith(WELCOME)');
ok(bypass > 0, 'ويستثنيها من الاعتراض فلا تُخزَّن ولا يُجاب عنها من المخزون');
ok(bypass > 0 && bypass < sw.indexOf("request.mode === 'navigate'"),
  'والاستثناء قبل ردّ التنقّل (وإلا ابتلعها فتحُ التطبيق مكانها)');

// **وبابُ المرجع في التطبيق**: من فتح التطبيق وأراد أن يعرف ما هو يجد الرابطَ في
// ذيل الخريطة — انتقالُ صفحةٍ لا تنقّلُ تطبيق.
ok(/class: 'map-about', href: 'welcome\/'/.test(mainJs),
  'وللتطبيق بابٌ إليها في ذيل خريطته (لا في صدرها فيزاحم درسَ الطفل)');
ok(/\.map-about\s*{/.test(read('css/app.css', APP)), 'وله تنسيقُه الهادئ في لوح التطبيق');

// ————— ٢. لا مَورد شبكيّ خارجيّ، ولا رابط مكسور —————

console.log('\n٢. المَوارد والروابط');

for (const [name, text] of Object.entries(PAGES)) {
  // **المحروسُ مرجعُ المَورد لا رابطُ التصفّح**: `src` و`<link>` تُجلَب عند الفتح
  // فلا يجوز فيها خارجيّ البتّة؛ و`<a href>` لا يُجلَب — يُفتَح إن نُقر.
  const fetched = [...text.matchAll(/(?:src|<link[^>]*href)="([^"]+)"/g)].map((m) => m[1])
    .filter((v) => /^(?:https?:)?\/\//.test(v) || v.startsWith('data:'));
  ok(fetched.length === 0,
    `${name}: صفرُ مَوردٍ خارجيّ يُجلَب${fetched.length ? ' — ' + fetched.join('، ') : ''}`);

  const outward = [...text.matchAll(/<a[^>]*href="(https?:[^"]+)"/g)].map((m) => m[1]);
  const stray = outward.filter((v) => !ALLOWED.includes(v));
  ok(stray.length === 0 && outward.length <= 2,
    `${name}: ولا رابطَ خارجيّ إلا عنوانَنا وبوابةَ العائلة (${outward.length})`
    + (stray.length ? ` — دخل: ${stray.join('، ')}` : ''));

  // **وسطرُ بوابة العائلة في الفوتر لا في متن الصفحة**: أمرُ المالك «في كل صفحة
  // تعريفية»، فيُقاس في الأربع كلِّها — ونصُّه يسمّي التطبيق واسمَ العائلة معاً.
  const foot = text.slice(text.indexOf('<footer'));
  ok(foot.includes(FAMILY) && foot.includes('عائلة التعليم') && foot.includes('«اِحْسِبْ»'),
    `${name}: وفي فوترها سطرُ بوابة العائلة («اِحْسِبْ» واحدٌ من عائلة التعليم الأولي)`);

  // **والبريدُ المرجع واحدٌ للعائلة كلِّها** (`info@mishkat.qa`) — ولا بريدَ سواه:
  // بريدٌ قديم في صفحةٍ منشورة يوجّه الناسَ إلى صندوقٍ لا يُقرأ.
  const mails = [...new Set([...text.matchAll(/mailto:([^"?]+)/g)].map((m) => m[1]))];
  ok(mails.length === 1 && mails[0] === 'info@mishkat.qa',
    `${name}: وبريدُها المرجع info@mishkat.qa وحدَه (${mails.join('، ') || 'لا بريد'})`);

  // و`mailto:` ليس ملفّاً يُطلَب: فعلُ مراسلةٍ يفتحه المتصفّح إن نُقر
  const links = [...text.matchAll(/(?:href|src)="([^"#][^"]*)"/g)].map((m) => m[1])
    .filter((v) => !/^(?:https?:)?\/\//.test(v) && !/^(?:mailto|tel):/.test(v));
  const missing = links.filter((v) => !existsSync(new URL(v, WELCOME)));
  ok(missing.length === 0,
    `${name}: وكلُّ ملفٍّ تطلبه موجود (${links.length} مرجعاً)`
    + (missing.length ? ' — مفقود: ' + missing.join('، ') : ''));

  const ids = new Set([...text.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  const dangling = [...text.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).filter((a) => !ids.has(a));
  ok(dangling.length === 0,
    `${name}: وكلُّ رابطِ قفزٍ يجد قسمه`
    + (dangling.length ? ' — معلَّق: ' + dangling.join('، ') : ''));

  // **الصورةُ لا تُزحزح السطرَ ولا تُجلَب قبل أوانها**: صفحةٌ بلقطاتٍ تُحمَّل على
  // جهاز معلّم. **ويُستثنى صدرُ الصفحة**: تأجيلُ أول ما تراه العين يؤخّر أهمَّ صورة.
  const imgs = [...text.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
  const heroEnd = text.indexOf('</header>', text.indexOf('class="w-hero"'));
  const inHero = (t) => text.indexOf(t) < heroEnd && heroEnd > 0;
  const loose = imgs.filter((t) => !/alt="/.test(t) || !/width="\d+"/.test(t)
    || !/height="\d+"/.test(t) || (!/loading="lazy"/.test(t) && !inHero(t)));
  ok(loose.length === 0,
    `${name}: ولكل صورةٍ (${imgs.length}) وصفُها وأبعادُها، و\`loading="lazy"\` لما بعد الصدر`
    + (loose.length ? ` — شذّت ${loose.length}` : ''));
}
ok(!/@import|url\(\s*["']?https?:/.test(css), 'والتنسيقُ لا يجلب من شبكة');

// ————— ٣. القشرة الواحدة وزرّ البدء —————

console.log('\n٣. القشرة الواحدة');

const TOP = /<header class="w-top">[\s\S]*?<\/header>/;
for (const [name, text] of Object.entries(PAGES)) {
  const bar = text.match(TOP)?.[0] || '';
  const tabs = ['./', 'curriculum.html', 'method.html', 'guide.html'];
  ok(tabs.every((href) => bar.includes(`href="${href}"`)),
    `${name}: شريطُ التنقّل الواحد بصفحاته الأربع`);
  ok((bar.match(/aria-current="page"/g) || []).length === 1,
    `${name}: وصفحتُها الحالية معلَّمةٌ لقارئ الشاشة (واحدةٌ لا اثنتان)`);
  ok(bar.includes('class="brand-word"'), `${name}: والعلامةُ في الشريط بصندوقها من app.css`);
  ok(/<a class="btn btn--primary" href="\.\.\/">/.test(bar), `${name}: وفيه دعوةٌ إلى التطبيق`);
  ok(text.includes('class="w-print-head"') && text.includes(SITE),
    `${name}: ولها ترويسةُ مطبوعٍ فيها عنوانُ الموقع`);
}

// الفعلُ الرئيس في متن الصفحة — والشريطُ مستثنىً بعلّته (دعوةٌ بحجم الشريط)
for (const [name, text] of Object.entries(PAGES)) {
  const body = text.replace(TOP, '');
  const starts = [...body.matchAll(/<a[^>]*href="\.\.\/"[^>]*>([^<]*)<\/a>/g)];
  if (!starts.length) continue;
  ok(starts.every((m) => /btn--primary/.test(m[0]) && /w-start/.test(m[0])),
    `${name}: وزرُّ «ابدأ الآن» في المتن هو الفعل الرئيس (${starts.length} موضعاً)`);
}
ok(/\.w-start\s*{[^}]*min-height:\s*4rem/.test(css), 'وارتفاعه في التنسيق ٤rem (٦٤ بكسل)');

// ————— ٤. اللوح من التطبيق لا منسوخاً، والخطوط محلّية —————

console.log('\n٤. اللوح والخطوط والطباعة');

const hexes = [...css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0])
  .filter((c) => c !== '#fff' && c !== '#ffffff');
ok(hexes.length === 0,
  `تنسيق المرجع لا يكتب لوناً بقيمته${hexes.length ? ' — ' + [...new Set(hexes)].join('، ') : ''}`);
ok(PAGE_NAMES.every((n) => /href="\.\.\/css\/app\.css"/.test(PAGES[n])),
  'بل ترث الصفحاتُ الأربع لوح التطبيق وخطوطه من app.css');
ok(/var\(--paper\)|var\(--card\)/.test(css) && /var\(--ink/.test(css),
  'وتستعمل متغيّراته (ورق وبطاقة وحبر)');
ok(/@font-face\s*{[^}]*'Cairo'[^}]*fonts\/Cairo-arabic\.woff2/s.test(css)
  && existsSync(new URL('fonts/Cairo-arabic.woff2', WELCOME))
  && existsSync(new URL('fonts/Cairo-latin.woff2', WELCOME)),
  'وخطُّ عناوينها مضمَّنٌ محلياً في welcome/fonts/ (لا شبكةَ ولا خطُّ نظام)');
ok(!read('css/app.css', APP).includes('Cairo'), 'والتطبيق لم يُمَسّ خطاً (لا Cairo في app.css)');
const bareCss = css.replace(/\/\*[\s\S]*?\*\//g, '');   // بلا تعليقات: المنتقي لا شرحُه
// **وعلامةُ «اِحْسِبْ» تبقى لخطّها وحدها** (ميثاق الهوية): خطُّ العلامة يخدم الكلمة
// في `.brand-word` من `app.css`، ولا يطلبه تنسيقُ هذه الصفحة لعنوانٍ ولا لمتن.
const brandFont = /--font-brand:\s*'([^']+)'/.exec(read('css/app.css', APP))?.[1] || '';
ok(brandFont && !bareCss.includes('--font-brand') && !bareCss.includes(brandFont),
  `وعلامةُ «اِحْسِبْ» تبقى لخطّها وحدها (${brandFont} — لا يطلبه هذا التنسيق)`);

const print = css.slice(css.indexOf('@media print'));
for (const [rule, why] of [
  ['.w-top', 'شريطُ التنقّل يسقط من المطبوع'],
  ['break-inside: avoid', 'ولا تُقصّ بطاقةٌ بين ورقتين'],
  ['.w-print-head', 'وترويسةُ المطبوع تظهر على الورق وحدَه'],
]) ok(print.includes(rule), `الطباعة: ${why}`);
const head = cur.slice(cur.indexOf('class="w-print-head"'),
  cur.indexOf('</div>', cur.indexOf('class="w-print-head"')));
ok(/icons\/icon-192\.png/.test(head) && /class="brand-word"/.test(head) && head.includes(SITE),
  'وفيها أيقونةُ التطبيق وعلامتُه وعنوانُ الموقع (من وقعت الورقةُ في يده بلغ صاحبَها)');

// ————— ٥. الأرقام — كلُّها محسوبة —————

console.log('\n٥. الأرقام');

const AR = '٠١٢٣٤٥٦٧٨٩';
const num = (s) => Number([...s].map((d) => (AR.indexOf(d) < 0 ? d : AR.indexOf(d))).join(''));

const skillKeys = new Set();
for (const station of stations()) for (const key of station.skills || []) skillKeys.add(key);
const nodeTypes = {};
for (const node of progress.allNodes()) nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;

const expected = {
  nodes: progress.allNodes().length,
  stars: progress.maxTotalStars(),
  stages: STAGES.length,
  gates: GATES.length,
  sections: progress.journey().length,
  skills: skillKeys.size,
  audio: Object.keys(audioVersions).length,
  types: Object.keys(nodeTypes).length,
  max: LEVEL_MAX,
  concepts: CONCEPT_SECTIONS.length,
  icons: Object.keys(emojiIndex.files).length,
};

let statCount = 0;
for (const [name, text] of Object.entries(PAGES)) {
  const declared = [...new Set([...text.matchAll(/data-stat="([^"]+)"/g)].map((m) => m[1]))].sort();
  for (const key of declared) {
    const found = [...text.matchAll(new RegExp(`data-stat="${key}"[^>]*>([٠-٩]+)<`, 'g'))]
      .map((m) => num(m[1]));
    statCount += found.length;
    ok(expected[key] !== undefined && found.length > 0 && found.every((v) => v === expected[key]),
      `${name}: «${key}» = ${expected[key] ?? '؟'} في ${found.length} موضعاً`);
  }
}
ok(statCount >= 15, `ومجموعُ المواضع المحسوبة ${statCount} في الصفحات الأربع`);
// ومجموعُ ما تعلنه بطاقاتُ الأنواع هو الرحلةُ كلُّها — لا محطةَ خارج نوع
const coversTotal = [...cur.matchAll(/data-count="([٠-٩]+)"/g)].reduce((t, m) => t + num(m[1]), 0);
ok(coversTotal === progress.allNodes().length,
  `ومجموعُ ما في البطاقات هو الرحلةُ كلُّها (${coversTotal} من ${progress.allNodes().length})`);

// ————— ٦. حارسُ التغطية: لا نوعَ محطةٍ يُترَك —————

console.log('\n٦. تغطية أنواع المحطات');

const covers = [...cur.matchAll(/data-covers="([^"]+)"\s+data-count="([٠-٩]+)"/g)];
const covered = new Set(covers.map((m) => m[1]));
const missingTypes = Object.keys(nodeTypes).filter((t) => !covered.has(t));
const strayTypes = [...covered].filter((t) => !(t in nodeTypes));
ok(missingTypes.length === 0 && strayTypes.length === 0,
  `لكل نوع محطةٍ بطاقتُه (${covered.size} نوعاً)`
  + (missingTypes.length ? ` — بلا بطاقة: ${missingTypes.join('، ')}` : '')
  + (strayTypes.length ? ` — بطاقةٌ بلا محطة: ${strayTypes.join('، ')}` : ''));
for (const [, type, count] of covers) {
  ok(num(count) === nodeTypes[type], `وعددُ «${type}» في بطاقته = ${nodeTypes[type]}`);
}

// النمطُ الواحد لا يتبدّل: ثلاثةُ حقولٍ بترتيبها في كل بطاقة
const PATTERN = ['ماذا يتعلّم', 'كيف يعمل', 'دورُك أنت'];
const cards = cur.split('<article').slice(1).filter((c) => c.includes('data-covers='));
const offPattern = [];
for (const card of cards) {
  const dts = [...card.slice(0, card.indexOf('</article>')).matchAll(/<dt>([^<]+)<\/dt>/g)]
    .map((m) => m[1].trim());
  if (dts.length !== 3 || !PATTERN.every((label, i) => (dts[i] || '').startsWith(label))) {
    offPattern.push(dts.join(' · ') || 'بلا حقول');
  }
}
ok(cards.length === covered.size && offPattern.length === 0,
  `ونمطُ البطاقة ثلاثةُ حقولٍ بترتيبها في ${cards.length} بطاقة`
  + (offPattern.length ? ' — شذّت: ' + offPattern.slice(0, 3).join('، ') : ''));

// اللقطاتُ من الشاشات نفسِها بمولّدها — ولا يتيمةَ ولا مفقودة
const shotFiles = readdirSync(new URL('shots/', WELCOME)).filter((f) => f.endsWith('.png'));
const shown = new Set(Object.values(PAGES)
  .flatMap((t) => [...t.matchAll(/src="shots\/([a-z]+)\.png"/g)].map((m) => m[1])));
ok(shotFiles.length > 0 && shotFiles.every((f) => shown.has(f.replace('.png', '')))
  && [...shown].every((s) => shotFiles.includes(`${s}.png`)),
  `و${shotFiles.length} لقطةً كلُّها معروضةٌ وموجودة (لا يتيمةَ ولا مفقودة)`);
ok([...cur.matchAll(/<div class="w-pair">/g)].length >= 8,
  'ولبطاقات المحطات الكبرى لقطاتُها بجوارها في صفحة المنهج');

/* **واللقطاتُ متتبَّعةٌ في المستودع** — لا على القرص وحدَه (عيبٌ وقع في الجلسة ٩):
   `.gitignore` يستثني `shots/` (لقطاتُ المراجعة المحلّية عدّةُ عملٍ لا تُنشَر) فابتلع
   معها `app/welcome/shots/` — **وهي أصولٌ تُنشَر للناس**. فمضت أوّلُ دفعةٍ بصفحاتٍ بلا
   صورةٍ واحدة، ولم يمسكه إلا `check_live.py` **بعد النشر**. وهذا البابُ يمسكه قبله:
   «على القرص» ليست «ملتزَمة»، كما أنّ «ملتزَمة» ليست «منشورة». */
const tracked = new Set(execFileSync('git', ['ls-files', 'app/welcome/shots'],
  { cwd: fileURLToPath(ROOT), encoding: 'utf8' }).split('\n').filter(Boolean)
  .map((p) => p.split('/').pop()));
const untracked = shotFiles.filter((f) => !tracked.has(f));
ok(untracked.length === 0,
  `وكلُّها متتبَّعةٌ في المستودع فتصل المنشورَ (${tracked.size} ملفاً)`
  + (untracked.length ? ` — على القرص ولا يعرفها git: ${untracked.join('، ')}` : ''));

// رموزُ الصفحات صورُ `app/emoji/` نفسِها لا محارفُ خطّ نظام
const faces = Object.values(PAGES)
  .flatMap((t) => [...t.matchAll(/\.\.\/emoji\/([0-9a-f-]+)\.svg/g)].map((m) => m[1]));
ok(faces.length > 0 && faces.every((k) => k in emojiIndex.files),
  `ورموزُها كلُّها من فهرس الأيقونات (${new Set(faces).size} رمزاً)`);

// ————— ٧. لا وعدَ بما ليس في التطبيق —————

console.log('\n٧. الوعود مقابلَ التطبيق');

for (const [label, src, where] of [
  ['انسخ تقدّم طفلي', parentJs, 'parent.js'],
  ['استعِد من ملف', parentJs, 'parent.js'],
  ['نسخة احتياطية من تقدّمه', parentJs, 'parent.js'],
  ['تحكّم في الرحلة', parentJs, 'parent.js'],
  ['افتح الطريق إلى هنا', parentJs, 'parent.js'],
  ['صفِّر هذه المحطة', parentJs, 'parent.js'],
  ['نزّل الأصوات الآن', parentJs, 'parent.js'],
  ['معاينةُ التطبيق كلِّه', parentJs, 'parent.js'],
  ['توصية اليوم', parentJs, 'parent.js'],
  ['دقائق آخر سبعة أيام', parentJs, 'parent.js'],
  ['راجِع مختصاً', parentJs, 'parent.js'],
  ['أدوات التجربة (?dev=1)', mainJs, 'main.js'],
  ['أنجِز الكل بنجمة', mainJs, 'main.js'],
  ['أنجِز الكل بثلاث', mainJs, 'main.js'],
  ['محو التقدّم', mainJs, 'main.js'],
  ['مراجعة اليوم', mainJs, 'main.js'],
]) {
  ok(guide.includes(label) && src.includes(label),
    `«${label}» موعودٌ في الدليل وموجودٌ بنصّه في ${where}`);
}
ok(parentJs.includes('backupText') && /askPersistence|persistedStorage/.test(parentJs),
  'والتطبيق يصدّر النسخة ويطلب تخزيناً دائماً فعلاً');

// ————— ٨. النصُّ منقولٌ من مصادره لا مُعادُ الصياغة —————

console.log('\n٨. النقل من المصادر');

const flat = (t) => t.replace(/\s+/g, ' ');
const curFlat = flat(cur);
const has = (needle) => curFlat.includes(flat(needle));
ok(GATES.every((g) => has(g.title)), 'والبواباتُ الثلاث بأسمائها كما في المنهج');
ok(STAGES.every((s) => has(s.title)), 'والمراحلُ الثماني بعناوينها كما في المنهج');
ok(CONCEPT_SECTIONS.every((s) => flat(guide).includes(flat(s.title))),
  'وأقسامُ لوحة وليّ الأمر السبعة بأسمائها في الدليل');

// **وقراراتُ المنهج تدخل صفحةَ الأسس نصّاً بأسبابها** (`METHOD.md §١٢`): يُقرأ
// جدولُ القرارات من الوثيقة الملزمة نفسِها وقتَ الفحص، **ويُقابَل عددُ صفوفه**
// بعدد صفوف الجدول المعروض — فقرارٌ يُزاد هناك ولا يُنقَل هنا يُحمِر البابَ.
const methodDoc = readFileSync(new URL('docs/METHOD.md', ROOT), 'utf8');
const table = methodDoc.slice(methodDoc.indexOf('## ١٢.'), methodDoc.indexOf('## ١٣.'));
const rows = table.split('\n').filter((l) => l.startsWith('|') && !/^\|\s*-|القرار/.test(l));
const shownRows = [...method.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)]
  .flatMap((m) => [...m[1].matchAll(/<tr>/g)]).length;
ok(rows.length > 0 && shownRows === rows.length,
  `وقراراتُ المنهج المعلَنة كلُّها في صفحة الأسس (${shownRows} من ${rows.length} في METHOD §١٢)`);
// وثلاثةٌ منها بأسبابها لا بأحكامها وحدَها — عيّنةٌ من نصّ الوثيقة
for (const needle of ['أصعب إدراكاً', 'فوق إدراك', 'يُعاد النظر']) {
  ok(flat(method).includes(needle), `وسببُ القرار منقولٌ لا محذوف: «${needle}»`);
}

// ————— ٩. حارسُ المدى: اللقطاتُ تمثّل مدى التطبيق لا أوّلَه —————
//
// **البلاغ ٣** (`FIELD.md §٣`): كلُّ ما نُشر كان من أول الرحلة (عدَّ نقاطٍ بلا رمز)
// فقرأ الناظرُ التطبيقَ أدنى من مداه — عيبُ صدقٍ من جنس «صدق الصورة». والقاعدةُ
// المرقّاة: **صورُ التعريف تمثّل مدى التطبيق** — من كل عائلة مراحل لقطة، وفيها
// الرمزُ العدديّ ورمزا العمليتين **معروضةً في الصور فعلاً** لا في نصّ الصفحة وحده.
//
// والمقيسُ بيانُ اللقطات (`shots/manifest.json`): يكتبه المولّد من الشاشة الحيّة
// (نصُّ ما تراه العين، ببذرةٍ مجمّدة تجعل ما قيس عينَ ما التُقط)، ويُربَط بصوره
// بالأبعاد — فبيانٌ قديمٌ أو مبدَّلٌ بيدٍ لا يطابق ترويسات PNG فيحمرّ قبل أن يكذب.

console.log('\n٩. حارس المدى — اللقطات تعبر الرحلة');

const manifest = JSON.parse(read('shots/manifest.json')).shots;
const pngSize = (name) => {
  const buf = readFileSync(new URL(`shots/${name}.png`, WELCOME));
  return buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47
    ? [buf.readUInt32BE(16), buf.readUInt32BE(20)] : null;
};

// البيانُ وصورُه صنوان: بندٌ لكل صورة وصورةٌ لكل بند، والأبعادُ من ترويسة PNG نفسِها
const entries = Object.keys(manifest);
ok(entries.length === shotFiles.length && shotFiles.every((f) => entries.includes(f.replace('.png', ''))),
  `بيانُ اللقطات يعدّ ما على القرص (${entries.length} بنداً لـ${shotFiles.length} صورة)`);
const misfit = entries.filter((k) => {
  const size = pngSize(k);
  return !size || size[0] !== manifest[k].w || size[1] !== manifest[k].h;
});
ok(misfit.length === 0,
  'وأبعادُ كل بندٍ أبعادُ صورته من ترويسة PNG (فلا بيانَ يصف صوراً غيرَ هذه)'
  + (misfit.length ? ` — خالف: ${misfit.join('، ')}` : ''));

// وما تعرضه الصفحاتُ بأبعاده المحسوبة من البيان — لا برقمٍ كُتب يوماً وبقي
const badDims = [];
for (const [name, text] of Object.entries(PAGES)) {
  for (const m of text.matchAll(/<img[^>]*src="shots\/([a-z]+)\.png"[^>]*>/g)) {
    const shot = manifest[m[1]];
    const w = Number(/width="(\d+)"/.exec(m[0])?.[1]);
    const h = Number(/height="(\d+)"/.exec(m[0])?.[1]);
    if (!shot || w !== shot.w || h !== shot.h) badDims.push(`${name}:${m[1]}`);
  }
}
ok(badDims.length === 0,
  'وأبعادُ الصور في الصفحات أبعادُ البيان نفسُها'
  + (badDims.length ? ` — خالف: ${badDims.join('، ')}` : ''));

// **من كل عائلة مراحل لقطة**: مسارُ اللقطة `#/نوع/جزء` يُرَدّ إلى محطته ومرحلتها
const stageOf = (route) => {
  const m = /^#\/([a-z-]+)\/([a-z-]+)$/.exec(route || '');
  if (!m) return null;
  return STAGES.find((s) => s.stations.some((st) => st.type === m[1] && st.part === m[2])) || null;
};
const coveredStages = new Set(entries.map((k) => stageOf(manifest[k].route)?.id).filter(Boolean));
const bare = STAGES.filter((s) => !coveredStages.has(s.id)).map((s) => s.title);
ok(bare.length === 0,
  `لكل مرحلةٍ من الثماني لقطةٌ من محطةٍ من محطاتها (${coveredStages.size} من ${STAGES.length})`
  + (bare.length ? ` — بلا لقطة: ${bare.join('، ')}` : ''));

// **والرموزُ والعملياتُ معروضةٌ في الصور فعلاً**: نصُّ البيان نصُّ الشاشة الملتقطة
// (`innerText` وقتَ القياس) لا نصُّ الصفحة المرافق — فما هنا رآه الناظرُ في الصورة.
const allText = entries.map((k) => manifest[k].text || '').join(' ');
for (const [op, sign] of Object.entries(SIGNS)) {
  ok(allText.includes(sign),
    `رمزُ «${sign}» (${op}) معروضٌ في لقطةٍ من اللقطات`);
}
ok(/[٠-٩]/.test(allText), 'ورمزٌ عدديّ مشرقيّ معروضٌ في اللقطات');

// **والصدرُ يقول المدى**: أولُ صورةٍ تراها العينُ في الرئيسة جملةُ عمليةٍ
// بالرموز وخانةُ سؤال — لا عدُّ نقاط.
const heroShot = /class="w-hero-shot">\s*<img[^>]*src="shots\/([a-z]+)\.png"/.exec(html)?.[1];
const heroText = manifest[heroShot]?.text || '';
ok(Boolean(heroShot) && heroText.includes(SIGNS.add) && heroText.includes('؟') && /[٠-٩]/.test(heroText),
  `وصدرُ الرئيسة («${heroShot || 'لا صورة'}») فيه جملةُ جمعٍ بالرموز المشرقية وخانةُ السؤال`);

console.log(fails ? `\n${fails} فشل` : '\nكل اختبارات «المرجع التعريفي» ناجحة');
process.exit(fails ? 1 : 0);
