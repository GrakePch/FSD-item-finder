import type { useTranslation } from "react-i18next";

type Translate = ReturnType<typeof useTranslation>["t"];

const pad = (value: number) => value.toString().padStart(2, "0");

export const translateItemName = (
  t: Translate,
  className: string | undefined,
  defaultValue: string | undefined
) => {
  if (!className) return defaultValue || "-";
  const exact = t("item_Name" + className, { ns: "items", defaultValue: "" });
  if (exact) return exact;

  const withoutScItem = className.replace(/_SCItem$/, "");
  if (withoutScItem !== className) {
    const fallback = t("item_Name" + withoutScItem, {
      ns: "items",
      defaultValue: "",
    });
    if (fallback) return fallback;
  }

  return defaultValue || className;
};

const translateItemGradeClass = (
  t: Translate,
  gradeClass: string | undefined
) => {
  if (!gradeClass) return "?";
  const normalizedGradeClass = gradeClass.toLocaleLowerCase();
  return t(`UEXAttributeValue.${normalizedGradeClass}`, {
    defaultValue: gradeClass,
  });
};

export const formatItemGrade = (
  t: Translate,
  gradeClass: string | undefined,
  grade: number | undefined
) => {
  const classLabel = translateItemGradeClass(t, gradeClass);
  const gradeLabel = typeof grade === "number" ? String.fromCharCode(64 + grade) : "?";
  return t("VehicleInfo.ItemGrade.Format", {
    classLabel,
    gradeLabel,
    defaultValue: `${classLabel} - ${gradeLabel}`,
  });
};

export const formatTime = (seconds: number) => {
  if (seconds < 60) return `${pad(Math.round(seconds))} s`;
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${pad(minutes)} m ${pad(remainingSeconds)} s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${pad(hours)} h ${pad(minutes)} m ${pad(remainingSeconds)} s`;
};

export const formatNumber = (value: number | undefined, digits = 0) =>
  value === undefined ? "-" : value.toFixed(digits);

export const formatSensitivity = (value: number | undefined) =>
  value === undefined ? "-" : `${(value * 100).toFixed(0)}%`;

export const getDamageResistancePercentage = (value: number | undefined) => {
  if (value === undefined) return undefined;
  return Math.round((1 - value) * 100);
};

export const formatDamageResistanceDelta = (value: number | undefined) => {
  const percentage = getDamageResistancePercentage(value);
  if (percentage === undefined) return "-";
  if (percentage > 0) return `+${percentage}%`;
  return `${percentage}%`;
};
