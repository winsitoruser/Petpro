'use strict';
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'petpro_booking_dev',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com') ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: true,
      underscored: true,
    }
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'petpro_booking_test',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com') ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      timestamps: true,
      underscored: true,
    }
  },
  staging: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'petpro_booking_staging',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com') ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'petpro_booking_prod',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com') ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    }
  }
};
