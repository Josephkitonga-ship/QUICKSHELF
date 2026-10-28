import { NextResponse } from 'next/server'
import { getProductsBySlugs, getShopsBySlugs } from '@/lib/db'
export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
  const slugs = (new URL(req.url).searchParams.get('slugs') ?? '').split(',').filter(Boolean).slice(0, 50)
  const products = await getProductsBySlugs(slugs)
  const shops = await getShopsBySlugs([...new Set(products.map((p) => p.shop))])
  return NextResponse.json({ products, shops })
}
