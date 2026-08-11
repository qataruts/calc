// حارسُ «صوتٌ واحدٌ لا يتكدّس ولا يُبعَث» (`app/js/audio.js`):
//   node tools/test_audio_stack.mjs
//
// ————— أصلُه ومقابلتُه (الجلسة م٢) —————
//
// منقولٌ من اقرأ (`read@9220ab1` — بلاغُ طفلةٍ حقيقية: النقرُ المتكرر السريع يُشغّل
// الصوتَ بعدد النقرات بعضَه فوق بعض) **مكيَّفاً على قناتنا لا فوقها**: علّةُ اقرأ
// المركّبة نصفُها ساقطٌ عندنا بالبنية (الطابورُ لا يدهس، فلا سباقَ إسكاتٍ أصلاً)،
// ونصفُها الآخر يبقى **لأنّ الطابورَ يمنع التراكب ولا يمنع البعث**:
//   ١) **البعث**: ما أُسكت عمداً لا يعود. عندنا الإسكاتُ **تسويةٌ هادئة** (`cut`
//      يحلّ الوعد بـfalse) فلا يبلغ `catch` إعادةِ المحاولة — **إلا أن يتصادفا**:
//      ملفٌّ يتعثّر تحميلُه واللحظةُ نفسُها لحظةَ نقرةٍ ناقلة. فبلا جيلٍ يُقرأ في
//      ذلك الـ`catch` تمضي الإعادةُ على نصِّ شاشةٍ غادرها الطفل — لا **فوق** كلام
//      الشاشة الجديدة (الطابورُ يمنع ذلك) بل **قبله**، فيسمع كلاماً لا يخصّ ما يرى.
//   ٢) **التتابعُ بلا إبطال**: `playSequence` كانت تمضي بعد الإسكات، **فتصفّ بقيّتَها
//      بجيلٍ جديد** — أي أنّ `stop()` يُفرغ الطابور ثم يملؤه المتجاوَزُ من حيث وقف.
//   ٣) **ولا وعدَ يبقى معلَّقاً** (عطبٌ كشفه الفحصُ السالب في اقرأ): شاشةٌ تنتظر
//      وعداً لا يتمّ تتجمّد على طفل — والقناةُ كلُّها وعودٌ تُنتظَر منذ م١.
//
// **والفحصُ سلوكيّ لا نصّيّ**: عنصرُ صوتٍ مزيّف يسجّل ما أُنشئ وما أُوقف، ونحاكي به
// نقراتِ الطفل. وهو أخو `check_speech --> channelGate` (تلك تقيس التعاقب، وهذه تقيس
// **البعث**) وأخو الأحكام الزمنية في `browser_test.html` (تلك في مسار الطفل الحيّ).
//
// **ومُجرَّبٌ سالباً** (الجلسة م٢): بردّ `audio.js` إلى ما قبل م١ يحمرّ **ويتعلّق**
// وعدُه فيخرج بـ١٣ (وعدٌ معلَّق في أعلى وحدة ESM) — وهو عينُ ما يحرسه البندُ ٣.

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };

// ————— محاكاة بيئة المتصفح: عنصرُ صوتٍ يسجّل، وفهرسٌ من مفاتيح نصوصنا —————

class FakeAudio {
  static created = [];
  constructor(src) {
    this.src = src || '';
    // **وما طُلب يبقى مسجَّلاً وإن أُطلق العنصر**: `releaseEl` ينزع `src` بعد الفراغ
    // (إصلاحُ ١٣ أغسطس)، فقياسُ «أيُّ نصٍّ طُلب؟» على `src` الحيّ يقرأ فراغاً فيشهد
    // بالبراءة لمن أُنشئ ثمّ أُطلق — **وقد وقع**: صفحةُ الفحص الأولى مرّت خضراءَ على
    // شيفرةٍ معطوبة لهذا وحدَه. فلحظةُ الطلب لها حقلُها الذي لا يُمحى.
    this.asked = src || '';
    this.paused = true;
    this.listeners = {};
    this._rejectPlay = null;
    FakeAudio.created.push(this);
  }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  removeEventListener() {}
  fire(name) { for (const fn of this.listeners[name] || []) fn(); }
  play() {
    this.paused = false;
    return new Promise((resolve, reject) => { this._rejectPlay = reject; });
  }
  pause() {
    this.paused = true;
    // كسفاري: إيقافٌ وتشغيلُ العنصر ما زال في طريقه ⇒ وعدُ play() يُرفَض AbortError
    if (this._rejectPlay) { const r = this._rejectPlay; this._rejectPlay = null; r(new Error('AbortError')); }
  }
  removeAttribute(name) { if (name === 'src') this.src = ''; }
  load() {}
}

globalThis.Audio = FakeAudio;
globalThis.window = {};                       // لا نطقَ آلياً في الفحص (speechSynthesis غائب)

const audio = await import('../app/js/audio.js');
const { play, playSequence, stop, keyFor } = audio;

// أسماءُ أعدادٍ من بنكنا — والفهرسُ يعرفها كلَّها، فكلُّ عطبٍ هنا **عطبُ تحميل**
// لا غيابُ ملفّ (وهو شرطُ إعادة المحاولة التي نحرسها).
const WORDS = ['وَاحِدْ', 'اِثْنَانْ', 'ثَلَاثَةْ'];
const manifest = Object.fromEntries(WORDS.map((w) => [keyFor(w), 1]));
globalThis.fetch = async (url) => (String(url).endsWith('manifest.json')
  ? { ok: true, json: async () => manifest }
  : { ok: false, status: 404 });

const settle = () => new Promise((r) => setTimeout(r, 0));
const rest = async () => { await settle(); await settle(); await settle(); };
const playing = () => FakeAudio.created.filter((el) => !el.paused);
const isFor = (el, word) => el.asked.includes(keyFor(word));   // ما طُلب لا ما بقي حيّاً

// ————— ١. نداءان في اللحظة نفسها: تعاقبٌ لا دهس، وكلاهما يُسوَّى —————
//
// **وهنا يفترق تكييفُنا عن أصله**: في اقرأ تعيش الأخيرةُ وحدَها (نقرةٌ تدهس نقرة)،
// وعندنا **تُسمَعان بالتتابع** — الأولى تامّةً ثم الثانية. فالنداءان في لحظةٍ واحدة
// جملةُ خطوةٍ وسؤالُ شاشةٍ لا نقرتا طفل، وكلاهما يُقال (م١ · بلاغ الميدان ١).

console.log('\n١. نداءان في اللحظة نفسها');
FakeAudio.created = [];
const firstCall = play(WORDS[0]);
const secondCall = play(WORDS[1]);
await rest();
ok(FakeAudio.created.length === 1 && isFor(FakeAudio.created[0], WORDS[0]),
  'الأولى وحدَها تبدأ — والثانيةُ تنتظر دورَها في الطابور (لا دهسَ ولا تراكب)');
FakeAudio.created[0].fire('ended');
ok((await firstCall) === true, 'وتُسمَع إلى آخرها');
await rest();
ok(FakeAudio.created.length === 2 && isFor(FakeAudio.created[1], WORDS[1]),
  'ثمّ تبدأ الثانيةُ **بعدها لا فوقها**');
FakeAudio.created[1].fire('ended');
ok((await secondCall) === true, 'وكلا الوعدين يُسوّى — لا وعدَ يبقى معلَّقاً فتتجمّد شاشة');

// ————— ٢. نقرةٌ ناقلة فوق صوتٍ يُسمَع: لا بعثَ للموقوف —————

console.log('\n٢. نقرةٌ ناقلة فوق صوتٍ يُسمَع');
FakeAudio.created = [];
const cutOff = play(WORDS[0]);
await rest();
ok(FakeAudio.created.length === 1 && !FakeAudio.created[0].paused, 'الأولى تُسمَع');
stop();                                       // نقرةُ الطفل التي تنقل: إسكاتٌ وإفراغ
const after = play(WORDS[1]);
await rest();
ok((await cutOff) === false, 'الإسكاتُ يُسوّي وعدَها بهدوء (false) — تسويةٌ لا عطل');
ok(FakeAudio.created.length === 2,
  'ولا عنصرَ ثالثاً: الموقوفُ عمداً لا يسقط في إعادة المحاولة فيُبعَث بعد الجديد');
ok(playing().length === 1 && isFor(playing()[0], WORDS[1]),
  'والناجي صوتٌ واحد — صوتُ الشاشة التي يراها الطفل الآن');
playing()[0].fire('ended');
await after;

// ————— ٣. عطبٌ صادفه إسكات: لا إعادةَ ولا احتياط —————
//
// **وهذا ما أتمّته م٢**: الإسكاتُ عندنا لا يُنتج رفضاً (تسويةٌ هادئة)، فلا يبلغ
// `catch` الإعادة **إلا مصادفةً** — ملفٌّ يتعثّر ونقرةٌ تنقل في اللحظة نفسِها.
// وبلا جيلٍ يُقرأ هناك يُطلَب الملفُّ ثانيةً (أو يُحتاط له) بعد أن غادر الطفل.

console.log('\n٣. عطبٌ صادفه إسكات');
FakeAudio.created = [];
const doomed = play(WORDS[0]);
await rest();
ok(FakeAudio.created.length === 1, 'ملفٌّ بدأ');
FakeAudio.created[0].fire('error');           // عطبُ تحميلٍ حقيقيّ…
stop();                                       // …ونقرةُ الطفل في اللحظة نفسِها
ok((await doomed) === false, 'وعدُه يُسوّى بـfalse');
await rest();
ok(FakeAudio.created.length === 1,
  'وما أُسكت لا يُعاد ولا يُحتاط له — لا عنصرَ ثانياً بعد الإسكات');
ok(playing().length === 0, 'ولا صوتَ يعمل بعده');

// ————— ٤. التتابعُ المتجاوَز: بقيّتُه تسقط ولا تُصَفّ بجيلٍ جديد —————

console.log('\n٤. التتابعُ المتجاوَز');
FakeAudio.created = [];
const seq = playSequence([WORDS[0], WORDS[1]], 0);
await rest();
ok(FakeAudio.created.length === 1 && isFor(FakeAudio.created[0], WORDS[0]),
  'التتابعُ بدأ بأوّل نصوصه');
stop();                                       // نقرةٌ ناقلة أثناءه
await rest();
ok(!FakeAudio.created.some((el) => isFor(el, WORDS[1])),
  'وإسكاتٌ أثناءه يُبطل بقيّتَه — لا يصفّ المتجاوَزُ ما بعدَه في طابورٍ أُفرِغ لتوّه');
ok(playing().length === 0, 'ولا صوتَ يعمل بعد الإسكات');
await seq;                                    // ولا يبقى وعدُ التتابع معلَّقاً

// ————— ٥. إعادةُ المحاولة باقيةٌ لعطبها الحقيقيّ (لا يُضحّى بإصلاح ١٣ أغسطس) —————

console.log('\n٥. إعادةُ المحاولة للملفّ المتعثّر');
FakeAudio.created = [];
const retried = play(WORDS[0]);
await rest();
FakeAudio.created[0].fire('error');           // عطبُ تحميلٍ حقيقيّ بلا إسكاتٍ يصادفه
await rest();
ok(FakeAudio.created.length === 2 && isFor(FakeAudio.created[1], WORDS[0]),
  'ملفٌّ في الفهرس تعثّر: يُطلَب مرّةً ثانية — الإصلاحُ لم يمسّ هذا');
FakeAudio.created[1].fire('ended');
ok((await retried) === true, 'والثانيةُ تُسمَع إلى آخرها');
stop();

console.log(fails ? `\n${fails} فشل` : '\nكل اختبارات «صوتٌ واحدٌ لا يتكدّس ولا يُبعَث» ناجحة');
process.exit(fails ? 1 : 0);
