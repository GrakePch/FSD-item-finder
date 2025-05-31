import { useTranslation } from "react-i18next";
import "./CardLocation.css";
import { locationNameToI18nKey } from "../../../utils";
import Icon from "@mdi/react";
import { icon } from "../../../assets/icon";
import CelestialBodyCard from "../../../components/CelestialBodyCard/CelestialBodyCard";
import TerminalCard from "../../../components/TerminalCard/TerminalCard";
import { omCoordinates } from "../../../components/CelestialBody3D/OrbitalMarkers";
import {
  cartesianToSpherical,
  formatLatitude,
  formatLongitude,
  scToThree,
  sphericalToLatLong,
} from "../../../components/CelestialBody3D/utils";

function getDistancesToOM(location: SCLocation): [number, number][] {
  if (!location.parentBody || !location.parentBody.omRadius) return [];
  const omRadius = location.parentBody.omRadius;
  const locPos = scToThree([
    location.coordinateX,
    location.coordinateY,
    location.coordinateZ,
  ]);
  const distances = omCoordinates.map((omVec, i) => {
    const omPos = [omVec[0] * omRadius, omVec[1] * omRadius, omVec[2] * omRadius];
    const dist = Math.sqrt(
      Math.pow(locPos[0] - omPos[0], 2) +
        Math.pow(locPos[1] - omPos[1], 2) +
        Math.pow(locPos[2] - omPos[2], 2)
    );
    return [i + 1, dist] as [number, number];
  });
  distances.sort((a, b) => a[1] - b[1]);
  return distances;
}

const CardLocation = ({ location }: { location: SCLocation }) => {
  const { t } = useTranslation();
  const position = scToThree([
    location.coordinateX,
    location.coordinateY,
    location.coordinateZ,
  ]);
  const { r, theta, phi } = cartesianToSpherical(...position);
  const { lat, long } = sphericalToLatLong(theta, phi);

  // Compute distances to each OM (orbital marker)
  const canNavigatedByOMs = location.parentBody && location.parentBody.omRadius;
  const distancesToOMs = canNavigatedByOMs ? getDistancesToOM(location) : [];

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
      <div className="section-wrapper">
        <h4>{t("LocationInfo.titleBasicInfo")}</h4>
        <ul>
          <li>
            <span>{t("LocationInfo.latitude")}</span>
            <span>{formatLatitude(lat)}</span>
          </li>
          <li>
            <span>{t("LocationInfo.longitude")}</span>
            <span>{formatLongitude(long)}</span>
          </li>
          <li>
            <span>{t("LocationInfo.altitude")}</span>
            <span>{(r - (location.parentBody?.bodyRadius ?? 0)).toFixed(2)} km</span>
          </li>
        </ul>
      </div>
      {distancesToOMs && (
        <div className="section-wrapper">
          <h4>{t("LocationInfo.titleNavigation")}</h4>
          {/* Show sorted OM distances */}
          <ul>
            {distancesToOMs.map(([omIndex, dist]) => (
              <li key={omIndex}>
                <span>OM-{omIndex}</span>
                <span>{dist.toFixed(1)} km</span>
              </li>
            ))}
          </ul>
        </div>
      )}
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
