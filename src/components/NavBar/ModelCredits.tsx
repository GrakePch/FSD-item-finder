import { useId, useRef } from "react";
import Icon from "@mdi/react";
import { mdiCopyright, mdiClose } from "@mdi/js";
import { useTranslation } from "react-i18next";
import styles from "./ModelCredits.module.css";

const ModelCredits = () => {
  const { t } = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        className={styles.modelCreditsButton}
        aria-label={t("Showroom.creditsTitle")}
        title={t("Showroom.creditsTitle")}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <Icon path={mdiCopyright} size="1.5rem" />
      </button>
      <dialog
        ref={dialog}
        className={styles.modelCreditsDialog}
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            dialog.current?.close();
        }}
      >
        <div className={styles.creditsHeader}>
          <h2 id={titleId}>{t("Showroom.creditsTitle")}</h2>
          <button
            type="button"
            className={styles.creditsClose}
            aria-label={t("Showroom.closeCredits")}
            onClick={() => dialog.current?.close()}
          >
            <Icon path={mdiClose} size="1.25rem" />
          </button>
        </div>
        <p>{t("Showroom.modelCopyright")}</p>
        <p className={styles.creditsSource}>
          {t("Showroom.modelSource")}
          <br />
          <a
            href="https://scshowroom.gamers-fix.com/?mode=ships"
            target="_blank"
            rel="noreferrer"
          >
            SC Dressing Room / Showroom · MrCosplayGuy
          </a>
        </p>
      </dialog>
    </>
  );
};

export default ModelCredits;
