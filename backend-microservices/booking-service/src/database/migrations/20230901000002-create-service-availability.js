'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create enum type for recurrence pattern
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_recurrence_pattern" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');
    `);

    await queryInterface.createTable('service_availability', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      service_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      max_slots: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      booked_slots: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      day_of_week: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_recurring: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      recurrence_pattern: {
        type: 'enum_recurrence_pattern',
        allowNull: true,
      },
      recurrence_end_date: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('service_availability', ['service_id']);
    await queryInterface.addIndex('service_availability', ['start_time', 'end_time']);
    await queryInterface.addIndex('service_availability', ['is_available']);
    await queryInterface.addIndex('service_availability', ['is_recurring']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('service_availability');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_recurrence_pattern";`);
  }
};
