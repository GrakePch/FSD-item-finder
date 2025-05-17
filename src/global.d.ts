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

type TerminalDictionary = {
  [id: number]: Terminal;
}

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

type CelestialBodyDictionary = {
  [name: string]: CelestialBody;
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

type LocationDictionary = {
  [name: string]: SCLocation;
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
