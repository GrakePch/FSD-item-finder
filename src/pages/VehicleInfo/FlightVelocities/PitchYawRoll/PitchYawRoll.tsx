/* eslint-disable react/prop-types */
// import icons from "../../../assets/icons";
import { useTranslation } from "react-i18next";
import "./PitchYawRoll.css";

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
    <div className="PitchYawRoll">
      <div
        className="roll-pie-tl"
        style={{
          background: `conic-gradient(
            var(--color-primary-dim) ${(R / RM) * 90}deg, 
            var(--color-boost) ${(R / RM) * 90 + 1}deg,
            var(--color-boost) ${(RB / RM) * 90}deg, 
            #00000000 ${(RB / RM) * 90 + 1}deg)`,
        }}
      ></div>
      <div
        className="roll-pie-tr"
        style={{
          background: `conic-gradient(
            var(--color-primary-dim) ${(R / RM) * 90}deg, 
            var(--color-boost) ${(R / RM) * 90 + 1}deg,
            var(--color-boost) ${(RB / RM) * 90}deg, 
            #00000000 ${(RB / RM) * 90 + 1}deg)`,
        }}
      ></div>
      <div
        className="roll-pie-bl"
        style={{
          background: `conic-gradient(
            var(--color-primary-dim) ${(R / RM) * 90}deg, 
            var(--color-boost) ${(R / RM) * 90 + 1}deg,
            var(--color-boost) ${(RB / RM) * 90}deg, 
            #00000000 ${(RB / RM) * 90 + 1}deg)`,
        }}
      ></div>
      <div
        className="roll-pie-br"
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
          className="py-rect boost"
          style={{
            height: (PB / PM) * 100 + "%",
            width: (YB / YM) * 100 + "%",
          }}
        ></div>
        <div
          className="py-rect"
          style={{ height: (P / PM) * 100 + "%", width: (Y / YM) * 100 + "%" }}
        ></div>
      </div>
      <div className="axis-yaw"></div>
      <div className="axis-pit"></div>
      <div className="text value-pitch">
        {P} <span>/ {Math.round(PB)}</span> °/s
      </div>
      <div className="text value-yaw">
        {Y} <span>/ {Math.round(YB)}</span> °/s
      </div>
      <div className="text value-roll">
        {R} <span>/ {Math.round(RB)}</span> °/s
      </div>
      <div className="text title-pitch">{t("VehicleInfo.FlightVelocities.Pitch")}</div>
      <div className="text title-yaw">{t("VehicleInfo.FlightVelocities.Yaw")}</div>
      <div className="text title-roll">{t("VehicleInfo.FlightVelocities.Roll")}</div>
    </div>
  );
}

export default PitchYawRoll;
