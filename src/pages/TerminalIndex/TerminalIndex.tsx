import { useContext } from "react";
import "./TerminalIndex.css";
import { ContextAllData } from "../../contexts";
import { useNavigate, useSearchParams } from "react-router";
import LocationPathChips from "../../components/LocationPathChips/LocationPathChips";

const TerminalIndex = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dictTerminals } = useContext(ContextAllData);
  return (
    <div className="TerminalIndex">
      {Object.values(dictTerminals)
        .filter((t) => t.type === "item" && t.location.name_star_system !== "Nyx")
        .sort((a, b) =>
          a.location_path.join(" / ").localeCompare(b.location_path.join(" / "))
        )
        .map((t) => (
          <LocationPathChips
            key={t.id}
            path={t.location_path}
            startDepth={0}
            onClick={() => navigate("/t/" + t.id + "?" + searchParams.toString())}
          />
        ))}
    </div>
  );
};

export default TerminalIndex;
