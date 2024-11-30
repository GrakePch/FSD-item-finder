import { useEffect, useState } from "react";
import "./App.css";
import itemData from "./data/item_data.json";

function App() {
  const [searchName, setSearchName] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [resultList, setResultList] = useState([]);
  const [showItem, setShowItem] = useState(null);

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  const handleResultClick = (item) => {
    setShowItem(item);
    setShowResults(false);
  };

  useEffect(() => {
    let tempList = [];
    if (searchName.length > 0)
      for (const [key, item] of Object.entries(itemData)) {
        if (item.name.en.toLocaleLowerCase().includes(searchName.toLocaleLowerCase()) || item.name.zh.includes(searchName)) {
          let itemClone = structuredClone(item);
          itemClone.reference = key;
          tempList.push(structuredClone(itemClone));
        }
      }
    setResultList(tempList);
  }, [searchName]);

  return (
    <>
      <div className="fixed">
        {showResults && (
          <div className="search-bg" onClick={() => setShowResults(false)}>
            <p>退出搜索</p>
          </div>
        )}
        <nav className="search-super-container" style={{top: !showItem && !searchName ? "30%" : 0}}>
          {!showItem && !searchName && (
            <>
              <h1>星际寻物</h1>
              <p>为星际公民提供查询物品购买地点与价格的服务</p>
            </>
          )}
          <div className="search-container">
            <input type="search" id="searchbar" placeholder="搜索物品或载具名称..." onFocus={() => setShowResults(true)} onChange={handleSearchChange} />
            {showResults && resultList.length > 0 && (
              <>
                <hr />
                <div className="result-list">
                  {resultList.map((item) => (
                    <button className="result-list-item" key={item.reference} onClick={() => handleResultClick(item)}>
                      <div>
                      <p className="zh">{item.name.zh}</p>
                      <p className="en">{item.name.en}</p>
                      </div>
                      <p className="type">{item.type.zh}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      {showItem && (
        <div className="show-item">
          <div className="item-info">
            <h1>{showItem.name.zh}</h1>
            <h2>{showItem.name.en}</h2>
            <p className="type">{showItem.type.zh}</p>
          </div>
          <hr />
          <div className="buy-option-titles">
            <h4 className="location">购买地点</h4>
            <h4 className="price">价格 (aUEC)</h4>
          </div>
          <div className="buy-option-list">
            {showItem.locations.map((option) => (
              <div className="buy-option" key={option.location.en}>
                <p className="location">{option.location.zh}</p>
                <p className="price">{option.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
