import "./SearchVehicleResultList.css";
import VehicleCard from "./VehicleCard/VehicleCard";
import { useTranslation } from "react-i18next";
import {
  getVehicleManufacturerLabel,
  useVehicleSearch,
} from "../useVehicleSearch";

const SearchVehicleResultList = ({
  searchName,
  onResultClick,
  showFavorites = true,
}: {
  searchName: string;
  onResultClick?: () => void;
  showFavorites?: boolean;
}) => {
  const { t } = useTranslation();
  const vehicleSearch = useVehicleSearch(searchName);

  const manufacturerFilters = (
    <div className="filters vehicle-manufacturer-filters">
      <button
        onClick={vehicleSearch.clearManufacturerFilter}
        className={vehicleSearch.selectedManufacturer ? undefined : "active"}
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
              vehicleSearch.selectedManufacturer === manufacturer ? "active" : undefined
            }
            title={fullName}
          >
            {displayName}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="SearchVehicleResultList">
      {showFavorites && vehicleSearch.shouldShowFavoriteVehicles && (
        <>
          <section className="favorite-vehicle-section">
            <h2 className="favorite-vehicle-title">
              {t("SearchVehicleResultList.favoriteVehicles", {
                defaultValue: "收藏的载具",
              })}
            </h2>
            <ul className="favorite-vehicle-list">
              {vehicleSearch.favoriteVehicleList.map((vehicle) => (
                <li key={vehicle.ClassName} className="single-vehicle-item">
                  <VehicleCard
                    vehicle={vehicle}
                    uexBuyPrice={vehicleSearch.getUexBuyPrice(vehicle)}
                    onResultClick={onResultClick}
                  />
                </li>
              ))}
            </ul>
          </section>
          <div className="vehicle-list-divider" />
        </>
      )}
      {manufacturerFilters}
      {!vehicleSearch.vehicles.length ? (
        <div className="vehicle-no-result">{t("SearchVehicleResultList.noResult")}</div>
      ) : (
        <ul className="vehicle-group-list">
          {vehicleSearch.listSeries.flatMap((group) =>
            group.vehicles
              .sort((a, b) => (a.Store.Buy || Infinity) - (b.Store.Buy || Infinity))
              .map((vehicle) => (
                <li key={vehicle.ClassName} className="single-vehicle-item">
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
