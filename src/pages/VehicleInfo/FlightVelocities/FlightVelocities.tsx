import "./FlightVelocities.css";
import PitchYawRoll from "./PitchYawRoll/PitchYawRoll";
import VelocitiesScmNav from "./VelocitiesScmNav/VelocitiesScmNav";

const FlightVelocities = ({ spvVehicleMain }: { spvVehicleMain: SpvVehicleMain }) => {
  const spvFC = spvVehicleMain.FlightCharacteristics;
  const spvFCBAngular = spvFC.Boost.AngularVelocityMultiplier;
  return (
    <div className="FlightVelocities">
      <VelocitiesScmNav
        scm={spvFC.ScmSpeed}
        scmBoostF={spvFC.MasterModes.ScmMode.BoostSpeedForward}
        scmBoostB={spvFC.MasterModes.ScmMode.BoostSpeedBackward}
        nav={spvFC.MaxSpeed}
        max={1500}
      />
      <PitchYawRoll
        P={spvFC.Pitch}
        Y={spvFC.Yaw}
        R={spvFC.Roll}
        PB={spvFC.Pitch * spvFCBAngular.Pitch}
        YB={spvFC.Yaw * spvFCBAngular.Yaw}
        RB={spvFC.Roll * spvFCBAngular.Roll}
        PM={120}
        YM={120}
        RM={360}
      />
    </div>
  );
};

export default FlightVelocities;
