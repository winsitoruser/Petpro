require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'petpro_inventory_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com') ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    migrationStorageTableName: 'sequelize_meta',
    seederStorageTableName: 'sequelize_seeds'
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE_TEST || 'petpro_inventory_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_meta',
    seederStorageTableName: 'sequelize_seeds'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    migrationStorageTableName: 'sequelize_meta',
    seederStorageTableName: 'sequelize_seeds'
  }
};