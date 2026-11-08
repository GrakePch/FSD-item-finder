import {
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Color,
  type Material,
  type Object3D,
} from "three";

const glassBaseColors = new WeakMap<MeshStandardMaterial, Color>();
const GLASS_BRIGHTNESS = 0.35;

export function makeGlassOpaque(root: Object3D) {
  const processed = new Set<Material>();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      if (material.userData.family !== "GlassPBR" || processed.has(material)) continue;
      processed.add(material);
      if (material instanceof MeshStandardMaterial) {
        // Scale source linear RGB uniformly, preserving each ship's glass tint.
        // Reapplying this policy must not compound the darkening.
        let baseColor = glassBaseColors.get(material);
        if (!baseColor) {
          baseColor = material.color.clone();
          glassBaseColors.set(material, baseColor);
        }
        material.color.copy(baseColor).multiplyScalar(GLASS_BRIGHTNESS);
      }
      material.transparent = false;
      material.opacity = 1;
      material.alphaTest = 0;
      material.depthWrite = true;
      if (material instanceof MeshPhysicalMaterial) material.transmission = 0;
      material.needsUpdate = true;
    }
  });
}
