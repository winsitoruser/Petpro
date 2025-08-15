import { registerAs } from '@nestjs/config';
import * as path from 'path';

export default registerAs('i18n', () => ({
  // Default language if none is specified
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
  
  // Available languages
  availableLanguages: ['en', 'ja', 'id'],
  
  // Path to language files relative to the service root
  langPath: path.join(__dirname, 'locales'),
  
  // Fallback language if a translation key is missing in the selected language
  fallbackLanguage: 'en',
  
  // Cookie name for storing language preference
  cookieName: 'petpro_lang',
  
  // Header name for language selection
  headerName: 'Accept-Language',
  
  // Query parameter name for language selection
  queryParameterName: 'lang',
  
  // Cache translations in memory for better performance
  cache: process.env.NODE_ENV === 'production',
  
  // Logging of missing translations
  logMissing: process.env.NODE_ENV !== 'production',
}));
