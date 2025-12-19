import { prisma } from '../../../lib/prisma'
import TaskCard from '../../../components/TaskCard'
import Link from 'next/link'
import { LocaleProvider } from '../../../lib/locale'

export const revalidate = 0

export default async function TasksPage({ params }: { params: { locale: string } }) {
  const tasks = await prisma.task.findMany({
    where: { isOpen: true },
    include: { creator: true, category: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      {/* Hero Banner */}
      <section className="liquid-hero" style={{
        padding: '48px 24px',
        marginBottom: '48px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--text)' }}>
            <LocaleProvider message="tasks.title" fallback="Browse Tasks" />
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95 }}>
            Find local tasks that match your skills
          </p>
        </div>
      </section>

      <div className="container">
        {/* Search & Filter Bar */}
        <div style={{ 
          marginBottom: '32px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          background: 'white',
          padding: '20px',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <input 
            type="text" 
            placeholder="Search tasks..."
            style={{ 
              flex: 1,
              minWidth: '250px',
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '1rem'
            }}
          />
          <select style={{
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '1rem',
            minWidth: '150px'
          }}>
            <option><LocaleProvider message="tasks.allCategories" fallback="All Categories" /></option>
            <option>Handyman</option>
            <option>Cleaning</option>
            <option>Moving</option>
            <option>Tech</option>
          </select>
          <select style={{
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '1rem',
            minWidth: '150px'
          }}>
            <option>Any Price</option>
            <option>Under $50</option>
            <option>$50-$100</option>
            <option>$100+</option>
          </select>
        </div>

        {/* Stats Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <strong>{tasks.length}</strong> tasks available
          </p>
          <Link href={`/${params.locale}/tasks/create`} className="btn">
            + <LocaleProvider message="tasks.postTask" fallback="Post a Task" />
          </Link>
        </div>

        {/* Tasks Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {tasks.map((t: any) => (
            <TaskCard 
              key={t.id} 
              id={t.id} 
              title={t.title} 
              description={t.description} 
              price={t.price}
              category={t.category?.name}
            />
          ))}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: 'white',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📋</div>
            <h3 style={{ marginBottom: '8px' }}><LocaleProvider message="tasks.noTasksYet" fallback="No tasks yet" /></h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              <LocaleProvider message="tasks.beFirst" fallback="Be the first to post a task!" />
            </p>
            <Link href={`/${params.locale}/tasks/create`} className="btn">
              <LocaleProvider message="create.submit" fallback="Create First Task" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
