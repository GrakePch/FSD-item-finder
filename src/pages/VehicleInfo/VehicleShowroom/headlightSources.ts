import { Object3D, Quaternion, SpotLight, Vector3 } from "three";

export function getHeadlightSources(root: Object3D) {
  const beams: {
    id: string;
    position: Vector3;
    rotation: Quaternion;
    length: number;
    radius: number;
  }[] = [];
  root.updateMatrixWorld(true);
  root.traverse((light) => {
    if (
      !(light instanceof SpotLight) ||
      !/headlights?|landing.?lights?/i.test(light.name)
    )
      return;
    const position = light.getWorldPosition(new Vector3());
    const direction = light.target
      .getWorldPosition(new Vector3())
      .sub(position)
      .normalize();
    // Keep the visible scattering local to the ship, rather than drawing the
    // full authored light range across the information panel.
    const length = Math.min(light.distance || 18, 18);
    beams.push({
      id: light.name,
      position,
      rotation: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction),
      length,
      radius: Math.tan(light.angle) * length,
    });
  });
  return beams;
}
