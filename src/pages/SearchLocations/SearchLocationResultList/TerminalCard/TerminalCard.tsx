import { Link } from "react-router";
import "./TerminalCard.css";
import { useTranslation } from "react-i18next";
import { locationNameToI18nKey } from "../../../../utils";

const TerminalCard = ({ terminal }: { terminal: Terminal }) => {
  const { t } = useTranslation();
  const description = terminal.parentLocation
    ? t("LocationInfo.typeOfParent", {
        type: t(`UEXTerminalType.${terminal.type}`),
        parent: t(`Location.${locationNameToI18nKey(terminal.parentLocation.name)}`),
      })
    : t(`UEXTerminalType.${terminal.type}`);
  return (
    <Link className="TerminalCard" to={`/t/${terminal.id}`}>
      <div className="icon"></div>
      <div className="info">
        <p className="name">
          {terminal.location_path
            .slice(3)
            .map((n) => t(`Location.${locationNameToI18nKey(n)}`, { defaultValue: n }))
            .join(" - ")}
        </p>
        <p className="descrip">{description}</p>
      </div>
    </Link>
  );
};

export default TerminalCard;
