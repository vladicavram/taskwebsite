"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import useLocale from '../lib/locale'
import { useSession, signOut } from 'next-auth/react'
import { MessageCircle, Bell, Coins } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const { t, locale } = useLocale()
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [conversations, setConversations] = useState<any[]>([])
  const [showMessages, setShowMessages] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [credits, setCredits] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [canApply, setCanApply] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  
  const messagesRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const creditsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
      fetchUnreadMessages()
      fetchCredits()
      checkAdmin()
      // Poll for new data every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications()
        fetchUnreadMessages()
        fetchCredits()
      }, 30000)
      
      // Listen for credit update events
      const handleCreditsUpdate = () => {
        fetchCredits()
      }
      window.addEventListener('creditsUpdated', handleCreditsUpdate)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('creditsUpdated', handleCreditsUpdate)
      }
    }
  }, [session])

  // No click-outside handler needed for hover-based menus

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/users/credits')
      if (response.ok) {
        const data = await response.json()
        setCredits(data.credits || 0)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    }
  }

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin || data.role === 'admin' || data.role === 'moderator')
        setCanApply(data.canApply || false)
        setIsBlocked(data.isBlocked || false)
      }
    } catch (error) {
      console.error('Failed to check admin status:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.read).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        const totalUnread = data.reduce((sum: number, conv: any) => sum + conv.unreadCount, 0)
        setUnreadMessagesCount(totalUnread)
      }
    } catch (error) {
      console.error('Failed to fetch unread messages:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    setShowNotifications(false)
    if (notification.applicationId) {
      router.push(`/${locale}/applications/${notification.applicationId}`)
    }
  }

  function interpolate(template: string, vars: Record<string,string|number>): string {
    return template.replace(/{{(\w+)}}/g, (_, key) => String(vars[key] ?? ''))
  }

  function translatedNotificationContent(notification: any): string {
    const taskTitle = notification.application?.task?.title || ''
    const applicantName = notification.application?.applicant?.name || notification.application?.applicant?.email || ''
    const senderName = notification.application?.lastProposedBy === notification.application?.task?.creatorId
      ? notification.application?.task?.creator?.name || notification.application?.task?.creator?.email || ''
      : notification.application?.applicant?.name || notification.application?.applicant?.email || ''
    const proposedPrice = notification.application?.proposedPrice || ''
    switch (notification.type) {
      case 'application_received':
        return interpolate(t('notification.applicationReceived'), { user: applicantName, task: taskTitle })
      case 'job_offer':
        return interpolate(t('notification.jobOffer'), { task: taskTitle, price: proposedPrice })
      case 'application_accepted':
        return interpolate(t('notification.applicationAccepted'), { task: taskTitle })
      case 'application_declined':
        return interpolate(t('notification.applicationDeclined'), { task: taskTitle })
      case 'price_counter_offer': {
        const variantKey = notification.application?.lastProposedBy === notification.application?.task?.creatorId
          ? 'notification.priceCounterOffer.creator'
          : 'notification.priceCounterOffer.applicant'
        return interpolate(t(variantKey), { sender: senderName, price: proposedPrice, task: taskTitle })
      }
      default:
        return notification.content || ''
    }
  }

  return (
    <header style={{ 
      width: '100%', 
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'saturate(180%) blur(16px)',
      WebkitBackdropFilter: 'saturate(180%) blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.35)',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '16px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link 
            href={session?.user ? `/${locale}/tasks` : `/${locale}`} 
            style={{ 
              textDecoration: 'none',
              color: 'var(--text)',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <img
              src="/logo-dozo-text.svg?v=3"
              alt="Dozo"
              width="175"
              height="50"
              style={{ height: 'auto', width: '175px' }}
            />
          </Link>
        </div>
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {session?.user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* User Avatar Menu (swapped into first position) */}
              <div 
                ref={userMenuRef} 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <button
                  style={{
                    background: 'var(--accent)',
                    border: '2px solid var(--text)',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'white',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = 'var(--shadow)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (session?.user?.name || session?.user?.email || 'U')[0].toUpperCase()
                  )}
                </button>
                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% - 4px)',
                    right: 0,
                    paddingTop: '8px',
                    width: '200px',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}>
                    <Link
                      href={`/${locale}/profile/my-tasks`}
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        textDecoration: 'none',
                        color: 'var(--text)',
                        borderBottom: '1px solid var(--border-light)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      {t('header.myTasks') || 'My Tasks'}
                    </Link>
                    {isAdmin && (
                      <Link
                        href={`/${locale}/admin`}
                        onClick={() => setShowUserMenu(false)}
                        style={{
                          display: 'block',
                          padding: '12px 16px',
                          textDecoration: 'none',
                          color: 'var(--text)',
                          borderBottom: '1px solid var(--border-light)',
                          transition: 'background 0.2s',
                          fontWeight: 600
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        ⚙️ {t('header.adminPanel') || 'Admin Panel'}
                      </Link>
                    )}
                    <Link
                      href={`/${locale}/profile/account`}
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        textDecoration: 'none',
                        color: 'var(--text)',
                        borderBottom: '1px solid var(--border-light)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      {t('header.account') || 'Account'}
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        signOut({ redirect: false }).then(() => {
                          window.location.href = `/${locale}`
                        })
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      {t('header.logout') || t('auth.logout') || 'Log out'}
                    </button>
                  </div>
                )}
              </div>

              {/* Approval Status Badge */}
              <div 
                style={{ 
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={
                  isBlocked 
                    ? (t('header.blocked') || 'Account blocked - cannot apply for tasks')
                    : !canApply 
                      ? (t('header.pendingApproval') || 'Pending admin approval to apply for tasks')
                      : credits <= 0
                        ? (t('header.noCredits') || 'No credits - cannot apply for tasks')
                        : (t('header.canApply') || 'Approved to apply for tasks')
                }
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: (canApply && !isBlocked && credits > 0) ? '#10b981' : '#ef4444',
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </div>

              {/* Credits Coin (swapped after avatar) */}
              <div 
                ref={creditsRef} 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowCredits(true)}
                onMouseLeave={() => setShowCredits(false)}
              >
                <button
                  style={{
                    background: 'white',
                    border: '2px solid var(--text)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = 'var(--shadow)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {credits.toFixed(1)}
                </button>
                {showCredits && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% - 4px)',
                    right: 0,
                    paddingTop: '8px',
                    width: '320px',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)',
                    zIndex: 1000,
                    padding: '20px'
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ marginBottom: '8px', fontSize: '1.125rem' }}>{t('header.credits.title') || 'Your Credits'}</h4>
                      <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: 700, 
                        color: 'var(--accent)',
                        marginBottom: '8px'
                      }}>
                        {credits.toFixed(1)} {t('header.credits.unit') || 'Credits'}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 0 }}>
                        {t('header.credits.exchange') || '1 credit = $100 task value'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Link
                        href={`/${locale}/profile/credits/purchase`}
                        className="btn"
                        style={{ textAlign: 'center', width: '100%' }}
                        onClick={() => setShowCredits(false)}
                      >
                        {t('header.credits.purchase') || 'Purchase Credits'}
                      </Link>
                      <Link
                        href={`/${locale}/profile/credits/history`}
                        className="btn btn-secondary"
                        style={{ textAlign: 'center', width: '100%' }}
                        onClick={() => setShowCredits(false)}
                      >
                        {t('header.credits.history') || 'View History'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Dropdown (moved after avatar) */}
              <div 
                ref={messagesRef} 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowMessages(true)}
                onMouseLeave={() => setShowMessages(false)}
              >
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    position: 'relative',
                    padding: '8px',
                    color: 'var(--text)'
                  }}
                >
                  <MessageCircle size={22} strokeWidth={2} />
                  {unreadMessagesCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'var(--danger)',
                      color: 'var(--danger-contrast)',
                      borderRadius: '10px',
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      minWidth: '18px',
                      textAlign: 'center'
                    }}>
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
                {showMessages && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% - 4px)',
                    right: 0,
                    paddingTop: '8px',
                    width: '380px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)',
                    zIndex: 1000
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      fontWeight: 600,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{t('header.messages.title') || 'Messages'}</span>
                      <Link
                        href={`/${locale}/messages`}
                        onClick={() => setShowMessages(false)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          color: 'var(--accent)',
                          letterSpacing: '0.5px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        {t('header.messages.inbox') || 'Go to Inbox →'}
                      </Link>
                    </div>
                    {conversations.length === 0 ? (
                      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {t('header.messages.empty') || 'No conversations yet'}
                      </div>
                    ) : (
                      <div>
                        {conversations.map((conv) => (
                          <Link
                            key={conv.application.id}
                            href={`/${locale}/messages?conversation=${conv.application.id}`}
                            onClick={() => setShowMessages(false)}
                            style={{
                              display: 'block',
                              padding: '12px 16px',
                              borderBottom: '1px solid var(--border-light)',
                              textDecoration: 'none',
                              color: 'inherit',
                              background: conv.unreadCount > 0 ? 'var(--accent-light)' : 'white',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = conv.unreadCount > 0 ? 'var(--accent-light)' : 'white' }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '4px'
                            }}>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                {conv.application.task.title}
                              </div>
                              {conv.unreadCount > 0 && (
                                <span style={{
                                  background: 'var(--danger)',
                                  color: 'var(--danger-contrast)',
                                  borderRadius: '10px',
                                  padding: '2px 6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700
                                }}>
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <div style={{ 
                                fontSize: '0.85rem', 
                                color: 'var(--text-secondary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {conv.lastMessage.content}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div 
                ref={notificationsRef} 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowNotifications(true)}
                onMouseLeave={() => setShowNotifications(false)}
              >
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    position: 'relative',
                    padding: '8px',
                    color: 'var(--text)'
                  }}
                >
                  <Bell size={22} strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'var(--danger)',
                      color: 'var(--danger-contrast)',
                      borderRadius: '10px',
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      minWidth: '18px',
                      textAlign: 'center'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% - 4px)',
                    right: 0,
                    paddingTop: '8px',
                    width: '380px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)',
                    zIndex: 1000
                  }}>
                    <div style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border)',
                      fontWeight: 600,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{t('header.notifications.title') || 'Notifications'}</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            await fetch('/api/notifications', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ markAllRead: true })
                            })
                            fetchNotifications()
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent)',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          {t('header.notifications.markAllRead') || 'Mark all read'}
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {t('header.notifications.empty') || 'No notifications yet'}
                      </div>
                    ) : (
                      <div>
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid var(--border-light)',
                              cursor: 'pointer',
                              background: notification.read ? 'white' : 'var(--accent-light)',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--bg-secondary)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = notification.read ? 'white' : 'var(--accent-light)'
                            }}
                          >
                            <div style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                              {translatedNotificationContent(notification)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <a 
                onClick={() => router.push(`/${locale}/login`)} 
                className="link" 
                style={{ 
                  cursor: 'pointer',
                  fontWeight: 500,
                  color: 'var(--text-secondary)'
                }}
              >
                {t('auth.login') || 'Login'}
              </a>
              <a
                onClick={() => router.push(`/${locale}/profile/create`)}
                className="link"
                style={{
                  cursor: 'pointer',
                  fontWeight: 500,
                  color: 'var(--accent)'
                }}
              >
                {t('auth.signup') || 'Sign Up'}
              </a>
            </div>
          )}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
