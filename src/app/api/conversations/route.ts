import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
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

    // Get all unique conversations (applications where user is involved)
    const applications = await prisma.application.findMany({
      where: {
        status: 'accepted',
        OR: [
          { applicantId: user.id },
          { task: { creatorId: user.id } }
        ]
      },
      include: {
        task: {
          include: {
            creator: true
          }
        },
        applicant: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Get direct messages (support messages without applicationId)
    const directMessages = await prisma.message.findMany({
      where: {
        applicationId: null,
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group direct messages by conversation partner
    const directConversations = new Map()
    for (const msg of directMessages) {
      const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId
      if (!directConversations.has(partnerId)) {
        directConversations.set(partnerId, {
          partner: msg.senderId === user.id ? msg.receiver : msg.sender,
          messages: [msg],
          lastMessage: msg
        })
      } else {
        directConversations.get(partnerId).messages.push(msg)
      }
    }

    // Get unread message count for each conversation
    const conversationsWithUnread = await Promise.all(
      applications.map(async (app: any) => {
        const unreadCount = await prisma.message.count({
          where: {
            applicationId: app.id,
            receiverId: user.id,
            read: false
          }
        })

        const lastMessage = await prisma.message.findFirst({
          where: { applicationId: app.id },
          orderBy: { createdAt: 'desc' }
        })

        return {
          type: 'task',
          application: app,
          unreadCount,
          lastMessage
        }
      })
    )

    // Add direct conversations
    const directConversationsWithUnread = await Promise.all(
      Array.from(directConversations.values()).map(async (conv: any) => {
        const unreadCount = await prisma.message.count({
          where: {
            applicationId: null,
            senderId: conv.partner.id,
            receiverId: user.id,
            read: false
          }
        })

        return {
          type: 'direct',
          partner: conv.partner,
          unreadCount,
          lastMessage: conv.lastMessage
        }
      })
    )

    // Combine and sort by last message time
    const allConversations = [...conversationsWithUnread, ...directConversationsWithUnread]
      .sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || 0
        const bTime = b.lastMessage?.createdAt || 0
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })

    return NextResponse.json(allConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
