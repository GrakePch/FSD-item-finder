import { useLocation, Link, useNavigate } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import Icon from "@mdi/react";
import { icon } from "../../assets/icon";
import { mdiClose, mdiCrosshairsGps, mdiMapMarker, mdiWidgetsOutline } from "@mdi/js";
import "./NavBar.css";
import SearchLocationBar from "../../pages/SearchLocations/SearchLocationBar/SearchLocationBar";
import SearchLocationResultList from "../../pages/SearchLocations/SearchLocationResultList/SearchLocationResultList";
import { locationNameToI18nKey } from "../../utils";
import { useTranslation } from "react-i18next";

export const KEY_CURRENT_LOCATION = "fsd_current_location";

const NavBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<string>(
    () => localStorage.getItem(KEY_CURRENT_LOCATION) || ""
  );

  useEffect(() => {
    // Check for 'from' in search params
    const params = new URLSearchParams(location.search);
    const fromParam = params.get("from");
    let stored = localStorage.getItem(KEY_CURRENT_LOCATION);
    if (fromParam) {
      localStorage.setItem(KEY_CURRENT_LOCATION, fromParam);
      setCurrentLocation(fromParam);
    } else {
      // If 'from' is not present, check if current location is stored
      if (!stored) {
        // If not, set default location
        stored = "Crusader";
        localStorage.setItem(KEY_CURRENT_LOCATION, stored);
      }
      setCurrentLocation(stored);
    }
  }, [location.search]);

  const tabSearch = useMemo<"items" | "vehicles" | "locations">(() => {
    if (location.pathname.startsWith("/v")) {
      return "vehicles";
    } else if (
      location.pathname.startsWith("/l") ||
      location.pathname.startsWith("/t") ||
      location.pathname.startsWith("/b")
    ) {
      return "locations";
    } else {
      return "items";
    }
  }, [location.pathname]);

  // Use search param for popup state
  const params = new URLSearchParams(location.search);
  const isPopupShowing = params.get("selectLoc") === "1";

  const openPopup = () => {
    params.set("selectLoc", "1");
    navigate({ search: params.toString() }, { replace: false });
  };
  const closePopup = () => {
    params.delete("selectLoc");
    navigate({ search: params.toString() }, { replace: false });
  };

  const nameCurrentLocation = currentLocation.startsWith("_loc_")
    ? currentLocation.substring(5)
    : currentLocation;

  return (
    <>
      <div className="NavBar">
        <div className="nav-container">
          <h1 className="title">
            星际
            {tabSearch === "vehicles"
              ? "寻船"
              : tabSearch === "locations"
              ? "寻址"
              : "寻物"}
          </h1>
          <nav className="links-container">
            <Link to="/" className={tabSearch === "items" ? "active" : ""}>
              <Icon path={mdiWidgetsOutline} size="2rem" />
            </Link>
            <Link to="/v" className={tabSearch === "vehicles" ? "active" : ""}>
              <Icon path={icon.Vehicle} size="2rem" />
            </Link>
            <Link to="/l" className={tabSearch === "locations" ? "active" : ""}>
              <Icon path={mdiMapMarker} size="2rem" />
            </Link>
          </nav>
          <div className="grow" />
          <button className="current-location" onClick={openPopup}>
            <Icon path={mdiCrosshairsGps} size="1.5rem" />
            <span>{t(`Location.${locationNameToI18nKey(nameCurrentLocation)}`)}</span>
          </button>
        </div>
      </div>

      <nav className="NavBarBottom">
        <Link to="/" className={tabSearch === "items" ? "active" : ""}>
          <Icon path={mdiWidgetsOutline} />
          <span>寻物</span>
        </Link>
        <Link to="/v" className={tabSearch === "vehicles" ? "active" : ""}>
          <Icon path={icon.Vehicle} />
          <span>寻船</span>
        </Link>
        <Link to="/l" className={tabSearch === "locations" ? "active" : ""}>
          <Icon path={mdiMapMarker} />
          <span>寻址</span>
        </Link>
      </nav>

      <WindowSelectCurrentLocation
        isDisplaying={isPopupShowing}
        close={closePopup}
        currentLocationName={nameCurrentLocation}
      />
    </>
  );
};

export default NavBar;

type WindowSelectCurrentLocationProps = {
  isDisplaying: boolean;
  close: () => void;
  currentLocationName: string;
};

const WindowSelectCurrentLocation = ({
  isDisplaying,
  close,
  currentLocationName,
}: WindowSelectCurrentLocationProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState("");

  /*
   * When Clicking on Celestial Body card, from := celestialBody.name
   * When Clicking on Location card, from := "_loc_" + location.name
   */

  const handleCelestialBodyClick = (body: CelestialBody) => {
    const params = new URLSearchParams(window.location.search);
    params.set("from", body.name);
    params.delete("selectLoc");
    navigate({ search: params.toString() }, { replace: false });
  };
  const handleLocationClick = (location: SCLocation) => {
    const params = new URLSearchParams(window.location.search);
    if (location.parentBody && location.parentBody.name) {
      params.set("from", "_loc_" + location.name);
    }
    params.delete("selectLoc");
    navigate({ search: params.toString() }, { replace: false });
  };

  return (
    <div className={`WindowSelectCurrentLocation ${isDisplaying ? "on" : ""}`}>
      <div className="bg" onClick={close}></div>
      <div className="window-container">
        <div className="current-location-info">
          <h4>
            {t(`Navbar.currentLocation`)}{" "}
            {t(`Location.${locationNameToI18nKey(currentLocationName)}`)}
          </h4>
          <button className="close" onClick={close}>
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
