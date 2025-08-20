'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      reserved_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      minimum_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      batch_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('inventories', ['product_id']);
    await queryInterface.addIndex('inventories', ['vendor_id']);
    await queryInterface.addIndex('inventories', ['batch_number']);
    await queryInterface.addIndex('inventories', ['expiry_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventories');
  }
};