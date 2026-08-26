import { useTranslation } from "react-i18next";
import styles from "./SearchBar.module.css";
import React from "react";
import Icon from "@mdi/react";
import { mdiMagnify, mdiClose } from "@mdi/js";

const SearchBar = ({
  className,
  searchName,
  setSearchName,
  setIsSearchCardOpen,
  placeholder,
  inputId = "searchbar",
}: {
  className?: string;
  searchName: string;
  setSearchName: React.Dispatch<React.SetStateAction<string>>;
  setIsSearchCardOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  placeholder?: string;
  inputId?: string;
}) => {
  const { t } = useTranslation();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  return (
    <div className={[styles.SearchBar, className].filter(Boolean).join(" ")}>
      <div className={styles.searchContainer}>
        <div className={styles.btnSearch}>
          <Icon path={mdiMagnify} size="1.5rem" />
        </div>
        <input
          className={styles.searchInput}
          type="text"
          id={inputId}
          placeholder={placeholder ?? t("SearchBar.placeholder")}
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

export default SearchBar;
