import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  CylinderGeometry,
  DoubleSide,
  Object3D,
  ShaderMaterial,
} from "three";
import { getHeadlightSources } from "./headlightSources";

export default function HeadlightCones({
  root,
  enabled,
}: {
  root: Object3D;
  enabled: boolean;
}) {
  const { invalidate } = useThree();
  const geometry = useMemo(
    () => new CylinderGeometry(1, 0.006, 1, 48, 1, true).translate(0, 0.5, 0),
    []
  );
  const beams = useMemo(
    () =>
      getHeadlightSources(root).map((source) => ({
        ...source,
        material: new ShaderMaterial({
          transparent: true,
          depthWrite: false,
          side: DoubleSide,
          blending: AdditiveBlending,
          toneMapped: false,
          vertexShader: `
      varying vec2 beamUv;
      varying vec3 beamNormal;
      varying vec3 beamView;
      void main() {
        beamUv = uv;
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        beamNormal = normalMatrix * normal;
        beamView = -viewPosition.xyz;
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
          fragmentShader: `
      varying vec2 beamUv;
      varying vec3 beamNormal;
      varying vec3 beamView;
      void main() {
        float facing = pow(abs(dot(normalize(beamNormal), normalize(beamView))), 0.8);
        float distanceFade = pow(1.0 - beamUv.y, 1.5) * smoothstep(0.0, 0.035, beamUv.y);
        gl_FragColor = vec4(vec3(1.0), 0.14 * facing * distanceFade);
      }
    `,
        }),
      })),
    [root]
  );

  useEffect(() => {
    invalidate();
  }, [enabled, invalidate]);
  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry]
  );
  useEffect(
    () => () => {
      for (const beam of beams) beam.material.dispose();
    },
    [beams]
  );

  return (
    <group name="headlight-cones" visible={enabled} dispose={null}>
      {beams.map((beam) => (
        <mesh
          key={beam.id}
          name={`cone-${beam.id}`}
          position={beam.position}
          quaternion={beam.rotation}
          scale={[beam.radius, beam.length, beam.radius]}
          geometry={geometry}
          material={beam.material}
        />
      ))}
    </group>
  );
}
