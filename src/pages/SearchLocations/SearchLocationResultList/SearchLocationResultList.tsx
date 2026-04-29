import { useTranslation } from "react-i18next";
import "./SearchLocationResultList.css";
import { useContext } from "react";
import { ContextAllData } from "../../../contexts";
import CelestialBodyCard from "../../../components/CelestialBodyCard/CelestialBodyCard";
import LocationCard from "../../../components/LocationCard/LocationCard";
import { locationNameToI18nKey } from "../../../utils";
import TerminalCard from "../../../components/TerminalCard/TerminalCard";

const isNameOrI18nMatch = (normalizedSearchName: string, nameEn: string, nameI18n: string) => {
  const nameMatch = nameEn.toLowerCase().includes(normalizedSearchName);
  const i18nMatch = nameI18n.toLowerCase().includes(normalizedSearchName);
  return nameMatch || i18nMatch;
};

interface SearchLocationResultListProps {
  searchName: string;
  includeTerminal?: boolean;
  onCelestialBodyClick?: (body: CelestialBody) => void;
  onLocationClick?: (location: SCLocation) => void;
  onTerminalClick?: (terminal: Terminal) => void;
}

const SearchLocationResultList = ({
  searchName,
  includeTerminal = false,
  onCelestialBodyClick,
  onLocationClick,
  onTerminalClick,
}: SearchLocationResultListProps) => {
  const { t } = useTranslation();
  const { dictCelestialBodies, dictLocations, dictTerminals } =
    useContext(ContextAllData);
  const normalizedSearchName = searchName.trim().toLowerCase();

  const celestialBody = Object.values(dictCelestialBodies).filter((cb) =>
    isNameOrI18nMatch(
      normalizedSearchName,
      cb.name,
      t(locationNameToI18nKey(cb.name), { ns: "locations", defaultValue: cb.name })
    )
  );

  const locations = normalizedSearchName
    ? Object.values(dictLocations).filter((loc) =>
        isNameOrI18nMatch(
          normalizedSearchName,
          loc.name,
          t(locationNameToI18nKey(loc.name), { ns: "locations", defaultValue: loc.name })
        )
      )
    : [];

  const terminals = includeTerminal && normalizedSearchName
    ? Object.values(dictTerminals).filter((term) => {
        const terminalNameEn = Array.isArray(term.location_path)
          ? term.location_path
              .slice(3)
              .map((n) =>
                t(locationNameToI18nKey(n), { ns: "locations", defaultValue: n, lng: "en" })
              )
              .join(" - ")
          : "";
        const terminalNameI18n = Array.isArray(term.location_path)
          ? term.location_path
              .slice(3)
              .map((n) => t(locationNameToI18nKey(n), { ns: "locations", defaultValue: n }))
              .join(" - ")
          : "";
        return isNameOrI18nMatch(
          normalizedSearchName,
          terminalNameEn,
          terminalNameI18n
        );
      })
    : [];

  return (
    <div className="SearchLocationResultList">
      <ul className="location-list">
        {celestialBody.map((body) => (
          <CelestialBodyCard key={body.name} celestialBody={body} onClick={onCelestialBodyClick} />
        ))}
        {locations.map((location) => (
          <LocationCard key={location.name} location={location} onClick={onLocationClick} />
        ))}
        {terminals.map((terminal) => (
          <TerminalCard key={terminal.id} terminal={terminal} onClick={onTerminalClick} />
        ))}
      </ul>
    </div>
  );
};

export default SearchLocationResultList;
