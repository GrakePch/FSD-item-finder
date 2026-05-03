import { Link, useLocation, useSearchParams } from "react-router";
import Icon from "@mdi/react";
import { mdiHomeVariantOutline, mdiMagnify } from "@mdi/js";
import styles from "./NavBar.module.css";
import { getSearchModeFromPath, type SearchMode } from "../../utils/searchMode";

const searchModeToQuery: Record<SearchMode, string> = {
  items: "i",
  vehicles: "v",
  locations: "l",
};

const NavBar = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const openSearch = () => {
    const mode = getSearchModeFromPath(location.pathname);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("search", searchModeToQuery[mode]);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <>
      <div className={styles.NavBar}>
        <div className={styles.navContainer}>
          <nav className={styles.linksContainer}>
            <Link to="/" aria-label="Home">
              <Icon path={mdiHomeVariantOutline} size="1.5rem" />
            </Link>
          </nav>
          <button
            type="button"
            className={styles.navbarSearchTrigger}
            onClick={openSearch}
            aria-label="Open search"
          >
            <Icon path={mdiMagnify} size="1.25rem" />
            <span>Ctrl+K</span>
          </button>
        </div>
      </div>
      <div className={styles.TopFillerWhenNavbarPresent}></div>
    </>
  );
};

export default NavBar;
