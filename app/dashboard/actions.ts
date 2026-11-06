'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireShop } from '@/lib/auth'
import { plans } from '@/lib/data'
const code = (m: string) => m.split(':')[0]
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)
const num = (v: FormDataEntryValue | null) => Math.max(0, Math.round(Number(v) || 0))
const fail = (path: string, m: string): never => redirect(`${path}?e=${encodeURIComponent(code(m))}`)

const ORDER_FN: Record<string, string> = { paid: 'mark_paid', delivered: 'mark_delivered', cancel: 'cancel_order', revive: 'revive_order' }
export async function orderAction(fd: FormData) {
  const { sb } = await requireShop(); const fn = ORDER_FN[String(fd.get('act'))]; if (!fn) return
  const { error } = await sb.rpc(fn, { p_order: String(fd.get('id')) }); revalidatePath('/dashboard')
  if (error) fail('/dashboard', error.message)
}
export async function addProduct(fd: FormData) {
  const { sb, shop } = await requireShop(); if (!shop) return
  const name = String(fd.get('name') ?? '').trim(); if (name.length < 2) fail('/dashboard/products', 'invalid')
  const slug = `${shop.slug}-${slugify(name)}-${Math.random().toString(36).slice(2, 5)}`
  const { error } = await sb.from('products').insert({ shop_id: shop.id, slug, name, description: String(fd.get('description') ?? ''), price_kes: num(fd.get('price')) || 1, category: String(fd.get('category')), badge: fd.get('badge') ? String(fd.get('badge')) : null, stock_on_hand: num(fd.get('stock')) })
  revalidatePath('/dashboard/products'); if (error) fail('/dashboard/products', error.message.includes('plan_') ? error.message.replace(/^.*(plan_\w+).*$/, '$1') : 'failed')
}
export async function saveProduct(fd: FormData) {
  const { sb } = await requireShop()
  const { error } = await sb.from('products').update({ name: String(fd.get('name')).trim(), price_kes: num(fd.get('price')) || 1, stock_on_hand: num(fd.get('stock')), category: String(fd.get('category')), badge: fd.get('badge') ? String(fd.get('badge')) : null, archived: fd.get('archive') === 'yes' }).eq('id', String(fd.get('id')))
  revalidatePath('/dashboard/products'); if (error) fail('/dashboard/products', error.message.includes('check') ? 'stock' : 'failed')
}
export async function addArea(fd: FormData) {
  const { sb, shop } = await requireShop(); if (!shop) return
  const { error } = await sb.from('delivery_areas').insert({ shop_id: shop.id, name: String(fd.get('name')).trim(), fee_kes: num(fd.get('fee')) })
  revalidatePath('/dashboard/delivery'); if (error) fail('/dashboard/delivery', 'failed')
}
export async function removeArea(fd: FormData) { const { sb } = await requireShop(); await sb.from('delivery_areas').delete().eq('id', String(fd.get('id'))); revalidatePath('/dashboard/delivery') }
export async function setPickup(fd: FormData) { const { sb, shop } = await requireShop(); if (!shop) return; await sb.from('shops').update({ pickup: fd.get('pickup') === 'on' }).eq('id', shop.id); revalidatePath('/dashboard/delivery') }
export async function submitPayment(fd: FormData) {
  const { sb, shop } = await requireShop(); if (!shop) return
  const plan = plans.find((p) => p.id === String(fd.get('plan'))); const mpesa = String(fd.get('code') ?? '').trim().toUpperCase()
  if (!plan || mpesa.length < 6) fail('/dashboard/plan', 'invalid')
  const { error } = await sb.from('subscription_payments').insert({ shop_id: shop.id, plan_id: plan!.id, amount_kes: plan!.price, mpesa_code: mpesa })
  revalidatePath('/dashboard/plan'); if (error) fail('/dashboard/plan', error.message.includes('duplicate') ? 'duplicate' : 'failed')
}
export async function addAd(fd: FormData) {
  const { sb, shop } = await requireShop(); if (!shop) return
  const start = new Date(String(fd.get('start'))); const weeks = num(fd.get('weeks')) || 1
  if (isNaN(start.getTime()) || String(fd.get('headline')).trim().length < 3) fail('/dashboard/promote', 'invalid')
  const { error } = await sb.from('ads').insert({ shop_id: shop.id, placement: String(fd.get('placement')), headline: String(fd.get('headline')).trim(), line: String(fd.get('line') ?? '').trim(), starts_at: start.toISOString(), ends_at: new Date(start.getTime() + weeks * 7 * 86400000).toISOString(), payment_code: String(fd.get('code') ?? '').trim().toUpperCase() || null, status: 'pending' })
  revalidatePath('/dashboard/promote'); if (error) fail('/dashboard/promote', 'failed')
}
