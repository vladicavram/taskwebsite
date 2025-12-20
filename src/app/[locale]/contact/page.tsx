'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useLocale from '../../../lib/locale'

export default function ContactPage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const { t } = useLocale()
  const { data: session, status } = useSession()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      alert(t('contact.loginRequired'))
      router.push(`/${locale}/login`)
      return
    }

    setSending(true)

    try {
      // Get all admins
      const adminsRes = await fetch('/api/admin/users?role=admin')
      const admins = await adminsRes.json()

      // Send message to each admin
      for (const admin of admins) {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: admin.id,
            content: `**${subject}**\n\nFrom: ${name || session.user?.name} (${email || session.user?.email})\n\n${message}`
          })
        })
      }

      setSuccess(true)
      setSubject('')
      setMessage('')
      
      setTimeout(() => {
        router.push(`/${locale}/messages`)
      }, 2000)
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="container" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container" style={{ padding: '40px 24px', maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔒</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>{t('contact.loginRequired')}</h1>
          <button 
            onClick={() => router.push(`/${locale}/login`)}
            className="btn"
            style={{ marginTop: '24px' }}
          >
            {t('support.loginButton')}
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container" style={{ padding: '40px 24px', maxWidth: '600px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✅</div>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--accent)' }}>
            {t('contact.success')}
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Redirecting to messages...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '800px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--accent)', textAlign: 'center' }}>
          {t('contact.title')}
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '40px', textAlign: 'center' }}>
          {t('contact.subtitle')}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text)' }}>
              {t('contact.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={session.user?.name || ''}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text)' }}>
              {t('contact.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={session.user?.email || ''}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text)' }}>
              {t('contact.subject')} *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text)' }}>
              {t('contact.message')} *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={8}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="btn"
            style={{
              padding: '16px',
              fontSize: '1.1rem',
              background: sending ? 'var(--border)' : 'var(--accent)',
              cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.6 : 1
            }}
          >
            {sending ? t('contact.sending') : t('contact.send')}
          </button>
        </form>
      </div>
    </div>
  )
}
