import { useState } from "react";
import SearchResultList from "./SearchResultList/SearchResultList";
import SearchBar from "./SearchBar/SearchBar";
import "./SearchItems.css";

const SearchItems = () => {
  const [resultList, setResultList] = useState<Item[]>([]);

  return (
    <div className="SearchItems">
      <SearchBar resultList={resultList} setResultList={setResultList} />
      <SearchResultList results={resultList} />
    </div>
  );
};

export default SearchItems;
