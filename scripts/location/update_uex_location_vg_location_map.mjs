import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

const DEFAULT_TERMINALS_URL = "https://api.uexcorp.space/2.0/terminals";
const DEFAULT_OUTPUT = resolve("src/data/uex_location_vg_location_map.generated.json");
const DEFAULT_UNMATCHED_OUTPUT = resolve("src/data/uex_location_vg_location_map.unmatched.json");
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
    unmatchedOutput: DEFAULT_UNMATCHED_OUTPUT,
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

    if (arg === "--unmatched-output" && next) {
      options.unmatchedOutput = resolve(next);
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
          "  --unmatched-output <path>          Unmatched review JSON output path.",
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

function getRawTerminalLocationName(terminal) {
  return terminal.space_station_name || terminal.outpost_name || terminal.city_name || null;
}

function getParentheticalBaseName(name) {
  const match = name?.match(/^(.+?) \((.+?)\)$/);
  return match ? match[1] : null;
}

function getTerminalLocationNameCandidates(terminal) {
  const rawName = getRawTerminalLocationName(terminal);
  const candidates = [];

  for (const name of [
    rawName,
    getParentheticalBaseName(rawName),
    normalizeTerminalLocationName(rawName),
  ]) {
    if (name && !candidates.includes(name)) {
      candidates.push(name);
    }
  }

  return candidates;
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

function resolveFactionSuffixedLocationCode(name, starSystemName, context) {
  if (!name || !starSystemName) {
    return null;
  }

  const parentStarCode = starSystemName.toUpperCase();
  const matches = context.locations.filter(
    (location) =>
      location.parentStarCode === parentStarCode &&
      typeof location.name === "string" &&
      location.name.startsWith(`${name} (`),
  );

  return matches.length === 1 ? matches[0].code : null;
}

function resolveTerminalLocation(terminal, context) {
  const rawName = getRawTerminalLocationName(terminal);
  const candidates = getTerminalLocationNameCandidates(terminal);

  for (const name of candidates) {
    const vgCode = resolveLocationCode(name, terminal.star_system_name, context);
    if (vgCode) {
      return { uexName: name, vgCode };
    }
  }

  const factionSuffixedCode = resolveFactionSuffixedLocationCode(
    rawName,
    terminal.star_system_name,
    context,
  );
  if (factionSuffixedCode) {
    return { uexName: rawName, vgCode: factionSuffixedCode };
  }

  return { uexName: rawName, vgCode: null };
}

function normalizeReviewText(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenOverlap(left, right) {
  const leftTokens = new Set(normalizeReviewText(left).split(" ").filter(Boolean));
  const rightTokens = new Set(normalizeReviewText(right).split(" ").filter(Boolean));
  let overlap = 0;

  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(1, Math.min(leftTokens.size, rightTokens.size));
}

function buildCandidateVgLocations(name, starSystemName, context) {
  if (!name) {
    return [];
  }

  const candidatesByCode = new Map();
  const parentStarCode = starSystemName?.toUpperCase() || null;
  const candidateNames = [
    name,
    getParentheticalBaseName(name),
    normalizeTerminalLocationName(name),
  ].filter(Boolean);

  function addCandidate(location, reason) {
    if (!location || candidatesByCode.has(location.code)) {
      return;
    }
    candidatesByCode.set(location.code, {
      code: location.code,
      name: location.name,
      type: location.type,
      parentCode: location.parentCode,
      parentStarCode: location.parentStarCode,
      reason,
    });
  }

  for (const candidateName of candidateNames) {
    const exactMatches = context.locationsByName.get(candidateName) || [];
    for (const location of exactMatches) {
      addCandidate(location, "exact_name");
    }
  }

  for (const location of context.locations) {
    if (parentStarCode && location.parentStarCode !== parentStarCode) {
      continue;
    }

    const locationName = typeof location.name === "string" ? location.name.trim() : "";
    for (const candidateName of candidateNames) {
      const normalizedCandidate = normalizeReviewText(candidateName);
      const normalizedLocationName = normalizeReviewText(locationName);
      if (
        normalizedLocationName.startsWith(`${normalizedCandidate} `) ||
        normalizedCandidate.startsWith(`${normalizedLocationName} `)
      ) {
        addCandidate(location, "name_prefix");
      } else if (tokenOverlap(candidateName, locationName) >= 0.75) {
        addCandidate(location, "token_overlap");
      }
    }
  }

  return [...candidatesByCode.values()]
    .sort((left, right) => left.code.localeCompare(right.code))
    .slice(0, 8);
}

function buildUnmatchedMapFile(terminals, unmatchedTerminals, mergedEntries, context) {
  const matchedTerminalIds = new Set(
    mergedEntries.flatMap((entry) => entry.source.terminalIds || []),
  );
  const mappedUexRefs = new Set(
    mergedEntries.map((entry) => makeUexLocationKey(entry.uex)),
  );
  const groups = new Map();

  for (const unmatched of unmatchedTerminals) {
    if (unmatched.uexRef && mappedUexRefs.has(unmatched.uexRef)) {
      continue;
    }

    const key = unmatched.uexRef || "none";
    const group = groups.get(key) || {
      uex: unmatched.uex,
      uexRef: unmatched.uexRef,
      uexName: unmatched.uexName,
      starSystemName: unmatched.starSystemName,
      terminalIds: [],
      terminalTypes: {},
      candidateVgLocations: buildCandidateVgLocations(
        unmatched.uexName,
        unmatched.starSystemName,
        context,
      ),
    };
    group.terminalIds.push(unmatched.terminalId);
    group.terminalTypes[unmatched.terminalType] =
      (group.terminalTypes[unmatched.terminalType] || 0) + 1;
    groups.set(key, group);
  }

  const entries = [...groups.values()]
    .map((entry) => ({
      ...entry,
      terminalIds: entry.terminalIds.sort((left, right) => left - right),
      terminalTypes: Object.fromEntries(
        Object.entries(entry.terminalTypes).sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      ),
    }))
    .sort((left, right) => {
      const countDiff = right.terminalIds.length - left.terminalIds.length;
      return countDiff || (left.uexRef || "none").localeCompare(right.uexRef || "none");
    });

  const unmatchedTerminalCount = entries.reduce(
    (count, entry) => count + entry.terminalIds.length,
    0,
  );

  return {
    schemaVersion: 1,
    summary: {
      terminalCount: terminals.length,
      matchedTerminalCount: terminals.length - unmatchedTerminalCount,
      unmatchedTerminalCount,
      mappedUexLocationRefCount: mergedEntries.length,
      unmatchedUexLocationRefCount: entries.length,
    },
    entries,
  };
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
    const { uexName, vgCode } = resolveTerminalLocation(terminal, context);

    if (!ref || !vgCode) {
      unmatchedTerminals.push({
        uex: ref,
        terminalId: terminal.id,
        terminalName: terminal.name,
        uexRef: ref ? makeUexLocationKey(ref) : null,
        uexName,
        starSystemName: terminal.star_system_name,
        terminalType: terminal.type,
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
    locations,
    locationsByCode: new Map(locations.map((location) => [location.code, location])),
    locationsByName: new Map(),
    locationAlias,
    uniqueLocationCodeByName: buildUniqueLocationCodeByName(locations),
    locationNameKeyMap,
    validI18nKeys: new Set([...Object.keys(locationsEn), ...Object.keys(locationsZh)]),
  };
  for (const location of locations) {
    const matches = context.locationsByName.get(location.name) || [];
    matches.push(location);
    context.locationsByName.set(location.name, matches);
  }

  const { mapFile, unmatchedTerminals } = buildGeneratedMap(terminals, context);
  validateMapFile(mapFile, "generated", context);
  validateMapFile(manualMap, "manual", context);
  const mergedEntries = validateMergedMap(mapFile, manualMap);
  const unmatchedMapFile = buildUnmatchedMapFile(
    terminals,
    unmatchedTerminals,
    mergedEntries,
    context,
  );

  await writeJson(options.output, mapFile);
  await writeJson(options.unmatchedOutput, unmatchedMapFile);

  console.log(`Updated ${basename(options.output)} with ${mapFile.entries.length} entries`);
  console.log(
    `Updated ${basename(options.unmatchedOutput)} with ${unmatchedMapFile.entries.length} entries`,
  );
  console.log(`UEX terminals: ${terminals.length}`);
  console.log(`Merged mapping entries: ${mergedEntries.length}`);
  console.log(`Unmatched terminals: ${unmatchedMapFile.summary.unmatchedTerminalCount}`);
  printPreview(
    "Unmatched location refs",
    unmatchedMapFile.entries,
    options.unmatchedPreview,
    (entry) =>
      `${entry.uexRef ?? "no-ref"} ${entry.uexName ?? "no-name"} (${entry.terminalIds.length} terminals)`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
