import { useTranslation } from "react-i18next";
import "./SearchLocationBar.css";
import React from "react";
import Icon from "@mdi/react";
import { mdiMagnify, mdiClose } from "@mdi/js";

const SearchLocationBar = ({
  searchName,
  setSearchName,
}: {
  searchName: string;
  setSearchName: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { t } = useTranslation();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  return (
    <div className="SearchLocationBar">
      <div className="search-container">
        <div className="btnSearch">
          <Icon path={mdiMagnify} size="1.5rem" />
        </div>
        <input
          type="text"
          id="searchlocationbar"
          placeholder={t("SearchLocationBar.placeholder")}
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

export default SearchLocationBar;
