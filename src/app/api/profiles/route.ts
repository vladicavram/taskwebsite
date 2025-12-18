import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { authOptions } from '../auth/[...nextauth]/authOptions'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    // If ID is provided, fetch specific user profile
    if (id) {
      // Support both direct user id and username in the same `id` param
      let user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          tasks: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              category: true,
              reviews: {
                include: { author: true }
              }
            }
          },
          reviewsReceived: {
            include: {
              author: true,
              task: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!user) {
        // Fallback: treat the provided id as a username or email
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: id },
              { email: id }
            ]
          },
          include: {
            profile: true,
            tasks: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: {
                category: true,
                reviews: {
                  include: { author: true }
                }
              }
            },
            reviewsReceived: {
              include: {
                author: true,
                task: true
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        })
      }

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json(user)
    }

    // Otherwise return all profiles
    const profiles = await prisma.profile.findMany({ include: { user: true } })
    return NextResponse.json(profiles)
  } catch (error: any) {
    console.error('Profiles GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error', detail: error?.message || String(error) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, bio, location, skills, dateOfBirth, phone, idType, idNumber } = body
  
    // If userId is provided (during registration), use it directly
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    
      // If user is upgrading from poster to tasker, update their userType
      if (user.userType === 'poster') {
        await prisma.user.update({
          where: { id: userId },
          data: { 
            userType: 'tasker',
            canApply: false // Needs admin approval
          }
        })
      }
    
      const profile = await prisma.profile.upsert({
        where: { userId },
        update: { bio, location, skills },
        create: { userId, bio, location, skills }
      })
      return NextResponse.json(profile)
    }
  
    // Otherwise require authentication
  const session = await getServerSession(authOptions as any) as Session | null
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 400 })

    const up = await prisma.profile.upsert({
      where: { userId: user.id },
      update: { bio, location, skills },
      create: { userId: user.id, bio, location, skills }
    })
    return NextResponse.json(up)
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Failed to create/update profile' },
      { status: 500 }
    )
  }
}
