import "./CelestialBody3D.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture, Html } from "@react-three/drei";
import texture from "../../assets/texture";
import * as THREE from "three";
import Icon from "@mdi/react";
import locationIcon from "../../assets/locationIcon";
import LocationIconColor from "../../assets/locationIconColor";
import { useTranslation } from "react-i18next";
import { locationNameToI18nKey, toUrlKey } from "../../utils";
import { useState } from "react";
import { useNavigate } from "react-router";

function CelestialBodySphere({ map, radius }: { map?: string; radius: number }) {
  const textureMap = map ? useTexture(map) : undefined;
  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 32, Math.PI]} />
      {textureMap ? (
        <meshStandardMaterial map={textureMap} />
      ) : (
        <meshStandardMaterial color="#ffffff" />
      )}
    </mesh>
  );
}

function LatLongLines({
  radius,
  latCount = 8,
  longCount = 16,
  color = "#808080",
}: {
  radius: number;
  latCount?: number;
  longCount?: number;
  color?: string;
}) {
  // Latitude lines (excluding poles)
  const latLines = [];
  for (let i = 1; i < latCount; i++) {
    const lat = (i * Math.PI) / latCount;
    const points: THREE.Vector3[] = [];
    for (let j = 0; j <= 64; j++) {
      const lon = (j * 2 * Math.PI) / 64;
      const x = radius * Math.sin(lat) * Math.cos(lon);
      const y = radius * Math.cos(lat);
      const z = radius * Math.sin(lat) * Math.sin(lon);
      points.push(new THREE.Vector3(x, y, z));
    }
    latLines.push(
      <line key={`lat-${i}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={1} />
      </line>
    );
  }
  // Longitude lines
  const longLines = [];
  for (let i = 0; i < longCount; i++) {
    const lon = (i * 2 * Math.PI) / longCount;
    const points: THREE.Vector3[] = [];
    for (let j = 0; j <= 64; j++) {
      const lat = (j * Math.PI) / 64;
      const x = radius * Math.sin(lat) * Math.cos(lon);
      const y = radius * Math.cos(lat);
      const z = radius * Math.sin(lat) * Math.sin(lon);
      points.push(new THREE.Vector3(x, y, z));
    }
    longLines.push(
      <line key={`long-${i}`}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={1} />
      </line>
    );
  }
  return (
    <>
      {latLines}
      {longLines}
    </>
  );
}

function LocationLabel({ loc }: { loc: SCLocation }) {
  const { t } = useTranslation();
  const [occluded, setOccluded] = useState(false);
  const navigate = useNavigate();
  const handleClick = (e: any) => {
    e.stopPropagation();
    navigate(`/l/${toUrlKey(loc.name)}`);
  };
  const isLarge =
    loc.type === "Landing zone" ||
    loc.type === "Space station" ||
    loc.type === "Asteroid base";
  return (
    <Html
      position={[loc.coordinateX, loc.coordinateZ, -loc.coordinateY]}
      center
      occlude
      onOcclude={setOccluded}
      className={`location-label ${occluded ? "occluded" : ""} ${isLarge ? "large" : ""}`}
    >
      <div className="wrapper" onClick={handleClick}>
        <div
          className="icon"
          style={{
            backgroundColor:
              loc.private === 1 ? "#f74a55" : LocationIconColor[loc.type] || "#78909c",
          }}
        >
          <Icon path={locationIcon[loc.type]} color="#fff" />
        </div>
        <p className="name">
          {t(`Location.${locationNameToI18nKey(loc.name)}`, { defaultValue: loc.name })}
        </p>
      </div>
    </Html>
  );
}

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
      <ambientLight intensity={1} />
      <directionalLight position={[1, 0, 1]} intensity={1} />
      <CelestialBodySphere map={bodyTexture} radius={radius} />
      <LatLongLines radius={radius + 0.1} color={themeColor} />
      {celestialBody.locations &&
        celestialBody.locations.map((loc) => <LocationLabel loc={loc} key={loc.name} />)}
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  );
}
