import itemsUexIdsAndI18n from "../data/items_uex_ids_and_i18n.json";
import { getItemUexFormat, mapToUEXTypeSubType, date4_0 } from "../utils";


export function buildItemsData(dictItem) {
  const tempItemsData = {};
  for (const [key, value] of Object.entries(itemsUexIdsAndI18n)) {
    let firstId = value.uex_ids?.[0];
    let isVehicle = typeof firstId === "string" && firstId?.startsWith("v-");
    if (isVehicle) {
      tempItemsData[key] = {
        key: key,
        name: value.en || key,
        name_zh_Hans: value.zh_Hans || key,
        type: "Vehicle",
        sub_type: "Vehicle",
        id_vehicle: firstId,
        price_min_max: {},
        options: dictItem[firstId]?.options || [],
        options_rent: dictItem[firstId]?.options_rent || [],
      };
    } else {
      let itemUexFormat = getItemUexFormat(firstId);
      let type = itemUexFormat?.section;
      let subType = itemUexFormat?.category;
      if (subType == "Jump Modules") {
        type = "Systems";
      } else if (subType == "Undersuits") {
        type = "Armor";
      }
      if (!type || !subType) {
        let remapped = mapToUEXTypeSubType(value.type);
        type = type || remapped[0];
        subType = subType || remapped[1];
      }
      if (type === null && !value.uex_ids) continue;
      tempItemsData[key] = {
        key: key,
        name: value.en || key,
        name_zh_Hans: value.zh_Hans || key,
        type: type,
        sub_type: subType,
        screenshot: itemUexFormat?.screenshot,
        slug: itemUexFormat?.slug,
        id_item: firstId,
        price_min_max: {},
        options: [],
        attributes: itemUexFormat?.attributes,
      };
      let optionDict = {};
      if (value.uex_ids)
        for (const id of value.uex_ids) {
          if (!dictItem[id]) continue;
          for (const option of dictItem[id].options) {
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
      tempItemsData[key].options = Object.values(optionDict);
      tempItemsData[key].options.forEach((o) => {
        if (o.price_buy === Infinity) o.price_buy = null;
        if (o.price_sell === 0) o.price_sell = null;
      });
    }
  }
  Object.values(tempItemsData).forEach((item) => {
    let pricesBuy = item.options
      .filter((a) => a.price_buy !== null && a.date_modified >= date4_0)
      .map((a) => a.price_buy);
    let pricesSell = item.options
      .filter((a) => a.price_sell !== null && a.date_modified >= date4_0)
      .map((a) => a.price_sell);
    let pricesRent =
      item.options_rent
        ?.filter((a) => a.price_rent !== null && a.date_modified >= date4_0)
        ?.map((a) => a.price_rent) || [];
    item.price_min_max = {
      buy_min: Math.min(...pricesBuy) || null,
      buy_max: Math.max(...pricesBuy) || null,
      sell_min: Math.min(...pricesSell) || null,
      sell_max: Math.max(...pricesSell) || null,
      rent_min: Math.min(...pricesRent) || null,
      rent_max: Math.max(...pricesRent) || null,
    };
  });
  return tempItemsData;
}