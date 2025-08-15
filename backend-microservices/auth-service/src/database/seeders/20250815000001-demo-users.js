'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('Admin123!', salt);
    const hashedVendorPassword = await bcrypt.hash('Vendor123!', salt);
    const hashedCustomerPassword = await bcrypt.hash('Customer123!', salt);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@petpro.com',
        password: hashedAdminPassword,
        role: 'admin',
        is_email_verified: true,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        first_name: 'Vendor',
        last_name: 'User',
        email: 'vendor@petpro.com',
        password: hashedVendorPassword,
        role: 'vendor',
        is_email_verified: true,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        first_name: 'Customer',
        last_name: 'User',
        email: 'customer@petpro.com',
        password: hashedCustomerPassword,
        role: 'customer',
        is_email_verified: true,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
