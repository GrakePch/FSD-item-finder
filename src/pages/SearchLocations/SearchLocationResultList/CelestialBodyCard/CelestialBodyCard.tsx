import { Link, useNavigate } from "react-router";
import "./CelestialBodyCard.css";
import { locationNameToI18nKey, toUrlKey } from "../../../../utils";
import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import locationIcon from "../../../../assets/locationIcon";

interface CelestialBodyCardProps {
  celestialBody: CelestialBody;
  onClick?: (celestialBody: CelestialBody) => void;
}

const CelestialBodyCard = ({ celestialBody, onClick }: CelestialBodyCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const description = celestialBody.parentBody
    ? t("LocationInfo.typeOfParent", {
        type: t(`LocationType.${celestialBody.type}`),
        parent: t(`Location.${locationNameToI18nKey(celestialBody.parentBody.name)}`),
      })
    : t(`LocationType.${celestialBody.type}`);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(celestialBody);
    } else {
      navigate(`/b/${toUrlKey(celestialBody.name)}`);
    }
  };

  return (
    <a
      className="CelestialBodyCard"
      href={`/b/${toUrlKey(celestialBody.name)}`}
      onClick={handleClick}
    >
      <div
        className="iconOrThumbnail"
        style={{
          backgroundImage: `url(/body_thumbnails/${celestialBody.name}.png)`,
          backgroundColor:
            celestialBody.type === "Planet" || celestialBody.type === "Moon"
              ? "var(--color-text-2)"
              : null,
        }}
      >
        <Icon path={locationIcon[celestialBody.type] || ""} />
      </div>
      <div className="info">
        <p className="name">
          {t(`Location.${locationNameToI18nKey(celestialBody.name)}`)}
        </p>
        <p className="descrip">{description}</p>
      </div>
    </a>
  );
};

export default CelestialBodyCard;
