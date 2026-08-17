// البوابات الثلاث (`METHOD.md §٥`) — إتقانٌ بلا رسوب.
//
// ————— بذرةُ المنصة (منسوخةٌ من «اِقْرَأْ»، ونموذجُها مُقَرٌّ حرفياً) —————
// نصّ المنهج: «نموذج اقرأ حرفياً: جلسة مراجعة إجبارية من **أضعف مهارات ليتنر**
// (`weakestSkills()` لا `dueSkills()`) بعشرة تمارين، والعبور بإصابة ≥٨٠٪ من
// المحاولات. **لا رسوب**: دونها تبقى التالية مقفلة مع إعادة فورية بلا حدّ ولا عقاب،
// وتمارينها تُبنى من جديد كل محاولة.»
//
// وأربع قواعد تحكم هذا الملف، وهي عينُ قواعد اقرأ بعللها:
// ١) **مادّتها أضعف ما في يده** لا ما حان موعده: `weakestSkills()` بدل `dueSkills()`
//    — البوابة سؤالٌ عن الإتقان، وليتنر جدولُ تثبيتٍ لا امتحان. (وإلا حان موعدُ
//    القويّ وحده يوم البوابة فمرّت بلا معنى.)
// ٢) **لا محتوى جديداً ولا نصّ منطوق جديد**: تمارينها تمارينُ المراجعة نفسُها
//    (`sessionItems`)، فكلُّ ما تنطقه له ملفٌّ مولَّد أصلاً — ولذلك لا تُضيف البوابةُ
//    سطراً واحداً إلى `tools/audio_queue.json`.
// ٣) **لا رسوب**: دون العتبة لا نجمة ولا عبور، لكن لا عقاب ولا حدّ للمحاولات —
//    «لَيْسَ بَعْدُ» ثم إعادةٌ فورية تُبنى تمارينها من جديد (لا نمط يُحفَظ فيُستظهَر).
// ٤) **الحكم بالمحاولة لا بالتمرين**: نسبة الإصابة = الصواب ÷ كل اللمسات، وهي وحدةُ
//    `markReview` نفسُها في لوحة وليّ الأمر — فلا يفترق ما يقرؤه الوالد عمّا فتح
//    البوابة أو أبقاها.

import { gateById, gateSkills } from './curriculum.js';
import * as progress from './progress.js';
import { duringExam } from './support.js';
import { renderSession, sessionItems, starsForReview } from './review.js';
import { h, icon, faceEl, go, arNum, starsRow, mascot, PAUSE_ACCENT } from './ui.js';

export const GATE_SIZE = 10;      // عشرة تمارين: أطول من مراجعة اليوم ودون إرهاق
export const PASS_RATE = 0.8;     // العبور بإصابة ≥٨٠٪ من المحاولات

/** هل تعبر هذه النتيجة البوابة؟ (بلا محاولة أصلاً لا عبور — لئلا تُفتح بجلسة فارغة) */
export const passed = (right, errors) =>
  right + errors > 0 && right / (right + errors) >= PASS_RATE;

/**
 * تمارين محاولةٍ واحدة: **الأضعف أولاً** من سجلّ ليتنر، ثم تنويعٌ يكمل العدد.
 *
 * **والأضعفُ من مدى البوابة المعلَن** (الجلسة ٦): `METHOD.md §٣` يذكر لكلٍّ ممّ تسأل،
 * وبوابةُ العمليات «من أضعف مهارات **المرحلتين ٥–٦**» — فتُصفّى قائمةُ الضعف بمفاتيح
 * مداها (`gateSkills`). ولولا ذلك لَتصدّر جلستَها ضعفٌ في التقدير الفوريّ ومضى الطفلُ
 * إلى ما بعد العشرة وعملياتُه متزعزعة، وهي عينُ العلّة التي وُجدت البوابةُ لها.
 *
 * **والتنويعُ يبقى من الحصيلة كلِّها** (`METHOD.md §٦`: «والتكميل تنويعاً من الحصيلة»):
 * المدى يحكم **مادّةَ الضعف** لا حوضَ التنويع.
 *
 * **وتُبنى بمسطرةٍ واحدة** (وضعُ الدعم — بلاغ `support-and-placement-coexist`): البوابةُ
 * امتحانُ إتقانٍ بعتبةٍ واحدة للجميع (٨٠٪)، **فما يمسّ القياس من مقابض الدعم يعود إلى
 * القائم داخلها** (حوضٌ ثلاثيّ وتلقينٌ ممتنع) — ولا يُفتَح لطفلٍ بحوضٍ أضيق ما لم
 * يُفتَح لغيره. **وما يريح يسري** كما يسري خارجها (صوتٌ أبطأ وعدٌّ أبطأ وهدوءٌ):
 * مَن يُمتحَن بشاشةٍ تُربكه يُقاس إرباكُه لا معرفتُه. **ونطاقُه البناءُ نفسُه** —
 * `duringExam` نداءٌ متزامن يُردّ في `finally`، لا عَلَمٌ يُخزَّن فيعلق مفتوحاً.
 */
export function gateItems(gateId, rnd = Math.random) {
  const scope = new Set(gateSkills(gateId));
  const weakest = progress.weakestSkills()
    .filter((s) => scope.has(`${s.concept}|${s.range}|${s.kind}`));
  return duringExam(() => sessionItems(weakest, GATE_SIZE, rnd));
}

export function renderGate(gateId) {
  const gate = gateById(gateId);
  if (!gate) return null;
  const nodeId = `gate:${gate.id}`;

  return renderSession({
    make: () => gateItems(gate.id),
    pill: 'بوابة',
    accent: PAUSE_ACCENT,
    leaveAsk: 'تريد الخروج قبل إتمام البوابة؟',
    header: h('div', { class: 'gate-head' },
      faceEl(gate.face, 'gate-face'),
      h('div', {},
        h('h2', {}, gate.title),
        h('p', { class: 'hint' }, gate.hint),
      ),
    ),
    verdict: ({ right, errors, items, again }) => {
      const tries = right + errors;
      const rate = tries ? Math.round((right / tries) * 100) : 0;
      const open = passed(right, errors);
      progress.markReview(tries, right);           // البوابة مراجعةٌ كسائر المراجعات
      if (open) progress.setStars(nodeId, starsForReview(errors, items.length));

      const score = h('p', { class: 'hint' },
        `أصبتَ ${arNum(right)} من ${arNum(tries)} محاولة (${arNum(rate)}٪)`);

      // العبور: احتفال ونجوم. ودونه: «ليس بعدُ» — لا لفظ رسوب ولا حدّ للإعادة.
      return open
        ? h('div', { class: 'celebrate' },
          mascot('mascot mascot--cheer'),
          faceEl(gate.face, 'celebrate-face', 'div'),
          h('h2', {}, 'فُتِحَتِ البَوَّابَة!'),
          starsRow(starsForReview(errors, items.length), 'big-stars'),
          score,
          h('div', { class: 'row foot' },
            h('button', { class: 'btn btn--primary', onclick: () => go('#/') },
              icon('map'), ' الخريطة')),
        )
        : h('div', { class: 'celebrate celebrate--again' },
          mascot('mascot mascot--hello'),
          h('div', { class: 'celebrate-face' }, icon('smile')),
          h('h2', {}, 'لَيْسَ بَعْدُ'),
          h('p', { class: 'rule' }, 'قَوِّ حِسَابَكْ أَوَّلاً'),
          score,
          h('p', { class: 'note' }, 'أعِد المحاولة متى شئت — بتمارين جديدة في كل مرة.'),
          h('div', { class: 'row foot' },
            h('button', { class: 'btn btn--primary', onclick: again },
              icon('repeat'), ' أعِد المحاولة'),
            h('button', { class: 'btn', onclick: () => go('#/') }, icon('map'), ' الخريطة')),
        );
    },
  });
}
