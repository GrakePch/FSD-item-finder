import "./SearchVehicleResultList.css";
import spvVehicleIndex from "../../../data/vehicles/spv_vehicle_index";
import vehicleClassNameToSeries from "../../../data/vehicles/manual_vehicle_classname_to_series";
import spvClassNameToUexId from "../../../data/vehicles/spv_classname_to_uex_id.json";
import VehicleCard from "./VehicleCard/VehicleCard";
import { useTranslation } from "react-i18next";
import { useContext, useMemo } from "react";
import { ContextAllData } from "../../../contexts";
import { getTranslatedVehicleName } from "../../../utils/vehicleI18n";
import useFavoriteVehicles from "../../../hooks/useFavoriteVehicles";

type seriesInfo = {
  isSeries: boolean;
  seriesKey: string;
  vehicles: SpvVehicleIndex[];
  priceMin: number;
  priceMax: number;
};

const SearchVehicleResultList = ({ searchName }: { searchName: string }) => {
  const { t } = useTranslation();
  const { dictVehicles } = useContext(ContextAllData);
  const { favoriteVehicles } = useFavoriteVehicles();

  const uexVehicleById = useMemo(() => {
    return Object.fromEntries(
      Object.values(dictVehicles).map((vehicle) => [vehicle.id_vehicle, vehicle])
    );
  }, [dictVehicles]);

  const getUexBuyPrice = (vehicle: SpvVehicleIndex) => {
    if (Object.keys(uexVehicleById).length === 0) return undefined;

    const uexId =
      (spvClassNameToUexId as Record<string, number | null | undefined>)[
        vehicle.ClassName
      ];
    const buyPrice = uexId ? uexVehicleById[uexId]?.price_min_max.buy_min : null;
    return buyPrice && buyPrice < Infinity ? buyPrice : null;
  };

  const normalizedSearchName = searchName.trim().toLowerCase();

  // Filter vehicles based on searchName (case-insensitive)
  const vehicles = spvVehicleIndex.filter((vehicle) => {
    const nameMatch = vehicle.Name.toLowerCase().includes(normalizedSearchName);
    const i18nName = getTranslatedVehicleName(t, vehicle);
    const i18nMatch = i18nName.toLowerCase().includes(normalizedSearchName);
    return nameMatch || i18nMatch;
  });

  const vehicleByClassName = Object.fromEntries(
    vehicles.map((vehicle) => [vehicle.ClassName, vehicle])
  );
  const favoriteVehicleList = favoriteVehicles
    .map((vehicleClassName) => vehicleByClassName[vehicleClassName])
    .filter((vehicle): vehicle is SpvVehicleIndex => !!vehicle)
    .sort((a, b) => {
      const priceA = typeof a.Store.Buy === "number" ? a.Store.Buy : Infinity;
      const priceB = typeof b.Store.Buy === "number" ? b.Store.Buy : Infinity;
      return priceA - priceB || a.Name.localeCompare(b.Name);
    });
  const shouldShowFavoriteVehicles =
    normalizedSearchName.length === 0 && favoriteVehicleList.length > 0;

  // Group vehicles into listSeries: seriesInfo[]
  const seriesMap: { [seriesKey: string]: SpvVehicleIndex[] } = {};
  vehicles.forEach((vehicle) => {
    const series = vehicleClassNameToSeries[vehicle.ClassName] || "";
    const groupKey = series.trim() ? series : vehicle.ClassName;
    if (!seriesMap[groupKey]) {
      seriesMap[groupKey] = [];
    }
    seriesMap[groupKey].push(vehicle);
  });

  const listSeries: seriesInfo[] = Object.entries(seriesMap).map(
    ([seriesKey, vehicles]) => {
      const isSeries = !!(
        vehicleClassNameToSeries[vehicles[0].ClassName] &&
        vehicleClassNameToSeries[vehicles[0].ClassName].trim()
      );
      const prices = vehicles.map((v) =>
        typeof v.Store.Buy === "number" ? v.Store.Buy : Infinity
      );
      const priceMin = prices.length ? Math.min(...prices) : 0;
      const priceMax = prices.length ? Math.max(...prices) : 0;
      return {
        isSeries,
        seriesKey,
        vehicles,
        priceMin,
        priceMax,
      };
    }
  );

  // Sort: series first by name, then singles by vehicle name
  listSeries.sort((a, b) => {
    if (a.isSeries && b.isSeries) return a.seriesKey.localeCompare(b.seriesKey);
    if (a.isSeries) return -1;
    if (b.isSeries) return 1;
    // both single, sort by vehicle name
    return a.vehicles[0].Name.localeCompare(b.vehicles[0].Name);
  });

  return !vehicles.length ? (
    <div className="SearchVehicleResultList">{t("SearchVehicleResultList.noResult")}</div>
  ) : (
    <div className="SearchVehicleResultList">
      {shouldShowFavoriteVehicles && (
        <>
          <section className="favorite-vehicle-section">
            <h2 className="favorite-vehicle-title">
              {t("SearchVehicleResultList.favoriteVehicles", {
                defaultValue: "收藏的载具",
              })}
            </h2>
            <ul className="favorite-vehicle-list">
              {favoriteVehicleList.map((vehicle) => (
                <li key={vehicle.ClassName} className="single-vehicle-item">
                  <VehicleCard vehicle={vehicle} uexBuyPrice={getUexBuyPrice(vehicle)} />
                </li>
              ))}
            </ul>
          </section>
          <div className="vehicle-list-divider" />
        </>
      )}
      <ul className="vehicle-group-list">
        {listSeries
          .sort((a, b) => a.priceMin - b.priceMin)
          .map((group) =>
            group.isSeries ? (
              <li key={group.seriesKey} className="vehicle-group">
                <div className="vehicle-series-title">{t("VehicleSeries."+group.seriesKey)}</div>
                <ul className="vehicle-list">
                  {group.vehicles
                    .sort((a, b) => (a.Store.Buy || Infinity) - (b.Store.Buy || Infinity))
                    .map((vehicle) => (
                      <VehicleCard
                        key={vehicle.ClassName}
                        vehicle={vehicle}
                        uexBuyPrice={getUexBuyPrice(vehicle)}
                      />
                    ))}
                </ul>
              </li>
            ) : (
              <li key={group.vehicles[0].ClassName} className="single-vehicle-item">
                <VehicleCard
                  vehicle={group.vehicles[0]}
                  uexBuyPrice={getUexBuyPrice(group.vehicles[0])}
                />
              </li>
            )
          )}
      </ul>
    </div>
  );
};

export default SearchVehicleResultList;
