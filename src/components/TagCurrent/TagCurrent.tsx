import { useTranslation } from "react-i18next";

const TagCurrent = () => {
  const { t } = useTranslation();

  return (
    <span
      style={{
        marginInlineStart: ".25rem",
        color: "var(--color-bg)",
        backgroundColor: "var(--color-text-1)",
        fontSize: ".75rem",
        fontWeight: 500,
        padding: "0 .25rem",
        borderRadius: ".5rem",
        verticalAlign: "text-top",
      }}
    >
      {t("Common.current")}
    </span>
  );
};

export default TagCurrent;
