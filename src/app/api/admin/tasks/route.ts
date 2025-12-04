import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { requireModerator } from '../../../../lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireModerator()
    
    const tasks = await prisma.task.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(tasks)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Access denied' }, { status: 403 })
  }
}
