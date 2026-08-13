// حارسُ بابِ التثبيت (`app/js/install.js`):
//   node tools/test_install.mjs
// يحرس: app/js/install.js app/js/main.js app/css/app.css app/sw.js app/welcome/**
//   (بابُ التثبيت ونصوصُه، وإعفاءُ المعاينة، وموضعُه من القشرة والتعريفيّ)
//
// **منقولٌ من اقرأ بجدوله** (`read@260bf48:tools/test_install.mjs`) ومكيَّفٌ لـ«اِحْسِبْ»:
// جدولُ الحالات هو هو (منطقُ المنصّات لا يتبدّل باسم التطبيق)، وزيدت عليه أبوابُ
// التكييف — نصوصُ الشريط باسمنا، ومفتاحُ التخزين بسابقتنا، والإعفاءُ في المعاينة.
//
// والمحروسُ أربعة:
//   ١) **الرسالةُ الصحيحة لكل جهاز** — قرارُ العرض دالّةٌ نقيّة تُفحَص بجدول حالات:
//      زرٌّ حقيقيّ حيث يُمسَك حدثُ التثبيت، وخطوتا سفاري على iOS، وصمتٌ حيث لا طريق.
//   ٢) **لا يظهر في التطبيق المثبَّت** — `standalone` يُسكِته، و`appinstalled` يُسكِته
//      أبداً، والإغلاقُ يُسكِته أسبوعاً (فلا يصير الشريطُ إزعاجاً يعلّم تجاهلَه).
//   ٣) **بنيوياً**: الوحدةُ لا تعرف الشبكة، ومركَّبةٌ في القشرة والموجّه، ومعفاةٌ في
//      وضع المعاينة، ولا يمسّ المرجعَ التعريفيّ (صفرُ جافاسكربت فيه عهدٌ قائم).
//   ٤) **التكييف**: لا يُنادي الشريطُ التطبيقَ باسم أخيه، ولا يكتب في مفتاح أخيه.

import { readFileSync } from 'node:fs';

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };

const { installState } = await import('../app/js/install.js');

console.log('\n١. الرسالةُ الصحيحة لكل جهاز (جدول الحالات)');

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ipadDesktopUA: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1',
  macDesktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  androidChrome: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
};
const base = { standalone: false, touchPoints: 0, promptReady: false, memo: {}, now: 1000000000000 };
const at = (over) => installState({ ...base, ...over });

ok(at({ standalone: true, promptReady: true }) === 'hidden',
  'التطبيقُ المثبَّت (standalone): لا شريطَ أبداً — ولو كان الحدثُ جاهزاً');
ok(at({ memo: { installed: true }, promptReady: true }) === 'hidden',
  'وبعد appinstalled: صمتٌ دائم');
ok(at({ ua: UA.androidChrome, promptReady: true, touchPoints: 5 }) === 'button',
  'أندرويد/كروم والحدثُ مُمسَك: زرُّ «ثبّت الآن» الحقيقيّ');
ok(at({ ua: UA.iphoneSafari, touchPoints: 5 }) === 'ios',
  'آيفون سفاري: خطوتا المشاركة والإضافة');
ok(at({ ua: UA.ipadDesktopUA, touchPoints: 5 }) === 'ios',
  'آيباد iPadOS (يتنكّر بهيئة Macintosh): يفضحه تعدّدُ اللمس ⇒ خطوتا سفاري');
ok(at({ ua: UA.iphoneChrome, touchPoints: 5 }) === 'ios-other',
  'كروم على آيفون: «افتح في سفاري أولاً» — فالتثبيتُ على iOS منه وحدَه');
ok(at({ ua: UA.macDesktop, touchPoints: 0 }) === 'hidden',
  'حاسوبُ ماك بلا حدثٍ ولا لمس: صمتٌ — لا نعِد بما لا نملك طريقَه');
ok(at({ ua: UA.androidChrome, touchPoints: 5 }) === 'hidden',
  'أندرويد قبل أن يجهز الحدث: صمتٌ لا تعليماتٌ يدوية تسبق الزرّ');

console.log('\n٢. الرقادُ بعد الإغلاق — أسبوعٌ ثم عودةٌ لطيفة');

const DAY = 86400000;
ok(at({ ua: UA.iphoneSafari, touchPoints: 5, memo: { dismissedAt: base.now - 3 * DAY } }) === 'hidden',
  'أُغلق قبل ٣ أيام: ما زال راقداً');
ok(at({ ua: UA.iphoneSafari, touchPoints: 5, memo: { dismissedAt: base.now - 8 * DAY } }) === 'ios',
  'وبعد ٨ أيام: يعود بلطف');
ok(at({ promptReady: true, memo: { dismissedAt: base.now - 8 * DAY } }) === 'button',
  'والزرُّ كذلك يعود بعد رقاده');

console.log('\n٣. البنية');

const src = readFileSync(new URL('../app/js/install.js', import.meta.url), 'utf8');
ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(src),
  'الوحدةُ لا تعرف الشبكة — عرضٌ وقرارٌ محليان صرفان');
ok(/beforeinstallprompt/.test(src) && /preventDefault/.test(src) && /appinstalled/.test(src),
  'وتُمسك حدثَ التثبيت وتصغي لنجاحه');

const mainSrc = readFileSync(new URL('../app/js/main.js', import.meta.url), 'utf8');
ok(/if \(!progress\.PREVIEW\) install\.mount\(\);/.test(mainSrc),
  'ومركَّبةٌ في الموجّه — ومعفاةٌ في وضع المعاينة');

const swSrc = readFileSync(new URL('../app/sw.js', import.meta.url), 'utf8');
ok(swSrc.includes("'js/install.js'"),
  'وفي قشرة عامل الخدمة — فالشريطُ يعمل دون إنترنت كسائر التطبيق');

const welcome = readFileSync(new URL('../app/welcome/index.html', import.meta.url), 'utf8');
ok(!/install\.js/.test(welcome),
  'والمرجعُ التعريفيّ لم تلمسه — صفرُ جافاسكربت فيه عهدٌ قائم');

console.log('\n٤. التكييف — شريطُنا باسمنا وفي مفتاحنا');

/* **ولا يُنادى التطبيقُ باسم أخيه**: النقلُ من اقرأ نسخٌ لبنيةٍ لا لهوية، ونصٌّ
   منسيٌّ يقول «اِقْرَأْ» على شاشة «اِحْسِبْ» عيبٌ لا يمسكه جدولُ الحالات.
   **والمقيسُ ما يُعرَض لا ما يُشرَح**: التعليقُ في رأس الملفّ يذكر المصدرَ باسمه
   وبصمته — وذاك عهدُ النقل (`SEED.md`) لا خرقُه. فتُنزَع التعليقاتُ قبل القياس. */
const shown = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
ok(shown.includes('«اِحْسِبْ»') && !shown.includes('اِقْرَأْ'),
  'نصوصُ الشريط باسم «اِحْسِبْ» — ولا أثرَ لاسم أخيه فيما يُعرَض');
// **ولا يكتب في مفتاح أخيه**: التطبيقان قد يجتمعان على نطاقٍ واحد أو جهازٍ واحد،
// فمفتاحٌ مشترك يجعل إغلاقَ شريطٍ هنا يُسكِت شريطاً هناك.
ok(/const KEY = 'ihsib\.[^']+'/.test(src) && !src.includes('muallim'),
  'ومفتاحُ التخزين بسابقة `ihsib` (لا يتشارك التطبيقان مفتاحاً)');
// وأسماءُ الأزرار التي وعد بها المرجعُ التعريفيّ موجودةٌ في الشريط نفسِه
const guide = readFileSync(new URL('../app/welcome/guide.html', import.meta.url), 'utf8');
ok(src.includes('ثبّت الآن') && guide.includes('ثبّت الآن'),
  'و«ثبّت الآن» موعودٌ في الدليل وموجودٌ بنصّه في الشريط');
ok(/\.install-bar\s*{/.test(readFileSync(new URL('../app/css/app.css', import.meta.url), 'utf8')),
  'وللشريط تنسيقُه في لوح التطبيق (لا لونَ يكتبه بيده)');

console.log(fails ? `\n${fails} فشل` : '\nكل اختبارات باب التثبيت ناجحة');
process.exit(fails ? 1 : 0);
