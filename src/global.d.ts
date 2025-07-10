// Main data types

interface CelestialBody {
  name: string;
  type: string;
  ordinal?: string;
  parentBody: CelestialBody | null;
  parentStar: CelestialBody | null;
  coordinateX: number;
  coordinateY: number;
  coordinateZ: number;
  quaternionW: number;
  quaternionX: number;
  quaternionY: number;
  quaternionZ: number;
  bodyRadius: number;
  omRadius?: number;
  hoursPerCycle?: number;
  rotationCorrection?: number;
  orbitAngle?: number;
  orbitRadius?: number;
  themeColorR?: number;
  themeColorG?: number;
  themeColorB?: number;
  locations: SCLocation[];
  children: CelestialBody[];
  ringRadiusInner?: number;
  ringRadiusOuter?: number;
  surfacePressureAtm?: number;
  atmosphereHeightM?: number;
  colorSkyNoon?: string;
  colorSkyHorizon?: string;
  colorSkyNight?: string;
  atmosphereColorOverrideCoefficient?: number;
  atmosphereWaveLengthR?: number;
  atmosphereWaveLengthG?: number;
  atmosphereWaveLengthB?: number;
  atmosphereScatteringStrength?: number;
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

type CelestialBodyType = "Star" | "Planet" | "Moon" | "Lagrange Point" | "Jump Point";

type SCLocationType =
  | "Ruins"
  | "Underground bunker"
  | "Outpost"
  | "City"
  | "Landing zone"
  | "Emergency shelter"
  | "Settlement"
  | "Space station"
  | "Space Station"
  | "Landmark"
  | "Scrapyard"
  | "CommArray"
  | "Asteroid base"
  | "Cave"
  | "Shipwreck"
  | "Prison"
  | "Racetrack"
  | "Distribution center"
  | "Asteroid cluster"
  | "Forward operating base"
  | "Planetary alignment facility"
  | "Orbital laser platform"
  | "Depot";

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

type KeyToUexId = { [key: string]: { id?: number[] } };

type KeyWithTypesInfo = { key: string; Type: string; SubType: string }[];

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
    Status: "Concept" | "InProd" | "Released" | "OnHold" | "NextPatch";
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
