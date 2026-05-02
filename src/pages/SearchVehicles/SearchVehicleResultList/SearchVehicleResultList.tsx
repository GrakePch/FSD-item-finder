import "./SearchVehicleResultList.css";
import spvVehicleIndex from "../../../data/vehicles/spv_vehicle_index";
import vehicleClassNameToSeries from "../../../data/vehicles/manual_vehicle_classname_to_series";
import spvClassNameToUexId from "../../../data/vehicles/spv_classname_to_uex_id.json";
import VehicleCard from "./VehicleCard/VehicleCard";
import { useTranslation } from "react-i18next";
import { useContext, useMemo } from "react";
import { useSearchParams } from "react-router";
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

const manufacturerI18nKeys: Record<string, string> = {
  "Aegis Dynamics": "AEGS",
  "Anvil Aerospace": "ANVL",
  Aopoa: "XNAA",
  "Argo Astronautics": "ARGO",
  "Banu Suli": "BANU",
  "Consolidated Outland": "CNOU",
  "Crusader Industries": "CRUS",
  "Drake Interplanetary": "DRAK",
  Esperia: "ESPR",
  "Gatac Manufacture": "GAMA",
  "Grey's": "GREY",
  "Greycat Industrial": "GRIN",
  "Kruger Intergalactic": "KRIG",
  Mirai: "MRAI",
  "Musashi Industrial and Starflight Concern": "MISC",
  "Origin Jumpworks": "Origin",
  "Roberts Space Industries": "RSI",
  "Tumbril Land Systems": "TMBL",
  Vanduul: "VNCL",
};

const SearchVehicleResultList = ({ searchName }: { searchName: string }) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dictVehicles } = useContext(ContextAllData);
  const { favoriteVehicles } = useFavoriteVehicles();
  const selectedManufacturer = searchParams.get("manufacturer") || "";

  const uexVehicleById = useMemo(() => {
    return Object.fromEntries(
      Object.values(dictVehicles).map((vehicle) => [vehicle.id_vehicle, vehicle])
    );
  }, [dictVehicles]);

  const manufacturers = useMemo(
    () =>
      Array.from(new Set(spvVehicleIndex.map((vehicle) => vehicle.Manufacturer)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    []
  );

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

  const vehicles = spvVehicleIndex.filter((vehicle) => {
    const nameMatch = vehicle.Name.toLowerCase().includes(normalizedSearchName);
    const i18nName = getTranslatedVehicleName(t, vehicle);
    const i18nMatch = i18nName.toLowerCase().includes(normalizedSearchName);
    const manufacturerMatch =
      !selectedManufacturer || vehicle.Manufacturer === selectedManufacturer;
    return (nameMatch || i18nMatch) && manufacturerMatch;
  });

  const vehicleByClassName = Object.fromEntries(
    spvVehicleIndex.map((vehicle) => [vehicle.ClassName, vehicle])
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

  listSeries.sort((a, b) => {
    if (a.isSeries && b.isSeries) return a.seriesKey.localeCompare(b.seriesKey);
    if (a.isSeries) return -1;
    if (b.isSeries) return 1;
    return a.vehicles[0].Name.localeCompare(b.vehicles[0].Name);
  });

  const manufacturerFilters = (
    <div className="filters vehicle-manufacturer-filters">
      <button
        onClick={() => {
          searchParams.delete("manufacturer");
          setSearchParams(searchParams);
        }}
        className={selectedManufacturer ? undefined : "active"}
      >
        {t("FilterType.all")}
      </button>
      {manufacturers.map((manufacturer) => {
        const manufacturerKey = manufacturerI18nKeys[manufacturer];
        const displayName = manufacturerKey
          ? t(`VehicleManufacturer.short.${manufacturerKey}`)
          : manufacturer;
        const fullName = manufacturerKey
          ? t(`VehicleManufacturer.full.${manufacturerKey}`, { defaultValue: manufacturer })
          : manufacturer;

        return (
          <button
            key={manufacturer}
            onClick={() => {
              if (selectedManufacturer === manufacturer) {
                searchParams.delete("manufacturer");
              } else {
                searchParams.set("manufacturer", manufacturer);
              }
              setSearchParams(searchParams);
            }}
            className={selectedManufacturer === manufacturer ? "active" : undefined}
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
      {manufacturerFilters}
      {!vehicles.length ? (
        <div className="vehicle-no-result">{t("SearchVehicleResultList.noResult")}</div>
      ) : (
        <ul className="vehicle-group-list">
          {listSeries
            .sort((a, b) => a.priceMin - b.priceMin)
            .map((group) =>
              group.isSeries ? (
                <li key={group.seriesKey} className="vehicle-group">
                  <div className="vehicle-series-title">
                    {t("VehicleSeries." + group.seriesKey)}
                  </div>
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
      )}
    </div>
  );
};

export default SearchVehicleResultList;
