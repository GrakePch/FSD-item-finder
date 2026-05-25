import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
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

test("vehicle updater writes raw JSON data files instead of TypeScript data modules", async () => {
  const root = await mkdtemp(join(tmpdir(), "vehicle-data-"));
  const sourceDir = join(root, "source");
  const outputDir = join(root, "out");

  await mkdir(sourceDir, { recursive: true });

  await writeJson(join(sourceDir, "vehicle-main-list.json"), [
    { ClassName: "TEST_Ship", Name: "Test Ship" },
  ]);
  await writeJson(join(sourceDir, "vehicle-basic-list.json"), [
    { ClassName: "TEST_Ship", Name: "Test Ship", Manufacturer: "TEST", Career: "Testing" },
  ]);
  await writeJson(join(sourceDir, "vehicle-hardpoints-list.json"), [
    { ClassName: "TEST_Ship", Name: "Test Ship", Hardpoints: {} },
  ]);
  await writeJson(join(sourceDir, "vehicle-item-list.json"), [
    { className: "QDRV_Test", stdItem: { ClassName: "QDRV_Test", QuantumDrive: {} } },
    { className: "MISC_Test", stdItem: { ClassName: "MISC_Test" } },
  ]);

  await execFileAsync("node", [
    "scripts/vehicle/update_vehicle_data.mjs",
    "--local-source-dir",
    sourceDir,
    "--output-dir",
    outputDir,
  ]);

  const list = JSON.parse(await readFile(join(outputDir, "vehicle_list.json"), "utf8"));
  const index = JSON.parse(await readFile(join(outputDir, "vehicle_index.json"), "utf8"));
  const hardpoints = JSON.parse(await readFile(join(outputDir, "vehicle_hardpoints.json"), "utf8"));
  const essentials = JSON.parse(await readFile(join(outputDir, "vehicle_items_essential.json"), "utf8"));

  assert.equal(list[0].ClassName, "TEST_Ship");
  assert.equal(index[0].ClassName, "TEST_Ship");
  assert.equal(hardpoints[0].ClassName, "TEST_Ship");
  assert.deepEqual(essentials.map((item) => item.className), ["QDRV_Test"]);
  assert.equal(existsSync(join(outputDir, "vehicle_list.ts")), false);
  assert.equal(existsSync(join(outputDir, "vehicle_index.ts")), false);
  assert.equal(existsSync(join(outputDir, "vehicle_hardpoints.ts")), false);
});
