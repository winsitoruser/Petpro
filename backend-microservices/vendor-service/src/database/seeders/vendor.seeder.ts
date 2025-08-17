import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vendor, VendorStatus } from '../../models/vendor.model';
import { VendorService } from '../../models/vendor-service.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class VendorSeeder {
  constructor(
    @InjectModel(Vendor)
    private readonly vendorModel: typeof Vendor,
    @InjectModel(VendorService)
    private readonly vendorServiceModel: typeof VendorService,
    private readonly sequelize: Sequelize,
  ) {}

  async seed() {
    const t = await this.sequelize.transaction();
    
    try {
      // Clear existing data
      await this.vendorModel.destroy({ where: {}, force: true, transaction: t });
      await this.vendorServiceModel.destroy({ where: {}, force: true, transaction: t });
      
      // Create vendors
      const vendors = await this.vendorModel.bulkCreate([
        {
          userId: '7d8f3b20-a889-4b56-b835-e919c6b6e451', // This should match a user in auth service
          businessName: 'Paws & Claws Pet Care',
          description: 'Premium pet care services with experienced professionals.',
          email: 'info@pawsandclaws.com',
          phone: '555-123-4567',
          website: 'https://www.pawsandclaws.com',
          address: '123 Pet Avenue',
          city: 'Petropolis',
          state: 'CA',
          postalCode: '90210',
          country: 'USA',
          latitude: 34.052235,
          longitude: -118.243683,
          logoUrl: 'https://storage.petpro.com/vendors/pawsandclaws-logo.png',
          businessHours: {
            monday: { open: '08:00', close: '18:00' },
            tuesday: { open: '08:00', close: '18:00' },
            wednesday: { open: '08:00', close: '18:00' },
            thursday: { open: '08:00', close: '18:00' },
            friday: { open: '08:00', close: '17:00' },
            saturday: { open: '09:00', close: '16:00' },
            sunday: { open: null, close: null }
          }),
          status: VendorStatus.ACTIVE,
          averageRating: 4.7,
          totalReviews: 124,
          verificationDate: new Date(),
        },
        {
          userId: '9e5d3f40-c523-4fde-a914-8b47ad28e128', // This should match a user in auth service
          businessName: 'Happy Tails Grooming',
          description: 'Luxurious pet grooming services tailored to your pet's specific needs.',
          email: 'appointments@happytails.com',
          phone: '555-987-6543',
          website: 'https://www.happytailsgrooming.com',
          address: '456 Grooming Lane',
          city: 'Furtown',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          latitude: 40.712776,
          longitude: -74.005974,
          logoUrl: 'https://storage.petpro.com/vendors/happytails-logo.png',
          businessHours: {
            monday: { open: '09:00', close: '19:00' },
            tuesday: { open: '09:00', close: '19:00' },
            wednesday: { open: '09:00', close: '19:00' },
            thursday: { open: '09:00', close: '19:00' },
            friday: { open: '09:00', close: '19:00' },
            saturday: { open: '10:00', close: '16:00' },
            sunday: { open: '10:00', close: '14:00' }
          }),
          status: VendorStatus.ACTIVE,
          averageRating: 4.5,
          totalReviews: 89,
          verificationDate: new Date(),
        },
        {
          userId: '2c1a5b70-e842-4de9-8cab-5b54dd57c3b1', // This should match a user in auth service
          businessName: 'Vet On The Go',
          description: 'Mobile veterinary services bringing professional care to your doorstep.',
          email: 'service@vetonthego.com',
          phone: '555-789-0123',
          website: 'https://www.vetonthego.com',
          address: '789 Mobile Drive',
          city: 'Vetville',
          state: 'TX',
          postalCode: '75001',
          country: 'USA',
          latitude: 32.776665,
          longitude: -96.796989,
          logoUrl: 'https://storage.petpro.com/vendors/vetonthego-logo.png',
          businessHours: {
            monday: { open: '08:00', close: '20:00' },
            tuesday: { open: '08:00', close: '20:00' },
            wednesday: { open: '08:00', close: '20:00' },
            thursday: { open: '08:00', close: '20:00' },
            friday: { open: '08:00', close: '20:00' },
            saturday: { open: '09:00', close: '17:00' },
            sunday: { open: '10:00', close: '15:00' }
          }),
          status: VendorStatus.ACTIVE,
          averageRating: 4.9,
          totalReviews: 156,
          verificationDate: new Date(),
        },
        {
          userId: '5f4e3d2c-1b9a-8c7d-6e5f-4a3b2c1d0e9f', // This should match a user in auth service
          businessName: 'Pet Training Academy',
          description: 'Professional pet training services for all breeds and ages.',
          email: 'info@pettrainingacademy.com',
          phone: '555-456-7890',
          website: 'https://www.pettrainingacademy.com',
          address: '321 Training Street',
          city: 'Behaviorville',
          state: 'FL',
          postalCode: '33101',
          country: 'USA',
          latitude: 25.761681,
          longitude: -80.191788,
          logoUrl: 'https://storage.petpro.com/vendors/pettrainingacademy-logo.png',
          businessHours: {
            monday: { open: '10:00', close: '18:00' },
            tuesday: { open: '10:00', close: '18:00' },
            wednesday: { open: '10:00', close: '18:00' },
            thursday: { open: '10:00', close: '18:00' },
            friday: { open: '10:00', close: '18:00' },
            saturday: { open: '10:00', close: '15:00' },
            sunday: { open: null, close: null }
          }),
          status: VendorStatus.PENDING_APPROVAL,
          averageRating: 0,
          totalReviews: 0,
        },
      ], { transaction: t });
      
      // Create vendor services for each vendor
      const services = [];
      
      // Services for Paws & Claws
      services.push({
        vendorId: vendors[0].id,
        name: 'Basic Pet Grooming',
        description: 'Basic grooming service including bath, nail trim, and ear cleaning.',
        serviceType: 'Grooming',
        price: 50.00,
        durationMinutes: 45,
        availablePetTypes: JSON.stringify(['dog', 'cat']),
        maxPetWeight: 50,
        additionalOptions: JSON.stringify([
          { name: 'Teeth Brushing', price: 15.00 },
          { name: 'De-shedding Treatment', price: 20.00 },
        ]),
      });
      
      services.push({
        vendorId: vendors[0].id,
        name: 'Full Service Pet Grooming',
        description: 'Complete grooming package including bath, haircut, nail trim, ear cleaning, and teeth brushing.',
        serviceType: 'Grooming',
        price: 85.00,
        durationMinutes: 90,
        availablePetTypes: JSON.stringify(['dog', 'cat']),
        maxPetWeight: 50,
        additionalOptions: JSON.stringify([
          { name: 'De-shedding Treatment', price: 20.00 },
          { name: 'Flea Treatment', price: 25.00 },
        ]),
      });
      
      services.push({
        vendorId: vendors[0].id,
        name: 'Pet Daycare',
        description: 'Supervised play and care for your pet while you are away.',
        serviceType: 'Daycare',
        price: 35.00,
        durationMinutes: 480, // 8 hours
        availablePetTypes: JSON.stringify(['dog']),
        maxPetWeight: 70,
        additionalOptions: JSON.stringify([
          { name: 'Extra Hour', price: 5.00 },
          { name: 'Lunch', price: 10.00 },
        ]),
      });
      
      // Services for Happy Tails Grooming
      services.push({
        vendorId: vendors[1].id,
        name: 'Luxury Pet Spa Package',
        description: 'Premium spa treatment including massage, special shampoo, and styling.',
        serviceType: 'Grooming',
        price: 120.00,
        durationMinutes: 120,
        availablePetTypes: JSON.stringify(['dog']),
        maxPetWeight: 60,
        additionalOptions: JSON.stringify([
          { name: 'Aromatherapy', price: 25.00 },
          { name: 'Pawdicure', price: 20.00 },
        ]),
      });
      
      services.push({
        vendorId: vendors[1].id,
        name: 'Quick Trim & Wash',
        description: 'Express grooming service for pets who need a quick refresh.',
        serviceType: 'Grooming',
        price: 40.00,
        durationMinutes: 30,
        availablePetTypes: JSON.stringify(['dog', 'cat']),
        maxPetWeight: 40,
        additionalOptions: JSON.stringify([
          { name: 'Nail Polish', price: 10.00 },
        ]),
      });
      
      // Services for Vet On The Go
      services.push({
        vendorId: vendors[2].id,
        name: 'In-Home Wellness Check',
        description: 'Comprehensive health examination in the comfort of your home.',
        serviceType: 'Veterinary',
        price: 150.00,
        durationMinutes: 45,
        availablePetTypes: JSON.stringify(['dog', 'cat', 'bird', 'small_mammal']),
        additionalOptions: JSON.stringify([
          { name: 'Bloodwork', price: 75.00 },
          { name: 'Vaccinations', price: 45.00, per: 'vaccine' },
        ]),
      });
      
      services.push({
        vendorId: vendors[2].id,
        name: 'Emergency Veterinary Visit',
        description: 'Urgent care for pets requiring immediate medical attention.',
        serviceType: 'Veterinary',
        price: 250.00,
        durationMinutes: 60,
        availablePetTypes: JSON.stringify(['dog', 'cat', 'bird', 'small_mammal', 'reptile']),
        additionalOptions: JSON.stringify([
          { name: 'IV Fluids', price: 85.00 },
          { name: 'Medication', price: 30.00, per: 'prescription' },
        ]),
      });
      
      // Services for Pet Training Academy
      services.push({
        vendorId: vendors[3].id,
        name: 'Basic Obedience Training',
        description: 'Fundamental training for dogs including sit, stay, come, and leash walking.',
        serviceType: 'Training',
        price: 200.00,
        durationMinutes: 60,
        sessionCount: 6,
        availablePetTypes: JSON.stringify(['dog']),
        additionalOptions: JSON.stringify([
          { name: 'Private Session', price: 50.00 },
          { name: 'Training Materials', price: 25.00 },
        ]),
      });
      
      services.push({
        vendorId: vendors[3].id,
        name: 'Puppy Socialization Class',
        description: 'Group class designed to help puppies develop social skills with other dogs and people.',
        serviceType: 'Training',
        price: 150.00,
        durationMinutes: 45,
        sessionCount: 4,
        availablePetTypes: JSON.stringify(['dog']),
        petAgeMin: 8, // weeks
        petAgeMax: 20, // weeks
        additionalOptions: JSON.stringify([
          { name: 'Additional Session', price: 40.00 },
        ]),
      });
      
      await this.vendorServiceModel.bulkCreate(services, { transaction: t });
      
      await t.commit();
      console.log('Vendor and service data seeded successfully');
    } catch (error) {
      await t.rollback();
      console.error('Error seeding vendor data:', error);
      throw error;
    }
  }
}
