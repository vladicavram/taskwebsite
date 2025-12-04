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
  const locale = pathname?.split('/')[1] || 'en'
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
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {imageUrl ? (
        <div style={{ 
          width: '100%', 
          height: '200px',
          background: `#f9fafb`,
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img 
            src={imageUrl}
            alt={title}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              opacity: 0.9
            }}
          />
          {price && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 600,
              color: 'var(--accent)',
              boxShadow: 'var(--shadow)'
            }}>
              ${price}
            </div>
          )}
        </div>
      ) : (
        price && (
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <span style={{
              background: 'var(--accent-light)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 600,
              color: 'var(--accent)'
            }}>
              ${price}
            </span>
          </div>
        )
      )}
      
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {category && (
          <span style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--accent)',
            background: 'var(--accent-light)',
            padding: '4px 12px',
            borderRadius: '12px',
            marginBottom: '12px',
            width: 'fit-content'
          }}>
            {category}
          </span>
        )}
        
        <h3 style={{ 
          fontWeight: 600, 
          fontSize: '1.25rem', 
          marginBottom: '8px',
          color: 'var(--text)'
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
          marginBottom: '16px',
          flex: 1,
          lineHeight: '1.6'
        }}>
          {description.length > 120 ? description.substring(0, 120) + '...' : description}
        </p>
        
        <Link 
          href={`/${locale}/tasks/${id}`}
          className="btn"
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '10px 16px'
          }}
          onClick={handleViewDetails}
        >
          {t('tasks.viewDetails') || 'View Details'}
        </Link>
      </div>
    </article>
  )
}
