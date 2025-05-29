import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";

function SurfaceMaterial({ map, mapRoughness }: { map?: string; mapRoughness?: string }) {
  const diffuseMap = map ? useTexture(map) : undefined;
  const roughnessMap = mapRoughness ? useTexture(mapRoughness) : undefined;
  return <meshStandardMaterial map={diffuseMap} roughnessMap={roughnessMap} />;
}

export default function CelestialBodySphere({
  map,
  mapRoughness,
  color,
  radius,
  setApiRef,
}: {
  map?: string;
  mapRoughness?: string;
  color?: string;
  radius: number;
  setApiRef?: (api: { setRotationTarget: (target: number) => void }) => void;
}) {
  // Store current and target rotation for inertia
  const rotationRef = useRef({ current: 0, target: 0, velocity: 0 });

  // Expose API to parent for setting rotation target
  useEffect(() => {
    if (setApiRef) {
      setApiRef({
        setRotationTarget: (target: number) => {
          rotationRef.current.target = target;
        },
      });
    }
  }, [setApiRef]);

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 32, Math.PI]} />
      {map ? (
        <Suspense fallback={<meshStandardMaterial color={color || "#ffffff"} />}>
          <SurfaceMaterial map={map} mapRoughness={mapRoughness} />
        </Suspense>
      ) : (
        <meshStandardMaterial color={color || "#ffffff"} />
      )}
    </mesh>
  );
}
