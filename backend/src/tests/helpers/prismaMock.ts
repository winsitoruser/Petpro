/**
 * Prisma Mock Helper
 * 
 * Creates a mock Prisma client for unit testing
 */
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Create a deep mock of the Prisma client
export const prismaMock = mockDeep<PrismaClient>();

// Mock the Prisma instance so we can intercept calls to it
export const mockPrismaClient = (): void => {
  jest.mock('../../db/prisma', () => ({
    __esModule: true,
    prisma: prismaMock,
    default: prismaMock
  }));
};

// Reset all mocks between tests
export const resetPrismaMocks = (): void => {
  jest.resetAllMocks();
};

export default prismaMock;
