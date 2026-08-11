#!/usr/bin/env python3
"""تشغيل اختبارات الواجهة في متصفّح حقيقي (Chrome بلا واجهة) بلا أي تبعيات.

    python3 tools/browser_test.py             # يسوق التطبيق ويطبع التقرير
    python3 tools/browser_test.py --shots out.png   # لقطة للمراجعة البصرية
    python3 tools/browser_test.py --device    # مقاسات الآيباد الخمسة: فائضٌ أفقيّ؟
    python3 tools/browser_test.py --show      # بمتصفّح مرئي لتتبّع ما يجري

————— بذرةُ المنصة (منسوخٌ من «اِقْرَأْ» ومكيَّف) —————
البنيةُ منه: خادمٌ صغير يخدم مجلد `app/` ويضيف صفحاتِ الاختبار وحدها من هذا المجلد،
وتُرسَل النتائجُ من الصفحة نفسها بـ`POST /result` ثم يُقتل المتصفّح. فلا تبقى في
`app/` صفحةُ اختبارٍ تُخدَم للطفل. ويخدم `/__queue.json` (نصوص قائمة الانتظار
الصوتية) كي تستثنيها الصفحاتُ من فحص «لا لجوء للنطق الآلي».

ملاحظة: `--dump-dom` و`--virtual-time-budget` غير موثوقين مع fetch والصوت، لذلك
تُرسَل النتائج من الصفحة نفسها.
"""

import argparse
import http.server
import json
import shutil
import socketserver
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
TOOLS = Path(__file__).resolve().parent
QUEUE_FILE = TOOLS / "audio_queue.json"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

PAGES = {
    "/__test.html": TOOLS / "browser_test.html",
    "/__device.html": TOOLS / "browser_device.html",
}

# مقاسات الآيباد الخمسة (نقاط CSS، طولاً) — عليها تُقاس الشاشات في `--device`.
# **بلا فائض أفقي** عهدٌ مطلق (`METHOD.md §١٠.٧`): طفلُ الرابعة لا يسحب ليجد زرّاً.
IPADS = [
    ("iPad mini", "744,1133"),
    ("iPad 10.2", "810,1080"),
    ("iPad Air 10.9", "820,1180"),
    ("iPad Pro 11", "834,1194"),
    ("iPad Pro 12.9", "1024,1366"),
]
VIEWPORT_PAD = 87   # فرقُ نافذة Chrome عن منظورها (شريطُ العنوان في الوضع المرئي)


def pending_texts() -> list:
    """النصوص المنتظِرة في قائمة الانتظار الصوتية (`docs/AUDIO_QUEUE.md`).

    صفحاتُ الاختبار تستثنيها من فحص «لا لجوء للنطق الآلي»: لا ملف لها بعدُ لأن جلسة
    الصوتيات لم تصرّفها، فاحتياطُ النطق هو السلوك الصحيح مؤقتاً — وبعد التصريف تفرغ
    القائمة فيعود الفحص صارماً على كل نصّ بلا تعديل في الصفحات.
    """
    if not QUEUE_FILE.exists():
        return []
    try:
        data = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    return [e["text"] for e in data
            if isinstance(e, dict) and e.get("text") and e.get("status", "pending") != "done"]


def make_server(port: int, results: list):
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(APP), **kw)

        def do_GET(self):
            path, _, _query = self.path.partition("?")
            if path == "/__queue.json":
                body = json.dumps(pending_texts(), ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            page = PAGES.get(path)
            if page and page.exists():
                body = page.read_bytes()
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
                results[:] = json.loads(raw.decode("utf-8"))
            except json.JSONDecodeError:
                pass
            self.send_response(204)
            self.end_headers()

        def log_message(self, *a):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    return socketserver.TCPServer(("127.0.0.1", port), Handler)


def run_chrome(url: str, profile: Path, extra: list, show: bool):
    if not Path(CHROME).exists():
        sys.exit(f"لم يُعثر على Chrome في {CHROME}")
    cmd = [CHROME, f"--user-data-dir={profile}", "--no-first-run", "--no-default-browser-check"]
    if not show:
        cmd += ["--headless=new", "--disable-gpu"]
    cmd += extra + [url]
    return subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def window_of(size: str) -> str:
    """مقاس نافذةٍ يعطي منظوراً بمقاس الجهاز المطلوب تماماً."""
    w, h = (int(x) for x in size.split(","))
    return f"{w},{h + VIEWPORT_PAD}"


def device_main(args) -> int:
    """مقاسات الآيباد: **لا فائض أفقيّ** على أيٍّ منها."""
    results: list = []
    server = make_server(args.port, results)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    fails = 0
    profiles = []
    try:
        for name, size in IPADS:
            results.clear()
            # **مِلفٌّ جديد لكل مقاس**: المقتولُ يترك قفلَ ملفّه خلفه لحظاتٍ، فتنضمّ
            # اللقطةُ التالية إلى نسخةٍ ميتة بمقاسٍ ليس مقاسَها فلا تصل نتيجةٌ أبداً
            # (وتُقرأ «لم تصل نتيجة» عطبَ جهازٍ أو قِصَرَ مهلة، وليست كذلك).
            profile = Path(tempfile.mkdtemp(prefix="ihsib-device-"))
            profiles.append(profile)
            proc = run_chrome(f"http://127.0.0.1:{args.port}/__device.html", profile,
                              [f"--window-size={window_of(size)}", "--hide-scrollbars"], args.show)
            deadline = time.time() + args.timeout
            while time.time() < deadline and not results:
                time.sleep(0.25)
            proc.kill()
            if not results:
                print(f"  ✗ {name}: لم تصل نتيجة")
                fails += 1
                continue
            row = results[0]
            over = row.get("overflow", -1)
            vw, _vh = (int(x) for x in size.split(","))
            good = over <= 0 and row.get("width") == vw
            fails += not good
            print(("  ✓ " if good else "  ✗ ")
                  + f"{name} ({size}): منظورٌ {row.get('width')}×{row.get('height')}"
                  + f" · فائضٌ أفقيّ {over}px"
                  + ("" if row.get("width") == vw else " — عايِر VIEWPORT_PAD"))
    finally:
        server.shutdown()
        for p in profiles:
            shutil.rmtree(p, ignore_errors=True)
    print(f"\n{fails} إخفاق" if fails else "\nلا فائضَ أفقيّ على أيّ مقاس آيباد.")
    return 1 if fails else 0


def self_test() -> int:
    """بلا Chrome ولا شبكة: **العدّةُ نفسُها** — أصفحاتُها موجودةٌ وموصولةٌ وتردّ؟

    العلّةُ صنفُ عيبٍ خاصّ بهذه الأداة: صفحةُ اختبارٍ لا تُرسِل نتيجتها **لا تُفشِل
    شيئاً** — تنتهي المهلةُ فيُقال «لم تصل نتيجة»، وقد يُقرأ ذلك عطبَ متصفّحٍ أو
    بطءَ جهاز فيُعاد التشغيل بمهلةٍ أطول. فتُفحَص الوصلةُ هنا صراحةً.
    """
    checks = []
    for route, page in PAGES.items():
        checks.append((page.exists(), f"صفحةُ `{route}` موجودة ({page.name})"))
        if not page.exists():
            continue
        text = page.read_text(encoding="utf-8")
        checks.append(("fetch('/result'" in text,
                       f"  و`{route}` تُرسِل نتيجتَها إلى `/result` (وإلا انتهت المهلةُ صامتة)"))
        checks.append(('src="/"' in text,
                       f"  و`{route}` تسوق التطبيقَ نفسَه من الخادم لا نسخةً منه"))

    # **الاستثناءُ الصوتيّ موصولٌ**: صفحاتُ الاختبار تستثني نصوصَ قائمة الانتظار من
    # فحص «لا لجوء للنطق الآلي» — والقائمةُ تُخدَم من هنا، فإن سقط المسارُ صار الفحصُ
    # صارماً على نصٍّ لم يُولَّد بعدُ فيُفشِل جلسةَ تطويرٍ لا ذنبَ لها.
    checks.append((QUEUE_FILE.exists(), f"وقائمةُ الانتظار الصوتية موجودة ({QUEUE_FILE.name})"))
    checks.append(("/__queue.json" in Path(__file__).read_text(encoding="utf-8"),
                   "ويخدمها الخادمُ على `/__queue.json` (استثناءُ «لا نطق آليّ» موصول)"))

    # **مقاسات الآيباد الخمسة** (`METHOD.md §١٠.٧`) — لا أربعة ولا واحد
    checks.append((len(IPADS) == 5, f"ومقاساتُ الآيباد خمسةٌ ({len(IPADS)})"))
    checks.append((all("," in size for _n, size in IPADS), "ولكلٍّ عرضُه وارتفاعُه"))
    checks.append((APP.exists() and (APP / "index.html").exists(),
                   "وجذرُ التطبيق الذي يُخدَم موجود (`app/index.html`)"))

    bad = [m for good, m in checks if not good]
    for good, m in checks:
        print(("  ✓ " if good else "  ✗ ") + m)
    print("\n" + ("عدّةُ المتصفّح سليمة (بلا Chrome ولا شبكة)." if not bad else f"{len(bad)} فشل"))
    return 1 if bad else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="اختبارات الواجهة في متصفّح حقيقي")
    ap.add_argument("--port", type=int, default=8790)
    ap.add_argument("--timeout", type=int, default=60, help="ثوانٍ قبل الاستسلام")
    ap.add_argument("--shots", metavar="PNG", help="لقطة للمراجعة البصرية بدل الاختبارات")
    ap.add_argument("--device", action="store_true", help="مقاسات الآيباد الخمسة")
    ap.add_argument("--size", help="مقاس النافذة W,H")
    ap.add_argument("--show", action="store_true", help="متصفّح مرئي")
    ap.add_argument("--self-test", action="store_true", help="فحصُ العدّة بلا Chrome")
    args = ap.parse_args()

    if args.self_test:
        return self_test()
    if args.device:
        return device_main(args)

    results: list = []
    server = make_server(args.port, results)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    profile = Path(tempfile.mkdtemp(prefix="ihsib-browser-"))

    try:
        if args.shots:
            out = Path(args.shots).resolve()
            if out.exists():
                out.unlink()
            size = args.size or "834,1194"
            proc = run_chrome(f"http://127.0.0.1:{args.port}/", profile,
                              ["--headless=new", "--disable-gpu", "--hide-scrollbars",
                               "--virtual-time-budget=4000",
                               f"--screenshot={out}", f"--window-size={size}"], False)
            deadline = time.time() + args.timeout
            while time.time() < deadline and not out.exists():
                time.sleep(0.3)
            time.sleep(0.4)
            proc.kill()
            print(("✓ اللقطة في " if out.exists() else "✗ تعذّرت اللقطة: ") + str(out))
            return 0 if out.exists() else 1

        proc = run_chrome(f"http://127.0.0.1:{args.port}/__test.html", profile,
                          [f"--window-size={args.size or '834,1194'}"], args.show)
        deadline = time.time() + args.timeout
        while time.time() < deadline and not results:
            time.sleep(0.25)
        proc.kill()
    finally:
        server.shutdown()
        shutil.rmtree(profile, ignore_errors=True)

    if not results:
        print(f"لم تصل نتيجة من المتصفّح خلال {args.timeout} ثانية.")
        return 1

    fails = 0
    for row in results:
        good = bool(row.get("ok"))
        fails += not good
        print(("  ✓ " if good else "  ✗ ") + row.get("msg", ""))
    print(f"\n{fails} إخفاق" if fails else f"\nكل فحوص المتصفّح ناجحة ({len(results)} فحصاً).")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
