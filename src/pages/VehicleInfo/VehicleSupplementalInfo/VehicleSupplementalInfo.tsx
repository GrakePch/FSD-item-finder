import FlightAccelerations from "../FlightAccelerations/FlightAccelerations";
import FlightVelocities from "../FlightVelocities/FlightVelocities";
import ArmorInfo from "./ArmorInfo";
import Insurance from "./Insurance";
import QuantumTravel from "./QuantumTravel";
import RadarInfo from "./RadarInfo";
import type { VehicleSupplementalInfoProps } from "./types";
import styles from "./VehicleSupplementalInfo.module.css";

const VehicleSupplementalInfo = ({
  vehicleMain,
  vehicleHardpoints,
}: VehicleSupplementalInfoProps) => {
  if (!vehicleMain) return null;

  return (
    <div className={styles.cards}>
      {vehicleMain.FlightCharacteristics && (
        <FlightVelocities flightCharacteristics={vehicleMain.FlightCharacteristics} />
      )}
      {vehicleMain.FlightCharacteristics && (
        <FlightAccelerations flightCharacteristics={vehicleMain.FlightCharacteristics} />
      )}
      {vehicleHardpoints && (
        <RadarInfo vehicleHardpoints={vehicleHardpoints} />
      )}
      {vehicleHardpoints && (
        <QuantumTravel vehicleHardpoints={vehicleHardpoints} />
      )}
      <Insurance insurance={vehicleMain.Insurance} />
      <ArmorInfo armor={vehicleMain.Armor} />
    </div>
  );
};

export default VehicleSupplementalInfo;
