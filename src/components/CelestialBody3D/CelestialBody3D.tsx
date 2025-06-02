import "./CelestialBody3D.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useRef } from "react";
import CelestialBodySphere from "./CelestialBodySphere";
import LatLongLines from "./LatLongLines";
import OrbitCircle from "./OrbitCircle";
import LocationLabel from "./LocationLabel";
import texture from "../../assets/texture";
import RotatingDirectionalLight from "./RotatingDirectionalLight";
import CelestialBodyRing from "./CelestialBodyRing";
import { OrbitalMarkers } from "./OrbitalMarkers";
import CameraUpdater from "./CameraUpdater";
import { useOrbitInertia } from "./hooks/useOrbitInertia";
import { EffectComposer } from "@react-three/postprocessing";
import CustomPostProcessing from "./CustomPostProcessing";

/** NOTE:
 * The coordinate system used by Star Citizen is Z-up, Y-forward.
 * Transform from SC's coordinate system to Three.js's coordinate system:
 * [Three.js's := Star Citizen's]
 * x := x, y := z, z := -y.
 */

export default function CelestialBody3D({
  celestialBody,
  location,
  layersSetting = {
    showLocationLabels: true,
    showLongitudeLatitudeLines: true,
    showOrbitLines: true,
    showOMs: true,
    showNoQTMarkers: false,
    applyHDMaps: false,
  },
}: {
  celestialBody: CelestialBody;
  location?: SCLocation | null;
  layersSetting: {
    showLocationLabels: boolean;
    showOrbitLines: boolean;
    showLongitudeLatitudeLines: boolean;
    showOMs: boolean;
    showNoQTMarkers: boolean;
    applyHDMaps: boolean;
  };
}) {
  const {
    showLocationLabels,
    showLongitudeLatitudeLines,
    showOrbitLines,
    showOMs,
    showNoQTMarkers,
    applyHDMaps,
  } = layersSetting;
  const bodyTexture = texture.body[celestialBody.name];
  const bodyHDTexture = texture.bodyHD[celestialBody.name];
  const bodyTextureRoughness = texture.roughness[celestialBody.name];
  const radius = celestialBody.bodyRadius || 1;
  const distance = 8 * radius;
  const distanceMax = 16 * radius;
  const distanceMin = 1.5 * radius;
  const cameraPosition: [number, number, number] = [distance, 0, 0];
  const cameraFOVY = (60 / 16) * 9;
  const cameraNear = 0.09 * radius;
  const cameraFar = 20 * radius;
  const themeColor =
    celestialBody.themeColorR && celestialBody.themeColorG && celestialBody.themeColorB
      ? `rgb(${celestialBody.themeColorR}, ${celestialBody.themeColorG}, ${celestialBody.themeColorB})`
      : undefined;
  const needOrbitCircle = (loc: SCLocation) =>
    loc.type === "Space station" ||
    loc.type === "Asteroid base" ||
    loc.type === "CommArray" ||
    loc.type === "Orbital laser platform";
  const controlsRef = useRef<any>(null);
  const sphereApiRef = useRef<{ setRotationTarget: (target: number) => void } | null>(
    null
  );

  // Use custom inertia hook
  const { currentDistance, handleControlsChange, onControlsStart, onControlsEnd } =
    useOrbitInertia({
      controlsRef,
      initialDistance: distance,
      radius,
    });

  const dynamicRotationSpeed = (0.1 * (currentDistance - radius)) / radius;

  return (
    <Canvas key={celestialBody.name} className="CelestialBody3D">
      <PerspectiveCamera
        makeDefault
        position={cameraPosition}
        fov={cameraFOVY}
        near={cameraNear}
        far={cameraFar}
      />
      <CameraUpdater location={location} radius={radius} />
      <ambientLight intensity={0.7} />
      <RotatingDirectionalLight intensity={5} celestialBody={celestialBody} />

      <group>
        <CelestialBodySphere
          map={applyHDMaps && bodyHDTexture ? bodyHDTexture : bodyTexture}
          mapRoughness={bodyTextureRoughness}
          color={themeColor}
          radius={radius}
          setApiRef={(api) => (sphereApiRef.current = api)}
        />
        {showLongitudeLatitudeLines && (
          <LatLongLines radius={radius + 1} color={themeColor} />
        )}
        {/* Render ring*/}
        {celestialBody.ringRadiusInner && celestialBody.ringRadiusOuter && (
          <CelestialBodyRing
            innerRadius={celestialBody.ringRadiusInner}
            outerRadius={celestialBody.ringRadiusOuter}
            map={texture.ring.Yela}
          />
        )}
        {/* Render orbits for space stations and comm arrays */}
        {showOrbitLines &&
          celestialBody.locations &&
          celestialBody.locations
            .filter((loc) => needOrbitCircle(loc))
            .map((loc) => (
              <OrbitCircle
                key={loc.name + "-orbit"}
                centerY={loc.coordinateZ}
                radius={Math.sqrt(loc.coordinateX ** 2 + loc.coordinateY ** 2)}
              />
            ))}
        {/* Render location labels */}
        {showLocationLabels &&
          celestialBody.locations &&
          celestialBody.locations
            .filter((loc) => showNoQTMarkers || loc.quantum != 0)
            .map((loc) => <LocationLabel loc={loc} key={loc.name} bodyRadius={radius} />)}
        {/* Render Orbital Markers */}
        {showOMs && celestialBody.omRadius && (
          <OrbitalMarkers
            radius={radius}
            omRadius={celestialBody.omRadius}
            color={themeColor}
          />
        )}
      </group>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        maxDistance={distanceMax}
        minDistance={distanceMin}
        rotateSpeed={dynamicRotationSpeed}
        onChange={handleControlsChange}
        onStart={onControlsStart}
        onEnd={onControlsEnd}
        dampingFactor={0.2}
      />
      {/* Post-processing composer with custom effect */}
      <EffectComposer>
        <CustomPostProcessing />
      </EffectComposer>
    </Canvas>
  );
}
