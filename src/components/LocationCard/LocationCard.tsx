import { useNavigate } from "react-router";
import { locationNameToI18nKey } from "../../utils";
import styles from "./LocationCard.module.css";
import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import { getLocationIcon } from "../../assets/locationIcon";
import { getLocationIconColor } from "../../assets/locationIconColor";
import { icon } from "../../assets/icon";

interface LocationCardProps {
  location: SCLocation;
  onClick?: (location: SCLocation) => void;
}

const LocationCard = ({ location, onClick }: LocationCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const description = location.parentBody
    ? t("LocationInfo.typeOfParent", {
        type: t(`LocationType.${location.type}`),
        parent: t(locationNameToI18nKey(location.parentBody.name), { ns: "locations" }),
      })
    : t(`LocationType.${location.type}`);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(location);
    } else {
      // Keep query params when navigating
      const search = window.location.search;
      navigate(`/l/${location.code}${search}`);
    }
  };

  return (
    <a
      className={styles.LocationCard}
      href={`/l/${location.code}${
        typeof window !== "undefined" ? window.location.search : ""
      }`}
      onClick={handleClick}
    >
      <div
        className={styles.icon}
        style={{
          backgroundColor:
            location.restrictions.includes("private")
              ? "#f74a55"
              : getLocationIconColor(location),
        }}
      >
        <Icon path={getLocationIcon(location)} />
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{t(locationNameToI18nKey(location.name), { ns: "locations" })}</p>
        <p className={styles.descrip}>
          {description}
          {!location.beaconMarker && (
            <span className={styles.quantumNotAvailable}>
              <Icon path={icon.quantum_off} size="1rem" />
            </span>
          )}
          {location.restrictions.includes("private") && (
            <span className={styles.privateProperty}>
              <Icon path={icon.private_property} size="1rem" />
            </span>
          )}
        </p>
      </div>
    </a>
  );
};

export default LocationCard;
