import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Box3, MOUSE, TOUCH, Vector3 } from "three";
import type { OrbitControls as Controls } from "three-stdlib";
import {
  createCameraReset,
  fitHullDistance,
  sampleCameraReset,
  type CameraReset,
} from "./cameraReset";

type ModelCameraProps = {
  hull: Box3;
  narrow: boolean;
  active: boolean;
  onResetReady: (reset: (() => void) | null) => void;
  onViewAdjusted: (adjusted: boolean) => void;
};

const ModelCamera = ({
  hull,
  narrow,
  active,
  onResetReady,
  onViewAdjusted,
}: ModelCameraProps) => {
  const controls = useRef<Controls>(null);
  const { camera, invalidate, size, gl } = useThree();
  const cameraReset = useRef<CameraReset | null>(null);
  const defaultView = useRef<{ position: Vector3; target: Vector3; zoom: number } | null>(
    null
  );
  const viewAdjusted = useRef(false);
  const cancelReset = useCallback(() => {
    cameraReset.current = null;
    if (controls.current) {
      controls.current.enabled = true;
      controls.current.enableDamping = true;
    }
  }, []);
  const fitDistance = useMemo(
    () => fitHullDistance(hull, size.width, size.height),
    [hull, size.width, size.height]
  );
  useEffect(() => {
    // Use authored hull bounds, so deploying gear never shifts the orbit target.
    const center = hull.getCenter(new Vector3());
    const distance = fitDistance;
    const destination = center
      .clone()
      .add(new Vector3(-0.8, 0.65, -1).normalize().multiplyScalar(distance));
    cancelReset();
    const orbit = controls.current;
    // Discard old orbit momentum before fitting a resized or reloaded viewer.
    if (orbit) {
      orbit.enableDamping = false;
      orbit.update();
    }
    camera.position.copy(destination);
    camera.near = Math.max(0.01, distance / 500);
    camera.far = distance * 12;
    camera.updateProjectionMatrix();
    if (orbit) {
      orbit.target.copy(center);
      orbit.update();
      orbit.enableDamping = true;
    }
    defaultView.current = {
      position: destination.clone(),
      target: center.clone(),
      zoom: camera.zoom,
    };
    viewAdjusted.current = false;
    onViewAdjusted(false);
    invalidate();
    const reset = () => {
      const orbit = controls.current;
      if (!orbit) return;
      // Flush residual orbit momentum, then take the shortest arc to the view.
      const position = camera.position.clone();
      const target = orbit.target.clone();
      orbit.enableDamping = false;
      orbit.update();
      camera.position.copy(position);
      orbit.target.copy(target);
      orbit.update();
      orbit.enabled = false;
      cameraReset.current = createCameraReset(
        camera.position,
        orbit.target,
        destination,
        center,
        performance.now()
      );
      invalidate();
    };
    onResetReady(reset);
    return () => {
      cancelReset();
      onResetReady(null);
    };
  }, [camera, invalidate, fitDistance, onResetReady, cancelReset, onViewAdjusted, hull]);

  useEffect(() => {
    if (active) invalidate();
    else cancelReset();
  }, [active, cancelReset, invalidate]);

  useEffect(() => {
    // A wheel over the narrow viewer belongs to document scrolling, not zoom.
    const canvas = gl.domElement;
    const onWheel = (event: WheelEvent) => {
      cancelReset();
      if (narrow) event.stopImmediatePropagation();
    };
    canvas.addEventListener("pointerdown", cancelReset, true);
    canvas.addEventListener("wheel", onWheel, { capture: true, passive: true });
    return () => {
      canvas.removeEventListener("wheel", onWheel, true);
      canvas.removeEventListener("pointerdown", cancelReset, true);
    };
  }, [gl, narrow, cancelReset]);

  useEffect(() => {
    const canvas = gl.domElement;
    const previousTouchAction = canvas.style.touchAction;
    let modelGesture = false;
    let scrollGesture = false;

    // Keep native single-finger scrolling. Two fingers belong to OrbitControls;
    // cancel touch defaults before the browser takes over and cancels pointers.
    const onTouch = (event: TouchEvent) => {
      if (!scrollGesture && event.targetTouches.length >= 2) modelGesture = true;
      if (modelGesture && event.cancelable) event.preventDefault();
    };
    const onTouchEnd = (event: TouchEvent) => {
      // Keep the gesture claimed when only one of the two fingers lifts, so the
      // remaining finger cannot unexpectedly start scrolling the page.
      if (event.targetTouches.length === 0) {
        modelGesture = false;
        scrollGesture = false;
      }
    };
    const onPointerCancel = (event: PointerEvent) => {
      // Once native scrolling has claimed a finger, retain that ownership until
      // all fingers lift; its canceled pointer stream cannot resume an orbit.
      if (event.pointerType === "touch" && !modelGesture) scrollGesture = true;
    };

    canvas.style.touchAction = "pan-y";
    canvas.addEventListener("touchstart", onTouch, { passive: false });
    canvas.addEventListener("touchmove", onTouch, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);
    canvas.addEventListener("pointercancel", onPointerCancel);
    return () => {
      canvas.style.touchAction = previousTouchAction;
      canvas.removeEventListener("touchstart", onTouch);
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
      canvas.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [gl]);

  useFrame(() => {
    let moving = false;
    const reset = cameraReset.current;
    const orbit = controls.current;
    if (reset && orbit) {
      const done = sampleCameraReset(
        reset,
        performance.now(),
        camera.position,
        orbit.target
      );
      orbit.update();
      if (done) cancelReset();
      else moving = true;
    }
    const initial = defaultView.current;
    if (initial && orbit) {
      const toleranceSquared = fitDistance * fitDistance * 1e-8;
      const adjusted =
        camera.position.distanceToSquared(initial.position) > toleranceSquared ||
        orbit.target.distanceToSquared(initial.target) > toleranceSquared ||
        Math.abs(camera.zoom - initial.zoom) > 1e-4;
      if (adjusted !== viewAdjusted.current) {
        viewAdjusted.current = adjusted;
        onViewAdjusted(adjusted);
      }
    }
    if (moving) invalidate();
  });

  return (
    <OrbitControls
      ref={controls}
      domElement={gl.domElement}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.1}
      minDistance={fitDistance * 0.3}
      maxDistance={fitDistance * 2.8}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
      mouseButtons={{ LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: undefined }}
      touches={{ ONE: undefined, TWO: TOUCH.DOLLY_ROTATE }}
    />
  );
};

export default ModelCamera;
