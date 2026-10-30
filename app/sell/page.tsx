import type { Metadata } from 'next'
import Link from 'next/link'
import { plans } from '@/lib/data'
import { kes } from '@/lib/format'
export const metadata: Metadata = { title: 'Sell on QuickShelf' }
export default function Sell() {
  return (
    <>
      <h1>Sell to shoppers across Kenya</h1>
      <p style={{ margin: '8px 0 16px', maxWidth: 560 }}>Sell retail on QuickShelf. Move up a plan to restock from other vendors, or to supply them.</p>
      <Link className="btn" href="/apply">Apply as a vendor</Link>
      <div className="sec"><h2>How it works</h2></div>
      <div className="steps">{[['Apply and get approved', 'We review every vendor before going live.'], ['Add your products once', 'Photos, prices and stock in one list.'], ['Order on WhatsApp', 'Shoppers chat with you. You mark orders as paid.']].map(([t, d], i) => <div className="panel" key={t}><span className="avatar">{i + 1}</span><h3 style={{ fontSize: 17, margin: '10px 0 4px' }}>{t}</h3><p className="mu">{d}</p></div>)}</div>
      <div className="sec"><h2>Plans</h2></div>
      <div className="steps plans">{plans.map((p) => <div className="panel" key={p.name}><p className="mu"><b>{p.name}</b></p><p className="price" style={{ fontSize: 28 }}>{kes(p.price)}</p><p className="mu">per month · up to {p.products} products</p><ul style={{ paddingLeft: 18 }}>{p.perks.map((x) => <li key={x}>{x}</li>)}</ul></div>)}</div>
      <p className="mu">Every vendor is approved before going live. The <Link href="/terms">terms</Link> and <Link href="/privacy">privacy policy</Link> apply to all merchants.</p>
    </>
  )
}
