import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Get messages for a specific application/task or partner (direct message)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const applicationId = searchParams.get('applicationId')
  const partnerId = searchParams.get('partnerId')

  if (!applicationId && !partnerId) {
    return NextResponse.json({ error: 'Application ID or Partner ID required' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let messages
    if (applicationId) {
      // Get messages for task-based conversation
      messages = await prisma.message.findMany({
        where: { applicationId },
        orderBy: { createdAt: 'asc' }
      })

      // Mark messages as read if user is receiver
      await prisma.message.updateMany({
        where: {
          applicationId,
          receiverId: user.id,
          read: false
        },
        data: { read: true }
      })
    } else if (partnerId) {
      // Get direct messages with this partner
      messages = await prisma.message.findMany({
        where: {
          applicationId: null,
          OR: [
            { senderId: user.id, receiverId: partnerId },
            { senderId: partnerId, receiverId: user.id }
          ]
        },
        orderBy: { createdAt: 'asc' }
      })

      // Mark messages from partner as read
      await prisma.message.updateMany({
        where: {
          applicationId: null,
          senderId: partnerId,
          receiverId: user.id,
          read: false
        },
        data: { read: true }
      })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// Send a message
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { content, receiverId, taskId, applicationId } = await req.json()

    if (!content || !receiverId) {
      return NextResponse.json({ error: 'Content and receiverId required' }, { status: 400 })
    }

    // For task-based messages, taskId and applicationId are required
    // For direct messages, they can be null
    const isDirectMessage = !taskId && !applicationId

    const message = await prisma.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId,
        taskId: taskId || null,
        applicationId: applicationId || null
      }
    })

    // Create notification for receiver - REMOVED, only show unread count in message icon
    // await prisma.notification.create({
    //   data: {
    //     userId: receiverId,
    //     type: 'message',
    //     content: `New message from ${user.name || user.email}`,
    //     taskId: taskId || null
    //   }
    // })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

// Mark messages as read
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { applicationId, partnerId, markAllRead } = await req.json()

    if (!markAllRead) {
      return NextResponse.json({ error: 'markAllRead flag required' }, { status: 400 })
    }

    if (applicationId) {
      // Mark all messages in this application as read
      await prisma.message.updateMany({
        where: {
          applicationId,
          receiverId: user.id,
          read: false
        },
        data: { read: true }
      })
    } else if (partnerId) {
      // Mark all direct messages from this partner as read
      await prisma.message.updateMany({
        where: {
          applicationId: null,
          senderId: partnerId,
          receiverId: user.id,
          read: false
        },
        data: { read: true }
      })
    } else {
      return NextResponse.json({ error: 'applicationId or partnerId required' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
  }
}

