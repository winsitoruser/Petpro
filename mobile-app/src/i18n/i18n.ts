import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from './locales/en.json';
import ja from './locales/ja.json';
import id from './locales/id.json';

// Create i18n instance
const i18n = new I18n({
  en,
  ja,
  id,
});

// Set the locale once at the beginning
i18n.locale = Localization.locale.split('-')[0];

// Fallback to English if translation doesn't exist
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Function to set language
export const setLanguage = async (lang: string) => {
  i18n.locale = lang;
  try {
    await AsyncStorage.setItem('user-language', lang);
  } catch (error) {
    console.error('Error saving language preference', error);
  }
};

// Function to get current language
export const getCurrentLanguage = (): string => {
  return i18n.locale;
};

// Function to get available languages
export const getAvailableLanguages = (): { code: string; name: string }[] => {
  return [
    { code: 'en', name: i18n.t('language.english') },
    { code: 'ja', name: i18n.t('language.japanese') },
    { code: 'id', name: i18n.t('language.indonesian') },
  ];
};

// Initialize with saved language if available
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('user-language');
    if (savedLanguage) {
      i18n.locale = savedLanguage;
    }
  } catch (error) {
    console.error('Error loading language preference', error);
  }
};

export default i18n;
