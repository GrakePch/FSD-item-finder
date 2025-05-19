import "./SearchVehicleResultList.css";
import spvVehicleIndex from "../../../data/vehicles/spv_vehicle_index";
import vehicleClassNameToSeries from "../../../data/vehicles/manual_vehicle_classname_to_series";
import VehicleCard from "./VehicleCard/VehicleCard";
import { useTranslation } from "react-i18next";

type seriesInfo = {
  isSeries: boolean;
  seriesKey: string;
  vehicles: SpvVehicleIndex[];
  priceMin: number;
  priceMax: number;
};

const SearchVehicleResultList = ({ searchName }: { searchName: string }) => {
  const { t } = useTranslation();
  // Filter vehicles based on searchName (case-insensitive)
  const vehicles = spvVehicleIndex.filter((vehicle) => {
    const nameMatch = vehicle.Name.toLowerCase().includes(searchName.toLowerCase());
    const i18nName = t(`Vehicle.vehicle_Name${vehicle.ClassName}`, { defaultValue: "" });
    const i18nMatch = i18nName.toLowerCase().includes(searchName.toLowerCase());
    return nameMatch || i18nMatch;
  });
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
                      <VehicleCard key={vehicle.ClassName} vehicle={vehicle} />
                    ))}
                </ul>
              </li>
            ) : (
              <li key={group.vehicles[0].ClassName} className="single-vehicle-item">
                <VehicleCard vehicle={group.vehicles[0]} />
              </li>
            )
          )}
      </ul>
    </div>
  );
};

export default SearchVehicleResultList;
