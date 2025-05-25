import { useTranslation } from "react-i18next";
import "./SearchLocationResultList.css";
import { useContext } from "react";
import { ContextAllData } from "../../../contexts";
import CelestialBodyCard from "./CelestialBodyCard/CelestialBodyCard";
import LocationCard from "./LocationCard/LocationCard";
import { locationNameToI18nKey } from "../../../utils";
import TerminalCard from "./TerminalCard/TerminalCard";

const isNameOrI18nMatch = (searchName: string, nameEn: string, nameI18n: string) => {
  const trimmedSearch = searchName.trim().toLowerCase();
  const nameMatch = nameEn.toLowerCase().includes(trimmedSearch);
  const i18nMatch = nameI18n.toLowerCase().includes(trimmedSearch);
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

  const celestialBody = Object.values(dictCelestialBodies).filter((cb) =>
    isNameOrI18nMatch(
      searchName,
      cb.name,
      t(`Location.${locationNameToI18nKey(cb.name)}`, { defaultValue: cb.name })
    )
  );

  const locations = searchName
    ? Object.values(dictLocations).filter((loc) =>
        isNameOrI18nMatch(
          searchName,
          loc.name,
          t(`Location.${locationNameToI18nKey(loc.name)}`, { defaultValue: loc.name })
        )
      )
    : [];

  const terminals = includeTerminal && searchName
    ? Object.values(dictTerminals).filter((term) => {
        const terminalNameEn = Array.isArray(term.location_path)
          ? term.location_path
              .slice(3)
              .map((n) =>
                t(`Location.${locationNameToI18nKey(n)}`, { defaultValue: n, lng: "en" })
              )
              .join(" - ")
          : "";
        const terminalNameI18n = Array.isArray(term.location_path)
          ? term.location_path
              .slice(3)
              .map((n) => t(`Location.${locationNameToI18nKey(n)}`, { defaultValue: n }))
              .join(" - ")
          : "";
        return isNameOrI18nMatch(searchName, terminalNameEn, terminalNameI18n);
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
