import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    console.log('Running all missing migrations...')
    
    // Add openForHire field if missing
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "openForHire" BOOLEAN NOT NULL DEFAULT true;
    `)
    console.log('✓ openForHire column added')

    // Add password reset fields if missing
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry" TIMESTAMP(3);
    `)
    console.log('✓ Password reset columns added')

    // Verify columns exist
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_name = 'User'
      ORDER BY ordinal_position;
    `

    return NextResponse.json({
      success: true,
      message: 'All migrations applied successfully',
      columns
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Failed to apply migrations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
