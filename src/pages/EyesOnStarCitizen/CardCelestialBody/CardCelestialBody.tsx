import { useTranslation } from "react-i18next";
import "./CardCelestialBody.css";
import { isLocationDisplayHidden, locationNameToI18nKey } from "../../../utils";
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
