import { NextResponse } from 'next/server'
import { hasBackend, sb } from '@/lib/db'
export const dynamic = 'force-dynamic'
const PLANS: Record<string, string> = { Starter: 'starter', Growth: 'growth', 'Top tier': 'top' }
export async function POST(req: Request) {
  if (!hasBackend) return NextResponse.json({ error: 'backend_not_configured' }, { status: 501 })
  const b = await req.json().catch(() => null)
  if (!b) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const { error } = await sb().from('applications').insert({ shop_name: b.shop, owner_name: b.name, phone: b.phone, town: b.town, sells: b.sells, plan_id: PLANS[b.plan] ?? 'starter' })
  return error ? NextResponse.json({ error: 'invalid' }, { status: 400 }) : NextResponse.json({ ok: true })
}
