// **المحطة ٨·٥ — تَعَارُفٌ: أَرْقَامٌ أُخْرَى (123)** — آخرُ محطةٍ في الرحلة قبل بوابة
// الختام، و**المعفاةُ الوحيدة من القياس** (ق١ · `METHOD.md §٩`).
//
// ————— لِمَ ملفٌّ مفردٌ لمحطةٍ واحدة —————
//
// **بابُ الشيفرة في `test_measure.mjs` يطالب المعفاةَ بألّا تكتب مهارةً البتّة**
// (`recordAttempt` لا يُذكر في ملفّها). فلو سكنت هذه المحطةُ ملفَّ شاشاتِ المرحلة ٨
// — وهي تقيس — لَما أمكن إثباتُ إعفائها إلا بالنيّة. فإفرادُها **شرطُ أن يكون
// الإعفاءُ مقيساً لا مدَّعىً**، وهو حكمُ الجلسة ١ المُقَرّ.
//
// ————— وما تفعله هذه المحطة —————
//
// «يعرف الطفل أنّ للأعداد رسماً آخر سيلقاه، **ولا يُمتحن فيه**» (`METHOD.md §٩`):
// فتُعرَض الأرقامُ المشرقية التي تعلّمها مقابلَ المغربية، **صفّاً بصفّ**، ويُقرأ اسمُ
// كلٍّ بصوته الذي يعرفه — عرضٌ يُشاهَد ويُلمَس بلا سؤالٍ ولا خطأ ولا نجمةٍ تُنقَص.
//
// **ولا سؤالَ فيها البتّة**: لا خيارَ ولا صواب ولا خطأ — فليست لها حلقةُ المحطة
// الأربعية (`stationScreen`) وإنما شاشةُ عرضٍ وزرُّ ختام. وهي **العقدةُ الوحيدة**
// في الرحلة التي تُكتب نجمتُها بلا محاولةٍ واحدة، لأنّ إتمامَها **مشاهدةٌ لا إتقان**.
//
// ————— والرقمُ المغربيّ هنا وحدَه في التطبيق كلِّه —————
//
// عهدُ العائلة «أرقامُ المشرق في كل موضع» (ق١)، **واستثناؤه مكتوبٌ في المنهج نفسِه**:
// هذه محطةُ التعارف عليه. فلا يمرّ الرقمُ اللاتينيّ من المصيِّر (بطاقةُ الرمز تكتب
// المشرقيّ حصراً ويحرسه `check_render.mjs`)، وإنما يُكتب هنا نصّاً **من `latinNum`
// وحدَها** — دالّةِ التحويل في `ui.js` — فلا محرفَ رقمٍ مكتوبٌ بيدٍ في هذا الملفّ،
// ويجرد حارسُ المتصفّح أنّ هذه الشاشةَ وحدَها فيها رقمٌ لاتينيّ.

import * as progress from './progress.js';
import { registerScreen } from './registry.js';
import { stationById, medalOf, NUMBER_NAME, SAY, say, span } from './station.js';
import { paint } from './render.js';
import {
  h, go, topbar, mascot, starsRow, icon, landmark, arNum, latinNum, PATTERN_ACCENT,
} from './ui.js';

/** ما يُعرَض: الأرقامُ التي تعلّمها الطفلُ رمزاً (٠–٩ — منازلُ الرسم كلُّها). */
const DIGITS = span(0, 9);

// ————— التعليماتُ المنطوقة (مُعلَنةٌ لا مستنتَجة — `check_speech.mjs`) —————
//
// **ونصُّها واحد**: جملةُ تعارفٍ تُقال مرّةً، ثم أسماءُ الأعداد التي يعرفها أصلاً
// (`NUMBER_NAME` من `station.js`) — فلا بنكَ يُثقَل بمحطةٍ لا تُمتحَن.

const ASK = { meet: 'لِلْأَعْدَادِ رَسْمٌ آخَرُ سَتَرَاهْ' };

export const SPOKEN = Object.values(ASK);

// ————— ما تستهلكه هذه المحطة (الباب ٤ في `check_range.py`) —————
//
// **وهي تُعلن `CONSUMES` وإن لم تكن تمريناً**: الإعلانُ عقدُ «ما يُعرَض تحت الجبهة»
// لا عقدُ «ما يُقاس» — فبطاقاتُ الرموز هنا تُجرَد كما تُجرَد في كل شاشة.

export const CONSUMES = {
  intro: {
    numbers: DIGITS, numerals: DIGITS, ops: [], signs: [],
    displays: ['numeral'],
  },
};

/** لا جولاتِ لها تُجرَد — عرضٌ بلا سؤال، فالجردُ صفر (ولا يسكت الحارسُ عن الشاشة). */
export const probeRounds = () => [];

// ————— الشاشة —————

/**
 * صفٌّ واحد: بطاقةُ الرمز المشرقيّ **من المصيِّر** (فيُقرأ رقمُها من الرسم كسائر
 * الشاشات)، ويقابلها رسمُها المغربيّ نصّاً — **مُحوَّلاً بـ`latinNum`** لا مكتوباً.
 */
function pairRow(value) {
  const { el } = paint('numeral', value, { seed: value * 31 + 7 });
  const row = h('button', {
    class: 'intro-row',
    'aria-label': NUMBER_NAME[value],
    onclick: () => {
      row.classList.add('is-lit');
      say(NUMBER_NAME[value]);
    },
  },
  h('span', { class: 'intro-east' }, el),
  // **ولا علامةَ مساواةٍ بينهما**: «=» ليست من معجم هذا المستوى (مراجعة الجلسة ٦)،
  // ومحطةُ تعارفٍ لا تُقدِّم رمزاً جديداً — فنقطةٌ فاصلةٌ تصل الرسمين ولا تدّعي حكماً.
  h('span', { class: 'intro-vs', 'aria-hidden': 'true' }, '·'),
  h('span', { class: 'intro-west num' }, latinNum(arNum(value))));
  return row;
}

export function renderIntro(part) {
  const station = stationById(`intro:${part}`);
  if (!station) return null;

  const body = h('div', { class: 'station-body' });
  const grid = h('div', { class: 'intro-grid' }, ...DIGITS.map(pairRow));

  const finish = () => {
    /* **نجمةٌ بلا امتحان**: إتمامُ هذه المحطة **مشاهدةٌ** (ق١)، فتُكتب نجمتُها كاملةً
       ولا مهارةَ تُسجَّل — ويثبت الإعفاءَ بابُ الشيفرة في `test_measure.mjs`. */
    progress.setStars(station.id, 3);
    say(SAY.great);
    /* **وميداليتُها معلمُ مرحلتها** كسائر المحطات (حكمُ المدير — الجلسة هـ §٤):
       شاشتُها مفردةٌ عن الحلقة، **والاحتفالُ واحدٌ في الرحلة كلِّها** — ولو بقيت
       أيقونةَ واجهةٍ هنا لَانفردت آخرُ محطةٍ في الرحلة بميداليةٍ لا معلمَ فيها. */
    body.replaceChildren(h('div', { class: 'celebrate' },
      mascot('mascot mascot--cheer'),
      h('div', { class: 'celebrate-face' }, landmark(medalOf(station.id)) || icon('party')),
      h('h2', {}, 'أَحْسَنْت!'),
      starsRow(3, 'big-stars'),
      h('p', { class: 'hint' }, 'عَرَفْتَ أنّ للأعداد رسماً آخر — ولن تُسأل عنه.'),
      h('div', { class: 'row foot' },
        h('button', { class: 'btn btn--primary', onclick: () => go('#/') }, '→ الخريطة')),
    ));
  };

  body.replaceChildren(h('div', {},
    mascot('mascot mascot--hello'),
    h('h2', {}, station.title),
    h('p', { class: 'hint' }, 'هَذِهِ أَرْقَامُنَا، وَهَذَا رَسْمُهَا الْآخَرُ الَّذِي سَتَرَاهُ فِي الْكُتُبِ وَالسَّاعَات'),
    grid,
    h('p', { class: 'note note--tip' }, icon('ear'), ' اِنْقُرْ عَلَى أيِّ صَفٍّ لِتَسْمَعَ اسْمَهُ'),
    h('div', { class: 'row foot' },
      h('button', { class: 'btn btn--primary next', onclick: finish }, 'تَابِعْ ←')),
  ));
  say(ASK.meet);

  return h('div', { class: 'screen station-screen', css: { '--accent': PATTERN_ACCENT } },
    topbar(
      h('button', { class: 'btn', onclick: () => go('#/') }, '→ الخريطة'),
      h('span', { class: 'spacer' }),
      h('span', { class: 'pill' }, station.title),
    ),
    h('main', { class: 'screen-card' }, body),
  );
}

registerScreen('intro', renderIntro);
