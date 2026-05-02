import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { ContextAllData } from "../../contexts";
import { flattenLocationForest } from "./locationTree";
import LocationTreeListRow from "./LocationTreeListRow";
import type { LocationTreeShallow, TradeType } from "./types";
import { useLocationTreeLines } from "./useLocationTreeLines";

type LocationTreeListProps = {
  forest: LocationTreeShallow[];
  priceMin: number;
  tradeType: TradeType;
};

const LocationTreeList = ({ forest, priceMin, tradeType }: LocationTreeListProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { dictTerminals } = useContext(ContextAllData);
  const rows = useMemo(() => flattenLocationForest(forest), [forest]);
  const { setRowRef, treeLines, treeListRef, treeSvgSize } =
    useLocationTreeLines(rows);

  return (
    <div className="location-tree-list" ref={treeListRef}>
      <svg
        className="location-tree-lines"
        width={treeSvgSize.width}
        height={treeSvgSize.height}
        viewBox={`0 0 ${treeSvgSize.width} ${treeSvgSize.height}`}
        aria-hidden="true"
      >
        {treeLines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
          />
        ))}
      </svg>
      {rows.map((row) => (
        <LocationTreeListRow
          key={row.id}
          row={row}
          tradeType={tradeType}
          priceMin={priceMin}
          setRowRef={setRowRef}
          onOptionClick={(option) => {
            searchParams.delete("key");
            navigate("/t/" + option.id_terminal + "?" + searchParams.toString());
          }}
          dictTerminals={dictTerminals}
          t={t}
        />
      ))}
    </div>
  );
};

export default LocationTreeList;
