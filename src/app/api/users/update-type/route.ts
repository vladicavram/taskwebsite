import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userType } = body

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['poster', 'tasker', 'both'].includes(userType)) {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 })
    }

    // Update user type and set canApply based on type
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        userType,
        // Only taskers and both types can apply (but still need admin approval)
        canApply: userType === 'poster' ? false : false // Will be set to true by admin
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating user type:', error)
    return NextResponse.json({ error: error.message || 'Failed to update user type' }, { status: 500 })
  }
}
