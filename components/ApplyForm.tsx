'use client'
import { FormEvent, useState } from 'react'
import { categories, plans } from '@/lib/data'
import { kes } from '@/lib/format'
import { waLink } from '@/lib/whatsapp'
import { LocationPicker, locText, type Loc } from './LocationPicker'
type State = 'idle' | 'busy' | 'done' | 'error' | 'invalid'
// One form for both routes. Retail Vendor and Wholesale Merchant ask for different details.
export function ApplyForm({ kind }: { kind: 'retail' | 'wholesale' }) {
  const wh = kind === 'wholesale'
  const [f, setF] = useState({ shop: '', name: '', phone: '', capacity: '', corridors: '', moq: '', registration: '', plan: 'Starter' })
  const [loc, setLoc] = useState<Loc>({ county: '', area: '', custom: '' }); const [cats, setCats] = useState<string[]>([]); const [state, setState] = useState<State>('idle')
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const toggle = (c: string) => setCats((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]))
  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!loc.county || !locText(loc) || !cats.length) return setState('invalid')
    setState('busy')
    const body = { kind, ...f, county: loc.county, subCounty: locText(loc), categories: cats, plan: wh ? 'Top tier' : f.plan }
    const res = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null)
    if (res?.ok) return setState('done')
    if (res?.status === 501) { // No backend yet: send the application to QuickShelf on WhatsApp instead.
      const lines = [`QuickShelf application (${wh ? 'Wholesale Merchant' : 'Retail Vendor'})`, `Name: ${f.shop}`, `Owner: ${f.name}`, `Phone: ${f.phone}`, `Location: ${locText(loc)}, ${loc.county}`, `Categories: ${cats.join(', ')}`, `Plan: ${body.plan}`, ...(wh ? [`Capacity: ${f.capacity}`, `Corridors: ${f.corridors}`, `MOQ rules: ${f.moq}`, `Registration or ID: ${f.registration}`] : [])]
      window.location.href = waLink(process.env.NEXT_PUBLIC_QUICKSHELF_WHATSAPP ?? '', lines.join('\n')); return
    }
    setState('error')
  }
  if (state === 'done') return <><h1>Application received</h1><p style={{ marginTop: 12 }}>Thank you. We review every application and will contact you on {f.phone}.</p></>
  return (
    <form className="form" onSubmit={submit}>
      <h1>{wh ? 'Apply as a Wholesale Merchant' : 'Apply as a Retail Vendor'}</h1>
      <p className="mu">We review every application before it goes live.</p>
      <label>{wh ? 'Business name' : 'Shop name'}<input required value={f.shop} onChange={set('shop')} /></label>
      <label>Your name<input required value={f.name} onChange={set('name')} /></label>
      <label>Phone / WhatsApp<input required value={f.phone} onChange={set('phone')} inputMode="tel" placeholder="07XX XXX XXX" /></label>
      <LocationPicker value={loc} onChange={setLoc} />
      <fieldset className="panel"><legend><b>{wh ? 'What you supply' : 'Catalog categories'}</b></legend>
        <div className="filters" style={{ marginBottom: 0 }}>{categories.map((c) => <button type="button" key={c} className="chip" aria-pressed={cats.includes(c)} onClick={() => toggle(c)} style={cats.includes(c) ? { background: 'var(--tint2)' } : undefined}>{c}</button>)}</div>
      </fieldset>
      {wh ? (
        <>
          <label>Supply capacity<input required value={f.capacity} onChange={set('capacity')} placeholder="e.g. 500 cartons a week" /></label>
          <label>Distribution corridors<input required value={f.corridors} onChange={set('corridors')} placeholder="e.g. Kimana to Nairobi" /></label>
          <label>MOQ rules<input required value={f.moq} onChange={set('moq')} placeholder="e.g. 12 pieces per item" /></label>
          <label>Business registration or ID number<input required value={f.registration} onChange={set('registration')} /></label>
          <p className="mu">Price sheets are added after you are approved. Plan: Top tier, {kes(plans[2].price)} per month.</p>
        </>
      ) : (
        <label>Plan<select value={f.plan} onChange={set('plan')}>{plans.slice(0, 2).map((p) => <option key={p.name} value={p.name}>{p.name} · up to {p.products} products · {kes(p.price)} per month</option>)}</select></label>
      )}
      {state === 'invalid' && <p role="alert" style={{ color: '#8A1C14' }}>Choose a county and area, and at least one category.</p>}
      {state === 'error' && <p role="alert" style={{ color: '#8A1C14' }}>We could not send your application. Please check the details and try again.</p>}
      <button className="btn" type="submit" disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Send application'}</button>
    </form>
  )
}
