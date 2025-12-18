import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../lib/prisma'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id }
    })
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json(task)
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PUT(
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

    const existing = await prisma.task.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    if (existing.creatorId !== user.id) {
      return NextResponse.json({ error: 'Only the creator can update this task' }, { status: 403 })
    }
    if (existing.completedAt) {
      return NextResponse.json({ error: 'Cannot edit a completed task' }, { status: 400 })
    }

    const body = await req.json()
    const { title, description, price, location, categoryId, isOpen } = body

    if (!title || !description || !location) {
      return NextResponse.json({ error: 'Title, description, and location are required' }, { status: 400 })
    }

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        title,
        description,
        price: price === null || price === undefined ? null : parseFloat(price),
        location,
        categoryId: categoryId || null,
        isOpen: typeof isOpen === 'boolean' ? isOpen : existing.isOpen
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Task update error:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
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

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: params.id }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify that the current user is the task creator
    if (task.creatorId !== user.id) {
      return NextResponse.json({ error: 'Only the task creator can delete this task' }, { status: 403 })
    }

    // Prevent deleting completed tasks
    if (task.completedAt) {
      return NextResponse.json({ error: 'Cannot delete a completed task' }, { status: 400 })
    }

    // Get all applications for this task to refund credits
    const applications = await prisma.application.findMany({
      where: { taskId: params.id },
      include: { applicant: true }
    })

    // Refund credits to applicants with pending or accepted applications
    const refundPromises = applications
      .filter(app => app.status === 'pending' || app.status === 'accepted')
      .map(async (app) => {
        const taskPrice = task.price || 0
        const refundAmount = taskPrice / 100 // Convert MDL to credits
        
        const oldCredits = app.applicant.credits
        const newCredits = oldCredits + refundAmount

        await prisma.user.update({
          where: { id: app.applicant.id },
          data: { credits: newCredits }
        })

        console.log(`[TASK DELETION REFUND] User ${app.applicant.email}: ${oldCredits.toFixed(1)} credits + ${refundAmount.toFixed(1)} = ${newCredits.toFixed(1)} credits (task "${task.title}" deleted)`)
      })

    await Promise.all(refundPromises)

    // Delete related records
    await prisma.notification.deleteMany({
      where: { taskId: params.id }
    })

    await prisma.application.deleteMany({
      where: { taskId: params.id }
    })

    await prisma.review.deleteMany({
      where: { taskId: params.id }
    })

    // Delete the task
    await prisma.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Task deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
