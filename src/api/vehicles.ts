import { fetchWithCache } from "./apiFetch";

export async function fetchAndProcessVehicles(
  dictItem: SimpleItemAndVehicleOptionsDictionary
): Promise<SimpleItemAndVehicleOptionsDictionary> {
  try {
    const res = await fetchWithCache(
      "vehicles_purchases_prices_all",
      "https://api.uexcorp.space/2.0/vehicles_purchases_prices_all"
    );
    for (const v of res.data) {
      let id = "v-" + v.id_vehicle;
      if (!dictItem[id]) {
        dictItem[id] = {
          id_vehicle: v.id_vehicle,
          options: [],
          options_rent: [],
        };
      }
      dictItem[id].options.push({
        id_terminal: v.id_terminal,
        price_buy: v.price_buy || Infinity,
        price_sell: null,
        date_modified: v.date_modified,
      });
    }
  } catch (err) {
    throw err;
  }
  try {
    const res = await fetchWithCache(
      "vehicles_rentals_prices_all",
      "https://api.uexcorp.space/2.0/vehicles_rentals_prices_all"
    );
    for (const v of res.data) {
      let id = "v-" + v.id_vehicle;
      if (!dictItem[id]) {
        dictItem[id] = {
          id_vehicle: v.id_vehicle,
          options: [],
          options_rent: [],
        };
      }
      dictItem[id].options_rent.push({
        id_terminal: v.id_terminal,
        price_rent: v.price_rent || Infinity,
        date_modified: v.date_modified,
      });
    }
  } catch (err) {
    throw err;
  }
  return dictItem;
}
