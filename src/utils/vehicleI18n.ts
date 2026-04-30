import vehiclesEn from "../i18n/vehicles/en.json";
import vehiclesZh from "../i18n/vehicles/zh.json";

const vehicleNamePrefix = "vehicle_Name";

const vehicleNameAliases: Record<string, string> = {
  ANVL_C8R_Pisces: "vehicle_NameANVL_C8R_Pisces_Rescue",
  ANVL_Hornet_F7A_Mk1: "vehicle_NameANVL_Hornet_F7A",
  ANVL_Hornet_F7CM_Mk2_Heartseeker: "vehicle_NameANVL_Hornet_F7CM_Heartseeker_Mk2",
  ARGO_MPUV_1T: "vehicle_NameARGO_MPUV_Tractor",
  CNOU_Pionneer: "vehicle_NameCNOU_Pioneer",
  CRUS_Genesis_Starliner: "vehicle_NameCRUS_Starliner",
  CRUS_Spirit_A1: "vehicle_NameCRUS_A1_Spirit",
  CRUS_Spirit_C1: "vehicle_NameCRUS_C1_Spirit",
  CRUS_Spirit_E1: "vehicle_NameCRUS_E1_Spirit",
  GATAC_Railen: "vehicle_NameXIAN_Railen",
  KRIG_L22_AlphaWolf: "vehicle_NameKRIG_L22_Alpha_Wolf",
  RSI_Aurora_GS_SE: "vehicle_NameRSI_Aurora_SE",
  VNCL_Blade: "vehicle_NameESPR_Blade",
};

const vehicleNameKeys = Array.from(
  new Set([...Object.keys(vehiclesEn), ...Object.keys(vehiclesZh)])
);

const vehicleNameKeyByLowercase = Object.fromEntries(
  vehicleNameKeys.map((key) => [key.toLowerCase(), key])
);

export function getVehicleNameI18nKey(className: string): string {
  const directKey = `${vehicleNamePrefix}${className}`;
  if (directKey in vehiclesEn || directKey in vehiclesZh) return directKey;
  return vehicleNameKeyByLowercase[directKey.toLowerCase()] || vehicleNameAliases[className] || directKey;
}

export function getTranslatedVehicleName(
  t: (key: string, options?: Record<string, unknown>) => string,
  vehicle: SpvVehicleIndex
): string {
  return t(getVehicleNameI18nKey(vehicle.ClassName), {
    ns: "vehicles",
    defaultValue: vehicle.Name,
  });
}
