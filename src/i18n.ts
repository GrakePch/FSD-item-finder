import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/en.json";
import zh from "./i18n/zh.json";
import itemsEn from "./i18n/items/en.json";
import itemsZh from "./i18n/items/zh.json";
import locationsEn from "./i18n/locations/en.json";
import locationsZh from "./i18n/locations/zh.json";
import vehiclesEn from "./i18n/vehicles/en.json";
import vehiclesZh from "./i18n/vehicles/zh.json";
import vehicleClassesEn from "./i18n/vehicle_classes/en.json";
import vehicleClassesZh from "./i18n/vehicle_classes/zh.json";

const resources = {
  en: {
    translation: en,
    items: itemsEn,
    locations: locationsEn,
    vehicles: vehiclesEn,
    vehicle_classes: vehicleClassesEn,
  },
  zh: {
    translation: zh,
    items: itemsZh,
    locations: locationsZh,
    vehicles: vehiclesZh,
    vehicle_classes: vehicleClassesZh,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "zh", // default language
  fallbackLng: "en",
  ns: ["translation", "items", "locations", "vehicles", "vehicle_classes"],
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
