import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  Box3,
  Vector3,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  ShaderMaterial,
} from "three";
import { getMainEngineExhausts } from "./thrusterExhausts";
import { createEngineFade, sampleEngineFade } from "./engineFade";
import { isThrusterGlow } from "./modelControls";

export default function ThrusterPlumes({
  root,
  enabled,
}: {
  root: Object3D;
  enabled: boolean;
}) {
  const { invalidate, frameloop } = useThree();
  const exhausts = useMemo(() => getMainEngineExhausts(root), [root]);
  const group = useRef<Group>(null);
  const strength = useRef(0);
  const fade = useRef(createEngineFade(0, 0, 0));
  const glowMaterials = useMemo(() => {
    const materials = new Set<MeshStandardMaterial>();
    root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        if (material instanceof MeshStandardMaterial && isThrusterGlow(material.name))
          materials.add(material);
      }
    });
    return [...materials];
  }, [root]);
  const geometry = useMemo(() => {
    const size = new Box3().setFromObject(root).getSize(new Vector3());
    const scale = Math.max(0.08, Math.min(20, Math.max(size.x, size.y, size.z) / 46.5));
    return new CylinderGeometry(0, 0.48 * scale, 12 * scale, 20, 12, true).translate(
      0,
      6 * scale,
      0
    );
  }, [root]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { time: { value: 0 }, strength: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        blending: AdditiveBlending,
        toneMapped: false,
        vertexShader: `
      varying vec2 flameUv;
      void main() {
        flameUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform float time;
      uniform float strength;
      varying vec2 flameUv;
      void main() {
        float along = flameUv.y;
        float ripple = 0.88 + 0.12 * sin(along * 35.0 - time * 24.0);
        float fade = pow(1.0 - along, 1.5) * ripple;
        vec3 color = mix(vec3(0.65, 0.9, 1.0), vec3(0.08, 0.35, 1.0), along);
        gl_FragColor = vec4(color, fade * 0.65 * strength);
      }
    `,
      }),
    []
  );

  useEffect(() => {
    fade.current = createEngineFade(strength.current, Number(enabled), performance.now());
    invalidate();
  }, [enabled, root, invalidate]);

  useEffect(() => {
    invalidate();
    if (!enabled || frameloop === "never") return;
    // Running flames animate at 30fps. Fade-out requests its own final frames.
    const timer = window.setInterval(invalidate, 1000 / 30);
    return () => window.clearInterval(timer);
  }, [enabled, frameloop, invalidate]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ clock }) => {
    strength.current = sampleEngineFade(fade.current, performance.now());
    // Engine markers may move with native VTOL nacelle animations.
    root.updateMatrixWorld(true);
    for (const exhaust of exhausts) {
      const plume = group.current?.getObjectByName(`plume-${exhaust.id}`);
      if (!plume) continue;
      exhaust.node.getWorldPosition(plume.position);
      const direction = new Vector3(0, -1, 0).transformDirection(
        exhaust.node.matrixWorld
      );
      plume.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction);
    }
    material.uniforms.strength.value = strength.current;
    material.uniforms.time.value = clock.elapsedTime;
    if (group.current) group.current.visible = strength.current > 0;
    for (const glow of glowMaterials) glow.emissiveIntensity = strength.current * 4;
    if (strength.current !== fade.current.target) invalidate();
  });

  return (
    <group ref={group} name="main-engine-plumes" visible={false} dispose={null}>
      {exhausts.map((exhaust) => (
        <mesh
          key={exhaust.id}
          name={`plume-${exhaust.id}`}
          position={exhaust.position}
          quaternion={exhaust.rotation}
          geometry={geometry}
          material={material}
        />
      ))}
    </group>
  );
}
