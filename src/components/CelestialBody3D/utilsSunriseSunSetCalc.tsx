/* Most functions in thie file are adapted from:
 * https://docs.google.com/document/d/1hq8i6gcf2BmMTr7yTCOg8S_ngjhb6095HKPCds0_exs/
 * by Murphy Exploration Group
 *
 * All the coordinates in this file are using Star Citizen's coordinate system,
 * which is X-right, Z-up, Y-forward
 */

import { getCurrentCycle, modulo } from "./utils";

/**
 * Get parentStar's ECEF (Earth centered / earth fixed) coordinates.
 * @param cb CelestialBody
 */
export function getParentStarECEFCoords(cb: CelestialBody): [number, number, number] {
  if (!cb.parentStar) return [0, 0, 0];

  const parentStar = cb.parentStar;
  const sx = parentStar.coordinateX;
  const sy = parentStar.coordinateY;
  const sz = parentStar.coordinateZ;
  const bx = cb.coordinateX;
  const by = cb.coordinateY;
  const bz = cb.coordinateZ;
  const qw = parentStar.quaternionW;
  const qx = parentStar.quaternionX;
  const qy = parentStar.quaternionY;
  const qz = parentStar.quaternionZ;

  const bsx =
    (1 - 2 * qy * qy - 2 * qz * qz) * (sx - bx) +
    (2 * qx * qy - 2 * qz * qw) * (sy - by) +
    (2 * qx * qz + 2 * qy * qw) * (sz - bz);
  const bsy =
    (2 * qx * qy + 2 * qz * qw) * (sx - bx) +
    (1 - 2 * qx * qx - 2 * qz * qz) * (sy - by) +
    (2 * qy * qz - 2 * qx * qw) * (sz - bz);
  const bsz =
    (2 * qx * qz - 2 * qy * qw) * (sx - bx) +
    (2 * qy * qz + 2 * qx * qw) * (sy - by) +
    (1 - 2 * qx * qx - 2 * qy * qy) * (sz - bz);
  return [bsx, bsy, bsz];
}

/* The solar declination is the angle of the star above or below the planet’s equator projected into space. */
export function getParentStarDeclinationDeg(cb: CelestialBody): number {
  const [bsx, bsy, bsz] = getParentStarECEFCoords(cb);
  const r = Math.sqrt(bsx * bsx + bsy * bsy + bsz * bsz);
  const xy = Math.sqrt(bsx * bsx + bsy * bsy);
  // Avoid division by zero
  if (r === 0 || xy === 0) return 0;
  const numerator = r * r + xy * xy - bsz * bsz;
  const denominator = 2 * r * xy;
  let angleRad = Math.acos(Math.max(-1, Math.min(1, numerator / denominator)));
  // Apply sign based on bsz
  if (bsz < 0) angleRad *= -1;
  return (angleRad * 180) / Math.PI;
}

export function getParentStarApparentRadiusDeg(cb: CelestialBody): number {
  if (!cb.parentStar) return 0;
  const [bsx, bsy, bsz] = getParentStarECEFCoords(cb);
  const radiusStar = cb.parentStar.bodyRadius;
  const distance = Math.sqrt(bsx * bsx + bsy * bsy + bsz * bsz);
  if (distance === 0) return 0;
  // Clamp value to [-1, 1] to avoid NaN from floating point errors
  const ratio = Math.max(-1, Math.min(1, radiusStar / distance));
  const angleRad = Math.asin(ratio);
  return (angleRad * 180) / Math.PI;
}

export function getLengthOfDayInRealDay(hoursPerCycle: number): number {
  return hoursPerCycle / 24;
}

export function getCurrentRotationDegRaw(
  hoursPerCycle: number,
  rotationCorrection: number
): number {
  const cycles = getCurrentCycle(hoursPerCycle);
  const rotDeg = modulo(cycles, 1) * 360;
  const correctedRotDeg = 360 - rotDeg - rotationCorrection;
  const result = modulo(correctedRotDeg - 90, 360);
  return result;
}

export function getMeridianDeg(cb: CelestialBody): number {
  const [bsx, bsy] = getParentStarECEFCoords(cb);
  const rawAngle = Math.atan2(bsy, bsx);
  const angleRad = modulo(rawAngle, 2 * Math.PI);
  return (angleRad * 180) / Math.PI;
}

export function getParentStarLongitudeDeg(cb: CelestialBody): number {
  const currentRotation = getCurrentRotationDegRaw(
    cb.hoursPerCycle || 0,
    cb.rotationCorrection || 0
  );
  const meridian = getMeridianDeg(cb);
  const meridianMod = modulo(0 - meridian, 360);
  let solarLongitude = currentRotation - meridianMod;
  if (solarLongitude > 180) {
    return solarLongitude - 360;
  }
  if (solarLongitude < -180) {
    return solarLongitude + 360;
  }
  return solarLongitude;
}

export function getLatitude(location: SCLocation): number {
  const X = location.coordinateX;
  const Y = location.coordinateY;
  const Z = location.coordinateZ;
  const latitudeRad = Math.atan2(Z, Math.sqrt(X * X + Y * Y));
  return (latitudeRad * 180) / Math.PI;
}

/**
 * Locations in longitude 0-180 are in the Eastern Hemisphere;
 * Locations in longitude 180-359 are in the Western Hemisphere.
 * @param location
 * @returns
 */
export function getLongitude360(location: SCLocation): number {
  const X = location.coordinateX;
  const Y = location.coordinateY;
  const latitude = getLatitude(location);
  if (Math.abs(latitude) === 90) return 0;

  const rawLonRad = Math.atan2(Y, X);
  const longitude360 = (modulo(rawLonRad, 2 * Math.PI) * 180) / Math.PI;
  return longitude360;
}

export function getLongitude(location: SCLocation): number {
  let degLon = getLongitude360(location);
  if (degLon > 180) {
    return degLon - 360;
  } else {
    return degLon;
  }
}

export function getHeight(location: SCLocation): number {
  const X = location.coordinateX;
  const Y = location.coordinateY;
  const Z = location.coordinateZ;
  const bodyRadius = location.parentBody?.bodyRadius || 0;
  const height = Math.sqrt(X * X + Y * Y + Z * Z) - bodyRadius;
  return height;
}

export function getElevationCorrection(location: SCLocation): number {
  if (!location.parentBody) return 0;
  const bodyRadius = location.parentBody.bodyRadius;
  const height = getHeight(location);
  const effectiveHeight = height < 0 ? 0 : height;
  const denominator = bodyRadius + effectiveHeight;
  if (denominator === 0) return 0;
  // Clamp value to [-1, 1] to avoid NaN from floating point errors
  const ratio = Math.max(-1, Math.min(1, bodyRadius / denominator));
  const angleRad = Math.acos(ratio);
  return (angleRad * 180) / Math.PI;
}

/**
 * Sunrise occurs between 180 and 0, sunset occurs between 0 and -180.
 *
 * @param location
 * @returns
 */
export function getSunriseSunsetHourAngleDeg(location: SCLocation): number {
  if (!location.parentBody) return NaN;
  const locationLatitude = getLatitude(location);
  const solarDeclination = getParentStarDeclinationDeg(location.parentBody);
  const solarApparentRadius = getParentStarApparentRadiusDeg(location.parentBody);
  const elevationCorrection = getElevationCorrection(location);
  // Convert degrees to radians for trigonometric functions
  const latRad = (locationLatitude * Math.PI) / 180;
  const declRad = (solarDeclination * Math.PI) / 180;
  // Calculate the core hour angle in radians
  let core = -Math.tan(latRad) * Math.tan(declRad);
  if (core < -1) return Infinity; /* Polar day */
  if (core > 1) return -Infinity; /* Polar night */
  let hourAngleDeg = (Math.acos(core) * 180) / Math.PI;
  // Add apparent radius and elevation correction
  hourAngleDeg += solarApparentRadius + elevationCorrection;
  return hourAngleDeg;
}

/**
 * Hour Angle goes from +180 to -180 degrees.
 * Hour Angle = +180 -> midnight;
 * Hour Angle > 0 -> morning;
 * Hour Angle = 0 -> noon;
 * Hour Angle < 0 -> afternoon;
 * Hour Angle = -180 -> midnight.
 * @param location
 * @returns
 */
export function getCurrentHourAngle(location: SCLocation): number {
  const body = location.parentBody;
  if (!body) return NaN;
  const currentRotation = getCurrentRotationDegRaw(
    body.hoursPerCycle || 0,
    body.rotationCorrection || 0
  );
  const locationLongitude360 = getLongitude360(location);
  const meridian = getMeridianDeg(body);
  const delta = modulo(locationLongitude360 - meridian, 360);
  const rawHourAngle = modulo(currentRotation - delta, 360);
  if (rawHourAngle > 180) {
    return rawHourAngle - 360;
  }
  return rawHourAngle;
}

export function getRotateDegreesPerMinute(location: SCLocation): number {
  const body = location.parentBody;
  if (!body || !body.hoursPerCycle) return 0;
  return 360 / (body.hoursPerCycle * 60);
}

export function getMinutesToNextSunrise(
  location: SCLocation,
  offsetDegree: number = 0
): number {
  const currentHourAngle = getCurrentHourAngle(location);
  const sunriseHourAngle = getSunriseSunsetHourAngleDeg(location) + offsetDegree;
  if (isNaN(sunriseHourAngle)) return NaN;
  const rotateDegreesPerMinute = getRotateDegreesPerMinute(location);
  const angleToSunrise = -sunriseHourAngle + currentHourAngle;
  if (angleToSunrise < 0) {
    return (360 + angleToSunrise) / rotateDegreesPerMinute;
  }
  return angleToSunrise / rotateDegreesPerMinute;
}

export function getMinutesToNextSunset(
  location: SCLocation,
  offsetDegree: number = 0
): number {
  const currentHourAngle = getCurrentHourAngle(location);
  const sunsetHourAngle = -getSunriseSunsetHourAngleDeg(location) - offsetDegree;
  if (isNaN(sunsetHourAngle)) return NaN;
  const rotateDegreesPerMinute = getRotateDegreesPerMinute(location);
  const angleToSunset = -sunsetHourAngle + currentHourAngle;
  if (angleToSunset < 0) {
    return (360 + angleToSunset) / rotateDegreesPerMinute;
  }
  return angleToSunset / rotateDegreesPerMinute;
}

export function isLocationInDaylight(location: SCLocation): boolean {
  const currentHourAngle = getCurrentHourAngle(location);
  const sunriseHourAngle = getSunriseSunsetHourAngleDeg(location);
  if (isNaN(sunriseHourAngle)) return true;
  return Math.abs(currentHourAngle) < sunriseHourAngle;
}

export function getLengthOfDaylightInMinutes(location: SCLocation): number {
  const sunriseHourAngle = getSunriseSunsetHourAngleDeg(location);
  if (isNaN(sunriseHourAngle)) return 0;
  const rotateDegreesPerMinute = getRotateDegreesPerMinute(location);
  return (2 * sunriseHourAngle) / rotateDegreesPerMinute;
}

export function getLengthOfNightInMinutes(location: SCLocation): number {
  const sunriseHourAngle = getSunriseSunsetHourAngleDeg(location);
  if (isNaN(sunriseHourAngle)) return 0;
  const rotateDegreesPerMinute = getRotateDegreesPerMinute(location);
  return (360 - 2 * sunriseHourAngle) / rotateDegreesPerMinute;
}
