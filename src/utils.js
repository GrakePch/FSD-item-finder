import itemsNameToKey from "./data/items_name_to_key.json";
import itemsKeyToNameZhHans from "./data/items_key_to_name_zh_Hans.json";
import itemsUex from "./data/items_uex.json";
import vehiclesUex from "./data/vehicles_uex.json";
import i18nLocations from "./data/i18n_locations.json";
import i18nLocationsM from "./data/i18n_locations_manual.json";
import i18nVehicles from "./data/i18n_vehicles.json";
import i18nCategories from "./data/categories_en_to_zh_Hans.json";

export function isAscii(char) {
    const code = char[0].charCodeAt(0);
    return code >= 0 && code <= 127;
}

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
        let sliceIdx = name_en.search("Lagrange");
        let en_slice = name_en.slice(0, sliceIdx - 1);
        return getLocationZhName(en_slice) + " 拉格朗日点 " + en_split[en_split.length - 1];
    }
    return name_en;
}

export function getVehicleZhName(name_en) {
    if (!name_en) return name_en;
    let en = name_en.toLowerCase();
    if (i18nVehicles[en]) return i18nVehicles[en].zh;
    return name_en;
}

export function getCategoryZhName(name_en) {
    if (!name_en) return name_en;
    return i18nCategories[name_en] || name_en;
}

export function getItemUexFormat(id) {
    for (const item of itemsUex) {
        if (item.id === id) {
            return item;
        }
    }
    // console.log("No item found for id: " + id);
    return null;
}

export function getVehicleUEXFormat(id) {
    for (const vehicle of vehiclesUex) {
        if (vehicle.id === id) {
            return vehicle;
        }
    }
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

export function getVehicleUEXFormatBySlug(slug) {
    for (const vehicle of vehiclesUex) {
        if (vehicle.id == slug.slice(2)) {
            return vehicle;
        }
    }
    console.log("No vehicle found for slug: " + slug);
    return null;
}

export function getLocPath(option, tdata) {
    try {
        return tdata[option.id_terminal].location_path;
    } catch (err) {
        console.log(option.id_terminal);
    }
}

export function getVariantsBySlug(slug, itemsData) {
    if (!slug) return [];
    if (!itemsData[slug]) return [];

    let thisName = itemsData[slug].name;
    let thisSubType = itemsData[slug].sub_type;
    if ([
        "Personal Weapons",
        "Undersuits",
        "Helmets",
        "Torso",
        "Arms",
        "Legs",
        "Backpacks",
    ].includes(thisSubType) === false) return [];
    let initial = thisName.split(" ")[0];
    return Object.values(itemsData)
        .filter((item) =>
            item.sub_type === thisSubType && item.name.split(" ")[0] === initial);
}
