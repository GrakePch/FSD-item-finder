import { Html } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useState } from "react";
import { Vector3 } from "three";

/* The unit vectors for the orbital markers (OMs) in the three.js's coordinate system. */
export const omCoordinates = [
  [0, +1, 0], // OM-1: +Y
  [0, -1, 0], // OM-2: -Y
  [0, 0, -1], // OM-3: -Z
  [0, 0, +1], // OM-4: +Z
  [+1, 0, 0], // OM-5: +X
  [-1, 0, 0], // OM-6: -X
];

function OMLabel({
  position,
  bodyRadius,
  label,
  color,
}: {
  position: [number, number, number];
  bodyRadius: number;
  label: string;
  color: string;
}) {
  const { camera } = useThree();
  const [occluded, setOccluded] = useState(false);
  const labelPos = new Vector3(...position);

  useFrame(() => {
    const dir = new Vector3();
    camera.getWorldDirection(dir);
    const t = -labelPos.dot(dir);
    const closest = new Vector3().copy(labelPos).add(dir.clone().multiplyScalar(t));
    const dist = closest.length();
    const isBack = dir.dot(labelPos) > 0;
    const shouldOcclude = dist < bodyRadius && isBack;
    if (shouldOcclude !== occluded) setOccluded(shouldOcclude);
  });

  return (
    <Html
      position={position}
      center
      className={`orbital-marker-label${occluded ? " occluded" : ""}`}
      style={{ color }}
      zIndexRange={[500, 0]}
    >
      {label}
    </Html>
  );
}

export function OrbitalMarkers({
  radius,
  omRadius,
  color = "#808080",
}: {
  radius: number;
  omRadius: number;
  color?: string;
}) {
  // Helper to scale coordinates
  const scale = (coord: number[], s: number = omRadius) =>
    coord.map((v) => v * s) as [number, number, number];
  return (
    <>
      {/* 0 to 1 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={
              new Float32Array([...scale(omCoordinates[0]), ...scale(omCoordinates[1])])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={1} />
      </line>
      {/* 2 to 3 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={
              new Float32Array([...scale(omCoordinates[2]), ...scale(omCoordinates[3])])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={1} />
      </line>
      {/* 4 to 5 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={
              new Float32Array([...scale(omCoordinates[4]), ...scale(omCoordinates[5])])
            }
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={1} />
      </line>
      {/* OM labels */}
      {omCoordinates.map((coord, i) => (
        <OMLabel
          key={`om-label-${i}`}
          position={scale(scale(coord), 1.06)}
          bodyRadius={radius}
          label={`OM-${i + 1}`}
          color={color}
        />
      ))}
    </>
  );
}
