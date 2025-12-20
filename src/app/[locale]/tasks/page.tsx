import React, { Suspense } from 'react'
import Link from 'next/link'
import TasksBrowser from './TasksBrowser'
import PostTaskButton from '../../../components/PostTaskButton'
import { getTranslation } from '../../../lib/locale-server'
import { prisma } from '../../../lib/prisma'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export default async function TasksPage({ params }: { params: { locale: string } }) {
  const { locale } = params

  let initialTasks: any[] = []
  
  try {
    // Fetch initial public tasks server-side to avoid client-side flicker
    const where: any = {
      isOpen: true,
      completedAt: null,
      isDirectHire: false,
      applications: { none: { status: 'accepted' } }
    }
    const tasks = await prisma.task.findMany({ 
      where, 
      include: {
        applications: {
          where: {
            status: { in: ['pending', 'accepted'] }
          }
        }
      },
      orderBy: { createdAt: 'desc' }, 
      take: 100 
    })
    
    // Map tasks to include applicant count
    initialTasks = tasks.map(task => {
      const applicantCount = task.applications?.length || 0
      const { applications, ...taskWithoutApplications } = task
      return {
        ...taskWithoutApplications,
        applicantCount
      }
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    // Return empty array on error - client will fetch via API
    initialTasks = []
  }

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {tasks.map((task: any) => (
            <div key={task.id} className="card">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Price: {task.price} MDL</p>
              <Link href={`/${locale}/tasks/${task.id}`} className="btn">View Details</Link>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '24px 0' }}>
      <div className={styles.postTaskWrapper}>
        <PostTaskButton />
      </div>

      <Suspense fallback={<ServerFallback tasks={initialTasks} />}>
        <TasksBrowser locale={locale} initialTasks={initialTasks} />
      </Suspense>
    </div>
  )
}
