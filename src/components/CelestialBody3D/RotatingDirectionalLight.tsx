import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getRotationDeg } from "./utils";

export default function RotatingDirectionalLight({
  intensity = 5,
  celestialBody,
}: {
  intensity?: number;
  celestialBody: CelestialBody;
}) {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  // Calculate positions
  const bodyPosition: [number, number, number] = [
    celestialBody.coordinateX,
    celestialBody.coordinateZ,
    -celestialBody.coordinateY,
  ];
  const parentStarPosition: [number, number, number] = celestialBody.parentStar
    ? [
        celestialBody.parentStar.coordinateX,
        celestialBody.parentStar.coordinateZ,
        -celestialBody.parentStar.coordinateY,
      ]
    : [0, 0, 0];
  const lightSourceRelativePosition: [number, number, number] = [
    parentStarPosition[0] - bodyPosition[0],
    parentStarPosition[1] - bodyPosition[1],
    parentStarPosition[2] - bodyPosition[2],
  ];

  // Memoize the base direction vector
  const baseVec = useMemo(() => {
    const v = new THREE.Vector3(...lightSourceRelativePosition);
    if (v.length() === 0) return new THREE.Vector3(100, 0, 0); // fallback
    return v.normalize();
  }, [lightSourceRelativePosition]);

  // Only update the light position every 10 seconds or on first render
  const lastUpdateRef = useRef<number>(0);
  useFrame(() => {
    const now = Date.now();
    if (
      dirLightRef.current &&
      celestialBody.hoursPerCycle &&
      (now - lastUpdateRef.current > 10000 || lastUpdateRef.current === 0)
    ) {
      lastUpdateRef.current = now;
      const deg = -getRotationDeg(
        celestialBody.hoursPerCycle,
        celestialBody.rotationCorrection || 0
      );
      const r = new THREE.Vector3(...lightSourceRelativePosition).length();
      const rad = (deg * Math.PI) / 180;
      // Rotate baseVec around Y axis by rad
      const q = new THREE.Quaternion();
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rad);
      const rotated = baseVec.clone().applyQuaternion(q).multiplyScalar(r);
      dirLightRef.current.position.set(rotated.x, rotated.y, rotated.z);
    }
  });

  return (
    <directionalLight
      ref={dirLightRef}
      position={lightSourceRelativePosition}
      intensity={intensity}
    />
  );
}
