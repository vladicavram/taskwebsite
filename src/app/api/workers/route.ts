import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // Get all users who are approved to apply for tasks (workers)
    // Only include users with userType 'tasker' or 'both' (not 'poster')
    // And who have openForHire set to true
    const workers = await prisma.user.findMany({
      where: {
        canApply: true,
        blocked: false,
        openForHire: true,
        userType: {
          in: ['tasker', 'both']
        }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate average rating for each worker and sort by rating
    const workersWithRating = workers.map(worker => {
      const ratings = worker.reviewsReceived.map(r => r.rating)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
        : 0
      
      return {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        image: worker.image,
        profile: worker.profile,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: ratings.length,
        _count: worker._count
      }
    })

    // Sort by rating (highest first), then by review count
    workersWithRating.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating
      }
      return b.reviewCount - a.reviewCount
    })

    return NextResponse.json(workersWithRating)
  } catch (error) {
    console.error('Failed to fetch workers:', error)
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 })
  }
}
