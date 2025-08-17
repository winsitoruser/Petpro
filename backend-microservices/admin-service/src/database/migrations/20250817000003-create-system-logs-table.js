'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('system_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'admin_users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        field: 'user_id',
      },
      level: {
        type: Sequelize.ENUM('info', 'warning', 'error', 'debug'),
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM('auth', 'user_management', 'system', 'api', 'database'),
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'ip_address',
      },
      userAgent: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'user_agent',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at',
      },
    });

    await queryInterface.addIndex('system_logs', ['user_id']);
    await queryInterface.addIndex('system_logs', ['level']);
    await queryInterface.addIndex('system_logs', ['category']);
    await queryInterface.addIndex('system_logs', ['created_at']);
    await queryInterface.addIndex('system_logs', ['ip_address']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('system_logs');
  },
};