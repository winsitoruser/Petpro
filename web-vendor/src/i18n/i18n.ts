import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Load translation using http -> see /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Default namespace
    defaultNS: 'common',
    
    // Available languages
    supportedLngs: ['en', 'ja', 'id'],
    
    interpolation: {
      escapeValue: false, // not needed for React as it escapes by default
    },
    
    // Detection options
    detection: {
      order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
      cookieExpirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      cookieDomain: window.location.hostname,
    },
    
    // Backend options
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
