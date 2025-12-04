import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../../lib/prisma'
import fs from 'fs'
import path from 'path'
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
    if (task.creatorId) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (!user || user.id !== task.creatorId) {
        return NextResponse.json({ error: 'Only the task creator can upload images' }, { status: 403 })
      }
    }

    const form = await req.formData()
    const file = form.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mime = file.type || 'image/jpeg'
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg'

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tasks', params.id)
    await fs.promises.mkdir(uploadsDir, { recursive: true })
    const filename = `image-${Date.now()}.${ext}`
    const targetPath = path.join(uploadsDir, filename)
    await fs.promises.writeFile(targetPath, buffer)

    return NextResponse.json({ ok: true, path: `/uploads/tasks/${params.id}/${filename}` })
  } catch (err) {
    console.error('Image upload error:', err)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

// DELETE all images is not supported here anymore; use /api/tasks/images/[imageId]
