const LocationIconColor: Record<string, string> = {
  "Space station": "#ffb600",
  "Space Station": "#ffb600",
  "Landing zone": "#ffb600",
  "Asteroid base": "#ffb600",
  Scrapyard: "#ff8126",
  Racetrack: "#b56aff",
  "Emergency shelter": "#17a773",
  "Distribution center": "#0597ff",
  Landmark: "#b56aff",
  Shipwreck: "#b56aff",
  Prison: "#f74a55",
  Outpost: "#0597ff",
  Ruins: "#a7a59b",
  "Forward operating base": "#0597ff",
  City: "#0597ff",
  "Planetary alignment facility": "#ff8126",
  "Orbital laser platform": "#ff8126",
  antenna: "#ff8126",
  asteroidbase: "#ffb600",
  city: "#0597ff",
  drug: "#0597ff",
  farm: "#0597ff",
  fob: "#0597ff",
  junkyard: "#ff8126",
  mining: "#0597ff",
  orbitallaser: "#ff8126",
  outpost: "#0597ff",
  prison: "#f74a55",
  race: "#b56aff",
  research: "#0597ff",
  shelter: "#17a773",
  stash: "#0597ff",
  station: "#ffb600",
  ugf: "#0597ff",
};

export function getLocationIconColor(
  location: Pick<SCLocation, "type" | "beaconType">
): string {
  if (location.type === "city" && location.beaconType === "LandingZone") {
    return LocationIconColor["Landing zone"];
  }

  return LocationIconColor[location.type] || "#78909c";
}

export default LocationIconColor;
