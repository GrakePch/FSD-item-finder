import "./LocationInfo.css";
import { useContext } from "react";
import { useParams } from "react-router";
import { ContextAllData } from "../../contexts";
import { useTranslation } from "react-i18next";
import { locationNameToI18nKey } from "../../utils";
import CelestialBodyCard from "../SearchLocations/SearchLocationResultList/CelestialBodyCard/CelestialBodyCard";
import TerminalCard from "../SearchLocations/SearchLocationResultList/TerminalCard/TerminalCard";

const LocationInfo = () => {
  const { t } = useTranslation();
  const locationKey = useParams().locationKey;
  const { dictLocations } = useContext(ContextAllData);
  const location = dictLocations[locationKey || ""] || null;

  if (!location) {
    return (
      <div className="LocationInfo">
        <div className="basic-info">
          <div className="name">
            <h1>{t("LocationInfo.notFoundLocation")}</h1>
            <h2>{t("LocationInfo.notFoundLocation", { lng: "en" })}</h2>
          </div>
        </div>
      </div>
    );
  }

  const typeInfo = location.parentBody
    ? t("LocationInfo.typeOfParent", {
        type: t(`LocationType.${location.type}`),
        parent: t(`Location.${locationNameToI18nKey(location.parentBody.name)}`),
      })
    : t(`LocationType.${location.type}`);

  const filteredTerminals = location.terminals?.filter((t) => t.type === "item") || [];

  return (
    <div className="LocationInfo">
      <div className="basic-info">
        <div className="name">
          <h1>{t(`Location.${locationNameToI18nKey(location.name)}`)}</h1>
          <h2>{t(`Location.${locationNameToI18nKey(location.name)}`, { lng: "en" })}</h2>
        </div>
        <h3 className="type">{typeInfo}</h3>
      </div>
      {location.parentBody && (
        <div className="location-links">
          <h4>{t(`LocationInfo.titleParentBody`)}</h4>
          <ul>
            <li>
              <CelestialBodyCard celestialBody={location.parentBody} />
            </li>
          </ul>
        </div>
      )}
      {filteredTerminals.length > 0 && (
        <div className="location-links">
          <h4>{t(`LocationInfo.titleTerminals`)}</h4>
          <ul>
            {filteredTerminals.map((terminal) => (
              <li key={terminal.id}>
                <TerminalCard terminal={terminal} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationInfo;
