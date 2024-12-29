import { useEffect, useState } from "react";
import "./App.css";
import ItemInfo from "./components/ItemInfo/ItemInfo";
import SearchBar from "./components/SearchBar/SearchBar";
import { useSearchParams } from "react-router";
import ItemGroupInfo from "./components/ItemGroupInfo/ItemGroupInfo";
import ItemSetInfo from "./components/ItemSetInfo/ItemSetInfo";
import axios from "axios";
import { AllTerminalsContext, AllItemsPriceContext } from "./contexts";
import uexBadge from "./assets/uex-api-badge-powered.png";
import itemsUexIdsAndI18n from "./data/items_uex_ids_and_i18n.json";
import {
  date4_0,
  getItemUexFormat,
  getSet,
  getVariants,
  mapToUEXTypeSubType,
  pushLocalStorageRecent,
} from "./utils";

function App() {
  const [terminalsData, setTerminalsData] = useState({});
  const [itemsData, setItemsData] = useState({});
  const [item, setItem] = useState(null);
  const [itemListVariants, setItemListVariants] = useState([]);
  const [itemSet, setItemSet] = useState(null);
  const [showMode, setShowMode] = useState("");
  const [searchParams] = useSearchParams();
  const [isItemsDataAcquired, setIsItemsDataAcquired] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      /* Fetch & reformat terminals */
      try {
        const res = await axios.get("https://uexcorp.space/api/2.0/terminals");
        let temp = res.data.data.map((t) => {
          let orbit_name_fix = t.orbit_name;
          if (t.star_system_name === "Pyro" && t.orbit_name === "Pyro Jump Point")
            orbit_name_fix = "Stanton Jump Point";
          let locPath3rd = t.name.split(" - ").reverse();
          if (locPath3rd[0] === "Stanton Gateway Station")
            locPath3rd[0] = "Stanton Gateway";
          return {
            id: t.id,
            code: t.code,
            name: t.name,
            location_path: [t.star_system_name, orbit_name_fix, ...locPath3rd],
            location: {
              name_star_system: t.star_system_name,
              name_planet: t.planet_name,
              name_orbit: orbit_name_fix,
              name_moon: t.moon_name,
              name_space_station: t.space_station_name,
              name_outpost: t.outpost_name,
              name_city: t.city_name,
            },
            screenshot: t.screenshot,
            screenshot_thumb: t.screenshot_thumb,
            screenshot_author: t.screenshot_author,
            name_faction: t.faction_name,
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
        const res = await axios.get("https://uexcorp.space/api/2.0/items_prices_all");
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
          "https://uexcorp.space/api/2.0/vehicles_purchases_prices_all"
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
          "https://uexcorp.space/api/2.0/vehicles_rentals_prices_all"
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

  useEffect(() => {
    setShowMode(searchParams.get("mode"));
    let key = searchParams.get("key");
    let _itemsData = itemsData[key];
    if (_itemsData) {
      pushLocalStorageRecent(key);
      setItem(itemsData[key]);
    } else {
      setItem(null);
    }
    setItemListVariants(getVariants(key, itemsData));
    setItemSet(getSet(key, itemsData));
  }, [searchParams, itemsData]);

  return (
    <AllTerminalsContext.Provider value={terminalsData}>
      <AllItemsPriceContext.Provider value={itemsData}>
        <SearchBar centered={item === null} dataAcquired={isItemsDataAcquired} />

        {item &&
          (showMode === "variants" && itemListVariants.length > 1 ? (
            <ItemGroupInfo item={item} listVariants={itemListVariants} />
          ) : (
            // ) : showMode === "set" && itemSet ? (
            //   <ItemSetInfo item={item} set={itemSet} />
            <ItemInfo item={item} listVariants={itemListVariants} set={itemSet} />
          ))}

        <div className="footer" style={{ position: item ? "unset" : "absolute" }}>
          <div className="uex">
            <a href="https://uexcorp.space/" target="_blank">
              <p>数据支持</p>
            </a>
            <a href="https://uexcorp.space/" target="_blank">
              <img src={uexBadge} width="140" />
            </a>
          </div>
          <p>
            <a href="https://github.com/GrakePch/FSD-item-finder/issues" target="_blank">
              问题反馈
            </a>
          </p>
          <p>设计与开发：GrakePCH</p>
          <p>技术支持：CxJuice</p>
        </div>
      </AllItemsPriceContext.Provider>
    </AllTerminalsContext.Provider>
  );
}

export default App;
