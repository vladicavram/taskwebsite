export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const idPhoto = formData.get('idPhoto') as File
    const userId = formData.get('userId') as string

    if (!idPhoto || !userId) {
      return NextResponse.json({ error: 'ID photo and user ID required' }, { status: 400 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Upload to Vercel Blob
    const blob = await put(`id-photos/${userId}/${Date.now()}-${idPhoto.name}`, idPhoto, {
      access: 'public',
    })

    // Update user with ID photo URL
    await prisma.user.update({
      where: { id: userId },
      data: { idPhotoUrl: blob.url }
    })

    return NextResponse.json({ success: true, url: blob.url })
  } catch (error) {
    console.error('ID upload error:', error)
    return NextResponse.json({ error: 'Failed to upload ID' }, { status: 500 })
  }
}
