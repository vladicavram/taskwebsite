'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getTranslation } from '../../../lib/locale'

export default function HireWorkersPage() {
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'ro'
  const t = (key: string) => getTranslation(locale, key)

  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

  useEffect(() => {
    loadWorkers()
  }, [])

  async function loadWorkers() {
    setLoading(true)
    try {
      const res = await fetch('/api/workers')
      const data = await res.json()
      if (Array.isArray(data)) {
        setWorkers(data)
      }
    } catch (err) {
      console.error('Failed to load workers:', err)
    }
    setLoading(false)
  }

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = !searchQuery || 
      worker.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.profile?.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.profile?.skills?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLocation = !locationFilter || 
      worker.profile?.location?.toLowerCase().includes(locationFilter.toLowerCase())
    
    return matchesSearch && matchesLocation
  })

  return (
    <div className="container" style={{ paddingTop: 24, maxWidth: 1200 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>{t('hire.title') || 'Find Workers'}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('hire.subtitle') || 'Browse available workers and hire them for your tasks'}
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 16,
        marginBottom: 24 
      }}>
        <input
          type="text"
          placeholder={t('hire.searchPlaceholder') || 'Search by name, skills, or bio...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '1rem'
          }}
        />
        <input
          type="text"
          placeholder={t('hire.locationPlaceholder') || 'Filter by location...'}
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '1rem'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          {t('common.loading') || 'Loading...'}
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 60,
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)'
        }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            {t('hire.noWorkers') || 'No workers found'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20
        }}>
          {filteredWorkers.map((worker) => (
            <Link
              key={worker.id}
              href={`/${locale}/hire/${worker.id}`}
              style={{
                display: 'block',
                padding: 20,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 600
                }}>
                  {worker.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                    {worker.name || 'Anonymous'}
                  </h3>
                  {worker.profile?.location && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      📍 {worker.profile.location}
                    </div>
                  )}
                </div>
              </div>

              {worker.profile?.bio && (
                <p style={{
                  margin: '12px 0',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {worker.profile.bio}
                </p>
              )}

              {worker.profile?.skills && (
                <div style={{ marginTop: 12 }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6
                  }}>
                    {worker.profile.skills.split(',').slice(0, 3).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 10px',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {worker._count?.applications || 0} {t('hire.completedJobs') || 'jobs'}
                </div>
                <div style={{
                  padding: '6px 14px',
                  background: 'var(--accent)',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}>
                  {t('hire.viewProfile') || 'View Profile'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
