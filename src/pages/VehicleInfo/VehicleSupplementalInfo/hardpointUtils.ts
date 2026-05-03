import type { InstalledItem } from "./types";

export const getInstalledItems = <T extends InstalledItem>(
  hardpoints: unknown
): T[] | undefined => {
  if (
    hardpoints &&
    typeof hardpoints === "object" &&
    "InstalledItems" in hardpoints &&
    Array.isArray((hardpoints as { InstalledItems?: unknown }).InstalledItems)
  ) {
    return (hardpoints as { InstalledItems: T[] }).InstalledItems;
  }
  return undefined;
};

export const getItemSize = (item: InstalledItem | undefined) => {
  if (!item) return undefined;
  return "Size" in item ? item.Size : "MaxSize" in item ? item.MaxSize : undefined;
};
