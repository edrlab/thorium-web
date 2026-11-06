import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { InitOptions } from "i18next";
import { supportedLocales } from "./supported-locales";

export const DEFAULT_CONFIG: InitOptions = {
  fallbackLng: "en",
  load: "all",
  supportedLngs: supportedLocales,
  detection: {
    order: ["navigator"],
    caches: []
  },
  interpolation: {
    escapeValue: false
  },
  backend: {
    loadPath: "/locales/{{lng}}/{{ns}}.json"
  },
  ns: ["thorium-shared", "thorium-web"],
  defaultNS: ["thorium-web", "thorium-shared"],
  returnEmptyString: false
};

export const initI18n = async (options: Partial<InitOptions> = {}) => {
  if (i18n.isInitialized) {
    return i18n;
  }

  return i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      ...DEFAULT_CONFIG,
      ...options
    });
};

export { i18n };