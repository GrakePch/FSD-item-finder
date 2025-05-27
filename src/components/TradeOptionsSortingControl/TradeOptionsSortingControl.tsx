import { useEffect } from "react";
import "./TradeOptionsSortingControl.css";
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
    let paramSort = searchParams.get("sort");
    if (["price", "location"].includes(paramSort) === false) {
      searchParams.set("sort", "location");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  return (
    <div
      style={{
        padding: "0 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: ".5rem",
      }}
    >
      <div className="TradeOptionsSortingControl">
        <button
          className={searchParams.get("sort") === "location" ? "active" : undefined}
          onClick={() => {
            searchParams.set("sort", "location");
            setSearchParams(searchParams);
          }}
        >
          <Icon path={mdiMapMarker} size={"1rem"} />
          <p>{t("TradeOptions.sortByDistance")}</p>
        </button>
        <button
          className={searchParams.get("sort") === "price" ? "active" : undefined}
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
