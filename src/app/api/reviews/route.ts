import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/authOptions'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { recipientId, taskId, rating, comment } = body

    if (!recipientId || !taskId || !rating) {
      return NextResponse.json(
        { error: 'Recipient ID, task ID, and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if the task exists and user is involved
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        applications: {
          where: { status: 'accepted' }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify the user is either the task creator or an accepted applicant
    const acceptedApps = task.applications
    const isCreator = task.creatorId === currentUser.id
    const isApplicant = acceptedApps.some(app => app.applicantId === currentUser.id)

    if (!isCreator && !isApplicant) {
      return NextResponse.json(
        { error: 'You can only review users you\'ve worked with on this task' },
        { status: 403 }
      )
    }

    // Enforce accepted relationship for recipient as well
    if (isCreator) {
      // Creator can only review accepted applicants
      const isRecipientAcceptedApplicant = acceptedApps.some(app => app.applicantId === recipientId)
      if (!isRecipientAcceptedApplicant) {
        return NextResponse.json(
          { error: 'You can only review accepted applicants for this task' },
          { status: 403 }
        )
      }
    } else if (isApplicant) {
      // Accepted applicant can only review the creator
      if (recipientId !== task.creatorId) {
        return NextResponse.json(
          { error: 'You can only review the task creator for this task' },
          { status: 403 }
        )
      }
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        authorId_recipientId_taskId: {
          authorId: currentUser.id,
          recipientId,
          taskId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this user for this task' },
        { status: 400 }
      )
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        authorId: currentUser.id,
        recipientId,
        taskId,
        rating,
        comment: comment || null
      },
      include: {
        author: true,
        recipient: true,
        task: true
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get('taskId')

  if (taskId) {
    const reviews = await prisma.review.findMany({ 
      where: { taskId },
      include: {
        author: true,
        recipient: true,
        task: true
      }
    })
    return NextResponse.json(reviews)
  }

  const reviews = await prisma.review.findMany({ 
    take: 100,
    include: {
      author: true,
      recipient: true,
      task: true
    }
  })
  return NextResponse.json(reviews)
}
