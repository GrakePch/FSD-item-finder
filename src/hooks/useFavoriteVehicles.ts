import { useCallback, useEffect, useMemo, useState } from "react";

const KEY_FAVORITE_VEHICLES = "fsd_favorite_vehicles";
const EVENT_FAVORITE_VEHICLES_CHANGED = "fsd_favorite_vehicles_changed";

const readFavoriteVehicles = () => {
  try {
    const raw = localStorage.getItem(KEY_FAVORITE_VEHICLES);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const writeFavoriteVehicles = (favoriteVehicles: string[]) => {
  localStorage.setItem(KEY_FAVORITE_VEHICLES, JSON.stringify(favoriteVehicles));
  window.dispatchEvent(new Event(EVENT_FAVORITE_VEHICLES_CHANGED));
};

const useFavoriteVehicles = () => {
  const [favoriteVehicles, setFavoriteVehicles] = useState(readFavoriteVehicles);

  useEffect(() => {
    const syncFavoriteVehicles = () => {
      setFavoriteVehicles(readFavoriteVehicles());
    };

    window.addEventListener("storage", syncFavoriteVehicles);
    window.addEventListener(EVENT_FAVORITE_VEHICLES_CHANGED, syncFavoriteVehicles);

    return () => {
      window.removeEventListener("storage", syncFavoriteVehicles);
      window.removeEventListener(EVENT_FAVORITE_VEHICLES_CHANGED, syncFavoriteVehicles);
    };
  }, []);

  const favoriteVehicleSet = useMemo(
    () => new Set(favoriteVehicles),
    [favoriteVehicles]
  );

  const toggleFavoriteVehicle = useCallback((vehicleClassName: string) => {
    const currentFavoriteVehicles = readFavoriteVehicles();
    const nextFavoriteVehicles = currentFavoriteVehicles.includes(vehicleClassName)
      ? currentFavoriteVehicles.filter((favorite) => favorite !== vehicleClassName)
      : [vehicleClassName, ...currentFavoriteVehicles];

    writeFavoriteVehicles(nextFavoriteVehicles);
    setFavoriteVehicles(nextFavoriteVehicles);
  }, []);

  const isFavoriteVehicle = useCallback(
    (vehicleClassName: string) => favoriteVehicleSet.has(vehicleClassName),
    [favoriteVehicleSet]
  );

  return {
    favoriteVehicles,
    favoriteVehicleSet,
    isFavoriteVehicle,
    toggleFavoriteVehicle,
  };
};

export default useFavoriteVehicles;
