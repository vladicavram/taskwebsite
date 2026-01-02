'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useLocale from '../../../lib/locale'
import { MessageCircle, Check, X } from 'lucide-react'
import Chat from '../../../components/Chat'

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { locale, t } = useLocale()
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return // Wait for session to load
    if (!session?.user) {
      router.push(`/${locale}/login`)
      return
    }
    fetchConversations()
  }, [session, status])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const markConversationAsRead = async (conv: any) => {
    try {
      if (conv.type === 'direct') {
        // Mark all messages from this partner as read
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            partnerId: conv.partner.id,
            markAllRead: true 
          })
        })
      } else {
        // Mark all messages in this application as read
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            applicationId: conv.application.id,
            markAllRead: true 
          })
        })
      }
      // Refresh conversations to update unread counts
      fetchConversations()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const openConversation = (conv: any) => {
    setSelectedConversation(conv)
    setShowModal(true)
    // Mark as read when opening
    if (conv.unreadCount > 0) {
      markConversationAsRead(conv)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return t('chat.justNow') || 'Just now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
        <p>{t('messages.loading') || 'Loading messages...'}</p>
      </div>
    )
  }

  return (
    <div>
      <section className="liquid-hero" style={{
        padding: '48px 24px',
        marginBottom: '48px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageCircle size={28} />
            {t('messages.title') || 'Messages'}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            {t('messages.subtitle') || 'Your conversations with task creators and applicants'}
          </p>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '900px' }}>
        {conversations.length === 0 ? (
          <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💬</div>
            <h3 style={{ marginBottom: '8px' }}>{t('messages.noConversations') || 'No conversations yet'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {t('messages.noConversationsText') || 'Conversations start when you accept or get accepted for a task'}
            </p>
            <Link href={`/${locale}/tasks`} className="btn">
              {t('messages.browseTasks') || 'Browse Tasks'}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {conversations.map((conv, idx) => {
              // Handle both task-based and direct conversations
              let otherUser, conversationLink, taskTitle
              
              if (conv.type === 'direct') {
                otherUser = conv.partner
                conversationLink = '#'
                taskTitle = t('messages.supportConversation') || 'Support Request'
              } else {
                const isApplicant = !!(session?.user?.email && conv.application.applicant?.email === session.user.email)
                otherUser = isApplicant 
                  ? conv.application.task.creator 
                  : conv.application.applicant
                conversationLink = `/${locale}/applications/${conv.application.id}`
                taskTitle = conv.application.task.title
              }

              const cardContent = (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--accent-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    {otherUser?.image ? (
                      <img src={otherUser.image} alt={otherUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (otherUser?.name || otherUser?.email || 'U')[0].toUpperCase()
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                        {otherUser?.name || 'Anonymous'}
                      </h3>
                      {conv.lastMessage && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {taskTitle}
                    </div>

                    {conv.lastMessage && (
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {conv.lastMessage.content}
                      </div>
                    )}
                  </div>

                  {conv.unreadCount > 0 && (
                    <div style={{
                      background: 'var(--danger)',
                      color: 'var(--danger-contrast)',
                      borderRadius: '12px',
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      minWidth: '24px',
                      textAlign: 'center'
                    }}>
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              )

              // For support messages, we need to implement a chat interface
              // For now, make them clickable to show they're interactive
              const key = conv.type === 'direct' ? `direct-${conv.partner.id}` : `task-${conv.application.id}`
              
              return (
                <div
                  key={key}
                  className="card"
                  onClick={() => openConversation(conv)}
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    background: conv.unreadCount > 0 ? 'var(--accent-light)' : 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                >
                  {cardContent}
                  {conv.unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        markConversationAsRead(conv)
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-dark)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
                    >
                      <Check size={14} />
                      {t('messages.markAsRead') || 'Mark as Read'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal for viewing conversation */}
      {showModal && selectedConversation && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 9998,
              backdropFilter: 'blur(4px)'
            }}
          />
          
          {/* Modal */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '85vh',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-secondary)'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', marginBottom: '4px' }}>
                  {selectedConversation.type === 'direct' 
                    ? (selectedConversation.partner?.name || 'Support')
                    : (selectedConversation.application?.task?.title || 'Conversation')}
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {selectedConversation.type === 'direct' 
                    ? (t('messages.supportConversation') || 'Support Request')
                    : (t('messages.taskConversation') || 'Task Discussion')}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Chat Component */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {selectedConversation.type === 'direct' ? (
                <Chat 
                  partnerId={selectedConversation.partner.id}
                  receiverName={selectedConversation.partner.name || selectedConversation.partner.email}
                />
              ) : (
                <Chat 
                  applicationId={selectedConversation.application.id}
                  taskId={selectedConversation.application.task.id}
                  receiverId={
                    session?.user?.email === selectedConversation.application.applicant?.email
                      ? selectedConversation.application.task.creator.id
                      : selectedConversation.application.applicant.id
                  }
                  receiverName={
                    session?.user?.email === selectedConversation.application.applicant?.email
                      ? selectedConversation.application.task.creator.name || selectedConversation.application.task.creator.email
                      : selectedConversation.application.applicant.name || selectedConversation.application.applicant.email
                  }
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
