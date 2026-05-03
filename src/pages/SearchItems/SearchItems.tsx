import { useContext, useMemo, useState } from "react";
import Icon from "@mdi/react";
import { mdiTrashCanOutline } from "@mdi/js";
import { useTranslation } from "react-i18next";
import { ContextAllData } from "../../contexts";
import { clearLocalStorageRecent, getLocalStorageRecent } from "../../utils";
import SearchResultList from "./SearchResultList/SearchResultList";
import VehicleCard from "../SearchVehicles/SearchVehicleResultList/VehicleCard/VehicleCard";
import { useVehicleSearch } from "../SearchVehicles/useVehicleSearch";
import styles from "./SearchItems.module.css";

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
    <div
      className={[
        styles.SearchItems,
        isEmptyHome ? styles.emptyHome : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.homeContent}>
        {hasFavoriteVehicles && (
          <section className={styles.homeSection}>
            <h2>{t("SearchVehicleResultList.favoriteVehicles")}</h2>
            <ul className={styles.homeFavoriteVehicleList}>
              {vehicleSearch.favoriteVehicleList.map((vehicle) => (
                <li key={vehicle.ClassName} className={styles.homeVehicleItem}>
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
          <section className={styles.homeSection}>
            <div className={styles.homeSectionTitleRow}>
              <h2>{t("SearchItemBar.recentSearches")}</h2>
              <button className={styles.homeClearRecent} onClick={clearRecentItems}>
                <Icon path={mdiTrashCanOutline} size="1rem" />
                {t("SearchItemBar.clear")}
              </button>
            </div>
            <SearchResultList
              className={styles.searchResultList}
              results={recentItems}
            />
          </section>
        )}
        {isEmptyHome && (
          <div className={styles.homeEmpty}>
            <div className={styles.homeEmptyTitle}>{t("SearchItemBar.homeTitle")}</div>
            <div className={styles.homeEmptySubtitle}>
              {t("SearchItemBar.homeSubtitle")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchItems;
