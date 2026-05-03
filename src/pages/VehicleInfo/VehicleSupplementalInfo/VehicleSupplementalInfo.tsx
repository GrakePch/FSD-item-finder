import FlightAccelerations from "../FlightAccelerations/FlightAccelerations";
import FlightVelocities from "../FlightVelocities/FlightVelocities";
import ArmorInfo from "./ArmorInfo";
import Insurance from "./Insurance";
import QuantumTravel from "./QuantumTravel";
import RadarInfo from "./RadarInfo";
import type { VehicleSupplementalInfoProps } from "./types";
import styles from "./VehicleSupplementalInfo.module.css";

const VehicleSupplementalInfo = ({
  spvVehicleMain,
  spvVehicleHardpoints,
}: VehicleSupplementalInfoProps) => {
  if (!spvVehicleMain) return null;

  return (
    <div className={styles.cards}>
      {spvVehicleMain.FlightCharacteristics && (
        <FlightVelocities spvFC={spvVehicleMain.FlightCharacteristics} />
      )}
      {spvVehicleMain.FlightCharacteristics && (
        <FlightAccelerations spvFC={spvVehicleMain.FlightCharacteristics} />
      )}
      {spvVehicleHardpoints && (
        <RadarInfo spvVehicleHardpoints={spvVehicleHardpoints} />
      )}
      {spvVehicleHardpoints && (
        <QuantumTravel spvVehicleHardpoints={spvVehicleHardpoints} />
      )}
      <Insurance insurance={spvVehicleMain.Insurance} />
      <ArmorInfo armor={spvVehicleMain.Armor} />
    </div>
  );
};

export default VehicleSupplementalInfo;
