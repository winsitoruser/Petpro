import { useLanguage } from '../contexts/LanguageContext';

/**
 * A custom hook that provides translation functionality
 * @returns translation functions and language state
 */
export const useTranslation = () => {
  const {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages,
    isLanguageLoaded
  } = useLanguage();

  /**
   * Format a date according to current locale
   * @param date Date to format
   * @param options Formatting options
   * @returns Formatted date string
   */
  const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) => {
    return new Intl.DateTimeFormat(currentLanguage, options).format(date);
  };

  /**
   * Format a number according to current locale
   * @param num Number to format
   * @param options Formatting options
   * @returns Formatted number string
   */
  const formatNumber = (num: number, options: Intl.NumberFormatOptions = {}) => {
    return new Intl.NumberFormat(currentLanguage, options).format(num);
  };

  /**
   * Format a currency amount according to current locale
   * @param amount Amount to format
   * @param currencyCode Currency code (default: USD)
   * @returns Formatted currency string
   */
  const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
    return formatNumber(amount, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  return {
    // Basic translation
    t,
    
    // Language info
    currentLanguage,
    changeLanguage,
    availableLanguages,
    isLanguageLoaded,
    
    // Formatting helpers
    formatDate,
    formatNumber,
    formatCurrency,
    
    // Utility to check current language
    isRTL: ['ar', 'he', 'fa', 'ur'].includes(currentLanguage),
    
    // Language name getters
    getCurrentLanguageName: () => {
      const lang = availableLanguages.find(l => l.code === currentLanguage);
      return lang ? lang.name : 'English';
    }
  };
};
