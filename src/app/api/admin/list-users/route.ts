import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
        canApply: true,
        blocked: true,
        isAdmin: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      count: users.length,
      users
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
