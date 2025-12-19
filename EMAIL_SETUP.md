# Email Service Configuration

This application uses **Resend** for sending emails - a modern email API with a generous free tier.

## Quick Setup (Free - 5 minutes)

### 1. Create a Resend Account

1. Go to https://resend.com
2. Sign up for a free account (no credit card required)
3. Free tier includes:
   - **100 emails per day**
   - **3,000 emails per month**
   - Perfect for getting started!

### 2. Get Your API Key

1. After signing up, go to https://resend.com/api-keys
2. Click "Create API Key"
3. Give it a name (e.g., "TaskWebsite Production")
4. Copy the API key (starts with `re_`)

### 3. Add to Vercel

1. Go to your Vercel project → Settings → Environment Variables
2. Add:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   ```
3. Optional - Set custom from address:
   ```
   RESEND_FROM=TaskWebsite <noreply@yourdomain.com>
   ```
   (Default is `onboarding@resend.dev` which works immediately)

4. Redeploy your application

### 4. (Optional) Add Your Own Domain

To send from `noreply@dozo.md` instead of `onboarding@resend.dev`:

1. In Resend dashboard, go to Domains
2. Add your domain: `dozo.md`
3. Add the provided DNS records to your domain
4. Once verified, update `RESEND_FROM` in Vercel:
   ```
   RESEND_FROM=TaskWebsite <noreply@dozo.md>
   ```

## Features

- **Password Reset Emails**: Sent when users request password reset
- **Welcome Emails**: Sent when new users register
- **Professional HTML Templates**: Branded emails with responsive design
- **Reliable Delivery**: Resend handles all the infrastructure

## Testing Locally

Add to your `.env.local`:
```
RESEND_API_KEY=re_your_test_api_key
```

## That's It!

The email system will work immediately with the default `onboarding@resend.dev` sender.
No complex SMTP configuration needed!
