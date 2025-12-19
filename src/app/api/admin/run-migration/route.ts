import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// EMERGENCY ENDPOINT - Apply missing migration
export async function POST(req: Request) {
  try {
    // Run the migration SQL directly
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "openForHire" BOOLEAN NOT NULL DEFAULT true;
    `)

    return NextResponse.json({
      success: true,
      message: 'Migration applied successfully'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Failed to apply migration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
