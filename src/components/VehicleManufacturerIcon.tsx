import iconsManufacturerSmall from "../assets/iconsManufacturerSmall";

type VehicleManufacturerIconProps = {
  className?: string;
  manufacturer: string;
};

export default function VehicleManufacturerIcon({
  className,
  manufacturer,
}: VehicleManufacturerIconProps) {
  const icon = iconsManufacturerSmall[manufacturer];

  if (!icon) {
    return null;
  }

  return (
    <span aria-hidden="true" className={className}>
      {icon}
    </span>
  );
}
