import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../../lib/prisma'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - please log in' }, { status: 401 })
    }

    const applicant = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    })
    
    if (!applicant) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the task and check if user is trying to apply to their own task
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { creator: true }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.creatorId === applicant.id) {
      return NextResponse.json({ error: 'You cannot apply to your own task' }, { status: 400 })
    }

    // Prevent applying to completed tasks
    if ((task as any).completedAt) {
      return NextResponse.json({ error: 'Cannot apply to a completed task' }, { status: 400 })
    }

    // Defensive: If this is a direct-hire task, only the hired worker (the existing application applicant)
    // should be allowed to interact with it. Block other users from creating new applications for this task.
    if ((task as any).isDirectHire === true) {
      // Find any existing active application for this task
      const activeForTask = await prisma.application.findFirst({
        where: { taskId: params.id, status: { in: ['pending', 'accepted'] } }
      })

      // If there's an active application and it's for a different user, block applying
      if (activeForTask && activeForTask.applicantId !== applicant.id) {
        return NextResponse.json({ error: 'This task is a direct hire request and you are not the hired worker' }, { status: 403 })
      }
    }

    const body = await req.json()
    const { message, agree, agreementText } = body
    if (process.env.NODE_ENV !== 'production') {
      console.log('[APPLY] Incoming body', { message, agree, agreementTextLen: agreementText?.length })
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        taskId_applicantId: {
          taskId: params.id,
          applicantId: applicant.id
        }
      }
    })

    // Allow reapplying if previous application was declined or removed
    if (existingApplication && existingApplication.status !== 'declined' && existingApplication.status !== 'removed') {
      return NextResponse.json({ error: 'You have already applied to this task' }, { status: 400 })
    }

    // If reapplying, delete the old declined/removed application
    if (existingApplication) {
      await prisma.application.delete({
        where: { id: existingApplication.id }
      })
    }

    if (!agree || !agreementText || agreementText.trim().length < 10) {
      return NextResponse.json({ error: 'Agreement acceptance and contract text are required' }, { status: 400 })
    }

    // Use task price directly - credit calculation based on task price
    const effectivePrice = task.price || 0
    const requiredCredits = effectivePrice <= 100 ? 1 : Math.max(1, effectivePrice / 100)
    
    console.log('[APPLY] Credit check:', { 
      applicantEmail: applicant.email, 
      currentCredits: applicant.credits, 
      requiredCredits, 
      effectivePrice 
    })
    
    if (applicant.credits < requiredCredits) {
      return NextResponse.json({ error: `Insufficient credits. Required ${requiredCredits.toFixed(2)}, you have ${applicant.credits}.` }, { status: 400 })
    }

    // Create application and deduct credits in a transaction
    const application = await prisma.$transaction(async (tx: any) => {
      // Re-check credits within transaction to prevent race conditions
      const freshUser = await tx.user.findUnique({ where: { id: applicant.id } })
      if (!freshUser || freshUser.credits < requiredCredits) {
        throw new Error(`Insufficient credits. Required ${requiredCredits.toFixed(2)}, you have ${freshUser?.credits || 0}.`)
      }

      // Deduct credits from applicant (minimum 1 credit)
      const updatedUser = await tx.user.update({
        where: { id: applicant.id },
        data: { credits: { decrement: requiredCredits } }
      })
      
      console.log('[APPLY] Credits deducted:', { 
        previousCredits: applicant.credits, 
        deducted: requiredCredits, 
        newCredits: updatedUser.credits 
      })

      // Create application
      return await tx.application.create({
        data: {
          taskId: params.id,
          applicantId: applicant.id,
          message: message || null,
          proposedPrice: effectivePrice || null,
          lastProposedBy: applicant.id,
          status: 'pending'
        }
      })
    })

    // Attempt raw SQL update to set agreement fields if columns exist
    try {
      // Using parameterized raw query for safety
      await prisma.$executeRawUnsafe(
        `UPDATE "Application" SET "agreementText" = $1, "agreementAcceptedAt" = $2 WHERE id = $3`,
        agreementText,
        new Date(),
        application.id
      )
    } catch (e) {
      console.warn('[APPLY] Could not set agreementText via raw SQL:', e)
    }

    // Create notification for task creator
    await prisma.notification.create({
      data: {
        userId: task.creatorId,
        type: 'application_received',
        content: `${applicant.name || applicant.email} applied to your task "${task.title}"`,
        taskId: task.id,
        applicationId: application.id
      }
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Application error:', error)
    const message = (error as any)?.message || 'Failed to submit application'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
