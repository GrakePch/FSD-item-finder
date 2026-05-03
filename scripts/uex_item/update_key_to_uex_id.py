import argparse
import json
import re
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


API_BASE = "https://api.uexcorp.space/2.0"
ENGLISH_GLOBAL_INI_URL = "https://sczh.42kit.com/orginal/global.ini"
RETRIES = 3

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[1]
DEFAULT_RULES_PATH = SCRIPT_DIR / "key_match_rules.json"
DEFAULT_PRESERVED_ITEM_KEYS_PATH = SCRIPT_DIR / "preserved_item_keys.json"
DEFAULT_ITEM_OUTPUT_PATH = REPO_ROOT / ".tmp" / "uex_item" / "itemkey_id.json"
DEFAULT_VEHICLE_OUTPUT_PATH = REPO_ROOT / ".tmp" / "uex_item" / "vehiclekey_id.json"

ITEM_KEY_PREFIXES = (
    "id_item",
    "item_decoration",
    "item_fuel",
    "item_mining",
    "item_name",
    "item_scraper",
    "items_commodities",
)

VEHICLE_MANUFACTURER_PREFIXES = (
    "Aegis ",
    "Anvil ",
    "Argo ",
    "Aopoa ",
    "Banu ",
    "C.O. ",
    "Crusader ",
    "Drake ",
    "Esperia ",
    "Gatac ",
    "Grey's ",
    "Greycat ",
    "Kruger ",
    "MISC ",
    "Mirai ",
    "Origin ",
    "RSI ",
    "Tumbril ",
)


def fetch_bytes(url):
    last_error = None
    request = Request(
        url,
        headers={
            "Accept": "application/json,text/plain,*/*",
            "User-Agent": "fsd-item-finder-data-updater/1.0",
        },
    )

    for attempt in range(1, RETRIES + 1):
        try:
            with urlopen(request, timeout=60) as response:
                return response.read()
        except (HTTPError, URLError, TimeoutError) as error:
            last_error = error
            if attempt == RETRIES:
                break
            time.sleep(2 ** (attempt - 1))

    raise RuntimeError(f"Failed to fetch {url}: {last_error}") from last_error


def fetch_json(resource):
    payload = json.loads(fetch_bytes(f"{API_BASE}/{resource}").decode("utf-8"))
    if payload.get("status") != "ok":
        raise RuntimeError(f"{resource} returned status={payload.get('status')!r}")
    return payload


def load_json_payload(source, resource):
    if source:
        return json.loads(source.read_text(encoding="utf-8"))
    return fetch_json(resource)


def load_english_ini(source):
    if source:
        return source.read_text(encoding="utf-8", errors="replace")
    return fetch_bytes(ENGLISH_GLOBAL_INI_URL).decode("utf-8", errors="replace")


def parse_ini(text):
    result = {}
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        result[key.strip()] = value.strip()
    return result


def normalize_text(text):
    return re.sub(r"[^a-zA-Z0-9]", "", text or "").lower()


def canonical_category_name(name):
    return normalize_text(name)


def is_short_key(key):
    return key.lower().endswith("_short")


def is_auto_item_key(key, existing_keys):
    key_lower = key.lower()
    if is_short_key(key):
        return False
    return key in existing_keys or key_lower.startswith(ITEM_KEY_PREFIXES)


def canonical_vehicle_key(key):
    if is_short_key(key):
        return key[:-6]
    return key


def add_lookup(lookup, normalized_lookup, name, key, source="auto"):
    if not name:
        return
    candidate = {"key": key, "source": source}
    lookup.setdefault(name, []).append(candidate)
    normalized_lookup.setdefault(normalize_text(name), []).append(candidate)


def get_vehicle_short_name_alias(name):
    for prefix in VEHICLE_MANUFACTURER_PREFIXES:
        if name.startswith(prefix) and len(name) > len(prefix):
            return name[len(prefix):].strip()
    return None


def build_item_lookup(english_entries, manual_rules, existing_keys):
    lookup = {}
    normalized_lookup = {}

    for key, name in english_entries.items():
        if is_auto_item_key(key, existing_keys):
            add_lookup(lookup, normalized_lookup, name, key)

    for rule in manual_rules:
        key = rule["key"]
        for name in rule.get("names") or []:
            add_lookup(lookup, normalized_lookup, name, key, source="manual")

    return lookup, normalized_lookup


def build_vehicle_lookup(english_entries, manual_rules):
    lookup = {}
    normalized_lookup = {}

    vehicle_entries = [
        (key, name)
        for key, name in english_entries.items()
        if key.lower().startswith("vehicle_name")
    ]

    for key, name in vehicle_entries:
        if not is_short_key(key):
            add_lookup(lookup, normalized_lookup, name, canonical_vehicle_key(key))

    alias_entries = []
    alias_counts = {}
    for key, name in vehicle_entries:
        if is_short_key(key):
            continue
        alias = get_vehicle_short_name_alias(name)
        if not alias:
            continue
        alias_entries.append((alias, canonical_vehicle_key(key)))
        alias_counts[normalize_text(alias)] = alias_counts.get(normalize_text(alias), 0) + 1

    for alias, key in alias_entries:
        if alias_counts.get(normalize_text(alias)) == 1:
            add_lookup(lookup, normalized_lookup, alias, key)

    for key, name in vehicle_entries:
        if is_short_key(key):
            add_lookup(lookup, normalized_lookup, name, canonical_vehicle_key(key))

    for rule in manual_rules:
        key = rule["key"]
        for name in rule.get("names") or []:
            add_lookup(lookup, normalized_lookup, name, key)

    return lookup, normalized_lookup


def key_category_score(key, category):
    key_lower = key.lower()
    category_key = canonical_category_name(category)

    if category_key == "quantumdrives":
        if "qdrv" not in key_lower:
            return -200
        score = 100
        if key_lower.startswith("item_name_qdrv") or key_lower.startswith("item_nameqdrv"):
            score += 20
        if key_lower.endswith("_scitem"):
            score -= 1
        return score

    return 0


def match_score(candidate, item):
    key = candidate["key"]
    item_name = item.get("item_name") or item.get("name")
    category = item.get("category") or item.get("category_name")
    score = 0

    if candidate["source"] == "auto":
        score += 50
    elif candidate["source"] == "manual":
        score += 10

    key_lower = key.lower()
    if key_lower.startswith("item_name"):
        score += 25

    score += key_category_score(key, category)

    if normalize_text(item_name) and normalize_text(item_name) in normalize_text(key):
        score += 5

    return score


def dedupe_candidates(candidates):
    deduped = []
    seen = set()
    for candidate in candidates:
        key = candidate["key"]
        if key in seen:
            continue
        seen.add(key)
        deduped.append(candidate)
    return deduped


def find_match(item, lookup, normalized_lookup):
    name = item.get("item_name") or item.get("name")
    if not name:
        return None

    candidates = lookup.get(name)
    if not candidates:
        candidates = normalized_lookup.get(normalize_text(name))
    if not candidates:
        return None

    scored = [
        (match_score(candidate, item), candidate["key"])
        for candidate in dedupe_candidates(candidates)
    ]
    scored.sort(key=lambda entry: (-entry[0], entry[1]))

    best_score, best_key = scored[0]
    if best_score < 0:
        return None
    return best_key


def append_unique_id(result, key, item_id):
    entry = result.setdefault(key, {"id": []})
    if item_id not in entry["id"]:
        entry["id"].append(item_id)


def enrich_item_price_payload(items_payload, category_lookup):
    for item in items_payload.get("data") or []:
        category = category_lookup.get(item.get("id_category")) or {}
        item["section"] = item.get("section") or category.get("section")
        item["category"] = item.get("category") or category.get("name")


def generate_item_key_map(items_payload, lookup, normalized_lookup, preserved_item_keys):
    result = {}
    unmatched_names = set()
    for item in items_payload.get("data") or []:
        name = item.get("item_name")
        item_id = item.get("id_item")
        if not name or item_id is None:
            continue
        key = find_match(item, lookup, normalized_lookup)
        if key:
            append_unique_id(result, key, item_id)
        else:
            unmatched_names.add(name)

    for key in preserved_item_keys:
        result.setdefault(key, {})

    return dict(sorted(result.items(), key=lambda entry: entry[0])), unmatched_names


def generate_vehicle_key_map(vehicles_payload, lookup, normalized_lookup):
    result = {}
    unmatched_names = set()
    for vehicle in vehicles_payload.get("data") or []:
        name = vehicle.get("vehicle_name")
        vehicle_id = vehicle.get("id_vehicle")
        if not name or vehicle_id is None:
            continue
        key = find_match({"item_name": name}, lookup, normalized_lookup)
        if key:
            append_unique_id(result, key, vehicle_id)
        else:
            unmatched_names.add(name)

    return dict(sorted(result.items(), key=lambda entry: entry[0])), unmatched_names


def load_preserved_item_keys(path):
    if not path or not path.exists():
        return set()

    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict):
        data = data.get("items") or data.get("keys") or []
    if not isinstance(data, list):
        raise RuntimeError(
            f"Preserved item key file must be a list or object with an items list: {path}"
        )

    return {key for key in data if isinstance(key, str) and key}


def load_rules(path):
    rules = json.loads(path.read_text(encoding="utf-8"))
    return rules.get("items") or [], rules.get("vehicles") or []


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")


def get_source_names(payload, name_field):
    return {entry.get(name_field) for entry in payload.get("data") or [] if entry.get(name_field)}


def print_manual_rule_report(label, rules, source_names, result):
    missing = []
    normalized_source_names = {normalize_text(name) for name in source_names}
    for rule in rules:
        names = rule.get("names") or []
        has_source_name = any(normalize_text(name) in normalized_source_names for name in names)
        has_generated_id = bool(result.get(rule["key"], {}).get("id"))
        if not has_source_name and not has_generated_id:
            missing.append(rule["key"])

    if not missing:
        return

    preview = ", ".join(sorted(missing)[:20])
    print(f"Manual {label} rules without current UEX ids: {len(missing)}")
    print(f"  {preview}")


def print_quality_report(label, result, unmatched_names, preview_limit):
    keyed_with_ids = sum(1 for value in result.values() if value.get("id"))
    print(f"{label} key map:")
    print(f"  Keys: {len(result)}")
    print(f"  Keys with UEX ids: {keyed_with_ids}")
    print(f"  Unmatched UEX names: {len(unmatched_names)}")
    if unmatched_names:
        preview = ", ".join(sorted(unmatched_names)[:preview_limit])
        print(f"  Unmatched preview: {preview}")


def parse_args():
    parser = argparse.ArgumentParser(description="Generate key-to-UEX-id mapping JSON files.")
    parser.add_argument("--en", type=Path, help="Path to an English global.ini file.")
    parser.add_argument("--items-source", type=Path, help="Path to an items_prices_all JSON payload.")
    parser.add_argument("--vehicles-source", type=Path, help="Path to a vehicles_purchases_prices_all JSON payload.")
    parser.add_argument("--rules", default=DEFAULT_RULES_PATH, type=Path, help="Manual key match rules JSON.")
    parser.add_argument(
        "--preserved-item-keys",
        default=DEFAULT_PRESERVED_ITEM_KEYS_PATH,
        type=Path,
        help="Explicit allowlist of item keys to keep without current UEX ids.",
    )
    parser.add_argument("--output-item", default=DEFAULT_ITEM_OUTPUT_PATH, type=Path, help="Item key map output path.")
    parser.add_argument("--output-vehicle", default=DEFAULT_VEHICLE_OUTPUT_PATH, type=Path, help="Vehicle key map output path.")
    parser.add_argument("--unmatched-preview", default=25, type=int, help="Maximum unmatched names to print per report.")
    return parser.parse_args()


def main():
    args = parse_args()

    items_payload = load_json_payload(args.items_source, "items_prices_all")
    vehicles_payload = load_json_payload(args.vehicles_source, "vehicles_purchases_prices_all")
    categories_payload = fetch_json("categories?type=item")
    english_entries = parse_ini(load_english_ini(args.en))
    item_rules, vehicle_rules = load_rules(args.rules)
    preserved_item_keys = load_preserved_item_keys(args.preserved_item_keys)
    category_lookup = {
        category.get("id"): category
        for category in categories_payload.get("data") or []
        if category.get("id") is not None
    }
    enrich_item_price_payload(items_payload, category_lookup)

    item_lookup, normalized_item_lookup = build_item_lookup(
        english_entries,
        item_rules,
        preserved_item_keys,
    )
    vehicle_lookup, normalized_vehicle_lookup = build_vehicle_lookup(english_entries, vehicle_rules)

    item_result, unmatched_items = generate_item_key_map(
        items_payload,
        item_lookup,
        normalized_item_lookup,
        preserved_item_keys,
    )
    vehicle_result, unmatched_vehicles = generate_vehicle_key_map(
        vehicles_payload,
        vehicle_lookup,
        normalized_vehicle_lookup,
    )

    print_manual_rule_report("item", item_rules, get_source_names(items_payload, "item_name"), item_result)
    print_manual_rule_report("vehicle", vehicle_rules, get_source_names(vehicles_payload, "vehicle_name"), vehicle_result)
    print_quality_report("Item", item_result, unmatched_items, args.unmatched_preview)
    print_quality_report("Vehicle", vehicle_result, unmatched_vehicles, args.unmatched_preview)

    write_json(args.output_item, item_result)
    write_json(args.output_vehicle, vehicle_result)


if __name__ == "__main__":
    main()
