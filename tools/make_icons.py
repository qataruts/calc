#!/usr/bin/env python3
"""توليد أيقونات التطبيق (PWA) بالتقاطها من tools/icon.html في Chrome — بلا أي تبعية.

    python3 tools/make_icons.py            # يولّد app/icons/*.png
    python3 tools/make_icons.py --check    # يتحقّق من وجودها وسلامتها بلا توليد

لماذا Chrome: المشروع بلا npm ولا مكتبات صور، وChrome موجود أصلاً لاختبارات الواجهة
(tools/browser_test.py) ويرسم العربية رسماً صحيحاً بحركاتها. الأيقونة مصدرها
`tools/icon.html` وحدها — فلا يُحرَّر ملف PNG يدوياً ولا يُفقَد أصله.
والخطّ خطُّ العلامة في `app/fonts/` لا خطُّ النظام (جلسة «الاسم والشعار»): أيقونةُ
التطبيق وترويستُه علامةٌ واحدة، فلا يفترق رسمُها بين جهازٍ التُقطت عليه وآخر.

ملاحظة: هذه أصول رسومية لا صوت — قيد «لا تلمس app/audio/» لا يمسّها.
"""

import argparse
import http.server
import json
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
ICONS = ROOT / "app" / "icons"
SOURCE = ROOT / "tools" / "icon.html"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# كل لقطة تُؤخذ بمقاس ٥١٢ (أصغر من ذلك تُهمله نافذة Chrome فتخرج بيضاء)،
# ثم تُصغَّر بـsips المرافق لـmacOS. (اسم الملف، المقاس، الهامش الآمن، حواف مستديرة، خلفية)
MASTER = 512
TARGETS = [
    ("icon-512.png", 512, 0.0, True, None),
    ("icon-192.png", 192, 0.0, True, None),
    ("maskable-512.png", 512, 0.20, False, "#2E8C86"),
    ("apple-touch-icon.png", 180, 0.0, False, "#2E8C86"),
]


def png_size(path: Path):
    """(العرض، الارتفاع) من ترويسة PNG — تحقّق بلا مكتبات."""
    data = path.read_bytes()[:24]
    if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", data[16:24])


def serve(port: int):
    # الجذرُ لا `tools/`: الأيقونةُ تحمّل خطَّ العلامة من `app/fonts/`،
    # وخادمُ بايثون لا يخرج بـ`..` عن مجلده (وهو صوابُه أمنياً).
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(ROOT), **kw)

        def log_message(self, *a):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    return socketserver.TCPServer(("127.0.0.1", port), Handler)


def shoot(url: str, out: Path, size: int, profile: Path, timeout: int) -> bool:
    if out.exists():
        out.unlink()
    cmd = [CHROME, f"--user-data-dir={profile}", "--no-first-run", "--no-default-browser-check",
           "--headless=new", "--disable-gpu", "--hide-scrollbars",
           "--default-background-color=00000000",
           # الوقتُ الافتراضيّ: لا تُلتقط اللقطة حتى يصل خطُّ العلامة ويُعاد قياسُ
           # رفعة حبره — وإلا صُوِّرت الأيقونةُ بمقاييس خطٍّ احتياطيّ ليست مقاييسَه.
           "--virtual-time-budget=4000",
           f"--screenshot={out}", f"--window-size={size},{size}", url]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    deadline = time.time() + timeout
    while time.time() < deadline and not out.exists():
        time.sleep(0.3)
    time.sleep(0.4)          # مهلة كتابة الملف كاملاً
    proc.kill()
    return out.exists()


def check() -> int:
    missing = []
    for name, size, *_ in TARGETS:
        path = ICONS / name
        if not path.exists():
            missing.append(f"{name}: غير موجودة")
            continue
        dims = png_size(path)
        if dims != (size, size):
            missing.append(f"{name}: مقاسها {dims} والمطلوب ({size}, {size})")
    for line in missing:
        print("  ✗ " + line)
    if missing:
        print(f"\n{len(missing)} إخفاق — شغّل python3 tools/make_icons.py")
        return 1
    print(f"✓ أيقونات التطبيق كاملة ({len(TARGETS)} ملفاً بمقاساتها الصحيحة)")
    return 0


def self_test() -> int:
    """بلا Chrome ولا شبكة: **أصلُ الأيقونة ومَن يقرؤه** — لا الأيقوناتُ نفسُها.

    العلّةُ صنفُ عيبٍ لا يُمسكه `--check`: هو يقيس الملفات المولَّدة، وهذه تقيس
    **العدّةَ التي تولّدها** — فأصلٌ فقد خطَّ علامته، أو بيانٌ يَعِد بمقاسٍ لا يولّده
    أحد، يمرّان خضراوين حتى يُعاد التوليد يوماً فيخرج شيءٌ آخر.
    """
    checks = []
    src = SOURCE.read_text(encoding="utf-8") if SOURCE.exists() else ""
    checks.append((SOURCE.exists(), f"أصلُ الأيقونة موجود ({SOURCE.relative_to(ROOT)})"))
    # **العلامةُ في الأصل هي العلامةُ في الشيفرة** — لا نسختان تفترقان يوماً
    ui = (ROOT / "app" / "js" / "ui.js").read_text(encoding="utf-8")
    brand = (ui.split("export const BRAND = '")[1].split("'")[0]
             if "export const BRAND = '" in ui else "")
    checks.append((bool(brand) and f"'{brand}'" in src.replace('"', "'"),
                   f"والكلمةُ فيه هي علامةُ `ui.js` نفسُها («{brand or 'لا شيء'}»)"))
    checks.append(("app/fonts/Marhey" in src and "font-display: block" in src,
                   "وبخطّ العلامة من `app/fonts/` لا خطّ النظام، ولا يُلتقط قبل وصوله"))
    checks.append(("--ink-lift" in src and "fontBoundingBoxAscent" in src,
                   "ورفعةُ الحبر **مقيسةٌ** لا مقدَّرة (توسيطٌ بصريّ لا هندسيّ)"))

    # **البيانُ والمولّدُ يتقابلان**: كلُّ أيقونةٍ يَعِد بها `manifest.webmanifest`
    # يولّدها هذا الملف بمقاسها — وإلا وَعَد التطبيقُ بما لا يُصنَع.
    manifest = json.loads((ROOT / "app" / "manifest.webmanifest").read_text(encoding="utf-8"))
    made = {name: size for name, size, *_ in TARGETS}
    promised = {i["src"].split("/")[-1]: int(i["sizes"].split("x")[0]) for i in manifest["icons"]}
    gap = {k: v for k, v in promised.items() if made.get(k) != v}
    checks.append((not gap, "وكلُّ أيقونةٍ يَعِد بها البيانُ يولّدها هذا الملفُّ بمقاسها"
                   + (f" — تخلّفت: {gap}" if gap else "")))
    checks.append((any(t[2] > 0 for t in TARGETS),
                   "وفيها مقنَّعةٌ بهامشٍ آمن (أيقونةُ أندرويد المستديرة تقصّ الحواف)"))

    bad = [m for good, m in checks if not good]
    for good, m in checks:
        print(("  ✓ " if good else "  ✗ ") + m)
    print("\n" + ("عدّةُ الأيقونات سليمة (بلا Chrome ولا شبكة)." if not bad else f"{len(bad)} فشل"))
    return 1 if bad else 0


def main():
    ap = argparse.ArgumentParser(description="توليد أيقونات «اِحْسِبْ»")
    ap.add_argument("--port", type=int, default=8791)
    ap.add_argument("--timeout", type=int, default=40)
    ap.add_argument("--check", action="store_true", help="تحقّق فقط بلا توليد")
    ap.add_argument("--self-test", action="store_true", help="فحصُ العدّة بلا Chrome")
    args = ap.parse_args()

    if args.self_test:
        return self_test()
    if args.check:
        return check()

    if not Path(CHROME).exists():
        sys.exit(f"لم يُعثر على Chrome في {CHROME}")

    ICONS.mkdir(parents=True, exist_ok=True)
    server = serve(args.port)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    profile = Path(tempfile.mkdtemp(prefix="ihsib-icons-"))
    made = 0
    try:
        for name, size, pad, round_, bg in TARGETS:
            out = ICONS / name
            url = (f"http://127.0.0.1:{args.port}/tools/icon.html"
                   f"?size={MASTER}&pad={pad}&round={'1' if round_ else '0'}"
                   + (f"&bg={bg.replace('#', '%23')}" if bg else ""))
            if not shoot(url, out, MASTER, profile, args.timeout):
                print(f"  ✗ {name} — تعذّرت اللقطة")
                continue
            if size != MASTER:
                subprocess.run(["sips", "-z", str(size), str(size), str(out), "--out", str(out)],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
            if png_size(out) != (size, size):
                print(f"  ✗ {name} — تعذّر التصغير إلى {size} (sips؟)")
                continue
            made += 1
            print(f"  ✓ {name} ({size}×{size})")
    finally:
        server.shutdown()
        shutil.rmtree(profile, ignore_errors=True)

    print(f"\n{made}/{len(TARGETS)} أيقونة في app/icons/")
    return 0 if made == len(TARGETS) else 1


if __name__ == "__main__":
    sys.exit(main())
