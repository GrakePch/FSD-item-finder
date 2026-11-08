import { Mesh, MeshStandardMaterial, NoColorSpace, Vector3, type Object3D } from "three";

type StencilDecal = {
  colors: [number[], number[], number[]];
  tiling: number;
  opacity: number;
};

// Native stencil textures hold three signed-distance masks, rather than RGB
// albedo. Decode their coverage with screen-space antialiasing before lighting.
export function configureStencilDecals(root: Object3D) {
  const configured = new Set<MeshStandardMaterial>();
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
      const stencil = material.userData.stencilDecal as StencilDecal | undefined;
      if (!stencil) continue;
      configured.add(material);
      material.map.colorSpace = NoColorSpace;
      material.map.needsUpdate = true;
      material.depthWrite = false;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -1;
      material.polygonOffsetUnits = -1;
      material.onBeforeCompile = (shader) => {
        shader.uniforms.stencilColors = {
          value: stencil.colors.map((color) => new Vector3(...color)),
        };
        shader.uniforms.stencilTiling = { value: stencil.tiling };
        shader.uniforms.stencilOpacity = { value: stencil.opacity };
        shader.fragmentShader = `uniform vec3 stencilColors[3];
uniform float stencilTiling;
uniform float stencilOpacity;
${shader.fragmentShader}`.replace(
          "#include <map_fragment>",
          `
          vec3 distances = texture2D(map, vMapUv * stencilTiling).rgb;
          vec3 coverage = clamp((distances - 0.5) / max(fwidth(distances), vec3(0.0001)) + 0.5, 0.0, 1.0);
          coverage.y *= 1.0 - coverage.x;
          coverage.z *= 1.0 - coverage.x - coverage.y;
          float alpha = coverage.x + coverage.y + coverage.z;
          diffuseColor.rgb *= (stencilColors[0] * coverage.x + stencilColors[1] * coverage.y + stencilColors[2] * coverage.z) / max(alpha, 0.0001);
          diffuseColor.a *= alpha * stencilOpacity;
        `
        );
      };
      material.customProgramCacheKey = () => "fsd-stencil-distance-v1";
      material.needsUpdate = true;
    }
  });
}
