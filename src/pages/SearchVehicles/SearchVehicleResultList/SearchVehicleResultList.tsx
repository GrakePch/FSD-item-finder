import styles from "./SearchVehicleResultList.module.css";
import VehicleCard from "./VehicleCard/VehicleCard";
import { useTranslation } from "react-i18next";
import {
  getVehicleCareerLabel,
  getVehicleManufacturerLabel,
  useVehicleSearch,
} from "../useVehicleSearch";

const SearchVehicleResultList = ({
  className,
  searchName,
  onResultClick,
  showFavorites = true,
  compact = false,
}: {
  className?: string;
  searchName: string;
  onResultClick?: () => void;
  showFavorites?: boolean;
  compact?: boolean;
}) => {
  const { t } = useTranslation();
  const vehicleSearch = useVehicleSearch(searchName);

  const manufacturerFilters = (
    <section className={styles.filterGroup}>
      <h2 className={styles.filterTitle}>
        {t("SearchVehicleResultList.manufacturerFilterTitle")}
      </h2>
      <div className={styles.filters}>
        <button
          onClick={vehicleSearch.clearManufacturerFilter}
          className={vehicleSearch.selectedManufacturer ? undefined : styles.active}
        >
          {t("FilterType.all")}
        </button>
        {vehicleSearch.manufacturers.map((manufacturer) => {
          const displayName = getVehicleManufacturerLabel(t, manufacturer, "short");
          const fullName = getVehicleManufacturerLabel(t, manufacturer, "full");

          return (
            <button
              key={manufacturer}
              onClick={() => vehicleSearch.toggleManufacturerFilter(manufacturer)}
              className={
                vehicleSearch.selectedManufacturer === manufacturer
                  ? styles.active
                  : undefined
              }
              title={fullName}
            >
              {displayName}
            </button>
          );
        })}
      </div>
    </section>
  );

  const careerFilters = (
    <section className={styles.filterGroup}>
      <h2 className={styles.filterTitle}>
        {t("SearchVehicleResultList.careerFilterTitle")}
      </h2>
      <div className={styles.filters}>
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
  );

  return (
    <div
      className={[
        styles.SearchVehicleResultList,
        compact ? styles.compact : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showFavorites && vehicleSearch.shouldShowFavoriteVehicles && (
        <>
          <section className={styles.favoriteVehicleSection}>
            <h2 className={styles.favoriteVehicleTitle}>
              {t("SearchVehicleResultList.favoriteVehicles", {
                defaultValue: "收藏的载具",
              })}
            </h2>
            <ul className={styles.favoriteVehicleList}>
              {vehicleSearch.favoriteVehicleList.map((vehicle) => (
                <li key={vehicle.ClassName} className={styles.singleVehicleItem}>
                  <VehicleCard
                    vehicle={vehicle}
                    uexBuyPrice={vehicleSearch.getUexBuyPrice(vehicle)}
                    onResultClick={onResultClick}
                  />
                </li>
              ))}
            </ul>
          </section>
          <div className={styles.vehicleListDivider} />
        </>
      )}
      <div className={styles.filterGroups}>
        {careerFilters}
        {manufacturerFilters}
      </div>
      {!vehicleSearch.vehicles.length ? (
        <div className={styles.vehicleNoResult}>{t("SearchVehicleResultList.noResult")}</div>
      ) : (
        <ul className={styles.vehicleGroupList}>
          {vehicleSearch.listSeries.flatMap((group) =>
            group.vehicles
              .sort((a, b) => (a.Store.Buy || Infinity) - (b.Store.Buy || Infinity))
              .map((vehicle) => (
                <li key={vehicle.ClassName} className={styles.singleVehicleItem}>
                  <VehicleCard
                    vehicle={vehicle}
                    uexBuyPrice={vehicleSearch.getUexBuyPrice(vehicle)}
                    onResultClick={onResultClick}
                  />
                </li>
              ))
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchVehicleResultList;
