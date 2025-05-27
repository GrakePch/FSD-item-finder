import { useLocation, Link } from "react-router";
import { useMemo } from "react";
import Icon from "@mdi/react";
import { icon } from "../../assets/icon";
import { mdiMapMarker, mdiWidgetsOutline } from "@mdi/js";
import "./NavBar.css";

const NavBar = () => {
  const location = useLocation();

  const tabSearch = useMemo<"items" | "vehicles" | "locations">(() => {
    if (location.pathname.startsWith("/v")) {
      return "vehicles";
    } else if (
      location.pathname.startsWith("/l") ||
      location.pathname.startsWith("/t") ||
      location.pathname.startsWith("/b")
    ) {
      return "locations";
    } else {
      return "items";
    }
  }, [location.pathname]);

  return (
    <>
      <div className="NavBar">
        <div className="nav-container">
          <nav className="links-container">
            <Link to="/" className={tabSearch === "items" ? "active" : ""}>
              <Icon path={mdiWidgetsOutline} size="2rem" />
            </Link>
            <Link to="/v" className={tabSearch === "vehicles" ? "active" : ""}>
              <Icon path={icon.Vehicle} size="2rem" />
            </Link>
            <Link to="/l" className={tabSearch === "locations" ? "active" : ""}>
              <Icon path={mdiMapMarker} size="2rem" />
            </Link>
          </nav>
        </div>
      </div>
      <div className="TopFiller-when-navbar-present"></div>
    </>
  );
};

export default NavBar;
