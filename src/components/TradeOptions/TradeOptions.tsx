import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { ContextAllData } from "../../contexts";
import {
  getTerminalDistance,
  getTerminalLocationPath,
  getTerminalSortKey,
} from "../../utils";
import LocationTreeList from "./LocationTreeList";
import PriceSortedOptionsList from "./PriceSortedOptionsList";
import styles from "./TradeOptions.module.css";
import { addToTree, optimizeForest } from "./locationTree";
import type { LocationForestMap, LocationTreeShallow, TradeType } from "./types";

type TradeOptionsProps = {
  pricesData: TradeOption[];
  priceMinMax: Partial<PriceMinMax>;
  tradeType: TradeType;
};

const TradeOptions = ({ pricesData, priceMinMax, tradeType }: TradeOptionsProps) => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { dictLocations, dictTerminals, currentLocation } = useContext(ContextAllData);
  const [options, setOptions] = useState<TradeOption[]>([]);
  const [locationForestShallow, setLocationForestShallow] = useState<
    LocationTreeShallow[]
  >([]);

  useEffect(() => {
    const tempOptions = pricesData
      .filter((option: TradeOption) => option.id_terminal in dictTerminals)
      .toSorted((a: TradeOption, b: TradeOption) =>
        getTerminalSortKey(dictTerminals[a.id_terminal]).localeCompare(
          getTerminalSortKey(dictTerminals[b.id_terminal])
        )
      );

    const fromBodyRef = getCurrentBodyRef(
      currentLocation,
      dictLocations,
      "STANTON/II"
    );
    tempOptions.forEach((option: TradeOption) => {
      option.distance = getTerminalDistance(option, fromBodyRef, dictTerminals);
    });
    tempOptions.sort(
      (a: TradeOption, b: TradeOption) => (a.distance || 0) - (b.distance || 0)
    );

    if (searchParams.get("sort") === "price") {
      tempOptions.sort((a: TradeOption, b: TradeOption) =>
        tradeType === "sell"
          ? getOptionPrice(b, tradeType) - getOptionPrice(a, tradeType)
          : getOptionPrice(a, tradeType) - getOptionPrice(b, tradeType)
      );
    }

    setOptions(tempOptions);
  }, [
    currentLocation,
    dictLocations,
    dictTerminals,
    pricesData,
    searchParams,
    tradeType,
  ]);

  useEffect(() => {
    if (options.length <= 0) {
      setLocationForestShallow([]);
      return;
    }

    const tempLocationForest: LocationForestMap = {};
    options
      .filter((option: TradeOption) => getOptionPrice(option, tradeType) > 0)
      .forEach((option: TradeOption) => {
        const locPath = getTerminalLocationPath(dictTerminals[option.id_terminal]);
        if (locPath) addToTree(tempLocationForest, locPath, option);
      });

    const tempLocationForestShallow: LocationTreeShallow[] = [];
    optimizeForest(tempLocationForestShallow, tempLocationForest, 0);
    setLocationForestShallow(tempLocationForestShallow);
  }, [dictTerminals, options, tradeType]);

  return (
    <div className={styles.TradeOptions}>
      <div className={styles.titles}>
        <h3 className={styles.location}>
          {t("TradeOptions.locationTitle", {
            tradeType: t(`TradeOptions.tradeType.${tradeType}`),
          })}
        </h3>
        <h4 className={styles.price}>{t(`TradeOptions.priceTitle.${tradeType}`)}</h4>
      </div>
      <div className={styles.optionsContainer}>
        {searchParams.get("sort") === "price" ? (
          <PriceSortedOptionsList
            dictTerminals={dictTerminals}
            options={options}
            priceMin={getMinPrice(priceMinMax, tradeType)}
            styles={styles}
            tradeType={tradeType}
          />
        ) : (
          <LocationTreeList
            forest={locationForestShallow}
            priceMin={getMinPrice(priceMinMax, tradeType)}
            styles={styles}
            tradeType={tradeType}
          />
        )}
      </div>
    </div>
  );
};

const getCurrentBodyRef = (
  currentLocation: string,
  dictLocations: LocationDictionary,
  fallbackBodyCode: string
) => {
  const location = dictLocations[currentLocation];
  return location?.parentBody?.code || fallbackBodyCode;
};

const getOptionPrice = (option: TradeOption, tradeType: TradeType) =>
  option[`price_${tradeType}`] || 0;

const getMinPrice = (priceMinMax: Partial<PriceMinMax>, tradeType: TradeType) =>
  priceMinMax[`${tradeType}_min`] || 0;

export default TradeOptions;
