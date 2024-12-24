import "./SearchResultList.css";
import { useSearchParams } from "react-router";
import i18nCategories from "../../data/categories_en_to_zh_Hans.json";

const SearchResultList = ({ results, setShowResults }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleResultClick = (key) => {
    setShowResults(false);
    setSearchParams({ key: key });
  };

  return (
    <div className="SearchResultList">
      {results.map((item) => (
        <button
          className="result-list-item"
          key={item.key}
          onClick={() => handleResultClick(item.key)}
        >
          <div className="type">
            <p>{i18nCategories[item.type] || item.type}</p>
            <p>{i18nCategories[item.sub_type] || item.sub_type}</p>
          </div>
          <div className="names">
            <p className="zh">{item.name_zh_Hans || item.name}</p>
            <p className="en">{item.name}</p>
          </div>
          {item.price_min_max.buy_min && item.price_min_max.buy_min < Infinity ? (
            <p className="price">¤ {item.price_min_max.buy_min} 起</p>
          ) : (
            <p className="price" style={{ color: "hsl(0deg 0% 60%)" }}>
              无法购买
            </p>
          )}
        </button>
      ))}
    </div>
  );
};

export default SearchResultList;
