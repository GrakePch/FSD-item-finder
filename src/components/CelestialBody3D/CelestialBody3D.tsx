import "./CelestialBody3D.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useCallback, useEffect } from "react";
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
  const sphereApiRef = useRef<{ setRotationTarget: (target: number) => void } | null>(null);

  const inertiaRef = useRef({
    lastAzimuthal: 0,
    lastPolar: 0,
    velocityAzimuthal: 0,
    velocityPolar: 0,
    lastTime: 0,
    isUserInteracting: false,
    animationFrame: 0,
    isAnimating: false,
  });

  const handleControlsChange = useCallback(() => {
    if (controlsRef.current) {
      setCurrentZoom(controlsRef.current.object.zoom);
      const controls = controlsRef.current;
      const now = performance.now();
      const azimuthal = controls.getAzimuthalAngle();
      const polar = controls.getPolarAngle();
      if (inertiaRef.current.isUserInteracting) {
        const dt = (now - inertiaRef.current.lastTime) / 1000;
        if (dt > 0) {
          inertiaRef.current.velocityAzimuthal = (azimuthal - inertiaRef.current.lastAzimuthal) / dt;
          inertiaRef.current.velocityPolar = (polar - inertiaRef.current.lastPolar) / dt;
        }
      }
      inertiaRef.current.lastAzimuthal = azimuthal;
      inertiaRef.current.lastPolar = polar;
      inertiaRef.current.lastTime = now;
    }
  }, []);


  const onControlsStart = () => {
    inertiaRef.current.isUserInteracting = true;
    if (inertiaRef.current.animationFrame) {
      cancelAnimationFrame(inertiaRef.current.animationFrame);
      inertiaRef.current.animationFrame = 0;
      inertiaRef.current.isAnimating = false;
    }
  };
  const onControlsEnd = () => {
    inertiaRef.current.isUserInteracting = false;
    if (Math.abs(inertiaRef.current.velocityAzimuthal) < 0.0001 && Math.abs(inertiaRef.current.velocityPolar) < 0.0001) {
      return;
    }
    const animateInertia = () => {
      if (!controlsRef.current) return;
      const vA = Math.abs(inertiaRef.current.velocityAzimuthal);
      const vP = Math.abs(inertiaRef.current.velocityPolar);
      const baseDampingA = 0.97, maxDampingA = 0.98;
      const baseDampingP = 0.97, maxDampingP = 0.98;
      const sigmoid = (x: number) => 1 / (1 + Math.exp(-2.0 * (x - 0.2)));
      const dampingA = baseDampingA + (maxDampingA - baseDampingA) * sigmoid(vA);
      const dampingP = baseDampingP + (maxDampingP - baseDampingP) * sigmoid(vP);
      const maxVA = 512 / currentZoom / radius;
      const maxVP = 256 / currentZoom / radius;
      inertiaRef.current.velocityAzimuthal = Math.min(Math.max(inertiaRef.current.velocityAzimuthal * dampingA, -maxVA), maxVA);
      inertiaRef.current.velocityPolar = Math.min(Math.max(inertiaRef.current.velocityPolar * dampingP, -maxVP), maxVP);
      if (Math.abs(inertiaRef.current.velocityAzimuthal) < 0.0001 && Math.abs(inertiaRef.current.velocityPolar) < 0.0001) {
        inertiaRef.current.isAnimating = false;
        inertiaRef.current.animationFrame = 0;
        return;
      }
      controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() + inertiaRef.current.velocityAzimuthal * 0.016);
      controlsRef.current.setPolarAngle(controlsRef.current.getPolarAngle() + inertiaRef.current.velocityPolar * 0.016);
      controlsRef.current.update();
      inertiaRef.current.animationFrame = requestAnimationFrame(animateInertia);
      inertiaRef.current.isAnimating = true;
    };
    animateInertia();
  };

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
          setApiRef={(api) => (sphereApiRef.current = api)}
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
        onStart={onControlsStart}
        onEnd={onControlsEnd}
        dampingFactor={0.2}
      />
    </Canvas>
  );
}