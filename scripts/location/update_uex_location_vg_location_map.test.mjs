import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
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

test("UEX location map updater writes generated entries with nullable i18n keys", async () => {
  const root = await mkdtemp(join(tmpdir(), "uex-location-map-"));
  const output = join(root, "uex_location_vg_location_map.generated.json");
  const manual = join(root, "manual.json");
  const terminals = join(root, "terminals.json");
  const locations = join(root, "locations.json");
  const alias = join(root, "location_alias_to_code.json");
  const nameKeyMap = join(root, "location_name_to_i18n_key.json");
  const locationsEn = join(root, "locations_en.json");
  const locationsZh = join(root, "locations_zh.json");

  await mkdir(root, { recursive: true });
  await writeJson(terminals, [
    {
      id: 10,
      name: "Admin - Area 18",
      id_space_station: 0,
      id_outpost: 0,
      id_city: 1,
      id_poi: 0,
      space_station_name: null,
      outpost_name: null,
      city_name: "Area 18",
      star_system_name: "Stanton",
    },
    {
      id: 11,
      name: "Shop - Test Outpost",
      id_space_station: 0,
      id_outpost: 2,
      id_city: 0,
      id_poi: 0,
      space_station_name: null,
      outpost_name: "Test Outpost",
      city_name: null,
      star_system_name: "Stanton",
    },
    {
      id: 12,
      name: "Admin - Missing",
      id_space_station: 0,
      id_outpost: 0,
      id_city: 0,
      id_poi: 0,
      space_station_name: null,
      outpost_name: null,
      city_name: null,
      star_system_name: "Stanton",
    },
  ]);
  await writeJson(locations, [
    { code: "STANTON/III/area-18", name: "Area 18" },
    { code: "STANTON/I/test-outpost", name: "Test Outpost" },
  ]);
  await writeJson(alias, { Area18: "STANTON/III/area-18" });
  await writeJson(nameKeyMap, { "Test Outpost": "Test_Outpost" });
  await writeJson(locationsEn, { Test_Outpost: "Test Outpost" });
  await writeJson(locationsZh, { Test_Outpost: "测试前哨" });
  await writeJson(manual, { schemaVersion: 1, entries: [] });

  await execFileAsync("node", [
    "scripts/location/update_uex_location_vg_location_map.mjs",
    "--terminals-input",
    terminals,
    "--output",
    output,
    "--manual",
    manual,
    "--locations",
    locations,
    "--location-alias",
    alias,
    "--location-name-key-map",
    nameKeyMap,
    "--locations-en",
    locationsEn,
    "--locations-zh",
    locationsZh,
  ]);

  const generated = JSON.parse(await readFile(output, "utf8"));

  assert.equal(generated.schemaVersion, 1);
  assert.deepEqual(
    generated.entries.map((entry) => [entry.uex.type, entry.uex.id, entry.vgCode, entry.i18nKey]),
    [
      ["outpost", 2, "STANTON/I/test-outpost", "Test_Outpost"],
      ["city", 1, "STANTON/III/area-18", null],
    ],
  );
});

test("UEX location map updater rejects manual entries with invalid i18n keys", async () => {
  const root = await mkdtemp(join(tmpdir(), "uex-location-map-invalid-"));
  const output = join(root, "generated.json");
  const manual = join(root, "manual.json");
  const terminals = join(root, "terminals.json");
  const locations = join(root, "locations.json");
  const emptyJson = join(root, "empty.json");

  await writeJson(terminals, []);
  await writeJson(locations, [{ code: "STANTON/I/test-outpost", name: "Test Outpost" }]);
  await writeJson(emptyJson, {});
  await writeJson(manual, {
    schemaVersion: 1,
    entries: [
      {
        uex: { type: "outpost", id: 2 },
        vgCode: "STANTON/I/test-outpost",
        i18nKey: "Missing_Key",
        source: { method: "manual" },
      },
    ],
  });

  await assert.rejects(
    execFileAsync("node", [
      "scripts/location/update_uex_location_vg_location_map.mjs",
      "--terminals-input",
      terminals,
      "--output",
      output,
      "--manual",
      manual,
      "--locations",
      locations,
      "--location-alias",
      emptyJson,
      "--location-name-key-map",
      emptyJson,
      "--locations-en",
      emptyJson,
      "--locations-zh",
      emptyJson,
    ]),
    /unknown i18n key Missing_Key/,
  );
});
