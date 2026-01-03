"use client"
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useLocale from '../../../../lib/locale'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale } = useLocale()
  
  const userType = searchParams.get('type') || 'poster' // Default to poster if not specified
  
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Redirect if no type specified
  useEffect(() => {
    if (!searchParams.get('type')) {
      router.push(`/${locale}/signup`)
    }
  }, [searchParams, locale, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.username || !formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      setError('Please fill in all required fields.')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      setError('Username must be 3-20 characters, letters, numbers, and underscores only.')
      return
    }
    
    setLoading(true)
    
    try {
      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          userType: userType
        })
      })
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        throw new Error(errorData.error || 'Failed to create account')
      }
      
      const userData = await userResponse.json()
      
      // Redirect based on user type
      if (userType === 'poster') {
        // For poster-only users, redirect to login with success message
        router.push(`/${locale}/login?registered=true`)
      } else {
        // For tasker or both, go to profile creation for ID verification
        router.push(`/${locale}/profile/create?userType=${userType}&userId=${userData.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
      setLoading(false)
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
            {userType === 'poster' ? 'Sign Up to Post Tasks' : 
             userType === 'tasker' ? 'Sign Up as a Tasker' : 
             'Sign Up - Full Access'}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            {userType === 'poster' ? 'Quick signup to start hiring taskers' :
             userType === 'tasker' ? 'Join our community of skilled taskers' :
             'Get complete access to post and complete tasks'}
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '500px', marginBottom: '60px' }}>
        <div className="card" style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && (
              <div style={{
                padding: '16px',
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: 'var(--radius-sm)',
                color: '#c00'
              }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                Username *
              </label>
              <input 
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="johndoe"
                required
                pattern="[a-zA-Z0-9_]{3,20}"
                title="Username must be 3-20 characters, letters, numbers, and underscores only"
              />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                Full Name *
              </label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
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
                Email *
              </label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Phone field - required for all users */}
            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                Phone Number *
              </label>
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1234567890"
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
                Password *
              </label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                At least 8 characters
              </p>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                Confirm Password *
              </label>
              <input 
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              className="btn"
              disabled={loading}
              style={{
                marginTop: '8px',
                fontSize: '1.1rem',
                padding: '14px 24px',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up →'}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Already have an account?{' '}
              <a href={`/${locale}/login`} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                Sign in
              </a>
            </p>
          </form>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '20px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--text-muted)',
            margin: 0,
            lineHeight: '1.6'
          }}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{padding: '100px', textAlign: 'center'}}>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
