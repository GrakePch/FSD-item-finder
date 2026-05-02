import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";
import { icon } from "../../../assets/icon";
import {
  classToColor,
  getAttributeValueByName,
  signalToColor,
  sizeToColor,
  toI18nKey,
  typeCapitalizedToKey,
} from "../../../utils";

type SearchResultListItemProps = {
  hasLoadedItemPrices: boolean;
  item: Item;
  onClick: (key: string) => void;
  top: number;
};

const SearchResultListItem = ({
  hasLoadedItemPrices,
  item,
  onClick,
  top,
}: SearchResultListItemProps) => {
  const { t } = useTranslation();
  let attrsize: string | null = null;
  let attrClass: string | null = null;
  let attrGrade: string | null = null;
  let attrTrackSignal: string | undefined;

  if (item.type === "Systems") {
    attrsize = getAttributeValueByName("Size", item.attributes);
    attrClass = getAttributeValueByName("Class", item.attributes);
    attrGrade = getAttributeValueByName("Grade", item.attributes);
  }
  if (item.type === "Vehicle Weapons") {
    attrsize = getAttributeValueByName("Size", item.attributes);
    attrTrackSignal = item.attributes?.[112];
  }
  if (item.sub_type === "Attachments") {
    attrsize = getAttributeValueByName("Size", item.attributes);
  }

  return (
    <button
      className="result-list-item"
      style={{ transform: `translateY(${top}px)` }}
      onClick={() => onClick(item.key)}
    >
      {item.sub_type && icon[item.sub_type] ? (
        <Icon path={icon[item.sub_type]} size="2rem" />
      ) : (
        <div className="type">
          <p>{t("FilterType." + typeCapitalizedToKey(item.type || "unknown"))}</p>
          <p>{t("FilterType." + typeCapitalizedToKey(item.sub_type || "unknown"))}</p>
        </div>
      )}
      <div className="names">
        <p className="zh">{t(item.key, { ns: "items" })}</p>
        <p className="en">{t(item.key, { ns: "items", lng: "en" })}</p>
      </div>
      {attrClass && attrGrade && (
        <div
          className="class-grade"
          style={{
            color: classToColor[attrClass],
            backgroundColor: classToColor[attrClass] + "18",
          }}
        >
          {t("UEXAttributeValue." + toI18nKey(attrClass), {
            defaultValue: attrClass,
          })}
          -{attrGrade}
        </div>
      )}
      {attrTrackSignal && (
        <div
          className="tracking-signal"
          style={{
            color: signalToColor[attrTrackSignal],
            backgroundColor: signalToColor[attrTrackSignal] + "18",
          }}
        >
          {t("UEXAttributeValue." + toI18nKey(attrTrackSignal), {
            defaultValue: attrTrackSignal,
          })}
        </div>
      )}
      {attrsize != null && (
        <div className="size" style={{ backgroundColor: sizeToColor[Number(attrsize)] }}>
          S{attrsize}
        </div>
      )}
      {item.price_min_max.buy_min && item.price_min_max.buy_min < Infinity ? (
        <p className="price">
          {t("Common.priceFrom", { price: item.price_min_max.buy_min })}
        </p>
      ) : (
        <p className="price" style={{ color: "hsl(0deg 0% 60%)" }}>
          {hasLoadedItemPrices
            ? t("SearchItemResultList.notBuyable")
            : t("SearchItemResultList.priceUnavailable", {
                defaultValue: "Price unavailable",
              })}
        </p>
      )}
    </button>
  );
};

export default SearchResultListItem;
