import { useEffect, useState } from "react";
import "./App.css";
import SearchBar from "./components/SearchBar/SearchBar";
import { Route, Routes } from "react-router";
import axios from "axios";
import { AllTerminalsContext, AllItemsPriceContext } from "./contexts";
import itemsUexIdsAndI18n from "./data/items_uex_ids_and_i18n.json";
import uexBodiesFixM from "./data/uex_bodies_fix_manual.json";
import { date4_0, getItemUexFormat, mapToUEXTypeSubType } from "./utils";
import Item from "./pages/Item/Item";
import Terminal from "./pages/Terminal/Terminal";
import Footer from "./components/Footer/Footer";

function App() {
  const [terminalsData, setTerminalsData] = useState({});
  const [itemsData, setItemsData] = useState({});
  const [item, setItem] = useState(null);
  const [isItemsDataAcquired, setIsItemsDataAcquired] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      /* Fetch & reformat terminals */
      try {
        const res = await axios.get("https://api.uexcorp.space/2.0/terminals");
        let temp = res.data.data.map((t) => {
          let orbit_name_fix = uexBodiesFixM[t.orbit_name] || t.orbit_name;
          if (t.star_system_name === "Pyro" && t.orbit_name === "Pyro Jump Point")
            orbit_name_fix = "Stanton Jump Point";
          let locPath3rd = t.name.split(" - ").reverse();
          if (locPath3rd[0] === "Stanton Gateway Station")
            locPath3rd[0] = "Stanton Gateway";
          if (locPath3rd[0] === "Terra Gateway Station")
            locPath3rd[0] = "Terra Gateway";
          let locationPath = [t.star_system_name, orbit_name_fix, ...locPath3rd];
          locationPath = locationPath.filter((loc, idx) =>
            idx > 0 ? loc !== locationPath[idx - 1] : true
          );
          return {
            id: t.id,
            code: t.code,
            name: t.name,
            type: t.type,
            location_path: locationPath,
            location: {
              name_star_system: t.star_system_name,
              name_planet: t.planet_name,
              name_orbit: orbit_name_fix,
              name_moon: t.moon_name,
              name_space_station: t.space_station_name,
              name_outpost: t.outpost_name,
              name_city: t.city_name,
            },
            name_faction: t.faction_name,
            name_company: t.company_name,
            is_affinity_influenceable: t.is_affinity_influenceable,
            is_habitation: t.is_habitation,
            is_refinery: t.is_refinery,
            is_cargo_center: t.is_cargo_center,
            is_medical: t.is_medical,
            is_food: t.is_food,
            is_shop_fps: t.is_shop_fps,
            is_shop_vehicle: t.is_shop_vehicle,
            is_refuel: t.is_refuel,
            is_repair: t.is_repair,
            is_nqa: t.is_nqa,
            is_player_owned: t.is_player_owned,
            is_auto_load: t.is_auto_load,
            has_loading_dock: t.has_loading_dock,
            has_docking_port: t.has_docking_port,
            has_freight_elevator: t.has_freight_elevator,
          };
        });
        let tempDict = {};
        for (const t of temp) tempDict[t.id] = t;
        // console.log(tempDict);
        setTerminalsData(tempDict);
      } catch (err) {
        console.log(err);
      }
      /* Fetch & reformat items */
      let dictItem = {};
      try {
        const res = await axios.get("https://api.uexcorp.space/2.0/items_prices_all");
        for (const item of res.data.data) {
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
        setIsItemsDataAcquired(true);
      } catch (err) {
        setIsItemsDataAcquired(false);
        console.log(err);
      }
      /* Fetch & reformat vehicles */
      try {
        const res = await axios.get(
          "https://api.uexcorp.space/2.0/vehicles_purchases_prices_all"
        );
        for (const v of res.data.data) {
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
            date_modified: v.date_modified,
          });
        }
      } catch (err) {
        console.log(err);
      }
      try {
        const res = await axios.get(
          "https://api.uexcorp.space/2.0/vehicles_rentals_prices_all"
        );
        for (const v of res.data.data) {
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
        console.log(err);
      }

      // console.log(dictItem);

      /* Rebuild dictionary with keys */
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

      // console.log(Object.values(tempItemsData));

      /* Update price_min_max for each item */
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

      // console.log(Object.values(tempItemsData));
      setItemsData(tempItemsData);
    };

    fetchData();
  }, []);

  return (
    <AllTerminalsContext.Provider value={terminalsData}>
      <AllItemsPriceContext.Provider value={itemsData}>
        <Routes>
          <Route
            path="/t/:tid"
            element={
              <>
                <Terminal />
                <Footer />
              </>
            }
          />
          <Route
            path="*"
            element={
              <>
                <SearchBar centered={item === null} dataAcquired={isItemsDataAcquired} />
                <Item item={item} setItem={setItem} />
                <Footer style={{ position: item ? "unset" : "absolute" }} />
              </>
            }
          />
        </Routes>
      </AllItemsPriceContext.Provider>
    </AllTerminalsContext.Provider>
  );
}

export default App;
