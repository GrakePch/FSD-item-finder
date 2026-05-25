import "./VehicleInfo.css";
import { useParams } from "react-router";
import { ContextAllData } from "../../contexts";
import { useContext, useMemo } from "react";
import Icon from "@mdi/react";
import { mdiHeart, mdiHeartOutline } from "@mdi/js";
import vehicleIndexRaw from "../../data/vehicles/vehicle_index.json";
import vehicleListRaw from "../../data/vehicles/vehicle_list.json";
import vehicleHardpointsRaw from "../../data/vehicles/vehicle_hardpoints.json";
import vehicleClassNameToUexId from "../../data/vehicles/vehicle_classname_to_uex_id.json";
import TradeOptionsSortingControl from "../../components/TradeOptionsSortingControl/TradeOptionsSortingControl";
import TradeOptions from "../../components/TradeOptions/TradeOptions";
import VehicleImage from "../../components/VehicleImage";
import { vehicleRoleToKey } from "../../utils";
import { useTranslation } from "react-i18next";
import VehicleSupplementalInfo from "./VehicleSupplementalInfo/VehicleSupplementalInfo";
import useFavoriteVehicles from "../../hooks/useFavoriteVehicles";

const vehicleClassNameToUexIdMap = vehicleClassNameToUexId as Record<string, number>;
const vehicleIndex = vehicleIndexRaw as unknown as VehicleIndex[];
const vehicleList = vehicleListRaw as unknown as VehicleMain[];
const vehicleHardpointsList = vehicleHardpointsRaw as unknown as VehicleHardpointData[];

const VehicleInfo = () => {
  const { t } = useTranslation();
  const vehicleClassName = useParams().vehicleClassName;
  const { dictVehicles } = useContext(ContextAllData);
  const { isFavoriteVehicle, toggleFavoriteVehicle } = useFavoriteVehicles();

  const vehicle = useMemo(
    () => vehicleIndex.find((v) => v.ClassName === vehicleClassName),
    [vehicleClassName]
  );

  const vehicleMain = useMemo(
    () => vehicleList.find((v) => v.ClassName === vehicleClassName),
    [vehicleClassName]
  );

  const vehicleHardpoints = useMemo(
    () => vehicleHardpointsList.find((v) => v.ClassName === vehicleClassName),
    [vehicleClassName]
  );

  const uexVehicle = useMemo(() => {
    const uexId = vehicleClassName ? vehicleClassNameToUexIdMap[vehicleClassName] : undefined;
    return Object.values(dictVehicles).find((v) => v.id_vehicle === uexId);
  }, [dictVehicles, vehicleClassName]);

  const isFavorite = vehicleClassName ? isFavoriteVehicle(vehicleClassName) : false;

  return (
    vehicle && (
      <div className="VehicleInfo">
        <div className="highlight-info">
          <VehicleImage
            className="vehicle-image"
            vehicleClassName={vehicle.ClassName}
            angle="iso"
            size="l"
            alt=""
          />
          <div className="vehicle-main-info">
            <h1>
              {t("vehicle_Name" + vehicle.ClassName, {
                ns: "vehicles",
                defaultValue: vehicle.Name,
              })}
            </h1>
            <h2>
              {t("vehicle_Name" + vehicle.ClassName, {
                ns: "vehicles",
                defaultValue: vehicle.Name,
                lng: "en",
              })}
            </h2>
            <p className="vehicle-tags">
              <span className="vehicle-role">
                {t("vehicle_class_" + vehicleRoleToKey(vehicle.Role), {
                  ns: "vehicle_classes",
                  defaultValue: vehicle.Role,
                })}
              </span>
              <span className={`vehicle-status ${vehicle.ProgressTracker.Status}`}>
                {t("VehicleProgressTrackerStatus." + vehicle.ProgressTracker.Status)}{" "}
                {vehicle.ProgressTracker.Patch}
              </span>
              <button
                className={`favorite-vehicle-button ${isFavorite ? "active" : ""}`}
                type="button"
                onClick={() => toggleFavoriteVehicle(vehicle.ClassName)}
              >
                <Icon path={isFavorite ? mdiHeart : mdiHeartOutline} size="1rem" />
                <span>
                  {isFavorite
                    ? t("VehicleInfo.favorited", { defaultValue: "已收藏" })
                    : t("VehicleInfo.favorite", { defaultValue: "收藏" })}
                </span>
              </button>
            </p>
            {/* {vehicleMain &&
            <p className="dimensions">{t("VehicleInfo.Dimensions", {
              L: vehicleMain.Dimensions.Length, 
              W: vehicleMain.Dimensions.Width, 
              H: vehicleMain.Dimensions.Height
              })}
            </p>
          } */}
            <div style={{ flexGrow: 1, flexBasis: "1rem" }}></div>
            <p className="store-info">
              {vehicle.Store.Buy ? (
                <span className="price-USD">$ {vehicle.Store.Buy}</span>
              ) : (
                <span className="price-USD inactive">
                  {t("VehicleInfo.notBuyableUSD")}
                </span>
              )}
              {vehicle.Store.IsLimitedSale && (
                <span className="is-limited-sale">{t("VehicleInfo.isLimitedSale")}</span>
              )}
              {vehicle.Store.IsPromotionOnly && (
                <span className="is-promotion-only">
                  {t("VehicleInfo.isPromotionOnly")}
                </span>
              )}
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
          <VehicleSupplementalInfo
            vehicleMain={vehicleMain}
            vehicleHardpoints={vehicleHardpoints}
          />
        </div>
      </div>
    )
  );
};

export default VehicleInfo;
