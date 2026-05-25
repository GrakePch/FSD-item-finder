export type InstalledItem = VehiclePort | VehicleHardpointOldItem;

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
  vehicleMain?: VehicleMain;
  vehicleHardpoints?: VehicleHardpointData;
};
