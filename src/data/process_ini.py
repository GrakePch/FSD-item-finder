import json

# Define the input and output file names
input_file = "en.ini"
output_file = "items_key_to_name.json"
output_file_2 = "items_name_to_key.json"

# Initialize an empty dictionary to store filtered entries
filtered_entries = {}
filtered_entries_2 = {}

keyStarts = ["item_Name", "item_decoration"]

# Read the content of the ini file
with open(input_file, "r", encoding="utf-8") as file:
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

            for ks in keyStarts:
                if key.startswith(ks):
                    short_key = key[len(ks):]
                    if len(short_key) == 0: continue
                    if len(value) == 0: continue
                    if short_key[0] == "_": short_key = short_key[1:]
                    value = value.replace("\u00a0", " ").replace("\"", "'").replace("“", "'").replace("”", "'")
                    filtered_entries[short_key] = value
                    filtered_entries_2[value] = short_key

# Write the filtered entries to a JSON file
with open(output_file, "w", encoding="utf-8") as json_file:
    json.dump(filtered_entries, json_file, indent=4)

print(f"Filtered entries have been saved to '{output_file}'.")

with open(output_file_2, "w", encoding="utf-8") as json_file:
    json.dump(filtered_entries_2, json_file, indent=4)

print(f"Filtered entries have been saved to '{output_file_2}'.")
