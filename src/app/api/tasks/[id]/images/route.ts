import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../../lib/prisma'
import { put, del } from '@vercel/blob'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({ where: { id: params.id } })
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || user.id !== task.creatorId) {
      return NextResponse.json({ error: 'Only the task creator can upload images' }, { status: 403 })
    }

    const form = await req.formData()
    const file = form.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Delete old image if exists
    if (task.imageUrl) {
      try {
        await del(task.imageUrl)
      } catch (e) {
        console.log('Could not delete old image:', e)
      }
    }

    // Upload to Vercel Blob
    const blob = await put(`tasks/${params.id}/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true
    })

    // Update task with new image URL
    await prisma.task.update({
      where: { id: params.id },
      data: { imageUrl: blob.url }
    })

    return NextResponse.json({ ok: true, url: blob.url })
  } catch (err) {
    console.error('Image upload error:', err)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUnique({ where: { id: params.id } })
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || user.id !== task.creatorId) {
      return NextResponse.json({ error: 'Only the task creator can delete images' }, { status: 403 })
    }

    if (task.imageUrl) {
      await del(task.imageUrl)
      await prisma.task.update({
        where: { id: params.id },
        data: { imageUrl: null }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Image delete error:', err)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
