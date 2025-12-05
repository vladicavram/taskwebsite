'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import useLocale from '../lib/locale'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  read: boolean
}

interface ChatProps {
  applicationId: string
  taskId: string
  receiverId: string
  receiverName: string
}

export default function Chat({ applicationId, taskId, receiverId, receiverName }: ChatProps) {
  const { data: session } = useSession()
  const { t } = useLocale()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Fetch current user ID
    const fetchUserId = async () => {
      try {
        const res = await fetch('/api/users/me')
        if (res.ok) {
          const userData = await res.json()
          setCurrentUserId(userData.id)
        }
      } catch (error) {
        console.error('Error fetching user ID:', error)
      }
    }
    fetchUserId()
  }, [])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [applicationId])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?applicationId=${applicationId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || loading) return

    setLoading(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          receiverId,
          taskId,
          applicationId
        })
      })

      if (res.ok) {
        const message = await res.json()
        setMessages([...messages, message])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
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
    if (minutes < 60) return `${minutes}${t('chat.minutesAgo')?.includes('{{count}}') ? t('chat.minutesAgo').replace('{{count}}', String(minutes)) : 'm ago'}`
    if (hours < 24) return `${hours}${t('chat.hoursAgo')?.includes('{{count}}') ? t('chat.hoursAgo').replace('{{count}}', String(hours)) : 'h ago'}`
    if (days < 7) return `${days}${t('chat.daysAgo')?.includes('{{count}}') ? t('chat.daysAgo').replace('{{count}}', String(days)) : 'd ago'}`
    return date.toLocaleDateString()
  }

  if (!session?.user) return null

  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '500px'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>💬 {t('chat.chatWith') || 'Chat with'} {receiverName}</h3>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
            <p>{t('chat.noMessages') || 'No messages yet. Start the conversation!'}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSender = msg.senderId === currentUserId
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: isSender ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius)',
                    background: isSender ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: isSender ? 'white' : 'var(--text)',
                    wordWrap: 'break-word'
                  }}
                >
                  <p style={{ margin: '0 0 6px 0' }}>{msg.content}</p>
                  <div style={{
                    fontSize: '0.75rem',
                    opacity: 0.8,
                    textAlign: 'right'
                  }}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} style={{
        padding: '16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('chat.typePlaceholder') || "Type a message..."}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="btn"
            style={{
              padding: '12px 24px',
              opacity: loading || !newMessage.trim() ? 0.6 : 1,
              cursor: loading || !newMessage.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '...' : (t('chat.send') || 'Send')}
          </button>
        </div>
      </form>
    </div>
  )
}
