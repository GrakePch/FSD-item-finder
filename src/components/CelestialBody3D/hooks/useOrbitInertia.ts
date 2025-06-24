import { useRef, useState, useCallback } from "react";

export function useOrbitInertia({
  controlsRef,
  initialDistance,
  radius,
}: {
  controlsRef: React.RefObject<any>;
  initialDistance: number;
  radius: number;
}) {
  const [currentDistance, setCurrentDistance] = useState(initialDistance);
  const inertiaRef = useRef({
    lastAzimuthal: 0,
    lastPolar: 0,
    velocityAzimuthal: 0,
    velocityPolar: 0,
    lastTime: 0,
    isUserInteracting: false,
    animationFrame: 0,
    isAnimating: false,
  });

  const handleControlsChange = useCallback(() => {
    if (controlsRef.current) {
      setCurrentDistance(controlsRef.current.object.position.length());
      const controls = controlsRef.current;
      const now = performance.now();
      const azimuthal = controls.getAzimuthalAngle();
      const polar = controls.getPolarAngle();
      if (inertiaRef.current.isUserInteracting) {
        const dt = (now - inertiaRef.current.lastTime) / 1000;
        if (dt > 0) {
          inertiaRef.current.velocityAzimuthal =
            (azimuthal - inertiaRef.current.lastAzimuthal) / dt;
          inertiaRef.current.velocityPolar = (polar - inertiaRef.current.lastPolar) / dt;
        }
      }
      inertiaRef.current.lastAzimuthal = azimuthal;
      inertiaRef.current.lastPolar = polar;
      inertiaRef.current.lastTime = now;
    }
  }, [controlsRef]);

  const onControlsStart = useCallback(() => {
    inertiaRef.current.isUserInteracting = true;
    if (inertiaRef.current.animationFrame) {
      cancelAnimationFrame(inertiaRef.current.animationFrame);
      inertiaRef.current.animationFrame = 0;
      inertiaRef.current.isAnimating = false;
    }
  }, []);

  const onControlsEnd = useCallback(() => {
    inertiaRef.current.isUserInteracting = false;
    if (
      Math.abs(inertiaRef.current.velocityAzimuthal) < 0.0001 &&
      Math.abs(inertiaRef.current.velocityPolar) < 0.0001
    ) {
      return;
    }
    const animateInertia = () => {
      if (!controlsRef.current) return;
      const vA = Math.abs(inertiaRef.current.velocityAzimuthal);
      const vP = Math.abs(inertiaRef.current.velocityPolar);
      const baseDampingA = 0.97,
        maxDampingA = 0.98;
      const baseDampingP = 0.97,
        maxDampingP = 0.98;
      const sigmoid = (x: number) => 1 / (1 + Math.exp(-2.0 * (x - 0.2)));
      const dampingA = baseDampingA + (maxDampingA - baseDampingA) * sigmoid(vA);
      const dampingP = baseDampingP + (maxDampingP - baseDampingP) * sigmoid(vP);
      const maxVA = (0.4 * (currentDistance - radius)) / radius;
      const maxVP = (0.2 * (currentDistance - radius)) / radius;
      inertiaRef.current.velocityAzimuthal = Math.min(
        Math.max(inertiaRef.current.velocityAzimuthal * dampingA, -maxVA),
        maxVA
      );
      inertiaRef.current.velocityPolar = Math.min(
        Math.max(inertiaRef.current.velocityPolar * dampingP, -maxVP),
        maxVP
      );
      if (
        Math.abs(inertiaRef.current.velocityAzimuthal) < 0.0001 &&
        Math.abs(inertiaRef.current.velocityPolar) < 0.0001
      ) {
        inertiaRef.current.isAnimating = false;
        inertiaRef.current.animationFrame = 0;
        return;
      }
      controlsRef.current.setAzimuthalAngle(
        controlsRef.current.getAzimuthalAngle() +
          inertiaRef.current.velocityAzimuthal * 0.016
      );
      controlsRef.current.setPolarAngle(
        controlsRef.current.getPolarAngle() + inertiaRef.current.velocityPolar * 0.016
      );
      controlsRef.current.update();
      inertiaRef.current.animationFrame = requestAnimationFrame(animateInertia);
      inertiaRef.current.isAnimating = true;
    };
    animateInertia();
  }, [controlsRef, currentDistance, radius]);

  return {
    currentDistance,
    handleControlsChange,
    onControlsStart,
    onControlsEnd,
  };
}
