import { useNavigate } from "react-router";
import styles from "./CelestialBodyCard.module.css";
import { isSurfaceBodyType, locationNameToI18nKey } from "../../utils";
import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import locationIcon from "../../assets/locationIcon";

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
        parent: t(locationNameToI18nKey(celestialBody.parentBody.name), { ns: "locations" }),
      })
    : t(`LocationType.${celestialBody.type}`);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(celestialBody);
    } else {
      // Keep query params when navigating
      const search = typeof window !== "undefined" ? window.location.search : "";
      navigate(`/b/${celestialBody.code}${search}`);
    }
  };

  const renderData = celestialBody.renderData;
  const themeColor =
    renderData?.themeColorR && renderData.themeColorG && renderData.themeColorB
      ? `rgb(${renderData.themeColorR}, ${renderData.themeColorG}, ${renderData.themeColorB})`
      : undefined;
  const isSurfaceBody = isSurfaceBodyType(celestialBody.type);

  return (
    <a
      className={styles.CelestialBodyCard}
      href={`/b/${celestialBody.code}${
        typeof window !== "undefined" ? window.location.search : ""
      }`}
      onClick={handleClick}
    >
      <div
        className={styles.iconOrThumbnail}
        style={{
          backgroundImage: `url(/body_thumbnails/${celestialBody.name}.png)`,
          backgroundColor: isSurfaceBody ? themeColor : undefined,
        }}
      >
        {!isSurfaceBody && <Icon path={locationIcon[celestialBody.type] || ""} />}
      </div>
      <div className={styles.info}>
        <p className={styles.name}>
          {t(locationNameToI18nKey(celestialBody.name), { ns: "locations" })}
        </p>
        <p className={styles.descrip}>{description}</p>
      </div>
    </a>
  );
};

export default CelestialBodyCard;
