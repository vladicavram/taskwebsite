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

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await req.json()
    const { taskId } = body
    if (!taskId) return NextResponse.json({ error: 'taskId required' }, { status: 400 })

    const existing = await prisma.application.findUnique({
      where: { taskId_applicantId: { taskId, applicantId: user.id } }
    })
    console.log('[APPLICATIONS/CHECK] user=', user.email, 'taskId=', taskId, 'found=', !!existing, existing?.status)

    if (!existing) {
      return NextResponse.json({ exists: false })
    }

    // Consider active if not declined/removed
    const active = existing.status === 'pending' || existing.status === 'accepted'
    return NextResponse.json({ exists: active, status: existing.status })
  } catch (error) {
    console.error('Application check error:', error)
    return NextResponse.json({ error: 'Failed to check application' }, { status: 500 })
  }
}
