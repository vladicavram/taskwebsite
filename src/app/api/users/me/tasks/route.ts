import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../../lib/prisma'

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get tasks created by the user
    const tasks = await prisma.task.findMany({
      where: { creatorId: user.id },
      include: {
        category: true,
        reviews: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Return empty array if no tasks (not an error)
    return NextResponse.json(tasks || [])
  } catch (error) {
    console.error('Error fetching user tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
