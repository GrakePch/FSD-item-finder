import vehicleItemsEssentialRaw from "../../data/vehicles/vehicle_items_essential.json";
import type { EssentialVehicleItem } from "../VehicleInfo/VehicleSupplementalInfo/types";

const vehicleItemsEssential = vehicleItemsEssentialRaw as EssentialVehicleItem[];

/**
 * 将 UEX 物品 key（如 item_Name_QDRV_ARCC_S01_Burst）规整成 QDRV... 形态，
 * 用于与 essential 的 className 匹配。
 *
 * UEX key 前缀形态有三种：item_Name_ / item_Name / item_name，QDRV 可能直接跟在
 * 前缀后，也可能带 _SCItem 后缀（有的 key 带，有的不带）。因此这里不做正则强依赖，
 * 只取 "QDRV" 之后的子串作为 classname 候选。
 */
const normalizeKeyToClassName = (key: string): string | null => {
  const idx = key.toUpperCase().indexOf("QDRV");
  if (idx < 0) return null;
  return key.slice(idx); // e.g. QDRV_ARCC_S01_Burst 或 QDRV_ARCC_S01_Burst_SCItem
};

const stripScItemSuffix = (className: string): string =>
  className.replace(/_SCItem$/, "");

/**
 * 判定一个 UEX 物品 key 是否对应量子驱动器。
 * 若命中 essential 中的 QD 条目，返回该条目；否则返回 undefined。
 */
export const findQDItemByKey = (key: string): EssentialVehicleItem | undefined => {
  const normalized = normalizeKeyToClassName(key);
  if (!normalized) return undefined;

  // 直接匹配
  const direct = vehicleItemsEssential.find(
    (it) =>
      it.className === normalized || it.stdItem?.ClassName === normalized
  );
  if (direct) return direct;

  // 去掉 _SCItem 后缀再匹配（处理 key 带 sCItem 但 essential 不带，或反之）
  const withoutSuffix = stripScItemSuffix(normalized);
  return vehicleItemsEssential.find(
    (it) =>
      stripScItemSuffix(it.className) === withoutSuffix ||
      stripScItemSuffix(it.stdItem?.ClassName || "") === withoutSuffix
  );
};

/** 依据 sub_type 判定的语义武器（量子驱动器） */
export const isQuantumDriveSubType = (subType: string | null | undefined): boolean =>
  subType === "Quantum Drives";
