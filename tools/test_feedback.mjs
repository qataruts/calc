// **حارسُ «بلِّغنا»** (الجلسة غ — أمر المالك، ١٥ أغسطس ٢٠٢٦):
//   node tools/test_feedback.mjs
// يحرس: app/js/**
//   (البابُ ووحدتُه المستقلة، وقناتاه، وصفرُ شبكةٍ من التطبيق نفسِه)
//
// ————— منقولٌ من «اِقْرَأْ» بالتزامٍ مبصوم (`SEED.md §٦`) ومكيَّف —————
//
// المحروسُ ثلاثة: **البابُ في لوحة وليّ الأمر وحدَها** (لا زرَّ في شاشة طفل)،
// **والقناتان** واتساب بالرقم المعتمد وبريدُ العائلة المرجع، **وصفرُ شبكةٍ من
// التطبيق نفسِه** (روابطُ `<a>` تُفتح ولا تُجلَب).
//
// **ودرسُ الفصل يُحرَس بنيوياً لا وعداً**: العنوانُ الخارجيُّ في `feedback.js` وحدَها،
// وسائرُ الشجرة صفرُ عناوين — فيوم يدخل «اِحْسِبْ» ما يخصّ الطفل (صوتٌ أو قلم) يجد
// الفصلَ قائماً، ولا يُطلَب من أحدٍ أن يتذكّره. وهو عينُ ما دُفع ثمنُه أحمرَ في اقرأ.

import { readFileSync, readdirSync } from 'node:fs';

const APP = new URL('../app/', import.meta.url);
const read = (p) => readFileSync(new URL(p, APP), 'utf8');
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  ✗', m); } else console.log('  ✓', m); };

const parent = read('js/parent.js');
const feedback = read('js/feedback.js');

ok(feedback.includes("'97433882806'") && feedback.includes('wa.me/${WHATSAPP}'),
  'واتساب بالرقم المعتمد (+974 3388 2806)');
ok(feedback.includes("'info@mishkat.qa'") && feedback.includes('mailto:${EMAIL}'),
  'والبريدُ المرجع info@mishkat.qa');
ok(/feedbackSection\(\)/.test(parent) && /from '\.\/feedback\.js'/.test(parent)
  && feedback.includes('بلِّغنا'),
  'وقسمُ «بلِّغنا» في لوحة وليّ الأمر');
// **بابُ التكييف** (سنّةُ `test_install` الرابع): المنقولُ يُكيَّف بنصوصنا — فلا يُرسِل
// طفلُنا بلاغاً باسم أخيه. والشِّعرُ في الترويسة يُنحّى: يُقاس **ما يُرسَل** لا ما يُشرَح.
const code = feedback.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
ok(code.includes('تطبيق اِحْسِبْ') && !/اقرأ|اِقْرَأْ/.test(code),
  'وسياقُ الرسالة باسم تطبيقنا (لا اسمُ أخيه فيما يُرسَل)');
ok(!/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|new Image/.test(feedback),
  'والوحدةُ لا تعرف الشبكة — روابطُ فتحٍ لا جلب');

// **ولا يمرّ بها ما يخصّ الطفل**: لا سجلَّ تقدّمٍ ولا مخزنَ جهاز — فسياقُ الرسالة
// اسمُ التطبيق وقشرتُه، ولا سبيلَ لتسرّبِ نجمةٍ ولا مهارةٍ من حيث لا يُقصَد.
ok(!/progress\.js|localStorage|indexedDB/.test(feedback),
  'ولا تعرف سجلَّ الطفل — لا تقدّمَ ولا مخزنَ جهاز');

// **الفصلُ بنيويّ**: العنوانُ الخارجيُّ في وحدته وحدَها — وسائرُ وحدات `js/` صفر.
for (const mod of readdirSync(new URL('js/', APP)).filter((f) => f.endsWith('.js')).sort()) {
  if (mod === 'feedback.js') continue;
  const src = read(`js/${mod}`);
  ok(!/https?:\/\//.test(src) && !src.includes('wa.me') && !src.includes('mailto:'),
    `js/${mod}: صفرُ عناوينَ خارجية — لا بابَ بلاغٍ خارج وحدته`);
}

console.log(fails ? `\n${fails} فشل` : '\nكل اختبارات «بلِّغنا» ناجحة');
process.exit(fails ? 1 : 0);
