import json

f_en = "en.ini"
f_zh = "zh-Hans.ini"
output_file = "i18n_vehicles.json"

locKeyToEn = {}
locKeyToZh = {}
keyPriorities = {}
locEnToZh = {}

# Priority: low to high
initials = ["vehicle_Name"]
initials.reverse()

dropEnds = ["desc", "entrance", "desc_shared"]

with open(f_en, "r", encoding="utf-8") as file:
    for line in file:
        # Skip empty lines and comments
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        # Parse the line into key-value pairs
        if "=" in line:
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip()
            
            skip = False
            for (dropEnd) in dropEnds:
                if (key.lower().endswith(dropEnd)):
                    skip = True
                    break
            if skip: continue
            
            for idx, initial in enumerate(initials):
                if (key.startswith(initial)):
                    locKeyToEn[key] = value
                    keyPriorities[key] = idx
                    break
            
with open(f_zh, "r", encoding="utf-8") as file:
    for line in file:
        # Skip empty lines and comments
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        # Parse the line into key-value pairs
        if "=" in line:
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip()
            
            skip = False
            for (dropEnd) in dropEnds:
                if (key.lower().endswith(dropEnd)):
                    skip = True
                    break
            if skip: continue

            for idx, initial in enumerate(initials):
                if (key.startswith(initial)):
                    locKeyToZh[key] = value
                    break

    
for (k, v) in locKeyToEn.items():
    
    # Check Priority
    if v.lower() in locEnToZh:
        if keyPriorities[k] < keyPriorities[locEnToZh[v.lower()]["key"]]:
            continue
                
    
    zh = locKeyToZh.get(k)
    sliceIdx = zh.find("[")
    zh = zh[:sliceIdx] if sliceIdx != -1 else zh

    locEnToZh[v.lower()] = {
        "key": k,
        "zh": zh,
        "en": v
    }
    
with open(output_file, "w", encoding="utf-8") as json_file:
    json.dump(locEnToZh, json_file, indent=4, ensure_ascii=False)

print(f"Results have been saved to '{output_file}'.")