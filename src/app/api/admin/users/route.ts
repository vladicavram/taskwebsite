import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { requireModerator } from '../../../../lib/admin'

export async function GET() {
  try {
    await requireModerator()
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        credits: true,
        isAdmin: true,
        role: true,
        blocked: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
            applications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(users)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Access denied' }, { status: 403 })
  }
}
