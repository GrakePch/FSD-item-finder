import "./VehicleInfo.css";
import { useParams } from "react-router-dom";
import { ContextAllData } from "../../contexts";
import { useContext, useMemo } from "react";
import spvVehicleIndex from "../../data/vehicles/spv_vehicle_index";
import spvVehicleList from "../../data/vehicles/spv_vehicle_list";
import spvClassNameToUexId from "../../data/vehicles/spv_classname_to_uex_id.json";
import TradeOptionsSortingControl from "../../components/TradeOptionsSortingControl/TradeOptionsSortingControl";
import TradeOptions from "../../components/TradeOptions/TradeOptions";
import { formatVehicleImageSrc, spvRoleToKey } from "../../utils";
import { useTranslation } from "react-i18next";
import FlightVelocities from "./FlightVelocities/FlightVelocities";

const VehicleInfo = () => {
  const { t } = useTranslation();
  const vehicleClassName = useParams().vehicleClassName;
  const { dictVehicles } = useContext(ContextAllData);

  const spvVehicle = useMemo(
    () => spvVehicleIndex.find((v) => v.ClassName === vehicleClassName),
    [vehicleClassName]
  );

  const spvVehicleMain = useMemo(
    () => spvVehicleList.find((v) => v.ClassName === vehicleClassName),
    [vehicleClassName]
  );

  const uexVehicle = useMemo(() => {
    const uexId = spvClassNameToUexId[vehicleClassName];
    return Object.values(dictVehicles).find((v) => v.id_vehicle === uexId);
  }, [dictVehicles, spvClassNameToUexId, vehicleClassName]);

  return (
    spvVehicle  && (
    <div className="VehicleInfo">
      <div className="highlight-info">
        <div
          style={{
            backgroundImage: `url(${formatVehicleImageSrc(spvVehicle, "iso")})`,}}
          className="vehicle-image"
        ></div>
        <div className="vehicle-main-info">
          <h1>{t("Vehicle.vehicle_Name" + spvVehicle.ClassName, { defaultValue: spvVehicle.Name})}</h1>
          <h2>{t("Vehicle.vehicle_Name" + spvVehicle.ClassName, { defaultValue: spvVehicle.Name, lng: "en" })}</h2>
          <p>
          <span className="vehicle-role">
            {t("VehicleClass.vehicle_class_" + spvRoleToKey(spvVehicle.Role), {
              defaultValue: t(
                "VehicleFocus.vehicle_focus_" + spvRoleToKey(spvVehicle.Role),
                {
                  defaultValue: spvVehicle.Role,
                }
              ),
            })}
          </span>
            <span className={`vehicle-status ${spvVehicle.ProgressTracker.Status}`}>
              {t("SPVProgressTrackerStatus." + spvVehicle.ProgressTracker.Status)} {spvVehicle.ProgressTracker.Patch}
            </span>
          </p>
          {/* {spvVehicleMain &&
            <p className="dimensions">{t("VehicleInfo.Dimensions", {
              L: spvVehicleMain.Dimensions.Length, 
              W: spvVehicleMain.Dimensions.Width, 
              H: spvVehicleMain.Dimensions.Height
              })}
            </p>
          } */}
          <div style={{flexGrow: 1, flexBasis: "1rem"}}></div>
          <p className="store-info">
            {spvVehicle.Store.Buy ? 
            <span className="price-USD">$ {spvVehicle.Store.Buy}</span> : 
            <span className="price-USD inactive">{t("VehicleInfo.notBuyableUSD")}</span>}
            {spvVehicle.Store.IsLimitedSale && <span className="is-limited-sale">{t("VehicleInfo.isLimitedSale")}</span>}
            {spvVehicle.Store.IsPromotionOnly && <span className="is-promotion-only">{t("VehicleInfo.isPromotionOnly")}</span>}
            </p>
        </div>
      </div>
      <div className="grid">
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
      {
        spvVehicleMain && (
          <FlightVelocities spvVehicleMain={spvVehicleMain} />
        )
      }
      </div>
    </div>
    )
  );
};

export default VehicleInfo;
