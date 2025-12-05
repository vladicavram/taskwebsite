export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '../../../../lib/prisma'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const idPhoto = formData.get('idPhoto') as File | null
    const selfie = formData.get('selfie') as File | null
    const userId = formData.get('userId') as string

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (!idPhoto && !selfie) {
      return NextResponse.json({ error: 'At least one photo required' }, { status: 400 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: { idPhotoUrl?: string; selfieUrl?: string } = {}

    // Upload ID photo if provided
    if (idPhoto) {
      const idBlob = await put(`id-photos/${userId}/${Date.now()}-${idPhoto.name}`, idPhoto, {
        access: 'public',
      })
      updateData.idPhotoUrl = idBlob.url
    }

    // Upload selfie if provided
    if (selfie) {
      const selfieBlob = await put(`selfies/${userId}/${Date.now()}-${selfie.name}`, selfie, {
        access: 'public',
      })
      updateData.selfieUrl = selfieBlob.url
    }

    // Update user with photo URLs
    await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json({ success: true, ...updateData })
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json({ error: 'Failed to upload photos' }, { status: 500 })
  }
}
