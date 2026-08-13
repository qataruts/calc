// **سائقُ السَّوقة** — «فحصٌ لا يُشغَّل ليس حارساً»، ويشمل الحرّاسَ أنفسَهم:
//   node tools/guards.mjs             # يجرد الحرّاسَ كلَّهم ويشغّلهم
//   node tools/guards.mjs --list      # الجردُ وحدَه (لا يشغّل شيئاً)
//   node tools/guards.mjs --list --json  # الجردُ بمادّة كلِّ حارسٍ (لحارس الحرّاس)
//   node tools/guards.mjs --touched   # ما يحرس ما لُمس وحدَه، ويسمّي ما تخطّى ولِمَ
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

// ————— «فحصٌ بقدر العمل» — **يُشتقّ ولا يُكتب بيد** (الجلسة ع١) —————
//
// أمرُ المالك (بلاغ العائلة `2026-08-13-guard-scope-rule.md`): «فحصٌ بقدر العمل لا
// أكثر بحسب الجلسة… **الفحوصُ الكبرى عند الرفع والنشر فقط**». وشاهدُه عندنا: جلسةُ
// صوتيات صرّفت تسعةَ ملفّاتٍ فمشت السَّوقةُ الرحلةَ كلَّها — ساعةٌ لتسعة ملفّات.
//
// **والتقليمُ لا يكون بقائمةٍ في هذا الملفّ** (تبلى، ويُنسى ما يُضاف إليها كما نُسي
// تشغيلُ الحرّاس أصلاً): بل **كلُّ حارسٍ يعلن مادّتَه** في ترويسته سطراً
// (`يحرس: app/audio/** app/js/audio.js`)، و`--touched` يقابلها بما تغيّر فعلاً
// (`git diff` مقابل `origin/main`، ومعه ما لم يُلتزَم بعد وما لم يُتتبَّع) فيشتقّ
// مَن يُشغَّل. **والافتراضُ يبقى الكلَّ**: بلا `--touched` لا يخفّ شيء.
//
// وثلاثةُ قيودٍ تحرس التقليمَ من أن يصير إطفاءً:
//   • **حارسٌ لُمس ملفُّه يُشغَّل دائماً** (مادّتُه ضمناً نفسُه) — فتعديلُ حارسٍ يُجرّبه.
//   • **ما تُخطّي يُسمّى ولِمَ** في المخرَج، فلا يُقرأ «كلُّها خضراء» على تقليمٍ صامت.
//   • **وتعذُّرُ المقابلة يُلغي التقليم**: لا مستودعَ، أو لا مرجعَ `origin/main`،
//     أو حارسٌ بلا سطر مادّة ⇒ **تُشغَّل الكلُّ** ويُقال السبب. الشكُّ يُوسِّع لا يُضيّق.
//
// **وسَوقةُ المتصفّح تُقلَّم بنطاقاتها** (`--scope`): تُعلن `browser_test.py` مادّةَ كل
// نطاقٍ في ترويسته (`يحرس نطاق audio: …`)، فيُشتقّ منها النطاقُ المطلوب — فتعديلٌ في
// `app/audio/` يقيس الصوتَ ولا يمشي ثلاثاً وستّين عقدة.

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
const JSON_OUT = process.argv.includes('--json');
const WITH_BROWSER = process.argv.includes('--browser');
const TOUCHED = process.argv.includes('--touched');

const files = readdirSync(TOOLS).sort();
const guards = files.filter((f) => PATTERNS.some((re) => re.test(f)) && path(f) !== SELF);
const browsers = files.filter((f) => BROWSER.test(f) && path(f) !== SELF);

const head = (name) => readFileSync(path(name), 'utf8').slice(0, 4000);

/** ما يُعلنه الحارسُ في رأسه من وسائطَ تُشغَّل بها في السَّوقة (سطرُ `سَوقة: …`). */
const declared = (name) => {
  const line = /سَوقة:\s*(--[\w-]+)/.exec(head(name));
  return line ? [line[1]] : [];
};

/**
 * **مادّةُ الحارس**: ما يحرسه من الشجرة، مُعلَناً في ترويسته (`يحرس: …`) — وأنماطُه
 * أنماطُ مسارٍ بسيطة (`app/js/**` · `app/css/app.css` · `app/welcome/*.html`).
 *
 * **ونفسُه من مادّته دائماً**: حارسٌ عُدِّل يُجرَّب — وهو أوّلُ ما يلزم تشغيلُه.
 */
const watches = (name) => {
  const line = /^[/# ]*يحرس:\s*(.+)$/m.exec(head(name));
  const globs = line ? line[1].trim().split(/\s+/).filter(Boolean) : [];
  return globs.length ? [...globs, `tools/${name}`] : [];
};

/** مادّةٌ مُعلَنةٌ بأسماءٍ (`يحرس نطاق audio: …` · `يحرس جولة device: …`) — اسمٌ ← أنماطُه. */
const namedWatches = (name, kind) => {
  const out = new Map();
  for (const m of head(name).matchAll(new RegExp(`^[/# ]*يحرس ${kind} ([a-z]+):\\s*(.+)$`, 'gm'))) {
    out.set(m[1], m[2].trim().split(/\s+/).filter(Boolean));
  }
  return out;
};
/** نطاقاتُ الصفحة (تُمرَّر بـ`--scope`) وجولاتُ السَّوقة الأخريان (`--device` · `--welcome`). */
const scopesOf = (name) => namedWatches(name, 'نطاق');
const roundsOf = (name) => namedWatches(name, 'جولة');

/** نمطُ مسارٍ ← تعبيرٌ نمطيّ: `**` يعبر الفواصل، و`*` لا يعبرها. */
const matcher = (glob) => new RegExp(`^${glob
  .split('**').map((part) => part
    .split('*').map((lit) => lit.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*'))
  .join('.*')}$`);

/**
 * ما تغيّر عن المنشور: الفارقُ عن `origin/main` (يشمل الملتزَمَ ولم يُدفَع، وما في
 * الشجرة لم يُلتزَم) **ومعه ما لم يُتتبَّع بعد** — فملفٌّ جديد لم يُضَف بعدُ مادّةٌ
 * تُقاس كأخيه. و`null` تعني «تعذّرت المقابلة» فلا تقليم.
 */
function touchedFiles() {
  const ROOT = fileURLToPath(new URL('../', TOOLS));
  const git = (...args) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  if (git('rev-parse', '--is-inside-work-tree').status !== 0) return { why: 'لا مستودعَ git' };
  const base = git('rev-parse', '--verify', '--quiet', 'origin/main');
  if (base.status !== 0) return { why: 'لا مرجعَ `origin/main` (أجلبتَ من المنشور؟)' };
  const diff = git('diff', '--name-only', 'origin/main');
  const fresh = git('ls-files', '--others', '--exclude-standard');
  if (diff.status !== 0 || fresh.status !== 0) return { why: 'تعذّر جردُ الفارق عن origin/main' };
  const rows = `${diff.stdout}\n${fresh.stdout}`.split('\n').map((l) => l.trim()).filter(Boolean);
  return { files: [...new Set(rows)] };
}

/** أمرُ تشغيل حارسٍ: بايثون لِـ`.py` وnode لِـ`.mjs` — والسائقُ لا يعرف حارساً بعينه. */
const runner = (name) => (name.endsWith('.py')
  ? { cmd: 'python3', args: [path(name), ...declared(name)] }
  : { cmd: process.execPath, args: [path(name), ...declared(name)] });

// **وفحصُ الفاحص قبل كل شيء**: لا يجرد ولا يشغّل — يجرّب اشتقاقَ التقليم بسجلٍّ مصنوع.
if (process.argv.includes('--self-test')) process.exit(selfTest());

if (LIST && JSON_OUT) {
  console.log(JSON.stringify({
    guards: guards.map((name) => ({ name, watches: watches(name), args: declared(name) })),
    browsers: browsers.map((name) => ({ name, scopes: [...scopesOf(name)] })),
  }, null, 2));
  process.exit(0);
}

console.log(`\n— جردُ السَّوقة: ${guards.length} حارساً بأنماطهم `
  + `(${PATTERNS.map((re) => re.source.replace(/[\\^$]|\.\*/g, (m) => (m === '.*' ? '*' : '')))
    .join(' · ')}) —`);
for (const name of guards) console.log(`  · ${name}`);
console.log(browsers.length
  ? `  ${WITH_BROWSER ? '▶' : '·'} سَوقةُ المتصفّح: ${browsers.join('، ')} — `
    + `${WITH_BROWSER ? 'تُشغَّل الآن' : '**لم تُشغَّل** (تحتاج Chrome وخادماً — أضِف `--browser`)'}`
  : '  · لا سَوقةَ متصفّحٍ في العدّة');

if (LIST) process.exit(0);

/**
 * **الخطّة: مَن يُشغَّل ومَن يُتخطّى ولِمَ** — دالّةٌ **خالصة** تأخذ جردَ ما تغيّر
 * (`null` = لا تقليم) وجردَ العدّة، فتُجرَّب **بسجلٍّ مصنوع** بلا تشغيل حارسٍ واحد
 * (`--self-test`) — كما يُجرَّب حارسُ البوابة بسجلّ تقدّمٍ مصنوع.
 *
 * @param {string[]|null} touched ملفاتٌ تغيّرت عن المنشور، أو `null` فلا تقليم
 * @param {{guards:{name:string,watches:string[]}[],
 *          browsers:{name:string,scopes:[string,string[]][]}[]}} fleet جردُ العدّة
 */
export function plan(touched, fleet) {
  const skipped = [];
  const hits = (globs) => !touched
    || globs.some((g) => { const re = matcher(g); return touched.some((f) => re.test(f)); });

  const running = fleet.guards.filter(({ name, watches: globs }) => {
    // **ولا حارسَ بلا سطر مادّة يُقلَّم**: يُشغَّل (وبابُه في `test_selftests`)
    if (!touched || !globs.length || hits(globs)) return true;
    skipped.push({
      name,
      why: `لم يُلمَس ما يحرس (${globs.slice(0, 3).join(' ')}${globs.length > 3 ? ' …' : ''})`,
    });
    return false;
  }).map((g) => g.name);

  /* ونطاقاتُ سَوقة المتصفّح تُشتقّ كما يُشتقّ الحرّاس: نطاقٌ لُمست مادّتُه يُقاس وحدَه،
     وإن لُمست مادّةُ النطاقات كلِّها فالكاملةُ (بلا `--scope` أصلاً)، وإن لم يُلمس منها
     شيءٌ لم تُشغَّل — **وتُسمّى في المتخطَّى**. */
  const browser = [];
  for (const { name, scopes, rounds = [] } of fleet.browsers) {
    const own = [`tools/${name}`, 'tools/browser_test.html'];
    if (!touched || !scopes.length) {
      browser.push({ name, scope: [], rounds: rounds.map(([r]) => r) });
      continue;
    }
    const hot = scopes.filter(([, globs]) => hits([...globs, ...own]));
    const hotRounds = rounds.filter(([, globs]) => hits([...globs, ...own])).map(([r]) => r);
    for (const [round] of rounds) {
      if (!hotRounds.includes(round)) {
        skipped.push({ name: `${name} --${round}`, why: 'لم تُلمس مادّتُها' });
      }
    }
    if (!hot.length) {
      skipped.push({ name: `${name} (البطاريةُ)`, why: 'لم تُلمس مادّةُ نطاقٍ منها' });
      if (hotRounds.length) browser.push({ name, scope: [], rounds: hotRounds, battery: false });
      continue;
    }
    const scope = hot.length === scopes.length ? [] : hot.map(([s]) => s);
    if (scope.length) {
      skipped.push({ name: `${name} (سائرُ النطاقات)`, why: `قِيس منها: ${scope.join('، ')}` });
    }
    browser.push({ name, scope, rounds: hotRounds });
  }
  return { running, skipped, browser };
}

/* ————— التقليم: مَن يحرس ما لُمس؟ (والافتراضُ الكلُّ) ————— */
let pruning = null;                 // ملفاتُ الفارق، أو `null` إن لم يُقلَّم

if (TOUCHED) {
  const found = touchedFiles();
  if (found.why) {
    console.log(`\n— التقليم مُلغىً: ${found.why} — **تُشغَّل الكلُّ** (الشكُّ يُوسِّع) —`);
  } else {
    pruning = found.files;
    console.log(`\n— التقليم: ${pruning.length} ملفاً تغيّر عن \`origin/main\` —`);
    for (const f of pruning.slice(0, 12)) console.log(`  ~ ${f}`);
    if (pruning.length > 12) console.log(`  ~ …و${pruning.length - 12} سواها`);
  }
}

const { running, skipped, browser: browserRuns } = plan(pruning, {
  guards: guards.map((name) => ({ name, watches: watches(name) })),
  browsers: browsers.map((name) => ({
    name, scopes: [...scopesOf(name)], rounds: [...roundsOf(name)],
  })),
});

const jobs = [
  ...running.map((name) => ({ name, ...runner(name), args: runner(name).args })),
  /* سَوقةُ المتصفّح ثلاثاً: الفحوصُ · مقاساتُ الآيباد الخمسة (`--device`) · والمرجعُ
     التعريفيّ (`--welcome`). **والثالثةُ نائمةٌ حتى يوجد ما تقيسه**: إن لم يكن في
     الشجرة `app/welcome/` لم تُشغَّل — فلا تُطفأ بيد ولا تحمرّ على غياب. */
  ...(WITH_BROWSER ? browserRuns.flatMap(({ name, scope, rounds, battery = true }) => [
    ...(battery ? [{
      name: scope.length ? `${name} --scope ${scope.join(',')}` : name,
      cmd: 'python3',
      args: [path(name), ...declared(name), ...(scope.length ? ['--scope', scope.join(',')] : [])],
    }] : []),
    ...(rounds.includes('device')
      ? [{ name: `${name} --device`, cmd: 'python3', args: [path(name), '--device'] }] : []),
    ...(rounds.includes('welcome') && existsSync(new URL('../app/welcome/index.html', TOOLS))
      ? [{ name: `${name} --welcome`, cmd: 'python3', args: [path(name), '--welcome'] }]
      : []),
  ]) : []),
];

/* **وما تُخطّي يُسمّى قبل أن يُشغَّل شيء** — فلا يُقرأ الأخضرُ على أوسعَ مما قِيس.
   (وما تُخطّي من سَوقة المتصفّح لا يُقال إلا إن طُلبت أصلاً — وإلا فسطرُ الجرد أعلاه
   قد قال إنها كلَّها لم تُشغَّل.) */
const announced = skipped.filter((s) => WITH_BROWSER || !browsers.some((b) => s.name.startsWith(b)));
if (announced.length) {
  console.log(`\n— تُخطّي ${announced.length}، وهذه أسماؤها وعللُها —`);
  for (const { name, why } of announced) console.log(`  ⏭ ${name} — ${why}`);
}

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
// **وسطرُ الحصيلة يحمل التقليمَ معه**: «خضراء» على ثلثِ العدّة ليست «خضراء» على كلِّها.
const pruned = announced.length ? ` — وتُخطّي ${announced.length} بأسمائها أعلاه` : '';
console.log(failed.length
  ? `\n${failed.length} حارساً أحمر من ${jobs.length} (${secs}ث): ${failed.join('، ')}${pruned}`
  : `\n${pruning ? 'ما يحرس ما لُمس' : 'السَّوقةُ كلُّها'} خضراء — ${jobs.length} حارساً في ${secs}ث${pruned}`
    + `${WITH_BROWSER || !browsers.length ? '' : ' (وسَوقةُ المتصفّح لم تُشغَّل — `--browser`)'}`);
process.exit(failed.length ? 1 : 0);

/* ————— فحصُ الفاحص: **الاشتقاقُ يُجرَّب بسجلٍّ مصنوع** (الجلسة ع١) —————
 *
 * التقليمُ إن أخطأ **لم يحمرّ شيء**: تُسكَت حرّاسٌ كان يلزم تشغيلُها فيمرّ عيبٌ مقيس.
 * فيُجرَّب `plan` هنا بعدّةٍ مصنوعة وجردِ تغييرٍ مصنوع — وفيه **الحالةُ التي طلبها بندُ
 * الجلسة بحرفها**: تعديلٌ في `app/audio/` يشغّل حرّاسَ الصوت ولا يشغّل بطاريةَ الشاشات.
 */
function selfTest() {
  let bad = 0;
  const check = (cond, msg) => { if (cond) console.log('  ✓', msg); else { bad++; console.log('  ✗', msg); } };

  const FLEET = {
    guards: [
      { name: 'check_speech.mjs', watches: ['app/js/**', 'app/audio/manifest.json', 'tools/check_speech.mjs'] },
      { name: 'test_audio_cache.mjs', watches: ['app/audio/**', 'app/js/audio.js', 'tools/test_audio_cache.mjs'] },
      { name: 'test_identity.mjs', watches: ['app/css/app.css', 'app/fonts/**', 'tools/test_identity.mjs'] },
      { name: 'test_welcome.mjs', watches: ['app/welcome/**', 'tools/test_welcome.mjs'] },
      { name: 'test_bare.mjs', watches: [] },              // حارسٌ نسي سطرَ مادّته
    ],
    browsers: [{
      name: 'browser_test.py',
      scopes: [['map', ['app/css/**']], ['screens', ['app/js/**', 'app/css/**']],
        ['audio', ['app/audio/**', 'app/js/audio.js']]],
      rounds: [['device', ['app/css/**', 'app/js/**']], ['welcome', ['app/welcome/**']]],
    }],
  };
  const of = (touched) => {
    const p = plan(touched, FLEET);
    return { ...p, scope: p.browser[0]?.scope ?? null, rounds: p.browser[0]?.rounds ?? [] };
  };

  console.log('\n— الافتراضُ الكلُّ: بلا جردٍ لا يُقلَّم شيء —');
  const all = of(null);
  check(all.running.length === FLEET.guards.length && !all.skipped.length,
    `بلا تقليمٍ تُشغَّل الحرّاسُ كلُّهم (${all.running.length}) ولا يُتخطّى أحد`);
  check(all.scope?.length === 0, 'وسَوقةُ المتصفّح كاملةٌ بلا `--scope`');

  console.log('\n— **تعديلٌ في `app/audio/`**: حرّاسُ الصوت وحدَهم، ولا بطاريةَ شاشات —');
  const audio = of(['app/audio/6e44956abb70.mp3', 'app/audio/manifest.json']);
  check(audio.running.includes('test_audio_cache.mjs'), 'يُشغَّل حارسُ كاش الصوت');
  check(audio.running.includes('check_speech.mjs'), 'ويُشغَّل حارسُ النطق (فهرسُ البنك مادّتُه)');
  check(!audio.running.includes('test_identity.mjs'), '**ولا يُشغَّل حارسُ الهوية** (لم تُلمس مادّتُه)');
  check(!audio.running.includes('test_welcome.mjs'), 'ولا حارسُ التعريفيّ');
  check(audio.scope?.join() === 'audio',
    `**وسَوقةُ المتصفّح نطاقَ الصوت وحدَه** (وُجد: ${audio.scope?.join('،') || 'لا شيء'})`);
  check(!audio.rounds.length, '**ولا مقاساتِ جهازٍ ولا تعريفيّاً** — ولا واحدةَ منهما مادّتُها الصوت');
  check(audio.skipped.some((s) => s.name === 'test_identity.mjs'),
    'وكلُّ متخطّىً يُسمّى بعلّته (لا تقليمَ صامت)');

  console.log('\n— وتعديلٌ في شاشةٍ يقلب الحكم —');
  const screen = of(['app/js/counting.js']);
  check(screen.scope?.join() === 'screens', 'شاشةٌ لُمست ⇒ نطاقُ الشاشات لا الصوت');
  check(screen.rounds.join() === 'device', 'ومعها مقاساتُ الجهاز (مادّتُها `app/js/**`) دون التعريفيّ');
  check(screen.running.includes('check_speech.mjs') && !screen.running.includes('test_identity.mjs'),
    'ويُشغَّل مَن مادّتُه `app/js/**` وحدَه');

  console.log('\n— ولوحُ الألوان يمسّ نطاقين فيُقاسان معاً —');
  const css = of(['app/css/app.css']);
  check(css.scope?.join() === 'map,screens', `الخريطةُ والشاشاتُ معاً (وُجد: ${css.scope?.join('،')})`);
  check(css.running.includes('test_identity.mjs'), 'ويستيقظ حارسُ الهوية (اللوحُ مادّتُه)');

  console.log('\n— ولُمِس كلُّ نطاقٍ ⇒ الكاملةُ بلا `--scope` —');
  const both = of(['app/css/app.css', 'app/js/audio.js', 'app/welcome/index.html']);
  check(both.scope?.length === 0, 'فلا يُمرَّر نطاقٌ أصلاً حين تُلمس النطاقاتُ كلُّها');
  check(both.rounds.join() === 'device,welcome', 'وتُشغَّل الجولتان معاً');

  console.log('\n— والشكُّ يُوسِّع لا يُضيِّق —');
  const bare = of(['docs/METHOD.md']);
  check(bare.running.includes('test_bare.mjs'),
    '**حارسٌ بلا سطر مادّةٍ يُشغَّل دائماً** (وبابُ نسيانه في `test_selftests.mjs`)');
  check(!bare.running.includes('test_identity.mjs') && bare.browser.length === 0,
    'وما لم تُلمس مادّتُه لا يُشغَّل، والبطاريةُ تسقط كلُّها إن لم يُلمس نطاقٌ منها');
  const mine = of(['tools/test_identity.mjs']);
  check(mine.running.includes('test_identity.mjs'),
    'و**حارسٌ لُمس ملفُّه يُشغَّل** — فتعديلُ الحارس يُجرّبه');
  const page = of(['tools/browser_test.html']);
  check(page.scope?.length === 0, 'وصفحةُ البطارية إن لُمست قِيست نطاقاتُها كلُّها');

  console.log('\n— والنمطُ يُقرأ كما يُكتب —');
  check(matcher('app/js/**').test('app/js/a.js') && !matcher('app/js/**').test('app/css/a.css'),
    '`**` يعبر ما تحته ولا يتعدّى موضعَه');
  check(matcher('app/welcome/*.html').test('app/welcome/index.html')
    && !matcher('app/welcome/*.html').test('app/welcome/shots/a.png'),
    'و`*` لا يعبر الفواصل');
  check(matcher('app/CNAME').test('app/CNAME') && !matcher('app/CNAME').test('app/CNAMEX'),
    'والاسمُ الصريح يُطابَق تماماً');

  console.log(bad ? `\n${bad} فشل` : '\n✓ اشتقاقُ «فحصٌ بقدر العمل» يُصيب في كل حالةٍ مصنوعة');
  return bad ? 1 : 0;
}
