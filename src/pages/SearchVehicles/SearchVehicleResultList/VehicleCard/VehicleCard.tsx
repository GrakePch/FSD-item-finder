import "./VehicleCard.css";
import { useNavigate } from "react-router-dom";
import { formatVehicleImageSrc } from "../../../../utils";

interface VehicleCardProps {
  vehicle: SpvVehicleIndex;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/v/${vehicle.ClassName}`);
  };

  return (
    <div className="VehicleCard" onClick={handleClick}>
      <div className="vehicle-info">
        <p className="vehicle-name-big">{vehicle.Name}</p>
        <p className="vehicle-name-small">{vehicle.Name}</p>
        <div className="vehicle-price-container">
          {vehicle.Store.Buy ? (
            <p className="vehicle-price-USD">{`$ ${vehicle.Store.Buy.toLocaleString()}`}</p>
          ) : (
            <p className="vehicle-price-USD inactive">无法官网购买</p>
          )}
          {vehicle.PU.Buy ? (
            <p className="vehicle-price-UEC">{`¤ ${vehicle.PU.Buy.toLocaleString()}`}</p>
          ) : (
            <p className="vehicle-price-UEC inactive">无法游戏内购买</p>
          )}
        </div>
      </div>
      <div
        className="vehicle-thumbnail"
        style={{
          backgroundImage: `url(${formatVehicleImageSrc(vehicle)})`,
          width: vehicle.Type === "Ship" ? "33%" : "25%",
        }}
      ></div>
    </div>
  );
};

export default VehicleCard;
