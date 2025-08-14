# PetPro Vendor Web Portal

This repository contains the web portal for vendors on the PetPro platform, allowing service providers to manage their profiles, services, bookings, and analytics.

## Technology Stack

- **Framework**: React with Next.js
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Styled Components / Tailwind CSS
- **API Integration**: Axios
- **Testing**: Jest and React Testing Library
- **Authentication**: JWT with HTTP-only cookies

## Project Structure

```
web-vendor/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── config/       # Configuration files
│   ├── contexts/     # React contexts
│   ├── hooks/        # Custom React hooks
│   ├── layouts/      # Page layouts
│   ├── pages/        # Next.js pages
│   ├── services/     # API services
│   ├── store/        # Redux store and slices
│   ├── styles/       # Global styles
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── tests/            # Test files
├── .env.example      # Example environment variables
├── .eslintrc.js      # ESLint configuration
├── jest.config.js    # Jest configuration
├── next.config.js    # Next.js configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project dependencies
```

## Prerequisites

- Node.js v18+
- npm v8+ or yarn v1.22+

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/petpro.git
   cd petpro/web-vendor
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
   npm run dev
   # or
   yarn dev
   ```

5. The application will be available at http://localhost:3002

## Docker Development

You can also run the web vendor portal using Docker:

```bash
# From the root directory of the project
docker-compose up web-vendor
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
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment (development, staging, production) | `development` |

## Features

- **Vendor Authentication**
  - Registration and Login
  - Password Reset
  - Profile Management
  
- **Service Management**
  - Service Creation and Editing
  - Pricing Management
  - Availability Settings
  
- **Booking Management**
  - Appointment Calendar
  - Booking Confirmation/Rejection
  - Customer Communication
  
- **Product Management**
  - Product Catalog
  - Inventory Management
  - Promotions and Discounts
  
- **Analytics Dashboard**
  - Revenue Reports
  - Customer Statistics
  - Service Performance

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The pipeline includes:

1. Code linting and formatting checks
2. Unit and integration tests
3. Code coverage reporting
4. Static site generation
5. Deployment to AWS S3 with CloudFront distribution

## Contributing

Please refer to the [Contributing Guide](../docs/CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License.
