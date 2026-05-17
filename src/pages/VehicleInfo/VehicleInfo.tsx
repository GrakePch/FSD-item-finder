import "./VehicleInfo.css";
import { useParams } from "react-router";
import { ContextAllData } from "../../contexts";
import { useContext, useMemo } from "react";
import Icon from "@mdi/react";
import { mdiHeart, mdiHeartOutline } from "@mdi/js";
import spvVehicleIndexRaw from "../../data/vehicles/spv_vehicle_index.json";
import spvVehicleListRaw from "../../data/vehicles/spv_vehicle_list.json";
import spvVehicleHardpointsRaw from "../../data/vehicles/spv_vehicle_hardpoints.json";
import spvClassNameToUexId from "../../data/vehicles/spv_classname_to_uex_id.json";
import TradeOptionsSortingControl from "../../components/TradeOptionsSortingControl/TradeOptionsSortingControl";
import TradeOptions from "../../components/TradeOptions/TradeOptions";
import VehicleImage from "../../components/VehicleImage";
import { spvRoleToKey } from "../../utils";
import { useTranslation } from "react-i18next";
import VehicleSupplementalInfo from "./VehicleSupplementalInfo/VehicleSupplementalInfo";
import useFavoriteVehicles from "../../hooks/useFavoriteVehicles";

const spvClassNameToUexIdMap = spvClassNameToUexId as Record<string, number>;
const spvVehicleIndex = spvVehicleIndexRaw as unknown as SpvVehicleIndex[];
const spvVehicleList = spvVehicleListRaw as unknown as SpvVehicleMain[];
const spvVehicleHardpointsList = spvVehicleHardpointsRaw as unknown as SpvVehicleHardpoints[];

const VehicleInfo = () => {
  const { t } = useTranslation();
  const vehicleClassName = useParams().vehicleClassName;
  const { dictVehicles } = useContext(ContextAllData);
  const { isFavoriteVehicle, toggleFavoriteVehicle } = useFavoriteVehicles();

  const spvVehicle = useMemo(
    () => spvVehicleIndex.find((v) => v.ClassName === vehicleClassName),
    [vehicleClassName]
  );

  const spvVehicleMain = useMemo(
    () => spvVehicleList.find((v) => v.ClassName === vehicleClassName),
    [vehicleClassName]
  );

  const spvVehicleHardpoints = useMemo(
    () => spvVehicleHardpointsList.find((v) => v.ClassName === vehicleClassName),
    [vehicleClassName]
  );

  const uexVehicle = useMemo(() => {
    const uexId = vehicleClassName ? spvClassNameToUexIdMap[vehicleClassName] : undefined;
    return Object.values(dictVehicles).find((v) => v.id_vehicle === uexId);
  }, [dictVehicles, spvClassNameToUexId, vehicleClassName]);

  const isFavorite = vehicleClassName ? isFavoriteVehicle(vehicleClassName) : false;

  return (
    spvVehicle && (
      <div className="VehicleInfo">
        <div className="highlight-info">
          <VehicleImage
            className="vehicle-image"
            vehicleClassName={spvVehicle.ClassName}
            angle="iso"
            size="l"
            alt=""
          />
          <div className="vehicle-main-info">
            <h1>
              {t("vehicle_Name" + spvVehicle.ClassName, {
                ns: "vehicles",
                defaultValue: spvVehicle.Name,
              })}
            </h1>
            <h2>
              {t("vehicle_Name" + spvVehicle.ClassName, {
                ns: "vehicles",
                defaultValue: spvVehicle.Name,
                lng: "en",
              })}
            </h2>
            <p className="vehicle-tags">
              <span className="vehicle-role">
                {t("vehicle_class_" + spvRoleToKey(spvVehicle.Role), {
                  ns: "vehicle_classes",
                  defaultValue: spvVehicle.Role,
                })}
              </span>
              <span className={`vehicle-status ${spvVehicle.ProgressTracker.Status}`}>
                {t("SPVProgressTrackerStatus." + spvVehicle.ProgressTracker.Status)}{" "}
                {spvVehicle.ProgressTracker.Patch}
              </span>
              <button
                className={`favorite-vehicle-button ${isFavorite ? "active" : ""}`}
                type="button"
                onClick={() => toggleFavoriteVehicle(spvVehicle.ClassName)}
              >
                <Icon path={isFavorite ? mdiHeart : mdiHeartOutline} size="1rem" />
                <span>
                  {isFavorite
                    ? t("VehicleInfo.favorited", { defaultValue: "已收藏" })
                    : t("VehicleInfo.favorite", { defaultValue: "收藏" })}
                </span>
              </button>
            </p>
            {/* {spvVehicleMain &&
            <p className="dimensions">{t("VehicleInfo.Dimensions", {
              L: spvVehicleMain.Dimensions.Length, 
              W: spvVehicleMain.Dimensions.Width, 
              H: spvVehicleMain.Dimensions.Height
              })}
            </p>
          } */}
            <div style={{ flexGrow: 1, flexBasis: "1rem" }}></div>
            <p className="store-info">
              {spvVehicle.Store.Buy ? (
                <span className="price-USD">$ {spvVehicle.Store.Buy}</span>
              ) : (
                <span className="price-USD inactive">
                  {t("VehicleInfo.notBuyableUSD")}
                </span>
              )}
              {spvVehicle.Store.IsLimitedSale && (
                <span className="is-limited-sale">{t("VehicleInfo.isLimitedSale")}</span>
              )}
              {spvVehicle.Store.IsPromotionOnly && (
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
            spvVehicleMain={spvVehicleMain}
            spvVehicleHardpoints={spvVehicleHardpoints}
          />
        </div>
      </div>
    )
  );
};

export default VehicleInfo;
