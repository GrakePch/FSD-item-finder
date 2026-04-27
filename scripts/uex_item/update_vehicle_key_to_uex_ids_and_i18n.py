import argparse
import json
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[1]

DEFAULT_VEHICLE_KEY_PATH = REPO_ROOT / ".tmp" / "uex_item" / "vehiclekey_id.json"
DEFAULT_VEHICLE_EN_PATH = REPO_ROOT / "src" / "i18n" / "vehicles" / "en.json"
DEFAULT_VEHICLE_ZH_PATH = REPO_ROOT / "src" / "i18n" / "vehicles" / "zh.json"
DEFAULT_OUTPUT_PATH = REPO_ROOT / "src" / "data" / "vehicles" / "key_to_uex_ids_and_i18n.json"


def load_json(path, default=None):
    if not path.exists():
        return default if default is not None else {}
    return json.loads(path.read_text(encoding="utf-8"))


def vehicle_key_sort_key(key):
    return key.lower(), key


def lookup_translation(key, translations):
    if key in translations:
        return translations[key]

    return key


def build_vehicle_items(vehicle_keys, en_translations, zh_translations):
    result = {}
    for key in sorted(vehicle_keys, key=vehicle_key_sort_key):
        ids = vehicle_keys[key].get("id") or []
        result[key] = {
            "uex_ids": [f"v-{vehicle_id}" for vehicle_id in ids],
            "en": lookup_translation(key, en_translations),
            "zh_Hans": lookup_translation(key, zh_translations),
        }
    return result


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate vehicle-only key_to_uex_ids_and_i18n.json from vehicle UEX key maps."
    )
    parser.add_argument("--vehicle-keys", default=DEFAULT_VEHICLE_KEY_PATH, type=Path)
    parser.add_argument("--vehicles-en", default=DEFAULT_VEHICLE_EN_PATH, type=Path)
    parser.add_argument("--vehicles-zh", default=DEFAULT_VEHICLE_ZH_PATH, type=Path)
    parser.add_argument("--output", default=DEFAULT_OUTPUT_PATH, type=Path)
    return parser.parse_args()


def main():
    args = parse_args()
    vehicle_keys = load_json(args.vehicle_keys)
    en_translations = load_json(args.vehicles_en)
    zh_translations = load_json(args.vehicles_zh)

    result = build_vehicle_items(vehicle_keys, en_translations, zh_translations)
    write_json(args.output, result)

    missing_en = sum(1 for key, entry in result.items() if entry["en"] == key)
    missing_zh = sum(1 for key, entry in result.items() if entry["zh_Hans"] == key)
    print(f"Vehicle entries: {len(result)}")
    print(f"Entries without English fallback: {missing_en}")
    print(f"Entries without Chinese fallback: {missing_zh}")


if __name__ == "__main__":
    main()
