"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Chat from '../../../../components/Chat'
import { MessageCircle, User, Mail, Phone } from 'lucide-react'
import { CURRENCY_SYMBOL } from '../../../../lib/constants'
import useLocale from '../../../../lib/locale'

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { t, locale } = useLocale()
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [counterOfferPrice, setCounterOfferPrice] = useState('')
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [offerSent, setOfferSent] = useState(false)
  const applicationId = params?.id

  useEffect(() => {
    fetchApplication()
    // fetch current user's credits for client-side checks
    ;(async () => {
      try {
        const res = await fetch('/api/users/credits')
        if (res.ok) {
          const data = await res.json()
          setUserCredits(data.credits || 0)
        }
      } catch (e) {
        // ignore
      }
    })()
  }, [applicationId])

  const fetchApplication = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const notifications = await response.json()
        const notification = notifications.find((n: any) => n.applicationId === applicationId)
        if (notification?.application) {
          setApplication(notification.application)
        } else {
          setError('Application not found')
        }
      } else {
        setError('Failed to load application')
      }
    } catch (err) {
      setError('Failed to load application')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (status: 'accepted' | 'declined') => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        alert(`Application ${status}!`)
        fetchApplication()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update application')
      }
    } catch (err) {
      alert('Failed to update application')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCounterOffer = async () => {
    if (!counterOfferPrice || parseFloat(counterOfferPrice) <= 0) {
      alert('Please enter a valid price')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/counter-offer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposedPrice: parseFloat(counterOfferPrice) })
      })

      if (response.ok) {
        setOfferSent(true)
        setShowCounterOffer(false)
        setCounterOfferPrice('')
        setTimeout(() => setOfferSent(false), 3000)
        fetchApplication()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to send counter-offer')
      }
    } catch (err) {
      alert('Failed to send counter-offer')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
        <p>Loading application...</p>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px', marginTop: '48px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>❌</div>
          <h2>{error || (t('application.notFound') || 'Application not found')}</h2>
          <Link href={`/${locale}/profile/account`} className="btn" style={{ marginTop: '24px' }}>
            {t('application.backToAccount') || 'Back to Account'}
          </Link>
        </div>
      </div>
    )
  }

  const isTaskCreator = session?.user?.email === application.task.creator?.email
  const userEmail = session?.user?.email
  const receivedCounterOffer = application.lastProposedBy && application.lastProposedBy !== userEmail

  return (
    <div>
      <section className="liquid-hero" style={{
        padding: '48px 24px',
        marginBottom: '48px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--text)' }}>
            Task Application
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Review applicant details
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{
          padding: '16px 24px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '24px',
          background: 
            application.status === 'accepted' ? '#d1fae5' :
            application.status === 'declined' ? '#fee2e2' :
            '#fef3c7',
          border: `1px solid ${
            application.status === 'accepted' ? '#10b981' :
            application.status === 'declined' ? '#ef4444' :
            '#f59e0b'
          }`,
          color: 
            application.status === 'accepted' ? '#065f46' :
            application.status === 'declined' ? '#991b1b' :
            '#92400e',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Status: {application.status.toUpperCase()}
        </div>

        <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>Task Details</h2>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '8px' }}>
              {application.task.title}
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {application.task.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            {application.task.price && (
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {application.proposedPrice && application.proposedPrice !== application.task.price ? 'Original Price' : 'Price'}
                </div>
                <div style={{ 
                  fontSize: application.proposedPrice && application.proposedPrice !== application.task.price ? '1.5rem' : '1.75rem',
                  fontWeight: 700,
                  color: application.proposedPrice && application.proposedPrice !== application.task.price ? 'var(--text-muted)' : 'var(--accent)',
                  textDecoration: application.proposedPrice && application.proposedPrice !== application.task.price ? 'line-through' : 'none'
                }}>
                  {application.task.price} {CURRENCY_SYMBOL}
                </div>
              </div>
            )}
            {application.proposedPrice && application.proposedPrice !== application.task.price && (
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Proposed Price
                </div>
                <div style={{ 
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--accent)'
                }}>
                  {application.proposedPrice} {CURRENCY_SYMBOL}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '24px' }}>Applicant Information</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 600,
              color: 'var(--accent)',
              overflow: 'hidden'
            }}>
              {application.applicant.image ? (
                <img src={application.applicant.image} alt={application.applicant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (application.applicant.name || application.applicant.email || 'A')[0].toUpperCase()
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '4px' }}>
                {application.applicant.name || 'Anonymous'}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {application.applicant.email}
              </div>
              {application.applicant.username && (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  @{application.applicant.username}
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border)',
            fontSize: '0.875rem',
            color: 'var(--text-muted)'
          }}>
            Applied on {new Date(application.createdAt).toLocaleDateString()} at {new Date(application.createdAt).toLocaleTimeString()}
          </div>
        </div>

        {isTaskCreator && application.status === 'pending' && (
          <div className="card" style={{ padding: '32px' }}>
            {offerSent ? (
              <div style={{
                padding: '24px',
                background: 'var(--accent-light)',
                border: '2px solid var(--accent)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                ✓ Offer Sent
              </div>
            ) : (
              <>
                <h3 style={{ marginBottom: '16px' }}>Review Application</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  Accept the proposed price of {application.proposedPrice || application.task.price} {CURRENCY_SYMBOL}, make a counter-offer, or decline the application.
                </p>
                
                {!showCounterOffer ? (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleAction('accepted')}
                      disabled={actionLoading}
                      className="btn"
                      style={{ 
                        flex: 1,
                        padding: '14px',
                        fontSize: '1.1rem',
                        opacity: actionLoading ? 0.6 : 1
                      }}
                    >
                      ✓ Accept {application.proposedPrice || application.task.price} {CURRENCY_SYMBOL}
                    </button>
                    <button
                      onClick={() => setShowCounterOffer(true)}
                      disabled={actionLoading}
                      className="btn btn-secondary"
                      style={{ 
                        flex: 1,
                        padding: '14px',
                        fontSize: '1.1rem'
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={16} /> Counter-Offer
                      </span>
                    </button>
                    <button
                      onClick={() => handleAction('declined')}
                      disabled={actionLoading}
                      className="btn"
                      style={{ 
                        flex: 1,
                        padding: '14px',
                        fontSize: '1.1rem',
                        background: '#ef4444',
                        opacity: actionLoading ? 0.6 : 1
                      }}
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}>
                      Your Counter-Offer Price ($)
                    </label>
                    <input
                      type="number"
                      value={counterOfferPrice}
                      onChange={(e) => setCounterOfferPrice(e.target.value)}
                      placeholder={`Current: ${application.proposedPrice || application.task.price}`}
                      min="0"
                      step="0.01"
                      style={{ 
                        width: '100%',
                        padding: '12px',
                        fontSize: '1.1rem',
                        marginBottom: '12px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={handleCounterOffer}
                        disabled={actionLoading}
                        className="btn"
                        style={{ 
                          flex: 1,
                          opacity: actionLoading ? 0.6 : 1
                        }}
                      >
                        Send Counter-Offer
                      </button>
                      <button
                        onClick={() => {
                          setShowCounterOffer(false)
                          setCounterOfferPrice('')
                        }}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!isTaskCreator && application.status === 'accepted' && (
          <>
            <div className="card" style={{ padding: '32px', background: '#d1fae5', border: '2px solid #10b981', marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#065f46' }}>Congratulations! Your application was accepted</h3>
              <p style={{ color: '#065f46', marginBottom: '24px', fontWeight: 500 }}>
                You can now contact the task creator to coordinate the details.
              </p>
              
              <div style={{ 
                background: 'white',
                padding: '24px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px'
              }}>
                <h4 style={{ marginBottom: '16px' }}>Task Creator Contact Information</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px',
                      height: '40px',
                      background: 'var(--accent-light)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Name</div>
                      <div style={{ fontWeight: 600 }}>{application.task.creator?.name || 'Anonymous'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px',
                      height: '40px',
                      background: 'var(--accent-light)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email</div>
                      <a href={`mailto:${application.task.creator?.email}`} style={{ fontWeight: 600, color: 'var(--accent)' }}>
                        {application.task.creator?.email}
                      </a>
                    </div>
                  </div>

                  {application.task.creator?.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px',
                        height: '40px',
                        background: 'var(--accent-light)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Phone size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Phone</div>
                        <a href={`tel:${application.task.creator.phone}`} style={{ fontWeight: 600, color: 'var(--accent)' }}>
                          {application.task.creator.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Chat
              applicationId={application.id}
              taskId={application.task.id}
              receiverId={application.task.creatorId}
              receiverName={application.task.creator?.name || 'Task Creator'}
            />
          </>
        )}

        {isTaskCreator && application.status === 'accepted' && (
          <Chat
            applicationId={application.id}
            taskId={application.task.id}
            receiverId={application.applicantId}
            receiverName={application.applicant?.name || 'Applicant'}
          />
        )}

        {!isTaskCreator && application.status === 'pending' && (
          <div className="card" style={{ padding: '32px' }}>
            {offerSent ? (
              <div style={{
                padding: '24px',
                background: 'var(--accent-light)',
                border: '2px solid var(--accent)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                ✓ Offer Sent
              </div>
            ) : (
              <>
                <h3 style={{ marginBottom: '16px' }}>
                  {receivedCounterOffer ? 'Counter-Offer Received' : 'Pending Review'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  {receivedCounterOffer
                    ? `The task creator proposed: ${application.proposedPrice} ${CURRENCY_SYMBOL}. You can accept, decline, or send a counter-offer.`
                    : `Your application is being reviewed. Current proposed price: ${application.proposedPrice || application.task.price} ${CURRENCY_SYMBOL}`
                  }
                </p>
                
                {!showCounterOffer ? (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {receivedCounterOffer ? (
                      <>
                        {(() => {
                          const requiredCredits = ((application.proposedPrice ?? application.task.price) || 0) / 100
                          const insufficient = userCredits !== null && userCredits < requiredCredits
                          return (
                            <button
                              onClick={() => handleAction('accepted')}
                              disabled={actionLoading || insufficient}
                              className="btn"
                              style={{ 
                                flex: 1,
                                padding: '14px',
                                fontSize: '1.1rem',
                                opacity: (actionLoading || insufficient) ? 0.6 : 1,
                                cursor: insufficient ? 'not-allowed' : 'pointer'
                              }}
                            >
                              ✓ Accept {application.proposedPrice} {CURRENCY_SYMBOL}
                            </button>
                          )
                        })()}
                        {/* Credit warning removed: do not display required-credit message here */}
                        <button
                          onClick={() => setShowCounterOffer(true)}
                          disabled={actionLoading}
                          className="btn btn-secondary"
                          style={{ 
                            flex: 1,
                            padding: '14px',
                            fontSize: '1.1rem'
                          }}
                        >
                          💬 Counter-Offer
                        </button>
                        <button
                          onClick={() => handleAction('declined')}
                          disabled={actionLoading}
                          className="btn"
                          style={{ 
                            flex: 1,
                            padding: '14px',
                            fontSize: '1.1rem',
                            background: '#ef4444',
                            opacity: actionLoading ? 0.6 : 1
                          }}
                        >
                          ✗ Decline
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowCounterOffer(true)}
                        className="btn"
                        style={{ flex: 1 }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <MessageCircle size={16} /> Update Price Offer
                        </span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontWeight: 600,
                      marginBottom: '8px'
                    }}>
                      Your Counter-Offer Price ($)
                    </label>
                    <input
                      type="number"
                      value={counterOfferPrice}
                      onChange={(e) => setCounterOfferPrice(e.target.value)}
                      placeholder={`Current: ${application.proposedPrice || application.task.price}`}
                      min="0"
                      step="0.01"
                      style={{ 
                        width: '100%',
                        padding: '12px',
                        fontSize: '1.1rem',
                        marginBottom: '12px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={handleCounterOffer}
                        disabled={actionLoading}
                        className="btn"
                        style={{ 
                          flex: 1,
                          opacity: actionLoading ? 0.6 : 1
                        }}
                      >
                        Send Counter-Offer
                      </button>
                      <button
                        onClick={() => {
                          setShowCounterOffer(false)
                          setCounterOfferPrice('')
                        }}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!isTaskCreator && application.status === 'declined' && (
          <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
            <div style={{
              padding: '16px',
              background: '#fee2e2',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #ef4444',
              color: '#991b1b',
              fontWeight: 500,
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              Unfortunately, your application was declined
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <Link 
                href={`/${locale}/tasks/${application.task.id}`} 
                className="btn"
                style={{ 
                  padding: '14px 24px',
                  fontSize: '1.1rem'
                }}
              >
                Apply Again
              </Link>
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link href={`/${locale}/profile/account`} className="btn btn-secondary">
            ← Back to Account
          </Link>
        </div>
      </div>
    </div>
  )
}
