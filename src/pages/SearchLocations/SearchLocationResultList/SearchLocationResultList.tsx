import { useTranslation } from "react-i18next";
import "./SearchLocationResultList.css";
import { useContext } from "react";
import { ContextAllData } from "../../../contexts";
import CelestialBodyCard from "./CelestialBodyCard/CelestialBodyCard";
import LocationCard from "./LocationCard/LocationCard";

const SearchLocationResultList = ({ searchName }: { searchName: string }) => {
  const { t } = useTranslation();
  const { dictCelestialBodies, dictLocations } = useContext(ContextAllData);
  const celestialBody = Object.values(dictCelestialBodies).filter((cb) =>
    cb.name.toLowerCase().includes(searchName.trim().toLowerCase())
  );
  const locations = searchName
    ? Object.values(dictLocations).filter((loc) =>
        loc.name.toLowerCase().includes(searchName.trim().toLowerCase())
      )
    : [];
  return (
    <div className="SearchLocationResultList">
      <ul className="location-list">
        {celestialBody.map((body) => (
          <CelestialBodyCard key={body.name} celestialBody={body} />
        ))}
        {locations.map((location) => (
          <LocationCard key={location.name} location={location} />
        ))}
      </ul>
    </div>
  );
};

export default SearchLocationResultList;
