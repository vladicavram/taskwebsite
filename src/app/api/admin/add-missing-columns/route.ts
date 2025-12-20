import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/authOptions'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const results = []

    // Add isDirectHire column to Task table
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'Task' AND column_name = 'isDirectHire'
            ) THEN
                ALTER TABLE "Task" ADD COLUMN "isDirectHire" BOOLEAN NOT NULL DEFAULT false;
            END IF;
        END $$;
      `)
      results.push('✓ Task.isDirectHire column added/verified')
    } catch (e: any) {
      results.push(`✗ Task.isDirectHire: ${e.message}`)
    }

    // Add openForHire column to User table
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'User' AND column_name = 'openForHire'
            ) THEN
                ALTER TABLE "User" ADD COLUMN "openForHire" BOOLEAN NOT NULL DEFAULT true;
            END IF;
        END $$;
      `)
      results.push('✓ User.openForHire column added/verified')
    } catch (e: any) {
      results.push(`✗ User.openForHire: ${e.message}`)
    }

    // Add taskId column to Notification table
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
            END IF;
        END $$;
      `)
      results.push('✓ Notification.taskId column added/verified')
    } catch (e: any) {
      results.push(`✗ Notification.taskId: ${e.message}`)
    }

    return NextResponse.json({ 
      success: true, 
      results,
      message: 'Migration completed'
    })

  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error.message 
    }, { status: 500 })
  }
}
