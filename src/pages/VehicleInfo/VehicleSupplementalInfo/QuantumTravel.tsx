import { useTranslation } from "react-i18next";
import { icon } from "../../../assets/icon";
import { formatTime } from "./formatters";
import { getInstalledItems } from "./hardpointUtils";
import InstalledHeader from "./InstalledHeader";
import { findVehicleItem } from "./vehicleItemData";
import styles from "./VehicleSupplementalInfo.module.css";

const mapConsumptionScuPerGmSpecial: Record<string, number> = {
  QDRV_ORIG_S04_890J_SCItem: 0.047,
  QDRV_WETK_S04_Idris_TEMP: 0.075,
  QDRV_AEGS_S04_Javelin_SCItem: 0.12,
};

const mapConsumptionScuPerGm: Record<number, Record<number, number>> = {
  1: {
    1: 0.014,
    2: 0.012,
    3: 0.01,
    4: 0.008,
  },
  2: {
    1: 0.011,
    2: 0.013,
    3: 0.016,
    4: 0.019,
  },
  3: {
    1: 0.018,
    2: 0.021,
    3: 0.026,
    4: 0.031,
  },
};

const distCrusaderToHurstonGm = 31.92;
const distMicroTechToPyroGatewayGm = 67.97;
const distTerminusToEndgameGm = 136.49;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const qtTime = (
  distance: number,
  speedMax: number,
  accelStage1: number,
  accelStage2: number
) => {
  const accelSum = accelStage1 + accelStage2;
  const accelSumSq = accelSum ** 2;
  const reachThreshold =
    (4 * speedMax ** 2 * (2 * accelStage1 + accelStage2)) /
    (3 * accelSumSq);

  if (distance >= reachThreshold) {
    return (
      (4 * speedMax) / accelSum +
      distance / speedMax -
      (4 * speedMax * (2 * accelStage1 + accelStage2)) / (3 * accelSumSq)
    );
  }

  const delta = accelStage2 - accelStage1;
  const z =
    (3 * delta ** 2 * accelSumSq * distance) /
      (8 * speedMax ** 2 * accelStage1 ** 3) -
    1;
  const prefactor =
    (4 * accelStage1 * speedMax) / (accelStage2 ** 2 - accelStage1 ** 2);

  if (z > 1) {
    const sqrtTerm = Math.sqrt(Math.max(z * z - 1, 0));
    const logTerm = -Math.log(z - sqrtTerm);
    return prefactor * (2 * Math.cosh(logTerm / 3) - 1);
  }

  const safeZ = clamp(z, -1, 1);
  return prefactor * (2 * Math.cos((1 / 3) * Math.acos(safeZ)) - 1);
};

const FuelCapacityBar = ({
  totalWidth,
  segmentWidth,
}: {
  totalWidth: number;
  segmentWidth: number;
}) => {
  if (segmentWidth <= 0) return <div className={styles.fuelCapacityBar} />;

  const segmentNum = Math.floor(totalWidth / segmentWidth);
  const lastSegmentWidth = totalWidth % segmentWidth;

  return (
    <div className={styles.fuelCapacityBar}>
      {Array.from({ length: segmentNum }).map((_, i) => (
        <div
          key={i}
          style={{ width: `${(segmentWidth / totalWidth) * 100}%` }}
        />
      ))}
      {lastSegmentWidth > 0 && (
        <div
          className={styles.remainder}
          style={{ width: `${(lastSegmentWidth / totalWidth) * 100}%` }}
        />
      )}
    </div>
  );
};

const QuantumTravel = ({
  spvVehicleHardpoints,
}: {
  spvVehicleHardpoints: SpvVehicleHardpoints;
}) => {
  const { t } = useTranslation();
  const propulsion = spvVehicleHardpoints.Hardpoints.Components.Propulsion;
  const quantumDrive = getInstalledItems<SpvPort>(propulsion.QuantumDrives)?.at(0);
  const fuelCapacity = propulsion.QuantumFuelTanks.TotalQuantumFuelCapacity;
  const vItem = findVehicleItem(
    quantumDrive?.BaseLoadout?.ClassName || quantumDrive?.Loadout
  );

  if (!quantumDrive || !fuelCapacity || !vItem?.stdItem?.QuantumDrive?.StandardJump) {
    return null;
  }

  const speedMaxMps = vItem.stdItem.QuantumDrive.StandardJump.Speed;
  const accelStage1 = vItem.stdItem.QuantumDrive.StandardJump.Stage1AccelerationRate;
  const accelStage2 = vItem.stdItem.QuantumDrive.StandardJump.State2AccelerationRate;

  if (!speedMaxMps || !accelStage1 || !accelStage2) return null;

  const consumptionScuPerGm =
    mapConsumptionScuPerGmSpecial[vItem.stdItem.ClassName] ||
    (vItem.stdItem.Size !== undefined && vItem.stdItem.Grade !== undefined
      ? mapConsumptionScuPerGm[vItem.stdItem.Size]?.[vItem.stdItem.Grade]
      : undefined) ||
    0;

  const consumptionCrusaderToHurstonScu =
    consumptionScuPerGm * distCrusaderToHurstonGm;
  const consumptionCrusaderToHurstonPercent =
    (consumptionCrusaderToHurstonScu / fuelCapacity) * 100;
  const timeCrusaderToHurstonFormatted = formatTime(
    qtTime(distCrusaderToHurstonGm * 1e9, speedMaxMps, accelStage1, accelStage2)
  );

  const consumptionMicroTechToPyroGatewayScu =
    consumptionScuPerGm * distMicroTechToPyroGatewayGm;
  const consumptionMicroTechToPyroGatewayPercent =
    (consumptionMicroTechToPyroGatewayScu / fuelCapacity) * 100;
  const timeMicroTechToPyroGatewayFormatted = formatTime(
    qtTime(
      distMicroTechToPyroGatewayGm * 1e9,
      speedMaxMps,
      accelStage1,
      accelStage2
    )
  );

  const consumptionTerminusToEndgameScu =
    consumptionScuPerGm * distTerminusToEndgameGm;
  const consumptionTerminusToEndgamePercent =
    (consumptionTerminusToEndgameScu / fuelCapacity) * 100;
  const timeTerminusToEndgameFormatted = formatTime(
    qtTime(distTerminusToEndgameGm * 1e9, speedMaxMps, accelStage1, accelStage2)
  );

  const percentStyle = (prct: number) => ({
    color: prct < 100 ? "var(--color-nav-mode)" : "var(--color-red)",
  });

  return (
    <section className={styles.container}>
      <InstalledHeader icon={icon["Quantum Drives"]} item={vItem} />

      <div className={styles.sectionCommonInfo}>
        <div className={styles.commonKeyValue}>
          <div>{t("VehicleInfo.QuantumTravel.MaxSpeed", { defaultValue: "Max Speed" })}</div>
          <div>{(speedMaxMps * 1e-9).toFixed(1)} Gm/s</div>
        </div>
        <div className={styles.commonKeyValue}>
          <div>
            {t("VehicleInfo.QuantumTravel.ConsumptionPerGm", {
              defaultValue: "Consumption per Gm",
            })}
          </div>
          <div>{consumptionScuPerGm.toFixed(3)} SCU</div>
        </div>
        <div className={styles.commonKeyValue}>
          <div>{t("VehicleInfo.QuantumTravel.FuelCapacity", { defaultValue: "Fuel Capacity" })}</div>
          <div>{fuelCapacity.toFixed(1)} SCU</div>
        </div>

        <FuelCapacityBar totalWidth={fuelCapacity} segmentWidth={consumptionCrusaderToHurstonScu} />

        <div className={styles.commonKeyValue}>
          <div>
            {t("VehicleInfo.QuantumTravel.CrusaderToHurston", {
              defaultValue: "Crusader to Hurston",
            })}
          </div>
          <div>{distCrusaderToHurstonGm} Gm</div>
        </div>
        <div className={styles.commonKeyValue}>
          <div>
            <b>{timeCrusaderToHurstonFormatted}</b>
          </div>
          <div style={percentStyle(consumptionCrusaderToHurstonPercent)}>
            {consumptionCrusaderToHurstonPercent.toFixed(1)} %
          </div>
        </div>

        <FuelCapacityBar
          totalWidth={fuelCapacity}
          segmentWidth={consumptionMicroTechToPyroGatewayScu}
        />

        <div className={styles.commonKeyValue}>
          <div>
            {t("VehicleInfo.QuantumTravel.MicroTechToPyroGateway", {
              defaultValue: "MicroTech to Pyro Gateway",
            })}
          </div>
          <div>{distMicroTechToPyroGatewayGm} Gm</div>
        </div>
        <div className={styles.commonKeyValue}>
          <div>
            <b>{timeMicroTechToPyroGatewayFormatted}</b>
          </div>
          <div style={percentStyle(consumptionMicroTechToPyroGatewayPercent)}>
            {consumptionMicroTechToPyroGatewayPercent.toFixed(1)} %
          </div>
        </div>

        <FuelCapacityBar totalWidth={fuelCapacity} segmentWidth={consumptionTerminusToEndgameScu} />

        <div className={styles.commonKeyValue}>
          <div>
            {t("VehicleInfo.QuantumTravel.TerminusToEndgame", {
              defaultValue: "Terminus to Endgame",
            })}
          </div>
          <div>{distTerminusToEndgameGm} Gm</div>
        </div>
        <div className={styles.commonKeyValue}>
          <div>
            <b>{timeTerminusToEndgameFormatted}</b>
          </div>
          <div style={percentStyle(consumptionTerminusToEndgamePercent)}>
            {consumptionTerminusToEndgamePercent.toFixed(1)} %
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuantumTravel;
