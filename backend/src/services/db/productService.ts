/**
 * Product Database Service
 * 
 * Manages products, product variants, inventory, and related operations.
 */
import { Product, ProductVariant, InventoryItem, ProductCategory } from '@prisma/client';
import BaseService from './baseService';

export default class ProductService extends BaseService<Product> {
  constructor() {
    super('product');
    this.searchFields = ['name', 'description', 'sku'];
    this.defaultInclude = {
      category: true,
      variants: {
        include: {
          inventoryItems: true,
        },
      },
    };
  }

  /**
   * Find products with available inventory
   */
  async findAvailableProducts(
    options?: {
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      featured?: boolean;
      skip?: number;
      take?: number;
      searchTerm?: string;
      orderBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';
    }
  ): Promise<Product[]> {
    const where: any = {
      deletedAt: null,
      variants: {
        some: {
          active: true,
          inventoryItems: {
            some: {
              quantity: { gt: 0 },
            },
          },
        },
      },
    };
    
    // Add category filter
    if (options?.categoryId) {
      where.categoryId = options.categoryId;
    }
    
    // Add featured filter
    if (options?.featured !== undefined) {
      where.featured = options.featured;
    }
    
    // Add price range filter
    if (options?.minPrice !== undefined || options?.maxPrice !== undefined) {
      where.variants = {
        ...where.variants,
        some: {
          ...where.variants.some,
          price: {
            ...(options?.minPrice !== undefined && { gte: options.minPrice }),
            ...(options?.maxPrice !== undefined && { lte: options.maxPrice }),
          },
        },
      };
    }
    
    // Add search term filter
    if (options?.searchTerm) {
      where.OR = [
        { name: { contains: options.searchTerm, mode: 'insensitive' } },
        { description: { contains: options.searchTerm, mode: 'insensitive' } },
      ];
    }
    
    // Determine order by
    let orderBy = {};
    switch (options?.orderBy) {
      case 'price_asc':
        orderBy = { variants: { orderBy: { price: 'asc' } } };
        break;
      case 'price_desc':
        orderBy = { variants: { orderBy: { price: 'desc' } } };
        break;
      case 'name_asc':
        orderBy = { name: 'asc' };
        break;
      case 'name_desc':
        orderBy = { name: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { name: 'asc' };
    }
    
    return this.prisma.product.findMany({
      where,
      include: this.defaultInclude,
      skip: options?.skip,
      take: options?.take,
      orderBy,
    });
  }

  /**
   * Create a new product with variants and inventory
   */
  async createProduct(productData: {
    categoryId: string;
    name: string;
    description: string;
    sku?: string;
    featured?: boolean;
    publishedAt?: Date;
    metadata?: Record<string, any>;
    attributes?: Record<string, any>;
    variants: Array<{
      name: string;
      sku: string;
      price: number;
      compareAtPrice?: number;
      costPrice?: number;
      options?: Record<string, any>;
      imageUrls?: string[];
      weight?: number;
      weightUnit?: string;
      dimensions?: Record<string, any>;
      inventory?: Array<{
        quantity: number;
        locationCode?: string;
        reservedQuantity?: number;
        reorderThreshold?: number;
      }>;
    }>;
  }): Promise<Product> {
    const { variants = [], ...productDetails } = productData;

    return this.prisma.$transaction(async (tx) => {
      // Create product
      const product = await tx.product.create({
        data: {
          ...productDetails,
          metadata: productDetails.metadata || {},
          attributes: productDetails.attributes || {},
        },
      });

      // Create variants and inventory
      for (const variant of variants) {
        const { inventory = [], ...variantDetails } = variant;
        
        const createdVariant = await tx.productVariant.create({
          data: {
            ...variantDetails,
            productId: product.id,
            options: variantDetails.options || {},
            imageUrls: variantDetails.imageUrls || [],
            dimensions: variantDetails.dimensions || {},
            active: true,
          },
        });

        // Create inventory items for this variant
        if (inventory.length > 0) {
          await tx.inventoryItem.createMany({
            data: inventory.map(inv => ({
              variantId: createdVariant.id,
              quantity: inv.quantity,
              locationCode: inv.locationCode || 'default',
              reservedQuantity: inv.reservedQuantity || 0,
              reorderThreshold: inv.reorderThreshold,
            })),
          });
        }
      }

      // Return the complete product with relations
      return tx.product.findUnique({
        where: { id: product.id },
        include: this.defaultInclude,
      }) as Promise<Product>;
    });
  }

  /**
   * Create a product category
   */
  async createCategory(categoryData: {
    name: string;
    description?: string;
    parentId?: string;
    displayOrder?: number;
  }): Promise<ProductCategory> {
    return this.prisma.productCategory.create({
      data: {
        ...categoryData,
        displayOrder: categoryData.displayOrder || 0,
        active: true,
      },
    });
  }

  /**
   * Get full category tree
   */
  async getCategoryTree(): Promise<ProductCategory[]> {
    // Get all categories
    const allCategories = await this.prisma.productCategory.findMany({
      where: {
        active: true,
      },
      orderBy: [
        { parentId: 'asc' },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });
    
    // Build tree structure
    const categoryMap = new Map<string, ProductCategory & { subcategories: any[] }>();
    const rootCategories: (ProductCategory & { subcategories: any[] })[] = [];
    
    // First pass: prepare categories with empty subcategories arrays
    allCategories.forEach(category => {
      categoryMap.set(category.id, { ...category, subcategories: [] });
    });
    
    // Second pass: build the tree
    allCategories.forEach(category => {
      const mappedCategory = categoryMap.get(category.id)!;
      
      if (!category.parentId) {
        // This is a root category
        rootCategories.push(mappedCategory);
      } else {
        // This is a subcategory
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.subcategories.push(mappedCategory);
        }
      }
    });
    
    return rootCategories;
  }

  /**
   * Update product inventory
   */
  async updateInventory(
    variantId: string,
    updates: Array<{
      locationCode?: string;
      quantity: number;
      type: 'set' | 'add' | 'subtract';
      reference?: string;
      notes?: string;
      createdBy?: string;
    }>
  ): Promise<InventoryItem[]> {
    return this.prisma.$transaction(async (tx) => {
      const updatedItems: InventoryItem[] = [];
      
      for (const update of updates) {
        const locationCode = update.locationCode || 'default';
        
        // Find the inventory item
        let inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            variantId,
            locationCode,
          },
        });
        
        let newQuantity = update.quantity;
        
        if (inventoryItem) {
          // Update existing inventory item
          if (update.type === 'set') {
            newQuantity = update.quantity;
          } else if (update.type === 'add') {
            newQuantity = inventoryItem.quantity + update.quantity;
          } else if (update.type === 'subtract') {
            newQuantity = inventoryItem.quantity - update.quantity;
            if (newQuantity < 0) newQuantity = 0;
          }
          
          inventoryItem = await tx.inventoryItem.update({
            where: {
              id: inventoryItem.id,
            },
            data: {
              quantity: newQuantity,
            },
          });
        } else {
          // Create new inventory item
          inventoryItem = await tx.inventoryItem.create({
            data: {
              variantId,
              locationCode,
              quantity: newQuantity,
              reservedQuantity: 0,
              reorderThreshold: null,
            },
          });
        }
        
        // Record transaction
        await tx.inventoryTransaction.create({
          data: {
            inventoryItemId: inventoryItem.id,
            quantity: update.quantity,
            type: update.type === 'set' ? 'Adjusted' : update.type === 'add' ? 'Received' : 'Sold',
            reference: update.reference,
            notes: update.notes,
            createdBy: update.createdBy,
          },
        });
        
        updatedItems.push(inventoryItem);
      }
      
      return updatedItems;
    });
  }

  /**
   * Reserve inventory for an order
   */
  async reserveInventory(
    items: Array<{
      variantId: string;
      quantity: number;
      locationCode?: string;
    }>,
    reference: string
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const locationCode = item.locationCode || 'default';
        
        // Find the inventory item
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            variantId: item.variantId,
            locationCode,
          },
        });
        
        if (!inventoryItem) {
          throw new Error(`Inventory not found for variant ${item.variantId} at location ${locationCode}`);
        }
        
        // Check if enough quantity is available
        if (inventoryItem.quantity - inventoryItem.reservedQuantity < item.quantity) {
          throw new Error(`Not enough inventory available for variant ${item.variantId}`);
        }
        
        // Update reserved quantity
        await tx.inventoryItem.update({
          where: {
            id: inventoryItem.id,
          },
          data: {
            reservedQuantity: inventoryItem.reservedQuantity + item.quantity,
          },
        });
        
        // Record transaction
        await tx.inventoryTransaction.create({
          data: {
            inventoryItemId: inventoryItem.id,
            quantity: item.quantity,
            type: 'Reserved',
            reference,
          },
        });
      }
      
      return true;
    });
  }

  /**
   * Release reserved inventory
   */
  async releaseInventory(
    items: Array<{
      variantId: string;
      quantity: number;
      locationCode?: string;
    }>,
    reference: string
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const locationCode = item.locationCode || 'default';
        
        // Find the inventory item
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            variantId: item.variantId,
            locationCode,
          },
        });
        
        if (!inventoryItem) {
          throw new Error(`Inventory not found for variant ${item.variantId} at location ${locationCode}`);
        }
        
        // Update reserved quantity
        await tx.inventoryItem.update({
          where: {
            id: inventoryItem.id,
          },
          data: {
            reservedQuantity: Math.max(0, inventoryItem.reservedQuantity - item.quantity),
          },
        });
        
        // Record transaction
        await tx.inventoryTransaction.create({
          data: {
            inventoryItemId: inventoryItem.id,
            quantity: item.quantity,
            type: 'Released',
            reference,
          },
        });
      }
      
      return true;
    });
  }
  
  /**
   * Find low inventory items
   */
  async findLowInventory(options?: {
    skip?: number;
    take?: number;
  }): Promise<InventoryItem[]> {
    return this.prisma.inventoryItem.findMany({
      where: {
        reorderThreshold: { not: null },
        quantity: {
          lte: this.prisma.raw('reorder_threshold'),
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        quantity: 'asc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Get sales report by date range
   */
  async getSalesReport(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    date: string;
    productId: string;
    productName: string;
    variantId: string;
    variantName: string;
    quantity: number;
    revenue: number;
  }>> {
    return this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', o.created_at)::DATE AS date,
        p.id AS product_id,
        p.name AS product_name,
        pv.id AS variant_id,
        pv.name AS variant_name,
        SUM(oi.quantity) AS quantity,
        SUM(oi.total) AS revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN product_variants pv ON oi.variant_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE 
        o.created_at BETWEEN ${startDate} AND ${endDate}
        AND o.status NOT IN ('cancelled', 'refunded')
      GROUP BY date, p.id, p.name, pv.id, pv.name
      ORDER BY date DESC, revenue DESC
    `;
  }
}
