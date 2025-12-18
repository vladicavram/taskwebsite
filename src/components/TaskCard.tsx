'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useLocale from '../lib/locale'

type Props = {
  id: string
  title: string
  description: string
  price?: number | null
  category?: string
  imageUrl?: string | null
}

export default function TaskCard({ id, title, description, price, category, imageUrl }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'ro'
  const { t } = useLocale()

  function handleViewDetails(e: React.MouseEvent) {
    if (!session) {
      e.preventDefault()
      router.push(`/${locale}/login`)
    }
  }

  return (
    <article 
      className="card" 
      style={{ 
        padding: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          {category && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--accent)',
              background: 'var(--accent-light)',
              padding: '4px 12px',
              borderRadius: '12px'
            }}>
              {category}
            </span>
          )}
          {price && (
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--accent)'
            }}>
              {price} MDL
            </span>
          )}
        </div>
        
        <h3 style={{ 
          fontWeight: 600, 
          fontSize: '1rem', 
          marginBottom: '8px',
          color: 'var(--text)',
          lineHeight: '1.4'
        }}>
          <Link
            href={`/${locale}/tasks/${id}`}
            className="task-link"
            style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }}
            onClick={handleViewDetails}
          >
            {title}
          </Link>
        </h3>
        
        <p style={{ 
          color: 'var(--text-secondary)',
          marginBottom: '12px',
          flex: 1,
          lineHeight: '1.5',
          fontSize: '0.875rem'
        }}>
          {description.length > 80 ? description.substring(0, 80) + '...' : description}
        </p>
        
        <Link 
          href={`/${locale}/tasks/${id}`}
          className="btn"
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '8px 12px',
            fontSize: '0.875rem'
          }}
          onClick={handleViewDetails}
        >
          {t('tasks.viewDetails') || 'View Details'}
        </Link>
      </div>
    </article>
  )
}
