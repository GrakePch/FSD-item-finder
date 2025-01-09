import "./SearchBar.css";
import { useContext, useEffect, useState } from "react";
import SearchResultList from "../SearchResultList/SearchResultList";
import Icon from "@mdi/react";
import { mdiArrowLeft, mdiClose, mdiMagnify, mdiTrashCanOutline } from "@mdi/js";
import { AllItemsPriceContext } from "../../contexts";
import {
  clearLocalStorageRecent,
  getAttributeValueByName,
  getCategoryZhName,
  getLocalStorageRecent,
  isAscii,
} from "../../utils";
import { useSearchParams } from "react-router";

const filterTypes = [
  ["载具", "Vehicle."],
  ["载具系统", "Systems."],
  ["载具武器", "Vehicle Weapons."],
  ["个人武器", "Personal Weapons."],
  ["护甲", "Armor."],
];

const subFilterTypes = {
  Systems: [
    "Power Plants",
    "Shield Generators",
    "Coolers",
    "Quantum Drives",
    "Jump Modules",
  ],
  "Vehicle Weapons": ["Guns", "Missiles", "Missile Racks", "Bombs", "Turrets"],
  "Personal Weapons": ["Personal Weapons", "Attachments"],
  Armor: ["Undersuits", "Helmets", "Torso", "Arms", "Legs", "Backpacks"],
};

const SearchBar = ({ centered, dataAcquired }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsData = useContext(AllItemsPriceContext);
  const [searchName, setSearchName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [resultList, setResultList] = useState([]);

  const [filterType, setFilterType] = useState("");
  const [filterSubType, setFilterSubType] = useState("");

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  const setSearchBarFocusing = (isFocusing) => {
    if (isFocusing) {
      searchParams.set("searchFocus", "1");
    } else {
      searchParams.delete("searchFocus");
    }
    setSearchParams(searchParams);
  };

  const isSearchBarFocusing = () => searchParams.get("searchFocus") === "1";

  useEffect(() => {
    let _filterType = searchParams.get("type");
    if (_filterType) {
      let _split = _filterType.split(".");
      setFilterType(_split[0]);
      if (_split.length > 1) {
        setFilterSubType(_split[1]);
      } else {
        setFilterSubType("");
      }
    } else {
      setFilterType("");
      setFilterSubType("");
    }

    let tempIsSearching =
      (searchName.length > 0 &&
        ((isAscii(searchName) && searchName.length > 1) || !isAscii(searchName))) ||
      _filterType;
    setIsSearching(tempIsSearching);

    let tempList = [];
    if (tempIsSearching) {
      for (const item of Object.values(itemsData)
        .filter((i) =>
          !parseInt(searchParams.get("show_unbuyable"))
            ? i.price_min_max.buy_min && i.price_min_max.buy_min < Infinity
            : true
        )
        .filter((i) =>
          _filterType ? (i.type + "." + i.sub_type).startsWith(_filterType) : true
        )) {
        if (
          item.name.toLocaleLowerCase().includes(searchName.toLocaleLowerCase()) ||
          item.name_zh_Hans?.toLocaleLowerCase()?.includes(searchName.toLocaleLowerCase())
        ) {
          tempList.push(item);
        }
      }

      if (tempList.length <= 300) {
        tempList.sort((a, b) => a.name.localeCompare(b.name));
      }
    } else {
      tempList = getLocalStorageRecent()
        .map((k) => itemsData[k])
        .filter((i) => i);
    }

    if (_filterType)
      if (_filterType.startsWith("Systems.")) {
        tempList
          .sort((a, b) =>
            getAttributeValueByName("Grade", a.attributes)?.localeCompare(
              getAttributeValueByName("Grade", b.attributes)
            )
          )
          .sort((a, b) =>
            getAttributeValueByName("Class", a.attributes)?.localeCompare(
              getAttributeValueByName("Class", b.attributes)
            )
          )
          .sort(
            (a, b) =>
              (getAttributeValueByName("Size", a.attributes) || Infinity) -
              (getAttributeValueByName("Size", b.attributes) || Infinity)
          );
      } else if (_filterType.startsWith("Vehicle Weapons.")) {
        tempList
          .sort((a, b) =>
            getAttributeValueByName("Tracking Signal", a.attributes)?.localeCompare(
              getAttributeValueByName("Tracking Signal", b.attributes)
            )
          )
          .sort(
            (a, b) =>
              (getAttributeValueByName("Size", a.attributes) || Infinity) -
              (getAttributeValueByName("Size", b.attributes) || Infinity)
          );
      } else if (_filterType.startsWith("Personal Weapons.Atta")) {
        tempList.sort(
          (a, b) =>
            (getAttributeValueByName("Size", a.attributes) || Infinity) -
            (getAttributeValueByName("Size", b.attributes) || Infinity)
        );
      }

    // console.log(tempList);
    setResultList(tempList);
  }, [itemsData, searchName, searchParams]);

  return (
    <div className="SearchBar">
      {isSearchBarFocusing() && (
        <div className="search-bg" onClick={() => setSearchBarFocusing(false)}></div>
      )}
      <nav
        className="search-super-container"
        style={{ top: centered && !isSearchBarFocusing() ? "30%" : 0 }}
      >
        {centered && !isSearchBarFocusing() && (
          <>
            <h1>
              星际寻物<span>Beta 版</span>
            </h1>
            <p>为星际公民提供查询物品购买地点与价格的服务</p>
            <p className="small">暂不支持货物和矿物的交易地点与价格</p>
          </>
        )}
        <div className="search-container">
          {!isSearchBarFocusing() ? (
            <div className="btnSearch">
              <Icon path={mdiMagnify} size="1.5rem" />
            </div>
          ) : (
            <button className="btnBack" onClick={() => setSearchBarFocusing(false)}>
              <Icon className="iconClear" path={mdiArrowLeft} size="1.5rem" />
            </button>
          )}
          <input
            type="text"
            id="searchbar"
            placeholder={dataAcquired ? "搜索物品或载具名称……" : "数据加载中，请稍后……"}
            value={searchName}
            onFocus={() => setSearchBarFocusing(true)}
            onChange={handleSearchChange}
            disabled={!dataAcquired}
          />
          {searchName && (
            <button className="btnClear" onClick={() => setSearchName("")}>
              <Icon className="iconClear" path={mdiClose} size="1.5rem" />
            </button>
          )}

          {isSearchBarFocusing() && (
            <>
              <hr />
              <div className="filters">
                <button
                  onClick={() => {
                    searchParams.delete("type");
                    setSearchParams(searchParams);
                  }}
                  className={filterType ? undefined : "active"}
                >
                  全部
                </button>
                {filterTypes.map(([name_zh, t]) => (
                  <button
                    key={t}
                    onClick={() => {
                      if (searchParams.get("type")?.startsWith(t)) {
                        searchParams.delete("type");
                      } else {
                        searchParams.set("type", t);
                      }
                      setSearchParams(searchParams);
                    }}
                    className={searchParams.get("type")?.startsWith(t) ? "active" : null}
                  >
                    {name_zh}
                  </button>
                ))}
                <hr />
                <input
                  type="checkbox"
                  id="buyable-only"
                  checked={!parseInt(searchParams.get("show_unbuyable"))}
                  onChange={(e) => {
                    searchParams.set("show_unbuyable", e.target.checked ? 0 : 1);
                    setSearchParams(searchParams);
                  }}
                />
                <label htmlFor="buyable-only">仅显示可购买</label>
              </div>
              {subFilterTypes[filterType] && (
                <div className="filters sub">
                  <button
                    onClick={() => {
                      searchParams.set("type", filterType + ".");
                      setSearchParams(searchParams);
                    }}
                    className={filterSubType ? undefined : "active"}
                  >
                    全部
                  </button>
                  {subFilterTypes[filterType].map((subt) => (
                    <button
                      key={subt}
                      onClick={() => {
                        if (filterSubType === subt) {
                          searchParams.set("type", filterType + ".");
                        } else {
                          searchParams.set("type", filterType + "." + subt);
                        }
                        setSearchParams(searchParams);
                      }}
                      className={subt === filterSubType ? "active" : null}
                    >
                      {getCategoryZhName(subt)}
                    </button>
                  ))}
                </div>
              )}
              {resultList.length > 0 &&
                (isSearching ? (
                  <p className="total">搜索结果共 {resultList.length} 个</p>
                ) : (
                  <p className="total">
                    最近查询{" "}
                    <button
                      className="btn-clear-recent"
                      onClick={() => {
                        clearLocalStorageRecent();
                        setResultList([]);
                      }}
                    >
                      <Icon path={mdiTrashCanOutline} size="1rem" /> 清除
                    </button>
                  </p>
                ))}
              <SearchResultList results={resultList} />
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default SearchBar;
