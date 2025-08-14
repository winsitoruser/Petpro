/**
 * Order Database Service
 * 
 * Manages orders, shopping carts, and e-commerce operations.
 */
import { Order, OrderItem, ShoppingCart, ShoppingCartItem, OrderStatus } from '@prisma/client';
import BaseService from './baseService';
import { v4 as uuidv4 } from 'uuid';

export default class OrderService extends BaseService<Order> {
  constructor() {
    super('order');
    this.searchFields = ['orderNumber', 'notes'];
    this.defaultInclude = {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      billingAddress: true,
      shippingAddress: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
      transactions: true,
    };
  }

  /**
   * Create or update a shopping cart
   */
  async upsertCart(
    data: {
      userId?: string;
      guestId?: string;
      items: Array<{
        variantId: string;
        quantity: number;
      }>;
    }
  ): Promise<ShoppingCart> {
    const { userId, guestId, items } = data;
    
    if (!userId && !guestId) {
      throw new Error('Either userId or guestId must be provided');
    }
    
    return this.prisma.$transaction(async (tx) => {
      // Find existing cart or create new one
      let cart: ShoppingCart;
      
      const existingCart = await tx.shoppingCart.findFirst({
        where: {
          OR: [
            { userId: userId || null },
            { guestId: guestId || null },
          ],
        },
        include: {
          items: true,
        },
      });
      
      if (existingCart) {
        cart = existingCart;
      } else {
        cart = await tx.shoppingCart.create({
          data: {
            userId,
            guestId,
          },
        });
      }
      
      // Update cart items
      for (const item of items) {
        // Check if the item already exists in the cart
        const existingItem = cart.items?.find(
          (i) => i.variantId === item.variantId
        );
        
        if (existingItem) {
          if (item.quantity <= 0) {
            // Remove item if quantity is 0 or negative
            await tx.shoppingCartItem.delete({
              where: { id: existingItem.id },
            });
          } else {
            // Update quantity if item exists
            await tx.shoppingCartItem.update({
              where: { id: existingItem.id },
              data: { quantity: item.quantity },
            });
          }
        } else if (item.quantity > 0) {
          // Add new item to cart if quantity is positive
          await tx.shoppingCartItem.create({
            data: {
              cartId: cart.id,
              variantId: item.variantId,
              quantity: item.quantity,
            },
          });
        }
      }
      
      // Return updated cart with items
      return tx.shoppingCart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      }) as Promise<ShoppingCart>;
    });
  }

  /**
   * Get cart with products by user or guest ID
   */
  async getCart(
    params: {
      userId?: string;
      guestId?: string;
    }
  ): Promise<ShoppingCart | null> {
    const { userId, guestId } = params;
    
    if (!userId && !guestId) {
      return null;
    }
    
    return this.prisma.shoppingCart.findFirst({
      where: {
        OR: [
          { userId: userId || null },
          { guestId: guestId || null },
        ],
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                inventoryItems: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create order from cart
   */
  async createOrderFromCart(
    cartId: string,
    orderData: {
      currencyCode: string;
      billingAddressId?: string;
      shippingAddressId?: string;
      shippingMethod?: string;
      notes?: string;
      promoCode?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      // Get cart with items
      const cart = await tx.shoppingCart.findUnique({
        where: { id: cartId },
        include: {
          user: true,
          items: {
            include: {
              variant: true,
            },
          },
        },
      });
      
      if (!cart) {
        throw new Error('Shopping cart not found');
      }
      
      if (!cart.items || cart.items.length === 0) {
        throw new Error('Shopping cart is empty');
      }
      
      // Validate inventory availability
      for (const item of cart.items) {
        const inventory = await tx.inventoryItem.findFirst({
          where: {
            variantId: item.variantId,
          },
        });
        
        if (!inventory || (inventory.quantity - inventory.reservedQuantity) < item.quantity) {
          throw new Error(`Not enough inventory for product variant: ${item.variant.name}`);
        }
      }
      
      // Calculate order totals
      let subtotal = 0;
      let tax = 0;
      let shipping = 0;
      let discount = 0;
      
      for (const item of cart.items) {
        subtotal += item.variant.price * item.quantity;
      }
      
      // Apply promotion code if provided
      if (orderData.promoCode) {
        const promotion = await tx.promotion.findUnique({
          where: {
            code: orderData.promoCode,
            active: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        });
        
        if (promotion) {
          // Check minimum order amount if applicable
          if (!promotion.minimumOrderAmount || subtotal >= promotion.minimumOrderAmount) {
            if (promotion.discountType === 'percentage') {
              discount = (subtotal * promotion.discountValue) / 100;
            } else {
              discount = promotion.discountValue;
            }
            
            // Update promotion usage count
            await tx.promotion.update({
              where: { id: promotion.id },
              data: {
                usageCount: {
                  increment: 1,
                },
              },
            });
          }
        }
      }
      
      // Calculate tax (simplified to 10% for demo purposes)
      tax = (subtotal - discount) * 0.1;
      
      // Calculate shipping (simplified flat rate for demo purposes)
      shipping = 5.99;
      
      // Calculate total
      const total = subtotal + tax + shipping - discount;
      
      // Generate unique order number
      const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Create order
      const order = await tx.order.create({
        data: {
          userId: cart.userId,
          guestEmail: cart.userId ? undefined : `guest-${cart.guestId}@example.com`,
          orderNumber,
          status: OrderStatus.PENDING,
          currencyCode: orderData.currencyCode,
          subtotal,
          tax,
          shipping,
          discount,
          total,
          notes: orderData.notes,
          billingAddressId: orderData.billingAddressId,
          shippingAddressId: orderData.shippingAddressId,
          shippingMethod: orderData.shippingMethod,
          promoCode: orderData.promoCode,
          metadata: orderData.metadata || {},
        },
      });
      
      // Create order items
      for (const item of cart.items) {
        const itemTotal = item.variant.price * item.quantity;
        const itemTax = itemTotal * 0.1; // 10% tax
        const itemDiscount = discount > 0 ? (itemTotal / subtotal) * discount : 0;
        
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            name: item.variant.name,
            sku: item.variant.sku,
            quantity: item.quantity,
            price: item.variant.price,
            discount: itemDiscount,
            tax: itemTax,
            total: itemTotal + itemTax - itemDiscount,
            metadata: {},
          },
        });
        
        // Reserve inventory
        const inventory = await tx.inventoryItem.findFirst({
          where: { variantId: item.variantId },
        });
        
        if (inventory) {
          await tx.inventoryItem.update({
            where: { id: inventory.id },
            data: {
              reservedQuantity: inventory.reservedQuantity + item.quantity,
            },
          });
          
          // Record inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              inventoryItemId: inventory.id,
              quantity: item.quantity,
              type: 'Reserved',
              reference: `Order ${order.orderNumber}`,
            },
          });
        }
      }
      
      // Clear the cart
      await tx.shoppingCartItem.deleteMany({
        where: { cartId },
      });
      
      // Return the complete order
      return tx.order.findUnique({
        where: { id: order.id },
        include: this.defaultInclude,
      }) as Promise<Order>;
    });
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Handle inventory changes based on status transition
      if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        // Release reserved inventory for cancelled orders
        for (const item of order.items) {
          const inventory = await tx.inventoryItem.findFirst({
            where: { variantId: item.variantId },
          });
          
          if (inventory) {
            await tx.inventoryItem.update({
              where: { id: inventory.id },
              data: {
                reservedQuantity: Math.max(0, inventory.reservedQuantity - item.quantity),
              },
            });
            
            // Record inventory transaction
            await tx.inventoryTransaction.create({
              data: {
                inventoryItemId: inventory.id,
                quantity: item.quantity,
                type: 'Released',
                reference: `Order ${order.orderNumber} cancelled`,
              },
            });
          }
        }
      } else if (status === OrderStatus.SHIPPED && order.status !== OrderStatus.SHIPPED) {
        // Deduct inventory when shipped
        for (const item of order.items) {
          const inventory = await tx.inventoryItem.findFirst({
            where: { variantId: item.variantId },
          });
          
          if (inventory) {
            await tx.inventoryItem.update({
              where: { id: inventory.id },
              data: {
                quantity: Math.max(0, inventory.quantity - item.quantity),
                reservedQuantity: Math.max(0, inventory.reservedQuantity - item.quantity),
              },
            });
            
            // Record inventory transaction
            await tx.inventoryTransaction.create({
              data: {
                inventoryItemId: inventory.id,
                quantity: item.quantity,
                type: 'Sold',
                reference: `Order ${order.orderNumber} shipped`,
              },
            });
          }
        }
      }
      
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          notes: notes ? (order.notes ? `${order.notes}\n${notes}` : notes) : order.notes,
        },
        include: this.defaultInclude,
      });
      
      return updatedOrder;
    });
  }

  /**
   * Find orders by user
   */
  async findOrdersByUser(
    userId: string,
    options?: {
      status?: OrderStatus;
      skip?: number;
      take?: number;
    }
  ): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        userId,
        ...(options?.status ? { status: options.status } : {}),
      },
      include: this.defaultInclude,
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }
}
