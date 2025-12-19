# Email Service Configuration

This application uses nodemailer to send emails. You need to configure SMTP settings.

## Quick Setup with Gmail

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Add to Vercel Environment Variables**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   SMTP_FROM="TaskWebsite" <noreply@yourdomain.com>
   ```

## Alternative Providers

### SendGrid
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Mailgun
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

### AWS SES
```
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

## Features

- **Password Reset Emails**: Sent when users request password reset
- **Welcome Emails**: Sent when new users register
- **Professional HTML Templates**: Branded emails with responsive design
- **Fallback Text**: Plain text version for email clients that don't support HTML

## Testing Locally

For local development, you can use:
- Gmail with App Password
- Mailtrap.io (email testing service)
- Ethereal Email (fake SMTP service for testing)

## Production Deployment

1. Add all SMTP environment variables to Vercel
2. Redeploy the application
3. Test by requesting a password reset

The system will gracefully handle email failures without breaking the application.
