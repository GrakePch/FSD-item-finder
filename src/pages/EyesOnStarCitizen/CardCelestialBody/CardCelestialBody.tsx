import { useTranslation } from "react-i18next";
import "./CardCelestialBody.css";
import { locationNameToI18nKey } from "../../../utils";
import CelestialBodyCard from "../../../components/CelestialBodyCard/CelestialBodyCard";
import LocationCard from "../../../components/LocationCard/LocationCard";

const CardCelestialBody = ({ celestialBody }: { celestialBody: CelestialBody }) => {
  const { t } = useTranslation();

  const typeInfo = celestialBody.parentBody
    ? t("LocationInfo.typeOfParent", {
        type: t(`LocationType.${celestialBody.type}`),
        parent: t(`Location.${locationNameToI18nKey(celestialBody.parentBody.name)}`),
      })
    : t(`LocationType.${celestialBody.type}`);

  const typeOrder = [
    "Landing zone",
    "Asteroid base",
    "Space station",
    "Space Station",
    "Landmark",
    "Shipwreck",
    "Racetrack",
    "Prison",
    "Scrapyard",
    "Emergency shelter",
    "City",
    "Settlement",
    "Distribution center",
    "Forward operating base",
    "Outpost",
    "Underground bunker",
    "Ruins",
    "Cave",
    "CommArray",
    "Asteroid cluster",
  ];
  const sortedLocations = [...celestialBody.locations].sort((a, b) => {
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
          <h1>{t(`Location.${locationNameToI18nKey(celestialBody.name)}`)}</h1>
          <h2>
            {t(`Location.${locationNameToI18nKey(celestialBody.name)}`, { lng: "en" })}
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
              <li key={child.name}>
                <CelestialBodyCard celestialBody={child} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {celestialBody.locations.length > 0 && (
        <div className="location-links">
          <h4>{t(`LocationInfo.titleLocations`)}</h4>
          <ul>
            {sortedLocations.map((location) => (
              <li key={location.name}>
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
