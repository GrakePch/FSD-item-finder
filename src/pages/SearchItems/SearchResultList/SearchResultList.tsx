import "./SearchResultList.css";
import { useNavigate, useSearchParams } from "react-router";
import {
  getAttributeValueByName,
  sizeToColor,
  classToColor,
  signalToColor,
  typeCapitalizedToKey,
  toI18nKey,
} from "../../../utils";
import { icon } from "../../../assets/icon";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";

const SearchResultList = ({ results }: { results: Item[] }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleResultClick = (key: string) => {
    navigate(`/i/${key}?${searchParams.toString()}`);
  };

  return (
    <div className="SearchResultList">
      {results.map((item) => {
        let attrsize: string,
          attrClass: string,
          attrGrade: string,
          attrTrackSignal: string;
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
            key={item.key}
            onClick={() => handleResultClick(item.key)}
          >
            {icon[item.sub_type] ? (
              <Icon path={icon[item.sub_type]} size="2rem" />
            ) : (
              <div className="type">
                <p>{t("FilterType." + typeCapitalizedToKey(item.type || "unknown"))}</p>
                <p>
                  {t("FilterType." + typeCapitalizedToKey(item.sub_type || "unknown"))}
                </p>
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
              <div className="size" style={{ backgroundColor: sizeToColor[attrsize] }}>
                S{attrsize}
              </div>
            )}
            {item.price_min_max.buy_min && item.price_min_max.buy_min < Infinity ? (
              <p className="price">¤ {item.price_min_max.buy_min} +</p>
            ) : (
              <p className="price" style={{ color: "hsl(0deg 0% 60%)" }}>
                {t("SearchItemResultList.notBuyable")}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SearchResultList;
