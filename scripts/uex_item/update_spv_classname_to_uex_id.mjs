import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const DEFAULT_SPV_VEHICLE_SOURCE = resolve("src/data/vehicles/spv_vehicle_list.json");
const DEFAULT_VEHICLE_KEY_DATA = resolve("src/data/vehicles/key_to_uex_ids_and_i18n.json");
const DEFAULT_OUTPUT = resolve("src/data/vehicles/spv_classname_to_uex_id.json");

const CLASS_NAME_EXCEPTIONS = new Map([
  ["AEGS_Retaliator_Bomber", "AEGS_Retaliator"],
  ["ANVL_Hornet_F7A", "ANVL_Hornet_F7A_Mk1"],
  ["ANVL_Hornet_F7CM_Heartseeker_Mk2", "ANVL_Hornet_F7CM_Mk2_Heartseeker"],
  ["ARGO_MPUV_Tractor", "ARGO_MPUV_1T"],
  ["ESPR_Blade", "VNCL_Blade"],
  ["ESPR_Stinger", "VNCL_Stinger"],
  ["MISC_Starlancer_MAX", "MISC_Starlancer_Max"],
  ["RSI_Scorpius_Interdiction", "RSI_Scorpius_Antares"],
]);

function parseArgs(argv) {
  const options = {
    spvVehicles: DEFAULT_SPV_VEHICLE_SOURCE,
    vehicleKeyData: DEFAULT_VEHICLE_KEY_DATA,
    output: DEFAULT_OUTPUT,
    classNameToKeyOutput: null,
    unmatchedPreview: 40,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--spv-vehicles" && next) {
      options.spvVehicles = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--vehicle-key-data" && next) {
      options.vehicleKeyData = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--output" && next) {
      options.output = resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--class-name-to-key-output" && next) {
      options.classNameToKeyOutput = resolve(next);
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
          "Usage: node scripts/uex_item/update_spv_classname_to_uex_id.mjs [options]",
          "",
          "Options:",
          "  --spv-vehicles <path>              SPV vehicle JSON or legacy TS source. Defaults to src/data/vehicles/spv_vehicle_list.json",
          "  --vehicle-key-data <path>          Vehicle key data JSON. Defaults to src/data/vehicles/key_to_uex_ids_and_i18n.json",
          "  --output <path>                    Output JSON path. Defaults to src/data/vehicles/spv_classname_to_uex_id.json",
          "  --class-name-to-key-output <path>  Optional debug output for the intermediate ClassName-to-key map",
          "  --unmatched-preview <number>       Number of unmatched ClassNames to print. Defaults to 40",
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

async function loadSpvVehicleList(path) {
  const source = await readFile(path, "utf8");

  if (path.endsWith(".json")) {
    return JSON.parse(source);
  }

  const match = source.match(
    /const\s+spvVehicleList[^=]*=\s*([\s\S]*?);\s*export\s+default\s+spvVehicleList/,
  );

  if (!match) {
    throw new Error(`Unable to extract spvVehicleList from ${path}`);
  }

  return JSON.parse(match[1]);
}

function isVehicleNameKey(key) {
  return /^vehicle_name/i.test(key) && !/_short$/i.test(key);
}

function stripVehicleNamePrefix(key) {
  return key.replace(/^vehicle_name/i, "");
}

function normalizeClassNameCandidate(iniKey) {
  let className = iniKey;

  className = className.replace(/,.*/, "");
  className = className.replace(/^Misc_/, "MISC_");
  className = className.replace(/^Grin_/, "GRIN_");
  className = className.replace(/^Banu_/, "BANU_");
  className = className.replace(/^ARGO_Mole$/, "ARGO_MOLE");
  className = className.replace(/^RSI_URSA_Medivac$/, "RSI_Ursa_Medivac");
  className = className.replace(/^XNAA_SantokYai$/, "XNAA_SanTokYai");
  className = className.replace(/^CRUS_([ACE]\d)_Spirit$/, "CRUS_Spirit_$1");
  className = className.replace(/^ANVL_C8R_Pisces_Rescue$/, "ANVL_C8R_Pisces");
  className = className.replace(/^KRIG_L22_Alpha_Wolf$/, "KRIG_L22_AlphaWolf");
  className = className.replace(/^RSI_Aurora_SE$/, "RSI_Aurora_GS_SE");

  return className;
}

function resolveClassNameFromVehicleKey(key, spvClassNameByLower) {
  const normalizedClassName = normalizeClassNameCandidate(stripVehicleNamePrefix(key));
  const exceptionClassName = CLASS_NAME_EXCEPTIONS.get(normalizedClassName);
  const className = exceptionClassName ?? normalizedClassName;

  return spvClassNameByLower.get(className.toLowerCase()) ?? className;
}

function buildClassNameToVehicleKeyMap(vehicleKeyData, spvVehicles) {
  const spvClassNames = new Set(spvVehicles.map((vehicle) => vehicle.ClassName));
  const spvClassNameByLower = new Map(
    spvVehicles.map((vehicle) => [vehicle.ClassName.toLowerCase(), vehicle.ClassName]),
  );
  const classNameToKey = new Map();
  const duplicateClassNames = [];

  for (const key of Object.keys(vehicleKeyData).sort((left, right) => left.localeCompare(right))) {
    if (!isVehicleNameKey(key)) {
      continue;
    }

    const className = resolveClassNameFromVehicleKey(key, spvClassNameByLower);
    if (!spvClassNames.has(className)) {
      continue;
    }

    if (classNameToKey.has(className)) {
      duplicateClassNames.push({
        className,
        existingKey: classNameToKey.get(className),
        ignoredKey: key,
      });
      continue;
    }

    classNameToKey.set(className, key);
  }

  return { classNameToKey, duplicateClassNames };
}

function parseFirstUexVehicleId(entry) {
  const rawId = entry?.uex_ids?.[0];
  if (typeof rawId !== "string") {
    return null;
  }

  const match = rawId.match(/^v-(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function buildSpvClassNameToUexId(vehicleKeyData, spvVehicles, classNameToKey) {
  const result = {};
  const missingIds = [];

  for (const vehicle of [...spvVehicles].sort((left, right) =>
    left.ClassName.localeCompare(right.ClassName),
  )) {
    const key = classNameToKey.get(vehicle.ClassName);
    if (!key) {
      continue;
    }

    const uexId = parseFirstUexVehicleId(vehicleKeyData[key]);
    if (uexId === null) {
      missingIds.push({ className: vehicle.ClassName, key });
      continue;
    }

    result[vehicle.ClassName] = uexId;
  }

  return { result, missingIds };
}

async function writeJson(path, data) {
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function printPreview(label, values, previewLimit, formatValue = (value) => value) {
  console.log(`${label}: ${values.length}`);
  for (const value of values.slice(0, previewLimit)) {
    console.log(`  - ${formatValue(value)}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const [spvVehicles, vehicleKeyData] = await Promise.all([
    loadSpvVehicleList(options.spvVehicles),
    readJson(options.vehicleKeyData),
  ]);

  const { classNameToKey, duplicateClassNames } = buildClassNameToVehicleKeyMap(
    vehicleKeyData,
    spvVehicles,
  );
  const { result, missingIds } = buildSpvClassNameToUexId(
    vehicleKeyData,
    spvVehicles,
    classNameToKey,
  );
  const unmatchedClassNames = spvVehicles
    .map((vehicle) => vehicle.ClassName)
    .filter((className) => !classNameToKey.has(className))
    .sort((left, right) => left.localeCompare(right));

  await writeJson(options.output, result);

  if (options.classNameToKeyOutput) {
    await writeJson(
      options.classNameToKeyOutput,
      Object.fromEntries([...classNameToKey.entries()].sort(([left], [right]) => left.localeCompare(right))),
    );
  }

  console.log(`Updated ${basename(options.output)} with ${Object.keys(result).length} entries`);
  console.log(`SPV vehicles: ${spvVehicles.length}`);
  console.log(`Vehicle key entries: ${Object.keys(vehicleKeyData).length}`);
  console.log(`ClassName-to-key matches: ${classNameToKey.size}`);
  printPreview("Unmatched SPV ClassNames", unmatchedClassNames, options.unmatchedPreview);
  printPreview(
    "Duplicate ClassName key matches",
    duplicateClassNames,
    options.unmatchedPreview,
    (duplicate) =>
      `${duplicate.className}: kept ${duplicate.existingKey}, ignored ${duplicate.ignoredKey}`,
  );
  printPreview(
    "Matched ClassNames without a v-* UEX id",
    missingIds,
    options.unmatchedPreview,
    (missing) => `${missing.className}: ${missing.key}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
