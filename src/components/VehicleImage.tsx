import type { ImgHTMLAttributes } from "react";
import {
  useVehicleImageSrc,
  type VehicleImageAngle,
  type VehicleImageSize,
} from "../utils/vehicleImageManifest";

type VehicleImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  angle?: VehicleImageAngle;
  size?: VehicleImageSize;
  vehicleClassName: string | undefined;
};

export default function VehicleImage({
  angle = "top",
  size = "xs",
  vehicleClassName,
  ...props
}: VehicleImageProps) {
  const src = useVehicleImageSrc(vehicleClassName, angle, size);

  if (!src) {
    return null;
  }

  return <img {...props} src={src} />;
}
