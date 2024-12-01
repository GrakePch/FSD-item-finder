import json

input_file_path = "raw.json"
with open(input_file_path, "r", encoding="utf-8") as infile:
    data = json.load(infile)

for uuid, item in data.items():
    item["name"]["en"] = item["name"]["en"].replace("\u00a0", " ")
    item["name"]["zh"] = item["name"]["zh"].replace("\u00a0", " ")
    if "series" in item:
        del item["series"]

for uuid, item in data.items():

    if item["type"]["en"] == "Personal Weapons/Personal Weapons":
        item["variants"] = []
        name = item["name"]["en"].split(" ")[0]

        for uuid2, item2 in data.items():
            if item2["type"]["en"] == "Personal Weapons/Personal Weapons":
                name2 = item2["name"]["en"].split(" ")[0]
                if name == name2:
                    item["variants"].append(uuid2)

    if item["type"]["en"].startswith("Armor/"):
        item["variants"] = []
        name = " ".join(item["name"]["en"].split(" ")[:2])

        for uuid2, item2 in data.items():
            if item2["type"]["en"].startswith("Armor/"):
                name2 = " ".join(item2["name"]["en"].split(" ")[:2])
                if name == name2:
                    item["variants"].append(uuid2)

    if item["type"]["en"].startswith("Undersuits/"):
        item["variants"] = []
        name = " ".join(item["name"]["en"].split(" ")[:2])

        for uuid2, item2 in data.items():
            if item2["type"]["en"].startswith("Undersuits/"):
                name2 = " ".join(item2["name"]["en"].split(" ")[:2])
                if name == name2:
                    item["variants"].append(uuid2)


output_file_path = "item_data.json"
with open(output_file_path, "w", encoding="utf-8") as outfile:
    json.dump(data, outfile, ensure_ascii=False, indent=4)

print(f"Processed data has been saved to {output_file_path}")
