import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to rollback the most recent migration
 * 
 * IMPORTANT: This only removes the migration from the tracking table.
 * You must manually handle schema rollback or provide a down migration SQL.
 */
async function rollbackLastMigration() {
  const prisma = new PrismaClient();
  try {
    // Get the last migration
    const lastMigration = await prisma.$queryRaw`
      SELECT migration_name, applied_at FROM _prisma_migrations
      ORDER BY applied_at DESC LIMIT 1
    `;
    
    if (!lastMigration || !lastMigration[0]) {
      console.log('No migrations to roll back');
      return;
    }
    
    const migrationName = lastMigration[0].migration_name;
    const appliedAt = lastMigration[0].applied_at;
    
    console.log(`Rolling back migration: ${migrationName} (applied at ${appliedAt})`);
    
    // Check for a down migration SQL file
    const downMigrationPath = path.join(
      process.cwd(), 
      'prisma', 
      'migrations', 
      'down', 
      `${migrationName}.sql`
    );
    
    if (fs.existsSync(downMigrationPath)) {
      console.log(`Found down migration SQL file: ${downMigrationPath}`);
      console.log('Executing down migration SQL...');
      
      // Read the SQL file
      const sql = fs.readFileSync(downMigrationPath, 'utf8');
      
      // Execute the SQL
      await prisma.$executeRawUnsafe(sql);
      console.log('Down migration SQL executed successfully');
    } else {
      console.warn('No down migration SQL file found!');
      console.warn(`Create ${downMigrationPath} for automated rollbacks`);
    }
    
    // Remove from _prisma_migrations table
    await prisma.$executeRaw`DELETE FROM _prisma_migrations WHERE migration_name = ${migrationName}`;
    
    console.log(`Migration ${migrationName} successfully removed from tracking table`);
    if (!fs.existsSync(downMigrationPath)) {
      console.log('WARNING: Database schema changes were NOT automatically reverted.');
      console.log('You need to manually revert the database changes or create a down migration SQL file.');
    }
  } catch (error) {
    console.error('Error rolling back migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Create down migrations directory if it doesn't exist
const downMigrationsDir = path.join(process.cwd(), 'prisma', 'migrations', 'down');
if (!fs.existsSync(downMigrationsDir)) {
  console.log(`Creating down migrations directory: ${downMigrationsDir}`);
  fs.mkdirSync(downMigrationsDir, { recursive: true });
}

rollbackLastMigration().catch(e => {
  console.error('Migration rollback failed:', e);
  process.exit(1);
});
