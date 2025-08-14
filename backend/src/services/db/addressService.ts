/**
 * Address Database Service
 * 
 * Manages user addresses, address validation, and geo-coding functionality.
 */
import { Address } from '@prisma/client';
import BaseService from './baseService';

export default class AddressService extends BaseService<Address> {
  constructor() {
    super('address');
    this.searchFields = ['street', 'city', 'state', 'postalCode', 'country'];
    this.defaultInclude = {
      user: true,
    };
  }

  /**
   * Get addresses by user ID
   */
  async getAddressesByUser(
    userId: string,
    options?: {
      includeInactive?: boolean;
      primary?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<Address[]> {
    const where: any = { userId };
    
    if (!options?.includeInactive) {
      where.isActive = true;
    }
    
    if (options?.primary !== undefined) {
      where.isPrimary = options.primary;
    }
    
    return this.prisma.address.findMany({
      where,
      orderBy: [
        { isPrimary: 'desc' },
        { updatedAt: 'desc' },
      ],
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Get a user's primary address
   */
  async getPrimaryAddress(userId: string): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: {
        userId,
        isPrimary: true,
        isActive: true,
      },
    });
  }

  /**
   * Set an address as primary for a user
   */
  async setPrimaryAddress(addressId: string, userId: string): Promise<Address> {
    return this.prisma.$transaction(async (tx) => {
      // First, unset primary on all of user's addresses
      await tx.address.updateMany({
        where: {
          userId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
      
      // Then, set the requested address as primary
      return tx.address.update({
        where: {
          id: addressId,
          userId, // Ensure address belongs to the user
        },
        data: {
          isPrimary: true,
        },
      });
    });
  }

  /**
   * Update address with geocoding data
   */
  async updateAddressGeoData(
    addressId: string,
    geoData: {
      latitude?: number;
      longitude?: number;
      formattedAddress?: string;
      validationStatus?: string;
    }
  ): Promise<Address> {
    return this.prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        formattedAddress: geoData.formattedAddress,
        validationStatus: geoData.validationStatus,
        geoCodedAt: new Date(),
      },
    });
  }

  /**
   * Find nearby addresses within given radius
   */
  async findNearbyAddresses(
    latitude: number,
    longitude: number,
    radiusInKm: number,
    options?: {
      limit?: number;
      type?: string;
    }
  ): Promise<Array<Address & { distance: number }>> {
    const query = this.prisma.$queryRaw`
      SELECT 
        a.*,
        (6371 * acos(
          cos(radians(${latitude})) * 
          cos(radians(a.latitude)) * 
          cos(radians(a.longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * 
          sin(radians(a.latitude))
        )) AS distance
      FROM addresses a
      WHERE a.latitude IS NOT NULL 
        AND a.longitude IS NOT NULL
        AND a.is_active = true
        ${options?.type ? this.prisma.$raw`AND a.type = ${options.type}` : this.prisma.$raw``}
      HAVING distance <= ${radiusInKm}
      ORDER BY distance ASC
      ${options?.limit ? this.prisma.$raw`LIMIT ${options.limit}` : this.prisma.$raw``}
    `;
    
    return query;
  }

  /**
   * Bulk validate addresses
   */
  async validateAddressesBatch(
    addressIds: string[],
    validationResults: Array<{ 
      id: string; 
      isValid: boolean;
      formattedAddress?: string;
      latitude?: number;
      longitude?: number;
      validationNotes?: string;
    }>
  ): Promise<number> {
    // Process in batches for better performance
    const batchSize = 50;
    let processedCount = 0;
    
    for (let i = 0; i < validationResults.length; i += batchSize) {
      const batch = validationResults.slice(i, i + batchSize);
      
      const updates = await Promise.all(batch.map(result => 
        this.prisma.address.update({
          where: {
            id: result.id,
          },
          data: {
            validationStatus: result.isValid ? 'VALID' : 'INVALID',
            formattedAddress: result.formattedAddress,
            latitude: result.latitude,
            longitude: result.longitude,
            notes: result.validationNotes 
              ? (this.prisma.address.findUnique({ where: { id: result.id } })
                  .then(addr => `${addr?.notes || ''}\nValidation: ${result.validationNotes}`))
              : undefined,
            geoCodedAt: new Date(),
          },
        })
      ));
      
      processedCount += updates.length;
    }
    
    return processedCount;
  }

  /**
   * Get addresses in need of validation
   */
  async getAddressesNeedingValidation(
    options?: {
      limit?: number;
      olderThanDays?: number;
    }
  ): Promise<Address[]> {
    const where: any = {
      OR: [
        { validationStatus: null },
        { validationStatus: 'PENDING' },
      ],
      isActive: true,
    };
    
    if (options?.olderThanDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - options.olderThanDays);
      
      where.OR = [
        { geoCodedAt: null },
        { geoCodedAt: { lt: cutoffDate } },
      ];
    }
    
    return this.prisma.address.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
      take: options?.limit,
    });
  }

  /**
   * Delete address if not in use
   */
  async safeDeleteAddress(addressId: string): Promise<{ success: boolean; message: string }> {
    // Check if the address is used anywhere else
    const addressUsage = await this.prisma.$transaction([
      this.prisma.clinic.count({ where: { addressId } }),
      this.prisma.user.count({ where: { billingAddressId: addressId } }),
      this.prisma.user.count({ where: { shippingAddressId: addressId } }),
      this.prisma.order.count({ where: { shippingAddressId: addressId } }),
      this.prisma.order.count({ where: { billingAddressId: addressId } }),
    ]);
    
    const totalUsageCount = addressUsage.reduce((sum, count) => sum + count, 0);
    
    if (totalUsageCount > 0) {
      return { 
        success: false, 
        message: 'Address is currently in use and cannot be deleted.' 
      };
    }
    
    // Safe to delete
    await this.delete(addressId);
    
    return {
      success: true,
      message: 'Address successfully deleted.'
    };
  }
}
