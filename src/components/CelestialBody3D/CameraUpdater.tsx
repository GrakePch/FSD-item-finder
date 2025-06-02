import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraUpdater({ location, radius }: { location?: SCLocation | null; radius: number }) {
  const { camera } = useThree();
  const animRef = useRef<number | null>(null);
  const prevTarget = useRef<[number, number, number] | null>(null);

  useEffect(() => {
    if (!location) return;
    const { coordinateX: x, coordinateY: y, coordinateZ: z } = location;
    const len = Math.sqrt(x * x + y * y + z * z);
    if (len === 0) return;
    const target = new THREE.Vector3(x, z, -y);
    const start = camera.position.clone();
    const startDir = start.clone().normalize();
    const endDir = target.clone().normalize();
    const distance = camera.position.length();
    const duration = 500; // ms
    let startTime: number | null = null;
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }
    // Reference direction (arbitrary, but [0,0,1] is common)
    const refDir = new THREE.Vector3(0, 0, 1);
    // Quaternion from refDir to startDir
    const quatStart = new THREE.Quaternion().setFromUnitVectors(refDir, startDir);
    // Quaternion from refDir to endDir
    const quatEnd = new THREE.Quaternion().setFromUnitVectors(refDir, endDir);
    function animate(time: number) {
      if (!startTime) startTime = time;
      let t = Math.min((time - startTime) / duration, 1);
      // Ease-out cubic
      t = 1 - Math.pow(1 - t, 3);
      // Slerp between the two quaternions
      const quatCurrent = quatStart.clone().slerp(quatEnd, t);
      // Apply to reference direction
      const currentDir = refDir.clone().applyQuaternion(quatCurrent).normalize();
      camera.position.copy(currentDir.multiplyScalar(distance));
      camera.updateProjectionMatrix();
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    }
    animRef.current = requestAnimationFrame(animate);
    prevTarget.current = [target.x, target.y, target.z];
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [location, radius, camera]);
  return null;
}
