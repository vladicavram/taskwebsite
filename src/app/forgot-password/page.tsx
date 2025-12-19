'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message)
        // In development, show the reset link
        if (data.resetUrl) {
          setMessage(data.message + ' Click here to reset: ' + data.resetUrl)
        }
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '500px', padding: '48px 24px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>Forgot Password</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div style={{ 
            padding: '12px 16px', 
            background: 'var(--success-bg)', 
            color: 'var(--success)', 
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            wordBreak: 'break-word'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '12px 16px', 
            background: 'var(--error-bg)', 
            color: 'var(--error)', 
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                fontSize: '1rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn"
            style={{
              width: '100%',
              padding: '12px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
