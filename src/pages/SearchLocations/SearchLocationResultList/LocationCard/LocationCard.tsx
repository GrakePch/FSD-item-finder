import { Link } from "react-router";
import { locationNameToI18nKey, toUrlKey } from "../../../../utils";
import "./LocationCard.css";
import { useTranslation } from "react-i18next";
import Icon from "@mdi/react";
import locationIcon from "../../../../assets/locationIcon";
import LocationIconColor from "../../../../assets/locationIconColor";

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
        <p className="descrip">{description}</p>
      </div>
    </Link>
  );
};

export default LocationCard;
