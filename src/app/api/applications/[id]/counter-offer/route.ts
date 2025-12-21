export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../../lib/prisma'

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
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: { task: { include: { creator: true } }, applicant: true }
    })

    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    const isCreator = application.task.creatorId === user.id
    const isApplicant = application.applicantId === user.id

    if (!isCreator && !isApplicant) {
      return NextResponse.json({ error: 'Unauthorized to modify this application' }, { status: 403 })
    }

    const body = await req.json()
    const { proposedPrice } = body

    if (!proposedPrice || proposedPrice <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    const newPrice = parseFloat(proposedPrice)

    // Applicant flow: allow lowering without charging, require funds when increasing
    if (isApplicant) {
      const prevPrice = application.proposedPrice ?? application.task.price ?? 0
      const prevCredits = Math.max(1, (prevPrice || 0) / 100)
      const newCredits = Math.max(1, newPrice / 100)
      // Only consider previously recorded chargedCredits as reserved funds.
      // Do NOT assume a previous deduction based on who proposed the price — that could lead to incorrect refunds.
      const prevCharged = (application as any).chargedCredits ?? 0

      const updatedApplication = await prisma.$transaction(async (tx: any) => {
        if (newPrice < prevPrice) {
          // Lowering: refund any overcharged amount
          if (prevCharged > newCredits) {
            const refund = prevCharged - newCredits
            await tx.user.update({ where: { id: user.id }, data: { credits: { increment: refund } } })
            await tx.application.update({ where: { id: params.id }, data: { chargedCredits: newCredits } })
          }
        } else if (newPrice > prevPrice) {
          // Increasing: require additional funds for the delta. Only use previously recorded charged amount.
          const delta = newCredits - prevCharged
          if (delta > 0) {
            const freshUser = await tx.user.findUnique({ where: { id: user.id } })
            if (!freshUser || freshUser.credits < delta) {
              throw new Error(`Insufficient credits. Need additional ${delta.toFixed(2)} credits.`)
            }
            // Conditional update to avoid overdrawing in races
            const updated: any = await tx.$queryRaw`
              UPDATE "User" SET credits = credits - ${delta}
              WHERE id = ${user.id} AND credits >= ${delta}
              RETURNING credits
            `
            if (!updated || updated.length === 0) {
              throw new Error(`Insufficient credits. Need additional ${delta.toFixed(2)} credits.`)
            }
            await tx.application.update({ where: { id: params.id }, data: { chargedCredits: prevCharged + delta } })
          }
        }

        return await tx.application.update({
          where: { id: params.id },
          data: { proposedPrice: newPrice, lastProposedBy: user.id }
        })
      })

      // Notify creator
      await prisma.notification.create({
        data: {
          userId: application.task.creatorId,
          type: 'price_counter_offer',
          content: `${user.name || user.email} proposed a price of ${newPrice} MDL for "${application.task.title}"`,
          taskId: application.taskId,
          applicationId: application.id
        }
      })

      return NextResponse.json(updatedApplication)
    }

    // Creator flow: just update proposed price
    if (isCreator) {
      const updatedApplication = await prisma.application.update({
        where: { id: params.id },
        data: { proposedPrice: newPrice, lastProposedBy: user.id }
      })

      await prisma.notification.create({
        data: {
          userId: application.applicantId,
          type: 'price_counter_offer',
          content: `${user.name || user.email} proposed a counter-offer of ${newPrice} MDL for "${application.task.title}"`,
          taskId: application.taskId,
          applicationId: application.id
        }
      })

      return NextResponse.json(updatedApplication)
    }

    return NextResponse.json({ error: 'Unauthorized to modify this application' }, { status: 403 })
  } catch (error) {
    console.error('Counter-offer error:', error)
    const message = (error as any)?.message || 'Failed to send counter-offer'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
