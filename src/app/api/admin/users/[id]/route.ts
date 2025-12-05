import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { requireModerator } from '../../../../../lib/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireModerator()
    
    const body = await req.json()
    const { name, email, username, credits, isAdmin, role, blocked, canApply } = body
    
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        username: username || null,
        credits,
        isAdmin,
        role: role || 'user',
        blocked: blocked === undefined ? undefined : !!blocked,
        canApply: canApply === undefined ? undefined : !!canApply
      }
    })
    
    return NextResponse.json(user)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireModerator()
    
    // Delete user and all related data (cascading)
    await prisma.user.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 400 })
  }
}
