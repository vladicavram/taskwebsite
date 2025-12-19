import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // Security: Check for admin token
    const { adminToken } = await req.json()
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🌱 Seeding production database...')
    
    const pw = bcrypt.hashSync('password123', 10)
    const adminPw = bcrypt.hashSync('admin123', 10)

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@taskwebsite.com' },
      update: {},
      create: {
        email: 'admin@taskwebsite.com',
        username: 'admin',
        name: 'Admin User',
        password: adminPw,
        isAdmin: true,
        role: 'admin',
        userType: 'both',
        canApply: true,
        credits: 1000
      }
    })

    console.log('✅ Admin user created/updated')

    return NextResponse.json({ 
      success: true, 
      message: 'Production database seeded successfully',
      admin: { email: admin.email, name: admin.name }
    })
  } catch (error: any) {
    console.error('❌ Seed error:', error)
    return NextResponse.json({ 
      error: 'Failed to seed database', 
      details: error.message 
    }, { status: 500 })
  }
}
