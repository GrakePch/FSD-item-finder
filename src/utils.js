import itemsUex from "./data/items_uex.json";
import vehiclesUex from "./data/vehicles_uex.json";
import i18nLocations from "./data/i18n_locations.json";
import i18nLocationsM from "./data/i18n_locations_manual.json";
import i18nCategories from "./data/categories_en_to_zh_Hans.json";
import uexIdsAndI18n from "./data/items_uex_ids_and_i18n.json";
import bodies from "./data/bodies.json";
import uexBodiesFixM from "./data/uex_bodies_fix_manual.json";

export function isAscii(char) {
    const code = char[0].charCodeAt(0);
    return code >= 0 && code <= 127;
}

export function getLocationZhName(name_en) {
    // return name_en;
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

export function getUexIdListFromKey(key) {
    return uexIdsAndI18n[key].uex_id;
}

export function getKeyFromUexId(id) {
    for (const [key, item] of Object.entries(uexIdsAndI18n))
        for (const uex_id of item.uex_ids)
            if (uex_id == id) return key;
    return null;
}

export function getLocPath(option, tdata) {
    try {
        return tdata[option.id_terminal].location_path;
    } catch (err) {
        console.log(option.id_terminal);
    }
}

export function getVariants(key, itemsData) {
    if (!key) return [];
    if (!itemsData[key]) return [];

    let thisName = itemsData[key].name;
    let thisSubType = itemsData[key].sub_type;
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

export function getSet(key, itemsData) {
    if (!key) return null;
    if (!itemsData[key]) return null;

    let set = {}
    for (const str of ["helmet", "core", "arms", "legs", "backpack"]) {
        if (key.includes(str)) {
            set.helmet = itemsData[key.replace(str, "helmet")] || null;
            set.torso = itemsData[key.replace(str, "core")] || null;
            set.arms = itemsData[key.replace(str, "arms")] || null;
            set.legs = itemsData[key.replace(str, "legs")] || null;
            set.backpack = itemsData[key.replace(str, "backpack")] || null;
            return set;
        }
    }
    return null;
}

function getDistance(v1, v2) {
    return Math.sqrt((v1[0] - v2[0]) ** 2 + (v1[1] - v2[1]) ** 2 + (v1[2] - v2[2]) ** 2);
}

export function getBody(name) {
    /* Manually fix the name difference between UEX and bodies.json */
    let manualFixIfPossible = uexBodiesFixM[name];
    return bodies.find(e => e.name === name)
        || bodies.find(e => e.name === manualFixIfPossible)
        || null;
}

export function getSystems() {
    let systems = {};
    let flattened = {};
    for (const body of bodies) {
        let cbody = structuredClone(body);
        cbody.children = [];
        flattened[cbody.name] = cbody;
        if (!cbody.parentBody) {
            systems[cbody.name] = cbody;
        } else {
            flattened[cbody.parentBody].children.push(cbody);
        }
    }
    return systems;
}

export function getBodiesDistance(b1, b2) {
    let info1 = getBody(b1);
    let info2 = getBody(b2);
    if (!info1 || !info2) return Infinity;
    if ((info1.parentStar || info1.name) !== (info2.parentStar || info2.name)) return Infinity; //TODO: Better calculation for interstellar distance
    return getDistance(
        [info1.x, info1.y, info1.z],
        [info2.x, info2.y, info2.z]
    )
}

export function getTerminalDistance(op, body, tdata) {
    let locPath = getLocPath(op, tdata);
    if (!locPath) return Infinity;
    return getBodiesDistance(locPath[1], body);
}

export function readableDistance(dist) {
    if (dist === 0) return "附近";
    if (dist === Infinity) return "星系外";
    if (dist < 1000) return Math.round(dist * 10) / 10 + " km";
    dist /= 1000;
    if (dist < 1000) return Math.round(dist * 10) / 10 + " Mm";
    dist /= 1000;
    return Math.round(dist * 10) / 10 + " Gm";
}

export function colorPrice(percent100) {
    return `color-mix(in hsl longer hue, hsl(200deg 60% 50%), hsl(0deg 60% 50%) ${percent100}%`
}

export function colorLocationDepth(depth) {
    if (depth == 0) return `#a5a5a5`;
    return `color-mix(in hsl, #ffffff50, #ffffff0d ${((depth - 1) / 3) * 100
        }%)`
}
