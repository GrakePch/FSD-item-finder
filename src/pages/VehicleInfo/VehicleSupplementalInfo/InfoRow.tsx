import Icon from "@mdi/react";
import styles from "./VehicleSupplementalInfo.module.css";

type InfoRowProps = {
  icon: string;
  label: string;
  value: string | number;
  warn?: boolean;
};

const InfoRow = ({ icon, label, value, warn }: InfoRowProps) => (
  <div className={styles.commonKeyValue}>
    <Icon path={icon} />
    <div>{label}</div>
    <div className={warn ? styles.textWarnColor : undefined}>{value}</div>
  </div>
);

export default InfoRow;
