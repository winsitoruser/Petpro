import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  BadRequestException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { 
  PaymentsService, 
  CreatePaymentDto, 
  ProcessPaymentDto, 
  RefundPaymentDto, 
  PaymentProvider 
} from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req,
  ) {
    this.logger.log(`Creating payment for booking ${createPaymentDto.bookingId}`);
    
    // Ensure only the customer can create their own payment or admin
    if (req.user.role !== 'admin' && req.user.id !== createPaymentDto.customerId) {
      throw new BadRequestException('You can only create payments for yourself');
    }
    
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Post(':id/process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process a payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HttpCode(HttpStatus.OK)
  async processPayment(
    @Param('id') paymentId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
    @Request() req,
  ) {
    this.logger.log(`Processing payment ${paymentId}`);
    
    // Merge the payment ID from path parameter
    const paymentToProcess = {
      ...processPaymentDto,
      paymentId,
    };
    
    return this.paymentsService.processPayment(paymentToProcess);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HttpCode(HttpStatus.OK)
  async refundPayment(
    @Param('id') paymentId: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ) {
    this.logger.log(`Refunding payment ${paymentId}`);
    
    // Merge the payment ID from path parameter
    const refundRequest = {
      ...refundPaymentDto,
      paymentId,
    };
    
    return this.paymentsService.refundPayment(refundRequest);
  }

  @Get('customer/:customerId/methods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getCustomerPaymentMethods(
    @Param('customerId') customerId: string,
    @Request() req,
  ) {
    this.logger.log(`Getting payment methods for customer ${customerId}`);
    
    // Ensure only the customer can access their payment methods or admin
    if (req.user.role !== 'admin' && req.user.id !== customerId) {
      throw new BadRequestException('You can only access your own payment methods');
    }
    
    return this.paymentsService.getCustomerPaymentMethods(customerId);
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get available payment providers' })
  @ApiResponse({ status: 200, description: 'Payment providers retrieved successfully' })
  getPaymentProviders() {
    return Object.values(PaymentProvider).map(provider => ({
      id: provider,
      name: this.formatProviderName(provider),
    }));
  }

  /**
   * Format provider name for display (e.g., "stripe" -> "Stripe")
   */
  private formatProviderName(provider: string): string {
    return provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
  }
}
