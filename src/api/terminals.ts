import uexBodiesFixM from "../data/uex_bodies_fix_manual.json";
import { fetchWithCache } from "./apiFetch";
import { getPathToTerminal, resolveBodyCode } from "../utils";
import { getUexLocationMapEntryForTerminalApi } from "./uexLocationMap";

export async function fetchAndProcessTerminals(dictLocations: LocationDictionary): Promise<TerminalDictionary> {
  const res = await fetchWithCache("terminals", "https://api.uexcorp.space/2.0/terminals");

  const temp = res.data.map((t: TerminalApiResponse): {
    terminal: Terminal;
    parentLocationCode: string | null;
  } => {
    let orbitName = t.orbit_name;
    if (t.star_system_name === "Pyro" && t.orbit_name === "Pyro Jump Point")
      orbitName = "Stanton Jump Point";
    const orbit_name_fix = orbitName
      ? (uexBodiesFixM as Record<string, string>)[orbitName] ||
        resolveBodyCode(orbitName) ||
        orbitName
      : orbitName;
    const locPath3rd = t.name.split(" - ").reverse();
    if (locPath3rd[0] === "Stanton Gateway Station")
      locPath3rd[0] = "Stanton Gateway";
    if (locPath3rd[0] === "Terra Gateway Station") locPath3rd[0] = "Terra Gateway";
    if (locPath3rd[0] === "Orbituary Station") locPath3rd[0] = "Orbituary";
    let locationPath = [t.star_system_name, orbit_name_fix, ...locPath3rd].filter(
      (loc): loc is string => Boolean(loc)
    );
    locationPath = locationPath.filter((loc, idx) =>
      idx > 0 ? loc !== locationPath[idx - 1] : true
    );
    return {
      terminal: {
        id: t.id,
        code: t.code,
        name: t.name,
        type: t.type,
        parentLocation: null,
        location_path: locationPath,
        location: {
          name_star_system: t.star_system_name,
          name_planet: t.planet_name,
          name_orbit: orbit_name_fix,
          name_moon: t.moon_name,
          name_space_station: t.space_station_name,
          name_outpost: t.outpost_name,
          name_city: t.city_name,
        },
        name_faction: t.faction_name,
        name_company: t.company_name,
        is_affinity_influenceable: !!t.is_affinity_influenceable,
        is_habitation: !!t.is_habitation,
        is_refinery: !!t.is_refinery,
        is_cargo_center: !!t.is_cargo_center,
        is_medical: !!t.is_medical,
        is_food: !!t.is_food,
        is_shop_fps: !!t.is_shop_fps,
        is_shop_vehicle: !!t.is_shop_vehicle,
        is_refuel: !!t.is_refuel,
        is_repair: !!t.is_repair,
        is_nqa: !!t.is_nqa,
        is_player_owned: !!t.is_player_owned,
        is_auto_load: !!t.is_auto_load,
        has_loading_dock: !!t.has_loading_dock,
        has_docking_port: !!t.has_docking_port,
        has_freight_elevator: !!t.has_freight_elevator,
      },
      parentLocationCode: getUexLocationMapEntryForTerminalApi(t)?.vgCode || null,
    };
  });
  const tempDict: TerminalDictionary = {};
  for (const { terminal: t, parentLocationCode } of temp) {
    /* Insert Terminal into the dictionary */
    tempDict[t.id] = t;

    /* Set parentLocation and location_path. Push Terminal into the parent location */
    const _parentLocation = parentLocationCode
      ? dictLocations[parentLocationCode]
      : null;
    if (_parentLocation) {
      t.parentLocation = _parentLocation;
      t.location_path = getPathToTerminal(t);
      _parentLocation.terminals.push(t);
    }
  }
  return tempDict;
}
