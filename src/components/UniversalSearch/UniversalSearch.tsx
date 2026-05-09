import styles from "./UniversalSearch.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import {
  mdiClose,
  mdiFilterVariant,
  mdiHomeVariantOutline,
  mdiMagnify,
  mdiMapMarker,
  mdiWidgetsOutline,
} from "@mdi/js";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import SearchResultList from "../../pages/SearchItems/SearchResultList/SearchResultList";
import SearchVehicleResultList from "../../pages/SearchVehicles/SearchVehicleResultList/SearchVehicleResultList";
import SearchLocationResultList from "../LocationSearch/SearchLocationResultList/SearchLocationResultList";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import {
  getNextSearchMode,
  getSearchModeFromPath,
  searchModes,
  type SearchMode,
} from "../../utils/searchMode";
import {
  itemFilterTypes,
  itemSubFilterTypes,
  useItemSearch,
} from "../../pages/SearchItems/useItemSearch";
import {
  getVehicleCareerLabel,
  getVehicleManufacturerLabel,
  useVehicleSearch,
} from "../../pages/SearchVehicles/useVehicleSearch";
import { typeKeyToCapitalized, toUrlKey } from "../../utils";
import { icon } from "../../assets/icon";

const SEARCH_NAME_KEYS: Record<SearchMode, string> = {
  items: "fsd_searchItems_searchName",
  vehicles: "fsd_searchVehicles_searchName",
  locations: "fsd_searchLocations_searchName",
};

const modeI18nKeys: Record<SearchMode, string> = {
  items: "Navbar.searchItems",
  vehicles: "Navbar.searchVehicles",
  locations: "Navbar.searchLocations",
};

const modePlaceholders: Record<SearchMode, string> = {
  items: "SearchItemBar.placeholder",
  vehicles: "SearchVehicleBar.placeholder",
  locations: "SearchLocationBar.placeholder",
};

const modeIcons: Record<SearchMode, string> = {
  items: mdiWidgetsOutline,
  vehicles: icon.Vehicle,
  locations: mdiMapMarker,
};

function getInitialSearchName(mode: SearchMode) {
  return sessionStorage.getItem(SEARCH_NAME_KEYS[mode]) || "";
}

const searchModeToQuery: Record<SearchMode, string> = {
  items: "i",
  vehicles: "v",
  locations: "l",
};

const searchQueryToMode: Record<string, SearchMode> = {
  i: "items",
  v: "vehicles",
  l: "locations",
};

function getSearchModeFromQuery(value: string | null) {
  return value ? searchQueryToMode[value] || null : null;
}

export default function UniversalSearch() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<SearchMode>(() =>
    getSearchModeFromPath(location.pathname)
  );
  const [searchNames, setSearchNames] = useState<Record<SearchMode, string>>(() => ({
    items: getInitialSearchName("items"),
    vehicles: getInitialSearchName("vehicles"),
    locations: getInitialSearchName("locations"),
  }));

  const debouncedItemSearchName = useDebouncedValue(searchNames.items);
  const debouncedVehicleSearchName = useDebouncedValue(searchNames.vehicles);
  const debouncedLocationSearchName = useDebouncedValue(searchNames.locations);
  const itemSearch = useItemSearch(debouncedItemSearchName);
  const vehicleSearch = useVehicleSearch(debouncedVehicleSearchName);

  useEffect(() => {
    sessionStorage.setItem(SEARCH_NAME_KEYS.items, searchNames.items);
    sessionStorage.setItem(SEARCH_NAME_KEYS.vehicles, searchNames.vehicles);
    sessionStorage.setItem(SEARCH_NAME_KEYS.locations, searchNames.locations);
  }, [searchNames]);

  const setSearchQueryMode = useCallback(
    (mode: SearchMode | null) => {
      const nextParams = new URLSearchParams(searchParams);
      if (mode) {
        nextParams.set("search", searchModeToQuery[mode]);
      } else {
        nextParams.delete("search");
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const openSearch = useCallback(() => {
    const mode = getSearchModeFromPath(location.pathname);
    setActiveMode(mode);
    setIsFilterOpen(false);
    setIsOpen(true);
    setSearchQueryMode(mode);
  }, [location.pathname, setSearchQueryMode]);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setSearchQueryMode(null);
  }, [setSearchQueryMode]);

  const selectMode = useCallback(
    (mode: SearchMode) => {
      setActiveMode(mode);
      setSearchQueryMode(mode);
    },
    [setSearchQueryMode]
  );

  useEffect(() => {
    const mode = getSearchModeFromQuery(searchParams.get("search"));
    if (!mode) {
      setIsOpen(false);
      return;
    }

    setActiveMode(mode);
    setIsOpen(true);
  }, [searchParams]);

  useEffect(() => {
    if (!isOpen) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [activeMode, isOpen]);

  useEffect(() => {
    if (activeMode === "locations") {
      setIsFilterOpen(false);
    }
  }, [activeMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (isOpen) {
          const nextMode = getNextSearchMode(activeMode);
          selectMode(nextMode);
          return;
        }
        openSearch();
        return;
      }

      if (!isOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        if (searchNames[activeMode]) {
          setSearchNames((current) => ({ ...current, [activeMode]: "" }));
        } else {
          closeSearch();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMode, closeSearch, isOpen, openSearch, searchNames, selectMode]);

  const setSearchName = (value: string) => {
    setSearchNames((current) => ({ ...current, [activeMode]: value }));
  };

  const clearOrCloseSearch = () => {
    if (searchNames[activeMode]) {
      setSearchName("");
    }
  };

  const handleResultNavigate = () => {
    setIsOpen(false);
  };

  const navigateWithSearch = (path: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("search");
    const query = nextParams.toString();
    navigate(`${path}${query ? `?${query}` : ""}`);
    setIsOpen(false);
  };

  const goHome = () => {
    navigate("/");
    setIsOpen(false);
  };

  const renderItemFilters = () => (
    <>
      <div className={styles.universalFilterRow}>
        <button
          onClick={itemSearch.clearTypeFilter}
          className={itemSearch.filterType ? undefined : styles.active}
        >
          {t("FilterType.all")}
        </button>
        {itemFilterTypes.map(([key, type]) => (
          <button
            key={type}
            onClick={() => itemSearch.toggleTypeFilter(type)}
            className={
              itemSearch.filterType && type.startsWith(itemSearch.filterType)
                ? styles.active
                : undefined
            }
          >
            {t("FilterType." + key)}
          </button>
        ))}
        {itemSearch.isSearching && (
          <label className={styles.universalCheckFilter}>
            <input
              type="checkbox"
              checked={itemSearch.buyableOnlyChecked}
              onChange={(event) => itemSearch.setBuyableOnly(event.target.checked)}
            />
            <span>{t("SearchItemBar.buyableOnly")}</span>
          </label>
        )}
      </div>
      {itemSubFilterTypes[itemSearch.filterType] && (
        <div className={`${styles.universalFilterRow} ${styles.sub}`}>
          <button
            onClick={() => itemSearch.setSubTypeFilter("")}
            className={itemSearch.filterSubType ? undefined : styles.active}
          >
            {t("FilterType.all")}
          </button>
          {itemSubFilterTypes[itemSearch.filterType].map((subType) => (
            <button
              key={subType}
              onClick={() => itemSearch.toggleSubTypeFilter(subType)}
              className={
                typeKeyToCapitalized(subType) === itemSearch.filterSubType
                  ? styles.active
                  : undefined
              }
            >
              {t("FilterType." + subType)}
            </button>
          ))}
        </div>
      )}
    </>
  );

  const renderVehicleFilters = () => (
    <>
      <section className={styles.universalFilterGroup}>
        <h2 className={styles.universalFilterTitle}>
          {t("SearchVehicleResultList.careerFilterTitle")}
        </h2>
        <div className={styles.universalFilterRow}>
          <button
            onClick={vehicleSearch.clearCareerFilter}
            className={vehicleSearch.selectedCareer ? undefined : styles.active}
          >
            {t("FilterType.all")}
          </button>
          {vehicleSearch.careers.map((career) => (
            <button
              key={career}
              onClick={() => vehicleSearch.toggleCareerFilter(career)}
              className={
                vehicleSearch.selectedCareer === career ? styles.active : undefined
              }
            >
              {getVehicleCareerLabel(t, career)}
            </button>
          ))}
        </div>
      </section>
      <section className={styles.universalFilterGroup}>
        <h2 className={styles.universalFilterTitle}>
          {t("SearchVehicleResultList.manufacturerFilterTitle")}
        </h2>
        <div className={styles.universalFilterRow}>
          <button
            onClick={vehicleSearch.clearManufacturerFilter}
            className={vehicleSearch.selectedManufacturer ? undefined : styles.active}
          >
            {t("FilterType.all")}
          </button>
          {vehicleSearch.manufacturers.map((manufacturer) => (
            <button
              key={manufacturer}
              onClick={() => vehicleSearch.toggleManufacturerFilter(manufacturer)}
              className={
                vehicleSearch.selectedManufacturer === manufacturer
                  ? styles.active
                  : undefined
              }
              title={getVehicleManufacturerLabel(t, manufacturer, "full")}
            >
              {getVehicleManufacturerLabel(t, manufacturer, "short")}
            </button>
          ))}
        </div>
      </section>
    </>
  );

  const renderFilters = () => {
    if (activeMode === "items") return renderItemFilters();
    if (activeMode === "vehicles") return renderVehicleFilters();
    return <div className={styles.universalFilterEmpty}>{t(modeI18nKeys.locations)}</div>;
  };

  const hasActiveFilters =
    (activeMode === "items" &&
      (Boolean(itemSearch.filterType) || !itemSearch.buyableOnlyChecked)) ||
    (activeMode === "vehicles" &&
      (Boolean(vehicleSearch.selectedManufacturer) ||
        Boolean(vehicleSearch.selectedCareer)));
  const hasAvailableFilters = activeMode === "items" || activeMode === "vehicles";

  const renderResults = () => {
    if (activeMode === "items") {
      return (
        <SearchResultList
          results={itemSearch.isSearching ? itemSearch.resultList : []}
          onResultClick={handleResultNavigate}
          scrollMode="container"
          className={styles.itemResults}
        />
      );
    }

    if (activeMode === "vehicles") {
      return (
        <SearchVehicleResultList
          searchName={debouncedVehicleSearchName}
          onResultClick={handleResultNavigate}
          showFavorites={false}
          compact
        />
      );
    }

    return (
      <SearchLocationResultList
        searchName={debouncedLocationSearchName}
        includeTerminal
        listClassName={styles.locationList}
        onCelestialBodyClick={(body) => navigateWithSearch(`/b/${toUrlKey(body.name)}`)}
        onLocationClick={(scLocation) =>
          navigateWithSearch(`/l/${toUrlKey(scLocation.name)}`)
        }
        onTerminalClick={(terminal) => navigateWithSearch(`/t/${terminal.id}`)}
      />
    );
  };

  return (
    <>
      <button
        className={styles.universalHomeFab}
        type="button"
        onClick={goHome}
        aria-label="Home"
      >
        <Icon path={mdiHomeVariantOutline} size="1.5rem" />
      </button>
      <button
        className={styles.universalSearchFab}
        type="button"
        onClick={isOpen ? closeSearch : openSearch}
        aria-label={isOpen ? "Close search" : "Open search"}
      >
        <Icon path={isOpen ? mdiClose : mdiMagnify} size="1.5rem" />
      </button>
      {isOpen && (
        <div className={styles.UniversalSearch} role="dialog" aria-modal="true">
          <button
            className={styles.universalSearchBackdrop}
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
          />
          <div className={styles.universalSearchPanel} onClick={(event) => event.stopPropagation()}>
            <div className={styles.universalSearchTabs} role="tablist">
              {searchModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={activeMode === mode}
                  className={activeMode === mode ? styles.active : undefined}
                  onClick={() => selectMode(mode)}
                >
                  <Icon path={modeIcons[mode]} size="1.15rem" />
                  {t(modeI18nKeys[mode])}
                </button>
              ))}
            </div>
            <div className={styles.universalSearchInputRow}>
              <Icon className={styles.universalSearchIcon} path={mdiMagnify} size="1.35rem" />
              <input
                ref={inputRef}
                value={searchNames[activeMode]}
                onChange={(event) => setSearchName(event.target.value)}
                placeholder={t(modePlaceholders[activeMode])}
                aria-label={t(modePlaceholders[activeMode])}
              />
              <button
                type="button"
                className={[
                  styles.universalSearchIconButton,
                  styles.universalSearchClearButton,
                  searchNames[activeMode] ? styles.hasInput : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={clearOrCloseSearch}
                aria-label="Clear search"
              >
                <Icon path={mdiClose} size="1.25rem" />
              </button>
              {hasAvailableFilters && (
                <button
                  type="button"
                  className={[
                    styles.universalSearchIconButton,
                    isFilterOpen ? styles.active : undefined,
                    hasActiveFilters ? styles.hasActiveFilters : undefined,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setIsFilterOpen((value) => !value)}
                  aria-expanded={isFilterOpen}
                  aria-label="Toggle filters"
                >
                  <Icon path={mdiFilterVariant} size="1.25rem" />
                </button>
              )}
            </div>
            {hasAvailableFilters && isFilterOpen && (
              <div className={styles.universalSearchFilters}>{renderFilters()}</div>
            )}
            <div className={styles.universalSearchResults}>{renderResults()}</div>
          </div>
        </div>
      )}
    </>
  );
}
