#!/usr/bin/env python3
"""مصرِّفُ القائمة الصوتية — يحوّل `tools/audio_queue.json` إلى `app/audio/*.mp3`.

    python3 tools/generate_audio.py --queue-status   # ماذا في القائمة (بلا شبكة)
    python3 tools/generate_audio.py --dry-run        # ماذا سيُصرَّف (بلا طلب واحد)
    python3 tools/generate_audio.py --from-queue     # التصريف بالأولوية فالأقدمية
    python3 tools/generate_audio.py --verify-only    # التحقّق الختامي بلا توليد
    python3 tools/generate_audio.py --sync-versions  # إعادة اشتقاق البصمات من القرص
    python3 tools/generate_audio.py --self-test      # فحصُ الفاحص: بلا شبكة ولا مفتاح

منسوخٌ ومجرَّدٌ من `read@1ccbda9` (`docs/SEED.md §٣`). ودروسُ اقرأ التي دُفع ثمنُها
باقيةٌ بحرفها: مفاتيحُ لا تُطبع · حصةٌ مستقلّة لكل (مفتاح × نموذج) · سقفٌ ذاتيّ يوميّ
لا يعتمد على الخادم · إيقاعٌ يخنق كلَّ طلب · قصُّ صمت الطرفين في الأنبوب · فهرسٌ
يُكتب بعد كل ملف · بصماتُ محتوى تكسر الكاش · تسجيلُ الإنجاز **دمجاً لا استبدالاً** ·
وسلفُ كل ملفٍ يُحفَظ قبل أن يُكتَب فوقه.

——————————— وثلاثةُ مفارقٍ عن اقرأ، لكلٍّ علّتُه ———————————

١) **مصدرٌ واحد: القائمة.** في اقرأ مصدران (نصوصٌ تُستخرج من `curriculum.js` بتعبيرٍ
   نمطيّ، ونصوصٌ تُصفّ في القائمة) — ومصدران لحقيقةٍ واحدة يفترقان. وهنا البروتوكول
   نفسُه يقول إنّ **كلَّ نصّ منطوق يُصَفّ** (`docs/AUDIO_QUEUE.md`)، ويحرسه
   `check_speech.mjs` بابَين: نصٌّ يُنطق ولا يُصَفّ فشلٌ أحمر، ومدخلٌ لا تنطقه وحدة
   فشلٌ أحمر. فالقائمةُ هي المصدر، ولا مستخرجَ ثانياً يفترق عنها.

٢) **نموذجٌ واحد لا ثلاثة.** سياسةُ اقرأ ثلاثةُ نماذج لأنّ بنكَه ٢٨٠٠ ملفٍ على حصصٍ
   يومية. وبنكُنا **مئاتٌ لا آلاف** (`METHOD.md §٨`)، ومادّتُه كلُّها قصيرة، **وتُسمع
   متجاورة** — أسماءُ الأعداد في عدٍّ متتابع. وعهدُ النسب: «وحدةُ الصوت داخل الفئة
   المعروضة معاً مقدَّمةٌ على أجودَ متفرّق». فنموذجُ النواة المجرَّب وحدَه، والصوتُ
   **سُلافات** لا يُبدَّل (هويةُ العائلة — `FAMILY.md §٦`).

٣) **حارسٌ عند البوّابة**: قيدا المنهج (ق١ لا رقمَ منطوق · ق٢ لا معدودٌ مقرونٌ بعدد)
   يُفحصان **قبل أيّ طلب**، والمخالفُ يُحجَز بعلّته المكتوبة في مدخله. وهما مكتوبان
   هنا **مستقلَّين** عن `check_speech.mjs` عمداً: مقابلةُ نسخةٍ بنسختها لا تُثبت شيئاً
   (درسُ جدول النرد في `check_render.mjs`)، فإن اختلف الحكمان ظهر الخلافُ ولم يُدفَن.

المفتاح: `GEMINI_API_KEY` من البيئة أو من `.env` (غيرُ متتبَّع في git) — لا يُطبع أبداً.
"""

import argparse
import array
import base64
import collections
import datetime
import hashlib
import json
import os
import re
import shutil
import statistics
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "app" / "audio"
ENV_FILE = ROOT / ".env"
QUEUE_FILE = ROOT / "tools" / "audio_queue.json"
VERDICTS = ROOT / "tools" / "audio_verdicts.json"    # ما سمعه المالك وحكم فيه
PREV_DIR = ROOT / "scratch" / "prev"                 # سلفُ كل ملفٍ استُبدل — بابُ الرجوع
SPEND_FILE = ROOT / "scratch" / "spend.json"
TODAY = datetime.date.today().isoformat()

GEMINI_HOST = "https://generativelanguage.googleapis.com"
MODEL = "gemini-3.1-flash-tts-preview"   # نواةُ اقرأ المجرَّبة — ولا ثانيَ لها هنا (المفرق ٢)
VOICE = "Sulafat"                        # **سُلافات**: هويةُ العائلة الصوتية، لا تُبدَّل
DAILY_CAP = 100                          # سقفُنا الذاتيّ لكل مفتاح (حدُّ الخطة المعلوم)
URGENT_PRIORITY = 10                     # إصلاحُ عيبٍ مسموع يتقدّم الصفَّ
EMPTY_STREAK_LIMIT = 3                   # استجاباتٌ متتابعة بلا صوت ← تنحيةُ الجولة

# ————— الفئاتُ أربعٌ لا خامسَ لها (`docs/AUDIO_QUEUE.md` · `METHOD.md §٨`) —————
#
# تعليمةُ الأداء تُكتب قبل النصّ فتوجّه الأداء ولا تُنطق (سلوكٌ مثبَّت في Gemini TTS).
# و**كلُّها تنصّ على «مرة واحدة»**: بلاغُ المالك في اقرأ (٤ أغسطس ٢٠٢٦) أنّ بعض الملفات
# نُطقت مرّتين — والمدةُ تكشفه بعد التوليد، والتعليمةُ تمنعه قبله.
STYLE = {
    "number_name": ("انطق اسم هذا العدد وحدَه، بتأنٍّ ووضوحٍ تامّ، كما يعدّ معلّمٌ "
                    "لطفلٍ في الخامسة، مرة واحدة: "),
    "instruction": ("اقرأ هذه التعليمة بتأنٍّ ووضوحٍ وودّ، كمعلّمٍ يخاطب طفلاً في "
                    "الخامسة، وأظهرْ آخرَ كل كلمة نطقاً بيّناً بلا إبدال ولا ابتلاع، "
                    "مرة واحدة: "),
    "modeling": ("قلها بهدوءٍ ودعوةٍ لطيفة، كمعلّمٍ يدعو طفلاً ليعمل معه، وأظهرْ آخرَ "
                 "كل كلمة نطقاً بيّناً بلا إبدال ولا ابتلاع، مرة واحدة: "),
    "celebration": ("قلها بفرحٍ هادئٍ وتشجيع، بلا مبالغةٍ ولا صياح، لطفلٍ أصاب، "
                    "مرة واحدة: "),
}
CATEGORY_AR = {
    "number_name": "اسم عدد",
    "instruction": "تعليمة",
    "modeling": "نمذجة",
    "celebration": "احتفال",
}
CATEGORY_ORDER = list(CATEGORY_AR)


def key_for(text: str) -> str:
    """مفتاحُ النصّ = اسمُ ملفه — sha1 نصِّه العربيّ، أولُ ١٢ خانة.

    الاشتقاقُ نفسُه في `app/js/audio.js` (بايثون وجافاسكربت)، فاستبدالُ ملفٍ بتسجيلٍ
    بشريٍّ لاحقاً لا يمسّ الشيفرة بحرف.
    """
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]


# ————————————— قيدا المنهج: الحارسُ عند البوّابة (المفرق ٣) —————————————
#
# مكتوبان هنا مستقلَّين عن `check_speech.mjs` عمداً — راجعْ رأسَ الملف.

_DIGIT_RE = re.compile(r"[0-9٠-٩]")
# اسمُ عددٍ يليه اسمٌ ⇒ إشارةٌ كافية أن يُراجَع النصّ. حارسٌ عند البوّابة لا مصحّحُ نحو.
_COUNTED_RE = re.compile(
    r"(?:^|\s)(?:وَ)?(?:ثَلَاث|أَرْبَع|خَمْس|سِتّ|سَبْع|ثَمَان|تِسْع|عَشْر|عَشَر)"
    r"[ً-ْٰةايو]*\s+[ء-ي]")
# رمزٌ مفردٌ مقتبس داخل نصّ («ء» و«٣») — الصوتُ يسمّي ولا يقرأ الرمز (حكمُ اقرأ ٥ أغسطس).
_QUOTE_PAIRS = (("«", "»"), ("“", "”"), ('"', '"'), ("'", "'"))


def has_digit(text: str) -> bool:
    """**ق١**: لا رقمَ في نصٍّ منطوق — العددُ يُسمّى ولا يُقرأ رسمُه."""
    return bool(_DIGIT_RE.search(str(text)))


def has_counted_noun(text: str, category: str = "") -> bool:
    """**ق٢**: لا معدودٌ مقرونٌ بعدد — «ثَلَاثُ تُفَّاحَاتْ» ممنوعةٌ نصّاً.

    **واسمُ العدد المركَّب ليس معدوداً** (الجلسة ٧): «ثَلَاثَةَ عَشَرْ» عددٌ واحد لفظُه
    كلمتان — وهو عينُ العدّ المجرد الذي يفرضه ق٢ لا نقضٌ له. فيُستثنى **بفئته لا
    بشكله** (`number_name` — وهي مشتقّةٌ من موضع النصّ في الشجرة لا مكتوبةٌ بيد)،
    والنصُّ نفسُه في فئةٍ أخرى يُمسَك كما كان.
    """
    if category == "number_name":
        return False
    return bool(_COUNTED_RE.search(str(text)))


def quoted_symbols(text: str) -> list:
    """رموزٌ مفردةٌ مقتبسة داخل النصّ — تُسمّى ولا تُقتبَس فيخمّنها المولّد."""
    found = []
    for open_q, close_q in _QUOTE_PAIRS:
        i = 0
        while True:
            a = text.find(open_q, i)
            if a < 0:
                break
            b = text.find(close_q, a + 1)
            if b < 0:
                break
            inner = text[a + 1:b].strip()
            if 0 < len(inner) <= 2 and not inner.isascii():
                found.append(inner)
            i = b + 1
    return found


def gate_reason(text: str, category: str = "") -> str:
    """علّةُ ردّ النصّ قبل أيّ طلب — أو `""` إن كان سليماً."""
    if has_digit(text):
        return "رقمٌ في نصّ منطوق (ق١): العددُ يُسمّى ولا يُقرأ رسمُه"
    if has_counted_noun(text, category):
        return "معدودٌ مقرونٌ بعدد (ق٢): الكميةُ تُرى وتُعَدّ ولا تُركَّب نحوياً"
    syms = quoted_symbols(text)
    if syms:
        return f"رمزٌ مقتبس ({'، '.join(syms)}): الصوتُ يسمّي ولا يقرأ الرمز"
    return ""


def speech_form(text: str) -> str:
    """صورةُ النصّ **كما تُنطق** — تُرسَل للمولّد، ولا تمسّ المفتاح ولا البيانات.

    بلاغُ المالك في اقرأ (٥ أغسطس ٢٠٢٦): التاءُ المربوطة الساكنة تُنطق تاءً، والعربُ
    تقف عليها هاءً. وثمانيةٌ من أسماء أعدادنا العشرة تنتهي بها («ثَلَاثَةْ» … «عَشَرَةْ»)،
    فالدرسُ هنا أثقلُ منه هناك. **وسكونُ الوقف يبقى**: حذفُه يترك الآخر بلا حكمٍ
    فيُشكِّله المولّد («الْوَلَدْ» تُنطق «الولدُ» — دفعةُ المكتبة، ١٩٠ نصاً).
    """
    if text.endswith("ةْ"):
        return text[:-2] + "هْ"
    if text.endswith("ة"):
        return text[:-1] + "هْ"
    return text


def style_for(entry: dict) -> str:
    """تعليمةُ الأداء: توجيهُ المدخل إن أعلنه، وإلّا افتراضُ فئته."""
    hint = (entry.get("style_hint") or "").strip()
    if hint:
        return hint.rstrip(":：").rstrip() + ": "
    return STYLE[entry.get("category", "instruction")]


# ————————————————————— المفتاح والبيئة —————————————————————

KEY_NAMES = ("GEMINI_API_KEY", "GEMINI_API_KEY_PRO")


def read_env_key(name: str) -> str | None:
    """المفتاح من البيئة أو `.env` بمحلّلٍ بسيط (لا حزم جديدة، ولا طباعةٌ للقيمة)."""
    val = os.environ.get(name)
    if val:
        return val.strip()
    if not ENV_FILE.exists():
        return None
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        if k.strip() == name:
            return v.strip().strip("'\"") or None
    return None


def read_keys() -> list:
    """[(اسمُ المفتاح، قيمتُه)] بالترتيب — والقيمُ لا تُطبع في أيّ مخرَجٍ أبداً."""
    out = []
    for name in KEY_NAMES:
        val = read_env_key(name)
        if val and all(val != v for _n, v in out):     # مفتاحٌ مكرَّر لا يفيد
            out.append((name, val))
    return out


# ————————————————————— الأخطاء والإيقاع —————————————————————

class TTSError(RuntimeError):
    pass


class QuotaExhausted(TTSError):
    """الحصةُ اليومية نفدت — لا تُعاد المحاولة، يُنتظر التجدد."""

    def __init__(self, seconds: int, detail: str = ""):
        super().__init__(f"الحصة اليومية نفدت — التجدد بعد {seconds} ثانية. {detail}".strip())
        self.seconds = seconds


class EmptyAudio(TTSError):
    """استجابةُ ٢٠٠ بلا صوت — عيبُ النموذج في نصٍّ بعينه."""


_MIN_INTERVAL = 0.0        # ثوانٍ بين طلبين على المفتاح الواحد (يضبطها --rpm)
_LAST_REQUEST = {}         # «مفتاح:نموذج» ← وقتُ آخر طلبٍ له


def set_rpm(rpm: float) -> None:
    """سقفُ الطلبات في الدقيقة **لكل مفتاح** — دون حدّ النموذج كي لا تُحرق محاولاتٌ على 429."""
    global _MIN_INTERVAL
    _MIN_INTERVAL = 60.0 / rpm if rpm > 0 else 0.0


def _pace(pace_key: str) -> None:
    """مَخنَقُ كلّ طلب: يباعد بالإيقاع **ويقيّد الإنفاق** — فلا طلبَ بلا عدّ."""
    if _MIN_INTERVAL:
        wait = _LAST_REQUEST.get(pace_key, 0.0) + _MIN_INTERVAL - time.monotonic()
        if wait > 0:
            time.sleep(wait)
    _LAST_REQUEST[pace_key] = time.monotonic()
    bump_spend(pace_key)


def parse_429(body: str) -> tuple[bool, int]:
    """يفكّ جسمَ خطأ 429: (أهي حصةٌ يومية؟، ثوانٍ حتى التجدد)."""
    per_day, seconds = False, 0
    try:
        err = json.loads(body).get("error", {})
    except json.JSONDecodeError:
        return "per_day" in body or "PerDay" in body, 0
    for det in err.get("details", []):
        for v in det.get("violations", []):
            qid = f'{v.get("quotaId", "")} {v.get("quotaMetric", "")}'
            if "PerDay" in qid or "per_day" in qid:
                per_day = True
        if det.get("@type", "").endswith("RetryInfo"):
            m = re.match(r"(\d+)", str(det.get("retryDelay", "")))
            if m:
                seconds = int(m.group(1))
    if not per_day:
        msg = err.get("message", "")
        per_day = "per_day" in msg or "per day" in msg
    return per_day, seconds


# ————————————————————— سقفُ الإنفاق الذاتيّ —————————————————————
#
# حزامُ أمانٍ لا يعتمد على الخادم: نحاسب أنفسنا لكل (مفتاح × نموذج) ونرفض التجاوز ولو
# سمح الخادم — فأيّ مستهلكٍ خارجيّ أو خللِ عدٍّ لا يُفاجئنا بنفادٍ يوقف عملَ يومٍ كامل.

def load_spend() -> dict:
    """{"مفتاح:نموذج": عدد} ليوم اليوم — ويُنسى ما قبله."""
    if not SPEND_FILE.exists():
        return {}
    try:
        data = json.loads(SPEND_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data.get(TODAY, {}) if isinstance(data, dict) else {}


def bump_spend(pace_key: str) -> None:
    """يُزاد عند كلّ طلبٍ فعليّ (من `_pace`، وهو مَخنَقُ الطلبات كلِّها)."""
    SPEND_FILE.parent.mkdir(parents=True, exist_ok=True)
    data = {}
    if SPEND_FILE.exists():
        try:
            data = json.loads(SPEND_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = {}
    day = data.setdefault(TODAY, {})
    day[pace_key] = day.get(pace_key, 0) + 1
    for old in [k for k in data if k != TODAY]:
        data.pop(old)
    tmp = SPEND_FILE.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    os.replace(tmp, SPEND_FILE)


def spend_left(key_name: str) -> int:
    return max(0, DAILY_CAP - load_spend().get(f"{key_name}:{MODEL}", 0))


class KeyPool:
    """مفاتيحُ متعددة بحسابِ حصةٍ مستقلٍّ لكلٍّ — نفادُ الأول لا يوقف الثاني."""

    def __init__(self, keys: list, voice: str = VOICE):
        self.keys = keys
        self.voice = voice
        self.exhausted = {}                 # اسمُ المفتاح ← ثوانٍ حتى التجدد
        self.used = collections.Counter()   # اسمُ المفتاح ← عددُ ما وُلِّد به

    def available(self) -> list:
        """المتاحُ الآن، **الأقدمُ استعمالاً أولاً** — فلا يُستنزف الأولُ وحدَه ويقيّدنا إيقاعُه."""
        free = [(n, v) for n, v in self.keys
                if n not in self.exhausted and spend_left(n) > 0]
        return sorted(free, key=lambda kv: _LAST_REQUEST.get(f"{kv[0]}:{MODEL}", 0.0))

    def capped(self) -> list:
        """مفاتيحُ بلغت **سقفَنا الذاتيّ** اليوم (لا سقفَ الخادم)."""
        return [n for n, _v in self.keys if n not in self.exhausted and spend_left(n) <= 0]

    def retry_seconds(self) -> int:
        return min(self.exhausted.values()) if self.exhausted else 3600

    def call(self, text: str, style: str) -> tuple[bytes, int, str]:
        """يجرّب المتاحَ بالترتيب؛ ويرفع `QuotaExhausted` متى نفدت كلُّها."""
        for name, value in self.available():
            try:
                pcm, rate = gemini_pcm(speech_form(text), style, value,
                                       pace_key=f"{name}:{MODEL}")
                self.used[name] += 1
                return pcm, rate, name
            except QuotaExhausted as e:
                self.exhausted[name] = e.seconds
                print(f"  ⏸ {name}: {e}", file=sys.stderr)
        if self.capped():
            print(f"  🛑 بلغ سقفُنا الذاتيّ اليوميّ ({DAILY_CAP} لكل مفتاح) — "
                  f"يتوقّف حزامَ أمان", file=sys.stderr)
        raise QuotaExhausted(self.retry_seconds())


# ————————————————————— PCM ← Gemini —————————————————————

def gemini_pcm(text: str, style: str, api_key: str, retries: int = 5,
               empty_retries: int = 2, pace_key: str = "") -> tuple[bytes, int]:
    """يعيد (PCM خام ١٦ بت، معدّلَ العيّنات). يعيد المحاولة عند 429/5xx."""
    body = json.dumps({
        "contents": [{"parts": [{"text": style + text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}},
        },
    }, ensure_ascii=False).encode("utf-8")

    url = f"{GEMINI_HOST}/v1beta/models/{MODEL}:generateContent"
    delay, last, empty = 2.0, None, 0
    for attempt in range(retries):
        req = urllib.request.Request(url, data=body, method="POST", headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        })
        try:
            _pace(pace_key or MODEL)
            with urllib.request.urlopen(req, timeout=180) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
            return extract_audio(payload)
        except urllib.error.HTTPError as e:
            code = e.code
            detail = e.read().decode("utf-8", "replace")
            last = TTSError(f"HTTP {code}: {detail[:300]}")   # لا رابطَ ولا ترويسة تُطبع
            if code == 429:
                per_day, seconds = parse_429(detail)
                if per_day:                     # لا فائدةَ من محاولةٍ قبل التجدد
                    raise QuotaExhausted(seconds or 3600) from e
                if seconds:                     # حدُّ الدقيقة: ننتظر ما يطلبه الخادم
                    delay = max(delay, min(seconds + 1, 120))
            if code not in (408, 429, 500, 502, 503, 504):
                raise last from e
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            last = TTSError(f"{type(e).__name__}: {e}")
        except EmptyAudio as e:
            # غيرُ حتميّ فتُعاد المحاولة — **مرّتين فقط**: كلُّ محاولةٍ طلبٌ يُخصم من
            # حصة اليوم، وحرقُ خمسٍ على نصٍّ عصيٍّ يضيّع عشراتِ الطلبات (٣ أغسطس ٢٠٢٦).
            last = e
            empty += 1
            if empty >= empty_retries:
                raise
        except TTSError as e:
            last = e
        if attempt < retries - 1:
            time.sleep(delay)
            delay = min(delay * 2, 60)
    raise last or TTSError("فشل غير معروف")


def extract_audio(payload: dict) -> tuple[bytes, int]:
    """يجمع أجزاءَ `inlineData` الصوتية ويستخرج معدّلَ العيّنات من `mimeType`."""
    chunks, rate = [], 24000
    for cand in payload.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            if not inline:
                continue
            mime = inline.get("mimeType") or inline.get("mime_type") or ""
            if not mime.startswith("audio/"):
                continue
            m = re.search(r"rate=(\d+)", mime)
            if m:
                rate = int(m.group(1))
            chunks.append(base64.b64decode(inline["data"]))
    if not chunks:
        reason = payload.get("promptFeedback") or payload.get("candidates") or payload
        raise EmptyAudio(f"لا صوت في الاستجابة: {json.dumps(reason, ensure_ascii=False)[:200]}")
    return b"".join(chunks), rate


# ————————————————————— PCM → MP3 —————————————————————

_HAVE_FFMPEG = shutil.which("ffmpeg")
_ENCODER = None
SILENCE_RATIO = 0.02        # ٢٪ من الذروة يُعَدّ صمتاً
SILENCE_PAD_MS = 60         # هامشٌ يبقى قبل الصوت وبعده


def trim_pcm(pcm: bytes, rate: int) -> bytes:
    """قصُّ صمت الطرفين من PCM خام (١٦ بت أحادي) **قبل الترميز**.

    المولّد يعيد أحياناً صمتاً طويلاً قبل النطق (بلغ ١٫٢٨ث في اقرأ) — والطفلُ ينقر
    فينتظر. والقصُّ هنا في الأنبوب: بلا حصة، وينفع كلَّ ملفٍ يُولَّد بعده.
    """
    samples = array.array("h")
    samples.frombytes(pcm[:len(pcm) - len(pcm) % 2])
    if sys.byteorder == "big":
        samples.byteswap()
    if not samples:
        return pcm
    peak = max(max(samples), -min(samples))
    if peak == 0:
        return pcm
    thr = peak * SILENCE_RATIO
    start, end = 0, len(samples) - 1
    while start < len(samples) and abs(samples[start]) < thr:
        start += 1
    while end > start and abs(samples[end]) < thr:
        end -= 1
    pad = int(rate * SILENCE_PAD_MS / 1000)
    cut = samples[max(0, start - pad):min(len(samples), end + pad + 1)]
    if len(cut) < rate * 0.1:          # لا يُقَصّ إلى لا شيء (صمتٌ تامّ عيبٌ آخر)
        return pcm
    if sys.byteorder == "big":
        cut.byteswap()
    return cut.tobytes()


def pcm_to_mp3(pcm: bytes, rate: int, path: Path, trim: bool = True) -> None:
    """تحويلُ PCM (l16 mono) إلى mp3 — ffmpeg إن وُجد، وإلّا `lameenc` داخل بايثون."""
    if trim:
        pcm = trim_pcm(pcm, rate)
    path.parent.mkdir(parents=True, exist_ok=True)
    if _HAVE_FFMPEG:
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(rate),
             "-ac", "1", "-i", "pipe:0", "-codec:a", "libmp3lame", "-b:a", "64k", str(path)],
            input=pcm, check=True,
        )
        return
    global _ENCODER
    if _ENCODER is None:
        try:
            import lameenc  # noqa: PLC0415
        except ImportError:
            sys.exit("يلزم ffmpeg أو الحزمة lameenc:  .venv/bin/pip install lameenc")
        _ENCODER = lameenc
    enc = _ENCODER.Encoder()
    enc.set_bit_rate(64)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)          # ٠ الأبطأ/الأجود … ٩ الأسرع
    enc.silence()
    path.write_bytes(enc.encode(pcm) + enc.flush())


# ————————————— مدةُ mp3 (بلا مكتبات ولا ffmpeg): تُقرأ من إطاراتها —————————————

BITRATES_V1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
BITRATES_V2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
RATES = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}


def mp3_duration(path: Path) -> float:
    """مدةُ الملف بالثواني من إطاراته (يتخطّى ID3 ويعدّ الإطارات فعلاً)."""
    data = path.read_bytes()
    i = 0
    if data[:3] == b"ID3":
        size = ((data[6] & 0x7F) << 21 | (data[7] & 0x7F) << 14
                | (data[8] & 0x7F) << 7 | (data[9] & 0x7F))
        i = 10 + size
    total = 0.0
    n = len(data)
    while i + 4 <= n:
        if data[i] != 0xFF or (data[i + 1] & 0xE0) != 0xE0:
            i += 1
            continue
        ver = (data[i + 1] >> 3) & 0x03          # 3=MPEG1 · 2=MPEG2 · 0=MPEG2.5
        layer = (data[i + 1] >> 1) & 0x03        # 1 = Layer III
        bidx = (data[i + 2] >> 4) & 0x0F
        ridx = (data[i + 2] >> 2) & 0x03
        pad = (data[i + 2] >> 1) & 0x01
        if layer != 1 or ver == 1 or bidx in (0, 15) or ridx == 3:
            i += 1
            continue
        rate = RATES[ver][ridx]
        kbps = (BITRATES_V1L3 if ver == 3 else BITRATES_V2L3)[bidx]
        spf = 1152 if ver == 3 else 576
        length = (spf // 8 * kbps * 1000) // rate + pad
        if length <= 4:
            i += 1
            continue
        total += spf / rate
        i += length
    return total


# ————————————————————— القائمة (docs/AUDIO_QUEUE.md) —————————————————————

def load_queue() -> list:
    """القائمةُ التي تصفّ فيها جلساتُ التطوير نصوصَها — وهي **مصدرُنا الوحيد**."""
    if not QUEUE_FILE.exists():
        return []
    try:
        data = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit(f"{QUEUE_FILE.name} ليس JSON صالحاً: {e}")
    if not isinstance(data, list):
        sys.exit(f"{QUEUE_FILE.name} يجب أن يكون مصفوفة JSON")
    for i, entry in enumerate(data):
        if not isinstance(entry, dict) or not entry.get("text"):
            sys.exit(f"مدخل {i} في {QUEUE_FILE.name} بلا نصّ")
        cat = entry.get("category")
        if cat not in STYLE:
            sys.exit(f"مدخل {i}: فئة غير معروفة «{cat}» — الأربع: {'، '.join(STYLE)}")
    return data


def save_queue(queue: list) -> None:
    """كتابةٌ ذرّية: ملفٌّ مؤقّت ثم استبدال — فلا يقرأ أحدٌ ملفاً نصفَ مكتوب.

    واسمُ المؤقّت **يحمل رقمَ العملية**: عمليتان تكتبان معاً كانتا تتنازعان اسماً
    واحداً فيسقط أحدُهما بـ`FileNotFoundError` (وقع في اقرأ، ٥ أغسطس ٢٠٢٦).
    """
    tmp = QUEUE_FILE.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(queue, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, QUEUE_FILE)


def _merge(text: str, edit) -> bool:
    """تعديلُ مدخلٍ بنصّه **دمجاً لا استبدالاً**: تُعاد قراءةُ القرص عند كل تسجيل.

    التصريفُ يستغرق دقائق وجلسةُ تطويرٍ قد تُضيف نصوصاً أثناءه؛ فكتابةُ اللقطة القديمة
    كاملةً كانت تمحو إضافاتِها.
    """
    disk = load_queue()
    changed = False
    for e in disk:
        if e.get("text") == text and edit(e):
            changed = True
    if changed:
        save_queue(disk)
    return changed


def mark_done(text: str, model: str) -> bool:
    def edit(e):
        if e.get("status", "pending") == "done":
            return False
        e.update(status="done", doneAt=TODAY, model=model)
        return True
    return _merge(text, edit)


def mark_failed(text: str, model: str) -> bool:
    def edit(e):
        if e.get("status", "pending") == "done":
            return False
        e["failCount"] = e.get("failCount", 0) + 1
        e["lastFailModel"] = model
        return True
    return _merge(text, edit)


def mark_hold(text: str, reason: str) -> bool:
    """يحجز نصّاً عن التوليد بعلّةٍ مكتوبة — فلا يُردّ مرّتين بلا أن يُعرَف لِمَ."""
    def edit(e):
        if e.get("hold") == reason:
            return False
        e["hold"] = reason
        return True
    return _merge(text, edit)


def requeue(texts: list, reason: str) -> int:
    """يعيد نصّاً مُصرَّفاً إلى الانتظار بأولوية العيوب المسموعة (١٠).

    وليس مسّاً بالسجل: الحالةُ تعود `pending` ويبقى ما كان مقيَّداً في `fixHistory`.
    """
    disk = load_queue()
    n = 0
    for e in disk:
        if e.get("text") in texts:
            e.setdefault("fixHistory", []).append(
                {"was": e.get("model", ""), "doneAt": e.get("doneAt"),
                 "reason": reason, "requeuedAt": TODAY})
            e.update(status="pending", priority=min(e.get("priority", 100), URGENT_PRIORITY))
            for dead in ("failCount", "lastFailModel", "model", "hold"):
                e.pop(dead, None)
            n += 1
    if n:
        save_queue(disk)
    return n


def queue_pending(queue: list) -> list:
    """المصفوفون بالأولوية (الأصغرُ أسبق) ثم بالأقدمية (ترتيبُ الإضافة)."""
    pending = [(i, e) for i, e in enumerate(queue)
               if e.get("status", "pending") != "done" and not e.get("retired")]
    pending.sort(key=lambda p: (p[1].get("priority", 100), p[0]))
    return pending


def queue_texts(queue: list, status: str) -> dict:
    """نصوصُ القائمة بحالةٍ معيّنة ← فئتُها (والمتقاعدُ خارجها)."""
    return {e["text"]: e.get("category", "instruction")
            for e in queue if e.get("status", "pending") == status and not e.get("retired")}


def expected_texts() -> tuple[dict, dict]:
    """(ما يُتوقَّع أن له ملف = منجَزُ القائمة، وما زال منتظِراً).

    **مصدرٌ واحد**: القائمةُ وحدَها (المفرق ١ في رأس الملف).
    """
    queue = load_queue()
    return queue_texts(queue, "done"), queue_texts(queue, "pending")


def manifest_map() -> dict:
    """مفتاحٌ ← نصّ **لكل ملفٍ موجودٍ فعلاً**.

    شرطُ «موجودٌ على القرص» مقصود: بحذف ملفٍ يخرج نصُّه من الفهرس، ولا يَعِد الفهرسُ
    بملفٍّ غائبٍ فيُهدَر طلبُ شبكةٍ فاشل قبل النطق الاحتياطيّ.
    """
    done, _pending = expected_texts()
    return {key_for(t): t for t in done if (OUT_DIR / f"{key_for(t)}.mp3").exists()}


# ————————————— بصماتُ المحتوى: كسرُ كاش الملف المستبدَل وحدَه —————————————
#
# **العيبُ المُعالَج**: اسمُ الملف مشتقٌّ من **نصّه** لا من محتواه، فاستبدالُ صوتٍ تحت
# المفتاح نفسه لا يغيّر الرابط — والجهاز الذي خزّن القديم في عامل الخدمة يبقى عليه،
# فيُسمع النصُّ الواحد بصوتين بحسب تاريخ أوّل طلبٍ لكل جهاز.
#
# **والحلّ**: بصمةُ **البايتات** في بيانٍ مجاور، يطلب بها التطبيق `<key>.mp3?v=<بصمة>`.
# ولماذا بيانٌ مجاور لا حقلٌ في الفهرس؟ لأنّ الفهرس «مفتاح ← نصّ» يقرؤه فاحصون وأدوات،
# وتغييرُ شكله يكسرها جميعاً. والملفُّ المجاور يتحمّل الغياب: بلا بصمةٍ يعمل كلُّ شيء
# كما كان — بلا وسمٍ فقط.
#
# **ولا تُبنى تراكمياً أبداً**: كلُّ كتابةٍ تعيد اشتقاقَ البيان كلِّه من بايتات القرص،
# فأيُّ استبدالٍ سبق بشيفرةٍ قديمة يُشفى من تلقائه — ولا يُترك ملفٌّ ببصمةٍ **كاذبة**،
# وهي أخطرُ من غيابها.

def fingerprint(path: Path) -> str:
    """بصمةُ محتوى الملف — أولُ ٨ خانات من sha1 بايتاته."""
    return hashlib.sha1(path.read_bytes()).hexdigest()[:8]


def versions_map(manifest: dict) -> dict:
    out = {}
    for key in sorted(manifest):
        path = OUT_DIR / f"{key}.mp3"
        if path.exists():
            out[key] = fingerprint(path)
    return out


def write_versions(manifest: dict) -> dict:
    """كتابةُ `versions.json` **ذرّياً** — فلا يقرأ التطبيقُ ولا فاحصٌ بياناً نصفَ مكتوب."""
    versions = versions_map(manifest)
    path = OUT_DIR / "versions.json"
    tmp = path.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(versions, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    tmp.replace(path)
    print(f"البصمات: {path.relative_to(ROOT)} ({len(versions)} ملفاً)")
    return versions


def write_manifest(manifest: dict) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / "manifest.json"
    tmp = path.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    tmp.replace(path)
    print(f"الفهرس: {path.relative_to(ROOT)} ({len(manifest)} نصاً)")
    write_versions(manifest)


def stale_versions(manifest: dict) -> list:
    """مفاتيحُ بصمتُها في البيان تخالف بايتاتِ ملفها (أو غائبة) — عيبُ الخلط عائداً."""
    if not (OUT_DIR / "versions.json").exists():
        return sorted(k for k in manifest if (OUT_DIR / f"{k}.mp3").exists())
    have = json.loads((OUT_DIR / "versions.json").read_text(encoding="utf-8"))
    return sorted(k for k, v in versions_map(manifest).items() if have.get(k) != v)


# ————————————— السلف: بابُ الرجوع عن استبدالٍ لم تقبله الأذن —————————————

def archive_prev(path: Path) -> bool:
    """يحفظ الملفَّ القائم قبل أن يُكتَب فوقه — والمجلَّد خارج المستودع (`scratch/`)."""
    if not path.exists():
        return False
    PREV_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, PREV_DIR / path.name)
    return True


def revert_prev(texts: list) -> tuple:
    back, none = [], []
    for t in texts:
        src = PREV_DIR / f"{key_for(t)}.mp3"
        if src.exists():
            OUT_DIR.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, OUT_DIR / src.name)
            back.append(t)
        else:
            none.append(t)
    if back:
        write_manifest(manifest_map())
    return back, none


# ————————————— أحكامُ الأذن: تُقيَّد بياناً فلا يتكرّر السؤال —————————————

def load_verdicts() -> dict:
    """ما سمعه المالكُ وحكم فيه: نصّ ← (الحكم، التاريخ). التنبيهُ بعده خبرٌ لا مطالبة."""
    if not VERDICTS.exists():
        return {}
    try:
        return json.loads(VERDICTS.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def record_verdict(text: str, verdict: str) -> None:
    data = load_verdicts()
    data[text] = {"verdict": verdict, "at": TODAY}
    VERDICTS.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


# ————————————— التحقّق الختاميّ: مدةٌ شاذّة، ويتيمٌ، ومبتور —————————————

DURATION_RATIO = 1.7        # مدةٌ تتجاوز هذا × وسيطَ فئتها = شذوذٌ يُبلَّغ (تكرارٌ داخليّ)
DURATION_SHORT = 0.55       # ومدةٌ دونه × الوسيط = مبتورة (نطقٌ ناقص أو قصٌّ زائد)
DURATION_FLOOR = 4          # فئةٌ دون هذا العدد لا وسيطَ لها يُعتدّ به


def duration_outliers(texts: dict) -> list:
    """شواذُّ المدة داخل كلِّ فئة — كاشفٌ رخيص يُشغَّل مع كل تحقّق.

    بلاغُ المالك في اقرأ (٤ أغسطس ٢٠٢٦): «بعض الأصوات منطوقة مرتين» — والملفُّ المكرَّر
    يطول عن نظائره. **والمقارنةُ داخل الفئة** لأنّ التعليمة أطولُ من اسم العدد طبعاً.
    """
    by_cat = {}
    for text, cat in texts.items():
        p = OUT_DIR / f"{key_for(text)}.mp3"
        if p.exists():
            by_cat.setdefault(cat, []).append((text, mp3_duration(p)))
    out = []
    for cat, items in by_cat.items():
        if len(items) < DURATION_FLOOR:
            continue
        med = statistics.median(s for _t, s in items)
        if not med:
            continue
        out += [(t, cat, s, med) for t, s in items
                if s > DURATION_RATIO * med or s < DURATION_SHORT * med]
    return sorted(out, key=lambda r: -r[2] / r[3])


def verify(texts: dict, pending: dict | None = None, min_bytes: int = 1500) -> int:
    """لكل نصٍّ متوقَّعٍ ملفُّه، ولا ملفَ يتيم، ولا ملفَ أصغرَ من الحدّ المعقول."""
    pending = pending or {}
    problems = []
    on_disk = {p.stem for p in OUT_DIR.glob("*.mp3")} if OUT_DIR.exists() else set()
    for t in texts:
        p = OUT_DIR / f"{key_for(t)}.mp3"
        if not p.exists():
            problems.append(f"ناقص: {t}")
        elif p.stat().st_size < min_bytes:
            problems.append(f"صغير جداً ({p.stat().st_size}B): {t}")
    known = {key_for(t) for t in texts} | {key_for(t) for t in pending}
    for orphan in sorted(on_disk - known):
        problems.append(f"يتيم (لا نصَّ له في القائمة): {orphan}.mp3")
    for key in stale_versions({key_for(t): t for t in texts}):
        problems.append(f"بصمة قديمة ({key}.mp3) — أصلحها بـ`--sync-versions` قبل النشر")

    print(f"\nالتحقّق الختامي: {len(texts)} نصاً متوقَّعاً، {len(on_disk)} ملفاً على القرص.")
    verdicts = load_verdicts()
    for text, cat, sec, med in duration_outliers(texts):
        kind = "أطول" if sec > med else "أقصر"
        why = "تكرارٍ داخليّ" if sec > med else "نطقٍ مبتور"
        if text in verdicts:                    # سمعه المالكُ وحكم — خبرٌ لا مطالبة
            print(f"  ℹ شذوذ مدة معلوم ({CATEGORY_AR.get(cat, cat)}): «{text}» {sec:.2f}ث — "
                  f"بحكم المالك ({verdicts[text]['at']}): {verdicts[text]['verdict']}")
            continue
        print(f"  ⚠ شذوذ مدة ({CATEGORY_AR.get(cat, cat)}): «{text}» {sec:.2f}ث "
              f"= {sec / med:.1f}× وسيطَ فئته ({med:.2f}ث) — {kind} من نظائره، "
              f"يُسمَع لاحتمال {why}")
    if pending:
        print(f"  ⏳ {len(pending)} نصاً في القائمة لم يُصرَّف بعد (غيابُها متوقَّع).")
    for p in problems:
        print(f"  ✗ {p}", file=sys.stderr)
    if not problems:
        print("  ✓ كل نصّ متوقَّع له ملفه، ولا يتيم، ولا مبتور، ولا بصمة كاذبة.")
    return len(problems)


# ————————————————————— التصريف —————————————————————

def drain_queue(pool: KeyPool, dry_run: bool = False, limit: int = 0) -> int:
    """تصريفُ القائمة بالأولوية فالأقدمية — والفهرسُ يُكتب بعد كل ملف."""
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    queue = load_queue()
    plan = queue_pending(queue)
    if limit:
        plan = plan[:limit]
    if not plan:
        print("قائمة الانتظار فارغة — لا شيء يُصرَّف.")
        return 0

    by_cat = collections.Counter(e.get("category") for _i, e in plan)
    print(f"قائمة الانتظار: {len(queue_pending(queue))} منتظِراً من {len(queue)}.")
    for c, n in by_cat.most_common():
        print(f"  · {CATEGORY_AR.get(c, c)}: {n} نصاً")

    made = failed = held = 0
    empty_streak = 0
    for n, (_idx, entry) in enumerate(plan, 1):
        text = entry["text"]
        cat = entry.get("category", "instruction")
        label = f"[{n}/{len(plan)}] {text} ({CATEGORY_AR.get(cat, cat)}، أولوية {entry.get('priority', 100)})"

        # **الحارسُ عند البوّابة**: قيدا المنهج قبل أيّ طلب — طلبٌ لا يُنفَق، وأذنٌ لا تُتعَب.
        why = gate_reason(text, cat)
        if why:
            held += 1
            print(f"  ⛔ {label}: {why} — يُحجَز ولا يُطلَب", file=sys.stderr)
            mark_hold(text, why)
            continue
        if entry.get("hold"):
            held += 1
            print(f"  ⏸ {label}: محجوزٌ بحكمٍ سابق ({entry['hold']})", file=sys.stderr)
            continue

        path = OUT_DIR / f"{key_for(text)}.mp3"
        if dry_run:
            print(f"  ⟶ {label} → {path.name}")
            made += 1
            continue
        try:
            pcm, rate, used_key = pool.call(text, style_for(entry))
            archive_prev(path)                  # السلفُ يُحفَظ قبل الكتابة فوقَه
            pcm_to_mp3(pcm, rate, path)
            mark_done(text, MODEL)              # دمجاً لا استبدالاً — وبعد كل نصّ
            write_manifest(manifest_map())      # فهرسٌ صادقٌ ولو توقّف التصريفُ الآن
            made += 1
            empty_streak = 0
            print(f"  ✓ {label} → {path.name} {path.stat().st_size // 1024}KB "
                  f"· {mp3_duration(path):.2f}ث · {used_key}")
        except QuotaExhausted as e:
            print(f"\n  ⏸ {e}  (توقّف عند {n}/{len(plan)} بلا إحراق محاولات)", file=sys.stderr)
            print(f"RETRY_AFTER_SECONDS={e.seconds}")
            break
        except EmptyAudio as e:
            failed += 1
            mark_failed(text, MODEL)
            empty_streak += 1
            print(f"  ✗ {label}: {e}", file=sys.stderr)
            if empty_streak >= EMPTY_STREAK_LIMIT:
                print(f"  ⏸ {EMPTY_STREAK_LIMIT} استجابات متتابعة بلا صوت — "
                      f"يتوقّف صوناً للحصة.", file=sys.stderr)
                break
        except Exception as e:  # noqa: BLE001
            failed += 1
            mark_failed(text, MODEL)
            print(f"  ✗ {label}: [{type(e).__name__}] {e}", file=sys.stderr)

    if dry_run:
        print(f"\nسيُصرَّف: {made}، ومحجوز: {held}. (تجربة جافّة — لم يُطلب شيء)")
        return 0

    write_manifest(manifest_map())
    left = queue_pending(load_queue())
    print(f"\nتم التصريف: {made} مولّد، {failed} فشل، {held} محجوز، {len(left)} ما زال منتظِراً.")
    if pool.used:
        print("  بالمفاتيح: " + "، ".join(f"{k}: {c}" for k, c in pool.used.most_common()))
    return failed


# ————————————————————— فحصُ الفاحص: بلا شبكةٍ ولا مفتاح —————————————————————

def self_test() -> int:
    """دوالُّ خالصةٌ تُجرَّب سالباً — يجدها `test_selftests.mjs` بالجرد فيشغّلها."""
    ok_n = bad_n = 0

    def ok(cond, msg):
        nonlocal ok_n, bad_n
        print(("  ✓ " if cond else "  ✗ ") + msg)
        ok_n, bad_n = ok_n + bool(cond), bad_n + (not cond)

    print("\n— المفتاح: الاشتقاقُ نفسُه في بايثون وجافاسكربت —")
    # القيمةُ محسوبةٌ من sha1 مستقلاً هنا، ويقابلها `keyFor` في `app/js/audio.js`.
    ok(key_for("خَمْسَةْ") == hashlib.sha1("خَمْسَةْ".encode()).hexdigest()[:12],
       f"مفتاحُ «خَمْسَةْ» = {key_for('خَمْسَةْ')} (١٢ خانة من sha1)")
    ok(len(key_for("أَيُّ نَصّ")) == 12 and key_for("أ") != key_for("ب"),
       "ومفتاحان لنصّين مختلفين لا يتساويان")

    print("\n— الحارسُ عند البوّابة: ق١ وق٢ يُمسكان قبل أيّ طلب —")
    ok(has_digit("اِقْرَأْ ٣") and has_digit("رَقْم 3"), "الرقمُ يُمسَك مشرقياً ومغربياً (ق١)")
    ok(not has_digit("ثَلَاثَةْ"), "واسمُ العدد يمرّ")
    ok(has_counted_noun("ثَلَاثُ تُفَّاحَاتْ"), "والمعدودُ المقرونُ بعددٍ يُمسَك (ق٢)")
    ok(has_counted_noun("خَمْسَةُ أَقْلَامْ"), "ومعه صيغةُ المذكّر")
    ok(not has_counted_noun("خَمْسَةْ") and not has_counted_noun("كَمْ صَارَتْ كُلُّهَا؟"),
       "والعددُ المجرد وسؤالُ العدديّة يمرّان")
    ok(quoted_symbols("الْهَمْزَةُ «ء» تُكتَبُ") == ["ء"], "والرمزُ المقتبس يُجرَد")
    ok(gate_reason("ثَلَاثُ تُفَّاحَاتْ").startswith("معدود")
       and gate_reason("خَمْسَةْ") == "", "وعلّةُ الردّ تُسمّى، والسليمُ يمرّ بلا علّة")
    ok(not has_counted_noun("ثَلَاثَةَ عَشَرْ", "number_name")
       and has_counted_noun("ثَلَاثَةَ عَشَرْ", "instruction"),
       "واسمُ العدد المركَّب يمرّ **بفئته**، والنصُّ نفسُه تعليمةً يُمسَك")
    # **والحارسُ يُقاس على القائمة الحيّة**: مدخلٌ واحدٌ يخالف ⇒ فحصٌ أحمر هنا.
    live = [e["text"] for e in load_queue()
            if gate_reason(e["text"], e.get("category", ""))]
    ok(not live, f"وكلُّ ما في القائمة اليومَ يمرّ البوّابة ({len(load_queue())} مدخلاً)"
       + (f" — مخالف: {'، '.join(live[:4])}" if live else ""))

    print("\n— صورةُ النطق: التاءُ المربوطة الساكنة تُنطق هاءً —")
    ok(speech_form("ثَلَاثَةْ") == "ثَلَاثَهْ", "«ثَلَاثَةْ» تُرسَل «ثَلَاثَهْ»")
    ok(speech_form("عَشَرَةْ") == "عَشَرَهْ" and speech_form("سِتَّةْ") == "سِتَّهْ",
       "ومثلُها «عَشَرَةْ» و«سِتَّةْ»")
    ok(speech_form("وَاحِدْ") == "وَاحِدْ" and speech_form("اِثْنَانْ") == "اِثْنَانْ",
       "وما لا تاءَ فيه لا يُمَسّ")
    ok(key_for("ثَلَاثَةْ") != key_for(speech_form("ثَلَاثَةْ")),
       "**والمفتاحُ من المكتوب لا من المنطوق** — فصورةُ النطق لا تُبدّل اسمَ الملف")

    print("\n— تعليمةُ الأداء: لكل فئةٍ واحدة، وكلُّها تنصّ على «مرة واحدة» —")
    ok(set(STYLE) == set(CATEGORY_AR) and len(STYLE) == 4, "الفئاتُ أربعٌ لا خامسَ لها")
    ok(all("مرة واحدة" in s for s in STYLE.values()),
       "وكلُّها تمنع النطقَ مرّتين في التعليمة نفسِها")
    ok(style_for({"category": "number_name"}) == STYLE["number_name"], "والفئةُ تختار تعليمتَها")
    ok(style_for({"category": "number_name", "style_hint": "انطقها هامساً"})
       == "انطقها هامساً: ", "وتوجيهُ المدخل يعلو على افتراض الفئة")

    print("\n— قصُّ الصمت: يقصّ الأطراف ولا يبتلع الصوت —")
    rate = 24000
    quiet = array.array("h", [0] * rate)                  # ثانيةُ صمت
    loud = array.array("h", [12000 if i % 2 else -12000 for i in range(rate)])
    pcm = (quiet + loud + quiet).tobytes()
    cut = trim_pcm(pcm, rate)
    kept = len(cut) / 2 / rate
    ok(0.9 < kept < 1.3, f"ثانيةُ صوتٍ بين ثانيتَي صمتٍ تبقى وحدَها بهامشها ({kept:.2f}ث)")
    ok(len(trim_pcm(quiet.tobytes(), rate)) == len(quiet.tobytes()),
       "وملفٌّ كلُّه صمتٌ لا يُقَصّ إلى لا شيء (صمتٌ تامٌّ عيبٌ آخر يجب أن يظهر)")
    ok(len(trim_pcm(loud.tobytes(), rate)) == len(loud.tobytes()),
       "وصوتٌ بلا صمتٍ يبقى كما هو")

    print("\n— مدةُ mp3 من إطاراتها (بلا مكتبةٍ ولا ffmpeg) —")
    frame = bytes([0xFF, 0xF3, 0x84, 0xC4]) + b"\x00" * 188   # MPEG2 L3 · 24kHz · 64kbps
    tmp = ROOT / "scratch" / "selftest.mp3"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_bytes(frame * 10)
    ok(abs(mp3_duration(tmp) - 0.24) < 0.005, f"عشرةُ إطاراتٍ = ٠٫٢٤ث ({mp3_duration(tmp):.3f})")
    tmp.write_bytes(b"ID3\x03\x00\x00\x00\x00\x00\x0a" + b"\x00" * 10 + frame * 10)
    ok(abs(mp3_duration(tmp) - 0.24) < 0.005, "ووسمُ ID3 في الرأس يُتخطّى بطوله المعلَن")
    ok(len(fingerprint(tmp)) == 8 and fingerprint(tmp) == hashlib.sha1(tmp.read_bytes()).hexdigest()[:8],
       "والبصمةُ أولُ ٨ خاناتٍ من sha1 **البايتات** لا النصّ")
    tmp.unlink()

    print("\n— شواذُّ المدة: تُقاس داخل الفئة لا عبر الفئات —")
    # فئةٌ دون أربعةٍ لا وسيطَ لها؛ وفوقها يُمسَك الطويلُ والمبتور معاً.
    ok(DURATION_FLOOR == 4 and DURATION_RATIO > 1 > DURATION_SHORT,
       "الحدودُ معقولةٌ: أرضيةٌ للوسيط، وسقفٌ للتكرار، وقاعٌ للبتر")

    print("\n— حصةُ اليوم: سقفٌ ذاتيّ لا يعتمد على الخادم —")
    ok(spend_left("مفتاحٌ لا وجودَ له") == DAILY_CAP, f"مفتاحٌ لم يُستعمل يملك حصتَه كاملة ({DAILY_CAP})")
    day, per, tail = False, False, 0
    for body, want_day, want_sec in (
        ('{"error":{"details":[{"violations":[{"quotaId":"GenerateRequestsPerDayPerProject"}]}]}}', True, 0),
        ('{"error":{"details":[{"@type":"type.googleapis.com/google.rpc.RetryInfo",'
         '"retryDelay":"41s"}]}}', False, 41),
    ):
        got_day, got_sec = parse_429(body)
        day = day or (got_day == want_day and want_day)
        per = per or (got_sec == want_sec and want_sec)
        tail += 1
    ok(day, "و429 اليوميّ يُميَّز فلا تُحرَق محاولاتٌ قبل التجدد")
    ok(per, "و429 الدقيقيّ يُقرأ منه زمنُ الانتظار الذي يطلبه الخادم")

    print("\n— الاستجابةُ الفارغة تُميَّز عن الصوت —")
    audio = {"candidates": [{"content": {"parts": [{"inlineData": {
        "mimeType": "audio/L16;rate=24000", "data": base64.b64encode(b"\x01\x02").decode()}}]}}]}
    pcm2, rate2 = extract_audio(audio)
    ok(pcm2 == b"\x01\x02" and rate2 == 24000, "الصوتُ يُستخرج ومعه معدّلُ عيّناته")
    try:
        extract_audio({"candidates": [{"content": {"parts": [{"text": "لا صوت"}]}}]})
        ok(False, "واستجابةٌ بلا صوتٍ تُرمى `EmptyAudio`")
    except EmptyAudio:
        ok(True, "واستجابةٌ بلا صوتٍ تُرمى `EmptyAudio` (فتُعاد مرّتين لا خمساً)")

    print(f"\n{ok_n}/{ok_n + bad_n} تحقّقاً ناجحاً")
    return 1 if bad_n else 0


# ————————————————————————— main —————————————————————————

def main() -> int:
    ap = argparse.ArgumentParser(description="مصرِّفُ القائمة الصوتية لـ«اِحْسِبْ»")
    ap.add_argument("--from-queue", action="store_true", help="تصريفُ القائمة بالأولوية فالأقدمية")
    ap.add_argument("--dry-run", action="store_true", help="عرضُ ما سيُصرَّف بلا أيّ طلب")
    ap.add_argument("--limit", type=int, default=0, help="حدُّ عددِ ما يُصرَّف في هذه الجولة")
    ap.add_argument("--rpm", type=float, default=8.0,
                    help="سقفُ الطلبات في الدقيقة لكل مفتاح (افتراضي ٨ — دون حدّ النموذج)")
    ap.add_argument("--queue-status", action="store_true", help="حالةُ القائمة (بلا شبكة)")
    ap.add_argument("--verify-only", action="store_true", help="التحقّقُ الختاميّ بلا توليد")
    ap.add_argument("--sync-versions", action="store_true",
                    help="إعادةُ اشتقاق البصمات من بايتات القرص — بلا شبكةٍ ولا توليد")
    ap.add_argument("--requeue", metavar="TEXTS", help="إعادةُ نصوصٍ إلى الانتظار بأولوية ١٠")
    ap.add_argument("--requeue-reason", default="عيب مسموع")
    ap.add_argument("--revert", metavar="TEXTS", help="ردُّ نصوصٍ إلى سلفها في scratch/prev")
    ap.add_argument("--verdict", metavar="نص=الحكم",
                    help="تقييدُ حكم الأذن على نصّ (فلا يتكرّر السؤال ولا يُنسى الجواب)")
    ap.add_argument("--self-test", action="store_true", help="فحصُ الفاحص بلا شبكةٍ ولا مفتاح")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    if args.verdict:
        text, _, verdict = args.verdict.partition("=")
        if not verdict:
            sys.exit("الصيغة: --verdict \"النص=الحكم\"")
        record_verdict(text.strip(), verdict.strip())
        print(f"قُيّد حكمُ الأذن على «{text.strip()}»: {verdict.strip()}")
        return 0

    if args.requeue:
        wanted = [t.strip() for t in args.requeue.split(",") if t.strip()]
        n = requeue(wanted, args.requeue_reason)
        print(f"أُعيد {n} نصاً إلى الانتظار بأولوية {URGENT_PRIORITY} ({args.requeue_reason}).")
        return 0 if n else 1

    if args.revert:
        wanted = [t.strip() for t in args.revert.split(",") if t.strip()]
        back, none = revert_prev(wanted)
        print(f"رُدّ {len(back)} نصاً إلى سلفه المحفوظ.")
        for t in none:
            print(f"  ✗ لا سلفَ محفوظ لـ«{t}»", file=sys.stderr)
        return 0 if back else 1

    queue = load_queue()
    done, pending = expected_texts()

    if args.queue_status:
        waiting = queue_pending(queue)
        by_cat = collections.Counter(e.get("category") for _i, e in waiting)
        print(f"قائمة الانتظار ({QUEUE_FILE.relative_to(ROOT)}): "
              f"{len(waiting)} منتظِراً، {len(queue) - len(waiting)} مُصرَّفاً.")
        for c, n in by_cat.most_common():
            print(f"  · {CATEGORY_AR.get(c, c)}: {n}")
        held = [e for e in queue if e.get("hold")]
        for e in held:
            print(f"  ⛔ محجوز: «{e['text']}» — {e['hold']}")
        print(json.dumps([e["text"] for _i, e in waiting], ensure_ascii=False))
        return 0

    if args.sync_versions:
        write_versions(manifest_map())
        return 0

    if args.verify_only:
        return 1 if verify(done, pending) else 0

    if not args.from_queue:
        ap.print_help()
        return 0

    keys = read_keys()
    if not keys and not args.dry_run:
        sys.exit("التصريف يحتاج GEMINI_API_KEY في البيئة أو في .env")
    set_rpm(args.rpm)
    print(f"تصريف القائمة · النموذج {MODEL} · الصوت {VOICE} "
          f"· ≤{args.rpm:g} طلب/دقيقة لكل مفتاح · مفاتيح: {'، '.join(n for n, _v in keys) or 'لا شيء'}")
    failed = drain_queue(KeyPool(keys), args.dry_run, args.limit)
    if args.dry_run:
        return 0
    done, pending = expected_texts()
    return 1 if (failed or verify(done, pending)) else 0


if __name__ == "__main__":
    sys.exit(main())
