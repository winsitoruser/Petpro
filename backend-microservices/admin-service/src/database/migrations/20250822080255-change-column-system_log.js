"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("system_logs");

    if (!table.updated_at) {
      await queryInterface.addColumn("system_logs", "updated_at", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("system_logs");

    if (table.updated_at) {
      await queryInterface.removeColumn("system_logs", "updated_at");
    }
  },
};
