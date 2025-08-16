import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export interface CreatePaymentDto {
  bookingId: string;
  customerId: string;
  vendorId: string;
  amount: number;
  currency: string;
  description: string;
  provider: PaymentProvider;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentDto {
  paymentId: string;
  paymentMethod: string;
  token: string;
  savePaymentMethod?: boolean;
}

export interface RefundPaymentDto {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface PaymentMethodDto {
  type: 'card' | 'bank_account' | 'digital_wallet';
  customerId: string;
  tokenId?: string;
  cardInfo?: {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new payment intent
   */
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    this.logger.log(`Creating payment for booking: ${createPaymentDto.bookingId}`);
    
    try {
      // Generate a unique payment ID
      const paymentId = this.generatePaymentId();
      
      // Choose payment provider strategy
      const paymentData = await this.initiatePaymentWithProvider(
        createPaymentDto.provider, 
        {
          ...createPaymentDto,
          paymentId,
        }
      );
      
      // Store payment record in database
      const paymentRecord = await this.storePaymentRecord({
        id: paymentId,
        bookingId: createPaymentDto.bookingId,
        customerId: createPaymentDto.customerId,
        vendorId: createPaymentDto.vendorId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency,
        description: createPaymentDto.description,
        provider: createPaymentDto.provider,
        status: PaymentStatus.PENDING,
        createdAt: new Date().toISOString(),
        metadata: {
          ...createPaymentDto.metadata,
          providerPaymentId: paymentData.providerPaymentId,
        },
      });
      
      return {
        paymentId: paymentRecord.id,
        status: paymentRecord.status,
        clientSecret: paymentData.clientSecret,
        redirectUrl: paymentData.redirectUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment: ${error.message}`, error.stack);
      throw new BadRequestException(`Payment creation failed: ${error.message}`);
    }
  }

  /**
   * Process a payment with customer payment method
   */
  async processPayment(processPaymentDto: ProcessPaymentDto): Promise<any> {
    this.logger.log(`Processing payment: ${processPaymentDto.paymentId}`);
    
    try {
      // Get payment record
      const paymentRecord = await this.getPaymentById(processPaymentDto.paymentId);
      if (!paymentRecord) {
        throw new NotFoundException(`Payment not found: ${processPaymentDto.paymentId}`);
      }
      
      // Check if payment can be processed
      if (paymentRecord.status !== PaymentStatus.PENDING) {
        throw new BadRequestException(`Payment cannot be processed in status: ${paymentRecord.status}`);
      }
      
      // Update payment record status
      await this.updatePaymentStatus(paymentRecord.id, PaymentStatus.PROCESSING);
      
      // Process with provider
      const provider = paymentRecord.provider as PaymentProvider;
      const result = await this.processPaymentWithProvider(
        provider, 
        {
          ...processPaymentDto,
          amount: paymentRecord.amount,
          currency: paymentRecord.currency,
          customerId: paymentRecord.customerId,
          metadata: paymentRecord.metadata,
        }
      );
      
      // Save payment method if requested
      if (processPaymentDto.savePaymentMethod && result.paymentMethodId) {
        await this.savePaymentMethod({
          customerId: paymentRecord.customerId,
          type: 'card', // Default to card for now
          tokenId: result.paymentMethodId,
          cardInfo: result.cardInfo,
          isDefault: false,
        });
      }
      
      // Update payment record with final status
      const status = result.success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
      const updatedPayment = await this.updatePaymentStatus(paymentRecord.id, status, {
        processingDetails: result,
        completedAt: new Date().toISOString(),
      });
      
      // Emit payment event
      this.eventEmitter.emit(
        result.success ? 'payment.completed' : 'payment.failed', 
        {
          paymentId: paymentRecord.id,
          bookingId: paymentRecord.bookingId,
          customerId: paymentRecord.customerId,
          vendorId: paymentRecord.vendorId,
          amount: paymentRecord.amount,
          currency: paymentRecord.currency,
          status,
        }
      );
      
      return {
        paymentId: paymentRecord.id,
        status,
        success: result.success,
        transactionId: result.transactionId,
        message: result.message,
      };
    } catch (error) {
      this.logger.error(`Payment processing failed: ${error.message}`, error.stack);
      
      // Update payment status to failed if error occurs
      if (processPaymentDto.paymentId) {
        await this.updatePaymentStatus(
          processPaymentDto.paymentId, 
          PaymentStatus.FAILED, 
          { error: error.message }
        );
        
        // Emit payment failed event
        this.eventEmitter.emit('payment.failed', {
          paymentId: processPaymentDto.paymentId,
          error: error.message,
        });
      }
      
      throw new BadRequestException(`Payment processing failed: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(refundPaymentDto: RefundPaymentDto): Promise<any> {
    this.logger.log(`Refunding payment: ${refundPaymentDto.paymentId}`);
    
    try {
      // Get payment record
      const paymentRecord = await this.getPaymentById(refundPaymentDto.paymentId);
      if (!paymentRecord) {
        throw new NotFoundException(`Payment not found: ${refundPaymentDto.paymentId}`);
      }
      
      // Check if payment can be refunded
      if (paymentRecord.status !== PaymentStatus.COMPLETED) {
        throw new BadRequestException(`Only completed payments can be refunded, current status: ${paymentRecord.status}`);
      }
      
      // Process refund with provider
      const provider = paymentRecord.provider as PaymentProvider;
      const refundAmount = refundPaymentDto.amount || paymentRecord.amount;
      
      const result = await this.refundPaymentWithProvider(
        provider,
        {
          providerPaymentId: paymentRecord.metadata.providerPaymentId,
          amount: refundAmount,
          currency: paymentRecord.currency,
          reason: refundPaymentDto.reason,
        }
      );
      
      // Update payment record
      const updatedPayment = await this.updatePaymentStatus(
        paymentRecord.id, 
        PaymentStatus.REFUNDED, 
        {
          refundDetails: {
            amount: refundAmount,
            reason: refundPaymentDto.reason,
            refundId: result.refundId,
            refundedAt: new Date().toISOString(),
          }
        }
      );
      
      // Emit refund event
      this.eventEmitter.emit('payment.refunded', {
        paymentId: paymentRecord.id,
        bookingId: paymentRecord.bookingId,
        customerId: paymentRecord.customerId,
        vendorId: paymentRecord.vendorId,
        amount: refundAmount,
        currency: paymentRecord.currency,
        reason: refundPaymentDto.reason,
      });
      
      return {
        paymentId: paymentRecord.id,
        status: PaymentStatus.REFUNDED,
        refundId: result.refundId,
        amount: refundAmount,
        currency: paymentRecord.currency,
      };
    } catch (error) {
      this.logger.error(`Payment refund failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Get saved payment methods for a customer
   */
  async getCustomerPaymentMethods(customerId: string): Promise<PaymentMethodDto[]> {
    this.logger.log(`Getting payment methods for customer: ${customerId}`);
    
    try {
      // Call payment methods API
      const paymentMethodsUrl = this.configService.get<string>('PAYMENT_METHODS_API_URL');
      const response = await firstValueFrom(
        this.httpService.get(`${paymentMethodsUrl}/customers/${customerId}/payment-methods`)
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get payment methods: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Save a payment method for future use
   */
  private async savePaymentMethod(paymentMethodDto: PaymentMethodDto): Promise<any> {
    this.logger.log(`Saving payment method for customer: ${paymentMethodDto.customerId}`);
    
    try {
      // Call payment methods API
      const paymentMethodsUrl = this.configService.get<string>('PAYMENT_METHODS_API_URL');
      const response = await firstValueFrom(
        this.httpService.post(`${paymentMethodsUrl}/payment-methods`, paymentMethodDto)
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to save payment method: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  private async getPaymentById(paymentId: string): Promise<any> {
    const paymentsUrl = this.configService.get<string>('PAYMENTS_API_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${paymentsUrl}/payments/${paymentId}`)
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get payment: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Update payment status
   */
  private async updatePaymentStatus(
    paymentId: string, 
    status: PaymentStatus, 
    additionalData: Record<string, any> = {}
  ): Promise<any> {
    const paymentsUrl = this.configService.get<string>('PAYMENTS_API_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${paymentsUrl}/payments/${paymentId}`, {
          status,
          updatedAt: new Date().toISOString(),
          ...additionalData,
        })
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update payment status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Store payment record
   */
  private async storePaymentRecord(paymentData: any): Promise<any> {
    const paymentsUrl = this.configService.get<string>('PAYMENTS_API_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${paymentsUrl}/payments`, paymentData)
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to store payment record: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a unique payment ID
   */
  private generatePaymentId(): string {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return `pay_${timestamp}_${randomBytes}`;
  }

  /**
   * Initiate payment with specified provider
   */
  private async initiatePaymentWithProvider(
    provider: PaymentProvider, 
    data: any
  ): Promise<any> {
    switch (provider) {
      case PaymentProvider.STRIPE:
        return this.initiateStripePayment(data);
      case PaymentProvider.PAYPAL:
        return this.initiatePaypalPayment(data);
      default:
        throw new BadRequestException(`Unsupported payment provider: ${provider}`);
    }
  }

  /**
   * Process payment with specified provider
   */
  private async processPaymentWithProvider(
    provider: PaymentProvider, 
    data: any
  ): Promise<any> {
    switch (provider) {
      case PaymentProvider.STRIPE:
        return this.processStripePayment(data);
      case PaymentProvider.PAYPAL:
        return this.processPaypalPayment(data);
      default:
        throw new BadRequestException(`Unsupported payment provider: ${provider}`);
    }
  }

  /**
   * Refund payment with specified provider
   */
  private async refundPaymentWithProvider(
    provider: PaymentProvider, 
    data: any
  ): Promise<any> {
    switch (provider) {
      case PaymentProvider.STRIPE:
        return this.refundStripePayment(data);
      case PaymentProvider.PAYPAL:
        return this.refundPaypalPayment(data);
      default:
        throw new BadRequestException(`Unsupported payment provider: ${provider}`);
    }
  }

  /**
   * Stripe payment implementations
   */
  private async initiateStripePayment(data: any): Promise<any> {
    const stripeApiUrl = this.configService.get<string>('STRIPE_API_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${stripeApiUrl}/payment-intents`, {
          amount: Math.round(data.amount * 100), // Convert to cents
          currency: data.currency,
          description: data.description,
          metadata: {
            bookingId: data.bookingId,
            customerId: data.customerId,
            vendorId: data.vendorId,
            paymentId: data.paymentId,
            ...data.metadata,
          },
        })
      );
      
      return {
        providerPaymentId: response.data.id,
        clientSecret: response.data.client_secret,
        status: response.data.status,
      };
    } catch (error) {
      this.logger.error(`Stripe payment initiation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processStripePayment(data: any): Promise<any> {
    const stripeApiUrl = this.configService.get<string>('STRIPE_API_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${stripeApiUrl}/payment-intents/confirm`, {
          paymentIntentId: data.metadata.providerPaymentId,
          paymentMethodId: data.token,
        })
      );
      
      const success = ['succeeded', 'processing'].includes(response.data.status);
      
      return {
        success,
        transactionId: response.data.id,
        status: response.data.status,
        message: success ? 'Payment successful' : 'Payment failed',
        paymentMethodId: data.token,
        cardInfo: response.data.payment_method_details?.card 
          ? {
              last4: response.data.payment_method_details.card.last4,
              brand: response.data.payment_method_details.card.brand,
              expMonth: response.data.payment_method_details.card.exp_month,
              expYear: response.data.payment_method_details.card.exp_year,
            }
          : undefined,
      };
    } catch (error) {
      this.logger.error(`Stripe payment processing failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Payment processing failed: ${error.message}`,
      };
    }
  }

  private async refundStripePayment(data: any): Promise<any> {
    const stripeApiUrl = this.configService.get<string>('STRIPE_API_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${stripeApiUrl}/refunds`, {
          paymentIntent: data.providerPaymentId,
          amount: data.amount ? Math.round(data.amount * 100) : undefined, // Convert to cents if partial refund
          reason: data.reason || 'requested_by_customer',
        })
      );
      
      return {
        refundId: response.data.id,
        status: response.data.status,
      };
    } catch (error) {
      this.logger.error(`Stripe refund failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * PayPal payment implementations
   */
  private async initiatePaypalPayment(data: any): Promise<any> {
    const paypalApiUrl = this.configService.get<string>('PAYPAL_API_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${paypalApiUrl}/orders`, {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: data.currency,
                value: data.amount.toFixed(2),
              },
              description: data.description,
              custom_id: data.paymentId,
              reference_id: data.bookingId,
            },
          ],
          application_context: {
            brand_name: 'PetPro',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            return_url: `${this.configService.get<string>('APP_URL')}/payments/success`,
            cancel_url: `${this.configService.get<string>('APP_URL')}/payments/cancel`,
          },
        })
      );
      
      // Find approval URL
      const approvalUrl = response.data.links.find(
        (link: any) => link.rel === 'approve'
      )?.href;
      
      return {
        providerPaymentId: response.data.id,
        redirectUrl: approvalUrl,
        status: response.data.status,
      };
    } catch (error) {
      this.logger.error(`PayPal payment initiation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processPaypalPayment(data: any): Promise<any> {
    const paypalApiUrl = this.configService.get<string>('PAYPAL_API_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${paypalApiUrl}/orders/${data.metadata.providerPaymentId}/capture`)
      );
      
      const success = response.data.status === 'COMPLETED';
      
      return {
        success,
        transactionId: response.data.purchase_units[0]?.payments?.captures[0]?.id,
        status: response.data.status,
        message: success ? 'Payment successful' : 'Payment failed',
      };
    } catch (error) {
      this.logger.error(`PayPal payment processing failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Payment processing failed: ${error.message}`,
      };
    }
  }

  private async refundPaypalPayment(data: any): Promise<any> {
    const paypalApiUrl = this.configService.get<string>('PAYPAL_API_URL');
    
    try {
      // Need to get the capture ID first
      const orderResponse = await firstValueFrom(
        this.httpService.get(`${paypalApiUrl}/orders/${data.providerPaymentId}`)
      );
      
      const captureId = orderResponse.data.purchase_units[0]?.payments?.captures[0]?.id;
      
      if (!captureId) {
        throw new Error('Could not find capture ID for the payment');
      }
      
      // Process the refund
      const refundResponse = await firstValueFrom(
        this.httpService.post(`${paypalApiUrl}/payments/captures/${captureId}/refund`, {
          amount: data.amount 
            ? {
                currency_code: data.currency,
                value: data.amount.toFixed(2),
              }
            : undefined,
          note_to_payer: data.reason || 'Refund for canceled service',
        })
      );
      
      return {
        refundId: refundResponse.data.id,
        status: refundResponse.data.status,
      };
    } catch (error) {
      this.logger.error(`PayPal refund failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
