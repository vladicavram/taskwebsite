import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const body = await request.json().catch(() => ({}))
		// Minimal stub: accept a `amount` and return a success response.
		// Real implementation should validate session, update DB, and return result.
		const amount = body?.amount ?? null
		if (amount == null) {
			return NextResponse.json({ error: 'Missing amount' }, { status: 400 })
		}

		return NextResponse.json({ ok: true, amount }, { status: 200 })
	} catch (err) {
		return NextResponse.json({ error: 'Server error' }, { status: 500 })
	}
}
