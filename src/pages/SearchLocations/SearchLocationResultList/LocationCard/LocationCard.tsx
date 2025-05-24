import { Link } from "react-router";
import { toUrlKey } from "../../../../utils";
import "./LocationCard.css";

const LocationCard = ({ location }: { location: SCLocation }) => {
  const description = location.parentBody
    ? `${location.type} of ${location.parentBody.name}`
    : location.type;
  return <Link className="LocationCard" to={`/l/${toUrlKey(location.name)}`}>
    <div className="icon"></div>
    <div className="info">
      <p className="name">{location.name}</p>
      <p className="descrip">{description}</p>
    </div>
  </Link>;
};

export default LocationCard;
