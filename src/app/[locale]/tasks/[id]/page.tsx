export const dynamic = 'force-dynamic'
export const revalidate = 0

import ImageLightbox from '../../../../components/ImageLightbox'
import { prisma } from '../../../../lib/prisma'
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

  // Use imageUrl from database (stored in Vercel Blob)
  const images: string[] = (task as any).imageUrl ? [(task as any).imageUrl] : []

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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{task.title}</h1>
                <Link 
                  href={`/${params.locale}/tasks/create?copy=${task.id}`} 
                  className="btn btn-secondary" 
                  style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}
                >
                  {getTranslation(params.locale, 'taskDetail.postSimilarTask') || '📋 Post Similar Task'}
                </Link>
              </div>

              {(images.length > 0 || (isCreator && !completedAt)) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {images.map((imgUrl) => {
                    const nameMatch = imgUrl.match(/\/([^/?#]+)(?:\?v=\d+)?$/)
                    const imageName = nameMatch ? nameMatch[1] : undefined
                    return (
                      <ThumbnailWithDelete key={imgUrl} src={imgUrl} alt={task.title} taskId={params.id} canEdit={isCreator && !completedAt} imageName={imageName} />
                    )
                  })}
                  {isCreator && !completedAt && <TaskImageControls taskId={params.id} canEdit={isCreator} showAddOnly />}
                </div>
              )}
              {!isCreator ? (
                <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '24px' }}>{task.description}</p>
              ) : completedAt ? (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    padding: '12px 16px',
                    background: '#d1fae5',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    color: '#065f46',
                    fontWeight: 500,
                    marginBottom: '16px'
                  }}>
                    {getTranslation(params.locale, 'taskDetail.completedLocked') || '✓ This task is completed. No further changes can be made.'}
                  </div>
                  <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>{task.description}</p>
                </div>
              ) : acceptedApps.length > 0 ? (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    padding: '12px 16px',
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    color: '#92400e',
                    fontWeight: 500,
                    marginBottom: '16px'
                  }}>
                    {getTranslation(params.locale, 'taskDetail.editLocked') || '🔒 Editing is locked while an applicant is assigned. Remove the applicant to edit.'}
                  </div>
                  <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>{task.description}</p>
                </div>
              ) : (
                <div style={{ marginBottom: '24px' }}>
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
                  {!completedAt && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                      <DeleteTaskButton taskId={params.id} locale={params.locale} />
                    </div>
                  )}
                  {!completedAt && <ApplicantsList applications={(task as any).applications} locale={params.locale} />}
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
                {task.price ? `${task.price} MDL` : (getTranslation(params.locale, 'taskDetail.negotiable') || 'Negotiable')}
              </div>
              
              {/* Task Status */}
              {completedAt ? (
                <div style={{
                  padding: '12px',
                  background: '#d1fae5',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-sm)',
                  color: '#065f46',
                  fontWeight: 600,
                  textAlign: 'center',
                  marginBottom: '8px'
                }}>
                  ✓ {getTranslation(params.locale, 'taskDetail.taskCompleted') || 'Task Completed'}
                </div>
              ) : acceptedApps.length > 0 ? (
                <div style={{
                  padding: '12px',
                  background: '#d1fae5',
                  border: '1px solid #10b981',
                  borderRadius: 'var(--radius-sm)',
                  color: '#065f46',
                  fontWeight: 600,
                  textAlign: 'center',
                  marginBottom: '8px'
                }}>
                  ✓ {getTranslation(params.locale, 'taskDetail.taskAccepted') || 'Task Accepted'}
                </div>
              ) : (task as any).applications.length > 0 ? (
                <div style={{
                  padding: '12px',
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: 'var(--radius-sm)',
                  color: '#92400e',
                  fontWeight: 600,
                  textAlign: 'center',
                  marginBottom: '8px'
                }}>
                  📋 {(task as any).applications.length} {getTranslation(params.locale, 'taskDetail.applicants') || 'Applicant(s)'}
                </div>
              ) : (
                <div style={{
                  padding: '12px',
                  background: task.isOpen ? '#d1fae5' : 'var(--bg-secondary)',
                  border: task.isOpen ? '1px solid #10b981' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: task.isOpen ? '#065f46' : 'var(--text-muted)',
                  fontWeight: 500,
                  textAlign: 'center',
                  marginBottom: '8px'
                }}>
                  {task.isOpen ? 'Open' : 'Closed'}
                </div>
              )}
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
