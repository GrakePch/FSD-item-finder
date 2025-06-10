import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";

function SurfaceMaterial({
  map,
  mapRoughness,
  mapEmission,
}: {
  map?: string;
  mapRoughness?: string;
  mapEmission?: string;
}) {
  const diffuseMap = map ? useTexture(map) : undefined;
  const roughnessMap = mapRoughness ? useTexture(mapRoughness) : undefined;
  const emissionMap = mapEmission ? useTexture(mapEmission) : undefined;
  return (
    <meshStandardMaterial
      map={diffuseMap}
      roughnessMap={roughnessMap}
      emissiveMap={emissionMap}
      emissiveIntensity={emissionMap ? .3 : 0}
      emissive={emissionMap ? 0xffffdd : null}
    />
  );
}

export default function CelestialBodySphere({
  map,
  mapRoughness,
  mapEmission,
  color,
  radius,
  setApiRef,
}: {
  map?: string;
  mapRoughness?: string;
  mapEmission?: string;
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
          <SurfaceMaterial
            map={map}
            mapRoughness={mapRoughness}
            mapEmission={mapEmission}
          />
        </Suspense>
      ) : (
        <meshStandardMaterial color={color || "#ffffff"} />
      )}
    </mesh>
  );
}
