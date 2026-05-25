import argparse
import json
import re
from pathlib import Path

script_dir = Path(__file__).resolve().parent
repo_root = script_dir.parent.parent

parser = argparse.ArgumentParser(description="Generate vehicle class i18n JSON from Star Citizen INI files.")
parser.add_argument("--en", default=repo_root / "src" / "data" / "en.ini", type=Path, help="Path to the English INI file.")
parser.add_argument("--zh", default=repo_root / "src" / "data" / "zh-Hans.ini", type=Path, help="Path to the Simplified Chinese INI file.")
parser.add_argument(
    "--output-en",
    default=repo_root / "src" / "i18n" / "vehicle_classes" / "en.json",
    type=Path,
    help="Path to write the generated English vehicle class i18n JSON.",
)
parser.add_argument(
    "--output-zh",
    default=repo_root / "src" / "i18n" / "vehicle_classes" / "zh.json",
    type=Path,
    help="Path to write the generated Simplified Chinese vehicle class i18n JSON.",
)
parser.add_argument(
    "--vehicle-index",
    default=repo_root / "src" / "data" / "vehicles" / "vehicle_index.json",
    type=Path,
    help="Path to the generated vehicle index used to derive role aliases.",
)
args = parser.parse_args()

class_initials = ("vehicle_class",)
alias_source_initials = (
    "vehicle_class",
    "vehicle_focus",
    "item_ShipClass",
    "item_ShipFocus",
    "vehicle_Type",
    "vehicle_Faction",
)

manual_aliases = {
    "Armored Cargo": ("Armored Cargo", "装甲货运"),
    "Boarding": ("Boarding", "登舰"),
    "Competition": ("Competition", "竞赛"),
    "Ground construction": ("Ground Construction", "地面建造"),
    "Heavy Construction": ("Heavy Construction", "重型建造"),
    "Heavy Dropship": ("Heavy Dropship", "重型空投"),
    "Medium Repair / Medium Refuel": ("Medium Repair / Medium Refuel", "中型维修 / 中型加油"),
    "Minelayer": ("Minelayer", "布雷"),
    "Mining and Refining": ("Mining and Refining", "采矿与精炼"),
    "Mobile Refinery": ("Mobile Refinery", "移动精炼"),
    "Multi-role / Light carrier": ("Multi-Role / Light Carrier", "多用途 / 轻型航母"),
    "Passenger Transport": ("Passenger Transport", "客运"),
}


def role_to_key(role):
    return re.sub(r"[^a-z0-9]", "", role.lower())


def normalized_value(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())


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
                if any(key.startswith(initial) for initial in initials):
                    result[key] = value.strip()
    return result


def read_vehicle_roles(filepath):
    vehicles = json.loads(filepath.read_text(encoding="utf-8"))
    return sorted(
        {
            value.strip()
            for vehicle in vehicles
            for value in (vehicle.get("Role", ""), vehicle.get("Career", ""))
            if value.strip()
        }
    )


def build_value_index(en_source_dict, zh_source_dict):
    result = {}
    for key, en_value in en_source_dict.items():
        zh_value = zh_source_dict.get(key)
        if not zh_value:
            continue
        result.setdefault(normalized_value(en_value), (en_value, zh_value))
    return result


en_dict = ini_to_dict(args.en, class_initials)
zh_dict = ini_to_dict(args.zh, class_initials)
en_alias_sources = ini_to_dict(args.en, alias_source_initials)
zh_alias_sources = ini_to_dict(args.zh, alias_source_initials)
source_value_index = build_value_index(en_alias_sources, zh_alias_sources)

for role in read_vehicle_roles(args.vehicle_index):
    key = "vehicle_class_" + role_to_key(role)
    if key in en_dict and key in zh_dict:
        continue

    source_values = source_value_index.get(normalized_value(role))
    if source_values:
        en_dict[key], zh_dict[key] = source_values
        continue

    manual_values = manual_aliases.get(role)
    if manual_values:
        en_dict[key], zh_dict[key] = manual_values

args.output_en.parent.mkdir(parents=True, exist_ok=True)
args.output_zh.parent.mkdir(parents=True, exist_ok=True)

with open(args.output_en, "w", encoding="utf-8") as f:
    json.dump(en_dict, f, indent=4, ensure_ascii=False)

with open(args.output_zh, "w", encoding="utf-8") as f:
    json.dump(zh_dict, f, indent=4, ensure_ascii=False)

print(f"Results have been saved to '{args.output_en}' and '{args.output_zh}'.")
