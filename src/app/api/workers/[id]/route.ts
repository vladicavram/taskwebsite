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
        reviewsReceived: {
          select: {
            rating: true
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

    // Calculate average rating
    const ratings = worker.reviewsReceived.map(r => r.rating)
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
      : 0

    const workerWithRating = {
      id: worker.id,
      name: worker.name,
      email: worker.email,
      image: worker.image,
      profile: worker.profile,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length,
      _count: worker._count
    }

    return NextResponse.json(workerWithRating)
  } catch (error) {
    console.error('Failed to fetch worker:', error)
    return NextResponse.json({ error: 'Failed to fetch worker' }, { status: 500 })
  }
}
