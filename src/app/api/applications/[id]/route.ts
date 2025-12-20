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


    // Only the task creator can accept or remove an application, except:
    // - For direct-hire tasks the hired applicant must be the one to accept (creator cannot accept on their behalf).
    // - The task creator is still allowed to remove applications.
    const isDirectHire = application.task.isDirectHire === true;
    if (status === 'accepted') {
      if (isDirectHire) {
        // For direct hires only the applicant may accept
        if (!isApplicant) {
          return NextResponse.json({ error: 'Only the hired applicant can accept direct-hire requests' }, { status: 403 })
        }
      } else {
        // For normal tasks only the creator can accept
        if (!isTaskCreator) {
          return NextResponse.json({ error: 'Only the task creator can accept applications' }, { status: 403 })
        }
      }
    } else if (status === 'removed') {
      // Only task creator can remove an application
      if (!isTaskCreator) {
        return NextResponse.json({ error: 'Only the task creator can remove applications' }, { status: 403 })
      }
    }

    // NOTE: credits are validated and charged inside the transaction below using the latest application state.

    // Perform updates in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Re-fetch the latest application inside the transaction to avoid race conditions
      const currentApp = await tx.application.findUnique({
        where: { id: params.id },
        include: { task: true }
      })

      if (!currentApp) throw new Error('Application not found inside transaction')

      // Calculate credits to refund (use chargedCredits if present, otherwise fallback to price/100)
      const priceBasedCredits = Math.max(1, ((currentApp.proposedPrice || currentApp.task.price || 0) / 100))
      const refundCredits = (currentApp as any).chargedCredits ?? priceBasedCredits

      console.log('[APP_UPDATE] Processing application status change:', {
        applicationId: params.id,
        currentStatus: currentApp.status,
        newStatus: status,
        proposedPrice: currentApp.proposedPrice,
        refundCredits,
        applicantId: currentApp.applicantId
      })

      // If removing an accepted applicant
      if (status === 'removed') {
        const updated = await tx.application.update({
          where: { id: params.id },
          data: { 
            status: 'removed',
            removedAt: new Date()
          }
        })

        // Only refund credits if the application was previously accepted or pending (credits were deducted)
        if (refundCredits > 0 && (application.status === 'accepted' || application.status === 'pending')) {
          const userBefore = await tx.user.findUnique({ where: { id: application.applicantId } })
          await tx.user.update({
            where: { id: application.applicantId },
            data: { credits: { increment: refundCredits } }
          })
          const userAfter = await tx.user.findUnique({ where: { id: application.applicantId } })
          console.log('[CREDIT_REFUND] Removed applicant:', {
            userId: application.applicantId,
            before: userBefore.credits,
            refunded: refundCredits,
            after: userAfter.credits
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
        // Recompute values from the transaction-scoped application
        const totalRequired = Math.max(1, (((currentApp.proposedPrice ?? currentApp.task.price) || 0) / 100))
        const alreadyCharged = (currentApp as any).chargedCredits ?? 0
        const deductRemaining = Math.max(0, totalRequired - alreadyCharged)

        // For direct hire, charge any remaining amount atomically; if applicant lacks funds, throw.
        if (isDirectHire) {
          const freshApplicant = await tx.user.findUnique({ where: { id: currentApp.applicantId } })
          if (!freshApplicant) throw new Error('Applicant not found')

          if (deductRemaining > 0) {
            if (freshApplicant.credits < deductRemaining) {
              throw new Error(`Insufficient credits. Required ${deductRemaining.toFixed(2)}, you have ${freshApplicant?.credits || 0}.`)
            }
            await tx.user.update({ where: { id: currentApp.applicantId }, data: { credits: { decrement: deductRemaining } } })
            // record chargedCredits on the application
            await tx.application.update({ where: { id: params.id }, data: { chargedCredits: alreadyCharged + deductRemaining } })
          }
        }

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

        console.log('[APP_ACCEPT] Refunding other applicants:', otherApplications.length)

        // Refund credits to all other pending applicants
          for (const otherApp of otherApplications) {
          const otherRefundCredits = Math.max(1, ((otherApp.proposedPrice || otherApp.task.price || 0) / 100))
          if (otherRefundCredits > 0) {
            const userBefore = await tx.user.findUnique({ where: { id: otherApp.applicantId } })
            await tx.user.update({
              where: { id: otherApp.applicantId },
              data: { credits: { increment: otherRefundCredits } }
            })
            const userAfter = await tx.user.findUnique({ where: { id: otherApp.applicantId } })
            console.log('[CREDIT_REFUND] Other applicant:', {
              userId: otherApp.applicantId,
              applicationId: otherApp.id,
              before: userBefore.credits,
              refunded: otherRefundCredits,
              after: userAfter.credits
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

        // Only refund credits if the application was pending (credits were deducted)
        if (refundCredits > 0 && application.status === 'pending') {
          const userBefore = await tx.user.findUnique({ where: { id: application.applicantId } })
          await tx.user.update({
            where: { id: application.applicantId },
            data: { credits: { increment: refundCredits } }
          })
          const userAfter = await tx.user.findUnique({ where: { id: application.applicantId } })
          console.log('[CREDIT_REFUND] Declined applicant:', {
            userId: application.applicantId,
            before: userBefore.credits,
            refunded: refundCredits,
            after: userAfter.credits
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
      // Calculate credits to refund (use chargedCredits if present, otherwise fallback to price/100 with minimum 1)
      const priceBased = Math.max(1, ((application.proposedPrice || application.task.price || 0) / 100))
      const refundCredits = (application as any).chargedCredits ?? priceBased

      console.log('[APP_CANCEL] User cancelling application:', {
        applicationId: params.id,
        userId: user.id,
        status: application.status,
        proposedPrice: application.proposedPrice,
        refundCredits
      })

      // Only refund if status is pending (credits were deducted)
      if (application.status !== 'pending') {
        throw new Error('Can only cancel pending applications')
      }

      // Get user's current credits before refund
      const userBefore = await tx.user.findUnique({ where: { id: user.id } })

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
        
        const userAfter = await tx.user.findUnique({ where: { id: user.id } })
        console.log('[CREDIT_REFUND] Cancelled application:', {
          userId: user.id,
          before: userBefore.credits,
          refunded: refundCredits,
          after: userAfter.credits
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
