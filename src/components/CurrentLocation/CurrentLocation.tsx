import styles from "./CurrentLocation.module.css";
import { useState, useContext } from "react";
import Icon from "@mdi/react";
import { mdiCrosshairsGps, mdiClose } from "@mdi/js";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import SearchLocationBar from "../LocationSearch/SearchLocationBar/SearchLocationBar";
import SearchLocationResultList from "../LocationSearch/SearchLocationResultList/SearchLocationResultList";
import { locationNameToI18nKey } from "../../utils";
import { ContextAllData } from "../../contexts";
import useDebouncedValue from "../../hooks/useDebouncedValue";

export const KEY_CURRENT_LOCATION = "fsd_current_location";
export const DEFAULT_CURRENT_BODY_CODE = "STANTON/II";

export const CurrentLocationButton = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLocation, dictCelestialBodies, dictLocations } =
    useContext(ContextAllData);

  // Use search param for popup state
  const params = new URLSearchParams(location.search);

  const openPopup = () => {
    params.set("selectLoc", "1");
    navigate({ search: params.toString() }, { replace: false });
  };

  const nameCurrentLocation = parseCurrentLocationName(
    currentLocation,
    dictCelestialBodies,
    dictLocations
  );

  return (
    <>
      <button className={styles.CurrentLocationButton} onClick={openPopup}>
        <Icon path={mdiCrosshairsGps} size="1rem" />
        <span>{t(locationNameToI18nKey(nameCurrentLocation), { ns: "locations" })}</span>
      </button>
    </>
  );
};

export const WindowSelectCurrentLocation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLocation, setCurrentLocation, dictCelestialBodies, dictLocations } =
    useContext(ContextAllData);
  const [searchName, setSearchName] = useState("");
  const debouncedSearchName = useDebouncedValue(searchName);

  // Use search param for popup state
  const params = new URLSearchParams(location.search);
  const isPopupShowing = params.get("selectLoc") === "1";
  const closePopup = () => {
    params.delete("selectLoc");
    navigate({ search: params.toString() }, { replace: false });
  };

  /*
   * When Clicking on Celestial Body card, from := celestialBody.code
   * When Clicking on Location card, from := location.code
   */

  const handleCelestialBodyClick = (body: CelestialBody) => {
    setCurrentLocation(body.code);
    const params = new URLSearchParams(window.location.search);
    params.delete("from");
    params.delete("selectLoc");
    navigate({ search: params.toString() }, { replace: false });
  };
  const handleLocationClick = (location: SCLocation) => {
    if (location.parentBody) {
      setCurrentLocation(location.code);
    }
    const params = new URLSearchParams(window.location.search);
    params.delete("from");
    params.delete("selectLoc");
    navigate({ search: params.toString() }, { replace: false });
  };

  const nameCurrentLocation = parseCurrentLocationName(
    currentLocation,
    dictCelestialBodies,
    dictLocations
  );

  return (
    <div
      className={[
        styles.WindowSelectCurrentLocation,
        isPopupShowing ? styles.on : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.bg} onClick={closePopup}></div>
      <div className={styles.windowContainer}>
        <div className={styles.currentLocationInfo}>
          <h4>
            {t(`Navbar.currentLocation`)}{" "}
            {t(locationNameToI18nKey(nameCurrentLocation), { ns: "locations" })}
          </h4>
          <button className={styles.close} onClick={closePopup}>
            <Icon path={mdiClose} />
          </button>
        </div>
        <SearchLocationBar
          className={styles.searchLocationBar}
          searchName={searchName}
          setSearchName={setSearchName}
        />
        <div className={styles.resultListScrollable}>
          <SearchLocationResultList
            searchName={debouncedSearchName}
            onCelestialBodyClick={handleCelestialBodyClick}
            onLocationClick={handleLocationClick}
          />
        </div>
      </div>
    </div>
  );
};

export const parseCurrentLocationName = (
  value: string,
  dictCelestialBodies: CelestialBodyDictionary = {},
  dictLocations: LocationDictionary = {}
): string =>
  dictLocations[value]?.name || dictCelestialBodies[value]?.name || value;
