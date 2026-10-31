import type { Metadata } from 'next'
import Link from 'next/link'
import { plans } from '@/lib/data'
import { kes } from '@/lib/format'
export const metadata: Metadata = { title: 'Sell on QuickShelf' }
const ROUTES = [
  { href: '/sell/retail', title: 'Retail Vendor', text: 'Sell to shoppers from your shop.', cta: 'Apply as a Retail Vendor', note: 'Starter or Growth' },
  { href: '/sell/wholesale', title: 'Wholesale Merchant', text: 'Supply other vendors in bulk.', cta: 'Apply as a Wholesale Merchant', note: 'Top tier' },
]
export default function Sell() {
  return (
    <>
      <h1>Sell on QuickShelf</h1>
      <p style={{ margin: '8px 0 16px', maxWidth: 560 }}>Choose how you want to sell.</p>
      <div className="steps">{ROUTES.map((r) => <div className="panel" key={r.href}><h2 style={{ fontSize: 20 }}>{r.title}</h2><p className="mu" style={{ margin: '4px 0 12px' }}>{r.text} {r.note}.</p><Link className="btn" href={r.href}>{r.cta}</Link></div>)}</div>
      <p className="mu" style={{ margin: '4px 0 16px' }}>Already a vendor? Login is coming soon.</p>
      <div className="sec"><h2>How it works</h2></div>
      <div className="steps">{[['Apply and get approved', 'We review every vendor before going live.'], ['Add your products', 'Photos, prices and stock in one list.'], ['Order on WhatsApp', 'Buyers chat with you. You mark orders as paid.']].map(([t, d], i) => <div className="panel" key={t}><span className="avatar">{i + 1}</span><h3 style={{ fontSize: 17, margin: '10px 0 4px' }}>{t}</h3><p className="mu">{d}</p></div>)}</div>
      <div className="sec"><h2>Plans</h2></div>
      <div className="steps plans">{plans.map((p) => <div className="panel" key={p.name}><p className="mu"><b>{p.name}</b></p><p className="price" style={{ fontSize: 28 }}>{kes(p.price)}</p><p className="mu">per month · up to {p.products} products</p><ul style={{ paddingLeft: 18 }}>{p.perks.map((x) => <li key={x}>{x}</li>)}</ul></div>)}</div>
      <p className="mu">Every vendor is approved before going live. The <Link href="/terms">terms</Link> and <Link href="/privacy">privacy policy</Link> apply to all vendors.</p>
    </>
  )
}
