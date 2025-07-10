import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/en.json";
import zh from "./i18n/zh.json";
import itemsEn from "./i18n/items/en.json";
import itemsZh from "./i18n/items/zh.json";

const resources = {
  en: {
    translation: en,
    items: itemsEn,
  },
  zh: {
    translation: zh,
    items: itemsZh,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "zh", // default language
  fallbackLng: "en",
  ns: ["translation", "items"],
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
