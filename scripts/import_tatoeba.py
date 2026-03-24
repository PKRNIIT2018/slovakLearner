#!/usr/bin/env python3
"""
Tatoeba → slovak-game importer
================================
Downloads Slovak↔English sentence pairs from Tatoeba, groups them into
thematic PhraseSection buckets, and writes:

  src/data/tatoeba-phrases.ts   — ready to import in the game

Usage:
  python scripts/import_tatoeba.py

  # Skip re-download (use cached bz2 files in ./data/tatoeba/):
  python scripts/import_tatoeba.py --cached

  # Change phrases-per-section limit (default 20):
  python scripts/import_tatoeba.py --limit 30
"""

import argparse
import bz2
import csv
import hashlib
import io
import os
import re
import sys
import urllib.request
from collections import defaultdict
from pathlib import Path


# ─── Config ──────────────────────────────────────────────────────────────────

CACHE_DIR = Path("data/tatoeba")
OUT_FILE  = Path("src/data/tatoeba-phrases.ts")

URLS = {
    "slk":   "https://downloads.tatoeba.org/exports/per_language/slk/slk_sentences.tsv.bz2",
    "eng":   "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2",
    "links": "https://downloads.tatoeba.org/exports/per_language/slk/slk-eng_links.tsv.bz2",
}

MIN_SK_LEN = 8
MAX_SK_LEN = 100
MIN_EN_LEN = 4
MAX_EN_LEN = 100
MIN_WORDS  = 2


# ─── Thematic categories ─────────────────────────────────────────────────────
# Each entry: (key, icon, title, subtitle, level, keywords)
# First match wins — put specific before generic.

CATEGORIES = [
    ("greetings", "👋", "Greetings & Farewells",     "Pozdravy a rozlúčky",          "beginner", [
        "ahoj", "dobrý deň", "dobré ráno", "dobrú noc", "čau", "nazdar",
        "zbohom", "dovidenia", "vitajte", "ako sa máš", "ako sa voláš",
    ]),
    ("family",    "👨‍👩‍👧", "Family & Relationships", "Rodina a vzťahy",              "beginner", [
        "mama", "otec", "brat", "sestra", "deti", "rodič", "manžel", "manželka",
        "babička", "dedko", "syn", "dcéra", "strýko", "teta", "priateľ", "priateľka",
        "rodina",
    ]),
    ("food",      "🍽️", "Food & Eating",              "Jedlo a stravovanie",          "beginner", [
        "jesť", "piť", "jedlo", "obed", "večera", "raňajky", "reštaurácia",
        "chlieb", "mäso", "zelenina", "ovocie", "polievka", "káva", "čaj",
        "voda", "víno", "pivo", "hlad", "smäd", "chutný", "variť",
    ]),
    ("shopping",  "🛒", "Shopping",                    "Nakupovanie",                  "beginner", [
        "kúpiť", "predať", "cena", "obchod", "obchodné centrum", "platiť",
        "lacný", "drahý", "zľava", "pokladňa", "peňaženka", "peniaze",
        "nakupovať", "tovar", "veľkosť",
    ]),
    ("travel",    "✈️", "Travel & Transport",          "Cestovanie a doprava",         "intermediate", [
        "vlak", "autobus", "letisko", "letiť", "cestovať", "lístok",
        "stanica", "hotel", "ubytovanie", "mapa", "zastávka", "odchod",
        "príchod", "kufor", "pas", "výlet", "diaľnica", "auto",
    ]),
    ("weather",   "☀️", "Weather & Seasons",           "Počasie a ročné obdobia",      "beginner", [
        "počasie", "dážď", "slnko", "sneh", "vietor", "teplota", "zima",
        "leto", "jar", "jeseň", "horúco", "studeno", "oblačno", "búrka",
    ]),
    ("time",      "🕐", "Time & Dates",                "Čas a dátumy",                 "beginner", [
        "hodina", "minúta", "deň", "týždeň", "mesiac", "rok", "dnes", "zajtra",
        "včera", "ráno", "večer", "poludnie", "noc", "dátum", "kedy",
        "pondelok", "utorok", "streda", "štvrtok", "piatok", "sobota", "nedeľa",
    ]),
    ("school",    "📚", "School & Education",          "Škola a vzdelávanie",          "intermediate", [
        "škola", "učiteľ", "žiak", "student", "učiť", "učiť sa", "skúška",
        "trieda", "kniha", "písať", "čítať", "jazyk", "predmet", "domáca úloha",
        "univerzita", "diplom", "štúdium",
    ]),
    ("health",    "💊", "Health & Body",               "Zdravie a telo",               "intermediate", [
        "zdravie", "nemocnica", "lekár", "bolesť", "chorý", "lieky",
        "telo", "hlava", "ruka", "noha", "srdce", "dýchať", "spať",
        "cvičiť", "únava", "teplota",
    ]),
    ("home",      "🏠", "Home & Daily Life",           "Domov a každodenný život",     "beginner", [
        "dom", "byt", "izba", "kuchyňa", "spálňa", "kúpeľňa", "záhrada",
        "dvere", "okno", "nábytok", "upratovať", "variť", "bývať", "susedia",
    ]),
    ("work",      "💼", "Work & Career",               "Práca a kariéra",              "intermediate", [
        "práca", "zamestnanie", "zamestnanec", "šéf", "plat", "kancelária",
        "projekt", "stretnutie", "firma", "zákazník", "zmluva", "dovolenka",
        "pracovať",
    ]),
    ("emotions",  "😊", "Feelings & Emotions",         "Pocity a emócie",              "beginner", [
        "šťastný", "smutný", "nahnevaný", "spokojný", "unavený", "prekvapený",
        "báť sa", "smiať sa", "plakať", "láska", "radosť", "hnev", "strach",
        "cítiť",
    ]),
    ("nature",    "🌿", "Nature & Environment",        "Príroda a životné prostredie", "intermediate", [
        "príroda", "les", "hora", "rieka", "more", "jazero", "zviera",
        "strom", "kvet", "rastlina", "vták", "pes", "mačka",
    ]),
    ("everyday",  "💬", "Everyday Sentences",          "Bežné vety",                   "beginner", []),
]

GRAMMAR_FOCUS_RULES = [
    (r"\b(budem|bude|budeme|budete|budú|zajtra|budúci)\b",                            "future"),
    (r"\b(by\b|by som|by si|by sme|by ste|keby|ak by)\b",                            "conditional"),
    (r"\b(som bol|bol som|bola som|som bola|som chodil|som robil|som videl|som počul)\b", "past"),
    (r"\b(včera|minulý|minulej|minulého|naposledy|pred\s+\w+\s+(dňami|rokmi|mesiacmi))\b", "past"),
]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def make_id(slovak: str) -> str:
    digest = hashlib.md5(slovak.encode()).hexdigest()[:8]
    return f"tt-{digest}"


def infer_grammar_focus(slovak: str) -> str:
    for pattern, focus in GRAMMAR_FOCUS_RULES:
        if re.search(pattern, slovak, re.IGNORECASE):
            return focus
    return "present"


NOISE_PATTERNS = re.compile(
    r"tatoeba|wikipedia|wikipedie|wikipedie|twitter|facebook|instagram|youtube"
    r"|justin bieber|łazarz|felicj|zarębówna|zaręba",  # known noisy proper nouns
    re.IGNORECASE,
)
# Polish-only diacritics not used in Slovak
POLISH_CHARS = re.compile(r"[łęąóżźćńŁĘĄÓŻŹĆŃ]")


def is_good(sk: str, en: str) -> bool:
    if not (MIN_SK_LEN <= len(sk) <= MAX_SK_LEN):
        return False
    if not (MIN_EN_LEN <= len(en) <= MAX_EN_LEN):
        return False
    if len(sk.split()) < MIN_WORDS:
        return False
    if sk[-1] not in ".!?":
        return False
    if re.search(r"<[^>]+>|https?://|www\.", sk):
        return False
    if sk == sk.upper() and len(sk) > 4:
        return False
    if sum(c.isdigit() for c in sk) / len(sk) > 0.3:
        return False
    if NOISE_PATTERNS.search(sk) or NOISE_PATTERNS.search(en):
        return False
    if POLISH_CHARS.search(sk):
        return False
    return True


def categorize(sk: str, en: str) -> str:
    text = (sk + " " + en).lower()
    for key, *_, keywords in CATEGORIES:
        if key == "everyday":
            continue
        if any(kw in text for kw in keywords):
            return key
    return "everyday"


def ts_str(s: str) -> str:
    """Escape for a TypeScript double-quoted string."""
    return s.replace("\\", "\\\\").replace('"', '\\"')


# ─── Download ────────────────────────────────────────────────────────────────

def download(url: str, dest: Path) -> None:
    if dest.exists():
        print(f"  cached   {dest.name}")
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"  fetching {dest.name} ...", end="", flush=True)
    urllib.request.urlretrieve(url, dest)
    kb = dest.stat().st_size // 1024
    print(f" {kb:,} KB")


def read_bz2_tsv(path: Path) -> csv.reader:
    raw = bz2.open(path, "rt", encoding="utf-8")
    return csv.reader(raw, delimiter="\t")


# ─── Main ────────────────────────────────────────────────────────────────────

def main(limit: int, cached: bool) -> None:
    slk_path   = CACHE_DIR / "slk_sentences.tsv.bz2"
    eng_path   = CACHE_DIR / "eng_sentences.tsv.bz2"
    links_path = CACHE_DIR / "slk-eng_links.tsv.bz2"

    if not cached:
        print("Downloading Tatoeba files...")
        download(URLS["slk"],   slk_path)
        download(URLS["eng"],   eng_path)
        download(URLS["links"], links_path)

    for f in (slk_path, eng_path, links_path):
        if not f.exists():
            sys.exit(f"Missing: {f}  — run without --cached to download.")

    # Load Slovak sentences: id → text
    print("Loading Slovak sentences...")
    sk_map: dict[str, str] = {}
    for row in read_bz2_tsv(slk_path):
        if len(row) >= 3:
            sk_map[row[0]] = row[2]
    print(f"  {len(sk_map):,} sentences")

    # Load English sentences: id → text
    print("Loading English sentences...")
    en_map: dict[str, str] = {}
    for row in read_bz2_tsv(eng_path):
        if len(row) >= 3:
            en_map[row[0]] = row[2]
    print(f"  {len(en_map):,} sentences")

    # Join via slk-eng links: slk_id TAB eng_id
    print("Joining pairs...")
    pairs: list[tuple[str, str]] = []
    for row in read_bz2_tsv(links_path):
        if len(row) < 2:
            continue
        sk_id, en_id = row[0], row[1]
        sk = sk_map.get(sk_id)
        en = en_map.get(en_id)
        if sk and en:
            pairs.append((sk, en))
    print(f"  {len(pairs):,} raw pairs")

    # Load existing hand-curated Slovak texts to exclude from Tatoeba output
    curated_slovak: set[str] = set()
    if OUT_FILE.exists():
        # Avoid re-reading the generated file itself; read the source phrases file
        pass
    phrases_file = Path("src/data/slovak-phrases.ts")
    if phrases_file.exists():
        import re as _re
        raw = phrases_file.read_text(encoding="utf-8")
        # Extract Slovak texts from entries whose IDs are NOT Tatoeba (tt- prefix)
        all_ids     = _re.findall(r'id:\s*"([^"]+)"', raw)
        all_slovaks = _re.findall(r'slovak:\s*"([^"]+)"', raw)
        curated_slovak = {
            sk for id_, sk in zip(all_ids, all_slovaks)
            if not id_.startswith("tt-")
        }
        print(f"  {len(curated_slovak)} existing curated Slovak phrases loaded for dedup")

    # Quality filter + deduplicate by Slovak text (curated takes priority)
    seen: set[str] = set(curated_slovak)
    clean: list[tuple[str, str]] = []
    for sk, en in pairs:
        if sk not in seen and is_good(sk, en):
            seen.add(sk)
            clean.append((sk, en))
    print(f"  {len(clean):,} after quality filter + dedup against curated")

    # Bucket by theme
    buckets: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for sk, en in clean:
        buckets[categorize(sk, en)].append((sk, en))

    print("\nCategory breakdown:")
    for key, *_ in CATEGORIES:
        count = len(buckets.get(key, []))
        if count:
            print(f"  {key:<14} {count:>4} pairs  (exporting {min(count, limit)})")

    # Write TypeScript
    print(f"\nWriting {OUT_FILE} ...")
    ts_lines: list[str] = [
        'import type { PhraseSection } from "@/types/learning"',
        "",
        "// Auto-generated by scripts/import_tatoeba.py — do not edit manually.",
        "// Source: Tatoeba (CC BY 2.0)  https://tatoeba.org",
        "",
        "export const TATOEBA_SECTIONS: PhraseSection[] = [",
    ]

    exported = 0
    for key, icon, title, subtitle, level, _kws in CATEGORIES:
        items = buckets.get(key, [])[:limit]
        if not items:
            continue
        ts_lines += [
            "  {",
            f'    icon: "{icon}",',
            f'    title: "{ts_str(title)}",',
            f'    subtitle: "{ts_str(subtitle)}",',
            f'    level: "{level}",',
            "    phrases: [",
        ]
        for sk, en in items:
            ts_lines.append(
                f'      {{ id: "{make_id(sk)}", '
                f'slovak: "{ts_str(sk)}", '
                f'english: "{ts_str(en)}", '
                f'grammar_focus: "{infer_grammar_focus(sk)}" }},'
            )
            exported += 1
        ts_lines += ["    ],", "  },"]

    ts_lines.append("]")

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text("\n".join(ts_lines) + "\n", encoding="utf-8")

    sections = sum(1 for key, *_ in CATEGORIES if buckets.get(key))
    print(f"\nDone — {exported} phrases across {sections} sections → {OUT_FILE}")
    print("""
Next step — merge into the game:
  1. Open src/data/slovak-phrases.ts
  2. Add at the top:
       import { TATOEBA_SECTIONS } from "./tatoeba-phrases"
  3. Rename the existing array to HAND_CURATED_SECTIONS (or similar)
  4. Re-export merged:
       export const SLOVAK_SECTIONS = [...HAND_CURATED_SECTIONS, ...TATOEBA_SECTIONS]
""")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit",  type=int, default=20, help="Max phrases per section (default: 20)")
    ap.add_argument("--cached", action="store_true",  help="Skip download, use cached files")
    args = ap.parse_args()
    main(args.limit, args.cached)
