"use client"
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useLocale from '../../../../lib/locale'

function SelectUserTypeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale } = useLocale()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const username = searchParams.get('username')
  const userId = searchParams.get('userId')

  useEffect(() => {
    // Redirect if missing required params
    if (!username || !userId) {
      router.push(`/${locale}/login`)
    }
  }, [username, userId, locale, router])

  const handleSelection = async (userType: string) => {
    setLoading(true)
    setError('')
    
    try {
      // Update user type
      const response = await fetch('/api/users/update-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user type')
      }
      
      // Redirect based on selection
      if (userType === 'poster') {
        // For poster-only users, create a minimal profile without verification
        router.push(`/${locale}/profile/complete-poster?userId=${userId}`)
      } else {
        // For tasker or both, go through full verification
        router.push(`/${locale}/profile/create?userType=${userType}&userId=${userId}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to select user type. Please try again.')
      setLoading(false)
    }
  }

  if (!username || !userId) {
    return null
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
            Welcome, {username}!
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            How would you like to use our platform?
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '1000px', marginBottom: '60px' }}>
        {error && (
          <div style={{
            padding: '16px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: 'var(--radius-sm)',
            color: '#c00',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {/* Option 1: Become a Tasker */}
          <button
            onClick={() => handleSelection('tasker')}
            disabled={loading}
            className="card"
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              border: '2px solid var(--border)',
              background: 'white',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛠️</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              Become a Tasker
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              Offer your services, find work, and earn money by completing tasks for clients.
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.8',
              paddingLeft: '20px',
              marginBottom: '16px'
            }}>
              <li>Browse and apply to tasks</li>
              <li>Build your reputation with reviews</li>
              <li>Set your own rates</li>
            </ul>
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              marginTop: '12px'
            }}>
              Requires ID verification
            </div>
          </button>

          {/* Option 2: Post a Task */}
          <button
            onClick={() => handleSelection('poster')}
            disabled={loading}
            className="card"
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              border: '2px solid var(--border)',
              background: 'white',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📋</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              Post a Task
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              Hire skilled taskers to help with your projects and get things done.
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.8',
              paddingLeft: '20px',
              marginBottom: '16px'
            }}>
              <li>Create and manage tasks</li>
              <li>Review applications from taskers</li>
              <li>Rate and review completed work</li>
            </ul>
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--accent)',
              fontWeight: 600,
              marginTop: '12px'
            }}>
              Quick setup - no verification needed
            </div>
          </button>

          {/* Option 3: Both */}
          <button
            onClick={() => handleSelection('both')}
            disabled={loading}
            className="card"
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              border: '2px solid var(--accent)',
              background: 'linear-gradient(135deg, #fff 0%, #f0f9ff 100%)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,123,255,0.25)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'var(--accent)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              POPULAR
            </div>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🌟</div>
            <h3 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '12px',
              color: 'var(--text)'
            }}>
              Both
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              Get the full experience - post tasks when you need help and offer your services to earn.
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.8',
              paddingLeft: '20px',
              marginBottom: '16px'
            }}>
              <li>Complete flexibility</li>
              <li>Post tasks and apply to tasks</li>
              <li>Maximize earning potential</li>
            </ul>
            <div style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              marginTop: '12px'
            }}>
              Requires ID verification for tasker features
            </div>
          </button>
        </div>

        <div style={{ 
          marginTop: '40px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          <p>You can always upgrade your account type later in settings.</p>
        </div>
      </div>
    </div>
  )
}

export default function SelectUserTypePage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        Loading...
      </div>
    }>
      <SelectUserTypeContent />
    </Suspense>
  )
}
