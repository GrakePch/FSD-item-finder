import "./SearchVehicleBar.css";
import React from "react";
import Icon from "@mdi/react";
import { mdiMagnify, mdiClose } from "@mdi/js";
import { useTranslation } from "react-i18next";

const SearchVehicleBar = ({
  searchName,
  setSearchName,
}: {
  searchName: string;
  setSearchName: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const {t} = useTranslation();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  return (
    <div className="SearchVehicleBar">
      <div className="search-container">
        <div className="btnSearch">
          <Icon path={mdiMagnify} size="1.5rem" />
        </div>
        <input
          type="text"
          id="searchvehiclebar"
          placeholder={t("SearchVehicleBar.placeholder")}
          value={searchName}
          onChange={handleSearchChange}
        />
        {searchName && (
          <button className="btnClear" onClick={() => setSearchName("")}>
            <Icon className="iconClear" path={mdiClose} size="1.5rem" />
          </button>
        )}
      </div>
    </div>
  );
};
export default SearchVehicleBar;
