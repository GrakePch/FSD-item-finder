import "./LocationPathChips.css";
import Icon from "@mdi/react";
import { colorLocationDepth, getLocationZhName } from "../../utils";
import { icon } from "../../assets/icon";
import { useContext } from "react";
import { ContextAllData } from "../../contexts";

type LocationPathChipsProps = {
  path: string[];
  startDepth: number;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
};

const LocationPathChips = ({ path, startDepth, onClick }: LocationPathChipsProps) => {
  const { dictLocations } = useContext(ContextAllData);

  return (
    <p className="LocationPathChips">
      {path.map((loc, idx) => (
        <span
          key={loc + idx}
          className="location-chip"
          style={{
            backgroundColor: colorLocationDepth(startDepth + idx),
            color: startDepth + idx <= 0 && `#000`,
          }}
          onClick={onClick}
        >
          {dictLocations[loc]?.type?.toLowerCase() === "space station" && (
            <Icon path={icon["Space Station"]} size="1rem" color="hsl(170deg 80% 50%)" />
          )}
          {getLocationZhName(loc)}
        </span>
      ))}
    </p>
  );
};

export default LocationPathChips;
