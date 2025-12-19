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

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'admin' },
          { isAdmin: true }
        ]
      }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Create the support message
    const messageContent = subject 
      ? `[SUPPORT REQUEST]\nSubject: ${subject}\n\n${content}`
      : `[SUPPORT REQUEST]\n\n${content}`

    const message = await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: admin.id,
        content: messageContent
      }
    })

    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'message',
        content: `New support request from ${sender.name || sender.email}: ${subject || 'No subject'}`,
        link: `/messages`
      }
    })

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Support message error:', error)
    return NextResponse.json({ error: 'Failed to send support message' }, { status: 500 })
  }
}
