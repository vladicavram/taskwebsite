-- Add missing columns to production database
-- Run this in your production database

-- Add isDirectHire column to Task table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Task' AND column_name = 'isDirectHire'
    ) THEN
        ALTER TABLE "Task" ADD COLUMN "isDirectHire" BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Added isDirectHire column to Task table';
    ELSE
        RAISE NOTICE 'isDirectHire column already exists';
    END IF;
END $$;

-- Add openForHire column to User table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'openForHire'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "openForHire" BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Added openForHire column to User table';
    ELSE
        RAISE NOTICE 'openForHire column already exists';
    END IF;
END $$;

-- Add task relation to Notification table if taskId column doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Notification' AND column_name = 'taskId'
    ) THEN
        ALTER TABLE "Notification" ADD COLUMN "taskId" TEXT;
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_taskId_fkey" 
            FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Added taskId column to Notification table';
    ELSE
        RAISE NOTICE 'taskId column already exists';
    END IF;
END $$;
