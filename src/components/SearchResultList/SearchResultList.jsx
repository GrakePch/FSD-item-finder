import "./SearchResultList.css";
import { useSearchParams } from "react-router";
import i18nCategories from "../../data/categories_en_to_zh_Hans.json";
import {
  getAttributeValueZhName,
  getAttributeValueByName,
  sizeToColor,
  classToColor,
  signalToColor,
} from "../../utils";

const SearchResultList = ({ results, setShowResults }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleResultClick = (key) => {
    setShowResults(false);
    searchParams.set("key", key);
    setSearchParams(searchParams);
  };

  return (
    <div className="SearchResultList">
      {results.map((item) => {
        let attrsize, attrClass, attrGrade, attrTrackSignal;
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
            <div className="type">
              <p>{i18nCategories[item.type] || item.type || "未知"}</p>
              <p>{i18nCategories[item.sub_type] || item.sub_type || "未知"}</p>
            </div>
            <div className="names">
              <p className="zh">{item.name_zh_Hans || item.name}</p>
              <p className="en">{item.name}</p>
            </div>
            {attrsize != null && (
              <div className="size" style={{ backgroundColor: sizeToColor[attrsize] }}>
                S{attrsize}
              </div>
            )}
            {attrClass && attrGrade && (
              <div
                className="class-grade"
                style={{
                  color: classToColor[attrClass],
                  backgroundColor: classToColor[attrClass] + "18",
                }}
              >
                {getAttributeValueZhName(attrClass)}-{attrGrade}
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
                {getAttributeValueZhName(attrTrackSignal)}
              </div>
            )}
            {item.price_min_max.buy_min && item.price_min_max.buy_min < Infinity ? (
              <p className="price">¤ {item.price_min_max.buy_min} 起</p>
            ) : (
              <p className="price" style={{ color: "hsl(0deg 0% 60%)" }}>
                无法购买
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SearchResultList;
