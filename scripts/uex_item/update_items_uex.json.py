import argparse
import asyncio
import json
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


API_BASE = "https://api.uexcorp.space/2.0"
CONCURRENCY = 6
RETRIES = 3
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[1]
OUTPUT_PATH = REPO_ROOT / "public" / "data" / "items.json"
DEFAULT_ITEM_KEY_PATH = REPO_ROOT / ".tmp" / "uex_item" / "itemkey_id.json"
DEFAULT_ITEM_TYPE_PATH = SCRIPT_DIR / "item_type.json"
DEFAULT_TYPE_MAP_PATH = SCRIPT_DIR / "type_map_full_items.json"


def fetch_json_sync(url):
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "fsd-item-finder-data-updater/1.0",
        },
    )
    with urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


async def fetch_json(resource, params=None):
    query = f"?{urlencode(params)}" if params else ""
    url = f"{API_BASE}/{resource}{query}"
    last_error = None

    for attempt in range(1, RETRIES + 1):
        try:
            payload = await asyncio.to_thread(fetch_json_sync, url)
            status = payload.get("status")
            if status != "ok":
                raise RuntimeError(f"{url} returned status={status!r}")
            return payload
        except (HTTPError, URLError, TimeoutError, RuntimeError) as error:
            last_error = error
            if attempt == RETRIES:
                break
            await asyncio.sleep(2 ** (attempt - 1))

    raise RuntimeError(f"Failed to fetch {url}: {last_error}") from last_error


async def fetch_categories():
    response = await fetch_json("categories", {"type": "item"})
    return response.get("data") or []


async def fetch_items(category_id):
    response = await fetch_json("items", {"id_category": category_id})
    return response.get("data") or []


async def fetch_item_attributes(category_id):
    response = await fetch_json("items_attributes", {"id_category": category_id})
    return response.get("data") or []


def build_attribute_lookup(attributes):
    lookup = {}
    for attr in attributes:
        item_id = attr.get("id_item")
        attr_id = attr.get("id_category_attribute")
        value = attr.get("value")
        if item_id is None or attr_id is None or value is None:
            continue
        lookup.setdefault(item_id, {})[str(attr_id)] = value
    return lookup


def normalize_uex_item(item, attributes_by_item=None, existing_screenshots=None):
    item_id = item.get("id")
    existing_screenshots = existing_screenshots or {}
    attributes_by_item = attributes_by_item or {}
    return {
        "id": item_id,
        "section": item.get("section"),
        "category": item.get("category"),
        "slug": item.get("slug"),
        "screenshot": item.get("screenshot") or existing_screenshots.get(item_id) or None,
        "attributes": item.get("attributes") or attributes_by_item.get(item_id, {}),
    }


def load_json(path, default):
    if not path or not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8-sig"))


def load_existing_catalog(path):
    catalog = load_json(path, [])
    if isinstance(catalog, dict):
        catalog = list(catalog.values())
    return catalog if isinstance(catalog, list) else []


def load_existing_screenshots(existing_catalog):
    screenshots = {}
    for item in existing_catalog:
        screenshot = item.get("screenshot")
        if not screenshot:
            continue
        ids = item.get("ids") or [item.get("id") or item.get("id_item")]
        for item_id in ids:
            if item_id is not None:
                screenshots[item_id] = screenshot
    return screenshots


async def fetch_item_metadata(existing_screenshots):
    categories = await fetch_categories()
    game_categories = [
        category
        for category in categories
        if category.get("type") == "item" and category.get("is_game_related")
    ]
    semaphore = asyncio.Semaphore(CONCURRENCY)
    items_all = []

    async def process_category(category):
        async with semaphore:
            category_id = category["id"]
            print(f"Processing category: {category['name']} ({category_id})")
            items, attributes = await asyncio.gather(
                fetch_items(category_id),
                fetch_item_attributes(category_id),
            )
            attributes_by_item = build_attribute_lookup(attributes)
            return [
                normalize_uex_item(item, attributes_by_item, existing_screenshots)
                for item in items
            ]

    for category_items in await asyncio.gather(
        *(process_category(category) for category in game_categories)
    ):
        items_all.extend(category_items)

    items_all.sort(key=lambda item: item.get("id") or 0)
    print(f"Categories: {len(game_categories)}")
    print(f"Total UEX metadata items: {len(items_all)}")
    return items_all


def normalize_ids(value):
    ids = []
    for item_id in value.get("id") or value.get("ids") or []:
        try:
            normalized = int(item_id)
        except (TypeError, ValueError):
            continue
        if normalized not in ids:
            ids.append(normalized)
    return ids


def resolve_type(key, uex_metadata, item_type_by_key, type_map):
    item_type = uex_metadata.get("section") if uex_metadata else None
    item_sub_type = uex_metadata.get("category") if uex_metadata else None

    if item_sub_type == "Jump Modules":
        item_type = "Systems"
    elif item_sub_type == "Undersuits":
        item_type = "Armor"

    if not item_type or not item_sub_type:
        legacy_type = item_type_by_key.get(key, {}).get("Type")
        mapped_type, mapped_sub_type = type_map.get(legacy_type, [None, None])
        item_type = item_type or mapped_type
        item_sub_type = item_sub_type or mapped_sub_type

    return item_type, item_sub_type


def build_catalog(item_keys, metadata_items, item_types, type_map, existing_catalog):
    metadata_by_id = {item["id"]: item for item in metadata_items if item.get("id") is not None}
    existing_by_key = {item.get("key"): item for item in existing_catalog if item.get("key")}
    item_type_by_key = {item.get("key"): item for item in item_types if item.get("key")}
    catalog = []

    for key, uex_ids_info in sorted(item_keys.items(), key=lambda entry: entry[0]):
        if key.startswith("vehicle_Name"):
            continue

        ids = normalize_ids(uex_ids_info)
        first_id = ids[0] if ids else None
        uex_metadata = metadata_by_id.get(first_id) or {}
        existing_item = existing_by_key.get(key) or {}
        item_type, item_sub_type = resolve_type(key, uex_metadata, item_type_by_key, type_map)

        catalog.append(
            {
                "key": key,
                "ids": ids,
                "type": item_type,
                "sub_type": item_sub_type,
                "slug": uex_metadata.get("slug") or existing_item.get("slug"),
                "screenshot": uex_metadata.get("screenshot") or existing_item.get("screenshot"),
                "attributes": uex_metadata.get("attributes") or existing_item.get("attributes") or {},
            }
        )

    return catalog


def validate_catalog(catalog):
    if not catalog:
        raise RuntimeError("No item catalog entries were generated")

    forbidden_fields = {"name", "name_zh_Hans", "sortName"}
    invalid_entries = [
        item["key"]
        for item in catalog
        if any(field in item for field in forbidden_fields)
    ]
    if invalid_entries:
        preview = ", ".join(invalid_entries[:10])
        raise RuntimeError(f"Generated catalog contains i18n/display fields: {preview}")

    invalid_id_entries = [item["key"] for item in catalog if "id_item" in item]
    if invalid_id_entries:
        preview = ", ".join(invalid_id_entries[:10])
        raise RuntimeError(f"Generated catalog contains deprecated id_item field: {preview}")


def print_quality_report(catalog, metadata_items):
    catalog_ids = {
        item_id
        for item in catalog
        for item_id in item.get("ids") or []
    }
    metadata_ids = {item["id"] for item in metadata_items if item.get("id") is not None}
    missing_metadata_ids = sorted(catalog_ids - metadata_ids)
    no_id = sum(1 for item in catalog if not item.get("ids"))
    no_type = sum(1 for item in catalog if not item.get("type") or not item.get("sub_type"))
    no_screenshot = sum(1 for item in catalog if not item.get("screenshot"))
    no_attributes = sum(1 for item in catalog if not item.get("attributes"))

    print("Quality report:")
    print(f"  Catalog items: {len(catalog)}")
    print(f"  Catalog UEX ids: {len(catalog_ids)}")
    print(f"  Catalog ids missing from UEX metadata: {len(missing_metadata_ids)}")
    if missing_metadata_ids:
        preview = ", ".join(str(item_id) for item_id in missing_metadata_ids[:25])
        print(f"  Missing metadata id preview: {preview}")
    print(f"  Items without UEX ids: {no_id}")
    print(f"  Items without type/sub_type: {no_type}")
    print(f"  Items without screenshot: {no_screenshot}")
    print(f"  Items without attributes: {no_attributes}")


def parse_args():
    parser = argparse.ArgumentParser(description="Generate runtime item catalog JSON.")
    parser.add_argument("--item-keys", default=DEFAULT_ITEM_KEY_PATH, type=Path, help="Path to key-to-UEX-id JSON.")
    parser.add_argument("--item-types", default=DEFAULT_ITEM_TYPE_PATH, type=Path, help="Path to legacy item type JSON.")
    parser.add_argument("--type-map", default=DEFAULT_TYPE_MAP_PATH, type=Path, help="Path to legacy type remap JSON.")
    parser.add_argument("--metadata-source", type=Path, help="Path to a pre-fetched UEX item metadata JSON.")
    parser.add_argument("--existing-catalog", default=OUTPUT_PATH, type=Path, help="Path to the existing item catalog.")
    parser.add_argument("--output", default=OUTPUT_PATH, type=Path, help="Path to write the runtime item catalog.")
    return parser.parse_args()


async def main():
    args = parse_args()
    item_keys = load_json(args.item_keys, {})
    item_types = load_json(args.item_types, [])
    type_map = load_json(args.type_map, {})
    existing_catalog = load_existing_catalog(args.existing_catalog)
    existing_screenshots = load_existing_screenshots(existing_catalog)

    if args.metadata_source:
        metadata_items = [
            normalize_uex_item(item, existing_screenshots=existing_screenshots)
            for item in load_existing_catalog(args.metadata_source)
        ]
    else:
        metadata_items = await fetch_item_metadata(existing_screenshots)

    catalog = build_catalog(item_keys, metadata_items, item_types, type_map, existing_catalog)
    validate_catalog(catalog)
    print_quality_report(catalog, metadata_items)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(catalog, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    started_at = time.time()
    asyncio.run(main())
    print(f"Wrote item catalog in {time.time() - started_at:.1f}s")
