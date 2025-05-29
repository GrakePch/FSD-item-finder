import { Html } from "@react-three/drei";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router";
import * as THREE from "three";
import Icon from "@mdi/react";
import locationIcon from "../../assets/locationIcon";
import LocationIconColor from "../../assets/locationIconColor";
import { locationNameToI18nKey, toUrlKey } from "../../utils";

export default function LocationLabel({
  loc,
  sphereRef,
}: {
  loc: SCLocation;
  sphereRef: React.RefObject<THREE.Mesh>;
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
  return (
    <Html
      position={[loc.coordinateX, loc.coordinateZ, -loc.coordinateY]}
      center
      occlude={[sphereRef]}
      onOcclude={setOccluded}
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
