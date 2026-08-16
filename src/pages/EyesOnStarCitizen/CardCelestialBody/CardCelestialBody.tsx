import { useTranslation } from "react-i18next";
import "./CardCelestialBody.css";
import { isLocationDisplayHidden, locationNameToI18nKey } from "../../../utils";
import { formatTime } from "../../../components/CelestialBody3D/utils";
import CelestialBodyCard from "../../../components/CelestialBodyCard/CelestialBodyCard";
import LocationCard from "../../../components/LocationCard/LocationCard";

const CardCelestialBody = ({ celestialBody }: { celestialBody: CelestialBody }) => {
  const { t } = useTranslation();

  const typeInfo = celestialBody.parentBody
    ? t("LocationInfo.typeOfParent", {
        type: t(`LocationType.${celestialBody.type}`),
        parent: t(locationNameToI18nKey(celestialBody.parentBody.name), { ns: "locations" }),
      })
    : t(`LocationType.${celestialBody.type}`);

  const typeOrder = [
    "city",
    "station",
    "asteroidbase",
    "outpost",
    "shelter",
    "fob",
    "depot",
    "ugf",
    "underground",
    "mining",
    "farm",
    "research",
    "prison",
    "race",
    "junkyard",
    "ruins",
    "abandoned",
    "cave",
    "crash",
    "comm",
    "orbitallaser",
  ];

  // Subtype adds lore detail for planets/moons; L1-L5 / SINGLE_STAR are
  // redundant with the translated type.
  const subType =
    celestialBody.subType &&
    !/^L[1-5]$/.test(celestialBody.subType) &&
    celestialBody.subType !== "SINGLE_STAR"
      ? celestialBody.subType
      : null;

  const compounds = celestialBody.atmosphere_compounds
    ? Object.entries(celestialBody.atmosphere_compounds).sort(
        (a, b) => parseFloat(b[1]) - parseFloat(a[1])
      )
    : [];

  const orbitPeriodDays = celestialBody.orbitPeriod;
  const orbitPeriodText =
    orbitPeriodDays === undefined
      ? null
      : orbitPeriodDays >= 365
        ? t("LocationInfo.orbitPeriodYears", {
            count: Number((orbitPeriodDays / 365).toFixed(1)),
          })
        : t("LocationInfo.orbitPeriodDays", { count: Math.round(orbitPeriodDays) });

  const sortedLocations = celestialBody.locations
    .filter((location) => !isLocationDisplayHidden(location))
    .sort((a, b) => {
      const idxA = typeOrder.indexOf(a.type);
      const idxB = typeOrder.indexOf(b.type);
      const orderA = idxA === -1 ? typeOrder.length : idxA;
      const orderB = idxB === -1 ? typeOrder.length : idxB;
      return orderA - orderB;
    });

  return (
    <div className="CardCelestialBody">
      <div className="basic-info">
        <div className="name">
          <h1>{t(locationNameToI18nKey(celestialBody.name), { ns: "locations" })}</h1>
          <h2>
            {t(locationNameToI18nKey(celestialBody.name), { ns: "locations", lng: "en" })}
          </h2>
        </div>
        <h3 className="type">{typeInfo}</h3>
      </div>
      <div className="section-wrapper">
        <h4>{t("LocationInfo.titleBasicInfo")}</h4>
        <ul>
          {subType && (
            <li>
              <span>{t("LocationInfo.subType")}</span>
              <span>{t(`SubType.${subType}`, { defaultValue: subType })}</span>
            </li>
          )}
          {celestialBody.bodyRadiusInKm > 0 && (
            <li>
              <span>{t("LocationInfo.bodyRadius")}</span>
              <span>{celestialBody.bodyRadiusInKm.toLocaleString()} km</span>
            </li>
          )}
          {celestialBody.rotationPeriodInHours !== undefined && (
            <li>
              <span>{t("LocationInfo.rotationPeriod")}</span>
              <span>
                {celestialBody.rotationPeriodInHours > 0
                  ? formatTime(celestialBody.rotationPeriodInHours)
                  : t("LocationInfo.tidallyLocked")}
              </span>
            </li>
          )}
          {orbitPeriodText && (
            <li>
              <span>{t("LocationInfo.orbitPeriod")}</span>
              <span>{orbitPeriodText}</span>
            </li>
          )}
          {celestialBody.atmosphereHeightInKm && (
            <li>
              <span>{t("LocationInfo.atmosphereHeight")}</span>
              <span>{celestialBody.atmosphereHeightInKm} km</span>
            </li>
          )}
          {compounds.length > 0 && (
            <li className="compounds-item">
              <span>{t("LocationInfo.atmosphereCompounds")}</span>
              <span>
                {compounds.map(([compound, ratio]) => (
                  <span key={compound} className="compound-row">
                    {compound} {ratio}%
                  </span>
                ))}
              </span>
            </li>
          )}
          {celestialBody.habitable !== null && celestialBody.habitable !== undefined && (
            <li>
              <span>{t("LocationInfo.habitable")}</span>
              <span>
                {celestialBody.habitable ? t("LocationInfo.yes") : t("LocationInfo.no")}
              </span>
            </li>
          )}
          {celestialBody.affiliation && (
            <li>
              <span>{t("LocationInfo.affiliation")}</span>
              <span className="affiliation-value">
                {celestialBody.affiliation.color && (
                  <span
                    className="affiliation-dot"
                    style={{ backgroundColor: celestialBody.affiliation.color }}
                  />
                )}
                {celestialBody.affiliation.name}
              </span>
            </li>
          )}
        </ul>
      </div>
      {celestialBody.parentBody && (
        <div className="location-links">
          <h4>{t(`LocationInfo.titleParentBody`)}</h4>
          <ul>
            <li>
              <CelestialBodyCard celestialBody={celestialBody.parentBody} />
            </li>
          </ul>
        </div>
      )}
      {celestialBody.children.length > 0 && (
        <div className="location-links">
          <h4>{t(`LocationInfo.titleChildBodies`)}</h4>
          <ul>
            {celestialBody.children.map((child) => (
              <li key={child.code}>
                <CelestialBodyCard celestialBody={child} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {sortedLocations.length > 0 && (
        <div className="location-links">
          <h4>{t(`LocationInfo.titleLocations`)}</h4>
          <ul>
            {sortedLocations.map((location) => (
              <li key={location.code}>
                <LocationCard location={location} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CardCelestialBody;
