const { Sequelize } = require('sequelize');

const databases = [
  {
    name: 'petpro_auth_dev',
    service: 'Auth Service',
    userTables: ['users', 'activities']
  },
  {
    name: 'petpro_admin_dev', 
    service: 'Admin Service',
    userTables: ['admin_users', 'user_sessions']
  },
  {
    name: 'petpro_booking_dev',
    service: 'Booking Service', 
    userTables: ['pets'] // pets memiliki owner_id yang reference ke user
  },
  {
    name: 'petpro_vendor_dev',
    service: 'Vendor Service',
    userTables: ['users', 'activities', 'pets'] // duplikasi dari auth & booking
  }
];

async function analyzeUserData() {
  console.log('🔍 ANALISIS STRUKTUR USER DATA ACROSS SERVICES\n');
  
  for (const db of databases) {
    console.log(`=== ${db.service.toUpperCase()} (${db.name}) ===`);
    
    const sequelize = new Sequelize({
      dialect: 'postgres',
      host: 'ls-da9311c68b227ba9477a97f644bc7679989cb867.crs0agc04xhl.ap-southeast-1.rds.amazonaws.com',
      port: 5432,
      username: 'dbmasteruser',
      password: 'p6tV9eKpyqGJ8Xk3m2FfNwQ7rZbC1d1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      database: db.name,
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
      
      for (const tableName of db.userTables) {
        try {
          const [columns] = await sequelize.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = '${tableName}' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
          `);
          
          if (columns.length > 0) {
            console.log(`\n📊 Table: ${tableName}`);
            const userRelatedFields = columns.filter(col => 
              col.column_name.includes('user') || 
              col.column_name.includes('owner') ||
              col.column_name.includes('email') ||
              col.column_name.includes('name') ||
              col.column_name.includes('role') ||
              col.column_name.includes('id')
            );
            
            userRelatedFields.forEach(col => {
              console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
            });
          }
        } catch (err) {
          console.log(`  ❌ ${tableName}: Table not found`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
    } finally {
      await sequelize.close();
    }
    
    console.log('');
  }

  console.log(`
🎯 REKOMENDASI ARSITEKTUR USER DATA:

1. **CENTRALIZED USER SERVICE** (RECOMMENDED)
   ✅ Satu source of truth untuk user data
   ✅ Konsistensi data terjamin
   ✅ User management terpusat
   
   Structure:
   - Auth Service: users, refresh_tokens, activities
   - Admin Service: admin_users, user_sessions  
   - Other Services: Hanya simpan user_id sebagai reference

2. **DISTRIBUTED WITH EVENT SOURCING**
   ⚠️ Duplikasi minimal data penting saja
   ⚠️ Sync via events (user.created, user.updated)
   
   Structure:
   - Auth Service: Full user data (master)
   - Other Services: user_id + essential fields only (name, email)

3. **CURRENT STATE ISSUES:**
   ❌ petpro_vendor_dev memiliki duplikasi users table
   ❌ pets table di 2 tempat (booking + vendor)
   ❌ Data inconsistency risk tinggi

🔧 SARAN IMPLEMENTASI:
1. Auth Service = Master user data
2. Services lain = Store user_id reference saja  
3. Gunakan API calls atau event bus untuk get user details
4. Admin users terpisah (karena berbeda role/access)
  `);
}

analyzeUserData();