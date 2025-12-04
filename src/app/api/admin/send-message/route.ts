import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { requireModerator } from '../../../../lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    await requireModerator()
    
    const body = await req.json()
    const { userId, message } = body
    
    if (!userId || !message) {
      return NextResponse.json({ error: 'User ID and message are required' }, { status: 400 })
    }
    
    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId,
        type: 'admin_message',
        content: `Admin message: ${message}`,
        read: false
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send message' }, { status: 400 })
  }
}
