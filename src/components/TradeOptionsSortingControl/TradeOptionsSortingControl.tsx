import { useEffect } from "react";
import styles from "./TradeOptionsSortingControl.module.css";
import { useSearchParams } from "react-router";
import Icon from "@mdi/react";
import { mdiCurrencySign, mdiMapMarker } from "@mdi/js";
import { useTranslation } from "react-i18next";
import { CurrentLocationButton } from "../CurrentLocation/CurrentLocation";

const TradeOptionsSortingControl = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    /* Update Search Params to Default values */
    const paramSort = searchParams.get("sort");
    if (!paramSort || ["price", "location"].includes(paramSort) === false) {
      searchParams.set("sort", "location");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  return (
    <div className={styles.sortingControlWrapper}>
      <div className={styles.TradeOptionsSortingControl}>
        <button
          className={[
            styles.sortButton,
            searchParams.get("sort") === "location" ? styles.active : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => {
            searchParams.set("sort", "location");
            setSearchParams(searchParams);
          }}
        >
          <Icon path={mdiMapMarker} size={"1rem"} />
          <p>{t("TradeOptions.sortByDistance")}</p>
        </button>
        <button
          className={[
            styles.sortButton,
            searchParams.get("sort") === "price" ? styles.active : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => {
            searchParams.set("sort", "price");
            setSearchParams(searchParams);
          }}
        >
          <Icon path={mdiCurrencySign} size={"1rem"} />
          <p>{t("TradeOptions.sortByPrice")}</p>
        </button>
      </div>
      <CurrentLocationButton />
    </div>
  );
};

export default TradeOptionsSortingControl;
