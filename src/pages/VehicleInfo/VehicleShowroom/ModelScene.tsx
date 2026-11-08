import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AnimationMixer,
  Box3,
  Light,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
} from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import ModelCamera from "./ModelCamera";
import ThrusterPlumes from "./ThrusterPlumes";
import HeadlightCones from "./HeadlightCones";
import { getControlClips, isThrusterGlow, type VehiclePose } from "./modelControls";

type ModelSceneProps = {
  model: GLTF;
  pose: VehiclePose;
  narrow: boolean;
  active: boolean;
  onResetReady: (reset: (() => void) | null) => void;
  onReady: () => void;
  onViewAdjusted: (adjusted: boolean) => void;
};

const ModelScene = ({
  model,
  pose,
  narrow,
  active,
  onResetReady,
  onReady,
  onViewAdjusted,
}: ModelSceneProps) => {
  const { invalidate } = useThree();
  const mixer = useMemo(() => new AnimationMixer(model.scene), [model]);
  const hull = useMemo(() => new Box3().setFromObject(model.scene), [model]);
  const clips = useMemo(() => getControlClips(model), [model]);
  const positions = useRef({ gear: 0, doors: 0, vtol: 0 });
  const vtolPlayback = useRef({ from: 0, target: 0, startedAt: 0, duration: 1 });

  useEffect(() => {
    const from = positions.current.vtol;
    const target = Number(pose.vtol);
    // Match Showroom's native playback: 900ms smoothstep, with remaining
    // travel time proportional to the distance when reversing mid-motion.
    vtolPlayback.current = {
      from,
      target,
      startedAt: performance.now(),
      duration: Math.max(1, 900 * Math.abs(target - from)),
    };
    invalidate();
  }, [model, pose.vtol, invalidate]);

  useEffect(() => {
    for (const clip of Object.values(clips).flat()) {
      const action = mixer.clipAction(clip);
      action.play();
      action.paused = true;
    }
    mixer.update(0);
    invalidate();
    onReady();
    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(model.scene);
    };
  }, [model, mixer, invalidate, onReady, clips]);

  useEffect(() => {
    model.scene.traverse((object) => {
      if (object instanceof Light) object.visible = pose.lights;
      if (!(object instanceof Mesh)) return;
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        if (material instanceof MeshStandardMaterial && !isThrusterGlow(material.name)) {
          material.emissiveIntensity = pose.lights ? 1 : 0;
        }
      }
    });
    invalidate();
  }, [model, pose.lights, invalidate]);

  useFrame((_, delta) => {
    let moving = false;
    for (const key of ["gear", "doors", "vtol"] as const) {
      const target = Number(pose[key]);
      if (key === "vtol") {
        const playback = vtolPlayback.current;
        const t = MathUtils.clamp(
          (performance.now() - playback.startedAt) / playback.duration,
          0,
          1
        );
        positions.current.vtol = MathUtils.lerp(
          playback.from,
          playback.target,
          t * t * (3 - 2 * t)
        );
      } else {
        const next = MathUtils.damp(
          positions.current[key],
          target,
          7,
          Math.min(delta, 0.05)
        );
        positions.current[key] = Math.abs(next - target) < 0.001 ? target : next;
      }
      for (const clip of clips[key])
        mixer.clipAction(clip).time = positions.current[key] * clip.duration;
      moving ||= positions.current[key] !== target;
    }
    mixer.update(0);
    if (moving) invalidate();
  });

  return (
    <>
      <hemisphereLight args={["#e4efff", "#64686a", 1.3]} />
      <directionalLight position={[-35, 55, -30]} intensity={2.2} />
      <directionalLight position={[30, 15, 25]} intensity={1.1} color="#c9e2ff" />
      <primitive object={model.scene} />
      <ThrusterPlumes root={model.scene} enabled={pose.engines} />
      <HeadlightCones root={model.scene} enabled={pose.lights} />
      <ModelCamera
        hull={hull}
        narrow={narrow}
        active={active}
        onResetReady={onResetReady}
        onViewAdjusted={onViewAdjusted}
      />
    </>
  );
};

export default ModelScene;
