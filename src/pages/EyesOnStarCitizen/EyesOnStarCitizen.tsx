import { useContext, useEffect, useState } from "react";
import CelestialBody3D from "../../components/CelestialBody3D/CelestialBody3D";
import "./EyesOnStarCitizen.css";
import { ContextAllData } from "../../contexts";
import { toUrlKey } from "../../utils";
import { useParams } from "react-router";
import CelestialBodyInfo from "../CelestialBodyInfo/CelestialBodyInfo";
import LocationInfo from "../LocationInfo/LocationInfo";
import SearchLocationBar from "../SearchLocations/SearchLocationBar/SearchLocationBar";
import SearchLocationResultList from "../SearchLocations/SearchLocationResultList/SearchLocationResultList";
import CardCelestialBody from "./CardCelestialBody/CardCelestialBody";
import CardLocation from "./CardLocation/CardLocation";

const SEARCH_LOCATIONS_NAME_KEY = "fsd_searchLocations_searchName";

const EyesOnStarCitizen = ({ routing = "_" }: { routing: "_" | "b" | "l" }) => {
  const { dictCelestialBodies, dictLocations, currentLocation } =
    useContext(ContextAllData);
  const celestialBodyKey = useParams().celestialBodyKey || "";
  const locationKey = useParams().locationKey || "";
  const [seeCelestialBody, setSeeCelestialBody] = useState<CelestialBody | null>(null);
  const seeLocation = dictLocations[locationKey] || null;

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
      <CelestialBody3D celestialBody={seeCelestialBody} />

      <div className="fixed-search-bar">
        <SearchLocationBar searchName={searchName} setSearchName={setSearchName} />
      </div>
      <div className="search-card">
        <SearchLocationResultList searchName={searchName} includeTerminal />
      </div>
      <div className="info-card">
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
