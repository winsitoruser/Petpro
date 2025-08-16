# Multilingual Documentation

This directory contains the multilingual documentation for PetPro in three languages:

- English (EN)
- Japanese (JP)
- Indonesian (ID)

## Directory Structure

All documentation is organized in language-specific subdirectories:

```
/docs/i18n/
  ├── en/                  # English documentation
  │   ├── architecture/    # Architecture documentation
  │   ├── api/             # API documentation
  │   ├── erd/             # Entity Relationship Diagrams
  │   ├── prd/             # Product Requirements Documents
  │   ├── drs/             # Design Requirement Specifications
  │   └── ui-ux/           # UI/UX Guidelines
  │
  ├── jp/                  # Japanese documentation
  │   ├── architecture/    # Architecture documentation
  │   ├── api/             # API documentation
  │   ├── erd/             # Entity Relationship Diagrams
  │   ├── prd/             # Product Requirements Documents
  │   ├── drs/             # Design Requirement Specifications
  │   └── ui-ux/           # UI/UX Guidelines
  │
  └── id/                  # Indonesian documentation
      ├── architecture/    # Architecture documentation
      ├── api/             # API documentation
      ├── erd/             # Entity Relationship Diagrams
      ├── prd/             # Product Requirements Documents
      ├── drs/             # Design Requirement Specifications
      └── ui-ux/           # UI/UX Guidelines
```

## Language Selection

The documentation system supports language switching via:

1. Language selector in the documentation portal
2. URL path parameters (/docs/i18n/[language]/...)
3. User profile preferences

## Translation Guidelines

When creating or updating documentation:

1. Always create the English version first as the source of truth
2. Use consistent terminology across all languages
3. Maintain the same document structure and formatting
4. Include the same diagrams and visual elements
5. Update all language versions when making changes

## Translation Status

A translation status dashboard is available at `/docs/i18n/translation-status.md` showing the current state of translations for all documentation.
