'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_preferences', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      emailNotifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      pushNotifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      smsNotifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      marketingEmails: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      bookingReminders: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      bookingUpdates: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      promotions: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      serviceUpdates: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      petHealthReminders: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      appUpdates: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notification_preferences');
  }
};