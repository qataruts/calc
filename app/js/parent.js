// لوحة وليّ الأمر (`METHOD.md §٦`) — خلف بوابة عملية حسابية لا يحلّها طفل السابعة:
// أين يتعثّر بالضبط، وكم دقيقة تعلّم، وما توصية اليوم.
//
// ————— بذرةُ المنصة (منسوخةٌ من «اِقْرَأْ» ومجرَّدةٌ من مادّته) —————
// المنقولُ **البنيةُ والبوابةُ الحسابية** (`FAMILY.md §٥`): تركيبُ الشاشة، وقفلُها،
// وتوصيةُ اليوم بترتيبها، وقسمُ النسخة الاحتياطية، وتحكّمُ وليّ الأمر في الرحلة،
// وبابُ المعاينة. وسقط ما كان يعرف حرفاً أو قصةً أو تسجيلَ صوت.
//
// **وقسمُ الأقسام السبعة (كمّ · عدّ · رموز · مقارنة · جسور · عمليات · أنماط) كُتب في
// الجلسة ٨**: يُبنى من سجلّ ليتنر الحيّ لا من رقمٍ يُكتب بيد، و**مفهومٌ بعملية لا
// درجة** («يقدّر حتى ٥ فوراً»، «يحتاج تثبيت جسور ١٠») — والعباراتُ **بياناتُ منهج**
// في `curriculum.js`، وهذه الوحدةُ تُترجمها ولا تخترعها (التفصيل عند `conceptLine`).
//
// الشاشة لا تنطق شيئاً (لا صوت فيها أصلاً)، وتُبنى من مفردات التنسيق القائمة
// (pill · vchip · note · chip) وتُلوَّن بمتغيّر `--accent`، فلا تحتاج تنسيقاً جديداً.

import * as progress from './progress.js';
import { CONCEPT_SECTIONS, conceptOf, rangeText, journeyConcepts } from './curriculum.js';
import { h, go, toast, arNum, arCount, topbar, shake, PAUSE_ACCENT } from './ui.js';

const ACCENT = PAUSE_ACCENT;
const GOOD = 'var(--ok)';
const BAD = 'var(--err)';
const DAY_NAMES = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

/** نصيبُ اليوم لطفل ٤–٧ — بعده تُنصح الاستراحة. (أصغرُ من جمهور اقرأ فالسقف أدنى.) */
const ENOUGH_MINUTES = 15;

/**
 * **متى يصير التعثّرُ «متكرراً أسابيع»** (`METHOD.md §١٣`) — عتبةُ عبارة «راجِع مختصاً».
 *
 * نصُّ الحدّ: «إن تكرّر تعثّرُ طفلك في مفهومٍ واحد **أسابيع**»، و«أسابيع» جمعُ كثرةٍ
 * أدناه ثلاثة — فثلاثةُ أسابيع من يوم أوّل قياسٍ لتلك المهارة (`since`)، **وهي ما
 * تزال في الصندوق الأدنى** بعدها. فلا تُقال العبارةُ لأسبوعٍ عثر فيه، ولا تُخبَّأ عن
 * والدٍ طال تعثّرُ طفله.
 */
const STUCK_DAYS = 21;

let unlocked = false;        // البوابة تُفتح لهذه الجلسة فقط (لا تُحفظ في التخزين)

/** ثوانٍ ← نصّ عربي مقروء. */
export function minutesText(seconds) {
  if (!seconds) return 'لا شيء';
  if (seconds < 60) return 'أقل من دقيقة';
  return arCount(Math.round(seconds / 60), ['دقيقة واحدة', 'دقيقتان', 'دقائق', 'دقيقة']);
}

/** «مهارة واحدة» · «مهارتين» · «٥ مهارات» — مفعولاً به في سياق التثبيت. */
export const skillsText = (n) => arCount(n, ['مهارة واحدة', 'مهارتين', 'مهارات', 'مهارة']);

/** لحظةٌ كما يقرؤها وليّ الأمر: «أحد ٣/٨ · ٦:٤٠». */
export function whenText(at) {
  const d = new Date(at);
  const time = `${arNum(d.getHours())}:${arNum(String(d.getMinutes()).padStart(2, '0'))}`;
  return `${DAY_NAMES[d.getDay()]} ${arNum(d.getDate())}/${arNum(d.getMonth() + 1)} · ${time}`;
}

/**
 * توصية اليوم — دالّة خالصة تُختبر وحدها.
 * الترتيب مقصود: صحّة الطفل (سقف الوقت) قبل التحصيل، والمراجعة قبل الجديد
 * (ما تعثّر فيه أولى بالتثبيت من محطةٍ جديدة تُبنى على متزعزع).
 */
export function recommend({
  started = false, dueCount = 0, secondsToday = 0, reviewDone = false, nextTitle = '',
} = {}) {
  const minutes = Math.round(secondsToday / 60);
  if (!started) {
    return {
      title: 'ابدآ الرحلة معاً',
      body: 'أول محطة في المرحلة الأولى — اجلس معه في أول محطتين حتى تتضح له اللعبة.'
        + ' وأوّلُ الرحلة كمياتٌ وأصواتٌ لا رموز، فلا يحتاج قراءةً البتّة.',
      action: { label: 'افتح الخريطة', hash: '#/' },
    };
  }
  if (minutes >= ENOUGH_MINUTES) {
    return {
      title: 'أخذ نصيبه اليوم',
      body: `تعلّم اليوم ${minutesText(secondsToday)} — الزيادة على هذا تُتعب طفلاً في هذه`
        + ' السنّ أكثر مما تنفعه. أعِده غداً.',
      action: null,
    };
  }
  if (dueCount && !reviewDone) {
    return {
      title: 'ابدأ بمراجعة اليوم',
      body: `حان وقت تثبيت ${skillsText(dueCount)} (تمارين قصيرة مما درسه).`
        + ' المراجعة قبل المحطة الجديدة.',
      action: { label: 'ابدأ المراجعة', hash: '#/review' },
    };
  }
  if (nextTitle) {
    return {
      title: 'واصِلا المحطة التالية',
      body: `التالي في رحلته: ${nextTitle}.`,
      action: { label: 'افتح الخريطة', hash: '#/' },
    };
  }
  return {
    title: 'أتمّ الرحلة كلها',
    body: 'أعِد معه المراجعة اليومية — التثبيت بعد الإتمام هو ما يُبقي الحساب في يده.',
    action: { label: 'ابدأ المراجعة', hash: '#/review' },
  };
}

// ————— البوابة الحسابية —————
//
// **وموضعُها من هذا التطبيق بعينه طريف ومقصود**: التطبيق يعلّم الحساب، والبوابةُ
// عمليةُ ضربٍ — وهي فوق جبهة المستوى الأول كلِّه (حدُّه العشرون جمعاً وطرحاً، ولا
// ضربَ فيه أصلاً). فلا يفتحها طفلٌ أتمّ الرحلة كلَّها، لا لأنه لم يُحاول بل لأنّ
// مادّتها ليست من منهجه.

function question() {
  const a = 6 + Math.floor(Math.random() * 7);    // ٦…١٢
  const b = 7 + Math.floor(Math.random() * 6);    // ٧…١٢
  return { a, b, answer: a * b };
}

/** يقبل الرقمين المشرقيّ والمغربيّ معاً (وليّ الأمر يكتب بلوحة مفاتيح جهازه). */
export function readNumber(text) {
  const normalized = String(text ?? '').trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  return /^\d+$/.test(normalized) ? Number(normalized) : NaN;
}

/**
 * بطاقة البوابة — عمليةُ ضربٍ لا يحلّها طفلُ هذه السنّ.
 * تُستعمل شاشةً كاملة للوحة، وتصلح نافذةً فوق شاشةٍ أخرى إن احتيج إذنُ بالغ —
 * بوابةٌ واحدة لا نسختان منها.
 */
export function gateCard({ hint: hintText = 'هذه الشاشة لوليّ الأمر — أجب لتدخل.', onPass, onCancel } = {}) {
  let q = question();
  const prompt = h('div', { class: 'giant', css: { '--accent': ACCENT, 'font-size': '2.6rem' } },
    `${arNum(q.a)} × ${arNum(q.b)}`);
  const input = h('input', {
    class: 'chip',
    type: 'text',
    inputmode: 'numeric',
    autocomplete: 'off',
    'aria-label': 'ناتج الضرب',
    css: { 'min-width': '8rem', 'text-align': 'center', border: '2px solid var(--line)', font: 'inherit' },
  });
  const hint = h('p', { class: 'hint' }, hintText);

  function check() {
    if (readNumber(input.value) === q.answer) {
      // عند أول بوابةِ وليّ أمر يُطلب التخزين الدائم — فعلُ بالغٍ لا فعلُ طفل، ووراءه
      // نيّةٌ معلَنة. ورفضُه لا يعطّل شيئاً، ولا ننتظر جوابه كي لا تتأخّر الشاشة عليه.
      progress.askPersistence();
      return onPass();
    }
    shake(input);
    input.value = '';
    q = question();
    prompt.textContent = `${arNum(q.a)} × ${arNum(q.b)}`;
    hint.textContent = 'ليس هذا الناتج — جرّب هذه.';
    input.focus();
  }

  return h('div', { class: 'gate', css: { '--accent': ACCENT } },
    h('h2', {}, 'كم الناتج؟'),
    prompt,
    hint,
    h('div', { class: 'row' },
      input,
      h('button', { class: 'btn btn--primary gate-go', onclick: check }, 'ادخل'),
      onCancel && h('button', { class: 'btn gate-cancel', onclick: onCancel }, 'ليس الآن'),
    ),
  );
}

function gateScreen(onPass) {
  return h('div', { class: 'screen', css: { '--accent': ACCENT } },
    topbar(
      h('button', { class: 'btn', onclick: () => go('#/') }, '→ الخريطة'),
      h('span', { class: 'spacer' }),
      h('span', { class: 'pill' }, 'لوحة وليّ الأمر'),
    ),
    h('main', { class: 'screen-card' }, gateCard({ onPass })),
  );
}

// ————— اللوحة —————

function pill(label, value) {
  return h('span', { class: 'pill' }, `${label}: `, h('b', {}, value));
}

/**
 * تأكيدٌ صريح **في الصفحة** لا بـ`confirm()` — وهذه الأفعال تكتب فوق رحلة الطفل
 * فلا تقع بنقرةٍ واحدة. ونافذة المتصفّح لا تصلح هنا: أزرارها بلغة الجهاز لا بلغتنا،
 * ولا تتّسع لشرح أثر الفعل — وهنا يُقرأ ما سيقع بالضبط قبل أن يقع.
 */
function askThen(box, { question: ask, body, yes, onYes }) {
  const close = () => box.replaceChildren();
  box.replaceChildren(h('div', { class: 'note confirm' },
    h('b', {}, ask),
    body && h('p', { class: 'hint', css: { margin: '.35rem 0 0' } }, body),
    h('div', { class: 'row', css: { 'justify-content': 'flex-start', 'margin-top': '.6rem' } },
      h('button', { class: 'btn btn--primary confirm-yes', onclick: () => { close(); onYes(); } }, yes),
      h('button', { class: 'btn confirm-no', onclick: close }, 'إلغاء')),
  ));
}

const nodesText = (n) => arCount(n, ['عقدة واحدة', 'عقدتين', 'عقد', 'عقدة']);

/** تنزيل ملف النسخة — نصٌّ في `Blob`، بلا شبكةٍ ولا خادم (كل شيء في الجهاز). */
function saveBackupFile() {
  const url = URL.createObjectURL(
    new Blob([progress.backupText()], { type: 'application/json' }));
  const link = h('a', { href: url, download: progress.backupName() });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 20000);
}

/** ما في النسخة بعبارة وليّ الأمر — يُقرأ قبل التأكيد لا بعده. */
function summaryText(sum) {
  return `★ ${arNum(sum.stars)} في ${nodesText(sum.nodes)} · ${skillsText(sum.skills)} مقيسة`
    + (sum.savedAt ? ` · حُفظت ${whenText(sum.savedAt)}` : '');
}

/** **بابُ وضع المعاينة — خلف بوابة وليّ الأمر** (بذرةُ اقرأ):
 *
 *  المقيّمُ يحتاج أن يرى المحطات كلَّها، والطفلُ يحتاج ألّا يقفز إلى ما لم يبلغه.
 *  ولو وُضع الزرُّ في شاشة الطفل لَفتحه بنفسه ولو باللمس العابر — **فموضعُه هذه
 *  اللوحة**: هي محميّةٌ سلفاً بمسألةِ ضربٍ يعجز عنها الطفل. فالتحقّقُ من أنّ
 *  المستعمل ليس الطفل قائمٌ بالبناء لا بزرٍّ ثانٍ. */
function previewSection() {
  return h('div', {},
    h('p', { class: 'hint' },
      'تفتح المحطاتِ كلَّها للاطّلاع — **ولا يُحفَظ أيُّ تقدّم**: تُغلق الصفحةَ'
        .replace(/\*\*/g, '')
      + ' فيعود الجهازُ كما كان.'),
    h('div', { class: 'row' },
      h('button', {
        class: 'btn btn--primary',
        onclick: () => { location.href = `${location.pathname}?preview=1`; },
      }, 'افتح وضع المعاينة')),
    h('p', { class: 'note' },
      'وهو للمعلّم أو وليّ الأمر يقيّم التطبيق — لا للطفل: القفلُ التسلسليّ'
      + ' (لا يُعرض عليه ما لم يبلغه) من أسس المنهج لا قيدٍ عليه.'),
  );
}

function backupSection(rerender) {
  const slot = h('div', { class: 'confirm-slot' });
  const storage = h('p', { class: 'hint' }, 'التخزين على هذا الجهاز: جارٍ الفحص…');

  // نسخةُ القشرة تُرى (أمر المالك، ١٣ أغسطس ٢٠٢٦): سطرٌ هادئ يؤكّد وصولَ آخر
  // تحديثٍ إلى هذا الجهاز — تُسأل القشرةُ نفسُها فلا رقمَ يُكتب بيد.
  const swVersion = h('p', { class: 'hint', 'data-sw-version': '' }, 'نسخة القشرة: —');

  /* ————— سطرُ الأصوات المخزونة (الجلسة ص — عاد مع بنك الصوت، `SEED.md §٢`) —————

     **حالُ التحميل تُرى وتُدار** (أمر المالك في اقرأ، ١٣ أغسطس ٢٠٢٦): كان الخزنُ
     يجري صامتاً فلا يعرف أحدٌ أتمَّ أم لا — حتى فُتح التطبيقُ بلا شبكةٍ فصمت الصوت،
     وظُنّ العيبُ في البرنامج. فصار السطرُ **شريطاً حيّاً** يتحرّك مع كل دفعةٍ يبلّغها
     عاملُ الخدمة، ومعه **زرٌّ يبدأ التحميل الآن** بدل انتظار مهلة الشفاء. */
  const cached = h('p', { class: 'hint' });
  const bar = h('div', { class: 'dl-bar' }, h('span', { class: 'dl-fill' }));
  const fill = bar.firstChild;
  const dlBtn = h('button', { class: 'btn' }, 'نزّل الأصوات الآن');
  const dlRow = h('div', { class: 'dl' }, cached, bar, dlBtn);
  dlRow.hidden = true;                 // لا سطرَ قبل أن يُعرَف أنّ ثمّ بنكاً يُخزَّن

  const paint = (stored, total, busy) => {
    if (!total) return;
    dlRow.hidden = false;
    const pct = Math.min(100, Math.round((stored / total) * 100));
    fill.style.width = `${pct}%`;
    bar.classList.toggle('dl-bar--done', stored >= total);
    const head = `الأصوات المخزونة: ${arNum(stored)} من ${arNum(total)} (${arNum(pct)}٪)`;
    cached.textContent = stored >= total
      ? `${head} — كلُّها على الجهاز، فيعمل التطبيق بلا إنترنت.`
      : busy
        ? `${head} — يُنزَّل الآن، أبقِ التطبيق مفتوحاً.`
        : `${head} — ما نقص يُجلَب عند سماعه، ويكتمل حين يُفتح التطبيق متصلاً.`;
    dlBtn.hidden = stored >= total;
    dlBtn.textContent = busy ? 'يُنزَّل…' : 'نزّل الأصوات الآن';
    dlBtn.disabled = Boolean(busy);
  };

  /** طلبٌ صريح إلى عامل الخدمة — هو وحدَه يملك المخزن. */
  dlBtn.onclick = () => {
    const sw = navigator.serviceWorker?.controller;
    if (!sw) return void toast('التحميل يبدأ بعد تثبيت التطبيق');
    sw.postMessage({ type: 'audio-sync' });
    dlBtn.disabled = true;
    dlBtn.textContent = 'يُنزَّل…';
  };

  // بلاغاتُ العامل بعد كل دفعة — فالشريطُ يتحرّك بما يجري لا بتقديرٍ منّا
  navigator.serviceWorker?.addEventListener?.('message', (e) => {
    if (e.data?.type === 'audio-progress') paint(e.data.stored, e.data.total, e.data.busy);
    if (e.data?.type === 'version' && swVersion.isConnected) {
      swVersion.textContent = `نسخة القشرة: ${e.data.version}`;
    }
  });
  navigator.serviceWorker?.controller?.postMessage({ type: 'version' });
  progress.audioStored().then((count) => {
    if (count) paint(count.stored, count.total, false);
  });

  progress.persistedStorage().then((persisted) => {
    if (!storage.isConnected) return;
    storage.textContent = persisted === null
      ? 'هذا المتصفّح لا يعلن حال تخزينه — والنسخة الاحتياطية تكفيك مؤونته.'
      : persisted
        ? 'تخزين هذا الجهاز موسومٌ دائماً: لا يخليه المتصفّح عند ضيق المساحة.'
        : 'لم يسم المتصفّح تخزين التطبيق دائماً بعدُ — قد يُخليه عند ضيق المساحة،'
          + ' فاحتفظ بنسخةٍ حديثة. (تثبيت التطبيق على الشاشة الرئيسية يرجّح تثبيته.)';
  });

  const file = h('input', {
    type: 'file',
    accept: '.json,application/json',
    class: 'file-pick',
    'aria-label': 'اختر ملف نسخةٍ لاستعادته',
    onchange: async (event) => {
      const chosen = event.target.files?.[0];
      if (!chosen) return;
      const read = progress.readBackup(await chosen.text());
      file.value = '';                       // كي يقبل اختيار الملف نفسه ثانيةً
      if (read.error) {
        slot.replaceChildren(h('p', { class: 'note note--bad' }, read.error));
        return;
      }
      const sum = progress.backupSummary(read.bundle);
      askThen(slot, {
        question: 'استعادة هذه النسخة؟',
        body: `فيها: ${summaryText(sum)}. وستحلّ محلّ ما في هذا الجهاز الآن`
          + ` (${summaryText(progress.backupSummary(progress.backup()))}) — فلا رجعة بعدها.`,
        yes: 'استعِد الآن',
        onYes: () => {
          if (!progress.restore(read.bundle)) {
            slot.replaceChildren(h('p', { class: 'note note--bad' }, 'تعذّرت الاستعادة.'));
            return;
          }
          toast('استُعيد تقدّم طفلك');
          rerender();
        },
      });
    },
  });

  return h('div', {},
    h('p', { class: 'hint' },
      'تقدّم طفلك محفوظ في هذا الجهاز وحده — لا حساب ولا سحابة. فاحفظ نسخةً بين'
      + ' حينٍ وآخر: ملفٌّ صغير يعيد رحلته كما هي إن حذفتَ التطبيق أو بدّلتَ الجهاز.'),
    h('div', { class: 'row', css: { 'justify-content': 'flex-start' } },
      h('button', {
        class: 'btn btn--primary backup-save',
        onclick: () => { saveBackupFile(); toast('حُفظت نسخةُ التقدّم'); },
      }, 'انسخ تقدّم طفلي'),
      // الملصق زرٌّ بحقّ: يُفتح باللمس وبالفأرة **وبلوحة المفاتيح** — ومدخلُ الملف
      // مخفيٌّ فيه لأن مظهره الأصليّ نصٌّ بلغة الجهاز لا بلغة اللوحة.
      h('label', {
        class: 'btn file-label',
        role: 'button',
        tabindex: '0',
        onkeydown: (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          file.click();
        },
      }, 'استعِد من ملف', file),
    ),
    slot,
    dlRow,
    storage,
    swVersion,
    h('p', { class: 'note' },
      'في النسخة: النجوم وصناديق المراجعة ودقائق التعلّم. ولا شيء فيها يخرج من'
      + ' جهازك إلا إن أرسلتَ الملفَّ بنفسك.'),
  );
}

/** اسم المحطة كما يقرؤه وليّ الأمر في قائمة الاختيار. */
const sectionLabel = (section, index) => `${arNum(index + 1)} — ${section.title || section.id}`;

function journeySection(rerender) {
  const sections = progress.journey();
  if (!sections.length) {
    return h('p', { class: 'hint' },
      'لا محطة في الرحلة بعد — تُكتب بيانات المنهج ثم تظهر هنا محطةً محطة.');
  }

  const next = progress.nextNode();
  const here = sections.findIndex((s) => (s.nodes || []).some((n) => n.id === next?.id));

  // ١) تخطٍّ للأمام: القفل التسلسلي طوعُ وليّ الأمر — لطفلٍ يعرف ما قبله أصلاً
  const nodePick = h('select', { class: 'chip pick', 'aria-label': 'العقدة التي يُفتح الطريق إليها' },
    sections.map((section, i) => h('optgroup', { label: sectionLabel(section, i) },
      (section.nodes || []).map((node) => h('option', { value: node.id }, node.title || node.id)))));
  if (next) nodePick.value = next.id;
  const openSlot = h('div', { class: 'confirm-slot' });

  const openBtn = h('button', {
    class: 'btn open-to',
    onclick: () => {
      const node = progress.findNode(nodePick.value);
      const count = progress.pendingBefore(nodePick.value);
      if (!node) return;
      if (!count) { toast('هذه مفتوحة له أصلاً'); return; }
      askThen(openSlot, {
        question: `تفتح الطريق إلى «${node.title || node.id}»؟`,
        body: `${nodesText(count)} قبلها ستُعدّ منجَزةً بنجمةٍ واحدة — تبقى مفتوحةً`
          + ' يلعبها متى شاء، ولا تُنقَص نجمةٌ كسبها. والقياس لا يتغيّر: لم يُمتحن فيها بعد.',
        yes: 'افتح الطريق',
        onYes: () => {
          toast(`فُتحت ${nodesText(progress.unlockUpTo(node.id))}`);
          rerender();
        },
      });
    },
  }, 'افتح الطريق إلى هنا');

  // ٢) إعادة التدريب: تصفير محطةٍ بعينها — نجومُها وحدها، وسجلّ ليتنر لا يُمسّ
  const sectionPick = h('select', { class: 'chip pick', 'aria-label': 'المحطة التي تُصفَّر' },
    sections.map((section, i) => h('option', { value: section.id }, sectionLabel(section, i))));
  if (here >= 0) sectionPick.value = sections[here].id;
  const resetSlot = h('div', { class: 'confirm-slot' });

  const resetBtn = h('button', {
    class: 'btn reset-section',
    css: { color: 'var(--err-text)' },
    onclick: () => {
      const index = sections.findIndex((s) => s.id === sectionPick.value);
      const section = sections[index];
      const info = progress.sectionProgress(sectionPick.value);
      if (!section || !info) return;
      if (!info.done) { toast('لم يبدأ هذه المحطة بعد'); return; }
      askThen(resetSlot, {
        question: `تصفّر محطة «${sectionLabel(section, index)}» ليعيدها؟`,
        // **والخبرُ يصدُق ما يقع** (حكم المدير، ١٣ أغسطس ٢٠٢٦ — بعد الترحيل الرحيم في
        // الجلسة ش): كان النصُّ يَعِد بأنّ ما بعدها يُقفَل، وقد صار ما أنجزه الطفلُ
        // يبقى مفتوحاً على صاحبه أبداً — فلا يُوعَد والدٌ بما لا يقع.
        body: `${nodesText(info.done)} فيها تعود إلى أولها و${arNum(info.stars)} نجمة تسقط،`
          + ' فتدعوه الرحلةُ إليها من جديد — وما أنجزه بعدها يبقى مفتوحاً ونجومُه هناك'
          + ' محفوظة كما كسبها. أما سجلّ مهاراته ودقائق تعلّمه فلا يمسّها التصفير.',
        yes: 'صفِّر المحطة',
        onYes: () => {
          toast(`صُفِّرت ${nodesText(progress.clearSection(section.id))}`);
          rerender();
        },
      });
    },
  }, 'صفِّر هذه المحطة');

  return h('div', {},
    h('p', { class: 'hint' },
      'الرحلة مقفلة بالتسلسل: لا تُفتح عقدةٌ قبل ما قبلها. وهنا تتجاوز القفل إن كان'
      + ' طفلك يعرف ما قبله، أو تعيد محطةً كاملة إن رأيت أن يعيد تدريبها.'),
    h('div', { class: 'row parent-tool' }, nodePick, openBtn),
    openSlot,
    h('div', { class: 'row parent-tool' }, sectionPick, resetBtn),
    resetSlot,
  );
}

// ————— أقسام الحساب السبعة: **مفهومٌ بعملية لا درجة** (`METHOD.md §٦`) —————
//
// نصُّ المنهج: «لوحة وليّ الأمر: مفهومٌ بعملية لا درجة — (يقدّر حتى ٥ فوراً)، (يحتاج
// تثبيت جسور ١٠) — بأقسامها (كمّ · عدّ · رموز · مقارنة · جسور · عمليات · أنماط)».
//
// **وهذه الوحدةُ تُترجم ولا تخترع**: أسماءُ المفاهيم وعباراتُها بياناتُ منهج
// (`CONCEPTS` في `curriculum.js` — مَن كتب مفتاحَ ليتنر يسمّيه)، **والمدى يُقرأ من
// سجلّ ليتنر الحيّ**: أقصى ما بلغ صندوقَ الإتقان في «يفعل»، ومدى أضعف مهارةٍ في
// «يحتاج». فلا رقمَ في هذه اللوحة مكتوبٌ بيد ولا عبارةَ تُقال بلا سجلٍّ يسندها.
//
// **ولا درجةَ ولا نسبة**: عددا الصواب والخطأ يبقيان في `title` لمن أراد التفصيل،
// وما يقع عليه بصرُ الوالد **جملةٌ فعلية**.

/**
 * سطرُ مفهومٍ واحد من حصيلته في ليتنر — دالّةٌ خالصة (تُختبَر بسجلٍّ مصنوع).
 *
 * @param {object} stat  عنصرٌ من `progress.conceptStats()` (وفيه `parts` بالأضعف أولاً)
 * @param {number} today رقمُ اليوم — لقياس طول التعثّر (`STUCK_DAYS`)
 * @returns {{concept, section, title, line, state, stuck}|null} و`null` لمفهومٍ لا
 *   تعرفه بياناتُ المنهج (يُمسكه `test_parent.mjs` ولا يُعرَض للوالد مفتاحٌ خام).
 */
export function conceptLine(stat, today = progress.dayNumber()) {
  const spec = conceptOf(stat.concept);
  if (!spec) return null;
  const parts = stat.parts || [];
  const weakest = parts[0];                       // `conceptStats` رتّبها بالضعف
  const done = parts.filter((s) => s.box >= progress.MASTERED_BOX);
  /** أقصى ما أتقن: أكبرُ مدىً عدديّ، أو أسماءُ الأوجه الوصفية مجموعةً. */
  const numeric = done.map((s) => Number(s.range)).filter(Number.isFinite);
  const reached = numeric.length
    ? rangeText(Math.max(...numeric))
    : done.map((s) => rangeText(s.range)).filter(Boolean).join(' و');
  const fill = (text, what) => text.replace('{ما}', what);

  // ثلاثُ حالات: أتقن كلَّ تمارينه · تعثّر · بينهما — ولكلٍّ عبارتُها من بيانات المنهج
  const state = stat.mastered ? 'mastered' : stat.struggling ? 'struggling' : 'learning';
  const stuck = Boolean(stat.struggling && weakest
    && today - (weakest.since ?? weakest.seen ?? today) >= STUCK_DAYS);
  const learning = weakest ? `يتدرّب على ${rangeText(weakest.range)}` : '';
  const line = state === 'mastered'
    ? fill(spec.does, reached)
    : state === 'struggling'
      ? fill(spec.needs, rangeText(weakest.range))
      // **وما أتقنه يُقال قبل ما يتدرّب عليه**: الوالدُ يقرأ تقدّمَ طفله لا نقصَه
      : [reached && fill(spec.does, reached), learning].filter(Boolean).join('، و');

  return {
    concept: stat.concept,
    section: spec.section,
    title: spec.title,
    line,
    state,
    stuck,
    // للتفصيل عند الطلب (يُعرَض في `title` لا في السطر): عددا الصواب والخطأ
    right: stat.right,
    wrong: stat.wrong,
  };
}

/**
 * أسطرُ المفاهيم كلُّها من السجلّ الحيّ — **بترتيب اللوحة ثم بترتيب الرحلة**:
 * الأقسامُ كما أعلنها المنهج، وداخلَ القسم يقرأ الوالدُ المفاهيمَ بالترتيب الذي
 * لقيها طفلُه (التقديرُ الفوريّ قبل المطابقة) لا بترتيب حروفها اللاتينية.
 */
export function conceptLines(stats = progress.conceptStats(), today = progress.dayNumber()) {
  const order = CONCEPT_SECTIONS.map((s) => s.id);
  const flow = journeyConcepts();
  return stats.map((stat) => conceptLine(stat, today)).filter(Boolean)
    .sort((a, b) => order.indexOf(a.section) - order.indexOf(b.section)
      || flow.indexOf(a.concept) - flow.indexOf(b.concept));
}

function conceptsSection(lines) {
  if (!lines.length) {
    return h('p', { class: 'hint' },
      'لم يُقَس شيءٌ بعد — تظهر هنا مفاهيمُه السبعة (كمّ · عدّ · رموز · مقارنة ·'
      + ' جسور · عمليات · أنماط) بعباراتها حين يبدأ رحلته.');
  }
  const colour = (state) => (state === 'mastered' ? GOOD : state === 'struggling' ? BAD : ACCENT);
  const row = (item) => h('div', {
    class: `concept concept--${item.state}`,
    css: { '--chip': colour(item.state) },
    // **التفصيلُ عند الطلب لا في السطر**: مَن أراد العددَ وجده، ولا يزاحم العبارةَ
    title: `${item.title}: ${arNum(item.right)} صواب، ${arNum(item.wrong)} خطأ`,
  },
    h('b', {}, item.title),
    h('span', { class: 'concept-line' }, item.line));

  return h('div', { class: 'concepts' }, CONCEPT_SECTIONS.map((section) => {
    const mine = lines.filter((item) => item.section === section.id);
    return h('div', { class: 'concept-group' },
      h('h4', {}, section.title),
      mine.length
        ? mine.map(row)
        // **وقسمٌ لم يبلغه بعدُ يقول ذلك** ولا يُخفى: الوالدُ يرى الرحلةَ كلَّها
        : h('p', { class: 'hint' }, 'لم يبلغ هذا القسم بعد.'));
  }));
}

/**
 * **حدُّ النطاق في اللوحة** (`METHOD.md §١٣`): «تدريسٌ وقياس **لا تشخيص**: التعثّرُ
 * المتكرر إشارة «راجِع مختصاً»، لا حكماً — تُكتب في لوحة وليّ الأمر بهذا اللفظ».
 *
 * فالسياسةُ مكتوبةٌ دائماً (أدناه في اللوحة)، **والإشارةُ تُرفَع حين تقع**: مفهومٌ
 * تعثّر فيه ثلاثةَ أسابيع فأكثر وما زال في الصندوق الأدنى — يُسمّى باسمه، بلا لفظِ
 * حكمٍ ولا تشخيصٍ ولا نسبة.
 */
function stuckNote(lines) {
  const stuck = lines.filter((item) => item.stuck);
  if (!stuck.length) return null;
  return h('p', { class: 'note note--bad concept-stuck' },
    h('b', {}, 'راجِع مختصاً — إشارةٌ لا حكم. '),
    `تعثّر طفلك أسابيعَ متّصلة في: ${stuck.map((item) => item.title).join('، ')}.`
    + ' وهذا التطبيق يدرّس ويقيس ولا يشخّص — فأرِ طفلك مختصاً ليطمئنّ قلبك،'
    + ' وواصِلا اللعب معاً كما أنتما: مراجعتُه اليومية تعيد هذه المفاهيم بنفسها.');
}

function dashboard(rerender = () => {}) {
  const due = progress.dueSkills();
  const next = progress.nextNode();
  const today = progress.secondsOn();
  const week = progress.usageDays(7);
  const streak = progress.reviewStreak();
  const lines = conceptLines();
  const tip = recommend({
    started: progress.totalStars() > 0,
    dueCount: due.length,
    secondsToday: today,
    reviewDone: Boolean(progress.reviewOf()),
    nextTitle: next?.title || '',
  });

  const section = (title, ...children) => [h('h3', {}, title), ...children];

  const main = h('main', { class: 'screen-card audit' },
    h('h2', {}, 'لوحة وليّ الأمر'),

    h('div', { class: 'audit-row' },
      pill('اليوم', minutesText(today)),
      pill('هذا الأسبوع', minutesText(week.reduce((s, d) => s + d.seconds, 0))),
      pill('المجموع', minutesText(progress.totalSeconds())),
      pill('النجوم', `${arNum(progress.totalStars())} / ${arNum(progress.maxTotalStars())}`),
      pill('مراجعات متتابعة', arNum(streak)),
    ),

    ...section('توصية اليوم',
      h('div', { class: 'note', css: { 'text-align': 'start' } },
        h('b', {}, tip.title),
        h('p', { class: 'hint', css: { margin: '.25rem 0 0' } }, tip.body)),
      tip.action && h('div', { class: 'row', css: { 'justify-content': 'flex-start', 'margin-top': '.75rem' } },
        h('button', { class: 'btn btn--primary', onclick: () => go(tip.action.hash) }, tip.action.label))),

    ...section(`مفاهيمُ الحساب (${arNum(CONCEPT_SECTIONS.length)} أقسام)`,
      conceptsSection(lines), stuckNote(lines)),

    ...section('دقائق آخر سبعة أيام',
      h('div', { class: 'audit-row' }, week.map((day) => {
        const d = new Date(`${day.key}T00:00:00`);
        const minutes = Math.round(day.seconds / 60);
        return h('span', {
          class: 'pill',
          css: day.seconds ? { color: 'var(--star-text)' } : { opacity: '.55' },
        }, `${DAY_NAMES[d.getDay()]}: `, h('b', {}, minutes ? arNum(minutes) : '—'));
      })),
      h('p', { class: 'hint' }, 'الزمن يُحسب وقت انتباهه للشاشة فقط (لا يُحسب إن تركها مفتوحة).')),

    ...section('أين هو الآن',
      h('p', { class: 'hint' }, next
        ? `التالي: ${next.title || next.id}.`
        : 'لا محطة تالية — الرحلة تُكتب بعد.'),
      h('p', { class: 'hint' },
        `بانتظار التثبيت الآن: ${arNum(due.length)} من ${arNum(progress.skills().length)} مهارة سُجّلت.`)),

    ...section('نسخة احتياطية من تقدّمه', backupSection(rerender)),

    ...section('تحكّم في الرحلة', journeySection(rerender)),

    ...section('معاينةُ التطبيق كلِّه', previewSection()),

    // **حدودُ النطاق معلَنةٌ في اللوحة نفسِها** (`METHOD.md §١٣`): تدريسٌ وقياسٌ لا
    // تشخيص — والتعثّرُ المتكرر إشارةُ «راجِع مختصاً» لا حكماً.
    h('p', { class: 'note' },
      'المهارة = المفهوم × المدى × نوع التمرين. الخطأ يعيدها إلى مراجعة الغد،'
      + ' والإصابة تُباعد موعدها (١ ← ٢ ← ٤ ← ٨ ← ١٦ يوماً).'
      + ' وهذا التطبيق **يدرّس ويقيس ولا يشخّص**: إن تكرّر تعثّرُ طفلك في مفهومٍ'
      + ' واحد أسابيع فراجِع مختصاً — هذه إشارةٌ لا حكم.'),
  );

  return h('div', { class: 'screen', css: { '--accent': ACCENT } },
    topbar(
      h('button', { class: 'btn', onclick: () => go('#/') }, '→ الخريطة'),
      h('span', { class: 'spacer' }),
      h('span', { class: 'pill' }, 'لوحة وليّ الأمر'),
    ),
    main,
  );
}

/** الشاشة: البوابة أولاً، ثم اللوحة — والفتح يبقى ما دامت الصفحة مفتوحة. */
export function renderParent(rerender) {
  if (unlocked) return dashboard(rerender);
  return gateScreen(() => {
    unlocked = true;
    rerender();
  });
}

/** لإعادة إغلاق البوابة في الاختبارات. */
export function lockGate() {
  unlocked = false;
}
