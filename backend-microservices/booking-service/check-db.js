const { Sequelize } = require('sequelize');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: console.log,
  dialectOptions: {
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('rds.amazonaws.com') ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

async function checkDatabase() {
  try {
    console.log('Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_DATABASE}`);
    console.log(`Username: ${process.env.DB_USERNAME}`);
    console.log(`Password: ${process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]'}`);
    
    await sequelize.authenticate();
    console.log('\n✅ Connection successful!');
    
    console.log('\n📊 Querying all tables...');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`\nFound ${tables.length} tables:`);
    if (tables.length === 0) {
      console.log('❌ NO TABLES FOUND IN DATABASE!');
    } else {
      for (const table of tables) {
        try {
          const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
          console.log(`  📋 ${table.table_name}: ${count[0].count} rows`);
        } catch (err) {
          console.log(`  ❌ ${table.table_name}: Error - ${err.message}`);
        }
      }
    }
    
    console.log('\n🔍 Checking SequelizeMeta...');
    try {
      const [migrations] = await sequelize.query('SELECT name FROM "SequelizeMeta" ORDER BY name');
      console.log(`Found ${migrations.length} migration records:`);
      migrations.forEach(m => console.log(`  - ${m.name}`));
    } catch (err) {
      console.log('❌ SequelizeMeta error:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();