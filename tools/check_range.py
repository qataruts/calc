#!/usr/bin/env python3
"""حارسُ الجبهة في «اِحْسِبْ» — **نظيرُ المفكوكية في اقرأ** (`METHOD.md §١٠.١`).

القاعدة الملزمة: **لا تمرينَ يستعمل عدداً أو عمليةً أو رمزاً فوق جبهة محطته**.
وكلُّ محطةٍ تُعلن جبهتَها في `app/js/curriculum.js` (أدنى عدد · أقصى عدد · أقصى رمز ·
العمليات · رموزُ العمليات · أنماطُ العرض)، وكلُّ مولّد تمارين يعلن ما يستهلك —
والفاحصُ يجرد **بالصنف والحدود لا بالتعداد الأعمى**.

خمسةُ أبوابٍ يفحصها:
  ١) **بنيةُ الجبهة**: كلُّ محطةٍ تعلن جبهةً تامّةً بحدودٍ معقولة من معجمٍ معلَن.
  ٢) **تدرّجُ الجبهة**: لا رمزَ قبل موضعه، ولا صفرَ قبل محطته، ولا رمزَ عمليةٍ قبل
     أن تُفعَل العمليةُ بلا رمز، ولا إطارَ عشرةٍ قبل إطار الخمسة.
  ٣) **بواباتُ المعرفة الثلاث** (`METHOD.md §٢.٢`): كمّاً ← عدّاً ← رمزاً، ولا يدخل
     عمليةً عددٌ لم يعبر الثلاث. **وهذا هو لبُّ الحارس**: يُشتقّ من ترتيب الرحلة
     نفسِه، فلا يمرّ عددٌ إلى عمليةٍ ولمّا يُعَدّ ولم يُرسَم رمزُه.
  ٤) **استهلاكُ المولّدات**: ما تعلن وحدةُ التمارين أنّها تستهلكه ⊆ جبهةُ محطاتها.
  ٥) **الجولاتُ المولَّدة**: كلُّ جولةٍ تُولَّد ببذرةٍ تُجرَد ويُقابَل ما فيها بالجبهة.

والبابان ٤ و٥ **نائمان نوماً ذاتياً** (`docs/SEED.md §٥`): لا مولّدَ اليوم، والشرطُ
يُجرَد ولا يُضبَط بيد — فيستيقظان من تلقائهما يومَ تُكتب أوّلُ وحدةِ تمارين (الجلسة ٣).

الاستعمال:
    python3 tools/check_range.py              # الفحص على المنهج الحيّ
    python3 tools/check_range.py --self-test  # فحصُ الفاحص: أيمسك المخالفات؟

يخرج بـ ١ عند وجود خطأ واحد على الأقل، وبـ ٠ إن مرّ الفحص.
"""

import argparse
import copy
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_JS = ROOT / "app" / "js"
CURRICULUM = APP_JS / "curriculum.js"

# وحداتُ البذرة ليست شاشاتِ تمارين — هي المنصةُ نفسُها (نظيرُ `SEED` في `test_nodes.mjs`)
SEED_MODULES = {
    "main.js", "progress.js", "curriculum.js", "ui.js", "audio.js", "review.js", "parent.js",
}

FRONTIER_FIELDS = ("min", "max", "numeral", "ops", "signs", "displays")

# عقدُ المولّد (تلتزم به الجلسات ٣+): وحدةٌ **خالصة** تُستورَد في node بلا متصفّح —
# لا تستورد `main.js` (فهو يمسّ الـDOM وقت التحميل)، وتُعلن ما تستهلك وتفتح جولاتِها
# للجرد. والشاشةُ التي تسجّل نفسَها في الموجِّه تستورد هذه الوحدة، لا العكس.
CONSUMES_DECL = re.compile(r"export\s+const\s+CONSUMES\b")
PROBE_DECL = re.compile(r"export\s+(?:function|const)\s+probeRounds\b")


# ————— قراءةُ المنهج: تُشغَّل الوحدةُ نفسُها ولا يُخمَّن نصُّها —————
#
# **ولِمَ تشغيلٌ لا تعبيرٌ نمطيّ؟** لأنّ الرحلةَ هنا **محسوبة** لا مكتوبة: `sections()`
# تؤلّف المراحلَ والبوابات تأليفاً، فقارئٌ نصّيّ يقرأ البيانات ولا يقرأ الرحلة التي
# يراها الطفل. والوحدةُ محايدةٌ للمتصفّح (لا تمسّ DOM وقت التحميل) فتُستورَد في node.

def load_curriculum() -> dict:
    js = f"""
    const m = await import({json.dumps(CURRICULUM.as_uri())});
    console.log(JSON.stringify({{
      ops: m.OPS, signs: m.SIGNS, displays: m.DISPLAYS, scenes: m.SCENES,
      skipSteps: m.SKIP_STEPS, shapes: m.SHAPES, world: m.SHAPES_WORLD, partMin: m.PART_MIN,
      levelMax: m.LEVEL_MAX, subitizeMax: m.SUBITIZE_MAX, countMax: m.COUNT_MAX,
      stages: m.STAGES.map((s) => ({{ id: s.id, count: s.stations.length }})),
      gates: m.GATES,
      stations: m.stations(),
      sections: m.sections().map((s) => ({{
        kind: s.kind, id: s.id,
        nodes: (s.nodes || []).map((n) => ({{
          id: n.id, type: n.type, part: n.part, frontier: n.frontier || null,
        }})),
      }})),
    }}));
    """
    run = subprocess.run(["node", "--input-type=module", "-e", js],
                         capture_output=True, text=True)
    if run.returncode != 0:
        sys.exit(f"تعذّرت قراءة المنهج من {CURRICULUM.name}:\n{run.stderr.strip()}")
    return json.loads(run.stdout)


def parsed_all(data: dict) -> list:
    """حارسُ المحلّل: **لا محطةَ في الملفّ خارج الرحلة**.

    محطةٌ تُكتب في `STAGES` ولا تصل إلى `sections()` بيانٌ ميّت: لا تظهر للطفل ولا
    يفحصها أحد. فيُقابَل عددُ الجبهات المكتوبة في المصدر بعدد المحطات التي أرجعتها
    الوحدة — والفرقُ خطأ لا تنبيه.
    """
    written = len(re.findall(r"\bfrontier:\s*\{", CURRICULUM.read_text(encoding="utf-8")))
    if written != len(data["stations"]):
        return [f"[المحلّل] في المصدر {written} جبهةً مكتوبة، وفي الرحلة "
                f"{len(data['stations'])} محطة — محطةٌ لا تصل إلى `sections()` بيانٌ ميّت"]
    return []


# ————— أدواتٌ صغيرة —————

def concepts_of(station: dict) -> set:
    """مفاهيمُ المحطة من مفاتيح ليتنر — الحقلُ الأول من (مفهوم × مدى × تمرين)."""
    return {k.split("|")[0] for k in station.get("skills") or [] if k}


def numeric(text: str):
    """مدى المفتاح عدداً، أو None إن كان وصفياً (`abab`، `length`، `time`)."""
    return int(text) if str(text).lstrip("-").isdigit() else None


def label_of(station: dict) -> str:
    return f"[{station['id']}] «{station.get('title', '')}»"


# ————— ١) بنيةُ الجبهة —————

def frontier_errors(stations: list, vocab: dict) -> list:
    """كلُّ محطةٍ تعلن جبهةً تامّةً بحدودٍ معقولة من المعجم المُعلَن في المنهج."""
    errors = []
    signs_of = vocab["signs"]                 # عملية ← علامتُها
    known_signs = set(signs_of.values())
    seen = {}

    for station in stations:
        label = label_of(station)
        if station["id"] in seen:
            errors.append(f"{label}: معرّفٌ مكرَّر (محطتان بمعرّفٍ واحد ⇒ نجمةٌ تُكتب في غير موضعها)")
        seen[station["id"]] = True
        for field in ("type", "part", "title"):
            if not station.get(field):
                errors.append(f"{label}: بلا {field}")

        f = station.get("frontier")
        if not isinstance(f, dict):
            errors.append(f"{label}: بلا جبهةٍ معلَنة — ولا محطةَ بلا جبهة (`METHOD.md §١٠.١`)")
            continue
        missing = [k for k in FRONTIER_FIELDS if k not in f]
        extra = [k for k in f if k not in FRONTIER_FIELDS]
        if missing:
            errors.append(f"{label}: جبهةٌ ناقصةُ الحقول: {'، '.join(missing)}")
            continue
        if extra:
            errors.append(f"{label}: في الجبهة حقلٌ لا يعرفه الحارس: {'، '.join(extra)}")

        if f["min"] not in (0, 1):
            errors.append(f"{label}: أدنى عددٍ {f['min']} — ولا أدنى إلا ١ أو ٠ (الصفرُ بعد محطته)")
        if not isinstance(f["max"], int) or f["max"] < 1:
            errors.append(f"{label}: أقصى عددٍ غيرُ صحيح: {f['max']}")
        elif f["max"] > vocab["levelMax"]:
            errors.append(f"{label}: أقصى عددٍ {f['max']} فوق سقف المستوى "
                          f"({vocab['levelMax']}) — المئةُ لـ«اِحْسِبْ ٢» (ق٣)")
        elif f["min"] > f["max"]:
            errors.append(f"{label}: أدنى عددٍ فوق أقصاه ({f['min']} > {f['max']})")

        if f["numeral"] is not None:
            if not isinstance(f["numeral"], int) or f["numeral"] < 0:
                errors.append(f"{label}: أقصى رمزٍ غيرُ صحيح: {f['numeral']}")
            elif f["numeral"] > f["max"]:
                errors.append(f"{label}: أقصى رمزٍ {f['numeral']} فوق أقصى كمّها "
                              f"{f['max']} — الرمزُ تسميةٌ لكمٍّ حاضر (`METHOD.md §٢.١`)")

        bad_ops = [o for o in f["ops"] if o not in vocab["ops"]]
        if bad_ops:
            errors.append(f"{label}: عمليةٌ خارج معجم المنهج: {'، '.join(bad_ops)}")
        bad_signs = [s for s in f["signs"] if s not in known_signs]
        if bad_signs:
            errors.append(f"{label}: رمزُ عمليةٍ خارج معجم المنهج: {'، '.join(bad_signs)}")
        orphan = [s for s in f["signs"] if s in known_signs
                  and s not in {signs_of[o] for o in f["ops"] if o in signs_of}]
        if orphan:
            errors.append(f"{label}: رمزُ عمليةٍ بلا عمليتِه: {'، '.join(orphan)} "
                          "— لا علامةَ لِما لا يُفعَل")

        if not f["displays"]:
            errors.append(f"{label}: بلا نمطِ عرضٍ واحد — بمَ تُعرَض الكمية؟")
        bad_shows = [d for d in f["displays"] if d not in vocab["displays"]]
        if bad_shows:
            errors.append(f"{label}: نمطُ عرضٍ خارج معجم المصيِّر: {'، '.join(bad_shows)}")

        # المقياس: مفاتيحُ ليتنر، أو إعفاءٌ مكتوبٌ بسببه — ولا ثالث
        skills = station.get("skills") or []
        exempt = station.get("exempt") or ""
        if bool(skills) == bool(exempt):
            errors.append(f"{label}: {'قياسٌ وإعفاءٌ معاً' if skills else 'بلا قياسٍ ولا إعفاء'} "
                          "— لكلِّ محطةٍ مفاتيحُها **أو** إعفاؤها المكتوب")
        if exempt and len(exempt) <= 40:
            errors.append(f"{label}: سببُ الإعفاء كلمةٌ تُكتب للمرور لا جملةٌ تُقرأ")
        for key in skills:
            parts = key.split("|")
            if len(parts) != 3 or not all(parts):
                errors.append(f"{label}: مفتاحٌ ليس (مفهوم × مدى × تمرين): «{key}»")
                continue
            span = numeric(parts[1])
            if span is not None and isinstance(f["max"], int) and span > f["max"]:
                errors.append(f"{label}: المفتاح «{key}» مداه {span} فوق جبهة محطته ({f['max']})")
            if span is not None and span < f["min"]:
                errors.append(f"{label}: المفتاح «{key}» مداه {span} دون أدنى جبهته ({f['min']})")
    return errors


# ————— ١ب) مشاهدُ القياس: لكلِّ رمزٍ رتبتُه، ولا رتبتين متساويتين —————
#
# **حكمُ المدير في مصدر الجواب** (`REVIEW_SCENES.md §٦`، و`METHOD.md §٣` المعدَّل):
# مشهدُ الثِّقَل والزمن أشياءُ مختلفة بمقدارٍ واحد، **والحكمُ رتبةٌ معلَنة في بيانات
# المنهج** يُقابَل بها الرمزُ المقروء من الـDOM. وهو تبديلٌ في مصدر الحكم من هندسةٍ
# تُحسَب إلى بيانٍ يُقَرّ — فشرطاه هنا صريحان:
#
#   • **كلُّ رمزِ مشهدٍ له رتبة**: رمزٌ يُرسَم في مشهدٍ ولا رتبةَ له في `SCENES`
#     يجعل الشاشةَ تحكم بـ`null` — تمرّ الجولةُ صامتةً بجوابٍ لا معنى له.
#   • **ولا رتبتين متساويتين في سؤال**: الحدُّ القائم في المصيِّر بمعناه الجديد —
#     شيئان سواءٌ لا يُسأل عن أثقلهما، ولا عن أوّلهما.
#
# ويُفحص الشرطان في موضعين: **جدولُ المنهج نفسُه** (بنيةً)، و**كلُّ جولةٍ مولَّدة**
# (بجردها في `usedOf` — `scenes`).

def scene_table_errors(scenes: dict) -> list:
    """بنيةُ جدول `SCENES`: مشهدٌ من شيئين فصاعداً، ولكلِّ رمزٍ اسمٌ ورتبةٌ مفردة."""
    errors = []
    if not scenes:
        return ["[المشاهد] لا مشهدَ قياسٍ واحداً في المنهج — والمحطتان ٨·٣ و٨·٤ تُقارنان أشياء"]
    for face, table in scenes.items():
        if not table:
            errors.append(f"[المشاهد · {face}] وجهٌ بلا مشهدٍ واحد")
        for scene in table:
            at = f"[المشاهد · {face} · {scene.get('id', '؟')}]"
            items = scene.get("items") or []
            if len(items) < 2:
                errors.append(f"{at}: {len(items)} شيئاً — والقياسُ مقارنة، والواحدُ لا يُقارَن")
                continue
            ranks = [i.get("rank") for i in items]
            if any(not isinstance(r, int) for r in ranks):
                errors.append(f"{at}: رمزٌ بلا رتبةٍ صحيحة — والرتبةُ هي الحكم")
                continue
            if sorted(ranks) != list(range(1, len(items) + 1)):
                errors.append(f"{at}: الرتبُ {ranks} وليست ١..{len(items)} كلَّها مرّةً واحدة "
                              "— ولا رتبتين متساويتين في سؤال")
            for item in items:
                if not item.get("glyph"):
                    errors.append(f"{at}: شيءٌ بلا رمزٍ مرسوم")
                if not item.get("name") or len(item["name"]) < 3:
                    errors.append(f"{at}: «{item.get('glyph', '؟')}» بلا اسمٍ يُراجَع")
    seen = {}
    for face, table in scenes.items():
        for scene in table:
            for item in scene.get("items") or []:
                key = (face, item.get("glyph"))
                if key in seen:
                    errors.append(f"[المشاهد · {face}] الرمز «{item.get('glyph')}» في مشهدين "
                                  "من وجهٍ واحد — فرتبتُه تختلف باختلاف مشهده")
                seen[key] = True
    return errors


def scene_usage_errors(label: str, used: dict, scenes: dict) -> list:
    """جولةٌ ترسم مشهدَ أشياء: كلُّ رمزٍ له رتبةٌ في وجهه، ولا رتبتين متساويتين فيها."""
    errors = []
    for scene in used.get("scenes", []):
        face = scene.get("face")
        table = scenes.get(face)
        if table is None:
            errors.append(f"{label}: مشهدٌ لوجهٍ لا مشاهدَ له في المنهج («{face}»)")
            continue
        ranks = {}
        for glyph in scene.get("items", []):
            rank = next((i["rank"] for s in table for i in s["items"] if i["glyph"] == glyph), None)
            if rank is None:
                errors.append(f"{label}: الرمز «{glyph}» في مشهد «{face}» بلا رتبةٍ معلَنة "
                              "— والحكمُ رتبةٌ تُقرأ من المنهج (`REVIEW_SCENES.md §٦`)")
                continue
            if rank in ranks:
                errors.append(f"{label}: «{glyph}» و«{ranks[rank]}» برتبةٍ واحدة ({rank}) "
                              "في سؤالٍ واحد — ولا يُسأل عن أثقل سواءين")
            ranks[rank] = glyph
    return errors


# ————— ١د) الأشكالُ الأولى: لكلِّ شكلٍ اسمٌ وأضلاعٌ وموضع (الجلسة ش) —————
#
# المرحلة ٩ **مجالٌ لا مدى** (`METHOD.md §٣`): لا تمسّ ق٣ بحرف، وإنما تدخل الرحلةَ
# بيانات: أربعةُ أشكالٍ لكلٍّ اسمٌ يُنطَق وعددُ أضلاعٍ يُدرَّس وموضعُ تقديمٍ في الرحلة.
# وثلاثةُ شروطٍ تحرسها هنا:
#
#   • **لكلِّ شكلٍ اسمٌ يُنطَق وأضلاعٌ معلَنة وموضعٌ من محطات المرحلة**: شكلٌ يُقدَّم
#     في محطةٍ لا وجودَ لها لا يظهر لطفلٍ أبداً، وشكلٌ بلا اسمٍ لا يُسمَّى في خطأٍ
#     ولا في نمذجة.
#   • **وأشياءُ العالم مبنيّةٌ من أشكالٍ معلومة**: جزءٌ بصنفٍ لا يعرفه المنهجُ لا
#     رسمَ له، **وصندوقُ المربّع والدائرة مربَّع** (وإلّا سُمّي المرسومُ باسم غيره)،
#     **وصندوقُ المستطيل مختلفُ الضلعين** — وهي كذبةُ رسمٍ أشدُّ من كذبة الاسم.
#   • **ولكلِّ جزءٍ أرضيّةُ إصبع** (`PART_MIN`): الجزءُ هدفُ لمسٍ يُسأل عنه، فلا يصغر
#     عن رُبع الصندوق — ولو صغر لَبلغ على شاشة الهاتف دون عتبة اللمس (`METHOD.md §١١`).

def shape_table_errors(shapes: list, world: list, parts_min: float, stations: list) -> list:
    """بنيةُ جدولَي الأشكال: اسمٌ وأضلاعٌ وموضعٌ لكلٍّ، وأشياءُ العالم من أشكالها."""
    errors = []
    if not shapes:
        return ["[الأشكال] لا شكلَ واحداً في المنهج — والمرحلة ٩ تدرّس أربعة"]
    known = {s["id"] for s in shapes}
    parts_of = {s["part"] for s in stations if s["type"] == "shape"}
    seen = set()
    for shape in shapes:
        at = f"[شكل {shape.get('id', '؟')}]"
        if shape["id"] in seen:
            errors.append(f"{at}: معرّفٌ مكرَّر")
        seen.add(shape["id"])
        if not shape.get("name") or len(shape["name"]) < 3:
            errors.append(f"{at}: بلا اسمٍ يُنطَق — والاسمُ يُقال في النمذجة وفي الخطأ")
        if not isinstance(shape.get("sides"), int) or shape["sides"] < 0:
            errors.append(f"{at}: عددُ أضلاعٍ غيرُ صحيح ({shape.get('sides')})")
        elif shape["sides"] == 1 or shape["sides"] == 2:
            errors.append(f"{at}: {shape['sides']} ضلعاً — ولا شكلَ بضلعٍ ولا بضلعين")
        if parts_of and shape.get("at") not in parts_of:
            errors.append(f"{at}: يُقدَّم في محطةٍ لا وجودَ لها («{shape.get('at')}») "
                          "— فلا يراه طفلٌ أبداً")
    if not any(s["sides"] == 0 for s in shapes):
        errors.append("[الأشكال] لا شكلَ بلا أضلاع — والدائرةُ تُميَّز بأنها لا ضلعَ لها")

    if not world:
        errors.append("[عالم الأشكال] لا شيءَ واحداً — ومحطةُ «الأشكال حولنا» تسأل عنها")
    for thing in world:
        at = f"[شيء {thing.get('id', '؟')}]"
        if not thing.get("name"):
            errors.append(f"{at}: بلا اسمٍ يُراجَع")
        parts = thing.get("parts") or []
        if len(parts) < 2:
            errors.append(f"{at}: {len(parts)} جزءاً — والسؤالُ «أين الشكل» يقتضي شكلين فأكثر")
        kinds = [p.get("shape") for p in parts]
        alien = [k for k in kinds if k not in known]
        if alien:
            errors.append(f"{at}: جزءٌ بصنفٍ لا يعرفه المنهج ({'، '.join(map(str, alien))})")
        if len(set(kinds)) < 2:
            errors.append(f"{at}: أجزاؤه شكلٌ واحد مكرَّر — فلا مشتّتَ في سؤاله")
        for part in parts:
            box = f"{at} · {part.get('shape')}"
            w, h = part.get("w"), part.get("h")
            if not all(isinstance(v, (int, float)) for v in (part.get("x"), part.get("y"), w, h)):
                errors.append(f"{box}: موضعٌ ليس عدداً")
                continue
            if part["x"] < 0 or part["y"] < 0 or part["x"] + w > 1 + 1e-9 \
                    or part["y"] + h > 1 + 1e-9:
                errors.append(f"{box}: يخرج عن صندوق الشيء (نسبةً من ٠ إلى ١)")
            if min(w, h) < parts_min - 1e-9:
                errors.append(f"{box}: أصغرُ بُعديه {min(w, h)} دون {parts_min} — "
                              "وهو هدفُ لمسٍ يُسأل عنه (`METHOD.md §١١`)")
            if part.get("shape") in ("square", "circle") and abs(w - h) > 1e-9:
                errors.append(f"{box}: صندوقُه ليس مربّعاً ({w}×{h}) — "
                              "فيُرسَم مستطيلاً ويُسمّى مربّعاً")
            if part.get("shape") == "rect" and abs(w - h) <= 1e-9:
                errors.append(f"{box}: صندوقُه مربّعٌ ({w}×{h}) — فيُرسَم مربّعاً ويُسمّى مستطيلاً")

    # **ولكلِّ شكلٍ شيءٌ يسكنه**: شكلٌ لا يوجد في شيءٍ من عالم الطفل لا يُسأل عنه في
    # محطة «الأشكال حولنا» أبداً — تدريسٌ في نصف الرحلة وسكوتٌ في نصفها.
    homeless = [s["id"] for s in shapes
                if not any(p["shape"] == s["id"] for t in world for p in t["parts"])]
    if homeless:
        errors.append(f"[عالم الأشكال] شكلٌ لا يسكن شيئاً من عالم الطفل: {'، '.join(homeless)} "
                      "— فلا يُسأل عنه في «الأشكال حولنا»")
    return errors


def shape_usage_errors(label: str, used: dict, shapes: list, station: dict) -> list:
    """جولةٌ ترسم أشكالاً: **لا شكلَ قبل موضعه** — كما لا رمزَ قبل موضعه."""
    drawn = used.get("shapes") or []
    if not drawn:
        return []
    known = {s["id"]: s for s in shapes}
    if station["type"] != "shape":
        return [f"{label}: يرسم شكلاً هندسياً ({'، '.join(drawn)}) ومحطتُه ليست محطةَ أشكال"]
    order = []
    for shape in shapes:
        if shape["at"] not in order:
            order.append(shape["at"])
    at = order.index(station["part"]) if station["part"] in order else len(order)
    allowed = {s["id"] for s in shapes if order.index(s["at"]) <= at}
    errors = []
    for kind in drawn:
        if kind not in known:
            errors.append(f"{label}: شكلٌ لا يعرفه المنهج («{kind}»)")
        elif kind not in allowed:
            errors.append(f"{label}: يرسم «{kind}» ولم يُقدَّم بعد (موضعُه "
                          f"«{known[kind]['at']}») — ولا شكلَ قبل موضعه")
    return errors


# ————— ١ج) قفزاتُ العدّ: كلُّ قفزةٍ تنتهي عند سقف المستوى (الجلسة ك) —————
#
# «اِعْدُدْ قَفْزاً» و«النمطُ العدديّ» يقرآن قفزاتهما من `SKIP_STEPS` في المنهج
# (`METHOD.md §٣` المعدَّل: بالاثنين والخمسة والعشرة **حتى العشرين**). وشرطُ صدقها
# حسابيّ: **كلُّ قفزةٍ تقسم سقفَ المستوى** فتقف عنده تماماً — فقفزةٌ لا تقسمه (كالثلاثة)
# تُجاوزه بخانةٍ أو تنتهي دونه، وأيُّهما وقع خرج الطفلُ عن ق٣ أو عن الدرس. **ولا قفزةَ
# دون الاثنين** (العدُّ فرادى ليس قفزاً) **ولا فوق نصفه** (قفزتان لا تُريان إيقاعاً).

def skip_errors(steps: list, level_max: int) -> list:
    errors = []
    if not steps:
        return ["[القفزات] لا قفزةَ عدٍّ واحدة في المنهج — ومحطتا القفز تقرآن منها"]
    seen = set()
    for step in steps:
        at = f"[القفزات · {step}]"
        if not isinstance(step, int) or isinstance(step, bool) or step < 2:
            errors.append(f"{at}: ليست عدداً صحيحاً من اثنين فصاعداً — والعدُّ فرادى ليس قفزاً")
            continue
        if step in seen:
            errors.append(f"{at}: قفزةٌ مكرَّرة في القائمة")
        seen.add(step)
        if step > level_max // 2:
            errors.append(f"{at}: فوق نصف سقف المستوى ({level_max}) — قفزتان لا تُريان إيقاعاً")
        if level_max % step:
            errors.append(f"{at}: لا تقسم سقفَ المستوى ({level_max}) — فتجاوزه أو تقف دونه، "
                          "والقفزةُ تنتهي عند السقف تماماً (ق٣)")
    return errors


# ————— ٢) تدرّجُ الجبهة عبر الرحلة —————

def order_errors(stations: list, vocab: dict) -> list:
    """ما لا يجوز أن يسبق موضعَه — مشتقٌّ من ترتيب الرحلة لا مكتوبٌ بيد."""
    errors = []
    firsts = {}     # نمطُ عرضٍ ← موضعُ أول محطةٍ تُتيحه

    for i, station in enumerate(stations):
        for show in station["frontier"].get("displays", []):
            firsts.setdefault(show, i)

    # أ) الصفر: لا ينكص أدنى العدد، وأوّلُ محطةٍ تبلغه محطةُ رمزٍ بعد العشرة
    zero_at = next((i for i, s in enumerate(stations) if s["frontier"]["min"] == 0), None)
    if zero_at is not None:
        late = [label_of(s) for s in stations[zero_at:] if s["frontier"]["min"] != 0]
        if late:
            errors.append(f"[الصفر] عاد أدنى العدد إلى ١ بعد أن بلغ ٠: {late[0]} "
                          "— الجبهةُ لا تنكص")
        opener = stations[zero_at]
        if "numeral" not in concepts_of(opener):
            errors.append(f"{label_of(opener)}: أولُ محطةٍ تبلغ الصفر وليست محطةَ رمز "
                          "— الصفرُ يُقدَّم رمزاً لكميةِ «لا شيء» (`METHOD.md §٢.٦`)")
        before = [s for s in stations[:zero_at]
                  if (s["frontier"]["numeral"] or 0) >= vocab["countMax"]]
        if not before:
            errors.append(f"{label_of(opener)}: الصفرُ قبل العشرة — وهو متأخرٌ عمداً "
                          "بعدها (`METHOD.md §٢.٦`)")

    # ب) الرمز: لا رمزَ قبل أوّل محطةِ رمز، ولا نكوصَ إلى «بلا رمز» بعدها
    numeral_at = next((i for i, s in enumerate(stations)
                       if s["frontier"]["numeral"] is not None), None)
    if numeral_at is not None:
        blind = [label_of(s) for s in stations[numeral_at:] if s["frontier"]["numeral"] is None]
        if blind:
            errors.append(f"[الرمز] عادت الرحلةُ إلى «بلا رمز» بعد تقديمه: {blind[0]}")
    else:
        errors.append("[الرمز] لا محطةَ رمزٍ في الرحلة كلها — والمستوى يقرأ ٠–١٠ رمزاً")

    # ج) رمزُ العملية: أوّلُ عمليةٍ في الرحلة تُفعَل **بلا رمز** (`METHOD.md §٣` — ٦·١)
    op_at = next((i for i, s in enumerate(stations) if s["frontier"]["ops"]), None)
    if op_at is None:
        errors.append("[العمليات] لا محطةَ عمليةٍ في الرحلة — والمستوى يجمع ويطرح ضمن ٢٠")
    elif stations[op_at]["frontier"]["signs"]:
        errors.append(f"{label_of(stations[op_at])}: أوّلُ عمليةٍ في الرحلة ومعها رمزُها "
                      "— والرمزُ تسميةٌ لِما فُعِل قبله (آلةُ الجمع بلا رمز، `METHOD.md §٣`)")

    # د) الجسور بلا عمليةٍ ولا رمز (`METHOD.md §٣` المرحلة ٥)
    for station in stations:
        if "bond" in concepts_of(station) and (station["frontier"]["ops"]
                                               or station["frontier"]["signs"]):
            errors.append(f"{label_of(station)}: محطةُ جسورٍ فيها عمليةٌ أو رمزُها — "
                          "جزء-جزء-كلّ **قبل** رمزَي + و− (`METHOD.md §٣`)")

    # هـ) أنماطُ العرض: النردُ قبل المبعثر، وإطارُ الخمسة قبل العشرة، والعشرةُ قبل الإطارين
    for later, earlier, why in (
        ("scatter", "dice", "أنماطُ النرد القياسية أولاً ثم التوزيعُ المبعثر (`METHOD.md §٢.٣`)"),
        ("ten-frame", "five-frame", "إطارُ الخمسة قبل إطار العشرة (`METHOD.md §٣` — ٣·٣ ثم ٣·٥)"),
        ("two-frames", "ten-frame", "الإطارُ الواحد قبل الإطارين (`METHOD.md §٣` — المرحلة ٧)"),
    ):
        if later in firsts and (earlier not in firsts or firsts[earlier] >= firsts[later]):
            errors.append(f"[أنماط العرض] «{later}» يظهر قبل «{earlier}» — {why}")

    # و) العشرون لا تدخل إلا في محطةِ بنائها حزمةً وآحاداً
    over = next((s for s in stations if s["frontier"]["max"] > vocab["countMax"]), None)
    if over is not None and "teen" not in concepts_of(over):
        errors.append(f"{label_of(over)}: أوّلُ محطةٍ تتجاوز {vocab['countMax']} وليست "
                      "محطةَ بناءٍ (عشرةٌ وآحاد) — `METHOD.md §٣` المرحلة ٧")
    return errors


# ————— ٣) بواباتُ المعرفة الثلاث: كمّاً ← عدّاً ← رمزاً ← عمليةً —————

def gates_errors(stations: list, vocab: dict) -> list:
    """**لبُّ الحارس** (`METHOD.md §٢.٢`): لا يدخل عمليةً عددٌ لم يعبر بواباته.

    ثلاثةُ شروطٍ تُشتقّ من ترتيب الرحلة نفسِه، فلا يُكتب أيٌّ منها بيد:
      • **عدٌّ بعد كمّ**: ما يُعَدّ ضمن حدِّ التقدير الفوري (٥) قد قُدِّر قبله بنظرة.
        وفوق الحدّ لا شرط: التقديرُ الفوريّ لا يمتدّ بحثياً (`METHOD.md §٢.٣`).
      • **رمزٌ بعد عدّ**: ما يُرسَم رمزُه قد عُدّ قبله. وفوق العشرة لا شرط: الأعدادُ
        هناك **تُبنى** حزمةً وآحاداً ولا تُعَدّ فرادى (المرحلة ٧).
      • **عمليةٌ بعد رمز**: ما يدخل عمليةً قد قُرئ رمزُه قبلها.
    """
    errors = []
    for i, station in enumerate(stations):
        f = station["frontier"]
        before = stations[:i]
        label = label_of(station)

        if "count" in concepts_of(station):
            need = min(f["max"], vocab["subitizeMax"])
            if not any("subitize" in concepts_of(s) and s["frontier"]["max"] >= need
                       for s in before):
                errors.append(f"{label}: يُعَدّ إلى {f['max']} ولم يُقدَّر {need} بنظرةٍ قبله "
                              "— بوابةُ الكمّ قبل بوابة العدّ (`METHOD.md §٢.٢`)")

        if f["numeral"] is not None:
            need = min(f["numeral"], vocab["countMax"])
            if not any("count" in concepts_of(s) and s["frontier"]["max"] >= need
                       for s in before):
                errors.append(f"{label}: يعرض رمزَ {f['numeral']} ولم يُعَدّ {need} قبله "
                              "— بوابةُ العدّ قبل بوابة الرمز (`METHOD.md §٢.٢`)")

        if f["ops"]:
            if not any((s["frontier"]["numeral"] or -1) >= f["max"] for s in before):
                errors.append(f"{label}: يُدخِل {f['max']} في عمليةٍ ولم يُقرَأ رمزُه قبلها "
                              "— ولا يدخل عمليةً إلا عددٌ عبر الثلاث (`METHOD.md §٢.٢`)")
    return errors


# ————— عقدُ الرحلة: البوابات في مواضعها، والعقدُ محطةٌ أو بوابة —————

def journey_errors(data: dict) -> list:
    errors = []
    stage_ids = [s["id"] for s in data["stages"]]
    gates = data["gates"]

    # «البواباتُ **الثلاث**» نصُّ `METHOD.md §٥` — ثابتُ منهجٍ لا عددٌ محصيّ
    if len(gates) != 3:
        errors.append(f"[البوابات] في الرحلة {len(gates)} بوابة، والمنهج ثلاث (`METHOD.md §٥`)")
    for gate in gates:
        if gate["after"] not in stage_ids:
            errors.append(f"[بوابة {gate['id']}] موضعُها بعد مرحلةٍ مجهولة: «{gate['after']}»")
        for field in ("title", "hint", "face"):
            if not gate.get(field):
                errors.append(f"[بوابة {gate['id']}]: بلا {field}")
        # **ولكلِّ بوابةٍ مدَاها المعلَن** (`METHOD.md §٣`): الأولى من المراحل ١–٤،
        # والثانية من ٥–٦، والثالثة من الرحلة كلها — فمدىً مجهولٌ أو يبدأ بعد موضعها
        # يجعل جلستَها فارغةً أو من غير ما تحرسه، ولا يظهر ذلك في شاشة.
        start = gate.get("from")
        if start not in stage_ids:
            errors.append(f"[بوابة {gate['id']}] مدىً يبدأ من مرحلةٍ مجهولة: «{start}» "
                          "— ولكلِّ بوابةٍ ممَّ تسأل (`METHOD.md §٣`)")
        elif gate["after"] in stage_ids and stage_ids.index(start) > stage_ids.index(gate["after"]):
            errors.append(f"[بوابة {gate['id']}] مدىً يبدأ بعد موضعها "
                          f"(«{start}» بعد «{gate['after']}») — فلا مهارةَ تسأل عنها")

    for stage in data["stages"]:
        if not stage["count"]:
            errors.append(f"[{stage['id']}] مرحلةٌ بلا محطة")

    gate_nodes, station_nodes = [], []
    for section in data["sections"]:
        if not section["nodes"]:
            errors.append(f"[{section['id']}] قسمٌ بلا عقدة")
        for node in section["nodes"]:
            (gate_nodes if node["type"] == "gate" else station_nodes).append(node)
            if node["id"] != f"{node['type']}:{node['part']}":
                errors.append(f"[{node['id']}] المعرّفُ ليس «<النوع>:<الجزء>»")

    for node in gate_nodes:
        if node["frontier"] is not None:
            errors.append(f"[{node['id']}] للبوابة جبهة — والبوابةُ **تقيس ولا تدرّس**: "
                          "مادّتُها ما مضى، وجبهتُها جبهةُ ما قبلها")
    if len(gate_nodes) != len(gates):
        errors.append(f"[البوابات] {len(gates)} في `GATES` و{len(gate_nodes)} عقدةً في الرحلة")

    known = {s["id"] for s in data["stations"]}
    stray = [n["id"] for n in station_nodes if n["id"] not in known]
    if stray:
        errors.append(f"[الرحلة] عقدةٌ على الخريطة ليست محطةً في المنهج: {'، '.join(stray)}")
    unseen = known - {n["id"] for n in station_nodes}
    if unseen:
        errors.append(f"[الرحلة] محطةٌ في المنهج لا تصل إلى الخريطة: {'، '.join(sorted(unseen))}")
    return errors


# ————— ٤+٥) المولّدات: ما تستهلكه ⊆ جبهةُ محطتها —————

def usage_errors(label: str, used: dict, frontier: dict) -> list:
    """**الحكمُ الواحد** الذي يُطبَّق على كل جولةٍ وكل إعلانِ استهلاك.

    يُجرَد بالصنف والحدود: أعدادٌ · رموزٌ · عملياتٌ · رموزُ عمليات · أنماطُ عرض —
    وكلٌّ يُقابَل بحدّه في الجبهة. وهو دالّةٌ خالصة، فيُجرَّب سالباً بلا مولّدٍ ولا متصفّح.
    """
    errors = []
    for n in used.get("numbers", []):
        if not isinstance(n, int) or n < frontier["min"] or n > frontier["max"]:
            errors.append(f"{label}: العدد {n} خارج جبهته "
                          f"[{frontier['min']}..{frontier['max']}]")
    for n in used.get("numerals", []):
        if frontier["numeral"] is None:
            errors.append(f"{label}: يعرض رمزَ {n} ومحطتُه بلا رمزٍ البتّة")
        elif not isinstance(n, int) or n < frontier["min"] or n > frontier["numeral"]:
            errors.append(f"{label}: الرمز {n} فوق أقصى رمز محطته ({frontier['numeral']})")
    for op in used.get("ops", []):
        if op not in frontier["ops"]:
            errors.append(f"{label}: العملية «{op}» ليست من عمليات محطته "
                          f"({'، '.join(frontier['ops']) or 'لا عملية'})")
    for sign in used.get("signs", []):
        if sign not in frontier["signs"]:
            errors.append(f"{label}: رمزُ العملية «{sign}» ليس من رموز محطته "
                          f"({'، '.join(frontier['signs']) or 'لا رمز'})")
    for show in used.get("displays", []):
        if show not in frontier["displays"]:
            errors.append(f"{label}: نمطُ العرض «{show}» ليس من أنماط محطته "
                          f"({'، '.join(frontier['displays'])})")
    return errors


def generator_modules() -> list:
    """جردُ وحدات التمارين التي تُعلن عقدَ المولّد — **الجردُ لا رايةٌ تُضبط بيد**."""
    out = []
    for path in sorted(APP_JS.glob("*.js")):
        if path.name in SEED_MODULES:
            continue
        src = path.read_text(encoding="utf-8")
        if CONSUMES_DECL.search(src) or PROBE_DECL.search(src):
            out.append(path)
    return out


def probe(modules: list, stations: list, scenes: dict, shapes: list) -> tuple:
    """يستورد المولّدات في node ويجرد إعلانَها وجولاتِها. يُرجِع (أخطاء، محصيّ)."""
    if not modules:
        return [], 0
    js = f"""
    const paths = {json.dumps([p.as_uri() for p in modules])};
    const stations = {json.dumps([{'id': s['id'], 'type': s['type']} for s in stations])};
    const out = {{ consumes: {{}}, rounds: [] }};
    for (const path of paths) {{
      const m = await import(path);
      for (const [type, used] of Object.entries(m.CONSUMES || {{}})) out.consumes[type] = used;
      if (typeof m.probeRounds !== 'function') continue;
      for (const station of stations) {{
        for (const seed of [1, 7, 23, 101]) {{
          const rounds = m.probeRounds(station.id, seed) || [];
          for (const [i, used] of rounds.entries()) {{
            out.rounds.push({{ id: station.id, seed, index: i, used }});
          }}
        }}
      }}
    }}
    console.log(JSON.stringify(out));
    """
    run = subprocess.run(["node", "--input-type=module", "-e", js],
                         capture_output=True, text=True)
    if run.returncode != 0:
        names = "، ".join(p.name for p in modules)
        return ([f"[المولّدات] تعذّر استيراد ({names}) في node — ووحدةُ المولّد يجب أن "
                 f"تكون **خالصة** لا تمسّ الـDOM ولا تستورد `main.js`:\n"
                 + run.stderr.strip()[:300]], 0)

    data = json.loads(run.stdout)
    by_id = {s["id"]: s for s in stations}
    errors = []
    for type_name, used in data["consumes"].items():
        owned = [s for s in stations if s["type"] == type_name]
        if not owned:
            errors.append(f"[{type_name}] مولّدٌ لنوعٍ لا محطةَ له في الرحلة")
        for station in owned:
            errors += usage_errors(f"[إعلان {type_name} · {station['id']}]",
                                   used, station["frontier"])
    for round_ in data["rounds"]:
        station = by_id.get(round_["id"])
        if not station:
            continue
        label = f"[جولة {round_['id']} · بذرة {round_['seed']}/{round_['index']}]"
        errors += usage_errors(label, round_["used"], station["frontier"])
        errors += scene_usage_errors(label, round_["used"], scenes)
        errors += shape_usage_errors(label, round_["used"], shapes, station)
    return errors, len(data["rounds"])


# ————— جردُ مادّةِ الشريط: يُسأل `usedOf` نفسُها في node (الجلسة ك) —————
#
# **العلّة**: مادّةُ شريط النمط قد تكون أعداداً تُكتب رقماً في خاناته (النمطُ العدديّ)،
# **وعددُ الشريط طولُه لا مادّتُه** — فجردُ الأعداد لا يمرّ عليها، وشريطٌ يقفز إلى
# العشرين في محطةٍ جبهتُها العشرة يمرّ صامتاً. فتُسأل `usedOf` **بجولةٍ مصنوعةٍ بيد** لا
# بجولةٍ يولّدها مولّد: أتجرد رقمَ الخانة رمزاً معروضاً؟ ثم يُقابَل الجردُ بجبهةٍ أضيق
# فيُطالَب الحكمُ بأن يمسكه. (وهي وصلةٌ بين `station.js` وهذا الفاحص، فتُقاس عملاً.)

def probe_strip() -> dict:
    js = f"""
    const m = await import({json.dumps((APP_JS / 'station.js').as_uri())});
    console.log(JSON.stringify(m.usedOf({{
      figures: [{{ display: 'pattern', count: 3, items: [0, 10, 20] }}],
    }})));
    """
    run = subprocess.run(["node", "--input-type=module", "-e", js],
                         capture_output=True, text=True)
    if run.returncode != 0:
        return {"error": run.stderr.strip()[:200]}
    return json.loads(run.stdout)


# ————— التشغيل —————

def check(data: dict) -> int:
    fails = 0
    asleep = 0

    def door(title, errors, count):
        nonlocal fails
        print(f"\n— {title} —")
        for e in errors[:12]:
            print("  ✗", e)
        if len(errors) > 12:
            print(f"  … و{len(errors) - 12} خطأً آخر")
        if not errors:
            print("  ✓", count)
        fails += len(errors)

    def dormant(msg):
        nonlocal asleep
        asleep += 1
        print("  ⏸", f"{msg} — نائم، يستيقظ ذاتياً")

    stations = data["stations"]
    vocab = {k: data[k] for k in ("ops", "signs", "displays", "levelMax",
                                  "subitizeMax", "countMax")}

    door("قراءةُ المنهج: كلُّ محطةٍ مكتوبةٍ تصل إلى الرحلة",
         parsed_all(data), f"{len(stations)} محطةً في الرحلة، لا واحدةَ خارجها")
    door("١) بنيةُ الجبهة: كلُّ محطةٍ تعلن حدودَها",
         frontier_errors(stations, vocab),
         f"{len(stations)} جبهةً تامّةً من معجمٍ معلَن "
         f"({len(data['displays'])} نمطَ عرض، {len(data['ops'])} عملية)")
    door("١ب) مشاهدُ القياس: لكلِّ رمزٍ رتبتُه، ولا رتبتين متساويتين",
         scene_table_errors(data["scenes"]),
         f"{sum(len(t) for t in data['scenes'].values())} مشهداً في "
         f"{len(data['scenes'])} وجهاً، كلُّ رمزٍ فيها برتبةٍ معلَنة مفردة")
    door("١د) الأشكالُ الأولى: لكلِّ شكلٍ اسمُه وأضلاعُه وموضعُه",
         shape_table_errors(data["shapes"], data["world"], data["partMin"], stations),
         f"{len(data['shapes'])} أشكالٍ بأسمائها وأضلاعها "
         f"({'، '.join(s['name'] + ': ' + str(s['sides']) for s in data['shapes'])}) "
         f"و{len(data['world'])} أشياءَ من عالم الطفل مبنيّةٍ منها "
         f"({'، '.join(t['name'] for t in data['world'])})")
    door("١ج) قفزاتُ العدّ: كلُّ قفزةٍ تنتهي عند سقف المستوى",
         skip_errors(data["skipSteps"], data["levelMax"]),
         f"{len(data['skipSteps'])} قفزات ({'، '.join(str(s) for s in data['skipSteps'])}) "
         f"كلٌّ منها يقسم {data['levelMax']} — ومصدرُها واحدٌ للخطّ والشريط")
    door("٢) تدرّجُ الجبهة: لا شيءَ يسبق موضعَه",
         order_errors(stations, vocab),
         "الصفرُ والرمزُ ورمزُ العملية والإطارات كلٌّ بعد موضعه")
    door("٣) بواباتُ المعرفة: كمّاً ← عدّاً ← رمزاً ← عمليةً",
         gates_errors(stations, vocab),
         "لا عددَ يدخل رمزاً قبل عدّه، ولا عمليةً قبل رمزه")
    door("عقدُ الرحلة: البوابات في مواضعها والعقدُ محطةٌ أو بوابة",
         journey_errors(data),
         f"{len(data['sections'])} قسماً و{len(data['gates'])} بوابات في مواضعها")

    print("\n— ٤+٥) المولّدات: ما تستهلكه ⊆ جبهةُ محطتها —")
    modules = generator_modules()
    if not modules:
        dormant("لا وحدةَ تمارينَ تُعلن `CONSUMES` ولا `probeRounds` "
                "(الجلسة ٣ تكتب أولاها)")
    else:
        errors, rounds = probe(modules, stations, data["scenes"], data["shapes"])
        for e in errors[:12]:
            print("  ✗", e)
        if not errors:
            print("  ✓", f"{len(modules)} وحدةَ مولّدٍ و{rounds} جولةً مولَّدة، "
                         "كلُّها تحت جبهاتها")
        fails += len(errors)

    print(f"\n{fails} فشل" if fails
          else "\nكل تمارين الرحلة تحت جبهاتها"
               + (f" (و{asleep} نائم بقيدٍ في docs/SEED.md)" if asleep else ""))
    return 1 if fails else 0


# ————— فحصُ الفاحص: **مُجرَّبٌ سالباً** (شرطُ بند الجلسة ١) —————
#
# لا يُصدَّق حارسٌ لم يُرَ وهو يمسك. فتُصنَع المخالفاتُ من **المنهج الحيّ نفسِه**
# (نسخةٌ عميقة تُعبَث بها) ويُطالَب الفاحصُ بأن يمسك كلَّ واحدة — فإذا رقّ يوماً
# تحت بياناتٍ تحرّكت، سقط هنا لا في جهاز طفل.

def self_test(data: dict) -> int:
    fails = 0

    def ok(cond, msg):
        nonlocal fails
        if cond:
            print("  ✓", msg)
        else:
            fails += 1
            print("  ✗", msg)

    stations = data["stations"]
    vocab = {k: data[k] for k in ("ops", "signs", "displays", "levelMax",
                                  "subitizeMax", "countMax")}

    def broke(mutate, checker=None):
        """نسخةٌ من الرحلة الحيّة عُبِث بها — وتُعاد أخطاءُ الفاحص عليها."""
        copy_ = copy.deepcopy(stations)
        mutate(copy_)
        return (checker or frontier_errors)(copy_, vocab)

    def find(rows, needle):
        return any(needle in row for row in rows)

    print("\n— المنهج الحيّ يمرّ نظيفاً —")
    for name, rows in (
        ("المحلّل", parsed_all(data)),
        ("بنيةُ الجبهة", frontier_errors(stations, vocab)),
        ("تدرّجُ الجبهة", order_errors(stations, vocab)),
        ("بواباتُ المعرفة", gates_errors(stations, vocab)),
        ("عقدُ الرحلة", journey_errors(data)),
        ("مشاهدُ القياس", scene_table_errors(data["scenes"])),
    ):
        ok(not rows, f"{name}: نظيف" + ("" if not rows else f" — {rows[0]}"))

    print("\n— ١) بنيةُ الجبهة تُمسك المخالفات —")
    ok(find(broke(lambda s: s[0]["frontier"].update(max=21)), "فوق سقف المستوى"),
       "عددٌ فوق العشرين يُمسَك (ق٣)")
    ok(find(broke(lambda s: s[0]["frontier"].update(numeral=99)), "فوق أقصى كمّها"),
       "ورمزٌ فوق كمّ محطته يُمسَك")
    ok(find(broke(lambda s: s[0]["frontier"].update(ops=["mul"])), "خارج معجم المنهج"),
       "وعمليةٌ خارج معجم المستوى (الضرب) تُمسَك")
    ok(find(broke(lambda s: s[0]["frontier"].update(signs=["+"])), "بلا عمليتِه"),
       "ورمزُ عمليةٍ بلا عمليتِه يُمسَك (لا علامةَ لِما لا يُفعَل)")
    ok(find(broke(lambda s: s[0]["frontier"].update(displays=["hologram"])), "خارج معجم المصيِّر"),
       "ونمطُ عرضٍ لا يعرفه المصيِّر يُمسَك")
    ok(find(broke(lambda s: s[0]["frontier"].pop("displays")), "ناقصةُ الحقول"),
       "وجبهةٌ ناقصةُ حقل تُمسَك")
    ok(find(broke(lambda s: s[0].update(skills=["subitize|9|flash"])), "فوق جبهة محطته"),
       "ومفتاحُ ليتنر مداه فوق جبهة محطته يُمسَك")
    ok(find(broke(lambda s: s[0].update(skills=[])), "بلا قياسٍ ولا إعفاء"),
       "ومحطةٌ بلا قياسٍ ولا إعفاءٍ تُمسَك (لا تدريسَ بلا قياس)")
    ok(find(broke(lambda s: s[0].update(skills=[], exempt="لا وقت")), "كلمةٌ تُكتب للمرور"),
       "وإعفاءٌ بكلمةٍ لا بجملةٍ تُقرأ يُمسَك")
    ok(find(broke(lambda s: s.append(copy.deepcopy(s[0]))), "معرّفٌ مكرَّر"),
       "ومحطتان بمعرّفٍ واحد تُمسَكان (النجمةُ تُكتب في غير موضعها)")

    print("\n— ٢) تدرّجُ الجبهة يُمسك السبقَ والنكوص —")
    order = lambda mutate: broke(mutate, order_errors)  # noqa: E731
    ok(find(order(lambda s: s[0]["frontier"].update(numeral=2)), "بلا رمز"),
       "ورمزٌ في المرحلة الأولى يُمسَك (الكميةُ قبل الرمز)")
    ok(find(order(lambda s: s[0]["frontier"].update(min=0)), "الصفر"),
       "وصفرٌ قبل محطته يُمسَك (متأخرٌ عمداً بعد العشرة)")
    ok(find(order(lambda s: [x["frontier"].update(signs=["+"])
                             for x in s if x["frontier"]["ops"]]), "أوّلُ عمليةٍ"),
       "وأوّلُ عمليةٍ ومعها رمزُها تُمسَك (آلةُ الجمع بلا رمز)")
    ok(find(order(lambda s: [x["frontier"].update(ops=["add"], signs=["+"])
                             for x in s if "bond" in concepts_of(x)]), "محطةُ جسورٍ"),
       "ورمزُ عمليةٍ في مرحلة الجسور يُمسَك (جزء-جزء-كلّ قبل + و−)")
    ok(find(order(lambda s: s[0]["frontier"].update(displays=["scatter"])), "أنماط العرض"),
       "ومبعثرٌ قبل النرد يُمسَك (القياسيُّ أولاً ثم ما يمنع حفظ الصورة)")
    ok(find(order(lambda s: s[0]["frontier"].update(max=15)), "أوّلُ محطةٍ تتجاوز"),
       "وتجاوزُ العشرة قبل محطة بنائها حزمةً وآحاداً يُمسَك")

    print("\n— ٣) بواباتُ المعرفة الثلاث تُمسك القفز —")
    gate = lambda mutate: broke(mutate, gates_errors)  # noqa: E731
    ok(find(gate(lambda s: s.insert(0, copy.deepcopy(
        next(x for x in s if "count" in concepts_of(x))))), "ولم يُقدَّر"),
       "وعدٌّ قبل أيّ تقديرٍ فوريّ يُمسَك (بوابةُ الكمّ قبل بوابة العدّ)")
    ok(find(gate(lambda s: s.insert(0, copy.deepcopy(
        next(x for x in s if x["frontier"]["numeral"] is not None)))), "ولم يُعَدّ"),
       "ورمزٌ قبل عدّ عدده يُمسَك (بوابةُ العدّ قبل بوابة الرمز)")
    ok(find(gate(lambda s: s.insert(0, copy.deepcopy(
        next(x for x in s if x["frontier"]["ops"])))), "ولم يُقرَأ رمزُه"),
       "وعمليةٌ قبل رمز عددها تُمسَك (ولا يدخل عمليةً إلا عددٌ عبر الثلاث)")

    print("\n— عقدُ الرحلة يُمسك اختلالَ البوابات —")
    def journey(mutate):
        clone = copy.deepcopy(data)
        mutate(clone)
        return journey_errors(clone)
    ok(find(journey(lambda d: d["gates"].pop()), "والمنهج ثلاث"),
       "وسقوطُ بوابةٍ من الثلاث يُمسَك (`METHOD.md §٥`)")
    ok(find(journey(lambda d: d["gates"][0].update(after="stage99")), "مرحلةٍ مجهولة"),
       "وبوابةٌ بعد مرحلةٍ لا وجودَ لها تُمسَك")
    ok(find(journey(lambda d: d["sections"][0]["nodes"].pop(0)), "لا تصل إلى الخريطة"),
       "ومحطةٌ في المنهج لا تصل إلى الخريطة تُمسَك (بيانٌ ميّت)")
    ok(find(journey(lambda d: d["sections"][0]["nodes"][0].update(id="ghost:x")),
            "ليست محطةً في المنهج"),
       "وعقدةٌ على الخريطة بلا محطةٍ في المنهج تُمسَك")
    ok(find(journey(lambda d: [n.update(frontier={"min": 1}) for s in d["sections"]
                               for n in s["nodes"] if n["type"] == "gate"]), "للبوابة جبهة"),
       "وبوابةٌ تدّعي جبهةً تُمسَك (تقيس ولا تدرّس)")
    ok(find(journey(lambda d: d["gates"][1].update({"from": "stage99"})), "مرحلةٍ مجهولة"),
       "وبوابةٌ مدَاها من مرحلةٍ لا وجودَ لها تُمسَك (لكلٍّ ممَّ تسأل)")
    ok(find(journey(lambda d: d["gates"][1].update({"from": d["gates"][2]["after"]})),
            "مدىً يبدأ بعد موضعها"),
       "وبوابةٌ مدَاها يبدأ بعد موضعها تُمسَك (جلسةٌ لا مهارةَ فيها)")

    src = CURRICULUM.read_text(encoding="utf-8")
    ok(len(re.findall(r"\bfrontier:\s*\{", src)) == len(stations),
       f"وحارسُ المحلّل يقابل المكتوبَ بالمقروء ({len(stations)} محطة)")

    print("\n— ١ب) مشاهدُ القياس تُمسك الرتبةَ الغائبة والمكرَّرة —")
    scenes = data["scenes"]

    def scened(mutate):
        clone = copy.deepcopy(scenes)
        mutate(clone)
        return scene_table_errors(clone)

    face = next(iter(scenes))
    ok(find(scened(lambda s: s[face][0]["items"][0].pop("rank")), "بلا رتبةٍ صحيحة"),
       "رمزٌ في الجدول بلا رتبةٍ يُمسَك (والرتبةُ هي الحكم)")
    ok(find(scened(lambda s: s[face][0]["items"][0].update(
        rank=s[face][0]["items"][1]["rank"])), "ولا رتبتين متساويتين"),
       "ورتبتان متساويتان في مشهدٍ واحد تُمسَكان (لا يُسأل عن أثقل سواءين)")
    ok(find(scened(lambda s: s[face][0]["items"].pop()), "والواحدُ لا يُقارَن"),
       "ومشهدٌ بشيءٍ واحد يُمسَك (القياسُ مقارنة)")
    ok(find(scened(lambda s: s[face][0]["items"][0].update(name="")), "بلا اسمٍ يُراجَع"),
       "ورمزٌ بلا اسمٍ يُراجَع يُمسَك (صدقُ الصورة يُراجَع بالاسم)")
    ok(find(scened(lambda s: s[face].append(copy.deepcopy(s[face][0]))), "في مشهدين"),
       "ورمزٌ في مشهدين من وجهٍ واحد يُمسَك (رتبتُه تختلف باختلاف مشهده)")

    real = scenes[face][0]["items"]
    ok(not scene_usage_errors("ج", {"scenes": [
        {"face": face, "items": [i["glyph"] for i in real]}]}, scenes),
       "وجولةٌ ترسم مشهداً من الجدول تمرّ")
    ok(find(scene_usage_errors("ج", {"scenes": [
        {"face": face, "items": [real[0]["glyph"], "🛸"]}]}, scenes), "بلا رتبةٍ معلَنة"),
       "**ورمزٌ يُرسَم في مشهدٍ ولا رتبةَ له في المنهج يُمسَك**")
    ok(find(scene_usage_errors("ج", {"scenes": [
        {"face": face, "items": [real[0]["glyph"], real[0]["glyph"]]}]}, scenes),
            "برتبةٍ واحدة"),
       "ورتبتان متساويتان في جولةٍ واحدة تُمسَكان")
    ok(find(scene_usage_errors("ج", {"scenes": [
        {"face": "hologram", "items": []}]}, scenes), "لا مشاهدَ له في المنهج"),
       "ومشهدٌ لوجهٍ لا يعرفه المنهج يُمسَك")

    print("\n— ١د) الأشكالُ تُمسك ما لا اسمَ له ولا موضع (الجلسة ش) —")
    shapes = data["shapes"]
    world = data["world"]
    part_min = data["partMin"]

    def shaped(mutate_shapes=None, mutate_world=None):
        s_copy = copy.deepcopy(shapes)
        w_copy = copy.deepcopy(world)
        if mutate_shapes:
            mutate_shapes(s_copy)
        if mutate_world:
            mutate_world(w_copy)
        return shape_table_errors(s_copy, w_copy, part_min, stations)

    ok(not shape_table_errors(shapes, world, part_min, stations),
       f"أشكالُ المنهج الحيّة نظيفة ({'، '.join(s['name'] for s in shapes)})")
    ok(find(shaped(lambda s: s[1].update(name="")), "بلا اسمٍ يُنطَق"),
       "شكلٌ بلا اسمٍ يُنطَق يُمسَك (الاسمُ يُقال في النمذجة وفي الخطأ)")
    ok(find(shaped(lambda s: s[1].update(at="nowhere")), "محطةٍ لا وجودَ لها"),
       "وشكلٌ يُقدَّم في محطةٍ لا وجودَ لها يُمسَك (فلا يراه طفلٌ أبداً)")
    ok(find(shaped(lambda s: s[1].update(sides=2)), "ولا شكلَ بضلعٍ ولا بضلعين"),
       "وشكلٌ بضلعين يُمسَك")
    ok(find(shaped(lambda s: [x.update(sides=4) for x in s if x["sides"] == 0]),
            "لا شكلَ بلا أضلاع"),
       "وسقوطُ الشكل الذي لا ضلعَ له يُمسَك (الدائرةُ تُميَّز بذلك)")
    ok(find(shaped(mutate_world=lambda w: w[0]["parts"][0].update(shape="hexagon")),
            "صنفٍ لا يعرفه المنهج"),
       "**وجزءُ شيءٍ بصنفٍ لا يعرفه المنهج يُمسَك**")
    ok(find(shaped(mutate_world=lambda w: w[0]["parts"][1].update(w=0.4, h=0.6)),
            "صندوقُه ليس مربّعاً"),
       "**ومربّعٌ صندوقُه مستطيل يُمسَك** — فيُرسَم مستطيلاً ويُسمّى مربّعاً")
    ok(find(shaped(mutate_world=lambda w: [p.update(h=p["w"]) for t in w for p in t["parts"]
                                           if p["shape"] == "rect"]), "صندوقُه مربّعٌ"),
       "ومستطيلٌ صندوقُه مربّع يُمسَك")
    ok(find(shaped(mutate_world=lambda w: w[0]["parts"][2].update(w=0.08)), "دون"),
       "**وجزءٌ أصغرُ من أرضيّة الإصبع يُمسَك** (هدفُ لمسٍ يُسأل عنه — `METHOD.md §١١`)")
    ok(find(shaped(mutate_world=lambda w: w[0]["parts"][0].update(x=0.8, w=0.5)),
            "يخرج عن صندوق الشيء"),
       "وجزءٌ يخرج عن صندوق شيئه يُمسَك")
    ok(find(shaped(mutate_world=lambda w: [t.update(parts=t["parts"][:1]) for t in w]),
            "شكلين فأكثر"),
       "وشيءٌ بجزءٍ واحد يُمسَك (لا مشتّتَ في سؤاله)")
    ok(find(shaped(mutate_world=lambda w: [t.update(
        parts=[p for p in t["parts"] if p["shape"] != "circle"]) for t in w]),
            "لا يسكن شيئاً"),
       "**وشكلٌ لا يسكن شيئاً من عالم الطفل يُمسَك** — يُدرَّس ولا يُسأل عنه في محطته")

    print("\n— ١د‌ب) ولا شكلَ قبل موضعه في جولةٍ مولَّدة —")
    first = next(s for s in stations if s["type"] == "shape")
    last = [s for s in stations if s["type"] == "shape"][-1]
    early = next(s for s in shapes if s["at"] != first["part"])
    ok(not shape_usage_errors("ج", {"shapes": [shapes[0]["id"]]}, shapes, first),
       f"جولةُ «{first['part']}» ترسم شكلاً قُدِّم فيها تمرّ")
    ok(find(shape_usage_errors("ج", {"shapes": [early["id"]]}, shapes, first),
            "ولم يُقدَّم بعد"),
       f"**وجولةٌ ترسم «{early['name']}» قبل محطته تُمسَك** — ولا شكلَ قبل موضعه")
    ok(not shape_usage_errors("ج", {"shapes": [s["id"] for s in shapes]}, shapes, last),
       "والمحطةُ الأخيرة ترسم الأشكالَ كلَّها (وقد قُدِّمت)")
    ok(find(shape_usage_errors("ج", {"shapes": ["hexagon"]}, shapes, last), "لا يعرفه المنهج"),
       "وشكلٌ لا يعرفه المنهج يُمسَك في الجولة كما في الجدول")
    other = next(s for s in stations if s["type"] != "shape")
    ok(find(shape_usage_errors("ج", {"shapes": [shapes[0]["id"]]}, shapes, other),
            "ليست محطةَ أشكال"),
       "وشكلٌ هندسيّ في محطةٍ ليست محطةَ أشكالٍ يُمسَك")

    print("\n— ١ج) قفزاتُ العدّ تُمسك ما لا ينتهي عند السقف —")
    top = data["levelMax"]
    ok(not skip_errors(data["skipSteps"], top),
       f"قفزاتُ المنهج الحيّة نظيفة ({'، '.join(str(s) for s in data['skipSteps'])})")
    ok(find(skip_errors([3], top), "لا تقسم سقفَ المستوى"),
       f"وقفزةٌ لا تقسم السقفَ تُمسَك (٣ في {top} — تجاوزُه بخانةٍ خرقٌ لق٣)")
    ok(find(skip_errors([1], top), "ليست عدداً صحيحاً من اثنين"),
       "وقفزةُ الواحد تُمسَك (العدُّ فرادى ليس قفزاً)")
    ok(find(skip_errors([20], top), "فوق نصف سقف المستوى"),
       "وقفزةٌ فوق نصف السقف تُمسَك (قفزتان لا تُريان إيقاعاً)")
    ok(find(skip_errors([2, 2], top), "مكرَّرة"), "وقفزةٌ مكرَّرة تُمسَك")
    ok(find(skip_errors([], top), "لا قفزةَ عدٍّ واحدة"),
       "وخلوُّ المنهج من القفزات يُمسَك (ومحطتا القفز تقرآن منها)")

    print("\n— ٤ب) رقمُ خانة الشريط رمزٌ معروض (الجلسة ك) —")
    strip = probe_strip()
    if strip.get("error"):
        ok(False, f"تعذّر جردُ الشريط العدديّ — {strip['error']}")
    else:
        numerals = strip.get("numerals") or []
        ok(20 in numerals and 10 in numerals,
           "**جولةٌ فيها شريطُ أرقامٍ تُجرَد أرقامُه رموزاً معروضة** "
           f"(جُرِد: {'، '.join(str(n) for n in numerals)})")
        ok(find(usage_errors("ج", strip, {
            "min": 0, "max": 20, "numeral": 10, "ops": [], "signs": [],
            "displays": ["pattern"],
        }), "فوق أقصى رمز محطته"),
           "**وشريطٌ يكتب العشرين في محطةٍ جبهتُها العشرة يُمسَك** — وعددُ الشريط طولُه "
           "لا مادّتُه، فلا يمسكه جردُ الأعداد")

    print("\n— ٤+٥) حكمُ الاستهلاك يُمسك ما فوق الجبهة —")
    f = next(s["frontier"] for s in stations if s["frontier"]["ops"])
    quiet = next(s["frontier"] for s in stations if s["frontier"]["numeral"] is None)
    # **آلةُ الجمع** (٦·١): عمليةٌ في جبهتها وصفرُ علامة — جولةٌ ترسم «+» فيها تُمسَك
    machine = next(s["frontier"] for s in stations
                   if s["frontier"]["ops"] and not s["frontier"]["signs"])
    ok(not usage_errors("ج", {"ops": machine["ops"]}, machine),
       "جولةٌ **تفعل بلا علامة** تمرّ (آلةُ الجمع — `METHOD.md §٣` ٦·١)")
    ok(find(usage_errors("ج", {"ops": machine["ops"], "signs": [data["signs"]["add"]]}, machine),
            "ليس من رموز محطته"),
       "**وعلامةٌ في محطةٍ تفعل بلا علامة تُمسَك** — والرمزُ تسميةٌ لِما فُعِل قبله")
    ok(not usage_errors("ج", {"numbers": [f["max"]], "ops": f["ops"],
                              "signs": f["signs"], "displays": f["displays"][:1]}, f),
       "جولةٌ تحت جبهتها تمرّ")
    ok(find(usage_errors("ج", {"numbers": [f["max"] + 1]}, f), "خارج جبهته"),
       "وعددٌ فوق أقصى الجبهة يُمسَك")
    ok(find(usage_errors("ج", {"numbers": [f["min"] - 1]}, f), "خارج جبهته"),
       "وعددٌ دون أدنى الجبهة يُمسَك (الصفرُ قبل محطته)")
    ok(find(usage_errors("ج", {"numerals": [1]}, quiet), "بلا رمزٍ البتّة"),
       "ورمزٌ في محطةٍ بلا رمز يُمسَك (المرحلتان ١–٢)")
    ok(find(usage_errors("ج", {"ops": ["mul"]}, f), "ليست من عمليات محطته"),
       "وعمليةٌ فوق عمليات المحطة تُمسَك")
    ok(find(usage_errors("ج", {"signs": ["×"]}, f), "ليس من رموز محطته"),
       "ورمزُ عمليةٍ فوق رموز المحطة يُمسَك")
    ok(find(usage_errors("ج", {"displays": ["two-frames"]}, quiet), "ليس من أنماط محطته"),
       "ونمطُ عرضٍ فوق أنماط المحطة يُمسَك")

    print(f"\n{fails} فشل" if fails else "\n✓ الفاحص يمسك المخالفات كلها")
    return 1 if fails else 0


def main():
    ap = argparse.ArgumentParser(description="حارسُ جبهة المحطات في «اِحْسِبْ»")
    ap.add_argument("--self-test", action="store_true",
                    help="فحصُ الفاحص نفسه: هل يمسك المخالفات؟")
    args = ap.parse_args()
    data = load_curriculum()
    sys.exit(self_test(data) if args.self_test else check(data))


if __name__ == "__main__":
    main()
