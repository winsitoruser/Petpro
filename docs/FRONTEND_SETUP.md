# PetPro Frontend Setup Guide

This document provides comprehensive guidance for setting up, developing, and deploying the PetPro frontend applications.

## Project Structure

PetPro consists of two frontend applications:

1. **Web Admin (web-admin)**: Admin dashboard for clinic management, built with:
   - React
   - Material UI
   - React Router
   - React Hook Form

2. **E-Commerce Site (web-vendor)**: Customer-facing web application, built with:
   - Next.js
   - Tailwind CSS
   - Styled-components

## Development Setup

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Docker and Docker Compose (optional, for containerized development)

### Local Development

#### Web Admin Dashboard

```bash
# Navigate to admin dashboard directory
cd web-admin

# Install dependencies
npm install

# Start development server
npm start
```

The admin dashboard will be available at http://localhost:3000

#### E-Commerce Frontend

```bash
# Navigate to e-commerce frontend directory
cd web-vendor

# Install dependencies
npm install

# Start development server
npm run dev
```

The e-commerce frontend will be available at http://localhost:3000

### Docker Development Environment

We provide a Docker setup for consistent development environments:

```bash
# Start both frontend applications
docker compose -f docker-compose.frontend.yml up

# Start only admin dashboard
docker compose -f docker-compose.frontend.yml up web-admin

# Start only e-commerce frontend
docker compose -f docker-compose.frontend.yml up web-vendor
```

When using Docker:
- Admin Dashboard: http://localhost:3001
- E-Commerce Frontend: http://localhost:3000

## Frontend Architecture

### Mock Data Services

Both frontends use mock data services to simulate backend API responses during frontend development:

- `web-admin/src/services/mockData.ts`: Mock data for admin dashboard
- `web-vendor/src/services/mockData.ts`: Mock data for e-commerce site

These services provide asynchronous functions that simulate API calls with realistic delays, allowing frontend development to proceed without backend dependency.

### Admin Dashboard Pages

- Dashboard (`/src/pages/Dashboard.tsx`): Main statistics and overview
- Users (`/src/pages/users/index.tsx`): User management
- Clinics (`/src/pages/clinics/index.tsx`): Clinic management
- Bookings (`/src/pages/bookings/index.tsx`): Appointment management
- Authentication:
  - Login (`/src/pages/auth/Login.tsx`)
  - Forgot Password (`/src/pages/auth/ForgotPassword.tsx`)
  - Reset Password (`/src/pages/auth/ResetPassword.tsx`)

### E-Commerce Site Pages

- Home (`/src/pages/index.tsx`): Landing page
- Shop (`/src/pages/shop/index.tsx`): Product listings
- Product Details (`/src/pages/shop/[id].tsx`): Individual product page
- Cart (`/src/pages/cart.tsx`): Shopping cart
- Checkout (`/src/pages/checkout.tsx`): Checkout process
- Authentication:
  - Login (`/src/pages/auth/login.tsx`)
  - Register (`/src/pages/auth/register.tsx`)

## Docker Configuration

### Development Containers

Both frontend applications have Docker configurations optimized for development:

- **Non-root user**: Containers run as non-root for improved security
- **Volume mapping**: Local code is mounted into containers for live reloading
- **Health checks**: Containers include health check endpoints
- **Resource limits**: Container resources are managed efficiently

### Production Containers

Production Docker images are optimized for performance and security:

- **Multi-stage builds**: Separate build and runtime stages to minimize image size
- **Security hardening**: Non-root users, reduced permissions
- **Resource management**: CPU and memory limits
- **Health checks**: Automated health monitoring
- **Security headers**: Properly configured for web security best practices

## Future Backend Integration

When ready to integrate with backend APIs:

1. Replace mock service calls with actual API calls
2. Update authentication flows to use JWT or other authentication mechanism
3. Configure CORS and API endpoints in the environment variables
4. Implement error handling for API requests

## Health Checks

Both frontend applications include health check endpoints:

- Admin Dashboard: `/health`
- E-Commerce Frontend: `/api/health`

These endpoints return a 200 OK status with `{"status":"ok"}` payload for Docker health checks.

## Environment Variables

### Admin Dashboard Environment Variables

```
NODE_ENV=development|production
PORT=3000
```

### E-Commerce Frontend Environment Variables

```
NODE_ENV=development|production
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000 (for future backend integration)
```

## Deployment

### Production Build

```bash
# Admin Dashboard
cd web-admin
npm run build

# E-Commerce Frontend
cd web-vendor
npm run build
```

### Docker Production Deployment

```bash
# Build and run production containers
docker compose -f docker-compose.production.yml up -d
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 3001 are available or configure different ports
2. **Node modules issues**: Delete node_modules and reinstall dependencies
3. **Docker permission issues**: Ensure Docker has proper permissions

### Docker Container Inspection

```bash
# View container logs
docker logs petpro-admin-frontend
docker logs petpro-vendor-frontend

# Check container health
docker inspect --format='{{.State.Health.Status}}' petpro-admin-frontend
```
