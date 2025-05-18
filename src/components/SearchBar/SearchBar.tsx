import "./SearchBar.css";
import { useContext, useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiClose, mdiMagnify, mdiTrashCanOutline } from "@mdi/js";
import { ContextAllData } from "../../contexts";
import {
  clearLocalStorageRecent,
  getAttributeValueByName,
  getCategoryZhName,
  getLocalStorageRecent,
  isAscii,
} from "../../utils";
import { useSearchParams } from "react-router";

const filterTypes = [
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

const SEARCH_NAME_KEY = "fsd_searchItems_searchName";

const SearchBar = ({
  resultList,
  setResultList,
}: {
  resultList: Item[];
  setResultList: React.Dispatch<React.SetStateAction<Item[]>>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dictItems } = useContext(ContextAllData);
  const [isSearching, setIsSearching] = useState(false);

  const [filterType, setFilterType] = useState("");
  const [filterSubType, setFilterSubType] = useState("");

  // Use sessionStorage directly in useState initializer
  const [searchName, setSearchName] = useState(
    () => sessionStorage.getItem(SEARCH_NAME_KEY) || ""
  );

  // Save searchName to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(SEARCH_NAME_KEY, searchName);
  }, [searchName]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

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

    let tempIsSearching = Boolean(
      (searchName.length > 0 &&
      ((isAscii(searchName) && searchName.length > 1) || !isAscii(searchName))) ||
      _filterType
    );
    setIsSearching(tempIsSearching);

    let tempList = [];
    if (tempIsSearching) {
      for (const item of Object.values(dictItems)
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
        .map((k) => dictItems[k])
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
              (parseInt(getAttributeValueByName("Size", a.attributes)) || Infinity) -
              (parseInt(getAttributeValueByName("Size", b.attributes)) || Infinity)
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
              (parseInt(getAttributeValueByName("Size", a.attributes)) || Infinity) -
              (parseInt(getAttributeValueByName("Size", b.attributes)) || Infinity)
          );
      } else if (_filterType.startsWith("Personal Weapons.Atta")) {
        tempList.sort(
          (a, b) =>
            (parseInt(getAttributeValueByName("Size", a.attributes)) || Infinity) -
            (parseInt(getAttributeValueByName("Size", b.attributes)) || Infinity)
        );
      }

    // console.log(tempList);
    setResultList(tempList);
  }, [dictItems, searchName, searchParams]);

  return (
    <div className="SearchBar">
        <div className="search-container">
            <div className="btnSearch">
              <Icon path={mdiMagnify} size="1.5rem" />
            </div>
          <input
            type="text"
            id="searchbar"
            placeholder={Object.keys(dictItems).length ? "搜索物品……" : "下载数据中……"}
            value={searchName}
            onChange={handleSearchChange}
            disabled={!Object.keys(dictItems).length}
          />
          {searchName && (
            <button className="btnClear" onClick={() => setSearchName("")}>
              <Icon className="iconClear" path={mdiClose} size="1.5rem" />
            </button>
          )}
        </div>
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
                    searchParams.set("show_unbuyable", e.target.checked ? "0" : "1");
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
    </div>
  );
};

export default SearchBar;
