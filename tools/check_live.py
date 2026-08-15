#!/usr/bin/env python3
# يحرس: app/CNAME app/index.html app/welcome/** app/audio/manifest.json app/js/**
#   .github/workflows/pages.yml
#   (المنشورُ وقائمةُ صفحاته المشتقّة وبنكُ صوته وسيرُ نشره)

"""فحصُ الموقع الحيّ — هل ما في الشجرة هو ما يُخدَم فعلاً على `calc.mishkat.qa`؟

    python3 tools/check_live.py              # يجلب الصفحات والأصول ويطبع الحصيلة
    python3 tools/check_live.py --base URL   # على نطاقٍ آخر (معاينة، أو خادم محلّي)
    python3 tools/check_live.py --self-test  # بلا شبكة: يتحقّق من العدّة نفسِها

**لماذا أداةٌ لا اطمئنان** (منقولةٌ من «اِقْرَأْ» بدرسها، الجلسة ٩): هناك ردّت صفحتان
من المرجع **٤٠٤** على الموقع الحيّ بينما أختاهما ٢٠٠ — فبدت البوّابةُ منشورةً نصفَها
أمام معلّم. ولم يكن العيبُ في الشيفرة ولا في اسمٍ ولا في عامل الخدمة: **الملفّان
كانا في الشجرة وفي التزامٍ محلّيّ ولم يبلغا `origin/main` بعد**، و`pages.yml` ينشر
عند الدفع لا عند الالتزام. فالفجوةُ صنفٌ لا يمسكه فحصٌ على القرص أبداً — «مُلتزَمٌ»
ليست «منشورة» — ولا يُغلق إلا **بجلبٍ فعليّ بعد النشر**. وهذا أوّلُ نشرٍ لـ«اِحْسِبْ»،
فالدرسُ يدخل معه لا بعده.

**وقائمةُ الصفحات مشتقّةٌ من الشجرة لا مكتوبةً بيد**: كلُّ `app/welcome/*.html` يدخل
الفحص، فصفحةٌ خامسة تُكتب غداً تُفحَص حيّةً **يوم تُكتب** بلا سطرٍ يُعدَّل هنا. ومعها
أصولٌ مُشتقّة كذلك (التنسيق والخطوط ولقطةٌ وأيقونة) — فالصفحةُ بلا أصولها ورقةٌ عارية.

————— بابُ «مَنطوقٌ بلا صوتٍ على المنشور» (قيدُ الجلسة ث الافتتاحيّ) —————

**العيبُ الذي وُلد منه** (بلاغ ص٦، وحكمُ المدير عليه): نصَّ المديرُ على «يُلتزَم ولا
يُنشَر» لشقٍّ بدّل سبعةَ نصوصٍ منطوقة بلا ملفّاتها — **وذلك لا يُنفَّذ على فرعٍ واحد**:
الدفعُ يحمل ما قبله، فمضى الشقُّ إلى الحيّ مع أوّل دفعةٍ تالية، وسمع الطفلُ نطقاً
آلياً نحوَ ساعةٍ وربع. و`check_speech.mjs` كان أخضرَ بحقّ: عقدُه أنّ لكلِّ نصٍّ **ملفاً
أو مكاناً في القائمة** — والقائمةُ عهدٌ بين جلستين لا وعدٌ للطفل.

**فالقاعدة**: لا شيفرةَ تُلتزَم قبل أن تصلح للنشر — **وحدُّ الصلاحية هذا الباب**: كلُّ
نصٍّ منطوقٍ في الشجرة له ملفُّه **في البنك الذي يُنشَر** (`app/audio/manifest.json`
يُنسَخ مع `app/` كلِّه)، **وله ملفُّه في الفهرس المنشور فعلاً** (يُجلَب من الحيّ). فالأولُ
يقول «يصلح للدفع»، والثاني يقول «وقد وصل». والنصُّ المنطوقُ يُشتقّ من **`queue_texts.mjs
--wanted-json`** — اشتقاقُ `check_speech.mjs` نفسُه، فلا نسخةَ ثانيةٌ تفترق.

**وموضعُ البابِ الفحصُ الحيّ لا الفحصُ الذاتيّ**: جلسةُ التطوير تصفّ نصوصَها في القائمة
ولا تولّد صوتاً (عهدُ `METHOD.md §٨`)، فلو حكم البابُ في السَّوقة لَاحمرّت كلُّ جلسةٍ
تكتب نصّاً — والحمرةُ الدائمة تُتجاهَل. فيحكم **حيث يقع الضرر**: عند النشر. **وفحصُه
الذاتيّ يُجرّبه سالباً** بجردٍ مصنوع، فلا يُصدَّق بابٌ لم يُرَ وهو يمسك.

**وفي السَّوقة تُشغَّل بفحصها الذاتي** — وتُعلن ذلك بنفسها في السطر التالي، فيقرؤه
`guards.mjs` ولا يعرف اسمَها (سَوقة: --self-test). والعلّةُ أنّها تحتاج شبكةً وموقعاً
منشوراً، والسَّوقةُ تعمل بلا إنترنت وقبل النشر — وحارسٌ أحمرُ دائماً حارسٌ يُتجاهَل.
**وفحصُها الحيّ واجبُ ما بعد النشر**: يُشغَّل باسمه ويُقيَّد جوابُه في بند الجلسة.
"""

import argparse
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
WELCOME = APP / "welcome"
BANK = APP / "audio" / "manifest.json"
BASE = "https://calc.mishkat.qa/"
TIMEOUT = 25


def pages() -> list[tuple[str, str]]:
    """(المسار، العنوان المتوقَّع) لكل صفحةٍ في `app/welcome/` — مشتقٌّ من القرص."""
    out = []
    for path in sorted(WELCOME.glob("*.html")):
        title = re.search(r"<title>([^<]+)</title>", path.read_text(encoding="utf-8"))
        url = "welcome/" if path.name == "index.html" else f"welcome/{path.name}"
        out.append((url, title.group(1).strip() if title else ""))
    return out


def assets() -> list[str]:
    """أصولٌ تُثبت أن المنشور كاملٌ لا هيكلاً: التنسيق والخطّان ولقطةٌ وأيقونة والتطبيق.

"""
    shot = sorted((WELCOME / "shots").glob("*.png"))
    font = sorted((WELCOME / "fonts").glob("*.woff2"))
    # **وفهرسُ البنك أصلٌ كسائرها**: بابُ «منطوقٌ بلا صوت» يقرؤه من الحيّ، فلا يُقاس
    # على غيابٍ لم يُقَل — فهرسٌ لا يُخدَم خبرٌ يُعلَن باسمه لا صمتٌ يُؤوَّل.
    out = ["", "welcome/welcome.css", "css/app.css", "manifest.webmanifest", "sw.js",
           "js/install.js", "audio/manifest.json", "CNAME"]
    if shot:
        out.append(f"welcome/shots/{shot[0].name}")
    if font:
        out.append(f"welcome/fonts/{font[0].name}")
    return out


def spoken_texts() -> tuple[list[str], str]:
    """كلُّ نصٍّ منطوقٍ في الشجرة — **باشتقاق `queue_texts.mjs` نفسِه** لا بنسخةٍ عنه.

    يُرجِع (النصوص، علّةُ التعذُّر) — وتعذُّرُ الاشتقاق **علّةٌ تُنقَل بنصّها** ويحمرّ
    البابُ بها، لا صمتٌ يُقرأ نجاحاً (وهو عينُ ما يفعله `check_speech.mjs`).
    """
    tool = ROOT / "tools" / "queue_texts.mjs"
    try:
        run = subprocess.run(["node", str(tool), "--wanted-json"],
                             capture_output=True, text=True, timeout=120)
    except Exception as error:                       # node غائبٌ أو لا يُنفَّذ
        return [], str(error)
    if run.returncode != 0:
        note = (run.stderr or run.stdout).strip().splitlines()
        return [], " | ".join(note[:3])
    line = next((l for l in reversed(run.stdout.strip().splitlines())
                 if l.startswith("[")), None)
    if not line:
        return [], "لا مخرَجَ JSON من queue_texts.mjs --wanted-json"
    return [text for text, _ in json.loads(line)], ""


def bank_texts(raw: str) -> set[str]:
    """نصوصُ فهرسِ بنكٍ (بصمةٌ ← نصّ) — وفهرسٌ لا يُقرأ يُرَدّ فارغاً فيحمرّ الباب."""
    try:
        data = json.loads(raw)
    except Exception:
        return set()
    return set(data.values()) if isinstance(data, dict) else set()


def voiceless(spoken: list[str], shipped: set[str], published: set[str]) -> dict:
    """**النصوصُ المنطوقةُ التي لا صوتَ لها** — بابُ الجلسة ث، دالّةٌ خالصة تُجرَّب سالباً.

    - `mute`   منطوقٌ **لا ملفَّ له في الشجرة**: لا يصلح للدفع أصلاً (عيبُ ص٦).
    - `unsent` له ملفٌّ في الشجرة وليس في الفهرس المنشور: مُلتزَمٌ لم يُنشَر بعد.
    """
    return {
        "mute": [t for t in spoken if t not in shipped],
        "unsent": [t for t in spoken if t in shipped and t not in published],
    }


def fetch(url: str, cap: int = 4096) -> tuple[int, str]:
    """(الرمز، أولُ الجسم) — و٤٠٤ خبرٌ لا عطب، فتُقرأ كما تُقرأ ٢٠٠.

    و`cap` حدُّ القراءة: أربعةُ كيلوباتٍ تكفي ترويسةَ صفحةٍ ولا تكفي **فهرساً يُحلَّل**
    (`cap=0` يقرأ الجسم كلَّه) — وقصُّ الفهرس يجعله لا يُقرأ فيُتَّهم المنشورُ بالفراغ.
    """
    request = urllib.request.Request(url, headers={"User-Agent": "ihsib-live-check"})
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            raw = response.read() if cap <= 0 else response.read(cap)
            return response.status, raw.decode("utf-8", "replace")
    except urllib.error.HTTPError as error:
        return error.code, ""
    except Exception as error:                       # شبكةٌ لا تُجيب: عطبٌ يُقال
        return 0, str(error)


def check(base: str) -> int:
    base = base if base.endswith("/") else base + "/"
    fails = 0
    print(f"الموقع الحيّ: {base}\n")

    print("— الصفحات —")
    for url, title in pages():
        code, body = fetch(base + url)
        got = re.search(r"<title>([^<]+)</title>", body)
        got = got.group(1).strip() if got else ""
        good = code == 200 and got == title
        fails += 0 if good else 1
        mark = "✓" if good else "✗"
        note = f"{code}" + (f" — «{got}»" if got else "")
        if code == 200 and got != title:
            note += f" ✗ والمنتظَر «{title}»"
        print(f"  {mark} /{url:<26} {note}")

    print("\n— الأصول —")
    for url in assets():
        code, _ = fetch(base + url)
        fails += 0 if code == 200 else 1
        print(f"  {'✓' if code == 200 else '✗'} /{url or '(جذر التطبيق)':<26} {code}")

    print("\n— النُّطق: لا منطوقٌ بلا صوت —")
    spoken, why = spoken_texts()
    if why:
        print(f"  ✗ اشتقاقُ النصوص المنطوقة متعذّر — {why}")
        fails += 1
    else:
        shipped = bank_texts(BANK.read_text(encoding="utf-8")) if BANK.exists() else set()
        _, body = fetch(base + "audio/manifest.json", cap=0)
        published = bank_texts(body)
        gap = voiceless(spoken, shipped, published)
        for label, key, note in (
            ("لا يصلح للنشر", "mute", "منطوقٌ بلا ملفٍّ في الشجرة — تُصرَّف الدفعةُ قبل الدفع"),
            ("مُلتزَمٌ لم يُنشَر", "unsent", "له ملفٌّ في الشجرة وليس في الفهرس المنشور"),
        ):
            bad = gap[key]
            fails += 0 if not bad else 1
            mark = "✓" if not bad else "✗"
            print(f"  {mark} {label}: {len(bad)}"
                  + (f" — {note}: {' · '.join(bad[:5])}" if bad else ""))
        if not gap["mute"] and not gap["unsent"]:
            print(f"  ✓ {len(spoken)} نصّاً منطوقاً، لكلٍّ ملفُّه في الشجرة وفي الفهرس المنشور")

    print(f"\n{fails} إخفاق — المنشورُ ليس ما في الشجرة" if fails
          else "\nالمنشورُ هو ما في الشجرة: كلُّ صفحةٍ وأصلٍ يردّ ٢٠٠ بعنوانه، "
               "وكلُّ منطوقٍ له صوتُه.")
    return 1 if fails else 0


def self_test() -> int:
    """بلا شبكة: العدّةُ نفسُها — القائمةُ مشتقّةٌ، ولكل صفحةٍ عنوانٌ يُقابَل به."""
    fails = 0
    found = pages()
    on_disk = {p.name for p in WELCOME.glob("*.html")}
    listed = {("index.html" if u == "welcome/" else u.split("/")[-1]) for u, _ in found}
    if listed != on_disk:
        print(f"  ✗ القائمةُ لا تطابق الشجرة: {sorted(on_disk ^ listed)}")
        fails += 1
    else:
        print(f"  ✓ قائمةُ الصفحات مشتقّةٌ من الشجرة ({len(found)} صفحات)")

    empty = [u for u, t in found if not t]
    if empty:
        print(f"  ✗ صفحةٌ بلا عنوان تُقابَل به: {'، '.join(empty)}")
        fails += 1
    else:
        print("  ✓ ولكلٍّ عنوانٌ في ترويستها يُقابَل به المنشور")

    needed = assets()
    missing = [a for a in needed if a and not (APP / a).exists()]
    if missing:
        print(f"  ✗ أصلٌ مطلوبٌ ليس في الشجرة: {'، '.join(missing)}")
        fails += 1
    else:
        print(f"  ✓ وأصولُها موجودةٌ في الشجرة ({len(needed)} مسارات)")

    # **وملفُّ النطاق منشورٌ ومطابقٌ لِما تفحصه هذه الأداة** (الجلسة ٩): كان في
    # `docs/` حتى يضبط المالكُ Cloudflare (فملفُّ النطاق يحوّل عنوانَ النشر فورَ
    # وصوله)، فلمّا ضُبط الربطُ نُقل إلى `app/` — فصار النطاقُ مكتوباً في المنشور
    # لا في لوحة إعداداتٍ وحدَها، ويُقرأ من هنا كما يقرؤه GitHub.
    cname = ROOT / "app" / "CNAME"
    host = BASE.split("//")[1].strip("/")
    if cname.exists() and cname.read_text(encoding="utf-8").strip() == host:
        print(f"  ✓ وملفُّ النطاق منشورٌ في app/CNAME بنطاقنا ({host})")
    else:
        print(f"  ✗ ملفُّ النطاق مفقودٌ أو يخالف {host}")
        fails += 1

    # ————— بابُ «منطوقٌ بلا صوت»: يُجرَّب سالباً بجردٍ مصنوع —————
    #
    # **ولا يُقاس هنا على الشجرة الحيّة**: النصُّ المصفوفُ في القائمة ينتظر جلسةَ
    # الصوتيات بعهدٍ معلَن، فحكمُ الباب موضعُه النشرُ (أعلاه). والذي يُقاس هنا **الحكمُ
    # نفسُه**: أيمسك المنطوقَ الذي لا ملفَّ له؟ وأيفرّق بين «لا يصلح للدفع» و«لم يصل»؟
    made = ["أَلِفْ", "بَاءْ", "جِيمْ"]
    cases = [
        ("منطوقٌ بلا ملفٍّ في الشجرة يُمسَك",
         voiceless(made, {"أَلِفْ", "بَاءْ"}, {"أَلِفْ", "بَاءْ"}),
         {"mute": ["جِيمْ"], "unsent": []}),
        ("ومُلتزَمٌ لم يُنشَر يُمسَك ويُسمّى باسمه",
         voiceless(made, set(made), {"أَلِفْ"}),
         {"mute": [], "unsent": ["بَاءْ", "جِيمْ"]}),
        ("وسليمٌ يمرّ (لكلٍّ ملفُّه في الشجرة وفي المنشور)",
         voiceless(made, set(made), set(made)), {"mute": [], "unsent": []}),
    ]
    for title, got, want in cases:
        if got == want:
            print(f"  ✓ {title}")
        else:
            print(f"  ✗ {title} — الحصيلة {got} والمنتظَر {want}")
            fails += 1

    # **والاشتقاقُ من أداةٍ واحدة**: يُشغَّل فعلاً فيُثبت أنّ الوصلة قائمة اليوم
    spoken, why = spoken_texts()
    if why or not spoken:
        print(f"  ✗ اشتقاقُ النصوص المنطوقة لا يعمل — {why or 'جردٌ فارغ'}")
        fails += 1
    else:
        print(f"  ✓ والنصوصُ المنطوقة تُشتقّ من `queue_texts.mjs` ({len(spoken)} نصّاً)")
    if BANK.exists() and bank_texts(BANK.read_text(encoding="utf-8")):
        print("  ✓ وفهرسُ البنك في الشجرة المنشورة (app/audio/manifest.json) يُقرأ")
    else:
        print("  ✗ فهرسُ البنك مفقودٌ أو لا يُقرأ — فلا يُقابَل به منطوق")
        fails += 1

    workflow = (ROOT / ".github" / "workflows" / "pages.yml").read_text(encoding="utf-8")
    # علّةُ وجود هذه الأداة: النشرُ **عند الدفع** لا عند الالتزام، وينسخ `app/` كلَّه.
    if "branches: [main]" in workflow and "path: app" in workflow:
        print("  ✓ والنشرُ عند الدفع إلى main ينسخ `app/` كلَّه (فالفجوةُ دفعٌ لا ملفّ)")
    else:
        print("  ✗ سيرُ النشر تغيّر — يُراجَع نصُّ هذه الأداة")
        fails += 1

    print(f"\n{fails} إخفاق" if fails else "\nعدّةُ الفحص الحيّ سليمة (بلا شبكة).")
    return 1 if fails else 0


def main() -> int:
    parser = argparse.ArgumentParser(description="فحصُ الموقع الحيّ بعد النشر")
    parser.add_argument("--base", default=BASE, help=f"عنوان الموقع (افتراضه {BASE})")
    parser.add_argument("--self-test", action="store_true", help="فحصُ العدّة بلا شبكة")
    parser.add_argument("--json", action="store_true", help="الحصيلة بيانات لا نصّاً")
    args = parser.parse_args()

    if args.self_test:
        return self_test()
    if args.json:
        base = args.base if args.base.endswith("/") else args.base + "/"
        out = {u: fetch(base + u)[0] for u, _ in pages()}
        out.update({a: fetch(base + a)[0] for a in assets()})
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return 0 if all(v == 200 for v in out.values()) else 1
    return check(args.base)


if __name__ == "__main__":
    sys.exit(main())
