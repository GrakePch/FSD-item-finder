import { createContext } from "react";

export const AllTerminalsContext = createContext<TerminalDictionary>({});
export const AllItemsPriceContext = createContext<ItemAndVehicleDictionary>({});
export const BodiesAndLocationsContext = createContext<
  [CelestialBodyDictionary, CelestialBodyDictionary, LocationDictionary]
>([{}, {}, {}]);
