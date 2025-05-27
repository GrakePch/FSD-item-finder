import "./CurrentLocation.css";
import { useState, useContext } from "react";
import Icon from "@mdi/react";
import { mdiCrosshairsGps, mdiClose } from "@mdi/js";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import SearchLocationBar from "../../pages/SearchLocations/SearchLocationBar/SearchLocationBar";
import SearchLocationResultList from "../../pages/SearchLocations/SearchLocationResultList/SearchLocationResultList";
import { locationNameToI18nKey } from "../../utils";
import { ContextAllData } from "../../contexts";

export const KEY_CURRENT_LOCATION = "fsd_current_location";

export const CurrentLocationButton = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLocation } = useContext(ContextAllData);

  // Use search param for popup state
  const params = new URLSearchParams(location.search);

  const openPopup = () => {
    params.set("selectLoc", "1");
    navigate({ search: params.toString() }, { replace: false });
  };

  const nameCurrentLocation = parseCurrentLocationName(currentLocation);

  return (
    <>
      <button className="CurrentLocationButton" onClick={openPopup}>
        <Icon path={mdiCrosshairsGps} size="1rem" />
        <span>{t(`Location.${locationNameToI18nKey(nameCurrentLocation)}`)}</span>
      </button>
    </>
  );
};

export const WindowSelectCurrentLocation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLocation, setCurrentLocation } = useContext(ContextAllData);
  const [searchName, setSearchName] = useState("");

  // Use search param for popup state
  const params = new URLSearchParams(location.search);
  const isPopupShowing = params.get("selectLoc") === "1";
  const closePopup = () => {
    params.delete("selectLoc");
    navigate({ search: params.toString() }, { replace: false });
  };

  /*
   * When Clicking on Celestial Body card, from := celestialBody.name
   * When Clicking on Location card, from := "_loc_" + location.name
   */

  const handleCelestialBodyClick = (body: CelestialBody) => {
    setCurrentLocation(body.name);
    const params = new URLSearchParams(window.location.search);
    params.delete("from");
    params.delete("selectLoc");
    navigate({ search: params.toString() }, { replace: false });
  };
  const handleLocationClick = (location: SCLocation) => {
    if (location.parentBody && location.parentBody.name) {
      setCurrentLocation("_loc_" + location.name);
    }
    const params = new URLSearchParams(window.location.search);
    params.delete("from");
    params.delete("selectLoc");
    navigate({ search: params.toString() }, { replace: false });
  };

  const nameCurrentLocation = parseCurrentLocationName(currentLocation);

  return (
    <div className={`WindowSelectCurrentLocation ${isPopupShowing ? "on" : ""}`}>
      <div className="bg" onClick={closePopup}></div>
      <div className="window-container">
        <div className="current-location-info">
          <h4>
            {t(`Navbar.currentLocation`)}{" "}
            {t(`Location.${locationNameToI18nKey(nameCurrentLocation)}`)}
          </h4>
          <button className="close" onClick={closePopup}>
            <Icon path={mdiClose} />
          </button>
        </div>
        <SearchLocationBar searchName={searchName} setSearchName={setSearchName} />
        <div className="result-list-scrollable">
          <SearchLocationResultList
            searchName={searchName}
            onCelestialBodyClick={handleCelestialBodyClick}
            onLocationClick={handleLocationClick}
          />
        </div>
      </div>
    </div>
  );
};

export const parseCurrentLocationName = (value: string): string =>
  value.startsWith("_loc_") ? value.substring(5) : value;
