import argparse
import json
from pathlib import Path

script_dir = Path(__file__).resolve().parent
repo_root = script_dir.parent.parent
manual_en = {
    "Shop Terminal": "Shop Terminal",
    "Mining Center": "Mining Center",
    "Supplies": "Supplies",
    "Last Landings Store": "Last Landings Store",
    "FPS Shop": "FPS Shop",
    "Equipment Contested Zone Checkmate": "Equipment Contested Zone Checkmate",
    "IO North Tower": "IO North Tower",
    "mission_location_stanton_0120": "Covalex Station Gundo",
    "stanton2_security_kareah": "Security Post Kareah",
    "stanton2_security_kareah_desc": "A brand new outpost built to house an extended Crusader Security presence in this sector. It is expected to be open and operating soon.",
}
manual_zh = {
    "Shop Terminal": "商店终端",
    "Mining Center": "采矿中心",
    "Supplies": "补给",
    "Last Landings Store": "终陆镇商店",
    "FPS Shop": "FPS 商店",
    "Equipment Contested Zone Checkmate": "Equipment Contested Zone Checkmate",
    "IO North Tower": "IO North Tower",
    "mission_location_stanton_0120": "科瓦莱什货运站-贡多",
    "stanton2_security_kareah": "加利亚安保站",
    "stanton2_security_kareah_desc": "为了延伸十字军安保在此区域内的存在感而新建成的前哨站。预计该站很快会开放并投入运营。",
}

parser = argparse.ArgumentParser(description="Generate location i18n JSON from Star Citizen INI files.")
parser.add_argument("--en", default=repo_root / "src" / "data" / "en.ini", type=Path, help="Path to the English INI file.")
parser.add_argument("--zh", default=repo_root / "src" / "data" / "zh-Hans.ini", type=Path, help="Path to the Simplified Chinese INI file.")
parser.add_argument(
    "--output-en",
    default=repo_root / "src" / "i18n" / "locations" / "en.json",
    type=Path,
    help="Path to write the generated English location i18n JSON.",
)
parser.add_argument(
    "--output-zh",
    default=repo_root / "src" / "i18n" / "locations" / "zh.json",
    type=Path,
    help="Path to write the generated Simplified Chinese location i18n JSON.",
)
args = parser.parse_args()

# Only include keys that start with any of these
initials = ["Stanton", "Pyro", "RR", "shop_name", "area", "ui_dest", "Orison_Destination"]
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

def merge_manual_and_generated(manual, generated):
    result = dict(manual)
    result.update(generated)
    return result

en_dict = merge_manual_and_generated(manual_en, ini_to_dict(args.en, initials))
zh_dict = merge_manual_and_generated(manual_zh, ini_to_dict(args.zh, initials))

args.output_en.parent.mkdir(parents=True, exist_ok=True)
args.output_zh.parent.mkdir(parents=True, exist_ok=True)

with open(args.output_en, "w", encoding="utf-8") as f:
    json.dump(en_dict, f, indent=4, ensure_ascii=False)

with open(args.output_zh, "w", encoding="utf-8") as f:
    json.dump(zh_dict, f, indent=4, ensure_ascii=False)

print(f"Results have been saved to '{args.output_en}' and '{args.output_zh}'.")
