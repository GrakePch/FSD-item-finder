import { Html } from "@react-three/drei";
import * as THREE from "three";

const omScalar = 1.42;
const omCoordinates = [
  [0, +omScalar, 0],
  [0, -omScalar, 0],
  [0, 0, -omScalar],
  [0, 0, +omScalar],
  [+omScalar, 0, 0],
  [-omScalar, 0, 0],
];

export function OrbitalMarkers({
  radius,
  color = "#808080",
  sphereRef,
}: {
  radius: number;
  color?: string;
  sphereRef: React.RefObject<THREE.Mesh>;
}) {
  // Helper to scale coordinates
  const scale = (coord: number[], s: number = radius) =>
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
        <Html
          key={`om-label-${i}`}
          position={scale(scale(coord), 1.06)}
          center
          className="orbital-marker-label"
          style={{ color }}
          occlude={[sphereRef]}
          zIndexRange={[500, 0]}
        >
          {`OM-${i + 1}`}
        </Html>
      ))}
    </>
  );
}
