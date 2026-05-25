import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";

const SOURCE_BASE_URL =
  "https://raw.githubusercontent.com/GrakePch/Fancy-Star-Data/main/data/spviewer/live/json";
const SOURCE_TOKEN_ENV = "FANCY_STAR_DATA_TOKEN";
const RETRIES = 3;

const DATASETS = [
  {
    sourceName: "vehicle-main-list.json",
    outputName: "vehicle_list.json",
    compact: false,
  },
  {
    sourceName: "vehicle-basic-list.json",
    outputName: "vehicle_index.json",
    compact: false,
  },
  {
    sourceName: "vehicle-hardpoints-list.json",
    outputName: "vehicle_hardpoints.json",
    compact: true,
  },
];
const VEHICLE_ITEM_SOURCE_NAME = "vehicle-item-list.json";
const VEHICLE_ITEMS_ESSENTIAL_OUTPUT_NAME = "vehicle_items_essential.json";
const MANUAL_SERIES_FILE_NAME = "manual_vehicle_classname_to_series.ts";

function parseArgs(argv) {
  const options = {
    sourceBaseUrl: SOURCE_BASE_URL,
    outputDir: resolve("src/data/vehicles"),
    localSourceDir: null,
    manualSeriesInput: null,
    manualSeriesOutput: null,
    sourceToken: process.env[SOURCE_TOKEN_ENV] ?? null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--source-base-url" && next) {
      options.sourceBaseUrl = next.replace(/\/$/, "");
      index += 1;
      continue;
    }

    if (arg === "--output-dir" && next) {
      options.outputDir = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--local-source-dir" && next) {
      options.localSourceDir = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--manual-series-output" && next) {
      options.manualSeriesOutput = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--manual-series-input" && next) {
      options.manualSeriesInput = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--help") {
      console.log(
        [
          "Usage: node scripts/vehicle/update_vehicle_data.mjs [options]",
          "",
          "Options:",
          "  --source-base-url <url>   Base raw URL for vehicle JSON files.",
          "  --output-dir <path>       Output directory for generated JSON files. Defaults to src/data/vehicles",
          "  --local-source-dir <path> Read source JSON files from a local directory instead of GitHub.",
          "  --manual-series-input <path> Existing manual ClassName-to-series table to preserve values from.",
          "  --manual-series-output <path> Output path for the manual ClassName-to-series table.",
          `  ${SOURCE_TOKEN_ENV}=<token> Read private GitHub source data with this token.`,
        ].join("\n"),
      );
      process.exit(0);
    }
  }

  return options;
}

function sleep(ms) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

async function fetchTextOnce(url, token) {
  const headers = {
    Accept: "application/json,text/plain,*/*",
    "User-Agent": "fsd-item-finder-vehicle-data-updater/1.0",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(60000),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${text.slice(0, 200)}`);
  }

  return text;
}

async function fetchJson(url, token) {
  let lastError = null;

  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      return JSON.parse(await fetchTextOnce(url, token));
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) {
        await sleep(2 ** (attempt - 1) * 1000);
      }
    }
  }

  const tokenHint = token
    ? ""
    : ` If this is a private repository, set ${SOURCE_TOKEN_ENV}.`;
  throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? lastError}.${tokenHint}`);
}

async function loadSourceJson(dataset, options) {
  if (options.localSourceDir) {
    const sourcePath = resolve(options.localSourceDir, dataset.sourceName);
    return JSON.parse(await readFile(sourcePath, "utf8"));
  }

  return fetchJson(`${options.sourceBaseUrl}/${dataset.sourceName}`, options.sourceToken);
}

function validateVehicleArray(dataset, data) {
  if (!Array.isArray(data)) {
    throw new Error(`${dataset.sourceName} must contain a JSON array.`);
  }

  const invalidEntry = data.find(
    (entry) => !entry || typeof entry !== "object" || typeof entry.ClassName !== "string",
  );
  if (invalidEntry) {
    throw new Error(`${dataset.sourceName} contains an entry without a string ClassName.`);
  }
}

function validateVehicleItemArray(data) {
  if (!Array.isArray(data)) {
    throw new Error(`${VEHICLE_ITEM_SOURCE_NAME} must contain a JSON array.`);
  }

  const invalidEntry = data.find(
    (entry) =>
      !entry ||
      typeof entry !== "object" ||
      typeof entry.className !== "string" ||
      !entry.stdItem ||
      typeof entry.stdItem !== "object" ||
      typeof entry.stdItem.ClassName !== "string",
  );
  if (invalidEntry) {
    throw new Error(
      `${VEHICLE_ITEM_SOURCE_NAME} contains an entry without className or stdItem.ClassName.`,
    );
  }
}

function buildJsonFile(dataset, data) {
  return `${JSON.stringify(data, null, dataset.compact ? 0 : 2)}\n`;
}

function hasEssentialVehicleInfo(item) {
  const stdItem = item.stdItem;
  const className = item.className || stdItem.ClassName;
  return (
    Boolean(stdItem.QuantumDrive || stdItem.Radar) ||
    className.startsWith("QDRV_") ||
    className.startsWith("RADR_") ||
    stdItem.ClassName.startsWith("QDRV_") ||
    stdItem.ClassName.startsWith("RADR_")
  );
}

function buildEssentialVehicleItems(vehicleItems) {
  return vehicleItems.filter(hasEssentialVehicleInfo).map((item) => ({
    className: item.className,
    stdItem: item.stdItem,
  }));
}

async function loadExistingManualSeries(path) {
  try {
    const source = await readFile(path, "utf8");
    const entries = new Map();
    const entriesByLowerClassName = new Map();
    const entryPattern = /^\s*([A-Za-z0-9_]+):\s*"([^"]*)",/gm;

    for (const match of source.matchAll(entryPattern)) {
      entries.set(match[1], match[2]);
      entriesByLowerClassName.set(match[1].toLowerCase(), match[2]);
    }

    return { entries, entriesByLowerClassName };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { entries: new Map(), entriesByLowerClassName: new Map() };
    }

    throw error;
  }
}

function buildManualSeriesModule(vehicleData, existingSeries) {
  const lines = [
    "const vehicleClassNameToSeries: Record<string, string> = {",
    ...vehicleData.map((vehicle) => {
      const series =
        existingSeries.entries.get(vehicle.ClassName) ??
        existingSeries.entriesByLowerClassName.get(vehicle.ClassName.toLowerCase()) ??
        "";
      return `  ${vehicle.ClassName}: ${JSON.stringify(series)},`;
    }),
    "};",
    "",
    "export default vehicleClassNameToSeries;",
    "",
  ];

  return lines.join("\n");
}

async function writeText(path, text) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text, "utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let vehicleData = null;
  let vehicleIndexData = null;

  for (const dataset of DATASETS) {
    const data = await loadSourceJson(dataset, options);
    validateVehicleArray(dataset, data);

    const outputPath = resolve(options.outputDir, dataset.outputName);
    await writeText(outputPath, buildJsonFile(dataset, data));
    console.log(`Updated ${basename(outputPath)} with ${data.length} entries`);

    if (dataset.sourceName === "vehicle-main-list.json") {
      vehicleData = data;
    }

    if (dataset.sourceName === "vehicle-basic-list.json") {
      vehicleIndexData = data;
    }
  }

  const manualSeriesOutput =
    options.manualSeriesOutput ?? resolve(options.outputDir, MANUAL_SERIES_FILE_NAME);
  const existingSeries = await loadExistingManualSeries(
    options.manualSeriesInput ?? manualSeriesOutput,
  );
  await writeText(
    manualSeriesOutput,
    buildManualSeriesModule(vehicleIndexData, existingSeries),
  );
  console.log(
    `Updated ${basename(manualSeriesOutput)} with ${vehicleIndexData.length} entries`,
  );

  const vehicleItemData = await loadSourceJson({ sourceName: VEHICLE_ITEM_SOURCE_NAME }, options);
  validateVehicleItemArray(vehicleItemData);
  const essentialVehicleItems = buildEssentialVehicleItems(vehicleItemData);
  const vehicleItemsEssentialOutput = resolve(
    options.outputDir,
    VEHICLE_ITEMS_ESSENTIAL_OUTPUT_NAME,
  );
  await writeText(vehicleItemsEssentialOutput, `${JSON.stringify(essentialVehicleItems)}\n`);
  console.log(
    `Updated ${basename(vehicleItemsEssentialOutput)} with ${essentialVehicleItems.length} entries`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
