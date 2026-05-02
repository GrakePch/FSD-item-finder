import "./SearchResultList.css";
import { useNavigate, useSearchParams } from "react-router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ContextAllData } from "../../../contexts";
import SearchResultListItem from "./SearchResultListItem";

const RESULT_ROW_HEIGHT = 56;
const RESULT_OVERSCAN = 8;

const SearchResultList = ({ results }: { results: Item[] }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dictItems } = useContext(ContextAllData);
  const listRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const hasLoadedItemPrices = useMemo(
    () =>
      Object.values(dictItems).some(
        (item) =>
          item.price_min_max.buy_min ||
          item.price_min_max.sell_min ||
          item.price_min_max.rent_min
      ),
    [dictItems]
  );

  useEffect(() => {
    const updateVisibleRange = () => {
      const listElement = listRef.current;
      if (!listElement || results.length === 0) {
        setVisibleRange({ start: 0, end: 0 });
        return;
      }

      const rect = listElement.getBoundingClientRect();
      const start = Math.max(
        0,
        Math.floor(-rect.top / RESULT_ROW_HEIGHT) - RESULT_OVERSCAN
      );
      const end = Math.max(
        0,
        Math.min(
          results.length,
          Math.ceil((window.innerHeight - rect.top) / RESULT_ROW_HEIGHT) +
            RESULT_OVERSCAN
        )
      );

      setVisibleRange((currentRange) =>
        currentRange.start === start && currentRange.end === end
          ? currentRange
          : { start, end }
      );
    };

    updateVisibleRange();

    window.addEventListener("scroll", updateVisibleRange, { passive: true });
    window.addEventListener("resize", updateVisibleRange);

    return () => {
      window.removeEventListener("scroll", updateVisibleRange);
      window.removeEventListener("resize", updateVisibleRange);
    };
  }, [results.length]);

  const handleResultClick = (key: string) => {
    navigate(`/i/${key}?${searchParams.toString()}`);
  };

  const visibleResults = results.slice(visibleRange.start, visibleRange.end);

  return (
    <div className="SearchResultList" ref={listRef}>
      <div
        className="virtual-result-spacer"
        style={{ height: results.length * RESULT_ROW_HEIGHT }}
      >
        {visibleResults.map((item, index) => (
          <SearchResultListItem
            hasLoadedItemPrices={hasLoadedItemPrices}
            item={item}
            key={item.key}
            onClick={handleResultClick}
            top={(visibleRange.start + index) * RESULT_ROW_HEIGHT}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResultList;
