"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import useLocale from '../lib/locale'
import { useSession, signOut } from 'next-auth/react'
import { MessageCircle, Bell, Coins, Menu, X } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
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
  const [userType, setUserType] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileNotifications, setShowMobileNotifications] = useState(false)
  
  const messagesRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const creditsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // No click-outside handler needed for hover-based menus

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/users/credits')
      if (response.ok) {
        const data = await response.json()
        setCredits(data.credits || 0)
      } else {
        setCredits(0)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
      setCredits(0)
    }
  }

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin || data.role === 'admin' || data.role === 'moderator')
        setUserType(data.userType || null)
      } else {
        setIsAdmin(false)
        setUserType(null)
      }
    } catch (error) {
      console.error('Failed to check admin status:', error)
      setIsAdmin(false)
      setUserType(null)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setNotifications(data)
          setUnreadCount(data.filter((n: any) => !n.read).length)
        } else {
          console.error('Notifications response is not an array:', data)
          setNotifications([])
          setUnreadCount(0)
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setConversations(data)
          const totalUnread = data.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0)
          setUnreadMessagesCount(totalUnread)
        } else {
          console.error('Conversations response is not an array:', data)
          setConversations([])
          setUnreadMessagesCount(0)
        }
      }
    } catch (error) {
      console.error('Failed to fetch unread messages:', error)
      setConversations([])
      setUnreadMessagesCount(0)
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
    } else if (notification.type === 'message') {
      // Support message notification - redirect to messages page
      router.push(`/${locale}/messages`)
    } else if (notification.type === 'hire_request' && notification.taskId) {
      // Hire request - redirect to the task detail page
      router.push(`/${locale}/tasks/${notification.taskId}`)
    }
  }

  function interpolate(template: string, vars: Record<string,string|number>): string {
    return template.replace(/{{(\w+)}}/g, (_, key) => String(vars[key] ?? ''))
  }

  function translatedNotificationContent(notification: any): string {
    try {
      if (!notification) return ''
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
    } catch (error) {
      console.error('Error translating notification:', error)
      return notification?.content || ''
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchNotifications().catch(err => console.error('Initial notifications fetch failed:', err))
      fetchUnreadMessages().catch(err => console.error('Initial messages fetch failed:', err))
      fetchCredits().catch(err => console.error('Initial credits fetch failed:', err))
      checkAdmin().catch(err => console.error('Initial admin check failed:', err))
      
      // Poll for new data every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications().catch(err => console.error('Polling notifications failed:', err))
        fetchUnreadMessages().catch(err => console.error('Polling messages failed:', err))
        fetchCredits().catch(err => console.error('Polling credits failed:', err))
      }, 30000)
      
      // Listen for credit update events
      const handleCreditsUpdate = () => {
        fetchCredits().catch(err => console.error('Credits update failed:', err))
      }
      window.addEventListener('creditsUpdated', handleCreditsUpdate)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('creditsUpdated', handleCreditsUpdate)
      }
    }
  }, [session])

  return (
    <>
      <header style={{ 
        width: '100%', 
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        boxShadow: 'var(--shadow-sm)',
        position: 'fixed',
        top: 0,
        zIndex: 100
      }}>
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '16px 24px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile Menu Button - Hidden by default, shown on mobile */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="mobile-menu-button"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: 'var(--text)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Menu"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>

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
        
        {/* Center Action Buttons */}
        {session?.user && (
          <div className="desktop-center-buttons" style={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <Link 
              href={`/${locale}/tasks`}
              className="btn"
              style={{ 
                padding: '8px 16px',
                fontSize: '0.9rem',
                background: pathname?.includes('/tasks') && !pathname?.includes('/tasks/create') ? 'var(--text)' : 'white',
                color: pathname?.includes('/tasks') && !pathname?.includes('/tasks/create') ? 'white' : 'var(--text)',
                border: '1px solid var(--border)'
              }}
            >
              {t('header.browseTasks') || 'Browse Tasks'}
            </Link>
            <Link 
              href={`/${locale}/hire`}
              className="btn"
              style={{ 
                padding: '8px 16px',
                fontSize: '0.9rem',
                background: pathname?.includes('/hire') ? 'var(--text)' : 'white',
                color: pathname?.includes('/hire') ? 'white' : 'var(--text)',
                border: '1px solid var(--border)'
              }}
            >
              {t('header.hire') || 'Hire'}
            </Link>
            <Link 
              href={`/${locale}/tasks/create`}
              className="btn"
              style={{ 
                padding: '8px 16px',
                fontSize: '0.9rem',
                background: pathname?.includes('/tasks/create') ? 'var(--text)' : 'white',
                color: pathname?.includes('/tasks/create') ? 'white' : 'var(--text)',
                border: '1px solid var(--border)'
              }}
            >
              {t('header.postTask') || 'Post a Task'}
            </Link>
          </div>
        )}
        
        <nav className="desktop-nav" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {session?.user ? (
            <>
              {/* User Controls */}
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

              {/* Credits Coin (swapped after avatar) - only show for taskers */}
              {(userType === 'tasker' || userType === 'both') && (
              <div 
                ref={creditsRef} 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowCredits(true)}
                onMouseLeave={() => setShowCredits(false)}
              >
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  🪙
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
                        {credits.toFixed(0)} 🪙
                      </div>
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
              )}

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
                        {conversations.map((conv) => {
                          if (!conv) return null
                          
                          // Handle both task-based and direct conversations
                          const isDirectMessage = conv.type === 'direct'
                          const title = isDirectMessage 
                            ? (t('messages.supportConversation') || 'Support Request')
                            : conv.application?.task?.title
                          const conversationId = isDirectMessage 
                            ? `direct-${conv.partner?.id}`
                            : conv.application?.id
                          
                          if (!title || !conversationId) return null
                          
                          return (
                          <Link
                            key={conversationId}
                            href={`/${locale}/messages`}
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
                                {title}
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
                        )})}
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
            </>
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
                onClick={() => router.push(`/${locale}/signup`)}
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

      {/* Mobile Slide-out Menu - Rendered outside header to avoid z-index stacking issues */}
      {showMobileMenu && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShowMobileMenu(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 99998
            }}
          />
          
          {/* Slide-out Panel */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              maxWidth: '85vw',
              background: 'white',
              boxShadow: '2px 0 20px rgba(0,0,0,0.2)',
              zIndex: 99999,
              overflowY: 'auto',
              padding: '20px',
              animation: 'slideInFromLeft 0.3s ease-out'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowMobileMenu(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'var(--text)'
              }}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            {/* Logo */}
            <Link 
              href={session?.user ? `/${locale}/tasks` : `/${locale}`}
              onClick={() => setShowMobileMenu(false)}
              style={{ 
                marginBottom: '32px', 
                marginTop: '8px',
                display: 'block',
                textDecoration: 'none'
              }}
            >
              <img
                src="/logo-dozo-text.svg?v=3"
                alt="Dozo"
                width="140"
                height="40"
                style={{ height: 'auto', width: '140px' }}
              />
            </Link>

            {session?.user ? (
              <>
                {/* User Info */}
                <div style={{ 
                  marginBottom: '24px',
                  padding: '16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '1.1rem'
                    }}>
                      {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '0.95rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {session.user.name || session.user.email}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {credits} {t('header.credits.unit') || 'credits'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div style={{ marginBottom: '24px' }}>
                  <Link
                    href={`/${locale}/tasks`}
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      display: 'block',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: pathname?.includes('/tasks') && !pathname?.includes('/tasks/create') ? 'white' : 'var(--text)',
                      background: pathname?.includes('/tasks') && !pathname?.includes('/tasks/create') ? 'var(--accent)' : 'transparent',
                      fontWeight: pathname?.includes('/tasks') && !pathname?.includes('/tasks/create') ? '600' : '500'
                    }}
                  >
                    {t('header.browseTasks') || 'Browse Tasks'}
                  </Link>
                  <Link
                    href={`/${locale}/hire`}
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      display: 'block',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: pathname?.includes('/hire') ? 'white' : 'var(--text)',
                      background: pathname?.includes('/hire') ? 'var(--accent)' : 'transparent',
                      fontWeight: pathname?.includes('/hire') ? '600' : '500'
                    }}
                  >
                    {t('header.hire') || 'Find Workers'}
                  </Link>
                  <Link
                    href={`/${locale}/tasks/create`}
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      display: 'block',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: pathname?.includes('/tasks/create') ? 'white' : 'var(--text)',
                      background: pathname?.includes('/tasks/create') ? 'var(--accent)' : 'transparent',
                      fontWeight: pathname?.includes('/tasks/create') ? '600' : '500'
                    }}
                  >
                    {t('header.postTask') || 'Post a Task'}
                  </Link>
                </div>

                {/* Account Section */}
                <div style={{ 
                  borderTop: '1px solid var(--border)',
                  paddingTop: '20px'
                }}>
                  <Link
                    href={`/${locale}/profile/my-tasks`}
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      display: 'block',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: pathname?.includes('/profile/my-tasks') ? 'white' : 'var(--text)',
                      background: pathname?.includes('/profile/my-tasks') ? 'var(--accent)' : 'transparent',
                      fontWeight: pathname?.includes('/profile/my-tasks') ? '600' : '500'
                    }}
                  >
                    {t('header.myTasks') || 'My Tasks'}
                  </Link>
                  <Link
                    href={`/${locale}/profile/account`}
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      display: 'block',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'var(--text)',
                      fontWeight: '500'
                    }}
                  >
                    {t('header.account') || 'My Profile'}
                  </Link>
                  <Link
                    href={`/${locale}/messages`}
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'var(--text)',
                      fontWeight: '500'
                    }}
                  >
                    <span>{t('header.messages') || 'Chat'}</span>
                    {unreadMessagesCount > 0 && (
                      <span style={{
                        background: 'var(--error)',
                        color: 'white',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}>
                        {unreadMessagesCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => setShowMobileNotifications(!showMobileNotifications)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'var(--text)',
                      fontWeight: '500',
                      width: '100%',
                      background: showMobileNotifications ? 'var(--bg-secondary)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      fontSize: '1rem'
                    }}
                  >
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <>
                        <span style={{
                          position: 'absolute',
                          left: '10px',
                          top: '14px',
                          width: '8px',
                          height: '8px',
                          background: '#ef4444',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }} />
                        <span style={{
                          background: 'var(--error)',
                          color: 'white',
                          borderRadius: '12px',
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}>
                          {unreadCount}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Mobile Notifications List */}
                  {showMobileNotifications && (
                    <div style={{
                      marginBottom: '16px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      padding: '8px',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      {notifications.length === 0 ? (
                        <div style={{ 
                          padding: '24px 16px', 
                          textAlign: 'center', 
                          color: 'var(--text-muted)',
                          fontSize: '0.875rem'
                        }}>
                          {t('header.notifications.empty') || 'No notifications yet'}
                        </div>
                      ) : (
                        <>
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
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--accent)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                padding: '8px',
                                textAlign: 'right',
                                fontWeight: '500'
                              }}
                            >
                              {t('header.notifications.markAllRead') || 'Mark all read'}
                            </button>
                          )}
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => {
                                handleNotificationClick(notification)
                                setShowMobileMenu(false)
                                setShowMobileNotifications(false)
                              }}
                              style={{
                                padding: '10px 12px',
                                marginBottom: '4px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                background: notification.read ? 'white' : 'var(--accent-light)',
                                fontSize: '0.85rem'
                              }}
                            >
                              <div style={{ marginBottom: '4px' }}>
                                {translatedNotificationContent(notification)}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/${locale}/profile/credits/purchase`}
                    onClick={() => setShowMobileMenu(false)}
                    style={{
                      display: 'block',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'var(--text)',
                      fontWeight: '500'
                    }}
                  >
                    {t('header.buyCredits') || 'Add Credits'}
                  </Link>
                  {isAdmin && (
                    <Link
                      href={`/${locale}/admin`}
                      onClick={() => setShowMobileMenu(false)}
                      style={{
                        display: 'block',
                        padding: '14px 16px',
                        marginBottom: '8px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'var(--accent)',
                        fontWeight: '600',
                        background: 'rgba(0,0,0,0.03)'
                      }}
                    >
                      {t('header.adminPanel') || 'Admin Panel'}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      signOut({ callbackUrl: `/${locale}` })
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginTop: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--error)',
                      background: 'transparent',
                      color: 'var(--error)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    {t('auth.logout') || 'Logout'}
                  </button>
                  
                  {/* Language Switcher */}
                  <div style={{ 
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border)'
                  }}>
                    <LanguageSwitcher />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Guest Menu */}
                <div style={{ paddingTop: '20px' }}>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      router.push(`/${locale}/login`)
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      marginBottom: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'white',
                      color: 'var(--text)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    {t('auth.login') || 'Login'}
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      router.push(`/${locale}/signup`)
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--accent)',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    {t('auth.signup') || 'Sign Up'}
                  </button>
                  
                  {/* Language Switcher */}
                  <div style={{ 
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--border)'
                  }}>
                    <LanguageSwitcher />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}
