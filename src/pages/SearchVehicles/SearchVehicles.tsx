import { useState, useEffect } from "react";
import "./SearchVehicles.css";
import SearchVehicleResultList from "./SearchVehicleResultList/SearchVehicleResultList";
import SearchVehicleBar from "./SearchVehicleBar/SearchVehicleBar";

const SEARCH_VEHICLE_NAME_KEY = "fsd_searchVehicles_searchName";
const SearchVehicles = () => {
  // Use sessionStorage directly in useState initializer
  const [searchName, setSearchName] = useState(
    () => sessionStorage.getItem(SEARCH_VEHICLE_NAME_KEY) || ""
  );

  // Save searchName to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(SEARCH_VEHICLE_NAME_KEY, searchName);
  }, [searchName]);
  return (
    <div className="SearchVehicles">
      <div className="TopFiller-when-narrow-and-searchbar"></div>
      <div className="fixed-search-bar">
        <SearchVehicleBar searchName={searchName} setSearchName={setSearchName} />
      </div>
      <SearchVehicleResultList searchName={searchName} />
    </div>
  );
};

export default SearchVehicles;
