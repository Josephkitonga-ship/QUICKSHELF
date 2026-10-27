'use client'
import { FormEvent, useState } from 'react'
import { plans } from '@/lib/data'
import { kes } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
// Temporary: sends the application to QuickShelf on WhatsApp until the backend takes applications.
export default function Apply() {
  const [f, setF] = useState({ shop: '', name: '', phone: '', town: '', sells: '', plan: 'Growth' })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  function submit(e: FormEvent) {
    e.preventDefault()
    const text = `QuickShelf application\nShop: ${f.shop}\nOwner: ${f.name}\nPhone: ${f.phone}\nTown: ${f.town}\nSells: ${f.sells}\nPlan: ${f.plan}`
    window.location.href = waLink(process.env.NEXT_PUBLIC_QUICKSHELF_WHATSAPP ?? '', text)
  }
  return (
    <form className="form" onSubmit={submit}>
      <h1>Apply to open your shop</h1>
      <p className="mu">We review every application before your shop goes live.</p>
      <label>Shop name<input required value={f.shop} onChange={set('shop')} /></label>
      <label>Your name<input required value={f.name} onChange={set('name')} /></label>
      <label>Phone number<input required value={f.phone} onChange={set('phone')} inputMode="tel" /></label>
      <label>Town or area<input required value={f.town} onChange={set('town')} /></label>
      <label>What do you sell?<textarea required value={f.sells} onChange={set('sells')} /></label>
      <label>Plan<select value={f.plan} onChange={set('plan')}>{plans.map((p) => <option key={p.name} value={p.name}>{p.name} · up to {p.products} products · {kes(p.price)} per month</option>)}</select></label>
      <button className="btn" type="submit">Send application</button>
    </form>
  )
}
