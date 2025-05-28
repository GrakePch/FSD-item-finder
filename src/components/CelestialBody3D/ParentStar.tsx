export function ParentStar({ celestialBody }: { celestialBody: CelestialBody }) {
  if (!celestialBody.parentStar) return null;

  // Calculate relative position in Star Citizen coordinates
  const dx = celestialBody.parentStar.coordinateX - celestialBody.coordinateX;
  const dy = celestialBody.parentStar.coordinateY - celestialBody.coordinateY;
  const dz = celestialBody.parentStar.coordinateZ - celestialBody.coordinateZ;
  // Convert to Three.js coordinates: x := x, y := z, z := -y
  const position: [number, number, number] = [dx, dz, -dy];

  return (
    <mesh position={position}>
      <sphereGeometry args={[celestialBody.parentStar.bodyRadius || 1, 32, 32]} />
      <meshBasicMaterial color="white" />
    </mesh>
  );
}
