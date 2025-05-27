import { useLocation, Link } from "react-router";
import { useMemo } from "react";
import Icon from "@mdi/react";
import { icon } from "../../assets/icon";
import { mdiMapMarker, mdiWidgetsOutline } from "@mdi/js";
import "./NavBarBottom.css";

const NavBarBottom = () => {
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
    <nav className="NavBarBottom">
      <Link to="/" className={tabSearch === "items" ? "active" : ""}>
        <Icon path={mdiWidgetsOutline} />
        <span>寻物</span>
      </Link>
      <Link to="/v" className={tabSearch === "vehicles" ? "active" : ""}>
        <Icon path={icon.Vehicle} />
        <span>寻船</span>
      </Link>
      <Link to="/l" className={tabSearch === "locations" ? "active" : ""}>
        <Icon path={mdiMapMarker} />
        <span>寻址</span>
      </Link>
    </nav>
  );
};

export default NavBarBottom;
