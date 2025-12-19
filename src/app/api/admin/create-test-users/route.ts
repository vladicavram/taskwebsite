import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Create test users - no auth required for emergency recovery
export async function GET(req: Request) {
  try {
    const hashedPw = bcrypt.hashSync('password123', 10)
    
    const testUsers = [
      { email: 'alice@example.com', username: 'alice', userType: 'both' as const },
      { email: 'bob@example.com', username: 'bob', userType: 'tasker' as const },
      { email: 'carol@example.com', username: 'carol', userType: 'poster' as const }
    ]

    const results = []
    
    for (const userData of testUsers) {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      
      if (!existing) {
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            username: userData.username,
            password: hashedPw,
            userType: userData.userType,
            canApply: userData.userType !== 'poster',
            blocked: false,
            profile: {
              create: {
                bio: `Test user ${userData.username}`,
                location: 'Moldova',
                skills: 'Testing',
                verified: true
              }
            }
          }
        })
        results.push({ created: true, email: user.email, username: user.username })
      } else {
        // Update password in case it's wrong
        await prisma.user.update({
          where: { email: userData.email },
          data: { password: hashedPw }
        })
        results.push({ updated: true, email: userData.email })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test users ready',
      results
    })
  } catch (error) {
    console.error('Create users error:', error)
    return NextResponse.json(
      { error: 'Failed to create users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
