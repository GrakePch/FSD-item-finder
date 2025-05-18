import { useState } from "react";
import SearchResultList from "../../components/SearchResultList/SearchResultList";
import SearchBar from "../../components/SearchBar/SearchBar";
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
