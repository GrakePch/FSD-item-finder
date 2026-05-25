import { Html } from "@react-three/drei";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as THREE from "three";
import Icon from "@mdi/react";
import { getLocationIcon } from "../../assets/locationIcon";
import { getLocationIconColor } from "../../assets/locationIconColor";
import { locationNameToI18nKey } from "../../utils";
import { useThree, useFrame } from "@react-three/fiber";
import { isLocationInDaylight } from "./utilsSunriseSunSetCalc";

export default function LocationLabel({
  loc,
  bodyRadius,
}: {
  loc: SCLocation;
  bodyRadius: number;
}) {
  const { t } = useTranslation();
  const [occluded, setOccluded] = useState(false);
  const [isDaylight, setIsDaylight] = useState(true);
  const navigate = useNavigate();
  const handleClick = (e: any) => {
    e.stopPropagation();
    const search = window.location.search;
    navigate(`/l/${loc.code}${search}`);
  };
  const isLarge =
    loc.beaconType === "LandingZone" ||
    loc.type === "station" ||
    loc.type === "asteroidbase";

  const { camera } = useThree();

  // Label position
  const labelPos = new THREE.Vector3(
    loc.cartesianInKm.x,
    loc.cartesianInKm.z,
    -loc.cartesianInKm.y
  );

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

    /* Check if the label is in daylight */
    setIsDaylight(isLocationInDaylight(loc));
  });

  return (
    <Html
      position={[loc.cartesianInKm.x, loc.cartesianInKm.z, -loc.cartesianInKm.y]}
      center
      occlude={false} /* Implemented a more efficient occlusion check */
      className={`location-label ${occluded ? "occluded" : ""} ${
        isLarge ? "large" : ""
      } ${!isDaylight ? "night" : ""}`}
      zIndexRange={[500, 0]}
    >
      <div className="wrapper" onClick={handleClick}>
        <div
          className="icon"
          style={{
            backgroundColor:
              loc.restrictions.includes("private")
                ? "#f74a55"
                : getLocationIconColor(loc),
          }}
        >
          <Icon path={getLocationIcon(loc)} />
        </div>
        <p className="name">
          {t(locationNameToI18nKey(loc.name), { ns: "locations", defaultValue: loc.name })}
        </p>
      </div>
    </Html>
  );
}
