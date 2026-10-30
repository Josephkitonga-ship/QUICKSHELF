'use client'
import { FormEvent, useState } from 'react'
import { plans } from '@/lib/data'
import { kes } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
export default function Apply() {
  const [f, setF] = useState({ shop: '', name: '', phone: '', town: '', sells: '', plan: 'Growth' })
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  async function submit(e: FormEvent) {
    e.preventDefault(); setState('busy')
    const res = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) }).catch(() => null)
    if (res?.ok) return setState('done')
    if (res?.status === 501) { // No backend yet: send the application to QuickShelf on WhatsApp instead.
      const text = `QuickShelf application\nVendor: ${f.shop}\nOwner: ${f.name}\nPhone: ${f.phone}\nTown: ${f.town}\nSells: ${f.sells}\nPlan: ${f.plan}`
      window.location.href = waLink(process.env.NEXT_PUBLIC_QUICKSHELF_WHATSAPP ?? '', text); return
    }
    setState('error')
  }
  if (state === 'done') return <><h1>Application received</h1><p style={{ marginTop: 12 }}>Thank you. We review every application and will contact you on {f.phone}.</p></>
  return (
    <form className="form" onSubmit={submit}>
      <h1>Vendor Onboarding Portal</h1>
      <p className="mu">We review every application before you go live.</p>
      <label>Vendor name<input required value={f.shop} onChange={set('shop')} /></label>
      <label>Your name<input required value={f.name} onChange={set('name')} /></label>
      <label>Phone number<input required value={f.phone} onChange={set('phone')} inputMode="tel" /></label>
      <label>Town or area<input required value={f.town} onChange={set('town')} /></label>
      <label>What do you sell?<textarea required value={f.sells} onChange={set('sells')} /></label>
      <label>Plan<select value={f.plan} onChange={set('plan')}>{plans.map((p) => <option key={p.name} value={p.name}>{p.name} · up to {p.products} products · {kes(p.price)} per month</option>)}</select></label>
      {state === 'error' && <p role="alert" style={{ color: '#8A1C14' }}>We could not send your application. Please check the details and try again.</p>}
      <button className="btn" type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Send application'}</button>
    </form>
  )
}
