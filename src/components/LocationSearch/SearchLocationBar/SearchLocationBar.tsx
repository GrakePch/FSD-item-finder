import { useTranslation } from "react-i18next";
import styles from "./SearchLocationBar.module.css";
import React from "react";
import Icon from "@mdi/react";
import { mdiMagnify, mdiClose } from "@mdi/js";

const SearchLocationBar = ({
  className,
  searchName,
  setSearchName,
  setIsSearchCardOpen,
}: {
  className?: string;
  searchName: string;
  setSearchName: React.Dispatch<React.SetStateAction<string>>;
  setIsSearchCardOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  return (
    <div className={[styles.SearchLocationBar, className].filter(Boolean).join(" ")}>
      <div className={styles.searchContainer}>
        <div className={styles.btnSearch}>
          <Icon path={mdiMagnify} size="1.5rem" />
        </div>
        <input
          className={styles.searchInput}
          type="text"
          id="searchlocationbar"
          placeholder={t("SearchLocationBar.placeholder")}
          value={searchName}
          onChange={handleSearchChange}
          onFocus={() => setIsSearchCardOpen && setIsSearchCardOpen(true)}
        />
        {searchName && (
          <button className={styles.btnClear} onClick={() => setSearchName("")}>
            <Icon className={styles.iconClear} path={mdiClose} size="1.5rem" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchLocationBar;
