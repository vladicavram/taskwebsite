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

    // Use the logged-in user as the applicant by default (do not trust provided userId)
    const applicant = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!applicant) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await req.json()
    // The front-end sometimes posts { userId } when the task creator is creating a task and hiring someone.
    // Allow this only when the logged-in user is the task creator for the provided taskId — create an application
    // on behalf of that hired user without deducting credits (the hired worker will accept later and be charged).
    const { taskId, proposedPrice, message, userId: offeredUserId } = body
    if (!taskId) return NextResponse.json({ error: 'Task ID required' }, { status: 400 })

    // Fetch task and basic guards
    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { creator: true } })
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    if (task.creatorId === applicant.id) return NextResponse.json({ error: 'You cannot apply to your own task' }, { status: 400 })
    if ((task as any).completedAt) return NextResponse.json({ error: 'Cannot apply to a completed task' }, { status: 400 })

    // If the logged-in user is the task creator and passed an offeredUserId, allow creating an
    // application record on behalf of that offered user (this is used by the create-task -> hire flow).
    if (offeredUserId && task.creatorId === applicant.id) {
      // Ensure we don't overwrite existing active application for that user
      const existingForOffered = await prisma.application.findUnique({
        where: { taskId_applicantId: { taskId, applicantId: offeredUserId } }
      })
      if (existingForOffered && existingForOffered.status !== 'declined' && existingForOffered.status !== 'removed') {
        return NextResponse.json({ error: 'The offered user already has an application for this task' }, { status: 400 })
      }

      const application = await prisma.application.create({
        data: {
          taskId,
          applicantId: offeredUserId,
          proposedPrice: typeof proposedPrice === 'number' && proposedPrice > 0 ? proposedPrice : task.price || null,
          message: message || null,
          lastProposedBy: applicant.id,
          status: 'pending'
        }
      })

      await prisma.notification.create({
        data: {
          userId: offeredUserId,
          type: 'hire_request',
          taskId,
          applicationId: application.id,
          content: `You received a job offer: ${task.title}`
        }
      })

      return NextResponse.json(application)
    }

    // Normal applicant-driven application flow: ensure the user hasn't already applied
    // If direct-hire, block other users from creating applications
    if ((task as any).isDirectHire === true) {
      const activeForTask = await prisma.application.findFirst({ where: { taskId, status: { in: ['pending', 'accepted'] } } })
      if (activeForTask && activeForTask.applicantId !== applicant.id) {
        return NextResponse.json({ error: 'This task is a direct hire request and you are not the hired worker' }, { status: 403 })
      }
    }

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

    // Create application and deduct credits in a transaction (mirrors /tasks/[id]/apply behavior)
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
