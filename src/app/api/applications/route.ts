import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use the logged-in user as the applicant (do not trust provided userId)
    const applicant = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!applicant) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await req.json()
    const { taskId, proposedPrice, message } = body
    if (!taskId) return NextResponse.json({ error: 'Task ID required' }, { status: 400 })

    // Fetch task and basic guards
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { creator: true } })
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    if (task.creatorId === applicant.id) return NextResponse.json({ error: 'You cannot apply to your own task' }, { status: 400 })
    if ((task as any).completedAt) return NextResponse.json({ error: 'Cannot apply to a completed task' }, { status: 400 })

    // If direct-hire, block other users from creating applications (only the hired worker should have the pending application)
    if ((task as any).isDirectHire === true) {
      const activeForTask = await prisma.application.findFirst({ where: { taskId, status: { in: ['pending', 'accepted'] } } })
      if (activeForTask && activeForTask.applicantId !== applicant.id) {
        return NextResponse.json({ error: 'This task is a direct hire request and you are not the hired worker' }, { status: 403 })
      }
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: { taskId_applicantId: { taskId, applicantId: applicant.id } }
    })
    if (existingApplication && existingApplication.status !== 'declined' && existingApplication.status !== 'removed') {
      return NextResponse.json({ error: 'You have already applied to this task' }, { status: 400 })
    }

    // Determine effective price and required credits
    const effectivePrice = typeof proposedPrice === 'number' && proposedPrice > 0 ? proposedPrice : (task.price || 0)
    const requiredCredits = effectivePrice / 100

    // Check credits
    if (applicant.credits < requiredCredits) {
      return NextResponse.json({ error: `Insufficient credits. Required ${requiredCredits.toFixed(2)}, you have ${applicant.credits}.` }, { status: 400 })
    }

    // Create application and deduct credits in a transaction (mirrors /apply behavior)
    const application = await prisma.$transaction(async (tx: any) => {
      const freshUser = await tx.user.findUnique({ where: { id: applicant.id } })
      if (!freshUser || freshUser.credits < requiredCredits) throw new Error('Insufficient credits')
      await tx.user.update({ where: { id: applicant.id }, data: { credits: { decrement: requiredCredits } } })
      return await tx.application.create({
        data: {
          taskId,
          applicantId: applicant.id,
          proposedPrice: effectivePrice || null,
          message: message || null,
          lastProposedBy: applicant.id,
          status: 'pending'
        }
      })
    })

    // Create notification for applicant
    await prisma.notification.create({
      data: {
        userId: applicant.id,
        type: 'application_received',
        taskId,
        applicationId: application.id,
        content: `Your application for "${task.title}" was submitted.`
      }
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error creating application:', error)
    const message = (error as any)?.message || 'Failed to create application'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
