import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { requireModerator } from '../../../../../lib/admin'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireModerator()
    
    const body = await req.json()
    const { title, description, location, price, isOpen } = body
    
    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title,
        description,
        location: location || null,
        price: price ? parseFloat(price) : null,
        isOpen
      }
    })
    
    return NextResponse.json(task)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update task' }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireModerator()
    
    // Delete task and all related data (cascading)
    await prisma.task.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete task' }, { status: 400 })
  }
}
