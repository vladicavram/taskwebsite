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
      // Allow applicants to send lower offers without forcing an immediate credit charge.
      // If the applicant is increasing the price above the previous price and additional credits are needed,
      // require funds. If they're decreasing, allow and refund any previously charged amount.
      const prevPrice = application.proposedPrice ?? application.task.price ?? 0
      const prevDeducted = application.lastProposedBy === application.applicantId
      const prevCredits = Math.max(1, (prevPrice || 0) / 100)
      const newCredits = Math.max(1, newPrice / 100)
      const prevCharged = (application as any).chargedCredits ?? (prevDeducted ? prevCredits : 0)

      const updatedApplication = await prisma.$transaction(async (tx: any) => {
        // If applicant is lowering the price, allow it and refund any overcharged amount
        if (newPrice < prevPrice) {
          if (prevCharged > newCredits) {
            const refund = prevCharged - newCredits
            await tx.user.update({ where: { id: user.id }, data: { credits: { increment: refund } } })
            await tx.application.update({ where: { id: params.id }, data: { chargedCredits: newCredits } })
          }
        } else if (newPrice > prevPrice) {
          // Increasing price: require additional credits (delta)
          const delta = newCredits - (prevCharged || prevCredits)
          if (delta > 0) {
            const freshUser = await tx.user.findUnique({ where: { id: user.id } })
            if (!freshUser || freshUser.credits < delta) {
              throw new Error(`Insufficient credits. Need additional ${delta.toFixed(2)} credits.`)
            }
            await tx.user.update({ where: { id: user.id }, data: { credits: { decrement: delta } } })
            await tx.application.update({ where: { id: params.id }, data: { chargedCredits: (prevCharged || prevCredits) + delta } })
          }
        }

        // Update application with new proposed price and mark lastProposedBy as applicant
        return await tx.application.update({
          where: { id: params.id },
          data: {
            proposedPrice: newPrice,
            lastProposedBy: user.id
          }
        })
      })

    if (isApplicant) {
      // Compute credit amounts with minimum 1 credit rule
      const prevPrice = application.proposedPrice ?? application.task.price ?? 0
      const prevDeducted = application.lastProposedBy === application.applicantId
      const prevCredits = Math.max(1, (prevPrice || 0) / 100)
      const newCredits = Math.max(1, newPrice / 100)
      // Track previously charged credits (new schema field `chargedCredits`)
      const prevCharged = (application as any).chargedCredits ?? (prevDeducted ? prevCredits : 0)

      const updatedApplication = await prisma.$transaction(async (tx: any) => {
        // If previous credits were deducted by applicant, compute delta; else charge full newCredits
        if (prevDeducted) {
          // Use previously charged amount (if available) to compute delta
          const delta = newCredits - (prevCharged || prevCredits)
          if (delta > 0) {
            // Need to deduct additional credits
            const freshUser = await tx.user.findUnique({ where: { id: user.id } })
            if (!freshUser || freshUser.credits < delta) {
              throw new Error(`Insufficient credits. Need additional ${delta.toFixed(2)} credits.`)
            }
            await tx.user.update({ where: { id: user.id }, data: { credits: { decrement: delta } } })
            // update chargedCredits to reflect additional amount charged
            await tx.application.update({ where: { id: params.id }, data: { chargedCredits: (prevCharged || prevCredits) + delta } })
          } else if (delta < 0) {
            // Refund the difference and reduce chargedCredits
            await tx.user.update({ where: { id: user.id }, data: { credits: { increment: -delta } } })
            await tx.application.update({ where: { id: params.id }, data: { chargedCredits: Math.max(0, (prevCharged || prevCredits) + delta) } })
          }
        } else {
          // Previous credits were not deducted (e.g., creator-created offer) — charge full newCredits now
          const freshUser = await tx.user.findUnique({ where: { id: user.id } })
          if (!freshUser || freshUser.credits < newCredits) {
            throw new Error(`Insufficient credits. Required ${newCredits.toFixed(2)}, you have ${freshUser?.credits || 0}.`)
          }
          await tx.user.update({ where: { id: user.id }, data: { credits: { decrement: newCredits } } })
          // record chargedCredits on application
          await tx.application.update({ where: { id: params.id }, data: { chargedCredits: newCredits } })
        }

        // Update application with new proposed price and mark lastProposedBy as applicant
        return await tx.application.update({
          where: { id: params.id },
          data: {
            proposedPrice: newPrice,
            lastProposedBy: user.id
          }
        })
      })

      // Create notification for the other party
      const recipientId = application.task.creatorId
      const senderName = user.name || user.email
      const notificationContent = `${senderName} proposed a price of ${newPrice} MDL for "${application.task.title}"`

      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'price_counter_offer',
          content: notificationContent,
          taskId: application.taskId,
          applicationId: application.id
        }
      })

      return NextResponse.json(updatedApplication)
    }

    // If creator is making a counter-offer, just update price (no credits adjustments)
    if (isCreator) {
      const updatedApplication = await prisma.application.update({
        where: { id: params.id },
        data: {
          proposedPrice: newPrice,
          lastProposedBy: user.id
        }
      })

      const recipientId = application.applicantId
      const senderName = user.name || user.email
      const notificationContent = `${senderName} proposed a counter-offer of ${newPrice} MDL for "${application.task.title}"`

      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'price_counter_offer',
          content: notificationContent,
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
