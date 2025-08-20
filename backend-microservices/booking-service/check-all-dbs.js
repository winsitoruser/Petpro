const { Sequelize } = require('sequelize');

const databases = [
  'petpro_booking_dev',
  'petpro_auth_dev', 
  'petpro_admin_dev',
  'petpro_inventory_dev',
  'petpro_vendor_dev'
];

async function checkAllDatabases() {
  for (const dbName of databases) {
    console.log(`\n=== ${dbName.toUpperCase()} ===`);
    
    const sequelize = new Sequelize({
      dialect: 'postgres',
      host: 'ls-da9311c68b227ba9477a97f644bc7679989cb867.crs0agc04xhl.ap-southeast-1.rds.amazonaws.com',
      port: 5432,
      username: 'dbmasteruser',
      password: 'p6tV9eKpyqGJ8Xk3m2FfNwQ7rZbC1d1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      database: dbName,
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    try {
      await sequelize.authenticate();
      console.log('✅ Connection successful');
      
      const [tables] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      console.log(`📊 Found ${tables.length} tables:`);
      for (const table of tables) {
        try {
          const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
          console.log(`  - ${table.table_name}: ${count[0].count} rows`);
        } catch (err) {
          console.log(`  - ${table.table_name}: Error counting`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    } finally {
      await sequelize.close();
    }
  }
}

checkAllDatabases();