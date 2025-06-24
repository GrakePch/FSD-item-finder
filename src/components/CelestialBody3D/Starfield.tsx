import { Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { degToRad, sphericalToCartesian } from "./utils";
import { Points as ThreePoints } from "three";

export default function Starfield({
  amount = 1000,
  rotateYDeg = 0,
}: {
  amount?: number;
  rotateYDeg?: number;
}) {
  const pointsRef = useRef<ThreePoints>(null);
  const { camera } = useThree();

  // Generate star positions
  const positions = useMemo(() => {
    const vertices: number[] = [];
    const random = Math.random; // TODO: use a seedable random number generator
    for (let i = 0; i < amount; i++) {
      let theta = random() * 2.0 * Math.PI;
      let phi = Math.acos(2.0 * random() - 1.0);
      let r = 1000;
      let pos = sphericalToCartesian(r, theta, phi);
      vertices.push(...pos);
    }
    return new Float32Array(vertices);
  }, [amount]);

  // Keep the starfield centered on the camera
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.position.copy(camera.position);
      pointsRef.current.rotation.y = degToRad(rotateYDeg);
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} frustumCulled={false}>
      <PointMaterial color="#fff" size={2} opacity={1} depthWrite={false} />
    </Points>
  );
}
