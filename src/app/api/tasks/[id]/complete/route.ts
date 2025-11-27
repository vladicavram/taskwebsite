import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../../lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        creator: true,
        applications: { include: { applicant: true } }
      }
    })

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const accepted = task.applications.filter((a: any) => a.status === 'accepted')
    if (accepted.length === 0) {
      return NextResponse.json({ error: 'Task has no accepted applicants' }, { status: 400 })
    }

    if (task.completedAt) {
      return NextResponse.json({ error: 'Task already completed' }, { status: 400 })
    }

    // Only creator or accepted applicants may mark complete
    const isCreator = task.creatorId === user.id
    const isAcceptedApplicant = accepted.some((a: any) => a.applicantId === user.id)
    if (!isCreator && !isAcceptedApplicant) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const updatedTask = await tx.task.update({
        where: { id: task.id },
        data: { completedAt: new Date() }
      })

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { credits: { increment: 0.1 } }
      })

      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: 0.1,
          type: 'reward',
          description: `Completion reward for task ${task.title}`,
          relatedTaskId: task.id
        }
      })

      return { updatedTask, credits: updatedUser.credits }
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Complete task error:', error)
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 })
  }
}
