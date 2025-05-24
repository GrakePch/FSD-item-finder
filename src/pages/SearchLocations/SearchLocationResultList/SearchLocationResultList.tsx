import { useTranslation } from "react-i18next";
import "./SearchLocationResultList.css";
import { useContext } from "react";
import { ContextAllData } from "../../../contexts";
import CelestialBodyCard from "./CelestialBodyCard/CelestialBodyCard";
import LocationCard from "./LocationCard/LocationCard";
import { locationNameToI18nKey } from "../../../utils";
import TerminalCard from "./TerminalCard/TerminalCard";
import type { TFunction } from "i18next";

// Encapsulate search match logic for reuse
const isNameOrI18nMatch = (
  name: string,
  searchName: string,
  t: TFunction,
  i18nKeyFn: (name: string) => string
) => {
  const trimmedSearch = searchName.trim().toLowerCase();
  const nameMatch = name.toLowerCase().includes(trimmedSearch);
  // Try both t(key, defaultValue) and t(key, { defaultValue })
  let i18nName = t(`Location.${i18nKeyFn(name)}`, { defaultValue: name });
  if (typeof i18nName !== "string") i18nName = String(i18nName);
  const i18nMatch = i18nName.toLowerCase().includes(trimmedSearch);
  return nameMatch || i18nMatch;
};

const SearchLocationResultList = ({ searchName }: { searchName: string }) => {
  const { t } = useTranslation();
  const { dictCelestialBodies, dictLocations, dictTerminals } =
    useContext(ContextAllData);

  const celestialBody = Object.values(dictCelestialBodies).filter((cb) =>
    isNameOrI18nMatch(cb.name, searchName, t, locationNameToI18nKey)
  );

  const locations = searchName
    ? Object.values(dictLocations).filter((loc) =>
        isNameOrI18nMatch(loc.name, searchName, t, locationNameToI18nKey)
      )
    : [];

  const terminals = searchName
    ? Object.values(dictTerminals).filter((term) => {
        const terminalName = Array.isArray(term.location_path)
          ? term.location_path.slice(3)
              .map((n) => t(`Location.${locationNameToI18nKey(n)}`, { defaultValue: n }))
              .join(" - ")
          : "";
        return isNameOrI18nMatch(terminalName, searchName, t, locationNameToI18nKey);
      })
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
        {terminals.map((terminal) => (
          <TerminalCard key={terminal.id} terminal={terminal} />
        ))}
      </ul>
    </div>
  );
};

export default SearchLocationResultList;
