import json
from collections import OrderedDict

def merge_duplicate_keys(file_path):
    merged_data = OrderedDict()  # Stores the merged key-values

    def track_keys(pairs):
        temp_dict = OrderedDict()  # Temporary dictionary to track duplicate keys
        for key, value in pairs:
            if key in temp_dict:
                # Merge "uex_ids"
                if "uex_ids" in value and isinstance(value["uex_ids"], list):
                    temp_dict[key]["uex_ids"] = sorted(set(temp_dict[key].get("uex_ids", []) + value["uex_ids"]))

                # Merge "type" and "subtype" if they exist and are not already present
                for field in ["type", "subtype"]:
                    if field in value and field not in temp_dict[key]:
                        temp_dict[key][field] = value[field]

                # "en" and "zh_Hans" remain unchanged
            else:
                temp_dict[key] = value  # Store the first occurrence

        merged_data.update(temp_dict)  # Update global merged data
        return temp_dict  # Return merged dictionary

    # Read JSON from file
    with open(file_path, "r", encoding="utf-8") as file:
        json.load(file, object_pairs_hook=track_keys)

    # Write the cleaned JSON back
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(merged_data, file, indent=4, ensure_ascii=False)

    return merged_data

# 📌 Change this to your JSON file path
json_file_path = "items_uex_ids_and_i18n.json"

# Process and update JSON
merged_json = merge_duplicate_keys(json_file_path)

# Print merged result
print(json.dumps(merged_json, indent=2, ensure_ascii=False))

