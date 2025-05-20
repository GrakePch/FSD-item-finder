// Main data types

interface CelestialBody {
  name: string;
  type: string;
  parentBody: CelestialBody | null;
  parentStar: CelestialBody | null;
  x: number;
  y: number;
  z: number;
  locations: SCLocation[];
  children: CelestialBody[];
}

interface SCLocation {
  name: string;
  type: string;
  parentBody: CelestialBody | null;
  parentStar: CelestialBody | null;
  coordinateX: number;
  coordinateY: number;
  coordinateZ: number;
  wikiLink: string;
  private: number;
  quantum: number;
  terminals: Terminal[];
}

interface Terminal {
  id: number;
  code: string;
  name: string;
  type: string;
  parentLocation: SCLocation | null;
  location_path: string[];
  location: {
    name_star_system: string | null;
    name_planet: string | null;
    name_orbit: string | null;
    name_moon: string | null;
    name_space_station: string | null;
    name_outpost: string | null;
    name_city: string | null;
  };
  name_faction: string | null;
  name_company: string | null;
  is_affinity_influenceable: boolean;
  is_habitation: boolean;
  is_refinery: boolean;
  is_cargo_center: boolean;
  is_medical: boolean;
  is_food: boolean;
  is_shop_fps: boolean;
  is_shop_vehicle: boolean;
  is_refuel: boolean;
  is_repair: boolean;
  is_nqa: boolean;
  is_player_owned: boolean;
  is_auto_load: boolean;
  has_loading_dock: boolean;
  has_docking_port: boolean;
  has_freight_elevator: boolean;
}

interface Vehicle {
  key: string;
  name: string;
  name_zh_Hans: string;
  type: "Vehicle";
  sub_type: "Vehicle";
  id_vehicle: number;
  price_min_max: PriceMinMax;
  options: TradeOption[];
  options_rent: TradeOption[];
}

interface Item {
  key: string;
  name: string;
  name_zh_Hans: string;
  type: string;
  sub_type: string;
  screenshot?: string;
  slug?: string;
  id_item: number;
  price_min_max: PriceMinMax;
  options: TradeOption[];
  attributes?: AttributeDictionary;
}

interface TradeOption {
  id_terminal: number;
  price_buy: number | null;
  price_sell: number | null;
  price_rent: number | null;
  date_modified: number;
  distance?: number;
}

type PriceMinMax = {
  buy_min: number | null;
  buy_max: number | null;
  sell_min: number | null;
  sell_max: number | null;
  rent_min: number | null;
  rent_max: number | null;
};

type AttributeDictionary = { [id_attribute: number]: string };

type ArmorSet = {
  undersuit?: Item | null;
  helmet?: Item | null;
  torso?: Item | null;
  arms?: Item | null;
  legs?: Item | null;
  backpack?: Item | null;
};

type CelestialBodyDictionary = { [name: string]: CelestialBody };
type LocationDictionary = { [name: string]: SCLocation };
type TerminalDictionary = { [id: number]: Terminal };
type ItemDictionary = { [key: string]: Item };
type VehicleDictionary = { [key: string]: Vehicle };

// Utility types

type UexIdI18nTypes = {
  en?: string;
  zh_Hans?: string;
  uex_ids?: (number | string)[];
  type?: string;
  subtype?: string;
};

type KeyToUexIdI18nTypes = { [key: string]: UexIdI18nTypes };

// Intermediary interfaces

interface SimpleItemOptions {
  id_item: number;
  options: TradeOption[];
}

interface SimpleVehicleOptions {
  id_vehicle: number;
  options: TradeOption[];
  options_rent: TradeOption[];
}

type SimpleItemOptionsDictionary = { [id: number]: SimpleItemOptions };
type SimpleVehicleOptionsDictionary = { [id: number]: SimpleVehicleOptions };

// Ships Performances Viewer interfaces
interface SpvVehicleIndex {
  "New Ship"?: string;
  "New Vehicle"?: string;
  ClassName: string;
  Name: string;
  Manufacturer: string;
  Career: string;
  Role: string;
  Size: number;
  Cargo: number;
  Type: "Ship" | "Vehicle" | "Gravlev";
  CommLink: {
    HasCommLink: boolean;
    Date: string;
    Url: string;
  };
  ProgressTracker: {
    Status: "Concept" | "InProd" | "Released" | "OnHold";
    Patch?: string;
    IsOnPT: boolean;
    ID: string;
  };
  Store: {
    Url: string;
    IsPromotionOnly: boolean;
    IsLimitedSale: boolean;
    IsShipOfTheMonth?: boolean;
    ShipOfTheMonth?: string;
    ShipOfTheMonthUrl?: string;
    Buy: number | null;
  };
  PU: {
    Patch?: string | null;
    Date?: string | null;
    HasPerf: boolean;
    IsPTUOnly?: boolean;
    IsPTUBuyOnly?: boolean;
    IsAI?: boolean;
    Buy: number | null;
  };
}

interface SpvVehicleMain {
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
    ExternalStorage: number;
    PersonalInventory: number;
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
    StructureHealthPoints: {
      VitalParts: { [key: string]: number };
      Parts: { [key: string]: number };
    };
    ThrustersHealthPoints?: {
      Main: { [key: string]: number };
      Retro?: { [key: string]: number };
      Vtol?: { [key: string]: number };
      Maneuvering: { [key: string]: number };
    };
  };
  FlightCharacteristics?: SpvFlightCharacteristics;
  FuelManagement?: SpvFuelManagement;
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
  Weapons: {
    PilotWeaponRegenPool: { RegenFillRate: number; AmmoLoad: number };
    TurretsWeaponRegenPool: { RegenFillRate: number; AmmoLoad: number };
    TotalShieldHP: number;
    PilotBurstDPS: number;
    TurretsBurstDPS: number;
    TotalEMPDmg?: number;
    TotalMissilesDmg: number;
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

interface SpvFlightCharacteristics {
  ScmSpeed: number;
  HoverMaxSpeed?: number;
  MaxSpeed: number;
  Pitch: number;
  Yaw: number;
  Roll: number;
  IsVtolAssisted: boolean;
  UseDirectionModifiers: boolean;
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
    X_AccelMultiplicator: number;
    Y_AccelMultiplicator: number;
    Z_AccelMultiplicator: number;
  };
}

interface SpvFuelManagement {
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

// API response interfaces

interface TerminalApiResponse {
  id: number;
  id_star_system: number;
  id_planet: number;
  id_orbit: number;
  id_moon: number;
  id_space_station: number;
  id_outpost: number;
  id_poi: number;
  id_city: number;
  id_faction: number;
  id_company: number;
  name: string;
  nickname: string;
  displayname: string;
  code: string;
  type: string;
  contact_url: string | null;
  screenshot: string;
  screenshot_full: string;
  screenshot_author: string;
  mcs: number;
  is_available: number;
  is_available_live: number;
  is_visible: number;
  is_default_system: number;
  is_affinity_influenceable: number;
  is_habitation: number;
  is_refinery: number;
  is_cargo_center: number;
  is_medical: number;
  is_food: number;
  is_shop_fps: number;
  is_shop_vehicle: number;
  is_refuel: number;
  is_repair: number;
  is_nqa: number;
  is_jump_point: number;
  is_player_owned: number;
  is_auto_load: number;
  has_loading_dock: number;
  has_docking_port: number;
  has_freight_elevator: number;
  game_version: string | null;
  date_added: number;
  date_modified: number;
  star_system_name: string | null;
  planet_name: string | null;
  orbit_name: string | null;
  moon_name: string | null;
  space_station_name: string | null;
  outpost_name: string | null;
  city_name: string | null;
  faction_name: string | null;
  company_name: string | null;
  max_container_size: number;
}

interface ItemUEXApiResponse {
  id: number;
  id_parent: number;
  id_category: number;
  id_vehicle: number;
  name: string;
  date_added: number;
  date_modified: number;
  section: string;
  category: string;
  slug: string;
  url_store: string;
  is_exclusive_pledge: number;
  is_exclusive_subscriber: number;
  is_exclusive_concierge: number;
  screenshot: string;
  attributes: AttributeDictionary;
  notification: any;
}
