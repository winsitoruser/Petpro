# Mobile App Internationalization (i18n) Guide

This document provides information about the internationalization implementation in the PetPro mobile application.

## Overview

The PetPro mobile app supports multiple languages:

- English (en) - Default
- Japanese (ja)
- Indonesian (id)

The internationalization system uses the following libraries:
- `i18n-js`: Core internationalization library
- `expo-localization`: For device locale detection
- `@react-native-async-storage/async-storage`: For persisting language preferences

## Directory Structure

```
mobile-app/
├── src/
│   ├── i18n/
│   │   ├── i18n.ts                # Main i18n configuration
│   │   └── locales/               # Translation files
│   │       ├── en.json            # English translations
│   │       ├── ja.json            # Japanese translations
│   │       └── id.json            # Indonesian translations
│   ├── contexts/
│   │   └── LanguageContext.tsx    # React Context for language management
│   └── components/
│       └── LanguageSwitcher.tsx   # Language switching component
```

## Implementation Details

### i18n Configuration

The `i18n.ts` file handles the core internationalization setup:

- Imports and registers all translation files
- Detects the device language using `expo-localization`
- Falls back to English if a translation is not available
- Provides functions to get and set the current language
- Persists language selection in `AsyncStorage`

### Language Context

The `LanguageContext.tsx` provides React Context for application-wide access to:

- Current language (`currentLanguage`)
- Language switching function (`changeLanguage`)
- Translation function (`t`)
- List of available languages (`availableLanguages`)
- Loading state (`isLanguageLoaded`)

### Translation Usage

To use translations in your components:

```tsx
import { useLanguage } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { t } = useLanguage();
  
  return (
    <Text>{t('common.hello')}</Text>
  );
};
```

### Language Switching

The `LanguageSwitcher` component provides a user interface for switching languages:

- Displays the current language with appropriate flag emoji
- Shows modal with all available languages
- Persists language selection across app restarts

## Translation Structure

Translations are organized in JSON files with nested keys:

```json
{
  "common": {
    "appName": "PetPro",
    "loading": "Loading..."
  },
  "auth": {
    "login": "Login",
    "signup": "Sign Up"
  }
}
```

Access translations using dot notation: `t('common.appName')`

## Adding a New Language

To add support for a new language:

1. Create a new JSON file in the `locales` directory (e.g., `fr.json` for French)
2. Translate all strings from the English version
3. Register the language in `i18n.ts`:
   ```typescript
   // Import the new language
   import fr from './locales/fr.json';
   
   // Add to i18n instance
   const i18n = new I18n({
     en,
     ja,
     id,
     fr, // Add the new language here
   });
   
   // Add to available languages list
   export const getAvailableLanguages = (): { code: string; name: string }[] => {
     return [
       { code: 'en', name: i18n.t('language.english') },
       { code: 'ja', name: i18n.t('language.japanese') },
       { code: 'id', name: i18n.t('language.indonesian') },
       { code: 'fr', name: i18n.t('language.french') }, // Add new language here
     ];
   };
   ```
4. Add translation for the language name in all existing language files

## Best Practices

1. **Use Keys, Not Literal Strings**: Always use translation keys instead of hardcoded strings
2. **Namespace Keys**: Group related translations under common namespaces
3. **Variables in Translations**: Pass variables as parameters
   ```tsx
   // In translation file
   { "greeting": "Hello, %{name}!" }
   
   // In component
   t('greeting', { name: 'User' })
   ```
4. **Pluralization**: Use proper pluralization rules when needed
5. **Keep Translations Updated**: When adding new UI elements, always add corresponding translations

## Integration with App

The i18n system is integrated at the app root level:

```tsx
// App.tsx
import { LanguageProvider } from './src/contexts/LanguageContext';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </SafeAreaProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}
```

## Settings Screen

The Settings screen includes the language switcher component, allowing users to change language preferences from within the application.

## Testing

To test translations:
1. Switch to each supported language in the app
2. Navigate through key screens to verify translations
3. Check for any untranslated strings or formatting issues
4. Verify that date/time formats and number formats are correct

## Future Enhancements

Planned improvements for i18n support:
- Right-to-left (RTL) language support
- Automatic translation of dynamic content
- Integration with remote translation services
- Translation editor for non-technical users
