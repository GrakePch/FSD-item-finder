import "./CelestialBody3D.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useCallback } from "react";
import CelestialBodySphere from "./CelestialBodySphere";
import LatLongLines from "./LatLongLines";
import OrbitCircle from "./OrbitCircle";
import LocationLabel from "./LocationLabel";
import texture from "../../assets/texture";
import * as THREE from "three";
import RotatingDirectionalLight from "./RotatingDirectionalLight";
import CelestialBodyRing from "./CelestialBodyRing";
import { OrbitalMarkers } from "./OrbitalMarkers";
import CameraUpdater from "./CameraUpdater";

/** NOTE:
 * The coordinate system used by Star Citizen is Z-up, Y-forward.
 * Transform from SC's coordinate system to Three.js's coordinate system:
 * [Three.js's := Star Citizen's]
 * x := x, y := z, z := -y.
 */

export default function CelestialBody3D({
  celestialBody,
  location,
}: {
  celestialBody: CelestialBody;
  location?: SCLocation | null;
}) {
  const bodyTexture = texture.body[celestialBody.name];
  const bodyTextureRoughness = texture.roughness[celestialBody.name];
  const radius = celestialBody.bodyRadius || 1;
  const zoom = 200 / radius;
  const zoomMax = 2000 / radius;
  const zoomMin = 100 / radius;
  const cameraPosition: [number, number, number] = [0, 0, 4 * radius];
  const cameraFar = 10 * radius;
  const themeColor =
    celestialBody.themeColorR && celestialBody.themeColorG && celestialBody.themeColorB
      ? `rgb(${celestialBody.themeColorR}, ${celestialBody.themeColorG}, ${celestialBody.themeColorB})`
      : undefined;
  const needOrbitCircle = (loc: SCLocation) =>
    loc.type === "Space station" ||
    loc.type === "Asteroid base" ||
    loc.type === "CommArray" ||
    loc.type === "Orbital laser platform";
  const sphereRef = useRef<THREE.Mesh>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const controlsRef = useRef<any>(null);

  // Handler to update zoom when OrbitControls changes
  const handleControlsChange = useCallback(() => {
    if (controlsRef.current) {
      setCurrentZoom(controlsRef.current.object.zoom);
    }
  }, []);

  return (
    <Canvas
      key={celestialBody.name}
      orthographic
      camera={{
        position: cameraPosition,
        zoom: zoom,
        near: 0.1,
        far: cameraFar,
      }}
      className="CelestialBody3D"
    >
      <CameraUpdater location={location} radius={radius} />
      <ambientLight intensity={0.7} />
      <RotatingDirectionalLight intensity={5} celestialBody={celestialBody} />

      <group>
        <CelestialBodySphere
          map={bodyTexture}
          mapRoughness={bodyTextureRoughness}
          color={themeColor}
          radius={radius}
          sphereRef={sphereRef}
        />
        <LatLongLines radius={radius + 0.1} color={themeColor} />
        {/* Render ring*/}
        {celestialBody.ringRadiusInner && celestialBody.ringRadiusOuter && (
          <CelestialBodyRing
            innerRadius={celestialBody.ringRadiusInner}
            outerRadius={celestialBody.ringRadiusOuter}
            map={texture.ring.Yela}
          />
        )}
        {/* Render orbits for space stations and comm arrays */}
        {celestialBody.locations &&
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
        {celestialBody.locations &&
          celestialBody.locations.map((loc) => (
            <LocationLabel loc={loc} key={loc.name} bodyRadius={radius} />
          ))}
        {/* Render Orbital Markers */}
        <OrbitalMarkers radius={radius} color={themeColor} />
      </group>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        maxZoom={zoomMax}
        minZoom={zoomMin}
        rotateSpeed={125 / currentZoom / radius}
        onChange={handleControlsChange}
        dampingFactor={0.2}
      />
    </Canvas>
  );
}
