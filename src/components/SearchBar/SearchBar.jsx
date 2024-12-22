import "./SearchBar.css";
import { useEffect, useState } from "react";
import SearchResultList from "../SearchResultList/SearchResultList";
import Icon from "@mdi/react";
import { mdiArrowLeft, mdiClose, mdiMagnify } from "@mdi/js";
import { getItemUexFormat, getVehicleUEXFormat, getVehicleZhName, getZhHansNameFromEn } from "../../utils";

const SearchBar = ({ centered, itemsAll, vehiclesBuyAll, vehiclesRentAll }) => {
  const [searchName, setSearchName] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [itemsSearchAll, setItemsSearchAll] = useState([]);
  const [resultList, setResultList] = useState([]);

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  useEffect(() => {
    let tempDict = {};
    /* Add all items to searchable list */
    for (const item of itemsAll) {
      if (!tempDict[item.id_item]) {
        let itemUexFormat = getItemUexFormat(item.id_item);
        tempDict[item.id_item] = {
          id: "i-" + item.id_item,
          slug: itemUexFormat?.slug,
          name: item.item_name,
          name_zh_Hans: getZhHansNameFromEn(item.item_name),
          price_min: item.price_buy || Infinity,
          type: itemUexFormat?.section,
          sub_type: itemUexFormat?.category,
        };
      } else {
        if (item.price_buy > 0 && item.price_buy < tempDict[item.id_item].price_min)
          tempDict[item.id_item].price_min = item.price_buy;
      }
    }
    let tempItemsSearchAll = Object.values(tempDict);

    let tempVehDict = {};
    /* Add all vehicles's buy options to searchable list */
    for (const vehicle of vehiclesBuyAll) {
      if (!tempVehDict[vehicle.id_vehicle]) {
        let vehicleUexFormat = getVehicleUEXFormat(vehicle.id_vehicle);
        tempVehDict[vehicle.id_vehicle] = {
          id: "v-" + vehicle.id_vehicle,
          slug: "v-" + vehicle.id_vehicle,
          name: vehicleUexFormat.name_full,
          name_zh_Hans: getVehicleZhName(vehicleUexFormat.name_full),
          price_min: vehicle.price_buy || Infinity,
          price_rent_min: Infinity,
          type: "Vehicle",
          sub_type: "Vehicle",
        };
      } else {
        if (vehicle.price_buy > 0 && vehicle.price_buy < tempVehDict[vehicle.id_vehicle].price_min)
          tempVehDict[vehicle.id_vehicle].price_min = vehicle.price_buy;
      }
    }
    /* Add all vehicles's rent options to searchable list */
    for (const vehicle of vehiclesRentAll) {
      if (!tempVehDict[vehicle.id_vehicle]) {
        let vehicleUexFormat = getVehicleUEXFormat(vehicle.id_vehicle);
        tempVehDict[vehicle.id_vehicle] = {
          id: "v-" + vehicle.id_vehicle,
          slug: "v-" + vehicle.id_vehicle,
          name: vehicleUexFormat.name_full,
          name_zh_Hans: getVehicleZhName(vehicleUexFormat.name_full),
          price_min: Infinity,
          price_rent_min: vehicle.price_rent || Infinity,
          type: "Vehicle",
          sub_type: "Vehicle",
        };
      } else {
        if (vehicle.price_rent > 0 && vehicle.price_rent < tempVehDict[vehicle.id_vehicle].price_rent_min)
          tempVehDict[vehicle.id_vehicle].price_rent_min = vehicle.price_rent;
      }
    }
    let tempVehiclesSearchAll = Object.values(tempVehDict);

    let tempCombinedSearchAll = [...tempItemsSearchAll, ...tempVehiclesSearchAll];

    // console.log(tempCombinedSearchAll);
    let tempItemsSearchAllFiltered = tempCombinedSearchAll.filter((item) => item.slug);
    setItemsSearchAll(tempItemsSearchAllFiltered);
    
  }, [itemsAll, vehiclesBuyAll, vehiclesRentAll]);

  useEffect(() => {
    let tempList = [];
    if (searchName.length > 0)
      for (const item of itemsSearchAll) {
        if (
          item.name
            .toLocaleLowerCase()
            .includes(searchName.toLocaleLowerCase()) ||
          item.name.zh_Hans
            ?.toLocaleLowerCase()
            ?.includes(searchName.toLocaleLowerCase())
        ) {
          tempList.push(item);
        }
      }

    if (tempList.length <= 100) {
      tempList.sort((a, b) => a.name.localeCompare(b.name));
    }

    // console.log(tempList);
    setResultList(tempList);
  }, [itemsSearchAll, searchName]);

  return (
    <div className="SearchBar">
      {showResults && resultList.length > 0 && (
        <div className="search-bg" onClick={() => setShowResults(false)}></div>
      )}
      <nav
        className="search-super-container"
        style={{ top: centered && !searchName ? "30%" : 0 }}
      >
        {centered && !searchName && (
          <>
            <h1>星际寻物</h1>
            <p>为星际公民提供查询物品购买地点与价格的服务</p>
          </>
        )}
        <div className="search-container">
          {!(showResults && resultList.length > 0) ? (
            <div className="btnSearch">
              <Icon path={mdiMagnify} size="1.5rem" />
            </div>
          ) : (
            <button className="btnBack" onClick={() => setShowResults(false)}>
              <Icon className="iconClear" path={mdiArrowLeft} size="1.5rem" />
            </button>
          )}
          <input
            type="input"
            id="searchbar"
            placeholder="搜索物品或载具名称..."
            value={searchName}
            onFocus={() => setShowResults(true)}
            onChange={handleSearchChange}
          />
          {searchName && (
            <button className="btnClear" onClick={() => setSearchName("")}>
              <Icon className="iconClear" path={mdiClose} size="1.5rem" />
            </button>
          )}

          {showResults && resultList.length > 0 && (
            <>
              <hr />
              <p className="total">搜索结果共 {resultList.length} 个</p>
              <SearchResultList results={resultList} setShowResults={setShowResults} />
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default SearchBar;
