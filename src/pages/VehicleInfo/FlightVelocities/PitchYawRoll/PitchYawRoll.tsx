 
// import icons from "../../../assets/icons";
import { useTranslation } from "react-i18next";
import styles from "./PitchYawRoll.module.css";

interface PitchYawRollProps {
  P: number;
  Y: number;
  R: number;
  PB: number;
  YB: number;
  RB: number;
  PM: number;
  YM: number;
  RM: number;
}

function PitchYawRoll({ P, Y, R, PB, YB, RB, PM, YM, RM }: PitchYawRollProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.PitchYawRoll}>
      <div
        className={styles.rollPieTl}
        style={{
          background: `conic-gradient(
            var(--color-primary-dim) ${(R / RM) * 90}deg, 
            var(--color-boost) ${(R / RM) * 90 + 1}deg,
            var(--color-boost) ${(RB / RM) * 90}deg, 
            #00000000 ${(RB / RM) * 90 + 1}deg)`,
        }}
      ></div>
      <div
        className={styles.rollPieTr}
        style={{
          background: `conic-gradient(
            var(--color-primary-dim) ${(R / RM) * 90}deg, 
            var(--color-boost) ${(R / RM) * 90 + 1}deg,
            var(--color-boost) ${(RB / RM) * 90}deg, 
            #00000000 ${(RB / RM) * 90 + 1}deg)`,
        }}
      ></div>
      <div
        className={styles.rollPieBl}
        style={{
          background: `conic-gradient(
            var(--color-primary-dim) ${(R / RM) * 90}deg, 
            var(--color-boost) ${(R / RM) * 90 + 1}deg,
            var(--color-boost) ${(RB / RM) * 90}deg, 
            #00000000 ${(RB / RM) * 90 + 1}deg)`,
        }}
      ></div>
      <div
        className={styles.rollPieBr}
        style={{
          background: `conic-gradient(
            var(--color-primary-dim) ${(R / RM) * 90}deg, 
            var(--color-boost) ${(R / RM) * 90 + 1}deg,
            var(--color-boost) ${(RB / RM) * 90}deg, 
            #00000000 ${(RB / RM) * 90 + 1}deg)`,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.5,
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        <div
          className={`${styles.pyRect} ${styles.boost}`}
          style={{
            height: (PB / PM) * 100 + "%",
            width: (YB / YM) * 100 + "%",
          }}
        ></div>
        <div
          className={styles.pyRect}
          style={{ height: (P / PM) * 100 + "%", width: (Y / YM) * 100 + "%" }}
        ></div>
      </div>
      <div className={styles.axisYaw}></div>
      <div className={styles.axisPit}></div>
      <div className={`${styles.text} ${styles.valuePitch}`}>
        {P} <span>/ {Math.round(PB)}</span> °/s
      </div>
      <div className={`${styles.text} ${styles.valueYaw}`}>
        {Y} <span>/ {Math.round(YB)}</span> °/s
      </div>
      <div className={`${styles.text} ${styles.valueRoll}`}>
        {R} <span>/ {Math.round(RB)}</span> °/s
      </div>
      <div className={`${styles.text} ${styles.titlePitch}`}>{t("VehicleInfo.FlightVelocities.Pitch")}</div>
      <div className={`${styles.text} ${styles.titleYaw}`}>{t("VehicleInfo.FlightVelocities.Yaw")}</div>
      <div className={`${styles.text} ${styles.titleRoll}`}>{t("VehicleInfo.FlightVelocities.Roll")}</div>
    </div>
  );
}

export default PitchYawRoll;
