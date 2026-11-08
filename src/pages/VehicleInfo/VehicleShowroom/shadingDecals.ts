import {
  AddEquation,
  CustomBlending,
  DstColorFactor,
  Mesh,
  MeshStandardMaterial,
  NoColorSpace,
  OneFactor,
  ZeroFactor,
  type Object3D,
  type Texture,
} from "three";

type ShadingDecal = {
  linear: boolean;
  alphaMultiplier: number;
  falloff: number;
  glowCutoff: number;
  opacity: number;
};

// Match Showroom's sheet-level test: colored artwork and glow carriers must
// retain their normal color blending; only neutral shading sheets multiply.
function classifyShadingPixels(pixels: ArrayLike<number>) {
  let count = 0;
  let saturation = 0;
  let luminance = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;
    const r = pixels[i] / 255;
    const g = pixels[i + 1] / 255;
    const b = pixels[i + 2] / 255;
    saturation += Math.max(r, g, b) - Math.min(r, g, b);
    luminance += (r + g + b) / 3;
    count++;
  }
  return count >= 4 && saturation / count <= 0.02 && luminance / count >= 0.05;
}

export function configureShadingDecals(root: Object3D) {
  const configured = new Set<MeshStandardMaterial>();
  const measured = new Map<Texture, boolean>();
  const originals = new Set<Texture>();
  const clones = new Map<Texture, Texture>();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      if (
        !(material instanceof MeshStandardMaterial) ||
        configured.has(material) ||
        !material.map
      )
        continue;
      const decal = material.userData.shadingDecal as ShadingDecal | undefined;
      if (!decal) continue;
      configured.add(material);
      const original = material.map;
      let shading = measured.get(original);
      if (shading === undefined) {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 32;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) continue;
        context.imageSmoothingQuality = "high";
        context.drawImage(original.image, 0, 0, 32, 32);
        shading = classifyShadingPixels(context.getImageData(0, 0, 32, 32).data);
        measured.set(original, shading);
      }
      if (!shading) continue;
      if (decal.linear && original.colorSpace !== NoColorSpace) {
        let clone = clones.get(original);
        if (!clone) {
          clone = original.clone();
          clone.colorSpace = NoColorSpace;
          clone.needsUpdate = true;
          clones.set(original, clone);
        }
        material.map = clone;
        originals.add(original);
      }
      material.transparent = true;
      material.depthWrite = false;
      material.toneMapped = false;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -1;
      material.polygonOffsetUnits = -1;
      material.blending = CustomBlending;
      material.blendEquation = AddEquation;
      material.blendSrc = DstColorFactor;
      material.blendDst = ZeroFactor;
      material.blendSrcAlpha = ZeroFactor;
      material.blendDstAlpha = OneFactor;
      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, {
          shadingAlphaMultiplier: { value: decal.alphaMultiplier },
          shadingFalloff: { value: decal.falloff },
          shadingGlowCutoff: { value: decal.glowCutoff },
        });
        shader.fragmentShader =
          `uniform float shadingAlphaMultiplier;\nuniform float shadingFalloff;\nuniform float shadingGlowCutoff;\n${shader.fragmentShader}`.replace(
            "#include <opaque_fragment>",
            `
            vec4 shadeSample = texture2D(map, vMapUv);
            float shadeAlpha = shadingGlowCutoff > 0.0 ? clamp(shadeSample.a / shadingGlowCutoff, 0.0, 1.0) : shadeSample.a;
            float shadeBase = max(shadeAlpha * shadingAlphaMultiplier, 0.0);
            float shadeCoverage = shadeBase <= 0.0 ? 0.0 : clamp(pow(shadeBase, shadingFalloff), 0.0, 1.0) * opacity;
            gl_FragColor = vec4(mix(vec3(1.0), diffuseColor.rgb, shadeCoverage), 1.0);
          `
          );
      };
      material.customProgramCacheKey = () => "fsd-shading-decal-v1";
      material.opacity = decal.opacity;
      material.needsUpdate = true;
    }
  });
  // A cloned data texture owns the same bitmap. Release unused GPU textures
  // here, and let normal model disposal close the shared bitmap only once.
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material]) {
      for (const value of Object.values(material))
        if (value && typeof value === "object" && "isTexture" in value)
          originals.delete(value as Texture);
    }
  });
  for (const original of originals) original.dispose();
}
