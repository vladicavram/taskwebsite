'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import useLocale from '../../../lib/locale'

export default function SupportPage() {
  const { t } = useLocale()
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'ro'
  
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      router.push(`/${locale}/login?from=${encodeURIComponent(pathname || '')}`)
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Find admin user
      const adminRes = await fetch('/api/admin/users')
      if (!adminRes.ok) {
        throw new Error('Failed to find admin')
      }
      
      const users = await adminRes.json()
      const admin = users.find((u: any) => u.role === 'admin' || u.isAdmin)
      
      if (!admin) {
        throw new Error('No admin found')
      }

      // Send message to admin
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: admin.id,
          content: `[SUPPORT REQUEST]\nSubject: ${subject}\n\n${message}`
        })
      })

      if (response.ok) {
        setSuccess(true)
        setSubject('')
        setMessage('')
        setTimeout(() => {
          router.push(`/${locale}/messages`)
        }, 2000)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send support request')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="container" style={{ paddingTop: '40px', maxWidth: 800 }}>
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔒</div>
          <h2>{t('support.loginRequired') || 'Login Required'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('support.loginDescription') || 'You need to be logged in to contact support.'}
          </p>
          <button
            onClick={() => router.push(`/${locale}/login?from=${encodeURIComponent(pathname || '')}`)}
            className="btn"
          >
            {t('support.loginButton') || 'Login'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '40px', maxWidth: 800 }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ marginBottom: '8px' }}>
            {t('support.title') || '💬 Contact Support'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {t('support.description') || 'Send a message to our support team. We\'ll get back to you as soon as possible.'}
          </p>
        </div>

        {success && (
          <div style={{
            padding: '16px',
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            color: '#065f46',
            marginBottom: '24px'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              ✓ {t('support.success.title') || 'Message Sent Successfully'}
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              {t('support.success.description') || 'Your support request has been sent. Redirecting to messages...'}
            </p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '16px',
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              {t('support.subject') || 'Subject'}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('support.subjectPlaceholder') || 'Brief description of your issue'}
              required
              disabled={loading || success}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg)',
                color: 'var(--text)'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              {t('support.message') || 'Message'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('support.messagePlaceholder') || 'Describe your issue in detail...'}
              required
              disabled={loading || success}
              rows={8}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={loading || success}
            style={{ width: '100%' }}
          >
            {loading ? (t('support.sending') || 'Sending...') : (t('support.sendButton') || 'Send Support Request')}
          </button>
        </form>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>
            ℹ️ {t('support.tip.title') || 'Tips for Faster Support'}
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <li>{t('support.tip.1') || 'Be specific about your issue'}</li>
            <li>{t('support.tip.2') || 'Include any error messages you received'}</li>
            <li>{t('support.tip.3') || 'Mention if this is urgent'}</li>
            <li>{t('support.tip.4') || 'Check your messages for our response'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
