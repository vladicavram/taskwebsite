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
	[key: string]: any
}

export default function TasksBrowser({ locale, initialTasks }: { locale: string, initialTasks?: Task[] }) {
	const { t } = useLocale()
	const [q, setQ] = useState('')
	const [priceMin, setPriceMin] = useState('')
	const [priceMax, setPriceMax] = useState('')
	const [location, setLocation] = useState('')
	const [tasks, setTasks] = useState<Task[]>(initialTasks || [])
	const [loading, setLoading] = useState(false)

	const firstRender = useRef(true)

	const fetchTasks = async () => {
		setLoading(true)
		const params = new URLSearchParams()
		if (q) params.set('q', q)
		if (priceMin) params.set('priceMin', priceMin)
		if (priceMax) params.set('priceMax', priceMax)
		if (location) params.set('location', location)
		const res = await fetch(`/api/tasks?${params.toString()}`)
		const data = await res.json()
		setTasks(data)
		setLoading(false)
	}

	useEffect(() => {
		const shouldSkip = firstRender.current && !q && !priceMin && !priceMax && !location && initialTasks && initialTasks.length > 0
		if (shouldSkip) {
			firstRender.current = false
			return
		}
		const id = setTimeout(fetchTasks, 250)
		firstRender.current = false
		return () => clearTimeout(id)
	}, [q, priceMin, priceMax, location, initialTasks])

	useEffect(() => {
		// If there are no initial tasks passed from server, fetch on mount
		if (!initialTasks) fetchTasks()
	}, [])

	return (
		<div>
			<div className="card" style={{ padding: 16, marginBottom: 16 }}>
				<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12 }}>
					<input
						type="text"
						placeholder={t('tasks.browse.searchPlaceholder') || 'Search tasks...'}
						value={q}
						onChange={(e) => setQ(e.target.value)}
					/>
					<input
						type="number"
						placeholder={t('tasks.browse.minPrice') || 'Min price'}
						value={priceMin}
						onChange={(e) => setPriceMin(e.target.value)}
						min="0"
						step="0.01"
					/>
					<input
						type="number"
						placeholder={t('tasks.browse.maxPrice') || 'Max price'}
						value={priceMax}
						onChange={(e) => setPriceMax(e.target.value)}
						min="0"
						step="0.01"
					/>
					<select
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
					>
						<option value="">{t('common.allLocations') || 'All locations'}</option>
						{MOLDOVA_CITIES.map(city => (
							<option key={city} value={city}>{city}</option>
						))}
					</select>
				</div>
			</div>

			{loading ? (
				<div className="card" style={{ padding: 24 }}>{t('tasks.browse.loading') || 'Loading...'}</div>
			) : tasks.length === 0 ? (
				<div className="card" style={{ padding: 24 }}>{t('tasks.browse.noResults') || 'No tasks match your filters.'}</div>
			) : (
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
					{tasks.map((t) => (
						<TaskCard
							key={t.id}
							id={t.id}
							title={t.title}
							description={t.description}
							price={t.price}
							category={t.category}
							imageUrl={t.imageUrl}
						/>
					))}
				</div>
			)}
		</div>
	)
}

