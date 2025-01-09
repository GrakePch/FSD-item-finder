import "./LocationPathChips.css";
import Icon from "@mdi/react";
import locationNameToType from "../../data/location_name_to_type.json";
import { colorLocationDepth, getLocationZhName } from "../../utils";
import { icon } from "../../assets/icon";

const LocationPathChips = ({ path, startDepth, onClick }) => (
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
        {locationNameToType[loc] === 1 && (
          <Icon path={icon["Space Station"]} size="1rem" color="hsl(170deg 80% 50%)" />
        )}
        {getLocationZhName(loc)}
      </span>
    ))}
  </p>
);

export default LocationPathChips;
