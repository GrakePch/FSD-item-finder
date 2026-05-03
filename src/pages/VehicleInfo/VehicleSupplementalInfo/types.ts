export type InstalledItem = SpvPort | SpvHardpointsOldItem;

export type EssentialVehicleItem = {
  className: string;
  stdItem: {
    ClassName: string;
    Name: string;
    Size?: number;
    Grade?: number;
    Class?: string;
    QuantumDrive?: {
      StandardJump?: {
        Speed?: number;
        Stage1AccelerationRate?: number;
        State2AccelerationRate?: number;
      };
    };
    Radar?: {
      AimAssist?: { DistanceMax?: number };
      IR?: { Sensitivity?: number };
      EM?: { Sensitivity?: number };
      CS?: { Sensitivity?: number };
      RS?: { Sensitivity?: number };
    };
  };
};

export type VehicleSupplementalInfoProps = {
  spvVehicleMain?: SpvVehicleMain;
  spvVehicleHardpoints?: SpvVehicleHardpoints;
};
