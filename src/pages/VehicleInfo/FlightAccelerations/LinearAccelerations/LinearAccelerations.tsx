import { useTranslation } from "react-i18next";
import styles from "./LinearAccelerations.module.css";

interface LinearAccelerationsProps {
  F: number;  B: number;
  L: number;  R: number;
  U: number;  D: number;
  FB: number; BB: number;
  LB: number; RB: number;
  UB: number; DB: number;
  max: number;
}

const LinearAccelerations = ({
  F,  B,
  L,  R,
  U,  D,
  FB, BB,
  LB, RB,
  UB, DB,
  max,
}: LinearAccelerationsProps) => {
  const { t } = useTranslation();
  return (
    <div className={styles.LinearAccelerations}>
      <AccelerationBar valuePos={F} boostPos={FB} valueNeg={B} boostNeg={BB} max={max} 
                       style={{ transform: "translateX(-50%) rotate(-60deg)" }} />
      <AccelerationBar valuePos={L} boostPos={LB} valueNeg={R} boostNeg={RB} max={max} 
                       style={{ transform: "translateX(-50%) rotate(90deg)" }} />
      <AccelerationBar valuePos={U} boostPos={UB} valueNeg={D} boostNeg={DB} max={max} />
      
      <div className={`${styles.text} ${styles.valueF}`}>{F} <span>/ {(FB).toFixed(1)}</span> G</div>
      <div className={`${styles.text} ${styles.valueB}`}>{B} <span>/ {(BB).toFixed(1)}</span> G</div>
      <div className={`${styles.text} ${styles.valueL}`}>{L} <span>/ {(LB).toFixed(1)}</span> G</div>
      <div className={`${styles.text} ${styles.valueR}`}>{R} <span>/ {(RB).toFixed(1)}</span> G</div>
      <div className={`${styles.text} ${styles.valueU}`}>{U} <span>/ {(UB).toFixed(1)}</span> G</div>
      <div className={`${styles.text} ${styles.valueD}`}>{D} <span>/ {(DB).toFixed(1)}</span> G</div>
      <div className={`${styles.text} ${styles.titleF}`}>{t("VehicleInfo.FlightAccelerations.Main")}</div>
      <div className={`${styles.text} ${styles.titleB}`}>{t("VehicleInfo.FlightAccelerations.Retro")}</div>
      <div className={`${styles.text} ${styles.titleL}`}>{t("VehicleInfo.FlightAccelerations.Left")}</div>
      <div className={`${styles.text} ${styles.titleR}`}>{t("VehicleInfo.FlightAccelerations.Right")}</div>
      <div className={`${styles.text} ${styles.titleU}`}>{t("VehicleInfo.FlightAccelerations.Up")}</div>
      <div className={`${styles.text} ${styles.titleD}`}>{t("VehicleInfo.FlightAccelerations.Down")}</div>
    </div>
  );
};

const AccelerationBar = ({
  valuePos, boostPos,
  valueNeg, boostNeg,
  max,
  style,
}: {
  valuePos: number; boostPos: number;
  valueNeg: number; boostNeg: number;
  max: number;
  style?: React.CSSProperties;
}) => {
  return (
    <div className={styles.AccelerationBar} style={style}>
      <div className={styles.axis}></div>
      <div className={styles.boostPos} style={{ height: (boostPos / max) * 50 + "%" }}></div>
      <div className={styles.valuePos} style={{ height: (valuePos / max) * 50 + "%" }}></div>
      <div className={styles.boostNeg} style={{ height: (boostNeg / max) * 50 + "%" }}></div>
      <div className={styles.valueNeg} style={{ height: (valueNeg / max) * 50 + "%" }}></div>
    </div>
  );
};

export default LinearAccelerations;
