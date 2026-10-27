import type { Metadata } from 'next'
import Link from 'next/link'
import { products, shops } from '@/lib/data'
export const metadata: Metadata = { title: 'Shops' }
export default function Shops() {
  return (
    <>
      <h1>Shops</h1>
      <ul className="list two" style={{ marginTop: 16 }}>{shops.map((s) => <li key={s.slug}><Link className="shop" href={`/shop/${s.slug}`}><span className="avatar">{s.name[0]}</span><span><b>{s.name}</b><br /><span className="mu">{s.town} · {s.category} · {products.filter((p) => p.shop === s.slug).length} products</span></span></Link></li>)}</ul>
    </>
  )
}
