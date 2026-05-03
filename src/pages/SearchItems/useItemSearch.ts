import { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ContextAllData } from "../../contexts";
import {
  clearLocalStorageRecent,
  getAttributeValueByName,
  getLocalStorageRecent,
  typeKeyToCapitalized,
} from "../../utils";

export const itemFilterTypes = [
  ["systems", "Systems."],
  ["vehicle_weapons", "Vehicle Weapons."],
  ["personal_weapons", "Personal Weapons."],
  ["armor", "Armor."],
];

export const itemSubFilterTypes: Record<string, string[]> = {
  Systems: [
    "power_plants",
    "shield_generators",
    "coolers",
    "quantum_drives",
    "jump_modules",
  ],
  "Vehicle Weapons": [
    "guns",
    "missiles",
    "missile_racks",
    "bombs",
    "turrets",
  ],
  "Personal Weapons": [
    "personal_weapons",
    "attachments",
  ],
  Armor: [
    "undersuits",
    "helmets",
    "torso",
    "arms",
    "legs",
    "backpacks",
  ],
};

const getItemName = (t: TFunction, item: Item, lng?: string) =>
  t(item.key, { ns: "items", lng, defaultValue: item.key });

export function useItemSearch(searchName: string) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dictItems } = useContext(ContextAllData);
  const [recentVersion, setRecentVersion] = useState(0);
  const rawFilterType = searchParams.get("type") || "";
  const shouldFilterBuyable =
    !parseInt(searchParams.get("show_unbuyable") || "0") &&
    Object.values(dictItems).some(
      (item) =>
        item.price_min_max.buy_min ||
        item.price_min_max.sell_min ||
        item.price_min_max.rent_min
    );

  const filterParts = rawFilterType ? rawFilterType.split(".") : [];
  const filterType = filterParts[0] || "";
  const filterSubType = filterParts.length > 1 ? filterParts[1] : "";
  const normalizedSearchName = searchName.trim().toLocaleLowerCase();
  const isSearching = Boolean(normalizedSearchName || rawFilterType);
  const hasLoadedItemPrices = Object.values(dictItems).some(
    (item) =>
      item.price_min_max.buy_min ||
      item.price_min_max.sell_min ||
      item.price_min_max.rent_min
  );

  const resultList = useMemo(() => {
    void recentVersion;
    let tempList: Item[] = [];

    if (isSearching) {
      for (const item of Object.values(dictItems)
        .filter((i) =>
          shouldFilterBuyable
            ? i.price_min_max.buy_min && i.price_min_max.buy_min < Infinity
            : true
        )
        .filter((i) =>
          rawFilterType ? (i.type + "." + i.sub_type).startsWith(rawFilterType) : true
        )) {
        if (
          getItemName(t, item, "en").toLocaleLowerCase().includes(normalizedSearchName) ||
          getItemName(t, item, "zh").toLocaleLowerCase().includes(normalizedSearchName)
        ) {
          tempList.push(item);
        }
      }

      if (tempList.length <= 300) {
        tempList.sort((a, b) =>
          getItemName(t, a, "en").localeCompare(getItemName(t, b, "en"))
        );
      }
    } else {
      tempList = getLocalStorageRecent()
        .map((key) => dictItems[key])
        .filter((item): item is Item => Boolean(item));
    }

    if (rawFilterType.startsWith("Systems.")) {
      tempList
        .sort((a, b) =>
          (getAttributeValueByName("Grade", a.attributes) || "").localeCompare(
            getAttributeValueByName("Grade", b.attributes) || ""
          )
        )
        .sort((a, b) =>
          (getAttributeValueByName("Class", a.attributes) || "").localeCompare(
            getAttributeValueByName("Class", b.attributes) || ""
          )
        )
        .sort(
          (a, b) =>
            (parseInt(getAttributeValueByName("Size", a.attributes) || "") ||
              Infinity) -
            (parseInt(getAttributeValueByName("Size", b.attributes) || "") ||
              Infinity)
        );
    } else if (rawFilterType.startsWith("Vehicle Weapons.")) {
      tempList
        .sort((a, b) =>
          (
            getAttributeValueByName("Tracking Signal", a.attributes) || ""
          ).localeCompare(
            getAttributeValueByName("Tracking Signal", b.attributes) || ""
          )
        )
        .sort(
          (a, b) =>
            (parseInt(getAttributeValueByName("Size", a.attributes) || "") ||
              Infinity) -
            (parseInt(getAttributeValueByName("Size", b.attributes) || "") ||
              Infinity)
        );
    } else if (rawFilterType.startsWith("Personal Weapons.Atta")) {
      tempList.sort(
        (a, b) =>
          (parseInt(getAttributeValueByName("Size", a.attributes) || "") ||
            Infinity) -
          (parseInt(getAttributeValueByName("Size", b.attributes) || "") ||
            Infinity)
      );
    }

    return tempList;
  }, [
    dictItems,
    isSearching,
    normalizedSearchName,
    rawFilterType,
    recentVersion,
    shouldFilterBuyable,
    t,
  ]);

  useEffect(() => {
    if (isSearching) return;
    setRecentVersion((version) => version + 1);
  }, [isSearching]);

  const updateParams = (updater: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams);
    updater(nextParams);
    setSearchParams(nextParams);
  };

  return {
    resultList,
    isSearching,
    filterType,
    filterSubType,
    hasLoadedItemPrices,
    shouldFilterBuyable,
    buyableOnlyChecked: !parseInt(searchParams.get("show_unbuyable") || "0"),
    clearTypeFilter: () => updateParams((params) => params.delete("type")),
    toggleTypeFilter: (type: string) =>
      updateParams((params) => {
        if (params.get("type")?.startsWith(type)) {
          params.delete("type");
        } else {
          params.set("type", type);
        }
      }),
    setSubTypeFilter: (subType: string) =>
      updateParams((params) => {
        params.set("type", `${filterType}.${subType}`);
      }),
    toggleSubTypeFilter: (subTypeKey: string) =>
      updateParams((params) => {
        const subType = typeKeyToCapitalized(subTypeKey);
        if (filterSubType === subType) {
          params.set("type", `${filterType}.`);
        } else {
          params.set("type", `${filterType}.${subType}`);
        }
      }),
    setBuyableOnly: (buyableOnly: boolean) =>
      updateParams((params) => {
        params.set("show_unbuyable", buyableOnly ? "0" : "1");
      }),
    clearRecent: () => {
      clearLocalStorageRecent();
      setRecentVersion((version) => version + 1);
    },
  };
}
