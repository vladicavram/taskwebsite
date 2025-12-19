'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getTranslation } from '../../../lib/locale'

export default function AdminPage() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'ro'
  const t = (key: string) => getTranslation(locale, key)
  
  const [activeTab, setActiveTab] = useState<'users' | 'tasks'>('users')
  const [users, setUsers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [messagingUser, setMessagingUser] = useState<any>(null)
  const [messageText, setMessageText] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [taskSearch, setTaskSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
    setLoading(true)
    try {
      if (activeTab === 'users') {
        const res = await fetch('/api/admin/users')
        const data = await res.json()
        if (Array.isArray(data)) {
          setUsers(data)
        } else {
          setUsers([])
          if (data && data.error) {
            alert((t('admin.error.loadUsers') || 'Failed to load users:') + ' ' + data.error)
          }
        }
      } else {
        const res = await fetch('/api/admin/tasks')
        const data = await res.json()
        if (Array.isArray(data)) {
          setTasks(data)
        } else {
          setTasks([])
          if (data && data.error) {
            alert((t('admin.error.loadTasks') || 'Failed to load tasks:') + ' ' + data.error)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      setUsers([])
      setTasks([])
    }
    setLoading(false)
  }

  async function deleteUser(id: string) {
    if (!confirm(t('admin.confirm.deleteUser') || 'Are you sure you want to delete this user? This will also delete all their tasks, applications, and related data.')) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadData()
        alert(t('admin.success.deleteUser') || 'User deleted successfully')
      } else {
        alert(t('admin.error.deleteUser') || 'Failed to delete user')
      }
    } catch (err) {
      alert(t('admin.error.deleteUser') || 'Error deleting user')
    }
  }

  async function toggleUserApproval(userId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canApply: !currentStatus })
      })
      if (res.ok) {
        loadData()
        alert(currentStatus ? (t('admin.success.revokeApply') || 'User application rights revoked') : (t('admin.success.approveApply') || 'User approved to apply for tasks'))
      } else {
        alert(t('admin.error.updateApproval') || 'Failed to update user approval status')
      }
    } catch (err) {
      alert(t('admin.error.updateApproval') || 'Error updating user approval')
    }
  }

  async function deleteTask(id: string) {
    if (!confirm(t('admin.confirm.deleteTask') || 'Are you sure you want to delete this task?')) return
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadData()
        alert(t('admin.success.deleteTask') || 'Task deleted successfully')
      } else {
        alert(t('admin.error.deleteTask') || 'Failed to delete task')
      }
    } catch (err) {
      alert(t('admin.error.deleteTask') || 'Error deleting task')
    }
  }

  async function saveUser(user: any) {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          username: user.username,
          credits: parseFloat(user.credits),
          role: user.role,
          isAdmin: user.role === 'admin',
          blocked: !!user.blocked
        })
      })
      if (res.ok) {
        setEditingUser(null)
        loadData()
        alert(t('admin.success.updateUser') || 'User updated successfully')
      } else {
        alert(t('admin.error.updateUser') || 'Failed to update user')
      }
    } catch (err) {
      alert(t('admin.error.updateUser') || 'Error updating user')
    }
  }

  async function saveTask(task: any) {
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          location: task.location,
          price: task.price ? parseFloat(task.price) : null,
          isOpen: task.isOpen
        })
      })
      if (res.ok) {
        setEditingTask(null)
        loadData()
        alert(t('admin.success.updateTask') || 'Task updated successfully')
      } else {
        alert(t('admin.error.updateTask') || 'Failed to update task')
      }
    } catch (err) {
      alert(t('admin.error.updateTask') || 'Error updating task')
    }
  }

  async function sendMessage() {
    if (!messageText.trim()) {
      alert(t('admin.error.messageEmpty') || 'Please enter a message')
      return
    }
    try {
      const res = await fetch('/api/admin/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: messagingUser.id,
          message: messageText
        })
      })
      if (res.ok) {
        setMessagingUser(null)
        setMessageText('')
        alert(t('admin.success.messageSent') || 'Message sent successfully')
      } else {
        alert(t('admin.error.messageSend') || 'Failed to send message')
      }
    } catch (err) {
      alert(t('admin.error.messageSend') || 'Error sending message')
    }
  }

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!userSearch.trim()) return true
    const search = userSearch.toLowerCase()
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.username?.toLowerCase().includes(search) ||
      user.id?.toLowerCase().includes(search)
    )
  })

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task => {
    if (!taskSearch.trim()) return true
    const search = taskSearch.toLowerCase()
    return (
      task.title?.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search) ||
      task.location?.toLowerCase().includes(search) ||
      task.id?.toLowerCase().includes(search)
    )
  })

  return (
    <div className="container" style={{ maxWidth: 1200, paddingTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>{t('header.adminPanel') || 'Admin Panel'}</h1>
        <Link href={`/${locale}`} className="btn btn-secondary">{t('admin.backToHome') || 'Back to Home'}</Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'users' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'users' ? 'white' : 'var(--text)',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--accent)' : 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 500
          }}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'tasks' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'tasks' ? 'white' : 'var(--text)',
            border: 'none',
            borderBottom: activeTab === 'tasks' ? '2px solid var(--accent)' : 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 500
          }}
        >
          Tasks ({tasks.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
      ) : (
        <>
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              {/* Users Search Bar */}
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder={t('admin.searchUsers') || 'Search users by name, email, username, or ID...'}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg)',
                    color: 'var(--text)'
                  }}
                />
                {userSearch && (
                  <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Found {filteredUsers.length} of {users.length} users
                  </div>
                )}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Username</th>
                      <th style={{ padding: 12, textAlign: 'center' }}>ID Photo</th>
                      <th style={{ padding: 12, textAlign: 'center' }}>Can Apply</th>
                      <th style={{ padding: 12, textAlign: 'right' }}>Credits</th>
                      <th style={{ padding: 12, textAlign: 'center' }}>Role</th>
                      <th style={{ padding: 12, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: 12 }}>{user.name || '-'}</td>
                        <td style={{ padding: 12 }}>{user.email}</td>
                        <td style={{ padding: 12 }}>
                          <Link 
                            href={`/${locale}/profile/${user.id}`}
                            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                          >
                            {user.username || '-'}
                          </Link>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          {user.idPhotoUrl ? (
                            <a 
                              href={user.idPhotoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                display: 'inline-block',
                                padding: '4px 8px',
                                background: '#0ea5e9',
                                color: 'white',
                                borderRadius: 4,
                                fontSize: '0.8rem',
                                textDecoration: 'none',
                                marginRight: '4px'
                              }}
                            >
                              📷 ID
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '4px' }}>No ID</span>
                          )}
                          {user.selfieUrl ? (
                            <a 
                              href={user.selfieUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                display: 'inline-block',
                                padding: '4px 8px',
                                background: '#8b5cf6',
                                color: 'white',
                                borderRadius: 4,
                                fontSize: '0.8rem',
                                textDecoration: 'none'
                              }}
                            >
                              🤳 Selfie
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No Selfie</span>
                          )}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button
                            onClick={() => toggleUserApproval(user.id, user.canApply)}
                            style={{
                              padding: '4px 12px',
                              borderRadius: 4,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              border: 'none',
                              cursor: 'pointer',
                              background: user.canApply ? '#10b981' : '#ef4444',
                              color: 'white'
                            }}
                          >
                            {user.canApply ? '✅ Yes' : '❌ No'}
                          </button>
                        </td>
                        <td style={{ padding: 12, textAlign: 'right' }}>{user.credits.toFixed(1)}</td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: user.role === 'admin' ? '#dc2626' : user.role === 'moderator' ? '#f59e0b' : '#10b981',
                            color: 'white'
                          }}>
                            {user.role === 'admin' ? '👑 Admin' : user.role === 'moderator' ? '🛡️ Moderator' : '👤 User'}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button
                            onClick={() => setMessagingUser(user)}
                            className="btn"
                            style={{ padding: '4px 8px', fontSize: '0.85rem', marginRight: 4, background: '#0ea5e9' }}
                          >
                            Message
                          </button>
                          <button
                            onClick={() => setEditingUser({ ...user })}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.85rem', marginRight: 4 }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="btn"
                            style={{ padding: '4px 8px', fontSize: '0.85rem', background: '#dc3545' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div>
              {/* Tasks Search Bar */}
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder={t('admin.searchTasks') || 'Search tasks by title, description, location, or ID...'}
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg)',
                    color: 'var(--text)'
                  }}
                />
                {taskSearch && (
                  <div style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Found {filteredTasks.length} of {tasks.length} tasks
                  </div>
                )}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: 12, textAlign: 'left' }}>Title</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Creator</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Location</th>
                      <th style={{ padding: 12, textAlign: 'right' }}>Price</th>
                      <th style={{ padding: 12, textAlign: 'center' }}>Status</th>
                      <th style={{ padding: 12, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: 12 }}>
                          <Link 
                            href={`/${locale}/tasks/${task.id}`}
                            style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                          >
                            {task.title}
                          </Link>
                        </td>
                        <td style={{ padding: 12 }}>{task.creator?.name || task.creator?.email || '-'}</td>
                        <td style={{ padding: 12 }}>{task.location || '-'}</td>
                        <td style={{ padding: 12, textAlign: 'right' }}>{task.price ? `${task.price} MDL` : '-'}</td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          {task.completedAt ? '✓ Done' : task.isOpen ? '◯ Open' : '✕ Closed'}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button
                            onClick={() => setEditingTask({ ...task })}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.85rem', marginRight: 4 }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="btn"
                            style={{ padding: '4px 8px', fontSize: '0.85rem', background: '#dc3545' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ padding: 24, maxWidth: 500, width: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Edit User</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>Name</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>Username</label>
                <input
                  type="text"
                  value={editingUser.username || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>Credits</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingUser.credits}
                  onChange={(e) => setEditingUser({ ...editingUser, credits: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>Role</label>
                <select
                  value={editingUser.role || 'user'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value, isAdmin: e.target.value === 'admin' })}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                >
                  <option value="user">👤 User - Regular access</option>
                  <option value="moderator">🛡️ Moderator - Can manage tasks and users</option>
                  <option value="admin">👑 Admin - Full access</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 8, padding: '8px 0' }}>
                <label htmlFor="blocked" style={{ fontSize: '0.95rem', fontWeight: 500, minWidth: 120 }}>
                  <span style={{ color: !!editingUser.blocked ? '#dc2626' : '#10b981', fontWeight: 600 }}>
                    {editingUser.blocked ? 'Blocked' : 'Active'}
                  </span>
                  <span style={{ marginLeft: 8, color: '#888', fontWeight: 400 }}>(prevent login)</span>
                </label>
                <input
                  type="checkbox"
                  id="blocked"
                  checked={!!editingUser.blocked}
                  onChange={e => setEditingUser({ ...editingUser, blocked: e.target.checked })}
                  style={{ width: 22, height: 22, accentColor: editingUser.blocked ? '#dc2626' : '#10b981', cursor: 'pointer' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => saveUser(editingUser)} className="btn">Save</button>
              <button onClick={() => setEditingUser(null)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ padding: 24, maxWidth: 600, width: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Edit Task</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>Title</label>
                <input
                  type="text"
                  value={editingTask.title || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>Description</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>Location</label>
                <input
                  type="text"
                  value={editingTask.location || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, location: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingTask.price || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, price: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="isOpen"
                  checked={editingTask.isOpen}
                  onChange={(e) => setEditingTask({ ...editingTask, isOpen: e.target.checked })}
                />
                <label htmlFor="isOpen" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Task is Open</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => saveTask(editingTask)} className="btn">Save</button>
              <button onClick={() => setEditingTask(null)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Message User Modal */}
      {messagingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ padding: 24, maxWidth: 500, width: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Send Message to {messagingUser.name || messagingUser.email}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', fontWeight: 500 }}>Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={6}
                  placeholder="Type your message here..."
                  style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={sendMessage} className="btn">Send</button>
              <button onClick={() => { setMessagingUser(null); setMessageText('') }} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
