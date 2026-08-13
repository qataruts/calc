#!/usr/bin/env python3
"""تشغيل اختبارات الواجهة في متصفّح حقيقي (Chrome بلا واجهة) بلا أي تبعيات.

    python3 tools/browser_test.py             # يسوق التطبيق ويطبع التقرير
    python3 tools/browser_test.py --shots out.png   # لقطة للمراجعة البصرية
    python3 tools/browser_test.py --shots shots/render --render-shots
                                              # لقطةٌ مرجعية لكل نمطٍ من أنماط المصيِّر
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
import os
import re
import shutil
import signal
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
# بصمةُ صفحاتنا في تقرير النتيجة — تُقرأ في `do_POST` وتُفحَص في `--self-test`
REPORT_FROM = "ihsib"

PAGES = {
    "/__test.html": TOOLS / "browser_test.html",
    "/__device.html": TOOLS / "browser_device.html",
    # المرجعُ التعريفيّ (الجلسة ٩) — يُقاس في متصفّحٍ حقيقيّ لأنّ ثلاثةً من شروطه
    # لا يراها فحصُ نصّ: الطلبُ الشبكيّ الخارجيّ، والتمريرُ الأفقيّ، وابتلاعُ عامل
    # الخدمة للصفحة بعد تفعيله.
    "/__welcome.html": TOOLS / "browser_welcome.html",
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
            # **ولا تُقرَأ نتيجةٌ إلا من صفحتنا** (`REPORT_FROM`): «اِحْسِبْ» و«اِقْرَأْ»
            # في مساحة عملٍ واحدة وعدّتُهما من بذرةٍ واحدة، فإن سبق أحدُهما إلى المنفذ
            # أرسل متصفّحُ الآخر تقريرَه **إلى خادمنا** فقرأناه تقريرَنا — أخضرَ كاذباً
            # أو أحمرَ بلا سبب. فالبصمةُ تُغلق البابَ بنيوياً: غريبٌ يُهمَل، وتنتهي
            # المهلةُ بجملة «لم تصل نتيجة» الصادقة بدل تقريرِ جارٍ يُقرأ تقريرَنا.
            try:
                body = json.loads(raw.decode("utf-8"))
                if isinstance(body, dict) and body.get("from") == REPORT_FROM:
                    results[:] = body.get("rows") or []
            except json.JSONDecodeError:
                pass
            self.send_response(204)
            self.end_headers()

        def log_message(self, *a):
            pass

    class Quiet(socketserver.TCPServer):
        allow_reuse_address = True

        def handle_error(self, request, client_address):
            """المتصفّحُ يُقتل وسط نقلِ ملفّ فينكسر الأنبوب — **ضجيجٌ لا عطب**.

            وأثرُه ليس جمالياً: أثرُ مكدَّسٍ من عشرين سطراً يطبعه الخادمُ فوق تقرير
            الفحص يدفع القارئَ إلى تخطّي المخرَج، فيمرّ فشلٌ حقيقيّ تحت الضجيج.
            وما سوى انكسارِ الأنبوب يبقى معروضاً كما كان.
            """
            kind = sys.exc_info()[0]
            if kind and issubclass(kind, (BrokenPipeError, ConnectionResetError)):
                return
            super().handle_error(request, client_address)

    try:
        return Quiet(("127.0.0.1", port), Handler)
    except OSError as e:
        # **والمنفذُ المشغول يُقال ولا يُصمَت عنه**: كان الخادمُ يرتمي أثرَ مكدَّسٍ في
        # `stderr`، والسائقُ (`guards.mjs`) يقرأ حصيلتَه من `stdout` — فيظهر الحارسُ
        # **أحمرَ بلا سببٍ مقروء** ويُظنّ عطباً في الشيفرة وهو منفذٌ يشغله جارٌ لحظةً.
        sys.exit(f"تعذّر فتحُ خادم الفحص على المنفذ {port}: {e}\n"
                 f"  — منفذٌ مشغولٌ الآن (فحصٌ آخر يعمل؟). جرّب: --port {port + 1}")


# سوابقُ حظائرنا — كلُّ `user-data-dir` تصنعه هذه الأداة يبدأ بواحدةٍ منها،
# **وبها يصير التنظيفُ الذاتيّ آمناً بالبناء** (بلاغ العائلة: نسخةٌ باسم صاحبها).
OUR_PROFILES = ("ihsib-browser-", "ihsib-shot-", "ihsib-device-")


def sweep_stale(prefixes=OUR_PROFILES) -> list:
    """نظافةُ الحظيرة عند الإقلاع — بلاغُ العائلة `2026-08-12-stale-headless-chrome.md`.

    نسخُ كروم الخفية التي خلّفتها جولاتٌ ماتت (جلسةٌ قُتلت، فحصٌ قوطع) تبقى قائمةً
    بلا نوافذ، **وماك يوجّه نقرةَ أيقونة كروم إليها فيبدو كروم المالك معطّلاً وهو
    مخطوف**. والخروجُ النظيف وحده لا يكفي — فيُكنَس الأثرُ عند الإقلاع لا عند الخروج.

    **ولا يُقتل إلا يتيمُنا نحن**: شرطان معاً — `user-data-dir` بسابقةٍ من سوابقنا
    (فلا تُقرَب نسخُ الجيران كـ`write-browser-*` ولا متصفّحُ المالك الحيّ الذي لا
    سابقةَ له أصلاً)، **ووالدُه ماتَ** (`ppid == 1`) — فنسخةُ جولةٍ حيّةٍ تعمل الآن
    والدُها بايثونُها القائم، ولا تُمَسّ.
    """
    try:
        rows = subprocess.run(["ps", "-axo", "pid=,ppid=,command="],
                              capture_output=True, text=True).stdout
    except OSError:
        return []
    swept = []
    for row in rows.splitlines():
        parts = row.strip().split(None, 2)
        if len(parts) < 3:
            continue
        pid, ppid, cmd = parts
        hit = re.search(r"--user-data-dir=(\S+)", cmd)
        if not hit or not Path(hit.group(1)).name.startswith(prefixes):
            continue
        if ppid != "1":
            continue          # والدُه حيّ: جولةٌ قائمةٌ الآن — جارُنا في الزمن لا يُمَسّ
        try:
            os.kill(int(pid), signal.SIGKILL)
            swept.append(f"{pid} ({Path(hit.group(1)).name})")
        except (OSError, ValueError):
            pass
    if swept:
        print(f"  🧹 كُنست {len(swept)} نسخة كروم يتيمة من جولات سابقة: {'، '.join(swept)}")
    return swept


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


def render_displays(strict: bool = True) -> list:
    """أنماطُ المصيِّر **من الوحدة نفسِها** — لا قائمةٌ تُكتب هنا فتتخلّف عنها.

    (نظيرُ `load_curriculum` في `check_range.py`: تُشغَّل الوحدةُ ولا يُخمَّن نصُّها،
    فنمطٌ جديد يدخل اللقطاتِ يومَ يُكتب رسّامُه بلا سطرٍ يُضاف هنا.)
    """
    module = (APP / "js" / "render.js").as_uri()
    js = (f'const m = await import("{module}");'
          ' console.log(JSON.stringify(m.displays()));')
    run = subprocess.run(["node", "--input-type=module", "-e", js],
                         capture_output=True, text=True)
    if run.returncode != 0:
        if strict:
            sys.exit(f"تعذّرت قراءة أنماط المصيِّر:\n{run.stderr.strip()}")
        return []
    return json.loads(run.stdout)


def render_shots(args) -> int:
    """**لقطةٌ مرجعية لكل نمط** من لوح المصيِّر — للمراجعة البصرية (بندُ الجلسة ٢).

    تُلتقط من التطبيق نفسِه (`?dev=1#/render/<النمط>`) لا من صفحةِ عرضٍ مصنوعة:
    فما يراه المراجعُ هو اللوحُ واللونُ والخطُّ والاتجاهُ التي يراها الطفل.
    """
    names = render_displays()
    out_dir = Path(args.shots).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    results: list = []
    server = make_server(args.port, results)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    profiles, missing = [], []
    try:
        for name in names:
            png = out_dir / f"{name}.png"
            if png.exists():
                png.unlink()
            profile = Path(tempfile.mkdtemp(prefix="ihsib-shot-"))
            profiles.append(profile)
            proc = run_chrome(
                f"http://127.0.0.1:{args.port}/?dev=1#/render/{name}", profile,
                ["--headless=new", "--disable-gpu", "--hide-scrollbars",
                 "--virtual-time-budget=5000", f"--screenshot={png}",
                 f"--window-size={args.size or '1000,2400'}"], False)
            deadline = time.time() + args.timeout
            while time.time() < deadline and not png.exists():
                time.sleep(0.3)
            time.sleep(0.5)
            proc.kill()
            if png.exists():
                print(f"  ✓ {name}: {png.relative_to(ROOT)} ({png.stat().st_size // 1024}كب)")
            else:
                missing.append(name)
                print(f"  ✗ {name}: تعذّرت اللقطة")
    finally:
        server.shutdown()
        for p in profiles:
            shutil.rmtree(p, ignore_errors=True)

    print(f"\n{len(missing)} لقطةً متعذّرة" if missing
          else f"\n{len(names)} لقطةً مرجعيةً في {out_dir.relative_to(ROOT)} — "
               "نمطٌ لكل ملفّ، للمراجعة البصرية.")
    return 1 if missing else 0


def orientations(size: str) -> list:
    """المقاسُ **طولاً وعرضاً** (الجلسة ١٠): شاشةٌ سليمةٌ قائمةً قد تضيق مضطجعة —
    والطفلُ يمسك اللوحَ كيف شاء، فلا يُقاس أحدُ وضعيه ويُترك الآخر."""
    wide, tall = size.split(",")
    return [("طولاً", f"{wide},{tall}"), ("عرضاً", f"{tall},{wide}")]


def device_main(args) -> int:
    """مقاسات الآيباد **طولاً وعرضاً**: لا فائض أفقيّ، وأهدافُ اللمس على عتبتها.

    والعتبةُ `METHOD.md §١١` (٦٤ بكسلاً) **باستثنائها المعتمد** (٤٤ لأزرار عناصر
    لوح «اجعلهما سواء» — م٦)، والحكمُ يقع في الصفحة حيث تُقاس الصناديق، وهنا يُقرأ.
    """
    results: list = []
    server = make_server(args.port, results)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    fails = 0
    profiles = []
    runs = [(f"{name} {way}", dims) for name, size in IPADS for way, dims in orientations(size)]
    try:
        for name, size in runs:
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
            small = row.get("small") or []
            missed = row.get("missed") or []
            tight = row.get("tight") or {}
            good = over <= 0 and row.get("width") == vw and not small and not missed
            fails += not good
            # أضيقُ ما قِيس في كلِّ صنفٍ يُطبَع **وإن كان أخضر**: رقمٌ يُرى يقول كم
            # بقي من الهامش قبل العتبة، فلا يُفاجئ يومَ ينزل عنها.
            def tightest(slot, label):
                got = tight.get(slot)
                return (f" · أضيقُ {label} {got['side']}بك ({got['cls']}، عتبتُه {got['need']})"
                        if got else f" · لا {label}")
            print(("  ✓ " if good else "  ✗ ")
                  + f"{name} ({size}): منظورٌ {row.get('width')}×{row.get('height')}"
                  + f" · {row.get('screens', 0)} شاشةً · فائضٌ أفقيّ {over}px"
                  + tightest("deciding", "زرّ")
                  + tightest("board", "لمسةِ لوح")
                  + ("" if row.get("width") == vw else " — عايِر VIEWPORT_PAD"))
            if small:
                shown = len(small)
                print(f"      — دون العتبة: {row.get('smallKinds', shown)} صنفاً"
                      f" ({row.get('smallTotal', shown)} زرّاً مقيساً)"
                      + (f"، يُطبَع منها {shown}" if row.get("smallKinds", shown) > shown else ""))
            for bad in small:
                print(f"      ✗ دون عتبته: {bad['cls']} {bad['side']}بك < {bad['need']}"
                      f" — أوّلُ موضعٍ {bad['at']} (×{bad.get('times', 1)})")
            for gone in missed:
                print(f"      ✗ لم تُرسَم شاشةٌ في مهلتها: {gone}")
    finally:
        server.shutdown()
        for p in profiles:
            shutil.rmtree(p, ignore_errors=True)
    print(f"\n{fails} إخفاق" if fails
          else f"\nلا فائضَ أفقيّ ولا هدفَ لمسٍ دون عتبته — {len(runs)} جولةً"
               f" ({len(IPADS)} مقاساتٍ طولاً وعرضاً).")
    return 1 if fails else 0


SCRIPT_RE = re.compile(r'<script type="module">(.*?)</script>', re.S)


def script_parses(html: str) -> tuple:
    """أيُحلَّل نصُّ الوحدة في صفحة الفحص؟ — بـ`node --check` بلا متصفّحٍ ولا شبكة."""
    scripts = SCRIPT_RE.findall(html)
    if not scripts:
        return True, ""            # صفحةٌ بلا وحدة: لا شيء يُحلَّل
    for body in scripts:
        run = subprocess.run(["node", "--input-type=module", "--check"],
                             input=body, capture_output=True, text=True)
        if run.returncode != 0:
            first = next((ln.strip() for ln in run.stderr.splitlines()
                          if "Error" in ln), run.stderr.strip()[:120])
            return False, first
    return True, ""


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
        # **وتبصمها باسمنا**: بلا البصمة يُهمِلها خادمُنا فتنتهي المهلةُ بلا نتيجة —
        # وهو أهونُ من قراءة تقرير جارٍ، لكنّه يُكشَف هنا قبل أن يُشغَّل متصفّح.
        checks.append((f"from: '{REPORT_FROM}'" in text,
                       f"  وتبصم تقريرَها باسمنا (`from: '{REPORT_FROM}'`) "
                       "— فلا يُقرأ تقريرُ جارٍ على المنفذ نفسِه"))
        checks.append(('src="/"' in text,
                       f"  و`{route}` تسوق التطبيقَ نفسَه من الخادم لا نسخةً منه"))
        # **وتُحلَّل**: خطأُ صياغةٍ واحد في نصّ الصفحة يمنع تشغيلَ **كل** فحوصها بلا
        # أثر — لا خطأ في الطرفية ولا نتيجةٌ في الخادم، فيُقرأ ذلك بطءَ جهازٍ أو قِصَرَ
        # مهلة. وثمنُ كشفِه هنا نداءُ `node --check` قبل أن يُشغَّل المتصفّح أصلاً.
        ok_parse, why = script_parses(text)
        checks.append((ok_parse, f"  و`{route}` نصُّها يُحلَّل بلا خطأ صياغة"
                                 + ("" if ok_parse else f" — {why}")))

    # **الاستثناءُ الصوتيّ موصولٌ**: صفحاتُ الاختبار تستثني نصوصَ قائمة الانتظار من
    # فحص «لا لجوء للنطق الآلي» — والقائمةُ تُخدَم من هنا، فإن سقط المسارُ صار الفحصُ
    # صارماً على نصٍّ لم يُولَّد بعدُ فيُفشِل جلسةَ تطويرٍ لا ذنبَ لها.
    checks.append((QUEUE_FILE.exists(), f"وقائمةُ الانتظار الصوتية موجودة ({QUEUE_FILE.name})"))
    checks.append(("/__queue.json" in Path(__file__).read_text(encoding="utf-8"),
                   "ويخدمها الخادمُ على `/__queue.json` (استثناءُ «لا نطق آليّ» موصول)"))

    # **وصلةُ اللقطات المرجعية موصولة** (الجلسة ٢): `--render-shots` يسوق المسار
    # `?dev=1#/render/<النمط>`. ولو تبدّل اسمُ المسار في الموجِّه لَعادت اللقطاتُ
    # صورَ **خريطةٍ** صامتة — ملفاتٌ تُكتب ويُظنّ أنها مراجعةٌ بصرية وليست منها.
    render_js = APP / "js" / "render.js"
    checks.append((render_js.exists(), f"ووحدةُ المصيِّر موجودة ({render_js.name})"))
    main_js = (APP / "js" / "main.js")
    checks.append((main_js.exists() and "registerScreen('render'" in main_js.read_text(encoding="utf-8"),
                   "ولوحُ المصيِّر مسجَّلٌ في الموجِّه بالمسار الذي تسوقه اللقطات (`render`)"))
    if render_js.exists():
        names = render_displays(strict=False)
        checks.append((len(names) > 0, f"ويُعلن أنماطَه فتُلتقط لها لقطاتُها ({len(names)} نمطاً)"))

    # **مقاسات الآيباد الخمسة** (`METHOD.md §١٠.٧`) — لا أربعة ولا واحد
    checks.append((len(IPADS) == 5, f"ومقاساتُ الآيباد خمسةٌ ({len(IPADS)})"))
    checks.append((all("," in size for _n, size in IPADS), "ولكلٍّ عرضُه وارتفاعُه"))
    # **وكلٌّ يُمشى طولاً وعرضاً** (الجلسة ١٠): عشرُ جولاتٍ لا خمس — والانقلابُ محسوبٌ
    # لا مكتوب، فلا مقاسَ يُنسى وجهُه الثاني.
    flipped = orientations(IPADS[0][1])
    checks.append((len(flipped) == 2 and flipped[0][1].split(",")[::-1] == flipped[1][1].split(","),
                   f"وكلُّ مقاسٍ يُمشى طولاً وعرضاً ({len(IPADS) * 2} جولةً)"))
    # **وشاشاتُ المسح تُحسب من المنهج**: لو كُتبت قائمةً هنا لَبقي نوعٌ جديد خارجَها
    # صامتاً — وهو عينُ ما تحرسه أنماطُ `guards.mjs`.
    device_page = (TOOLS / "browser_device.html").read_text(encoding="utf-8")
    checks.append(("import { sections } from '/js/curriculum.js'" in device_page
                   and "firstOfEachType" in device_page,
                   "وشاشاتُ المسح محسوبةٌ من المنهج (نوعٌ جديد يدخلها يومَ يُكتب)"))
    # **وعتبةُ اللمس هي المعلَنة في `METHOD.md §١١` باستثنائها المعتمد** — لا رقمٌ
    # يُخفَّض في الحارس ليمرّ ما لا يمرّ.
    checks.append(("const TOUCH_MIN = 64" in device_page and "const BOARD_MIN = 44" in device_page,
                   "وعتبةُ اللمس ٦٤ (وأزرارُ عناصر اللوح ٤٤ — استثناءُ `METHOD.md §١١`)"))
    checks.append((APP.exists() and (APP / "index.html").exists(),
                   "وجذرُ التطبيق الذي يُخدَم موجود (`app/index.html`)"))

    bad = [m for good, m in checks if not good]
    for good, m in checks:
        print(("  ✓ " if good else "  ✗ ") + m)
    print("\n" + ("عدّةُ المتصفّح سليمة (بلا Chrome ولا شبكة)." if not bad else f"{len(bad)} فشل"))
    return 1 if bad else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="اختبارات الواجهة في متصفّح حقيقي")
    # **ومنفذُنا غيرُ منفذ اقرأ**: العدّتان من بذرةٍ واحدة والتطبيقان في مساحة عملٍ
    # واحدة، فمنفذٌ مشترك يجعل تشغيلَ أحدهما يُفشِل الآخر بلا ذنب.
    ap.add_argument("--port", type=int, default=8791)
    # **والمهلةُ تتبع ما يُساق**: صفحةُ الفحص تسوق المحطاتِ والبوابتين لمساً بأصواتها،
    # فكلُّ جلسةٍ تزيد شاشاتٍ تزيدها ثوانيَ. وتبقى فوق مهلة الصفحة الحارسة كي يصل
    # التقريرُ الناقص بدل أن يُقتَل المتصفّح صامتاً (٣٨٠ث في `browser_test.html`).
    ap.add_argument("--timeout", type=int, default=1080, help="ثوانٍ قبل الاستسلام — وُسّعت ٦٢٠←٧٨٠←١٠٨٠ بقرارٍ معلن (مراجعة م٦ + بلاغ العائلة busy-machine-false-reds؛ والجلسة ش زادت خمسَ فتحاتِ شاشة ومشيَ جرد صنفٍ من ١٠ إلى ١٦ شاشة). وتبقى فوق مهلة الصفحة الحارسة (٩٠٠ث) فيصل بلاغُ التعلّق قبل اليأس")
    ap.add_argument("--shots", metavar="PNG", help="لقطة للمراجعة البصرية بدل الاختبارات")
    # **المراجعةُ البصرية تحتاج الشاشةَ بعينها**: لقطةُ الجذر تُري الخريطةَ وحدَها،
    # وشاشاتُ المحطات خلف مسارها — فتُساق بمسارها كما يسوقها الطفل (`?preview=1`
    # يفتح القفلَ ولا يكتب تقدّماً).
    ap.add_argument("--at", default="", metavar="PATH",
                    help="مسارُ اللقطة داخل التطبيق، مثل '?preview=1#/count/ten'")
    ap.add_argument("--render-shots", action="store_true",
                    help="مع --shots DIR: لقطةٌ مرجعية لكل نمطٍ من أنماط المصيِّر")
    ap.add_argument("--device", action="store_true", help="مقاسات الآيباد الخمسة")
    ap.add_argument("--welcome", action="store_true",
                    help="المرجعُ التعريفيّ: لا طلبَ خارجيّ، ولا يبتلعه عاملُ الخدمة")
    ap.add_argument("--size", help="مقاس النافذة W,H")
    ap.add_argument("--show", action="store_true", help="متصفّح مرئي")
    ap.add_argument("--self-test", action="store_true", help="فحصُ العدّة بلا Chrome")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    # **التنظيفُ عند الإقلاع لا عند الخروج وحده** (بلاغ العائلة): كلُّ مسارٍ يُطلق
    # كروم يكنس أولاً يتائمَنا من جولاتٍ ماتت — و`--self-test` فوقه بلا كروم أصلاً.
    sweep_stale()

    if args.render_shots:
        if not args.shots:
            sys.exit("--render-shots يحتاج --shots DIR (مجلَّدُ اللقطات)")
        return render_shots(args)
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
            proc = run_chrome(f"http://127.0.0.1:{args.port}/{args.at}", profile,
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

        page = "__welcome.html" if args.welcome else "__test.html"
        proc = run_chrome(f"http://127.0.0.1:{args.port}/{page}", profile,
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
