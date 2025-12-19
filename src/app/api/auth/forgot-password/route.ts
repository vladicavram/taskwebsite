import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { sendPasswordResetEmail } from '../../../../lib/email'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal whether user exists
      return NextResponse.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Send email with reset link
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl, user.username || undefined)
    
    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      // Don't reveal email send failure to user for security
    }
    
    console.log('Password reset requested for:', email)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Reset URL:', resetUrl)
    }

    return NextResponse.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Remove this in production - only for development
      ...(process.env.NODE_ENV !== 'production' && { resetUrl })
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
