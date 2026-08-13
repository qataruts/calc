#!/usr/bin/env python3
"""لقطاتُ المرجع التعريفي — تُلتقط من التطبيق نفسِه بلا أيّ تبعية.

    python3 tools/make_welcome_shots.py            # يولّد app/welcome/shots/*.png
    python3 tools/make_welcome_shots.py --check    # يتحقّق من وجودها وسلامتها بلا توليد
    python3 tools/make_welcome_shots.py --only map # لقطة واحدة (للتجربة)

لماذا أداةٌ لا يدُ مصمّم: المرجعُ يَعِد المعلّمَ ووليَّ الأمر بما في التطبيق، فصورتُه
يجب أن تكون التطبيقَ لا رسماً له. فالشاشاتُ تُفتَح في `tools/welcome_shots.html` **من
موجِّه التطبيق نفسِه** بتقدُّم طفلٍ مزروع، وتُلتقط هنا بمقاس آيباد طوليّ حقيقيّ — فأيّ
تغيّرٍ في الشاشة يظهر في اللقطة بإعادة التوليد، لا بتحرير صورة.

وكلُّ لقطةٍ تُلتقط مرّتين: **قياسٌ** لطول محتواها في نافذةٍ طويلة، ثم **التقاطٌ** بنافذةٍ
بطول محتواه — فلا يبقى في الصورة ورقٌ خاوٍ تحت الشاشة ولا يُقصّ منها شيء. والطولُ
محصورٌ بين عرض الجهاز (كي لا تنقلب النافذةُ عرضيةً فيتبدّل التصفيف) وطولِ الآيباد
(فالشاشاتُ الطويلة تُعرَض كما تُرى على الجهاز: أوّلُها، وبقيّتها بالسحب عند الطفل).

ملاحظة: هذه أصولٌ رسومية لا صوت — قيدُ «لا تلمس app/audio/» لا يمسّها (كما في
`make_icons.py`).
"""

import argparse
import http.server
import json
import re
import shutil
import socketserver
import struct
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
TOOLS = ROOT / "tools"
OUT = APP / "welcome" / "shots"
PAGE = TOOLS / "welcome_shots.html"
PAGE_PATH = "/__welcome_shots.html"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

DEVICE_W, DEVICE_H = 820, 1180        # آيباد ١٠٫٩ طولي (من `IPADS` في browser_test.py)
MEASURE_H = 4000                      # نافذةُ القياس: أطول من أطول شاشة فلا يُقصّ القياس
MANIFEST = OUT / "manifest.json"      # بيانُ اللقطات — يقرؤه حارسُ المدى

# (المعرّف، عنوانُ الشاشة في المرجع) — والمعرّف اسمُ الشاشة في `welcome_shots.html`.
#
# **التشكيلةُ تعبر الرحلةَ كلَّها** (الجلسة و — `FIELD.md §٣`): كانت كلُّ اللقطات من
# أول الرحلة (عدَّ نقاطٍ بلا رمز) فقرأ الناظرُ التطبيقَ أدنى من مداه. فصارت القاعدة:
# **صورُ التعريف تمثّل مدى التطبيق لا أوّلَه** — من كل عائلة مراحل لقطة، وفيها
# الرموزُ والعملياتُ وأبعدُ ما يبلغه الطفل. ويحرسها بابُ «المدى» في `test_welcome.mjs`
# من بيان اللقطات (`shots/manifest.json`) الذي يكتبه هذا المولّد.
SHOTS = [
    ("map", "درب الرحلة"),
    ("subitize", "كَمْ تَرَى؟"),
    ("count", "اِلْمَسْ وَعُدَّ"),
    ("numeral", "الرمزُ بعد الكمّ"),
    ("compare", "أَكْبَرُ وَأَصْغَر"),
    ("bond", "أَصْدِقَاءُ العَشَرَة"),
    ("machine", "آلَةُ الجَمْع"),
    ("add", "جملةُ الجمع بالرمز"),
    ("sub", "جملةُ الطرح بالرمز"),
    ("diff", "كَمِ الفَرْق؟"),
    ("teen", "عَشَرَةٌ وَآحَاد"),
    ("skip", "اِعْدُدْ قَفْزًا — خطُّ ٠–٢٠"),
    ("pattern", "نَمَطُ (أ ب أ ب)"),
    ("measure", "أَطْوَلُ وَأَثْقَل"),
    ("shape", "كَمْ ضِلْعًا؟ — أضلاعٌ تُعَدّ"),
    ("gate", "بوابةُ الإتقان"),
    ("parent", "لوحةُ وليّ الأمر"),
    ("medal", "ميداليةُ الختام بمعلم المرحلة"),
]

# **المشاهدُ المسوقة تُقرأ من الصفحة نفسِها** (`SCENES` في `welcome_shots.html`) لا
# تُنسَخ هنا فتفترق النسختان: ما ليس تجميداً يحتاج ميزانيةَ وقتٍ افتراضيّ يطوي مُهَلَ
# النمذجة، وميداليةُ الختام تحتاج `dev=1` ليكون زرُّ الإنهاء في الشجرة.
def driven_shots():
    scenes = PAGE.read_text(encoding="utf-8")
    block = scenes[scenes.index("const SCENES = {"):]
    block = block[: block.index("};")]
    return {m.group(1): m.group(2)
            for m in re.finditer(r"(\w+):\s*'(model|guided|finish)'", block)}


def png_size(path: Path):
    """(العرض، الارتفاع) من ترويسة PNG — تحقّقٌ بلا مكتبات."""
    data = path.read_bytes()[:24]
    if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", data[16:24])


def make_server(port: int, results: list):
    """خادمُ مجلد app/ ومعه صفحةُ اللقطات وحدها (فلا تبقى صفحةُ عدّةٍ تُخدَم للطفل)."""

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(APP), **kw)

        def do_GET(self):
            if self.path.split("?")[0] == PAGE_PATH:
                body = PAGE.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            super().do_GET()

        def do_POST(self):
            raw = self.rfile.read(int(self.headers.get("Content-Length", 0)))
            try:
                results.extend(json.loads(raw.decode("utf-8")))
            except json.JSONDecodeError:
                pass
            self.send_response(204)
            self.end_headers()

        def log_message(self, *a):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    return socketserver.TCPServer(("127.0.0.1", port), Handler)


def run_chrome(url: str, profile: Path, extra: list):
    if not Path(CHROME).exists():
        sys.exit(f"لم يُعثر على Chrome في {CHROME}")
    cmd = [CHROME, f"--user-data-dir={profile}", "--no-first-run", "--no-default-browser-check",
           "--headless=new", "--disable-gpu", "--hide-scrollbars"] + extra + [url]
    return subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def wait(proc, until, timeout: int) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline and not until():
        time.sleep(0.4)
    proc.kill()
    return until()


def capture(base: str, profile: Path, results: list, screen: str, timeout: int, scene: str):
    """قياسُ طول الشاشة (ونصِّ ما يُرى) ثم التقاطُها بنافذةٍ بطوله.

    المشاهدُ المسوقة (`scene` غيرُ التجميد) تمشي نمذجتَها بمُهَلها الحقيقية — فتُطوى
    بـ`--virtual-time-budget` في التشغيلَين معاً، والبذرةُ المجمّدة في الصفحة تضمن
    أنّ ما قيس هو عينُ ما التُقط.
    """
    results.clear()
    dev = "&dev=1" if scene == "finish" else ""
    fast = ["--virtual-time-budget=45000"] if scene else []
    proc = run_chrome(f"{base}{PAGE_PATH}?screen={screen}&measure=1{dev}", profile,
                      [f"--window-size={DEVICE_W},{MEASURE_H}"] + fast)
    if not wait(proc, lambda: bool(results), timeout):
        sys.exit(f"لم يصل قياسُ طول الشاشة «{screen}»")
    meta = results[0]
    height = max(DEVICE_W + 1, min(DEVICE_H, int(meta["height"])))

    out = OUT / f"{screen}.png"
    out.unlink(missing_ok=True)
    proc = run_chrome(f"{base}{PAGE_PATH}?screen={screen}{dev}", profile,
                      [f"--screenshot={out}", f"--window-size={DEVICE_W},{height}"] + fast)
    if not wait(proc, out.exists, timeout):
        sys.exit(f"تعذّرت لقطة «{screen}»")
    return out, meta


def generate(args) -> int:
    # **نظافةُ الحظيرة عند الإقلاع** (بلاغ العائلة `2026-08-12-stale-headless-chrome.md`
    # — «browser_test.py وأخواتها»): هذه الأداةُ تطلق كروم بسابقتها هي، فتكنس
    # يتائمَها وحدَهم بكنّاس الأداة الأمّ (الشرطان: السابقةُ ووالدٌ ميّت).
    from browser_test import sweep_stale
    sweep_stale(("ihsib-shots-",))

    OUT.mkdir(parents=True, exist_ok=True)
    results = []
    server = make_server(args.port, results)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    profile = Path(tempfile.mkdtemp(prefix="ihsib-shots-"))
    base = f"http://127.0.0.1:{args.port}"
    scenes = driven_shots()
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))["shots"] \
        if args.only and MANIFEST.exists() else {}
    try:
        for screen, title in SHOTS:
            if args.only and screen != args.only:
                continue
            out, meta = capture(base, profile, results, screen, args.timeout,
                                scenes.get(screen, ""))
            w, h = png_size(out)
            manifest[screen] = {
                "title": title, "route": meta.get("route", ""),
                "w": w, "h": h, "text": meta.get("text", ""),
            }
            print(f"  ✓ {out.relative_to(ROOT)} — {title} ({w}×{h})")
    finally:
        server.shutdown()
        shutil.rmtree(profile, ignore_errors=True)

    # **بيانُ اللقطات**: لكلِّ صورةٍ مسارُها وأبعادُها **ونصُّ ما يُرى فيها** كما قيس
    # من الشاشة الحية — وعليه يقوم حارسُ المدى في `test_welcome.mjs` (تغطيةُ عائلات
    # المراحل، والرموزُ والعملياتُ معروضةً في الصور فعلاً).
    MANIFEST.write_text(json.dumps({
        "note": "يكتبه tools/make_welcome_shots.py — لا يُحرَّر بيد",
        "shots": {k: manifest[k] for k, _ in SHOTS if k in manifest},
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"\n{1 if args.only else len(SHOTS)} لقطة في {OUT.relative_to(ROOT)} — والبيان مكتوب")
    return 0


def check() -> int:
    """لا لقطةَ ناقصة ولا معطوبة ولا بمقاسٍ غريب — ولا لقطةَ يتيمة لا تعرضها صفحة.

    و**المقروءُ صفحاتُ `welcome/` كلُّها**: لقطةٌ تعرضها صفحةُ المنهج مذكورةٌ، ولقطةٌ
    لا تعرضها صفحةٌ يتيمة. (وهو فحصٌ بلا شبكةٍ ولا متصفّح، فيدخل السَّوقة بالجرد.)
    """
    fails = 0
    pages = sorted((APP / "welcome").glob("*.html"))
    html = "\n".join(p.read_text(encoding="utf-8") for p in pages)
    for screen, title in SHOTS:
        path = OUT / f"{screen}.png"
        size = png_size(path) if path.exists() else None
        if not size:
            print(f"  ✗ {screen}.png: مفقودة أو ليست PNG")
            fails += 1
            continue
        w, h = size
        if w != DEVICE_W or not (DEVICE_W < h <= DEVICE_H):
            print(f"  ✗ {screen}.png: مقاس {w}×{h} خارج مقاس الجهاز")
            fails += 1
            continue
        if f"shots/{screen}.png" not in html:
            print(f"  ✗ {screen}.png: لا تعرضها صفحةٌ من صفحات المرجع")
            fails += 1
            continue
        print(f"  ✓ {screen}.png ({w}×{h}) — {title}")

    extra = [p.name for p in sorted(OUT.glob("*.png"))
             if p.stem not in {s for s, _ in SHOTS}]
    if extra:
        print(f"  ✗ لقطاتٌ يتيمة لا تعرفها الأداة: {'، '.join(extra)}")
        fails += len(extra)

    # **والبيانُ يطابق صورَه**: بندٌ لكل لقطة وأبعادُه أبعادُها — فبيانٌ قديمٌ عن
    # صورٍ أُعيد توليدُها لا يمرّ (حارسُ المدى يقرأ نصوصَه فلا يجوز أن تكذب).
    if not MANIFEST.exists():
        print("  ✗ لا بيانَ لقطات (manifest.json) — أعِد التوليد")
        fails += 1
    else:
        shots = json.loads(MANIFEST.read_text(encoding="utf-8"))["shots"]
        for screen, _ in SHOTS:
            entry = shots.get(screen)
            size = png_size(OUT / f"{screen}.png") if (OUT / f"{screen}.png").exists() else None
            if not entry or not size or (entry["w"], entry["h"]) != size:
                print(f"  ✗ بيانُ «{screen}» مفقودٌ أو لا يطابق صورته")
                fails += 1
        stray = [k for k in shots if k not in {s for s, _ in SHOTS}]
        if stray:
            print(f"  ✗ بنودٌ يتيمة في البيان: {'، '.join(stray)}")
            fails += len(stray)
        if not fails:
            print(f"  ✓ بيانُ اللقطات يطابق صورَه ({len(shots)} بنداً)")

    print(f"\n{fails} إخفاق" if fails else f"\nكل لقطات المرجع سليمة ({len(SHOTS)})")
    return 1 if fails else 0


def main():
    ap = argparse.ArgumentParser(description="لقطات المرجع التعريفي من التطبيق نفسِه")
    ap.add_argument("--check", action="store_true", help="تحقّق بلا توليد")
    ap.add_argument("--only", help="لقطة واحدة بمعرّفها")
    ap.add_argument("--port", type=int, default=8796)
    ap.add_argument("--timeout", type=int, default=60)
    args = ap.parse_args()
    return check() if args.check else generate(args)


if __name__ == "__main__":
    sys.exit(main())
