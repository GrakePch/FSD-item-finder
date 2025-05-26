import csv
import json
import os

# Paths
csv_path = os.path.join(os.path.dirname(__file__), 'bodies.csv')
json_path = os.path.join(os.path.dirname(__file__), 'bodies.json')

# Read CSV
def read_bodies_csv():
    with open(csv_path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def parse_float(val):
    try:
        return float(val)
    except (ValueError, TypeError):
        return None

def parse_int(val):
    try:
        return int(val)
    except (ValueError, TypeError):
        return None

def process_row(row):
    # Basic fields
    result = {
        'name': row['name'],
        'type': row['type'],
        'parentBody': row['parentBody'] or None,
        'parentStar': row['parentStar'] or None,
        'coordinateX': parse_float(row['coordinateX']),
        'coordinateY': parse_float(row['coordinateY']),
        'coordinateZ': parse_float(row['coordinateZ']),
    }
    # Add any extra attributes from CSV that are not in bodies.json
    # (ordinal, quaternion, bodyRadius, rotationRate, rotationCorrection, orbitAngle, orbitRadius, ringRadiusInner, ringRadiusOuter, themeColorR/G/B)
    extra_fields = [
        'ordinal', 'quaternionW', 'quaternionX', 'quaternionY', 'quaternionZ',
        'bodyRadius', 'rotationRate', 'rotationCorrection', 'orbitAngle', 'orbitRadius',
        'ringRadiusInner', 'ringRadiusOuter', 'themeColorR', 'themeColorG', 'themeColorB'
    ]
    for field in extra_fields:
        val = row.get(field)
        if val is not None and val != '':
            # Try to parse as float if possible
            if field.startswith('themeColor') or 'quaternion' in field or 'Radius' in field or 'Rate' in field or 'Correction' in field or 'Angle' in field:
                result[field] = parse_float(val)
            else:
                result[field] = val
    return result

def main():
    rows = read_bodies_csv()
    processed = [process_row(row) for row in rows]
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)
    print(f"Processed {len(processed)} bodies to {json_path}")

if __name__ == '__main__':
    main()
