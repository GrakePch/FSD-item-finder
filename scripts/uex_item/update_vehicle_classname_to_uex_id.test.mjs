import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import test from "node:test";
import assert from "node:assert/strict";

const execFileAsync = promisify(execFile);

async function writeJson(path, data) {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

test("Vehicle ClassName to UEX id updater reads vehicle data from JSON", async () => {
  const root = await mkdtemp(join(tmpdir(), "vehicle-classname-uex-"));
  const vehicles = join(root, "vehicle_list.json");
  const vehicleKeyData = join(root, "key_to_uex_ids_and_i18n.json");
  const output = join(root, "vehicle_classname_to_uex_id.json");

  await writeJson(vehicles, [
    { ClassName: "TEST_Ship", Name: "Test Ship" },
    { ClassName: "UNMATCHED_Ship", Name: "Unmatched Ship" },
  ]);
  await writeJson(vehicleKeyData, {
    vehicle_nameTEST_Ship: { uex_ids: ["v-123"] },
    vehicle_nameOTHER_Ship: { uex_ids: ["v-456"] },
  });

  await execFileAsync("node", [
    "scripts/uex_item/update_vehicle_classname_to_uex_id.mjs",
    "--vehicles",
    vehicles,
    "--vehicle-key-data",
    vehicleKeyData,
    "--output",
    output,
    "--unmatched-preview",
    "0",
  ]);

  const result = JSON.parse(await readFile(output, "utf8"));
  assert.deepEqual(result, { TEST_Ship: 123 });
});
