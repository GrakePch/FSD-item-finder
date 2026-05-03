import styles from "./Footer.module.css";
import uexBadge from "../../assets/uex-api-badge-powered.png";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <>
      <div style={{ flexGrow: 1 }}></div>
      <div className={styles.Footer}>
        <div className={styles.uex}>
          <a href="https://uexcorp.space/" target="_blank">
            <p>{t("Footer.dataSupport")}</p>
          </a>
          <a href="https://uexcorp.space/" target="_blank">
            <img src={uexBadge} width="140" />
          </a>
        </div>
        <p>
          <a href="https://support.citizenwiki.cn/t/StarFinder" target="_blank">
            {t("Footer.feedback")}
          </a>
          {" | "}
          <a href="https://github.com/GrakePch/FSD-item-finder" target="_blank">
            {t("Footer.sourceCode")}
          </a>
        </p>
        <p>{t("Footer.designAndDevelopment", { name: "GrakePCH" })}</p>
        <p>{t("Footer.technicalSupport", { name: "CxJuice" })}</p>
      </div>
    </>
  );
};

export default Footer;
