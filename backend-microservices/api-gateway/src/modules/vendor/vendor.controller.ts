import { Body, Controller, Get, Param, Post, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('vendors')
@Controller('vendors')
export class VendorController {
  private readonly vendorServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.vendorServiceUrl = this.configService.get<string>('VENDOR_SERVICE_URL') || 'http://localhost:3006';
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({ status: 200, description: 'Return all vendors.' })
  async getAllVendors(@Query() query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.vendorServiceUrl}/api/v1/vendors`, {
        params: query,
      })
    );
    return response.data;
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search vendors by name or location' })
  @ApiResponse({ status: 200, description: 'Return matching vendors.' })
  async searchVendors(@Query('query') query: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.vendorServiceUrl}/api/v1/vendors/search`, {
        params: { query },
      })
    );
    return response.data;
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiResponse({ status: 200, description: 'Return the vendor.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async getVendor(@Param('id', ParseUUIDPipe) id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.vendorServiceUrl}/api/v1/vendors/${id}`)
    );
    return response.data;
  }

  @Get(':id/products')
  @Public()
  @ApiOperation({ summary: 'Get products by vendor ID' })
  @ApiResponse({ status: 200, description: 'Return vendor products.' })
  async getVendorProducts(@Param('id', ParseUUIDPipe) id: string, @Query() query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.vendorServiceUrl}/api/v1/vendors/${id}/products`, {
        params: query,
      })
    );
    return response.data;
  }

  @Get(':id/services')
  @Public()
  @ApiOperation({ summary: 'Get services by vendor ID' })
  @ApiResponse({ status: 200, description: 'Return vendor services.' })
  async getVendorServices(@Param('id', ParseUUIDPipe) id: string, @Query() query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.vendorServiceUrl}/api/v1/vendors/${id}/services`, {
        params: query,
      })
    );
    return response.data;
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async registerVendor(@Body() registerDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.vendorServiceUrl}/api/v1/vendors/register`, registerDto, {
        headers: { 'Content-Type': 'application/json' },
      })
    );
    return response.data;
  }

  // Customer reviews for vendors
  @Get(':id/reviews')
  @Public()
  @ApiOperation({ summary: 'Get vendor reviews' })
  @ApiResponse({ status: 200, description: 'Return vendor reviews.' })
  async getVendorReviews(@Param('id', ParseUUIDPipe) id: string, @Query() query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.vendorServiceUrl}/api/v1/vendors/${id}/reviews`, {
        params: query,
      })
    );
    return response.data;
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add vendor review' })
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  async addVendorReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reviewDto: any,
    @CurrentUser() user: any
  ) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.vendorServiceUrl}/api/v1/vendors/${id}/reviews`,
        { ...reviewDto, customerId: user.id },
        {
          headers: { 'X-User-Id': user.id, 'Content-Type': 'application/json' },
        }
      )
    );
    return response.data;
  }
}