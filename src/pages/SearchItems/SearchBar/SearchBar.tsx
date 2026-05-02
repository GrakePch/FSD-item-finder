import "./SearchBar.css";
import { useContext, useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiClose, mdiMagnify, mdiTrashCanOutline } from "@mdi/js";
import { ContextAllData } from "../../../contexts";
import {
  clearLocalStorageRecent,
  getAttributeValueByName,
  getLocalStorageRecent,
  typeKeyToCapitalized,
} from "../../../utils";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import useDebouncedValue from "../../../hooks/useDebouncedValue";

const filterTypes = [
  ["systems", "Systems."],
  ["vehicle_weapons", "Vehicle Weapons."],
  ["personal_weapons", "Personal Weapons."],
  ["armor", "Armor."],
];

const subFilterTypes: Record<string, string[]> = {
  Systems: [
    "power_plants",
    "shield_generators",
    "coolers",
    "quantum_drives",
    "jump_modules",
  ],
  "Vehicle Weapons": [
    "guns",
    "missiles",
    "missile_racks",
    "bombs",
    "turrets",
  ],
  "Personal Weapons": [
    "personal_weapons",
    "attachments",
  ],
  Armor: [
    "undersuits",
    "helmets",
    "torso",
    "arms",
    "legs",
    "backpacks",
  ],
};

const SEARCH_NAME_KEY = "fsd_searchItems_searchName";

const SearchBar = ({
  resultList,
  setResultList,
}: {
  resultList: Item[];
  setResultList: React.Dispatch<React.SetStateAction<Item[]>>;
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dictItems } = useContext(ContextAllData);
  const [isSearching, setIsSearching] = useState(false);

  const [filterType, setFilterType] = useState("");
  const [filterSubType, setFilterSubType] = useState("");

  // Use sessionStorage directly in useState initializer
  const [searchName, setSearchName] = useState(
    () => sessionStorage.getItem(SEARCH_NAME_KEY) || ""
  );
  const debouncedSearchName = useDebouncedValue(searchName);
  const hasLoadedItemPrices = Object.values(dictItems).some(
    (item) =>
      item.price_min_max.buy_min ||
      item.price_min_max.sell_min ||
      item.price_min_max.rent_min
  );

  // Save searchName to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(SEARCH_NAME_KEY, searchName);
  }, [searchName]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  const getItemName = (item: Item, lng?: string) =>
    t(item.key, { ns: "items", lng, defaultValue: item.key });

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

    const normalizedSearchName = debouncedSearchName.trim().toLocaleLowerCase();
    let tempIsSearching = Boolean(normalizedSearchName || _filterType);
    setIsSearching(tempIsSearching);

    let tempList: Item[] = [];
    const shouldFilterBuyable =
      !parseInt(searchParams.get("show_unbuyable")) && hasLoadedItemPrices;
    if (tempIsSearching) {
      for (const item of Object.values(dictItems)
        .filter((i) =>
          shouldFilterBuyable
            ? i.price_min_max.buy_min && i.price_min_max.buy_min < Infinity
            : true
        )
        .filter((i) =>
          _filterType ? (i.type + "." + i.sub_type).startsWith(_filterType) : true
        )) {
        if (
          getItemName(item, "en").toLocaleLowerCase().includes(normalizedSearchName) ||
          getItemName(item, "zh").toLocaleLowerCase().includes(normalizedSearchName)
        ) {
          tempList.push(item);
        }
      }

      if (tempList.length <= 300) {
        tempList.sort((a, b) => getItemName(a, "en").localeCompare(getItemName(b, "en")));
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
            (getAttributeValueByName("Grade", a.attributes) || "").localeCompare(
              getAttributeValueByName("Grade", b.attributes) || ""
            )
          )
          .sort((a, b) =>
            (getAttributeValueByName("Class", a.attributes) || "").localeCompare(
              getAttributeValueByName("Class", b.attributes) || ""
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
            (getAttributeValueByName("Tracking Signal", a.attributes) || "").localeCompare(
              getAttributeValueByName("Tracking Signal", b.attributes) || ""
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
  }, [debouncedSearchName, dictItems, hasLoadedItemPrices, searchParams, t]);

  return (
    <div className="SearchBar">
      <div className="fixed-search-bar">
      <div className="search-container">
        <div className="btnSearch">
          <Icon path={mdiMagnify} size="1.5rem" />
        </div>
        <input
          type="text"
          id="searchbar"
          placeholder={Object.keys(dictItems).length ? t("SearchItemBar.placeholder") : t("SearchItemBar.loadingData")}
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
      </div>
      <div className="filters">
        <button
          onClick={() => {
            searchParams.delete("type");
            setSearchParams(searchParams);
          }}
          className={filterType ? undefined : "active"}
        >
          {t("FilterType.all")}
        </button>
        {filterTypes.map(([key, type]) => (
          <button
            key={type}
            onClick={() => {
              if (searchParams.get("type")?.startsWith(type)) {
                searchParams.delete("type");
              } else {
                searchParams.set("type", type);
              }
              setSearchParams(searchParams);
            }}
            className={searchParams.get("type")?.startsWith(type) ? "active" : undefined}
          >
            {t("FilterType." + key)}
          </button>
        ))}
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
            {t("FilterType.all")}
          </button>
          {subFilterTypes[filterType].map((subt) => (
            <button
              key={subt}
              onClick={() => {
                if (filterSubType === typeKeyToCapitalized(subt)) {
                  searchParams.set("type", filterType + ".");
                } else {
                  searchParams.set("type", filterType + "." + typeKeyToCapitalized(subt));
                }
                setSearchParams(searchParams);
              }}
              className={typeKeyToCapitalized(subt) === filterSubType ? "active" : undefined}
            >
              {t("FilterType." + subt)}
            </button>
          ))}
        </div>
      )}
      {isSearching && (
        <p className="total search-total">
          <span>
            {resultList.length > 0
              ? t("SearchItemBar.searchResultsTotal", { count: resultList.length })
              : t("SearchItemBar.noSearchResults")}
          </span>
          <label className="buyable-only-filter" htmlFor="buyable-only">
            <input
              type="checkbox"
              id="buyable-only"
              checked={!parseInt(searchParams.get("show_unbuyable"))}
              onChange={(e) => {
                searchParams.set("show_unbuyable", e.target.checked ? "0" : "1");
                setSearchParams(searchParams);
              }}
            />
            <span>{t("SearchItemBar.buyableOnly")}</span>
          </label>
        </p>
      )}
      {resultList.length > 0 &&
        !isSearching && (
          <p className="total">
            {t("SearchItemBar.recentSearches")}{" "}
            <button
              className="btn-clear-recent"
              onClick={() => {
                clearLocalStorageRecent();
                setResultList([]);
              }}
            >
              <Icon path={mdiTrashCanOutline} size="1rem" /> {t("SearchItemBar.clear")}
            </button>
          </p>
        )}
      {!isSearching && resultList.length === 0 && (
        <div className="home-empty">
          <div className="home-empty-title">{t("SearchItemBar.homeTitle")}</div>
          <div className="home-empty-subtitle">
            {t("SearchItemBar.homeSubtitle")}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
