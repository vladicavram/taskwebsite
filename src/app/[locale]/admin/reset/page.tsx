"use client"
import { useState } from 'react'
import useLocale from '../../../../lib/locale'

export default function AdminResetPage() {
  const { locale } = useLocale()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!email || (!username && !password)) {
      setError('Provide email and at least one of username or password')
      setLoading(false)
      return
    }
    if (!token) {
      setError('Admin token required')
      setLoading(false)
      return
    }

    try {
      const resp = await fetch('/api/admin/reset-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, username: username || undefined, password: password || undefined })
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        setError(data.error || 'Failed to reset user')
      } else {
        setSuccess('User updated successfully')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 32 }}>
      <h2 style={{ fontWeight: 700, fontSize: '1.75rem', marginBottom: 16 }}>Admin: Reset User</h2>
      <div className="card" style={{ padding: 24 }}>
        {error && (
          <div style={{ padding: 12, background: '#fee', border: '1px solid #fcc', borderRadius: 8, color: '#c00', marginBottom: 16 }}>{error}</div>
        )}
        {success && (
          <div style={{ padding: 12, background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 8, color: '#155724', marginBottom: 16 }}>{success}</div>
        )}
        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Admin Token</label>
            <input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="Enter ADMIN_TOKEN" required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Email (target user)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>New Username (optional)</label>
            <input value={username} onChange={e => setUsername(e.target.value)} pattern="[a-zA-Z0-9_]{3,20}" placeholder="e.g. johndoe" />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>New Password (optional)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} placeholder="••••••••" />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>{loading ? 'Saving...' : 'Apply Changes'}</button>
            <a className="btn btn-secondary" href={`/${locale}`}>Back</a>
          </div>
        </form>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>
        Note: This page is not publicly discoverable. Keep your token secure.
      </p>
    </div>
  )
}
