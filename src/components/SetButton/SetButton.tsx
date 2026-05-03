import { useNavigate, useSearchParams } from "react-router";
import styles from "./SetButton.module.css";
import TagCurrent from "../TagCurrent/TagCurrent";
import { useTranslation } from "react-i18next";

type ArmorSetKey = keyof ArmorSet;

const SetButton = ({
  subType,
  item,
  selfKey,
}: {
  subType: ArmorSetKey;
  item?: Item | null;
  selfKey: string;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tIcon: Record<ArmorSetKey, string> = {
    undersuit: "🩲",
    helmet: "🤿",
    torso: "👕",
    arms: "💪",
    legs: "👖",
    backpack: "🎒",
  };

  return item ? (
    <button
      className={styles.SetButton}
      onClick={
        item.key === selfKey
          ? undefined
          : () => {
              navigate(`/i/${item.key}?${searchParams.toString()}`);
            }
      }
    >
      <p>{tIcon[subType]}</p>
      <p className={styles.zh}>
        {t(item.key, { ns: "items" })}
        {item.key === selfKey && <TagCurrent />}
      </p>
      {item.price_min_max.buy_min && item.price_min_max.buy_min < Infinity ? (
        <p className={styles.price}>
          {t("Common.priceFrom", { price: item.price_min_max.buy_min })}
        </p>
      ) : (
        <p className={styles.price} style={{ color: "hsl(0deg 0% 60%)" }}>
          {t("SearchItemResultList.notBuyable")}
        </p>
      )}
    </button>
  ) : (
    <button className={styles.SetButton} disabled>
      <p>{tIcon[subType]}</p>
      <p className={styles.zh}>{t("Common.none")}</p>
    </button>
  );
};

export default SetButton;
