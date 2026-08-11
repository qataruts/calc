// نقطة الدخول: خريطة الرحلة والتوجيه بين الشاشات.
//
// ————— بذرةُ المنصة (منسوخةٌ من «اِقْرَأْ» ومجرَّدةٌ من مادّته) —————
//
// **والتجريدُ هنا أعمقُ من حذفِ أسماء**: خريطةُ اقرأ كانت تعرف أنواعَ محطاتها
// (مجموعةٌ · بستانٌ · سورةٌ · رفٌّ …) فلكلٍّ دالّةُ رسمٍ خاصّة بها، وموجِّهُها يعرف
// أسماءَ شاشاتها واحدةً واحدة. وهنا **القسمُ يصف نفسَه** في `curriculum.js` (عنوانٌ
// ووجهٌ ومعلمٌ ولون)، فترسمه الخريطةُ من وصفه — و**الموجِّهُ يفتح الشاشةَ من سِجلٍّ
// تسجّل فيه كلُّ وحدةِ تمارينٍ نفسَها** (`registerScreen`). فمحطةٌ جديدة تدخل الرحلة
// بلا سطرٍ يُعدَّل في هذا الملفّ — وهو معنى «الرحلة تُحسب من البيانات».
//
// وبه تُفتَح شاشةُ خريطةٍ **فارغة** اليوم بلا خطأ: صفرُ قسمٍ يعني صفرَ بطاقة، ورسالةً
// تقول ما الحال. وهو معيارُ قبول الجلسة ٠.

import * as progress from './progress.js';
import * as audio from './audio.js';
import { registerScreen, hasScreen, screenFor } from './registry.js';
import { renderReview } from './review.js';
import { renderGate } from './gate.js';
import { renderParent, skillsText } from './parent.js';
import { renderGallery } from './render.js';
/* **وحداتُ التمارين تُحمَّل لأثرها**: كلُّ وحدةٍ تسجّل شاشاتِ أنواعها في السجلّ
   (`registry.js`) وتمارينَها في المراجعة عند تحميلها — فلا يعرف هذا الملفّ اسمَ شاشةٍ
   واحدة منها، ولا تدخل محطةٌ جديدة بسطرٍ يُعدَّل هنا. والسطرُ الواحدُ لكل **وحدة**
   (لا لكل محطة) ثمنُ أن تصل إليها شجرةُ الاستيراد، وبه يعرف عاملُ الخدمة ماذا يخزّن
   وحارسُ `test_pwa` أنّ الملفَّ حيٌّ لا ميّت. */
import './quantity.js';
import './counting.js';
import './numerals.js';
import './compare.js';
import {
  h, icon, faceEl, toast, go, arNum, starsRow, topbar, brandMark, landmark, DEV,
  PAUSE_ACCENT,
} from './ui.js';

const app = document.getElementById('app');

// ————— سِجلّ الشاشات —————
//
// **مَن يملك نوعَ عقدةٍ يسجّل مُصيِّرَها**، فلا يعرف الموجِّهُ شاشةً بعينها. والسجلُّ
// نفسُه في `registry.js` (وحدةٌ محايدة) لا هنا — وعلّةُ نقله مكتوبةٌ في رأسه: وحدةُ
// التمارين لا تستطيع أن تستورد `main.js` (دَورٌ في الاستيراد، وعقدُ المولّد النقيّ).
// والبوابةُ مسجَّلةٌ هنا لأنها من بذرة المنصة لا من مادّة المنهج (`gate.js`).

registerScreen('gate', renderGate);

/* **لوحُ المصيِّر — في وضع التجربة وحدَه** (`?dev=1`، الجلسة ٢): مرجعٌ بصريّ لأنماط
   الكميات كما ترسمها `render.js` على الشاشة نفسِها بلوحها واتجاهها. منه تُؤخذ
   اللقطاتُ المرجعية، وعليه يقيس حارسُ المتصفّح التراكبَ وترتيبَ الملء من اليمين.
   وهو **ليس محطةً ولا شاشةَ تمرين**: لا عقدةَ له في الرحلة ولا نجمةَ يكتبها، ولا
   طريقَ إليه من شاشة طفلٍ لأنّ التسجيل نفسَه لا يقع إلا تحت `DEV`. */
if (DEV) registerScreen('render', renderGallery);

// ————— خريطة الرحلة —————
//
// **الخريطة كسولة** (درسُ اقرأ — بلاغُ بطء أواخر الرحلة على آيباد قديم): الرحلة
// عشراتُ المحطات، ورسمُها كلَّها في كل مرة يُثقل الجهاز بما لا ينظر إليه الطفل.
// فالبعيد عن جبهته بطاقةُ عنوانٍ مطوية تُفرد بنقرة — ينكمش DOM الصفحة أضعافاً،
// ولا تبعد أيّ عقدة عن الطفل أكثر من نقرتين (افرِد المحطة، ثم اختر العقدة).

const FOLD_NEAR = 2;          // محطتان قبل جبهة الطفل ومحطتان بعدها مفرودتان ابتداءً
const unfolded = new Set();   // ما فرده الطفل بيده — يبقى مفروداً ما دامت الجلسة

/** المحطة التي عليها جبهة الطفل — وآخرُ محطة إن أتمّ الرحلة كلها. */
function focusIndex(sections, next) {
  if (!next) return sections.length - 1;
  const index = sections.findIndex((s) => (s.nodes || []).some((n) => n.id === next.id));
  return index < 0 ? 0 : index;
}

function renderMap() {
  const earned = progress.totalStars();
  const next = progress.nextNode();
  const sections = progress.journey();

  const screen = h('div', {},
    topbar(
      brandMark('h1'),
      h('span', { class: 'spacer' }),
      h('button', {
        class: 'btn btn--ghost',
        'aria-label': 'لوحة وليّ الأمر',
        onclick: () => go('#/parent'),
      }, icon('family')),
      h('span', { class: 'pill pill--stars' },
        `★ ${arNum(earned)} / ${arNum(progress.maxTotalStars())}`),
    ),
  );

  const main = h('main', { class: 'map' });

  const review = reviewCard();
  if (review) main.append(review);

  if (next) {
    main.append(h('button', {
      class: 'continue',
      css: { '--accent': accentOf(next) },
      onclick: () => openNode(next),
    },
      faceEl(next.face, 'continue-face'),
      h('span', { class: 'continue-text' },
        h('b', {}, next.title || next.id),
        h('small', {}, `تابع من هنا · ${progress.sectionOf(next.id)?.title || ''}`)),
    ));
  } else if (sections.length) {
    main.append(h('p', { class: 'note' },
      icon('party'), ' أتممتَ الرحلة كلها — من أول كميةٍ إلى العشرين!'));
  }

  // الدرب المتعرج: انعطافة خيط بين كل محطتين، يمنةً مرة ويسرةً مرة
  const focus = focusIndex(sections, next);
  let stations = 0;
  for (const [index, section] of sections.entries()) {
    if (stations++) main.append(trailEl(stations % 2 === 0));
    // المطويّ: ما بَعُد عن جبهة الطفل ولم يفرده بيده في هذه الجلسة
    const folded = Math.abs(index - focus) > FOLD_NEAR && !unfolded.has(section.id);
    main.append(stationEl(section, index, next, folded));
  }

  // **الرحلة فارغةٌ اليوم — ويُقال ذلك صريحاً** (الجلسة ٠): لا خريطةٌ صامتة تُظنّ
  // عطباً، ولا رقمٌ كاذب. وتسقط هذه الرسالةُ من تلقائها يومَ تُكتب أوّلُ محطة.
  if (!sections.length) {
    main.append(h('div', { class: 'note note--empty' },
      h('b', {}, 'الرحلة لم تُكتب بعد'),
      h('p', { class: 'hint' },
        'هذه بذرةُ التطبيق: الهيكلُ والحرّاس وهويةُ «اِحْسِبْ» قائمة،'
        + ' وبياناتُ المنهج (المراحل الثماني ومحطاتها والبوابات الثلاث) تُكتب في'
        + ' الخطوة التالية — فتظهر هنا محطةً محطة بلا سطرٍ يُعدَّل في هذه الشاشة.')));
  }

  if (DEV) {
    main.append(h('div', { class: 'dev' },
      h('div', { class: 'dev-title' }, 'أدوات التجربة (?dev=1) — لا تظهر للطفل'),
      h('div', { class: 'dev-row' },
        h('button', { class: 'btn', onclick: () => go('#/render/all') }, 'لوحُ المصيِّر'),
        h('button', { class: 'btn', onclick: () => fillAll(1) }, 'أنجِز الكل بنجمة'),
        h('button', { class: 'btn', onclick: () => fillAll(3) }, 'أنجِز الكل بثلاث'),
        h('button', {
          class: 'btn',
          onclick: () => {
            if (!confirm('محو كل تقدّم الطفل؟')) return;
            progress.reset();
            toast('حُذف التقدّم');
            render();
          },
        }, 'محو التقدّم'),
      )));
  }

  screen.append(main);
  return screen;
}

/**
 * بطاقة «مراجعة اليوم» فوق الخريطة: تظهر متى صار للطفل حصيلة يُراجَع فيها،
 * وتتقدّم على «تابع من هنا» لأن تثبيت المتزعزع أولى من محطةٍ جديدة تُبنى عليه.
 * مراجعة اليوم إن تمّت تبقى مفتوحة للإعادة لكنها تفقد نبرة الإلحاح.
 */
function reviewCard() {
  if (progress.skills().length < 2) return null;   // لا حصيلة بعدُ: لا مراجعة

  const due = progress.dueSkills().length;
  const done = Boolean(progress.reviewOf());
  const line = done ? 'تمّت مراجعة اليوم — يمكنك إعادتها'
    : due ? `حان وقت تثبيت ${skillsText(due)}`
      : 'تمارين سريعة مما درسته';

  return h('button', {
    class: `continue continue--review${done ? ' continue--done' : ''}`,
    onclick: () => go('#/review'),
  },
    faceEl(done ? '✓' : icon('repeat'), 'continue-face'),
    h('span', { class: 'continue-text' },
      h('b', {}, 'مراجعة اليوم'),
      h('small', {}, line)),
  );
}

/** لون العقدة أو القسم — من وصف القسم نفسِه، وإلا فلونُ البوابات. */
function accentOf(node) {
  return progress.sectionOf(node.id)?.accent || PAUSE_ACCENT;
}

/**
 * محطة على الدرب — **تُرسَم من وصف القسم لا من نوعه**.
 *
 * المطويّة تُرسَم عنواناً وحده في زرّ يفردها — فيبقى الطفل يرى أين هو ومَن حوله
 * (اسم المحطة ونجومها وقفلها كما هي)، ولا يُبنى من العقد إلا ما يقع تحت بصره.
 * وفرْدُها يبقى ما دامت الجلسة، فلا تُطوى تحت يده كلما عاد إليها.
 */
function stationEl(section, index, next, folded) {
  const nodes = section.nodes || [];
  const unlocked = nodes.length ? progress.isNodeUnlockedById(nodes[0].id) : false;
  const complete = nodes.length > 0 && nodes.every((n) => progress.isDone(n.id));
  const stats = progress.sectionStars(section);

  const station = h('section', {
    class: `station station--${section.kind || 'stage'}`
      + `${unlocked ? '' : ' station--locked'}${complete ? ' station--done' : ''}`,
    css: { '--accent': section.accent || PAUSE_ACCENT },
    'aria-label': `${section.title || section.id}${unlocked ? '' : ' — مقفلة'}`,
  });
  let open = !folded;

  function paint() {
    station.classList.toggle('station--folded', !open);
    const inner = [
      faceEl(section.face || arNum(index + 1), 'station-num'),
      h('div', {},
        h('h2', {}, section.title || section.id),
        h('p', { class: 'station-sub' }, section.sub || ''),
      ),
      h('div', { class: 'station-meta' }, unlocked
        ? [h('b', {}, `★ ${arNum(stats.earned)}`), ` / ${arNum(stats.max)}`]
        : [icon('lock'), ' مقفلة']),
    ];

    /* **الدُّرج يُفتَح ويُغلَق** (بلاغُ المالك في اقرأ، ١٣ أغسطس ٢٠٢٦): كان الطيُّ في
       اتجاهٍ واحد — رأسُ المطويّة زرٌّ يفتح، ورأسُ المفتوحة لا يفعل شيئاً. فصار
       الرأسُ **زرّاً في الحالين**: علامتُه `▾` مطويّةً و`▴` مفتوحة، و`aria-expanded`
       يقول حالَه لقارئ الشاشة — فيُعرَف الدُّرجُ بالنظر وباللمس. */
    const head = h('button', {
      class: 'station-head station-head--fold',
      'aria-expanded': open ? 'true' : 'false',
      'aria-label': `${section.title || section.id} · انقر ${open ? 'لضمّ عقدها' : 'لعرض عقدها'}`,
      onclick: () => {
        open = !open;
        if (open) unfolded.add(section.id); else unfolded.delete(section.id);
        paint();
      },
    }, inner, h('span', { class: 'fold-sign', 'aria-hidden': 'true' }, open ? '▴' : '▾'));

    if (!open) {
      station.replaceChildren(head);
      return;
    }

    const track = h('ol', { class: 'track' });
    for (const node of nodes) track.append(h('li', {}, nodeButton(node, next)));
    station.replaceChildren(head, track);
    if (section.mark) station.append(landmark(section.mark));
  }

  paint();
  return station;
}

/**
 * انعطافة خيط الدرب بين محطتين — زخرفة صامتة. تتكرّر عشراتِ المرات في كل رسمة،
 * فيُحلَّل رسمها مرة واحدة ثم يُستنسخ (تحليل HTML أغلى من نسخ عقدة جاهزة).
 */
let trailTemplate = null;
function trailEl(flip) {
  if (!trailTemplate) {
    trailTemplate = h('div', { class: 'trail', 'aria-hidden': 'true' });
    trailTemplate.innerHTML = `<svg viewBox="0 0 72 36" fill="none">
      <path d="M14 2 C 40 10, 32 26, 58 34" stroke="var(--ink-soft)" stroke-width="3"
        stroke-linecap="round" stroke-dasharray="1 8" opacity=".55"/></svg>`;
  }
  const el = trailTemplate.cloneNode(true);
  if (flip) el.classList.add('trail--flip');
  return el;
}

/**
 * معلم «إعادة» على العقدة المنجَزة (درسُ اقرأ — لم يكن بيّناً أن المنجَز يبقى مفتوحاً
 * للإعادة). سهمٌ دائريّ خفيف على حافة العقدة، لا إيموجي، ولا يزاحم وجهها.
 */
let replayTemplate = null;
function replayMark() {
  if (!replayTemplate) {
    replayTemplate = h('span', { class: 'node-replay', 'aria-hidden': 'true' });
    replayTemplate.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 3.5v5h-5"/></svg>`;
  }
  return replayTemplate.cloneNode(true);
}

function nodeButton(node, next) {
  const stars = progress.getStars(node.id);
  const open = progress.isNodeUnlockedById(node.id);
  const isNext = next && next.id === node.id;
  const label = node.title || node.id;
  const state = !open ? 'locked' : stars ? 'done' : 'open';

  const btn = h('button', {
    class: `node node--${node.type} node--${state}${isNext ? ' node--next' : ''}`,
    'aria-label': `${label} — ${open ? (stars ? `${arNum(stars)} نجوم · يمكن إعادته` : 'مفتوح') : 'مقفل'}`,
    onclick: () => {
      // **والمقفلُ يُجيب**: هزّةٌ ورسالة «أكمِل ما قبله أولاً» — لا زرٌّ ميّت
      // (`disabled`) لا يردّ على الطفل (عهدُ «لا شاشة خطأ ولا عقاب»).
      if (!open) {
        btn.classList.remove('shake');
        void btn.offsetWidth;          // إعادة تشغيل الحركة
        btn.classList.add('shake');
        toast('أكمِل ما قبله أولاً', 'smile');
        return;
      }
      openNode(node);
    },
  },
    faceEl(open ? node.face : h('span', { class: 'node-lock' }, icon('lock')), 'node-face'),
    starsRow(stars),
    state === 'done' && replayMark(),
  );

  if (isNext) btn.dataset.next = '1';
  return btn;
}

function openNode(node) {
  go(`#/${node.type}/${encodeURIComponent(node.part)}`);
}

function fillAll(stars) {
  for (const node of progress.allNodes()) progress.setStars(node.id, stars);
  toast('حُدِّث التقدّم');
  render();
}

// ————— التوجيه —————
// أي مسار غير معروف يعود بالطفل إلى الخريطة، ولا يعرض له خطأً.

let renderToken = 0;

async function render() {
  audio.stop();
  const token = ++renderToken;
  const [name, arg] = location.hash.replace(/^#\/?/, '').split('/');

  // القفل يُحرس في التوجيه أيضاً، لا في أزرار الخريطة وحدها
  const guard = (id) => {
    if (!progress.findNode(id)) return true;          // عقدة لا وجود لها: تردّه الشاشة
    if (progress.isNodeUnlockedById(id)) return true;
    toast('أكمِل ما قبله أولاً', 'smile');
    location.replace('#/');
    return false;
  };

  let screen;
  if (name === 'review') {
    screen = renderReview();
    if (!screen) {                       // لا حصيلة للمراجعة بعدُ
      toast('أتمِم محطةً أولاً، ثم تأتي المراجعة', 'smile');
      location.replace('#/');
      return;
    }
  } else if (name === 'parent') {
    screen = renderParent(render);
  } else if (name && hasScreen(name) && arg) {
    const part = decodeURIComponent(arg);
    if (!guard(`${name}:${part}`)) return;
    screen = screenFor(name)(part) || renderMap();
  } else {
    screen = renderMap();
  }

  if (token !== renderToken) return;   // سبقتنا وجهة أحدث
  app.replaceChildren(screen);
  if (!name) revealNext();
  else window.scrollTo(0, 0);
}

/** إبقاء العقدة التالية في مجال النظر عند العودة للخريطة. */
function revealNext() {
  const el = app.querySelector('[data-next]');
  if (!el) return;
  const box = el.getBoundingClientRect();
  if (box.top < 0 || box.bottom > innerHeight) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

// ————— ساعة الاستخدام —————
// تُحسب دقائق التعلّم الفعلي وحدها: الصفحة ظاهرة، وللطفل تفاعل قريب.
// (شاشة مفتوحة منسيّة لا تُحسب — وإلا كذبت لوحة وليّ الأمر على وليّ الأمر.)

const TICK_MS = 10000;
const IDLE_MS = 60000;
let lastTouch = Date.now();

function startClock() {
  const touched = () => { lastTouch = Date.now(); };
  for (const type of ['pointerdown', 'keydown', 'hashchange']) {
    window.addEventListener(type, touched, { passive: true });
  }
  document.addEventListener('visibilitychange', touched);
  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - lastTouch > IDLE_MS) return;
    progress.addSeconds(TICK_MS / 1000);
  }, TICK_MS);
}

// ————— العمل دون إنترنت (PWA) —————
// عامل الخدمة يخزن الهيكل والأصوات كلها (`app/sw.js`)، فبعد أول فتح يعمل التطبيق
// بلا شبكة. لا يُسجَّل من file:// (لا يقبله المتصفّح) ولا يُسقِط التطبيق إن رُفض.

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  navigator.serviceWorker
    .register(new URL('../sw.js', import.meta.url), { scope: './' })
    .catch((e) => console.warn('[sw] لم يُسجَّل عامل الخدمة:', e));
}

/* **شريطُ المعاينة ظاهرٌ لا خفيّ** (بذرةُ اقرأ): مَن يفتح التطبيق بـ`?preview=1` يرى
   الرحلةَ كلَّها مفتوحة — فلو لم يُعلَن ذلك لظنّ أنّ هذا ما يراه الطفل، **والقفلُ
   التسلسليّ جوهرُ المنهج**. فالشريطُ يقول ما يجري ويقول إنّ شيئاً لا يُحفَظ، ومنه
   بابٌ إلى التجربة الحقيقية. */
if (progress.PREVIEW) {
  document.body.prepend(h('div', { class: 'preview-bar' },
    h('b', {}, 'وضع المعاينة'),
    h('span', {}, ' — كلُّ المحطات مفتوحةٌ للاطّلاع، ولا يُحفَظ أيُّ تقدّم على هذا الجهاز.'),
    h('a', { class: 'btn btn--ghost', href: './' }, 'اخرج إلى تجربة الطفل')));
}

// **والعودةُ من الخلفية بمقياس ١** (منقولُ اقرأ الميدانيّ `read@9220ab1` — الجلسة م٢):
// iPadOS يسترجع التطبيقَ المثبَّت بعد زيارة تطبيقٍ آخر **مكبَّراً** أحياناً — عيبُ
// استرجاعٍ معروف في المنصّة لا في شيفرتنا. الميتا تمنع التكبير أصلاً (`maximum-scale=1`
// في `index.html`)، وإعادةُ إعلانها **نفسِها** عند العودة تُلزم WebKit بإعادة تطبيقها
// حيث يتلكّأ. وطفلُ الرابعة لا يعرف كيف يردّ شاشةً كُبِّرت، فيبقى فيها حتى يأتيه بالغ.
const viewportMeta = document.querySelector('meta[name="viewport"]');
const reassertViewport = () => {
  if (viewportMeta) viewportMeta.setAttribute('content', viewportMeta.getAttribute('content'));
};
window.addEventListener('pageshow', reassertViewport);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') reassertViewport();
});

window.addEventListener('hashchange', render);
audio.ready();
startClock();
render();
registerServiceWorker();
