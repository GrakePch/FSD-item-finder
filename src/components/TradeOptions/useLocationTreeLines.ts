import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { LocationTreeRow, TreeLine } from "./types";

export const useLocationTreeLines = (rows: LocationTreeRow[]) => {
  const treeListRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [treeLines, setTreeLines] = useState<TreeLine[]>([]);
  const [treeSvgSize, setTreeSvgSize] = useState({ width: 0, height: 0 });

  const setRowRef = useCallback((rowId: string, element: HTMLDivElement | null) => {
    if (element) {
      rowRefs.current.set(rowId, element);
    } else {
      rowRefs.current.delete(rowId);
    }
  }, []);

  const updateTreeLines = useCallback(() => {
    const treeListElement = treeListRef.current;
    if (!treeListElement) return;

    const containerRect = treeListElement.getBoundingClientRect();
    const nextLines: TreeLine[] = [];
    const childrenByParent = new Map<string, LocationTreeRow[]>();

    rows.forEach((row) => {
      if (!row.parentId) return;
      childrenByParent.set(row.parentId, [
        ...(childrenByParent.get(row.parentId) || []),
        row,
      ]);
    });

    childrenByParent.forEach((childRows, parentId) => {
      const parentElement = rowRefs.current.get(parentId);
      if (!parentElement) return;

      const parentRect = parentElement.getBoundingClientRect();
      const parentY = parentRect.top - containerRect.top + parentRect.height / 2;
      const childAnchors = childRows
        .map((childRow) => {
          const childElement = rowRefs.current.get(childRow.id);
          const childChips = childElement?.querySelector(".LocationPathChips");
          if (!childElement || !childChips) return null;

          const childRect = childElement.getBoundingClientRect();
          const childChipsRect = childChips.getBoundingClientRect();

          return {
            row: childRow,
            y: childRect.top - containerRect.top + childRect.height / 2,
            chipX: childChipsRect.left - containerRect.left,
          };
        })
        .filter(Boolean) as {
        row: LocationTreeRow;
        y: number;
        chipX: number;
      }[];

      if (childAnchors.length <= 0) return;

      const branchX = Math.max(
        0,
        Math.min(...childAnchors.map((anchor) => anchor.chipX)) - 12
      );
      const sortedY = childAnchors.map((anchor) => anchor.y).toSorted((a, b) => a - b);

      nextLines.push({
        id: `${parentId}__vertical`,
        x1: branchX,
        y1: Math.min(parentY + 12, sortedY[0]),
        x2: branchX,
        y2: sortedY[sortedY.length - 1],
      });

      childAnchors.forEach((anchor) => {
        nextLines.push({
          id: `${parentId}__${anchor.row.id}`,
          x1: branchX,
          y1: anchor.y,
          x2: anchor.chipX,
          y2: anchor.y,
        });
      });
    });

    setTreeSvgSize({
      width: containerRect.width,
      height: containerRect.height,
    });
    setTreeLines(nextLines);
  }, [rows]);

  useLayoutEffect(() => {
    updateTreeLines();

    const resizeObserver = new ResizeObserver(updateTreeLines);
    if (treeListRef.current) resizeObserver.observe(treeListRef.current);
    rowRefs.current.forEach((element) => resizeObserver.observe(element));
    window.addEventListener("resize", updateTreeLines);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateTreeLines);
    };
  }, [rows, updateTreeLines]);

  return {
    setRowRef,
    treeLines,
    treeListRef,
    treeSvgSize,
  };
};
