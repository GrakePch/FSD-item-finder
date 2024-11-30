import "./SearchResultList.css";
import { useSearchParams } from "react-router";

const SearchResultList = ({ results, setShowResults }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleResultClick = (uuid) => {
    setShowResults(false);
    searchParams.set("uuid", uuid);
    setSearchParams(searchParams);
  };

  return (
    <div className="SearchResultList">
      {results.map((item) => (
        <button
          className="result-list-item"
          key={item.uuid}
          onClick={() => handleResultClick(item.uuid)}
        >
          <div className="type">
            {item.type.zh.split("/").map((t, i) => <p key={i}>{t}</p>)}
          </div>
          <div className="names">
            <p className="zh">{item.name.zh}</p>
            <p className="en">{item.name.en}</p>
          </div>
          <p className="price">¤ {item.buy.minPrice} 起</p>
        </button>
      ))}
    </div>
  );
};

export default SearchResultList;
