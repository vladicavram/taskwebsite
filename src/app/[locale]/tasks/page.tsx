import React, { Suspense } from 'react'
import Link from 'next/link'
import TasksBrowser from './TasksBrowser'
import PostTaskButton from '../../../components/PostTaskButton'
import { getTranslation } from '../../../lib/locale-server'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'

export default async function TasksPage({ params }: { params: { locale: string } }) {
  const { locale } = params

  // Fetch initial public tasks server-side to avoid client-side flicker
  const where: any = {
    isOpen: true,
    completedAt: null,
    applications: { none: { status: 'accepted' } }
  }
  const initialTasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 })

  function ServerFallback({ tasks }: { tasks: any[] }) {
    return (
      <div>
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12 }}>
            <input type="text" placeholder={getTranslation(locale, 'tasks.browse.searchPlaceholder') || 'Search tasks...'} />
            <input type="number" placeholder={getTranslation(locale, 'tasks.browse.minPrice') || 'Min price'} />
            <input type="number" placeholder={getTranslation(locale, 'tasks.browse.maxPrice') || 'Max price'} />
            <input type="text" placeholder={getTranslation(locale, 'tasks.browse.locationPlaceholder') || 'Location'} />
          </div>
        </div>

        {(!tasks || tasks.length === 0) ? (
          <div className="card" style={{ padding: 24 }}>{getTranslation(locale, 'tasks.browse.noResults') || 'No tasks match your filters.'}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {tasks.map((t: any) => (
              <article key={t.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ width: '100%', height: '200px', background: '#f9fafb', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                  <img src={`/uploads/tasks/${t.id}/cover.webp`} alt={t.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                  {t.price && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 600, color: 'var(--accent)', boxShadow: 'var(--shadow)' }}>{t.price} MDL</div>
                  )}
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {t.category && (
                    <span style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--accent)', background: 'var(--accent-light)', padding: '4px 12px', borderRadius: '12px', marginBottom: '12px', width: 'fit-content' }}>{t.category}</span>
                  )}

                  <h3 style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text)' }}>
                    <a href={`/${locale}/tasks/${t.id}`} className="task-link" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}>{t.title}</a>
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', flex: 1, lineHeight: '1.6' }}>{t.description && (t.description.length > 120 ? t.description.substring(0, 120) + '...' : t.description)}</p>

                  <a href={`/${locale}/tasks/${t.id}`} className="btn" style={{ width: '100%', textAlign: 'center', padding: '10px 16px' }}>{getTranslation(locale, 'tasks.viewDetails') || 'View Details'}</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    )
  }

  

  return (
    <div className="container" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{getTranslation(locale, 'tasks.browse.title') || 'Browse Tasks'}</h1>
        <PostTaskButton label={getTranslation(locale, 'tasks.browse.postTask') || '+ Post a Task'} />
      </div>

      <div>
        <Suspense fallback={<ServerFallback tasks={initialTasks} />}>
          <TasksBrowser locale={locale} initialTasks={initialTasks} />
        </Suspense>
      </div>
    </div>
  )
}
