import { fetchWithCache } from "./apiFetch";
import itemsUexIdsAndI18n from "../data/items_uex_ids_and_i18n.json";
import { getItemUexFormat, mapToUEXTypeSubType, date4_0 } from "../utils";

export async function fetchAndProcessItems(): Promise<ItemDictionary> {
  const dictSimpleItems: SimpleItemOptionsDictionary = {};
  const res = await fetchWithCache(
    "items_prices_all",
    "https://api.uexcorp.space/2.0/items_prices_all"
  );
  for (const item of res.data) {
    let id = item.id_item;
    if (!dictSimpleItems[id]) {
      dictSimpleItems[id] = {
        id_item: id,
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

  /* Process to get the final results */
  const dictItems: ItemDictionary = {};
  for (const [key, uexIDsI18nTypes] of Object.entries(
    itemsUexIdsAndI18n as KeyToUexIdI18nTypes
  ))
    if (!key.startsWith("vehicle_Name")) {
      const firstId = uexIDsI18nTypes.uex_ids?.[0] as number;
      let itemUexFormat = getItemUexFormat(firstId);
      let type = itemUexFormat?.section;
      let subType = itemUexFormat?.category;
      if (subType == "Jump Modules") {
        type = "Systems";
      } else if (subType == "Undersuits") {
        type = "Armor";
      }
      if (!type || !subType) {
        let remapped = mapToUEXTypeSubType(uexIDsI18nTypes.type);
        type = type || remapped[0];
        subType = subType || remapped[1];
      }
      if (type === null && !uexIDsI18nTypes.uex_ids) continue;
      dictItems[key] = {
        key: key,
        name: uexIDsI18nTypes.en || key,
        name_zh_Hans: uexIDsI18nTypes.zh_Hans || key,
        type: type,
        sub_type: subType,
        screenshot: itemUexFormat?.screenshot,
        slug: itemUexFormat?.slug,
        id_item: firstId,
        price_min_max: {
          buy_min: null,
          buy_max: null,
          sell_min: null,
          sell_max: null,
          rent_min: null,
          rent_max: null,
        },
        options: [],
        attributes: itemUexFormat?.attributes,
      } as Item;
      let optionDict = {};
      if (uexIDsI18nTypes.uex_ids)
        for (const id of uexIDsI18nTypes.uex_ids) {
          if (!dictSimpleItems[id]) continue;
          for (const option of dictSimpleItems[id].options) {
            if (!optionDict[option.id_terminal]) {
              optionDict[option.id_terminal] = option;
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
      dictItems[key].options = Object.values(optionDict);
      dictItems[key].options.forEach((o) => {
        if (o.price_buy === Infinity) o.price_buy = null;
        if (o.price_sell === 0) o.price_sell = null;
      });
    }

  /* Compute min/max prices */
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
