import { NextResponse } from 'next/server'
import { hasBackend, sb } from '@/lib/db'
export const dynamic = 'force-dynamic'
const KNOWN = ['invalid_name', 'invalid_phone', 'empty_cart', 'out_of_stock', 'invalid_area', 'pickup_unavailable', 'invalid_qty']
// Body: { name, phone, lines: [{ slug, qty }], delivery: { [shopSlug]: { type: 'pickup' | 'delivery', area?: string } } }
// Prices, stock and delivery fees are all decided in the database (place_order), never taken from the browser.
export async function POST(req: Request) {
  if (!hasBackend) return NextResponse.json({ error: 'backend_not_configured' }, { status: 501 })
  const b = await req.json().catch(() => null)
  if (!b || !Array.isArray(b.lines)) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const { data, error } = await sb().rpc('place_order', { p_name: b.name, p_phone: b.phone, p_lines: b.lines, p_delivery: b.delivery ?? {} })
  if (error) {
    const [code, detail] = error.message.split(':')
    return NextResponse.json({ error: KNOWN.includes(code) ? code : 'failed', detail }, { status: KNOWN.includes(code) ? 409 : 500 })
  }
  return NextResponse.json(data)
}
