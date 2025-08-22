"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("user_sessions", "token", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn("user_sessions", "user_agent", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("user_sessions", "token", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.changeColumn("user_sessions", "user_agent", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
