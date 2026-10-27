'use client'
import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/components/Providers'
import { groupCart } from '@/lib/cart'
import { kes } from '@/lib/format'
import type { Order } from '@/lib/whatsapp'
type Pick = { type: 'pickup' | 'delivery'; area: string }
export default function Checkout() {
  const { cart, clear } = useStore(); const router = useRouter(); const groups = groupCart(cart)
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [err, setErr] = useState('')
  const [pick, setPick] = useState<Record<string, Pick>>({})
  const get = (slug: string, pickup: boolean, first: string): Pick => pick[slug] ?? { type: pickup ? 'pickup' : 'delivery', area: first }
  const feeOf = (slug: string, areas: { name: string; fee: number }[], pickup: boolean) => { const c = get(slug, pickup, areas[0]?.name ?? ''); return c.type === 'pickup' ? 0 : areas.find((a) => a.name === c.area)?.fee ?? 0 }
  if (!groups.length) return <><h1>Checkout</h1><p style={{ margin: '12px 0' }}>Your cart is empty.</p><Link className="btn" href="/products">Browse products</Link></>
  const total = groups.reduce((a, g) => a + g.subtotal + feeOf(g.shop.slug, g.shop.areas, g.shop.pickup), 0)
  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setErr('Please enter your name.')
    if (!/^(\+?254|0)\d{9}$/.test(phone.replace(/\s/g, ''))) return setErr('Please enter a valid Kenyan phone number.')
    // Placeholder: the backend will create these orders and hold the stock.
    const cartRef = 'C' + Date.now().toString(36).toUpperCase()
    const orders: Order[] = groups.map((g, i) => {
      const c = get(g.shop.slug, g.shop.pickup, g.shop.areas[0]?.name ?? ''); const fee = feeOf(g.shop.slug, g.shop.areas, g.shop.pickup)
      return { ref: `QS-${cartRef.slice(-4)}-${i + 1}`, cart: cartRef, shop: g.shop.slug, shopName: g.shop.name, whatsapp: g.shop.whatsapp, name: name.trim(), lines: g.lines.map(({ p, qty }) => ({ name: p.name, qty, price: p.price })), delivery: { type: c.type, area: c.type === 'delivery' ? c.area : undefined, fee }, total: g.subtotal + fee }
    })
    const old = JSON.parse(localStorage.getItem('qs.orders') ?? '[]'); localStorage.setItem('qs.orders', JSON.stringify([...old, ...orders]))
    clear(); router.push(`/o/${cartRef}`)
  }
  return (
    <form className="form" onSubmit={submit} style={{ maxWidth: 640 }} noValidate>
      <h1>Checkout</h1>
      <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
      <label>Phone number<input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" /></label>
      {groups.map((g) => { const c = get(g.shop.slug, g.shop.pickup, g.shop.areas[0]?.name ?? ''); const can = g.shop.areas.length > 0; return (
        <fieldset key={g.shop.slug} className="panel"><legend><b>{g.shop.name}</b></legend>
          {g.shop.pickup && <label style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}><input type="radio" name={`t-${g.shop.slug}`} checked={c.type === 'pickup'} onChange={() => setPick({ ...pick, [g.shop.slug]: { ...c, type: 'pickup' } })} /> Pickup, free</label>}
          {can && <label style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}><input type="radio" name={`t-${g.shop.slug}`} checked={c.type === 'delivery'} onChange={() => setPick({ ...pick, [g.shop.slug]: { ...c, type: 'delivery' } })} /> Delivery</label>}
          {!can && <p className="mu">This shop offers pickup only.</p>}
          {can && c.type === 'delivery' && <label>Delivery area<select value={c.area} onChange={(e) => setPick({ ...pick, [g.shop.slug]: { ...c, area: e.target.value } })}>{g.shop.areas.map((a) => <option key={a.name} value={a.name}>{a.name} · {kes(a.fee)}</option>)}</select></label>}
          <p className="row2" style={{ marginTop: 8 }}><span>Subtotal + delivery</span><b>{kes(g.subtotal + feeOf(g.shop.slug, g.shop.areas, g.shop.pickup))}</b></p>
        </fieldset>) })}
      <p className="row2 total"><span>Total</span><span>{kes(total)}</span></p>
      {err && <p role="alert" style={{ color: '#8A1C14' }}>{err}</p>}
      <button className="btn" type="submit">Place order ({groups.length} {groups.length === 1 ? 'shop' : 'shops'})</button>
      <p className="mu">You agree payment and delivery with each shop on WhatsApp.</p>
    </form>
  )
}
