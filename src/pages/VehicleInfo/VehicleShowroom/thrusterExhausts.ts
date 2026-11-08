import { Object3D, Quaternion, Vector3 } from "three";

export function getMainEngineExhausts(root: Object3D) {
  const exhausts: {
    id: string;
    node: Object3D;
    position: Vector3;
    rotation: Quaternion;
  }[] = [];
  root.updateMatrixWorld(true);
  root.traverse((mount) => {
    if (
      !/^hardpoint_(?:thruster_main|main_thruster)(?:_|$)/i.test(
        mount.userData.sourceName ?? ""
      )
    )
      return;
    mount.traverse((node) => {
      if (!/^exhaust(?:_|$)/i.test(node.userData.sourceName ?? "")) return;
      // The source's exhaust axis is local -Y; the preview cone points along +Y.
      const direction = new Vector3(0, -1, 0).transformDirection(node.matrixWorld);
      exhausts.push({
        id: node.name,
        node,
        position: node.getWorldPosition(new Vector3()),
        rotation: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction),
      });
    });
  });
  return exhausts;
}
