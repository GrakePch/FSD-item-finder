import { useEffect, useState } from "react";
import { getRotationDeg } from "./utils";

export function useParentStarRotation({
  celestialBody,
  parentStarPositionRelInitial,
}: {
  celestialBody: any;
  parentStarPositionRelInitial: [number, number, number];
}) {
  const [rotation, setRotation] = useState(() => {
    const deg = -getRotationDeg(
      celestialBody.hoursPerCycle,
      celestialBody.rotationCorrection || 0
    );
    const rad = (deg * Math.PI) / 180;
    const [x, y, z] = parentStarPositionRelInitial;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      parentStarRotateDeg: deg,
      parentStarPositionRelRotated: [
        x * cos + z * sin,
        y,
        -x * sin + z * cos,
      ] as [number, number, number],
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const deg = -getRotationDeg(
        celestialBody.hoursPerCycle,
        celestialBody.rotationCorrection || 0
      );
      const rad = (deg * Math.PI) / 180;
      const [x, y, z] = parentStarPositionRelInitial;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      setRotation({
        parentStarRotateDeg: deg,
        parentStarPositionRelRotated: [
          x * cos + z * sin,
          y,
          -x * sin + z * cos,
        ],
      });
    }, 1);
    return () => clearInterval(interval);
  }, [celestialBody, parentStarPositionRelInitial]);

  return rotation;
}
