import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import React from "react";

export default function CelestialBodySphere({
  map,
  radius,
  sphereRef,
}: {
  map?: string;
  radius: number;
  sphereRef: React.Ref<THREE.Mesh>;
}) {
  const textureMap = map ? useTexture(map) : undefined;
  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[radius, 64, 32, Math.PI]} />
      {textureMap ? (
        <meshStandardMaterial map={textureMap} />
      ) : (
        <meshStandardMaterial color="#ffffff" />
      )}
    </mesh>
  );
}
