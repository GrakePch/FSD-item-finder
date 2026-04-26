import argparse
import csv
import json
from pathlib import Path
from urllib.request import urlopen


BODIES_CSV_URL = "https://raw.githubusercontent.com/dydrmr/VerseTime/main/data/bodies.csv"
LOCATIONS_CSV_URL = "https://raw.githubusercontent.com/dydrmr/VerseTime/main/data/locations.csv"
OM_RADIUS_PATH = Path(__file__).with_name("om_radius_by_body.json")


def parse_float(value, default=None):
    if value in (None, ""):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def parse_int(value, default=-1):
    if value in (None, ""):
        return default
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def read_csv_url(url):
    with urlopen(url) as response:
        text = response.read().decode("utf-8-sig")
    return list(csv.DictReader(text.splitlines()))


def load_om_radius_by_name():
    with OM_RADIUS_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def process_body(row, om_radius_by_name):
    result = {
        "name": row["name"],
        "type": row["type"],
        "parentBody": row["parentBody"] or None,
        "parentStar": row["parentStar"] or None,
        "coordinateX": parse_float(row["coordinateX"]),
        "coordinateY": parse_float(row["coordinateY"]),
        "coordinateZ": parse_float(row["coordinateZ"]),
    }

    extra_fields = [
        "ordinal",
        "quaternionW",
        "quaternionX",
        "quaternionY",
        "quaternionZ",
        "bodyRadius",
        "omRadius",
        "rotationRate",
        "rotationCorrection",
        "orbitAngle",
        "orbitRadius",
        "ringRadiusInner",
        "ringRadiusOuter",
        "themeColorR",
        "themeColorG",
        "themeColorB",
    ]
    for field in extra_fields:
        value = row.get(field)
        if value in (None, ""):
            continue
        if (
            field.startswith("themeColor")
            or "quaternion" in field
            or "Radius" in field
            or "Rate" in field
            or "Correction" in field
            or "Angle" in field
        ):
            result[field] = parse_float(value)
        else:
            result[field] = value

    if result["name"] in om_radius_by_name and "omRadius" not in result:
        result["omRadius"] = om_radius_by_name[result["name"]]
    return result


def process_location(row):
    return {
        "name": row["name"],
        "type": row["type"],
        "parentBody": row["parentBody"],
        "parentStar": row["parentStar"],
        "coordinateX": parse_float(row.get("coordinateX"), 0.0),
        "coordinateY": parse_float(row.get("coordinateY"), 0.0),
        "coordinateZ": parse_float(row.get("coordinateZ"), 0.0),
        "wikiLink": row.get("wikiLink") or None,
        "private": parse_int(row.get("private")),
        "quantum": parse_int(row.get("quantum")),
    }


def write_json(path, data, indent):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=indent)


def main():
    parser = argparse.ArgumentParser(description="Update generated location JSON data.")
    parser.add_argument(
        "--output-dir",
        default=Path("src/data"),
        type=Path,
        help="Directory where bodies.json and locations.json should be written.",
    )
    args = parser.parse_args()

    om_radius_by_name = load_om_radius_by_name()
    bodies = [process_body(row, om_radius_by_name) for row in read_csv_url(BODIES_CSV_URL)]
    locations = [process_location(row) for row in read_csv_url(LOCATIONS_CSV_URL)]

    write_json(args.output_dir / "bodies.json", bodies, indent=2)
    write_json(args.output_dir / "locations.json", locations, indent=4)

    print(f"Processed {len(bodies)} bodies and {len(locations)} locations.")


if __name__ == "__main__":
    main()
