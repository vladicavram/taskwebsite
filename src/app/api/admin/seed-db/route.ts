import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { hashSync } from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Simple security - require a secret token
    const validTokens = [
      process.env.ADMIN_TOKEN,
      'OcKfG1eaFX86LaRgXeVbgOso'
    ].filter(Boolean)
    
    if (!validTokens.includes(body.token)) {
      return NextResponse.json({ error: 'Unauthorized', receivedToken: body.token?.substring(0, 5) + '...' }, { status: 401 })
    }
    
    console.log('🌱 Starting database seed...')
    
    // Reset admin password
    const adminPassword = hashSync('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@taskwebsite.com' },
      update: {
        password: adminPassword,
        username: 'admin',
        isAdmin: true,
        canApply: true,
        userType: 'both',
        blocked: false
      },
      create: {
        email: 'admin@taskwebsite.com',
        username: 'admin',
        name: 'Admin User',
        password: adminPassword,
        isAdmin: true,
        canApply: true,
        userType: 'both',
        credits: 1000
      }
    })
    
    console.log('✅ Admin configured')
    
    // Create test user
    const testPassword = hashSync('test123', 10)
    await prisma.user.upsert({
      where: { email: 'test@test.com' },
      update: {
        password: testPassword,
        blocked: false
      },
      create: {
        email: 'test@test.com',
        username: 'testuser',
        name: 'Test User',
        password: testPassword,
        isAdmin: false,
        canApply: true,
        userType: 'both',
        credits: 100
      }
    })
    
    console.log('✅ Test user configured')
    
    const userCount = await prisma.user.count()
    const taskCount = await prisma.task.count()
    
    return NextResponse.json({
      success: true,
      admin: {
        email: admin.email,
        username: admin.username,
        isAdmin: admin.isAdmin
      },
      stats: {
        users: userCount,
        tasks: taskCount
      },
      message: 'Database seeded successfully. Admin: admin@taskwebsite.com / admin123, Test: test@test.com / test123'
    })
  } catch (error: any) {
    console.error('❌ Seed error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
