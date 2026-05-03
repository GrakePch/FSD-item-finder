import { useContext, useMemo, useState } from "react";
import Icon from "@mdi/react";
import { mdiTrashCanOutline } from "@mdi/js";
import { useTranslation } from "react-i18next";
import { ContextAllData } from "../../contexts";
import { clearLocalStorageRecent, getLocalStorageRecent } from "../../utils";
import SearchResultList from "./SearchResultList/SearchResultList";
import VehicleCard from "../SearchVehicles/SearchVehicleResultList/VehicleCard/VehicleCard";
import { useVehicleSearch } from "../SearchVehicles/useVehicleSearch";
import "./SearchItems.css";

const SearchItems = () => {
  const { t } = useTranslation();
  const { dictItems } = useContext(ContextAllData);
  const [recentVersion, setRecentVersion] = useState(0);
  const vehicleSearch = useVehicleSearch("");

  const recentItems = useMemo(() => {
    void recentVersion;
    return getLocalStorageRecent()
      .map((key) => dictItems[key])
      .filter((item): item is Item => Boolean(item));
  }, [dictItems, recentVersion]);

  const clearRecentItems = () => {
    clearLocalStorageRecent();
    setRecentVersion((version) => version + 1);
  };

  const hasFavoriteVehicles = vehicleSearch.favoriteVehicleList.length > 0;
  const hasRecentItems = recentItems.length > 0;
  const isEmptyHome = !hasFavoriteVehicles && !hasRecentItems;

  return (
    <div className={`SearchItems ${isEmptyHome ? "empty-home" : ""}`}>
      <div className="home-content">
        {hasFavoriteVehicles && (
          <section className="home-section">
            <h2>{t("SearchVehicleResultList.favoriteVehicles")}</h2>
            <ul className="home-favorite-vehicle-list">
              {vehicleSearch.favoriteVehicleList.map((vehicle) => (
                <li key={vehicle.ClassName} className="home-vehicle-item">
                  <VehicleCard
                    vehicle={vehicle}
                    uexBuyPrice={vehicleSearch.getUexBuyPrice(vehicle)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
        {hasRecentItems && (
          <section className="home-section">
            <div className="home-section-title-row">
              <h2>{t("SearchItemBar.recentSearches")}</h2>
              <button className="home-clear-recent" onClick={clearRecentItems}>
                <Icon path={mdiTrashCanOutline} size="1rem" />
                {t("SearchItemBar.clear")}
              </button>
            </div>
            <SearchResultList results={recentItems} />
          </section>
        )}
        {isEmptyHome && (
          <div className="home-empty">
            <div className="home-empty-title">{t("SearchItemBar.homeTitle")}</div>
            <div className="home-empty-subtitle">
              {t("SearchItemBar.homeSubtitle")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchItems;
