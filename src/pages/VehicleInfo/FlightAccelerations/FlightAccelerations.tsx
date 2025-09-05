import { useTranslation } from "react-i18next";
import "./FlightAccelerations.css";
import LinearAccelerations from "./LinearAccelerations/LinearAccelerations";

const FlightAccelerations = ({ spvFC }: { spvFC: SpvFlightCharacteristics }) => {
  const { t } = useTranslation();
  const spvFCAccelG    = spvFC.AccelerationG;
  const spvFCAccelMult = spvFC.Boost.AccelerationMultiplier;
  const spvFCCap       = spvFC.Capacitors;
  const timeCapDepleteSeconds = (spvFCCap.ThrusterCapacitorSize / (spvFCCap.CapacitorIdleCost * spvFCCap.CapacitorUsageModifier)).toFixed(1);
  const timeCapRegenSeconds   = (spvFCCap.ThrusterCapacitorSize / spvFCCap.CapacitorRegenPerSec).toFixed(1);
  const time0ToMaxSpeedSeconds = Math.round(calcSeconds0ToMaxSpeed(
    spvFC.MaxSpeed, 
    spvFCAccelG.Main * 9.8, 
    spvFCAccelG.Main * spvFCAccelMult.PositiveAxis.Y * 9.8, 
    spvFC.Boost.RampUp, 
    spvFC.Boost.PreDelay
  )*10)/10;

  return (
    <div className="FlightAccelerations">
      <div className="textInfo">
        <div className="titleValue"><div>{t("VehicleInfo.FlightBoost.RampUp")}</div><div>{spvFC.Boost.RampUp} s</div></div>
        <div className="titleValue"><div>{t("VehicleInfo.FlightBoost.RampDown")}</div><div>{spvFC.Boost.RampDown} s</div></div>
        <div className="titleValue"><div>{t("VehicleInfo.FlightBoost.CapacitorDeplete")}</div><div>{timeCapDepleteSeconds} s</div></div>
        <div className="titleValue"><div>{t("VehicleInfo.FlightBoost.CapacitorRegen")}</div><div>{timeCapRegenSeconds} +({spvFCCap.CapacitorRegenDelay}) s</div></div>
        <div className="titleValueHero"><div>{t("VehicleInfo.FlightCharacteristics.Time0ToMaxSpeed")}</div><div>{time0ToMaxSpeedSeconds} s</div></div>
        {/* <div className="titleValueHero"><div>{t("VehicleInfo.FlightCharacteristics.BrakeDistanceAtMax")}</div><div>{20000} m</div></div> */}
      </div>
      <LinearAccelerations
        F={spvFCAccelG.Main  }
        B={spvFCAccelG.Retro }
        L={spvFCAccelG.Strafe}
        R={spvFCAccelG.Strafe}
        U={spvFCAccelG.Up    }
        D={spvFCAccelG.Down  }
        FB={spvFCAccelG.Main   * spvFCAccelMult.PositiveAxis.Y}
        BB={spvFCAccelG.Retro  * spvFCAccelMult.NegativeAxis.Y}
        LB={spvFCAccelG.Strafe * spvFCAccelMult.NegativeAxis.X}
        RB={spvFCAccelG.Strafe * spvFCAccelMult.PositiveAxis.X}
        UB={spvFCAccelG.Up     * spvFCAccelMult.PositiveAxis.Z}
        DB={spvFCAccelG.Down   * spvFCAccelMult.NegativeAxis.Z}
        max={32}
      />
    </div>
  );
};

export default FlightAccelerations;

function calcSeconds0ToMaxSpeed(
  maxSpeed: number, 
  baseAccel: number, 
  boostAccel: number, 
  timeRampUp: number, 
  timePreDelay: number 
): number {
  // When boosting, the acceleration stays in baseAccel for timePreDelay seconds. 
  // Then, it linearly increases to boostAccel in timeRampUp seconds.
  // After that, it stays at boostAccel.
  // Calculate the time from 0 to maxSpeed.
  const speedAfterPreDelay = baseAccel * timePreDelay;
  if (speedAfterPreDelay >= maxSpeed) {
    return maxSpeed / baseAccel;
  }

  const speedAfterRampUp = speedAfterPreDelay + (baseAccel + boostAccel) / 2 * timeRampUp;
  if (speedAfterRampUp >= maxSpeed) {
    const a = (boostAccel - baseAccel) / timeRampUp;
    const b = baseAccel;
    const c = speedAfterPreDelay - maxSpeed;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      return Infinity; // Should not happen
    }
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const t1 = (-b + sqrtDiscriminant) / (2 * a);
    const t2 = (-b - sqrtDiscriminant) / (2 * a);
    const t = Math.max(t1, t2);
    return timePreDelay + t;
  }
  
  return timePreDelay + timeRampUp + (maxSpeed - speedAfterRampUp) / boostAccel;
}