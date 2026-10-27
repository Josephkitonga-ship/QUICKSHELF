'use client'
import Link from 'next/link'
import { useStore } from '@/components/Providers'
import { groupCart } from '@/lib/cart'
import { kes } from '@/lib/format'
export default function Cart() {
  const { cart, setQty, remove } = useStore(); const groups = groupCart(cart)
  if (!groups.length) return <><h1>Your cart</h1><p style={{ margin: '12px 0' }}>Your cart is empty.</p><Link className="btn" href="/products">Browse products</Link></>
  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Your cart</h1>
      {groups.map((g) => (
        <section className="panel" key={g.shop.slug} style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 18 }}>{g.shop.name}</h2>
          <ul className="list">{g.lines.map(({ p, qty }) => (
            <li key={p.slug} className="row2" style={{ alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <span><b>{p.name}</b><br /><span className="mu">{kes(p.price)}</span></span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label className="sr" htmlFor={`q-${p.slug}`}>Quantity for {p.name}</label>
                <input id={`q-${p.slug}`} type="number" min={1} max={p.stock} value={qty} style={{ width: 72 }} onChange={(e) => setQty(p.slug, Math.min(p.stock, Number(e.target.value) || 1))} />
                <button className="btn out" onClick={() => remove(p.slug)}>Remove</button>
              </span>
            </li>))}
          </ul>
          <p className="row2" style={{ marginTop: 10 }}><b>Subtotal</b><b>{kes(g.subtotal)}</b></p>
        </section>))}
      <p className="mu" style={{ margin: '8px 0 12px' }}>One checkout. You will chat with each shop separately.</p>
      <Link className="btn block" href="/checkout">Checkout · {kes(groups.reduce((a, g) => a + g.subtotal, 0))}</Link>
    </div>
  )
}
