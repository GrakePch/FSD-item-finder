import asyncio
import aiohttp
import json

async def fetch_categories():
    url = "https://uexcorp.space/api/2.0/categories"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def fetch_items(category_id):
    url = f"https://uexcorp.space/api/2.0/items?id_category={category_id}"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def main():
    # Fetch categories
    categories_response = await fetch_categories()
    categories = categories_response.get("data", [])

    temp_items_all = []

    async def process_category(category):
        print("Processing category:", category["name"], category["id"])
        items_response = await fetch_items(category["id"])
        if items_response.get("data"):
            temp_items_all.extend(items_response["data"])

    # Filter categories and fetch items concurrently
    tasks = [process_category(cate) for cate in categories if cate.get("is_game_related")]
    await asyncio.gather(*tasks)
    
    # Sort items by id
    temp_items_all.sort(key=lambda x: x.get("id", 0))
    
    print("Total items:", len(temp_items_all))

    # Save to JSON file
    with open("items_uex.json", "w", encoding="utf-8") as f:
        json.dump(temp_items_all, f, indent=4, ensure_ascii=False)

# Run the script
if __name__ == "__main__":
    asyncio.run(main())
