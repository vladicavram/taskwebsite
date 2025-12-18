'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

import Link from 'next/link'
import { MapPin, CheckCircle2 } from 'lucide-react'
import useLocale from '../../../../lib/locale'
import { CURRENCY_SYMBOL } from '../../../../lib/constants'

export default function ProfilePage() {
  const params = useParams()
  const profileId = params?.id as string
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const { data: session } = useSession()
  const { locale, t } = useLocale()

  useEffect(() => {
    async function fetchUser() {
      if (!profileId) return
      try {
        const response = await fetch(`/api/profiles?id=${profileId}`)
        if (!response.ok) {
          setUser(null)
          return
        }
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [profileId])

  useEffect(() => {
    async function fetchCurrentUser() {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/users/me')
          const data = await response.json()
          setCurrentUser(data)
        } catch (error) {
          console.error('Error fetching current user:', error)
        }
      }
    }
    fetchCurrentUser()
  }, [session])

  const handleHire = () => {
    // Require login before navigating to create task
    if (session?.user) {
      // Store the hired user ID in sessionStorage and navigate to create task
      sessionStorage.setItem('hiredUserId', profileId)
      sessionStorage.setItem('hiredUserName', user?.name || user?.email || 'User')
      router.push(`/${locale}/tasks/create`)
    } else {
      // Not logged in — redirect to login
      router.push(`/${locale}/login`)
    }
  }

  const isOwnProfile = currentUser?.id === profileId

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '64px 24px' }}>
        <div style={{ fontSize: '2rem' }}>{t('profile.loading') || 'Loading...'}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>👤</div>
          <h2>{t('profile.notFound.title') || 'Profile not found'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('profile.notFound.description') || 'This user profile doesn\'t exist or has been removed.'}
          </p>
          <Link href={`/${locale}/tasks`} className="btn">
            {t('profile.notFound.browseTasks') || 'Browse Tasks'}
          </Link>
        </div>
      </div>
    )
  }

  const profile = user.profile
  // Calculate average rating from reviews received (always show, even if 0)
  const reviewsReceived = user.reviewsReceived || []
  const averageRatingValue: number = reviewsReceived.length > 0
    ? reviewsReceived.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsReceived.length
    : 0
  const averageRating = averageRatingValue.toFixed(1)
  // Backward-compatible alias for existing render code
  const allReviews = reviewsReceived

  return (
    <div>
      {/* Hero Section */}
      <section className="liquid-hero" style={{
        padding: '64px 24px',
        marginBottom: '48px'
      }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              fontWeight: 700,
              color: 'var(--accent)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {(user.name || user.email || 'U')[0].toUpperCase()}
            </div>

            {/* User Info */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'var(--text)', margin: 0 }}>
                  {user.name || 'Anonymous User'}
                </h1>
                {profile?.verified && (
                  <span style={{
                    background: 'white',
                    color: 'var(--accent)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    gap: '6px',
                    alignItems: 'center'
                  }}>
                    <CheckCircle2 size={16} /> {t('profile.verified') || 'Verified'}
                  </span>
                )}
              </div>
              
              {/* Rating Display (always visible) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--accent)'
                }}>
                  <span>⭐</span>
                  <span>{averageRating}</span>
                </div>
                <span style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)'
                }}>
                  ({reviewsReceived.length} {reviewsReceived.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              
              {/* Stats */}
              <div style={{ 
                display: 'flex', 
                gap: '32px',
                color: 'var(--text)',
                fontSize: '0.95rem'
              }}>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                    {(user.tasks || []).length}
                  </div>
                  <div style={{ opacity: 0.9 }}>{t('profile.tasksPosted') || 'Tasks Posted'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
          {/* Main Content */}
          <div>
            {/* Personal Information Section */}
            <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ marginBottom: '16px' }}>{t('profile.personalInfo') || 'Personal Information'}</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('profile.username') || 'Username'}:</span>
                  <span style={{ color: 'var(--text)' }}>{user.username || '-'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('profile.email') || 'Email'}:</span>
                  <span style={{ color: 'var(--text)' }}>{user.email || '-'}</span>
                </div>
                {user.phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('profile.phone') || 'Phone'}:</span>
                    <span style={{ color: 'var(--text)' }}>{user.phone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('profile.userType') || 'Account Type'}:</span>
                  <span style={{ color: 'var(--text)', textTransform: 'capitalize' }}>{user.userType || 'poster'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('profile.credits') || 'Credits'}:</span>
                  <span style={{ color: 'var(--text)' }}>{user.credits || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('profile.canApply') || 'Can Apply to Tasks'}:</span>
                  <span style={{ color: user.canApply ? '#10b981' : '#ef4444' }}>
                    {user.canApply ? (t('common.yes') || 'Yes') : (t('common.no') || 'No')}
                  </span>
                </div>
                {user.isAdmin && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('profile.role') || 'Role'}:</span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>Admin</span>
                  </div>
                )}
                {user.blocked && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('profile.status') || 'Status'}:</span>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>{t('profile.blocked') || 'Blocked'}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t('profile.memberSince') || 'Member Since'}:</span>
                  <span style={{ color: 'var(--text)' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* ID Verification Section */}
            {(user.idPhotoUrl || user.selfieUrl) && (
              <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>{t('profile.idVerification') || 'ID Verification'}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {user.idPhotoUrl && (
                    <div>
                      <h4 style={{ marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {t('profile.idPhoto') || 'ID Photo'}
                      </h4>
                      <img 
                        src={user.idPhotoUrl} 
                        alt="ID Photo" 
                        style={{ 
                          width: '100%', 
                          borderRadius: '8px', 
                          border: '1px solid var(--border)',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(user.idPhotoUrl, '_blank')}
                      />
                    </div>
                  )}
                  {user.selfieUrl && (
                    <div>
                      <h4 style={{ marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {t('profile.selfie') || 'Selfie'}
                      </h4>
                      <img 
                        src={user.selfieUrl} 
                        alt="Selfie" 
                        style={{ 
                          width: '100%', 
                          borderRadius: '8px', 
                          border: '1px solid var(--border)',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(user.selfieUrl, '_blank')}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About Section */}
            {profile && (
              <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>{t('profile.about') || 'About'}</h2>
                {profile.bio ? (
                  <p style={{ 
                    lineHeight: '1.8', 
                    color: 'var(--text-secondary)',
                    marginBottom: '24px'
                  }}>
                    {profile.bio}
                  </p>
                ) : (
                  <p style={{ 
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginBottom: '24px'
                  }}>
                    {t('profile.noBio') || 'No bio provided yet'}
                  </p>
                )}

                {profile.location && (
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <MapPin size={18} />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.skills && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ marginBottom: '12px' }}>{t('profile.skills') || 'Skills'}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(profile.skills || '').split(',').map((skill: string, i: number) => (
                        <span 
                          key={i}
                          style={{
                            background: 'var(--accent-light)',
                            color: 'var(--accent)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Tasks */}
            {(user.tasks || []).length > 0 && (
              <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
                <h2 style={{ marginBottom: '24px' }}>{t('profile.recentTasks') || 'Recent Tasks'}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {(user.tasks || []).map((task: any) => (
                    <Link
                      key={task.id}
                      href={`/${locale}/tasks/${task.id}`}
                      style={{
                        display: 'block',
                        padding: '20px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '8px'
                      }}>
                        <h4 style={{ margin: 0, color: 'var(--text)' }}>
                          {task.title}
                        </h4>
                        {task.price && (
                          <span style={{ 
                            fontWeight: 600,
                            color: 'var(--accent)'
                          }}>
                            {task.price} {CURRENCY_SYMBOL}
                          </span>
                        )}
                      </div>
                      <p style={{ 
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        margin: 0
                      }}>
                        {task.description.substring(0, 100)}
                        {task.description.length > 100 && '...'}
                      </p>
                      {task.category && (
                        <span style={{
                          display: 'inline-block',
                          marginTop: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: 'var(--accent)',
                          background: 'var(--accent-light)',
                          padding: '4px 12px',
                          borderRadius: '12px'
                        }}>
                          {task.category.name}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px' }}>
                {t('profile.reviewsTitle') || 'Reviews'}
              </h2>
              
              {allReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
                  <p style={{ color: 'var(--text-muted)' }}>{t('profile.noReviews') || 'No reviews yet'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {allReviews.map((review: any) => (
                    <div 
                      key={review.id}
                      style={{
                        padding: '20px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <div style={{ fontWeight: 600 }}>
                          {review.author.name || review.author.email}
                        </div>
                        <div style={{ 
                          color: 'var(--accent)',
                          fontWeight: 600
                        }}>
                          {'⭐'.repeat(review.rating)}
                        </div>
                      </div>
                      <p style={{ 
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '100px' }}>
            {!isOwnProfile && (
              <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                <button 
                  className="btn" 
                  style={{ 
                    width: '100%',
                    background: 'var(--accent)',
                    color: 'white',
                    fontWeight: 600,
                    padding: '14px 24px',
                    fontSize: '1rem'
                  }}
                  onClick={handleHire}
                >
                  {t('profile.hire') || 'Hire'}
                </button>
              </div>
            )}

            {profile?.verified && (
              <div className="card" style={{ padding: '20px', background: 'var(--accent-light)' }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <CheckCircle2 size={18} />
                  <h4 style={{ margin: 0, color: 'var(--accent)' }}>{t('profile.verifiedUser') || 'Verified User'}</h4>
                </div>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {t('profile.verifiedDescription') || 'This user has been verified and is trusted by the community'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
