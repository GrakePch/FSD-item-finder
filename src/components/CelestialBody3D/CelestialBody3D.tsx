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
  // Inertia state for camera rotation
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

  // Handler to update zoom when OrbitControls changes
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

  // Effect to handle inertia on user interaction
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const onStart = () => {
      inertiaRef.current.isUserInteracting = true;
      if (inertiaRef.current.animationFrame) {
        cancelAnimationFrame(inertiaRef.current.animationFrame);
        inertiaRef.current.animationFrame = 0;
      }
    };
    const onEnd = () => {
      inertiaRef.current.isUserInteracting = false;
      const animate = () => {
        if (!controlsRef.current) return;
        // Calculate velocity magnitude for each axis
        const vA = Math.abs(inertiaRef.current.velocityAzimuthal);
        const vP = Math.abs(inertiaRef.current.velocityPolar);
        // Use sigmoid for both horizontal and vertical inertia for smooth transition and no excessive tail decay
        const baseDampingA = 0.97;
        const maxDampingA = 0.98;
        const baseDampingP = 0.97;
        const maxDampingP = 0.98;
        // Sigmoid function for smooth damping transition
        const sigmoid = (x: number) => 1 / (1 + Math.exp(-2.0 * (x - 0.2)));
        const dampingCurveA = baseDampingA + (maxDampingA - baseDampingA) * sigmoid(vA);
        const dampingCurveP = baseDampingP + (maxDampingP - baseDampingP) * sigmoid(vP);

        // Limit maximum velocity based on zoom and radius
        const maxVelocityAzimuthal = 512 / currentZoom / radius; // Maximum velocity for Azimuthal
        const maxVelocityPolar = 256 / currentZoom / radius; // Maximum velocity for Polar
        // Apply dynamic damping to each velocity
        inertiaRef.current.velocityAzimuthal = Math.min(
          Math.max(inertiaRef.current.velocityAzimuthal * dampingCurveA, -maxVelocityAzimuthal),
          maxVelocityAzimuthal
        );
        inertiaRef.current.velocityPolar = Math.min(
          Math.max(inertiaRef.current.velocityPolar * dampingCurveP, -maxVelocityPolar),
          maxVelocityPolar
        );

        // Stop inertia if velocity is very small
        if (Math.abs(inertiaRef.current.velocityAzimuthal) < 0.0001 && Math.abs(inertiaRef.current.velocityPolar) < 0.0001) {
          inertiaRef.current.velocityAzimuthal = 0;
          inertiaRef.current.velocityPolar = 0;
          inertiaRef.current.animationFrame = 0;
          inertiaRef.current.isAnimating = false;
          return;
        }
        // Apply inertia to camera angles (azimuthal and polar)
        controlsRef.current.setAzimuthalAngle(
          controlsRef.current.getAzimuthalAngle() + inertiaRef.current.velocityAzimuthal * 1/60
        );
        controlsRef.current.setPolarAngle(
          controlsRef.current.getPolarAngle() + inertiaRef.current.velocityPolar * 1/60
        );
        controlsRef.current.update();
        inertiaRef.current.animationFrame = requestAnimationFrame(animate);
        inertiaRef.current.isAnimating = true;
      };
      animate();
    };
    controls.addEventListener('start', onStart);
    controls.addEventListener('end', onEnd);
    return () => {
      controls.removeEventListener('start', onStart);
      controls.removeEventListener('end', onEnd);
      if (inertiaRef.current.animationFrame) {
        cancelAnimationFrame(inertiaRef.current.animationFrame);
      }
      inertiaRef.current.isAnimating = false;
    };
  }, [celestialBody, currentZoom]);


  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const domElement = controls.domElement;
    if (!domElement) return;
    const clearInertia = () => {
      if (inertiaRef.current.isAnimating) {
        inertiaRef.current.velocityAzimuthal = 0;
        inertiaRef.current.velocityPolar = 0;
        if (inertiaRef.current.animationFrame) {
          cancelAnimationFrame(inertiaRef.current.animationFrame);
          inertiaRef.current.animationFrame = 0;
        }
        inertiaRef.current.isAnimating = false;
      }
    };
    domElement.addEventListener('pointerdown', clearInertia);
    domElement.addEventListener('touchstart', clearInertia);
    return () => {
      domElement.removeEventListener('pointerdown', clearInertia);
      domElement.removeEventListener('touchstart', clearInertia);
    };
  }, [celestialBody, currentZoom]);

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
            <LocationLabel loc={loc} key={loc.name} sphereRef={sphereRef} />
          ))}
        {/* Render Orbital Markers */}
        <OrbitalMarkers radius={radius} color={themeColor} sphereRef={sphereRef} />
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
