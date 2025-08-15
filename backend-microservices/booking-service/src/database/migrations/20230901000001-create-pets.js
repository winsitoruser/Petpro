'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      species: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      breed: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      weight: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown',
      },
      microchip_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      medical_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      profile_picture: {
        type: Sequelize.STRING(255),
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

    await queryInterface.addIndex('pets', ['owner_id']);
    await queryInterface.addIndex('pets', ['species']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pets');
  }
};
