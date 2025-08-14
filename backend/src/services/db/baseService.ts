/**
 * Base Database Service
 * 
 * Provides core CRUD operations and common methods for all database services.
 * All specific model services extend this base class.
 */
import { Prisma } from '@prisma/client';
import prisma from '../../db/prisma';

export default class BaseService<T extends object = any> {
  protected model: string;
  protected prisma: any;
  protected defaultInclude: object = {};
  protected searchFields: string[] = [];

  constructor(model: string) {
    this.model = model;
    this.prisma = prisma;
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string, include?: object): Promise<T | null> {
    const includeOptions = include || this.defaultInclude;
    return this.prisma[this.model].findUnique({
      where: { id },
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    }) as Promise<T | null>;
  }

  /**
   * Find many records with optional filtering, pagination, and sorting
   */
  async findMany(params: {
    where?: any;
    include?: object;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<T[]> {
    const { where, include, orderBy, skip, take } = params;
    const includeOptions = include || this.defaultInclude;

    return this.prisma[this.model].findMany({
      where,
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
      orderBy,
      skip,
      take,
    }) as Promise<T[]>;
  }

  /**
   * Create a new record
   */
  async create(data: any, include?: object): Promise<T> {
    const includeOptions = include || this.defaultInclude;
    return this.prisma[this.model].create({
      data,
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    }) as Promise<T>;
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: any, include?: object): Promise<T> {
    const includeOptions = include || this.defaultInclude;
    return this.prisma[this.model].update({
      where: { id },
      data,
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    }) as Promise<T>;
  }

  /**
   * Delete a record (hard delete)
   */
  async delete(id: string): Promise<T> {
    return this.prisma[this.model].delete({
      where: { id },
    }) as Promise<T>;
  }

  /**
   * Soft delete a record (for models with deletedAt field)
   */
  async softDelete(id: string): Promise<T> {
    return this.prisma[this.model].update({
      where: { id },
      data: { deletedAt: new Date() },
    }) as Promise<T>;
  }

  /**
   * Count records with optional filtering
   */
  async count(where?: any): Promise<number> {
    return this.prisma[this.model].count({ where });
  }

  /**
   * Find the first record matching the conditions
   */
  async findFirst(params: {
    where?: any;
    include?: object;
    orderBy?: any;
  }): Promise<T | null> {
    const { where, include, orderBy } = params;
    const includeOptions = include || this.defaultInclude;

    return this.prisma[this.model].findFirst({
      where,
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
      orderBy,
    }) as Promise<T | null>;
  }

  /**
   * Create multiple records in a transaction
   */
  async createMany(data: any[]): Promise<Prisma.BatchPayload> {
    return this.prisma[this.model].createMany({
      data,
      skipDuplicates: false,
    });
  }

  /**
   * Update multiple records in a transaction
   */
  async updateMany(where: any, data: any): Promise<Prisma.BatchPayload> {
    return this.prisma[this.model].updateMany({
      where,
      data,
    });
  }

  /**
   * Delete multiple records in a transaction
   */
  async deleteMany(where: any): Promise<Prisma.BatchPayload> {
    return this.prisma[this.model].deleteMany({
      where,
    });
  }

  /**
   * Search records by specified fields
   */
  async search(query: string, options?: {
    where?: any;
    include?: object;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<T[]> {
    if (!this.searchFields.length) {
      throw new Error(`No search fields defined for ${this.model}`);
    }

    const opts = options || {};
    const where = opts.where || {};
    const searchConditions: any[] = [];

    // Create OR conditions for each search field
    this.searchFields.forEach(field => {
      searchConditions.push({
        [field]: {
          contains: query,
          mode: 'insensitive',
        },
      });
    });

    // Combine with any existing where conditions
    const fullWhere = {
      ...where,
      OR: searchConditions,
    };

    return this.findMany({
      where: fullWhere,
      include: opts.include || this.defaultInclude,
      orderBy: opts.orderBy,
      skip: opts.skip,
      take: opts.take,
    });
  }

  /**
   * Execute a custom query using a transaction
   */
  async executeWithTransaction<R>(
    callback: (tx: any) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(async (tx: any) => {
      return callback(tx);
    });
  }

  /**
   * Upsert a record (create if not exists, update if exists)
   */
  async upsert(
    where: any,
    create: any,
    update: any,
    include?: object
  ): Promise<T> {
    const includeOptions = include || this.defaultInclude;
    return this.prisma[this.model].upsert({
      where,
      create,
      update,
      include: Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    }) as Promise<T>;
  }
}
