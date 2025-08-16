'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'user_id',
      },
      type: {
        type: Sequelize.ENUM(
          'login',
          'logout',
          'profile_update',
          'password_changed',
          'email_verified',
          'booking_created',
          'booking_updated',
          'booking_cancelled',
          'payment_made',
          'payment_refunded',
          'pet_created',
          'pet_updated',
          'pet_removed',
          'review_submitted',
          'address_added',
          'address_updated',
          'address_removed',
          'notification_settings_updated',
          'account_created',
          'account_deactivated',
          'account_reactivated'
        ),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true,
        field: 'ip_address',
      },
      userAgent: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'user_agent',
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('activities', ['user_id'], {
      name: 'activities_user_id_idx',
    });
    
    await queryInterface.addIndex('activities', ['type'], {
      name: 'activities_type_idx',
    });
    
    await queryInterface.addIndex('activities', ['timestamp'], {
      name: 'activities_timestamp_idx',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activities');
  },
};
