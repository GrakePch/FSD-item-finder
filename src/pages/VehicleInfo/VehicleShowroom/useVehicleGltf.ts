import { useEffect, useState } from "react";
import { Mesh, Texture, type BufferGeometry, type Material } from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { VehicleModel } from "./modelSource";
import { configureStencilDecals } from "./stencilDecals";
import { configureShadingDecals } from "./shadingDecals";
import { makeGlassOpaque } from "./opaqueGlass";

function disposeModel(model: GLTF) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const bitmaps = new Set<ImageBitmap>();
  model.scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      materials.add(material);
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) {
    for (const value of Object.values(material)) {
      if (value instanceof Texture) textures.add(value);
    }
    material.dispose();
  }
  for (const texture of textures) {
    texture.dispose();
    if (typeof ImageBitmap !== "undefined" && texture.image instanceof ImageBitmap) {
      bitmaps.add(texture.image);
    }
  }
  // Materials and cloned data textures can share one decoded bitmap.
  for (const bitmap of bitmaps) bitmap.close();
}

async function downloadModel(
  source: VehicleModel,
  signal: AbortSignal,
  onProgress: (value: number) => void
) {
  const response = await fetch(source.url, { signal });
  if (!response.ok) throw new Error(`Model request: ${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Model stream unavailable");
  const data = new Uint8Array(source.bytes);
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (length + value.length > source.bytes) throw new Error("Model size mismatch");
      data.set(value, length);
      length += value.length;
      onProgress(Math.min(99, Math.round((length / source.bytes) * 100)));
    }
  } finally {
    reader.releaseLock();
  }
  if (length !== source.bytes) throw new Error("Model size mismatch");
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  if (hash !== source.sha256) throw new Error("Model integrity mismatch");
  signal.throwIfAborted();
  return data.buffer;
}

export default function useVehicleGltf(
  source: VehicleModel,
  attempt: number,
  onError: (error: unknown) => void
) {
  const [loadedModel, setLoadedModel] = useState<{ attempt: number; model: GLTF } | null>(
    null
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const abort = new AbortController();
    let loaded: GLTF | null = null;
    setLoadedModel(null);
    setProgress(0);

    async function load() {
      const data = await downloadModel(source, abort.signal, setProgress);
      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      loaded = await loader.parseAsync(data, "");
      if (abort.signal.aborted) {
        disposeModel(loaded);
        loaded = null;
        return;
      }
      configureStencilDecals(loaded.scene);
      configureShadingDecals(loaded.scene);
      makeGlassOpaque(loaded.scene);
      setLoadedModel({ attempt, model: loaded });
      setProgress(100);
    }

    load().catch((error) => {
      if (loaded) {
        disposeModel(loaded);
        loaded = null;
      }
      if (!abort.signal.aborted) {
        abort.abort();
        onError(error);
      }
    });
    return () => {
      abort.abort();
      if (loaded) disposeModel(loaded);
    };
  }, [source, attempt, onError]);

  return { model: loadedModel?.attempt === attempt ? loadedModel.model : null, progress };
}
