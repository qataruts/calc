// **حارسُ وقوع الوعد — محاكاةُ طفلٍ يوماً بيوم**:
//   node tools/test_promise.mjs [--seed N] [--rate 0.85] [--days N] [--trace]
//   node tools/test_promise.mjs --self-test
// يحرس: app/js/**
//   (المنهجُ وليتنر والمراجعةُ والبوابات وبناةُ الجولات كلُّهم — الرحلةُ تُمشى بهم)
//
// ————— لِمَ حارسٌ زائد، وما الذي لا يمسكه العشرون قبله؟ —————
//
// حرّاسُنا كلُّهم يحرسون **اللحظة**: `check_range` يجرد جولةً جولة على جبهتها،
// و`check_render` يقابل المرسومَ بالمقصود، و`test_gate` يصنع سجلَّ ليتنر **بيده**
// ويشهد أنّ البوابةَ تبني من الأضعف، و`test_measure` يطالب كلَّ مفتاحٍ ببانٍ،
// و`test_journey` يمشي العقدَ من سجلٍّ نظيف حتى الختام. وكلُّهم يسألون: «أهذه اللحظةُ
// سليمة؟» — **ولا أحدَ منهم يسأل: أيقع وعدُنا في مجرى الأيام؟**
//
// وشاهدُ العائلة أنّ الفرقَ بينهما ليس نظرياً: حارسُ الوعد عند اِسْمَعْ أمسك **يومَ
// وُلد أربعةَ عيوبٍ بنيوية** كانت خضراءَ عند حرّاسه جميعاً (بلاغ
// `2026-08-16-isma-promise-guard-caught-four.md`) — لأنّ عينَه في مجرى الأيام لا في
// اللحظة. وليتنرُنا **أقدمُ ليتنر في العائلة** وكان بلا حارسِ وعدٍ عليه.
//
// فيُصنَع هنا **طفلٌ يمشي** لا سجلٌّ يُنصَب: يفتح جهازَه كلَّ يوم، يبدأ بمراجعة اليوم
// كما تقول اللوحةُ، ثم يمضي في الرحلة حتى ينفد سقفُ يومه، ويعود غداً — وتُساق به
// **وحداتُنا الحقيقية** (`curriculum` · `progress` · `review` · `gate` وبناةُ الجولات
// الأحد عشر) بلا نسخةٍ ثانيةٍ من منطقها. ثم يُسأل عن أربعة أصنافٍ لا تظهر إلا في
// المجرى: **مفتاحٌ يُفتَح ولا يُقاس** · **عقدةٌ تحتكر الجلسة** · **بدلاءُ يبتلعون
// المراجعة** · **سؤالٌ جوابُه الصحيح اثنان**.
//
// ————— نموذجُ الزمن: **معلَنُ الاجتهاد، ومعايَرٌ على نصّ المنهج** —————
//
// **سقفُ اليوم ١٥ دقيقة** — وهو **مقروءٌ من التطبيق لا مكتوبٌ هنا**: `ENOUGH_MINUTES`
// في `app/js/parent.js`، وهو الرقمُ الذي تقول عنده لوحةُ وليّ الأمر «أخذ نصيبه اليوم
// — الزيادةُ على هذا تُتعب طفلاً في هذه السنّ أكثر مما تنفعه». فمن بدّل الرقمَ هناك
// تبدّل رقمُ الأيام هنا، ولا مسطرتان.
//
// **وكلفةُ ما في اليوم تُسعَّر بالمحتوى لا بثابت** (درسُ اِسْمَعْ المدفوع ثمنُه):
//   • `VISIT_MINUTES` — كلفةُ الزيارة نفسِها: الفتحُ وطقسُ الخطوات المنطوق والاحتفالُ
//     والانتقال. لا تتبدّل بعدد ما في المحطة.
//   • `ROUND_MINUTES` — كلفةُ **جولةٍ واحدة** (نمذجةً أو بعونٍ أو وحدَك)، **تُقرأ من
//     خطة الشاشة نفسِها** لا تُقدَّر — وبها تُسعَّر المراجعةُ والبوابةُ كذلك، فأصلٌ
//     واحد يحكم كلَّ ما يفعله الطفل. **وثمنُ إعادة الخطأ فيها**: الجولةُ لا تنتقل
//     إلا بالصواب، فمتوسّطُ محاولاتها أكثرُ من واحدة، وذلك مُسعَّرٌ في الرقم.
//
// **والمعايرةُ على `METHOD.md §٤`**: «حلقةُ المحطة ٣–٥ دقائق». وخطةُ محطتنا النمطية
// نمذجةٌ + جولتا عون + أربعُ إلى ستّ «وحدك» (§٤ نصّاً) = سبعُ إلى تسعُ جولات، فتقع
// بهذين الأصلين في **٣٫٥–٤٫٢ دقيقة** — داخل المدى المنصوص. وهي **أرقامُ محاكاةٍ
// معلَنة**: مَن بدّلها بدّل عددَ الأيام المطبوع، فلا يُقرأ الرقمُ إلا بها.
//
// ————— وطفلُنا يخطئ: **نسبةُ صوابٍ واقعية مبذورة** —————
//
// `RIGHT_RATE` احتمالُ أن تصيب **لمسةٌ واحدة** — لا جولةٌ ولا محطة. والجولةُ **تُعاد
// حتى الصواب** كما تفعل الشاشةُ نفسُها (`wrong()` في `review.js` لا تنقل، والخيارُ
// الخاطئ لا يُنهي الجولة — بلاغُ الميدان ٦)، فكلُّ خطأٍ يُكتب في ليتنر ويُنزل الصندوقَ
// إلى الصفر ثم يرفعه الصوابُ بعده إلى واحد. وأثرُ ذلك أنّ **مهارةً تُخطَأ في آخر
// جولاتها لا تبلغ الإتقانَ يومَها** — وهو عينُ ما يُقاس هنا.
//
// وبذرةٌ واحدة تحكم القرعةَ كلَّها (`--seed`)، فالرقمُ يُعاد كما هو ويُجرَّب بغيره.
//
// ————— الرقمان المطبوعان، وقيدُهما يُطبَع معهما —————
//
// ١) **كم يوماً حتى ختام الرحلة** — يومُ بلوغ آخر عقدة (العقدُ ٧١).
// ٢) **متى يتمّ القياس لكل مفتاح** — أقصى يومٍ بلغ فيه مفتاحٌ صندوقَ الإتقان، ومعه
//    **قائمةُ ما لا يبلغه أبداً** إن وُجد.
// وكلاهما **أرضيّةٌ لا وعد**: طفلٌ لا يغيب يوماً، بسقف يومٍ كامل، ونسبةُ صوابه
// المعلَنة أعلاه. ورحلةُ طفلٍ حقيقيّ أطول.
//
// ————— النومُ الذاتيّ (`docs/SEED.md §٥`) —————
//
// لا محطةَ لها بانٍ ⇒ لا رحلةَ تُمشى: ينام الحارسُ بشرطٍ **مجرود** (لا وحدةَ في
// `app/js/` تصدّر `buildStation`) ويستيقظ من تلقائه يومَ تُكتب أوّلُ شاشة.

import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const APP = new URL('../app/js/', import.meta.url);
const src = (name) => readFileSync(new URL(name, APP), 'utf8');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(name);
  return at < 0 ? fallback : Number(args[at + 1]);
};
const TRACE = args.includes('--trace');
const SELF_TEST = args.includes('--self-test');
const SEED = flag('--seed', 20260822);
/** سقفُ الأمان: رحلةٌ لا تنتهي **عيبٌ يُمسَك** لا حلقةٌ تدور أبداً. */
const MAX_DAYS = flag('--days', 500);
/** أيامُ هدوءٍ بعد تمام العقد تُعلن أنّ القياسَ توقّف (فيُطبَع ما بقي بلا إتقان). */
const QUIET_LIMIT = 45;
/**
 * **وما بعد الرحلة يُمشى كذلك**: «أتمّ الرحلة كلها — أعِد معه المراجعة اليومية»
 * (توصيةُ لوحة وليّ الأمر). وهناك يقع ما لا يقع قبله: مفاتيحُ الرحلة كلُّها تنضج في
 * أسابيعَ متقاربة، فتحين مواعيدُها **متزاحمةً في يومٍ واحد** وسقفُ الجلسة ستّةُ
 * تمارين — فيتأخّر المستحقُّ عن موعده. **وذاك تأخّرٌ يُقاس لا يُظَنّ.**
 */
const TAIL_DAYS = 60;

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const p = await import(new URL('progress.js', APP));
const c = await import(new URL('curriculum.js', APP));
const review = await import(new URL('review.js', APP));
const gate = await import(new URL('gate.js', APP));
const render = await import(new URL('render.js', APP));
const { seeded } = await import(new URL('ui.js', APP));
const { starsForStation } = await import(new URL('station.js', APP));

/** وحداتُ الشاشات تُحمَّل **بالجرد**: مَن صدّر `buildStation` بنى محطتَه. */
const SEEDLESS = new Set(['main.js', 'progress.js', 'curriculum.js', 'ui.js', 'audio.js',
  'review.js', 'parent.js', 'registry.js', 'station.js', 'gate.js', 'render.js',
  'support.js', 'placement.js', 'feedback.js', 'install.js']);
const screens = [];
for (const file of readdirSync(APP).filter((f) => f.endsWith('.js') && !SEEDLESS.has(f))) {
  const mod = await import(new URL(file, APP));
  if (typeof mod.buildStation === 'function') screens.push({ file, mod });
}

let fails = 0;
let asleep = 0;
const ok = (cond, msg) => {
  if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg);
};
const dormant = (msg) => { asleep++; console.log('  ⏸', `${msg} — نائم، يستيقظ ذاتياً`); };

// ————— أصولُ التسعير (أعلاه علّتُها) —————

/** **سقفُ اليوم من التطبيق لا من هنا**: `ENOUGH_MINUTES` في لوحة وليّ الأمر. */
const capLine = /ENOUGH_MINUTES\s*=\s*(\d+)/.exec(src('parent.js'));
const DAY_MINUTES = capLine ? Number(capLine[1]) : null;
const VISIT_MINUTES = 1;
const ROUND_MINUTES = 0.35;
/** **ونسبةُ الصواب تُبدَّل بالراية لا بالتحرير** (`--rate`): الافتراضُ المعلَن ٨٥٪،
 *  ومن أراد أن يجرّب طفلاً أضعفَ جرّبه بلا أن يبدّل رقمَ الحارس المطبوع. */
const RIGHT_RATE = flag('--rate', 0.85);
/** سقفُ محاولات الجولة الواحدة: الطفلُ يعيد حتى يصيب، والسقفُ حارسُ حلقةٍ لا نموذج. */
const MAX_TRIES = 12;

const ALL_KEYS = [...new Set(c.stations().flatMap((s) => s.skills || []))];
const ALL_NODES = p.allNodes();

// ————— المحاكاة: يومٌ يتقدّم، ووحداتُنا هي التي تعمل —————

/**
 * يومُ طفلٍ يتكرّر حتى تتمّ الرحلةُ ويتمّ القياس.
 *
 * **والعطبُ يُدسّ من هنا** (`sabotage`) لا من التطبيق: الدسّةُ يدُ الطفل لا شيفرتُنا،
 * فيُجرَّب الحارسُ سالباً بلا أن يُمَسّ ملفُّ تطبيقٍ واحد (`--self-test` أدناه).
 *
 * @param {{seed?: number, sabotage?: object}} o
 *   `sabotage.deafKey`   مفتاحٌ **لا تُكتب** محاولاتُه (يُفتَح ولا يُقاس)
 *   `sabotage.stuckGate` بوابةٌ **لا تُعبَر أبداً** (تقف بالجبهة فتحتكر الجلسة)
 *   `sabotage.starveDue` جلسةُ المراجعة تأخذ **مستحقّاً واحداً** والباقي بدلاء
 */
function runJourney({ seed = SEED, sabotage = {} } = {}) {
  p.reset();
  p.invalidateJourney();
  const rnd = seeded(seed >>> 0);
  const hit = () => rnd() < RIGHT_RATE;

  const log = {
    days: 0,
    finishedAt: 0,               // يومُ بلوغ آخر عقدة
    measured: new Map(),         // مفتاح ← أوّلُ يومٍ كُتب فيه قياسُه
    mastered: new Map(),         // مفتاح ← يومُ بلوغه صندوقَ الإتقان
    frontierDays: new Map(),     // عقدة ← كم يوماً وقفت عندها الجبهة
    gateTries: new Map(),        // بوابة ← عددُ محاولاتها
    sessions: [],                // جلساتُ المراجعة: {day, due, fromDue, fillers}
    stationDays: new Map(),      // محطة ← كم يوماً استغرقت
    costliest: { id: '', minutes: 0 },
    attempts: 0,
    slips: 0,
    backlog: 0,                  // أكثرُ ما اجتمع من مستحقّين في يومٍ واحد
    lateness: 0,                 // أطولُ تأخّرٍ لمهارةٍ عن موعدها (بالأيام)
    lateKey: '',
    tailAsked: new Set(),        // ما سُئل فعلاً بعد تمام الرحلة
    tailDays: 0,
    faults: [],                  // خروقُ الحوض في تمارين المراجعة والبوابات
    audited: 0,
  };

  const writeKey = (concept, range, kind, correct, day) => {
    const key = p.skillKey(concept, range, kind);
    if (sabotage.deafKey === key) return;          // الدسّة: مفتاحٌ أصمّ
    p.recordAttempt(concept, range, kind, correct, day);
    if (!log.measured.has(key)) log.measured.set(key, day);
    const s = p.getSkill(key);
    if (s && s.box >= p.MASTERED_BOX && !log.mastered.has(key)) log.mastered.set(key, day);
  };

  /** جولةٌ تُلعَب: تُعاد حتى الصواب كما تفعل الشاشة. يُرجِع `true` إن أصاب من أوّلها. */
  const playRound = (round, day) => {
    if (!round.concept || !round.kind) return true;
    for (let i = 0; i < MAX_TRIES; i++) {
      log.attempts++;
      if (hit()) {
        writeKey(round.concept, round.range, round.kind, true, day);
        return i === 0;
      }
      log.slips++;
      writeKey(round.concept, round.range, round.kind, false, day);
    }
    writeKey(round.concept, round.range, round.kind, true, day);
    return false;
  };

  /**
   * **وتمارينُ المراجعة والبوابات تُجرَد كما تُجرَد جولاتُ المحطة** — وهي مسارٌ آخر
   * (`itemFor` ← `stationForReview` بقرعتها) لا يمرّ منه `buildStation`. وعند اِسْمَعْ
   * وقع صنفُ «جوابان» في هذا المسار وحدَه («ولا يظهر إلا في التتابع»)، فلا يُترَك.
   */
  const audit = (round, where) => {
    log.audited++;
    log.faults.push(...poolFaults(round, where), ...tieFaults(round, where));
  };

  const buildFor = (id, day) => {
    for (const { mod } of screens) {
      const plan = mod.buildStation(id, (seed ^ (day * 7919)) >>> 0);
      if (plan) return plan;
    }
    return null;
  };
  const roundsOf = (plan) => [
    ...(plan.model ? [plan.model] : []), ...(plan.guided || []), ...(plan.solo || []),
  ];
  const sessionMinutes = (items) => VISIT_MINUTES + items * ROUND_MINUTES;

  /**
   * جلسةُ مراجعةٍ واحدة — **ولا يُسأل مفتاحٌ مرّتين في يوم** (درسُ اِسْمَعْ): صندوقُه
   * يرتفع بالإصابة، فلو كُرّر في اليوم الواحد لَبلغ الإتقانَ **حفظاً في جلسة** لا في
   * مجرى الأيام، وذاك نقضُ ليتنر ونقضُ الوعد الذي نقيسه. (وجولاتُ المحطة الخمسُ في
   * مهارةٍ واحدة تبقى كما هي: هي درسُها لا مراجعتُها.)
   */
  const runReview = (day, asked) => {
    const due = p.dueSkills(day)
      .filter((s) => !asked.has(p.skillKey(s.concept, s.range, s.kind)));
    if (due.length > log.backlog) log.backlog = due.length;
    for (const s of due) {
      const late = day - s.due;
      if (late > log.lateness) {
        log.lateness = late;
        log.lateKey = p.skillKey(s.concept, s.range, s.kind);
      }
    }
    if (!due.length) return 0;
    const offered = sabotage.starveDue ? due.slice(0, 1) : due;
    const items = review.sessionItems(offered, review.SESSION_SIZE, rnd);
    if (!items.length) return 0;
    const dueKeys = new Set(due.map((s) => p.skillKey(s.concept, s.range, s.kind)));
    let fromDue = 0;
    for (const item of items) {
      const key = p.skillKey(item.concept, item.range, item.kind);
      if (dueKeys.has(key)) fromDue++;
      asked.add(key);
      if (log.finishedAt) log.tailAsked.add(key);
      audit(item, `[مراجعةُ يوم ${day}] `);
      playRound(item, day);
    }
    log.sessions.push({ day, due: due.length, items: items.length, fromDue });
    p.markReview(items.length, items.length);
    return items.length;
  };

  let quiet = 0;
  let lastMeasured = 0;
  for (log.days = 1; log.days <= MAX_DAYS; log.days++) {
    const day = log.days;
    const asked = new Set();
    const stood = new Set();     // عقدُ اليوم التي وقفت عندها الجبهة (يومٌ لا محاولة)
    let minutes = 0;

    // ١) المراجعةُ أولاً — كما ترتّبها توصيةُ اللوحة («المراجعة قبل المحطة الجديدة»)
    const first = runReview(day, asked);
    if (first) minutes += sessionMinutes(first);

    // ٢) ثم العقدُ بترتيبها حتى ينفد سقفُ اليوم
    while (minutes < DAY_MINUTES) {
      const node = p.nextNode();
      if (!node) break;
      /* **والوقفةُ تُعَدّ يوماً لا محاولة**: بوابةٌ تُعاد ثلاثاً في يومٍ واحد يومٌ
         واحد وقفت فيه الجبهةُ — والاحتكارُ يُقاس بالأيام لأنّ اليومَ هو ما يخسره. */
      if (!stood.has(node.id)) {
        stood.add(node.id);
        log.frontierDays.set(node.id, (log.frontierDays.get(node.id) || 0) + 1);
      }

      if (node.type === 'gate') {
        const items = gate.gateItems(node.part, rnd);
        let right = 0;
        let errors = 0;
        for (const item of items) {
          audit(item, `[${node.title} · يوم ${day}] `);
          const good = hit();
          if (good) right++; else errors++;
          writeKey(item.concept, item.range, item.kind, good, day);
        }
        p.markReview(right + errors, right);
        log.gateTries.set(node.part, (log.gateTries.get(node.part) || 0) + 1);
        const open = gate.passed(right, errors) && sabotage.stuckGate !== node.part;
        if (open) p.setStars(node.id, review.starsForReview(errors, items.length));
        minutes += sessionMinutes(items.length);
        if (TRACE) console.log(`  يوم ${day}: 🚪 ${node.title} — ${open ? 'عبر' : 'ليس بعد'}`);
        continue;
      }

      const plan = buildFor(node.id, day);
      if (!plan) {
        /* **والمعفاةُ تُتَمّ بلا محاولة** (٨·٥ — `exempt` في المنهج): «إتمامُها مشاهدةٌ
           لا إتقان»، فلا بانِيَ لها بالبناء. وعقدةٌ **لها مفاتيح** ولا بانِيَ لها ثقبٌ
           في القفل يقف عنده الطفلُ أبداً — فتُسمّى ولا تُبتلَع. */
        if (!(node.skills || []).length) {
          p.setStars(node.id, p.MAX_STARS);
          minutes += VISIT_MINUTES;
          continue;
        }
        console.log(`  ✗ يوم ${day}: عقدةٌ تقيس ولا بانِيَ لها — «${node.title}» (${node.id})`);
        fails++;
        log.days = MAX_DAYS + 1;
        break;
      }

      const rounds = roundsOf(plan);
      const cost = sessionMinutes(rounds.length);
      if (cost > log.costliest.minutes) log.costliest = { id: node.id, minutes: cost };
      minutes += cost;
      log.stationDays.set(node.id, (log.stationDays.get(node.id) || 0) + 1);
      let errors = 0;
      for (const round of (plan.solo || [])) if (!playRound(round, day)) errors++;
      p.setStars(node.id, starsForStation(errors, (plan.solo || []).length));
      if (TRACE) console.log(`  يوم ${day}: ${node.title} (${cost.toFixed(1)} دقيقة)`);
    }

    // ٣) وما بقي من اليوم مراجعة — رحلةٌ تمّت عقدُها والمفاتيحُ تُثبَّت
    while (!p.nextNode() && minutes < DAY_MINUTES) {
      const items = runReview(day, asked);
      if (!items) break;
      minutes += sessionMinutes(items);
    }

    if (!p.nextNode() && !log.finishedAt) log.finishedAt = day;
    /* **ولا يُطوى اليومُ الذي تمّت فيه الرحلة**: الحياةُ بعدها مراجعةٌ يومية، وهي
       موضعُ الازدحام — فتُمشى `TAIL_DAYS` يوماً بعدها ويُقاس ما وقع فيها. */
    if (log.finishedAt) {
      log.tailDays = day - log.finishedAt;
      if (log.tailDays >= TAIL_DAYS && log.mastered.size >= ALL_KEYS.length) break;
    }
    /* **وتوقّفُ القياس يُقاس ولا يُنتظَر إلى السقف**: إن مضت أسابيعُ بعد تمام العقد ولا
       مفتاحَ جديد يبلغ الإتقان فقد بلغت الرحلةُ حدَّها — يُطبَع ما بقي باسمه. */
    if (log.mastered.size > lastMeasured) { lastMeasured = log.mastered.size; quiet = 0; }
    else if (log.finishedAt && log.mastered.size < ALL_KEYS.length) {
      /* **والهدوءُ يُعَدّ ما بقي مفتاحٌ لم يبلغ الإتقان** — فإن بلغته كلُّها فالهدوءُ
         تمامٌ لا توقّف، وتُمشى بقيّةُ الذيل كما أُعلن. */
      quiet++;
      if (quiet >= QUIET_LIMIT) break;
    }
  }
  log.days = Math.min(log.days, MAX_DAYS);
  return log;
}

// ————— جردُ الأصناف: **دالّاتٌ خالصةٌ على السجلّ** (فتُجرَّب سالباً) —————

/** ١) مفاتيحُ تُفتَح ولا تُقاس — وما بلغ ليتنر ولم يبلغ الإتقان. */
const unmeasured = (log) => ALL_KEYS.filter((k) => !log.measured.has(k));
const unmastered = (log) => ALL_KEYS.filter((k) => !log.mastered.has(k));

/** ٢) أطولُ وقفةٍ للجبهة عند عقدةٍ واحدة — «أيُحتكر اليوم؟». */
const hoggers = (log, limit) => [...log.frontierDays]
  .filter(([, days]) => days > limit)
  .sort((a, b) => b[1] - a[1]);

/**
 * ٣) بدلاءُ يبتلعون المراجعة: **جلسةٌ فيها مستحقّون ولم تأخذ منهم ما تسع**.
 * والحدُّ ليس نسبةً تُقدَّر: البدلاءُ **يكمّلون** ولا يزاحمون — فإن كان المستحقّون
 * ستّةً فصاعداً فالجلسةُ ستُّ مستحقّات، وإن كانوا أقلَّ فكلُّهم ثم التنويع.
 */
const swallowed = (log, size) => log.sessions
  .filter((s) => s.fromDue < Math.min(size, s.due));

// ————— ٤) سؤالٌ جوابُه الصحيح اثنان: جردُ أحواض الخيارات —————
//
// **الحوضُ يُقرأ بما يحكم به الطفل، ومَن كتب الجدولَ يقول به** — لا يُخمَّن من نمط
// العرض. وكان يُخمَّن أوّلَ ما كُتب هذا الحارس: «ما رُسم بعناصر عالم الطفل يحكم فيه
// رمزُه» — **فأمسك الحارسُ نفسَه ثمانمئة خرقٍ كاذب** في «أَيْنَ هَذَا الْعَدَدْ؟»،
// وبطاقاتُها كمّياتٌ مرسومةٌ بعناصر عالم الطفل يحكم فيها **العدد** لا الرمز. والفرقُ
// ليس في الرسم: في **السؤال** — «أيُّ العناصر يأتي بعده؟» في النمط يحكم فيه الرمز،
// و«أين هذا العدد؟» يحكم فيه ما رُسم عدداً وإن رُسم بالتفاح. فصار الحكمُ حقلاً في
// جدول الحقيقة (`by`) يكتبه صاحبُه، ولا نمطَ يُستنبَط منه سؤال.

const optionKey = (spec, by) => (by === 'shape' ? `شكل:${(spec.shapes || []).join('+')}`
  : by === 'glyph' ? `عنصر:${spec.glyph}`
    : `عدد:${spec.count}`);

/** سَعةُ الإطار من المصيِّر نفسِه — لا عشرةٌ مكتوبةٌ في حارس. */
const FRAME = render.rangeOf('ten-frame')?.max ?? 10;

/**
 * **جدولُ الحقيقة، مكتوبٌ بيدٍ عمداً**: لكلِّ نوعِ جولةٍ إمّا **جوابٌ واحد** يُشتقّ
 * من إعلان الجولة، وإمّا **علّةٌ مكتوبة** تُخرجها من قاعدة «خيارٌ واحد صحيح».
 *
 * وهو مكتوبٌ هنا ولا يُقرأ من الشاشات عمداً (سنّةُ `SHAPE_TRUTH` في حارس المتصفّح):
 * لو اشتُقّ من الشيفرة التي يحرسها لَوافقها في خطئها.
 */
const POOLS = {
  'flash': [{ pool: 'options', answer: (r) => `عدد:${r.target.count}` }],
  'set': [{ pool: 'options', answer: (r) => `عدد:${r.target.count}` }],
  'touch': [{ pool: 'options', answer: (r) => `عدد:${r.subject.count}` }],
  'match': [{ pool: 'options', answer: (r) => `عدد:${r.range}` }],
  'next': [{ pool: 'options', answer: (r) => `عدد:${r.target}` }],
  'sides': [{ pool: 'options', answer: (r) => `عدد:${c.shapeOf(r.face).sides}` }],
  'name': [{ pool: 'options', by: () => 'shape', answer: (r) => `شكل:${r.face}` }],
  'each': [{ pool: 'options', answer: (r) => `عدد:${r.each}` }],
  'units': [{ pool: 'options', answer: (r) => `عدد:${r.len}` }],
  'count': [{ pool: 'spots', answer: (r) => r.lit[r.lit.length - 1] + r.step }],
  'place': [{ pool: 'spots', answer: (r) => r.target }],
  'bridge': [
    // سؤالان في جولةٍ واحدة: «كم بقي للعشرة» ثم «كم صارت معاً» — ولكلٍّ حوضُه
    { pool: 'first', answer: (r) => `عدد:${r.give.split}` },
    { pool: 'second', answer: (r) => `عدد:${r.whole.count}` },
  ],
  'solve': [{ pool: 'options', answer: (r) => `عدد:${
    r.mode === 'add' ? r.fact.count
      : r.mode === 'sub' ? r.fact.split
        : r.mode === 'double' ? r.pair[0].count * 2
          : r.rows[0].count - r.rows[1].count}` }],
  'extend': [{
    pool: 'options',
    // **وهنا وحدَها يحكم الرمزُ لا العدد**: «ما الذي يأتي بعده؟» سؤالُ نمطٍ، وبطاقاتُه
    // عنصرٌ واحد لكلٍّ — إلا وجهَ النمط العدديّ فبطاقاتُه رموزُ أعداد.
    by: (r) => (r.mode === 'number' ? 'count' : 'glyph'),
    answer: (r) => {
    const items = r.strip.items;
    const blank = items.indexOf(null);
    return r.mode === 'number'
      ? `عدد:${items[blank - 1] + r.step}`
      : `عنصر:${items[blank - r.period]}`;
    },
  }],
  'build': [{
    pool: 'options',
    // **وجهُ البناء خانتان لا خانة** — فيُعفى بعلّته أدناه، ووجهُ القراءة سؤالُ رمز
    answer: (r) => (r.mode === 'read' ? `عدد:${r.fact.count}` : null),
    why: (r) => (r.mode === 'build'
      ? 'وجهُ البناء يملأ **خانتين** (حزمةٌ وآحاد)، فبطاقتا العشرة في العشرين '
        + 'تكرارٌ مقصود لا جوابان'
      : null),
  }],
  'make': [{
    pool: 'options',
    answer: (r) => (r.mode === 'rest' ? `عدد:${FRAME - r.frame.count}` : null),
    why: (r) => (r.mode === 'pair'
      ? 'وجهُ الجسر يملأ **خانتين** (جزآن يصيران الكلّ)، فبطاقتا الاثنين في الأربعة '
        + 'تكرارٌ مقصود لا جوابان'
      : null),
  }],
};

/**
 * **أحواضُ جولةٍ واحدة وأخطاؤها** — دالّةٌ خالصة على جولةٍ، فتُدسّ لها جولاتٌ مصنوعة.
 * وثلاثةُ أحكام: لا خيارَ مكرَّر · والجوابُ في الحوض · **ومرّةً واحدة**.
 */
function poolFaults(round, where = '') {
  const out = [];
  for (const spec of POOLS[round.kind] || []) {
    const pool = round[spec.pool];
    if (!Array.isArray(pool) || !pool.length) continue;
    const why = spec.why?.(round);
    const by = spec.by?.(round) || 'count';
    const keys = pool.map((o) => (typeof o === 'object' ? optionKey(o, by) : `عدد:${o}`));
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (!why && dupes.length) {
      out.push(`${where}[${round.kind}${round.mode ? `/${round.mode}` : ''}] `
        + `حوضُ «${spec.pool}» فيه خيارٌ مكرَّر (${[...new Set(dupes)].join('، ')}) — `
        + 'فإن كان الجوابَ فجوابان');
    }
    const want = spec.answer?.(round);
    if (want === null || want === undefined) continue;
    const key = String(want).includes(':') ? String(want) : `عدد:${want}`;
    const found = keys.filter((k) => k === key).length;
    if (found !== 1) {
      out.push(`${where}[${round.kind}${round.mode ? `/${round.mode}` : ''}] `
        + `الجوابُ «${key}» في حوض «${spec.pool}» ${found === 0 ? 'مفقود' : `مكرَّرٌ ${found} مرّات`} `
        + `(الحوض: ${keys.join('، ')})`);
    }
  }
  return out;
}

/**
 * **المقارنةُ لا تُنتج تعادلاً حيث لا تعادل** — دالّةٌ خالصة كأختها.
 * «أيُّهما أكثر» تُنتج المتساويَين في محطتها الختامية وحدَها (`sameAllowed`)، وشريطا
 * القياس **يفترقان بوحدةٍ واحدة** لا بصفر.
 */
function tieFaults(round, where = '') {
  const label = `${where}[${round.kind}${round.mode ? `/${round.mode}` : ''}]`;
  if (round.kind === 'more' && round.left.count === round.right.count && !round.sameAllowed) {
    return [`${label} كمّيتان متساويتان و«سَوَاء» ليست في محطتها — سؤالٌ بلا جواب`];
  }
  if (round.kind === 'pick' && !round.mode && round.left.count === round.right.count) {
    return [`${label} «أيُّهما أكبر» على متساويَين — سؤالٌ بلا جواب`];
  }
  if (round.kind === 'units' && round.mode === 'longer'
    && round.bars[0].count === round.bars[1].count) {
    return [`${label} شريطان بطولٍ واحد و«أيُّهما أطول» تُسأل — سؤالٌ بلا جواب`];
  }
  /* **و«رَتِّبْ» بطاقاتُها حوضٌ بلا مشتّتات**: كلُّها تُلمَس بترتيبها، فالسؤالُ في كل
     خطوة «أيُّها الأصغر؟» — وبطاقتان برقمٍ واحد **جوابان صحيحان** في تلك الخطوة. */
  if (round.kind === 'sort' && !round.mode) {
    const counts = round.cards.map((card) => card.count);
    const dupes = counts.filter((n, i) => counts.indexOf(n) !== i);
    if (dupes.length) {
      return [`${label} بطاقتان برقمٍ واحد في «رَتِّبْ» (${[...new Set(dupes)].join('، ')}) `
        + '— فخطوةُ «الأصغرُ أوّلاً» جوابان'];
    }
  }
  return [];
}

// ————— **الدسّة: لا يُصدَّق حارسٌ لم يُرَ وهو يمسك** (`--self-test`) —————
//
// وتُجرَّب من جهتَي عينه: **المجرى** (عطبٌ يُدسّ في يد الطفل فتحمرّ أرقامُ الأصناف
// الثلاثة الأولى باسمها)، و**الحوض** (جولاتٌ مصنوعة تُدسّ للدالّتين الخالصتين).

if (SELF_TEST) {
  console.log('— دسّةُ المجرى: عطبٌ في يد الطفل، فأيّ رقمٍ يحمرّ؟ —');

  const clean = runJourney({ seed: 4242 });
  ok(unmeasured(clean).length === 0 && clean.finishedAt > 0,
    `الرحلةُ النظيفة تمرّ: ${clean.finishedAt} يوماً وصفرُ مفتاحٍ بلا قياس (وإلّا فالدسّةُ `
    + 'تقيس نفسَها)');

  const deaf = ALL_KEYS[Math.floor(ALL_KEYS.length / 2)];
  const mute = runJourney({ seed: 4242, sabotage: { deafKey: deaf } });
  ok(unmeasured(mute).includes(deaf),
    `**مفتاحٌ يُفتَح ولا يُقاس يُمسَك باسمه**: «${deaf}» (بلا قياس: ${unmeasured(mute).join('، ') || 'لا شيء'})`);

  const stuck = runJourney({ seed: 4242, sabotage: { stuckGate: c.GATES[0].id } });
  const held = hoggers(stuck, 5);
  ok(held.length > 0 && held[0][0] === `gate:${c.GATES[0].id}`,
    `**وبوابةٌ تُرسَب مراراً تُمسَك بيومها**: «${held[0]?.[0] || 'لا شيء'}» وقفت `
    + `${held[0]?.[1] || 0} يوماً بالجبهة`);
  ok(stuck.finishedAt === 0,
    'ورحلةٌ لا تنتهي تُعلَن ولا تُطوى (ختامٌ بلا يوم)');

  const starved = runJourney({ seed: 4242, sabotage: { starveDue: true } });
  const eaten = swallowed(starved, review.SESSION_SIZE);
  ok(eaten.length > 0,
    `**وبدلاءُ يبتلعون جلسةً فيها مستحقّون يُمسَكون بعددهم**: ${eaten.length} جلسة `
    + `(أُولاها يوم ${eaten[0]?.day}: ${eaten[0]?.fromDue} من ${eaten[0]?.due} مستحقّاً)`);
  ok(swallowed(clean, review.SESSION_SIZE).length === 0,
    'والنظيفةُ صفرُ جلسةٍ مبتلَعة — فالبابُ بابٌ لا جدار');

  console.log('\n— دسّةُ الحوض: جولاتٌ مصنوعة للدالّتين الخالصتين —');
  const opt = (n) => ({ display: 'numeral', count: n, seed: 1 });
  const sound = { kind: 'flash', target: { count: 3 }, options: [opt(2), opt(3), opt(4)] };
  ok(poolFaults(sound).length === 0, 'حوضٌ سليم يمرّ (جوابٌ واحد ومشتّتان)');
  ok(poolFaults({ ...sound, options: [opt(3), opt(3), opt(4)] })
    .some((m) => m.includes('مكرَّر')),
  '**وخيارٌ مكرَّر يُمسَك** — فإن كان الجوابَ فجوابان');
  ok(poolFaults({ ...sound, options: [opt(2), opt(4), opt(5)] })
    .some((m) => m.includes('مفقود')),
  '**وجوابٌ ليس في حوضه يُمسَك** — سؤالٌ بلا جواب');
  ok(poolFaults({ kind: 'make', mode: 'pair', options: [opt(2), opt(2), opt(3)] }).length === 0,
    'ووجهُ الخانتين يمرّ **بعلّته المكتوبة** (٤ = ٢+٢ يقتضي بطاقتَي اثنين)');
  ok(tieFaults({ kind: 'more', left: { count: 3 }, right: { count: 3 }, sameAllowed: false })
    .length === 1, '**وتعادلٌ في «أيُّهما أكثر» خارج محطته يُمسَك**');
  ok(tieFaults({ kind: 'more', left: { count: 3 }, right: { count: 3 }, sameAllowed: true })
    .length === 0, 'ويمرّ في محطته الختامية («كثيرٌ وقليلٌ وسواء») — بابٌ لا جدار');
  ok(tieFaults({ kind: 'units', mode: 'longer', bars: [{ count: 4 }, { count: 4 }] })
    .length === 1, '**وشريطان بطولٍ واحد يُسأل عن أطولهما يُمسَكان**');
  ok(tieFaults({ kind: 'sort', cards: [opt(2), opt(2), opt(5)] }).length === 1,
    '**وبطاقتان برقمٍ واحد في «رَتِّبْ» تُمسَكان** — «الأصغرُ أوّلاً» جوابان');
  ok(tieFaults({ kind: 'sort', cards: [opt(2), opt(4), opt(5)] }).length === 0,
    'وثلاثُ بطاقاتٍ مختلفة تمرّ — بابٌ لا جدار');

  console.log(fails ? `\n${fails} فشل` : '\n✓ حارسُ الوعد يمسك المدسوسَ كلَّه');
  process.exit(fails ? 1 : 0);
}

/* **ودسّتُه تُشغَّل مع كلِّ تشغيل** («فحصٌ لا يُشغَّل ليس حارساً»): في عمليةٍ مستقلّة —
   الدسّةُ تمشي رحلاتٍ أربعاً بسجلّاتٍ من الصفر، والمحاكاةُ تحتاج سجلَّها وحدَها. */
{
  const own = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--self-test'],
    { encoding: 'utf8' });
  process.stdout.write(own.stdout || '');
  if (own.status !== 0) {
    fails++;
    console.log('  ✗ دسّةُ حارس الوعد نفسِها حمراء (`--self-test`)');
  }
}

// ————— التشغيل —————

if (!screens.length) {
  dormant('لا وحدةَ تصدّر `buildStation` بعد — لا رحلةَ تُمشى');
  console.log(`\n⏸ ${asleep} نائم`);
  process.exit(0);
}

console.log('\n— نموذجُ الزمن المُعلَن (مَن بدّله بدّل الرقم) —');
ok(DAY_MINUTES !== null,
  `سقفُ اليوم ${DAY_MINUTES} دقيقة — **مقروءٌ من `
  + '`parent.js` (`ENOUGH_MINUTES`)** لا مكتوباً هنا');
console.log(`  · زيارةٌ ${VISIT_MINUTES} دقيقة + ${ROUND_MINUTES} للجولة الواحدة `
  + `(نمذجةً أو عوناً أو وحدَك) · نسبةُ صواب اللمسة ${Math.round(RIGHT_RATE * 100)}٪ `
  + `مبذورةً (بذرة ${SEED})`);

console.log('\n— محاكاةُ طفلٍ يمشي الرحلةَ يوماً بيوم —');
const log = runJourney();

const done = ALL_NODES.filter((n) => p.isDone(n.id));
ok(done.length === ALL_NODES.length,
  `كلُّ عقد الرحلة بُلغت ولُعبت: ${done.length} من ${ALL_NODES.length}`);
ok(log.finishedAt > 0 && log.days < MAX_DAYS,
  `والرحلةُ تنتهي (سقفُ الأمان ${MAX_DAYS} يوماً)`);
ok(ALL_NODES.at(-1) && p.isDone(ALL_NODES.at(-1).id) && ALL_NODES.at(-1).type === 'gate',
  `وآخرُها بوابةُ الختام — «${ALL_NODES.at(-1)?.title}»`);
{
  const station = [...log.stationDays].filter(([, days]) => days > 1);
  console.log(`  · أثقلُ محطة: «${log.costliest.id}» ${log.costliest.minutes.toFixed(1)} دقيقة`
    + ` · ومحطاتٌ لم تُستوفَ في يوم: ${station.length}`);
  console.log(`  · اللمساتُ ${log.attempts} منها ${log.slips} زلّة `
    + `(${Math.round((log.slips / log.attempts) * 100)}٪) · جلساتُ المراجعة ${log.sessions.length}`
    + ` · البوابات: ${[...log.gateTries].map(([id, n]) => `${id}×${n}`).join(' · ')}`);
}

console.log('\n— الصنف ١: مفتاحٌ يُفتَح ولا يُقاس في عمر الجهاز —');
{
  const blind = unmeasured(log);
  ok(blind.length === 0,
    `كلُّ مفتاحٍ دخل ليتنر: ${ALL_KEYS.length - blind.length} من ${ALL_KEYS.length}`
    + (blind.length ? ` — **بلا قياس: ${blind.join('، ')}**` : ''));
  const cold = unmastered(log);
  ok(cold.length === 0,
    `وكلُّ مفتاحٍ بلغ صندوقَ الإتقان: ${ALL_KEYS.length - cold.length} من ${ALL_KEYS.length}`
    + (cold.length ? ` — **لا يبلغه أبداً: ${cold.join('، ')}**` : ''));
}

console.log('\n— الصنف ٢: عقدةٌ تقف بالجبهة فتحتكر الجلسة —');
{
  /** حدُّ الاحتكار: عقدةٌ تحبس الجبهةَ أكثرَ من أسبوع رحلةٌ وقفت لا محطةٌ تُعاد. */
  const HOG_LIMIT = 7;
  const held = hoggers(log, HOG_LIMIT);
  const worst = [...log.frontierDays].sort((a, b) => b[1] - a[1])[0] || ['—', 0];
  ok(held.length === 0,
    `لا عقدةَ تحبس الجبهةَ فوق ${HOG_LIMIT} أيام — أطولُها «${worst[0]}» ${worst[1]} يوماً`
    + (held.length ? ` — **محتكِرة: ${held.map(([id, d]) => `${id}×${d}`).join('، ')}**` : ''));
  /** وحدُّ الإعادة: خمسٌ. «لا رسوب» عهدٌ، **والإعادةُ بلا نهاية احتكارٌ** — وبنسبة
   *  الصواب المعلَنة تقع الأولى في محاولةٍ أو محاولتين، فخمسٌ سعةٌ لا حدّ ضيق. */
  const RETRY_LIMIT = 5;
  const tries = [...log.gateTries].sort((a, b) => b[1] - a[1])[0] || ['—', 0];
  ok(tries[1] <= RETRY_LIMIT,
    `وأكثرُ بوابةٍ إعادةً «${tries[0]}» ${tries[1]} محاولة — والحدّ ${RETRY_LIMIT} `
    + '(لا رسوب، ولا احتكار)');
}

console.log('\n— وما بعد الرحلة: أيعود المستحقُّ **في موعده**؟ —');
{
  const rest = ALL_KEYS.filter((k) => !log.tailAsked.has(k));
  ok(rest.length === 0,
    `كلُّ مفتاحٍ عاد في المراجعة بعد الختام: ${ALL_KEYS.length - rest.length} من `
    + `${ALL_KEYS.length}`
    + (rest.length ? ` — **لم يعد أبداً: ${rest.join('، ')}**` : ''));
  /* **والتأخّرُ يُقاس ولا يُحكَم عليه هنا**: سعةُ الجلسة ستّةٌ بيانُ منهج
     (`METHOD.md §٦`)، فليس لحارسٍ أن يقضي عليها — وإنما يقول ما وقع، ويُرفَع الرقمُ
     إلى مَن يملك القرار. **وهو أرضيّةٌ كذلك**: هذه المحاكاةُ تعيد المراجعةَ ما بقي
     من سقف اليوم، وطفلٌ يراجع مرّةً واحدة في اليوم يتأخّر أكثر. */
  console.log(`  · مُشيت ${log.tailDays} يوماً بعد الختام: أكثرُ ما اجتمع من مستحقّين `
    + `في يوم **${log.backlog}** وسعةُ الجلسة **${review.SESSION_SIZE}**، فأطولُ تأخّرٍ `
    + `عن موعدٍ **${log.lateness} أيام**${log.lateKey ? ` («${log.lateKey}»)` : ''}`);
  console.log('  · وتقول التعريفيةُ «يعيده عليه **في وقته**» و«يعود **في موعده**»، '
    + 'وتقول شاشةُ المراجعة «وما أخطأتَ فيه **يعود غداً**» — والرقمُ أعلاه يُقابَل بها، '
    + '**ولا يعدّل حارسٌ وعداً بيده**.');
}

console.log('\n— الصنف ٣: بدلاءُ يبتلعون المراجعة —');
{
  const eaten = swallowed(log, review.SESSION_SIZE);
  const withDue = log.sessions.filter((s) => s.due > 0);
  const items = withDue.reduce((n, s) => n + s.items, 0);
  const fillers = items - withDue.reduce((n, s) => n + s.fromDue, 0);
  ok(eaten.length === 0,
    `لا جلسةَ أخذ فيها بديلٌ موضعَ مستحقّ: ${withDue.length} جلسةً فيها مستحقّون`
    + (eaten.length ? ` — **مبتلَعة: ${eaten.length}**` : ''));
  console.log(`  · حصةُ الحشو من جلسات المستحقّين: ${fillers} من ${items} تمريناً `
    + `(${items ? Math.round((fillers / items) * 100) : 0}٪) — وهي تكميلٌ حيث نقص `
    + 'المستحقُّ عن ستّة، لا مزاحمة');
  /* **وكلُّ مفتاحٍ له بانٍ حيّاً** — البرهانُ البنيويّ على أنّ بديلاً لا يُزاحم: مهارةٌ
     لا يُبنى لها تمرين تُدفَع من الجلسة صامتةً ويأخذ البديلُ مكانَها. ويُسأل بعد
     الرحلة حيث السجلُّ كامل، **وبحوض تنويعٍ فارغ** فلا يُجيب عنها غيرُها. */
  const rnd = seeded(97);
  const orphan = p.skills().filter((s) => {
    const got = review.sessionItems([s], 1, rnd, []);
    return !got.length || p.skillKey(got[0].concept, got[0].range, got[0].kind) !== s.key;
  });
  ok(orphan.length === 0,
    `ولكلِّ مهارةٍ في السجلّ تمرينُها هي: ${p.skills().length} مهارة`
    + (orphan.length ? ` — **بلا بانٍ: ${orphan.map((s) => s.key).join('، ')}**` : ''));
}

console.log('\n— الصنف ٤: سؤالٌ جوابُه الصحيح اثنان —');
{
  /** بذورٌ كثيرة: العيبُ في الحوض قرعةٌ نادرة، فيُكنَس بعشراتها لا بأربع. */
  const SEEDS = Array.from({ length: 24 }, (_, i) => (SEED ^ ((i + 1) * 2654435761)) >>> 0);
  const faults = [];
  let rounds = 0;
  let pools = 0;
  const kinds = new Set();
  for (const station of c.stations()) {
    for (const seed of SEEDS) {
      for (const { mod } of screens) {
        const plan = mod.buildStation(station.id, seed);
        if (!plan) continue;
        const steps = [
          ...(plan.model ? [['شاهِد', plan.model]] : []),
          ...(plan.guided || []).map((r) => ['جرِّب معي', r]),
          ...(plan.solo || []).map((r) => ['وحدك', r]),
        ];
        for (const [step, round] of steps) {
          if (!round.kind) continue;
          rounds++;
          const where = `[${station.id} · بذرة ${seed} · ${step}] `;
          if (POOLS[round.kind]) { pools++; kinds.add(round.kind); }
          faults.push(...poolFaults(round, where), ...tieFaults(round, where));
        }
      }
    }
  }
  for (const line of faults.slice(0, 8)) console.log(`     ${line}`);
  ok(faults.length === 0,
    `${rounds} جولةً بـ${SEEDS.length} بذرة: منها ${pools} ذاتُ حوضٍ مُجرَد `
    + `(${kinds.size} نوعاً) — وكلُّ حوضٍ فيه جوابُه مرّةً واحدة`
    + (faults.length ? ` — **${faults.length} خرقاً**` : ''));
  // **ومسارُ المراجعة والبوابات مجرودٌ من المحاكاة نفسِها** (أعلاه علّتُه)
  for (const line of log.faults.slice(0, 8)) console.log(`     ${line}`);
  ok(log.faults.length === 0,
    `وتمارينُ المراجعة والبوابات في الرحلة كلِّها: ${log.audited} تمريناً بمسارها هي `
    + '(`itemFor` بقرعة محطتها) — وكلُّ حوضٍ فيه جوابُه مرّةً واحدة'
    + (log.faults.length ? ` — **${log.faults.length} خرقاً**` : ''));
  /* **وما لم يُقَس يُسمّى** («لا سقفَ صامت»): أنواعُ الجولات التي لا حوضَ خياراتٍ لها
     — أفعالٌ باللمس المباشر (توزيعٌ وتسويةٌ ورصُّ وحدات) أو ترتيبٌ بلا مشتّتات — لا
     تقع تحت قاعدة «خيارٌ واحد صحيح»، ويحرسها أخوها في المتصفّح بجداولها. */
  const all = new Set();
  for (const station of c.stations()) {
    for (const { mod } of screens) {
      const plan = mod.buildStation(station.id, SEEDS[0]);
      if (!plan) continue;
      for (const r of [plan.model, ...(plan.guided || []), ...(plan.solo || [])]) {
        if (r.kind) all.add(r.kind);
      }
    }
  }
  /* **وما لم يقسه هذا البابُ يُسمّى ومعه مَن يقيسه** — «لا سقفَ صامت»: فلا يُقرأ
     «كلُّ حوضٍ سليم» على أنواعٍ لم تُسأل أصلاً. */
  const ELSEWHERE = {
    more: 'طرفان يُقارَنان — يقيسه بابُ التعادل أعلاه',
    pick: 'طرفان يُقارَنان (والمشاهدُ رتبتُها في `SCENES`، ولا رتبتين متساويتين — `check_range` بابا ١ب)',
    sort: 'ترتيبٌ بلا مشتّتات — يقيسه بابُ التعادل أعلاه (والزمنُ رتبةً في `check_range`)',
    give: 'إنتاجُ كمٍّ بيده — لا حوضَ يُلمَس فيه',
    rank: 'أسماءُ ترتيبٍ على شريطٍ واحد — لا حوضَ ولا رقم',
    world: 'لمسُ شكلٍ في شيءٍ مبنيٍّ من أشكالنا — أجزاؤه بيانُ منهجٍ يجرده `check_range`',
  };
  const uncovered = [...all].filter((k) => !POOLS[k]);
  const mute = uncovered.filter((k) => !ELSEWHERE[k]);
  for (const kind of uncovered) console.log(`  · «${kind}» خارج قاعدة الحوض — ${ELSEWHERE[kind] || '**بلا علّةٍ مكتوبة**'}`);
  ok(mute.length === 0,
    `و${uncovered.length} نوعاً بلا حوض خيارات كلُّها بعلّتها المكتوبة`
    + (mute.length ? ` — **بلا علّة: ${mute.join('، ')}**` : ''));
}

// ————— الرقمان المعلَنان —————

const lastMastery = log.mastered.size ? Math.max(...log.mastered.values()) : 0;
console.log(`\n— الرقمان المقيسان: **ختامُ الرحلة يوم ${log.finishedAt || '—'}** `
  + `و**تمامُ القياس يوم ${lastMastery || '—'}** —`);
console.log('  (وهما **أرضيّةٌ لا وعد**: طفلٌ لا يغيب يوماً، بسقف يومٍ كامل ونسبةِ '
  + `صوابٍ ${Math.round(RIGHT_RATE * 100)}٪. والثاني بلوغُ كلِّ مفتاحٍ صندوقَ الإتقان `
  + 'مرّةً — لا ثباتُه فيه.)');
console.log(`  · وبإيقاع «محطةٌ واحدة في الجلسة» الذي تنصح به التعريفيةُ: `
  + `${ALL_NODES.length} يوماً — فبين ما يسمح به سقفُ اليوم وما تنصح به الصفحةُ فرقٌ `
  + 'يُرفَع بنداً، ولا يُعدَّل وعدٌ بيد الحارس.');

console.log(fails
  ? `\n${fails} فشل`
  : `\nوعدُنا يقع: ${ALL_NODES.length} عقدةً تُبلَغ في ${log.finishedAt} يوماً، `
    + `و${ALL_KEYS.length} مفتاحاً كلُّها تُقاس وتبلغ الإتقان في ${lastMastery} يوماً`
    + (asleep ? ` · ${asleep} نائم` : ''));
process.exit(fails ? 1 : 0);
