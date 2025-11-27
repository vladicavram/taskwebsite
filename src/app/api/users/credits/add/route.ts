export async function POST(request: Request) {
	try {
		const body = await request.json().catch(() => ({}))
		const amount = body?.amount ?? null
		if (amount == null) {
			return new Response(JSON.stringify({ error: 'Missing amount' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
		}

		return new Response(JSON.stringify({ ok: true, amount }), { status: 200, headers: { 'Content-Type': 'application/json' } })
	} catch (_err) {
		return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
	}
}
