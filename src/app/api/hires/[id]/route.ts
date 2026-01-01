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

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const application = await prisma.application.findUnique({ where: { id: params.id }, include: { task: true } })
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    const body = await req.json()
    const { status, confirm } = body

    if (!['accepted', 'declined', 'removed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const isTaskCreator = application.task.creatorId === user.id
    const isApplicant = application.applicantId === user.id

    // Authorization rules
    if (status === 'accepted') {
      // If the applicant last proposed a counter-offer, only the task creator may accept that counter-offer.
      // Otherwise, for direct hires, the applicant may accept; for normal tasks, the creator accepts.
      const lastProposedByApplicant = application.lastProposedBy === application.applicantId
      if (lastProposedByApplicant) {
        if (!isTaskCreator) return NextResponse.json({ error: 'Only the task creator can accept this counter-offer' }, { status: 403 })
      } else {
        if (application.task.isDirectHire === true) {
          if (!isApplicant) return NextResponse.json({ error: 'Only the hired applicant can accept direct-hire requests' }, { status: 403 })
        } else {
          if (!isTaskCreator) return NextResponse.json({ error: 'Only the task creator can accept applications' }, { status: 403 })
        }
      }
      if (!confirm) return NextResponse.json({ error: 'Missing confirmation for accept' }, { status: 400 })
    } else {
      // Decline/remove: only creator may perform
      if (!isTaskCreator) return NextResponse.json({ error: 'Only the task creator can decline or remove applications' }, { status: 403 })
    }

    // Perform transactional work
    const result = await prisma.$transaction(async (tx: any) => {
      const currentApp = await tx.application.findUnique({ where: { id: params.id }, include: { task: true } })
      if (!currentApp) throw new Error('Application not found inside transaction')

      // If accepting: perform atomic charge and set accepted
      if (status === 'accepted') {
        const totalRequired = Math.max(1, (((currentApp.proposedPrice ?? currentApp.task.price) || 0) / 100))
        const alreadyCharged = currentApp.chargedCredits ?? 0

        const freshApplicant = await tx.user.findUnique({ where: { id: currentApp.applicantId } })
        if (!freshApplicant) throw new Error('Applicant missing')

        const availableIncludingReserved = (freshApplicant.credits || 0) + (alreadyCharged || 0)

        // If applicant last proposed and had no reservation, require full wallet funds
        const lastProposedByApplicant = currentApp.lastProposedBy === currentApp.applicantId
        const hasReserved = (currentApp as any).chargedCredits && (currentApp as any).chargedCredits > 0
        if (lastProposedByApplicant && !hasReserved) {
          if ((freshApplicant.credits || 0) < totalRequired) throw new Error('Insufficient credits to accept counter-offer')
        } else {
          if (availableIncludingReserved < totalRequired) throw new Error('Insufficient credits')
        }

        const delta = totalRequired - (alreadyCharged || 0)
        if (delta > 0) {
          const rows: any = await tx.$queryRaw`
            UPDATE "User" SET credits = credits - ${delta}
            WHERE id = ${currentApp.applicantId} AND credits >= ${delta}
            RETURNING credits
          `
          if (!rows || rows.length === 0) throw new Error('Insufficient credits to complete acceptance')

          await tx.creditTransaction.create({ data: { userId: currentApp.applicantId, amount: delta, type: 'spent', description: `Charge for application ${currentApp.id} (accept)`, relatedTaskId: currentApp.taskId } })
        }

        // If delta < 0, refund the overcharged amount
        if (delta < 0) {
          await tx.user.update({ where: { id: currentApp.applicantId }, data: { credits: { increment: -delta } } })
          await tx.creditTransaction.create({ data: { userId: currentApp.applicantId, amount: -delta, type: 'refund', description: `Refund for application ${currentApp.id} (accept overcharge)`, relatedTaskId: currentApp.taskId } })
        }

        await tx.application.update({ where: { id: params.id }, data: { chargedCredits: totalRequired, status: 'accepted', selectedAt: new Date(), acceptedBy: user.id } })

        // Refund other pending applicants
        const otherApps = await tx.application.findMany({ where: { taskId: application.taskId, id: { not: params.id }, status: { in: ['pending','offered','counter_proposed'] } }, include: { task: true, applicant: true } })
        for (const oa of otherApps) {
          const otherRefundCredits = Math.max(1, ((oa.proposedPrice || oa.task?.price || 0) / 100))
          if (otherRefundCredits > 0) {
            await tx.user.update({ where: { id: oa.applicantId }, data: { credits: { increment: otherRefundCredits } } })
            await tx.creditTransaction.create({ data: { userId: oa.applicantId, amount: otherRefundCredits, type: 'refund', description: `Refund after selection of another applicant for ${oa.taskId}`, relatedTaskId: oa.taskId } })
          }
          await tx.notification.create({ data: { userId: oa.applicantId, type: 'application_declined', content: `Your application for "${application.task.title}" was not selected.`, taskId: application.taskId, applicationId: oa.id } })
        }

        await tx.task.update({ where: { id: application.taskId }, data: { isOpen: false } })

        await tx.notification.create({ data: { userId: currentApp.applicantId, type: 'application_accepted', content: `Your application for "${application.task.title}" has been accepted!`, taskId: application.taskId, applicationId: currentApp.id } })

        return { success: true }
      }

      // Decline: refund reserved credits if any
      if (status === 'declined' || status === 'removed') {
        const currentCharged = (currentApp as any).chargedCredits ?? 0
        const updated = await tx.application.update({ where: { id: params.id }, data: { status } })
        if (currentCharged > 0 && application.status !== 'accepted') {
          await tx.user.update({ where: { id: application.applicantId }, data: { credits: { increment: currentCharged } } })
          await tx.creditTransaction.create({ data: { userId: application.applicantId, amount: currentCharged, type: 'refund', description: `Refund for application ${application.id} after decline`, relatedTaskId: application.taskId } })
          await tx.application.update({ where: { id: params.id }, data: { chargedCredits: 0 } })
        }
        await tx.notification.create({ data: { userId: application.applicantId, type: 'application_declined', content: `Your application for "${application.task.title}" was declined.`, taskId: application.taskId, applicationId: application.id } })
        return updated
      }

      return NextResponse.json({ error: 'Unhandled status' }, { status: 400 })
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Hire update error:', error)
    return NextResponse.json({ error: (error as any)?.message || 'Failed to update hire' }, { status: 400 })
  }
}
