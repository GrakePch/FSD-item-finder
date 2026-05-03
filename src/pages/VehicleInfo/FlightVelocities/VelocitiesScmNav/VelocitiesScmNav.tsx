import { useTranslation } from "react-i18next";
import styles from "./VelocitiesScmNav.module.css";

interface VelocitiesScmNavProps {
  scm: number;
  scmBoostF: number;
  scmBoostB: number;
  nav: number;
  max: number;
}

const VelocitiesScmNav = ({
  scm,
  scmBoostF,
  scmBoostB,
  nav,
  max,
}: VelocitiesScmNavProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles.VelocitiesScmNav}>
      <div className={styles.nav} style={{ width: (nav / max) * 100 + "%" }}></div>
      <div
        className={styles.scmBoostForwardLeft}
        style={{
          height: (scmBoostF / max) * 50 + "%",
          width: (scmBoostB / max) * 50 + "%",
        }}
      ></div>
      <div
        className={styles.scmBoostForwardRight}
        style={{
          height: (scmBoostF / max) * 50 + "%",
          width: (scmBoostB / max) * 50 + "%",
        }}
      ></div>
      <div
        className={styles.scmBoostBackward}
        style={{
          height: (scmBoostB / max) * 50 + "%",
          width: (scmBoostB / max) * 100 + "%",
        }}
      ></div>
      <div className={styles.scm} style={{ width: (scm / max) * 100 + "%" }}></div>
      <div className={styles.axisFb}></div>
      <div className={styles.axisLr}></div>
      <div className={`${styles.text} ${styles.valueNav}`}>{Math.round(nav)} m/s</div>
      <div className={`${styles.text} ${styles.valueScmBoostForward}`}>{Math.round(scmBoostF)} m/s</div>
      <div className={`${styles.text} ${styles.valueScm}`}>{Math.round(scm)} m/s</div>
      <div className={`${styles.text} ${styles.titleNav}`}>{t("VehicleInfo.FlightVelocities.NAV")}</div>
      <div className={`${styles.text} ${styles.titleScmBoostForward}`}>
        {t("VehicleInfo.FlightVelocities.Boost")}
      </div>
      <div className={`${styles.text} ${styles.titleScm}`}>{t("VehicleInfo.FlightVelocities.SCM")}</div>
    </div>
  );
};

export default VelocitiesScmNav;
