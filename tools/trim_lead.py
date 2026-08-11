#!/usr/bin/env python3
"""مِقصُّ الصمت الأول — يحذف التأخّرَ الصامت في رأس ملفات mp3 **بلا إعادة ترميز**.

    python3 tools/trim_lead.py --self-test                    # بلا شبكةٍ ولا ملفات
    python3 tools/trim_lead.py --list                         # رؤوسُ البنك ومدده
    python3 tools/trim_lead.py --try "كَمْ تَرَى؟" --drop 0.25   # «قبل/بعد» في scratch/trim
    python3 tools/trim_lead.py --apply "كَمْ تَرَى؟" --drop 0.25 # القصُّ في app/audio
    python3 tools/trim_lead.py --measure                      # مسحُ البنك كلِّه (نائم — §٥)

منسوخٌ ومجرَّدٌ من `read@42b1a50` (`docs/SEED.md §٣`).

**العلّة** (أذنُ المالك في اقرأ، ٥ أغسطس ٢٠٢٦): «بعضُ الأصوات أطولُ من المعدّل لكن
فيها تأخّرٌ بدون صوتٍ في بداية الملف» — والطفلُ ينقر فينتظر.

**والقصُّ بالإطارات لا بفكّ الترميز**: لا مُفكِّك mp3 في بيئتنا (لا ffmpeg)، وإعادةُ
الترميز تُفقِد جودةً بلا داعٍ. فإطارُ mp3 وحدةٌ مستقلّة بترويسةٍ تُقرأ — يُحذف من
البداية عددُ إطاراتٍ يغطّي الصمت، **ويبقى بايتُ الصوت الباقي كما وُلِّد حرفاً بحرف**.

——————————— وثلاثةُ مفارقٍ عن اقرأ ———————————

١) **أنبوبُنا يقصّ في PCM قبل الترميز** (`generate_audio.trim_pcm`): كلُّ ملفٍ في
   بنكنا وُلِّد مقصوصَ الطرفين بهامشٍ ثابت (٦٠ملّي). فهذا المقصُّ عندنا **علاجُ ما لم
   يُقَصّ في الأنبوب** لا أداةَ الدفعة الأولى — وبنكُ اقرأ سبق أن وُلِّد قبل ذلك الدرس.

٢) **الأذنُ هي المقياس** (قرارُ المالك: «لا حارسَ رجعٍ صوتيّ — الفحصُ بأذنه»): فبدل
   أن يقيس التأخّرَ متصفّحٌ ثم يقصّ آلياً، يُسمع الملفُّ في `audio_panel` ويُطلَب القصُّ
   بمقدارٍ معلوم — و«قبل/بعد» تُبنيان في `scratch` ليقابلهما السمعُ قبل أن يُمَسّ البنك.

٣) **والمسحُ الآليّ للبنك كلِّه نائمٌ بجردٍ** (`docs/SEED.md §٥`): يحتاج مقياسَ صمتٍ
   يقرأ الموجةَ (نظيرُ `audio_audit.py` في اقرأ) ولا وجودَ له في عدّتنا؛ فيُعلَن نائماً
   بصوتٍ عالٍ ويستيقظ من تلقائه يومَ يُكتب المقياس — ولا رايةَ تُضبط بيد.
"""

import argparse
import json
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import generate_audio as gen  # noqa: E402

KEEP = 0.125          # صمتٌ يُترك عمداً في البداية (بدءٌ مبتورٌ أسوأ من تأخّرٍ يسير)
WORK = gen.ROOT / "scratch" / "trim"
MEASURER = gen.ROOT / "tools" / "audio_audit.py"   # شرطُ النوم — يُجرَد ولا يُضبَط

_RATES = {  # (نسخةُ MPEG، رمزُ المعدّل) ← المعدّل
    (3, 0): 44100, (3, 1): 48000, (3, 2): 32000,
    (2, 0): 22050, (2, 1): 24000, (2, 2): 16000,
    (0, 0): 11025, (0, 1): 12000, (0, 2): 8000,
}
_BITRATES_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
_BITRATES_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]


def frames(data: bytes) -> list:
    """مواضعُ إطارات mp3 وأطوالُها ومدّةُ الإطار — قراءةُ تروايسَ لا فكَّ ترميز."""
    out, i, n = [], 0, len(data)
    if data[:3] == b"ID3":                       # وسمٌ في الرأس: يُتخطّى بطوله المعلَن
        size = 0
        for b in data[6:10]:
            size = (size << 7) | (b & 0x7F)
        i = 10 + size
    while i + 4 <= n:
        if data[i] != 0xFF or (data[i + 1] & 0xE0) != 0xE0:
            i += 1
            continue
        ver = (data[i + 1] >> 3) & 0x03          # 3=MPEG1 · 2=MPEG2 · 0=MPEG2.5
        layer = (data[i + 1] >> 1) & 0x03        # 1 = Layer III
        bidx = (data[i + 2] >> 4) & 0x0F
        ridx = (data[i + 2] >> 2) & 0x03
        pad = (data[i + 2] >> 1) & 0x01
        if layer != 1 or ridx == 3 or bidx in (0, 15) or (ver, ridx) not in _RATES:
            i += 1
            continue
        rate = _RATES[(ver, ridx)]
        kbps = (_BITRATES_V1 if ver == 3 else _BITRATES_V2)[bidx]
        samples = 1152 if ver == 3 else 576
        length = int(samples / 8 * kbps * 1000 / rate) + pad
        if length <= 4:
            i += 1
            continue
        out.append({"at": i, "len": length, "sec": samples / rate})
        i += length
    return out


def trim_bytes(data: bytes, drop_sec: float) -> tuple:
    """يحذف إطاراتِ البداية التي تغطّي `drop_sec` — يعيد (البايتات، المحذوفَ فعلاً).

    ولا يُكسَر إطارٌ ولا يُبتلع الملفُّ كلُّه: ما دون إطارٍ كامل لا يُقَصّ، وقصٌّ يستوعب
    الإطاراتِ جميعاً يُرفض فيبقى الملفُّ كما هو.
    """
    fr = frames(data)
    if not fr or drop_sec <= 0:
        return data, 0.0
    head = fr[0]["at"]                            # ما قبل أول إطار (وسمٌ إن وُجد)
    dropped, cut = 0.0, 0
    for f in fr:
        if dropped + f["sec"] > drop_sec:
            break
        dropped += f["sec"]
        cut += 1
    if cut == 0 or cut >= len(fr):
        return data, 0.0
    return data[:head] + data[fr[cut]["at"]:], dropped


# ————————————————————————— الأوامر —————————————————————————

def _row_of(text: str) -> tuple:
    key = gen.key_for(text)
    path = gen.OUT_DIR / f"{key}.mp3"
    if not path.exists():
        sys.exit(f"لا ملفَّ لـ«{text}» في {gen.OUT_DIR.relative_to(gen.ROOT)} (المفتاح {key})")
    return key, path


def cmd_list() -> int:
    """رؤوسُ البنك: المدةُ والحجمُ وعددُ الإطارات — بلا حكمٍ على أحد."""
    man_path = gen.OUT_DIR / "manifest.json"
    if not man_path.exists():
        print("لا بنكَ بعد (`app/audio/manifest.json` غير موجود).")
        return 0
    man = json.loads(man_path.read_text(encoding="utf-8"))
    rows = []
    for key, text in man.items():
        p = gen.OUT_DIR / f"{key}.mp3"
        if p.exists():
            rows.append((gen.mp3_duration(p), text, len(frames(p.read_bytes())), p.stat().st_size))
    rows.sort(reverse=True)
    print(f"{len(rows)} ملفاً — الأطولُ أولاً (وإطارُ ٢٤ك/٦٤ك = ٠٫٠٢٤ث):")
    for sec, text, nfr, size in rows:
        print(f"  {text[:26]:<28} {sec:5.2f}ث · {nfr:>4} إطاراً · {size // 1024}KB")
    return 0


def cmd_try(text: str, drop: float) -> int:
    """عيّنةُ «قبل/بعد» إلى `scratch` — **ولا يُمَسّ `app/audio`**."""
    key, src = _row_of(text)
    WORK.mkdir(parents=True, exist_ok=True)
    data = src.read_bytes()
    new, dropped = trim_bytes(data, drop)
    shutil.copy2(src, WORK / f"before__{key}.mp3")
    (WORK / f"after__{key}.mp3").write_bytes(new)
    before = gen.mp3_duration(src)
    print(f"  {text}: {before:.2f}ث → قُصّ {dropped:.2f}ث "
          f"({len(data)}→{len(new)} بايت، {before - dropped:.2f}ث)")
    print(f"\nالعيّنة في {WORK.relative_to(gen.ROOT)} — «قبل» و«بعد» ليقابلهما السمع.")
    return 0


def cmd_apply(text: str, drop: float) -> int:
    """القصُّ في البنك — بعد سماع الأذن. والسلفُ يُحفَظ، والبصمةُ تتبدّل فيُكسَر الكاش."""
    key, path = _row_of(text)
    data = path.read_bytes()
    new, dropped = trim_bytes(data, drop)
    if dropped <= 0:
        print(f"  · لم يُقَصّ شيء ({drop:.2f}ث دون إطارٍ كامل، أو تستوعب الملفَّ كلَّه).")
        return 1
    gen.archive_prev(path)                      # بابُ الرجوع: `--revert` في المصرِّف
    path.write_bytes(new)
    gen.write_manifest(gen.manifest_map())      # البصماتُ تتبدّل فيجلبه الجهازُ وحدَه
    print(f"قُصّ {dropped:.2f}ث من «{text}» ({key}.mp3) — وسلفُه محفوظٌ في scratch/prev.")
    return 0


def cmd_measure() -> int:
    """**نائمٌ بجردٍ**: لا مقياسَ صمتٍ في العدّة، فلا مسحَ آليّاً للبنك كلِّه."""
    if not MEASURER.exists():
        print(f"  ⏸ المسحُ الآليّ للبنك ({MEASURER.name} غير موجود — الأذنُ هي المقياس "
              f"اليوم، و`--try`/`--apply` قائمان) — نائم، يستيقظ ذاتياً")
        return 0
    sys.exit(f"وُجد {MEASURER.name}: أيقظْ هذا الأمرَ بوصله به (docs/SEED.md §٥).")


# ————————————————————————— فحصُ الفاحص —————————————————————————

def self_test() -> int:
    """بلا شبكةٍ ولا ملفات — على mp3 مُركَّبٍ من تروايسَ حقيقية، **ومُجرَّبٌ سالباً**."""
    ok_n = bad_n = 0

    def ok(cond, msg):
        nonlocal ok_n, bad_n
        print(("  ✓ " if cond else "  ✗ ") + msg)
        ok_n, bad_n = ok_n + bool(cond), bad_n + (not cond)

    # إطارُ MPEG2 Layer III · ٢٤ك · ٦٤كب/ث ⇒ ٥٧٦ عيّنة = ٠٫٠٢٤ث، وطولُه ١٩٢ بايت
    head = bytes([0xFF, 0xF3, 0x84, 0xC4])
    frame = head + b"\x00" * 188
    data = frame * 10
    fr = frames(data)
    ok(len(fr) == 10, f"عشرةُ إطاراتٍ تُقرأ عشرةً (قُرئ {len(fr)})")
    ok(abs(fr[0]["sec"] - 0.024) < 0.001, f"ومدّةُ الإطار ٠٫٠٢٤ث ({fr[0]['sec']:.4f})")
    ok(fr[0]["len"] == 192, f"وطولُه ١٩٢ بايت ({fr[0]['len']})")

    new, dropped = trim_bytes(data, 0.10)
    ok(abs(dropped - 0.096) < 0.001, f"قصُّ ٠٫١٠ث يحذف أربعةَ إطاراتٍ كاملة ({dropped:.3f}ث)")
    ok(len(new) == 6 * 192, f"والباقي ستةُ إطارات ({len(new) // 192})")
    ok(frames(new)[0]["len"] == 192, "والباقي يُقرأ إطاراتٍ صحيحةً بعد القصّ")

    ok(trim_bytes(data, 0)[1] == 0.0, "وقصُّ صفرٍ لا يحذف شيئاً")
    ok(trim_bytes(data, 99)[0] == data, "وقصٌّ يبتلع الملفَّ كلَّه يُرفض فيبقى كما هو")
    ok(trim_bytes(data, 0.01)[1] == 0.0, "وما دون إطارٍ كامل لا يُقَصّ (لا كسرَ إطار)")

    tagged = b"ID3\x03\x00\x00\x00\x00\x00\x0a" + b"\x00" * 10 + data
    ok(len(frames(tagged)) == 10, "ووسمُ ID3 في الرأس يُتخطّى بطوله المعلَن")
    cut, _d = trim_bytes(tagged, 0.10)
    ok(cut.startswith(b"ID3"), "ويبقى الوسمُ بعد القصّ (لا يُقَصّ إلا الصوت)")

    # **المسطرةُ واحدة**: عدُّ الإطارات هنا ومدّةُ المصرِّف هناك يتّفقان على الملفّ نفسِه
    tmp = gen.ROOT / "scratch" / "trim_selftest.mp3"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_bytes(data)
    ok(abs(gen.mp3_duration(tmp) - sum(f["sec"] for f in fr)) < 0.001,
       "ومدّةُ المصرِّف تساوي مجموعَ إطارات هذا القارئ (مسطرةٌ واحدة لا مسطرتان)")
    tmp.unlink()

    ok(not MEASURER.exists(), "والمسحُ الآليّ نائمٌ بشرطٍ مجرود (لا مقياسَ صمتٍ في العدّة)")

    print(f"\n{ok_n}/{ok_n + bad_n} تحقّقاً ناجحاً")
    return 1 if bad_n else 0


def main() -> int:
    ap = argparse.ArgumentParser(description="مِقصُّ الصمت الأول في ملفات mp3")
    ap.add_argument("--list", action="store_true", help="مدد البنك وأحجامه (الأطول أولاً)")
    ap.add_argument("--try", dest="try_text", default="", help="عيّنة «قبل/بعد» لنصّ في scratch")
    ap.add_argument("--apply", dest="apply_text", default="", help="القصّ في app/audio لنصّ")
    ap.add_argument("--drop", type=float, default=0.0, help="المقدار المقصوص بالثواني")
    ap.add_argument("--measure", action="store_true", help="مسحُ البنك كلِّه (نائم — SEED §٥)")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()

    if args.self_test:
        return self_test()
    if args.list:
        return cmd_list()
    if args.try_text or args.apply_text:
        if args.drop <= 0:
            sys.exit("حدِّد المقدار: --drop 0.25 (الأذنُ هي المقياس — راجعْ رأسَ الملف)")
        return (cmd_try(args.try_text, args.drop) if args.try_text
                else cmd_apply(args.apply_text, args.drop))
    return cmd_measure()


if __name__ == "__main__":
    sys.exit(main())
