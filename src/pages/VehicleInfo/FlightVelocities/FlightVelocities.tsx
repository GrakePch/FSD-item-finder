import styles from "./FlightVelocities.module.css";
import PitchYawRoll from "./PitchYawRoll/PitchYawRoll";
import VelocitiesScmNav from "./VelocitiesScmNav/VelocitiesScmNav";

const FlightVelocities = ({ flightCharacteristics }: { flightCharacteristics: VehicleFlightCharacteristics }) => {
  const vehicleFlightBoostAngular = flightCharacteristics.Boost.AngularVelocityMultiplier;
  return (
    <div className={styles.FlightVelocities}>
      <VelocitiesScmNav
        scm={flightCharacteristics.ScmSpeed}
        scmBoostF={flightCharacteristics.MasterModes.ScmMode.BoostSpeedForward}
        scmBoostB={flightCharacteristics.MasterModes.ScmMode.BoostSpeedBackward}
        nav={flightCharacteristics.MaxSpeed}
        max={1500}
      />
      <PitchYawRoll
        P={flightCharacteristics.Pitch}
        Y={flightCharacteristics.Yaw}
        R={flightCharacteristics.Roll}
        PB={flightCharacteristics.Pitch * vehicleFlightBoostAngular.Pitch}
        YB={flightCharacteristics.Yaw * vehicleFlightBoostAngular.Yaw}
        RB={flightCharacteristics.Roll * vehicleFlightBoostAngular.Roll}
        PM={120}
        YM={120}
        RM={360}
      />
    </div>
  );
};

export default FlightVelocities;
