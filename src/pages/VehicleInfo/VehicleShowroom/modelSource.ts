import { useEffect, useState } from "react";

export type VehicleModel = { url: string; sha256: string; bytes: number };
type Manifest = { schemaVersion: number; models: Record<string, VehicleModel> };
const base = (
  import.meta.env.VITE_VEHICLE_MODEL_BASE_URL || "https://sc-models.42kit.com/vehicles"
).replace(/\/+$/, "");
const manifestUrl =
  import.meta.env.VITE_VEHICLE_MODEL_MANIFEST_URL || `${base}/manifest.json`;
let cache: { expires: number; value: Promise<Manifest | null> } | undefined;

async function readManifest(url: string): Promise<Manifest> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(12000),
    cache: "no-cache",
  });
  if (!response.ok) throw new Error(`Model index: ${response.status}`);
  const data = await response.json();
  if (data.schemaVersion !== 1 || !data.models || typeof data.models !== "object")
    throw new Error("Invalid model index");
  const models: Manifest["models"] = {};
  for (const [className, raw] of Object.entries(data.models)) {
    const entry = raw as Partial<VehicleModel>;
    if (
      !entry ||
      typeof entry.url !== "string" ||
      typeof entry.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(entry.sha256) ||
      typeof entry.bytes !== "number" ||
      !Number.isSafeInteger(entry.bytes) ||
      entry.bytes <= 0
    )
      continue;
    let resolved: URL;
    try {
      resolved = new URL(entry.url, new URL(url, window.location.href));
    } catch {
      continue;
    }
    if (!["http:", "https:"].includes(resolved.protocol)) continue;
    models[className] = { url: resolved.href, sha256: entry.sha256, bytes: entry.bytes };
  }
  return { schemaVersion: 1, models };
}

export function useVehicleModel(className: string) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  useEffect(() => {
    let active = true;
    if (!cache || cache.expires < Date.now()) {
      cache = {
        expires: Date.now() + 300000,
        value: readManifest(manifestUrl).catch(() => null),
      };
    }
    cache.value.then((value) => {
      if (active) setManifest(value);
    });
    return () => {
      active = false;
    };
  }, []);
  return manifest?.models[className] ?? null;
}
