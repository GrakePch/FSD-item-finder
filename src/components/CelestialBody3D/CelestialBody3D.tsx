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
import SubsolarDirectionLine from "./SubsolarDirectionLine";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useParentStarRotation } from "./useParentStarRotation";
import { scToThree } from "./utils";
import { Vector3 } from "three";
import Atmosphere from "./post_processings/Atmosphere";
import { hexColorToVector3, isLocationDisplayHidden } from "../../utils";
import Starfield from "./Starfield";

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
    showSubsolarDirection: true,
    showNoQTMarkers: false,
    applyHDMaps: false,
    applyRealisticAtmosphere: false,
  },
}: {
  celestialBody: CelestialBody;
  location?: SCLocation | null;
  layersSetting: Record<string, boolean>;
}) {
  const {
    showLocationLabels,
    showLongitudeLatitudeLines,
    showOrbitLines,
    showOMs,
    showSubsolarDirection,
    showNoQTMarkers,
    applyHDMaps,
    applyRealisticAtmosphere,
  } = layersSetting;
  const bodyTexture = texture.body[celestialBody.name];
  const bodyHDTexture = texture.bodyHD[celestialBody.name];
  const bodyTextureRoughness = texture.roughness[celestialBody.name];
  const bodyTextureEmission = texture.emission[celestialBody.name];
  const bodyTextureNormal = texture.normal[celestialBody.name];
  const renderData = celestialBody.renderData;
  const radius = celestialBody.bodyRadiusInKm || 1;
  const distance = 5 * radius;
  const distanceMax = 16 * radius;
  const distanceMin = 1.5 * radius;
  const cameraPosition: [number, number, number] = [distance, 0, 0];
  const cameraFOVY = (60 / 16) * 9;
  const cameraNear = 0.09 * radius;
  const cameraFar = 70000000;
  const themeColor =
    renderData?.themeColorR && renderData.themeColorG && renderData.themeColorB
      ? `rgb(${renderData.themeColorR}, ${renderData.themeColorG}, ${renderData.themeColorB})`
      : undefined;
  const atmosphereRadius = renderData?.atmosphereHeightM
    ? radius + renderData.atmosphereHeightM / 1000
    : 1.05 * radius;
  const atmosphereColor = renderData?.colorSkyNoon
    ? new Vector3(...hexColorToVector3(renderData.colorSkyNoon))
    : new Vector3(1, 1, 1);
  const atmosphereColorNight = renderData?.colorSkyNight
    ? new Vector3(...hexColorToVector3(renderData.colorSkyNight))
    : new Vector3(0, 0, 0);

  const bodyPositionAbs: [number, number, number] = scToThree([
    celestialBody.cartesianInKm.x,
    celestialBody.cartesianInKm.y,
    celestialBody.cartesianInKm.z,
  ]);
  const parentStarPositionAbs: [number, number, number] = celestialBody.parentStar
    ? scToThree([
        celestialBody.parentStar.cartesianInKm.x,
        celestialBody.parentStar.cartesianInKm.y,
        celestialBody.parentStar.cartesianInKm.z,
      ])
    : [0, 0, 0];
  const parentStarPositionRelInitial: [number, number, number] = [
    parentStarPositionAbs[0] - bodyPositionAbs[0],
    parentStarPositionAbs[1] - bodyPositionAbs[1],
    parentStarPositionAbs[2] - bodyPositionAbs[2],
  ];
  const distanceToParentStar = Math.sqrt(
    parentStarPositionRelInitial[0] ** 2 +
      parentStarPositionRelInitial[1] ** 2 +
      parentStarPositionRelInitial[2] ** 2
  );

  // Use custom hook to recalculate rotation every 10 seconds
  const { parentStarRotateDeg, parentStarPositionRelRotated } = useParentStarRotation({
    celestialBody,
    parentStarPositionRelInitial,
  });

  const cameraRef = useRef<any>(null);
  const dirToSunCameraAdjusted = celestialBody.parentStar
    ? new Vector3(...parentStarPositionRelRotated).normalize()
    : new Vector3(1, 0, 0);

  const needOrbitCircle = (loc: SCLocation) =>
    loc.type === "station" ||
    loc.type === "asteroidbase" ||
    loc.type === "comm" ||
    loc.type === "orbitallaser";
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
    <Canvas key={celestialBody.code} className="CelestialBody3D">
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={cameraPosition}
        fov={cameraFOVY}
        near={cameraNear}
        far={cameraFar}
      />
      <CameraUpdater location={location} radius={radius} />
      <ambientLight intensity={applyRealisticAtmosphere ? 0.05 : 0.3} />
      <RotatingDirectionalLight intensity={5} celestialBody={celestialBody} />
      <Starfield rotateYDeg={parentStarRotateDeg} />

      <group>
        <CelestialBodySphere
          map={applyHDMaps && bodyHDTexture ? bodyHDTexture : bodyTexture}
          mapRoughness={bodyTextureRoughness}
          mapEmission={bodyTextureEmission}
          mapNormal={bodyTextureNormal}
          color={themeColor}
          radius={radius}
          setApiRef={(api) => (sphereApiRef.current = api)}
        />
        {/* Render parent star at rotated position */}
        {celestialBody.parentStar && (
          <mesh
            position={new Vector3(...parentStarPositionRelRotated)
              .normalize()
              .multiplyScalar(distanceToParentStar)}
          >
            <sphereGeometry args={[celestialBody.parentStar.bodyRadiusInKm, 32, 32]} />
            <meshBasicMaterial color={"#fff"} />
          </mesh>
        )}
        {showLongitudeLatitudeLines && (
          <LatLongLines radius={radius + 1} color={themeColor} />
        )}
        {/* Render ring*/}
        {renderData?.ringRadiusInner && renderData.ringRadiusOuter && (
          <CelestialBodyRing
            innerRadius={renderData.ringRadiusInner}
            outerRadius={renderData.ringRadiusOuter}
            map={texture.ring.Yela}
          />
        )}
        {/* Render orbits for space stations and comm arrays */}
        {showOrbitLines &&
          celestialBody.locations &&
          celestialBody.locations
            .filter(
              (loc) =>
                !isLocationDisplayHidden(loc) &&
                (showNoQTMarkers || loc.beaconMarker) &&
                needOrbitCircle(loc)
            )
            .map((loc) => (
              <OrbitCircle
                key={loc.code + "-orbit"}
                centerY={loc.cartesianInKm.z}
                radius={Math.sqrt(
                  loc.cartesianInKm.x ** 2 + loc.cartesianInKm.y ** 2
                )}
              />
            ))}
        {/* Render location labels */}
        {showLocationLabels &&
          celestialBody.locations &&
          celestialBody.locations
            .filter(
              (loc) => !isLocationDisplayHidden(loc) && (showNoQTMarkers || loc.beaconMarker)
            )
            .map((loc) => <LocationLabel loc={loc} key={loc.code} bodyRadius={radius} />)}
        {/* Render Subsolar Point Direction Line */}
        {showSubsolarDirection && celestialBody.parentStar && (
          <SubsolarDirectionLine celestialBody={celestialBody} />
        )}
        {/* Render Orbital Markers */}
        {showOMs && celestialBody.omRadiusInKm && (
          <OrbitalMarkers
            radius={radius}
            omRadius={celestialBody.omRadiusInKm}
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
        <Bloom
          intensity={0.45}
          luminanceThreshold={0.78}
          luminanceSmoothing={0.2}
          mipmapBlur
        />
        {applyRealisticAtmosphere ? (
          <Atmosphere
            cameraRef={cameraRef}
            fovy={cameraFOVY}
            radiusBody={radius}
            radiusAtmos={atmosphereRadius}
            dirToSun={dirToSunCameraAdjusted}
            atmosColor={atmosphereColor}
            atmosColorNight={atmosphereColorNight}
            atmosColorOverrideCoefficient={renderData?.atmosphereColorOverrideCoefficient}
            waveLengths={
              renderData?.atmosphereWaveLengthR &&
              renderData.atmosphereWaveLengthG &&
              renderData.atmosphereWaveLengthB
                ? new Vector3(
                    renderData.atmosphereWaveLengthR,
                    renderData.atmosphereWaveLengthG,
                    renderData.atmosphereWaveLengthB
                  )
                : undefined
            }
            scatteringStrength={renderData?.atmosphereScatteringStrength}
          />
        ) : (
          <></>
        )}
      </EffectComposer>
    </Canvas>
  );
}
