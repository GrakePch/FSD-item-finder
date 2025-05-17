import { createContext } from "react";

// Replace [] and [{}] with appropriate types if you have them
export const AllTerminalsContext = createContext<TerminalDictionary>({});
export const AllItemsPriceContext = createContext<any>({});
export const BodiesAndLocationsContext = createContext<
  [CelestialBodyDictionary, CelestialBodyDictionary, LocationDictionary]
>([{}, {}, {}]);
