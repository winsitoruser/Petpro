import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Use backend to load translations from the /locales directory
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    // Default language
    fallbackLng: 'en',
    // Supported languages
    supportedLngs: ['en', 'ja', 'id'],
    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',
    // Default namespace
    defaultNS: 'common',
    // Namespaces to load
    ns: ['common'],
    // Cache busting
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // Detection options
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      cookieExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    interpolation: {
      escapeValue: false, // Not needed for React as it escapes by default
    },
  });

export default i18n;
