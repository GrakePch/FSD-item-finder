import itemsNameToKey from "./data/items_name_to_key.json";
import itemsKeyToNameZhHans from "./data/items_key_to_name_zh_Hans.json";
import itemsUex from "./data/items_uex.json";
import i18nLocations from "./data/i18n_locations.json";
import i18nLocationsM from "./data/i18n_locations_manual.json";

export function getKey(name_en) {
    return itemsNameToKey[name_en];
}

export function getZhHansNameFromKey(key) {
    return itemsKeyToNameZhHans[key] || null;
}

export function getZhHansNameFromEn(name_en) {
    return getZhHansNameFromKey(getKey(name_en));
}

export function getLocationZhName(name_en) {
    if (!name_en) return name_en;
    let en = name_en.toLowerCase();
    if (i18nLocations[en]) return i18nLocations[en].zh;
    if (i18nLocationsM[en]) return i18nLocationsM[en].zh;
    if (name_en.includes("Lagrange")) {
        let en_split = name_en.split(" ");
        return getLocationZhName(en_split[0]) + " 拉格朗日点 "+ en_split[en_split.length - 1];
    }
    return name_en;
}

export function getItemUexFormat(id) {
    for (const item of itemsUex) {
        if (item.id === id) {
            return item;
        }
    }
    console.log("No item found for id: " + id);
    return null;
}

export function getItemUexFormatBySlug(slug) {
    for (const item of itemsUex) {
        if (item.slug === slug) {
            return item;
        }
    }
    console.log("No item found for slug: " + slug);
    return null;
}
