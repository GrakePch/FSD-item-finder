import type { LocationForestMap, LocationTree, LocationTreeRow, LocationTreeShallow } from "./types";

export const addToTree = (
  forest: LocationForestMap,
  path: string[],
  option: TradeOption
) => {
  let current = forest;
  path.forEach((node, index) => {
    if (!current[node]) {
      current[node] = {
        name: node,
        subs: {},
      };
    }
    if (index === path.length - 1) current[node].option = option;
    current = current[node].subs;
  });
};

export const optimizeForest = (
  newForest: LocationTreeShallow[],
  oldForest: LocationForestMap,
  depth: number
) => {
  for (const oldTree of Object.values(oldForest)) {
    const newTree: LocationTreeShallow = {
      depth,
      locs: [oldTree.name],
      subs: [],
      option: oldTree.option,
    };

    const subCount = Object.keys(oldTree.subs).length;
    if (subCount > 1) {
      optimizeForest(newTree.subs, oldTree.subs, depth + 1);
    } else if (subCount === 1) {
      optimizeTree(newTree, oldTree, depth + 1);
    }

    newForest.push(newTree);
  }
};

export const flattenLocationForest = (
  forest: LocationTreeShallow[],
  parentId?: string
): LocationTreeRow[] =>
  forest.flatMap((tree, index) => {
    const idParts = [
      parentId,
      tree.depth,
      tree.locs.join("/"),
      tree.option?.id_terminal,
      index,
    ].filter(Boolean);
    const id = idParts.join("__");
    const row = {
      id,
      parentId,
      locs: tree.locs,
      depth: tree.depth,
      option: tree.option,
    };

    return [row, ...flattenLocationForest(tree.subs, id)];
  });

const optimizeTree = (
  newTree: LocationTreeShallow,
  oldTree: LocationTree,
  depth: number
) => {
  const onlySubTree = Object.values(oldTree.subs)[0];
  if (!onlySubTree) return;
  newTree.locs.push(onlySubTree.name);
  newTree.option = onlySubTree.option;

  const subCount = Object.keys(onlySubTree.subs).length;
  if (subCount === 1) {
    optimizeTree(newTree, onlySubTree, depth + 1);
  } else if (subCount > 1) {
    optimizeForest(newTree.subs, onlySubTree.subs, depth + 1);
  }
};
