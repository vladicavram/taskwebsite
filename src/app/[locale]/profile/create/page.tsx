"use client"
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { MOLDOVA_CITIES } from '../../../../lib/constants'
import useLocale from '../../../../lib/locale'

export default function CreateProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { t, locale } = useLocale()
  
  // Get params from URL
  const userType = searchParams.get('userType') || 'both'
  const userId = searchParams.get('userId')
  const isPosterOnly = userType === 'poster'
  
  // Check if user is already logged in (upgrading from poster)
  const isUpgrading = !!session?.user
  
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
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [showSelfieCamera, setShowSelfieCamera] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Start at step 2 if userId is provided OR user is logged in (upgrading)
  const [step, setStep] = useState(userId || isUpgrading ? 2 : 1)
  const videoRef = useRef<HTMLVideoElement>(null)
  const selfieVideoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const selfieStreamRef = useRef<MediaStream | null>(null)

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

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      streamRef.current = stream
      setShowCamera(true)
    } catch (err) {
      console.error('Error accessing camera:', err)
      alert(t('profileCreate.alert.cameraAccess') || 'Could not access camera. Please check permissions or use file upload.')
    }
  }

  // Set video source when showCamera changes and video element is available
  useEffect(() => {
    if (showCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [showCamera])

  // Set selfie video source when showSelfieCamera changes
  useEffect(() => {
    if (showSelfieCamera && selfieVideoRef.current && selfieStreamRef.current) {
      selfieVideoRef.current.srcObject = selfieStreamRef.current
    }
  }, [showSelfieCamera])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  // Selfie camera functions
  const startSelfieCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } // Front camera for selfie
      })
      selfieStreamRef.current = stream
      setShowSelfieCamera(true)
    } catch (err) {
      console.error('Error accessing camera:', err)
      alert(t('profileCreate.alert.cameraAccess') || 'Could not access camera. Please check permissions or use file upload.')
    }
  }

  const stopSelfieCamera = () => {
    if (selfieStreamRef.current) {
      selfieStreamRef.current.getTracks().forEach(track => track.stop())
      selfieStreamRef.current = null
    }
    setShowSelfieCamera(false)
  }

  const captureSelfie = () => {
    if (selfieVideoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = selfieVideoRef.current.videoWidth
      canvas.height = selfieVideoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(selfieVideoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
            setSelfieFile(file)
            setSelfiePreview(canvas.toDataURL('image/jpeg'))
            stopSelfieCamera()
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  const handleSelfieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelfieFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelfiePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'id-photo.jpg', { type: 'image/jpeg' })
            setIdFile(file)
            setIdPreview(canvas.toDataURL('image/jpeg'))
            stopCamera()
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIdFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIdPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Only submit on step 3
    if (step !== 3) {
      return
    }
    
    if (age < 18) {
      setError(t('profileCreate.error.age') || 'You must be at least 18 years old to create a profile.')
      return
    }
    
    // Only validate passwords if creating new account
    if (!userId) {
      if (formData.password !== formData.confirmPassword) {
        setError(t('profileCreate.error.passwordMismatch') || 'Passwords do not match.')
        return
      }
      
      if (formData.password.length < 8) {
        setError(t('profileCreate.error.passwordShort') || 'Password must be at least 8 characters long.')
        return
      }
    }
    
    // Verify ID and selfie are uploaded
    if (!idFile || !selfieFile) {
      setError(t('profileCreate.error.uploadIdSelfie') || 'Please go back and upload your ID and selfie.')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      let userIdToUse = userId
      
      // If user is logged in (upgrading), use their session info
      if (isUpgrading && session?.user) {
        // For logged-in users upgrading, we'll update their userType via the profile API
        userIdToUse = (session.user as any).id
      } else if (!userId) {
        // Create user account only if userId not provided and not logged in
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
        userIdToUse = userData.id
      }
      
      // Create profile
      const profileResponse = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdToUse,
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
      
      // Upload ID photo and selfie
      if ((idFile || selfieFile) && userIdToUse) {
        const formDataUpload = new FormData()
        if (idFile) {
          formDataUpload.append('idPhoto', idFile)
        }
        if (selfieFile) {
          formDataUpload.append('selfie', selfieFile)
        }
        formDataUpload.append('userId', userIdToUse)
        
        const uploadResponse = await fetch('/api/users/upload-id', {
          method: 'POST',
          body: formDataUpload
        })
        
        if (!uploadResponse.ok) {
          console.error('Photo upload failed')
          // Don't fail registration, but log the error
        }
      }
      
      // Redirect based on whether user is upgrading or creating new account
      if (isUpgrading) {
        // Upgrading user - redirect to profile with pending message
        router.push(`/${locale}/profile/account?upgraded=true`)
      } else {
        // New user - redirect to login page with message about pending approval
        router.push(`/${locale}/login?registered=true&pending=true`)
      }
    } catch (err: any) {
      setError(err.message || (t('profileCreate.error.createProfile') || 'Failed to create profile. Please try again.'))
      setLoading(false)
    }
  }

  const nextStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (step === 1) {
      if (!formData.username || !formData.name || !formData.dateOfBirth || !formData.email || !formData.password || !formData.confirmPassword) {
        setError(t('profileCreate.error.fillRequired') || 'Please fill in all required fields.')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError(t('profileCreate.error.passwordMismatch') || 'Passwords do not match.')
        return
      }
      if (formData.password.length < 8) {
        setError(t('profileCreate.error.passwordShort') || 'Password must be at least 8 characters long.')
        return
      }
      if (!/[a-zA-Z0-9_]{3,20}/.test(formData.username)) {
        setError(t('profileCreate.error.usernameInvalid') || 'Username must be 3-20 characters, letters, numbers, and underscores only.')
        return
      }
    }
    if (step === 2 && (!formData.idType || !formData.idNumber || !idFile)) {
      setError(t('profileCreate.error.idRequired') || 'Please provide your ID information and upload a photo of your ID.')
      return
    }
    if (step === 2 && !selfieFile) {
      setError(t('profileCreate.error.selfieRequired') || 'Please upload a selfie photo for identity verification.')
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
            {t('profileCreate.heroTitle') || 'Create Your Profile'}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            {t('profileCreate.heroSubtitle') || 'Join our community of trusted taskers and clients'}
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Progress Indicator - hide step 1 if userId exists */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            {(userId ? [2, 3] : [1, 2, 3]).map((s, idx) => (
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
                  {userId ? idx + 1 : s}
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: step >= s ? 'var(--accent)' : 'var(--text-muted)',
                  textAlign: 'center'
                }}>
                  {s === 1 ? (t('profileCreate.step.personalInfo') || 'Personal Info') : s === 2 ? (t('profileCreate.step.verification') || 'Verification') : (t('profileCreate.step.profileDetails') || 'Profile Details')}
                </div>
                {((userId && idx < 1) || (!userId && s < 3)) && (
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
          <form onSubmit={handleSubmit} onKeyDown={(e) => {
            // Prevent form submission on Enter key except on step 3
            if (e.key === 'Enter' && step < 3) {
              e.preventDefault()
            }
          }}>
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
                <h3 style={{ marginBottom: '8px' }}>{t('profileCreate.section.personal') || 'Personal Information'}</h3>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    {t('auth.username') || 'Username'} *
                  </label>
                  <input 
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder={t('profileCreate.placeholder.username') || 'johndoe'}
                    required
                    pattern="[a-zA-Z0-9_]{3,20}"
                    title={t('profileCreate.help.username') || 'Username must be 3-20 characters, letters, numbers, and underscores only'}
                  />
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {t('profileCreate.help.username') || '3-20 characters, letters, numbers, and underscores only'}
                  </p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    {t('auth.name') || 'Full Name'} *
                  </label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('profileCreate.placeholder.fullName') || 'John Doe'}
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
                    {t('profileCreate.label.dateOfBirth') || 'Date of Birth'} *
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
                    {t('auth.email') || 'Email Address'} *
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
                    {t('auth.password') || 'Password'} *
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
                    {t('profileCreate.help.password') || 'Minimum 8 characters'}
                  </p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    {t('profileCreate.label.confirmPassword') || 'Confirm Password'} *
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
                      {t('profileCreate.error.passwordMismatch') || 'Passwords do not match'}
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
                    {t('profileCreate.label.phone') || 'Phone Number'}
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
                    {t('profile.location') || 'Location'}
                  </label>
                  <select 
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    style={{ width: '100%' }}
                  >
                    <option value="">{t('profileCreate.placeholder.selectCity') || 'Select your city'}</option>
                    {MOLDOVA_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: ID Verification */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ marginBottom: '8px' }}>{t('profileCreate.section.verification') || 'Identity Verification'}</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '-16px' }}>
                  {t('profileCreate.verification.subtitle') || 'We require ID verification to ensure the safety and security of our community.'}
                </p>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    {t('profileCreate.label.idType') || 'ID Type'} *
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="passport">{t('profileCreate.idType.passport') || 'Passport'}</option>
                    <option value="drivers_license">{t('profileCreate.idType.driversLicense') || "Driver's License"}</option>
                    <option value="national_id">{t('profileCreate.idType.nationalId') || 'National ID Card'}</option>
                    <option value="state_id">{t('profileCreate.idType.stateId') || 'State ID'}</option>
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    {t('profileCreate.label.idNumber') || 'ID Number'} *
                  </label>
                  <input 
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    placeholder={t('profileCreate.placeholder.idNumber') || 'Enter your ID number'}
                    required
                  />
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    marginTop: '6px'
                  }}>
                    {t('profileCreate.help.idSecure') || 'Your information is encrypted and secure'}
                  </p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    Upload ID *
                  </label>
                  
                  {showCamera ? (
                    <div style={{ marginBottom: '16px' }}>
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline
                        style={{ 
                          width: '100%', 
                          maxHeight: '300px',
                          borderRadius: 'var(--radius-sm)',
                          background: '#000'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="btn"
                          style={{ flex: 1 }}
                        >
                          📸 Capture Photo
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : idPreview ? (
                    <div style={{ marginBottom: '16px' }}>
                      <img 
                        src={idPreview} 
                        alt="ID Preview"
                        style={{ 
                          width: '100%', 
                          maxHeight: '300px',
                          objectFit: 'contain',
                          borderRadius: 'var(--radius-sm)',
                          border: '2px solid var(--accent)'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setIdFile(null)
                            setIdPreview(null)
                          }}
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                        >
                          Remove & Upload New
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div 
                        style={{
                          flex: 1,
                          minWidth: '150px',
                          border: '2px dashed var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '24px 16px',
                          textAlign: 'center',
                          background: 'var(--bg-secondary)',
                          cursor: 'pointer'
                        }}
                        onClick={() => document.getElementById('idUpload')?.click()}
                      >
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📄</div>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                          {t('profileCreate.upload.fromDevice') || 'Upload from device'}
                        </p>
                      </div>
                      <div 
                        style={{
                          flex: 1,
                          minWidth: '150px',
                          border: '2px dashed var(--accent)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '24px 16px',
                          textAlign: 'center',
                          background: 'var(--accent-light)',
                          cursor: 'pointer'
                        }}
                        onClick={startCamera}
                      >
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📷</div>
                        <p style={{ color: 'var(--accent)', margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                          {t('profileCreate.upload.takePhoto') || 'Take a photo'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <input 
                    id="idUpload"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleIdFileChange}
                    style={{ display: 'none' }}
                  />
                  
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    marginTop: '12px'
                  }}>
                    {t('profileCreate.help.takeIdPhoto') || "Take a clear photo of your ID document (passport, driver's license, or national ID)"}
                  </p>
                </div>

                {/* Selfie Upload Section */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    Upload Selfie *
                  </label>
                  
                  {showSelfieCamera ? (
                    <div style={{ marginBottom: '16px' }}>
                      <video 
                        ref={selfieVideoRef}
                        autoPlay 
                        playsInline
                        style={{ 
                          width: '100%', 
                          maxHeight: '300px',
                          borderRadius: 'var(--radius-sm)',
                          background: '#000',
                          transform: 'scaleX(-1)' // Mirror for selfie
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button
                          type="button"
                          onClick={captureSelfie}
                          className="btn"
                          style={{ flex: 1 }}
                        >
                          📸 Capture Selfie
                        </button>
                        <button
                          type="button"
                          onClick={stopSelfieCamera}
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : selfiePreview ? (
                    <div style={{ marginBottom: '16px' }}>
                      <img 
                        src={selfiePreview} 
                        alt="Selfie Preview"
                        style={{ 
                          width: '100%', 
                          maxHeight: '300px',
                          objectFit: 'contain',
                          borderRadius: 'var(--radius-sm)',
                          border: '2px solid var(--accent)'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelfieFile(null)
                            setSelfiePreview(null)
                          }}
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                        >
                          Remove & Take New
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div 
                        style={{
                          flex: 1,
                          minWidth: '150px',
                          border: '2px dashed var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '24px 16px',
                          textAlign: 'center',
                          background: 'var(--bg-secondary)',
                          cursor: 'pointer'
                        }}
                        onClick={() => document.getElementById('selfieUpload')?.click()}
                      >
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🤳</div>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                          {t('profileCreate.upload.fromDevice') || 'Upload from device'}
                        </p>
                      </div>
                      <div 
                        style={{
                          flex: 1,
                          minWidth: '150px',
                          border: '2px dashed var(--accent)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '24px 16px',
                          textAlign: 'center',
                          background: 'var(--accent-light)',
                          cursor: 'pointer'
                        }}
                        onClick={startSelfieCamera}
                      >
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📷</div>
                        <p style={{ color: 'var(--accent)', margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                          {t('profileCreate.upload.takeSelfie') || 'Take a selfie'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <input 
                    id="selfieUpload"
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleSelfieFileChange}
                    style={{ display: 'none' }}
                  />
                  
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    marginTop: '12px'
                  }}>
                    {t('profileCreate.help.takeSelfie') || 'Take a clear selfie of your face. This helps us verify your identity matches your ID.'}
                  </p>
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
                <h3 style={{ marginBottom: '8px' }}>{t('profileCreate.section.complete') || 'Complete Your Profile'}</h3>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    {t('profileCreate.photo.label') || 'Profile Photo'}
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
                      {photoFile ? photoFile.name : (t('profileCreate.photo.placeholder') || 'Upload a profile photo')}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      {t('profileCreate.photo.help') || 'JPG or PNG (max 5MB)'}
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
                    {t('profileCreate.label.bio') || 'Bio'}
                  </label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder={t('profileCreate.placeholder.bio') || 'Tell us about yourself, your experience, and what services you offer...'}
                    rows={5}
                    style={{ resize: 'vertical' }}
                  />
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    marginTop: '6px'
                  }}>
                    {t('profileCreate.help.bio') || 'A good bio helps you stand out and attract more clients'}
                  </p>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text)'
                  }}>
                    {t('profileCreate.label.skills') || 'Skills & Services'}
                  </label>
                  <input 
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder={t('profileCreate.placeholder.skills') || 'e.g., Furniture Assembly, Plumbing, House Cleaning'}
                  />
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    marginTop: '6px'
                  }}>
                    {t('profileCreate.help.skills') || 'Separate skills with commas'}
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
              {/* Only show back button if step > 2 when userId exists, or step > 1 when creating new account */}
              {(userId ? step > 2 : step > 1) && (
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
                  {t('create.back') || '← Back'}
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  type="button"
                  onClick={(e) => nextStep(e)}
                  className="btn"
                  style={{ 
                    flex: 1,
                    fontSize: '1.1rem',
                    padding: '14px 24px'
                  }}
                >
                  {t('profileCreate.continue') || 'Continue →'}
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
                  {loading ? (t('profileCreate.creating') || 'Creating Profile...') : (t('profileCreate.create') || '✓ Create Profile')}
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
          <h3 style={{ marginBottom: '16px' }}>{t('profileCreate.why.title') || 'Why we verify profiles'}</h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</div>
              <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>{t('profileCreate.why.safety.title') || 'Safety First'}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {t('profileCreate.why.safety.text') || 'Protect our community from fraud and ensure everyone is who they say they are'}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⭐</div>
              <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>{t('profileCreate.why.trust.title') || 'Build Trust'}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {t('profileCreate.why.trust.text') || 'Verified profiles get more bookings and higher ratings from clients'}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✓</div>
              <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>{t('profileCreate.why.badge.title') || 'Get Verified Badge'}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {t('profileCreate.why.badge.text') || 'Stand out with a verified badge on your profile'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
