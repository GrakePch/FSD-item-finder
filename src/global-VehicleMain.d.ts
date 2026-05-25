interface VehicleMain {
  "New Ship"?: string;
  "New Vehicle"?: string;
  ClassName: string;
  Name: string;
  Description: string;
  Career: string;
  Role: string;
  Size: number;
  Cargo: {
    CargoGrid: number;
    CargoContainers: number;
    Storage: number;
  };
  Crew: number;
  WeaponCrew: number;
  OperationsCrew: number;
  Mass: number;
  ComponentsMass: number;
  Dimensions: { Length: number; Width: number; Height: number };
  Dimensions2?: { Length: number; Width: number; Height: number };
  IsSpaceship: boolean;
  IsVehicle?: boolean;
  IsGravlev?: true;
  Armor: {
    Durability?: {
      Health: number;
      DamageMultipliers: Partial<{
        Physical: number;
        Energy: number;
        Distortion: number;
        Thermal: number;
        Biochemical: number;
        Stun: number;
      }>;
    };
    DamageDeflection?: {
      Physical: number;
      Energy: number;
      Distortion: number;
    };
    DamageMultipliers: {
      Physical: number;
      Energy: number;
      Distortion: number;
    };
    SignalMultipliers: {
      Electromagnetic: number;
      Infrared: number;
      CrossSection: number;
    };
  };
  Hull: {
    PenetrationDamageMultiplier?: {
      Fuse: number;
      Component: number;
    };
    StructureHealthPoints: {
      VitalParts: { [key: string]: number };
      Parts: { [key: string]: number };
    };
    DoorsHealthPoints?: { [key: string]: number };
    ThrustersHealthPoints?: {
      Main: { [key: string]: number };
      Retro?: { [key: string]: number };
      Vtol?: { [key: string]: number };
      Maneuvering: { [key: string]: number };
    };
  };
  FlightCharacteristics?: VehicleFlightCharacteristics;
  FuelManagement?: VehicleFuelManagement;
  SteerCharacteristics?: {
    V0SteerSpeed: number;
    VMaxSteerSpeed: number;
    V0SteerMaxAngle: number;
    SteerSubtractV: number;
    SteerSubtractAngle: number;
    SteerRelaxationSpeed: number;
  };
  DriveCharacteristics?: {
    Acceleration: number;
    Decceleration: number;
    TopSpeed: number;
    ReverseSpeed: number;
  };
  TrackWheeledCharacteristics?: {
    EnginePower: number;
    EngineMinRPM: number;
    EngineIdleRPM: number;
    EngineMaxRPM: number;
    MaxSpeed: number;
  };
  TrackSteerCharacteristics?: {
    SteerSpeed: number;
    SteerSpeedMin: number;
    V0SteerMax: number;
    KvSteerMax: number;
    VMaxSteerMax: number;
    VMaxSteerSpeed: number;
    V0SteerSpeed: number;
    V0SteerMaxAngle: number;
    SteerSubtractAngle: number;
    SteerSubtractV: number;
    SteerRelaxationSpeed: number;
  };
  Emissions: {
    Electromagnetic: {
      SCMIdle: number;
      SCMActive: number;
      NAV: number;
    };
    Infrared: {
      Start: number;
    };
    CrossSection: {
      Front: number;
      Side: number;
      Top: number;
    };
  };
  ResourceNetwork: {
    ItemPools: { WeaponPoolSize: number };
    Modifiers?: {
      PowerRatioMultiplier: number;
      MaxAmmoLoadMultiplier: number;
      MaxRegenPerSecMultiplier: number;
    };
  };
  BaseLoadout: {
    TotalShieldHP: number;
    PilotBurstDPS: number;
    TurretsBurstDPS: number;
    PDCBurstDPS?: number;
    TotalEMPDmg?: number;
    TotalMissilesDmg: number;
  };
  Buffs?: {
    Salvage: {
      Buffer: number;
      SpeedMultiplier: number;
      RadiusMultiplier: number;
      ExtractionEfficiency: number;
    };
  };
  Insurance: {
    StandardClaimTime: number;
    ExpeditedClaimTime: number;
    ExpeditedCost: number;
  };
  Buy?: {
    [location: string]: number;
  };
}

interface VehicleFlightCharacteristics {
  ScmSpeed: number;
  HoverMaxSpeed?: number;
  MaxSpeed: number;
  Pitch: number;
  Yaw: number;
  Roll: number;
  IsVtolAssisted: boolean;
  ThrustCapacity: {
    Main: number;
    Retro: number;
    Vtol: number;
    Maneuvering: number;
  };
  AccelerationG: {
    IsValidated: boolean;
    Main: number;
    Retro: number;
    Strafe: number;
    Up: number;
    Down: number;
    CheckDate?: string;
  };
  MasterModes: {
    BaseSpoolTime: number;
    QuantumDriveSpoolTime?: number;
    ScmMode: {
      BoostSpeedForward: number;
      BoostSpeedBackward: number;
    };
  };
  Boost: {
    PreDelay: number;
    RampUp: number;
    RampDown: number;
    AccelerationMultiplier: {
      PositiveAxis: { X: number; Y: number; Z: number };
      NegativeAxis: { X: number; Y: number; Z: number };
    };
    AngularAccelerationMultiplier: { Pitch: number; Yaw: number; Roll: number };
    AngularVelocityMultiplier: { Pitch: number; Yaw: number; Roll: number };
  };
  Capacitors: {
    ThrusterCapacitorSize: number;
    CapacitorRegenPerSec: number;
    CapacitorIdleCost: number;
    CapacitorLinearCost: number;
    CapacitorUsageModifier: number;
    CapacitorRegenDelay: number;
    RegenerationTime: number;
  };
  Emissions?: {
    CrossSection: {
      Front: number;
      Side: number;
      Top: number;
    };
  };
}

interface VehicleFuelManagement {
  FuelCapacity: number;
  FuelIntakeRate: number;
  QuantumFuelCapacity: number;
  FuelBurnRatePer10KNewton: {
    Main: number;
    Retro: number;
    Vtol: number;
    Maneuvering: number;
  };
  FuelUsagePerSecond: {
    Main: number;
    Retro: number;
    Vtol: number;
    Maneuvering: number;
  };
  IntakeToMainFuelRatio: number;
  TimeForIntakesToFillTank: number | "Infinity";
}
