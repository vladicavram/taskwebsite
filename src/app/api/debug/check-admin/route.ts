import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { compareSync } from 'bcryptjs'

export async function GET() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@taskwebsite.com' }
    })
    
    if (!admin) {
      const userCount = await prisma.user.count()
      return NextResponse.json({
        found: false,
        totalUsers: userCount,
        message: 'Admin not found in database'
      })
    }
    
    const passwordMatch = admin.password ? compareSync('admin123', admin.password) : false
    
    return NextResponse.json({
      found: true,
      email: admin.email,
      username: admin.username,
      name: admin.name,
      isAdmin: admin.isAdmin,
      userType: admin.userType,
      canApply: admin.canApply,
      blocked: admin.blocked,
      hasPassword: !!admin.password,
      passwordMatches: passwordMatch,
      totalUsers: await prisma.user.count(),
      totalTasks: await prisma.task.count()
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
