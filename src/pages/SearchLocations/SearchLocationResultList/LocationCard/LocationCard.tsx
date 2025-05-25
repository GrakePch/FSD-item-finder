import { Link } from "react-router";
import { locationNameToI18nKey, toUrlKey } from "../../../../utils";
import "./LocationCard.css";
import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import locationIcon from "../../../../assets/locationIcon";
import LocationIconColor from "../../../../assets/locationIconColor";
import { icon } from "../../../../assets/icon";

const LocationCard = ({ location }: { location: SCLocation }) => {
  const { t } = useTranslation();
  const description = location.parentBody
    ? t("LocationInfo.typeOfParent", {
        type: t(`LocationType.${location.type}`),
        parent: t(`Location.${locationNameToI18nKey(location.parentBody.name)}`),
      })
    : t(`LocationType.${location.type}`);
  return (
    <Link className="LocationCard" to={`/l/${toUrlKey(location.name)}`}>
      <div
        className="icon"
        style={{
          backgroundColor:
            location.private === 1
              ? "#f74a55"
              : LocationIconColor[location.type] || "#78909c",
        }}
      >
        <Icon path={locationIcon[location.type]} />
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
    </Link>
  );
};

export default LocationCard;
