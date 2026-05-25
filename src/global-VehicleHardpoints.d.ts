interface VehicleHardpointData {
  ClassName: string;
  Name: string;
  IsSpaceship: boolean;
  IsGravlev?: boolean;
  IsVehicle?: boolean;
  PortTags: string[];
  Hull: { Structure: VehicleHullPart[] };
  Hardpoints: {
    Weapons: {
      PilotWeapons: VehicleHardpointGroup;
      MannedTurrets: VehicleHardpointGroup;
      RemoteTurrets: VehicleHardpointGroup;
      PDCTurrets: VehicleHardpointGroup;
      MissileRacks: VehicleHardpointGroup;
      BombRacks: VehicleHardpointGroup;
      InterdictionHardpoints: {
        EMP?: VehicleHardpointGroup;
        QED?: VehicleHardpointGroup;
      };
      MiningHardpoints: VehicleHardpointGroup;
      SalvageHardpoints: VehicleHardpointGroup;
      UtilityHardpoints: VehicleHardpointGroup;
      UtilityTurrets: VehicleHardpointGroup;
    };
    Components: {
      Propulsion: {
        PowerPlants: VehicleHardpointGroup;
        QuantumDrives: VehicleHardpointGroup;
        Thrusters: {
          MainThrusters: VehicleThrusters;
          RetroThrusters: VehicleThrusters;
          VtolThrusters: VehicleThrusters;
          ManeuveringThrusters: VehicleThrusters;
        };
        QuantumFuelTanks: {
          InstalledItems?: (VehicleHardpointOldItem & { Grade: number; Capacity: number })[];
          ItemsQuantity: number;
          TotalQuantumFuelCapacity: number;
        };
        HydrogenFuelTanks: {
          InstalledItems?: (VehicleHardpointOldItem & { Grade: number; Capacity: number })[];
          ItemsQuantity: number;
          TotalFuelCapacity: number;
        };
      };
      Systems: {
        Controllers: {
          CapacitorAssignment: {
            AfterBurner:
              | {
                  Regen: string;
                  RegenNavMode: string;
                  Usage: string;
                  AngVelocity: { x: number; y: number }[];
                }
              | object;
            ShieldEmitter:
              | {
                  Regen: string;
                  RegenNavMode: string;
                  Resistance: string;
                }
              | object;
            PilotWeapon: object;
            TurretsWeapon: object;
          };
          Ifcs: {
            InstalledItems?: [
              {
                ClassName: string;
                ResourceNetwork: [
                  {
                    Consumption: [
                      {
                        Resource: string;
                        MinConsumptionFraction: number;
                        Segment: number;
                      }
                    ];
                    Signatures: {
                      Electromagnetic: {
                        Nominal: number;
                        DecayRate: number;
                      };
                      Infrared: {
                        Nominal: number;
                        DecayRate: number;
                      };
                    };
                    PowerRanges?: unknown[];
                    State: "Online";
                  }
                ];
              }
            ];
          };
          Missiles: {
            MaxArmed: number;
            Cooldown: number;
          };
          Weapons: {
            PoolSize: number;
            Modifiers?: {
              PowerRatioMultiplier: number;
              MaxAmmoLoadMultiplier: number;
              MaxRegenPerSecMultiplier: number;
            };
          };
          Wheeled: object;
        };
        Shields: VehicleHardpointGroup & { FaceType?: "Bubble" | "Quadrant" };
        Coolers: VehicleHardpointGroup;
        LifeSupport: VehicleHardpointGroup;
        FuelIntakes: {
          InstalledItems?: (VehicleHardpointOldItem & {
            Grade: number;
            FuelIntakeRate: number;
            Power?: VehicleHardpointPower;
            Heat?: VehicleHardpointHeat;
          })[];
          ItemsQuantity: number;
          TotalFuelIntakeRate: number;
        };
        Countermeasures: {
          InstalledItems?: (VehicleHardpointOldItem & {
            Grade: number;
            Ammunition: number;
            Speed: number;
            Range: number;
            Type: "Noise" | "Decoy";
            Power?: VehicleHardpointPower;
          })[];
          ItemsQuantity: number;
        };
      };
      Avionics: {
        FlightBlade: VehicleHardpointGroup;
        Radars: {
          InstalledItems?: (VehiclePort & {
            RemoteController?: { Slaved: boolean; Seats: string[] };
          })[];
          DetectionCapability?: {
            Name: string;
            PortName: string;
            Size: number;
            Sensitivity: {
              IRSensitivity: number;
              EMSensitivity: number;
              CSSensitivity: number;
              RSSensitivity: number;
            };
            GroundSensitivity: {
              IRSensitivity: number;
              EMSensitivity: number;
              CSSensitivity: number;
              RSSensitivity: number;
            };
            Piercing: {
              IRPiercing: number;
              EMPiercing: number;
              CSPiercing: number;
              RSPiercing: number;
            };
          }[];
          ItemsQuantity: number;
        };
        SelfDestruct: {
          InstalledItems?: (VehicleHardpointOldItem & {
            Grade: number;
            Countdown: number;
            Damage: number;
            MinRadius: number;
            MaxRadius: number;
          })[];
          ItemsQuantity: number;
        };
      };
      Modules: VehicleHardpointGroup;
      CargoGrids: {
        InstalledItems?: (VehicleHardpointOldItem & {
          Grade: number;
          Capacity: number;
          GridProperties: {
            Width: number;
            Height: number;
            Depth: number;
            MinContainerSize: {
              Capacity: number;
              Width: number;
              Height: number;
              Depth: number;
            };
            MaxContainerSize: {
              Capacity: number;
              Width: number;
              Height: number;
              Depth: number;
            };
          };
          Power: VehicleHardpointPower;
          Heat: VehicleHardpointHeat;
        })[];
        ItemsQuantity: number;
      };
      CargoContainers: {
        InstalledItems?: (VehicleHardpointOldItem & {
          Grade: number;
          Capacity: number;
          Power: VehicleHardpointPower;
          Heat: VehicleHardpointHeat;
        })[];
        ItemsQuantity: number;
      };
      Storage: {
        InstalledItems?: (VehicleHardpointOldItem & {
          Grade: number;
          Capacity: number;
          Power?: VehicleHardpointPower;
          Heat?: VehicleHardpointHeat;
        })[];
        ItemsQuantity: number;
      };
      WeaponsRacks: {
        InstalledItems?: {
          Name: string;
          Size: number;
          Uneditable: boolean;
          Ports?: {
            Name: string;
            MinSize: number;
            MaxSize: number;
            Uneditable: boolean;
          }[];
        }[];
        ItemsQuantity: number;
      };
      Usables?: {
        InstalledItems?: (VehicleHardpointOldItem & {
          Power: VehicleHardpointPower;
          Heat: VehicleHardpointHeat;
        })[];
        ItemsQuantity: number;
      };
      Paints: VehicleHardpointGroup;
      Flairs: VehicleHardpointGroup;
    };
  };
}

interface VehicleHullPart {
  Name: string;
  MaximumDamage?: number;
  Parts?: VehicleHullPart[];
  ShipDestructionDamage?: number;
  DetachRatio?: number;
}

type VehicleHardpointGroup =
  | {
      InstalledItems?: VehiclePort[];
      Hardpoints: number;
    }
  | object;

interface VehiclePort {
  PortName: string;
  MinSize: number;
  MaxSize: number;
  Loadout: string;
  BaseLoadout: VehicleLoadout;
  Types: string[];
  RequiredTags?: string[];
  Tags?: string[];
  PortTags?: string[];
  Flags?: string[];
  Gimballed?: boolean;
  Uneditable: boolean;
  Ports?: VehiclePort[];
}

interface VehicleLoadout {
  ClassName: string;
  Name: string;
  Type: string;
  Size?: number;
  Grade: number;
  Class: Class | "@LOC_PLACEHOLDER" | "@item_Desc_RADR_Default" | string;
}

type Class = "Military" | "Stealth" | "Civilian" | "Industrial" | "Competition" | "";

interface VehicleThrusters {
  InstalledItems?: (VehicleHardpointOldItem & {
    Grade: number;
    ThrustCapacity: number;
    FuelBurnRatePerMN: number;
    FuelUsagePerSecond: number;
    Durability: VehicleHardpointDurability;
    Power?: VehicleHardpointPower;
    Heat?: VehicleHardpointHeat;
  })[];
  ItemsQuantity: number;
}

interface VehicleHardpointOldItem {
  Name: string;
  Size: number;
  Mass: number;
  Uneditable?: boolean;
}

interface VehicleHardpointDurability {
  Health: number;
}

interface VehicleHardpointPower {
  PowerBase: number;
  PowerDraw: number;
  IdlePowerEmission: number;
  ActivePowerEmission: number;
}

interface VehicleHardpointHeat {
  StartComponentTemperature: number;
  StartIRTemperature: number;
  StartIREmission: number;
  ThermalEnergyBase: number;
  ThermalEnergyDraw: number;
}
