// Data access. Uses Supabase when NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set,
// otherwise the sample data in lib/data.ts. Server-side only (pages and route handlers).
import { createClient } from '@supabase/supabase-js'
import * as sample from './data'
import type { Product, Shop } from './data'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const hasBackend = Boolean(url && key)
export const sb = () => createClient(url!, key!, { auth: { persistSession: false }, global: { fetch: (u, i) => fetch(u, { ...i, cache: 'no-store' }) } })

export type ShopCard = Shop & { count: number }
export type Ad = { id: string; shop: string; headline: string; line: string }
type PRow = { slug: string; name: string; description: string; price_kes: number; category: string; badge: 'New' | 'Offer' | null; stock_on_hand: number; reserved: number; shops: { slug: string; name: string; town: string; whatsapp: string } }
const PSEL = 'slug,name,description,price_kes,category,badge,stock_on_hand,reserved,shops!inner(slug,name,town,whatsapp)'
const toProduct = (r: PRow): Product => ({ slug: r.slug, name: r.name, description: r.description, price: r.price_kes, category: r.category, badge: r.badge ?? undefined, stock: Math.max(0, r.stock_on_hand - r.reserved), shop: r.shops.slug, shopName: r.shops.name, town: r.shops.town, shopWhatsapp: r.shops.whatsapp })
type SRow = { slug: string; name: string; town: string; category: string; whatsapp: string; pickup: boolean; delivery_areas: { name: string; fee_kes: number }[]; products?: { count: number }[] }
const SSEL = 'slug,name,town,category,whatsapp,pickup,delivery_areas(name,fee_kes),products(count)'
const toShop = (r: SRow): ShopCard => ({ slug: r.slug, name: r.name, town: r.town, category: r.category, whatsapp: r.whatsapp, pickup: r.pickup, areas: r.delivery_areas.map((a) => ({ name: a.name, fee: a.fee_kes })), count: r.products?.[0]?.count ?? 0 })
const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message) }

export type ProductQuery = { q?: string; category?: string; sort?: string; deals?: boolean; shop?: string }
export async function listProducts(o: ProductQuery = {}): Promise<Product[]> {
  if (!hasBackend) {
    const q = (o.q ?? '').toLowerCase().trim()
    let l = sample.products.filter((p) => (!q || p.name.toLowerCase().includes(q) || p.shopName.toLowerCase().includes(q)) && (!o.category || p.category === o.category) && (!o.deals || p.badge === 'Offer') && (!o.shop || p.shop === o.shop))
    if (o.sort === 'low') l = [...l].sort((a, b) => a.price - b.price)
    if (o.sort === 'high') l = [...l].sort((a, b) => b.price - a.price)
    if (o.sort === 'new') l = [...l].sort((a, b) => Number(b.badge === 'New') - Number(a.badge === 'New'))
    return l
  }
  let query = sb().from('products').select(PSEL).eq('archived', false)
  if (o.category) query = query.eq('category', o.category)
  if (o.deals) query = query.eq('badge', 'Offer')
  if (o.shop) query = query.eq('shops.slug', o.shop)
  if (o.q) query = query.ilike('name', `%${o.q.replace(/[%,()]/g, ' ').trim()}%`)
  query = o.sort === 'low' ? query.order('price_kes') : o.sort === 'high' ? query.order('price_kes', { ascending: false }) : query.order('created_at', { ascending: false })
  const { data, error } = await query; fail(error)
  return (data as unknown as PRow[]).map(toProduct)
}
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (!slugs.length) return []
  if (!hasBackend) return sample.products.filter((p) => slugs.includes(p.slug))
  const { data, error } = await sb().from('products').select(PSEL).eq('archived', false).in('slug', slugs); fail(error)
  return (data as unknown as PRow[]).map(toProduct)
}
export const getProduct = async (slug: string) => (await getProductsBySlugs([slug]))[0] ?? null
export async function listShops(): Promise<ShopCard[]> {
  if (!hasBackend) return sample.shops.map((s) => ({ ...s, count: sample.products.filter((p) => p.shop === s.slug).length }))
  const { data, error } = await sb().from('shops').select(SSEL).order('name'); fail(error)
  return (data as unknown as SRow[]).map(toShop)
}
export async function getShopsBySlugs(slugs: string[]): Promise<ShopCard[]> { const all = await listShops(); return all.filter((s) => slugs.includes(s.slug)) }
export const getShop = async (slug: string) => (await getShopsBySlugs([slug]))[0] ?? null
export async function getAd(): Promise<Ad | null> {
  if (!hasBackend) return sample.ads[0] ?? null
  const now = new Date().toISOString()
  const { data, error } = await sb().from('ads').select('id,headline,line,shops!inner(slug)').eq('placement', 'banner').eq('status', 'approved').lte('starts_at', now).gte('ends_at', now).limit(1); fail(error)
  const r = (data as unknown as { id: string; headline: string; line: string; shops: { slug: string } }[])[0]
  return r ? { id: r.id, headline: r.headline, line: r.line, shop: r.shops.slug } : null
}
