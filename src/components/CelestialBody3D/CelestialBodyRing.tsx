import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

export default function CelestialBodyRing({
  innerRadius,
  outerRadius,
  map,
}: {
  innerRadius: number;
  outerRadius: number;
  map: string;
}) {
  // Load texture
  const ringTexture = useLoader(THREE.TextureLoader, map);

  // Memoize geometry with custom UVs
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 100);
    // Custom UV mapping for ring fade
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      uv.setXY(
        i,
        1,
        v3.length() < (innerRadius + outerRadius) / 2 ? 0 : 1
      );
    }
    return geo;
  }, [innerRadius, outerRadius]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        map={ringTexture}
        side={THREE.DoubleSide}
        transparent
        emissive={0x8cc2ff}
      />
    </mesh>
  );
}

