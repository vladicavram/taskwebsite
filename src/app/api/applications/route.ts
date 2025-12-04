import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '../../../lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any
    console.log('Applications POST - Session:', session?.user?.email)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { taskId, userId, proposedPrice, message } = body
    console.log('Creating application:', { taskId, userId, proposedPrice, message })

    if (!taskId || !userId) {
      return NextResponse.json({ error: 'Task ID and User ID required' }, { status: 400 })
    }

    // Create an application/offer (uses applicantId per schema)
    const application = await prisma.application.create({
      data: {
        taskId,
        applicantId: userId,
        proposedPrice: proposedPrice || null,
        message: message || '',
        status: 'pending'
      }
    })
    console.log('Application created:', application.id)

    // Create a notification for the hired user
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    console.log('Task found:', task?.title)
    
    if (task) {
      const notification = await prisma.notification.create({
        data: {
          userId: userId,
          type: 'application_received',
          taskId: taskId,
          applicationId: application.id,
          content: `You received a job offer: ${task.title}`
        }
      })
      console.log('Notification created:', notification.id)
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}
