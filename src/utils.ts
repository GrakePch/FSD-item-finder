import itemsUex from "./data/items_uex.json";
import vehiclesUex from "./data/vehicles_uex.json";
import i18nLocations from "./data/i18n_locations.json";
import i18nLocationsM from "./data/i18n_locations_manual.json";
import i18nCategories from "./data/categories_en_to_zh_Hans.json";
import i18nAttributes from "./data/i18n_attributes.json";
import i18nAttributeValues from "./data/i18n_attribute_values.json";
import typeMap from "./data/type_map_full_items.json";
import bodies from "./data/bodies.json";
import uexBodiesFixM from "./data/uex_bodies_fix_manual.json";
import attributes from "./data/categories_attributes.json";

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
    if (en.includes("gateway (")) {
        return i18nLocations[en.slice(0, en.indexOf(" ("))]?.zh || name_en;
    }
    if (en.endsWith(" station")) {
        for (const name of Object.keys(i18nLocations)) {
            if (name.endsWith(en)) return i18nLocations[name].zh;
        }
    }
    return name_en;
}

export function getCategoryZhName(name_en) {
    if (!name_en) return name_en;
    return i18nCategories[name_en] || name_en;
}

export function getItemUexFormat(id: number) {
    for (const item of (itemsUex as ItemUEXApiResponse[])) {
        if (item.id == id) {
            return item;
        }
    }
    // console.log("No item found for id: " + id);
    return null;
}

export function getVehicleUEXFormat(id) {
    for (const vehicle of vehiclesUex) {
        if (vehicle.id == id) {
            return vehicle;
        }
    }
}

export function getUEXAttribute(id) {
    for (const attr of attributes) {
        if (attr.id == id) {
            return attr;
        }
    }
}

export function getAttributeZhName(name) {
    if (!name) return name;
    return i18nAttributes[name] || name;
}

export function getAttributeValueZhName(name) {
    if (!name) return name;
    return i18nAttributeValues[name] || name;
}

export function getAttributeValueByName(name, attrDict) {
    if (!attrDict) return null;
    for (const [k, v] of Object.entries(attrDict)) {
        let attr = getUEXAttribute(k);
        if (attr && attr.name === name) return v;
    }
    return null;
}

/* Map the type in items_uex_ids_and_i18n.json to UEX's type & sub-type */
export function mapToUEXTypeSubType(rawType: string | undefined)
: [string, string] | [null, null] {
    return typeMap[rawType] || [null, null];
}

export function getLocPath(option, tdata) {
    try {
        return tdata[option.id_terminal].location_path;
    } catch (err) {
        console.log(option.id_terminal);
    }
}

export function getVariants(key: string, itemsData: ItemAndVehicleDictionary) {
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
        .sort((a, b) => a.key.localeCompare(b.key))
        .filter((item) =>
            item.sub_type === thisSubType && item.name.split(" ")[0] === initial);
}

export function getSet(key: string, itemsData: ItemAndVehicleDictionary) {
    if (!key) return null;
    if (!itemsData[key]) return null;

    let set: ArmorSet = {};
    for (const str of ["suit", "helmet", "core", "arms", "legs", "backpack"]) {
        if (key.includes(str)) {
            set.undersuit = (itemsData[key.replace(str, "suit")] as Item) || null;
            set.helmet = (itemsData[key.replace(str, "helmet")] as Item) || null;
            set.torso = (itemsData[key.replace(str, "core")] as Item) || null;
            set.arms = (itemsData[key.replace(str, "arms")] as Item) || null;
            set.legs = (itemsData[key.replace(str, "legs")] as Item) || null;
            set.backpack = (itemsData[key.replace(str, "backpack")] as Item) || null;
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

export function getPathTo(loc) {
    const path = [loc.name];
    while (loc.parentBody) {
        if (loc.type === "Lagrange Point")
            loc = loc.parentBody.parentBody;
        else
            loc = loc.parentBody;
        if (loc)
            path.unshift(loc.name);
    }
    return path;
}

export function getPathToTerminal(t) {
    let terminalSplit = t.name.split(" - ").reverse();
    if (terminalSplit.length > 1) terminalSplit.shift();
    return getPathTo(t.parentLocation).concat(terminalSplit)
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

export const date4_0 = 1734670320;

export const sizeToColor = [
    "#6e7881",
    "#258f00",
    "#008f7e",
    "#006dd1",
    "#371cdf",
    "#8022dc",
    "#cc29cf",
    "#ff9900",
    "#ff5c00",
    "#ff3838",
    "#af0000",
    "#ff9900",
    "#ff3838",
];

export const classToColor = {
    Military: "#258f00",
    Stealth: "#439193",
    Civilian: "#c1af3e",
    Industrial: "#a86834",
    Competition: "#a83434",
};

export const signalToColor = {
    Electromagnetic: "#439193",
    Infrared: "#a83434",
    "Cross Section": "#c1a03e",
};

export function getLocalStorageRecent() {
    let r = localStorage.getItem("recent");
    if (!r) return [];
    return r.split(",").filter(a => a);
}

export function pushLocalStorageRecent(key) {
    let r = getLocalStorageRecent();
    r = r.filter(k => k != key);
    r.unshift(key);
    if (r.length > 5) r = r.slice(0, 5);
    localStorage.setItem("recent", r.join(","));
}

export function clearLocalStorageRecent() {
    localStorage.removeItem("recent");
}
