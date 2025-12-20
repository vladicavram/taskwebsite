import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../../lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ credits: user.credits ?? 0 })
  } catch (err) {
    console.error('Get user credits error:', err)
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
  }
}
