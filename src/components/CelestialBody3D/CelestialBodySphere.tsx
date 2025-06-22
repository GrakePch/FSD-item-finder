import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useRef, useCallback } from "react";

const shaderFuncCustomLighting = `
void RE_Direct_Physical_CUSTOM( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

  float dotNLRaw = dot( geometryNormal, directLight.direction );
	float dotNL = saturate( dotNLRaw );
	vec3 irradiance = dotNL * directLight.color;

  /* Make the diffuse lighting falloff smoother */
  float adjustedDotNL = dotNLRaw / (1. + exp(-dotNLRaw * 4.4)) + 0.05;
        adjustedDotNL = dotNLRaw < -0.4 ? -1. : adjustedDotNL;
  float dotNLDiffuse = saturate( adjustedDotNL );
  vec3 irradianceDiffuse = dotNLDiffuse * directLight.color;

	#ifdef USE_CLEARCOAT

		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );

		vec3 ccIrradiance = dotNLcc * directLight.color;

		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );

	#endif

	#ifdef USE_SHEEN

		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );

	#endif

	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );

	reflectedLight.directDiffuse += irradianceDiffuse * BRDF_Lambert( material.diffuseColor );
}

#undef RE_Direct
#define RE_Direct				RE_Direct_Physical_CUSTOM`;

function CustomStandardMaterial(props: any) {
  // Use a ref to persist the callback
  const handleBeforeCompile = useCallback((shader: { fragmentShader: string }) => {
    // Modify the lighting falloff in the fragment shader
    // Find the line to inject after
    const lines = shader.fragmentShader.split("\n");
    const targetLine = "#include <lights_physical_pars_fragment>";
    const idx = lines.findIndex((line: string) => line.includes(targetLine));
    if (idx !== -1) {
      lines.splice(idx + 1, 0, shaderFuncCustomLighting);
      shader.fragmentShader = lines.join("\n");
    }
  }, []);

  return <meshStandardMaterial {...props} onBeforeCompile={handleBeforeCompile} />;
}

function SurfaceMaterial({
  map,
  mapRoughness,
  mapEmission,
}: {
  map?: string;
  mapRoughness?: string;
  mapEmission?: string;
}) {
  const diffuseMap = map ? useTexture(map) : undefined;
  const roughnessMap = mapRoughness ? useTexture(mapRoughness) : undefined;
  const emissionMap = mapEmission ? useTexture(mapEmission) : undefined;
  return (
    <CustomStandardMaterial
      map={diffuseMap}
      roughnessMap={roughnessMap}
      emissiveMap={emissionMap}
      emissiveIntensity={emissionMap ? 0.3 : 0}
      emissive={emissionMap ? 0xffffdd : null}
    />
  );
}

export default function CelestialBodySphere({
  map,
  mapRoughness,
  mapEmission,
  color,
  radius,
  setApiRef,
}: {
  map?: string;
  mapRoughness?: string;
  mapEmission?: string;
  color?: string;
  radius: number;
  setApiRef?: (api: { setRotationTarget: (target: number) => void }) => void;
}) {
  // Store current and target rotation for inertia
  const rotationRef = useRef({ current: 0, target: 0, velocity: 0 });

  // Expose API to parent for setting rotation target
  useEffect(() => {
    if (setApiRef) {
      setApiRef({
        setRotationTarget: (target: number) => {
          rotationRef.current.target = target;
        },
      });
    }
  }, [setApiRef]);

  return (
    <mesh>
      <sphereGeometry args={[radius, 64, 32, Math.PI]} />
      {map ? (
        <Suspense fallback={<meshStandardMaterial color={color || "#ffffff"} />}>
          <SurfaceMaterial
            map={map}
            mapRoughness={mapRoughness}
            mapEmission={mapEmission}
          />
        </Suspense>
      ) : (
        <CustomStandardMaterial color={color || "#ffffff"} />
      )}
    </mesh>
  );
}
