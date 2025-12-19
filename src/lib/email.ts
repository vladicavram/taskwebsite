import { Resend } from 'resend'

// Initialize Resend only if API key is available
let resend: Resend | null = null
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not set, skipping email send')
      console.log('Email would be sent to:', to)
      console.log('Subject:', subject)
      return { success: false, error: 'No API key configured' }
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'TaskWebsite <onboarding@resend.dev>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    console.log('Email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string, username?: string) {
  const subject = 'Reset Your Password - TaskWebsite'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello${username ? ' ' + username : ''},</p>
          
          <p>We received a request to reset your password for your TaskWebsite account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="margin: 10px 0;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this, you can safely ignore this email</li>
              <li>Your password won't change unless you click the link and set a new one</li>
            </ul>
          </div>
          
          <p>If you have any questions or concerns, please contact our support team.</p>
          
          <p>Best regards,<br>The TaskWebsite Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} TaskWebsite. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}

export async function sendWelcomeEmail(email: string, username: string) {
  const subject = 'Welcome to TaskWebsite!'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to TaskWebsite!</h1>
        </div>
        <div class="content">
          <p>Hi ${username},</p>
          
          <p>Welcome to TaskWebsite! We're excited to have you join our community.</p>
          
          <p>Here's what you can do:</p>
          <ul>
            <li>✅ Browse and apply for local tasks</li>
            <li>📝 Post tasks you need help with</li>
            <li>💬 Connect with skilled workers in your area</li>
            <li>⭐ Build your reputation with reviews</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/tasks" class="button">Browse Tasks</a>
          </div>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br>The TaskWebsite Team</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({ to: email, subject, html })
}
