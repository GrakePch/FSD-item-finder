import { useLocation, Link } from "react-router";
import { useMemo } from "react";
import Icon from "@mdi/react";
import { icon } from "../../assets/icon";
import { mdiMapMarker, mdiWidgetsOutline } from "@mdi/js";
import "./NavBarBottom.css";
import { useTranslation } from "react-i18next";
import { getSearchModeFromPath } from "../../utils/searchMode";

const NavBarBottom = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const tabSearch = useMemo<"items" | "vehicles" | "locations">(() => {
    return getSearchModeFromPath(location.pathname);
  }, [location.pathname]);

  return (
    <nav className="NavBarBottom">
      <Link to="/" className={tabSearch === "items" ? "active" : ""}>
        <Icon path={mdiWidgetsOutline} />
        <span>{t("Navbar.searchItems")}</span>
      </Link>
      <Link to="/v" className={tabSearch === "vehicles" ? "active" : ""}>
        <Icon path={icon.Vehicle} />
        <span>{t("Navbar.searchVehicles")}</span>
      </Link>
      <Link to="/l" className={tabSearch === "locations" ? "active" : ""}>
        <Icon path={mdiMapMarker} />
        <span>{t("Navbar.searchLocations")}</span>
      </Link>
    </nav>
  );
};

export default NavBarBottom;
