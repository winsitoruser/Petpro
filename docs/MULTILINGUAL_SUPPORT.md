# Multilingual Support Documentation

## Overview

PetPro supports multiple languages to serve our global user base. The platform currently supports:

- English (en)
- Japanese (ja)
- Indonesian (id)

This document outlines how multilingual support is implemented across different parts of the platform and how to add new translations or extend existing ones.

## Architecture

Our internationalization (i18n) strategy is implemented across all application layers:

1. **Frontend Applications**
   - Web Admin Interface
   - Web Vendor Interface
   - Mobile Application

2. **Backend Services**
   - API responses with translatable content
   - Error messages
   - Notification templates

## Technology Stack

### Frontend

- **Web Interfaces**: next-i18next
- **Mobile App**: i18next with react-native-localize

### Backend

- **Node.js Services**: i18next with i18next-fs-backend
- **Templates**: Handlebars with i18n support

## Directory Structure

### Web Applications

```
/public/locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── petServices.json
│   └── ...
├── ja/
│   ├── common.json
│   ├── auth.json
│   ├── petServices.json
│   └── ...
└── id/
    ├── common.json
    ├── auth.json
    ├── petServices.json
    └── ...
```

### Backend Services

```
/src/locales/
├── en/
│   ├── api.json
│   ├── errors.json
│   └── emails.json
├── ja/
│   ├── api.json
│   ├── errors.json
│   └── emails.json
└── id/
    ├── api.json
    ├── errors.json
    └── emails.json
```

## Usage Guide

### Web Applications

#### Basic Usage

```typescript
import { useTranslation } from 'next-i18next';

const MyComponent = () => {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
};
```

#### With Variables

```typescript
const { t } = useTranslation('common');

// In JSON: "welcome": "Welcome, {{name}}!"
t('welcome', { name: 'John' });
```

#### Pluralization

```typescript
// In JSON: 
// "items": {
//   "one": "{{count}} item",
//   "other": "{{count}} items"
// }

t('items', { count: 1 }); // "1 item"
t('items', { count: 5 }); // "5 items"
```

### Backend Services

```javascript
import i18next from 'i18next';

// Set language
i18next.changeLanguage('ja');

// Get translation
const message = i18next.t('errors:notFound');

// Return in API response
res.status(404).json({ message });
```

### Language Switcher

The platform includes a language switcher component that can be added to any page:

```typescript
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Header = () => (
  <header>
    <nav>
      {/* Other nav items */}
      <LanguageSwitcher />
    </nav>
  </header>
);
```

## Adding a New Language

1. **Create Directory Structure**:
   - Add new language folder in `/public/locales/` for web apps
   - Add new language folder in `/src/locales/` for backend services

2. **Copy Translation Files**:
   - Copy JSON files from an existing language folder
   - Translate all values while keeping keys intact

3. **Update Configuration**:
   - Add the new language code to the supported languages list in configuration files
   - Add language to the language selector component

## Best Practices

1. **Use Namespaces** to organize translations by feature or module
2. **Keep Keys Readable** using dot notation for hierarchy (e.g., `auth.login.title`)
3. **Avoid String Concatenation** and instead use variables with placeholders
4. **Extract Common Terms** to the common namespace
5. **Document Special Formatting** requirements for languages with different punctuation or grammar rules

## Translation Management

1. **Adding New Translations**:
   - Add new keys to all language files to maintain consistency
   - Provide a default English translation as a fallback
   
2. **Updating Existing Translations**:
   - Make sure to update the key in all language files
   - Consider using a translation management system for larger projects

3. **Missing Translations**:
   - The system will fall back to English for any missing translations
   - Regular audits should be performed to identify and fill translation gaps

## Troubleshooting

### Common Issues

1. **Missing Translations**:
   - Check that the key exists in the corresponding language file
   - Ensure namespaces are correctly specified and imported

2. **Server/Client Mismatch**:
   - Ensure `_app.js` is correctly configured with `appWithTranslation`
   - Check that server-side and client-side rendering are using the same i18n configuration

3. **Locale Detection Issues**:
   - Review Next.js configuration for locale detection
   - Verify that cookies or localStorage persistence is working correctly

## Future Enhancements

1. **Automated Translation Pipeline** for new content
2. **Translation Memory** to ensure consistency across the platform
3. **Right-to-Left (RTL) Support** for languages like Arabic and Hebrew
4. **Language-Specific Formatting** for dates, numbers, and currencies
5. **Content Editor** for non-technical users to update translations

---

## Related Documentation

- [Next.js i18n Documentation](https://nextjs.org/docs/advanced-features/i18n-routing)
- [React i18next Documentation](https://react.i18next.com/)
- [Backend i18next Setup](https://www.i18next.com/overview/getting-started)
