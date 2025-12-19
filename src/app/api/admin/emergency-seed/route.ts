import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// EMERGENCY ENDPOINT - Remove after use!
// This endpoint temporarily has no auth to restore admin access
export async function POST(req: Request) {
  try {
    const hashedAdminPw = bcrypt.hashSync('admin123', 10)
    const hashedTestPw = bcrypt.hashSync('password123', 10)
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@taskwebsite.com' }
    })

    if (!existingAdmin) {
      // Create admin user
      await prisma.user.create({
        data: {
          email: 'admin@taskwebsite.com',
          username: 'admin',
          password: hashedAdminPw,
          userType: 'both',
          canApply: true,
          isAdmin: true,
          blocked: false,
          profile: {
            create: {
              bio: 'System Administrator',
              location: 'Moldova',
              skills: 'System Administration, Support',
              verified: true
            }
          }
        }
      })
    }

    // Create test users
    const testUsers = [
      {
        email: 'alice@example.com',
        username: 'alice',
        password: hashedTestPw,
        userType: 'both',
        canApply: true,
        bio: 'Experienced handyman',
        location: 'Bucharest',
        skills: 'plumbing, painting, electrical',
        verified: true
      },
      {
        email: 'bob@example.com',
        username: 'bob',
        password: hashedTestPw,
        userType: 'tasker',
        canApply: true,
        bio: 'Professional cleaner',
        location: 'Cluj-Napoca',
        skills: 'cleaning, organizing',
        verified: true
      },
      {
        email: 'carol@example.com',
        username: 'carol',
        password: hashedTestPw,
        userType: 'poster',
        canApply: false,
        bio: 'Looking for help with tasks',
        location: 'Timisoara',
        skills: '',
        verified: false
      }
    ]

    let createdCount = 0
    for (const userData of testUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      
      if (!existing) {
        await prisma.user.create({
          data: {
            email: userData.email,
            username: userData.username,
            password: userData.password,
            userType: userData.userType,
            canApply: userData.canApply,
            blocked: false,
            profile: {
              create: {
                bio: userData.bio,
                location: userData.location,
                skills: userData.skills,
                verified: userData.verified
              }
            }
          }
        })
        createdCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${createdCount} new users`,
      users: testUsers.map(u => ({ email: u.email, username: u.username }))
    })
  } catch (error) {
    console.error('Emergency seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed admin user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
