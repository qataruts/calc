#!/usr/bin/env python3
"""أيخدم الوسيطُ صوتَنا من حافّته أم يمرّ كلُّ طلبٍ إلى GitHub؟

    python3 tools/cdn_check.py                 # عيّنةٌ من بنك الصوت + القشرة
    python3 tools/cdn_check.py --sample 40     # عيّنةٌ أوسع
    python3 tools/cdn_check.py --self-test     # فحصٌ ذاتيّ بلا شبكة

## لماذا هذه العدّة

**منقولةٌ من «اِقْرَأْ»** (الجلسة ٩) بعلّتها نفسِها: النطاقُ خلف Cloudflare لأمرين —
معرفةِ الدول، **وتخفيفِ حصة GitHub Pages** (مئةُ غيغابايت في الشهر). و«اِحْسِبْ» أخفُّ
من أخيه كثيراً — جهازٌ جديد ينزّل نحو أربعة ميغابايت مرّةً واحدة — **لكنّ السؤال هو
هو**: أيخدم الوسيطُ ملفاتِنا من حافّته أم يمرّ كلُّ طلبٍ إلى GitHub؟ والجوابُ يُقرأ
ولا يُظَنّ. **وما لم يُقَس اليومَ يصير ظنّاً يومَ يكبر البنكُ الصوتيّ.**

**ولا يُعرَف ذلك بالظنّ**: الوسيطُ يقول ما فعل في ترويسة `cf-cache-status`:
  · `HIT` — أُخرِج من حافّة الوسيط، **ولم يُتعَب المصدرُ أصلاً** ← وهو المطلوب
  · `MISS` — لم يكن مخزوناً فجُلب من المصدر، **ويُخزَّن بعدها**
  · `EXPIRED` / `REVALIDATED` — كان مخزوناً وانتهت مدّتُه فأُنعش
  · `DYNAMIC` — **الوسيطُ قرّر ألّا يخزّنه** ← وهذا وحدَه ما يُقلق

فالعدّةُ تطلب كلَّ ملفٍّ **مرّتين**: الأولى تُدفئ الحافّة، والثانية هي الحكم.
والحكمُ على الثانية: `HIT` نجاح، و`DYNAMIC` إخفاق.

**ولا تُقاس الصفحاتُ بالمعيار نفسِه**: HTML يُنعَش سريعاً عمداً كي يصل التحديثُ
إلى الأجهزة، فـ`DYNAMIC` فيها ليست عيباً — والمقيسُ هنا **الصوتُ والرموزُ والخطوط**،
وهي الثقلُ كلُّه.

## قاعدةُ التخزين المضبوطة في Cloudflare (قرار المالك، ٧ أغسطس ٢٠٢٦)

اسمُها `immutable-assets`، وشرطُها **بالامتداد لا بالمجلَّد**:

    URI Path ends with `.mp3`  أو  `.svg`  أو  `.woff2`
    ⇒ Eligible for cache · Edge TTL = شهر · Browser TTL = سنة

**ولماذا بالامتداد**: `/audio/` يحوي `versions.json` و`manifest.json` — **وفيهما
البصماتُ التي بها يطلب التطبيقُ كلَّ صوت** (وكذلك `emoji/index.json`). فلو جُمّد المجلَّد شهراً لجُمّد بيانُ
البصمات معه، فتظلّ الأجهزةُ تطلب القديمَ شهراً **والصوتُ الجديد لا يصل طفلاً واحداً**
— وهو عينُ العطب الذي وُضع نظامُ البصمات لمنعه. فـ`.json` خارج القاعدة أبداً.

**ولماذا شهرٌ لا يوم** (والمالك اختاره لأنّ التطبيق مجّانيّ بلا ميزانية): الكلفةُ
لا تتعلّق بعدد الأطفال بل **بعدد مراكز الحافّة × عدد الدورات**. فبمدّةِ يومٍ وخمسةٍ
وعشرين مركزاً ≈ ٣١ غ.ب شهرياً، وبمدّةِ شهرٍ ≈ **غيغابايتٌ واحد** — من حصةٍ مئةٍ.

**والجدّةُ لا تأتي من المدّة**: رابطُ الصوت يحمل بصمةَ محتواه، فالمبدَّلُ يولّد رابطاً
**لم يره أيُّ مركزٍ في العالم** فيُجلَب طازجاً ولو كانت المدّةُ سنة. فالمدّةُ الطويلة
**أرخصُ وأأمنُ معاً**، والقصيرةُ تكرارٌ بلا فائدة.
"""

import argparse
import json
import random
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://calc.mishkat.qa/"
VERSIONS = ROOT / "app" / "audio" / "versions.json"

GOOD = {"HIT", "EXPIRED", "REVALIDATED", "UPDATING", "STALE"}
BAD = {"DYNAMIC", "BYPASS"}


# **العنوانُ يُؤخَذ من خوادم الوسيط نفسِها لا من مُحلِّل الجهاز** (درسُ اقرأ يوم
# النقل): كاشُ حاسوب التطوير قد يبقى على الخوادم القديمة، فيبدو أنّ الحركة لا تمرّ
# بالوسيط بينما هي تمرّ فعلاً على أجهزة الناس. فالقياسُ يسأل خادمَ أسماء النطاق
# مباشرةً — فيصدُق مهما كان كاشُ الجهاز، ويصحّ يومَ الربط كما يصحّ بعده.
#
# **وخادمُ الأسماء يُشتقّ من النطاق ولا يُكتب بيد**: `mishkat.qa` نطاقٌ واحد لإخوةٍ
# عدّة، وخوادمُه قد تتبدّل — فيُسأل عنها النطاقُ نفسُه (`dig NS`)، ولو كُتبت هنا
# لصار الحارسُ يقيس أمساً.
_EDGE_IP = None


def edge_ip() -> str:
    global _EDGE_IP
    if _EDGE_IP is None:
        host = SITE.split("//")[1].strip("/")
        zone = ".".join(host.split(".")[-2:])
        servers = subprocess.run(["dig", "+short", "NS", zone],
                                 capture_output=True, text=True).stdout.split()
        server = next((s.rstrip(".") for s in servers if s.strip()), "")
        cmd = ["dig", "+short", host] if not server else ["dig", f"@{server}", "+short", host]
        out = subprocess.run(cmd, capture_output=True, text=True).stdout
        ips = [l for l in out.split() if l and l[0].isdigit()]
        _EDGE_IP = ips[0] if ips else ""
    return _EDGE_IP


def head(url: str) -> dict:
    """طلبُ ترويسةٍ **من الحافّة بعينها** — بـ`curl --resolve` لتجاوز كاش الجهاز."""
    host = SITE.split("//")[1].strip("/")
    cmd = ["curl", "-sI", "--max-time", "25", "-A", "ihsib-cdn-check/1.0"]
    if edge_ip():
        cmd += ["--resolve", f"{host}:443:{edge_ip()}"]
    cmd.append(url)
    out = subprocess.run(cmd, capture_output=True, text=True).stdout
    if not out.strip():
        return {"code": 0, "headers": {}}
    lines = out.splitlines()
    code = int(lines[0].split()[1]) if len(lines[0].split()) > 1 else 0
    headers = {}
    for line in lines[1:]:
        if ":" in line:
            k, v = line.split(":", 1)
            headers[k.strip().lower()] = v.strip()
    return {"code": code, "headers": headers}


def behind_proxy() -> tuple[bool, str]:
    """أوصلت الحركةُ إلى الوسيط بعد؟ — الترويسةُ تقول، لا الظنّ."""
    r = head(SITE)
    server = r["headers"].get("server", "—")
    return "cloudflare" in server.lower(), server


def audio_sample(n: int) -> list:
    """عيّنةٌ من بنك الصوت **بروابطها الموسومة** — كما يطلبها التطبيق حرفاً."""
    tags = json.loads(VERSIONS.read_text(encoding="utf-8"))
    urls = [f"{SITE}audio/{k}.mp3?v={v}" for k, v in tags.items()]
    return random.Random(7).sample(urls, min(n, len(urls)))


def shell_sample() -> list:
    return [f"{SITE}{p}" for p in (
        "css/app.css", "js/main.js", "js/curriculum.js",
        "fonts/Kufam-arabic.woff2", "fonts/BalooBhaijaan2-arabic.woff2",
        "emoji/index.json", "icons/icon-192.png", "audio/versions.json",
    )]


# **و`.json` يُنتظَر منه العكس** (وهو عينُ قاعدة التخزين أعلاه): فيه بصماتُ الصوت
# التي بها يطلب التطبيقُ كلَّ ملفّ، فتخزينُه شهراً يحبس الجديدَ عن الأجهزة شهراً.
# فالحكمُ عليه مقلوب: `DYNAMIC` صوابٌ مقصود، و`HIT` **إخفاقٌ يجب أن يُرى** —
# والحارسُ الذي يعدّ الصوابَ إخفاقاً يُعلَّم تجاهلُه، ثم يمرّ تحته الخطأُ الحقيقيّ.
FRESH = (".json",)


def measure(urls: list, label: str) -> tuple[int, int, int]:
    print(f"\n{label} ({len(urls)}):")
    good = bad = other = 0
    for url in urls:
        head(url)                                   # الأولى تُدفئ الحافّة
        r = head(url)                               # والثانية هي الحكم
        status = (r["headers"].get("cf-cache-status") or "—").upper()
        age = r["headers"].get("age", "0")
        name = url.split("/")[-1].split("?")[0]
        keep_fresh = name.endswith(FRESH)
        wanted = (status in BAD) if keep_fresh else (status in GOOD)
        if wanted:
            good += 1
            if keep_fresh:
                print(f"   ✓ {status:<10} {name[:44]} (طازجٌ عمداً — فيه البصمات)")
        elif status in GOOD or status in BAD:
            bad += 1
            print(f"   ✗ {status:<10} {name[:44]}"
                  + (" — **مخزونٌ وفيه البصمات**: الجديدُ لا يصل الأجهزة" if keep_fresh else ""))
        else:
            other += 1
            print(f"   ? {status:<10} {name[:44]} (عمر {age})")
    print(f"   على المطلوب: {good} · مخالف: {bad} · غيرُ معروف: {other}")
    return good, bad, other


def self_test() -> int:
    checks = [
        (VERSIONS.exists(), "بيانُ بصمات الصوت موجود"),
        ("HIT" in GOOD and "DYNAMIC" in BAD, "وتصنيفُ حالات الحافّة معلَن"),
        (FRESH == (".json",), "و`.json` يُنتظَر منه الطزاجةُ لا التخزين (فيه بصماتُ الصوت)"),
        (len(shell_sample()) >= 5, f"وعيّنةُ القشرة {len(shell_sample())} ملفات"),
    ]
    bad = [m for ok, m in checks if not ok]
    for ok, m in checks:
        print(("  ✓ " if ok else "  ✗ ") + m)
    print("\n" + ("عدّةُ فحص الحافّة سليمة (بلا شبكة)."
                  if not bad else f"{len(bad)} فشل"))
    return 1 if bad else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="أيخدم الوسيطُ صوتَنا من حافّته؟")
    ap.add_argument("--sample", type=int, default=12, help="كم ملفَّ صوتٍ يُفحَص")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    proxied, server = behind_proxy()
    print(f"خادمُ الموقع الآن: {server}")
    if not proxied:
        print("\n⚠️ الحركةُ لم تمرّ بالوسيط بعد — فلا معنى لقياس حافّته.\n"
              "   انتظر انتهاءَ انتشار خوادم الأسماء ثم أعِد التشغيل.")
        return 1

    ag, ab, ao = measure(audio_sample(args.sample), "الصوت — وهو الثقلُ كلُّه")
    sg, sb, so = measure(shell_sample(), "القشرةُ والرموزُ والخطوط (وبياناتُ البصمات طازجةً عمداً)")

    print("\n" + "—" * 46)
    if ab == 0 and sb == 0:
        print("✅ الوسيطُ يخدم ملفاتنا من حافّته، وبياناتُ البصمات طازجة — حصةُ GitHub محميّة.")
        return 0
    print(f"⚠️ ملفاتٌ على غير المطلوب: صوت {ab} · قشرة {sb}")
    print("   العلاجُ قاعدةُ تخزينٍ في Cloudflare (Caching ← Cache Rules) تشمل"
          " `/audio/*` و`/emoji/*` و`/fonts/*`.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
