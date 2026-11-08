import { Box3, MathUtils, Spherical, Vector3 } from "three";

export const MODEL_FOV = 36;

export function fitHullDistance(bounds: Box3, width: number, height: number) {
  const forward = new Vector3(-0.8, 0.65, -1).normalize();
  const right = new Vector3(0, 1, 0).cross(forward).normalize();
  const up = forward.clone().cross(right).normalize();
  const tanVertical = Math.tan(MathUtils.degToRad(MODEL_FOV / 2));
  const tanHorizontal = (tanVertical * Math.max(1, width)) / Math.max(1, height);
  let distance = 0;
  const center = bounds.getCenter(new Vector3());
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new Vector3(x, y, z).sub(center);
        distance = Math.max(
          distance,
          corner.dot(forward) +
            Math.max(
              Math.abs(corner.dot(right)) / tanHorizontal,
              Math.abs(corner.dot(up)) / tanVertical
            )
        );
      }
  return distance * 1.08;
}

export function createCameraReset(
  position: Vector3,
  target: Vector3,
  destination: Vector3,
  destinationTarget: Vector3,
  startedAt: number
) {
  const from = new Spherical().setFromVector3(position.clone().sub(target));
  const to = new Spherical().setFromVector3(destination.clone().sub(destinationTarget));
  const thetaDelta =
    MathUtils.euclideanModulo(to.theta - from.theta + Math.PI, Math.PI * 2) - Math.PI;
  return {
    from,
    to,
    thetaDelta,
    targetFrom: target.clone(),
    targetTo: destinationTarget.clone(),
    startedAt,
  };
}

export type CameraReset = ReturnType<typeof createCameraReset>;

export function sampleCameraReset(
  transition: CameraReset,
  now: number,
  position: Vector3,
  target: Vector3
) {
  const t = MathUtils.clamp((now - transition.startedAt) / 325, 0, 1);
  const eased = t * t * (3 - 2 * t);
  const orbit = new Spherical(
    MathUtils.lerp(transition.from.radius, transition.to.radius, eased),
    MathUtils.lerp(transition.from.phi, transition.to.phi, eased),
    transition.from.theta + transition.thetaDelta * eased
  );
  target.lerpVectors(transition.targetFrom, transition.targetTo, eased);
  position.setFromSpherical(orbit).add(target);
  return t === 1;
}
