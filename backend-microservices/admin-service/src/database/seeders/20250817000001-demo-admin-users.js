'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await queryInterface.bulkInsert('admin_users', [
      {
        id: uuidv4(),
        email: 'superadmin@petpro.com',
        password: hashedPassword,
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        email: 'admin@petpro.com',
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        email: 'moderator@petpro.com',
        password: hashedPassword,
        first_name: 'Moderator',
        last_name: 'User',
        role: 'moderator',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('admin_users', {
      email: ['superadmin@petpro.com', 'admin@petpro.com', 'moderator@petpro.com'],
    });
  },
};