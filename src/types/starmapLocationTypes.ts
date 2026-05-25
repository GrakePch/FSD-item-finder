import type {
  VerseGuideBodyCode,
  VerseGuideCartesianInKm,
  VerseGuideSystemCode,
} from "./starmapBodyTypes";

export type VerseGuideLocationCode = `${VerseGuideBodyCode}/${string}`;

export type VerseGuideLocationType =
  | "abandoned"
  | "antenna"
  | "asteroidbase"
  | "cave"
  | "city"
  | "comm"
  | "crash"
  | "depot"
  | "drug"
  | "farm"
  | "fob"
  | "junkyard"
  | "mining"
  | "onyx"
  | "orbitallaser"
  | "other"
  | "outpost"
  | "platforms"
  | "prison"
  | "race"
  | "research"
  | "river"
  | "ruins"
  | "scramble"
  | "shanty"
  | "shelter"
  | "stash"
  | "station"
  | "ugf"
  | "underground";

export type VerseGuideBeaconType = "Default" | "LandingZone" | "Outpost" | "Station";

export type VerseGuideLocationRestriction =
  | "armistice"
  | "hostile"
  | "nofly"
  | "private"
  | "restricted";

export type VerseGuideLocationFaction =
  | "asd"
  | "blacjac"
  | "citizensforprosperity"
  | "civilians"
  | "covalex"
  | "crusader"
  | "dusters"
  | "firerats"
  | "greycat"
  | "headhunters"
  | "hurston"
  | "mt"
  | "ninetails"
  | "outlaws"
  | "roughready"
  | "sakura"
  | "uee"
  | "xenothreat";

export type VerseGuideLocationFeatureValue =
  | "approach"
  | "atc"
  | "cargo"
  | "defense"
  | "docking"
  | "felevator"
  | "fines"
  | "food"
  | "habitation"
  | "harvestables"
  | "loot"
  | "maintenance"
  | "medical"
  | "minerals"
  | "pads"
  | "refining"
  | "rental"
  | "security"
  | "ships"
  | "shop"
  | "skiosks"
  | "trade"
  | "vehicles";

export type VerseGuideLocationFeatureType =
  | "Capital"
  | "Civilian clothing"
  | "Clinic"
  | "Cryptokeys"
  | "First aid"
  | "First aid (no regen)"
  | "Guards"
  | "Hospital"
  | "Large"
  | "Large port"
  | "Medium"
  | "Mining equipment"
  | "Missiles"
  | "Personal armor"
  | "Personal weapons"
  | "Pharmacy"
  | "Refuel"
  | "Repair"
  | "Restock"
  | "Ship components"
  | "Ship weapons"
  | "Ships"
  | "Ships/Vehicles"
  | "Small"
  | "Small port"
  | "Snub"
  | "Turrets"
  | "by ship"
  | "by vehicle"
  | "large"
  | "on foot";

export type VerseGuideLocationFeature = {
  val: VerseGuideLocationFeatureValue;
  desc: string;
  types?: VerseGuideLocationFeatureType[];
};

export type VerseGuideLocationWeather = {
  low: number;
  high: number;
  average: number;
  count: number;
};

export type VerseGuideLocationJson = {
  code: VerseGuideLocationCode;
  name: string;
  type: VerseGuideLocationType | null;
  designation: string | null;
  restrictions: VerseGuideLocationRestriction[];
  factions: VerseGuideLocationFaction | null;
  features: VerseGuideLocationFeature[];
  weather: VerseGuideLocationWeather | null;
  beaconMarker: boolean;
  beaconType: VerseGuideBeaconType | null;
  parentCode: VerseGuideBodyCode;
  parentStarCode: VerseGuideSystemCode;
  cartesianInKm: VerseGuideCartesianInKm;
};
