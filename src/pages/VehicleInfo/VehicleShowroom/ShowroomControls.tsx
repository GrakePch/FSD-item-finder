import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";
import { icon } from "../../../assets/icon";
import type { VehiclePose } from "./modelControls";

const controls: {
  key: keyof VehiclePose;
  enableLabel: string;
  disableLabel: string;
  enableIcon: string;
  disableIcon: string;
}[] = [
  {
    key: "lights",
    enableLabel: "turnLightsOn",
    disableLabel: "turnLightsOff",
    enableIcon: icon.vehicle_lights,
    disableIcon: icon.vehicle_lights_off,
  },
  {
    key: "doors",
    enableLabel: "openDoors",
    disableLabel: "closeDoors",
    enableIcon: icon.vehicle_door_open,
    disableIcon: icon.vehicle_door_closed,
  },
  {
    key: "gear",
    enableLabel: "deployGear",
    disableLabel: "retractGear",
    enableIcon: icon.vehicle_gear_down,
    disableIcon: icon.vehicle_gear_up,
  },
  {
    key: "vtol",
    enableLabel: "enableVtol",
    disableLabel: "disableVtol",
    enableIcon: icon.vehicle_vtol,
    disableIcon: icon.vehicle_vtol_off,
  },
  {
    key: "engines",
    enableLabel: "startEngines",
    disableLabel: "stopEngines",
    enableIcon: icon.thruster,
    disableIcon: icon.thruster_off,
  },
];

type ShowroomControlsProps = {
  capabilities: VehiclePose;
  pose: VehiclePose;
  disabled: boolean;
  onToggle: (key: keyof VehiclePose) => void;
};

const ShowroomControls = ({
  capabilities,
  pose,
  disabled,
  onToggle,
}: ShowroomControlsProps) => {
  const { t } = useTranslation();
  const available = controls.filter(({ key }) => capabilities[key]);
  if (!available.length) return null;

  return (
    <div
      className="showroom-controls"
      role="group"
      aria-label={t("Showroom.shipControls")}
    >
      {available.map(({ key, enableLabel, disableLabel, enableIcon, disableIcon }) => {
        const enabled = pose[key];
        const label = t(`Showroom.${enabled ? disableLabel : enableLabel}`);
        return (
          <button
            key={key}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={enabled}
            disabled={disabled}
            onClick={() => onToggle(key)}
          >
            <Icon
              path={enabled ? disableIcon : enableIcon}
              size="1.5rem"
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
};

export default ShowroomControls;
