# PetPro Admin Portal

This repository contains the administration dashboard for the PetPro platform, enabling platform administrators to manage vendors, users, transactions, and platform settings.

## Technology Stack

- **Framework**: React
- **Language**: TypeScript
- **UI Library**: Material UI
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query
- **Routing**: React Router
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Testing**: Jest and React Testing Library
- **Authentication**: JWT

## Project Structure

```
web-admin/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Common UI elements
│   │   ├── dashboard/     # Dashboard components
│   │   ├── forms/         # Form components
│   │   ├── layout/        # Layout components
│   │   └── tables/        # Table components
│   ├── config/            # Configuration files
│   ├── constants/         # Constants and enumerations
│   ├── features/          # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── vendors/       # Vendor management
│   │   ├── users/         # User management
│   │   ├── transactions/  # Transaction management
│   │   └── settings/      # Platform settings
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── store/             # Redux store configuration
│   │   ├── slices/        # Redux slices
│   │   └── index.ts       # Store configuration
│   ├── theme/             # Theming and styling
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Application entry component
│   ├── index.tsx          # Entry point
│   └── routes.tsx         # Route definitions
├── tests/                 # Test files
├── .env.example           # Example environment variables
├── .eslintrc.js           # ESLint configuration
├── jest.config.js         # Jest configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

## Prerequisites

- Node.js v18+
- npm v8+ or yarn v1.22+

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/petpro.git
   cd petpro/web-admin
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your local configuration
   ```

4. Start the development server
   ```bash
   npm run start
   # or
   yarn start
   ```

5. The application will be available at http://localhost:3001

## Docker Development

You can also run the web admin portal using Docker:

```bash
# From the root directory of the project
docker-compose up web-admin
```

## Building for Production

```bash
npm run build
# or
yarn build
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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:3000` |
| `REACT_APP_GA_ID` | Google Analytics ID | - |
| `REACT_APP_ENVIRONMENT` | Environment (development, staging, production) | `development` |

## Features

- **Admin Authentication**
  - Login with Role-based Access Control
  - Multi-factor Authentication
  - Session Management

- **Vendor Management**
  - Vendor Approval and Verification
  - Service Provider Profile Management
  - Performance Monitoring

- **User Management**
  - User Profile Management
  - Pet Profile Management
  - Support Requests

- **Transaction Management**
  - Order Processing
  - Payment Oversight
  - Refund Management
  - Commission Configuration

- **Content Management**
  - Banner and Promotional Content
  - Email Templates
  - Notification Templates

- **Platform Settings**
  - Global Configuration
  - Feature Toggles
  - API Key Management
  - Integration Settings

- **Analytics and Reporting**
  - Revenue Dashboards
  - User Growth Metrics
  - Service Usage Statistics
  - Custom Report Generation

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The pipeline includes:

1. Code linting and formatting checks
2. Unit and integration tests
3. Code coverage reporting
4. Build process
5. Deployment to AWS S3 with CloudFront distribution

## Contributing

Please refer to the [Contributing Guide](../docs/CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License.
