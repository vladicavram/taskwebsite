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
  applicantCount?: number
}

export default function TaskCard({ id, title, description, price, category, imageUrl, applicantCount }: Props) {
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
    <Link
      href={`/${locale}/tasks/${id}`}
      onClick={handleViewDetails}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <article 
        className="card" 
        style={{ 
          padding: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '180px',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'var(--shadow)'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'start',
          marginBottom: '12px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            {applicantCount !== undefined && applicantCount > 0 && (
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C8996F 0%, #B8895F 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(200, 153, 111, 0.4)'
              }}>
                {applicantCount}
              </span>
          )}
        </div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #C8996F 0%, #B8895F 100%)',
            padding: '6px 12px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(200, 153, 111, 0.3)'
          }}>
            {price ? `${Math.max(1, Math.ceil(price / 100))} Ⓓ` : t('tasks.negotiable') || 'Negotiable'}
          </span>
        </div>        <h3 style={{ 
          fontWeight: 600, 
          fontSize: '1rem', 
          marginBottom: '8px',
          color: 'var(--text)',
          lineHeight: '1.4'
        }}>
          {title}
        </h3>
        
        <p style={{ 
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          fontSize: '0.875rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {description}
        </p>
      </article>
    </Link>
  )
}
