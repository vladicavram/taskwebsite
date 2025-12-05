import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { requireModerator } from '../../../../../lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireModerator()
    
    const body = await req.json()
    const { name, email, username, credits, isAdmin, role, blocked, canApply } = body
    
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        username: username || null,
        credits,
        isAdmin,
        role: role || 'user',
        blocked: blocked === undefined ? undefined : !!blocked,
        canApply: canApply === undefined ? undefined : !!canApply
      }
    })
    
    return NextResponse.json(user)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireModerator()
    
    const userId = params.id
    
    // Delete related data in correct order to avoid foreign key constraints
    // 1. Delete notifications
    await prisma.notification.deleteMany({ where: { userId } })
    
    // 2. Delete messages where user is sender or receiver
    await prisma.message.deleteMany({ 
      where: { OR: [{ senderId: userId }, { receiverId: userId }] }
    })
    
    // 3. Delete credit transactions
    await prisma.creditTransaction.deleteMany({ where: { userId } })
    
    // 4. Delete reviews (authored and received)
    await prisma.review.deleteMany({ 
      where: { OR: [{ authorId: userId }, { recipientId: userId }] }
    })
    
    // 5. Delete applications
    await prisma.application.deleteMany({ where: { applicantId: userId } })
    
    // 6. Delete notifications for user's tasks, then applications on user's tasks
    const userTasks = await prisma.task.findMany({ 
      where: { creatorId: userId },
      select: { id: true }
    })
    const taskIds = userTasks.map(t => t.id)
    
    if (taskIds.length > 0) {
      await prisma.notification.deleteMany({ where: { taskId: { in: taskIds } } })
      await prisma.application.deleteMany({ where: { taskId: { in: taskIds } } })
      await prisma.review.deleteMany({ where: { taskId: { in: taskIds } } })
    }
    
    // 7. Delete user's tasks
    await prisma.task.deleteMany({ where: { creatorId: userId } })
    
    // 8. Delete profile
    await prisma.profile.deleteMany({ where: { userId } })
    
    // 9. Finally delete the user
    await prisma.user.delete({ where: { id: userId } })
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete user error:', err)
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 400 })
  }
}
