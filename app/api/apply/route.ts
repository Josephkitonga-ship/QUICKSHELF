import { NextResponse } from 'next/server'
import { hasBackend, sb } from '@/lib/db'
export const dynamic = 'force-dynamic'
const PLANS: Record<string, string> = { Starter: 'starter', Growth: 'growth', 'Top tier': 'top' }
// Body: { kind: 'retail' | 'wholesale', shop, name, phone, county, subCounty, categories[], plan, capacity?, corridors?, moq?, registration? }
export async function POST(req: Request) {
  if (!hasBackend) return NextResponse.json({ error: 'backend_not_configured' }, { status: 501 })
  const b = await req.json().catch(() => null)
  if (!b) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const wh = b.kind === 'wholesale'
  const { error } = await sb().from('applications').insert({
    kind: wh ? 'wholesale' : 'retail', shop_name: b.shop, owner_name: b.name, phone: b.phone,
    town: `${b.subCounty}, ${b.county}`, county: b.county, sub_county: b.subCounty,
    sells: Array.isArray(b.categories) ? b.categories.join(', ') : '', plan_id: wh ? 'top' : PLANS[b.plan] ?? 'starter',
    supply_capacity: wh ? b.capacity : null, corridors: wh ? b.corridors : null, moq_rules: wh ? b.moq : null, registration_no: wh ? b.registration : null,
  })
  return error ? NextResponse.json({ error: 'invalid' }, { status: 400 }) : NextResponse.json({ ok: true })
}
