import { useRef, useState, useEffect } from "react";
import { Euler, Vector3 } from "three";
import {
  getParentStarDeclinationDeg,
  getParentStarLongitudeDeg,
} from "./utilsSunriseSunSetCalc";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry } from "three/src/Three.Core";

interface SubsolarDirectionLineProps {
  celestialBody: CelestialBody;
}

const SubsolarDirectionLine = ({ celestialBody }: SubsolarDirectionLineProps) => {
  const radius = celestialBody.bodyRadius || 1;
  const [vecSubsolar, setVecSubsolar] = useState(() => {
    const declinationDeg = getParentStarDeclinationDeg(celestialBody);
    const longitudeDeg = getParentStarLongitudeDeg(celestialBody);
    const v = new Vector3(2 * radius, 0, 0);
    const euler = new Euler(
      0,
      longitudeDeg * (Math.PI / 180),
      declinationDeg * (Math.PI / 180),
      "XYZ"
    );
    v.applyEuler(euler);
    return v;
  });
  const lastUpdateRef = useRef<number>(0);
  const geometryRef = useRef<BufferGeometry>(null);

  useEffect(() => {
    if (geometryRef.current) {
      const positions = new Float32Array([0, 0, 0, ...vecSubsolar.toArray()]);
      geometryRef.current.setAttribute(
        "position",
        new BufferAttribute(positions, 3)
      );
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  }, [vecSubsolar]);

  useFrame(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current > 100 || lastUpdateRef.current === 0) {
      lastUpdateRef.current = now;
      const declinationDeg = getParentStarDeclinationDeg(celestialBody);
      const longitudeDeg = getParentStarLongitudeDeg(celestialBody);
      const v = new Vector3(2 * radius, 0, 0);
      const euler = new Euler(
        0,
        longitudeDeg * (Math.PI / 180),
        declinationDeg * (Math.PI / 180),
        "XYZ"
      );
      v.applyEuler(euler);
      setVecSubsolar(v);
    }
  });

  return (
    <line>
      <bufferGeometry ref={geometryRef} />
      <lineBasicMaterial color={0xffff99} linewidth={1} />
    </line>
  );
};

export default SubsolarDirectionLine;
