export function getNumDaysSinceAnchor() {
  const anchor = new Date("2020-01-01T00:00:00.000Z");
  let now: Date;
  /* If running in a browser, use the URL parameter "datetime" to set the current time.
   * If the parameter is not set or invalid, use the current time. */
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const dt = params.get("datetime");
    if (dt) {
      const parsed = new Date(dt);
      if (!isNaN(parsed.getTime())) {
        now = parsed;
      } else {
        now = new Date();
      }
    } else {
      now = new Date();
    }
  } else {
    now = new Date();
  }
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

/**
 * Convert Star Citizen coordinates (X, Y, Z) to three.js coordinates (X, Z, -Y).
 * SC: X (east), Y (up), Z (north)
 * three.js: X (right), Y (up), Z (backward)
 */
export function scToThree([x, y, z]: [number, number, number]): [number, number, number] {
  return [x, z, -y];
}

export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export interface SphericalCoordinates {
  r: number;
  theta: number;
  phi: number;
}

export function cartesianToSpherical(
  x: number,
  y: number,
  z: number
): SphericalCoordinates {
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.atan2(z, x); // azimuthal angle: randian in the xz-plane from the positive x
  const phi = Math.acos(y / r); // polar angle: radian from the positive y
  return { r: r, theta: theta, phi: phi };
}

export function sphericalToCartesian(
  r: number,
  theta: number,
  phi: number
): [number, number, number] {
  const x = r * Math.cos(theta) * Math.sin(phi);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(theta) * Math.sin(phi);
  return [x, y, z];
}

/* Spherical to Latitude-longitude coordinates centered at OM-5 */
export interface LatLongCoordinates {
  lat: number;
  long: number;
}

export function sphericalToLatLong(theta: number, phi: number): LatLongCoordinates {
  const latitude = Math.PI / 2 - phi;
  let longitude = 2 * Math.PI - theta;
  if (longitude > Math.PI) {
    longitude -= Math.PI * 2;
  }
  return { lat: radToDeg(latitude), long: radToDeg(longitude) };
}

export function cartesianToLatLong(x: number, y: number, z: number): LatLongCoordinates {
  const sph: SphericalCoordinates = cartesianToSpherical(x, y, z);
  return sphericalToLatLong(sph.theta, sph.phi);
}

/* Pretty print */

export function formatAngle(degrees: number): string {
  const isNeg = degrees < 0;
  degrees = isNeg ? -degrees : degrees;
  const degreeNumber = Math.floor(degrees);
  const remainMinutes = (degrees - degreeNumber) * 60;
  const minuteNumber = Math.floor(remainMinutes);
  const remainSeconds = (remainMinutes - minuteNumber) * 60;
  const secondNumber = Math.round(remainSeconds);
  return `${isNeg ? "-" : ""}${degreeNumber}° ${minuteNumber
    .toString()
    .padStart(2, "0")}' ${secondNumber.toString().padStart(2, "0")}"`;
}

export function formatLatitude(degree: number): string {
  return degree === 0
    ? formatAngle(degree)
    : degree > 0
    ? formatAngle(degree) + " N"
    : formatAngle(-degree) + " S";
}

export function formatLongitude(degree: number): string {
  return degree === 0
    ? formatAngle(degree)
    : degree > 0
    ? formatAngle(degree) + " E"
    : formatAngle(-degree) + " W";
}

export function formatTime(hours: number): string {
  if (hours === Infinity) return "∞";
  if (hours === -Infinity) return "∞";
  const hourNumber = Math.floor(hours);
  const remainMinutes = (hours - hourNumber) * 60;
  const minuteNumber = Math.floor(remainMinutes);
  const remainSeconds = (remainMinutes - minuteNumber) * 60;
  const secondNumber = Math.round(remainSeconds);
  return `${hourNumber}:${minuteNumber.toString().padStart(2, "0")}:${secondNumber
    .toString()
    .padStart(2, "0")}`;
}
