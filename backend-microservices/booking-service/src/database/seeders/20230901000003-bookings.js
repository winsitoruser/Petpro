'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch services, pets, and availability data
    const services = await queryInterface.sequelize.query(
      `SELECT id FROM services LIMIT 5;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const pets = await queryInterface.sequelize.query(
      `SELECT id, owner_id FROM pets LIMIT 5;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    const availabilities = await queryInterface.sequelize.query(
      `SELECT id, start_time, end_time FROM service_availability LIMIT 10;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (!services.length || !pets.length || !availabilities.length) {
      console.log('Required data missing, skipping booking seeding');
      return Promise.resolve();
    }

    // Create sample bookings
    const bookings = [];
    const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    
    // Create various bookings
    for (let i = 0; i < 10; i++) {
      const serviceIndex = i % services.length;
      const petIndex = i % pets.length;
      const availabilityIndex = i % availabilities.length;
      
      const service = services[serviceIndex];
      const pet = pets[petIndex];
      const availability = availabilities[availabilityIndex];
      
      // Parse date strings if needed
      const startTime = availability.start_time instanceof Date ? 
        availability.start_time : 
        new Date(availability.start_time);
      
      const endTime = availability.end_time instanceof Date ? 
        availability.end_time : 
        new Date(availability.end_time);
      
      // Create random booking status
      const statusIndex = Math.floor(Math.random() * statuses.length);
      const status = statuses[statusIndex];
      
      // Create booking record
      const booking = {
        id: uuidv4(),
        user_id: pet.owner_id,
        service_id: service.id,
        pet_id: pet.id,
        availability_id: availability.id,
        start_time: startTime,
        end_time: endTime,
        status: status,
        notes: `Sample booking ${i + 1}`,
        confirmation_code: `CONF-${Math.floor(100000 + Math.random() * 900000)}`,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Add payment info for completed bookings
      if (status === 'completed') {
        booking.payment_id = `PAY-${Math.floor(1000000 + Math.random() * 9000000)}`;
        booking.payment_status = 'paid';
        booking.amount_paid = 75.00;
      } else if (status === 'cancelled') {
        booking.cancellation_reason = 'Customer requested cancellation';
      }
      
      bookings.push(booking);
    }

    // Insert all bookings
    return queryInterface.bulkInsert('bookings', bookings, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('bookings', null, {});
  }
};
