interface SpvVehicleHardpoints {
  ClassName: string;
  Name: string;
  IsSpaceship: boolean;
  IsGravlev?: boolean;
  IsVehicle?: boolean;
  PortTags: string[];
  Hull: { Structure: SpvHullPart[] };
  Hardpoints: {
    Weapons: {
      PilotWeapons: SpvHardpoints;
      MannedTurrets: SpvHardpoints;
      RemoteTurrets: SpvHardpoints;
      PDCTurrets: SpvHardpoints;
      MissileRacks: SpvHardpoints;
      BombRacks: SpvHardpoints;
      InterdictionHardpoints: {
        EMP?: SpvHardpoints;
        QED?: SpvHardpoints;
      };
      MiningHardpoints: SpvHardpoints;
      SalvageHardpoints: SpvHardpoints;
      UtilityHardpoints: SpvHardpoints;
      UtilityTurrets: SpvHardpoints;
    };
    Components: {
      Propulsion: {
        PowerPlants: SpvHardpoints;
        QuantumDrives: SpvHardpoints;
        Thrusters: {
          MainThrusters: SpvThrusters;
          RetroThrusters: SpvThrusters;
          VtolThrusters: SpvThrusters;
          ManeuveringThrusters: SpvThrusters;
        };
        QuantumFuelTanks: {
          InstalledItems?: (SpvHardpointsOldItem & { Grade: number; Capacity: number })[];
          ItemsQuantity: number;
          TotalQuantumFuelCapacity: number;
        };
        HydrogenFuelTanks: {
          InstalledItems?: (SpvHardpointsOldItem & { Grade: number; Capacity: number })[];
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
                  AngVelocity: { x: number; y: number }[6];
                }
              | {};
            ShieldEmitter:
              | {
                  Regen: string;
                  RegenNavMode: string;
                  Resistance: string;
                }
              | {};
            PilotWeapon: {};
            TurretsWeapon: {};
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
          Wheeled: {};
        };
        Shields: SpvHardpoints & { FaceType?: "Bubble" | "Quadrant" };
        Coolers: SpvHardpoints;
        LifeSupport: SpvHardpoints;
        FuelIntakes: {
          InstalledItems?: (SpvHardpointsOldItem & {
            Grade: number;
            FuelIntakeRate: number;
            Power: SpvHardpointPower;
            Heat: SpvHardpointHeat;
          })[];
          ItemsQuantity: number;
          TotalFuelIntakeRate: number;
        };
        Countermeasures: {
          InstalledItems?: (SpvHardpointsOldItem & {
            Grade: number;
            Ammunition: number;
            Speed: number;
            Range: number;
            Type: "Noise" | "Decoy";
            Power: SpvHardpointPower;
          })[];
          ItemsQuantity: number;
        };
      };
      Avionics: {
        FlightBlade: SpvHardpoints;
        Radars: {
          InstalledItems?: (SpvPort & {
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
          InstalledItems?: (SpvHardpointsOldItem & {
            Grade: number;
            Countdown: number;
            Damage: number;
            MinRadius: number;
            MaxRadius: number;
          })[];
          ItemsQuantity: number;
        };
      };
      Modules: SpvHardpoints;
      CargoGrids: {
        InstalledItems?: (SpvHardpointsOldItem & {
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
          Power: SpvHardpointPower;
          Heat: SpvHardpointHeat;
        })[];
        ItemsQuantity: number;
      };
      CargoContainers: {
        InstalledItems?: (SpvHardpointsOldItem & {
          Grade: number;
          Capacity: number;
          Power: SpvHardpointPower;
          Heat: SpvHardpointHeat;
        })[];
        ItemsQuantity: number;
      };
      Storage: {
        InstalledItems?: (SpvHardpointsOldItem & {
          Grade: number;
          Capacity: number;
          Power?: SpvHardpointPower;
          Heat?: SpvHardpointHeat;
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
      Usables: {
        InstalledItems?: (SpvHardpointsOldItem & {
          Power: SpvHardpointPower;
          Heat: SpvHardpointHeat;
        })[];
        ItemsQuantity: number;
      };
      Paints: SpvHardpoints;
      Flairs: SpvHardpoints;
    };
  };
}

interface SpvHullPart {
  Name: string;
  MaximumDamage?: number;
  Parts?: SpvHullPart[];
  ShipDestructionDamage?: number;
  DetachRatio?: number;
}

type SpvHardpoints =
  | {
      InstalledItems?: SpvPort[];
      Hardpoints: number;
    }
  | {};

interface SpvPort {
  PortName: string;
  MinSize: number;
  MaxSize: number;
  Loadout: string;
  BaseLoadout: SpvLoadout;
  Types: string[];
  RequiredTags?: string[];
  Tags?: string[];
  PortTags?: string[];
  Flags?: string[];
  Gimballed?: boolean;
  Uneditable: boolean;
  Ports?: SpvPort[];
}

interface SpvLoadout {
  ClassName: string;
  Name: string;
  Type: string;
  Grade: number;
  Class: Class | "@LOC_PLACEHOLDER" | "@item_Desc_RADR_Default";
}

type Class = "Military" | "Stealth" | "Civilian" | "Industrial" | "Competition" | "";

interface SpvThrusters {
  InstalledItems?: (SpvHardpointsOldItem & {
    Grade: number;
    ThrustCapacity: number;
    FuelBurnRatePerMN: number;
    FuelUsagePerSecond: number;
    Durability: SpvHardpointDurability;
    Power: SpvHardpointPower;
    Heat: SpvHardpointHeat;
  })[];
  ItemsQuantity: number;
}

interface SpvHardpointsOldItem {
  Name: string;
  Size: number;
  Mass: number;
  Uneditable?: boolean;
}

interface SpvHardpointDurability {
  Health: number;
}

interface SpvHardpointPower {
  PowerBase: number;
  PowerDraw: number;
  IdlePowerEmission: number;
  ActivePowerEmission: number;
}

interface SpvHardpointHeat {
  StartComponentTemperature: number;
  StartIRTemperature: number;
  StartIREmission: number;
  ThermalEnergyBase: number;
  ThermalEnergyDraw: number;
}
