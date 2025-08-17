import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { UserAddress } from '../models/user-address.model';
import { Pet } from '../models/pet.model';
import { ActivitiesService } from '../activities/activities.service';
import { ActivityType } from '../activities/enums/activity-type.enum';

interface ExternalCustomerData {
  id: string;
  externalId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  addresses?: ExternalAddress[];
  pets?: ExternalPet[];
  metadata?: Record<string, any>;
}

interface ExternalAddress {
  type: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface ExternalPet {
  name: string;
  type: string;
  breed?: string;
  gender?: string;
  birthDate?: string;
  weight?: number;
  color?: string;
  microchipNumber?: string;
  imageUrl?: string;
}

@Injectable()
export class CustomerIntegrationService {
  private readonly logger = new Logger(CustomerIntegrationService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(UserAddress)
    private addressModel: typeof UserAddress,
    @InjectModel(Pet)
    private petModel: typeof Pet,
    private activitiesService: ActivitiesService,
  ) {}

  /**
   * Fetch customer data from external API and sync it with our system
   */
  async syncCustomerData(userId: string, externalSystemId?: string): Promise<boolean> {
    this.logger.log(`Syncing customer data for user ${userId}`);
    
    try {
      // Find the user
      const user = await this.userModel.findByPk(userId);
      if (!user) {
        this.logger.error(`User not found: ${userId}`);
        return false;
      }
      
      // Get external system ID if not provided
      const extId = externalSystemId || user.externalId;
      if (!extId) {
        this.logger.error(`No external ID found for user ${userId}`);
        return false;
      }
      
      // Fetch data from external API
      const externalData = await this.fetchExternalCustomerData(extId);
      if (!externalData) {
        this.logger.error(`Failed to fetch external data for ID ${extId}`);
        return false;
      }
      
      // Update user data
      await this.updateUserFromExternalData(user, externalData);
      
      // Sync addresses
      if (externalData.addresses && externalData.addresses.length > 0) {
        await this.syncAddresses(userId, externalData.addresses);
      }
      
      // Sync pets
      if (externalData.pets && externalData.pets.length > 0) {
        await this.syncPets(userId, externalData.pets);
      }
      
      // Record activity
      await this.activitiesService.create({
        userId,
        type: ActivityType.PROFILE_UPDATE,
        description: 'Profile updated via external system sync',
        metadata: {
          externalSystemId: extId,
          syncTimestamp: new Date().toISOString(),
        },
      });
      
      this.logger.log(`Successfully synced customer data for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error syncing customer data: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Sync multiple customers from external system
   */
  async syncMultipleCustomers(limit: number = 100): Promise<{ success: number; failed: number }> {
    this.logger.log(`Starting batch sync of customer data, limit: ${limit}`);
    
    try {
      // Get customers from external API
      const externalCustomers = await this.fetchExternalCustomerBatch(limit);
      
      let success = 0;
      let failed = 0;
      
      // Process each customer
      for (const externalCustomer of externalCustomers) {
        // Find matching user by external ID or email
        let user = await this.userModel.findOne({
          where: { externalId: externalCustomer.externalId },
        });
        
        if (!user && externalCustomer.email) {
          user = await this.userModel.findOne({
            where: { email: externalCustomer.email },
          });
        }
        
        if (user) {
          // Update existing user
          const updated = await this.updateUserFromExternalData(user, externalCustomer);
          if (updated) {
            success++;
          } else {
            failed++;
          }
        } else {
          // Create new user
          const created = await this.createUserFromExternalData(externalCustomer);
          if (created) {
            success++;
          } else {
            failed++;
          }
        }
      }
      
      this.logger.log(`Batch sync completed. Success: ${success}, Failed: ${failed}`);
      return { success, failed };
    } catch (error) {
      this.logger.error(`Error in batch sync: ${error.message}`, error.stack);
      return { success: 0, failed: 0 };
    }
  }

  /**
   * Push local customer data to external system
   */
  async pushCustomerToExternalSystem(userId: string): Promise<boolean> {
    this.logger.log(`Pushing customer data to external system for user ${userId}`);
    
    try {
      // Get user with addresses and pets
      const user = await this.userModel.findByPk(userId, {
        include: [
          { model: UserAddress, as: 'addresses' },
          { model: Pet, as: 'pets' },
        ],
      });
      
      if (!user) {
        this.logger.error(`User not found: ${userId}`);
        return false;
      }
      
      // Prepare data for external system
      const externalData = {
        fullName: user.fullName,
        email: user.email,
        phone: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        addresses: user.addresses?.map(addr => ({
          type: addr.type,
          line1: addr.addressLine1,
          line2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          isDefault: addr.isDefault,
        })),
        pets: user.pets?.map(pet => ({
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          gender: pet.gender,
          birthDate: pet.birthDate,
          weight: pet.weight,
          color: pet.color,
          microchipNumber: pet.microchipNumber,
          imageUrl: pet.imageUrl,
        })),
        metadata: {
          registrationDate: user.createdAt,
          lastLogin: user.lastLoginAt,
          preferredLanguage: user.preferredLanguage,
        },
      };
      
      // Push to external API
      const apiEndpoint = this.configService.get<string>('EXTERNAL_CUSTOMER_API_URL');
      const apiKey = this.configService.get<string>('EXTERNAL_CUSTOMER_API_KEY');
      
      if (!apiEndpoint || !apiKey) {
        this.logger.error('External API configuration missing');
        return false;
      }
      
      // If user already has external ID, update; otherwise create
      if (user.externalId) {
        await firstValueFrom(
          this.httpService.put(
            `${apiEndpoint}/customers/${user.externalId}`,
            externalData,
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          )
        );
      } else {
        const response = await firstValueFrom(
          this.httpService.post(
            `${apiEndpoint}/customers`,
            externalData,
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
            }
          )
        );
        
        // Save the external ID
        const externalId = response.data.id;
        await user.update({ externalId });
      }
      
      // Record activity
      await this.activitiesService.create({
        userId,
        type: ActivityType.PROFILE_UPDATE,
        description: 'Profile pushed to external system',
        metadata: {
          externalSystemId: user.externalId,
          syncTimestamp: new Date().toISOString(),
        },
      });
      
      this.logger.log(`Successfully pushed customer data for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error pushing customer data: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Fetch customer data from external API
   */
  private async fetchExternalCustomerData(externalId: string): Promise<ExternalCustomerData | null> {
    try {
      const apiEndpoint = this.configService.get<string>('EXTERNAL_CUSTOMER_API_URL');
      const apiKey = this.configService.get<string>('EXTERNAL_CUSTOMER_API_KEY');
      
      if (!apiEndpoint || !apiKey) {
        this.logger.error('External API configuration missing');
        return null;
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${apiEndpoint}/customers/${externalId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        })
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch customer data from external API: ${error.message}`);
      return null;
    }
  }

  /**
   * Fetch batch of customers from external API
   */
  private async fetchExternalCustomerBatch(limit: number): Promise<ExternalCustomerData[]> {
    try {
      const apiEndpoint = this.configService.get<string>('EXTERNAL_CUSTOMER_API_URL');
      const apiKey = this.configService.get<string>('EXTERNAL_CUSTOMER_API_KEY');
      
      if (!apiEndpoint || !apiKey) {
        this.logger.error('External API configuration missing');
        return [];
      }
      
      const response = await firstValueFrom(
        this.httpService.get(`${apiEndpoint}/customers`, {
          params: { limit },
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        })
      );
      
      return response.data.customers || [];
    } catch (error) {
      this.logger.error(`Failed to fetch customer batch from external API: ${error.message}`);
      return [];
    }
  }

  /**
   * Update user record with external data
   */
  private async updateUserFromExternalData(
    user: User, 
    externalData: ExternalCustomerData
  ): Promise<boolean> {
    try {
      await user.update({
        externalId: externalData.externalId || user.externalId,
        fullName: externalData.fullName || user.fullName,
        phoneNumber: externalData.phone || user.phoneNumber,
        dateOfBirth: externalData.dateOfBirth || user.dateOfBirth,
        gender: externalData.gender || user.gender,
        avatarUrl: externalData.avatarUrl || user.avatarUrl,
        metaData: {
          ...user.metaData,
          externalSystemData: externalData.metadata,
          lastSyncedAt: new Date().toISOString(),
        },
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to update user from external data: ${error.message}`);
      return false;
    }
  }

  /**
   * Create user from external data
   */
  private async createUserFromExternalData(externalData: ExternalCustomerData): Promise<boolean> {
    try {
      // Generate a temporary password
      const tempPassword = this.generateTempPassword();
      
      // Create the user
      const user = await this.userModel.create({
        externalId: externalData.externalId,
        fullName: externalData.fullName,
        email: externalData.email,
        phoneNumber: externalData.phone,
        dateOfBirth: externalData.dateOfBirth,
        gender: externalData.gender,
        avatarUrl: externalData.avatarUrl,
        password: tempPassword, // This should be hashed by a pre-save hook in the model
        role: 'pet_owner', // Default role
        status: 'active',
        metaData: {
          externalSystemData: externalData.metadata,
          importedAt: new Date().toISOString(),
          requiresPasswordReset: true,
        },
      });
      
      // Process addresses if available
      if (externalData.addresses && externalData.addresses.length > 0) {
        await this.syncAddresses(user.id, externalData.addresses);
      }
      
      // Process pets if available
      if (externalData.pets && externalData.pets.length > 0) {
        await this.syncPets(user.id, externalData.pets);
      }
      
      // Record activity
      await this.activitiesService.create({
        userId: user.id,
        type: ActivityType.ACCOUNT_CREATED,
        description: 'Account created from external system',
        metadata: {
          externalSystemId: externalData.externalId,
          importTimestamp: new Date().toISOString(),
        },
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to create user from external data: ${error.message}`);
      return false;
    }
  }

  /**
   * Sync addresses from external data
   */
  private async syncAddresses(
    userId: string, 
    externalAddresses: ExternalAddress[]
  ): Promise<void> {
    try {
      // Get existing addresses
      const existingAddresses = await this.addressModel.findAll({
        where: { userId },
      });
      
      for (const externalAddress of externalAddresses) {
        // Check if address already exists (using line1 and postalCode as a simple match)
        const existingAddress = existingAddresses.find(
          addr => addr.addressLine1 === externalAddress.line1 && 
                 addr.postalCode === externalAddress.postalCode
        );
        
        if (existingAddress) {
          // Update existing address
          await existingAddress.update({
            type: externalAddress.type,
            addressLine1: externalAddress.line1,
            addressLine2: externalAddress.line2 || '',
            city: externalAddress.city,
            state: externalAddress.state,
            postalCode: externalAddress.postalCode,
            country: externalAddress.country,
            isDefault: externalAddress.isDefault,
          });
        } else {
          // Create new address
          await this.addressModel.create({
            userId,
            type: externalAddress.type,
            addressLine1: externalAddress.line1,
            addressLine2: externalAddress.line2 || '',
            city: externalAddress.city,
            state: externalAddress.state,
            postalCode: externalAddress.postalCode,
            country: externalAddress.country,
            isDefault: externalAddress.isDefault,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Failed to sync addresses: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync pets from external data
   */
  private async syncPets(
    userId: string, 
    externalPets: ExternalPet[]
  ): Promise<void> {
    try {
      // Get existing pets
      const existingPets = await this.petModel.findAll({
        where: { ownerId: userId },
      });
      
      for (const externalPet of externalPets) {
        // Check if pet already exists (using name as a simple match)
        const existingPet = existingPets.find(
          pet => pet.name.toLowerCase() === externalPet.name.toLowerCase()
        );
        
        if (existingPet) {
          // Update existing pet
          await existingPet.update({
            name: externalPet.name,
            type: externalPet.type,
            breed: externalPet.breed,
            gender: externalPet.gender,
            birthDate: externalPet.birthDate,
            weight: externalPet.weight,
            color: externalPet.color,
            microchipNumber: externalPet.microchipNumber,
            imageUrl: externalPet.imageUrl,
          });
        } else {
          // Create new pet
          await this.petModel.create({
            ownerId: userId,
            name: externalPet.name,
            type: externalPet.type,
            breed: externalPet.breed,
            gender: externalPet.gender,
            birthDate: externalPet.birthDate,
            weight: externalPet.weight,
            color: externalPet.color,
            microchipNumber: externalPet.microchipNumber,
            imageUrl: externalPet.imageUrl,
            status: 'active',
          });
        }
      }
    } catch (error) {
      this.logger.error(`Failed to sync pets: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate a temporary random password
   */
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
