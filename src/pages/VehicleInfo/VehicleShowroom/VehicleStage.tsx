import { lazy, Suspense } from "react";
import VehicleImage from "../../../components/VehicleImage";
import { useVehicleModel } from "./modelSource";
import "./VehicleShowroom.css";

const VehicleShowroom = lazy(() => import("./VehicleShowroom"));

type VehicleStageProps = { vehicleClassName: string };

const VehicleStage = ({ vehicleClassName }: VehicleStageProps) => {
  const model = useVehicleModel(vehicleClassName);
  const poster = (
    <div className="vehicle-showroom">
      <div className="showroom-image">
        <VehicleImage
          vehicleClassName={vehicleClassName}
          angle="iso"
          size="xl"
          className="showroom-fallback"
          alt=""
        />
      </div>
    </div>
  );
  return model ? (
    <Suspense fallback={poster}>
      <VehicleShowroom
        key={`${vehicleClassName}:${model.sha256}`}
        vehicleClassName={vehicleClassName}
        source={model}
      />
    </Suspense>
  ) : (
    poster
  );
};

export default VehicleStage;
