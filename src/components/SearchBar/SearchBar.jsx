import "./SearchBar.css";
import { useEffect, useState } from "react";
import itemData from "../../data/item_data.json";
import SearchResultList from "../SearchResultList/SearchResultList";

const SearchBar = ({ centered }) => {
  const [searchName, setSearchName] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [resultList, setResultList] = useState([]);

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  useEffect(() => {
    let tempList = [];
    if (searchName.length > 0)
      for (const item of Object.values(itemData)) {
        if (
          item.name.en
            .toLocaleLowerCase()
            .includes(searchName.toLocaleLowerCase()) ||
          item.name.zh
            .toLocaleLowerCase()
            .includes(searchName.toLocaleLowerCase())
        ) {
          tempList.push(item);
        }
      }
    setResultList(tempList);
  }, [searchName]);

  return (
    <div className="SearchBar">
      {showResults && centered && searchName && (
        <div className="search-bg" onClick={() => setShowResults(false)}>
          <p>退出搜索</p>
        </div>
      )}
      <nav
        className="search-super-container"
        style={{ top: !centered && !searchName ? "30%" : 0 }}
      >
        {!centered && !searchName && (
          <>
            <h1>星际寻物</h1>
            <p>为星际公民提供查询物品购买地点与价格的服务</p>
          </>
        )}
        <div className="search-container">
          <input
            type="search"
            id="searchbar"
            placeholder="搜索物品或载具名称..."
            onFocus={() => setShowResults(true)}
            onChange={handleSearchChange}
          />
          {showResults && resultList.length > 0 && (
            <>
              <hr />
              <SearchResultList
                results={resultList}
                setShowResults={setShowResults}
              />
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default SearchBar;
