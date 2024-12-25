import "./SearchBar.css";
import { useContext, useEffect, useState } from "react";
import SearchResultList from "../SearchResultList/SearchResultList";
import Icon from "@mdi/react";
import { mdiArrowLeft, mdiClose, mdiMagnify } from "@mdi/js";
import { AllItemsPriceContext } from "../../contexts";
import { getCategoryZhName, isAscii } from "../../utils";
import { useSearchParams } from "react-router";

const filterTypes = [
  "Vehicle",
  "Systems",
  "Vehicle Weapons",
  "Personal Weapons",
  "Armor",
];

const SearchBar = ({ centered, dataAcquired }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsData = useContext(AllItemsPriceContext);
  const [searchName, setSearchName] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [resultList, setResultList] = useState([]);

  const handleSearchChange = (e) => {
    setSearchName(e.target.value);
  };

  useEffect(() => {
    let filterType = searchParams.get("type");
    let tempList = [];
    if (
      (searchName.length > 0 &&
        ((isAscii(searchName) && searchName.length > 1) || !isAscii(searchName))) ||
      filterType
    )
      for (const item of Object.values(itemsData).filter((i) =>
        filterType ? i.type === filterType : true
      )) {
        if (
          item.name.toLocaleLowerCase().includes(searchName.toLocaleLowerCase()) ||
          item.name_zh_Hans?.toLocaleLowerCase()?.includes(searchName.toLocaleLowerCase())
        ) {
          tempList.push(item);
        }
      }

    if (tempList.length <= 300) {
      tempList.sort((a, b) => a.name.localeCompare(b.name));
    }

    // console.log(tempList);
    setResultList(tempList);
  }, [itemsData, searchName, searchParams]);

  return (
    <div className="SearchBar">
      {showResults && (
        <div className="search-bg" onClick={() => setShowResults(false)}></div>
      )}
      <nav
        className="search-super-container"
        style={{ top: centered && !showResults ? "30%" : 0 }}
      >
        {centered && !showResults && (
          <>
            <h1>
              星际寻物<span>Beta 版</span>
            </h1>
            <p>为星际公民提供查询物品购买地点与价格的服务</p>
            <p className="small">暂不支持货物和矿物的交易地点与价格</p>
          </>
        )}
        <div className="search-container">
          {!showResults ? (
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
            placeholder={dataAcquired ? "搜索物品或载具名称……" : "数据加载中，请稍后……"}
            value={searchName}
            onFocus={() => setShowResults(true)}
            onChange={handleSearchChange}
            disabled={!dataAcquired}
          />
          {searchName && (
            <button className="btnClear" onClick={() => setSearchName("")}>
              <Icon className="iconClear" path={mdiClose} size="1.5rem" />
            </button>
          )}

          {showResults && (
            <>
              <hr />
              <div className="filters">
                <p>筛选</p>
                {filterTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      if (searchParams.get("type") === t) {
                        searchParams.delete("type");
                        setSearchParams(searchParams);
                        return;
                      }
                      searchParams.set("type", t);
                      setSearchParams(searchParams);
                    }}
                    className={t === searchParams.get("type") ? "active" : null}
                  >
                    {getCategoryZhName(t)}
                  </button>
                ))}
              </div>
              {resultList.length > 0 && (
                <p className="total">搜索结果共 {resultList.length} 个</p>
              )}
              <SearchResultList results={resultList} setShowResults={setShowResults} />
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default SearchBar;
