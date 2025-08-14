import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import reviewRoutes from '../routes/review.routes';
import notificationRoutes from '../routes/notification.routes';
import errorHandler from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';

// Import Jest properly for usage
import { jest, describe, beforeAll, test, expect } from '@jest/globals';

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn((req: Request, res: Response, next: NextFunction) => {
    // Add user to request for testing
    (req as any).user = { id: '123', role: 'user' };
    next();
  }),
  authorize: jest.fn((roles: string[]) => (req: Request, res: Response, next: NextFunction) => next()),
}));

// Mock Prisma client - use a much simpler approach to bypass TypeScript errors
jest.mock('@prisma/client', () => {
  // Create reusable mock data
  const mockReviews = [
    { id: 'review-1', title: 'Great product', content: 'Really loved it', rating: 5 },
    { id: 'review-2', title: 'Good service', content: 'Satisfied overall', rating: 4 }
  ];

  const mockNotifications = [
    { id: 'notif-1', title: 'New message', content: 'You have a new message', isRead: false },
    { id: 'notif-2', title: 'Order update', content: 'Your order has shipped', isRead: true }
  ];

  // Use a factory function to create mocks that bypass type errors
  const createMockFunction = (returnValue: any) => jest.fn().mockImplementation(() => Promise.resolve(returnValue));
  
  // Mock repositories with a simplified pattern
  const mockReviewRepo = {
    findMany: createMockFunction(mockReviews),
    findUnique: createMockFunction(mockReviews[0]),
    create: jest.fn().mockImplementation(({ data }: any) => Promise.resolve({ ...data, id: 'new-review-id' })),
    update: jest.fn().mockImplementation(({ data, where }: any) => Promise.resolve({ ...data, id: where?.id || 'updated-id' })),
    delete: createMockFunction({ id: 'deleted-id' }),
    count: createMockFunction(1),
    aggregate: createMockFunction({ _avg: { rating: 4.5 }, _count: 10 }),
  };

  // Create the mock client using the factory pattern
  const mockClient = {
    review: mockReviewRepo,
    reviewHelpful: {
      findMany: createMockFunction([
        { rating: 5, _count: 10 },
        { rating: 4, _count: 5 }
      ])
    },
    notification: {
      findMany: createMockFunction(mockNotifications),
      create: jest.fn().mockImplementation(({ data }: any) => Promise.resolve({ ...data, id: 'new-notification-id' })),
      update: jest.fn().mockImplementation(({ data, where }: any) => Promise.resolve({ ...data, id: where?.id || 'updated-id' })),
      delete: createMockFunction({ id: 'deleted-id' }),
      count: createMockFunction(10),
      updateMany: createMockFunction({ count: 3 }),
      findUnique: createMockFunction(mockNotifications[0])
    },
    userNotificationSetting: {
      findUnique: createMockFunction({ id: 'setting-1', isEnabled: true, category: 'ALL' }),
      findMany: createMockFunction([{ category: 'PROMOTIONS', isEnabled: true }, { category: 'REVIEWS', isEnabled: false }])
    },
    notificationTemplate: {
      findUnique: createMockFunction({ id: 'template-1', code: 'WELCOME', title: 'Welcome' }),
      findFirst: createMockFunction({ id: 'template-1', code: 'WELCOME', title: 'Welcome' })
    },
    product: {
      findUnique: createMockFunction({ id: 'product-1', name: 'Dog Food' })
    },
    clinic: {
      findUnique: createMockFunction({ id: 'clinic-1', name: 'Pet Clinic' })
    },
    service: {
      findUnique: createMockFunction({ id: 'service-1', name: 'Grooming' })
    },
    // Special methods with custom implementations
    $transaction: jest.fn((callback: any) => Promise.resolve(callback(mockClient))),
    $connect: jest.fn(),
    $disconnect: jest.fn()
  };

  // Using any type to avoid TypeScript errors with the complex mock structure
  return {
    PrismaClient: jest.fn(() => mockClient as any)
  };
});

describe('API Routes Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/reviews', authenticate, reviewRoutes);
    app.use('/notifications', authenticate, notificationRoutes);
    app.use(errorHandler);
  });

  describe('Review Routes', () => {
    test('GET /reviews/target/:targetType/:targetId - should return reviews for target', async () => {
      const response = await request(app)
        .get('/reviews/target/product/test-product-id')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('POST /reviews/target/:targetType/:targetId - should create new review', async () => {
      const response = await request(app)
        .post('/reviews/target/product/test-product-id')
        .send({
          userId: 'test-user-id',
          title: 'Great product',
          content: 'I love this product, works great!',
          rating: 5,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Notification Routes', () => {
    test('GET /notifications/unread/:userId - should return unread notifications', async () => {
      const response = await request(app)
        .get('/notifications/unread/test-user-id')
        .query({ skip: 0, take: 10 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    test('POST /notifications/mark-read - should mark notifications as read', async () => {
      const response = await request(app)
        .post('/notifications/mark-read')
        .send({
          notificationIds: ['notification-1', 'notification-2']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
    });

    test('POST /notifications - should create a new notification', async () => {
      const response = await request(app)
        .post('/notifications')
        .send({
          userId: 'test-user-id',
          title: 'New message',
          content: 'You have a new message',
          category: 'system',
          priority: 'high',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });
});
