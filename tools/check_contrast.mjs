// **حارسُ التباين** — «الحبرُ يُقاس على لونه، نهاراً وليلاً»:
//   node tools/check_contrast.mjs              # القياسُ على اللوح الحيّ
//   node tools/check_contrast.mjs --self-test  # فحصُ الفاحص: أيمسك المخالفات؟
// يحرس: app/css/app.css
//   (اللوحُ كلُّه: رموزُه النهارية والليلية، وقواعدُ الزرّين الطفليين)
//
// ————— العيبُ الذي وُلد منه (بلاغ العائلة `2026-08-16-seed-defect-fff-on-star`) —————
//
// جاءنا من إدارة اِسْمَعْ: نصُّ أزرار الفعل الرئيس كان `#fff` **مكتوبةً حرفياً** لا
// `--on-accent` — تصدُق على لوح البذرة النهاريّ وتكذب على من بدّل لوحَه أو أظلم
// وضعُه الليليّ. وكانت فينا كما كانت فيهم: `--star` ليلاً `#66C6BF` فاتح، وفوقه
// حبرٌ أبيضُ مكتوبٌ بيد ⇒ **٢٫٠٥:١** والعتبة ٤٫٥.
//
// **والقيمةُ الحرفية عَرَضٌ، والعلّةُ أنّ التباين لم يكن يُقاس أصلاً**: لوحُنا يُبدَّل
// في جلسات الهوية، ورمزُ النصّ-فوق-اللون يُقلَب في الليليّ، ولا شيءَ يسأل «أيقرأ
// الطفلُ ما كُتب؟». فالقياسُ ههنا بابٌ دائم لا إصلاحُ مرّة: يُعاد على كل تبديلِ لوح.
//
// ————— وبابان —————
//
//   ١) **الحبرُ فوق لون الفعل يبلغ ٤٫٥:١** (WCAG AA لنصٍّ عاديّ) في الوضعين معاً —
//      **والقيمُ تُقرأ من قواعد اللوح نفسِها** لا تُكتب هنا بيد: من بدّل لون الزرّ
//      أو حبرَه غداً يُقاس ما كتب، لا ما كُتب في هذا الملفّ يومَ وُلد.
//   ٢) **لا حبرَ أبيضَ حرفيّ خارج تعريفات الرموز** (`:root` النهاريّ والليليّ):
//      `#fff` و`#ffffff` و`white` و`rgb(255,255,255)` — فالبياضُ في قاعدةِ عنصرٍ
//      **لا يُقلَب ليلاً** مهما قُلب اللوحُ تحته، وهو صنفُ العيب لا فردُه.
//
// **وشريطُ المعاينة يُقاس ولا يُحكَم به**: سطرُ كبارٍ في `?dev=1` خارج شاشة الطفل
// (وأزرارُه دون هدف اللمس بأسبابها المكتوبة في اللوح) — فيُطبَع قياسُه خبراً، ولا
// تُحمَّل عتبةُ نصِّ الطفل على شريطِ أداة. وما لا يُحكَم به **يُسمّى**، ولا يُسكَت عنه.

import { readFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const THRESHOLD = 4.5;          // WCAG AA — نصٌّ عاديّ (والزرّان نصُّهما ١٫١ريم فأقلّ)

// ————— لوحُ الألوان: قراءةٌ وحساب —————

/** يمحو التعليقات ويُبقي الأسطر (فتصدُق أرقامُ السطور في البلاغ). */
const stripComments = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

/** جسمُ أوّل كتلةٍ تبدأ عند `at` — بمقابلة الأقواس لا بأوّل `}` يصادَف. */
function block(css, at) {
  const open = css.indexOf('{', at);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return { body: css.slice(open + 1, i), end: i + 1 };
  }
  return null;
}

/** يفصل اللوحَ الليليَّ عن النهاريّ — فلكلِّ وضعٍ رموزُه وقواعدُه. */
function modes(css) {
  const at = css.search(/@media[^{]*prefers-color-scheme:\s*dark/);
  if (at < 0) return { day: css, night: '' };
  const b = block(css, at);
  return b ? { day: css.slice(0, at) + css.slice(b.end), night: b.body } : { day: css, night: '' };
}

/** رموزُ `:root` — أوّلُ كتلةٍ لها في النصّ المعطى. */
function tokens(css) {
  const at = css.search(/(^|[};])\s*:root\s*\{/);
  const b = at < 0 ? null : block(css, at);
  const out = {};
  if (b) for (const [, k, v] of b.body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[k] = v.trim();
  return out;
}

/** إعلاناتُ محدِّدٍ بعينه، مدموجةً بترتيب ورودها (فالأخيرُ يعلو كما في المتصفّح). */
function decls(css, selector) {
  const out = {};
  for (const [, sel, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!sel.split(',').some((s) => s.trim().replace(/\s+/g, ' ') === selector)) continue;
    for (const [, k, v] of body.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) out[k.trim()] = v.trim();
  }
  return out;
}

/** يحلّ `var(--x, احتياط)` إلى قيمةٍ صريحة — متتابعاً حتى ينتهي التداخل. */
function resolve(value, vars, depth = 0) {
  if (!value || depth > 8) return value;
  const m = value.match(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/);
  if (!m) return value.trim();
  const got = vars[m[1]] !== undefined ? vars[m[1]] : (m[2] || '');
  return resolve(value.slice(0, m.index) + got + value.slice(m.index + m[0].length), vars, depth + 1);
}

/** `#rgb` · `#rrggbb` · `rgb()` ⇒ ثلاثةُ أعداد (٠–٢٥٥)، وما سواه `null`. */
function rgb(value) {
  const v = (value || '').trim();
  let m = v.match(/^#([0-9a-f]{3})$/i);
  if (m) return [...m[1]].map((c) => parseInt(c + c, 16));
  m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  m = v.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const n = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return n.length >= 3 && n.slice(0, 3).every(Number.isFinite) ? n.slice(0, 3) : null;
  }
  if (v.toLowerCase() === 'white') return [255, 255, 255];
  if (v.toLowerCase() === 'black') return [0, 0, 0];
  return null;
}

/** لمعانٌ نسبيّ (WCAG 2.x) — وهو ما تراه العين لا متوسّطُ القنوات. */
const luminance = ([r, g, b]) => {
  const f = (c) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

/** نسبةُ التباين بين لونين (١ ← ٢١). */
function ratio(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

/** حبرٌ بشفافيةٍ يُركَّب على أرضيته — فالشفافُ لا يُقاس بقيمته المكتوبة. */
const over = (fg, bg, alpha) => fg.map((c, i) => alpha * c + (1 - alpha) * bg[i]);

// ————— الأزواجُ المقيسة: **بالمحدِّد لا بالقيمة** —————
//
// الزرّان اللذان يلمسهما طفلُ الرابعة: الفعلُ الرئيس في الشاشات، و«تابِعْ من هنا»
// في صدر الخريطة (وسطرُه الثاني — شفافيتُه تُحسَب، فما يُخفَّف يُقاس مخفَّفاً).
const PAIRS = [
  { name: 'زرُّ الفعل الرئيس `.btn--primary`', on: '.btn--primary' },
  { name: 'بطاقةُ «تابِعْ من هنا» `.continue`', on: '.continue' },
  { name: 'سطرُها الثاني `.continue small`', on: '.continue small', surface: '.continue' },
  { name: 'شريطُ المعاينة `.preview-bar`', on: '.preview-bar', judged: false },
];

/** يقيس زوجاً في وضعٍ واحد — ويقرأ خلفيّتَه من قاعدة سطحه إن لم يُعلنها. */
function measure(pair, dayCss, nightCss, night) {
  const vars = night ? { ...tokens(dayCss), ...tokens(nightCss) } : tokens(dayCss);
  const read = (sel) => (night ? { ...decls(dayCss, sel), ...decls(nightCss, sel) } : decls(dayCss, sel));
  const own = read(pair.on);
  const surface = pair.surface ? read(pair.surface) : own;
  const inkOf = own.color !== undefined ? own : (pair.surface ? surface : own);
  const fg = rgb(resolve(inkOf.color, vars));
  const bg = rgb(resolve(surface.background || surface['background-color'], vars));
  if (!fg || !bg) return { fg, bg, ratio: null };
  const alpha = Number(own.opacity ?? 1);
  return { fg, bg, alpha, ratio: ratio(over(fg, bg, Number.isFinite(alpha) ? alpha : 1), bg) };
}

// ————— البابُ الثاني: البياضُ الحرفيّ خارج الرموز —————

const LITERAL_WHITE = /#fff(?:fff)?\b|\bwhite\b(?!-)|rgba?\(\s*255\s*,\s*255\s*,\s*255/gi;

/** مواضعُ البياض الحرفيّ التي **لا** تقع في كتلة `:root` — لكلٍّ سطرُه ونصُّه. */
function strayWhites(css) {
  const clean = stripComments(css);
  const roots = [];
  for (const m of clean.matchAll(/(^|[{};])\s*:root\s*\{/g)) {   // الليليُّ داخل `@media`
    const b = block(clean, m.index);
    if (b) roots.push([m.index, b.end]);
  }
  const out = [];
  for (const m of clean.matchAll(LITERAL_WHITE)) {
    if (roots.some(([a, b]) => m.index >= a && m.index < b)) continue;
    const line = clean.slice(0, m.index).split('\n').length;
    out.push({ line, text: clean.split('\n')[line - 1].trim(), hit: m[0] });
  }
  return out;
}

// ————— التشغيل —————

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('  ✗', msg); } else console.log('  ✓', msg); };
const fmt = (r) => (r === null ? '—' : r.toFixed(2) + ':1');
const hex = (c) => c ? '#' + c.map((n) => Math.round(n).toString(16).padStart(2, '0')).join('') : '—';

function main() {
  const css = stripComments(readFileSync(new URL('app/css/app.css', ROOT), 'utf8'));
  const { day, night } = modes(css);

  console.log('\n— ١) الحبرُ فوق لونه: نهاراً وليلاً (العتبة ' + THRESHOLD + ':1) —');
  for (const pair of PAIRS) {
    for (const [mode, isNight] of [['نهاراً', false], ['ليلاً', true]]) {
      const m = measure(pair, day, night, isNight);
      const alpha = m.alpha !== undefined && m.alpha < 1 ? ` بشفافية ${m.alpha}` : '';
      const line = `${pair.name} ${mode}: ${hex(m.fg)} على ${hex(m.bg)}${alpha} = ${fmt(m.ratio)}`;
      if (pair.judged === false) console.log('  ·', line, '(يُقاس ولا يُحكَم به — شريطُ كبارٍ في المعاينة)');
      else ok(m.ratio !== null && m.ratio >= THRESHOLD, line);
    }
  }

  console.log('\n— ٢) لا بياضَ حرفياً خارج تعريفات الرموز —');
  const stray = strayWhites(readFileSync(new URL('app/css/app.css', ROOT), 'utf8'));
  ok(stray.length === 0, stray.length
    ? `بياضٌ حرفيّ في ${stray.length} موضعاً: ` + stray.map((s) => `سطر ${s.line} (${s.hit})`).join(' · ')
    : 'صفرُ بياضٍ حرفيّ خارج `:root` — والقلبُ الليليُّ يبلغ كلَّ حبر');

  console.log(fails ? `\n✗ ${fails} إخفاقاً\n` : '\n✓ التباينُ مقيسٌ في الوضعين\n');
  return fails ? 1 : 0;
}

// ————— فحصُ الفاحص —————

function selfTest() {
  console.log('\n— فحصُ الفاحص —');
  const T = (cond, msg) => ok(cond, msg);

  // الحساب: مرجعٌ معروف
  T(Math.abs(ratio([255, 255, 255], [0, 0, 0]) - 21) < 1e-9, 'الأبيضُ على الأسود ٢١:١');
  T(Math.abs(ratio([46, 140, 134], [46, 140, 134]) - 1) < 1e-9, 'اللونُ على نفسه ١:١');

  // البابُ الأول يمسك عينَ البلاغ: أبيضُ حرفيّ على فيروزيٍّ ليليّ
  const BAD = `:root { --star: #2E8C86; --on-accent: #fff; }
    @media (prefers-color-scheme: dark) { :root { --star: #66C6BF; --on-accent: #23282E; } }
    .btn--primary { background: var(--star); color: #fff; }`;
  const GOOD = BAD.replace('color: #fff; }', 'color: var(--on-accent); }')
    .replace('--star: #2E8C86', '--star: #287B76');
  const at = (css, night) => {
    const m = modes(css);
    return measure({ on: '.btn--primary' }, m.day, m.night, night).ratio;
  };
  T(at(BAD, true) < 2.5, `العيبُ يُمسَك ليلاً: ${fmt(at(BAD, true))} دون العتبة`);
  T(at(GOOD, true) >= THRESHOLD && at(GOOD, false) >= THRESHOLD,
    `والمُصلَحُ يمرّ في الوضعين: ${fmt(at(GOOD, false))} نهاراً · ${fmt(at(GOOD, true))} ليلاً`);

  // الشفافيةُ تُحسَب: حبرٌ مخفَّفٌ يسقط وإن كان أصلُه كافياً
  const FADED = GOOD + ' .btn--primary small { opacity: .5; }';
  const faded = (() => { const m = modes(FADED); return measure(
    { on: '.btn--primary small', surface: '.btn--primary' }, m.day, m.night, false).ratio; })();
  T(faded !== null && faded < THRESHOLD, `والشفافُ يُقاس مخفَّفاً: ${fmt(faded)} دون العتبة`);

  // البابُ الثاني: الرموزُ تمرّ، والقواعدُ لا، والتعليقُ ليس شيفرة
  const roots = strayWhites(':root { --mix: #fff; }\n@media (prefers-color-scheme: dark) { :root { --x: #FFFFFF; } }');
  T(roots.length === 0, 'بياضُ `:root` نهاراً وليلاً يمرّ (وهو موضعُ التعريف)');
  for (const [css, what] of [
    ['.a { color: #fff; }', '#fff'],
    ['.a { color: #FFFFFF; }', '#ffffff'],
    ['.a { border-color: white; }', 'white'],
    ['.a { background: rgba(255, 255, 255, .5); }', 'rgba(255,255,255)'],
    ['.a { border-color: color-mix(in srgb, #fff 55%, transparent); }', 'ممزوجةٌ في `color-mix`'],
  ]) T(strayWhites(css).length === 1, `يُمسَك: ${what}`);
  T(strayWhites('/* #fff في تعليقٍ يشرح لِمَ هُجرت */\n.a { color: var(--on-accent); }').length === 0,
    'وذكرُها في تعليقٍ ليس حِملاً — أثرُ قرارٍ لا بقيّةٌ منه');
  T(strayWhites('.a { white-space: nowrap; }').length === 0, 'و`white-space` ليست لوناً');

  console.log(fails ? `\n✗ ${fails} إخفاقاً\n` : '\n✓ الفاحصُ يمسك ما وُضع له\n');
  return fails ? 1 : 0;
}

process.exit(process.argv.includes('--self-test') ? selfTest() : main());
