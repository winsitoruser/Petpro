/**
 * Inventory Database Service
 * 
 * Manages inventory tracking, transactions, and specialized inventory operations.
 */
import { InventoryItem, InventoryTransaction } from '@prisma/client';
import BaseService from './baseService';

export default class InventoryService extends BaseService<InventoryItem> {
  constructor() {
    super('inventoryItem');
    this.searchFields = ['locationCode', 'notes'];
    this.defaultInclude = {
      variant: {
        include: {
          product: true,
        },
      },
      transactions: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    };
  }

  /**
   * Create inventory transaction
   */
  async createInventoryTransaction(
    data: {
      inventoryItemId: string;
      quantity: number;
      type: string; // 'Received', 'Sold', 'Reserved', 'Released', 'Adjusted'
      reference?: string;
      notes?: string;
      createdBy?: string;
    }
  ): Promise<InventoryTransaction> {
    return this.prisma.inventoryTransaction.create({
      data,
    });
  }

  /**
   * Get inventory transaction history for an item
   */
  async getTransactionHistory(
    inventoryItemId: string,
    options?: {
      skip?: number;
      take?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<InventoryTransaction[]> {
    const where: any = { inventoryItemId };
    
    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      
      if (options?.startDate) {
        where.createdAt.gte = options.startDate;
      }
      
      if (options?.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }
    
    return this.prisma.inventoryTransaction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Transfer inventory between locations
   */
  async transferInventory(
    data: {
      variantId: string;
      quantity: number;
      fromLocationCode: string;
      toLocationCode: string;
      reference?: string;
      notes?: string;
      createdBy?: string;
    }
  ): Promise<{ from: InventoryItem; to: InventoryItem }> {
    return this.prisma.$transaction(async (tx) => {
      // Get source inventory item
      const sourceItem = await tx.inventoryItem.findFirst({
        where: {
          variantId: data.variantId,
          locationCode: data.fromLocationCode,
        },
      });
      
      if (!sourceItem) {
        throw new Error(`Source inventory not found for variant ${data.variantId} at location ${data.fromLocationCode}`);
      }
      
      // Check if enough quantity is available
      if (sourceItem.quantity < data.quantity) {
        throw new Error(`Not enough inventory available for transfer. Available: ${sourceItem.quantity}, Requested: ${data.quantity}`);
      }
      
      // Find or create target inventory item
      let targetItem = await tx.inventoryItem.findFirst({
        where: {
          variantId: data.variantId,
          locationCode: data.toLocationCode,
        },
      });
      
      if (!targetItem) {
        targetItem = await tx.inventoryItem.create({
          data: {
            variantId: data.variantId,
            locationCode: data.toLocationCode,
            quantity: 0,
            reservedQuantity: 0,
          },
        });
      }
      
      // Update source inventory (subtract)
      const updatedSource = await tx.inventoryItem.update({
        where: {
          id: sourceItem.id,
        },
        data: {
          quantity: sourceItem.quantity - data.quantity,
        },
      });
      
      // Update target inventory (add)
      const updatedTarget = await tx.inventoryItem.update({
        where: {
          id: targetItem.id,
        },
        data: {
          quantity: targetItem.quantity + data.quantity,
        },
      });
      
      // Create outbound transaction
      await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: sourceItem.id,
          quantity: data.quantity,
          type: 'Transfer Out',
          reference: data.reference,
          notes: `Transferred to ${data.toLocationCode}. ${data.notes || ''}`,
          createdBy: data.createdBy,
        },
      });
      
      // Create inbound transaction
      await tx.inventoryTransaction.create({
        data: {
          inventoryItemId: targetItem.id,
          quantity: data.quantity,
          type: 'Transfer In',
          reference: data.reference,
          notes: `Transferred from ${data.fromLocationCode}. ${data.notes || ''}`,
          createdBy: data.createdBy,
        },
      });
      
      return {
        from: updatedSource,
        to: updatedTarget,
      };
    });
  }

  /**
   * Get inventory summary by location
   */
  async getInventorySummaryByLocation(
    locationCode?: string
  ): Promise<Array<{
    locationCode: string;
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    lowStockCount: number;
  }>> {
    const query = this.prisma.$queryRaw`
      SELECT 
        i.location_code as "locationCode",
        COUNT(DISTINCT i.id) as "totalItems",
        SUM(i.quantity) as "totalQuantity",
        SUM(i.quantity * pv.price) as "totalValue",
        SUM(CASE WHEN i.reorder_threshold IS NOT NULL AND i.quantity <= i.reorder_threshold THEN 1 ELSE 0 END) as "lowStockCount"
      FROM inventory_items i
      JOIN product_variants pv ON i.variant_id = pv.id
      ${locationCode ? this.prisma.$raw`WHERE i.location_code = ${locationCode}` : this.prisma.$raw``}
      GROUP BY i.location_code
      ORDER BY i.location_code
    `;
    
    return query;
  }

  /**
   * Get inventory snapshot by date
   */
  async getInventorySnapshotByDate(
    date: Date
  ): Promise<Array<{
    variantId: string;
    productName: string;
    variantName: string;
    sku: string;
    quantityStart: number;
    received: number;
    sold: number;
    adjusted: number;
    quantityEnd: number;
  }>> {
    // Set date range (start of day to end of day)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    
    // Query for inventory transactions within date range
    return this.prisma.$queryRaw`
      WITH inventory_start AS (
        SELECT 
          ii.variant_id,
          pv.name as variant_name,
          p.name as product_name,
          pv.sku,
          SUM(ii.quantity) as quantity_start
        FROM inventory_items ii
        JOIN product_variants pv ON ii.variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE ii.created_at < ${startDate}
        GROUP BY ii.variant_id, pv.name, p.name, pv.sku
      ),
      transactions AS (
        SELECT 
          ii.variant_id,
          SUM(CASE WHEN it.type = 'Received' THEN it.quantity ELSE 0 END) as received,
          SUM(CASE WHEN it.type = 'Sold' THEN it.quantity ELSE 0 END) as sold,
          SUM(CASE WHEN it.type = 'Adjusted' THEN it.quantity ELSE 0 END) as adjusted
        FROM inventory_transactions it
        JOIN inventory_items ii ON it.inventory_item_id = ii.id
        WHERE it.created_at >= ${startDate} AND it.created_at <= ${endDate}
        GROUP BY ii.variant_id
      ),
      inventory_end AS (
        SELECT 
          ii.variant_id,
          SUM(ii.quantity) as quantity_end
        FROM inventory_items ii
        WHERE ii.created_at < ${nextDay}
        GROUP BY ii.variant_id
      )
      SELECT 
        is_start.variant_id as "variantId",
        is_start.product_name as "productName",
        is_start.variant_name as "variantName",
        is_start.sku,
        COALESCE(is_start.quantity_start, 0) as "quantityStart",
        COALESCE(t.received, 0) as received,
        COALESCE(t.sold, 0) as sold,
        COALESCE(t.adjusted, 0) as adjusted,
        COALESCE(is_end.quantity_end, 0) as "quantityEnd"
      FROM inventory_start is_start
      LEFT JOIN transactions t ON is_start.variant_id = t.variant_id
      LEFT JOIN inventory_end is_end ON is_start.variant_id = is_end.variant_id
      ORDER BY is_start.product_name, is_start.variant_name
    `;
  }

  /**
   * Get inventory items with alerts
   */
  async getInventoryAlerts(
    options?: {
      skip?: number;
      take?: number;
      locationCode?: string;
    }
  ): Promise<InventoryItem[]> {
    const where: any = {
      reorderThreshold: { not: null },
      quantity: {
        lte: this.prisma.raw('reorder_threshold'),
      },
    };
    
    if (options?.locationCode) {
      where.locationCode = options.locationCode;
    }
    
    return this.prisma.inventoryItem.findMany({
      where,
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: [
        {
          locationCode: 'asc',
        },
        {
          quantity: 'asc',
        },
      ],
      skip: options?.skip,
      take: options?.take,
    });
  }
}
