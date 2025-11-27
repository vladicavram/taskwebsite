"use client"
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import PostTaskButton from './PostTaskButton'
import useLocale from '../lib/locale'

export default function UserPanel() {
  const { data: session } = useSession()
  const { t, locale } = useLocale()

  if (!session?.user) return null

  const name = session.user.name || session.user.email || 'User'
  const avatar = session.user.image

  return (
    <aside style={{ width: 280, marginRight: 24 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            {avatar ? (
              <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{name[0].toUpperCase()}</div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{name}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{session.user.email}</div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href={`/${locale}/profile/my-tasks`} className="btn" style={{ textAlign: 'center' }}>{t('panel.myTasks') || 'My Tasks'}</Link>
          <PostTaskButton label={t('panel.postTask') || 'Post a Task'} />
          <Link href={`/${locale}/messages`} className="btn btn-secondary" style={{ textAlign: 'center' }}>{t('panel.messages') || 'Messages'}</Link>
          <Link href={`/${locale}/notifications`} className="btn btn-secondary" style={{ textAlign: 'center' }}>{t('panel.notifications') || 'Notifications'}</Link>
          <Link href={`/${locale}/profile/account`} className="link" style={{ textAlign: 'center', paddingTop: 8 }}>{t('panel.account') || 'Account Settings'}</Link>
        </div>

        <div style={{ marginTop: 12, borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
          <button
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => signOut({ redirect: false }).then(() => { window.location.href = `/${locale}` })}
          >
            {t('panel.logout') || 'Log out'}
          </button>
        </div>
      </div>
    </aside>
  )
}
