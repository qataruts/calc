// اختبار العمل دون إنترنت (PWA):
//   node tools/test_pwa.mjs
// يحرس: app/sw.js app/index.html app/audio/manifest.json app/welcome/** app/manifest.webmanifest
//   (قشرةُ العمل دون إنترنت: جردُها وما تستثنيه وما تخزّنه)
//
// ————— بذرةُ المنصة (منسوخٌ من «اِقْرَأْ» ومكيَّف) —————
// المحروس هنا ثلاثة:
//   ١) قائمة SHELL في `app/sw.js` لا تنسى ملفاً موجوداً في `app/` ولا تعِد بملف غير
//      موجود — نسيانُ وحدة جافاسكربت واحدة يعني تطبيقاً معطوباً دون إنترنت، ولا يظهر
//      إلا هناك.
//   ٢) بيان التطبيق (manifest) صالح: أيقوناته موجودة بمقاساتها، ولغته عربية.
//   ٣) استراتيجيتا الخزن وأحكامُها (مخزنٌ ثابت، شفاء، شفافيةُ تحميل، لا هدمَ لكاملٍ
//      لأجل ناقص) — وهي دروسُ اقرأ التي دُفع ثمنُها، فتُحرَس في المصدر من اليوم الأول.
//
// **وما يفترض بنكَ صوتٍ لم يُولَّد بعدُ نائمٌ يستيقظ ذاتياً** (`docs/SEED.md §٥`):
// فحوصُ «الصوت مخزونٌ من بيانه» تحتاج `app/audio/manifest.json`، ولا وجود له قبل
// الجلسة ص. فتُعلَن نائمةً بصوتٍ عالٍ — **ولا تُحذَف**: يومَ يظهر البيانُ تعمل من
// تلقائها، فلا يملك أحدٌ أن ينسى إيقاظها.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';

const APP = new URL('../app/', import.meta.url);
const read = (p) => readFileSync(new URL(p, APP), 'utf8');
const has = (p) => existsSync(new URL(p, APP));

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

const sw = read('sw.js');
const manifest = JSON.parse(read('manifest.webmanifest'));

// **بنكُ الصوت: أموجودٌ اليوم؟** (لا رايةَ تُضبط بيد — الجردُ يجيب)
const AUDIO_READY = has('audio/manifest.json');

// ————— ١. قائمة الهيكل تطابق ما في app/ فعلاً —————

console.log('\n— قائمة القشرة تطابق الشجرة —');

const shell = [...sw.matchAll(/^\s*'([^']+)',$/gm)].map((m) => m[1])
  .filter((p) => p !== './' && !p.includes('${'));

const onDisk = [];
const walk = (dir, prefix = '') => {
  for (const name of readdirSync(new URL(dir, APP))) {
    if (name.startsWith('.')) continue;
    const path = `${prefix}${name}`;
    if (statSync(new URL(path, APP)).isDirectory()) walk(`${path}/`, `${path}/`);
    else onDisk.push(path);
  }
};
walk('./');

// ملفات الهيكل: كل ما في `app/` عدا ما يُخزَن من فهرسه (الأصوات وأيقونات الرموز)
// وعامل الخدمة نفسه، **وعدا الصفحة التعريفية**: `welcome/` ليست من التطبيق —
// صفحةُ عرضٍ للمعلمين خارج القشرة عمداً (الجلسة ٩). والرمزُ الجديد يدخل المخزون
// بفهرسه لا بسطرٍ يدويّ في `sw.js`.
const wanted = onDisk
  .filter((p) => !p.startsWith('audio/') || p === 'audio/manifest.json' || p === 'audio/versions.json')
  .filter((p) => !p.startsWith('emoji/') || p === 'emoji/index.json')
  .filter((p) => !p.startsWith('welcome/'))
  // **و`CNAME` ليس ملفَّ تطبيق**: سطرٌ واحد يقرؤه GitHub Pages عند النشر ليعرف
  // نطاقَنا (`calc.mishkat.qa`) — لا يطلبه متصفّحٌ ولا يخدم طفلاً، فخزنُه في القشرة
  // خزنُ ورقةِ شحنٍ مع البضاعة. ويُحرَس حيث يعمل: على المنشور في `check_live.py`.
  .filter((p) => p !== 'CNAME')
  .filter((p) => p !== 'sw.js');

const forgotten = wanted.filter((p) => !shell.includes(p));
ok(forgotten.length === 0,
  `قائمة SHELL تشمل كل ملفات التطبيق (${wanted.length} ملفاً)`
  + (forgotten.length ? ` — نُسي: ${forgotten.join('، ')}` : ''));

const phantom = shell.filter((p) => !has(p));
ok(phantom.length === 0,
  `ولا تعِد بملف غير موجود${phantom.length ? ' — ' + phantom.join('، ') : ''}`);
ok(sw.includes("'./'") && /index\.html/.test(sw), 'وتشمل جذر التطبيق وصفحته');

const inShell = shell.filter((p) => p.startsWith('welcome/'));
ok(inShell.length === 0,
  `ولا تشمل الصفحة التعريفية (خارج القشرة عمداً)${inShell.length ? ' — دخلت: ' + inShell.join('، ') : ''}`);

// كل وحدة جافاسكربت مستوردة فعلاً من شجرة `main.js` (لا ملف ميت في القائمة)
//
// **والاستيرادُ لأثره استيراد** (إصلاحُ الجلسة ٣ — `SEED.md §٩`): وحدةُ التمارين
// تُحمَّل لتسجّل شاشاتِها في السجلّ (`import './quantity.js';` بلا `from`)، وكان
// التعبيرُ يقرأ `from` وحدَه فيَعُدّ الحيَّ ميتاً — بلاغٌ كاذب لا فحصٌ ساقط. والحارسُ
// بعد الإصلاح **أدقُّ لا أرخى**: ملفٌّ لا يستورده أحدٌ يبقى مكشوفاً كما كان.
const modules = onDisk.filter((p) => p.startsWith('js/'));
const reachable = new Set(['js/main.js']);
for (let changed = true; changed;) {
  changed = false;
  for (const mod of [...reachable]) {
    for (const m of read(mod).matchAll(/(?:from|import)\s+'\.\/([\w.-]+\.js)'/g)) {
      const path = `js/${m[1]}`;
      if (!reachable.has(path)) { reachable.add(path); changed = true; }
    }
  }
}
const dead = modules.filter((p) => !reachable.has(p));
ok(dead.length === 0,
  `وكل وحدات js مستوردة من شجرة main.js (${modules.length} وحدة)`
  + (dead.length ? ` — ميتة: ${dead.join('، ')}` : ''));

// ————— ٢. الاستراتيجيتان وأحكامُ المخزون —————

console.log('\n— استراتيجيتا الخزن وأحكامُها —');

ok(/AUDIO_RE\s*=\s*\/.*audio.*mp3/.test(sw), 'الأصوات لها مسار خزنٍ خاص (اسمها sha1 نصِّها)');
// اسمُ الملف من نصّه لا من محتواه، فالخزن بالرابط وحده يُبقي جهازاً على صوتٍ قديم
// بعد أي استبدال — والوسمُ ببصمة البايتات هو ما يكسر كاشَ الملف المستبدَل وحدَه.
ok(/\?v=\$\{tags\[\w+\]\}/.test(sw) && sw.includes('dropOtherTags'),
  'والخزن بالرابط الموسوم مع كنس الوسم الأقدم لذلك الملف وحده');
ok(sw.includes("json('audio/versions.json')"), 'وبيانُ بصمات المحتوى مقروء');

// **النسخةُ تُرى** (أمر المالك، ١٣ أغسطس ٢٠٢٦): القشرةُ تجيب عن «ما نسختُك؟»
// واللوحةُ تسألها وتعرضها — فميدانٌ لا يشهد على شيفرةٍ لم تصله. طرفان يُقاسان:
ok(/type\s*===\s*'version'/.test(sw) && sw.includes("{ type: 'version', version: VERSION }"),
  'القشرةُ تجيب عن سؤال النسخة بقيمة VERSION نفسِها');
{
  const parent = read('js/parent.js');
  ok(parent.includes("postMessage({ type: 'version' })") && parent.includes('data-sw-version'),
    'ولوحةُ وليّ الأمر تسأل النسخةَ وتعرضها سطراً');
}
ok(sw.includes('cacheFirst') && sw.includes('staleWhileRevalidate'),
  'واستراتيجيتان: المخزون أولاً للصوت، والتحديث في الخلفية للهيكل');
ok(sw.includes('precacheAudio') && sw.includes("json('audio/manifest.json')"),
  'وخزن الأصوات مشتقّ من الفهرس لا من قائمة يدوية');
ok(sw.includes('precacheEmoji') && sw.includes('emoji/index.json'),
  'وأيقونات الرموز مخزونة من فهرسها لا من قائمة يدوية');
ok(/request\.method !== 'GET'/.test(sw), 'ولا يعترض إلا طلبات GET');
ok(sw.includes('self.location.origin'), 'ولا يمسّ أي مصدر خارجي');
ok(/caches\.delete/.test(sw) && /SHELL_CACHE = `ihsib-shell-\$\{VERSION\}`/.test(sw),
  'ورفع النسخة يمحو مخزون **القشرة** القديم (لا يعلَق طفل على نسخة قديمة)');

// **خفّة التخزين** — العيب المُغلَق في اقرأ: مخزنُ الصوت كان موسوماً بالنسخة، فكلُّ
// تحديثٍ يولّد مخزناً فارغاً ويمحو السابق ⇒ إعادةُ تنزيل الصوت كلِّه على جهاز الطفلة
// في كل حزمة. وطزاجةُ الصوت تحكمها بصمةُ محتواه في الرابط لا اسمُ المخزن.
const audioCacheName = (sw.match(/const AUDIO_CACHE = ([^;]+);/) || [])[1] || '';
ok(!audioCacheName.includes('VERSION') && /^'[^'$]+'$/.test(audioCacheName.trim()),
  `واسمُ مخزن الصوت ثابتٌ لا يحمل النسخة (${audioCacheName.trim() || 'غائب'})`);

const precache = sw.slice(sw.indexOf('async function precacheAudio')).split('\n}\n')[0];
const batch = Number((sw.match(/const AUDIO_BATCH = (\d+);/) || [])[1]);
ok(batch >= 12 && batch <= 16 && /for \(.*AUDIO_BATCH\)/.test(precache) && /\.slice\(/.test(precache),
  `والتخزين المسبق مُدفَّعٌ متتابع (${batch || 'بلا حدّ'} في الدفعة، لا قطيعٌ يخنق الشبكة)`);
ok(/\.keys\(\)/.test(precache) && /filter\(\(url\) => !have\.has\(url\)\)/.test(precache),
  'ولا يُطلَب من الشبكة إلا الناقص (`cache.add` يجلب دائماً وإن كان مخزوناً)');
ok(!/catch\(\(\) => \{\}\)/.test(precache) && /failed \+=/.test(precache)
  && /if \(failed\) return\b/.test(precache),
  'والإخفاقاتُ معدودةٌ لا مبتلعة، وإن وقع إخفاقٌ فلا كنسَ (صيانةً للقديم الصالح)');

ok(/async function audioComplete/.test(sw) && /await audioComplete\(\)/.test(sw),
  'وتمامُ المخزون يُحسب من البيان والمخزن لا من متغيّرٍ في ذاكرة عاملٍ قد يُبعث');
ok(/event\.waitUntil\(healAudio\(\)\)/.test(sw) && /HEAL_AFTER/.test(sw)
  && /if \(healed \|\| syncing\) return;/.test(sw)
  && /if \(await audioComplete\(\)\) return;/.test(sw),
  'وللناقص شفاءٌ — مرّةً في عمر العامل، بعد مهلةٍ تمضي للطفل، ولا يعمل على مخزونٍ تامّ');
ok(/type: 'audio-progress'/.test(sw) && /clients\.matchAll/.test(sw),
  'والعاملُ يبلّغ النوافذَ بتقدّم خزن الصوت (لا يخزّن صامتاً)');
ok(/addEventListener\('message'/.test(sw) && /'audio-sync'/.test(sw),
  'ويقبل طلبَ «نزّل الأصوات الآن» صريحاً بلا انتظار مهلة');

// ————— ٣. ما يفترض بنكاً صوتياً — نائمٌ حتى يُولَّد (الجلسة ص) —————

console.log('\n— الصوت: خزنُ البنك من بيانه —');
if (!AUDIO_READY) {
  dormant('بيانا الصوت في قائمة القشرة، وعددُ المخزون في لوحة وليّ الأمر'
    + ' (`app/audio/manifest.json` غير موجود — الجلسة ص تولّده)');
} else {
  ok(shell.includes('audio/manifest.json') && shell.includes('audio/versions.json'),
    'بيانا الصوت من ملفات الهيكل (فيُقرآن دون إنترنت)');
  const generated = JSON.parse(read('audio/manifest.json'));
  ok(Object.keys(generated).length > 0, `والبنك فيه ${Object.keys(generated).length} ملفاً`);
  const panel = read('js/parent.js');
  ok(read('js/progress.js').includes('export async function audioStored')
    && panel.includes('progress.audioStored()') && panel.includes('الأصوات المخزونة'),
    'وعددُ المخزون معروضٌ في لوحة وليّ الأمر (فلا يفاجئه صمتٌ لا يعرف سببه)');
  ok(/audio-progress/.test(panel) && /audio-sync/.test(panel) && /dl-bar/.test(panel),
    'ولوحةُ وليّ الأمر تعرض شريطاً حيّاً وزرَّ تحميلٍ يدويّ');
}

// ————— ٤. بيان التطبيق —————

console.log('\n— بيان التطبيق وأيقوناته —');

ok(manifest.name && manifest.short_name, `اسم التطبيق: ${manifest.short_name}`);
ok(manifest.lang === 'ar' && manifest.dir === 'rtl', 'ولغته عربية واتجاهه من اليمين');
ok(manifest.display === 'standalone', 'ويُفتح كتطبيق مستقلّ (لا شريط متصفّح يشتّت الطفل)');
ok(manifest.start_url === './' && manifest.scope === './',
  'ومساره نسبيّ (يعمل من أي مجلد على أي خادم)');
ok(manifest.icons.length >= 3, `وله ${manifest.icons.length} أيقونات`);
ok(manifest.icons.some((i) => i.purpose === 'maskable'),
  'منها مقنَّعة (maskable) لأيقونة أندرويد المستديرة');

const png = (path) => {
  const data = readFileSync(new URL(path, APP));
  if (data.length < 24 || data.readUInt32BE(0) !== 0x89504e47) return null;
  return [data.readUInt32BE(16), data.readUInt32BE(20)];
};
for (const icon of manifest.icons) {
  const [w] = png(icon.src) || [];
  ok(String(w) === icon.sizes.split('x')[0], `${icon.src}: ملف PNG بمقاس ${icon.sizes}`);
}
ok(!!png('icons/apple-touch-icon.png'), 'وأيقونة آيفون/آيباد موجودة');

// ————— ٥. الوصل في الصفحة والتسجيل في الشيفرة —————

console.log('\n— الصفحة والتسجيل —');

const html = read('index.html');
ok(/rel="manifest"/.test(html), 'الصفحة توصل البيان (rel="manifest")');
ok(/apple-touch-icon/.test(html), 'وأيقونة آبل موصولة');
ok(/theme-color/.test(html) && html.includes(manifest.theme_color),
  `ولون الواجهة موحَّد بين الصفحة والبيان (${manifest.theme_color})`);
ok(/lang="ar"/.test(html) && /dir="rtl"/.test(html), 'والصفحة عربيةٌ من اليمين');

const main = read('js/main.js');
ok(main.includes('serviceWorker') && main.includes('sw.js'), 'وmain.js يسجّل عامل الخدمة');
ok(main.includes("location.protocol.startsWith('http')"),
  'ولا يحاول التسجيل من file:// (يرفضه المتصفّح فيلوّث السجلّ)');
ok(/\.catch\(/.test(main.slice(main.indexOf('registerServiceWorker'))),
  'ورفضُ التسجيل لا يُسقِط التطبيق');

// **وقشرةٌ جديدة تتفعّل والصفحةُ مفتوحة تُعلِن نفسَها** (الجلسة ١٠·أ — تتمةُ أمر
// المالك في بلاغ `version-visibility`): وهذا الطرفُ الثالث بعد «القشرةُ تجيب»
// و«اللوحةُ تعرض». **وحدودُه محروسةٌ كنصّه**: لا إعادةَ تحميلٍ تلقائية تخطف تمريناً
// من يد طفل، ولا إشعارَ على شاشة درس (المواضعُ الهادئة معلَنة)، وأولُ تولٍّ يُبتلَع
// فلا يُقال «وصل تحديث» لمن فتح التطبيق أوّلَ مرّة.
{
  const watch = main.slice(main.indexOf('function watchShellUpdate'));
  ok(main.includes("'controllerchange'") && main.includes('watchShellUpdate()'),
    'وتفعُّلُ قشرةٍ جديدة يُلتقَط (`controllerchange`) والحارسُ موصولٌ عند الإقلاع');
  ok(/if \(!controlled\) \{ controlled = true; return; \}/.test(watch),
    'وأولُ تولٍّ يُبتلَع (تثبيتٌ لا تحديث) — فلا يُشعَر به من فتح التطبيق أوّلَ مرّة');
  ok(main.includes('UPDATE_TEXT') && main.includes('وَصَلَ تَحْدِيثٌ'),
    'وإشعارُه سطرٌ يُقرأ («وَصَلَ تَحْدِيثٌ — أَغْلِقْ وَافْتَحْ»)');
  ok(!/location\.reload|window\.location\.reload/.test(main),
    '**ولا إعادةَ تحميلٍ تلقائية** — تخطف تمريناً من يد الطفل (الإشعارُ يخبر ولا يفعل)');
  const paint = main.slice(main.indexOf('function paintUpdateNote'), main.indexOf('function watchShellUpdate'));
  ok(/CALM\.has\(here\)/.test(paint) && /const CALM = new Set\(\['', 'parent'\]\)/.test(main),
    'ولا يُرسَم إلا في موضعٍ هادئ (الخريطة أو لوحة وليّ الأمر) — لا على شاشة تمرين');
  ok(/paintUpdateNote\(\);\s*\/\//.test(main.slice(main.indexOf('app.replaceChildren'))),
    'ويُراجَع عند كل توجيهٍ — فيغيب بالدخول إلى الدرس ويعود بالخروج منه');
  ok(!/class: 'update-note'[^)]*onclick/.test(main) && /\.update-note\s*{/.test(read('css/app.css')),
    'وهو سطرٌ في مجرى الصفحة بلا زرٍّ ولا فعل (لا يحجب ولا يُنقَر)');
}

// ————— ٦. المقياس: قرصةُ الطفل حرة، والعودةُ من الخلفية بمقياس ١ —————
//
// **وهذا الحارسُ كان يحرس القفلَ فقُلب** (الجلسة م٣، `read@7f18bf0`): بلاغان ميدانيان
// متعاقبان من اقرأ. الأولُ — iPadOS يسترجع المثبَّت من الخلفية **مكبَّراً** أحياناً
// (عيبُ منصةٍ معروف) والنقرُ المزدوج من طفلٍ يكبّر — فنُقل قفلُ الميتا الشامل في م٢.
// **والثاني نقضه**: الطفل كان يكبّر الصفحة بالقرصة ليرى جيداً («أمرٌ مريح وتلقائي»)
// والقفلُ حرمه إياها — تحويطٌ أوسعُ من عيبه، وافتراضُ «حروفُه كبيرةٌ فلا حاجة» أسقطه
// الميدان. فالعقدُ الآن: **لا قفلَ في الميتا** (القرصةُ حق)، والعودةُ للواجهة تشدّ
// المقياسَ إلى ١ لحظةً ثم تردّ الحرية (`resetZoom`)، والنقرُ المزدوج العارضُ وحدَه
// ساقطٌ باللوح. **وهذا القلبُ نفسُه هو القاعدة: بلاغُ الميدان فوق الحارس** — الحارسُ
// يحرس عقداً قائماً، فإذا نقض الميدانُ العقدَ قُلب الحارسُ ولم يُحوَّط حوله.
//
// **ويُحرَس من الجهتين**: الحريةُ والشدّةُ معاً — فحارسٌ يحرس إحداهما وحدَها يمرّ
// أخضرَ على شيفرةٍ تركت الطفلَ في شاشةٍ كُبِّرت، أو على أخرى ردّت القفلَ من بابٍ آخر.

console.log('\n— المقياس: قرصةُ الطفل حرة، والعودةُ من الخلفية تُرجِعه ١ —');

const viewport = (html.match(/<meta name="viewport" content="([^"]+)"/) || [])[1] || '';
ok(!/maximum-scale|user-scalable/.test(viewport),
  'ميتا التطبيق **لا تقفل المقياس** — قرصةُ الطفل ليرى جيداً حقٌّ (بلاغُ الميدان الناقض)');

// **وعلى `html` لا أينما وقع** (تكييفٌ عن نسخة اقرأ): عندنا `touch-action: manipulation`
// مكتوبةٌ أصلاً على `button` منذ البذرة، فمطابقةٌ على اللوح كلِّه تمرّ خضراءَ بها
// **والجذرُ عارٍ** — والنقرُ المزدوج على كمّيةٍ أو خلفيةٍ يكبّر. فيُقرأ نصُّ قاعدة
// `html` وحدَها: حارسٌ يمرّ بما لا يحرسه ليس حارساً.
const rootRule = (read('css/app.css').match(/(?:^|\n)html\s*\{([^}]*)\}/) || [])[1] || '';
ok(/touch-action:\s*manipulation/.test(rootRule),
  'واللوحُ يُسقِط تكبيرَ النقر المزدوج **العارضَ وحدَه** على الجذر (`html`) — والقرصةُ لا تُمَسّ');

ok(main.includes('meta[name="viewport"]') && main.includes('pageshow')
  && /visibilitychange[\s\S]{0,300}resetZoom/.test(main)
  && /resetZoom[\s\S]{0,400}maximum-scale=1/.test(main)
  && /setTimeout\([\s\S]{0,120}viewportFree\)/.test(main),
'**والعودةُ من الخلفية تشدّ المقياسَ إلى ١ لحظةً ثم تردّ الحرية** — علاجُ الاسترجاع في موضعه وحدَه');

// **الجهةُ الأخرى نائمةٌ حتى تُولَد** (`docs/SEED.md §٥`): `app/welcome/` من الجلسة ٩،
// ولا صفحةَ تعريفٍ اليوم تُعفى. والشرطُ مجرودٌ لا مضبوطٌ بيد — يومَ تُكتب أولاها
// يستيقظ الحارسُ من تلقائه ويطالب بإعفائها.
const welcome = has('welcome/') ? readdirSync(new URL('welcome/', APP)).filter((f) => f.endsWith('.html')) : [];
if (!welcome.length) {
  dormant('وصفحاتُ التعريف خارج القفل (لا `app/welcome/` بعد — الجلسة ٩ تكتبها)');
} else {
  for (const page of welcome) {
    ok(!/user-scalable=no|maximum-scale/.test(read(`welcome/${page}`)),
      `welcome/${page}: تبقى قابلةً للتكبير — صفحةُ كبارٍ والتكبيرُ فيها حقّ`);
  }
}

console.log(fails
  ? `\n${fails} فشل`
  : `\nكل اختبارات العمل دون إنترنت ناجحة${asleep ? ` (و${asleep} نائم بقيدٍ في docs/SEED.md)` : ''}`);
process.exit(fails ? 1 : 0);
