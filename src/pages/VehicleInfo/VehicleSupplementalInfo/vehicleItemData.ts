import vehicleItemsEssentialRaw from "../../../data/vehicles/spv_vehicle_items_essential.json";
import type { EssentialVehicleItem } from "./types";

const vehicleItemsEssential = vehicleItemsEssentialRaw as EssentialVehicleItem[];

export const findVehicleItem = (className: string | undefined) =>
  className
    ? vehicleItemsEssential.find(
        (item) =>
          item.className === className || item.stdItem?.ClassName === className
      )
    : undefined;
