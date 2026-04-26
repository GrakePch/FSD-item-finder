import { fetchWithCache } from "./apiFetch";
import { date4_0 } from "../utils";

let itemCatalogPromise: Promise<ItemCatalogEntry[]> | null = null;

async function fetchItemCatalog(): Promise<ItemCatalogEntry[]> {
  if (!itemCatalogPromise) {
    itemCatalogPromise = fetch("/data/items.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load item catalog: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        itemCatalogPromise = null;
        throw error;
      });
  }
  return itemCatalogPromise;
}

export async function fetchAndProcessItems(): Promise<ItemDictionary> {
  const dictSimpleItems: SimpleItemOptionsDictionary = {};
  const [itemCatalog, res] = await Promise.all([
    fetchItemCatalog(),
    fetchWithCache(
      "items_prices_all",
      "https://api.uexcorp.space/2.0/items_prices_all"
    ),
  ]);

  for (const item of res.data) {
    let id = item.id_item;
    if (!dictSimpleItems[id]) {
      dictSimpleItems[id] = {
        options: [],
      };
    }
    dictSimpleItems[id].options.push({
      id_terminal: item.id_terminal,
      price_buy: item.price_buy || Infinity,
      price_sell: item.price_sell || 0,
      price_rent: null,
      date_modified: item.date_modified,
    });
  }

  const dictItems: ItemDictionary = {};
  for (const catalogItem of itemCatalog) {
    dictItems[catalogItem.key] = {
      key: catalogItem.key,
      type: catalogItem.type,
      sub_type: catalogItem.sub_type,
      screenshot: catalogItem.screenshot,
      slug: catalogItem.slug,
      ids: catalogItem.ids || [],
      price_min_max: {
        buy_min: null,
        buy_max: null,
        sell_min: null,
        sell_max: null,
        rent_min: null,
        rent_max: null,
      },
      options: [],
      attributes: catalogItem.attributes,
    } as Item;

    const optionDict: Record<number, TradeOption> = {};
    for (const id of catalogItem.ids || []) {
      if (!dictSimpleItems[id]) continue;
      for (const option of dictSimpleItems[id].options) {
        if (!optionDict[option.id_terminal]) {
          optionDict[option.id_terminal] = { ...option };
        } else {
          optionDict[option.id_terminal].price_buy = Math.min(
            optionDict[option.id_terminal].price_buy,
            option.price_buy
          );
          optionDict[option.id_terminal].price_sell = Math.max(
            optionDict[option.id_terminal].price_sell,
            option.price_sell
          );
        }
      }
    }

    dictItems[catalogItem.key].options = Object.values(optionDict);
    dictItems[catalogItem.key].options.forEach((option) => {
      if (option.price_buy === Infinity) option.price_buy = null;
      if (option.price_sell === 0) option.price_sell = null;
    });
  }

  Object.values(dictItems).forEach((item) => {
    let pricesBuy = item.options
      .filter((a) => a.price_buy !== null && a.date_modified >= date4_0)
      .map((a) => a.price_buy);
    let pricesSell = item.options
      .filter((a) => a.price_sell !== null && a.date_modified >= date4_0)
      .map((a) => a.price_sell);
    let pricesRent: number[] = [];
    if ("options_rent" in item && Array.isArray(item.options_rent)) {
      pricesRent =
        item.options_rent
          .filter((a) => a.price_rent !== null && a.date_modified >= date4_0)
          .map((a) => a.price_rent) || [];
    }
    item.price_min_max = {
      buy_min: Math.min(...pricesBuy) || null,
      buy_max: Math.max(...pricesBuy) || null,
      sell_min: Math.min(...pricesSell) || null,
      sell_max: Math.max(...pricesSell) || null,
      rent_min: Math.min(...pricesRent) || null,
      rent_max: Math.max(...pricesRent) || null,
    } as PriceMinMax;
  });

  return dictItems;
}
