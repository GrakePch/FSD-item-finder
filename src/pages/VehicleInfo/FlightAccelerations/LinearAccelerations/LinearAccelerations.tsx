import { useTranslation } from "react-i18next";
import "./LinearAccelerations.css";

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
    <div className="LinearAccelerations">
      <AccelerationBar valuePos={F} boostPos={FB} valueNeg={B} boostNeg={BB} max={max} 
                       style={{ transform: "translateX(-50%) rotate(-60deg)" }} />
      <AccelerationBar valuePos={L} boostPos={LB} valueNeg={R} boostNeg={RB} max={max} 
                       style={{ transform: "translateX(-50%) rotate(90deg)" }} />
      <AccelerationBar valuePos={U} boostPos={UB} valueNeg={D} boostNeg={DB} max={max} />
      
      <div className="text value-F">{F} <span>/ {(FB).toFixed(1)}</span> G</div>
      <div className="text value-B">{B} <span>/ {(BB).toFixed(1)}</span> G</div>
      <div className="text value-L">{L} <span>/ {(LB).toFixed(1)}</span> G</div>
      <div className="text value-R">{R} <span>/ {(RB).toFixed(1)}</span> G</div>
      <div className="text value-U">{U} <span>/ {(UB).toFixed(1)}</span> G</div>
      <div className="text value-D">{D} <span>/ {(DB).toFixed(1)}</span> G</div>
      <div className="text title-F">{t("VehicleInfo.FlightAccelerations.Main")}</div>
      <div className="text title-B">{t("VehicleInfo.FlightAccelerations.Retro")}</div>
      <div className="text title-L">{t("VehicleInfo.FlightAccelerations.Left")}</div>
      <div className="text title-R">{t("VehicleInfo.FlightAccelerations.Right")}</div>
      <div className="text title-U">{t("VehicleInfo.FlightAccelerations.Up")}</div>
      <div className="text title-D">{t("VehicleInfo.FlightAccelerations.Down")}</div>
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
    <div className="AccelerationBar" style={style}>
      <div className="axis"></div>
      <div className="boostPos" style={{ height: (boostPos / max) * 50 + "%" }}></div>
      <div className="valuePos" style={{ height: (valuePos / max) * 50 + "%" }}></div>
      <div className="boostNeg" style={{ height: (boostNeg / max) * 50 + "%" }}></div>
      <div className="valueNeg" style={{ height: (valueNeg / max) * 50 + "%" }}></div>
    </div>
  );
};

export default LinearAccelerations;
