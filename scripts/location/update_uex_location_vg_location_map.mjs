import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

const DEFAULT_TERMINALS_URL = "https://api.uexcorp.space/2.0/terminals";
const DEFAULT_OUTPUT = resolve("src/data/uex_location_vg_location_map.generated.json");
const DEFAULT_MANUAL = resolve("src/data/uex_location_vg_location_map.manual.json");
const DEFAULT_LOCATIONS = resolve("src/data/starmap/locations.json");
const DEFAULT_LOCATION_ALIAS = resolve("src/data/location_alias_to_code.json");
const DEFAULT_LOCATION_NAME_KEY_MAP = resolve("src/data/location_name_to_i18n_key.json");
const DEFAULT_LOCATIONS_EN = resolve("src/i18n/locations/en.json");
const DEFAULT_LOCATIONS_ZH = resolve("src/i18n/locations/zh.json");

const UEX_LOCATION_TYPES = ["space_station", "outpost", "city", "poi"];
const UEX_LOCATION_TYPE_ORDER = new Map(
  UEX_LOCATION_TYPES.map((type, index) => [type, index]),
);

function parseArgs(argv) {
  const options = {
    terminalsUrl: DEFAULT_TERMINALS_URL,
    terminalsInput: null,
    output: DEFAULT_OUTPUT,
    manual: DEFAULT_MANUAL,
    locations: DEFAULT_LOCATIONS,
    locationAlias: DEFAULT_LOCATION_ALIAS,
    locationNameKeyMap: DEFAULT_LOCATION_NAME_KEY_MAP,
    locationsEn: DEFAULT_LOCATIONS_EN,
    locationsZh: DEFAULT_LOCATIONS_ZH,
    unmatchedPreview: 40,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--terminals-url" && next) {
      options.terminalsUrl = next;
      index += 1;
      continue;
    }

    if (arg === "--terminals-input" && next) {
      options.terminalsInput = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--output" && next) {
      options.output = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--manual" && next) {
      options.manual = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--locations" && next) {
      options.locations = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--location-alias" && next) {
      options.locationAlias = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--location-name-key-map" && next) {
      options.locationNameKeyMap = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--locations-en" && next) {
      options.locationsEn = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--locations-zh" && next) {
      options.locationsZh = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--unmatched-preview" && next) {
      options.unmatchedPreview = Number.parseInt(next, 10);
      index += 1;
      continue;
    }

    if (arg === "--help") {
      console.log(
        [
          "Usage: node scripts/location/update_uex_location_vg_location_map.mjs [options]",
          "",
          "Options:",
          "  --terminals-url <url>              UEX terminals API URL.",
          "  --terminals-input <path>           Read terminals JSON from a local file instead of the API.",
          "  --output <path>                    Generated mapping output path.",
          "  --manual <path>                    Manual mapping path to validate and merge.",
          "  --locations <path>                 VerseGuide locations JSON path.",
          "  --location-alias <path>            Legacy/UEX location alias JSON path.",
          "  --location-name-key-map <path>     Location name to i18n key JSON path.",
          "  --locations-en <path>              English location i18n JSON path.",
          "  --locations-zh <path>              Simplified Chinese location i18n JSON path.",
          "  --unmatched-preview <number>       Number of unmatched terminals to print.",
        ].join("\n"),
      );
      process.exit(0);
    }
  }

  return options;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "fsd-item-finder-location-map-updater/1.0",
    },
    signal: AbortSignal.timeout(60000),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${text.slice(0, 200)}`);
  }

  return JSON.parse(text);
}

async function loadTerminals(options) {
  const raw = options.terminalsInput
    ? await readJson(options.terminalsInput)
    : await fetchJson(options.terminalsUrl);
  const terminals = Array.isArray(raw) ? raw : raw.data;

  if (!Array.isArray(terminals)) {
    throw new Error("Terminals source must be an array or an object with a data array.");
  }

  return terminals;
}

function buildUniqueLocationCodeByName(locations) {
  const uniqueLocationCodeByName = new Map();

  for (const location of locations) {
    const existing = uniqueLocationCodeByName.get(location.name);
    if (existing === undefined) {
      uniqueLocationCodeByName.set(location.name, location.code);
    } else if (existing !== location.code) {
      uniqueLocationCodeByName.set(location.name, "");
    }
  }

  return uniqueLocationCodeByName;
}

function normalizeTerminalLocationName(name) {
  if (!name) {
    return null;
  }

  const replacements = {
    "Area 18": "Area18",
    "Green Imperial Housing Exchange": "GrimHEX",
    "Deakins Research": "Deakins Research Outpost",
    "Hickes Research": "Hickes Research Outpost",
    "Private Property": "PRIVATE PROPERTY",
    "HDMS-Anderson": "HDMS Anderson",
    "HDMS-Norgaard": "HDMS Norgaard",
    "Shady Glen": "Shady Glen Farms",
    "Rod's Fuel & Supplies": "Rod's Fuel 'N Supplies",
  };
  let normalized = replacements[name] || name;

  if (/^[A-Za-z]{3}-L\d.*Station$/.test(normalized)) {
    normalized = normalized.slice(normalized.indexOf(" ") + 1);
  }

  return normalized;
}

function getTerminalLocationName(terminal) {
  return normalizeTerminalLocationName(
    terminal.space_station_name || terminal.outpost_name || terminal.city_name,
  );
}

function getTerminalLocationRef(terminal) {
  if (terminal.id_space_station > 0) {
    return { type: "space_station", id: terminal.id_space_station };
  }
  if (terminal.id_outpost > 0) {
    return { type: "outpost", id: terminal.id_outpost };
  }
  if (terminal.id_city > 0) {
    return { type: "city", id: terminal.id_city };
  }
  if (terminal.id_poi > 0) {
    return { type: "poi", id: terminal.id_poi };
  }
  return null;
}

function makeUexLocationKey(ref) {
  return `${ref.type}:${ref.id}`;
}

function resolveLocationCode(nameOrCode, starSystemName, context) {
  if (!nameOrCode) {
    return null;
  }
  if (context.locationsByCode.has(nameOrCode)) {
    return nameOrCode;
  }

  const contextKey = starSystemName ? `${starSystemName}:${nameOrCode}` : null;
  const alias =
    (contextKey ? context.locationAlias[contextKey] : null) ||
    context.locationAlias[nameOrCode];
  if (alias && context.locationsByCode.has(alias)) {
    return alias;
  }

  const uniqueCode = context.uniqueLocationCodeByName.get(nameOrCode);
  return uniqueCode && context.locationsByCode.has(uniqueCode) ? uniqueCode : null;
}

function sortEntries(entries) {
  return entries.sort((left, right) => {
    const typeOrder =
      UEX_LOCATION_TYPE_ORDER.get(left.uex.type) -
      UEX_LOCATION_TYPE_ORDER.get(right.uex.type);
    if (typeOrder !== 0) {
      return typeOrder;
    }
    return left.uex.id - right.uex.id;
  });
}

function buildGeneratedMap(terminals, context) {
  const groups = new Map();
  const unmatchedTerminals = [];

  for (const terminal of terminals) {
    const ref = getTerminalLocationRef(terminal);
    const uexName = getTerminalLocationName(terminal);
    const vgCode = resolveLocationCode(uexName, terminal.star_system_name, context);

    if (!ref || !vgCode) {
      unmatchedTerminals.push({
        terminalId: terminal.id,
        terminalName: terminal.name,
        uexRef: ref ? makeUexLocationKey(ref) : null,
        uexName,
        starSystemName: terminal.star_system_name,
      });
      continue;
    }

    const key = makeUexLocationKey(ref);
    const group = groups.get(key) || {
      ref,
      vgCodes: new Set(),
      terminalIds: [],
      uexNames: new Set(),
    };
    group.vgCodes.add(vgCode);
    group.terminalIds.push(terminal.id);
    if (uexName) {
      group.uexNames.add(uexName);
    }
    groups.set(key, group);
  }

  const conflicts = [];
  const entries = [];
  for (const group of groups.values()) {
    if (group.vgCodes.size > 1) {
      conflicts.push({
        uexRef: makeUexLocationKey(group.ref),
        vgCodes: [...group.vgCodes],
        terminalIds: group.terminalIds,
      });
      continue;
    }

    const vgCode = [...group.vgCodes][0];
    const vgLocation = context.locationsByCode.get(vgCode);
    const i18nKey = context.locationNameKeyMap[vgLocation.name] || null;
    entries.push({
      uex: group.ref,
      vgCode,
      i18nKey,
      source: {
        method: "generated",
        uexName: [...group.uexNames].sort((left, right) => left.localeCompare(right)).join(" / "),
        vgName: vgLocation.name,
        terminalIds: group.terminalIds.sort((left, right) => left - right),
      },
    });
  }

  if (conflicts.length > 0) {
    throw new Error(`Generated mapping has conflicting VG codes: ${JSON.stringify(conflicts, null, 2)}`);
  }

  return {
    mapFile: {
      schemaVersion: 1,
      entries: sortEntries(entries),
    },
    unmatchedTerminals,
  };
}

function validateMapFile(mapFile, sourceName, context) {
  if (mapFile.schemaVersion !== 1) {
    throw new Error(`${sourceName} must use schemaVersion 1.`);
  }
  if (!Array.isArray(mapFile.entries)) {
    throw new Error(`${sourceName}.entries must be an array.`);
  }

  for (const entry of mapFile.entries) {
    const key = entry?.uex ? makeUexLocationKey(entry.uex) : "<missing>";
    if (!entry?.uex || !UEX_LOCATION_TYPES.includes(entry.uex.type)) {
      throw new Error(`${sourceName} contains invalid UEX location type at ${key}.`);
    }
    if (!Number.isInteger(entry.uex.id) || entry.uex.id <= 0) {
      throw new Error(`${sourceName} contains invalid UEX location id at ${key}.`);
    }
    if (!context.locationsByCode.has(entry.vgCode)) {
      throw new Error(`${sourceName} maps ${key} to unknown VG code ${entry.vgCode}.`);
    }
    if (entry.i18nKey !== null && !context.validI18nKeys.has(entry.i18nKey)) {
      throw new Error(`${sourceName} maps ${key} to unknown i18n key ${entry.i18nKey}.`);
    }
    if (!entry.source || entry.source.method !== sourceName) {
      throw new Error(`${sourceName} entry ${key} must have source.method "${sourceName}".`);
    }
  }
}

function validateMergedMap(generatedMap, manualMap) {
  const mergedByUex = new Map();
  for (const entry of generatedMap.entries) {
    mergedByUex.set(makeUexLocationKey(entry.uex), entry);
  }
  for (const entry of manualMap.entries) {
    mergedByUex.set(makeUexLocationKey(entry.uex), entry);
  }

  const i18nKeyByVgCode = new Map();
  for (const entry of mergedByUex.values()) {
    if (!entry.i18nKey) {
      continue;
    }
    const existingI18nKey = i18nKeyByVgCode.get(entry.vgCode);
    if (existingI18nKey && existingI18nKey !== entry.i18nKey) {
      throw new Error(
        `VG code ${entry.vgCode} maps to multiple i18n keys: ${existingI18nKey}, ${entry.i18nKey}.`,
      );
    }
    i18nKeyByVgCode.set(entry.vgCode, entry.i18nKey);
  }

  return [...mergedByUex.values()];
}

function printPreview(label, values, previewLimit, formatValue = (value) => value) {
  console.log(`${label}: ${values.length}`);
  for (const value of values.slice(0, previewLimit)) {
    console.log(`  - ${formatValue(value)}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const [
    terminals,
    locations,
    locationAlias,
    locationNameKeyMap,
    locationsEn,
    locationsZh,
    manualMap,
  ] = await Promise.all([
    loadTerminals(options),
    readJson(options.locations),
    readJson(options.locationAlias),
    readJson(options.locationNameKeyMap),
    readJson(options.locationsEn),
    readJson(options.locationsZh),
    readJson(options.manual),
  ]);

  const context = {
    locationsByCode: new Map(locations.map((location) => [location.code, location])),
    locationAlias,
    uniqueLocationCodeByName: buildUniqueLocationCodeByName(locations),
    locationNameKeyMap,
    validI18nKeys: new Set([...Object.keys(locationsEn), ...Object.keys(locationsZh)]),
  };

  const { mapFile, unmatchedTerminals } = buildGeneratedMap(terminals, context);
  validateMapFile(mapFile, "generated", context);
  validateMapFile(manualMap, "manual", context);
  const mergedEntries = validateMergedMap(mapFile, manualMap);

  await writeJson(options.output, mapFile);

  console.log(`Updated ${basename(options.output)} with ${mapFile.entries.length} entries`);
  console.log(`UEX terminals: ${terminals.length}`);
  console.log(`Merged mapping entries: ${mergedEntries.length}`);
  printPreview(
    "Unmatched terminals",
    unmatchedTerminals,
    options.unmatchedPreview,
    (terminal) =>
      `${terminal.terminalId} ${terminal.terminalName} (${terminal.uexRef ?? "no-ref"}: ${terminal.uexName ?? "no-name"})`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
