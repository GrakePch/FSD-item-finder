import { Link } from "react-router";
import "./CelestialBodyCard.css";
import { locationNameToI18nKey, toUrlKey } from "../../../../utils";
import { useTranslation } from "react-i18next";

const CelestialBodyCard = ({ celestialBody }: { celestialBody: CelestialBody }) => {
  const { t } = useTranslation();
  const description = celestialBody.parentBody
    ? t("LocationInfo.typeOfParent", {
        type: t(`LocationType.${celestialBody.type}`),
        parent: t(`Location.${locationNameToI18nKey(celestialBody.parentBody.name)}`),
      })
    : t(`LocationType.${celestialBody.type}`);
  return (
    <Link className="CelestialBodyCard" to={`/b/${toUrlKey(celestialBody.name)}`}>
      <div className="iconOrThumbnail"></div>
      <div className="info">
        <p className="name">
          {t(`Location.${locationNameToI18nKey(celestialBody.name)}`)}
        </p>
        <p className="descrip">{description}</p>
      </div>
    </Link>
  );
};

export default CelestialBodyCard;
