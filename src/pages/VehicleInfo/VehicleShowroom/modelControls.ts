import { Light, Mesh, MeshStandardMaterial } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getMainEngineExhausts } from "./thrusterExhausts";

export type VehiclePose = {
  gear: boolean;
  doors: boolean;
  lights: boolean;
  engines: boolean;
  vtol: boolean;
};

export function isThrusterGlow(name: string) {
  return /(?:thruster|engine).*glow|glow.*(?:thruster|engine)/i.test(name);
}

export function getControlClips(model: GLTF) {
  return {
    gear: model.animations.filter((clip) => clip.name === "gear"),
    vtol: model.animations.filter((clip) => clip.name === "vtol"),
    doors: model.animations.filter(
      ({ name }) =>
        name === "ramp" ||
        (/^(?:door|canopy|hatch):/.test(name) &&
          !/fuel|turret|weapon|rack|seat/i.test(name))
    ),
  };
}

export function getModelCapabilities(model: GLTF | null): VehiclePose {
  const capabilities = {
    gear: false,
    doors: false,
    lights: false,
    engines: false,
    vtol: false,
  };
  if (!model) return capabilities;

  const clips = getControlClips(model);
  capabilities.gear = clips.gear.length > 0;
  capabilities.doors = clips.doors.length > 0;
  capabilities.vtol = clips.vtol.length > 0;
  capabilities.engines = getMainEngineExhausts(model.scene).length > 0;
  model.scene.traverse((object) => {
    if (object instanceof Light) capabilities.lights = true;
    if (!(object instanceof Mesh)) return;
    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    if (
      materials.some(
        (material) =>
          material instanceof MeshStandardMaterial && isThrusterGlow(material.name)
      )
    ) {
      capabilities.engines = true;
    }
  });
  return capabilities;
}
