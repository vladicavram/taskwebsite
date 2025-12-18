import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const worker = await prisma.user.findUnique({
      where: {
        id: params.id,
        canApply: true,
        blocked: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        profile: {
          select: {
            bio: true,
            location: true,
            skills: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    return NextResponse.json(worker)
  } catch (error) {
    console.error('Failed to fetch worker:', error)
    return NextResponse.json({ error: 'Failed to fetch worker' }, { status: 500 })
  }
}
