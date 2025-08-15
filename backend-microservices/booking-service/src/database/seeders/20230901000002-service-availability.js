'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, fetch the services to associate availability with
    const services = await queryInterface.sequelize.query(
      `SELECT id FROM services;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (!services || services.length === 0) {
      console.log('No services found, skipping availability seeding');
      return Promise.resolve();
    }

    // Create start date (tomorrow)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(9, 0, 0, 0); // 9:00 AM
    
    // Create availability entries for the next 14 days
    const availabilities = [];
    const days = 14;

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Skip weekends
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip Sunday (0) and Saturday (6)
      
      // Create availability slots for each service
      services.forEach(service => {
        // Morning slot (9:00 AM - 12:00 PM)
        const morningStart = new Date(currentDate);
        morningStart.setHours(9, 0, 0, 0);
        
        const morningEnd = new Date(currentDate);
        morningEnd.setHours(12, 0, 0, 0);
        
        availabilities.push({
          id: uuidv4(),
          service_id: service.id,
          start_time: morningStart,
          end_time: morningEnd,
          max_slots: 5,
          booked_slots: 0,
          is_available: true,
          notes: 'Morning appointments',
          is_recurring: false,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        // Afternoon slot (13:00 PM - 17:00 PM)
        const afternoonStart = new Date(currentDate);
        afternoonStart.setHours(13, 0, 0, 0);
        
        const afternoonEnd = new Date(currentDate);
        afternoonEnd.setHours(17, 0, 0, 0);
        
        availabilities.push({
          id: uuidv4(),
          service_id: service.id,
          start_time: afternoonStart,
          end_time: afternoonEnd,
          max_slots: 5,
          booked_slots: 0,
          is_available: true,
          notes: 'Afternoon appointments',
          is_recurring: false,
          created_at: new Date(),
          updated_at: new Date()
        });
      });
    }

    // Create some recurring weekly slots
    services.forEach(service => {
      // Weekly Monday morning recurring slot
      const recurringStart = new Date();
      recurringStart.setDate(recurringStart.getDate() + (8 - recurringStart.getDay()) % 7); // Next Monday
      recurringStart.setHours(10, 0, 0, 0);
      
      const recurringEnd = new Date(recurringStart);
      recurringEnd.setHours(11, 30, 0, 0);
      
      const recurrenceEndDate = new Date();
      recurrenceEndDate.setMonth(recurrenceEndDate.getMonth() + 3); // 3 months from now
      
      availabilities.push({
        id: uuidv4(),
        service_id: service.id,
        start_time: recurringStart,
        end_time: recurringEnd,
        max_slots: 3,
        booked_slots: 0,
        is_available: true,
        notes: 'Recurring weekly appointment',
        day_of_week: 'Monday',
        is_recurring: true,
        recurrence_pattern: 'WEEKLY',
        recurrence_end_date: recurrenceEndDate,
        created_at: new Date(),
        updated_at: new Date()
      });
    });

    // Insert all availability slots
    return queryInterface.bulkInsert('service_availability', availabilities, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('service_availability', null, {});
  }
};
