import { NextResponse } from 'next/server'
import { prisma } from '../../../../../../lib/prisma'
import { requireModerator } from '../../../../../../lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireModerator()
    
    const userId = params.id
    
    // Fetch all messages where user is either sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(messages)
  } catch (err: any) {
    console.error('Failed to fetch user messages:', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch messages' }, { status: 400 })
  }
}
