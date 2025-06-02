import { Html } from "@react-three/drei";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as THREE from "three";
import Icon from "@mdi/react";
import locationIcon from "../../assets/locationIcon";
import LocationIconColor from "../../assets/locationIconColor";
import { locationNameToI18nKey, toUrlKey } from "../../utils";
import { useThree, useFrame } from "@react-three/fiber";

export default function LocationLabel({
  loc,
  bodyRadius,
}: {
  loc: SCLocation;
  bodyRadius: number;
}) {
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

  const { camera } = useThree();

  // Label position
  const labelPos = new THREE.Vector3(loc.coordinateX, loc.coordinateZ, -loc.coordinateY);

  // More efficient occlusion check
  useFrame(() => {
    // Ray direction (normalized)
    const dir = new THREE.Vector3().copy(labelPos);
    dir.sub(camera.position).normalize();
    // Compute t for closest point on the line to the origin
    const t = -labelPos.dot(dir);
    // Closest point on the line
    const closest = new THREE.Vector3().copy(labelPos).add(dir.clone().multiplyScalar(t));
    // Distance from origin to closest point
    const dist = closest.length();
    // Determine if label is on the back side of the sphere
    const isBack = dir.dot(labelPos) > 0;
    // Occluded if distance < sphere radius AND label is on the back
    const shouldOcclude = dist < bodyRadius && isBack;
    if (shouldOcclude !== occluded) setOccluded(shouldOcclude);
  });

  return (
    <Html
      position={[loc.coordinateX, loc.coordinateZ, -loc.coordinateY]}
      center
      occlude={false} /* Implemented a more efficient occlusion check */
      className={`location-label ${occluded ? "occluded" : ""} ${isLarge ? "large" : ""}`}
      zIndexRange={[500, 0]}
    >
      <div className="wrapper" onClick={handleClick}>
        <div
          className="icon"
          style={{
            backgroundColor:
              loc.private === 1 ? "#f74a55" : LocationIconColor[loc.type] || "#78909c",
          }}
        >
          <Icon path={locationIcon[loc.type] || locationIcon.Outpost} color="#fff" />
        </div>
        <p className="name">
          {t(`Location.${locationNameToI18nKey(loc.name)}`, { defaultValue: loc.name })}
        </p>
      </div>
    </Html>
  );
}
