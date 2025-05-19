import json

f_en = "en.ini"
f_zh = "zh-Hans.ini"
output_en = "en.json"
output_zh = "zh.json"

# Only include keys that start with any of these
initials = ["vehicle_class"]

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

en_dict = ini_to_dict(f_en, initials)
zh_dict = ini_to_dict(f_zh, initials)

with open(output_en, "w", encoding="utf-8") as f:
    json.dump(en_dict, f, indent=4, ensure_ascii=False)

with open(output_zh, "w", encoding="utf-8") as f:
    json.dump(zh_dict, f, indent=4, ensure_ascii=False)

print(f"Results have been saved to '{output_en}' and '{output_zh}'.")