import "./SearchLocationResultList.css";
import CelestialBodyCard from "../../../components/CelestialBodyCard/CelestialBodyCard";
import LocationCard from "../../../components/LocationCard/LocationCard";
import TerminalCard from "../../../components/TerminalCard/TerminalCard";
import { useLocationSearch } from "../useLocationSearch";

interface SearchLocationResultListProps {
  searchName: string;
  includeTerminal?: boolean;
  onCelestialBodyClick?: (body: CelestialBody) => void;
  onLocationClick?: (location: SCLocation) => void;
  onTerminalClick?: (terminal: Terminal) => void;
}

const SearchLocationResultList = ({
  searchName,
  includeTerminal = false,
  onCelestialBodyClick,
  onLocationClick,
  onTerminalClick,
}: SearchLocationResultListProps) => {
  const { celestialBody, locations, terminals } = useLocationSearch(
    searchName,
    includeTerminal
  );

  return (
    <div className="SearchLocationResultList">
      <ul className="location-list">
        {celestialBody.map((body) => (
          <CelestialBodyCard key={body.name} celestialBody={body} onClick={onCelestialBodyClick} />
        ))}
        {locations.map((location) => (
          <LocationCard key={location.name} location={location} onClick={onLocationClick} />
        ))}
        {terminals.map((terminal) => (
          <TerminalCard key={terminal.id} terminal={terminal} onClick={onTerminalClick} />
        ))}
      </ul>
    </div>
  );
};

export default SearchLocationResultList;
