import Icon from "@mdi/react";
import { mdiAlertCircleOutline } from "@mdi/js";
import LocationPathChips from "../LocationPathChips/LocationPathChips";
import { colorPrice, date4_0, getLocPath, readableDistance } from "../../utils";
import type { LocationTreeRow, TradeType } from "./types";

type LocationTreeListRowProps = {
  row: LocationTreeRow;
  tradeType: TradeType;
  priceMin: number;
  styles: Record<string, string>;
  setRowRef: (rowId: string, element: HTMLDivElement | null) => void;
  onOptionClick: (option: TradeOption) => void;
  dictTerminals: TerminalDictionary;
  t: (key: string, options?: Record<string, unknown>) => string;
};

const percent = (v: number, zero: number, hundred: number) => {
  if (zero === hundred) return 0;
  return Math.max(Math.min(((v - zero) / (hundred - zero)) * 100, 100), 0);
};

const LocationTreeListRow = ({
  row,
  tradeType,
  priceMin,
  styles,
  setRowRef,
  onOptionClick,
  dictTerminals,
  t,
}: LocationTreeListRowProps) => {
  const rowOption = row.option;
  const locPath = rowOption ? getLocPath(rowOption, dictTerminals) : null;
  const isStale =
    rowOption && rowOption.date_modified < date4_0 && locPath?.[0] !== "Pyro";

  return (
    <div
      className={
        [styles.locationTreeRow, rowOption ? styles.optionInTree : undefined].filter(Boolean).join(" ")
      }
      data-depth={row.depth}
      ref={(element) => setRowRef(row.id, element)}
      style={{ paddingLeft: `calc(.5rem + ${row.depth} * 1.5rem)` }}
    >
      <LocationPathChips
        path={row.locs}
        startDepth={row.depth}
        onClick={rowOption ? () => onOptionClick(rowOption) : undefined}
      />
      {rowOption && (
        <>
          {isStale && (
            <Icon path={mdiAlertCircleOutline} size="1rem" color="#a06060" />
          )}
          <p className={styles.distanceInfo}>{readableDistance(rowOption.distance ?? Infinity, t)}</p>
          {getOptionPrice(rowOption, tradeType) > 0 ? (
            <p
              className={styles.price}
              style={{
                color: colorPrice(
                  percent(getOptionPrice(rowOption, tradeType), priceMin, priceMin * 2)
                ),
              }}
            >
              {t("Common.price", { price: getOptionPrice(rowOption, tradeType) })}
            </p>
          ) : (
            <p className={styles.price} style={{ color: `hsl(0deg 0% 50%)` }}>
              {t("SearchItemResultList.notBuyable")}
            </p>
          )}
        </>
      )}
    </div>
  );
};

const getOptionPrice = (option: TradeOption, tradeType: TradeType) =>
  option[`price_${tradeType}`] || 0;

export default LocationTreeListRow;
