'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import ReviewForm from '../../../../components/ReviewForm'
import useLocale from '../../../../lib/locale'

type ReviewSectionProps = {
  taskId: string
  taskCreatorId: string
  taskCreatorName: string
  acceptedApplicants: Array<{
    id: string
    name: string | null
    email: string
  }>
  showReviewForms?: boolean
}

export default function ReviewSection({ 
  taskId, 
  taskCreatorId, 
  taskCreatorName,
  acceptedApplicants,
  showReviewForms = undefined
}: ReviewSectionProps) {
  const { data: session } = useSession()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [existingReviews, setExistingReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLocale()

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.email) {
        setLoading(false)
        return
      }

      try {
        // Get current user
        const userResponse = await fetch('/api/users/me')
        const userData = await userResponse.json()
        setCurrentUser(userData)

        // Get existing reviews for this task
        const reviewsResponse = await fetch(`/api/reviews?taskId=${taskId}`)
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json()
          setExistingReviews(reviewsData)
        }
      } catch (error) {
        console.error('Error loading review data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [session, taskId])

  if (loading || !currentUser) {
    return null
  }

  const isCreator = currentUser.id === taskCreatorId
  const isAcceptedApplicant = acceptedApplicants.some(app => app.id === currentUser.id)

  // Explicit flag from server takes precedence; if provided and false, hide
  if (showReviewForms === false) {
    return null
  }

  if (!isCreator && !isAcceptedApplicant) {
    return null
  }

  // Determine who can be reviewed
  const usersToReview: Array<{ id: string; name: string }> = []

  if (isCreator) {
    // Creator can review all accepted applicants
    acceptedApplicants.forEach(app => {
      const alreadyReviewed = existingReviews.some(
        r => r.authorId === currentUser.id && r.recipientId === app.id
      )
      if (!alreadyReviewed) {
        usersToReview.push({ id: app.id, name: app.name || app.email })
      }
    })
  }

  if (isAcceptedApplicant) {
    // Applicant can review the creator
    const alreadyReviewed = existingReviews.some(
      r => r.authorId === currentUser.id && r.recipientId === taskCreatorId
    )
    if (!alreadyReviewed) {
      usersToReview.push({ id: taskCreatorId, name: taskCreatorName })
    }
  }

  if (usersToReview.length === 0) {
    return null
  }

  return (
    <div>
      {usersToReview.map((user) => (
        <ReviewForm
          key={user.id}
          taskId={taskId}
          recipientId={user.id}
          recipientName={user.name}
          onSuccess={() => {
            // Reload to update the review list
            window.location.reload()
          }}
        />
      ))}
    </div>
  )
}
