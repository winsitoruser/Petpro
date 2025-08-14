/**
 * Payment Database Service
 * 
 * Manages payment methods, transactions, refunds, and payment processing.
 */
import { PaymentMethod, PaymentTransaction, PaymentRefund, PaymentStatus } from '@prisma/client';
import BaseService from './baseService';

export default class PaymentService extends BaseService<PaymentTransaction> {
  constructor() {
    super('paymentTransaction');
    this.searchFields = ['reference', 'externalReference'];
    this.defaultInclude = {
      order: true,
      refunds: true,
      paymentMethod: true,
    };
  }

  /**
   * Create or update a payment method for a user
   */
  async upsertPaymentMethod(
    data: {
      userId: string;
      type: string;
      providerType: string;
      isDefault?: boolean;
      expiryMonth?: number;
      expiryYear?: number;
      last4?: string;
      cardBrand?: string;
      billingAddressId?: string;
      externalReference?: string;
      metadata?: Record<string, any>;
      makeDefault?: boolean;
    }
  ): Promise<PaymentMethod> {
    const { makeDefault, ...methodData } = data;

    return this.prisma.$transaction(async (tx) => {
      let paymentMethod: PaymentMethod;

      // Check if the user has a payment method with this external reference
      if (data.externalReference) {
        const existingMethod = await tx.paymentMethod.findFirst({
          where: {
            userId: data.userId,
            externalReference: data.externalReference,
          },
        });

        if (existingMethod) {
          // Update existing payment method
          paymentMethod = await tx.paymentMethod.update({
            where: {
              id: existingMethod.id,
            },
            data: methodData,
          });
        } else {
          // Create new payment method
          paymentMethod = await tx.paymentMethod.create({
            data: methodData,
          });
        }
      } else {
        // Create new payment method without checking external reference
        paymentMethod = await tx.paymentMethod.create({
          data: methodData,
        });
      }

      // If this payment method should be the default, unset other defaults
      if (makeDefault || data.isDefault) {
        await tx.paymentMethod.updateMany({
          where: {
            userId: data.userId,
            id: {
              not: paymentMethod.id,
            },
          },
          data: {
            isDefault: false,
          },
        });

        // Make sure this one is default
        if (!paymentMethod.isDefault) {
          paymentMethod = await tx.paymentMethod.update({
            where: {
              id: paymentMethod.id,
            },
            data: {
              isDefault: true,
            },
          });
        }
      }

      return paymentMethod;
    });
  }

  /**
   * Get payment methods for a user
   */
  async getPaymentMethodsForUser(
    userId: string
  ): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({
      where: {
        userId,
        active: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Create a payment transaction
   */
  async createTransaction(
    data: {
      orderId?: string;
      appointmentId?: string;
      userId: string;
      paymentMethodId?: string;
      amount: number;
      currencyCode: string;
      status: PaymentStatus;
      provider: string;
      paymentType: string;
      reference?: string;
      externalReference?: string;
      metadata?: Record<string, any>;
      notes?: string;
    }
  ): Promise<PaymentTransaction> {
    return this.prisma.paymentTransaction.create({
      data: {
        ...data,
        metadata: data.metadata || {},
      },
      include: this.defaultInclude,
    });
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: PaymentStatus,
    metadata?: Record<string, any>,
    externalReference?: string,
    notes?: string
  ): Promise<PaymentTransaction> {
    const updateData: any = { status };
    
    if (metadata) {
      updateData.metadata = metadata;
    }
    
    if (externalReference) {
      updateData.externalReference = externalReference;
    }
    
    if (notes) {
      updateData.notes = notes;
    }
    
    return this.prisma.paymentTransaction.update({
      where: {
        id: transactionId,
      },
      data: updateData,
      include: this.defaultInclude,
    });
  }

  /**
   * Process refund for a transaction
   */
  async processRefund(
    data: {
      transactionId: string;
      amount: number;
      reason: string;
      notes?: string;
      externalReference?: string;
      issuedById: string;
      metadata?: Record<string, any>;
    }
  ): Promise<PaymentRefund> {
    return this.prisma.$transaction(async (tx) => {
      // Get the transaction
      const transaction = await tx.paymentTransaction.findUnique({
        where: {
          id: data.transactionId,
        },
        include: {
          refunds: true,
        },
      });
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      // Calculate already refunded amount
      const refundedAmount = transaction.refunds.reduce(
        (sum, refund) => sum + refund.amount,
        0
      );
      
      // Check if refund amount is valid
      if (data.amount <= 0) {
        throw new Error('Refund amount must be greater than 0');
      }
      
      if (data.amount + refundedAmount > transaction.amount) {
        throw new Error(
          `Cannot refund more than the transaction amount. Already refunded: ${refundedAmount}, Requested: ${data.amount}, Transaction total: ${transaction.amount}`
        );
      }
      
      // Create refund record
      const refund = await tx.paymentRefund.create({
        data: {
          transactionId: data.transactionId,
          amount: data.amount,
          currencyCode: transaction.currencyCode,
          reason: data.reason,
          notes: data.notes,
          externalReference: data.externalReference,
          issuedById: data.issuedById,
          metadata: data.metadata || {},
        },
      });
      
      // Update transaction status if fully refunded
      if (data.amount + refundedAmount === transaction.amount) {
        await tx.paymentTransaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: PaymentStatus.REFUNDED,
          },
        });
      } else if (refundedAmount === 0) {
        // First partial refund
        await tx.paymentTransaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            status: PaymentStatus.PARTIALLY_REFUNDED,
          },
        });
      }
      
      return refund;
    });
  }

  /**
   * Get transaction history for a user
   */
  async getUserTransactionHistory(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
      startDate?: Date;
      endDate?: Date;
      status?: PaymentStatus;
    }
  ): Promise<PaymentTransaction[]> {
    const where: any = { userId };
    
    if (options?.status) {
      where.status = options.status;
    }
    
    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      
      if (options?.startDate) {
        where.createdAt.gte = options.startDate;
      }
      
      if (options?.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }
    
    return this.prisma.paymentTransaction.findMany({
      where,
      include: this.defaultInclude,
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Get summary of payment activity
   */
  async getPaymentSummary(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalRevenue: number;
    refundedAmount: number;
    netRevenue: number;
    transactionCount: number;
    successRate: number;
    averageTransactionValue: number;
    paymentMethodDistribution: Record<string, number>;
  }> {
    const [
      successfulTransactions,
      refundData,
      totalTransactions,
      paymentMethods,
    ] = await Promise.all([
      // Get all successful transactions
      this.prisma.paymentTransaction.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: PaymentStatus.COMPLETED,
        },
        select: {
          amount: true,
          paymentType: true,
        },
      }),
      
      // Get refund data
      this.prisma.paymentRefund.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      
      // Get total transaction count
      this.prisma.paymentTransaction.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      
      // Get payment method distribution
      this.prisma.paymentTransaction.groupBy({
        by: ['paymentType'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: PaymentStatus.COMPLETED,
        },
        _count: true,
      }),
    ]);
    
    // Calculate totals
    const totalRevenue = successfulTransactions.reduce(
      (sum, tx) => sum + tx.amount, 
      0
    );
    
    const refundedAmount = refundData._sum.amount || 0;
    const netRevenue = totalRevenue - refundedAmount;
    const successRate = totalTransactions > 0 
      ? (successfulTransactions.length / totalTransactions) * 100 
      : 0;
    const averageTransactionValue = successfulTransactions.length > 0 
      ? totalRevenue / successfulTransactions.length 
      : 0;
    
    // Build payment method distribution
    const paymentMethodDistribution: Record<string, number> = {};
    paymentMethods.forEach(method => {
      paymentMethodDistribution[method.paymentType] = method._count;
    });
    
    return {
      totalRevenue,
      refundedAmount,
      netRevenue,
      transactionCount: totalTransactions,
      successRate,
      averageTransactionValue,
      paymentMethodDistribution,
    };
  }
}
