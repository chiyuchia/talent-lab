import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { candidatesEnglish } from "./candidates-en";
import { commonEnglish } from "./common-en";
import { resumeEnglish } from "./resume-en";

const english = {
  ...commonEnglish,
  ...candidatesEnglish,
  ...resumeEnglish,
};

const chinese = Object.fromEntries(
  Object.keys(english).map((key) => [key, key]),
);

export type AppLanguage = "en" | "zh";

const LANGUAGE_STORAGE_KEY = "talent-lab-language";

export function detectBrowserLanguage(): AppLanguage {
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function getInitialLanguage(): AppLanguage {
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (storedLanguage === "en" || storedLanguage === "zh") {
    return storedLanguage;
  }
  return detectBrowserLanguage();
}

function updateDocumentLanguage(language: AppLanguage) {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
}

const language = getInitialLanguage();

void i18n.use(initReactI18next).init({
  lng: language,
  fallbackLng: "en",
  supportedLngs: ["en", "zh"],
  resources: {
    en: { translation: english },
    zh: { translation: chinese },
  },
  interpolation: { escapeValue: false },
  keySeparator: false,
  nsSeparator: false,
});

updateDocumentLanguage(language);

export function setAppLanguage(language: AppLanguage) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  updateDocumentLanguage(language);
  void i18n.changeLanguage(language);
}

export default i18n;
