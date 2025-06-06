import { Link, useNavigate } from "react-router";
import { locationNameToI18nKey, toUrlKey } from "../../utils";
import "./LocationCard.css";
import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import locationIcon from "../../assets/locationIcon";
import LocationIconColor from "../../assets/locationIconColor";
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
        parent: t(`Location.${locationNameToI18nKey(location.parentBody.name)}`),
      })
    : t(`LocationType.${location.type}`);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(location);
    } else {
      // Keep query params when navigating
      const search = window.location.search;
      navigate(`/l/${toUrlKey(location.name)}${search}`);
    }
  };

  return (
    <a
      className="LocationCard"
      href={`/l/${toUrlKey(location.name)}${
        typeof window !== "undefined" ? window.location.search : ""
      }`}
      onClick={handleClick}
    >
      <div
        className="icon"
        style={{
          backgroundColor:
            location.private === 1
              ? "#f74a55"
              : LocationIconColor[location.type] || "#78909c",
        }}
      >
        <Icon path={locationIcon[location.type] || locationIcon.Outpost} />
      </div>
      <div className="info">
        <p className="name">{t(`Location.${locationNameToI18nKey(location.name)}`)}</p>
        <p className="descrip">
          {description}
          {location.quantum === 0 && (
            <span className="quantum-not-available">
              <Icon path={icon.quantum_off} size="1rem" />
            </span>
          )}
          {location.private === 1 && (
            <span className="private-property">
              <Icon path={icon.private_property} size="1rem" />
            </span>
          )}
        </p>
      </div>
    </a>
  );
};

export default LocationCard;
