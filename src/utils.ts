import itemsUex from "./data/items_uex.json";
import location_name_to_i18n_key from "./data/location_name_to_i18n_key.json";
import typeMap from "./data/type_map_full_items.json";
import bodies from "./data/bodies.json";
import uexBodiesFixM from "./data/uex_bodies_fix_manual.json";
import attributes from "./data/categories_attributes.json";

export function isAscii(char: string): boolean {
    const code = char[0].charCodeAt(0);
    return code >= 0 && code <= 127;
}

// Utility to sanitize body/location names to keys for URL usage
export function toUrlKey(str: string): string {
  return str
    ?.replace(/[^a-zA-Z0-9-]+/g, "_") || null;
}

export function locationNameToI18nKey(name: string): string {
    return location_name_to_i18n_key[name] as string || name;
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

export function getUEXAttribute(id) {
    for (const attr of attributes) {
        if (attr.id == id) {
            return attr;
        }
    }
}

export function getAttributeValueByName(name: string, attrDict: AttributeDictionary): string | null {
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

export function getVariants(key: string, itemsData: ItemDictionary) {
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

export function getSet(key: string, itemsData: ItemDictionary) {
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

export const sizeToColor: string[] = [
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

export const classToColor: Record<string, string> = {
    Military: "#258f00",
    Stealth: "#439193",
    Civilian: "#c1af3e",
    Industrial: "#a86834",
    Competition: "#a83434",
};

export const signalToColor: Record<string, string> = {
    Electromagnetic: "#439193",
    Infrared: "#a83434",
    "Cross Section": "#c1a03e",
};

export function getLocalStorageRecent(): string[] {
    let r = localStorage.getItem("recent");
    if (!r) return [];
    return r.split(",").filter(a => a);
}

export function pushLocalStorageRecent(key: string): void {
    let r = getLocalStorageRecent();
    r = r.filter(k => k != key);
    r.unshift(key);
    if (r.length > 5) r = r.slice(0, 5);
    localStorage.setItem("recent", r.join(","));
}

export function clearLocalStorageRecent(): void {
    localStorage.removeItem("recent");
}

export function getVehicleNameNoBrand(spvVehicleIndex: SpvVehicleIndex): string {
  let name = spvVehicleIndex.Name;
  if (name.includes(" ")) {
    name = name.split(" ").slice(1).join(" ");
  }
  return name;
}

export function formatVehicleImageSrc(
  spvVehicleIndex: SpvVehicleIndex,
  view: string = "top"
): string {
  const specialFileName: Record<string, string> = {
    ANVL_Hornet_F7A_Mk1: "f7a-hornet",
    ANVL_Hornet_F7A_Mk2: "f7a-mkii",
    ANVL_Hornet_F7C: "f7c-hornet",
    ANVL_Hornet_F7C_Mk2: "f7c-mkii",
    ANVL_Hornet_F7CM: "f7c-m-super-hornet",
    ANVL_Hornet_F7CM_Heartseeker: "f7c-m-super-hornet-heartseeker",
    AEGS_Retaliator: "retaliator-bomber",
    RSI_Zeus_CL: "zeus-mkii-cl",
    RSI_Zeus_ES: "zeus-mkii-es",
    RSI_Zeus_MR: "zeus-mkii-mr",
    RSI_Polaris_FW: "polaris",
    CNOU_Pionneer: "pioneer",
  };
  const fileNameBeforeProcess =
    specialFileName[spvVehicleIndex.ClassName] || getVehicleNameNoBrand(spvVehicleIndex);
  return `https://ships.42kit.com/resized/${fileNameBeforeProcess
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace("'", "-")
    .replace(".", "-")
    .toLowerCase()
    .trimEnd()
    .replaceAll(" ", "-")}%20${view}.png`;
}

// Type i18n key <-> capitalized string
export const typeKeyToCapitalized = (key: string) =>
  key
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const typeCapitalizedToKey = (capitalized: string | null) =>
  capitalized
    ? capitalized
        .split(" ")
        .map((word) => word.toLowerCase())
        .join("_")
    : "";

export const spvRoleToKey = (role: string) => 
    role.toLowerCase().replaceAll(" ","").replaceAll("/","");

export const toI18nKey = (str: string) => str.normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll("'", "_")
    .replaceAll(".", "_")
    .replaceAll(" ", "_")
    .toLowerCase()
    .trimEnd()
