// Run this script to add missing columns to production database
// Usage: node run-production-migration.js

const { PrismaClient } = require('@prisma/client')

async function runMigration() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Starting migration...')
    
    // Add isDirectHire column to Task table
    console.log('\n1. Adding isDirectHire column to Task table...')
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'Task' AND column_name = 'isDirectHire'
            ) THEN
                ALTER TABLE "Task" ADD COLUMN "isDirectHire" BOOLEAN NOT NULL DEFAULT false;
                RAISE NOTICE 'Added isDirectHire column';
            ELSE
                RAISE NOTICE 'isDirectHire column already exists';
            END IF;
        END $$;
      `)
      console.log('✅ Task.isDirectHire - Success')
    } catch (e) {
      console.error('❌ Task.isDirectHire - Error:', e.message)
    }

    // Add openForHire column to User table
    console.log('\n2. Adding openForHire column to User table...')
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'User' AND column_name = 'openForHire'
            ) THEN
                ALTER TABLE "User" ADD COLUMN "openForHire" BOOLEAN NOT NULL DEFAULT true;
                RAISE NOTICE 'Added openForHire column';
            ELSE
                RAISE NOTICE 'openForHire column already exists';
            END IF;
        END $$;
      `)
      console.log('✅ User.openForHire - Success')
    } catch (e) {
      console.error('❌ User.openForHire - Error:', e.message)
    }

    // Add taskId column to Notification table
    console.log('\n3. Adding taskId column to Notification table...')
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'Notification' AND column_name = 'taskId'
            ) THEN
                ALTER TABLE "Notification" ADD COLUMN "taskId" TEXT;
                ALTER TABLE "Notification" ADD CONSTRAINT "Notification_taskId_fkey" 
                    FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
                RAISE NOTICE 'Added taskId column';
            ELSE
                RAISE NOTICE 'taskId column already exists';
            END IF;
        END $$;
      `)
      console.log('✅ Notification.taskId - Success')
    } catch (e) {
      console.error('❌ Notification.taskId - Error:', e.message)
    }

    console.log('\n✨ Migration completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runMigration()
