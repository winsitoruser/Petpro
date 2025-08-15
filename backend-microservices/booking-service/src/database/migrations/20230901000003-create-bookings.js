'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create enum type for booking status
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_booking_status" AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
    `);

    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      service_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      pet_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'pets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      availability_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'service_availability',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: 'enum_booking_status',
        allowNull: false,
        defaultValue: 'pending',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payment_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      confirmation_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('bookings', ['user_id']);
    await queryInterface.addIndex('bookings', ['service_id']);
    await queryInterface.addIndex('bookings', ['pet_id']);
    await queryInterface.addIndex('bookings', ['availability_id']);
    await queryInterface.addIndex('bookings', ['status']);
    await queryInterface.addIndex('bookings', ['start_time', 'end_time']);
    await queryInterface.addIndex('bookings', ['payment_status']);
    await queryInterface.addIndex('bookings', ['confirmation_code']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bookings');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_booking_status";`);
  }
};
