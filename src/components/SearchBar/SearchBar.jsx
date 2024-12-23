import "./SearchBar.css";
import { useContext, useEffect, useState } from "react";
import SearchResultList from "../SearchResultList/SearchResultList";
import Icon from "@mdi/react";
import { mdiArrowLeft, mdiClose, mdiMagnify } from "@mdi/js";
import { AllItemsPriceContext } from "../../contexts";
import { isAscii } from "../../utils";

const SearchBar = ({ centered }) => {
  const itemsData = useContext(AllItemsPriceContext);
  const [searchName, setSearchName] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [resultList, setResultList] = useState([]);

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  useEffect(() => {
    let tempList = [];
    if (
      searchName.length > 0 &&
      ((isAscii(searchName) && searchName.length > 1) || !isAscii(searchName))
    )
      for (const item of Object.values(itemsData)) {
        if (
          item.name.toLocaleLowerCase().includes(searchName.toLocaleLowerCase()) ||
          item.name_zh_Hans?.toLocaleLowerCase()?.includes(searchName.toLocaleLowerCase())
        ) {
          tempList.push(item);
        }
      }

    if (tempList.length <= 100) {
      tempList.sort((a, b) => a.name.localeCompare(b.name));
    }

    // console.log(tempList);
    setResultList(tempList);
  }, [itemsData, searchName]);

  return (
    <div className="SearchBar">
      {showResults && resultList.length > 0 && (
        <div className="search-bg" onClick={() => setShowResults(false)}></div>
      )}
      <nav
        className="search-super-container"
        style={{ top: centered && resultList.length <= 0 ? "30%" : 0 }}
      >
        {centered && resultList.length <= 0 && (
          <>
            <h1>星际寻物<span>Beta 版</span></h1>
            <p>为星际公民提供查询物品购买地点与价格的服务</p>
          </>
        )}
        <div className="search-container">
          {!(showResults && resultList.length > 0) ? (
            <div className="btnSearch">
              <Icon path={mdiMagnify} size="1.5rem" />
            </div>
          ) : (
            <button className="btnBack" onClick={() => setShowResults(false)}>
              <Icon className="iconClear" path={mdiArrowLeft} size="1.5rem" />
            </button>
          )}
          <input
            type="input"
            id="searchbar"
            placeholder="搜索物品或载具名称..."
            value={searchName}
            onFocus={() => setShowResults(true)}
            onChange={handleSearchChange}
          />
          {searchName && (
            <button className="btnClear" onClick={() => setSearchName("")}>
              <Icon className="iconClear" path={mdiClose} size="1.5rem" />
            </button>
          )}

          {showResults && resultList.length > 0 && (
            <>
              <hr />
              <p className="total">搜索结果共 {resultList.length} 个</p>
              <SearchResultList results={resultList} setShowResults={setShowResults} />
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default SearchBar;
