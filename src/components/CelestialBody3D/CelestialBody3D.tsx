import "./CelestialBody3D.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import CelestialBodySphere from "./CelestialBodySphere";
import LatLongLines from "./LatLongLines";
import OrbitCircle from "./OrbitCircle";
import LocationLabel from "./LocationLabel";
import texture from "../../assets/texture";
import * as THREE from "three";
import RotatingDirectionalLight from "./RotatingDirectionalLight";
import CelestialBodyRing from "./CelestialBodyRing";

export default function CelestialBody3D({
  celestialBody,
}: {
  celestialBody: CelestialBody;
}) {
  const bodyTexture = texture.body[celestialBody.name];
  const radius = celestialBody.bodyRadius || 1;
  const zoom = 200 / radius;
  const cameraPosition: [number, number, number] = [0, 0, 4 * radius];
  const cameraFar = 10 * radius;
  const themeColor =
    celestialBody.themeColorR && celestialBody.themeColorG && celestialBody.themeColorB
      ? `rgb(${celestialBody.themeColorR}, ${celestialBody.themeColorG}, ${celestialBody.themeColorB})`
      : undefined;
  const needOrbitCircle = (loc: SCLocation) =>
    loc.type === "Space station" ||
    loc.type === "Asteroid base" ||
    loc.type === "CommArray";
  const sphereRef = useRef<THREE.Mesh>(null);

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
      <ambientLight intensity={0.7} />
      <RotatingDirectionalLight intensity={5} celestialBody={celestialBody} />
      <CelestialBodySphere map={bodyTexture} radius={radius} sphereRef={sphereRef} />
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
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}
