import "./SearchLocations.css";
import { useEffect, useState } from "react";
import SearchLocationBar from "./SearchLocationBar/SearchLocationBar";
import SearchLocationResultList from "./SearchLocationResultList/SearchLocationResultList";

const SEARCH_LOCATIONS_NAME_KEY = "fsd_searchLocations_searchName";
const SearchLocations = () => {
  const [searchName, setSearchName] = useState(
    () => sessionStorage.getItem(SEARCH_LOCATIONS_NAME_KEY) || ""
  );

  useEffect(() => {
    sessionStorage.setItem(SEARCH_LOCATIONS_NAME_KEY, searchName);
  }, [searchName]);
  return (
    <div className="SearchLocations">
      <div className="TopFiller-when-narrow-and-searchbar"></div>
      <div className="fixed-search-bar">
        <SearchLocationBar searchName={searchName} setSearchName={setSearchName} />
      </div>
      <SearchLocationResultList searchName={searchName} includeTerminal />
    </div>
  );
};

export default SearchLocations;
