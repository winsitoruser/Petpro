'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create sample service providers (veterinarians)
    const providers = [
      {
        id: uuidv4(),
        name: 'Dr. Smith'
      },
      {
        id: uuidv4(),
        name: 'Dr. Johnson'
      },
      {
        id: uuidv4(),
        name: 'Dr. Williams'
      }
    ];

    // Create sample service categories
    const services = [];
    
    // Checkup services
    services.push({
      id: uuidv4(),
      name: 'Regular Checkup',
      description: 'Standard health checkup for pets',
      category: 'checkup',
      duration_minutes: 30,
      price: 50.00,
      provider_id: providers[0].id,
      is_active: true,
      tags: ['checkup', 'regular', 'routine'],
      image_url: 'https://storage.googleapis.com/petpro/services/checkup.jpg',
      location: 'Main Clinic',
      created_at: new Date(),
      updated_at: new Date()
    });

    services.push({
      id: uuidv4(),
      name: 'Comprehensive Examination',
      description: 'Complete head-to-tail examination with detailed health report',
      category: 'checkup',
      duration_minutes: 60,
      price: 85.00,
      provider_id: providers[1].id,
      is_active: true,
      tags: ['checkup', 'comprehensive', 'report'],
      image_url: 'https://storage.googleapis.com/petpro/services/comprehensive.jpg',
      location: 'Main Clinic',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Vaccination services
    services.push({
      id: uuidv4(),
      name: 'Core Vaccinations - Dog',
      description: 'Essential vaccinations for dogs including rabies, distemper, and parvo',
      category: 'vaccination',
      duration_minutes: 20,
      price: 65.00,
      provider_id: providers[0].id,
      is_active: true,
      tags: ['vaccination', 'dog', 'core'],
      image_url: 'https://storage.googleapis.com/petpro/services/dog-vaccine.jpg',
      location: 'Vaccination Center',
      created_at: new Date(),
      updated_at: new Date()
    });

    services.push({
      id: uuidv4(),
      name: 'Core Vaccinations - Cat',
      description: 'Essential vaccinations for cats including rabies, FVRCP',
      category: 'vaccination',
      duration_minutes: 20,
      price: 60.00,
      provider_id: providers[1].id,
      is_active: true,
      tags: ['vaccination', 'cat', 'core'],
      image_url: 'https://storage.googleapis.com/petpro/services/cat-vaccine.jpg',
      location: 'Vaccination Center',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Grooming services
    services.push({
      id: uuidv4(),
      name: 'Basic Grooming',
      description: 'Bath, brushing, ear cleaning, and nail trim',
      category: 'grooming',
      duration_minutes: 45,
      price: 40.00,
      provider_id: providers[2].id,
      is_active: true,
      tags: ['grooming', 'basic', 'bath'],
      image_url: 'https://storage.googleapis.com/petpro/services/basic-grooming.jpg',
      location: 'Grooming Center',
      created_at: new Date(),
      updated_at: new Date()
    });

    services.push({
      id: uuidv4(),
      name: 'Premium Grooming Package',
      description: 'Full grooming with specialized shampoo, styling, and spa treatment',
      category: 'grooming',
      duration_minutes: 90,
      price: 75.00,
      provider_id: providers[2].id,
      is_active: true,
      tags: ['grooming', 'premium', 'spa'],
      image_url: 'https://storage.googleapis.com/petpro/services/premium-grooming.jpg',
      location: 'Grooming Center',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Dental services
    services.push({
      id: uuidv4(),
      name: 'Dental Cleaning',
      description: 'Professional teeth cleaning and oral examination',
      category: 'dental',
      duration_minutes: 60,
      price: 120.00,
      provider_id: providers[0].id,
      is_active: true,
      tags: ['dental', 'cleaning', 'teeth'],
      image_url: 'https://storage.googleapis.com/petpro/services/dental.jpg',
      location: 'Dental Suite',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Surgery services
    services.push({
      id: uuidv4(),
      name: 'Spay/Neuter',
      description: 'Spay or neuter surgery with pre-op blood work and post-op care',
      category: 'surgery',
      duration_minutes: 120,
      price: 200.00,
      provider_id: providers[1].id,
      is_active: true,
      tags: ['surgery', 'spay', 'neuter'],
      image_url: 'https://storage.googleapis.com/petpro/services/spay-neuter.jpg',
      location: 'Surgery Center',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Insert all services
    return queryInterface.bulkInsert('services', services, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('services', null, {});
  }
};
