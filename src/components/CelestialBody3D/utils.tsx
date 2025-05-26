export function getNumDaysSinceAnchor() {
  const anchor = new Date("2020-01-01T00:00:00.000Z");
  const now = new Date();
  const timeSinceAnchor = now.getTime() - anchor.getTime();
  return timeSinceAnchor / 1000 / 60 / 60 / 24;
}

export const modulo = (dividend: number, divisor: number) => {
  return ((dividend % divisor) + divisor) % divisor;
};

export function getCurrentCycle(HoursPerCycle: number) {
  if (HoursPerCycle === 0) {
    return 0;
  } else {
    return (getNumDaysSinceAnchor() / HoursPerCycle) * 24;
  }
}

/**
 * Get Rotation degrees of celestial body (adapted from Eyes on Star Citizen)
 * @param hoursPerCycle
 * @param rotationCorrection
 * @returns
 */
export function getRotationDeg(hoursPerCycle: number, rotationCorrection: number) {
  const cycle = getCurrentCycle(hoursPerCycle);
  const rotDeg = modulo(cycle, 1) * 360;
  const correctedRotDeg = 360 - rotDeg - rotationCorrection;
  const result = modulo(90 - correctedRotDeg, 360);
  return result;
}
