import { useContext, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ContextAllData } from "../../contexts";
import spvVehicleIndex from "../../data/vehicles/spv_vehicle_index";
import vehicleClassNameToSeries from "../../data/vehicles/manual_vehicle_classname_to_series";
import spvClassNameToUexId from "../../data/vehicles/spv_classname_to_uex_id.json";
import { getTranslatedVehicleName } from "../../utils/vehicleI18n";
import useFavoriteVehicles from "../../hooks/useFavoriteVehicles";
import { spvRoleToKey } from "../../utils";

export type VehicleSeriesInfo = {
  isSeries: boolean;
  seriesKey: string;
  vehicles: SpvVehicleIndex[];
  priceMin: number;
  priceMax: number;
};

export const manufacturerI18nKeys: Record<string, string> = {
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

function buildSeriesList(vehicles: SpvVehicleIndex[]) {
  const seriesMap: { [seriesKey: string]: SpvVehicleIndex[] } = {};

  vehicles.forEach((vehicle) => {
    const series = vehicleClassNameToSeries[vehicle.ClassName] || "";
    const groupKey = series.trim() ? series : vehicle.ClassName;
    if (!seriesMap[groupKey]) {
      seriesMap[groupKey] = [];
    }
    seriesMap[groupKey].push(vehicle);
  });

  return Object.entries(seriesMap)
    .map(([seriesKey, groupVehicles]) => {
      const isSeries = !!(
        vehicleClassNameToSeries[groupVehicles[0].ClassName] &&
        vehicleClassNameToSeries[groupVehicles[0].ClassName].trim()
      );
      const prices = groupVehicles.map((vehicle) =>
        typeof vehicle.Store.Buy === "number" ? vehicle.Store.Buy : Infinity
      );
      const priceMin = prices.length ? Math.min(...prices) : 0;
      const priceMax = prices.length ? Math.max(...prices) : 0;
      return {
        isSeries,
        seriesKey,
        vehicles: groupVehicles,
        priceMin,
        priceMax,
      };
    })
    .sort((a, b) => {
      if (a.isSeries && b.isSeries) return a.seriesKey.localeCompare(b.seriesKey);
      if (a.isSeries) return -1;
      if (b.isSeries) return 1;
      return a.vehicles[0].Name.localeCompare(b.vehicles[0].Name);
    })
    .sort((a, b) => a.priceMin - b.priceMin);
}

export function getVehicleManufacturerLabel(
  t: TFunction,
  manufacturer: string,
  variant: "short" | "full"
) {
  const manufacturerKey = manufacturerI18nKeys[manufacturer];
  return manufacturerKey
    ? t(`VehicleManufacturer.${variant}.${manufacturerKey}`, {
        defaultValue: manufacturer,
      })
    : manufacturer;
}

export function getVehicleCareerLabel(t: TFunction, career: string) {
  return t(`vehicle_class_${spvRoleToKey(career)}`, {
    ns: "vehicle_classes",
    defaultValue: career,
  });
}

export function useVehicleSearch(searchName: string) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dictVehicles } = useContext(ContextAllData);
  const { favoriteVehicles } = useFavoriteVehicles();
  const selectedManufacturer = searchParams.get("manufacturer") || "";
  const selectedCareer = searchParams.get("career") || "";
  const normalizedSearchName = searchName.trim().toLowerCase();

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

  const careers = useMemo(
    () =>
      Array.from(new Set(spvVehicleIndex.map((vehicle) => vehicle.Career)))
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

  const vehicles = useMemo(
    () =>
      spvVehicleIndex.filter((vehicle) => {
        const nameMatch = vehicle.Name.toLowerCase().includes(normalizedSearchName);
        const i18nName = getTranslatedVehicleName(t, vehicle);
        const i18nMatch = i18nName.toLowerCase().includes(normalizedSearchName);
        const manufacturerMatch =
          !selectedManufacturer || vehicle.Manufacturer === selectedManufacturer;
        const careerMatch = !selectedCareer || vehicle.Career === selectedCareer;
        return (nameMatch || i18nMatch) && manufacturerMatch && careerMatch;
      }),
    [normalizedSearchName, selectedCareer, selectedManufacturer, t]
  );

  const favoriteVehicleList = useMemo(() => {
    const vehicleByClassName = Object.fromEntries(
      spvVehicleIndex.map((vehicle) => [vehicle.ClassName, vehicle])
    );

    return favoriteVehicles
      .map((vehicleClassName) => vehicleByClassName[vehicleClassName])
      .filter((vehicle): vehicle is SpvVehicleIndex => !!vehicle)
      .sort((a, b) => {
        const priceA = typeof a.Store.Buy === "number" ? a.Store.Buy : Infinity;
        const priceB = typeof b.Store.Buy === "number" ? b.Store.Buy : Infinity;
        return priceA - priceB || a.Name.localeCompare(b.Name);
      });
  }, [favoriteVehicles]);

  const listSeries = useMemo(() => buildSeriesList(vehicles), [vehicles]);
  const shouldShowFavoriteVehicles =
    normalizedSearchName.length === 0 && favoriteVehicleList.length > 0;

  const updateParams = (updater: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams);
    updater(nextParams);
    setSearchParams(nextParams);
  };

  return {
    vehicles,
    listSeries,
    favoriteVehicleList,
    shouldShowFavoriteVehicles,
    selectedManufacturer,
    selectedCareer,
    manufacturers,
    careers,
    getUexBuyPrice,
    clearManufacturerFilter: () =>
      updateParams((params) => params.delete("manufacturer")),
    toggleManufacturerFilter: (manufacturer: string) =>
      updateParams((params) => {
        if (selectedManufacturer === manufacturer) {
          params.delete("manufacturer");
        } else {
          params.set("manufacturer", manufacturer);
        }
      }),
    clearCareerFilter: () => updateParams((params) => params.delete("career")),
    toggleCareerFilter: (career: string) =>
      updateParams((params) => {
        if (selectedCareer === career) {
          params.delete("career");
        } else {
          params.set("career", career);
        }
      }),
  };
}
