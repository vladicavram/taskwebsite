import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/authOptions'
import { prisma } from '../../../lib/prisma'

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
          application: app,
          unreadCount,
          lastMessage
        }
      })
    )

    return NextResponse.json(conversationsWithUnread)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
