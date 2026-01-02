"use client"
import { useEffect, useState, useRef } from 'react'
import TaskCard from '../../../components/TaskCard'
import useLocale from '../../../lib/locale'
import { MOLDOVA_CITIES } from '../../../lib/constants'

type Task = {
	id: string
	title: string
	description: string
	price?: number | null
	location?: string | null
	imageUrl?: string | null
	applicantCount?: number
	[key: string]: any
}

export default function TasksBrowser({ locale, initialTasks }: { locale: string, initialTasks?: Task[] }) {
	const { t } = useLocale()
	const [q, setQ] = useState('')
	const [priceMin, setPriceMin] = useState('')
	const [priceMax, setPriceMax] = useState('')
	const [location, setLocation] = useState('')
	const [showCompleted, setShowCompleted] = useState(false)
	const [tasks, setTasks] = useState<Task[]>(initialTasks || [])
	const [loading, setLoading] = useState(false)
	const [displayCount, setDisplayCount] = useState(16) // 4 rows * 4 columns = 16 items

	const firstRender = useRef(true)

	const fetchTasks = async () => {
		setLoading(true)
		try {
			const params = new URLSearchParams()
			if (q) params.set('q', q)
			if (priceMin) params.set('priceMin', priceMin)
			if (priceMax) params.set('priceMax', priceMax)
			if (location) params.set('location', location)
			if (showCompleted) params.set('completed', 'true')
			const res = await fetch(`/api/tasks?${params.toString()}`)
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}: ${res.statusText}`)
			}
			const data = await res.json()
			setTasks(data)
		} catch (error) {
			console.error('Error fetching tasks:', error)
			setTasks([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const shouldSkip = firstRender.current && !q && !priceMin && !priceMax && !location && !showCompleted && initialTasks && initialTasks.length > 0
		if (shouldSkip) {
			firstRender.current = false
			return
		}
		const id = setTimeout(fetchTasks, 250)
		firstRender.current = false
		return () => clearTimeout(id)
	}, [q, priceMin, priceMax, location, showCompleted])

	// Reset display count when filters change
	useEffect(() => {
		setDisplayCount(16)
	}, [q, priceMin, priceMax, location, showCompleted])

	const displayedTasks = tasks.slice(0, displayCount)
	const hasMore = tasks.length > displayCount

	return (
		<div>
			<style jsx>{`
				.search-grid {
					display: grid;
					grid-template-columns: 2fr 1fr 1fr 1fr;
					gap: 12px;
				}
				@media (max-width: 768px) {
					.search-grid {
						display: grid;
						grid-template-columns: 1fr 1fr 1fr;
						gap: 12px;
					}
					.search-grid input[type="text"] {
						grid-column: 1 / -1;
					}
				}
			`}</style>
			<div className="card" style={{ padding: 16, marginBottom: 16 }}>
				<div className="search-grid">
					<input
						type="text"
						placeholder={t('tasks.browse.searchPlaceholder') || 'Search tasks...'}
						value={q}
						onChange={(e) => setQ(e.target.value)}
						style={{ width: '100%' }}
					/>
					<input
						type="number"
						placeholder={t('tasks.browse.minPrice') || 'Min price'}
						value={priceMin}
						onChange={(e) => setPriceMin(e.target.value)}
						min="0"
						step="0.01"
						style={{ width: '100%' }}
					/>
					<input
						type="number"
						placeholder={t('tasks.browse.maxPrice') || 'Max price'}
						value={priceMax}
						onChange={(e) => setPriceMax(e.target.value)}
						min="0"
						step="0.01"
						style={{ width: '100%' }}
					/>
					<select
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', width: '100%' }}
					>
						<option value="">Location</option>
						{MOLDOVA_CITIES.map(city => (
							<option key={city} value={city}>{city}</option>
						))}
					</select>
				</div>
				<div style={{ marginTop: '12px' }}>
					<label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
						<input
							type="checkbox"
							checked={showCompleted}
							onChange={(e) => setShowCompleted(e.target.checked)}
							style={{ width: '16px', height: '16px' }}
						/>
			{t('tasks.browse.showCompleted') || 'Show completed tasks only'}
				</label>
			</div>
		</div>

		{loading ? (
			<div className="card" style={{ padding: 24 }}>{t('tasks.browse.loading') || 'Loading...'}</div>
		) : displayedTasks.length === 0 ? (
			<div className="card" style={{ padding: 24 }}>{t('tasks.browse.noResults') || 'No tasks match your filters.'}</div>
		) : (
			<>
				<div style={{ 
					display: 'grid', 
					gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
					gap: 16,
					alignItems: 'stretch'
				}}>
					{displayedTasks.map((t) => (
						<TaskCard
							key={t.id}
							id={t.id}
							title={t.title}
							description={t.description}
							price={t.price}
							category={t.category}
							imageUrl={t.imageUrl}
							applicantCount={t.applicantCount}
						/>
					))}
				</div>
				{hasMore && (
					<div style={{ textAlign: 'center', padding: '20px 0' }}>
						<button
							onClick={() => setDisplayCount(prev => prev + 16)}
							className="btn btn-secondary"
							style={{ minWidth: '150px' }}
						>
							{t('common.viewMore')}
						</button>
					</div>
				)}
			</>
		)}
	</div>
)
}