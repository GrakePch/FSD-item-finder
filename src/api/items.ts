import { fetchWithCache } from "./apiFetch";

export async function fetchAndProcessItems() {
  let dictItem = {};
  try {
    const res = await fetchWithCache("items_prices_all", "https://api.uexcorp.space/2.0/items_prices_all");
    for (const item of res.data) {
      let id = item.id_item;
      if (!dictItem[id]) {
        dictItem[id] = {
          id_item: id,
          options: [],
        };
      }
      dictItem[id].options.push({
        id_terminal: item.id_terminal,
        price_buy: item.price_buy || Infinity,
        price_sell: item.price_sell || 0,
        date_modified: item.date_modified,
      });
    }
  } catch (err) {
    throw err;
  }
  return dictItem;
}

