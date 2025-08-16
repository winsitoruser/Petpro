import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { Request } from 'express';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review for a completed booking' })
  @ApiResponse({ status: 201, description: 'The review has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input or booking not eligible for review.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createReview(@Req() req: Request, @Body() createReviewDto: CreateReviewDto) {
    const userId = req.user['id'];
    return this.reviewService.createReview(
      userId,
      createReviewDto.bookingId,
      createReviewDto.rating,
      createReviewDto.review,
      createReviewDto.anonymous || false
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'The review has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input or review not eligible for update.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateReview(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const userId = req.user['id'];
    return this.reviewService.updateReview(
      userId,
      id,
      updateReviewDto.rating,
      updateReviewDto.review,
      updateReviewDto.anonymous
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'The review has been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Invalid input or review not eligible for deletion.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteReview(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    return this.reviewService.deleteReview(userId, id);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get reviews for a vendor' })
  @ApiParam({ name: 'vendorId', description: 'Vendor ID' })
  @ApiQuery({ name: 'sort', required: false, enum: ['recent', 'helpful', 'rating_high', 'rating_low'] })
  @ApiQuery({ name: 'filter', required: false, enum: ['all', 'positive', 'negative', 'neutral'] })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of reviews to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'Returns vendor reviews.' })
  async getVendorReviews(
    @Param('vendorId') vendorId: string,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.reviewService.getVendorReviews(vendorId, {
      sort: sort || 'recent',
      filter: filter || 'all',
      limit: limit || 10,
      offset: offset || 0,
    });
  }

  @Get('vendor/:vendorId/summary')
  @ApiOperation({ summary: 'Get review summary for a vendor' })
  @ApiParam({ name: 'vendorId', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Returns vendor review summary.' })
  async getVendorReviewSummary(@Param('vendorId') vendorId: string) {
    return this.reviewService.getVendorReviewSummary(vendorId);
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a review as helpful' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'The review has been marked as helpful.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async markReviewHelpful(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['id'];
    return this.reviewService.markReviewHelpful(userId, id);
  }

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get customer's own reviews" })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of reviews to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiResponse({ status: 200, description: 'Returns customer reviews.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getCustomerReviews(
    @Req() req: Request,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = req.user['id'];
    return this.reviewService.getCustomerReviews(userId, {
      limit: limit || 10,
      offset: offset || 0,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Returns the review.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  async getReviewById(@Param('id') id: string) {
    return this.reviewService.getReviewById(id);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get reviews for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Returns booking reviews.' })
  async getBookingReviews(@Param('bookingId') bookingId: string) {
    return this.reviewService.getBookingReviews(bookingId);
  }
}
