import {
  mdiCurrencySign,
  mdiFileDocumentArrowRightOutline,
  mdiFileDocumentOutline,
} from "@mdi/js";
import { useTranslation } from "react-i18next";
import { formatTime } from "./formatters";
import InfoRow from "./InfoRow";
import styles from "./VehicleSupplementalInfo.module.css";

const Insurance = ({ insurance }: { insurance: VehicleMain["Insurance"] }) => {
  const { t } = useTranslation();
  const hasInsurance =
    insurance.StandardClaimTime !== undefined ||
    insurance.ExpeditedClaimTime !== undefined ||
    insurance.ExpeditedCost !== undefined;

  if (!hasInsurance) return null;

  return (
    <section className={styles.container}>
      <div className={styles.sectionCommonInfo}>
        {insurance.StandardClaimTime !== undefined && (
          <InfoRow
            icon={mdiFileDocumentOutline}
            label={t("VehicleInfo.Insurance.StandardClaimTime", {
              defaultValue: "Standard Claim Time",
            })}
            value={formatTime(insurance.StandardClaimTime * 60)}
          />
        )}
        {insurance.ExpeditedClaimTime !== undefined && (
          <InfoRow
            icon={mdiFileDocumentArrowRightOutline}
            label={t("VehicleInfo.Insurance.ExpeditedClaimTime", {
              defaultValue: "Expedited Claim Time",
            })}
            value={formatTime(insurance.ExpeditedClaimTime * 60)}
          />
        )}
        {insurance.ExpeditedCost !== undefined && (
          <InfoRow
            icon={mdiCurrencySign}
            label={t("VehicleInfo.Insurance.ExpeditedCost", {
              defaultValue: "Expedited Claim Cost",
            })}
            value={`aUEC ${insurance.ExpeditedCost.toLocaleString()}`}
          />
        )}
      </div>
    </section>
  );
};

export default Insurance;
