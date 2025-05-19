import "./VehicleInfo.css";
import { useParams } from "react-router-dom";
import { ContextAllData } from "../../contexts";
import { useContext, useMemo } from "react";
import spvVehicleIndex from "../../data/vehicles/spv_vehicle_index";
import spvClassNameToUexId from "../../data/vehicles/spv_classname_to_uex_id.json";
import TradeOptionsSortingControl from "../../components/TradeOptionsSortingControl/TradeOptionsSortingControl";
import TradeOptions from "../../components/TradeOptions/TradeOptions";
import { formatVehicleImageSrc, spvRoleToKey } from "../../utils";
import { useTranslation } from "react-i18next";

const VehicleInfo = () => {
  const { t } = useTranslation();
  const vehicleClassName = useParams().vehicleClassName;
  const { dictVehicles } = useContext(ContextAllData);

  const spvVehicle = useMemo(
    () => spvVehicleIndex.find((v) => v.ClassName === vehicleClassName),
    [vehicleClassName]
  );

  const uexVehicle = useMemo(() => {
    const uexId = spvClassNameToUexId[vehicleClassName];
    return Object.values(dictVehicles).find((v) => v.id_vehicle === uexId);
  }, [dictVehicles, spvClassNameToUexId, vehicleClassName]);

  return (
    spvVehicle && (
    <div className="VehicleInfo">
      <div className="highlight-info">
        <img
          src={formatVehicleImageSrc(spvVehicle, "iso")}
          alt={spvVehicle.Name}
          className="vehicle-image"
        />
        <div className="vehicle-main-info">
          <h1>{t("Vehicle.vehicle_Name" + spvVehicle.ClassName)}</h1>
          <h2>{t("Vehicle.vehicle_Name" + spvVehicle.ClassName, { lng: "en" })}</h2>
          <p className="vehicle-role">
            {t("VehicleClass.vehicle_class_" + spvRoleToKey(spvVehicle.Role), {
              defaultValue: t(
                "VehicleFocus.vehicle_focus_" + spvRoleToKey(spvVehicle.Role),
                {
                  defaultValue: spvVehicle.Role,
                }
              ),
            })}
          </p>
        </div>
      </div>
      <div className="trading-info">
        <TradeOptionsSortingControl />
        {uexVehicle?.options &&
          uexVehicle.options.length > 0 &&
          uexVehicle.price_min_max.buy_min &&
          uexVehicle.price_min_max.buy_min < Infinity && (
            <TradeOptions
              pricesData={uexVehicle.options}
              priceMinMax={uexVehicle.price_min_max}
              tradeType="buy"
            />
          )}
        {uexVehicle?.options_rent && uexVehicle.options_rent.length > 0 && (
          <TradeOptions
            pricesData={uexVehicle.options_rent}
            priceMinMax={uexVehicle.price_min_max}
            tradeType="rent"
          />
        )}
      </div>
    </div>
    )
  );
};

export default VehicleInfo;
