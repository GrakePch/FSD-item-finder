export type SearchMode = "items" | "vehicles" | "locations";

export const searchModes: SearchMode[] = ["items", "vehicles", "locations"];

export function getSearchModeFromPath(pathname: string): SearchMode {
  if (pathname.startsWith("/v")) {
    return "vehicles";
  }

  if (
    pathname.startsWith("/l") ||
    pathname.startsWith("/t") ||
    pathname.startsWith("/b")
  ) {
    return "locations";
  }

  return "items";
}

export function getNextSearchMode(mode: SearchMode): SearchMode {
  const index = searchModes.indexOf(mode);
  return searchModes[(index + 1) % searchModes.length];
}
