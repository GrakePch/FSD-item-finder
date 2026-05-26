import generatedMapRaw from "../data/uex_location_vg_location_map.generated.json";
import manualMapRaw from "../data/uex_location_vg_location_map.manual.json";
import locations from "../data/starmap/locations.json";
import locationsEn from "../i18n/locations/en.json";
import locationsZh from "../i18n/locations/zh.json";

export const UEX_LOCATION_TYPES = ["space_station", "outpost", "city", "poi"] as const;

export type UexLocationType = (typeof UEX_LOCATION_TYPES)[number];

export interface UexLocationRef {
  type: UexLocationType;
  id: number;
}

export interface UexLocationMapEntry {
  uex: UexLocationRef;
  vgCode: string;
  i18nKey: string | null;
  source: {
    method: "generated" | "manual";
    uexName?: string;
    vgName?: string;
    terminalIds?: number[];
    note?: string;
  };
}

interface UexLocationMapFile {
  schemaVersion: 1;
  entries: UexLocationMapEntry[];
}

export interface UexLocationMapIndexes {
  entries: UexLocationMapEntry[];
  uexToEntry: Map<string, UexLocationMapEntry>;
  vgToEntries: Map<string, UexLocationMapEntry[]>;
  i18nToEntries: Map<string, UexLocationMapEntry[]>;
}

const validUexLocationTypes = new Set<string>(UEX_LOCATION_TYPES);
const validVgCodes = new Set(locations.map((location) => location.code));
const validI18nKeys = new Set([
  ...Object.keys(locationsEn),
  ...Object.keys(locationsZh),
]);

export function makeUexLocationKey(ref: UexLocationRef): string {
  return `${ref.type}:${ref.id}`;
}

export function getUexLocationRefFromTerminalApi(
  terminal: Pick<
    TerminalApiResponse,
    "id_space_station" | "id_outpost" | "id_city" | "id_poi"
  >
): UexLocationRef | null {
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

function assertMapFile(file: UexLocationMapFile, sourceName: string) {
  if (file.schemaVersion !== 1) {
    throw new Error(`${sourceName} must use schemaVersion 1.`);
  }
  if (!Array.isArray(file.entries)) {
    throw new Error(`${sourceName}.entries must be an array.`);
  }

  for (const entry of file.entries) {
    if (!entry || typeof entry !== "object") {
      throw new Error(`${sourceName} contains a non-object entry.`);
    }
    if (!entry.uex || typeof entry.uex !== "object") {
      throw new Error(`${sourceName} contains an entry without uex.`);
    }
    if (!validUexLocationTypes.has(entry.uex.type)) {
      throw new Error(`${sourceName} contains invalid UEX location type: ${entry.uex.type}.`);
    }
    if (!Number.isInteger(entry.uex.id) || entry.uex.id <= 0) {
      throw new Error(`${sourceName} contains invalid UEX location id: ${entry.uex.id}.`);
    }
    if (!validVgCodes.has(entry.vgCode)) {
      throw new Error(`${sourceName} maps ${makeUexLocationKey(entry.uex)} to unknown VG code ${entry.vgCode}.`);
    }
    if (entry.i18nKey !== null && !validI18nKeys.has(entry.i18nKey)) {
      throw new Error(`${sourceName} maps ${makeUexLocationKey(entry.uex)} to unknown i18n key ${entry.i18nKey}.`);
    }
    if (!entry.source || entry.source.method !== sourceName) {
      throw new Error(`${sourceName} entry ${makeUexLocationKey(entry.uex)} must have source.method "${sourceName}".`);
    }
  }
}

function addToMultiMap(
  map: Map<string, UexLocationMapEntry[]>,
  key: string,
  entry: UexLocationMapEntry
) {
  const entries = map.get(key);
  if (entries) {
    entries.push(entry);
  } else {
    map.set(key, [entry]);
  }
}

export function buildUexLocationMapIndexes(
  generatedFile: UexLocationMapFile = generatedMapRaw as UexLocationMapFile,
  manualFile: UexLocationMapFile = manualMapRaw as UexLocationMapFile
): UexLocationMapIndexes {
  assertMapFile(generatedFile, "generated");
  assertMapFile(manualFile, "manual");

  const uexToEntry = new Map<string, UexLocationMapEntry>();
  for (const entry of generatedFile.entries) {
    uexToEntry.set(makeUexLocationKey(entry.uex), entry);
  }
  for (const entry of manualFile.entries) {
    uexToEntry.set(makeUexLocationKey(entry.uex), entry);
  }

  const entries = [...uexToEntry.values()];
  const vgToEntries = new Map<string, UexLocationMapEntry[]>();
  const i18nToEntries = new Map<string, UexLocationMapEntry[]>();
  const i18nKeyByVgCode = new Map<string, string>();

  for (const entry of entries) {
    addToMultiMap(vgToEntries, entry.vgCode, entry);
    if (!entry.i18nKey) {
      continue;
    }

    const existingI18nKey = i18nKeyByVgCode.get(entry.vgCode);
    if (existingI18nKey && existingI18nKey !== entry.i18nKey) {
      throw new Error(
        `VG code ${entry.vgCode} is mapped to multiple i18n keys: ${existingI18nKey}, ${entry.i18nKey}.`
      );
    }
    i18nKeyByVgCode.set(entry.vgCode, entry.i18nKey);
    addToMultiMap(i18nToEntries, entry.i18nKey, entry);
  }

  return {
    entries,
    uexToEntry,
    vgToEntries,
    i18nToEntries,
  };
}

export const uexLocationMapIndexes = buildUexLocationMapIndexes();

export function getUexLocationMapEntryForTerminalApi(
  terminal: Pick<
    TerminalApiResponse,
    "id_space_station" | "id_outpost" | "id_city" | "id_poi"
  >
): UexLocationMapEntry | null {
  const ref = getUexLocationRefFromTerminalApi(terminal);
  return ref ? uexLocationMapIndexes.uexToEntry.get(makeUexLocationKey(ref)) || null : null;
}
