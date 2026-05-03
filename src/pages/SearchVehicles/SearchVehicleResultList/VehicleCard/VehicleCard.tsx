import styles from "./VehicleCard.module.css";
import { useNavigate } from "react-router";
import VehicleImage from "../../../../components/VehicleImage";
import { spvRoleToKey } from "../../../../utils";
import { useTranslation } from "react-i18next";
import { getTranslatedVehicleName } from "../../../../utils/vehicleI18n";

interface VehicleCardProps {
  compactLarge?: boolean;
  vehicle: SpvVehicleIndex;
  uexBuyPrice?: number | null;
  onResultClick?: () => void;
}

const VehicleCard = ({
  compactLarge = false,
  vehicle,
  uexBuyPrice,
  onResultClick,
}: VehicleCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isReleased = vehicle.ProgressTracker.Status === "Released";

  const handleClick = () => {
    navigate(`/v/${vehicle.ClassName}`);
    onResultClick?.();
  };

  return (
    <div
      className={[
        styles.VehicleCard,
        vehicle.Size > 4 ? styles.big : undefined,
        vehicle.Size > 4 && compactLarge ? styles.compactLarge : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
    >
      <div className={styles.vehicleInfo}>
        <p className={styles.vehicleRole}>
          {t("vehicle_class_" + spvRoleToKey(vehicle.Role), {
            ns: "vehicle_classes",
            defaultValue: vehicle.Role,
          })}
        </p>
        <p className={styles.vehicleNameBig}>
          {getTranslatedVehicleName(t, vehicle)}
        </p>
        <div className={styles.vehiclePriceContainer}>
          {vehicle.Store.Buy ? (
            <p className={styles.vehiclePriceUSD}>{`$ ${vehicle.Store.Buy.toLocaleString()}`}</p>
          ) : (
            <p className={`${styles.vehiclePriceUSD} ${styles.inactive}`}>{t("VehicleInfo.notBuyableUSD")}</p>
          )}
          {!isReleased ? (
            <p className={`${styles.vehiclePriceUEC} ${styles.inactive} ${styles.notDelivered}`}>
              {t("VehicleInfo.notDelivered")}
            </p>
          ) : typeof uexBuyPrice === "number" ? (
            <p className={styles.vehiclePriceUEC}>{`¤ ${uexBuyPrice.toLocaleString()}`}</p>
          ) : uexBuyPrice === null ? (
            <p className={`${styles.vehiclePriceUEC} ${styles.inactive}`}>{t("VehicleInfo.notBuyableUEC")}</p>
          ) : null}
        </div>
      </div>
      <VehicleImage
        className={styles.vehicleThumbnail}
        vehicleClassName={vehicle.ClassName}
        angle="top"
        size="xs"
        loading="lazy"
        alt=""
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
        style={{
          width: vehicle.Type === "Ship" ? (vehicle.Size > 4 ? "45%" : "33%") : "25%",
        }}
      />
    </div>
  );
};

export default VehicleCard;
