import { useContext, useEffect, useState } from "react";
import CelestialBody3D from "../../components/CelestialBody3D/CelestialBody3D";
import "./EyesOnStarCitizen.css";
import { ContextAllData } from "../../contexts";
import { toUrlKey } from "../../utils";
import { Link, useParams } from "react-router";
import CelestialBodyInfo from "../CelestialBodyInfo/CelestialBodyInfo";
import LocationInfo from "../LocationInfo/LocationInfo";
import SearchLocationBar from "../SearchLocations/SearchLocationBar/SearchLocationBar";
import SearchLocationResultList from "../SearchLocations/SearchLocationResultList/SearchLocationResultList";
import CardCelestialBody from "./CardCelestialBody/CardCelestialBody";
import CardLocation from "./CardLocation/CardLocation";
import Icon from "@mdi/react";
import { mdiChevronUp, mdiMapMarker, mdiWidgetsOutline } from "@mdi/js";
import { icon } from "../../assets/icon";

const SEARCH_LOCATIONS_NAME_KEY = "fsd_searchLocations_searchName";

const EyesOnStarCitizen = ({ routing = "_" }: { routing: "_" | "b" | "l" }) => {
  const { dictCelestialBodies, dictLocations, currentLocation } =
    useContext(ContextAllData);
  const celestialBodyKey = useParams().celestialBodyKey || "";
  const locationKey = useParams().locationKey || "";
  const [seeCelestialBody, setSeeCelestialBody] = useState<CelestialBody | null>(null);
  const seeLocation = dictLocations[locationKey] || null;
  const [isSearchCardOpen, setIsSearchCardOpen] = useState(false);
  const [isInfoCardOpen, setIsInfoCardOpen] = useState(false);

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
        <CelestialBody3D celestialBody={seeCelestialBody} />
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
    </div>
  );
};

export default EyesOnStarCitizen;
