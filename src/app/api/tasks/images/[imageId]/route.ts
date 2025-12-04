import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/authOptions'
import { prisma } from '../../../../../lib/prisma'
import path from 'path'
import fs from 'fs'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(
	req: Request,
	{ params }: { params: { imageId: string } }
) {
	try {
		const url = new URL(req.url)
		const taskId = url.searchParams.get('taskId')
		if (!taskId) {
			return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
		}
		const session: any = await getServerSession(authOptions as any)
		if (!session?.user?.email) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}
		const task = await prisma.task.findUnique({ where: { id: taskId } })
		if (!task) {
			return NextResponse.json({ error: 'Task not found' }, { status: 404 })
		}
		const user = await prisma.user.findUnique({ where: { email: session.user.email } })
		if (!user || user.id !== task.creatorId) {
			return NextResponse.json({ error: 'Only the task creator can delete images' }, { status: 403 })
		}

		// Basic validation: allow only filename with letters, numbers, dash, underscore and dot
		const imageId = params.imageId
		if (!/^[a-zA-Z0-9_.-]+$/.test(imageId)) {
			return NextResponse.json({ error: 'Invalid image id' }, { status: 400 })
		}

		const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tasks', taskId)
		const target = path.join(uploadsDir, imageId)
		try {
			await fs.promises.unlink(target)
			return NextResponse.json({ ok: true })
		} catch (e) {
			return NextResponse.json({ error: 'Image not found' }, { status: 404 })
		}
	} catch (error) {
		console.error('Delete specific image error:', error)
		return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
	}
}
