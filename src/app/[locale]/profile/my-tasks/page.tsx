export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../api/auth/[...nextauth]/authOptions'
import { prisma } from '../../../../lib/prisma'
import { getTranslation } from '../../../../lib/locale-server'
import MarkCompleteButton from '../../tasks/[id]/MarkCompleteButton'

export default async function MyTasksPage({ params, searchParams }: { params: { locale: string }, searchParams?: { tab?: string } }) {
  const t = (key: string) => getTranslation(params.locale, key)
  const session: any = await getServerSession(authOptions as any)
  if (!session?.user?.email) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>{t('auth.loginRequired') || 'You need to log in'}</h2>
        <Link href={`/${params.locale}/login`} className="btn" style={{ marginTop: 12 }}>{t('auth.login') || 'Go to Login'}</Link>
      </div>
    )
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return (
      <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>{t('common.userNotFound') || 'User not found'}</h2>
      </div>
    )
  }

  const [myTasks, acceptedApps, pendingApps] = await Promise.all([
    prisma.task.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    }),
    prisma.application.findMany({
      where: { applicantId: user.id, status: 'accepted' },
      orderBy: { createdAt: 'desc' },
      include: { task: { include: { category: true } } }
    }),
    prisma.application.findMany({
      where: { applicantId: user.id, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { task: { include: { category: true } } }
    })
  ])

  const acceptedTasks = acceptedApps.map((a: any) => a.task)

  const completedTasks = [
    ...myTasks.filter((t: any) => t.completedAt),
    ...acceptedTasks.filter((t: any) => t.completedAt)
  ].filter((t: any, idx: number, arr: any[]) => arr.findIndex((x: any) => x.id === t.id) === idx)

  const requestedTasks = pendingApps.map((a: any) => a.task)

  const counts = {
    created: myTasks.length,
    accepted: acceptedTasks.filter((t: any) => !t.completedAt).length,
    requested: requestedTasks.length,
    completed: completedTasks.length
  }

  const activeTab = (searchParams?.tab === 'accepted' || searchParams?.tab === 'completed' || searchParams?.tab === 'requested') ? searchParams!.tab! : 'created'

  function TaskItem({ t: item, showComplete }: { t: any, showComplete?: boolean }) {
    return (
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>
              <Link href={`/${params.locale}/tasks/${item.id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{item.title}</Link>
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>{item.description}</p>
            <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {item.price && <span>💰 {item.price} MDL</span>}
              {item.location && <span>📍 {item.location}</span>}
              {item.category && <span>🏷️ {item.category.name}</span>}
              {item.completedAt && <span>✅ {t('myTasks.completed.badge') || 'Completed'}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <Link href={`/${params.locale}/tasks/${item.id}`} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.9rem' }}>{t('common.open') || 'Open'}</Link>
            {showComplete && !item.completedAt && (
              <MarkCompleteButton
                taskId={item.id}
                locale={params.locale}
                redirectTo={`/${params.locale}/tasks/${item.id}?updated=1`}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: 1000, paddingTop: 24 }}>
      <h2 style={{ marginBottom: 12 }}>{t('myTasks.title') || 'My Tasks'}</h2>

      {/* Sticky Tabs */}
      <div style={{
        position: 'sticky',
        top: 64,
        zIndex: 5,
        background: 'var(--bg)',
        padding: '8px 0',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href={`/${params.locale}/profile/my-tasks?tab=created`}
            className={activeTab === 'created' ? 'btn' : 'btn btn-secondary'}
            style={{ flex: 1, textAlign: 'center', padding: '6px 10px', fontSize: '0.9rem' }}
          >
            {(t('myTasks.createdByMe.title') || 'Created') + ` (${counts.created})`}
          </Link>
          <Link
            href={`/${params.locale}/profile/my-tasks?tab=accepted`}
            className={activeTab === 'accepted' ? 'btn' : 'btn btn-secondary'}
            style={{ flex: 1, textAlign: 'center', padding: '6px 10px', fontSize: '0.9rem' }}
          >
            {(t('myTasks.accepted.title') || 'Accepted') + ` (${counts.accepted})`}
          </Link>
          <Link
            href={`/${params.locale}/profile/my-tasks?tab=requested`}
            className={activeTab === 'requested' ? 'btn' : 'btn btn-secondary'}
            style={{ flex: 1, textAlign: 'center', padding: '6px 10px', fontSize: '0.9rem' }}
          >
            {(t('myTasks.requested.title') || 'Requested') + ` (${counts.requested})`}
          </Link>
          <Link
            href={`/${params.locale}/profile/my-tasks?tab=completed`}
            className={activeTab === 'completed' ? 'btn' : 'btn btn-secondary'}
            style={{ flex: 1, textAlign: 'center', padding: '6px 10px', fontSize: '0.9rem' }}
          >
            {(t('myTasks.completed.title') || 'Completed') + ` (${counts.completed})`}
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {activeTab === 'created' && (
          <div className="card" style={{ padding: 24 }}>
            {myTasks.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>{t('myTasks.createdByMe.empty') || "You haven't created any tasks yet."}</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {myTasks.map((t: any) => <TaskItem key={t.id} t={t} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'accepted' && (
          <div className="card" style={{ padding: 24 }}>
            {acceptedTasks.filter((t: any) => !t.completedAt).length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>{t('myTasks.accepted.empty') || 'No accepted tasks yet.'}</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {acceptedTasks.filter((t: any) => !t.completedAt).map((t: any) => <TaskItem key={t.id} t={t} showComplete />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="card" style={{ padding: 24 }}>
            {completedTasks.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>{t('myTasks.completed.empty') || 'No completed tasks yet.'}</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {completedTasks.map((t: any) => <TaskItem key={t.id} t={t} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requested' && (
          <div className="card" style={{ padding: 24 }}>
            {requestedTasks.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>{t('myTasks.requested.empty') || 'No requested tasks yet.'}</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {requestedTasks.map((t: any) => <TaskItem key={t.id} t={t} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
