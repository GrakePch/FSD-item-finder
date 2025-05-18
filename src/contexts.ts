import { createContext } from "react";

export type AllData = {
  dictSystems: CelestialBodyDictionary;
  dictCelestialBodies: CelestialBodyDictionary;
  dictLocations: LocationDictionary;
  dictTerminals: TerminalDictionary;
  dictVehicles: VehicleDictionary;
  dictItems: ItemDictionary;
}

export const ContextAllData = createContext<AllData>({
  dictSystems: {},
  dictCelestialBodies: {},
  dictLocations: {},
  dictTerminals: {},
  dictVehicles: {},
  dictItems: {},
});
