import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// EMERGENCY ENDPOINT - Remove after use!
// This endpoint temporarily has no auth to restore admin access
export async function POST(req: Request) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@taskwebsite.com' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        user: { id: existingAdmin.id, email: existingAdmin.email }
      })
    }

    // Create admin user
    const hashedPassword = bcrypt.hashSync('admin123', 10)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@taskwebsite.com',
        username: 'admin',
        password: hashedPassword,
        userType: 'both',
        canApply: true,
        isAdmin: true,
        blocked: false,
        openForHire: false,
        profile: {
          create: {
            bio: 'System Administrator',
            location: 'Moldova',
            skills: 'System Administration, Support',
            verified: true
          }
        }
      },
      include: {
        profile: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username
      }
    })
  } catch (error) {
    console.error('Emergency seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed admin user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
