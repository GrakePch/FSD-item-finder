import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";
import { formatItemGrade, translateItemName } from "./formatters";
import type { EssentialVehicleItem } from "./types";
import styles from "./VehicleSupplementalInfo.module.css";

type InstalledHeaderProps = {
  icon: string;
  item: EssentialVehicleItem;
};

const InstalledHeader = ({ icon, item }: InstalledHeaderProps) => {
  const { t } = useTranslation();
  const className = item.stdItem.ClassName;
  const name = translateItemName(t, className, item.stdItem.Name);
  const size = item.stdItem.Size;
  const gradePrimary = item.stdItem.Class || "?";
  const grade = formatItemGrade(t, item.stdItem.Class, item.stdItem.Grade);

  return (
    <div className={styles.sectionInstalledInfo}>
      <Icon path={icon} size="1.5rem" />
      <div className={styles.name}>{name}</div>
      <div
        className={styles.grade}
        style={{
          color: gradePrimary
            ? `var(--color-${gradePrimary.toLocaleLowerCase()})`
            : "inherit",
        }}
      >
        {grade}
      </div>
      {size !== undefined && <div className={styles.icon}>S{size}</div>}
    </div>
  );
};

export default InstalledHeader;
