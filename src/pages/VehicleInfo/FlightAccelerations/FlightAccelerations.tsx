import { useTranslation } from "react-i18next";
import styles from "./FlightAccelerations.module.css";
import LinearAccelerations from "./LinearAccelerations/LinearAccelerations";

const FlightAccelerations = ({ flightCharacteristics }: { flightCharacteristics: VehicleFlightCharacteristics }) => {
  const { t } = useTranslation();
  const vehicleAccelerationG    = flightCharacteristics.AccelerationG;
  const vehicleAccelerationMultiplier = flightCharacteristics.Boost.AccelerationMultiplier;
  const vehicleCapacitors       = flightCharacteristics.Capacitors;
  const timeCapDepleteSeconds = (vehicleCapacitors.ThrusterCapacitorSize / (vehicleCapacitors.CapacitorIdleCost * vehicleCapacitors.CapacitorUsageModifier)).toFixed(1);
  const timeCapRegenSeconds   = (vehicleCapacitors.ThrusterCapacitorSize / vehicleCapacitors.CapacitorRegenPerSec).toFixed(1);
  const time0ToMaxSpeedSeconds = Math.round(calcSeconds0ToMaxSpeed(
    flightCharacteristics.MaxSpeed, 
    vehicleAccelerationG.Main * 9.8, 
    vehicleAccelerationG.Main * vehicleAccelerationMultiplier.PositiveAxis.Y * 9.8, 
    flightCharacteristics.Boost.RampUp, 
    flightCharacteristics.Boost.PreDelay
  )*10)/10;

  return (
    <div className={styles.FlightAccelerations}>
      <div className={styles.textInfo}>
        <div className={styles.titleValue}><div>{t("VehicleInfo.FlightBoost.RampUp")}</div><div>{flightCharacteristics.Boost.RampUp} s</div></div>
        <div className={styles.titleValue}><div>{t("VehicleInfo.FlightBoost.RampDown")}</div><div>{flightCharacteristics.Boost.RampDown} s</div></div>
        <div className={styles.titleValue}><div>{t("VehicleInfo.FlightBoost.CapacitorDeplete")}</div><div>{timeCapDepleteSeconds} s</div></div>
        <div className={styles.titleValue}><div>{t("VehicleInfo.FlightBoost.CapacitorRegen")}</div><div>{timeCapRegenSeconds} +({vehicleCapacitors.CapacitorRegenDelay}) s</div></div>
        <div className={styles.titleValueHero}><div>{t("VehicleInfo.FlightCharacteristics.Time0ToMaxSpeed")}</div><div>{time0ToMaxSpeedSeconds} s</div></div>
        {/* <div className={styles.titleValueHero}><div>{t("VehicleInfo.FlightCharacteristics.BrakeDistanceAtMax")}</div><div>{20000} m</div></div> */}
      </div>
      <LinearAccelerations
        F={vehicleAccelerationG.Main  }
        B={vehicleAccelerationG.Retro }
        L={vehicleAccelerationG.Strafe}
        R={vehicleAccelerationG.Strafe}
        U={vehicleAccelerationG.Up    }
        D={vehicleAccelerationG.Down  }
        FB={vehicleAccelerationG.Main   * vehicleAccelerationMultiplier.PositiveAxis.Y}
        BB={vehicleAccelerationG.Retro  * vehicleAccelerationMultiplier.NegativeAxis.Y}
        LB={vehicleAccelerationG.Strafe * vehicleAccelerationMultiplier.NegativeAxis.X}
        RB={vehicleAccelerationG.Strafe * vehicleAccelerationMultiplier.PositiveAxis.X}
        UB={vehicleAccelerationG.Up     * vehicleAccelerationMultiplier.PositiveAxis.Z}
        DB={vehicleAccelerationG.Down   * vehicleAccelerationMultiplier.NegativeAxis.Z}
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