# PetPro Vendor Mobile App

This repository contains the React Native mobile application for PetPro vendors, enabling service providers to manage their business on the go.

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **API Integration**: Axios
- **Storage**: Expo SecureStore
- **UI Framework**: React Native Superflex
- **Testing**: Jest and React Native Testing Library
- **Code Quality**: ESLint, Prettier

## Project Structure

```
mobile-app/
├── assets/               # Images, fonts, and other static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Basic UI components
│   │   ├── forms/        # Form components
│   │   ├── layout/       # Layout components
│   │   └── screens/      # Screen-specific components
│   ├── config/           # Configuration files
│   ├── constants/        # Application constants
│   ├── context/          # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation setup
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── dashboard/    # Dashboard screens
│   │   ├── products/     # Product management screens
│   │   ├── promotions/   # Promotion management screens
│   │   ├── analytics/    # Analytics screens
│   │   └── settings/     # Settings screens
│   ├── services/         # API services
│   ├── store/            # Redux store
│   │   ├── slices/       # Redux slices
│   │   └── index.ts      # Store configuration
│   ├── styles/           # Global styles and themes
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── .env.example          # Example environment variables
├── app.config.js         # Expo app configuration
├── App.tsx               # Application entry point
├── babel.config.js       # Babel configuration
├── jest.config.js        # Jest configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Prerequisites

- Node.js v18+
- npm v8+ or yarn v1.22+
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator for local development
- Expo Go app on physical devices for testing

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/petpro.git
   cd petpro/mobile-app
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. Start the development server
   ```bash
   npm start
   # or
   yarn start
   ```

5. Run on a device or simulator
   ```bash
   # iOS
   npm run ios
   # or
   yarn ios
   
   # Android
   npm run android
   # or
   yarn android
   ```

## Testing

```bash
# Run all tests
npm test
# or
yarn test

# Run tests in watch mode
npm test:watch
# or
yarn test:watch

# Generate test coverage report
npm test:coverage
# or
yarn test:coverage
```

## Linting and Formatting

```bash
# Lint code
npm run lint
# or
yarn lint

# Fix linting issues
npm run lint:fix
# or
yarn lint:fix

# Format code
npm run format
# or
yarn format
```

## Building for Production

### Expo Build

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### EAS Build (Expo Application Services)

```bash
# Configure EAS
eas build:configure

# Build for development
eas build --profile development

# Build for production
eas build --profile production
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Backend API URL | `http://localhost:3000` |
| `ENVIRONMENT` | Environment (development, staging, production) | `development` |
| `SENTRY_DSN` | Sentry DSN for error tracking | - |
| `ANALYTICS_KEY` | Analytics integration key | - |

## Features

- **Authentication and Profile Management**
  - Login and Registration
  - Password Reset
  - Profile Editing
  - Business Information Management

- **Product Management**
  - Product Listing
  - Inventory Management
  - Price and Stock Updates
  - Product Categories

- **Promotion Management**
  - Create and Edit Promotions
  - Discount Management
  - Coupon Code Generation
  - Promotion Analytics

- **Order Management**
  - View and Process Orders
  - Order Status Updates
  - Customer Communication
  - Delivery Management

- **Analytics and Reports**
  - Sales Performance
  - Product Performance
  - Customer Analytics
  - Revenue Reports

- **Settings**
  - Business Hours
  - Payment Settings
  - Notification Preferences
  - Account Settings

- **Offline Capabilities**
  - Offline Data Access
  - Data Synchronization
  - Background Updates

## UI/UX Guidelines

The application follows the PetPro design system with the following key principles:

- **Consistent Visual Language**: Uniform color palette, typography, and component styling
- **Intuitive Navigation**: Tab-based navigation with clear hierarchies
- **Responsive Design**: Adapts to various screen sizes and orientations
- **Accessibility**: Support for screen readers and other accessibility features
- **Performance**: Optimized for smooth transitions and minimal load times

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The pipeline includes:

1. Code linting and formatting checks
2. Unit and integration tests
3. Code coverage reporting
4. Expo build process
5. Distribution through Expo and app stores

## Contributing

Please refer to the [Contributing Guide](../docs/CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License.
