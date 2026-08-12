// **سائقُ السَّوقة** — «فحصٌ لا يُشغَّل ليس حارساً»، ويشمل الحرّاسَ أنفسَهم:
//   node tools/guards.mjs             # يجرد الحرّاسَ كلَّهم ويشغّلهم
//   node tools/guards.mjs --list      # الجردُ وحدَه (لا يشغّل شيئاً)
//   node tools/guards.mjs --browser   # ومعهم سَوقةُ المتصفّح (تحتاج Chrome وخادماً)
//
// ————— العلّة (حكمُ المدير — مراجعة م٢، البند ٣) —————
//
// `test_selftests.mjs` جرد **الأدوات** التي تُعلن فحصاً ذاتياً وشغّلها، فما عاد فحصٌ
// ذاتيّ يرثّ صامتاً. وبقي بابٌ مفتوح: **الحرّاسُ أنفسُهم لا يشغّلهم شيء** — تسعةٌ منهم
// أخوةُ `test_pwa` و`check_range`، يُشغَّلون بيدٍ في بند كل جلسة. وعبارةُ «شغّل فحوص
// الجلسات كلها» **عادةٌ تُنسى** لا أمرٌ يُنفَّذ: يكفي أن يسهو أحدٌ عن حارسٍ واحد فيمرّ
// عيبٌ كان مقيساً. وحارسٌ يُنسى تشغيلُه أخو الفحص المُطفأ بيد سواءً بسواء.
//
// ————— الجردُ بالنمط لا بالقائمة —————
//
// **لا قائمةَ أسماءٍ في هذا الملفّ**: يُجرَد `tools/` بأنماط تسميته الثابتة —
// `test_*.mjs` (حرّاسُ العقود) و`check_*.py` و`check_*.mjs` (فاحصو المحتوى والرسم
// والنطق). فحارسٌ جديد يُكتب غداً **يدخل السَّوقة يومَ يُكتب** بلا سطرٍ يُضاف هنا ولا
// انتباهٍ يُرجى — وهو عينُ ما فعله `test_selftests` بالأدوات.
//
// **والاستثناءُ الذاتيّ بنيويّ لا بقائمة**: اسمُ هذا الملفّ (`guards.mjs`) **لا يوافق
// نمطاً من الثلاثة**، فلا يجد نفسَه في جرده أصلاً — ولو أُعيدت تسميتُه يوماً إلى
// `check_*.mjs` لأسقطه فلترُ المسار (`import.meta.url`) فلا يقع الدَّور بحال.
//
// ————— وما لا يبلغه النمط يُسمّى، ولا يُسكَت عنه —————
//
// سَوقةُ المتصفّح (`browser_*.py`) خارج الأنماط الثلاثة بحكم اسمها، وهي فوق ذلك تحتاج
// **Chrome وخادماً ومنفذاً حرّاً** فلا تُشغَّل في كل بيئة. فتُجرَد بنمطها وتُذكَر
// **باسمها** في كل تشغيل: أُشغِّلت أو تُركت — فلا يقرأ أحدٌ «كلُّها خضراء» وفي الظلّ
// حارسٌ لم يُسأل. وتُشغَّل بـ`--browser`.

// ————— وحارسُ الشبكة يُعلن نفسَه، ولا يُستثنى بقائمة (الجلسة ٩) —————
//
// `check_live.py` يفحص **المنشور** لا القرص: يحتاج شبكةً وموقعاً منشوراً، والسَّوقةُ
// تعمل بلا إنترنت وقبل النشر. فلو شُغِّل كإخوته لاحمرّ دائماً حتى يُنشَر — وحارسٌ
// أحمرُ دائماً حارسٌ يُتجاهَل. **ولا يُستثنى باسمه هنا** (فذلك بابُ إطفاءٍ بيد يُفتَح
// لغيره غداً)، بل **يُعلن الحارسُ نفسُه** في رأسه سطرَ `سَوقة: --self-test` فتُشغِّله
// السَّوقةُ بفحصه الذاتي — وهو فحصٌ حقيقيّ بلا شبكة (أقائمةُ الصفحات مشتقّةٌ؟ أموجودةٌ
// أصولُها؟ أما زال النشرُ عند الدفع؟). **ويبقى فحصُه الحيّ واجبَ ما بعد النشر**،
// يُشغَّل باسمه في بند الجلسة ويُقيَّد جوابُه.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const TOOLS = new URL('./', import.meta.url);
const SELF = fileURLToPath(import.meta.url);
const path = (name) => fileURLToPath(new URL(name, TOOLS));

/** أنماطُ الحرّاس — **هي الجرد**، ولا اسمَ حارسٍ مكتوبٌ في هذا الملفّ. */
const PATTERNS = [/^test_.*\.mjs$/, /^check_.*\.py$/, /^check_.*\.mjs$/];
/** سَوقةُ المتصفّح: تُجرَد بنمطها وتُشغَّل بـ`--browser` (Chrome وخادمٌ ومنفذ). */
const BROWSER = /^browser_.*\.py$/;

const LIST = process.argv.includes('--list');
const WITH_BROWSER = process.argv.includes('--browser');

const files = readdirSync(TOOLS).sort();
const guards = files.filter((f) => PATTERNS.some((re) => re.test(f)) && path(f) !== SELF);
const browsers = files.filter((f) => BROWSER.test(f) && path(f) !== SELF);

/** ما يُعلنه الحارسُ في رأسه من وسائطَ تُشغَّل بها في السَّوقة (سطرُ `سَوقة: …`). */
const declared = (name) => {
  const head = readFileSync(path(name), 'utf8').slice(0, 4000);
  const line = /سَوقة:\s*(--[\w-]+)/.exec(head);
  return line ? [line[1]] : [];
};

/** أمرُ تشغيل حارسٍ: بايثون لِـ`.py` وnode لِـ`.mjs` — والسائقُ لا يعرف حارساً بعينه. */
const runner = (name) => (name.endsWith('.py')
  ? { cmd: 'python3', args: [path(name), ...declared(name)] }
  : { cmd: process.execPath, args: [path(name), ...declared(name)] });

console.log(`\n— جردُ السَّوقة: ${guards.length} حارساً بأنماطهم `
  + `(${PATTERNS.map((re) => re.source.replace(/[\\^$]|\.\*/g, (m) => (m === '.*' ? '*' : '')))
    .join(' · ')}) —`);
for (const name of guards) console.log(`  · ${name}`);
console.log(browsers.length
  ? `  ${WITH_BROWSER ? '▶' : '·'} سَوقةُ المتصفّح: ${browsers.join('، ')} — `
    + `${WITH_BROWSER ? 'تُشغَّل الآن' : '**لم تُشغَّل** (تحتاج Chrome وخادماً — أضِف `--browser`)'}`
  : '  · لا سَوقةَ متصفّحٍ في العدّة');

if (LIST) process.exit(0);

const jobs = [
  ...guards.map((name) => ({ name, ...runner(name), args: runner(name).args })),
  /* سَوقةُ المتصفّح ثلاثاً: الفحوصُ · مقاساتُ الآيباد الخمسة (`--device`) · والمرجعُ
     التعريفيّ (`--welcome`). **والثالثةُ نائمةٌ حتى يوجد ما تقيسه**: إن لم يكن في
     الشجرة `app/welcome/` لم تُشغَّل — فلا تُطفأ بيد ولا تحمرّ على غياب. */
  ...(WITH_BROWSER ? browsers.flatMap((name) => [
    { name, ...runner(name) },
    { name: `${name} --device`, cmd: 'python3', args: [path(name), '--device'] },
    ...(existsSync(new URL('../app/welcome/index.html', TOOLS))
      ? [{ name: `${name} --welcome`, cmd: 'python3', args: [path(name), '--welcome'] }]
      : []),
  ]) : []),
];

console.log(`\n— التشغيل: ${jobs.length} أمراً، ويلزمها الأخضر —`);
const failed = [];
const started = Date.now();

for (const job of jobs) {
  const at = Date.now();
  const run = spawnSync(job.cmd, job.args, { encoding: 'utf8', timeout: 900000 });
  const secs = ((Date.now() - at) / 1000).toFixed(1);
  const out = `${run.stdout || ''}\n${run.stderr || ''}`;
  // حصيلةُ الحارس: آخرُ سطرٍ في **تقريره** (`stdout`) — كلُّ حرّاسنا يختمون بجملة.
  // (وتحذيراتُ المحاكاة تخرج في `stderr` فلا تُقرأ حصيلةً كاذبة.)
  const tail = (run.stdout || '').split('\n').map((l) => l.trim()).filter(Boolean).pop() || '';
  const bad = run.status !== 0;
  if (bad) failed.push(job.name);
  console.log(`  ${bad ? '✗' : '✓'} ${job.name} (${secs}ث) — ${tail}`);
  if (bad) {
    for (const line of out.split('\n').filter((l) => l.includes('✗')).slice(0, 6)) {
      console.log(`      ${line.trim()}`);
    }
    if (run.error) console.log(`      ${run.error.message}`);
  }
}

const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log(failed.length
  ? `\n${failed.length} حارساً أحمر من ${jobs.length} (${secs}ث): ${failed.join('، ')}`
  : `\nالسَّوقةُ كلُّها خضراء — ${jobs.length} حارساً في ${secs}ث`
    + `${WITH_BROWSER || !browsers.length ? '' : ' (وسَوقةُ المتصفّح لم تُشغَّل — `--browser`)'}`);
process.exit(failed.length ? 1 : 0);
