import { mdiShieldHalfFull } from "@mdi/js";
import { useTranslation } from "react-i18next";
import { icon } from "../../../assets/icon";
import {
  formatDamageResistanceDelta,
  formatNumber,
  getDamageResistancePercentage,
} from "./formatters";
import InfoRow from "./InfoRow";
import styles from "./VehicleSupplementalInfo.module.css";

const ArmorInfo = ({ armor }: { armor: VehicleMain["Armor"] }) => {
  const { t } = useTranslation();
  const armorHealth = armor?.Durability?.Health;
  const physicalDamageDeflection = armor?.DamageDeflection?.Physical;
  const energyDamageDeflection = armor?.DamageDeflection?.Energy;
  const physicalDamageModifier = armor?.Durability?.DamageMultipliers?.Physical;
  const energyDamageModifier = armor?.Durability?.DamageMultipliers?.Energy;
  const hasArmorInfo = [
    armorHealth,
    physicalDamageDeflection,
    energyDamageDeflection,
    physicalDamageModifier,
    energyDamageModifier,
  ].some((value) => value !== undefined);

  if (!hasArmorInfo) return null;

  return (
    <section className={styles.container}>
      <div className={styles.sectionCommonInfo}>
        {armorHealth !== undefined && (
          <InfoRow
            icon={icon.armor_physical_deflection_threshold}
            label={t("VehicleInfo.Armor.Health", { defaultValue: "Armor Health" })}
            value={formatNumber(armorHealth)}
          />
        )}
        {physicalDamageDeflection !== undefined && (
          <InfoRow
            icon={icon.armor_energy_deflection_threshold}
            label={t("VehicleInfo.Armor.PhysicalDamageDeflection", {
              defaultValue: "Physical Damage Deflection",
            })}
            value={formatNumber(physicalDamageDeflection)}
          />
        )}
        {energyDamageDeflection !== undefined && (
          <InfoRow
            icon={icon.damage_resistance_physical}
            label={t("VehicleInfo.Armor.EnergyDamageDeflection", {
              defaultValue: "Energy Damage Deflection",
            })}
            value={formatNumber(energyDamageDeflection)}
          />
        )}
        {physicalDamageModifier !== undefined && (
          <InfoRow
            icon={icon.damage_resistance_energy}
            label={t("VehicleInfo.Armor.PhysicalDamageResistance", {
              defaultValue: "Physical Damage Resistance",
            })}
            value={formatDamageResistanceDelta(physicalDamageModifier)}
            warn={(getDamageResistancePercentage(physicalDamageModifier) ?? 0) < 0}
          />
        )}
        {energyDamageModifier !== undefined && (
          <InfoRow
            icon={mdiShieldHalfFull}
            label={t("VehicleInfo.Armor.EnergyDamageResistance", {
              defaultValue: "Energy Damage Resistance",
            })}
            value={formatDamageResistanceDelta(energyDamageModifier)}
            warn={(getDamageResistancePercentage(energyDamageModifier) ?? 0) < 0}
          />
        )}
      </div>
    </section>
  );
};

export default ArmorInfo;
