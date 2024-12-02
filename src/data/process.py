import json

input_file_path = "raw.json"
with open(input_file_path, "r", encoding="utf-8") as infile:
    data = json.load(infile)

for uuid, item in data.items():
    item["name"]["en"] = item["name"]["en"].replace("\u00a0", " ")
    item["name"]["zh"] = item["name"]["zh"].replace("\u00a0", " ")
    if "series" in item:
        del item["series"]

checkTypeList = [
    "Personal Weapons/Personal Weapons",
    "Undersuits/Undersuits",
    "Armor/Helmets",
    "Armor/Torso",
    "Armor/Arms",
    "Armor/Legs",
    "Armor/Backpacks",
]

for uuid, item in data.items():

    for checkType in checkTypeList:
        if item["type"]["en"] == checkType:
            del item["variants"]
            vlist = []
            name = item["name"]["en"].split(" ")[0]

            for uuid2, item2 in data.items():
                if item2["type"]["en"] == checkType:
                    name2 = item2["name"]["en"].split(" ")[0]
                    if name == name2:
                        vlist.append(uuid2)
            if len(vlist) > 1:
                item["variants"] = vlist


output_file_path = "item_data.json"
with open(output_file_path, "w", encoding="utf-8") as outfile:
    json.dump(data, outfile, ensure_ascii=False, indent=4)

print(f"Processed data has been saved to {output_file_path}")
