import { Vector3 } from "three";

/**
 * Rotation direction arrows on the equatorial plane.
 *
 * The abstract equatorial circle lives in the X-Z plane (Y = 0 in three.js):
 * Star Citizen is Z-up, and the codebase maps SC's up axis to +Y. OM-5 (+X),
 * OM-3 (-Z), OM-6 (-X) and OM-4 (+Z) all lie on it.
 *
 * Phase angle φ is measured from +X (OM-5) and increases along the rotation
 * direction. Viewed from +Y (north pole), SC planets rotate counter-clockwise,
 * i.e. +X → -Z → -X → +Z, so the arrow tip points toward increasing φ.
 *
 * Each arrow's shaft is a 1/8-orbit arc (45°) of that circle, centered on the
 * arc between OM-3 and OM-5, and mirrored on the opposite side between OM-4
 * and OM-6. The orbit itself is abstract — only the shaft and the line-art
 * arrowhead are rendered, styled like the OM lines (same color).
 */
const ORBIT_RADIUS_FACTOR = 1.5; // 1.5× body radius; abstract, never rendered
const SHAFT_ARC_DEG = 45; // 1/8 of the orbit
const SHAFT_SEGMENTS = 12;
const HEAD_LENGTH_FACTOR = 0.15; // relative to orbit radius
const HEAD_ANGLE_DEG = 45; // half spread of the two head lines (90° total)

// Phase (in degrees) of the shaft center for each arrow. Center at 45° sits
// between OM-5 (+X, 0°) and OM-3 (-Z, 90°); 225° between OM-6 (-X, 180°) and
// OM-4 (+Z, 270°) — the two arrows are on opposite sides of the planet.
const ARROWS = [{ centerDeg: 45 }, { centerDeg: 225 }];

/** Point on the abstract equatorial circle at the given phase (degrees). */
function pointOnEquator(orbitRadius: number, phaseDeg: number): Vector3 {
  const phi = (phaseDeg * Math.PI) / 180;
  return new Vector3(
    orbitRadius * Math.cos(phi),
    0,
    -orbitRadius * Math.sin(phi)
  );
}

function Line({ points, color }: { points: number[]; color: string }) {
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={1} />
    </line>
  );
}

function ArrowShaft({
  orbitRadius,
  centerDeg,
  color,
}: {
  orbitRadius: number;
  centerDeg: number;
  color: string;
}) {
  const startDeg = centerDeg - SHAFT_ARC_DEG / 2;
  const endDeg = centerDeg + SHAFT_ARC_DEG / 2;
  const points: number[] = [];
  for (let i = 0; i <= SHAFT_SEGMENTS; i++) {
    const p = pointOnEquator(
      orbitRadius,
      startDeg + (endDeg - startDeg) * (i / SHAFT_SEGMENTS)
    );
    points.push(p.x, p.y, p.z);
  }
  return <Line points={points} color={color} />;
}

function ArrowHead({
  orbitRadius,
  tipDeg,
  color,
}: {
  orbitRadius: number;
  tipDeg: number;
  color: string;
}) {
  // Tip sits at the leading end of the shaft (rotation direction). The two
  // head lines spread backward from the tip by ±HEAD_ANGLE_DEG.
  const tip = pointOnEquator(orbitRadius, tipDeg);
  const length = HEAD_LENGTH_FACTOR * orbitRadius;
  const tipRad = (tipDeg * Math.PI) / 180;
  const spread = (HEAD_ANGLE_DEG * Math.PI) / 180;
  const headEnd1 = new Vector3(
    tip.x + length * Math.sin(tipRad - spread),
    0,
    tip.z + length * Math.cos(tipRad - spread)
  );
  const headEnd2 = new Vector3(
    tip.x + length * Math.sin(tipRad + spread),
    0,
    tip.z + length * Math.cos(tipRad + spread)
  );
  return (
    <>
      <Line points={[...tip.toArray(), ...headEnd1.toArray()]} color={color} />
      <Line points={[...tip.toArray(), ...headEnd2.toArray()]} color={color} />
    </>
  );
}

export default function RotationDirectionArrows({
  radius,
  color = "#808080",
}: {
  radius: number;
  color?: string;
}) {
  const orbitRadius = ORBIT_RADIUS_FACTOR * radius;
  return (
    <>
      {ARROWS.map(({ centerDeg }) => (
        <group key={centerDeg}>
          <ArrowShaft
            orbitRadius={orbitRadius}
            centerDeg={centerDeg}
            color={color}
          />
          <ArrowHead
            orbitRadius={orbitRadius}
            tipDeg={centerDeg + SHAFT_ARC_DEG / 2}
            color={color}
          />
        </group>
      ))}
    </>
  );
}
