import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";
import { icon } from "../../../assets/icon";
import { formatSensitivity, translateItemName } from "./formatters";
import { getItemSize } from "./hardpointUtils";
import InfoRow from "./InfoRow";
import InstalledHeader from "./InstalledHeader";
import { findVehicleItem } from "./vehicleItemData";
import styles from "./VehicleSupplementalInfo.module.css";

const RadarInfo = ({
  spvVehicleHardpoints,
}: {
  spvVehicleHardpoints: SpvVehicleHardpoints;
}) => {
  const { t } = useTranslation();
  const radars = spvVehicleHardpoints.Hardpoints.Components.Avionics.Radars;
  const radar = radars.InstalledItems?.find((item) => {
    const className = item?.BaseLoadout?.ClassName || item?.Loadout;
    return Boolean(className && !className.endsWith("_Fake"));
  });

  if (!radar) return null;

  const radarClassName = radar.BaseLoadout?.ClassName || radar.Loadout;
  const vItem = findVehicleItem(radarClassName);
  const maxLockRange = vItem?.stdItem?.Radar?.AimAssist?.DistanceMax;
  const maxLockRangeDisplay =
    maxLockRange === undefined
      ? "-"
      : Number.isInteger(maxLockRange)
        ? `${maxLockRange.toFixed(0)} m`
        : `${maxLockRange.toFixed(1)} m`;
  const sensitivityIR = vItem?.stdItem?.Radar?.IR?.Sensitivity;
  const sensitivityEM = vItem?.stdItem?.Radar?.EM?.Sensitivity;
  const sensitivityCS = vItem?.stdItem?.Radar?.CS?.Sensitivity;
  const sensitivityRS = vItem?.stdItem?.Radar?.RS?.Sensitivity;

  return (
    <section className={styles.container}>
      {vItem ? (
        <InstalledHeader icon={icon.radar} item={vItem} />
      ) : (
        <div className={styles.sectionInstalledInfo}>
          <Icon path={icon.radar} size="1.5rem" />
          <div className={styles.name}>
            {translateItemName(
              t,
              radarClassName,
              radar.BaseLoadout?.Name ||
                t("VehicleInfo.Radar.Unknown", { defaultValue: "Radar" })
            )}
          </div>
          {getItemSize(radar) !== undefined && (
            <div className={styles.icon}>S{getItemSize(radar)}</div>
          )}
        </div>
      )}
      <div className={styles.sectionCommonInfo}>
        <InfoRow
          icon=""
          label={t("VehicleInfo.Radar.MaxLockRange", {
            defaultValue: "Max Lock Range",
          })}
          value={maxLockRangeDisplay}
        />
        <InfoRow
          icon={icon.emission_type_ir}
          label={t("VehicleInfo.Radar.InfraredSensitivity", {
            defaultValue: "Infrared Sensitivity",
          })}
          value={formatSensitivity(sensitivityIR)}
        />
        <InfoRow
          icon={icon.emission_type_em}
          label={t("VehicleInfo.Radar.ElectromagneticSensitivity", {
            defaultValue: "Electromagnetic Sensitivity",
          })}
          value={formatSensitivity(sensitivityEM)}
        />
        <InfoRow
          icon={icon.emission_type_cs}
          label={t("VehicleInfo.Radar.CrossSectionSensitivity", {
            defaultValue: "Cross Section Sensitivity",
          })}
          value={formatSensitivity(sensitivityCS)}
        />
        <InfoRow
          icon={icon.radar}
          label={t("VehicleInfo.Radar.RadarSignatureSensitivity", {
            defaultValue: "Radar Signature Sensitivity",
          })}
          value={formatSensitivity(sensitivityRS)}
        />
      </div>
    </section>
  );
};

export default RadarInfo;
