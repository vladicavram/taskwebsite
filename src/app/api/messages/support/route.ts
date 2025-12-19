import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject, content } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Find the sender
    const sender = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!sender) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find ALL admin users
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { isAdmin: true }
        ]
      }
    })

    if (admins.length === 0) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Create the support message
    const messageContent = subject 
      ? `[SUPPORT REQUEST]\nSubject: ${subject}\n\n${content}`
      : `[SUPPORT REQUEST]\n\n${content}`

    // Create messages and notifications for ALL admins
    await Promise.all(admins.map(async (admin) => {
      // Create message
      await prisma.message.create({
        data: {
          senderId: sender.id,
          receiverId: admin.id,
          content: messageContent
        }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'message',
          content: `New support request from ${sender.name || sender.email}: ${subject || 'No subject'}`
        }
      })
    }))

    // Return success with first admin's message for backwards compatibility
    const message = { success: true }

    return NextResponse.json({ success: true, message })
  } catch (error: any) {
    console.error('Support message error:', error)
    const errorMessage = error?.message || 'Failed to send support message'
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
}
