import pandas as pd
import json
import math

# Load the CSV file
file_path = 'locations.csv'  # Replace with the path to your CSV file
data = pd.read_csv(file_path)

def parse_int(value):
    try:
        return int(value)
    except ValueError:
        return None
    

data['quantum'] = data['quantum'].apply(parse_int)

data['coordinateX'] = data['coordinateX'].where(pd.notna(data['coordinateX']), 0)
data['coordinateY'] = data['coordinateY'].where(pd.notna(data['coordinateY']), 0)
data['coordinateZ'] = data['coordinateZ'].where(pd.notna(data['coordinateZ']), 0)
data['private'] = data['private'].where(pd.notna(data['private']), -1)
data['private'] = data['private'].astype(int)
data['quantum'] = data['quantum'].where(pd.notna(data['quantum']), -1)
data['quantum'] = data['quantum'].astype(int)
data['wikiLink'] = data['wikiLink'].where(pd.notna(data['wikiLink']), None)

# Convert the dataframe to the desired JSON format
json_output = [
    {
        "name": row['name'],
        "type": row['type'],
        "parentBody": row['parentBody'],
        "parentStar": row['parentStar'],
        "coordinateX": row['coordinateX'],
        "coordinateY": row['coordinateY'],
        "coordinateZ": row['coordinateZ'],
        "wikiLink": row['wikiLink'],
        "private": row['private'],
        "quantum": row['quantum'],
    }
    for _, row in data.iterrows()
]

# Save the JSON to a file
output_path = 'locations.json'  # Replace with your desired output file path
with open(output_path, 'w') as f:
    json.dump(json_output, f, indent=4)

print(f"JSON file saved to {output_path}")
