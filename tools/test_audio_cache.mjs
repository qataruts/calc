// **حارسُ كسر كاش الصوت ببصمة المحتوى**:
//   node tools/test_audio_cache.mjs
//
// منسوخٌ ومجرَّدٌ من `read@41f8445` (`docs/SEED.md §٣`) — ونام حتى الجلسة ص لأنّه
// يشغّل `app/sw.js` على **فهرسِ صوتٍ حقيقيّ**، ولا فهرسَ قبل التصريف (`SEED.md §٤`).
//
// ————— العيبُ المحروس هنا —————
//
// اسمُ ملف الصوت sha1 **نصِّه** لا محتواه، فاستبدالُ صوتٍ تحت المفتاح نفسه (إصلاحُ
// عيبٍ مسموع، أو تسجيلٌ بشريّ بديل) **لا يغيّر الرابط** — والجهاز الذي خزّن النسخة
// القديمة في عامل الخدمة يبقى عليها، فيُسمع النصُّ الواحد بصوتين بحسب تاريخ أوّل
// طلبٍ لكل جهاز. وهو عيبٌ لا يظهر في شجرةٍ ولا في متصفّحٍ نظيف: يظهر في جهازٍ
// عمرُه شهر.
//
// والفحصُ أربعةُ أشطر:
//   ١) على **الشجرة الحقيقية**: كلُّ بصمةٍ في البيان تطابق بايتاتِ ملفها فعلاً
//      (وبصمةٌ كاذبة أخطرُ من غيابها: رابطٌ لا يتغيّر باستبدال المحتوى = العيبُ عائداً).
//   ٢) أنّ **التطبيق يطلب الرابط موسوماً**، وأنّ غيابَ البيان لا يُصمِت الدرس.
//   ٣) على `app/sw.js` **نفسِه** في بيئة كاشٍ وشبكةٍ مزيَّفَين: يُستبدَل محتوى ملفٍ
//      واحد فيُثبَت أنّ التطبيق يخدم الجديدَ فوراً، وأنّ غيرَ المستبدل يبقى من
//      المخزون **بلا طلبٍ شبكيّ واحد**.
//   ٤) وأنّ **ترقيةَ النسخة لا تعيد تنزيل الصوت**: اسمُ مخزن الصوت ثابتٌ عبر النسخ،
//      وبصماتُ المحتوى تحكم الطزاجة سلفاً — فأيُّ إعادةِ جلبٍ هدرٌ محض.

import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const ROOT = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, ROOT), 'utf8');

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };

// ————————————— ١. البصمات على الشجرة الحقيقية —————————————

console.log('\n١. بصمات المحتوى تطابق البايتات');

const audioManifest = JSON.parse(read('app/audio/manifest.json'));
const versionsPath = new URL('app/audio/versions.json', ROOT);
ok(existsSync(versionsPath), 'بيان البصمات موجود (app/audio/versions.json)');
const versions = existsSync(versionsPath) ? JSON.parse(read('app/audio/versions.json')) : {};

const fingerprint = (key) =>
  createHash('sha1').update(readFileSync(new URL(`app/audio/${key}.mp3`, ROOT))).digest('hex').slice(0, 8);

const onDisk = Object.keys(audioManifest)
  .filter((key) => existsSync(new URL(`app/audio/${key}.mp3`, ROOT)));
const wrong = onDisk.filter((key) => versions[key] !== fingerprint(key));
ok(wrong.length === 0,
  `كل ملفات الفهرس مبصومة ببايتاتها (${onDisk.length} ملفاً)`
  + (wrong.length ? ` — مخالفة أو غائبة: ${wrong.slice(0, 6).join('، ')}`
    + ' (أصلحها بـ`generate_audio.py --sync-versions`)' : ''));

const extra = Object.keys(versions).filter((key) => !(key in audioManifest));
ok(extra.length === 0,
  `ولا بصمةَ لمفتاحٍ خارج الفهرس${extra.length ? ' — ' + extra.slice(0, 6).join('، ') : ''}`);

// **واسمُ الملف من نصّه**: يُعاد اشتقاقُ المفتاح من النصّ المكتوب في الفهرس نفسِه —
// فلو أُعيدت تسميةُ ملفٍ بيد، أو صُرِّف نصٌّ بصورته المنطوقة لا المكتوبة، ظهر هنا.
const keyOf = (text) => createHash('sha1').update(text, 'utf8').digest('hex').slice(0, 12);
const misnamed = Object.entries(audioManifest).filter(([key, text]) => keyOf(text) !== key);
ok(misnamed.length === 0,
  `واسمُ كلِّ ملفٍ هو sha1 نصِّه (${Object.keys(audioManifest).length} مفتاحاً)`
  + (misnamed.length ? ` — مخالف: ${misnamed.slice(0, 4).map(([k]) => k).join('، ')}` : ''));

// ————————————— ٢. التطبيق يطلب الرابط موسوماً —————————————

console.log('\n٢. وحدةُ الصوت تطلب الرابط موسوماً');

const audioJs = read('app/js/audio.js');
ok(audioJs.includes('versions.json') && /\?v=\$\{tag\}/.test(audioJs),
  'audio.js يقرأ البصمات ويطلب `<key>.mp3?v=<بصمة>`');
ok(/https\?:/.test(audioJs),
  'والوسمُ على http(s) وحده (عنوانُ file: قد يرفض سلسلة الاستعلام)');
ok(!/await .*VERSIONS_URL/.test(audioJs) && audioJs.includes('.catch(() => { versions = null; })'),
  'وغيابُ بيان البصمات لا يمنع التشغيل (رابطٌ بلا وسمٍ كما كان)');

// ————————————— ٣. عامل الخدمة على كاشٍ وشبكةٍ مزيَّفَين —————————————

console.log('\n٣. سيناريو الاستبدال في عامل الخدمة (app/sw.js نفسه)');

const ORIGIN = 'https://ihsib.test';
const SCOPE = `${ORIGIN}/app/`;
const KEY_A = 'aaaaaaaaaaaa';       // نصٌّ سيُستبدل صوتُه
const KEY_B = 'bbbbbbbbbbbb';       // نصٌّ لن يُمَسّ

const disk = new Map();
const put = (path, body) => disk.set(path, typeof body === 'string' ? body : JSON.stringify(body));

const setSite = ({ aBody, aTag }) => {
  put('audio/manifest.json', { [KEY_A]: 'وَاحِدْ', [KEY_B]: 'اِثْنَانْ' });
  put('audio/versions.json', { [KEY_A]: aTag, [KEY_B]: '2222bbbb' });
  put('emoji/index.json', { files: { '1f34e': 'تفاحة' } });
  put(`audio/${KEY_A}.mp3`, aBody);
  put(`audio/${KEY_B}.mp3`, 'صوت اثنان');
};
setSite({ aBody: 'صوت واحد — القديم', aTag: '1111aaaa' });

let net = [];
let offline = false;

async function fakeFetch(input) {
  const url = String(input?.url ?? input);      // نصّاً كان أو Request أو URL
  net.push(url);
  if (offline) throw new TypeError('offline');
  const rel = new URL(url).pathname.replace('/app/', '');
  const body = disk.get(rel);
  if (body !== undefined) return new Response(body, { status: 200 });
  // ملفاتُ الهيكل الأخرى (html/css/js/خطوط/أيقونات) تُخدَم بمحتوىً وهميّ
  return /\.(mp3|json)$/.test(rel)
    ? new Response('', { status: 404 })
    : new Response(`shell:${rel}`, { status: 200 });
}

const urlOf = (req) => String(typeof req === 'string' ? req : req.url);
const bare = (url) => url.split('?')[0];

class FakeCache {
  constructor() { this.entries = new Map(); }        // رابط ← نصُّ الجسم
  async add(url) {
    const res = await fakeFetch(String(url));
    if (!res.ok) throw new Error(`add ${url}`);
    this.entries.set(String(url), await res.text());
  }
  async put(req, res) { this.entries.set(urlOf(req), await res.text()); }
  async match(req, opts = {}) {
    const url = urlOf(req);
    if (this.entries.has(url)) return new Response(this.entries.get(url));
    if (opts.ignoreSearch) {
      for (const [k, v] of this.entries) if (bare(k) === bare(url)) return new Response(v);
    }
    return undefined;
  }
  async keys(req, opts = {}) {
    const all = [...this.entries.keys()];
    const want = req ? urlOf(req) : null;
    const hit = (u) => (opts.ignoreSearch ? bare(u) === bare(want) : u === want);
    return (want ? all.filter(hit) : all).map((u) => new Request(u));
  }
  async delete(req) { return this.entries.delete(urlOf(req)); }
}

const caches = {
  store: new Map(),
  async open(name) {
    if (!this.store.has(name)) this.store.set(name, new FakeCache());
    return this.store.get(name);
  },
  async keys() { return [...this.store.keys()]; },
  async match(req) {
    for (const cache of this.store.values()) {
      const hit = await cache.match(req);
      if (hit) return hit;
    }
    return undefined;
  },
  async delete(name) { return this.store.delete(name); },
};

/** تركيبُ نسخةٍ من `app/sw.js` في بيئتها المزيَّفة — تُعيد أذرعَ قيادتها.
 *  والنسخُ تتشارك `caches` و`fetch` أنفسَهما، فترقيةُ نسخةٍ فوق أخرى تقع كما تقع
 *  على جهاز الطفل: عاملٌ جديد يجد مخزون سابقه على حاله. */
function loadSw(source) {
  const listeners = {};
  const posted = [];
  const selfObj = {
    addEventListener: (type, fn) => { listeners[type] = fn; },
    registration: { scope: SCOPE },
    location: { origin: ORIGIN },
    skipWaiting: async () => {},
    // **ونافذةٌ تستمع**: العاملُ يبعث تقدّمَ الخزن إلى النوافذ بعد كل دفعة (شريطُ
    // التحميل في لوحة وليّ الأمر)، فتُحاكى هنا لتُجرَّب تلك الطريق لا لتُتخطّى.
    clients: {
      claim: async () => {},
      matchAll: async () => [{ postMessage: (m) => posted.push(m) }],
    },
  };
  vm.runInContext(source,
    vm.createContext({ self: selfObj, caches, fetch: fakeFetch, URL, Request, Response, console,
      setTimeout, clearTimeout }));
  return {
    posted,
    fire: async (type) => {
      let waited;
      listeners[type]({ waitUntil: (p) => { waited = p; } });
      await waited;
    },
    request: async (path) => {
      let answer;
      listeners.fetch({
        request: new Request(new URL(path, SCOPE)),
        respondWith: (p) => { answer = p; },
        waitUntil: () => {},
      });
      return answer ? answer : null;
    },
  };
}

const swSource = read('app/sw.js');
const { fire, request, posted } = loadSw(swSource);

// اسمُ مخزن الصوت من `sw.js` نفسِه لا مكتوباً هنا — فلا يكذب هذا الملفُّ إن تغيّر غداً.
const AUDIO_CACHE = swSource.match(/const AUDIO_CACHE = '([^']+)'/)[1];

const audioCache = async () => caches.open(AUDIO_CACHE);
const cachedUrls = async () => [...(await audioCache()).entries.keys()].sort();
const mp3Hits = () => net.filter((u) => /\.mp3/.test(u));

// ——— التركيب الأول: تُخزَن الأصوات بروابطها الموسومة ———
await fire('install');
await fire('activate');

const first = await cachedUrls();
ok(first.length === 2 && first.every((u) => u.includes('?v=')),
  `التركيب يخزن الصوتين بروابطَ موسومة (${first.length})`);
ok(first.includes(`${SCOPE}audio/${KEY_A}.mp3?v=1111aaaa`), 'ومنهما الأول بوسمه القديم');
const shellCache = await caches.open(
  `ihsib-shell-${swSource.match(/const VERSION = '([^']+)'/)[1]}`);
ok([...shellCache.entries.keys()].some((u) => u.endsWith('audio/versions.json')),
  'وبيانُ البصمات نفسُه مخزونٌ في الهيكل (فيُقرأ دون إنترنت)');
ok([...shellCache.entries.keys()].some((u) => u.endsWith('emoji/1f34e.svg')),
  'ورموزُ عالم الطفل تُخزَّن **من فهرسها** لا من قائمةٍ يدوية');
ok(posted.some((m) => m.type === 'audio-progress' && m.total === 2),
  'ويبلّغ النوافذَ بحال الخزن (شريطُ لوحة وليّ الأمر يتحرّك بما يجري)');

// ——— الاستبدال: المفتاحُ نفسُه، محتوىً جديد، بصمةٌ جديدة ———
setSite({ aBody: 'صوت واحد — الجديد', aTag: '9999aaaa' });

net = [];
const fresh = await request(`audio/${KEY_A}.mp3?v=9999aaaa`);
ok((await fresh.text()) === 'صوت واحد — الجديد',
  'استبدالُ المحتوى تحت المفتاح نفسه: التطبيق يخدم **الجديد فوراً** لا المخزونَ القديم');
ok(net.length === 1 && net[0].endsWith('?v=9999aaaa'),
  `وبطلبٍ شبكيٍّ واحد لهذا الملف وحدَه (${net.length})`);

const afterSwap = await cachedUrls();
ok(afterSwap.includes(`${SCOPE}audio/${KEY_A}.mp3?v=9999aaaa`), 'والجديدُ صار مخزوناً');
ok(!afterSwap.includes(`${SCOPE}audio/${KEY_A}.mp3?v=1111aaaa`),
  'ووسمُه الأقدم حُذف — فلا نسختان لملفٍ واحد ولا يعود القديمُ من بابٍ خلفيّ');
ok(afterSwap.length === 2, `والمخزونُ ما زال اثنين لا ثلاثة (${afterSwap.length})`);

// ——— وغيرُ المستبدل يبقى من الكاش بلا شبكة ———
net = [];
const kept = await request(`audio/${KEY_B}.mp3?v=2222bbbb`);
ok((await kept.text()) === 'صوت اثنان' && net.length === 0,
  'وغيرُ المستبدل يُخدَم من المخزون بلا طلبٍ شبكيٍّ واحد (لا إعادةَ تنزيلٍ للبقية)');

// ——— بلا شبكةٍ ووسمٌ غير مخزون: صوتٌ أقدم خيرٌ من صمت ———
offline = true;
net = [];
const stale = await request(`audio/${KEY_A}.mp3?v=7777aaaa`);
ok(stale && stale.ok && (await stale.text()) === 'صوت واحد — الجديد',
  'وبلا شبكة: وسمٌ غير مخزونٍ يُخدَم بأقرب نسخةٍ عندنا (لا صمتَ في أذن الطفل)');
ok((await cachedUrls()).length === 2, 'ولا تُخزَّن تلك الاستجابةُ بالوسم الجديد (تُصحَّح أوّلَ اتصال)');
offline = false;

// ——— الكنس: كلُّ أثرٍ لصوتٍ قديمٍ يزول عند التركيب التالي ———
(await audioCache()).entries.set(`${SCOPE}audio/${KEY_A}.mp3`, 'صوتٌ قديمٌ بلا وسم');
(await audioCache()).entries.set(`${SCOPE}audio/${KEY_B}.mp3?v=0000old0`, 'وسمٌ بطل');
await fire('install');
await fire('activate');
const swept = await cachedUrls();
ok(swept.length === 2 && swept.every((u) => u.includes('?v=')),
  'والتركيبُ يكنس الأوسمةَ الغابرةَ والروابطَ بلا وسم (لا يبقى في الجهاز أثرٌ للقديم)');
ok((await (await audioCache()).match(new Request(`${SCOPE}audio/${KEY_A}.mp3?v=9999aaaa`))) !== undefined,
  'ويُبقي المتوقَّعَ اليوم');

// ——— الإخفاقُ يُعَدّ ولا يُبتلَع: وإن وقع فلا كنسَ (صيانةً للقديم الصالح) ———
// حصةُ التخزين تضيق على الأجهزة الأقدم فيفشل الخزن — وكنسُ «ما بَطَل» عندئذٍ يمحو
// صالحاً قائماً ولا يضع مكانه شيئاً، فيصمت الصوتُ خارج الشبكة.
disk.delete(`audio/${KEY_B}.mp3`);                       // ملفٌّ يُخفق جلبُه
(await audioCache()).entries.delete(`${SCOPE}audio/${KEY_B}.mp3?v=2222bbbb`);
(await audioCache()).entries.set(`${SCOPE}audio/${KEY_A}.mp3?v=0000old0`, 'وسمٌ بطل');
await fire('install');
await fire('activate');
ok((await cachedUrls()).includes(`${SCOPE}audio/${KEY_A}.mp3?v=0000old0`),
  'إخفاقُ ملفٍ يمنع الكنس — لا يُمحى مخزونٌ قائمٌ في جولةٍ ناقصة');
setSite({ aBody: 'صوت واحد — الجديد', aTag: '9999aaaa' });   // عاد الملف
await fire('install');
await fire('activate');
ok(!(await cachedUrls()).includes(`${SCOPE}audio/${KEY_A}.mp3?v=0000old0`)
  && (await cachedUrls()).length === 2,
  'وأوّلُ جولةٍ تامّةٍ تكنسه (الكنسُ مؤجَّلٌ لا مُلغى)');

// ————————— ٤. ترقيةُ النسخة لا تعيد تنزيل الصوت —————————
//
// **العيبُ المحروس**: لو حمل اسمُ مخزن الصوت رقمَ النسخة لَوُلِد مخزنٌ فارغ مع كل
// ترقية، فيعيد جهازُ الطفل جلبَ البنك كلِّه في **كل** تحديث. وهو هدرٌ محض: بصماتُ
// المحتوى تحكم الطزاجة سلفاً. والفحصُ ترقيةٌ حقيقية: `app/sw.js` نفسُه برقم نسخةٍ
// مرفوع يُركَّب فوق المخزون القائم، ويُقاس ما جُلب — والمطلوب صفر.

console.log('\n٤. ترقيةُ النسخة لا تعيد جلبَ صوتٍ لم تتغيّر بصمتُه');

const bumped = swSource.replace(/(const VERSION = '[^']*)'/, "$1-bump'");
const next = loadSw(bumped);
net = [];
await next.fire('install');
await next.fire('activate');
ok(mp3Hits().length === 0, `الترقيةُ لم تجلب ملفاً صوتياً واحداً (${mp3Hits().length} طلباً)`);
ok((await caches.keys()).filter((n) => n.startsWith('ihsib-audio')).length === 1
  && (await caches.keys()).includes(AUDIO_CACHE),
  `ومخزنُ الصوت واحدٌ باسمه الثابت عبر النسخ (${AUDIO_CACHE})`);
ok((await cachedUrls()).length === 2, `والصوتان في موضعيهما (${(await cachedUrls()).length})`);
ok(!(await caches.keys()).some((n) => n.startsWith('ihsib-shell') && !n.includes('bump')),
  'وقشرةُ النسخة السابقة وحدَها مُحيت (ملفاتُها تتبدّل تحت أسمائها فتحتاج الوسم)');

console.log(fails ? `\n${fails} فشل` : '\nكل اختبارات كسر كاش الصوت ناجحة');
process.exit(fails ? 1 : 0);
