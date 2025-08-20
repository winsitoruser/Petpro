const { Sequelize } = require('sequelize');

async function createInventoryDatabase() {
  // Connect to default postgres database first to create new database
  const mainSequelize = new Sequelize({
    dialect: 'postgres',
    host: 'ls-da9311c68b227ba9477a97f644bc7679989cb867.crs0agc04xhl.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    username: 'dbmasteruser',
    password: 'p6tV9eKpyqGJ8Xk3m2FfNwQ7rZbC1d1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    database: 'postgres', // Connect to default database
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    console.log('Creating petpro_inventory_dev database...');
    await mainSequelize.query('CREATE DATABASE "petpro_inventory_dev"');
    console.log('✅ Database created successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Database already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await mainSequelize.close();
  }

  // Now connect to the new database and create tables
  const inventorySequelize = new Sequelize({
    dialect: 'postgres',
    host: 'ls-da9311c68b227ba9477a97f644bc7679989cb867.crs0agc04xhl.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    username: 'dbmasteruser',
    password: 'p6tV9eKpyqGJ8Xk3m2FfNwQ7rZbC1d1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    database: 'petpro_inventory_dev',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });

  try {
    console.log('Creating inventory tables...');
    
    // Create basic inventory tables
    await inventorySequelize.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "sku" VARCHAR(100) UNIQUE NOT NULL,
        "category" VARCHAR(100),
        "price" DECIMAL(10,2) NOT NULL,
        "cost_price" DECIMAL(10,2),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE
      )
    `);
    
    await inventorySequelize.query(`
      CREATE TABLE IF NOT EXISTS "product_categories" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(100) NOT NULL,
        "description" TEXT,
        "parent_id" UUID REFERENCES "product_categories"("id"),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE
      )
    `);
    
    await inventorySequelize.query(`
      CREATE TABLE IF NOT EXISTS "inventory" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "product_id" UUID NOT NULL REFERENCES "products"("id"),
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
        "location" VARCHAR(255),
        "min_stock_level" INTEGER DEFAULT 0,
        "max_stock_level" INTEGER,
        "reorder_point" INTEGER DEFAULT 0,
        "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables created successfully');
    
    // Check tables
    const [tables] = await inventorySequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`📊 Created ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await inventorySequelize.close();
  }
}

createInventoryDatabase();