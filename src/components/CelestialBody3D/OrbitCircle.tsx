import * as THREE from "three";

export default function OrbitCircle({
  centerY,
  radius,
  color = "#888",
}: {
  centerY: number;
  radius: number;
  color?: string;
}) {
  // Draw a circle in the XZ plane, centered at (0, centerY, 0)
  const segments = 64;
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    points.push(new THREE.Vector3(x, centerY, z));
  }
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={1} />
    </line>
  );
}
