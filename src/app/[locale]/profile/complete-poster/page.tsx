"use client"
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MOLDOVA_CITIES } from '../../../../lib/constants'
import useLocale from '../../../../lib/locale'

function PosterProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale } = useLocale()
  
  const userId = searchParams.get('userId')
  
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    phone: '',
    location: '',
    bio: ''
  })
  
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) {
      router.push(`/${locale}/login`)
    }
  }, [userId, locale, router])

  const calculateAge = (dob: string) => {
    if (!dob) return 0
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(formData.dateOfBirth)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.dateOfBirth || !formData.phone || !formData.location) {
      setError('Please fill in all required fields.')
      return
    }
    
    if (age < 18) {
      setError('You must be at least 18 years old to create a profile.')
      return
    }
    
    setLoading(true)
    
    try {
      // Create profile
      const profileResponse = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          bio: formData.bio,
          location: formData.location,
          skills: '', // Empty for poster-only
          dateOfBirth: formData.dateOfBirth,
          phone: formData.phone,
          idType: '', // Not required for posters
          idNumber: '' // Not required for posters
        })
      })
      
      if (!profileResponse.ok) {
        const profileError = await profileResponse.json().catch(() => ({}))
        throw new Error(profileError.error || 'Failed to create profile')
      }
      
      // Upload photo if provided
      if (photoFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('photo', photoFile)
        formDataUpload.append('userId', userId!)
        
        await fetch('/api/users/upload-photo', {
          method: 'POST',
          body: formDataUpload
        })
      }
      
      // Redirect to login
      router.push(`/${locale}/login?registered=true`)
    } catch (err: any) {
      setError(err.message || 'Failed to create profile. Please try again.')
      setLoading(false)
    }
  }

  if (!userId) {
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
            Complete Your Profile
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Just a few more details to get started
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '600px', marginBottom: '60px' }}>
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
                Date of Birth *
              </label>
              <input 
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
              {formData.dateOfBirth && (
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: age >= 18 ? 'var(--accent)' : '#c00',
                  marginTop: '6px'
                }}>
                  Age: {age} years old {age < 18 && '(Must be 18+)'}
                </p>
              )}
            </div>

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
                placeholder="+373 XX XXX XXX"
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
                Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              >
                <option value="">Select your city</option>
                {MOLDOVA_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                Profile Photo (Optional)
              </label>
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '32px 24px',
                textAlign: 'center',
                background: 'var(--bg-secondary)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('photoUpload')?.click()}
              >
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📸</div>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  {photoFile ? photoFile.name : 'Upload a profile photo'}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  JPG or PNG (max 5MB)
                </p>
              </div>
              <input 
                id="photoUpload"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                Bio (Optional)
              </label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us a bit about yourself..."
                rows={4}
                style={{ resize: 'vertical' }}
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
              {loading ? 'Creating Profile...' : '✓ Complete Setup'}
            </button>
          </form>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '24px',
          background: 'white',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-light)'
        }}>
          <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>What's Next?</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            As a task poster, you can:
          </p>
          <ul style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li>Create and post tasks</li>
            <li>Review applications from taskers</li>
            <li>Hire workers directly from the marketplace</li>
            <li>Rate and review completed work</li>
          </ul>
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-muted)',
            marginTop: '16px',
            fontStyle: 'italic'
          }}>
            Want to offer your services too? You can upgrade to a tasker account anytime from your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PosterProfilePage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        Loading...
      </div>
    }>
      <PosterProfileContent />
    </Suspense>
  )
}
