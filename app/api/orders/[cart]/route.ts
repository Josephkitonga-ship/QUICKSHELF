import { NextResponse } from 'next/server'
import { hasBackend, sb } from '@/lib/db'
export const dynamic = 'force-dynamic'
export async function GET(_: Request, { params }: { params: { cart: string } }) {
  if (!hasBackend) return NextResponse.json({ error: 'backend_not_configured' }, { status: 501 })
  const { data, error } = await sb().rpc('get_cart_orders', { p_cart: params.cart })
  if (error) return NextResponse.json({ error: 'failed' }, { status: 500 })
  return Array.isArray(data) && data.length ? NextResponse.json(data) : NextResponse.json({ error: 'not_found' }, { status: 404 })
}
