'use client'
import { useEffect, useState } from 'react'
import { unitPrice, type WholesaleItem } from '@/lib/data'
import { kes } from '@/lib/format'
import { refillMessage, waLink } from '@/lib/whatsapp'
// Refill requests go to the supplier on WhatsApp. Order records come with the backend.
export function WholesaleCatalog({ items }: { items: WholesaleItem[] }) {
  const [buyer, setBuyer] = useState(''); const [qty, setQty] = useState<Record<string, number>>({})
  useEffect(() => { try { setBuyer(localStorage.getItem('qs.refillShop') ?? '') } catch {} }, [])
  const save = (v: string) => { setBuyer(v); try { localStorage.setItem('qs.refillShop', v) } catch {} }
  return (
    <>
      <p className="mu" style={{ marginBottom: 12 }}>Sample prices.</p>
      <label className="form" style={{ marginBottom: 16 }}>Your shop name<input value={buyer} onChange={(e) => save(e.target.value)} placeholder="Your shop name" /></label>
      <div className="grid">
        {items.map((x) => {
          const q = Math.max(x.moq, qty[x.slug] ?? x.moq); const price = unitPrice(x, q)
          return (
            <article className="card" key={x.slug}>
              <h3>{x.name}</h3>
              <p className="mu">{x.supplier} · {x.town}</p>
              <p style={{ margin: '6px 0' }}><span className="tag">MOQ: {x.moq} pcs</span></p>
              <p className="price">{kes(price)} / unit</p>
              <p className="mu">Dispatch {x.dispatch}.</p>
              <ul className="mu" style={{ paddingLeft: 16, margin: '6px 0' }}>{x.breaks.map((br) => <li key={br.from}>{br.from}+ pcs: {kes(br.price)}</li>)}</ul>
              <label className="form" style={{ margin: '8px 0' }}>Quantity (pcs)<input type="number" min={x.moq} value={q} onChange={(e) => setQty({ ...qty, [x.slug]: Math.max(x.moq, Number(e.target.value) || x.moq) })} /></label>
              <p className="row2" style={{ marginBottom: 8 }}><b>Total</b><b>{kes(price * q)}</b></p>
              {buyer.trim()
                ? <a className="btn block" target="_blank" rel="noopener noreferrer" href={waLink(x.whatsapp, refillMessage(x.supplier, buyer.trim(), x.name, q, price))}>Request refill</a>
                : <button className="btn block" disabled>Enter your shop name</button>}
            </article>)
        })}
      </div>
    </>
  )
}
