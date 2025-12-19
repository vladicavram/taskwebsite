"use client"
import { useState, useEffect, Suspense } from 'react'
import Modal from '../../../components/Modal'
import useLocale from '../../../lib/locale'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

function LoginContent() {
  const { locale, t } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [blocked, setBlocked] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [contactFrom, setContactFrom] = useState('')
  const [contactDesc, setContactDesc] = useState('')
  const [contactStatus, setContactStatus] = useState('')

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      if (searchParams.get('pending') === 'true') {
        setSuccessMessage(t('login.successPending') || 'Account created successfully! Your account is pending admin approval before you can apply for tasks. Please log in.')
      } else {
        setSuccessMessage(t('login.success') || 'Account created successfully! Please log in.')
      }
    }
  }, [searchParams, t])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        usernameOrEmail,
        password,
        redirect: false
      })

      if (result?.error) {
        if (result.error === 'USER_BLOCKED') {
          setBlocked(true)
          setContactOpen(true)
          setError(t('login.blocked') || 'Your account has been blocked. Please contact the admin.')
        } else {
          setError(t('login.invalidCredentials') || 'Invalid username/email or password')
        }
        setLoading(false)
        return
      }

      // Redirect to tasks browser on success
      router.push(`/${locale}/tasks`)
    } catch (err) {
      setError(t('login.error') || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const sendContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactStatus('')
    try {
      const res = await fetch('/api/admin/contact-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: contactFrom, description: contactDesc, usernameOrEmail })
      })
      if (res.ok) {
        setContactStatus(t('login.messageSent') || 'Message sent! The admin will review your request.')
        setContactOpen(false)
      } else {
        setContactStatus(t('login.messageFailed') || 'Failed to send message. Please try again later.')
      }
    } catch {
      setContactStatus(t('login.messageFailed') || 'Failed to send message. Please try again later.')
    }
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="liquid-hero" style={{
        padding: '48px 24px',
        marginBottom: '48px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--text)' }}>
            {t('auth.login') || 'Sign In'}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            {t('login.subtitle') || 'Welcome back! Log in to your Dozo account'}
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card" style={{ padding: '40px' }}>
          {successMessage && (
            <div style={{
              padding: '16px',
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: 'var(--radius-sm)',
              color: '#155724',
              marginBottom: '24px'
            }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div style={{
              padding: '16px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: 'var(--radius-sm)',
              color: '#c00',
              marginBottom: '24px'
            }}>
              {error}
              {blocked && (
                <>
                  <br />
                  <button type="button" className="btn" style={{marginTop:8}} onClick={() => setContactOpen(true)}>
                    {t('login.contactAdmin') || 'Contact Admin'}
                  </button>
                </>
              )}
            </div>
          )}
      {/* Blocked user contact modal */}
      {contactOpen && (
        <Modal onClose={() => setContactOpen(false)}>
          <h2>{t('login.contactAdmin') || 'Contact Admin'}</h2>
          <form onSubmit={sendContact} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label>
              {t('login.contactFrom') || 'From (your email or contact):'}
              <input type="text" value={contactFrom} onChange={e => setContactFrom(e.target.value)} required />
            </label>
            <label>
              {t('login.contactDescription') || 'Description:'}
              <textarea value={contactDesc} onChange={e => setContactDesc(e.target.value)} required rows={4} />
            </label>
            <button type="submit" className="btn">{t('login.sendMessage') || 'Send Message'}</button>
            {contactStatus && <div style={{color:'green'}}>{contactStatus}</div>}
          </form>
        </Modal>
      )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                {t('login.usernameOrEmail') || 'Username or Email'}
              </label>
              <input 
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="johndoe or john@example.com"
                required
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                {t('login.password') || 'Password'}
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              className="btn"
              disabled={loading}
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (t('login.signingIn') || 'Signing in...') : (t('login.signIn') || 'Sign In')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a href="/forgot-password" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem' }}>
                {t('login.forgotPassword') || 'Forgot your password?'}
              </a>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px' }}>
              {t('login.noAccount') || "Don't have an account?"}{' '}
              <a href={`/${locale}/profile/register`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                {t('login.createAccount') || 'Create one now'}
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
