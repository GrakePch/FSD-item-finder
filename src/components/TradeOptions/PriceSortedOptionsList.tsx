import Icon from "@mdi/react";
import { mdiAlertCircleOutline } from "@mdi/js";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import LocationPathChips from "../LocationPathChips/LocationPathChips";
import { colorPrice, date4_0, getTerminalLocationPath } from "../../utils";
import type { TradeType } from "./types";

type PriceSortedOptionsListProps = {
  dictTerminals: TerminalDictionary;
  options: TradeOption[];
  priceMin: number;
  styles: Record<string, string>;
  tradeType: TradeType;
};

const percent = (v: number, zero: number, hundred: number) => {
  if (zero === hundred) return 0;
  return Math.max(Math.min(((v - zero) / (hundred - zero)) * 100, 100), 0);
};

const PriceSortedOptionsList = ({
  dictTerminals,
  options,
  priceMin,
  styles,
  tradeType,
}: PriceSortedOptionsListProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  return options
    .filter((option: TradeOption) => getOptionPrice(option, tradeType) > 0)
    .map((option: TradeOption) => {
      const date = new Date(option.date_modified * 1000);
      const locPath = getTerminalLocationPath(dictTerminals[option.id_terminal]);
      if (!locPath) return null;
      const isStale = option.date_modified < date4_0 && locPath[0] !== "Pyro";

      return (
        <div className={styles.option} key={option.id_terminal}>
          <LocationPathChips
            path={locPath}
            startDepth={0}
            onClick={() => {
              searchParams.delete("key");
              navigate("/t/" + option.id_terminal + "?" + searchParams.toString());
            }}
          />
          <p
            className={styles.dateModified}
            style={{ color: isStale ? "#a06060" : undefined }}
          >
            {isStale && <Icon path={mdiAlertCircleOutline} size="1rem" />}
            {date.getMonth() + 1}/{date.getDate()}
          </p>
          {getOptionPrice(option, tradeType) > 0 ? (
            <p
              className={styles.price}
              style={{
                color: colorPrice(
                  percent(getOptionPrice(option, tradeType), priceMin, priceMin * 2)
                ),
              }}
            >
              {t("Common.price", { price: getOptionPrice(option, tradeType) })}
            </p>
          ) : (
            <p className={styles.price} style={{ color: `hsl(0deg 0% 50%)` }}>
              {t("SearchItemResultList.notBuyable")}
            </p>
          )}
        </div>
      );
    });
};

const getOptionPrice = (option: TradeOption, tradeType: TradeType) =>
  option[`price_${tradeType}`] || 0;

export default PriceSortedOptionsList;
