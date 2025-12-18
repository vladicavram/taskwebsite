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
      // Calculate credits to refund (price/100)
      const refundCredits = (application.proposedPrice || 0) / 100

      // If removing an accepted applicant
      if (status === 'removed') {
        const updated = await tx.application.update({
          where: { id: params.id },
          data: { 
            status: 'removed',
            removedAt: new Date()
          }
        })

        // Refund credits to the removed applicant
        if (refundCredits > 0) {
          await tx.user.update({
            where: { id: application.applicantId },
            data: { credits: { increment: refundCredits } }
          })
        }

        // Re-open the task for applications
        await tx.task.update({ where: { id: application.taskId }, data: { isOpen: true } })

        // Notify the removed applicant
        await tx.notification.create({
          data: {
            userId: application.applicantId,
            type: 'application_removed',
            content: `You have been removed from the task "${application.task.title}". The task is now open for other applicants.${refundCredits > 0 ? ` ${refundCredits.toFixed(2)} credits have been refunded.` : ''}`,
            taskId: application.taskId,
            applicationId: application.id
          }
        })

        return updated
      }
      
      // If accepting, close the task and refund credits to other pending applicants
      if (status === 'accepted') {
        // Update this application to accepted
        const updated = await tx.application.update({
          where: { id: params.id },
          data: { 
            status: 'accepted',
            selectedAt: new Date()
          }
        })

        // Get all other pending applications for this task
        const otherApplications = await tx.application.findMany({
          where: {
            taskId: application.taskId,
            id: { not: params.id },
            status: 'pending'
          },
          include: { applicant: true }
        })

        // Refund credits to all other pending applicants
        for (const otherApp of otherApplications) {
          const otherRefundCredits = (otherApp.proposedPrice || 0) / 100
          if (otherRefundCredits > 0) {
            await tx.user.update({
              where: { id: otherApp.applicantId },
              data: { credits: { increment: otherRefundCredits } }
            })
          }

          // Notify them that they were not selected and credits were refunded
          await tx.notification.create({
            data: {
              userId: otherApp.applicantId,
              type: 'application_declined',
              content: `Your application for "${application.task.title}" was not selected. Another applicant was chosen.${otherRefundCredits > 0 ? ` ${otherRefundCredits.toFixed(2)} credits have been refunded.` : ''}`,
              taskId: application.taskId,
              applicationId: otherApp.id
            }
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
        // Decline this application and refund credits
        const updated = await tx.application.update({
          where: { id: params.id },
          data: { status: 'declined' }
        })

        // Refund credits to the declined applicant
        if (refundCredits > 0) {
          await tx.user.update({
            where: { id: application.applicantId },
            data: { credits: { increment: refundCredits } }
          })
        }

        await tx.notification.create({
          data: {
            userId: application.applicantId,
            type: 'application_declined',
            content: `Your application for "${application.task.title}" was declined.${refundCredits > 0 ? ` ${refundCredits.toFixed(2)} credits have been refunded.` : ''}`,
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

export async function DELETE(
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

    // Only the applicant can cancel their own application
    if (application.applicantId !== user.id) {
      return NextResponse.json({ error: 'You can only cancel your own applications' }, { status: 403 })
    }

    // Can't cancel if already accepted
    if (application.status === 'accepted') {
      return NextResponse.json({ error: 'Cannot cancel an accepted application. Contact the task creator.' }, { status: 400 })
    }

    // Can't cancel if already cancelled/declined/removed
    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'This application has already been processed' }, { status: 400 })
    }

    // Prevent cancelling on completed tasks
    if ((application.task as any).completedAt) {
      return NextResponse.json({ error: 'Cannot cancel application on a completed task' }, { status: 400 })
    }

    // Delete the application and refund credits in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Calculate credits to refund (price/100)
      const refundCredits = (application.proposedPrice || 0) / 100

      // Delete the application
      await tx.application.delete({
        where: { id: params.id }
      })

      // Refund credits to the applicant
      if (refundCredits > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { credits: { increment: refundCredits } }
        })
      }

      // Notify the task creator
      await tx.notification.create({
        data: {
          userId: application.task.creatorId,
          type: 'application_declined',
          content: `${application.applicant.name || application.applicant.email} cancelled their application for \"${application.task.title}\".`,
          taskId: application.taskId
        }
      })
    })

    return NextResponse.json({ success: true, message: 'Application cancelled and credits refunded' })
  } catch (error) {
    console.error('Application delete error:', error)
    return NextResponse.json({ error: 'Failed to cancel application' }, { status: 500 })
  }
}
