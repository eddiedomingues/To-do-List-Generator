/* Main script for language translation using i18next library */

// Main library import
import i18n from "i18next";

// Other necessary libraries
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// Main script
i18n
  .use(HttpApi) // Lloads translations from a server
  .use(LanguageDetector) // Ddetects user language
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    supportedLngs: ["en", "fr", "es", "pt"], // Languages you want to support
    fallbackLng: "en", // Language to use if the user's language is not available
    debug: true,
    ns: ["main", "windows", "notifications", "themes", "list"], // Custom namespaces for organisation

    // Set the default namespace
    defaultNS: "main",
    detection: {
      order: [
        "queryString",
        "cookie",
        "localStorage",
        "sessionStorage",
        "navigator",
        "htmlTag",
        "path",
        "subdomain",
      ],
      caches: ["cookie"],
    },
    // The backend configuration
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
