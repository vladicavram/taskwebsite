"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useLocale from '../../../../lib/locale'

export default function AccountPage() {
  const { locale, t } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'profile'>('profile')
  const [userType, setUserType] = useState<string>('')
  const [canApply, setCanApply] = useState(false)
  const [openForHire, setOpenForHire] = useState(true)
  const [userId, setUserId] = useState<string>('')
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false)
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    image: ''
  })

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgradeMessage(true)
      // Clear the URL parameter after showing message
      const timer = setTimeout(() => setShowUpgradeMessage(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/${locale}/login`)
    }
  }, [status, router, locale])

  useEffect(() => {
    async function load() {
      // We rely on session callback to add user id; if missing, just proceed
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setAccountInfo(data)
        setForm({
          username: data.username || '',
          name: data.name || '',
          email: data.email || '',
          password: '',
          image: data.image || ''
        })
        setUserType(data.userType || 'poster')
        setCanApply(data.canApply || false)
        setOpenForHire(data.openForHire !== undefined ? data.openForHire : true)
        setUserId(data.id || '')
      }
    }
    load()
  }, [session])

  // Task management moved to dedicated My Tasks page

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setForm(prev => ({ ...prev, image: base64 }))
    }
    reader.readAsDataURL(file)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    const payload: any = { username: form.username, name: form.name, image: form.image, openForHire: openForHire }
    if (form.password) payload.password = form.password
    const res = await fetch('/api/users/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Failed to update account')
      return
    }
    setSuccess('Account updated successfully')
    // Refresh header/session so avatar and name update immediately
    try {
      router.refresh()
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload()
      }, 200)
    } catch {}
  }

  // Deletion handled on task detail page; no task list here

  return (
    <div className="container" style={{ maxWidth: '900px', paddingTop: '32px' }}>
      <h2 style={{ fontWeight: 700, fontSize: '1.75rem', marginBottom: '16px' }}>Account Settings</h2>
      
      {/* Show upgrade success message */}
      {showUpgradeMessage && (
        <div style={{
          background: '#10b981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: 'var(--radius)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>✓</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              {t('account.upgradeSuccess.title') || 'Upgrade Submitted!'}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>
              {t('account.upgradeSuccess.message') || 'Your request to become a tasker has been submitted. An admin will review your ID verification and approve your account soon.'}
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs removed; My Tasks moved to header menu */}

      {activeTab === 'profile' && (
      <>
        {/* Account Information Card */}
        {accountInfo && (
          <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, white 100%)' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.3rem', color: 'var(--text)' }}>📊 {t('account.overview.title') || 'Account Overview'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('account.overview.accountType') || 'Account Type'}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--accent)', textTransform: 'capitalize' }}>
                  {accountInfo.userType === 'both' ? (t('account.overview.userType.both') || 'Poster & Tasker') : accountInfo.userType === 'tasker' ? (t('account.overview.userType.tasker') || 'Tasker') : (t('account.overview.userType.poster') || 'Poster')}
                </div>
              </div>
              
              <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('account.overview.creditsBalance') || 'Credits Balance'}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#10b981' }}>
                  {accountInfo.credits?.toFixed(2) || '0.00'}
                </div>
              </div>
              
              {accountInfo.reviewCount > 0 && (
                <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('account.overview.averageRating') || 'Average Rating'}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⭐ {accountInfo.averageRating?.toFixed(1) || '0.0'}
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                      ({accountInfo.reviewCount})
                    </span>
                  </div>
                </div>
              )}
              
              <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Member Since</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)' }}>
                  {accountInfo.createdAt ? new Date(accountInfo.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                </div>
              </div>
              
              <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Account Status</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: accountInfo.canApply ? '#10b981' : '#f59e0b' }}>
                  {accountInfo.blocked ? '🔒 Blocked' : accountInfo.canApply ? '✓ Active' : '⏳ Pending'}
                </div>
              </div>
            </div>
            
            {accountInfo.isAdmin && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                👑 {t('account.overview.adminAccount') || 'Administrator Account'}
              </div>
            )}
          </div>
        )}

        {/* Show upgrade banner for poster-only users */}
        {userType === 'poster' && (
          <div style={{
            background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: 'var(--radius)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>🌟 {t('account.upgrade.title') || 'Want to Offer Your Services?'}</h3>
              <p style={{ margin: 0, opacity: 0.95, fontSize: '1rem' }}>
                {t('account.upgrade.description') || 'Upgrade to a Tasker account to apply for tasks and start earning money'}
              </p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/profile/create?userType=both&userId=${userId}`)}
              className="btn"
              style={{
                background: 'white',
                color: '#007bff',
                fontWeight: 600,
                padding: '12px 24px',
                whiteSpace: 'nowrap'
              }}
            >
              {t('account.upgrade.button') || 'Become a Tasker →'}
            </button>
          </div>
        )}
        
        <div className="card" style={{ padding: '24px' }}>
        {error && (
          <div style={{ padding: 12, background: '#fee', border: '1px solid #fcc', borderRadius: 8, color: '#c00', marginBottom: 16 }}>{error}</div>
        )}
        {success && (
          <div style={{ padding: 12, background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 8, color: '#155724', marginBottom: 16 }}>{success}</div>
        )}
        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: 'var(--border)' }}>
              {form.image ? (
                <img src={form.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  {t('account.noPhoto') || 'No photo'}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{t('account.profilePicture') || 'Profile Picture'}</label>
              <input type="file" accept="image/*" onChange={onImageChange} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{t('account.username') || 'Username'}</label>
            <input name="username" value={form.username} onChange={onChange} pattern="[a-zA-Z0-9_]{3,20}" required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{t('account.fullName') || 'Full Name'}</label>
            <input name="name" value={form.name} onChange={onChange} required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{t('account.email') || 'Email'}</label>
            <input type="email" name="email" value={form.email} readOnly required />
          </div>
          
          {/* Show openForHire checkbox for taskers */}
          {(userType === 'tasker' || userType === 'both') && canApply && (
            <div style={{
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                cursor: 'pointer',
                fontWeight: 600
              }}>
                <input
                  type="checkbox"
                  checked={openForHire}
                  onChange={(e) => setOpenForHire(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />
                <div>
                  <div style={{ marginBottom: '4px' }}>
                    {t('account.openForHire') || 'Available for Hire'}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 'normal',
                    color: 'var(--text-secondary)' 
                  }}>
                    {t('account.openForHireDesc') || 'Show my profile in the hire list so clients can find and hire me'}
                  </div>
                </div>
              </label>
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>{t('account.newPassword') || 'New Password (optional)'}</label>
            <input type="password" name="password" value={form.password} onChange={onChange} minLength={8} placeholder={t('account.passwordPlaceholder') || '••••••••'} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>{saving ? (t('account.saving') || 'Saving...') : (t('account.saveChanges') || 'Save Changes')}</button>
            <button type="button" className="btn btn-secondary" onClick={() => router.push(`/${locale}`)}>{t('account.cancel') || 'Cancel'}</button>
          </div>
        </form>
      </div>
      </>
      )}

      {/* Tasks UI removed from account settings */}
    </div>
  )
}
