import { useNavigate } from "react-router";
import styles from "./TerminalCard.module.css";
import { useTranslation } from "react-i18next";
import { getTerminalDisplayPath, locationNameToI18nKey } from "../../utils";
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
        parent: t(locationNameToI18nKey(terminal.parentLocation.name), { ns: "locations" }),
      })
    : t(`UEXTerminalType.${terminal.type}`);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(terminal);
    } else {
      // Keep query params when navigating
      const search = typeof window !== "undefined" ? window.location.search : "";
      navigate(`/t/${terminal.id}${search}`);
    }
  };

  return (
    <a
      className={styles.TerminalCard}
      href={`/t/${terminal.id}${
        typeof window !== "undefined" ? window.location.search : ""
      }`}
      onClick={handleClick}
    >
      <div className={styles.icon}>
        <Icon path={locationIcon[`Terminal_${terminal.type}`] || locationIcon.Outpost!} />
      </div>
      <div className={styles.info}>
        <p className={styles.name}>
          {getTerminalDisplayPath(terminal)
            .map((entry) => t(entry.i18nKey, { ns: "locations", defaultValue: entry.name }))
            .join(" - ")}
        </p>
        <p className={styles.descrip}>{description}</p>
      </div>
    </a>
  );
};

export default TerminalCard;
