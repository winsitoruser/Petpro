import { PrismaClient } from '@prisma/client';

/**
 * Script to show migration status and version information
 * Displays all applied migrations in the database
 */
async function getMigrationStatus() {
  const prisma = new PrismaClient();
  try {
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, applied_at
      FROM _prisma_migrations
      ORDER BY applied_at
    `;
    console.log('Applied migrations:');
    console.table(migrations);
  } catch (error) {
    console.error('Error fetching migrations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getMigrationStatus().catch(e => {
  console.error('Migration status check failed:', e);
  process.exit(1);
});
