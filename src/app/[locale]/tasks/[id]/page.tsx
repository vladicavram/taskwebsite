import ImageLightbox from '../../../../components/ImageLightbox'
import { prisma } from '../../../../lib/prisma'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../api/auth/[...nextauth]/authOptions'
import { getTranslation } from '../../../../lib/locale-server'
import ApplyButton from './ApplyButton'
import ApplicantsList from './ApplicantsList'
import DeleteTaskButton from './DeleteTaskButton'
import EditTaskInline from './EditTaskInline'
import TaskImageControls from './TaskImageControls'
import ThumbnailWithDelete from './ThumbnailWithDelete'
import ReviewSection from './ReviewSection'
import { revalidatePath } from 'next/cache'
import MarkCompleteButton from './MarkCompleteButton'

type Props = { params: { id: string; locale: string } }

const placeholderImages = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1581578949510-fa7315c4c350?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=500&fit=crop',
]

export default async function TaskDetail({ params, searchParams }: Props & { searchParams?: Record<string, string> }) {
  const session: any = await getServerSession(authOptions as any)
  const task = await prisma.task.findUnique({ 
    where: { id: params.id }, 
    include: { 
      creator: { include: { profile: true, reviewsReceived: { include: { author: true }, orderBy: { createdAt: 'desc' } } } },
      reviews: { include: { author: true } },
      category: true,
      applications: { include: { applicant: true }, orderBy: { createdAt: 'asc' } }
    } 
  })

  if (!task) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
          <h2>{getTranslation(params.locale, 'taskDetail.notFound.title') || 'Task not found'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {getTranslation(params.locale, 'taskDetail.notFound.description') || "The task you're looking for doesn't exist or has been removed."}
          </p>
          <Link href={`/${params.locale}/tasks`} className="btn">{getTranslation(params.locale, 'taskDetail.notFound.backButton') || 'Back to Tasks'}</Link>
        </div>
      </div>
    )
  }

  const randomImage = placeholderImages[0]
  // Collect all images in the task's upload folder
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tasks', params.id)
  let images: string[] = []
  try {
    const files = fs.readdirSync(uploadsDir)
    const allowed = files.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    images = allowed.map(f => `/uploads/tasks/${params.id}/${f}?v=${Date.now()}`)
  } catch {}
  if (images.length === 0) {
    images = [randomImage]
  }

  const isCreator = session?.user?.email === task.creator.email
  const acceptedApps = (task as any).applications.filter((app: any) => app.status === 'accepted')
  const isAcceptedApplicantServer = !!acceptedApps.find((app: any) => app.applicant.id === session?.user?.id)
  const hasAlreadyApplied = !!(task as any).applications.find((app: any) => app.applicant.id === session?.user?.id)
  const showReviewForms = isCreator || isAcceptedApplicantServer
  const completedAt = (task as any).completedAt as Date | undefined

  return (
    <div>
      <div className="container" style={{ paddingTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }} className="task-detail-grid">
          <div>
            <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
              {searchParams?.updated && completedAt && (
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--accent-light)',
                  border: '1px solid var(--accent)',
                  borderRadius: '8px',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  marginBottom: '16px'
                }}>
                  {getTranslation(params.locale, 'taskDetail.completedSuccess') || '✓ You have completed this task'}
                </div>
              )}
              {searchParams?.updated && !completedAt && (
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--accent-light)',
                  border: '1px solid var(--accent)',
                  borderRadius: '8px',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  marginBottom: '16px'
                }}>
                  {getTranslation(params.locale, 'taskDetail.changesSaved') || '✓ Changes saved successfully'}
                </div>
              )}
              {task.category && (
                <span style={{ display: 'inline-block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--accent)', background: 'var(--accent-light)', padding: '6px 16px', borderRadius: '20px', marginBottom: '16px' }}>
                  {task.category.name}
                </span>
              )}

              {isCreator && (
                <div style={{ padding: '12px', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', fontWeight: 500, marginBottom: '12px' }}>{getTranslation(params.locale, 'taskDetail.yourTask') || '✓ This is your task'}</div>
              )}

              <h1 style={{ fontSize: '2.5rem', marginBottom: '24px' }}>{task.title}</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {images.map((imgUrl) => {
                  const nameMatch = imgUrl.match(/\/([^/?#]+)(?:\?v=\d+)?$/)
                  const imageName = nameMatch ? nameMatch[1] : undefined
                  return (
                    <ThumbnailWithDelete key={imgUrl} src={imgUrl} alt={task.title} taskId={params.id} canEdit={isCreator} imageName={imageName} />
                  )
                })}
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-expect-error Server Component importing Client Component */}
                <TaskImageControls taskId={params.id} canEdit={isCreator} showAddOnly />
              </div>
              {!isCreator ? (
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '24px' }}>{task.description}</p>
              ) : (
                <div style={{ marginBottom: '24px' }}>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-expect-error Server Component importing Client Component */}
                  <EditTaskInline
                    locale={params.locale}
                    taskId={params.id}
                    initial={{
                      title: task.title,
                      description: task.description,
                      location: (task as any).location || null,
                      price: task.price,
                    }}
                  />
                </div>
              )}

              {isCreator ? (
                <div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <DeleteTaskButton taskId={params.id} locale={params.locale} />
                  </div>
                  <ApplicantsList applications={(task as any).applications} locale={params.locale} />
                </div>
              ) : (
                <div>
                  {!isAcceptedApplicantServer ? (
                    <>
                      <h3 style={{ marginBottom: '12px' }}>{getTranslation(params.locale, 'taskDetail.applyForTask') || 'Apply for this Task'}</h3>
                      <ApplyButton 
                        taskId={params.id} 
                        locale={params.locale} 
                        taskPrice={task.price}
                        taskTitle={task.title}
                        taskCreatorName={task.creator.name || task.creator.email}
                        hasAlreadyApplied={hasAlreadyApplied}
                      />
                    </>
                  ) : (
                    !completedAt && (
                      <div style={{
                        padding: '12px 16px',
                        background: 'var(--accent-light)',
                        border: '1px solid var(--accent)',
                        borderRadius: '8px',
                        color: 'var(--accent)',
                        fontWeight: 600,
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <span>{getTranslation(params.locale, 'taskDetail.alreadyAccepted') || '✓ You are accepted for this task'}</span>
                        {acceptedApps.length > 0 && (
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-expect-error Server Component importing Client Component
                          <MarkCompleteButton taskId={params.id} locale={params.locale} />
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Review Section */}
              {showReviewForms && (
                <ReviewSection
                taskId={params.id}
                taskCreatorId={task.creatorId}
                taskCreatorName={task.creator.name || task.creator.email}
                acceptedApplicants={
                  (task as any).applications
                    .filter((app: any) => app.status === 'accepted')
                    .map((app: any) => ({
                      id: app.applicant.id,
                      name: app.applicant.name,
                      email: app.applicant.email
                    }))
                }
                  showReviewForms={showReviewForms}
                />
              )}
            </div>

            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px' }}>{getTranslation(params.locale, 'taskDetail.reviews') || 'Reviews'} ({task.reviews.length})</h2>
              {task.reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
                  <p style={{ color: 'var(--text-muted)' }}>{getTranslation(params.locale, 'taskDetail.noReviews') || 'No reviews yet'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {task.reviews.map((r) => (
                    <div key={r.id} style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ fontWeight: 600 }}>{r.author.name || r.author.email}</div>
                        <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{'⭐'.repeat(r.rating)}</div>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{getTranslation(params.locale, 'taskDetail.taskBudget') || 'Task Budget'}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '16px' }}>
                {task.price ? `$${task.price}` : (getTranslation(params.locale, 'taskDetail.negotiable') || 'Negotiable')}
              </div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '16px' }}>{getTranslation(params.locale, 'taskDetail.postedBy') || 'Posted By'}</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent)' }}>
                  {(task.creator.name || task.creator.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {task.creator.name || (getTranslation(params.locale, 'taskDetail.anonymous') || 'Anonymous')}
                  </div>
                  {/* Creator Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {(() => {
                      const rr = (task.creator as any).reviewsReceived || []
                      const avg = rr.length > 0 ? (rr.reduce((a: number, r: any) => a + r.rating, 0) / rr.length).toFixed(1) : '0.0'
                      return (
                        <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
                          ⭐ {avg} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({rr.length} {rr.length === 1 ? 'review' : 'reviews'})</span>
                        </span>
                      )
                    })()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{task.creator.email}</div>
                </div>
              </div>
              {task.creator.profile && (
                <>
                  {task.creator.profile.location && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>📍 {task.creator.profile.location}</div>
                  )}
                  {task.creator.profile.bio && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>{task.creator.profile.bio}</p>
                  )}
                </>
              )}
              <Link href={`/${params.locale}/profile/${task.creator.id}`} className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                {getTranslation(params.locale, 'taskDetail.viewProfile') || 'View Profile'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
