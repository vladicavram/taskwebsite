"use client"
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function CreateProfilePage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'en'
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: '',
    idType: 'passport',
    idNumber: ''
  })
  
  const [idFile, setIdFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (age < 18) {
      setError('You must be at least 18 years old to create a profile.')
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
    
    setLoading(true)
    setError('')
    
    try {
      // Create user account
      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name
        })
      })
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        throw new Error(errorData.error || 'Failed to create account')
      }
      
      const userData = await userResponse.json()
      
      // Create profile
      const profileResponse = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          bio: formData.bio,
          location: formData.location,
          skills: formData.skills,
          dateOfBirth: formData.dateOfBirth,
          phone: formData.phone,
          idType: formData.idType,
          idNumber: formData.idNumber
        })
      })
      
      if (!profileResponse.ok) {
        const profileError = await profileResponse.json().catch(() => ({}))
        console.error('Profile creation failed:', profileError)
        throw new Error(profileError.error || 'Failed to create profile')
      }
      
      // TODO: Implement file upload for ID and photo
      
      // Redirect to login page
      router.push(`/${locale}/login?registered=true`)
    } catch (err: any) {
      setError(err.message || 'Failed to create profile. Please try again.')
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.username || !formData.name || !formData.dateOfBirth || !formData.email || !formData.password || !formData.confirmPassword) {
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
      if (!/[a-zA-Z0-9_]{3,20}/.test(formData.username)) {
        setError('Username must be 3-20 characters, letters, numbers, and underscores only.')
        return
      }
    }
    if (step === 2 && (!formData.idType || !formData.idNumber)) {
      setError('Please provide your ID information.')
      return
    }
    setError('')
    setStep(step + 1)
  }

  const prevStep = () => {
    setError('')
    setStep(step - 1)
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
            Create Your Profile
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Join our community of trusted taskers and clients
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Progress Indicator */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: step >= s ? 'var(--accent)' : 'var(--border)',
                  color: step >= s ? 'white' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  marginBottom: '8px',
                  zIndex: 2
                }}>
                  {s}
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: step >= s ? 'var(--accent)' : 'var(--text-muted)',
                  textAlign: 'center'
                }}>
                  {s === 1 ? 'Personal Info' : s === 2 ? 'Verification' : 'Profile Details'}
                </div>
                {s < 3 && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    right: '-50%',
                    height: '2px',
                    background: step > s ? 'var(--accent)' : 'var(--border)',
                    zIndex: 1
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit}>
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
              </div>
            )}

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ marginBottom: '8px' }}>Personal Information</h3>
                
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
                    Email Address *
                  </label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
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
                    Minimum 8 characters
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
                    minLength={8}
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p style={{ fontSize: '0.875rem', color: '#c00', marginTop: '6px' }}>
                      Passwords do not match
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
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    Location
                  </label>
                  <input 
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State/Country"
                  />
                </div>
              </div>
            )}

            {/* Step 2: ID Verification */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ marginBottom: '8px' }}>Identity Verification</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '-16px' }}>
                  We require ID verification to ensure the safety and security of our community.
                </p>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    ID Type *
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="national_id">National ID Card</option>
                    <option value="state_id">State ID</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    ID Number *
                  </label>
                  <input 
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your ID number"
                    required
                  />
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    marginTop: '6px'
                  }}>
                    Your information is encrypted and secure
                  </p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    Upload ID Document *
                  </label>
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '32px 24px',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('idUpload')?.click()}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📄</div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                      {idFile ? idFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      JPG, PNG or PDF (max 10MB)
                    </p>
                  </div>
                  <input 
                    id="idUpload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                  />
                </div>

                <div style={{
                  background: 'var(--accent-light)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--accent)'
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <span style={{ fontSize: '1.5rem' }}>🔒</span>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--accent)' }}>
                        Your privacy is protected
                      </h4>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: '1.6'
                      }}>
                        We use bank-level encryption to protect your documents. Your ID will only be used for verification purposes and will never be shared.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Profile Details */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ marginBottom: '8px' }}>Complete Your Profile</h3>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    Profile Photo
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
                    Bio
                  </label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your experience, and what services you offer..."
                    rows={5}
                    style={{ resize: 'vertical' }}
                  />
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    marginTop: '6px'
                  }}>
                    A good bio helps you stand out and attract more clients
                  </p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    Skills & Services
                  </label>
                  <input 
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g., Furniture Assembly, Plumbing, House Cleaning"
                  />
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    marginTop: '6px'
                  }}>
                    Separate skills with commas
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px',
              paddingTop: '24px',
              marginTop: '24px',
              borderTop: '1px solid var(--border)'
            }}>
              {step > 1 && (
                <button 
                  type="button"
                  onClick={prevStep}
                  className="btn btn-secondary"
                  style={{ 
                    flex: 1,
                    fontSize: '1.1rem',
                    padding: '14px 24px'
                  }}
                >
                  ← Back
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  type="button"
                  onClick={nextStep}
                  className="btn"
                  style={{ 
                    flex: 1,
                    fontSize: '1.1rem',
                    padding: '14px 24px'
                  }}
                >
                  Continue →
                </button>
              ) : (
                <button 
                  type="submit"
                  className="btn"
                  disabled={loading}
                  style={{ 
                    flex: 1,
                    fontSize: '1.1rem',
                    padding: '14px 24px',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Creating Profile...' : '✓ Create Profile'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Why Verify Section */}
        <div style={{ 
          marginTop: '32px',
          padding: '24px',
          background: 'white',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-light)'
        }}>
          <h3 style={{ marginBottom: '16px' }}>Why we verify profiles</h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</div>
              <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Safety First</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Protect our community from fraud and ensure everyone is who they say they are
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⭐</div>
              <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Build Trust</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Verified profiles get more bookings and higher ratings from clients
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✓</div>
              <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Get Verified Badge</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Stand out with a verified badge on your profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
