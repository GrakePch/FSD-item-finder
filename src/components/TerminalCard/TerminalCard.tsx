import { Link, useNavigate } from "react-router";
import "./TerminalCard.css";
import { useTranslation } from "react-i18next";
import { locationNameToI18nKey } from "../../utils";
import Icon from "@mdi/react";
import locationIcon from "../../assets/locationIcon";

interface TerminalCardProps {
  terminal: Terminal;
  onClick?: (terminal: Terminal) => void;
}

const TerminalCard = ({ terminal, onClick }: TerminalCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const description = terminal.parentLocation
    ? t("LocationInfo.typeOfParent", {
        type: t(`UEXTerminalType.${terminal.type}`),
        parent: t(`Location.${locationNameToI18nKey(terminal.parentLocation.name)}`),
      })
    : t(`UEXTerminalType.${terminal.type}`);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(terminal);
    } else {
      navigate(`/t/${terminal.id}`);
    }
  };

  return (
    <a className="TerminalCard" href={`/t/${terminal.id}`} onClick={handleClick}>
      <div className="icon">
        <Icon path={locationIcon[`Terminal_${terminal.type}`]} />
      </div>
      <div className="info">
        <p className="name">
          {terminal.location_path
            .slice(3)
            .map((n) => t(`Location.${locationNameToI18nKey(n)}`, { defaultValue: n }))
            .join(" - ")}
        </p>
        <p className="descrip">{description}</p>
      </div>
    </a>
  );
};

export default TerminalCard;
