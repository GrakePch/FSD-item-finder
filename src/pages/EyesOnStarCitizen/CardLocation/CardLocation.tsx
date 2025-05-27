import { useTranslation } from "react-i18next";
import "./CardLocation.css";
import { locationNameToI18nKey } from "../../../utils";
import Icon from "@mdi/react";
import { icon } from "../../../assets/icon";
import CelestialBodyCard from "../../../components/CelestialBodyCard/CelestialBodyCard";
import TerminalCard from "../../../components/TerminalCard/TerminalCard";

const CardLocation = ({ location }: { location: SCLocation }) => {
  const { t } = useTranslation();

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

  return (
    <div className="CardLocation">
      <div className="basic-info">
        <div className="name">
          <h1>{t(`Location.${locationNameToI18nKey(location.name)}`)}</h1>
          <h2>{t(`Location.${locationNameToI18nKey(location.name)}`, { lng: "en" })}</h2>
        </div>
        <h3 className="type">
          {typeInfo}
          {location.quantum === 0 && (
            <span className="quantum-not-available">
              <Icon path={icon.quantum_off} size="1.5rem" />
              {t("LocationInfo.quantumNotAvailable")}
            </span>
          )}
          {location.private === 1 && (
            <span className="private-property">
              <Icon path={icon.private_property} size="1.5rem" />
              {t("LocationInfo.privateProperty")}
            </span>
          )}
        </h3>
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
      {location.terminals && location.terminals.length > 0 && (
        <div className="location-links">
          <h4>{t(`LocationInfo.titleTerminals`)}</h4>
          <ul>
            {location.terminals.map((terminal) => (
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

export default CardLocation;
