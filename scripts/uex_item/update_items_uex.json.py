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
OUTPUT_PATH = REPO_ROOT / "public" / "data" / "items_uex.json"
LEGACY_OUTPUT_PATH = REPO_ROOT / "src" / "data" / "items_uex.json"
ITEM_KEY_PATH = REPO_ROOT / "src" / "data" / "key_to_uex_id" / "itemkey_id.json"


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


def load_existing_screenshots():
    screenshots = {}
    for path in [LEGACY_OUTPUT_PATH, OUTPUT_PATH]:
        if not path.exists():
            continue
        try:
            items = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        for item in items:
            item_id = item.get("id")
            screenshot = item.get("screenshot")
            if item_id is not None and screenshot:
                screenshots[item_id] = screenshot
    return screenshots


def normalize_item(item, attributes_by_item, existing_screenshots):
    item_id = item.get("id")
    return {
        "id": item_id,
        "section": item.get("section"),
        "category": item.get("category"),
        "slug": item.get("slug"),
        "screenshot": item.get("screenshot") or existing_screenshots.get(item_id) or None,
        "attributes": attributes_by_item.get(item_id, {}),
    }


def validate_items(items):
    if not items:
        raise RuntimeError("No items were generated")

    required_fields = ["id", "section", "category", "slug"]
    invalid_items = [
        item.get("id")
        for item in items
        if any(item.get(field) is None for field in required_fields)
    ]
    if invalid_items:
        preview = ", ".join(str(item_id) for item_id in invalid_items[:10])
        raise RuntimeError(
            f"{len(invalid_items)} generated items are missing required fields: {preview}"
        )


def load_referenced_item_ids():
    if not ITEM_KEY_PATH.exists():
        return set()

    item_keys = json.loads(ITEM_KEY_PATH.read_text(encoding="utf-8"))
    ids = set()
    for value in item_keys.values():
        for item_id in value.get("id") or []:
            try:
                ids.add(int(item_id))
            except (TypeError, ValueError):
                continue
    return ids


def print_quality_report(items):
    item_ids = {item["id"] for item in items}
    referenced_ids = load_referenced_item_ids()
    missing_referenced_ids = sorted(referenced_ids - item_ids)
    empty_screenshots = sum(1 for item in items if not item["screenshot"])
    empty_attributes = sum(1 for item in items if not item["attributes"])

    print("Quality report:")
    print(f"  Referenced UEX item ids: {len(referenced_ids)}")
    print(f"  Referenced ids missing from generated metadata: {len(missing_referenced_ids)}")
    if missing_referenced_ids:
        preview = ", ".join(str(item_id) for item_id in missing_referenced_ids[:25])
        print(f"  Missing id preview: {preview}")
    print(f"  Items without screenshot: {empty_screenshots}")
    print(f"  Items without attributes: {empty_attributes}")


async def main():
    categories = await fetch_categories()
    game_categories = [
        category
        for category in categories
        if category.get("type") == "item" and category.get("is_game_related")
    ]
    semaphore = asyncio.Semaphore(CONCURRENCY)
    existing_screenshots = load_existing_screenshots()
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
                normalize_item(item, attributes_by_item, existing_screenshots)
                for item in items
            ]

    for category_items in await asyncio.gather(
        *(process_category(category) for category in game_categories)
    ):
        items_all.extend(category_items)

    items_all.sort(key=lambda item: item.get("id") or 0)
    validate_items(items_all)

    print(f"Categories: {len(game_categories)}")
    print(f"Total items: {len(items_all)}")
    print(f"Items with attributes: {sum(1 for item in items_all if item['attributes'])}")
    print_quality_report(items_all)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(items_all, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    started_at = time.time()
    asyncio.run(main())
    print(f"Wrote {OUTPUT_PATH} in {time.time() - started_at:.1f}s")
