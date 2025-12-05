'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useLocale from '../../../lib/locale'
import { MessageCircle } from 'lucide-react'

export default function MessagesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { locale, t } = useLocale()
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) {
      router.push(`/${locale}/login`)
      return
    }
    fetchConversations()
  }, [session])

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
            {conversations.map((conv) => {
              const isApplicant = !!(session?.user?.email && conv.application.applicant?.email === session.user.email)
              const otherUser = isApplicant 
                ? conv.application.task.creator 
                : conv.application.applicant

              return (
                <Link
                  key={conv.application.id}
                  href={`/${locale}/applications/${conv.application.id}`}
                  className="card"
                  style={{
                    padding: '20px',
                    textDecoration: 'none',
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
                        {conv.application.task.title}
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
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
