import { useContext, useEffect, useState } from "react";
import CelestialBody3D from "../../components/CelestialBody3D/CelestialBody3D";
import "./EyesOnStarCitizen.css";
import { ContextAllData } from "../../contexts";
import { toUrlKey } from "../../utils";
import { Link, useParams, useSearchParams } from "react-router";
import CelestialBodyInfo from "../CelestialBodyInfo/CelestialBodyInfo";
import LocationInfo from "../LocationInfo/LocationInfo";
import SearchLocationBar from "../SearchLocations/SearchLocationBar/SearchLocationBar";
import SearchLocationResultList from "../SearchLocations/SearchLocationResultList/SearchLocationResultList";
import CardCelestialBody from "./CardCelestialBody/CardCelestialBody";
import CardLocation from "./CardLocation/CardLocation";
import Icon from "@mdi/react";
import {
  mdiChevronUp,
  mdiClose,
  mdiLayers,
  mdiMapMarker,
  mdiWidgetsOutline,
} from "@mdi/js";
import { icon } from "../../assets/icon";
import { useTranslation } from "react-i18next";

const SEARCH_LOCATIONS_NAME_KEY = "fsd_searchLocations_searchName";

const EyesOnStarCitizen = ({ routing = "_" }: { routing: "_" | "b" | "l" }) => {
  const { t } = useTranslation();
  const { dictCelestialBodies, dictLocations, currentLocation } =
    useContext(ContextAllData);
  const celestialBodyKey = useParams().celestialBodyKey || "";
  const locationKey = useParams().locationKey || "";
  const [seeCelestialBody, setSeeCelestialBody] = useState<CelestialBody | null>(null);
  const seeLocation = dictLocations[locationKey] || null;
  const [isSearchCardOpen, setIsSearchCardOpen] = useState(false);
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(true);
  const [isLayersSettingOpen, setIsLayersSettingOpen] = useState(false);

  /* Layers setting states */
  const [showLocationLabels, setShowLocationLabels] = useState(true);
  const [showOrbitLines, setShowOrbitLines] = useState(true);
  const [showLongitudeLatitudeLines, setShowLongitudeLatitudeLines] = useState(false);
  const [showOMs, setShowOMs] = useState(false);
  const [showSubsolarDirection, setShowSubsolarDirection] = useState(false);
  const [showNoQTMarkers, setShowNoQTMarkers] = useState(false);
  const [applyHDMaps, setApplyHDMaps] = useState(false);
  const [applyRealisticAtmosphere, setApplyRealisticAtmosphere] = useState(false);

  // DateTime Picker state stored in query params
  const [searchParams, setSearchParams] = useSearchParams();
  const searchDateTime = searchParams.get("datetime") || "";

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      searchParams.set("datetime", value);
    } else {
      searchParams.delete("datetime");
    }
    setSearchParams(searchParams, { replace: true });
  };

  useEffect(() => {
    let tempCB = null;
    if (routing === "_") {
      tempCB =
        (currentLocation.startsWith("_loc_")
          ? dictLocations[toUrlKey(currentLocation.slice(5))]?.parentBody
          : dictCelestialBodies[toUrlKey(currentLocation)]) || null;
      if (!tempCB) {
        tempCB = dictCelestialBodies["Crusader"];
      } else if (tempCB.type !== "Planet" && tempCB.type !== "Moon") {
        tempCB = dictCelestialBodies["Crusader"];
      }
    } else if (routing === "b") {
      tempCB = dictCelestialBodies[celestialBodyKey] || null;
      if (tempCB && tempCB.type !== "Planet" && tempCB.type !== "Moon") {
        tempCB = null;
      }
    } else if (routing === "l") {
      tempCB = dictLocations[locationKey]?.parentBody || null;
      if (tempCB && tempCB.type !== "Planet" && tempCB.type !== "Moon") {
        tempCB = null;
      }
    }
    setSeeCelestialBody(tempCB);
  }, [
    routing,
    celestialBodyKey,
    locationKey,
    dictCelestialBodies,
    dictLocations,
    currentLocation,
  ]);

  const [searchName, setSearchName] = useState(
    () => sessionStorage.getItem(SEARCH_LOCATIONS_NAME_KEY) || ""
  );

  useEffect(() => {
    sessionStorage.setItem(SEARCH_LOCATIONS_NAME_KEY, searchName);
  }, [searchName]);

  if (!seeCelestialBody) {
    if (routing === "_") return null;
    if (routing === "b") return <CelestialBodyInfo />;
    if (routing === "l") return <LocationInfo />;
  }
  return (
    <div className="EyesOnStarCitizen">
      <div
        onClick={() => setIsSearchCardOpen(false)}
        style={{ width: "100%", height: "100%" }}
      >
        <CelestialBody3D
          celestialBody={seeCelestialBody}
          location={seeLocation}
          layersSetting={{
            showLocationLabels,
            showLongitudeLatitudeLines,
            showOrbitLines,
            showOMs,
            showSubsolarDirection,
            showNoQTMarkers,
            applyHDMaps,
            applyRealisticAtmosphere,
          }}
        />
      </div>

      <nav className="special-nav-bar">
        <Link to="/">
          <Icon path={mdiWidgetsOutline} size="2rem" />
        </Link>
        <Link to="/v">
          <Icon path={icon.Vehicle} size="2rem" />
        </Link>
        <Link to="/l" className={"active"}>
          <Icon path={mdiMapMarker} size="2rem" />
        </Link>
      </nav>

      <div className="date-time-picker-wrapper">
        <input
          type="datetime-local"
          value={searchDateTime}
          onChange={handleDateTimeChange}
          style={{ width: "100%", maxWidth: 240 }}
        />
        <button
          className="set-to-real-time"
          onClick={() => {
            searchParams.delete("datetime");
            setSearchParams(searchParams, { replace: true });
          }}
        >
          {t("EOSC.setToRealTime")}
        </button>
      </div>

      <div className="fixed-search-bar">
        <SearchLocationBar
          searchName={searchName}
          setSearchName={setSearchName}
          setIsSearchCardOpen={setIsSearchCardOpen}
        />
      </div>
      <div className={`search-card ${isSearchCardOpen ? "open" : ""}`}>
        <SearchLocationResultList searchName={searchName} includeTerminal />
      </div>
      <div className={`info-card ${isInfoCardOpen ? "open" : ""}`}>
        <button
          className="info-card-toggle"
          onClick={() => setIsInfoCardOpen((prev) => !prev)}
        >
          <Icon path={mdiChevronUp} size={"1.5rem"} rotate={isInfoCardOpen ? 180 : 0} />
        </button>
        {routing === "l" ? (
          <CardLocation location={seeLocation} />
        ) : (
          <CardCelestialBody celestialBody={seeCelestialBody} />
        )}
      </div>

      <div className="layers-setting">
        <button
          className="layers-setting-toggle"
          onClick={() => setIsLayersSettingOpen((prev) => !prev)}
        >
          <Icon path={mdiLayers} size="1.5rem" />
        </button>
        <div className={`layers-setting-panel ${isLayersSettingOpen ? "open" : ""}`}>
          <button
            className="layers-setting-close"
            onClick={() => setIsLayersSettingOpen(false)}
          >
            <Icon path={mdiClose} size="1rem" />
          </button>
          <label>
            <input
              type="checkbox"
              checked={showLocationLabels}
              onChange={(e) => setShowLocationLabels(e.target.checked)}
            />
            {t("EOSC.showLocationLabels")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={showOrbitLines}
              onChange={(e) => setShowOrbitLines(e.target.checked)}
            />
            {t("EOSC.showOrbitLines")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={showLongitudeLatitudeLines}
              onChange={(e) => setShowLongitudeLatitudeLines(e.target.checked)}
            />
            {t("EOSC.showLongitudeLatitudeLines")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={showOMs}
              onChange={(e) => setShowOMs(e.target.checked)}
            />
            {t("EOSC.showOMs")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={showSubsolarDirection}
              onChange={(e) => setShowSubsolarDirection(e.target.checked)}
            />
            {t("EOSC.showSubsolarDirection")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={showNoQTMarkers}
              onChange={(e) => setShowNoQTMarkers(e.target.checked)}
            />
            {t("EOSC.showNoQTMarkers")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={applyHDMaps}
              onChange={(e) => setApplyHDMaps(e.target.checked)}
            />
            {t("EOSC.applyHDMaps")}
          </label>
          <label>
            <input
              type="checkbox"
              checked={applyRealisticAtmosphere}
              onChange={(e) => setApplyRealisticAtmosphere(e.target.checked)}
            />
            {t("EOSC.applyRealisticAtmosphere")}
          </label>
        </div>
      </div>
    </div>
  );
};

export default EyesOnStarCitizen;
