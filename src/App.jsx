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
import {
  getItemUexFormat,
  getVariantsBySlug,
  getVehicleUEXFormat,
  getVehicleZhName,
  getZhHansNameFromEn,
} from "./utils";

function App() {
  const [terminalsData, setTerminalsData] = useState({});
  const [itemsData, setItemsData] = useState({});
  const [item, setItem] = useState(null);
  const [itemListVariants, setItemListVariants] = useState([]);
  const [showMode, setShowMode] = useState("");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      /* Fetch & reformat terminals */
      try {
        const res = await axios.get("https://uexcorp.space/api/2.0/terminals");
        let temp = res.data.data.map((t) => ({
          id: t.id,
          code: t.code,
          name: t.name,
          location_path: [
            t.star_system_name,
            t.orbit_name,
            ...t.name.split(" - ").reverse(),
          ],
          location: {
            name_star_system: t.star_system_name,
            name_planet: t.planet_name,
            name_orbit: t.orbit_name,
            name_moon: t.moon_name,
            name_space_station: t.space_station_name,
            name_outpost: t.outpost_name,
            name_city: t.city_name,
          },
          screenshot: t.screenshot,
          screenshot_thumb: t.screenshot_thumb,
          screenshot_author: t.screenshot_author,
          name_faction: t.faction_name,
        }));
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
          let itemUexFormat = getItemUexFormat(item.id_item);
          if (!itemUexFormat) continue;
          let slug = itemUexFormat.slug;
          if (!dictItem[slug]) {
            dictItem[slug] = {
              slug: slug,
              id_item: item.id_item,
              name: item.item_name,
              name_zh_Hans: getZhHansNameFromEn(item.item_name),
              type: itemUexFormat.section,
              sub_type: itemUexFormat.category,
              screenshot: itemUexFormat.screenshot,
              price_min_max: {},
              options: [],
            };
          }
          dictItem[slug].options.push({
            id_terminal: item.id_terminal,
            price_buy: item.price_buy || null,
            price_sell: item.price_sell || null,
          });
        }
      } catch (err) {
        console.log(err);
      }
      /* Fetch & reformat vehicles */
      let dictVehicle = {};
      try {
        const res = await axios.get(
          "https://uexcorp.space/api/2.0/vehicles_purchases_prices_all"
        );
        for (const v of res.data.data) {
          let slug = "v-" + v.id_vehicle;
          if (!dictVehicle[slug]) {
            let itemUexFormat = getVehicleUEXFormat(v.id_vehicle);
            dictVehicle[slug] = {
              slug: slug,
              id_vehicle: v.id_vehicle,
              name: itemUexFormat.name_full,
              name_zh_Hans: getVehicleZhName(itemUexFormat.name_full),
              type: "Vehicle",
              sub_type: "Vehicle",
              price_min_max: {},
              options: [],
              options_rent: [],
            };
          }
          dictVehicle[slug].options.push({
            id_terminal: v.id_terminal,
            price_buy: v.price_buy || null,
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
          let slug = "v-" + v.id_vehicle;
          if (!dictVehicle[slug]) {
            let itemUexFormat = getVehicleUEXFormat(v.id_vehicle);
            dictVehicle[slug] = {
              slug: slug,
              id_vehicle: v.id_vehicle,
              name: itemUexFormat.name_full,
              name_zh_Hans: getVehicleZhName(itemUexFormat.name_full),
              type: "Vehicle",
              sub_type: "Vehicle",
              price_min_max: {},
              options: [],
              options_rent: [],
            };
          }
          dictVehicle[slug].options_rent.push({
            id_terminal: v.id_terminal,
            price_rent: v.price_rent || null,
          });
        }
      } catch (err) {
        console.log(err);
      }

      let tempItemsData = { ...dictItem, ...dictVehicle };

      /* Update price_min_max for each item */
      Object.values(tempItemsData).forEach((item) => {
        let pricesBuy = item.options
          .filter((a) => a.price_buy !== null)
          .map((a) => a.price_buy);
        let pricesSell = item.options
          .filter((a) => a.price_sell !== null)
          .map((a) => a.price_sell);
        let pricesRent =
          item.options_rent
            ?.filter((a) => a.price_rent !== null)
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
    let slug = searchParams.get("name");
    setItem(itemsData[slug] || null);
    setItemListVariants(getVariantsBySlug(slug, itemsData));
  }, [searchParams, itemsData]);

  return (
    <AllTerminalsContext.Provider value={terminalsData}>
      <AllItemsPriceContext.Provider value={itemsData}>
        <SearchBar centered={item === null} />

        {item &&
          (showMode === "variants" && itemListVariants.length > 1 ? (
            <ItemGroupInfo item={item} listVariants={itemListVariants} />
          ) : showMode === "set" && item.set ? (
            <ItemSetInfo item={item} />
          ) : (
            <ItemInfo item={item} listVariants={itemListVariants} />
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
