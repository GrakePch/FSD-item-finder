import { fetchWithCache } from "./apiFetch";
import itemsUexIdsAndI18n from "../data/items_uex_ids_and_i18n.json";
import { date4_0 } from "../utils";

export async function fetchAndProcessVehicles(): Promise<VehicleDictionary> {
  const dictSimpleVehicles: SimpleVehicleOptionsDictionary = {};
  const res = await fetchWithCache(
    "vehicles_purchases_prices_all",
    "https://api.uexcorp.space/2.0/vehicles_purchases_prices_all"
  );
  for (const v of res.data) {
    let id = v.id_vehicle;
    if (!dictSimpleVehicles[id]) {
      dictSimpleVehicles[id] = {
        id_vehicle: v.id_vehicle,
        options: [],
        options_rent: [],
      };
    }
    dictSimpleVehicles[id].options.push({
      id_terminal: v.id_terminal,
      price_buy: v.price_buy || Infinity,
      price_sell: null,
      price_rent: null,
      date_modified: v.date_modified,
    });
  }
  const res2 = await fetchWithCache(
    "vehicles_rentals_prices_all",
    "https://api.uexcorp.space/2.0/vehicles_rentals_prices_all"
  );
  for (const v of res2.data) {
    let id = v.id_vehicle;
    if (!dictSimpleVehicles[id]) {
      dictSimpleVehicles[id] = {
        id_vehicle: v.id_vehicle,
        options: [],
        options_rent: [],
      };
    }
    dictSimpleVehicles[id].options_rent.push({
      id_terminal: v.id_terminal,
      price_buy: null,
      price_sell: null,
      price_rent: v.price_rent || Infinity,
      date_modified: v.date_modified,
    });
  }

  /* Process to get the final results */
  const dictVehicles: VehicleDictionary = {};
  for (const [key, uexIDsI18nTypes] of Object.entries(
    itemsUexIdsAndI18n as KeyToUexIdI18nTypes
  ))
    if (key.startsWith("vehicle_Name")) {
      let firstIdString = uexIDsI18nTypes.uex_ids?.[0] as string;
      const firstId = firstIdString ? parseInt(firstIdString.slice(2), 10) : null;
      let simpleVehicleData = dictSimpleVehicles[firstId] || null;
      dictVehicles[key] = {
        key: key,
        name: uexIDsI18nTypes.en || key,
        name_zh_Hans: uexIDsI18nTypes.zh_Hans || key,
        type: "Vehicle",
        sub_type: "Vehicle",
        id_vehicle: firstId,
        price_min_max: {
          buy_min: null,
          buy_max: null,
          sell_min: null,
          sell_max: null,
          rent_min: null,
          rent_max: null,
        },
        options: simpleVehicleData?.options || [],
        options_rent: simpleVehicleData?.options_rent || [],
      };
    }

  /* Compute min/max prices */
  Object.values(dictVehicles).forEach((item) => {
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

  return dictVehicles;
}
