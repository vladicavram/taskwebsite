import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { from, description, usernameOrEmail } = await req.json()
    if (!from || !description || !usernameOrEmail) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    // Find admin users
    const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'moderator'] } } })
    // Send notification to all admins
    await Promise.all(admins.map(admin =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'blocked_user_contact',
          content: `Blocked user (${usernameOrEmail}) message from ${from}: ${description}`
        }
      })
    ))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
