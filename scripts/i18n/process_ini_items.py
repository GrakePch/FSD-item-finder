import argparse
import json
from pathlib import Path

script_dir = Path(__file__).resolve().parent
repo_root = script_dir.parent.parent

parser = argparse.ArgumentParser(description="Generate item i18n JSON from Star Citizen INI files.")
parser.add_argument("--en", default=repo_root / "src" / "data" / "en.ini", type=Path, help="Path to the English INI file.")
parser.add_argument("--zh", default=repo_root / "src" / "data" / "zh-Hans.ini", type=Path, help="Path to the Simplified Chinese INI file.")
parser.add_argument(
    "--output-en",
    default=repo_root / "src" / "i18n" / "items" / "en.json",
    type=Path,
    help="Path to write the generated English item i18n JSON.",
)
parser.add_argument(
    "--output-zh",
    default=repo_root / "src" / "i18n" / "items" / "zh.json",
    type=Path,
    help="Path to write the generated Simplified Chinese item i18n JSON.",
)
args = parser.parse_args()

# Only include keys that start with any of these
initials = ["item_Name", "item_decoration", "item_Mining"]
initials.reverse()

def ini_to_dict(filepath, initials):
    result = {}
    with open(filepath, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, value = line.split("=", 1)
                key = key.strip()
                # Only include keys that start with any initial
                if any(key.startswith(initial) for initial in initials):
                    result[key] = value.strip()
    return result

en_dict = ini_to_dict(args.en, initials)
zh_dict = ini_to_dict(args.zh, initials)

args.output_en.parent.mkdir(parents=True, exist_ok=True)
args.output_zh.parent.mkdir(parents=True, exist_ok=True)

with open(args.output_en, "w", encoding="utf-8") as f:
    json.dump(en_dict, f, indent=4, ensure_ascii=False)

with open(args.output_zh, "w", encoding="utf-8") as f:
    json.dump(zh_dict, f, indent=4, ensure_ascii=False)

print(f"Results have been saved to '{args.output_en}' and '{args.output_zh}'.")
