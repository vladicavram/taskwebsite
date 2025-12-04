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

    const body = await req.json()
    const { status } = body

    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Only the task creator can accept an application
    if (status === 'accepted' && !isTaskCreator) {
      return NextResponse.json({ error: 'Only the task creator can accept applications' }, { status: 403 })
    }

    // Perform updates in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // If accepting, close the task and decline others
      if (status === 'accepted') {
        // Update this application to accepted
        const updated = await tx.application.update({
          where: { id: params.id },
          data: { status: 'accepted' }
        })

        // Find other applications to decline
        const others = await tx.application.findMany({
          where: { taskId: application.taskId, id: { not: application.id }, status: { not: 'declined' } },
          select: { id: true, applicantId: true }
        })

        if (others.length > 0) {
          await tx.application.updateMany({
            where: { taskId: application.taskId, id: { not: application.id } },
            data: { status: 'declined' }
          })

          await tx.notification.createMany({
            data: others.map((o: any) => ({
              userId: o.applicantId,
              type: 'application_declined',
              content: `Your application for "${application.task.title}" was declined.`,
              taskId: application.taskId,
              applicationId: o.id
            }))
          })
        }

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
