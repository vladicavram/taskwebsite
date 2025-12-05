import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Get the application with task details
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { 
        task: true,
        applicant: true
      }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verify that the current user is either the task creator or the applicant
    const isTaskCreator = application.task.creatorId === user.id
    const isApplicant = application.applicantId === user.id
    
    if (!isTaskCreator && !isApplicant) {
      return NextResponse.json({ error: 'Unauthorized to manage this application' }, { status: 403 })
    }

    // Prevent changes on completed tasks
    if ((application.task as any).completedAt) {
      return NextResponse.json({ error: 'Cannot modify applications on a completed task' }, { status: 400 })
    }

    const body = await req.json()
    const { status } = body

    if (!['accepted', 'declined', 'removed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Only the task creator can accept or remove an application
    if ((status === 'accepted' || status === 'removed') && !isTaskCreator) {
      return NextResponse.json({ error: 'Only the task creator can accept or remove applications' }, { status: 403 })
    }

    // Perform updates in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // If removing an accepted applicant
      if (status === 'removed') {
        const updated = await tx.application.update({
          where: { id: params.id },
          data: { 
            status: 'removed',
            removedAt: new Date()
          }
        })

        // Re-open the task for applications
        await tx.task.update({ where: { id: application.taskId }, data: { isOpen: true } })

        // Notify the removed applicant
        await tx.notification.create({
          data: {
            userId: application.applicantId,
            type: 'application_removed',
            content: `You have been removed from the task "${application.task.title}". The task is now open for other applicants.`,
            taskId: application.taskId,
            applicationId: application.id
          }
        })

        return updated
      }
      
      // If accepting, close the task but don't decline others (keep them as pending alternatives)
      if (status === 'accepted') {
        // Update this application to accepted
        const updated = await tx.application.update({
          where: { id: params.id },
          data: { 
            status: 'accepted',
            selectedAt: new Date()
          }
        })

        // Close the task for further applications
        await tx.task.update({ where: { id: application.taskId }, data: { isOpen: false } })

        // Notify the accepted applicant
        await tx.notification.create({
          data: {
            userId: application.applicantId,
            type: 'application_accepted',
            content: `Your application for "${application.task.title}" has been accepted!`,
            taskId: application.taskId,
            applicationId: application.id
          }
        })

        return updated
      } else {
        // Decline this application
        const updated = await tx.application.update({
          where: { id: params.id },
          data: { status: 'declined' }
        })

        await tx.notification.create({
          data: {
            userId: application.applicantId,
            type: 'application_declined',
            content: `Your application for "${application.task.title}" was declined.`,
            taskId: application.taskId,
            applicationId: application.id
          }
        })

        return updated
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}
